#!/usr/bin/env node
'use strict';
// Read-only source sample, polygon check and dedup against the existing
// public Railway catalogue. Never use this output as an auto-import payload.
const fs=require('node:fs'),path=require('node:path');
const {polygonBoundary,review}=require('./chonburi-bulk-audit.cjs');
const RAILWAY=process.env.PAINAIDEE_API_URL||'https://painaidee-api-production.up.railway.app';
const OVERPASS=['https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];
const WDQS='https://query.wikidata.org/sparql';
const timeout=Number(process.env.SOURCE_TIMEOUT_MS||90000);
const maxResponseBytes=12*1024*1024;
const fetchJson=async (url,options={})=>{
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(timeout),
    headers:{'Accept':'application/json','User-Agent':'PaiNaiDee/1.0 (public research only; https://github.com/athipan1/pai-naidee-ui-spark)',...options.headers}});
  if(!response.ok)throw Error('HTTP '+response.status+' from '+new URL(url).hostname);
  if(Number(response.headers.get('content-length'))>maxResponseBytes)
    throw Error('External source exceeds 12MB');
  const content=await response.text();
  if(content.length>maxResponseBytes)throw Error('External source exceeds size limit');
  try{return JSON.parse(content)}catch{throw Error('Invalid JSON from '+new URL(url).hostname)}
};
const postOverpass=async query=>{
  let error;
  for(const host of OVERPASS){
    try{return await fetchJson(host,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({data:query}).toString()});}
    catch(e){error=e;console.error('Overpass read-only endpoint unavailable: '+new URL(host).hostname+' ('+e.message+')');}
  }
  throw Error('All Overpass read-only endpoints failed: '+error?.message);
};
const csvField=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
async function main(){
  const boundaryQuery='[out:json][timeout:75];rel["boundary"="administrative"]["admin_level"="4"]["ISO3166-2"="TH-20"];out geom;';
  const boundaries=await postOverpass(boundaryQuery);
  const relations=(boundaries.elements||[]).filter(x=>x.type==='relation'&&x.tags?.['ISO3166-2']==='TH-20');
  if(relations.length!==1)throw Error('Cannot uniquely identify Chon Buri polygon from OSM');
  const polygon=polygonBoundary(relations[0]);
  console.log('Boundary verified: '+polygon.id+' ('+polygon.outer.length+' outer rings)');
  const sampleSize=250;
  const areaQuery='[out:json][timeout:75];area["boundary"="administrative"]["admin_level"="4"]["ISO3166-2"="TH-20"]->.a;'+
    '(nwr(area.a)["tourism"~"^(attraction|museum|viewpoint|zoo|theme_park|gallery|aquarium)$"];'+
    'nwr(area.a)["historic"];'+
    'nwr(area.a)["natural"~"^(beach|waterfall|cave|peak)$"];);out center '+sampleSize+';';
  const osm=await postOverpass(areaQuery);
  const osmRows=(osm.elements||[]).filter(x=>x.tags&&['node','way','relation'].includes(x.type));
  if(osmRows.length===0)throw Error('OSM returned no Chon Buri features; area selector may be missing');
  if(osmRows.length>sampleSize)throw Error('OSM did not observe requested response cap');
  // Province is Q207068. Candidates are broad territorial features with
  // coordinates and Thai labels, not a vetted tourist-only census.
  const sparql=`SELECT DISTINCT ?item ?coord ?nameTh ?nameEn WHERE {
    ?item wdt:P131/wdt:P131* wd:Q207068 ; wdt:P625 ?coord ;
      rdfs:label ?nameTh .
    FILTER(LANG(?nameTh)="th")
    OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn)="en") }
  } LIMIT 200`;
  const wd=await fetchJson(WDQS+'?query='+encodeURIComponent(sparql)+'&format=json');
  const wdRows=wd.results?.bindings;
  if(!Array.isArray(wdRows))throw Error('Wikidata SPARQL binding format missing');
  if(!wdRows.length)throw Error('Wikidata returned no province rows');
  const existing=[];let total=null;
  for(let page=1;page<=40;page++){
    const url=RAILWAY.replace(/\/+$/,'')+'/api/places?province='+encodeURIComponent('ชลบุรี')+'&page='+page+'&limit=50';
    const result=await fetchJson(url);
    if(!Array.isArray(result.attractions)||!Number.isInteger(result.total)||
      result.page!==page||result.limit!==50)throw Error('Railway pagination metadata invalid at '+page);
    if(total===null)total=result.total;
    if(total!==result.total)throw Error('Railway Production count changed mid-audit');
    if(result.attractions.some(p=>p.province!=='ชลบุรี'))throw Error('Foreign province in Railway response');
    existing.push(...result.attractions);
    if(existing.length>=total)break;
    if(result.attractions.length===0)throw Error('Incomplete Railway pagination');
  }
  if(total<71||existing.length!==total||new Set(existing.map(p=>p.id)).size!==total)
    throw Error('Railway Production baseline is incomplete or has duplicate IDs');
  const audit=review({wdRows,osmRows,existing,boundary:polygon});
  const outDir=process.env.AUDIT_OUTPUT_DIR||'artifacts/chonburi-source-audit';
  fs.mkdirSync(outDir,{recursive:true});
  const meta={generatedAt:new Date().toISOString(),sourceCoverage:'bounded samples, not complete datasets',
    osmLimit:sampleSize,wikidataLimit:200,osmSource:'OpenStreetMap contributors',
    osmLicense:'ODbL 1.0',osmLicenseUrl:'https://www.openstreetmap.org/copyright',
    wikidataSource:'Wikidata contributors',wikidataLicense:'CC0 1.0',
    wikidataLicenseUrl:'https://www.wikidata.org/wiki/Wikidata:Licensing',
    distributionDecision:'HOLD until licence/attribution legal review and owner/entrance checks',
    boundaryMethod:'OSM administrative relation outer/inner member geometry, not bounding box',
    ...Object.fromEntries(Object.entries(audit).filter(([k])=>k!=='rows'))};
  fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(meta,null,2)+'\n');
  const headers=['source','sourceId','nameLocal','name','lat','lng','sourceUrl',
    'insideProvince','status','blockers','license','approved'];
  const csv=[headers.map(csvField).join(','),...audit.rows.map(p=>headers.map(k=>csvField(Array.isArray(p[k])?p[k].join('|'):p[k])).join(','))].join('\n')+'\n';
  fs.writeFileSync(path.join(outDir,'candidate-review.csv'),csv);
  console.log('CHONBURI_BULK_AUDIT '+JSON.stringify({status:audit.status,
    boundaryId:audit.boundaryId,productionCount:audit.productionCount,
    sources:audit.sources,stats:audit.stats,approved:0,
    outputs:[path.join(outDir,'summary.json'),path.join(outDir,'candidate-review.csv')]}));
}
if(require.main===module)main().catch(error=>{
 console.error('CHONBURI_BULK_AUDIT_FAIL '+error.message);process.exitCode=1;
});
module.exports={main};
