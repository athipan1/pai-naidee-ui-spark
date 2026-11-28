import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AttractionCard from "@/components/common/AttractionCard";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { uniqueAttractionsById } from "@/shared/utils/uniqueAttractions";
import type { SearchResult } from "@/shared/types/search";

const ROTATION_KEY = "painaidee.discovery.nextPage";
const PAGE_SIZE = 20;
function readPage() {
  try {
    const page = Number(sessionStorage.getItem(ROTATION_KEY));
    return Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1;
  } catch { return 1; }
}
function savePage(page: number) {
  try { sessionStorage.setItem(ROTATION_KEY, String(page)); } catch { /* optional session storage */ }
}
interface Props {
  currentLanguage: "th" | "en";
  favorites: string[];
  onFavoriteToggle: (id: string) => void;
  onBrowseAll: () => void;
}
export default function DiscoveryHighlights({ currentLanguage, favorites, onFavoriteToggle, onBrowseAll }: Props) {
  const th = currentLanguage === "th";
  const navigate = useNavigate();
  const [page, setPage] = useState(readPage);
  const [paused, setPaused] = useState(false);
  const [interaction, setInteraction] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const latest = useAttractions({ page: 1, limit: 10, sort: "latest" });
  const rotation = useAttractions({ page, limit: PAGE_SIZE, sort: "rotation" });
  const newest = uniqueAttractionsById(latest.data?.attractions ?? []);
  const newestIds = new Set(newest.map(place => place.id));
  const older = uniqueAttractionsById(rotation.data?.attractions ?? []).filter(place => !newestIds.has(place.id));
  const pages = Math.max(1, Math.ceil((rotation.data?.total ?? 0) / PAGE_SIZE));
  useEffect(() => {
    if (!rotation.data) return;
    if (page > pages) setPage(1);
    else savePage(page >= pages ? 1 : page + 1);
  }, [page, pages, rotation.data]);

  useEffect(() => {
    if (paused || interaction || newest.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const element = rail.current;
      if (!element || media.matches || document.visibilityState !== "visible") return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (element.matches(":hover") || element.contains(document.activeElement)) return;
      const first = element.firstElementChild as HTMLElement | null;
      if (!first) return;
      const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
      if (atEnd) element.scrollTo({ left: 0, behavior: "smooth" });
      else element.scrollBy({ left: first.offsetWidth + 16, behavior: "smooth" });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, interaction, newest.length]);

  const card = (place: SearchResult, priority = false) => (
    <AttractionCard key={place.id} {...place} variant="discovery" priority={priority}
      currentLanguage={currentLanguage} isFavorite={favorites.includes(place.id)}
      onFavoriteToggle={onFavoriteToggle}
      onCardClick={id => navigate("/attraction/" + encodeURIComponent(id))} />
  );
  const failure = (retry: () => void) => (
    <div role="alert" className="rounded-xl border p-4 text-sm text-muted-foreground">
      {th ? "ยังโหลดสถานที่ไม่ได้" : "Could not load places"}
      <Button variant="link" onClick={retry}>{th ? "ลองอีกครั้ง" : "Retry"}</Button>
    </div>
  );
  return (
    <div className="min-w-0 space-y-6" data-testid="discovery-highlights">
      <section className="min-w-0 space-y-3" aria-labelledby="latest-discovery-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="latest-discovery-heading" className="text-lg font-semibold">{th ? "สถานที่เพิ่มใหม่ล่าสุด" : "Recently added places"}</h2>
          {newest.length > 1 && <Button variant="outline" size="sm" className="min-h-11"
            onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            {paused ? (th ? "เล่นต่อ" : "Resume rotation") : (th ? "หยุดเลื่อน" : "Pause rotation")}
          </Button>}
        </div>
        {latest.isLoading ? <Skeleton className="h-64 rounded-xl" /> : latest.error ? failure(() => void latest.refetch()) :
          newest.length ? (
            <div ref={rail} className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              data-testid="latest-places" tabIndex={0} aria-label={th ? "สถานที่เพิ่มล่าสุด เลื่อนเพื่อดูเพิ่มเติม" : "Recently added places, scroll for more"}
              onPointerDown={() => setInteraction(true)} onPointerUp={() => setInteraction(false)}
              onPointerCancel={() => setInteraction(false)} onPointerLeave={() => setInteraction(false)}>
              {newest.map((place, index) => (
                <div key={place.id} className="w-[min(80vw,300px)] shrink-0 snap-start">{card(place, index === 0)}</div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">{th ? "ยังไม่มีสถานที่เผยแพร่" : "No published places yet"}</p>}
      </section>
      <section className="space-y-3" aria-labelledby="rotation-discovery-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="rotation-discovery-heading" className="text-lg font-semibold">{th ? "ออกไปค้นพบสถานที่ใหม่" : "Discover more places"}</h2>
          {pages > 1 && <Button variant="outline" className="min-h-11"
            disabled={rotation.isFetching} onClick={() => setPage(current => current >= pages ? 1 : current + 1)}>
            {th ? "เปลี่ยนชุดสถานที่" : "Show another set"}
          </Button>}
        </div>
        {rotation.isLoading ? <Skeleton className="h-64 rounded-xl" /> : rotation.error ? failure(() => void rotation.refetch()) :
          older.length ? <div data-testid="rotating-places" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{older.map(place => card(place))}</div>
          : <p className="text-sm text-muted-foreground">{th ? "ยังไม่มีสถานที่อื่นในชุดนี้" : "No other places in this set"}</p>}
      </section>
      <div className="flex justify-center">
        <Button variant="outline" className="min-h-11" onClick={onBrowseAll}>{th ? "ดูสถานที่ทั้งหมด" : "Browse all places"}</Button>
      </div>
    </div>
  );
}
