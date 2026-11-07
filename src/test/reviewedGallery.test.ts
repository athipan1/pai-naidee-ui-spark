import {describe,it,expect} from 'vitest';
import {reviewedGallery} from '@/shared/utils/reviewedGallery';
const credit={url:'https://upload.wikimedia.org/a.jpg',photographer:'Photographer',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://commons.wikimedia.org/wiki/File:A.jpg'};
describe('reviewed gallery',()=>{
  it('keeps attributed photos once and excludes unreviewed Wikipedia thumbnail URLs',()=>{
    expect(reviewedGallery([credit.url,credit.url,'https://upload.wikimedia.org/unreviewed.jpg'],[credit])).toEqual([credit.url]);
  });
  it('keeps an explicit placeholder and rejects Google content or invalid protocols even with claimed credits',()=>{
    expect(reviewedGallery(['/placeholder-attraction.svg','javascript:alert(1)','https://lh3.googleusercontent.com/x'],[credit])).toEqual(['/placeholder-attraction.svg']);
  });
  it('blocks unsafe attribution links and missing photographer credit',()=>{
    expect(reviewedGallery([credit.url],[{...credit,licenseUrl:'javascript:alert(1)'}])).toEqual([]);
    expect(reviewedGallery([credit.url],[{...credit,photographer:''}])).toEqual([]);
  });
});
