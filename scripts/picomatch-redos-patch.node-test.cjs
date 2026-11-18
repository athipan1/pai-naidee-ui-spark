'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {patchSource,installedCopies,perform,MARKER}=require('./picomatch-redos-patch.cjs');

test('guard is idempotent and aborts on unknown parser layouts',()=>{
 const source='const analyzeRepeatedExtglob = (body, options) => {\n  return {risky:false};\n};';
 const patched=patchSource(source);
 assert.match(patched,new RegExp(MARKER));
 assert.equal(patchSource(patched),patched);
 assert.throws(()=>patchSource('const analyze=()=>{}'),/parser layout changed/);
 assert.throws(()=>patchSource('// '+MARKER+'\n'+source),/partial patch marker/);
});
test('all installed picomatch copies are patched and reject repeated wildcard extglobs',()=>{
 perform('root',true);
 const copies=installedCopies(path.resolve(__dirname,'..'));
 let tested=0;
 for(const entry of copies){
   if(!fs.existsSync(path.join(entry.directory,'package.json')))continue;
   const content=fs.readFileSync(path.join(entry.directory,'lib','parse.js'),'utf8');
   assert.match(content,new RegExp(MARKER));
   const pm=require(entry.directory);
   const dangerous=['+(*a)','*(?*a)','+(*?a)'];
   for(const pattern of dangerous){
     const start=Date.now();
     assert.equal(pm.isMatch('a'.repeat(48)+'!',pattern),false);
     assert.ok(Date.now()-start<500,pattern+' should not backtrack catastrophically');
   }
   assert.equal(pm.isMatch('src/routes/test.ts','src/**/*.ts'),true);
   assert.equal(pm.isMatch('abcabc','+(abc)'),true);
   tested++;
 }
 assert.ok(tested>=1,'expected to test real installed picomatch copies');
});
