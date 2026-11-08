'use strict';
// Reads an existing database only; never calls ensureSchema/startup/backfill.
const postgres = require('postgres');
const { publishedPlaceImages } = require('./published-place-images.cjs');
const fs = require('node:fs/promises');
async function audit(url) {
  if (!url) throw Error('DATABASE_URL is required through the secure environment');
  const sql = postgres(url, {max:1,connection:{default_transaction_read_only:'on',statement_timeout:10000}});
  try {
    return await sql.begin('isolation level repeatable read read only', async tx => {
      const guard = await tx`SHOW transaction_read_only`;
      if (guard[0].transaction_read_only !== 'on') throw Error('Read-only guard failed');
      const rows = await tx`SELECT p.id,p.name,p.name_local,p.province,p.source_name,p.image_url,p.updated_at,
        COALESCE((SELECT json_agg(json_build_object('id',m.id,'url',m.url,'creatorName',m.creator_name,
        'licenseName',m.license_name,'licenseUrl',m.license_url,'sourcePage',m.source_page)
        ORDER BY (m.id LIKE 'wikimedia:%') ASC,m.created_at ASC,m.id ASC) FROM media m WHERE m.place_id=p.id),'[]'::json) AS media
        FROM places p ORDER BY p.id`;
      return {checkedAt:new Date().toISOString(),scope:'postgresql-read-only',transactionReadOnly:true,total:rows.length,
        places:rows.map(row=>({...row,...publishedPlaceImages(row,row.media)}))};
    });
  } finally {await sql.end();}
}
if(require.main===module) audit(process.env.DATABASE_URL).then(result=>fs.writeFile(process.argv[2]||'published-images-sql.json',JSON.stringify(result,null,2)))
 .catch(()=>{console.error('Read-only SQL audit failed; inspect connection/access without logging credentials.');process.exitCode=1;});
module.exports={audit};
