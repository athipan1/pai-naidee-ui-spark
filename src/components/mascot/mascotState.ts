export type PlannerStatus = "idle" | "thinking" | "success" | "error";
export type MascotMotion =
  | "Idle"
  | "Greeting"
  | "Thinking"
  | "Happy"
  | "Walking"
  | "Rest";

export function getMascotMotion({
  reducedMotion,
  resting,
  plannerStatus,
  greeting,
  walking = false,
}: {
  reducedMotion: boolean;
  resting: boolean;
  plannerStatus: PlannerStatus;
  greeting: boolean;
  walking?: boolean;
}): MascotMotion {
  if (reducedMotion) return "Rest";
  if (plannerStatus === "thinking") return "Thinking";
  if (walking) return "Walking";
  if (resting) return "Rest";
  if (plannerStatus === "success") return "Happy";
  if (greeting && plannerStatus === "idle") return "Greeting";
  return "Idle";
}

const preferenceKey = "painaidee.elephant.hidden";

export function getMascotHidden(): boolean {
  try {
    return localStorage.getItem(preferenceKey) === "true";
  } catch {
    return false;
  }
}

export function setMascotHidden(hidden: boolean): void {
  try {
    if (hidden) localStorage.setItem(preferenceKey, "true");
    else localStorage.removeItem(preferenceKey);
  } catch {
    // Keep the user's session preference if storage is blocked.
  }
}

export function getPlannerDraft(state: unknown): string {
  if (!state || typeof state !== "object" || !("mascotTripDraft" in state))
    return "";
  return typeof state.mascotTripDraft === "string"
    ? state.mascotTripDraft.trim().slice(0, 500)
    : "";
}
