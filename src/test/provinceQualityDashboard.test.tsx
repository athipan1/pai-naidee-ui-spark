import {describe,expect,it,vi} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProvinceQualityDashboard from '@/components/admin/ProvinceQualityDashboard';

describe('Admin Google Places discovery province selector',()=>{
 it('enables manual search for Rayong and creates an ID-only draft in that province',async()=>{
  const api=vi.fn(async(path:string,options?:RequestInit):Promise<unknown>=>{
   if(path.startsWith('/candidate-queue'))return {candidates:[],total:0};
   if(path==='/google-place-discovery/search')return {
    status:'ok',excludedOutsideProvince:1,
    candidates:[{sourceId:'google:ChIJRayongReference1234',name:'สถานที่ตัวอย่างจาก Google',province:'ระยอง',lat:12.7,lng:101.3,duplicateStatus:'not_detected'}],
   };
   if(path==='/places/google-reference')return {id:'draft-rayong',existing:false,draft:{id:'draft-rayong',status:'draft',version:'1.000001',payload:{name:'Laem Charoen Beach',nameLocal:'หาดแหลมเจริญ',province:'ระยอง',category:'Beach',description:'Independent TAT record',lat:12.65,lng:101.27}},autoFillStatus:'matched'};
   if(path==='/province-quality')return {provinces:[]};
   throw Error('Unexpected request: '+path+' '+JSON.stringify(options));
  });
  const user=userEvent.setup();
  const onDraftCreated=vi.fn();
  render(<ProvinceQualityDashboard api={api} onOpenCandidate={()=>{}} onDraftCreated={onDraftCreated} />);
  const select=screen.getByLabelText('จังหวัด');
  expect(select.querySelectorAll('option')).toHaveLength(77);
  await user.selectOptions(select,'ระยอง');
  const search=screen.getByRole('button',{name:'ค้นหาสถานที่ท่องเที่ยวใหม่'});
  await waitFor(()=>expect(search).toBeEnabled());
  await user.click(search);
  await screen.findByText('สถานที่ตัวอย่างจาก Google');
  const request=api.mock.calls.find(([path])=>path==='/google-place-discovery/search');
  expect(request).toBeDefined();
  expect(JSON.parse(String(request?.[1]?.body))).toEqual({province:'ระยอง',sources:['google'],limit:10});
  expect(screen.getByRole('status')).toHaveTextContent('กรอง 1 รายการ');
  await user.click(screen.getByRole('button',{name:'สร้างฉบับร่างและเติมข้อมูล'}));
  await waitFor(()=>expect(api.mock.calls.some(([path])=>path==='/places/google-reference')).toBe(true));
  const created=api.mock.calls.find(([path])=>path==='/places/google-reference');
  expect(JSON.parse(String(created?.[1]?.body))).toEqual({placeId:'ChIJRayongReference1234',province:'ระยอง',candidateName:'สถานที่ตัวอย่างจาก Google'});
  expect(onDraftCreated).toHaveBeenCalledWith(expect.objectContaining({id:'draft-rayong',payload:expect.objectContaining({province:'ระยอง',nameLocal:'หาดแหลมเจริญ'})}),'matched');
 });
 it('clears results from previous province after the selection changes',async()=>{
  const api=vi.fn(async(path:string,options?:RequestInit):Promise<unknown>=>{
   if(path.startsWith('/candidate-queue'))return {candidates:[],total:0};
   if(path==='/google-place-discovery/search')return {
    candidates:[{sourceId:'google:ChIJRayongReference1234',name:'ผลของระยอง',province:'ระยอง',lat:12.7,lng:101.3,duplicateStatus:'not_detected'}],
   };
   throw Error('Unexpected request: '+path+' '+JSON.stringify(options));
  });
  const user=userEvent.setup();
  render(<ProvinceQualityDashboard api={api} onOpenCandidate={()=>{}} />);
  await user.selectOptions(screen.getByLabelText('จังหวัด'),'ระยอง');
  await waitFor(()=>expect(screen.getByRole('button',{name:'ค้นหาสถานที่ท่องเที่ยวใหม่'})).toBeEnabled());
  await user.click(screen.getByRole('button',{name:'ค้นหาสถานที่ท่องเที่ยวใหม่'}));
  await screen.findByText('ผลของระยอง');
  await user.selectOptions(screen.getByLabelText('จังหวัด'),'เชียงใหม่');
  await waitFor(()=>expect(screen.queryByText('ผลของระยอง')).not.toBeInTheDocument());
  expect(screen.getByRole('button',{name:'ค้นหาสถานที่ท่องเที่ยวใหม่'})).toBeEnabled();
 });
});
