'use strict';
const { PROVINCE_EN } = require('./place-localizations.cjs');
const { createRateLimiter } = require('./security.cjs');

const OSM_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const TOURISM_TYPES = new Set(['attraction','museum','viewpoint','theme_park','zoo','aquarium','gallery','information','artwork','picnic_site']);
function normalizeName(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[\s\u200b\u200c\u200d\-_.(),]+/g, '');
}
function distanceMeters(a,b) {
  const rad = Math.PI/180, dLat=(a.lat-b.lat)*rad, dLon=(a.lng-b.lng)*rad;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
  return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
}
function validateSearch(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.province !== 'string' || !Object.hasOwn(PROVINCE_EN,body.province) ||
      !Array.isArray(body.sources) || body.sources.length !== 1 || body.sources[0] !== 'osm' ||
      !Number.isInteger(body.limit) || body.limit < 1 || body.limit > 100) return null;
  return {province:body.province,limit:body.limit};
}
function overpassQuery(province,limit) {
  // Escape the province even though it comes from a fixed allowlist.
  const name=JSON.stringify(province);
  return `[out:json][timeout:20];
area["ISO3166-1"="TH"]["admin_level"="2"]->.country;
rel(area.country)["boundary"="administrative"]["admin_level"="4"]["name:th"=${name}]->.province;
.province map_to_area -> .searchArea;
(
  nwr(area.searchArea)["tourism"~"^(attraction|museum|viewpoint|theme_park|zoo|aquarium|gallery|information|artwork|picnic_site)$"]["name"];
);
out center ${limit};`;
}
function toCandidates(elements,province,existing,limit) {
  const candidates=[],seen=new Set();
  for (const item of elements) {
    if (!['node','way','relation'].includes(item?.type) || !Number.isSafeInteger(item?.id) || !TOURISM_TYPES.has(item?.tags?.tourism)) continue;
    const name=item.tags?.['name:th']||item.tags?.name;
    const lat=Number(item.lat??item.center?.lat),lng=Number(item.lon??item.center?.lon);
    if(typeof name!=='string'||!name.trim()||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<5||lat>21||lng<97||lng>106)continue;
    const sourceId=`osm:${item.type}/${item.id}`;
    if(seen.has(sourceId))continue;
    seen.add(sourceId);
    const match=existing.find(row=>{
      const a=normalizeName(name),b=normalizeName(row.name),c=normalizeName(row.name_local);
      const close=distanceMeters({lat,lng},{lat:Number(row.lat),lng:Number(row.lng)});
      return (a&&(a===b||a===c)) || (Number.isFinite(close)&&close<=75);
    });
    const possible=existing.some(row=>distanceMeters({lat,lng},{lat:Number(row.lat),lng:Number(row.lng)})<=500);
    const holds=[];
    if(match)holds.push('POSSIBLE_DUPLICATE');
    else if(possible)holds.push('NEARBY_PLACE_REVIEW');
    candidates.push({source:'osm',sourceId,name,nameLocal:item.tags['name:th']||null,province,lat,lng,
      license:'ODbL 1.0',attribution:'© OpenStreetMap contributors',
      evidence:{url:`https://www.openstreetmap.org/${item.type}/${item.id}`,source:'OpenStreetMap'},
      duplicateStatus:match?'possible_duplicate':possible?'review_nearby':'not_detected',holds});
    if(candidates.length>=limit)break;
  }
  return candidates;
}
async function discover({province,limit,getSql,fetchImpl=fetch,endpoint=OSM_ENDPOINT}) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),25000);
  try {
    const response=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Accept':'application/json','User-Agent':'PaiNaiDee/1.0 (admin initiated OSM discovery)'},body:new URLSearchParams({data:overpassQuery(province,limit)}),signal:controller.signal});
    if(!response.ok)throw new Error('Overpass returned HTTP '+response.status);
    if(Number(response.headers?.get?.('content-length')||0)>2000000)throw new Error('Overpass response too large');
    const raw=await response.text();
    if(raw.length>2000000)throw new Error('Overpass response too large');
    const payload=JSON.parse(raw);
    if(!Array.isArray(payload.elements))throw new Error('Invalid Overpass response');
    const existing=await getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>
      tx`SELECT id,name,name_local,lat,lng FROM places WHERE province=${province}`);
    return {province,sources:[{source:'osm',status:'ok'}],candidates:toCandidates(payload.elements,province,existing,limit),automaticImport:false,publicationAllowed:false};
  } finally {clearTimeout(timeout);}
}
function registerPlaceDiscovery(app,{getSql,requireAdmin,fetchImpl=fetch}) {
  app.post('/api/admin/place-discovery/search',requireAdmin,
    createRateLimiter({windowMs:60000,max:3,keyPrefix:'osm-manual-discovery'}),
    async(req,res)=>{
      const input=validateSearch(req.body);
      if(!input)return res.status(400).json({error:'Invalid province, source or limit.'});
      try {return res.json(await discover({...input,getSql,fetchImpl}));}
      catch(error){console.error('OSM discovery failed:',error?.message);
        return res.status(503).json({error:'OSM discovery unavailable. Please retry later.',sources:[{source:'osm',status:'unavailable'}]});}
    });
}
module.exports={registerPlaceDiscovery,discover,validateSearch,overpassQuery,toCandidates,normalizeName};
