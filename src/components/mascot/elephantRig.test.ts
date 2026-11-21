import { existsSync, readFileSync } from "node:fs";
import { AnimationMixer, Bone, LoopOnce } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { expect, test, vi } from "vitest";
import { getMascotClipName, mascotCharacters } from "./mascotCharacters";

const assetPath = "src/components/mascot/assets/elephant.glb";

test.skipIf(!existsSync(assetPath))(
  "the approved side-peek clip changes head, ear and trunk bone transforms",
  async () => {
    // Geometry, skinning and animation come from the real asset. This test
    // only stubs decoding of the images embedded in it.
    vi.stubGlobal("self", globalThis);
    vi.stubGlobal("createImageBitmap", async () => ({ width: 1, height: 1 }));
    try {
      const bytes = readFileSync(assetPath);
      const asset = await new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .parseAsync(Uint8Array.from(bytes).buffer, "");
      const clipName = getMascotClipName(
        mascotCharacters.elephant,
        "PeekGreeting"
      );
      const clip = asset.animations.find(({ name }) => name === clipName)!;
      expect(clip).toBeDefined();
      const mixer = new AnimationMixer(asset.scene);
      mixer.clipAction(clip).setLoop(LoopOnce, 1).play();
      const joints = ["Head", "EarL", "EarR", "Trunk01"];
      const bones = joints.map((name) => asset.scene.getObjectByName(name));
      expect(bones.every((bone) => bone instanceof Bone)).toBe(true);
      mixer.update(0);
      const rest = bones.map((joint) => joint!.quaternion.clone());
      const movement = bones.map(() => 0);
      for (let time = 0.05; time < clip.duration; time += 0.05) {
        mixer.setTime(time);
        bones.forEach((joint, index) => {
          movement[index] = Math.max(
            movement[index],
            rest[index].angleTo(joint!.quaternion)
          );
        });
      }
      for (const [index, name] of joints.entries()) {
        expect(movement[index], name).toBeGreaterThan(0.04);
      }
    } finally {
      vi.unstubAllGlobals();
    }
  }
);
