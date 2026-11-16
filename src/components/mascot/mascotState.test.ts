import { afterEach, describe, expect, it } from "vitest";
import {
  getMascotHidden,
  getMascotMotion,
  getPlannerDraft,
  setMascotHidden,
} from "./mascotState";

afterEach(() => setMascotHidden(false));

describe("elephant mascot", () => {
  const idle = {
    reducedMotion: false,
    resting: false,
    plannerStatus: "idle",
    greeting: false,
  } as const;

  it("maps greeting and live planner states to different animation clips", () => {
    expect(getMascotMotion(idle)).toBe("Idle");
    expect(getMascotMotion({ ...idle, greeting: true })).toBe("Greeting");
    expect(
      getMascotMotion({ ...idle, plannerStatus: "thinking", greeting: true })
    ).toBe("Thinking");
    expect(getMascotMotion({ ...idle, plannerStatus: "success" })).toBe(
      "Happy"
    );
    expect(getMascotMotion({ ...idle, plannerStatus: "error" })).toBe("Idle");
  });

  it("stops rendering motion in rest and reduced-motion modes", () => {
    expect(getMascotMotion({ ...idle, resting: true })).toBe("Rest");
    expect(
      getMascotMotion({ ...idle, reducedMotion: true, greeting: true })
    ).toBe("Rest");
  });

  it("persists the hide preference and clears it when restored", () => {
    expect(getMascotHidden()).toBe(false);
    setMascotHidden(true);
    expect(getMascotHidden()).toBe(true);
    setMascotHidden(false);
    expect(getMascotHidden()).toBe(false);
  });

  it("accepts a bounded text draft from the mascot navigation state", () => {
    expect(getPlannerDraft({ mascotTripDraft: "  เที่ยวเชียงใหม่  " })).toBe(
      "เที่ยวเชียงใหม่"
    );
    expect(getPlannerDraft({ mascotTripDraft: "a".repeat(501) })).toHaveLength(
      500
    );
    expect(getPlannerDraft({ mascotTripDraft: 42 })).toBe("");
    expect(getPlannerDraft(null)).toBe("");
  });
});
