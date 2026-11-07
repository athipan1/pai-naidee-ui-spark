import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {describe,it,expect,vi} from 'vitest';
import PlaceCandidateReview from '@/components/admin/PlaceCandidateReview';
const draft={id:'draft-1',payload:{name:'Wat Test',nameLocal:'วัดทดสอบ',province:'ชลบุรี'}};
const report={status:'NEEDS_REVIEW',provinceGate:'NEEDS_REVIEW',coordinateKind:'unknown',holds:['province_polygon_unverified'],baselineCount:194,
  duplicate:{action:'human_review_required',matches:[]},publishAllowed:false};
describe('Candidate review safety',()=>{
  it('does not call Google automatically and keeps activation disabled',async()=>{
    const api=vi.fn().mockResolvedValueOnce(report).mockResolvedValueOnce({enabled:false,reasons:['activation_not_approved'],dailyLimit:0});
    render(<PlaceCandidateReview draft={draft} api={api}/>);
    expect(api).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'ตรวจคุณภาพแบบอ่านอย่างเดียว'}));
    await screen.findByText(/เทียบฐานข้อมูล 194/);
    expect(screen.getByRole('button',{name:'ตรวจ Google (th)'})).toBeDisabled();
    expect(api.mock.calls.map(c=>c[0])).toEqual(['/places/draft-1/quality-review','/google-verification/status']);
  });
  it('requires a deliberate click for live evidence and attributes the separate panel',async()=>{
    const api=vi.fn().mockResolvedValueOnce(report).mockResolvedValueOnce({enabled:true,reasons:[],dailyLimit:2})
      .mockResolvedValueOnce({status:'ok',results:[{placeId:'ChIJfixture',name:'Live fixture',address:'Address',types:['museum'],mapsUrl:'https://google.com/maps',attributions:[]}]});
    render(<PlaceCandidateReview draft={draft} api={api}/>);
    fireEvent.click(screen.getByRole('button',{name:'ตรวจคุณภาพแบบอ่านอย่างเดียว'}));
    await waitFor(()=>expect(screen.getByRole('button',{name:'ตรวจ Google (en)'})).toBeEnabled());
    fireEvent.click(screen.getByRole('button',{name:'ตรวจ Google (en)'}));
    await screen.findByRole('complementary',{name:'หลักฐานสด Google Maps'});
    expect(api.mock.calls[2][0]).toBe('/google-verification');
    expect(JSON.parse(api.mock.calls[2][1].body)).toEqual({name:'Wat Test',province:'ชลบุรี',language:'en'});
  });
});
