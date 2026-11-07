#!/usr/bin/env node
'use strict';
// Operator configuration only. Default is offline plan; never called on startup.
const fs=require('node:fs');
const {joinRole}=require('./chonburi-bulk-audit.cjs');
const {validPoint}=require('./place-candidate-quality.cjs');
const {payloadHash}=require('./place-review-evidence.cjs');
const {PROVINCE_EN}=require('./place-localizations.cjs');
const {aliasKey}=require('./place-alias.cjs');
const provinceKey=name=>aliasKey(String(name||'').replace(/^จังหวัด\s*/,'').replace(/\s+Province$/i,''));
function boundaryPlan(input,province) {
  if(!Object.hasOwn(PROVINCE_EN,province)||input?.remark)throw Error('Known province and complete source response required');
  const relations=Array.isArray(input?.elements)?input.elements:[input];
  if(relations.length!==1)throw Error('Exactly one administrative relation required');
  const r=relations[0],tags=r?.tags||{};
  if(r?.type!=='relation'||!Number.isSafeInteger(r.id)||r.id<=0||tags.boundary!=='administrative'||tags.admin_level!=='4'||
    !/^TH-\d{2}$/.test(tags['ISO3166-2']||'')||
    ![tags['name:th'],tags.name,tags['name:en']].some(name=>provinceKey(name)===provinceKey(province)||provinceKey(name)===provinceKey(PROVINCE_EN[province])))
    throw Error('Administrative source identity does not match selected province');
  if(!Array.isArray(r.members)||!r.members.length||r.members.length>20000)throw Error('Incomplete or oversized relation');
  if(r.members.some(m=>m.type==='relation'&&['outer','inner'].includes(m.role)))throw Error('Nested boundary relations require separate geometry resolution');
  const geometryMembers=r.members.filter(m=>m.type==='way');
  if(geometryMembers.some(m=>!['outer','inner'].includes(m.role)||!Array.isArray(m.geometry)||
    m.geometry.some(p=>!validPoint({lat:p.lat,lng:p.lon}))))throw Error('Missing, invalid or unsupported member geometry');
  const outer=joinRole(r.members,'outer'),inner=joinRole(r.members,'inner');
  if(!outer.rings.length||outer.broken||inner.broken)throw Error('Incomplete polygon rings');
  const geometry={id:r.id,outer:outer.rings,inner:inner.rings};
  const vertices=[...geometry.outer,...geometry.inner].reduce((sum,ring)=>sum+ring.length,0);
  if(vertices>250000)throw Error('Boundary exceeds review size cap');
  const record={province,isoCode:tags['ISO3166-2'],geometry,sourceUrl:'https://www.openstreetmap.org/relation/'+r.id,
    licenseName:'ODbL 1.0',licenseUrl:'https://www.openstreetmap.org/copyright',attribution:'© OpenStreetMap contributors'};
  return {...record,sha256:payloadHash(record),vertices,mode:'plan_only',licenseApprovalRequired:true,databaseAccessed:false};
}
async function storeApprovedBoundary(sql,plan,reviewerId) {
  return sql.begin(async tx=>{
    await tx`SET LOCAL lock_timeout = '3s'`;
    const [reviewer]=await tx`SELECT id FROM admin_users WHERE id=${reviewerId} AND role='admin' AND disabled=FALSE`;
    if(!reviewer)throw Error('Enabled administrator identity required');
    await tx`SELECT pg_advisory_xact_lock(hashtext(${plan.province}))`;
    const [existing]=await tx`SELECT province,iso_code,geometry,source_url,license_name FROM province_review_boundaries WHERE province=${plan.province}`;
    if(existing) {
      if(existing.iso_code!==plan.isoCode||existing.source_url!==plan.sourceUrl||existing.license_name!==plan.licenseName||
        payloadHash(existing.geometry)!==payloadHash(plan.geometry))throw Error('Existing boundary differs; separate change review required. No overwrite performed');
      return {status:'unchanged',province:plan.province,sha256:plan.sha256};
    }
    await tx`INSERT INTO province_review_boundaries(province,iso_code,geometry,source_url,license_name,reviewed_by)
      VALUES(${plan.province},${plan.isoCode},${tx.json(plan.geometry)},${plan.sourceUrl},${plan.licenseName},${reviewerId})`;
    return {status:'approved_boundary_stored',province:plan.province,sha256:plan.sha256,reviewedBy:reviewerId};
  });
}
async function main() {
  const args=process.argv.slice(2),[file,province]=args;
  if(!file||!province||fs.statSync(file).size>12*1024*1024)throw Error('Use input.json province [--apply --reviewer-id ID --approved-release REF]; input max 12 MiB');
  const plan=boundaryPlan(JSON.parse(fs.readFileSync(file,'utf8')),province);
  const output={...plan};delete output.geometry;
  if(!args.includes('--apply'))return process.stdout.write(JSON.stringify(output)+'\n');
  const readArg=name=>args.includes(name)?args[args.indexOf(name)+1]:'';
  const reviewer=readArg('--reviewer-id'),release=readArg('--approved-release');
  if(!reviewer||!/^[A-Za-z0-9_./#-]{3,150}$/.test(release)||process.env.PLACE_BOUNDARY_APPROVAL_SHA256!==plan.sha256)
    throw Error('Exact boundary digest, administrator and separately approved release/licence review required');
  const {getSql,closeDatabase}=require('./postgres-db.cjs');
  try {process.stdout.write(JSON.stringify({...await storeApprovedBoundary(getSql(),plan,reviewer),release})+'\n');}
  finally {await closeDatabase();}
}
if(require.main===module)main().catch(()=>{process.stderr.write('Boundary import blocked: verify complete source, exact approval digest, administrator, release/licence approval and existing review schema. No credentials logged.\n');process.exitCode=1;});
module.exports={boundaryPlan,storeApprovedBoundary};
