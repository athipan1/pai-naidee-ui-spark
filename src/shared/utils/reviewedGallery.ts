import type { AttractionPhotoCredit } from '@/shared/types/attraction';

export function reviewedGallery(images: string[], credits: AttractionPhotoCredit[] = []) {
  const byUrl=new Map(credits.map(c=>[c.url,c]));
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
