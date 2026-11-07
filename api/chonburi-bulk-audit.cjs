'use strict';
// Province boundary geometry must come from the OSM relation ISO3166-2=TH-20.
// No bounding-box-only location may be labelled "inside Chon Buri".
const { adaptWikidata,adaptOsm,distanceMeters } = require('./tourism-source-adapters.cjs');
const norm = x => String(x??'').normalize('NFKC').toLocaleLowerCase('th').replace(/[\s\u200b._\-()\[\]]+/g,'');
function same(a,b){return Math.abs(a.lat-b.lat)<1e-6&&Math.abs(a.lon-b.lon)<1e-6;}
function joinRole(members,role){
  const fragments=members.filter(m=>m.role===role&&m.type==='way'&&Array.isArray(m.geometry)&&m.geometry.length>=2)
    .map(m=>m.geometry.map(p=>({lat:p.lat,lon:p.lon})));
  const rings=[];let broken=0;
  while(fragments.length){
    let ring=fragments.shift();
    for(let n=0;n<2000 && !same(ring[0],ring[ring.length-1]);n++){
      const last=ring[ring.length-1];
      const at=fragments.findIndex(f=>same(f[0],last)||same(f[f.length-1],last));
      if(at<0)break;
      let next=fragments.splice(at,1)[0];
      if(same(next[next.length-1],last))next=next.reverse();
      ring=ring.concat(next.slice(1));
    }
    if(ring.length>=4&&same(ring[0],ring[ring.length-1]))rings.push(ring);
    else broken++;
  }
  return {rings,broken};
}
function polygonBoundary(relation){
  if(!relation||relation.type!=='relation'||relation.tags?.['ISO3166-2']!=='TH-20'||
     relation.tags?.admin_level!=='4'||relation.tags?.boundary!=='administrative')
    throw Error('Verified Chon Buri administrative relation missing');
  const outer=joinRole(relation.members||[],'outer');
  const inner=joinRole(relation.members||[],'inner');
  if(!outer.rings.length||outer.broken ||inner.broken)
    throw Error('Incomplete OSM province polygon: outer='+outer.rings.length+
      ' broken='+outer.broken+'/'+inner.broken);
  return {id:relation.id,outer:outer.rings,inner:inner.rings};
}
function inRing(p,ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    if((a.lat>p.lat)!==(b.lat>p.lat) &&
      p.lng < (b.lon-a.lon)*(p.lat-a.lat)/(b.lat-a.lat)+a.lon)inside=!inside;
  }
  return inside;
}
function inProvince(p,boundary){
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return false;
  return boundary.outer.some(r=>inRing(p,r))&&!boundary.inner.some(r=>inRing(p,r));
}
function review({wdRows,osmRows,existing,boundary,maxRows=600}){
  if(!Array.isArray(wdRows)||!Array.isArray(osmRows)||!Array.isArray(existing)||!existing.length)
    throw Error('Source arrays and nonempty live Production baseline required');
  if(wdRows.length>maxRows||osmRows.length>maxRows)throw Error('Source response exceeded safety cap; abort incomplete audit');
  const entries=[...wdRows.map(row=>adaptWikidata(row)),...osmRows.map(row=>adaptOsm(row))];
  // Compare each source to live Production AND all other source items.
  const seen=[];const rows=[];const stats={inside:0,outside:0,duplicate:0,needs_review:0,source_rejected:0,license_hold:0};
  const baseline=existing.map(x=>({nameLocal:x.nameLocal||x.name_local||x.name,
    lat:Number(x.coordinates?.lat??x.lat),lng:Number(x.coordinates?.lng??x.lng),
    wikidataId:x.wikidataId||x.wikidata_id,sourceId:x.sourceId,
    source:x.source||x.source_name}));
  for(const item of entries){
    const blockers=[];
    const inside=inProvince(item,boundary);
    if(inside)stats.inside++;else{stats.outside++;blockers.push('outside_province_polygon');}
    if(!item.sourceId||!item.sourceUrl)blockers.push('missing_provenance');
    if(!/[\u0e01-\u0e5b]/.test(item.nameLocal))blockers.push('missing_thai_name');
    const compared=baseline.concat(seen);
    const dupe=compared.some(x=>{
      if(x.source===item.source&&x.sourceId&&x.sourceId===item.sourceId)return true;
      if(x.wikidataId&&item.wikidataId&&x.wikidataId===item.wikidataId)return true;
      const a=norm(x.nameLocal), b=norm(item.nameLocal);
      return a&&b&&a===b&&Number.isFinite(x.lat)&&Number.isFinite(x.lng)&&
        Number.isFinite(item.lat)&&Number.isFinite(item.lng)&&distanceMeters(x,item)<=300;
    });
    if(dupe){stats.duplicate++;blockers.push('possible_duplicate');}
    if(item.source==='openstreetmap'){
      // ODbL: isolate source data, attribution + database license legal review needed before import.
      blockers.push('odbl_legal_review');stats.license_hold++;
    }
    if(blockers.includes('missing_provenance')||blockers.includes('missing_thai_name'))stats.source_rejected++;
    const status=blockers.some(x=>['outside_province_polygon','missing_provenance','missing_thai_name'].includes(x))
      ? 'rejected' : 'needs_review';
    if(status==='needs_review')stats.needs_review++;
    rows.push({source:item.source,sourceId:item.sourceId,nameLocal:item.nameLocal,name:item.name,
      lat:Number.isFinite(item.lat)?item.lat:null,lng:Number.isFinite(item.lng)?item.lng:null,
      sourceUrl:item.sourceUrl,insideProvince:inside,status,blockers,
      license:item.source==='wikidata'?'CC0':'ODbL 1.0',approved:false});
    if(item.sourceId)seen.push(item);
  }
  return {status:'audit_only',province:'ชลบุรี',boundaryId:boundary.id,
    productionCount:existing.length,sources:{wikidata:wdRows.length,osm:osmRows.length},
    stats,approved:0,rows};
}
module.exports={joinRole,polygonBoundary,inRing,inProvince,review};
