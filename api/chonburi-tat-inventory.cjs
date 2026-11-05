#!/usr/bin/env node
// Read-only Chon Buri inventory over the *entire* official TAT CSV.
// Manual review only: this command has no database writes and no auto-publication.
const { readFileSync, writeFileSync } = require('node:fs');
const { parseData, normalizeRecord, sha256 } = require('./tat-open-data.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');

function key(s) {
  return String(s || '').normalize('NFKC').toLocaleLowerCase('th')
    .replace(/[\s\u200b._\-()\[\]]+/g,'');
}
function reportInventory(contents, expectedSha256) {
  const sha = sha256(contents);
  if (expectedSha256 && sha !== expectedSha256) throw Error('Unexpected TAT source checksum: '+sha);
  const rows = parseData(contents.toString('utf8'), 'csv');
  const published = SEED_PLACES.filter(p => p.province === 'ชลบุรี');
  const ids = new Set(published.map(p=>p.id));
  const names = new Set(published.map(p=>key(p.nameLocal || p.name)));
  const list = [],seen = new Set(),counts={};
  for (let i=0;i<rows.length;i++) {
    const raw=rows[i];
    if(String(raw.PROVINCE_NAME_TH||'').trim().replace(/^จังหวัด/,'') !== 'ชลบุรี')continue;
    const norm=normalizeRecord(raw);
    const id='tat-'+String(raw.ATT_ID||'').trim();
    const name=String(raw.ATT_NAME_TH||'').trim().slice(0,160);
    let status=norm.reason||'candidate';
    if(!norm.reason && (ids.has(id)||names.has(key(name))))status='already_published';
    else if(!norm.reason && seen.has(key(name)))status='duplicate_source_name';
    if(status==='candidate')seen.add(key(name));
    counts[status]=(counts[status]||0)+1;
    const p=norm.place;
    list.push({
      csvRow:i+1,id,name,categoryCode:String(raw.ATT_CATEGORY||''),
      typeCode:String(raw.ATT_TYPE||''),typeLabel:String(raw.ATT_TYPE_LABEL||'').slice(0,80),
      district:String(raw.AMPHUR_NAME_TH||raw.DISTRICT_NAME_TH||'').slice(0,70),
      lat:p?.lat??null,lng:p?.lng??null,
      descriptionLength:p?.description?.length||0,
      descriptionPreview:p?.description?.slice(0,85)||'',
      status,
    });
  }
  return {
    schemaVersion:1,status:'manual_review_only',sourceSha256:sha,
    totalSourceRecords:rows.length,chonburiSourceRows:list.length,
    publishedBaseline:published.length,counts,
    rows:list,
    safeguards:['no_railway_writes','no_google_places','not_auto_published','independent_verification_required'],
  };
}
if (require.main === module) {
  const input=process.argv[2],output=process.argv[3],sha=process.argv[4]||'';
  if(!input||!output)throw Error('Usage: node chonburi-tat-inventory.cjs <csv> <json> [expected_sha256]');
  const report=reportInventory(readFileSync(input),sha);
  writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log('CHONBURI_INVENTORY_SUMMARY '+JSON.stringify({
    sha:report.sourceSha256,sourceRecords:report.totalSourceRecords,
    chonburiSourceRows:report.chonburiSourceRows,publishedBaseline:report.publishedBaseline,
    counts:report.counts
  }));
  for (const row of report.rows)console.log('CHONBURI_ROW '+JSON.stringify(row));
}
module.exports={reportInventory};
