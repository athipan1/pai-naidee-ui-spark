#!/usr/bin/env node
'use strict';
// Read-only, bounded production evidence probe: two independently published
// real source records + every page of the existing live Railway catalogue.
// It never inserts, approves, or publishes. No credential or Google usage.
const { adaptWikidata, adaptOsm, stage } = require('./tourism-source-adapters.cjs');
const BASE = 'https://painaidee-api-production.up.railway.app';
const Q = 'Q3576017';
const WAY = 132599367;
async function getJson(url) {
  const res = await fetch(url,{headers:{Accept:'application/json','User-Agent':'PaiNaiDee-Source-Audit/1.0 (read-only public verification)'},
    signal:AbortSignal.timeout(25000)});
  if(!res.ok)throw Error('Public source request HTTP '+res.status+' at '+new URL(url).hostname);
  const text=await res.text();
  if(text.length>4000000)throw Error('Source exceeds 4 MB bound');
  return JSON.parse(text);
}
async function main(){
  const wd=await getJson('https://www.wikidata.org/wiki/Special:EntityData/'+Q+'.json');
  const entity=wd.entities?.[Q];
  if(!entity)throw Error('Wikidata entity missing');
  const point=entity.claims?.P625?.find(c=>c.mainsnak?.datavalue?.value?.latitude!=null)
    ?.mainsnak?.datavalue?.value;
  if(!point)throw Error('Wikidata coordinate missing');
  const wdRow={item:{value:'https://www.wikidata.org/entity/'+Q},
    nameTh:{value:entity.labels?.th?.value||''},nameEn:{value:entity.labels?.en?.value||''},
    coord:{value:'Point('+point.longitude+' '+point.latitude+')'}};
  const osm=await getJson('https://api.openstreetmap.org/api/0.6/way/'+WAY+'/full.json');
  const elements=osm.elements||[];
  const way=elements.find(p=>p.type==='way'&&p.id===WAY);
  if(!way)throw Error('OSM way missing');
  const linkedWayIds=(entity.claims?.P402||[]).map(p=>String(p.mainsnak?.datavalue?.value||''));
  if(!linkedWayIds.includes(String(WAY)) && way.tags?.wikidata!==Q)
    throw Error('Wikidata and OSM records lack an explicit cross-source identity link');
  const nodes=new Map(elements.filter(p=>p.type==='node').map(p=>[p.id,p]));
  const coords=(way.nodes||[]).map(id=>nodes.get(id)).filter(p=>Number.isFinite(p?.lat)&&Number.isFinite(p?.lon));
  if(!coords.length)throw Error('OSM way geometry missing');
  const center={lat:coords.reduce((s,p)=>s+p.lat,0)/coords.length,
    lon:coords.reduce((s,p)=>s+p.lon,0)/coords.length};
  const osmRow={type:'way',id:WAY,tags:way.tags||{},center};
  const all=[],pageSize=50;
  let total=null;
  for(let page=1;page<=40;page++){
    const data=await getJson(BASE+'/api/places?province='+encodeURIComponent('ชลบุรี')+
      '&page='+page+'&limit='+pageSize);
    if(!Array.isArray(data.attractions)||!Number.isInteger(data.total) || data.total<1 ||
      data.page!==page||data.limit!==pageSize)throw Error('Invalid catalogue page '+page);
    if(total===null)total=data.total;
    if(total!==data.total)throw Error('Production catalogue changed during pagination');
    all.push(...data.attractions);
    if(all.length>=total)break;
    if(data.attractions.length===0)throw Error('Missing catalogue page');
  }
  if(total<71)throw Error('Production Chon Buri baseline below last verified 71 places');
  if(all.some(p=>p.province!=='ชลบุรี'))throw Error('Foreign province returned by live Chon Buri API');
  if(all.length!==total || new Set(all.map(x=>x.id)).size!==total)
    throw Error('Incomplete/duplicate live Production catalogue');
  const baseline=all.map(p=>({nameLocal:p.nameLocal||p.name,lat:p.coordinates?.lat??p.lat,
    lng:p.coordinates?.lng??p.lng,sourceId:p.sourceId,wikidataId:p.wikidataId}));
  const w=stage([wdRow],adaptWikidata,baseline);
  const o=stage([osmRow],adaptOsm,baseline.concat([adaptWikidata(wdRow)]));
  const wdAdapted=adaptWikidata(wdRow), osmAdapted=adaptOsm(osmRow);
  if(wdAdapted.sourceId!==Q || osmAdapted.sourceId!=='way/'+WAY)
    throw Error('Public source provenance mismatch');
  const summary={status:'PASS',liveSources:['wikidata:'+Q,'osm:way/'+WAY],
    chonburiCatalogue:total,wikidata:{sourceId:Q,nameLocal:wdAdapted.nameLocal,
    status:w.candidates[0]?.status||w.rejected[0]?.status,issues:w.rejected[0]?.issues||[]},
    osm:{sourceId:'way/'+WAY,nameLocal:osmAdapted.nameLocal,
    status:o.candidates[0]?.status||o.rejected[0]?.status,issues:o.rejected[0]?.issues||[]},
    approved:0,notes:'Example source location can be a site centroid, not an entrance. No records published.'};
  console.log('CHONBURI_REAL_SOURCE_PROOF '+JSON.stringify(summary));
}
if(require.main===module)main().catch(e=>{console.error('CHONBURI_REAL_SOURCE_PROOF_FAIL '+e.message);process.exitCode=1;});
module.exports={main};
