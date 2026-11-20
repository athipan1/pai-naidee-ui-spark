import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/** Recheck actual tap targets after layout, scrolling, keyboard and orientation changes. */
export function useBubblePlacement(
  bubble: RefObject<HTMLDivElement>,
  trigger: RefObject<HTMLButtonElement>,
  phase: string | undefined
) {
  const [position, setPosition] = useState<CSSProperties>({
    visibility: "hidden",
  });
  useLayoutEffect(() => {
    if (phase === undefined) return;
    let frame = 0;
    function place() {
      const element = bubble.current;
      const anchor = trigger.current;
      if (!anchor) return;
      const viewport = window.visualViewport;
      const left = (viewport?.offsetLeft ?? 0) + 12;
      const top = (viewport?.offsetTop ?? 0) + 12;
      const right = left + (viewport?.width ?? innerWidth) - 24;
      const bottom = top + (viewport?.height ?? innerHeight) - 24;
      const occupied = [
        ...document.querySelectorAll<HTMLElement>(
          'button, a[href], input, textarea, select, [role="button"], nav'
        ),
      ]
        .filter(
          (target) =>
            !anchor.closest("[data-mascot-id]")?.contains(target) &&
            target.getClientRects().length
        )
        .map((target) => target.getBoundingClientRect());
      // The character's hot zone must also avoid controls after scrolling.
      // Keep its preferred position when free; otherwise move along the edge.
      const peek = anchor.closest<HTMLElement>("[data-peek]");
      if (!peek) return;
      peek.style.bottom = "";
      const preferredBottom = parseFloat(getComputedStyle(peek).bottom) || 0;
      delete peek.dataset.crowded;
      function findAnchorSlot() {
        const rect = anchor!.getBoundingClientRect();
        const candidates = [rect.top];
        for (let y = bottom - rect.height; y >= top; y -= 8) candidates.push(y);
        candidates.sort(
          (a, b) => Math.abs(a - rect.top) - Math.abs(b - rect.top)
        );
        const y = candidates.find(
          (y) =>
            y >= top &&
            y + rect.height <= bottom &&
            occupied.every(
              (r) =>
                rect.right + 8 <= r.left ||
                rect.left >= r.right + 8 ||
                y + rect.height + 8 <= r.top ||
                y >= r.bottom + 8
            )
        );
        return y === undefined ? undefined : y - rect.top;
      }
      let shift = findAnchorSlot();
      if (shift === undefined) {
        peek.dataset.crowded = "true";
        shift = findAnchorSlot();
      }
      anchor.style.visibility = shift === undefined ? "hidden" : "visible";
      peek.style.bottom = `${preferredBottom - (shift ?? 0)}px`;
      if (!element) return;
      if (shift === undefined) {
        setPosition({ visibility: "hidden" });
        return;
      }
      const { width, height } = element.getBoundingClientRect();
      const anchorBounds = anchor.getBoundingClientRect();
      occupied.push(anchorBounds);
      // Prefer the space alongside the elephant, then above/below it. If the
      // viewport is full of controls, omit the temporary greeting bubble.
      const candidates = [
        { x: anchorBounds.left - width - 12, y: anchorBounds.top },
      ];
      for (let y = bottom - height; y >= top; y -= 12) {
        candidates.push(
          { x: anchorBounds.left - width - 12, y },
          { x: right - width, y },
          { x: left, y }
        );
      }
      const score = ({ x, y }: { x: number; y: number }) =>
        Math.abs(
          y + height / 2 - (anchorBounds.top + anchorBounds.height / 2)
        ) +
        Math.abs(x - (anchorBounds.left - width - 12)) * 0.25;
      candidates.sort((a, b) => score(a) - score(b));
      const candidate = candidates.find(
        ({ x, y }) =>
          x >= left &&
          x + width <= right &&
          y >= top &&
          y + height <= bottom &&
          occupied.every(
            (r) =>
              x + width + 8 <= r.left ||
              x >= r.right + 8 ||
              y + height + 8 <= r.top ||
              y >= r.bottom + 8
          )
      );
      setPosition(
        candidate
          ? {
              left: candidate.x,
              top: candidate.y,
              right: "auto",
              bottom: "auto",
              visibility: "visible",
            }
          : { visibility: "hidden" }
      );
    }
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    if (bubble.current) observer.observe(bubble.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    place();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [phase, bubble, trigger]);
  return position;
}
