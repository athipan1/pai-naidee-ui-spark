'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {finishDirectPublication}=require('./admin-direct-publication.cjs');

test('direct publication audits the actual actor without fabricating review or replacing historical proof',async()=>{
  const calls=[];
  const tx=async(strings,...args)=>{const query=strings.join('?');calls.push({query,args});return query.startsWith('SELECT state')?[{state:'LICENSE_HOLD'}]:[];};
  tx.json=value=>value;
  await finishDirectPublication(tx,{id:'draft-1',payload:{name:'Manual place',description:'Updated text'}},'place-1','admin-2');
  const event=calls.find(c=>c.query.includes('INSERT INTO place_review_events'));
  assert.equal(event.args[2],'admin-2');assert.equal(event.args[3],'direct_publish');
  assert.equal(event.args[4],'LICENSE_HOLD');assert.equal(event.args[5],'PUBLISHED');
  assert.deepEqual(event.args[6],{publicationMode:'admin_direct',qualityReviewPerformed:false});
  assert.ok(calls.some(c=>c.query.includes('verified_at=NULL')));
  assert.ok(calls.some(c=>c.query.includes('evidence=evidence ||')),'retain historical proof with an explicit direct-publish marker');
  assert.ok(!calls.some(c=>c.query.includes("state='APPROVED'")||c.query.includes('INSERT INTO place_reviews')));
});

test('direct publication refuses to claim another place Google identity',async()=>{
  const calls=[];
  const tx=async(strings)=>{const query=strings.join('?');calls.push(query);return query.startsWith('SELECT place_id')?[{place_id:'another-place'}]:[];};
  tx.json=value=>value;
  await assert.rejects(finishDirectPublication(tx,{id:'draft-2',payload:{googlePlaceId:'ChIJfixture123'}},'new-place','admin-2'),{code:'PUBLICATION_DUPLICATE'});
  assert.ok(!calls.some(c=>c.includes('UPDATE places')||c.includes('INSERT INTO place_review_events')));
});
