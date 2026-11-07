#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const {resolve}=require('node:path');
const {adaptWikidata,adaptOsm,stage}=require('./tourism-source-adapters.cjs');
const [kind,input,output,existingPath]=process.argv.slice(2);
if(!['wikidata','osm'].includes(kind)||!input||!output||!existingPath ||
  new Set([input,output,existingPath].map(resolve)).size!==3) {
  console.error('Usage: node stage-chonburi-sources.cjs wikidata|osm source.json staging.json production-export.json');
  process.exit(2);
}
try {
  const data=JSON.parse(fs.readFileSync(input,'utf8'));
  const rows=kind==='wikidata' ? (data.results?.bindings || data) : (data.elements || data);
  if(!Array.isArray(rows))throw Error('source JSON must contain an array');
  const catalog=JSON.parse(fs.readFileSync(existingPath,'utf8'));
  const existing=Array.isArray(catalog)?catalog:catalog.places;
  if(!Array.isArray(existing) || existing.length===0)throw Error('Nonempty Production catalogue required');
  if(!Array.isArray(catalog) && (catalog.status!=='read_only' || catalog.province!=='ชลบุรี' ||
     catalog.counts?.chonburi!==existing.length))
    throw Error('PostgreSQL export must be read_only, Chon Buri, and count-consistent');
  const result=stage(rows,kind==='wikidata'?adaptWikidata:adaptOsm,existing);
  fs.writeFileSync(output,JSON.stringify({...result,baselineCount:existing.length},null,2)+'\n',
    {flag:'wx',mode:0o600});
  console.log(JSON.stringify({candidates:result.candidates.length,rejected:result.rejected.length,
    comparedExisting:existing.length,approved:0,output}));
} catch(e){console.error('Staging blocked:',e.message);process.exitCode=1;}
