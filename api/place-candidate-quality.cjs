'use strict';

// Pure research/review gates. Never writes, fetches, or promotes a candidate.
const { aliasKey } = require('./place-alias.cjs');
const { distanceMeters } = require('./tourism-source-adapters.cjs');
const { inProvince } = require('./chonburi-bulk-audit.cjs');
const text = x => typeof x === 'string' ? x.trim() : '';
const number = x => (typeof x === 'number' || (typeof x === 'string' && x.trim())) ? Number(x) : NaN;
const coordinate = p => ({ lat:number(p?.lat ?? p?.coordinates?.lat), lng:number(p?.lng ?? p?.coordinates?.lng) });
const validPoint = p => Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
const googleHost = host => /(^|\.)(google\.[a-z.]+|googleapis\.com|googleusercontent\.com|ggpht\.com|gstatic\.com|goo\.gl)$/.test(host);
function independentUrl(value) {
  try {
    const u = new URL(value), host=u.hostname.toLowerCase().replace(/\.$/,'');
    if(u.protocol!=='https:' || u.username || u.password || u.port || googleHost(host) ||
      host==='localhost' || host.endsWith('.local') || host.endsWith('.internal') ||
      /^[\d.]+$/.test(host) || host.includes(':') || !host.includes('.')) return null;
    return u.href;
  } catch { return null; }
}
function names(p) {
  return [...new Set([p.name,p.nameLocal,p.name_local,...(Array.isArray(p.aliases)?p.aliases:[])]
    .filter(v=>typeof v==='string').map(aliasKey).filter(Boolean))];
}
function identity(p) {
  const explicit = text(p.sourceId || p.source_id);
  const tat = /^tat-[A-Za-z0-9-]+$/.test(p.id || '') ? p.id : '';
  const source = text((typeof p.source==='string'?p.source:p.source?.name) || p.source_name || p.sourceName).toLowerCase();
  const namespace = /tourism authority|^tat$/.test(source) || tat ? 'tat' : source;
  return { source:namespace, id:explicit || tat, google:text(p.googlePlaceId || p.google_place_id) };
}
function duplicateDecision(candidate, existing) {
  if(!Array.isArray(existing)) throw Error('Complete existing catalogue required');
  const c=identity(candidate), cn=names(candidate), point=coordinate(candidate), matches=[];
  for(const item of existing) {
    const e=identity(item), ep=coordinate(item), shared=names(item).some(n=>cn.includes(n));
    const distance=validPoint(point)&&validPoint(ep)?distanceMeters(point,ep):null;
    const sameProvince=!candidate.province || !item.province || aliasKey(candidate.province)===aliasKey(item.province);
    let reason, certainty;
    if(candidate.existingPlaceId && candidate.existingPlaceId===item.id) {reason='existing_place_id';certainty='EXISTING_PLACE';}
    else if(c.source && c.id && c.source===e.source && c.id===e.id) {reason='exact_source_id';certainty='EXISTING_PLACE';}
    else if(c.google && c.google===e.google) {reason='exact_google_place_id';certainty='EXISTING_PLACE';}
    else if(shared && sameProvince) {reason='normalized_name_or_alias';certainty='PROBABLE_DUPLICATE';}
    else if(distance!==null && distance<=50) {reason='nearby_location';certainty='PROBABLE_DUPLICATE';}
    else if(distance!==null && distance<=300 && sameProvince) {reason='nearby_entity_review';certainty='NEEDS_REVIEW';}
    if(reason) matches.push({placeId:item.id || null,reason,status:certainty,
      confidence:certainty==='EXISTING_PLACE'?'identifier_match':shared?'name_match_needs_review':'proximity_only',
      distanceMeters:distance===null?null:Math.round(distance)});
  }
  const status=['EXISTING_PLACE','PROBABLE_DUPLICATE','NEEDS_REVIEW'].find(s=>matches.some(m=>m.status===s)) || 'NEW_CANDIDATE';
  return {status,matches,action:status==='EXISTING_PLACE'?'update_existing_only':status==='NEW_CANDIDATE'?'human_review_required':'resolve_identity_before_import'};
}
function reviewCandidate(candidate, existing, {boundary=null, province=null}={}) {
  const duplicate=duplicateDecision(candidate,existing), holds=[];
  const point=coordinate(candidate);
  if(!text(candidate.nameLocal || candidate.name_local) || !text(candidate.name) || !text(candidate.province)) holds.push('missing_names_or_province');
  const provenance=candidate.provenance || {};
  if(!independentUrl(provenance.sourceUrl) || !text(provenance.license) || !text(provenance.sourceId)) holds.push('source_license_unverified');
  const independent=independentUrl(provenance.coordinateSourceUrl) && text(provenance.coordinateLicense);
  if(!validPoint(point)) holds.push('coordinate_missing_or_invalid');
  if(!independent) holds.push('independent_coordinate_evidence_required');
  // Only trusted server/operator boundary geometry and independent coordinates
  // enter polygon math. Never accept a caller-provided insideProvince boolean.
  const polygonReady=independent && validPoint(point) && province===candidate.province &&
    Array.isArray(boundary?.outer) && boundary.outer.length>0 && Array.isArray(boundary?.inner) &&
    [...boundary.outer,...boundary.inner].every(r=>Array.isArray(r)&&r.length>=4&&
      r.every(v=>validPoint({lat:v.lat,lng:v.lon}))&&r[0].lat===r[r.length-1].lat&&r[0].lon===r[r.length-1].lon);
  const inside=polygonReady?inProvince(point,boundary):null;
  if(inside===null) holds.push('province_polygon_unverified');
  if(inside===false) holds.push('outside_province_polygon');
  const access=candidate.access || {};
  const kind=['site_center','vehicle_entrance','parking','trailhead'].includes(access.kind)?access.kind:'unknown';
  if(kind==='unknown') holds.push('coordinate_role_unverified');
  if(kind==='site_center') holds.push('entrance_not_verified');
  if(!independentUrl(access.sourceUrl)) holds.push('public_access_evidence_required');
  if(access.restricted===true && (access.publicNavigationPoint!==true || !independentUrl(access.authorityUrl))) holds.push('restricted_access_not_authorized');
  const status=inside===false?'REJECTED':duplicate.status!=='NEW_CANDIDATE'?duplicate.status:holds.length?'NEEDS_REVIEW':'NEW_CANDIDATE';
  return {status,duplicate,holds,provinceGate:inside===null?'NEEDS_REVIEW':inside?'PASS':'REJECTED',coordinateKind:kind,
    publishAllowed:false,requiresHumanApproval:true,googleVerification:'NOT_REQUESTED'};
}
function csvCell(value) {
  let s=Array.isArray(value)?value.join('|'):String(value??'');
  if(/^[\s]*[=+@-]/.test(s)) s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
function reviewCsv(rows) {
  const keys=['candidateId','name','province','status','action','holds','matchedPlaceIds','publishAllowed'];
  return [keys.map(csvCell).join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\n')+'\n';
}
module.exports={coordinate,validPoint,independentUrl,duplicateDecision,reviewCandidate,reviewCsv};
