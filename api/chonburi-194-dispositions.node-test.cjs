const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {SEED_PLACES}=require('./postgres-db.cjs');

test('all 194 TAT Chon Buri source rows have a documented provisional disposition',()=>{
  const raw=readFileSync(join(__dirname,'chonburi-tat-194-row-dispositions.tsv'),'utf8');
  assert.match(raw,/2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366/);
  const lines=raw.trim().split('\n').filter(line=>!line.startsWith('#'));
  const header=lines.shift().split('\t');
  const index=Object.fromEntries(header.map((name,i)=>[name,i]));
  assert.equal(lines.length,194);
  const seenIds=new Set(),published=new Set(),statuses={};
  for(const line of lines){
    const a=line.split('\t');
    assert.equal(a.length,header.length,'invalid TSV width');
    const id=a[index.tat_id],status=a[index.disposition];
    assert.match(id,/^tat-[A-Za-z0-9_-]+$/);
    assert.ok(!seenIds.has(id),'duplicate TAT source id '+id);
    seenIds.add(id);
    assert.ok(['published_seed','pending_individual_verification',
      'pending_category_location_review','missing_usable_thai_name'].includes(status));
    statuses[status]=(statuses[status]||0)+1;
    if(status==='published_seed')published.add(id);
  }
  assert.deepEqual(statuses,{
    published_seed:50,pending_category_location_review:76,
    missing_usable_thai_name:2,pending_individual_verification:66
  });
  const ids=new Set(SEED_PLACES.map(p=>p.id));
  for(const id of published){
    if(ids.has(id))continue;
    // Some source records were already published under earlier manually curated
    // IDs rather than a TAT ID. Those were matched by normalized Thai name.
    const row=lines.find(line=>line.split('\t')[index.tat_id]===id).split('\t');
    const thai=row[index.thai_name].normalize('NFKC').replace(/\s+/g,'');
    assert.ok(SEED_PLACES.some(p=>p.province==='ชลบุรี' &&
      (p.nameLocal||p.name).normalize('NFKC').replace(/\s+/g,'')===thai),
      'published TAT source must match seed ID or exact Thai name: '+id);
  }
});
