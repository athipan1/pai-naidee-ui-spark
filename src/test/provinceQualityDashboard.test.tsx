import {describe,expect,it,vi} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProvinceQualityDashboard from '@/components/admin/ProvinceQualityDashboard';

describe('Admin Google Places discovery province selector',()=>{
 it('enables manual search for Rayong and creates a name-only draft in that province',async()=>{
  const api=vi.fn(async(path:string,options?:RequestInit):Promise<unknown>=>{
   if(path.startsWith('/candidate-queue'))return {candidates:[],total:0};
   if(path==='/google-place-discovery/search')return {
    status:'ok',excludedOutsideProvince:1,
    candidates:[{sourceId:'google:ChIJRayongReference1234',name:'สถานที่ตัวอย่างจาก Google',province:'ระยอง',lat:12.7,lng:101.3,duplicateStatus:'not_detected'}],
   };
   if(path==='/places/google-reference')return {id:'draft-rayong',existing:false,draft:{id:'draft-rayong',status:'draft',version:'1.000001',payload:{name:'Laem Charoen Beach',nameLocal:'หาดแหลมเจริญ',province:'ระยอง',category:'',description:'',lat:null,lng:null}},autoFillStatus:'matched'};
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
  await user.click(screen.getByRole('button',{name:'สร้างฉบับร่างและเติมชื่อ'}));
  await waitFor(()=>expect(api.mock.calls.some(([path])=>path==='/places/google-reference')).toBe(true));
  const created=api.mock.calls.find(([path])=>path==='/places/google-reference');
  expect(JSON.parse(String(created?.[1]?.body))).toEqual({placeId:'ChIJRayongReference1234',province:'ระยอง',candidateName:'สถานที่ตัวอย่างจาก Google'});
  expect(onDraftCreated).toHaveBeenCalledWith(expect.objectContaining({id:'draft-rayong',payload:expect.objectContaining({province:'ระยอง',nameLocal:'หาดแหลมเจริญ'})}),'matched','สถานที่ตัวอย่างจาก Google',undefined);
 });
 it('falls back to Geoapify after Google HTTP 429 and requires a second confirmation before draft creation',async()=>{
  const api=vi.fn(async(path:string,options?:RequestInit):Promise<unknown>=>{
   if(path.startsWith('/candidate-queue'))return {candidates:[],total:0};
   if(path==='/google-place-discovery/search')throw Error('HTTP 429');
   if(path==='/geoapify-place-discovery/search')return {status:'ok',candidates:[{
     source:'geoapify',sourceId:'geoapify:fixture-geoapify-place-id',
     candidateToken:'signed-fixture-token',name:'Rayong Beach',nameLocal:'หาดระยอง',
     province:'ระยอง',lat:12.65,lng:101.25,duplicateStatus:'not_detected',
   }]};
   if(path==='/places/geoapify-reference')return {id:'geo-draft',existing:false,
     draft:{id:'geo-draft',status:'draft',version:'1.000001',
       payload:{name:'Rayong Beach',nameLocal:'หาดระยอง',province:'ระยอง',lat:null,lng:null}},
     autoFillStatus:'geoapify_matched',geoapifySuggestion:{
       source:'Geoapify',lat:12.65,lng:101.25,label:'หาดระยอง'
     }};
   throw Error('Unexpected request '+path+' '+JSON.stringify(options));
  });
  const user=userEvent.setup(),onDraftCreated=vi.fn();
  render(<ProvinceQualityDashboard api={api} onOpenCandidate={()=>{}} onDraftCreated={onDraftCreated}/>);
  await user.selectOptions(screen.getByLabelText('จังหวัด'),'ระยอง');
  await user.click(screen.getByRole('button',{name:'ค้นหาสถานที่ท่องเที่ยวใหม่'}));
  await screen.findByText('Rayong Beach');
  expect(screen.getByText(/Google Places ใช้โควตาประจำวันครบแล้ว/)).toBeInTheDocument();
  expect(api.mock.calls.filter(([p])=>p==='/geoapify-place-discovery/search')).toHaveLength(1);
  expect(api.mock.calls.filter(([p])=>p==='/places/geoapify-reference')).toHaveLength(0);
  await user.click(screen.getByRole('button',{name:'ตรวจสอบก่อนสร้างฉบับร่าง'}));
  expect(screen.getByRole('group',{name:'ยืนยันข้อมูลก่อนสร้างฉบับร่าง'})).toHaveTextContent('ระยอง');
  expect(api.mock.calls.filter(([p])=>p==='/places/geoapify-reference')).toHaveLength(0);
  await user.click(screen.getByRole('button',{name:'ยืนยันสร้างฉบับร่าง'}));
  await waitFor(()=>expect(onDraftCreated).toHaveBeenCalledTimes(1));
  const request=api.mock.calls.find(([p])=>p==='/places/geoapify-reference');
  expect(JSON.parse(String(request?.[1]?.body))).toEqual({candidateToken:'signed-fixture-token',province:'ระยอง'});
  expect(onDraftCreated).toHaveBeenCalledWith(expect.objectContaining({
    payload:expect.objectContaining({lat:null,lng:null,province:'ระยอง'})
  }),'geoapify_matched','Rayong Beach',expect.objectContaining({lat:12.65,lng:101.25}));
 });
 it('shows suspected Geoapify duplicates and blocks draft creation',async()=>{
  const api=vi.fn(async(path:string):Promise<unknown>=>{
   if(path.startsWith('/candidate-queue'))return {candidates:[],total:0};
   if(path==='/geoapify-place-discovery/search')return {status:'ok',candidates:[{
    source:'geoapify',sourceId:'geoapify:duplicate1234567890123',name:'Duplicate Rayong',
    province:'ระยอง',lat:12.65,lng:101.25,candidateToken:'signed',
    duplicateStatus:'possible_duplicate',duplicateMatches:[{placeId:'known',name:'Known Place',reason:'name',distanceMeters:80}],
   }]};
   throw Error('Unexpected request '+path);
  });
  const user=userEvent.setup();
  render(<ProvinceQualityDashboard api={api} onOpenCandidate={()=>{}}/>);
  await user.selectOptions(screen.getByLabelText('จังหวัด'),'ระยอง');
  await user.click(screen.getByRole('button',{name:'ค้นหาด้วย Geoapify'}));
  expect(await screen.findByText('Duplicate Rayong')).toBeVisible();
  expect(screen.getByRole('button',{name:'ตรวจสอบก่อนสร้างฉบับร่าง'})).toBeDisabled();
  expect(api.mock.calls.some(([p])=>p==='/places/geoapify-reference')).toBe(false);
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
