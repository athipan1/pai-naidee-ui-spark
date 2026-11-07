'use strict';
// Staging-only. No DB writes, web requests or publication side effects.
// Approximate bbox is a prefilter, never proof of Chon Buri province membership.
const norm = value => String(value || '').normalize('NFKC').toLocaleLowerCase('th')
  .replace(/[\s\u200b\-_.()\[\]]+/g, '');
const inBbox = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= 12.3 && lat <= 13.7 && lng >= 100.4 && lng <= 101.6;
const hasThai = value => /[\u0e01-\u0e5b]/.test(value || '');
const extract = value => String(value?.value ?? value ?? '').trim();
const toNumber = value => value === '' || value == null ? NaN : Number(value);
const entityId = value => {
  const match = extract(value).match(/(?:^|\/)Q([1-9]\d*)$/);
  return match ? 'Q' + match[1] : null;
};
const distanceMeters = (a,b) => {
  const rad = x => x * Math.PI / 180;
  const lat = rad(a.lat), otherLat = rad(b.lat), dLat = otherLat-lat, dLng=rad(b.lng-a.lng);
  const v = Math.sin(dLat/2)**2 + Math.cos(lat)*Math.cos(otherLat)*Math.sin(dLng/2)**2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(v),Math.sqrt(1-v));
};
function adaptWikidata(row) {
  const id = entityId(row.item);
  const point = extract(row.coord).match(/^Point\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/);
  return {
    source:'wikidata', sourceId:id, wikidataId:id,
    sourceUrl:id ? 'https://www.wikidata.org/wiki/' + id : null,
    nameLocal:extract(row.nameTh), name:extract(row.nameEn),
    province:'ชลบุรี', lat:point ? toNumber(point[2]) : NaN,
    lng:point ? toNumber(point[1]) : NaN, verified:false
  };
}
function adaptOsm(row) {
  const type = row.type, id = toNumber(row.id);
  const sourceId = ['node','way','relation'].includes(type) && Number.isSafeInteger(id) && id>0 ? type + '/' + id : null;
  const local = extract(row.tags?.['name:th']) || extract(row.tags?.name);
  const lat = toNumber(row.lat ?? row.center?.lat), lng = toNumber(row.lon ?? row.center?.lon);
  return {
    source:'openstreetmap', sourceId, wikidataId:entityId(row.tags?.wikidata),
    sourceUrl:sourceId ? 'https://www.openstreetmap.org/' + sourceId : null,
    nameLocal:hasThai(local) ? local : '', name:extract(row.tags?.['name:en']) || (!hasThai(local) ? local : ''),
    province:'ชลบุรี', lat,lng, verified:false
  };
}
function stage(rows,adapter,existing) {
  if (!Array.isArray(rows) || typeof adapter !== 'function') throw Error('invalid source rows or adapter');
  if (!Array.isArray(existing)) throw Error('Production comparison places are required');
  const seen = existing.map(p => ({
    source:p.source || p.source_name, sourceId:p.sourceId,
    wikidataId:p.wikidataId || p.wikidata_id, nameLocal:p.nameLocal || p.name_local || p.name,
    lat:toNumber(p.lat ?? p.coordinates?.lat), lng:toNumber(p.lng ?? p.coordinates?.lng)
  }));
  const candidates=[], rejected=[];
  for (const raw of rows) {
    const item=adapter(raw), issues=[];
    if(!item.sourceId || !item.sourceUrl)issues.push('missing_provenance');
    if(!hasThai(item.nameLocal))issues.push('missing_thai_name');
    if(!inBbox(item.lat,item.lng))issues.push('outside_chonburi_bbox');
    if(seen.some(p => {
      if(p.source===item.source && p.sourceId && p.sourceId===item.sourceId)return true;
      if(p.wikidataId && item.wikidataId && p.wikidataId===item.wikidataId)return true;
      if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||!inBbox(item.lat,item.lng))return false;
      return norm(p.nameLocal)===norm(item.nameLocal) && !!norm(item.nameLocal) &&
        distanceMeters(p,item)<=300;
    }))issues.push('possible_duplicate');
    // The bbox does NOT verify the province and source fields are not
    // evidence of property ownership, permission, license or visitor entrance.
    const record={...item,status:issues.length?'rejected':'needs_review',
      issues,requires:['province_polygon_check','source_owner_check','coordinate_review','license_review','admin_approval']};
    (issues.length?rejected:candidates).push(record);
    if(!issues.length)seen.push(item);
  }
  return {status:'dry_run_only',province:'ชลบุรี',candidates,rejected,approved:0};
}
module.exports={adaptWikidata,adaptOsm,stage,distanceMeters};
