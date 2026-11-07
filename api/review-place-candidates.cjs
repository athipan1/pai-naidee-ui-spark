#!/usr/bin/env node
'use strict';
// Offline review only. Inputs must be independently sourced; never pass a
// Google response as a candidate document. Output is not an import payload.
const fs=require('node:fs');
const path=require('node:path');
const {reviewCandidate,reviewCsv}=require('./place-candidate-quality.cjs');
function buildReport(candidates,baseline) {
  if(!Array.isArray(candidates)||candidates.length>50||!Array.isArray(baseline.places)||
    !Number.isInteger(baseline.total)||baseline.total!==baseline.places.length||
    new Set(baseline.places.map(p=>p.id)).size!==baseline.total)throw Error('Complete unique baseline and at most 50 candidates required');
  const seen=[...baseline.places],rows=[];
  for(const candidate of candidates) {
    const result=reviewCandidate(candidate,seen);
    rows.push({candidateId:candidate.candidateId,name:candidate.nameLocal||candidate.name,province:candidate.province,
      sourceUrl:candidate.provenance?.sourceUrl||null,...result,action:result.duplicate.action,
      matchedPlaceIds:result.duplicate.matches.map(m=>m.placeId)});
    // Include the whole batch in subsequent cross-source duplicate checks.
    seen.push({...candidate,id:candidate.candidateId});
  }
  return {mode:'research_review_only',generatedAt:new Date().toISOString(),baselineGeneratedAt:baseline.generatedAt,
    baselineCount:baseline.total,candidateCount:rows.length,approved:0,published:0,googleApiCalls:0,
    gates:{duplicate:Object.fromEntries(['EXISTING_PLACE','PROBABLE_DUPLICATE','NEW_CANDIDATE','NEEDS_REVIEW','REJECTED'].map(s=>[s,rows.filter(r=>r.duplicate.status===s).length])),
      provinceVerified:rows.filter(r=>r.provinceGate==='PASS').length,coordinateHold:rows.filter(r=>r.holds.some(h=>/coordinate|entrance|access/.test(h))).length,
      sourceLicenseHold:rows.filter(r=>r.holds.includes('source_license_unverified')).length},rows};
}
function main() {
  const [inputFile,baselineFile,outDir]=process.argv.slice(2);
  if(!inputFile||!baselineFile||!outDir)throw Error('Usage: node api/review-place-candidates.cjs candidates.json complete-baseline.json output-directory');
  const report=buildReport(JSON.parse(fs.readFileSync(inputFile,'utf8')),JSON.parse(fs.readFileSync(baselineFile,'utf8')));
  fs.mkdirSync(outDir,{recursive:true});
  // wx prevents accidentally overwriting a prior research decision.
  fs.writeFileSync(path.join(outDir,'candidate-review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  fs.writeFileSync(path.join(outDir,'candidate-review.csv'),reviewCsv(report.rows),{flag:'wx'});
  console.log(JSON.stringify({mode:report.mode,candidates:report.candidateCount,gates:report.gates,approved:0,published:0,googleApiCalls:0}));
}
if(require.main===module)try{main();}catch{console.error('Candidate review failed; check input format, complete baseline and unused output paths.');process.exitCode=1;}
module.exports={buildReport};
