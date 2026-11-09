import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Images, ZoomIn, ZoomOut } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { AttractionPhotoCredit } from "@/shared/types/attraction";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  credits?: AttractionPhotoCredit[];
  language?: "th" | "en";
}

export default function ImageGallery({
  images,
  alt,
  credits = [],
  language = "th",
}: ImageGalleryProps) {
  const th = language === "th";
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const src = images[index];
  const credit = credits.find((item) => item.url === src);
  const label = (i: number) => `${alt} · ${th ? "ภาพ" : "Photo"} ${i + 1}`;
  const move = useCallback(
    (next: number) => {
      const bounded = (next + images.length) % images.length;
      setSelected(bounded);
      setZoom(false);
      api?.scrollTo(bounded);
    },
    [api, images.length]
  );

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setZoom(false);
    };
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  if (!images.length)
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted text-muted-foreground sm:aspect-[2/1]"
        role="status"
      >
        {th ? "ยังไม่มีรูปภาพ" : "No photos available"}
      </div>
    );

  return (
    <section
      aria-label={th ? "แกลเลอรีสถานที่" : "Destination gallery"}
      className="space-y-3"
    >
      <div
        className={`grid gap-3 ${images.length >= 3 ? "lg:grid-cols-[2fr_1fr]" : ""}`}
      >
        <div className="relative min-w-0 overflow-hidden bg-muted sm:rounded-3xl">
          <Carousel
            setApi={setApi}
            opts={{ loop: images.length > 1 }}
            className="w-full"
            aria-label={th ? "รูปสถานที่" : "Destination photos"}
          >
            <CarouselContent className="ml-0">
              {images.map((image, i) => (
                <CarouselItem key={`${image}-${i}`} className="pl-0">
                  <button
                    ref={i === index ? trigger : undefined}
                    type="button"
                    className="block aspect-[4/3] w-full cursor-zoom-in overflow-hidden focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary focus-visible:-outline-offset-4 sm:aspect-[2/1] lg:aspect-[16/10]"
                    aria-label={label(i)}
                    onClick={() => {
                      setSelected(i);
                      setOpen(true);
                    }}
                  >
                    <OptimizedImage
                      unavailableLabel={
                        th
                          ? "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ"
                          : "Image unavailable · Pending admin review"
                      }
                      src={image}
                      alt={label(i)}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      sizes="(min-width: 1024px) 800px, 100vw"
                      width="1200"
                      height="750"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span
              className="rounded-full bg-background/95 px-3 py-2 text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {index + 1} / {images.length}
            </span>
            <Button
              variant="secondary"
              className="min-h-[44px] rounded-full shadow"
              onClick={() => setOpen(true)}
            >
              <Images aria-hidden="true" className="mr-2 h-4 w-4" />
              {th ? "ดูรูปทั้งหมด" : "All photos"}
            </Button>
          </div>
        </div>
        {images.length >= 3 && (
          <div className="hidden min-h-0 grid-rows-2 gap-3 lg:grid">
            {images.slice(1, 3).map((image, i) => (
              <button
                type="button"
                key={image}
                aria-label={label(i + 1)}
                className="relative min-h-0 overflow-hidden rounded-3xl bg-muted focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary"
                onClick={() => {
                  move(i + 1);
                  setOpen(true);
                }}
              >
                <OptimizedImage
                  unavailableLabel={
                    th
                      ? "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ"
                      : "Image unavailable · Pending admin review"
                  }
                  src={image}
                  alt={label(i + 1)}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  width="600"
                  height="375"
                  sizes="400px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 sm:px-0">
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-[44px] w-[44px] shrink-0 rounded-full"
              aria-label={th ? "ภาพก่อนหน้า" : "Previous photo"}
              onClick={() => move(index - 1)}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <div
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1"
              aria-label={th ? "ภาพขนาดย่อ" : "Thumbnails"}
            >
              {images.map((image, i) => (
                <button
                  type="button"
                  key={`${image}-${i}`}
                  onClick={() => move(i)}
                  aria-label={`${th ? "เลือกภาพ" : "Select photo"} ${i + 1}`}
                  aria-pressed={i === index}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${i === index ? "border-primary" : "border-transparent opacity-60"}`}
                >
                  <OptimizedImage
                    unavailableLabel={
                      th
                        ? "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ"
                        : "Image unavailable · Pending admin review"
                    }
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width="64"
                    height="48"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-[44px] w-[44px] shrink-0 rounded-full"
              aria-label={th ? "ภาพถัดไป" : "Next photo"}
              onClick={() => move(index + 1)}
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {credit && (
        <p className="px-4 text-xs leading-5 text-muted-foreground sm:px-0">
          {credit.photographer} ·{" "}
          {credit.sourcePage ? (
            <a
              className="underline"
              href={credit.sourcePage}
              target="_blank"
              rel="noopener noreferrer"
            >
              {th ? "แหล่งภาพ" : "Photo source"}
            </a>
          ) : (
            credit.licenseName
          )}
          {credit.licenseUrl && (
            <>
              {" "}
              ·{" "}
              <a
                className="underline"
                href={credit.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {credit.licenseName}
              </a>
            </>
          )}
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          setZoom(false);
        }}
      >
        <DialogContent
          className="place-detail-theme flex h-[100dvh] max-h-[100dvh] max-w-none flex-col gap-3 border-0 bg-background p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-none [&>button]:top-[max(1rem,env(safe-area-inset-top))] [&>button]:h-[44px] [&>button]:w-[44px] [&>button]:bg-background [&>button]:opacity-100 motion-reduce:animate-none motion-reduce:transition-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(index - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(index + 1);
            }
          }}
        >
          <DialogTitle className="pr-14 text-base leading-relaxed">
            {alt}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {th
              ? "ใช้ปุ่มลูกศรเพื่อเปลี่ยนภาพ กด Escape เพื่อปิด"
              : "Use arrow keys to browse. Press Escape to close."}
          </DialogDescription>
          <div
            className="min-h-0 flex-1 overflow-auto rounded-xl bg-muted/30"
            onTouchStart={(event) => {
              touchStart.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (
                !zoom &&
                touchStart.current !== null &&
                Math.abs(event.changedTouches[0].clientX - touchStart.current) >
                  50
              )
                move(
                  index +
                    (event.changedTouches[0].clientX < touchStart.current
                      ? 1
                      : -1)
                );
              touchStart.current = null;
            }}
          >
            <OptimizedImage
              unavailableLabel={
                th
                  ? "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ"
                  : "Image unavailable · Pending admin review"
              }
              src={src}
              alt={label(index)}
              className={
                zoom
                  ? "h-full w-full object-contain [&>img]:h-[160%] [&>img]:w-[160%] [&>img]:max-w-none"
                  : "h-full w-full object-contain"
              }
              loading="eager"
              width="1200"
              height="750"
            />
          </div>
          <div className="flex shrink-0 items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-[44px] w-[44px]"
              disabled={images.length < 2}
              aria-label={th ? "ภาพก่อนหน้า" : "Previous photo"}
              onClick={() => move(index - 1)}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <span
              className="min-w-12 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {index + 1} / {images.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-[44px] w-[44px]"
              disabled={images.length < 2}
              aria-label={th ? "ภาพถัดไป" : "Next photo"}
              onClick={() => move(index + 1)}
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-[44px] w-[44px]"
              aria-label={
                zoom ? (th ? "ย่อภาพ" : "Zoom out") : th ? "ขยายภาพ" : "Zoom in"
              }
              aria-pressed={zoom}
              onClick={() => setZoom((value) => !value)}
            >
              {zoom ? (
                <ZoomOut aria-hidden="true" className="h-4 w-4" />
              ) : (
                <ZoomIn aria-hidden="true" className="h-4 w-4" />
              )}
            </Button>
          </div>
          {credit && (
            <p className="text-center text-xs text-muted-foreground">
              {credit.photographer} ·{" "}
              <a
                className="underline"
                href={credit.sourcePage || undefined}
                target="_blank"
                rel="noopener noreferrer"
              >
                {th ? "แหล่งภาพ" : "Photo source"}
              </a>{" "}
              ·{" "}
              {credit.licenseUrl ? (
                <a
                  className="underline"
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.licenseName}
                </a>
              ) : (
                credit.licenseName
              )}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
