'use strict';
const {createHash}=require('node:crypto');
const {independentUrl}=require('./place-candidate-quality.cjs');
const {licenseAllowed,mediaLicenseHolds}=require('./place-media-quality.cjs');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
// PostgreSQL JSONB reorders object keys. Approval binds the values, not the
// incidental key order produced by JavaScript or the database driver.
const payloadHash=p=>createHash('sha256').update(JSON.stringify(canonical(p))).digest('hex');
const trim=(value,max=2000)=>typeof value==='string'?value.trim().slice(0,max):'';
function cleanEvidence(input) {
  const e=input||{},source=e.source||{},coordinate=e.coordinate||{},media=e.media||{};
  // Unknown Google content, source payloads, coordinates and claimed probe
  // results are rejected rather than silently persisted in JSONB.
  const allowed={root:['source','coordinate','media','googlePlaceId','district','detailSourceUrl','duplicateResolutions','openingHours','admissionFee'],
    source:['namespace','id','name','url','licenseName','licenseUrl','permissionUrl','checkedAt'],
    coordinate:['sourceUrl','licenseName','licenseUrl','permissionUrl','kind','publicAccessUrl','restricted','publicNavigationPoint','authorityUrl','checkedAt'],
    media:['url','photographer','sourcePage','licenseName','licenseUrl','permissionUrl'],resolution:['placeId','note','sourceUrl'],fact:['text','sourceUrl','checkedAt']};
  const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const keys=(v,list)=>object(v)&&Object.keys(v).every(k=>list.includes(k));
  if(!keys(e,allowed.root)||!keys(source,allowed.source)||!keys(coordinate,allowed.coordinate)||!keys(media,allowed.media)||
    (e.openingHours!==undefined&&!keys(e.openingHours,allowed.fact))||(e.admissionFee!==undefined&&!keys(e.admissionFee,allowed.fact))||
    (e.duplicateResolutions!==undefined&&(!Array.isArray(e.duplicateResolutions)||e.duplicateResolutions.length>20||e.duplicateResolutions.some(r=>!keys(r,allowed.resolution)))))
    return {error:'Evidence fields are invalid. Google content and caller-supplied coordinates/probe results are not accepted.'};
  const strings=(v,list)=>Object.fromEntries(list.map(k=>[k,trim(v[k])]));
  const value={source:strings(source,allowed.source),coordinate:{...strings(coordinate,allowed.coordinate.filter(k=>!['restricted','publicNavigationPoint'].includes(k))),
    restricted:coordinate.restricted===true,publicNavigationPoint:coordinate.publicNavigationPoint===true},media:strings(media,allowed.media),
    googlePlaceId:trim(e.googlePlaceId,255),district:trim(e.district,120),detailSourceUrl:trim(e.detailSourceUrl),
    openingHours:strings(e.openingHours||{},allowed.fact),admissionFee:strings(e.admissionFee||{},allowed.fact),
    duplicateResolutions:(e.duplicateResolutions||[]).map(r=>({placeId:trim(r.placeId,255),note:trim(r.note,1000),sourceUrl:trim(r.sourceUrl)}))};
  if(value.googlePlaceId&&!/^[A-Za-z0-9_-]{5,255}$/.test(value.googlePlaceId))return {error:'Invalid Google Place ID.'};
  if(value.source.namespace&&(!/^[a-z][a-z0-9_-]{1,39}$/.test(value.source.namespace)||/google|maps/.test(value.source.namespace)))return {error:'Invalid independent source namespace.'};
  if(value.source.id.length>255||Buffer.byteLength(value.source.id)>512)return {error:'Source ID is too long.'};
  const urls=[value.source.url,value.source.licenseUrl,value.source.permissionUrl,value.coordinate.sourceUrl,value.coordinate.licenseUrl,value.coordinate.permissionUrl,value.coordinate.publicAccessUrl,value.coordinate.authorityUrl,
    value.media.url,value.media.sourcePage,value.media.licenseUrl,value.media.permissionUrl,value.detailSourceUrl,value.openingHours.sourceUrl,value.admissionFee.sourceUrl,...value.duplicateResolutions.map(r=>r.sourceUrl)];
  if(urls.some(url=>url&&!independentUrl(url)))return {error:'Evidence URLs must be independent HTTPS sources without credentials or Google content.'};
  return {value};
}
function dateTimestamp(value) {return Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value+'T00:00:00+07:00':value);}
function currentDate(value,now=Date.now()) {
  const n=dateTimestamp(value);
  return Number.isFinite(n)&&n<=now+300000&&n>=now-180*86400000;
}
function evidenceHolds(payload,e,probe,now=Date.now()) {
  const holds=[];
  if(!e.source.namespace||!e.source.id||!e.source.name||!independentUrl(e.source.url)||
    !licenseAllowed(e.source.licenseName,e.source.licenseUrl,e.source.permissionUrl)||!currentDate(e.source.checkedAt,now)) holds.push('source_license_unverified');
  if(!licenseAllowed(e.coordinate.licenseName,e.coordinate.licenseUrl,e.coordinate.permissionUrl)||!currentDate(e.coordinate.checkedAt,now))holds.push('coordinate_license_unverified');
  if(payload.description&&!independentUrl(e.detailSourceUrl))holds.push('description_source_unverified');
  for(const key of ['openingHours','admissionFee'])if(e[key]?.text&&(!independentUrl(e[key].sourceUrl)||!currentDate(e[key].checkedAt,now)||now-dateTimestamp(e[key].checkedAt)>30*86400000))holds.push(key+'_source_expired_or_unverified');
  if(payload.imageUrl) {
    if(e.media.url!==payload.imageUrl)holds.push('image_evidence_mismatch');
    holds.push(...mediaLicenseHolds(e.media));
    const age=now-Date.parse(probe?.checkedAt||'');
    if(!probe?.ok||probe.url!==payload.imageUrl||!Number.isFinite(age)||age<0||age>86400000) holds.push('image_probe_required');
  }
  return [...new Set(holds)];
}
module.exports={payloadHash,cleanEvidence,evidenceHolds,currentDate,dateTimestamp};
