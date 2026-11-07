'use strict';
const fs=require('node:fs');
const path=require('node:path');
// Exported for isolated PostgreSQL tests and an explicitly approved operator
// migration. API startup never imports or executes this function.
async function applyPlaceReviewSchema(sql) {
  return sql.begin(async tx=>{await tx`SET LOCAL lock_timeout = '3s'`;await tx.unsafe(fs.readFileSync(path.join(__dirname,'migrations/20261107-place-review.sql'),'utf8'));});
}
module.exports={applyPlaceReviewSchema};
