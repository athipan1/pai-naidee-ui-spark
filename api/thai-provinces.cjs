'use strict';
// Canonical Thai province names used by the existing Admin province selector.
// Keep the shared translations as the source of truth; only Bangkok has a legacy alias.
const {PROVINCE_EN}=require('./place-localizations.cjs');
const CANONICAL_PROVINCES=Object.freeze(Object.keys(PROVINCE_EN).map(name=>name==='กรุงเทพฯ'?'กรุงเทพมหานคร':name));
const provinceSet=new Set(CANONICAL_PROVINCES);

function isThaiProvince(value){
 return typeof value==='string'&&provinceSet.has(value);
}

// Text Search can return a neighbouring province. Verify the address before showing
// the preview; do not accept absent/ambiguous province information as verified.
function addressMatchesProvince(address,province){
 if(typeof address!=='string'||!isThaiProvince(province))return false;
 const thaiNames=province==='กรุงเทพมหานคร'?['กรุงเทพมหานคร','กรุงเทพฯ']:[province];
 if(thaiNames.some(name=>address.includes(name)))return true;
 const en=PROVINCE_EN[province==='กรุงเทพมหานคร'?'กรุงเทพฯ':province];
 if(typeof en!=='string'||!en)return false;
 const escaped=en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return new RegExp('(?:^|[^A-Za-z])'+escaped+'(?:[^A-Za-z]|$)','i').test(address);
}

module.exports={CANONICAL_PROVINCES,isThaiProvince,addressMatchesProvince};
