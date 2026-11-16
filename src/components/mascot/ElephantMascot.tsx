import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  EyeOff,
  Footprints,
  Minus,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMascotHidden,
  getMascotMotion,
  setMascotHidden,
  type PlannerStatus,
} from "./mascotState";

const assets = import.meta.glob<string>("./assets/elephant.{glb,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});
const modelUrl = assets["./assets/elephant.glb"];
const imageUrl = assets["./assets/elephant.webp"];

const copy = {
  th: {
    title: "ช้างผู้ช่วยเที่ยว",
    close: "ย่อผู้ช่วยเที่ยว",
    walk: "ดูช้างเดิน",
    stopWalking: "หยุดเดิน",
    hide: "ซ่อนผู้ช่วยเที่ยว",
    restore: "แสดงผู้ช่วยเที่ยว",
    welcome: "สวัสดี! อยากไปเที่ยวที่ไหนกันดี?",
    label: "บอกทริปที่อยากไป",
    placeholder: "เชียงใหม่ 3 วัน งบ 6,000 บาท",
    review: "เปิดใน AI วางแผนเที่ยว",
    nearby: "ใกล้ฉัน",
    search: "ค้นหาที่เที่ยว",
    thinking: "AI กำลังจัดทริป",
    success: "แผนเที่ยวพร้อมแล้ว",
    error: "จัดทริปไม่สำเร็จ ลองอีกครั้งในหน้าแผนเที่ยว",
    loading: "กำลังโหลดช้าง 3D",
    fallback: "แสดงช้างแบบ 2D",
    retry: "ลองโหลด 3D อีกครั้ง",
  },
  en: {
    title: "Elephant travel assistant",
    close: "Minimize travel assistant",
    walk: "Watch the elephant walk",
    stopWalking: "Stop walking",
    hide: "Hide travel assistant",
    restore: "Show travel assistant",
    welcome: "Hi! Where would you like to go?",
    label: "Describe your trip",
    placeholder: "Chiang Mai, 3 days, ฿6,000",
    review: "Open AI Trip Planner",
    nearby: "Nearby",
    search: "Find places",
    thinking: "AI is planning your trip",
    success: "Your itinerary is ready",
    error: "Planning failed. Try again in Trip Planner.",
    loading: "Loading the 3D elephant",
    fallback: "Showing the 2D elephant",
    retry: "Retry 3D",
  },
};

type Renderer = Awaited<
  ReturnType<typeof import("./ElephantRenderer").createElephantRenderer>
>;

export default function ElephantMascot({
  language,
  plannerStatus,
}: {
  language: "th" | "en";
  plannerStatus: PlannerStatus;
}) {
  const t = copy[language];
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  const panelId = useId();
  const titleId = useId();
  const assistant = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const greeted = useRef(false);
  const [openFor, setOpenFor] = useState<string>();
  const [hidden, setHidden] = useState(getMascotHidden);
  const [draft, setDraft] = useState("");
  const [greeting, setGreeting] = useState(false);
  const [resting, setResting] = useState(false);
  const [walking, setWalking] = useState(false);
  const [canWalk, setCanWalk] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [visual, setVisual] = useState<"loading" | "ready" | "fallback">(
    "loading"
  );
  const [attempt, setAttempt] = useState(0);
  const open = !hidden && key === openFor;
  const motion = getMascotMotion({
    reducedMotion,
    resting,
    plannerStatus,
    greeting,
    walking,
  });
  const motionRef = useRef({ motion, reducedMotion });

  useEffect(() => {
    setOpenFor(undefined);
    setGreeting(false);
    setWalking(false);
  }, [key]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setWalking(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    motionRef.current = { motion, reducedMotion };
    renderer.current?.setMotion(motion, reducedMotion);
  }, [motion, reducedMotion]);

  useEffect(() => {
    const host = stage.current;
    if (!open || !host || !modelUrl) return;
    const controller = new AbortController();
    const deadline = window.setTimeout(() => {
      controller.abort();
      setVisual("fallback");
    }, 15000);
    void import("./ElephantRenderer")
      .then(({ createElephantRenderer }) =>
        createElephantRenderer(
          host,
          modelUrl,
          controller.signal,
          () => {
            setVisual("fallback");
            setWalking(false);
          },
          () => setWalking(false)
        )
      )
      .then((view) => {
        if (controller.signal.aborted) {
          view.dispose();
          return;
        }
        renderer.current = view;
        setCanWalk(view.canWalk);
        view.setMotion(
          motionRef.current.motion,
          motionRef.current.reducedMotion
        );
        setVisual("ready");
        if (!greeted.current) {
          greeted.current = true;
          setGreeting(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setVisual("fallback");
      })
      .finally(() => window.clearTimeout(deadline));
    return () => {
      window.clearTimeout(deadline);
      controller.abort();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [open, attempt]);

  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    function closeOnOutsidePress(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !assistant.current?.contains(event.target)
      ) {
        setOpenFor(undefined);
        setGreeting(false);
        setWalking(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  useEffect(() => {
    setResting(false);
    setWalking(false);
    if (plannerStatus !== "idle") setGreeting(false);
  }, [plannerStatus]);

  useEffect(() => {
    if (!open || visual !== "ready" || !greeting) return;
    const timer = window.setTimeout(() => setGreeting(false), 2100);
    return () => window.clearTimeout(timer);
  }, [open, visual, greeting]);

  useEffect(() => {
    if (
      !open ||
      visual !== "ready" ||
      resting ||
      walking ||
      plannerStatus === "thinking"
    )
      return;
    const timer = window.setTimeout(() => setResting(true), 12000);
    return () => window.clearTimeout(timer);
  }, [open, plannerStatus, visual, resting, walking]);

  function minimize() {
    setOpenFor(undefined);
    setGreeting(false);
    setWalking(false);
    toggle.current?.focus();
  }

  function updateHidden(value: boolean) {
    setHidden(value);
    setMascotHidden(value);
    minimize();
  }

  function openPlanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    minimize();
    navigate("/trip-planner", { state: { mascotTripDraft: draft.trim() } });
    setDraft("");
  }

  // Keep the planner composer and place-detail navigation clear on small screens.
  const bottom =
    pathname === "/trip-planner"
      ? "bottom-[calc(8.5rem+env(safe-area-inset-bottom))]"
      : pathname.startsWith("/attraction/")
        ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-5"
        : "bottom-[calc(6.5rem+env(safe-area-inset-bottom))]";
  const portrait = imageUrl ? (
    <img
      src={imageUrl}
      alt=""
      decoding="async"
      fetchPriority="low"
      className="h-full w-full object-contain"
      width={256}
      height={256}
    />
  ) : (
    <span aria-hidden="true" className="text-3xl">
      🐘
    </span>
  );
  const plannerMessage = plannerStatus === "idle" ? "" : t[plannerStatus];

  return (
    <aside
      ref={assistant}
      className={`fixed right-[max(0.75rem,env(safe-area-inset-right))] z-[39] ${bottom}`}
      aria-label={t.title}
    >
      <Button
        ref={toggle}
        type="button"
        variant={hidden ? "ghost" : "outline"}
        className={`ml-auto flex h-12 w-12 rounded-full p-1 ${hidden ? "bg-background/80" : "bg-card shadow-md"}`}
        aria-label={hidden ? t.restore : t.title}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (hidden) updateHidden(false);
          else if (open) minimize();
          else {
            setVisual("loading");
            setResting(false);
            setOpenFor(key);
          }
        }}
      >
        {hidden ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : portrait}
      </Button>
      {open && (
        <section
          id={panelId}
          aria-labelledby={titleId}
          className="absolute bottom-full right-0 mb-2 max-h-[min(28rem,calc(100dvh-12.5rem-env(safe-area-inset-bottom)))] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border bg-card p-3 text-card-foreground shadow-xl lg:mb-7 lg:w-72"
          onKeyDown={(event) => {
            if (event.key === "Escape") minimize();
          }}
        >
          <header className="flex items-center gap-1">
            <h2 id={titleId} className="mr-auto text-sm font-semibold">
              {t.title}
            </h2>
            <Button
              ref={close}
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={t.close}
              onClick={minimize}
            >
              <Minus aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={t.hide}
              onClick={() => updateHidden(true)}
            >
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            </Button>
          </header>
          <p className="mb-2 text-sm text-muted-foreground">{t.welcome}</p>
          <div className="relative mb-2 grid h-32 place-items-center overflow-hidden rounded-xl bg-primary/10">
            {(!modelUrl || visual !== "ready") && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center p-2">
                {portrait}
              </div>
            )}
            <div
              ref={stage}
              className="absolute inset-y-0 left-1/2 aspect-square -translate-x-1/2"
              aria-hidden="true"
            />
            {visual === "ready" && canWalk && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-11 w-11"
                aria-label={walking ? t.stopWalking : t.walk}
                aria-pressed={walking}
                title={walking ? t.stopWalking : t.walk}
                disabled={reducedMotion || plannerStatus === "thinking"}
                onClick={() => {
                  setResting(false);
                  setGreeting(false);
                  setWalking(!walking);
                }}
              >
                <Footprints aria-hidden="true" className="h-4 w-4" />
              </Button>
            )}
          </div>
          {modelUrl && visual !== "ready" && (
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span role="status">
                {visual === "loading" ? t.loading : t.fallback}
              </span>
              {visual === "fallback" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVisual("loading");
                    setAttempt((value) => value + 1);
                  }}
                >
                  {t.retry}
                </Button>
              )}
            </div>
          )}
          {plannerMessage && (
            <p role="status" className="mb-2 text-xs text-muted-foreground">
              {plannerMessage}
            </p>
          )}
          <form onSubmit={openPlanner} className="grid gap-2">
            <label
              htmlFor={`${panelId}-message`}
              className="text-sm font-medium"
            >
              {t.label}
            </label>
            <input
              id={`${panelId}-message`}
              value={draft}
              maxLength={500}
              onChange={(event) => {
                setResting(false);
                setDraft(event.target.value);
              }}
              placeholder={t.placeholder}
              className="h-11 min-w-0 rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              className="min-h-11 gap-2 bg-teal-700 text-white hover:bg-teal-800"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t.review}
            </Button>
          </form>
          <div className="mt-2 flex gap-1">
            <Button asChild variant="ghost" className="min-h-11 flex-1 gap-2">
              <Link to="/discover?mode=map" onClick={minimize}>
                <Compass aria-hidden="true" className="h-4 w-4" />
                {t.nearby}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="min-h-11 flex-1 gap-2">
              <Link to="/discover?mode=search" onClick={minimize}>
                <Search aria-hidden="true" className="h-4 w-4" />
                {t.search}
              </Link>
            </Button>
          </div>
        </section>
      )}
    </aside>
  );
}
