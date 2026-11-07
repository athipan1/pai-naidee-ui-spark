#!/usr/bin/env node
'use strict';
// Operator-only CLI. Requires a dedicated PostgreSQL SELECT-only credential.
// No HTTP route, no migrations, no INSERT/UPDATE/DELETE.
const fs = require('node:fs');
const postgres = require('postgres');
async function main() {
  const out = process.argv[2];
  if (!out || !out.endsWith('.json')) throw Error('Usage: node export-chonburi-readonly.cjs /private/path/chonburi.json');
  if (!process.env.READONLY_DATABASE_URL) throw Error('READONLY_DATABASE_URL required (dedicated SELECT-only user)');
  const sql = postgres(process.env.READONLY_DATABASE_URL, {max:1,prepare:false,connect_timeout:10});
  try {
    const report = await sql.begin('READ ONLY', async tx => {
      const columns = await tx`SELECT table_name,column_name,data_type,is_nullable FROM information_schema.columns
        WHERE table_schema='public' AND table_name IN ('places','media','place_aliases','place_drafts')
        ORDER BY table_name,ordinal_position`;
      const totals = await tx`SELECT COUNT(*)::integer AS total,
        COUNT(*) FILTER (WHERE province = 'ชลบุรี')::integer AS chonburi
        FROM public.places`;
      const rows = await tx`SELECT id,name,name_local,province,lat,lng,source_name,source_url
        FROM public.places WHERE province = 'ชลบุรี' ORDER BY id`;
      return {status:'read_only',schema:columns,counts:totals[0],province:'ชลบุรี',places:rows};
    });
    fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
    console.log(JSON.stringify({status:report.status,counts:report.counts,schemaColumns:report.schema.length,exported:report.places.length,output:out}));
  } finally {await sql.end({timeout:3});}
}
if(require.main===module) main().catch(e=>{console.error('Read-only export failed:',e.message);process.exitCode=1;});
module.exports={main};
