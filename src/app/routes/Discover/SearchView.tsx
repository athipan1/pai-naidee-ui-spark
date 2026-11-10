import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  SlidersHorizontal,
  Map,
  Grid3X3,
  List,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AttractionCard from "@/components/common/AttractionCard";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import {
  getRailwayPlaceFacets,
  getRailwayPlaceSuggestions,
} from "@/services/railway-api.service";
import { localizedCategory } from "@/shared/i18n/placeLocalization";
import { uniqueAttractionsById } from "@/shared/utils/uniqueAttractions";
const ResultsMap = lazy(() => import("./ResultsMap"));

interface SearchViewProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string) => void;
  query: string;
  category?: string;
  province?: string;
  onFiltersChange?: (filters: { category: string; province: string }) => void;
}

const FAVORITES_KEY = "painaidee.discovery.favorites";
function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(FAVORITES_KEY) || "[]"
    );
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export default function SearchView({
  currentLanguage,
  onSearch,
  query,
  category = "",
  province = "",
  onFiltersChange,
}: SearchViewProps) {
  const th = currentLanguage === "th";
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Math.max(
    1,
    Math.min(100000, Math.floor(Number(params.get("page"))) || 1)
  );
  const view =
    params.get("view") === "map"
      ? "map"
      : params.get("view") === "list"
        ? "list"
        : "grid";
  const [draft, setDraft] = useState(query);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState(readFavorites);
  useEffect(() => {
    setDraft(query);
  }, [query]);
  const pageSize = 20;
  const { data, error, isLoading, refetch } = useAttractions({
    page,
    limit: pageSize,
    search: query || undefined,
    category: category || undefined,
    province: province || undefined,
  });
  const facets = useQuery({
    queryKey: ["places", "facets"],
    queryFn: getRailwayPlaceFacets,
    staleTime: 5 * 60_000,
  });
  const categories = facets.data?.categories ?? [];
  const provinces = facets.data?.provinces ?? [];
  const nearbyMatches = useQuery({
    queryKey: ["places", "search-alternatives", query],
    queryFn: () => getRailwayPlaceSuggestions(query),
    enabled:
      !isLoading &&
      !error &&
      (data?.total ?? 0) === 0 &&
      query.trim().length >= 2,
    staleTime: 30_000,
    retry: 1,
  });
  const suggestions = (nearbyMatches.data ?? []).filter(
    (place) =>
      (!province || province === place.province) &&
      (!category || category === place.category)
  );
  const results = useMemo(() => uniqueAttractionsById(data?.attractions ?? []), [data?.attractions]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (!data || isLoading || page <= totalPages) return;
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('page', String(totalPages));
      return next;
    }, { replace: true });
  }, [data, isLoading, page, totalPages, setParams]);
  const updateParam = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(name, value);
    setParams(next);
  };
  const clearAll = () => {
    const next = new URLSearchParams(params);
    ["q", "cat", "category", "prov", "page"].forEach((key) => next.delete(key));
    next.set("mode", "search");
    setDraft("");
    setParams(next);
  };
  const toggleFavorite = (id: string) =>
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      try {
        sessionStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        /* Browsing still works with storage disabled. */
      }
      return next;
    });

  const cards = results.map((attraction, index) => (
              <AttractionCard
                key={attraction.id}
                {...attraction}
                variant="discovery"
                priority={index === 0}
                currentLanguage={currentLanguage}
                isFavorite={favorites.includes(attraction.id)}
                onFavoriteToggle={toggleFavorite}
                onCardClick={(id) =>
                  navigate(`/attraction/${encodeURIComponent(id)}`)
                }
              />
            ));

  return (
    <div className="space-y-5 px-4 pb-4 sm:px-6 lg:px-8">
      <section
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5"
        aria-label={th ? "ค้นหาและกรองสถานที่" : "Search and filter places"}
      >
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(draft.trim());
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label={th ? "ค้นหาสถานที่" : "Search places"}
              placeholder={
                th ? "ชื่อสถานที่ หรือจังหวัด" : "Place name or province"
              }
              maxLength={120}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-12 rounded-xl pl-10 pr-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {draft && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-12 w-11"
                aria-label={th ? "ล้างคำค้นหา" : "Clear search"}
                onClick={() => {
                  setDraft("");
                  onSearch("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit" className="h-12 rounded-xl px-4 sm:px-6">
            {th ? "ค้นหา" : "Search"}
          </Button>
        </form>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={th ? "หมวดหมู่สถานที่" : "Place categories"}
        >
          <Button
            variant={!category ? "default" : "outline"}
            className="min-h-11 rounded-full"
            aria-pressed={!category}
            onClick={() => onFiltersChange?.({ category: "", province })}
          >
            {th ? "ทั้งหมด" : "All"}
          </Button>
          {categories.map((name) => (
            <Button
              key={name}
              variant={category === name ? "default" : "outline"}
              className="min-h-11 rounded-full"
              aria-pressed={category === name}
              onClick={() => onFiltersChange?.({ category: name, province })}
            >
              {localizedCategory(name, currentLanguage)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            aria-expanded={filtersOpen}
            aria-controls="explore-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {th ? "ตัวกรอง" : "Filters"}
            {(category || province) && (
              <span className="rounded-full bg-primary/10 px-2 text-primary">
                {Number(!!category) + Number(!!province)}
              </span>
            )}
          </Button>
          {(query || category || province) && (
            <Button
              variant="ghost"
              className="min-h-11 gap-2 text-muted-foreground"
              onClick={clearAll}
            >
              <RotateCcw className="h-4 w-4" />
              {th ? "ล้างทั้งหมด" : "Reset all"}
            </Button>
          )}
        </div>
        <div
          id="explore-filters"
          className={`${filtersOpen ? "grid" : "hidden"} gap-3 sm:grid-cols-2`}
        >
          <label className="min-w-0 space-y-1 text-sm font-medium">
            <span>{th ? "จังหวัด" : "Province"}</span>
            <select
              aria-label={th ? "กรองจังหวัด" : "Filter province"}
              value={province}
              onChange={(event) =>
                onFiltersChange?.({ category, province: event.target.value })
              }
              className="h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3"
            >
              <option value="">{th ? "ทุกจังหวัด" : "All provinces"}</option>
              {province && !provinces.includes(province) && (
                <option value={province}>{province}</option>
              )}
              {provinces.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 space-y-1 text-sm font-medium">
            <span>{th ? "ประเภทสถานที่" : "Place type"}</span>
            <select
              aria-label={th ? "กรองประเภทสถานที่" : "Filter place type"}
              value={category}
              onChange={(event) =>
                onFiltersChange?.({ category: event.target.value, province })
              }
              className="h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3"
            >
              <option value="">{th ? "ทุกประเภท" : "All types"}</option>
              {category && !categories.includes(category) && (
                <option value={category}>
                  {localizedCategory(category, currentLanguage)}
                </option>
              )}
              {categories.map((name) => (
                <option key={name} value={name}>
                  {localizedCategory(name, currentLanguage)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {facets.isError && (
          <div className="text-sm text-destructive" role="alert">
            {th
              ? "โหลดตัวเลือกตัวกรองไม่สำเร็จ"
              : "Could not load filter options."}
            <Button variant="link" onClick={() => facets.refetch()}>
              {th ? "ลองอีกครั้ง" : "Retry filters"}
            </Button>
          </div>
        )}
      </section>
      {(query || category || province) && (
        <div
          className="flex flex-wrap gap-2 text-sm"
          aria-label={th ? "ตัวกรองที่เลือก" : "Active filters"}
        >
          {query && (
            <span className="max-w-full break-words rounded-lg border bg-card px-3 py-2">
              “{query}”
            </span>
          )}
          {province && (
            <span className="rounded-lg border bg-card px-3 py-2">
              {province}
            </span>
          )}
          {category && (
            <span className="rounded-lg border bg-card px-3 py-2">
              {localizedCategory(category, currentLanguage)}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold" aria-live="polite">
            {isLoading
              ? th
                ? "กำลังค้นหา…"
                : "Searching…"
              : error
                ? th
                  ? "โหลดสถานที่ไม่สำเร็จ"
                  : "Unable to load places"
                : th
                  ? `พบ ${total.toLocaleString("th-TH")} สถานที่`
                  : `${total.toLocaleString("en-US")} places found`}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {th ? "เรียงตามลำดับของแหล่งข้อมูล" : "In catalogue order"}
          </p>
        </div>
        <div
          className="flex rounded-xl border border-border bg-card p-1"
          role="group"
          aria-label={th ? "รูปแบบการแสดงผล" : "View mode"}
        >
          {(
            [
              { value: "grid", icon: Grid3X3, th: "ตาราง", en: "Grid view" },
              { value: "list", icon: List, th: "รายการ", en: "List view" },
              { value: "map", icon: Map, th: "แผนที่", en: "Map view" },
            ] as const
          ).map((item) => (
            <Button
              key={item.value}
              variant={view === item.value ? "default" : "ghost"}
              className="h-11 gap-2 rounded-lg px-3"
              aria-label={th ? `มุมมอง${item.th}` : item.en}
              aria-pressed={view === item.value}
              onClick={() => updateParam("view", item.value)}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {th ? item.th : item.en.replace(" view", "")}
              </span>
            </Button>
          ))}
        </div>
      </div>
      <div aria-busy={isLoading}>
        {isLoading ? (
          <div role="status">
            <span className="sr-only">
              {th ? "กำลังโหลดสถานที่" : "Loading places"}
            </span>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-96 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-2xl border bg-card p-8 text-center"
          >
            <h3 className="text-lg font-semibold">
              {th ? "ยังโหลดสถานที่ไม่ได้" : "Could not load places"}
            </h3>
            <p className="my-3 text-muted-foreground">
              {th
                ? "ตรวจสอบการเชื่อมต่อ แล้วลองอีกครั้ง"
                : "Check your connection and try again."}
            </p>
            <Button onClick={() => refetch()}>
              {th ? "ลองอีกครั้ง" : "Retry"}
            </Button>
          </section>
        ) : results.length === 0 ? (
          <section className="rounded-2xl border border-dashed bg-card px-4 py-12 text-center">
            <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {th ? "ไม่พบผลการค้นหา" : "No results found"}
            </h3>
            <p className="my-3 text-muted-foreground">
              {th
                ? "ลองเปลี่ยนคำค้นหา จังหวัด หรือประเภทสถานที่"
                : "Try another name, province, or place type."}
            </p>
            <Button variant="outline" onClick={clearAll}>
              {th ? "ล้างทั้งหมด" : "Reset all"}
            </Button>
            {nearbyMatches.isLoading && (
              <p role="status">
                {th ? "กำลังค้นหาชื่อใกล้เคียง…" : "Looking for similar names…"}
              </p>
            )}
            {!!suggestions.length && (
              <div className="mx-auto mt-5 max-w-lg space-y-2 text-left">
                <h4 className="font-medium">
                  {th ? "ชื่อสถานที่ใกล้เคียง" : "Similar place names"}
                </h4>
                {suggestions.map((place) => (
                  <Button
                    key={place.id}
                    variant="outline"
                    className="h-auto min-h-11 w-full justify-start whitespace-normal text-left"
                    onClick={() =>
                      navigate(`/attraction/${encodeURIComponent(place.id)}`)
                    }
                  >
                    {th ? place.nameLocal || place.name : place.name} ·{" "}
                    {place.province}
                  </Button>
                ))}
              </div>
            )}
          </section>
        ) : view === "map" ? (
          <section className="space-y-3">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {th
                ? "แผนที่แสดงสถานที่ในหน้านี้เท่านั้น สถานที่ที่ไม่มีพิกัดดูได้ในรายการ"
                : "The map shows this result page only. Places without coordinates remain in the list."}
            </p>
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <section className="hidden max-h-[min(65svh,600px)] grid-cols-1 gap-4 overflow-y-auto rounded-2xl p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:grid xl:grid-cols-2" tabIndex={0} aria-label={th ? 'รายการสถานที่บนแผนที่' : 'Places on this map'}>
                {cards}
              </section>
              <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
                <ResultsMap places={results} currentLanguage={currentLanguage} />
              </Suspense>
            </div>
          </section>
        ) : (
          <section
            aria-label={
              th
                ? `ผลการค้นหา ${results.length} รายการ`
                : `Search results ${results.length} items`
            }
            className={`grid gap-5 ${view === "list" ? "mx-auto max-w-2xl grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
          >
            {cards}
          </section>
        )}
      </div>
      {totalPages > 1 && !error && (
        <nav
          aria-label={th ? "หน้าผลการค้นหา" : "Search result pages"}
          className="flex flex-wrap items-center justify-center gap-3 py-4"
        >
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page <= 1 || isLoading}
            onClick={() => updateParam("page", String(page - 1))}
          >
            {th ? "ก่อนหน้า" : "Previous"}
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {th
              ? `หน้า ${page} จาก ${totalPages}`
              : `Page ${page} of ${totalPages}`}
          </span>
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page >= totalPages || isLoading}
            onClick={() => updateParam("page", String(page + 1))}
          >
            {th ? "ถัดไป" : "Next"}
          </Button>
        </nav>
      )}
    </div>
  );
}
