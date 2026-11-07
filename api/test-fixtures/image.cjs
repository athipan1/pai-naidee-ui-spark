// Generated isolated test image. Never imported by the Production application.
const {deflateSync}=require('node:zlib');
function crc32(bytes) {let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function fixturePng(color=60,width=800,height=450) {
  const chunk=(name,body)=>{const type=Buffer.from(name),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(body.length);crc.writeUInt32BE(crc32(Buffer.concat([type,body])));return Buffer.concat([size,type,body,crc]);};
  const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  const raw=Buffer.alloc((width*3+1)*height,color);for(let y=0;y<height;y++)raw[y*(width*3+1)]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
module.exports={fixturePng};
