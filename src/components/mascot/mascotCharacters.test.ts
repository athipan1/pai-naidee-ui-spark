import { describe, expect, it } from "vitest";
import {
  getMascotCharacter,
  getMascotClipName,
  mascotCharacters,
  type MascotCharacter,
} from "./mascotCharacters";

describe("mascot character registry", () => {
  it("keeps the current elephant as the safe default", () => {
    expect(getMascotCharacter(undefined)).toBe(mascotCharacters.elephant);
    expect(getMascotCharacter("unknown-character")).toBe(
      mascotCharacters.elephant
    );
    expect(getMascotCharacter("elephant").assets.model).toBe(
      "./assets/elephant.glb"
    );
  });

  it("centralizes localized labels, camera and clip names", () => {
    const character = mascotCharacters.elephant;
    expect(character.title.th).toBe("ช้างผู้ช่วยเที่ยว");
    expect(character.camera.position).toEqual([0.47, 0.16, 2.03]);
    expect(getMascotClipName(character, "Thinking")).toBe("Thinking");
    expect(getMascotClipName(character, "Walking")).toBe("Walking");
    // Do not reference a nonexistent PeekGreeting clip in the current GLB.
    expect(getMascotClipName(character, "PeekGreeting")).toBe("Greeting");
  });

  it("allows different clip names and gracefully falls back to greeting", () => {
    const alternate: MascotCharacter = {
      ...mascotCharacters.elephant,
      id: "test-character",
      animationClips: {
        Idle: "Stand",
        Greeting: "Wave",
        Thinking: "Ponder",
      },
    };
    expect(getMascotClipName(alternate, "Idle")).toBe("Stand");
    expect(getMascotClipName(alternate, "PeekGreeting")).toBe("Wave");
    expect(getMascotClipName(alternate, "Happy")).toBeUndefined();
  });
});
