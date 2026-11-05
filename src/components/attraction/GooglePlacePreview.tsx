import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/services/railway-api.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Preview = {
  status: 'disabled'|'quota_exhausted'|'unavailable'|'no_match'|'not_found'|'ok';
  name?: string; address?: string; rating?: number|null; reviewCount?: number|null;
  openingHours?: string[]; googleMapsUrl?: string|null; photoUrl?: string|null;
  attributions?: {name:string;uri:string|null;photoUri:string|null}[];
};
export default function GooglePlacePreview({placeId,province,language}:{placeId:string;province:string;language:'th'|'en'}) {
  const [result,setResult]=useState<Preview|null>(null);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{setResult(null);setLoading(false);},[placeId]);
  if (province !== 'ชลบุรี') return null;
  const th=language==='th';
  async function load() {
    if(loading)return;
    setLoading(true);setResult(null);
    try {
      const controller=new AbortController();
      const timeout=window.setTimeout(()=>controller.abort(),12000);
      try {
        const response=await fetch(`${getApiBaseUrl()}/api/places/${encodeURIComponent(placeId)}/google-preview`,{
          headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal,
        });
        const data=await response.json() as Preview;
        setResult(response.ok?data:{status:'unavailable'});
      } finally {window.clearTimeout(timeout);}
    } catch {setResult({status:'unavailable'});}
    finally {setLoading(false);}
  }
  return <Card className="mb-5" data-testid="google-place-preview">
    <CardContent className="p-5 space-y-3">
      <h2 className="font-semibold">{th?'ข้อมูลและภาพเพิ่มเติมจาก Google Maps':'Additional Google Maps details and photo'}</h2>
      <p className="text-sm text-muted-foreground">{th?'กดเพื่อเรียกข้อมูลปัจจุบันจาก Google โดยไม่เปลี่ยนข้อมูลหลักของสถานที่':'Request current Google data without changing the local record'}</p>
      {!result && <Button disabled={loading} onClick={load} variant="outline">{loading?(th?'กำลังดึงข้อมูล...':'Loading...'):(th?'ดูข้อมูล Google':'Show Google details')}</Button>}
      {result?.status==='ok' && <div className="space-y-3">
        {result.photoUrl && <figure>
          <img src={result.photoUrl} alt={result.name||''} loading="lazy" referrerPolicy="no-referrer" className="w-full max-h-80 rounded-lg object-cover" />
          <figcaption className="text-xs text-muted-foreground mt-1">
            {th?'ภาพจาก Google Maps':'Photo from Google Maps'}
            {result.attributions?.map((person,index)=><span key={index}> · {person.uri?<a className="underline" href={person.uri} target="_blank" rel="noopener noreferrer">{person.name}</a>:person.name}</span>)}
          </figcaption>
        </figure>}
        {result.name && <p className="font-semibold">{result.name}</p>}
        {result.address && <p className="text-sm">{result.address}</p>}
        {typeof result.rating==='number' && <p className="text-sm">Google: ★ {result.rating} {typeof result.reviewCount==='number'?`(${result.reviewCount} ${th?'รีวิว':'reviews'})`:''}</p>}
        {!!result.openingHours?.length && <div className="text-sm"><p className="font-medium">{th?'เวลาเปิดทำการจาก Google':'Google opening hours'}</p>{result.openingHours.map((line,i)=><p key={i}>{line}</p>)}</div>}
        {result.googleMapsUrl && <a className="underline text-sm" href={result.googleMapsUrl} target="_blank" rel="noopener noreferrer">{th?'ดูข้อมูลต้นทางบน Google Maps':'View on Google Maps'}</a>}
        <p className="text-xs text-muted-foreground">{th?'ข้อมูลและภาพเป็นของ Google Maps และผู้ให้ข้อมูล ไม่ใช่รีวิวของ PaiNaiDee':'Google Maps content is separate from PaiNaiDee reviews'}</p>
      </div>}
      {result && result.status!=='ok' && <p className="text-sm text-muted-foreground">{th?'ข้อมูล Google ยังไม่พร้อมใช้งานหรือใช้โควตาครบแล้ว โปรดใช้ข้อมูลสถานที่ที่แสดงอยู่ด้านบน':'Google data is unavailable or quota is exhausted. The local details remain available.'}</p>}
    </CardContent>
  </Card>;
}
