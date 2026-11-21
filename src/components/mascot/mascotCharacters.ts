import type { MascotMotion } from "./mascotState";

/**
 * A single source of truth for the character shown by the existing mascot UI.
 * New characters only need a registry entry and licensed GLB/WebP assets.
 * Keep this list explicit: arbitrary URLs from browser storage are not trusted.
 */
export type MascotCharacter = {
  id: string;
  title: Record<"th" | "en", string>;
  fallbackEmoji: string;
  ui: Record<"th" | "en", { walk: string; loading: string; fallback: string }>;
  assets: { model: string; portrait: string };
  animationClips: Partial<Record<MascotMotion, string>>;
  camera: {
    fov: number;
    position: readonly [number, number, number];
  };
};

const registry = {
  elephant: {
    id: "elephant",
    title: {
      th: "ช้างผู้ช่วยเที่ยว",
      en: "Elephant travel assistant",
    },
    fallbackEmoji: "🐘",
    ui: {
      th: {
        walk: "ดูช้างเดิน",
        loading: "กำลังโหลดช้าง 3D",
        fallback: "แสดงช้างแบบ 2D",
      },
      en: {
        walk: "Watch the elephant walk",
        loading: "Loading the 3D elephant",
        fallback: "Showing the 2D elephant",
      },
    },
    assets: {
      model: "./assets/elephant.glb",
      portrait: "./assets/elephant.webp",
    },
    animationClips: {
      Idle: "Idle",
      Greeting: "Greeting",
      PeekGreeting: "PeekGreeting",
      Thinking: "Thinking",
      Happy: "Happy",
      Walking: "Walking",
      Rest: "Rest",
    },
    camera: { fov: 31, position: [0.47, 0.16, 2.03] },
  },
} satisfies Record<string, MascotCharacter>;

export type MascotCharacterId = keyof typeof registry;
export const mascotCharacters: Readonly<
  Record<MascotCharacterId, MascotCharacter>
> = registry;

export function getMascotCharacter(id: string | undefined): MascotCharacter {
  return Object.prototype.hasOwnProperty.call(registry, id ?? "")
    ? registry[id as MascotCharacterId]
    : registry.elephant;
}

// Optional build-time choice. Unknown IDs fail safely back to the elephant.
export const activeMascot = getMascotCharacter(
  import.meta.env.VITE_MASCOT_CHARACTER
);

// Vite fingerprints the registered files. Unused assets are not fetched by the browser.
// Private GLBs can remain absent in public CI; the existing 2D fallback still works.
const assetUrls = import.meta.glob<string>("./assets/*.{glb,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

export function resolveMascotAssets(character: MascotCharacter): {
  modelUrl: string | undefined;
  imageUrl: string | undefined;
} {
  // The public website serves the approved files through Railway. Local and
  // preview builds can use their own test assets without fetching production.
  const productionElephant =
    character.id === "elephant" &&
    typeof window !== "undefined" &&
    window.location.origin === "https://pai-naidee-ui-spark.vercel.app";
  const media =
    "https://painaidee-api-production.up.railway.app/api/media/mascot";
  return {
    modelUrl:
      assetUrls[character.assets.model] ??
      (productionElephant ? `${media}/7a57a070bddb/elephant.glb` : undefined),
    imageUrl:
      assetUrls[character.assets.portrait] ??
      (productionElephant ? `${media}/6d33c7eae9c8/elephant.webp` : undefined),
  };
}

export function getMascotClipName(
  character: MascotCharacter,
  motion: MascotMotion
): string | undefined {
  return (
    character.animationClips[motion] ??
    (motion === "PeekGreeting" ? character.animationClips.Greeting : undefined)
  );
}
