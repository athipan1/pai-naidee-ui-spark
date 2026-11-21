import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const controls =
  'button, a[href], input, textarea, select, [role="button"], [role="combobox"], .leaflet-container';
const modalSelector =
  '[role="dialog"][aria-modal="true"], dialog[open], [data-state="open"][role="dialog"]';
const gap = 8;
const compactSize = 44;
const peekScales = [1, 0.88, 0.76];

type Bounds = { left: number; top: number; right: number; bottom: number };

function fits(rect: Bounds, viewport: Bounds, occupied: Bounds[]) {
  return (
    rect.left >= viewport.left &&
    rect.right <= viewport.right &&
    rect.top >= viewport.top &&
    rect.bottom <= viewport.bottom &&
    occupied.every(
      (other) =>
        rect.right + gap <= other.left ||
        rect.left >= other.right + gap ||
        rect.bottom + gap <= other.top ||
        rect.top >= other.bottom + gap
    )
  );
}

function findSlot(rect: Bounds, viewport: Bounds, occupied: Bounds[]) {
  const height = rect.bottom - rect.top;
  const preferred = Math.max(
    viewport.top,
    Math.min(viewport.bottom - height, rect.top)
  );
  const rows = [preferred, viewport.top, viewport.bottom - height];
  for (const other of occupied) {
    rows.push(other.top - gap - height, other.bottom + gap);
  }
  rows.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
  const top = rows.find((y) =>
    fits(
      { left: rect.left, right: rect.right, top: y, bottom: y + height },
      viewport,
      occupied
    )
  );
  return top === undefined ? undefined : top - rect.top;
}

function placePanel(
  panel: HTMLElement,
  anchorBottom: number,
  viewport: Bounds,
  occupied: Bounds[]
) {
  const { left, right } = panel.getBoundingClientRect();
  const base = anchorBottom - parseFloat(getComputedStyle(panel).marginBottom);
  const bottom = Math.min(base, viewport.bottom);
  const height = Math.min(panel.scrollHeight + 2, 448);
  const obstacles = occupied
    .filter((rect) => rect.left < right + gap && rect.right > left - gap)
    .sort((a, b) => a.top - b.top);
  let slotTop = viewport.top;
  let best = { height: 0, bottom };
  for (const rect of [...obstacles, { top: bottom + gap, bottom }]) {
    const slotBottom = Math.min(bottom, rect.top - gap);
    const room = Math.min(height, slotBottom - slotTop);
    if (room >= best.height) best = { height: room, bottom: slotBottom };
    slotTop = Math.max(slotTop, rect.bottom + gap);
  }

  // On a very small visual viewport, keep the opened composer scrollable.
  const canFit = best.height >= 144;
  panel.toggleAttribute("data-constrained", canFit && best.height < 300);
  panel.style.setProperty(
    "--mascot-panel-space",
    canFit ? `${best.height}px` : ""
  );
  panel.style.setProperty(
    "--mascot-panel-offset",
    canFit ? `${base - best.bottom}px` : ""
  );
}

const hiddenStyle: CSSProperties = { visibility: "hidden" };

/** Measure interaction zones on layout and viewport events, never per animation frame. */
export function useBubblePlacement(
  bubble: RefObject<HTMLDivElement>,
  trigger: RefObject<HTMLButtonElement>,
  assistant: RefObject<HTMLElement>,
  phase: string | undefined
) {
  const [compact, setCompact] = useState(false);
  const [style, setStyle] = useState<CSSProperties>(hiddenStyle);

  useLayoutEffect(() => {
    const root = assistant.current;
    if (phase === undefined || !root) return;
    let frame = 0;

    function place() {
      if (!root) return;
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const width = viewport?.width ?? innerWidth;
      const height = viewport?.height ?? innerHeight;
      const keyboardInset = Math.max(0, innerHeight - top - height);
      root.style.setProperty("--mascot-viewport-inset", `${keyboardInset}px`);
      root.style.setProperty("--mascot-viewport-height", `${height}px`);
      const modal = [...document.querySelectorAll(modalSelector)].some(
        (item) => !root.contains(item) && item.getClientRects().length > 0
      );
      root.toggleAttribute("data-obscured", modal);
      if (modal) return;

      const viewportBounds = {
        left,
        top: top + gap,
        right: left + width,
        bottom: top + height - gap,
      };
      // Sticky navigation reserves its full strip, while ordinary nav wrappers
      // leave their unused space available. Their controls are measured below.
      const bars = [...document.querySelectorAll("nav")].filter((element) => {
        const position = getComputedStyle(element).position;
        return position === "fixed" || position === "sticky";
      });
      const occupied = [...document.querySelectorAll(controls), ...bars]
        .filter(
          (element) =>
            !root.contains(element) && element.getClientRects().length
        )
        .map((element) => element.getBoundingClientRect())
        .filter(
          (rect) =>
            rect.width &&
            rect.height &&
            rect.bottom >= top &&
            rect.top <= top + height
        );

      if (phase === "panel") {
        const panel = root.querySelector<HTMLElement>(".elephant-mascot-panel");
        if (panel)
          placePanel(
            panel,
            root.getBoundingClientRect().bottom - keyboardInset,
            viewportBounds,
            occupied
          );
        return;
      }

      const anchor = trigger.current;
      const peek = anchor?.closest<HTMLElement>("[data-peek]");
      const launcher = peek ?? anchor;
      if (!launcher) return;
      launcher.style.removeProperty("--mascot-launcher-y");
      launcher.style.removeProperty("--mascot-launcher-x");
      launcher.style.removeProperty("--mascot-peek-scale");
      const bounds = launcher.getBoundingClientRect();
      // Browser layout rounds vw and percentage widths differently. Anchor
      // the measured box inside the visual viewport before trying positions.
      const rightEdge = Math.min(bounds.right, viewportBounds.right);
      const resting = phase === "idle" || phase === "preparing";
      let shift: number | undefined;
      let x = rightEdge - bounds.right;
      let scale = 1;
      if (peek) {
        for (const candidate of peekScales) {
          const width = bounds.width * candidate;
          const height = bounds.height * candidate;
          shift = findSlot(
            {
              left:
                rightEdge - Math.max(compactSize, width * (resting ? 0.62 : 1)),
              right: rightEdge,
              top:
                bounds.bottom -
                Math.max(compactSize, height * (resting ? 0.6 : 1)),
              bottom: bounds.bottom,
            },
            viewportBounds,
            occupied
          );
          if (shift !== undefined) {
            scale = candidate;
            break;
          }
        }
      } else {
        shift = findSlot(bounds, viewportBounds, occupied);
      }
      const isCompact = !!peek && shift === undefined;
      if (isCompact) {
        for (const right of [
          rightEdge - gap,
          viewportBounds.left + gap + compactSize,
        ]) {
          shift = findSlot(
            {
              left: right - compactSize,
              right,
              top: bounds.bottom - compactSize,
              bottom: bounds.bottom,
            },
            viewportBounds,
            occupied
          );
          if (shift !== undefined) {
            x = right - bounds.right;
            break;
          }
        }
      }
      launcher.style.setProperty("--mascot-peek-scale", String(scale));
      launcher.toggleAttribute("data-unavailable", shift === undefined);
      launcher.style.setProperty("--mascot-launcher-x", `${x}px`);
      launcher.style.setProperty("--mascot-launcher-y", `${shift ?? 0}px`);
      setCompact(isCompact);

      const element = bubble.current;
      if (!element || isCompact || shift === undefined) {
        setStyle(hiddenStyle);
        return;
      }
      const speech = element.getBoundingClientRect();
      const inner = {
        ...viewportBounds,
        left: left + gap,
        right: left + width - gap,
      };
      const launcherBounds = launcher.getBoundingClientRect();
      const adjacent = launcherBounds.left - speech.width - 12;
      const centered =
        launcherBounds.top + (launcherBounds.height - speech.height) / 2;
      for (const x of [adjacent, inner.right - speech.width, inner.left]) {
        const rect = {
          left: x,
          right: x + speech.width,
          top: centered,
          bottom: centered + speech.height,
        };
        const dy = findSlot(rect, inner, [...occupied, launcherBounds]);
        if (dy !== undefined) {
          setStyle({
            left: x,
            top: centered + dy,
            right: "auto",
            bottom: "auto",
            visibility: "visible",
          });
          return;
        }
      }
      setStyle(hiddenStyle);
    }

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    }
    function onScroll(event: Event) {
      if (!(event.target instanceof Node) || !root?.contains(event.target)) {
        schedule();
      }
    }
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    if (bubble.current) resize.observe(bubble.current);
    const mutations = new MutationObserver((entries) => {
      if (entries.some(({ target }) => !root.contains(target))) schedule();
    });
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      attributeFilter: ["open", "aria-modal", "data-state"],
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", onScroll, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    place();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [phase, bubble, trigger, assistant]);

  return { compact, style };
}
