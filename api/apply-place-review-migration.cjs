#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {applyPlaceReviewSchema}=require('./place-review-schema.cjs');
async function main() {
  const file=path.join(__dirname,'migrations/20261107-place-review.sql');
  const digest=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const args=process.argv.slice(2),release=args[args.indexOf('--approved-release')+1];
  if(!args.includes('--apply'))return console.log(JSON.stringify({status:'plan_only',migration:path.basename(file),sha256:digest,databaseAccessed:false}));
  if(!args.includes('--approved-release')||!/^[A-Za-z0-9_./#-]{3,150}$/.test(release||'')||process.env.PLACE_REVIEW_MIGRATION_SHA256!==digest)
    throw Error('An approved release reference and exact PLACE_REVIEW_MIGRATION_SHA256 are required.');
  const {getSql,closeDatabase}=require('./postgres-db.cjs');
  try {
    const sql=getSql();
    const [before]=await sql`SELECT COUNT(*)::int AS places FROM places`;
    await applyPlaceReviewSchema(sql);
    const [after]=await sql`SELECT COUNT(*)::int AS places FROM places`;
    console.log(JSON.stringify({status:'migration_applied',release,sha256:digest,placesBefore:before.places,placesAfter:after.places}));
  } finally {await closeDatabase();}
}
if(require.main===module)main().catch(()=>{console.error('Place review migration failed or lacks explicit approval; no credentials are logged.');process.exitCode=1;});
module.exports={main};
