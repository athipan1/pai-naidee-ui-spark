import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Globe,
  Heart,
  Map,
  MapPin,
  Navigation,
  RefreshCw,
  Share2,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageGallery from "@/components/attraction/ImageGallery";
import GooglePlacePreview from "@/components/attraction/GooglePlacePreview";
import NearbyRealPlaces from "@/components/attraction/NearbyRealPlaces";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { useAttractionDetail } from "@/shared/hooks/useAttractionQueries";
import {
  localizedProvince,
  localizedDescription,
  localizedCategory,
  localizedTag,
} from "@/shared/i18n/placeLocalization";
import {
  reviewedGallery,
  reviewedPhotoCredits,
} from "@/shared/utils/reviewedGallery";
import { STORAGE_KEYS } from "@/shared/utils/constants";
import {
  validPlaceCoordinates,
  placeNavigationUrl,
  readSavedPlaceIds,
} from "@/shared/utils/placeDetail";

const MapModal = lazy(() => import("@/components/attraction/MapModal"));
interface AttractionDetailProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (language: "th" | "en") => void;
  onBack: () => void;
}

export default function AttractionDetail({
  currentLanguage,
  onLanguageChange,
  onBack,
}: AttractionDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const th = currentLanguage === "th";
  const {
    data: attraction,
    isLoading,
    error,
    refetch,
  } = useAttractionDetail(id);
  const [savedIds, setSavedIds] = useState<string[]>(readSavedPlaceIds);
  const [showMap, setShowMap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    setExpanded(false);
    setShowMap(false);
    setNotice("");
    setShareLink("");
  }, [id]);
  useEffect(() => {
    const sync = () => setSavedIds(readSavedPlaceIds());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const saved = !!id && savedIds.includes(id);
  const saveLabel = saved
    ? th
      ? "ยกเลิกบันทึก"
      : "Unsave"
    : th
      ? "บันทึก"
      : "Save";
  const toggleSaved = () => {
    if (!id) return;
    try {
      const latest = readSavedPlaceIds();
      const removing = latest.includes(id);
      const next = removing
        ? latest.filter((value) => value !== id)
        : [...latest, id];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      setSavedIds(next);
      setNotice(
        th
          ? removing
            ? "ยกเลิกบันทึกแล้ว"
            : "บันทึกบนอุปกรณ์นี้แล้ว"
          : removing
            ? "Place removed"
            : "Saved on this device"
      );
    } catch {
      setNotice(
        th
          ? "บันทึกไม่ได้ กรุณาตรวจสิทธิ์พื้นที่เก็บข้อมูลของเบราว์เซอร์"
          : "Unable to save. Check browser storage permissions."
      );
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/attraction/${encodeURIComponent(id || "")}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: attraction
            ? th
              ? attraction.nameLocal || attraction.name
              : attraction.name
            : "PaiNaiDee",
          url,
        });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setNotice(th ? "คัดลอกลิงก์แล้ว" : "Link copied");
      } else setShareLink(url);
    } catch (cause) {
      if (!(cause instanceof Error && cause.name === "AbortError"))
        setShareLink(url);
    }
  };

  if (isLoading)
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl space-y-6 p-4"
        role="status"
        aria-label={th ? "กำลังโหลดสถานที่" : "Loading destination"}
      >
        <div className="h-12 w-40 rounded-xl bg-muted motion-safe:animate-pulse" />
        <div className="aspect-[4/3] rounded-3xl bg-muted motion-safe:animate-pulse sm:aspect-[2/1]" />
        <div className="h-10 w-3/4 rounded-xl bg-muted motion-safe:animate-pulse" />
        <div className="h-40 rounded-3xl bg-muted motion-safe:animate-pulse" />
      </main>
    );
  if (error || !attraction)
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-[70vh] items-center justify-center p-6"
      >
        <div className="max-w-md space-y-5 text-center">
          <h1 className="text-2xl font-semibold">
            {th ? "ยังเปิดสถานที่นี้ไม่ได้" : "Destination unavailable"}
          </h1>
          <p className="text-muted-foreground">
            {th
              ? "ไม่พบสถานที่หรือการเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง"
              : "The destination may be unavailable. Please try again."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              {th ? "กลับหน้าแรก" : "Home"}
            </Button>
            <Button onClick={() => void refetch()}>
              {th ? "ลองใหม่" : "Retry"}
            </Button>
          </div>
        </div>
      </main>
    );

  const name = th ? attraction.nameLocal || attraction.name : attraction.name;
  const province = localizedProvince(attraction, currentLanguage);
  const description = localizedDescription(attraction, currentLanguage);
  const credits = reviewedPhotoCredits(attraction.mediaCredits);
  const approved = reviewedGallery(attraction.images, credits);
  const primary = attraction.image || attraction.images[0];
  // Preserve the published primary; missing rights must never promote a secondary image.
  const images = approved.includes(primary)
    ? [primary, ...approved.filter((url) => url !== primary)]
    : ["/placeholder-attraction.svg", ...approved];
  const hasCoordinates = validPlaceCoordinates(attraction.coordinates);
  const navigationUrl = placeNavigationUrl(attraction);
  const navigationLabel =
    attraction.navigation && validPlaceCoordinates(attraction.navigation)
      ? th
        ? "นำทางไปจุดเข้าที่ตรวจแล้ว"
        : "Directions to verified access"
      : th
        ? "ค้นสถานที่บน Google Maps"
        : "Find on Google Maps";
  const openNavigation = () =>
    window.open(navigationUrl, "_blank", "noopener,noreferrer");
  const sectionClass =
    "rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8";
  const sourceCredit = credits.find((credit) => credit.url === images[0]);

  return (
    <div className="place-detail-theme min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <Button
            variant="ghost"
            className="min-h-[44px] gap-2"
            onClick={onBack}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {th ? "กลับ" : "Back"}
          </Button>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" className="h-[44px] min-w-[44px]" aria-label={th ? 'TH · Switch to English' : 'EN · Switch to ไทย'} onClick={() => onLanguageChange(th ? 'en' : 'th')}>
              {th ? 'TH' : 'EN'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-[44px] w-[44px]"
              aria-label={th ? "รีเฟรชข้อมูลสถานที่" : "Refresh destination"}
              onClick={() => void refetch()}
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl min-w-0"
      >
        <div className="hidden md:block">
          <BreadcrumbNavigation
            currentLanguage={currentLanguage}
            items={[
              { label: th ? "หน้าแรก" : "Home", path: "/" },
              { label: th ? "สำรวจ" : "Explore", path: "/explore" },
              { label: name },
            ]}
          />
        </div>
        <div className="sm:px-6 sm:pt-5 lg:px-8">
          <ImageGallery
            key={attraction.id}
            images={images}
            alt={name}
            credits={credits}
            language={currentLanguage}
          />
        </div>
        <div className="space-y-8 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <section aria-labelledby="destination-title" className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {localizedCategory(attraction.category, currentLanguage)}
              </Badge>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                {province}
                {attraction.placeFacts?.district
                  ? ` · ${attraction.placeFacts.district}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="min-w-0 max-w-3xl">
                <h1
                  id="destination-title"
                  className="break-words text-3xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {name}
                </h1>
                {th && attraction.name && attraction.name !== name && (
                  <p
                    lang="en"
                    className="mt-2 break-words text-base text-muted-foreground sm:text-lg"
                  >
                    {attraction.name}
                  </p>
                )}
                {attraction.rating > 0 && attraction.reviewCount > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-sm">
                    <Star
                      aria-hidden="true"
                      className="h-4 w-4 fill-primary text-primary"
                    />
                    {attraction.rating}{" "}
                    <span className="text-muted-foreground">
                      ({attraction.reviewCount.toLocaleString()}{" "}
                      {th ? "รีวิว" : "reviews"})
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="hidden min-h-[44px] gap-2 md:inline-flex"
                  aria-pressed={saved}
                  onClick={toggleSaved}
                >
                  <Heart
                    aria-hidden="true"
                    className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                  />
                  {saveLabel}
                </Button>
                <Button
                  variant="outline"
                  className="min-h-[44px] gap-2"
                  onClick={() => void share()}
                >
                  <Share2 aria-hidden="true" className="h-4 w-4" />
                  {th ? "แชร์สถานที่" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  disabled={!hasCoordinates}
                  className="hidden min-h-[44px] gap-2 md:inline-flex"
                  onClick={() => setShowMap(true)}
                >
                  <Map aria-hidden="true" className="h-4 w-4" />
                  {th ? "ดูแผนที่" : "View map"}
                </Button>
              </div>
            </div>
            <div role="status" className="text-sm text-primary">
              {notice}
            </div>
            {shareLink && (
              <label className="block text-sm">
                {th ? "คัดลอกลิงก์เพื่อแชร์" : "Copy this link to share"}
                <input
                  readOnly
                  value={shareLink}
                  onFocus={(event) => event.target.select()}
                  className="mt-2 min-h-[44px] w-full rounded-xl border bg-card px-3"
                />
              </label>
            )}
          </section>
          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
            <div className="min-w-0 space-y-6">
              <section className={sectionClass} aria-labelledby="about-title">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  {th ? "ทำความรู้จักจุดหมาย" : "Discover your destination"}
                </p>
                <h2
                  id="about-title"
                  className="text-xl font-semibold sm:text-2xl"
                >
                  {th ? "เกี่ยวกับสถานที่นี้" : "About this place"}
                </h2>
                <p
                  id="place-description"
                  className={`mt-4 whitespace-pre-line break-words text-base leading-8 text-muted-foreground ${!expanded && description.length > 280 ? "line-clamp-6" : ""}`}
                >
                  {description ||
                    (th
                      ? "ยังไม่มีคำอธิบายสถานที่"
                      : "No description available yet.")}
                </p>
                {description.length > 280 && (
                  <Button
                    variant="link"
                    className="mt-2 min-h-[44px] px-0"
                    aria-expanded={expanded}
                    aria-controls="place-description"
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded
                      ? th
                        ? "อ่านน้อยลง"
                        : "Read less"
                      : th
                        ? "อ่านเพิ่มเติม"
                        : "Read more"}
                  </Button>
                )}
                {attraction.tags.length > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h3 className="mb-3 text-sm font-medium">
                      {th ? "หัวข้อที่เกี่ยวข้อง" : "What you’ll find"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attraction.tags.map((tag, i) => (
                        <Badge
                          key={`${tag}-${i}`}
                          variant="outline"
                          className="max-w-full whitespace-normal rounded-full px-3 py-1.5"
                        >
                          {localizedTag(tag, currentLanguage)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {!th && attraction.detailedDescription?.text && (
                  <details
                    className="mt-5 border-t pt-4"
                    data-testid="verified-place-details"
                  >
                    <summary className="cursor-pointer font-medium">
                      More detail from the encyclopedia
                    </summary>
                    <p className="mt-3 whitespace-pre-line break-words leading-7 text-muted-foreground">
                      {attraction.detailedDescription.text}
                    </p>
                    {attraction.detailedDescription.sourceUrl && (
                      <a
                        className="mt-3 inline-block underline"
                        href={attraction.detailedDescription.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read original source
                      </a>
                    )}
                  </details>
                )}
              </section>
              <section
                id="location"
                className={sectionClass}
                aria-labelledby="location-title"
              >
                <h2
                  id="location-title"
                  className="flex items-center gap-2 text-xl font-semibold"
                >
                  <MapPin aria-hidden="true" className="h-5 w-5 text-primary" />
                  {th ? "แผนที่และการเดินทาง" : "Location & getting there"}
                </h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {province}
                  {attraction.placeFacts?.district
                    ? ` · ${attraction.placeFacts.district}`
                    : ""}
                </p>
                {hasCoordinates ? (
                  <button
                    type="button"
                    className="mt-5 flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setShowMap(true)}
                  >
                    <Map aria-hidden="true" className="h-9 w-9" />
                    <span className="font-semibold">
                      {th ? "เปิดแผนที่สถานที่" : "Open destination map"}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {attraction.coordinates.lat.toFixed(5)},{" "}
                      {attraction.coordinates.lng.toFixed(5)}
                    </span>
                  </button>
                ) : (
                  <p className="mt-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    {th
                      ? "ยังไม่มีพิกัดที่ใช้แสดงแผนที่ได้"
                      : "Map coordinates are unavailable."}
                  </p>
                )}
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {attraction.navigation &&
                  validPlaceCoordinates(attraction.navigation)
                    ? th
                      ? "ใช้จุดเข้าที่ตรวจสอบแล้วสำหรับการนำทาง"
                      : "Directions use a verified access point."
                    : th
                      ? "ยังไม่ยืนยันจุดทางเข้า กรุณาตรวจเส้นทางกับผู้ดูแลสถานที่"
                      : "Access point is unverified; confirm with the venue."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 hidden min-h-[44px] w-full whitespace-normal md:inline-flex"
                  onClick={openNavigation}
                >
                  <Navigation
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 shrink-0"
                  />
                  {navigationLabel}
                </Button>
              </section>
              {(sourceCredit || attraction.source?.url) && (
                <details
                  className="rounded-2xl border p-5 text-sm text-muted-foreground"
                  data-testid="attribution-details"
                >
                  <summary className="cursor-pointer font-medium text-foreground">
                    {th
                      ? "เครดิตภาพและแหล่งข้อมูล"
                      : "Photo credits and sources"}
                  </summary>
                  <div
                    className="mt-3 space-y-3 break-words leading-6"
                    data-testid="photo-attribution"
                  >
                    {credits.map((credit) => (
                      <p key={credit.url}>
                        {credit.photographer} ·{" "}
                        {credit.sourcePage ? (
                          <a
                            href={credit.sourcePage}
                            className="underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {th ? "แหล่งภาพ" : "Photo source"}
                          </a>
                        ) : th ? (
                          "ภาพที่ผู้ใช้ส่งให้ PaiNaiDee"
                        ) : (
                          "Submitted by a PaiNaiDee user"
                        )}{" "}
                        ·{" "}
                        {credit.licenseUrl ? (
                          <a
                            href={credit.licenseUrl}
                            className="underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {credit.licenseName}
                          </a>
                        ) : (
                          credit.licenseName
                        )}
                      </p>
                    ))}
                    {attraction.source?.url && (
                      <p>
                        {th ? "แหล่งอ้างอิงสถานที่: " : "Place source: "}
                        <a
                          href={attraction.source.url}
                          className="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {attraction.source.name}
                        </a>
                      </p>
                    )}
                  </div>
                </details>
              )}
            </div>
            <aside
              className="min-w-0 space-y-6"
              aria-label={th ? "วางแผนการเข้าชม" : "Plan your visit"}
            >
              <section className={sectionClass} aria-labelledby="visit-title">
                <h2 id="visit-title" className="text-xl font-semibold">
                  {th ? "ข้อมูลการเข้าชม" : "Plan your visit"}
                </h2>
                <dl className="mt-5 divide-y">
                  {(["openingHours", "admissionFee"] as const).map((key) => {
                    const fact = attraction.placeFacts?.[key];
                    const Icon = key === "openingHours" ? Clock : Ticket;
                    return (
                      <div key={key} className="py-4 first:pt-0">
                        <dt className="flex items-center gap-3 font-medium">
                          <Icon
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 text-primary"
                          />
                          {key === "openingHours"
                            ? th
                              ? "เวลาเปิด–ปิด"
                              : "Opening hours"
                            : th
                              ? "ค่าเข้าชม"
                              : "Admission"}
                        </dt>
                        <dd className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                          {fact?.text ||
                            (th
                              ? "ยังไม่มีข้อมูลปัจจุบันที่ยืนยันได้"
                              : "No verified current information")}
                          {fact && (
                            <>
                              <br />
                              <a
                                className="underline"
                                href={fact.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {th ? "แหล่งข้อมูล" : "Source"}
                              </a>
                              {" · "}
                              {fact.checkedAt.slice(0, 10)}
                            </>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {attraction.externalLinks?.officialWebsite && (
                  <a
                    href={attraction.externalLinks.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex min-h-[44px] items-center justify-between gap-2 rounded-xl border p-3 text-sm font-medium hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Globe aria-hidden="true" className="h-4 w-4" />
                      {th ? "เว็บไซต์ทางการ" : "Official website"}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                  </a>
                )}
                {attraction.externalLinks?.wikipediaUrl && (
                  <a
                    href={attraction.externalLinks.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block py-3 text-sm underline"
                  >
                    {th
                      ? "อ่านเพิ่มเติมจากวิกิพีเดีย"
                      : "Read more on Wikipedia"}
                  </a>
                )}
              </section>
              <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
                <Sparkles
                  aria-hidden="true"
                  className="mb-4 h-7 w-7 text-primary"
                />
                <h2 className="text-xl font-semibold">
                  {th
                    ? "ให้ AI ช่วยวางแผนเที่ยว"
                    : "Make it part of your next trip"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {th
                    ? "ส่งสถานที่นี้เป็นบริบทในหน้าวางแผนใหม่ แล้วระบุจำนวนวันและงบประมาณ แผนเดิมในแท็บอื่นจะยังอยู่"
                    : "Open a new planner with this destination as context, then add your days and budget. Existing tabs stay unchanged."}
                </p>
                <Button
                  asChild
                  className="mt-5 min-h-[48px] w-full whitespace-normal"
                >
                  <Link
                    to={`/trip-planner?place=${encodeURIComponent(attraction.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 shrink-0"
                    />
                    {th ? "วางแผนเที่ยวด้วย AI" : "Plan a trip with AI"}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="ml-2 h-4 w-4 shrink-0"
                    />
                  </Link>
                </Button>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {th
                    ? "เปิดแท็บใหม่ ยังไม่เพิ่มสถานที่ลงแผนอัตโนมัติ"
                    : "Opens a new tab. Stops are not added automatically."}
                </p>
              </section>
              <GooglePlacePreview
                key={attraction.id}
                placeId={attraction.id}
                province={attraction.province}
                language={currentLanguage}
              />
            </aside>
          </div>
          <NearbyRealPlaces
            placeId={attraction.id}
            category={attraction.category}
            coordinates={attraction.coordinates}
            currentLanguage={currentLanguage}
          />
        </div>
      </main>
      <nav
        aria-label={th ? "การทำงานด่วน" : "Quick actions"}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t bg-background/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        <Button
          variant="outline"
          className="min-h-[48px] gap-2 px-2 text-xs"
          aria-pressed={saved}
          onClick={toggleSaved}
        >
          <Heart
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 ${saved ? "fill-current" : ""}`}
          />
          {saveLabel}
        </Button>
        <Button
          variant="outline"
          className="min-h-[48px] gap-2 px-2 text-xs"
          disabled={!hasCoordinates}
          onClick={() => setShowMap(true)}
        >
          <Map aria-hidden="true" className="h-4 w-4 shrink-0" />
          {th ? "แผนที่" : "Map"}
        </Button>
        <Button
          className="min-h-[48px] gap-2 px-2 text-xs"
          aria-label={`${th ? "นำทาง" : "Directions"}: ${navigationLabel}`}
          onClick={openNavigation}
        >
          <Navigation aria-hidden="true" className="h-4 w-4 shrink-0" />
          {th ? "นำทาง" : "Directions"}
        </Button>
      </nav>
      {showMap && hasCoordinates && (
        <Suspense
          fallback={
            <p
              role="status"
              className="fixed inset-x-4 bottom-24 z-50 rounded-xl border bg-background p-4"
            >
              {th ? "กำลังโหลดแผนที่..." : "Loading map..."}
            </p>
          }
        >
          <MapModal
            isOpen
            onClose={() => setShowMap(false)}
            location={{
              ...attraction.coordinates,
              name: attraction.name,
              nameLocal: attraction.nameLocal,
            }}
            currentLanguage={currentLanguage}
            onNavigate={openNavigation}
            navigationLabel={navigationLabel}
          />
        </Suspense>
      )}
    </div>
  );
}
