#!/usr/bin/env node
// Public read-only Railway API audit. Never loads credentials or mutates database.
const {strict:assert}=require('node:assert');
const BASE='https://painaidee-api-production.up.railway.app/api/places';
const required=[
'tat-201005182246291174','tat-2015120421550717997','tat-20100518224629120',
'tat-201005182246293101','tat-201005182246293148','tat-201005182246293316',
'tat-2010120911214112695','tat-2010120911214112696',
'tat-201005182246293423','tat-2010120911214112694','tat-2015120421550718123',
'tat-2015120421550718003','tat-201005182246293252','tat-2010120911214113306',
'tat-2015120421550718063','tat-2011032413454815424',
 'tat-2010120911214113283','tat-2010120911214113286',
 'tat-2010120911214112692','tat-2015120421550718083',
 'tat-2015120421550718078','tat-20100518224629483',
 'tat-2015120421550718080','tat-201005182246293395',
 'tat-2015120421550718297','tat-2015120421550717971',
 'tat-2012080610583316342','tat-20100518224629568',
 'tat-201005182246293332',
 'tat-201005182246293051','tat-201005182246293199','tat-2015120421550718116',
 'tat-201005182246293428','tat-2015120421550718119','tat-201005182246293336',
];
async function get(url){
 const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'},cache:'no-store'});
 if(!r.ok)throw Error('HTTP '+r.status+' from '+url);
 const v=await r.json(); if(!v||!Array.isArray(v.attractions)||!Number.isFinite(Number(v.total)))throw Error('Unexpected API shape');
 return v;
}
async function main(){
 const items=[],expectedMin=193,pageSize=50;
 let total=null;
 for(let page=1;page<=20;page++){
   const data=await get(BASE+'?page='+page+'&limit='+pageSize);
   total=Number(data.total);
   items.push(...data.attractions);
   if(items.length>=total)break;
 }
 assert.equal(items.length,total,'pagination mismatch');
 assert.ok(total>=expectedMin,'Expected at least 193 published places; got '+total);
 assert.equal(new Set(items.map(x=>x.id)).size,items.length,'duplicate location IDs');
 const chon=items.filter(x=>x.province==='ชลบุรี');
 assert.ok(chon.length>=70,'Expected >=70 published Chon Buri; got '+chon.length);
 const ids=new Set(chon.map(x=>x.id));
 for(const id of required)assert.ok(ids.has(id),'Missing Chon Buri batch 007/008 place '+id);
 const beach=chon.find(x=>x.id==='tat-2015120421550718119');
 assert.ok(beach,'Missing corrected Thian Talay Beach');
 assert.ok(Math.abs(beach.coordinates?.lat-12.643518498083282)<0.000001,'Thian Talay live pin latitude incorrect');
 assert.ok(Math.abs(beach.coordinates?.lng-100.92836536539475)<0.000001,'Thian Talay live pin longitude incorrect');
 console.log('CHONBURI_LIVE_AUDIT '+JSON.stringify({
   status:'success',total,chonburi:chon.length,uniqueIds:items.length,reviewedIdsChecked:required.length,
   provinceCoverage:new Set(items.map(x=>x.province)).size,
 }));
}
main().catch(e=>{console.error('CHONBURI_LIVE_AUDIT_FAILURE '+e.message);process.exitCode=1;});
