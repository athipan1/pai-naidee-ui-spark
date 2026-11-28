import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AttractionCard from "@/components/common/AttractionCard";
import { getDiscoveryIndex, getDiscoveryBatch, type DiscoveryEntry } from "@/services/railway-api.service";
import { uniqueAttractionsById } from "@/shared/utils/uniqueAttractions";
import { RateLimitError } from "@/shared/utils/retryAfter";
import { isNewPlace, rankDiscovery, readPreferences, recordInterest, setPersonalization } from "./discoveryPreferences";

const PAGE_SIZE = 20;
// Ephemeral presentation history only, not a profile or analytics identifier.
const recentShown = new Set<string>();
const remember = (ids: string[]) => {
  for (const id of ids) { recentShown.delete(id); recentShown.add(id); }
  while (recentShown.size > 80) recentShown.delete(recentShown.values().next().value!);
};
interface Props {
  currentLanguage: "th" | "en";
  favorites: string[];
  onFavoriteToggle: (id: string) => void;
  onBrowseAll: () => void;
}
function DiscoveryFeed({ entries, currentLanguage, favorites, onFavoriteToggle }: Props & { entries: DiscoveryEntry[] }) {
  const th = currentLanguage === "th";
  const navigate = useNavigate();
  const [now] = useState(Date.now);
  const [plan] = useState(() => rankDiscovery(entries, readPreferences(), recentShown, now));
  const [session] = useState(() => Math.random().toString(36).slice(2));
  const [profile, setProfile] = useState(readPreferences);
  const sentinel = useRef<HTMLDivElement>(null);
  const batch = useInfiniteQuery({
    queryKey: ["attractions", "discovery-feed", session],
    queryFn: ({ pageParam, signal }) => getDiscoveryBatch(plan.slice(pageParam, pageParam+PAGE_SIZE).map(x=>x.id), signal),
    initialPageParam: 0,
    getNextPageParam: (_last, _pages, offset) => offset+PAGE_SIZE < plan.length ? offset+PAGE_SIZE : undefined,
    enabled: plan.length>0,
    gcTime: 0, staleTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false,
    retry: (count, error) => !(error instanceof RateLimitError) && count < 1,
  });
  const places = uniqueAttractionsById(batch.data?.pages.flat() ?? []);
  const freshIds = new Set(plan.filter(x=>isNewPlace(x,now)).map(x=>x.id));
  const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError, isError } = batch;
  useEffect(() => {
    if (batch.data) remember((batch.data.pages[batch.data.pages.length-1] ?? []).map(x=>x.id));
  }, [batch.data]);
  useEffect(() => {
    const target=sentinel.current;
    if (!target || !hasNextPage || isFetching || isError || typeof IntersectionObserver==="undefined") return;
    const observer=new IntersectionObserver(items=>{
      if(items.some(item=>item.isIntersecting) && document.visibilityState==="visible") void fetchNextPage({ cancelRefetch: false });
    }, {rootMargin:"160px"});
    observer.observe(target);
    return ()=>observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isError]);
  return <>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <label className="flex min-h-11 items-center gap-2">
        <input type="checkbox" className="h-5 w-5 accent-primary" checked={profile.enabled}
          onChange={e=>setProfile(setPersonalization(e.target.checked))} />
        {th ? "แนะนำตามความสนใจของฉัน" : "Personalize my recommendations"}
      </label>
      {profile.enabled && <Button variant="ghost" size="sm" onClick={()=>setProfile(setPersonalization(true))}>{th?"รีเซ็ตความสนใจ":"Reset interests"}</Button>}
    </div>
    <p className="text-xs text-muted-foreground">{th ? "เปิดเพื่อใช้หมวดหมู่และจังหวัดที่คุณสนใจ เก็บเฉพาะในเบราว์เซอร์นี้ การตั้งค่ามีผลเมื่อกลับมาหน้าสำรวจอีกครั้ง" : "Opt in to use category and province interests stored only in this browser. Changes apply on the next visit."}</p>
    {batch.isLoading && <Skeleton className="h-64 rounded-xl" />}
    <div data-testid="discovery-grid" className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {places.map((place,index)=><AttractionCard key={place.id} {...place} variant="discovery-compact"
        isNew={freshIds.has(place.id)} priority={index===0} currentLanguage={currentLanguage}
        isFavorite={favorites.includes(place.id)}
        onFavoriteToggle={id=>{recordInterest(place,favorites.includes(id)?-4:4);onFavoriteToggle(id);}}
        onCardClick={id=>{recordInterest(place,2);navigate("/attraction/"+encodeURIComponent(id));}} />)}
    </div>
    {isError && <div role="alert" className="rounded-xl border p-3 text-sm">
      {th?"โหลดสถานที่ไม่สำเร็จ":"Could not load places"}
      <Button variant="link" onClick={()=>void (isFetchNextPageError?fetchNextPage({cancelRefetch:false}):batch.refetch())}>{th?"ลองอีกครั้ง":"Retry"}</Button>
    </div>}
    {!batch.isLoading && !isError && !places.length && !hasNextPage && <p>{th?"ยังไม่มีสถานที่เผยแพร่":"No published places yet"}</p>}
    {hasNextPage && <div ref={sentinel} data-testid="discovery-sentinel" className="min-h-12 text-center text-sm text-muted-foreground" role="status">
      {isFetching ? (th?"กำลังโหลดสถานที่เพิ่มเติม…":"Loading more places…") : (th?"เลื่อนลงเพื่อดูสถานที่เพิ่มเติม":"Scroll for more places")}
      {typeof IntersectionObserver==="undefined" && !isFetching && <Button variant="link" onClick={()=>void fetchNextPage({cancelRefetch:false})}>{th?"โหลดเพิ่มเติม":"Load more"}</Button>}
    </div>}
    {!hasNextPage && places.length>0 && !isError && <p className="text-center text-sm text-muted-foreground">{th?"ดูครบทุกสถานที่ในชุดนี้แล้ว":"You have reached the end of this set"}</p>}
  </>;
}
export default function DiscoveryHighlights(props: Props) {
  const th=props.currentLanguage==="th";
  const index=useQuery({
    queryKey:["attractions","discovery-index"],
    queryFn:({signal})=>getDiscoveryIndex(signal),
    staleTime:0, refetchOnMount:"always", refetchOnWindowFocus:false, refetchOnReconnect:false,
    retry:(count,error)=>!(error instanceof RateLimitError)&&count<1,
  });
  // Freeze the index for this visit. Publication changes are picked up on the next visit.
  const [snapshot,setSnapshot]=useState<DiscoveryEntry[]|null>(null);
  useEffect(()=>{
    if(!snapshot && index.data && !index.isFetching && !index.isError)setSnapshot(index.data);
  },[snapshot,index.data,index.isFetching,index.isError]);
  return <section data-testid="discovery-highlights" className="min-w-0 space-y-3" aria-labelledby="discovery-heading">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="discovery-heading" className="text-lg font-semibold">{th?"ออกไปค้นพบสถานที่ใหม่":"Discover more places"}</h2>
      <Button variant="outline" size="sm" className="min-h-11" onClick={props.onBrowseAll}>{th?"ดูสถานที่ทั้งหมด":"Browse all places"}</Button>
    </div>
    {snapshot ? <DiscoveryFeed {...props} entries={snapshot}/> : index.isError ?
      <div role="alert">{th?"ยังโหลดคำแนะนำไม่ได้":"Recommendations unavailable"} <Button variant="link" onClick={()=>void index.refetch()}>{th?"ลองอีกครั้ง":"Retry"}</Button></div> :
      <Skeleton className="h-64 rounded-xl"/>}
  </section>;
}
