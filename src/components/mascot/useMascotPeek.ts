import { useEffect, useRef, useState } from "react";

type PeekPhase = "idle" | "preparing" | "entering" | "greeting" | "exiting";

const greetingKey = "painaidee.elephant.peek-greeted";
const phaseDuration = { entering: 520, greeting: 6200, exiting: 420 };

function hasGreeted() {
  try {
    return sessionStorage.getItem(greetingKey) === "true";
  } catch {
    return false;
  }
}

export function useMascotPeek(
  available: boolean,
  visualReady: boolean,
  animate: boolean
) {
  const [phase, setPhase] = useState<PeekPhase>("idle");
  const greeted = useRef(hasGreeted());
  const [live, setLive] = useState(false);

  function rememberGreeting() {
    greeted.current = true;
    try {
      sessionStorage.setItem(greetingKey, "true");
    } catch {
      // The greeting still runs at most once during this mount.
    }
  }

  useEffect(() => {
    if (!available) {
      setLive(false);
      setPhase("idle");
      return;
    }
    let timer: number;
    function schedule() {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer = window.setTimeout(() => {
        if (document.hidden) return;
        setLive(true);
        if (animate && !greeted.current) {
          rememberGreeting();
          setPhase("preparing");
        }
      }, 3200);
    }

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    document.addEventListener("visibilitychange", schedule);
    return () => {
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
    };
  }, [available, animate]);

  useEffect(() => {
    if (!available || phase === "idle") return;
    if (phase === "preparing") {
      if (visualReady) setPhase("entering");
      return;
    }
    const next = {
      entering: "greeting",
      greeting: "exiting",
      exiting: "idle",
    } as const;
    const timer = window.setTimeout(
      () => setPhase(next[phase]),
      phaseDuration[phase]
    );
    return () => window.clearTimeout(timer);
  }, [available, phase, visualReady]);

  function interrupt() {
    if (!greeted.current) rememberGreeting();
    setLive(false);
    setPhase("idle");
  }

  return {
    phase: available ? phase : "idle",
    live: available && live,
    dismiss: () => setPhase("exiting"),
    interrupt,
  };
}
