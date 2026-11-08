import { describe, expect, it } from 'vitest';
import { withPublishedPlaceImages } from '@/shared/utils/publishedPlaceImages';
const old='https://example.org/old.jpg',main='https://example.org/main.jpg';
const credit={url:old,photographer:'Owner',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.org/photo'};
describe('published photo contract',()=>{
 it('never promotes an old credited photo over an uncredited primary',()=>{
  const p=withPublishedPlaceImages({image:main,images:[main,old],mediaCredits:[credit]});
  expect(p.image).toBe('/placeholder-attraction.svg');expect(p.images[0]).toBe(p.image);
 });
 it('keeps the published selection across list and detail and never injects per-place replacements',()=>{
  for(const id of ['curated-khao-khitchakut-national-park','curated-ko-chang','tat-fixture','osm-fixture']){
   const p=withPublishedPlaceImages({id,image:main,images:[old,main],mediaCredits:[credit,{...credit,url:main}]});
   expect(p.image).toBe(main);expect(p.images[0]).toBe(main);
   expect(withPublishedPlaceImages({id,images:[]}).images).toEqual(['/placeholder-attraction.svg']);
  }
 });
});
