'use strict';
const {createHash}=require('node:crypto');
const {GetObjectCommand}=require('@aws-sdk/client-s3');
const {independentUrl}=require('./place-candidate-quality.cjs');
const MAX_BYTES=5*1024*1024;
function licenseAllowed(name,url,permissionUrl) {
  if(name==='Operator permission') return Boolean(independentUrl(permissionUrl));
  const licenses={ 'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/',
    'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
    'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
    'CC BY 3.0 au':'https://creativecommons.org/licenses/by/3.0/au/',
    'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
    'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
    'CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/',
    'CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/',
    'Public domain':'https://creativecommons.org/publicdomain/mark/1.0/' };
  const canonical=String(url||'').replace(/\/deed\.[a-z-]+$/,'').replace(/\/?$/,'/');
  return Boolean(licenses[name] && canonical===licenses[name]);
}
function mediaLicenseHolds(media) {
  const holds=[];
  if(!independentUrl(media?.url))holds.push('image_url_invalid');
  if(!independentUrl(media?.sourcePage)||!String(media?.photographer||'').trim())holds.push('image_credit_missing');
  if(!licenseAllowed(media?.licenseName,media?.licenseUrl,media?.permissionUrl))holds.push('image_license_unverified');
  return holds;
}
function dimensions(bytes) {
  if(bytes.length>=24 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.toString('ascii',12,16)==='IHDR')
    return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),mime:'image/png'};
  if(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP') {
    const kind=bytes.toString('ascii',12,16);
    if(kind==='VP8X')return {width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3),mime:'image/webp'};
    if(kind==='VP8 '&&bytes[23]===0x9d&&bytes[24]===1&&bytes[25]===0x2a)return {width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff,mime:'image/webp'};
    if(kind==='VP8L'&&bytes[20]===0x2f) {const n=bytes.readUInt32LE(21);return {width:(n&0x3fff)+1,height:((n>>>14)&0x3fff)+1,mime:'image/webp'};}
  }
  if(bytes.length>=4&&bytes[0]===0xff&&bytes[1]===0xd8) {
    for(let offset=2;offset+4<bytes.length;) {
      if(bytes[offset++]!==0xff)break;
      while(bytes[offset]===0xff)offset++;
      const marker=bytes[offset++];
      if(marker===0xda||marker===0xd9)break;
      const size=bytes.readUInt16BE(offset);
      if(size<2||offset+size>bytes.length)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&size>=8)
        return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3),mime:'image/jpeg'};
      offset+=size;
    }
  }
  throw Error('Unsupported or truncated image');
}
function completeImage(bytes,mime) {
  if(mime==='image/jpeg')return bytes.length>20&&bytes[bytes.length-2]===0xff&&bytes[bytes.length-1]===0xd9;
  if(mime==='image/webp')return bytes.readUInt32LE(4)+8===bytes.length;
  if(mime==='image/png') {
    let offset=8,idat=false;
    while(offset+12<=bytes.length) {
      const size=bytes.readUInt32BE(offset),end=offset+12+size;if(end>bytes.length)return false;
      let crc=0xffffffff;for(const byte of bytes.subarray(offset+4,end-4)){crc^=byte;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
      if(((crc^0xffffffff)>>>0)!==bytes.readUInt32BE(end-4))return false;
      const type=bytes.toString('ascii',offset+4,offset+8);if(type==='IDAT')idat=true;
      if(type==='IEND')return idat&&size===0&&end===bytes.length;
      offset=end;
    }
  }
  return false;
}
async function boundedBytes(stream) {
  const chunks=[];let total=0;
  try { for await(const chunk of stream) {const b=Buffer.from(chunk);total+=b.length;if(total>MAX_BYTES)throw Error('Image too large');chunks.push(b);} }
  catch(e){stream.destroy?.();throw e;}
  return Buffer.concat(chunks);
}
async function probeMedia(media,{storage,fetchImpl=fetch,publicBase=process.env.PUBLIC_API_BASE_URL||'https://painaidee-api-production.up.railway.app'}={}) {
  const holds=mediaLicenseHolds(media);
  if(holds.length)return {ok:false,holds};
  try {
    const url=new URL(media.url),base=new URL(publicBase);let bytes;
    const cms=/^\/api\/media\/cms\/([a-f0-9-]{36}\.(?:png|jpg|webp))$/.exec(url.pathname);
    if(url.origin===base.origin&&cms&&!url.search) {
      if(!storage)throw Error('Storage unavailable');
      const obj=await storage.client.send(new GetObjectCommand({Bucket:storage.bucket,Key:'cms/'+cms[1]}),{abortSignal:AbortSignal.timeout(7000)});
      bytes=await boundedBytes(obj.Body);
    } else {
      // No arbitrary server-side URL fetches, redirects, SVG or authenticated
      // source requests. CMS photos use the existing private S3 client above.
      if(!['upload.wikimedia.org','thumb.wikimedia.org'].includes(url.hostname)||!url.pathname.startsWith('/wikipedia/'))return {ok:false,holds:['image_host_requires_manual_adapter']};
      const response=await fetchImpl(url.href,{redirect:'error',signal:AbortSignal.timeout(7000),headers:{Accept:'image/png,image/jpeg,image/webp'}});
      if(!response.ok||!response.body||!/^image\/(png|jpeg|webp)(;|$)/i.test(response.headers.get('content-type')||'')||Number(response.headers.get('content-length'))>MAX_BYTES)throw Error('Image unavailable');
      bytes=await boundedBytes(response.body);
    }
    const size=dimensions(bytes),ratio=size.width/size.height;
    if(!completeImage(bytes,size.mime))return {ok:false,holds:['image_unavailable_or_invalid']};
    if(size.width<640||size.height<360||size.width*size.height>40_000_000||ratio<0.5||ratio>3) return {ok:false,holds:['image_dimensions_unsuitable'],...size};
    return {ok:true,holds:[],url:media.url,...size,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),checkedAt:new Date().toISOString()};
  } catch {return {ok:false,holds:['image_unavailable_or_invalid']};}
}
module.exports={licenseAllowed,mediaLicenseHolds,dimensions,probeMedia};
