import type { AttractionPhotoCredit } from '@/shared/types/attraction';
const httpsLink=(value:string)=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function reviewedPhotoCredits(credits:AttractionPhotoCredit[]=[]){
  const seen=new Set<string>();
  return credits.filter(credit=>{
    if(seen.has(credit.url)||!credit.photographer||!credit.licenseName||
      (credit.kind!=='user-provided'&&(!httpsLink(credit.sourcePage)||!httpsLink(credit.licenseUrl))))return false;
    seen.add(credit.url);return true;
  });
}

export function reviewedGallery(images: string[], credits: AttractionPhotoCredit[] = []) {
  const byUrl=new Map(reviewedPhotoCredits(credits).map(c=>[c.url,c]));
  const seen=new Set<string>();
  return images.filter(url=>{
    if(seen.has(url))return false;
    seen.add(url);
    if(url==='/placeholder-attraction.svg')return true;
    try {
      const u=new URL(url),credit=byUrl.get(url);
      if(u.protocol!=='https:'||u.username||u.password||/(^|\.)(googleusercontent\.com|googleapis\.com|ggpht\.com|gstatic\.com)$/.test(u.hostname))return false;
      return Boolean(credit?.photographer && (credit.kind==='user-provided'||(credit.sourcePage&&credit.licenseName&&credit.licenseUrl)));
    } catch{return false;}
  });
}
