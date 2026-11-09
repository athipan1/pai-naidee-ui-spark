'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {publicationGateDecision}=require('./place-review-workflow.cjs');

const review={state:'APPROVED',evidence:{source:{namespace:'test',id:'fixture'}}};
const clean={payloadMatches:true,holds:[]};

test('admin direct publish requires explicit approval and valid evidence',()=>{
  assert.deepEqual(publicationGateDecision(review),{ok:true},'Preflight must not require a report before evaluation');
  assert.deepEqual(publicationGateDecision(review,clean),{ok:true});
  assert.equal(publicationGateDecision({...review,state:'VERIFIED'},clean).ok,false);
  assert.equal(publicationGateDecision({...review,state:'REVIEW_PENDING'},clean).ok,false);
});

test('admin direct publish rejects missing evidence and rejected drafts',()=>{
  for(const invalid of [null,{...review,evidence:null},{...review,state:'REJECTED'},{...review,state:'PUBLISHED'}]){
    const result=publicationGateDecision(invalid,clean);
    assert.equal(result.ok,false);
    assert.deepEqual(result.holds,['review_evidence_required']);
  }
});

test('admin direct publish rejects stale payload and every quality hold',()=>{
  assert.deepEqual(publicationGateDecision(review,{payloadMatches:false,holds:[]}).holds,['draft_changed_since_review']);
  for(const hold of ['unresolved_duplicate','duplicate_image','license_hold','coordinate_hold','province_polygon_unverified','media_probe_failed']){
    const result=publicationGateDecision(review,{payloadMatches:true,holds:[hold]});
    assert.equal(result.ok,false,hold);
    assert.deepEqual(result.holds,[hold]);
  }
  assert.equal(publicationGateDecision(review,{payloadMatches:false,holds:[]}).ok,false);
});
