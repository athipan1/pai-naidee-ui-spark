import {
  AnimationMixer,
  Box3,
  Bone,
  DirectionalLight,
  Group,
  HemisphereLight,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import type { MascotMotion } from "./mascotState";

let cachedModel: { url: string; bytes: ArrayBuffer } | undefined;

async function getModel(url: string, signal: AbortSignal) {
  if (cachedModel?.url === url) return cachedModel.bytes;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Elephant asset unavailable");
  const bytes = await response.arrayBuffer();
  signal.throwIfAborted();
  cachedModel = { url, bytes };
  return bytes;
}

function disposeModel(root: Group) {
  const textures = new Set<Texture>();
  const geometries = new Set<Mesh["geometry"]>();
  const materials = new Set<Exclude<Mesh["material"], unknown[]>>();
  const bitmaps = new Set<ImageBitmap>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof Texture) textures.add(value);
      }
    }
    if ("skeleton" in object && object.skeleton) {
      (object.skeleton as { dispose(): void }).dispose();
    }
  });
  for (const texture of textures) {
    if (
      typeof ImageBitmap !== "undefined" &&
      texture.image instanceof ImageBitmap
    )
      bitmaps.add(texture.image);
    texture.dispose();
  }
  for (const bitmap of bitmaps) bitmap.close();
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

export async function createElephantRenderer(
  host: HTMLDivElement,
  url: string,
  signal: AbortSignal,
  onContextLost: () => void,
  onWalkingFinished: () => void
) {
  signal.throwIfAborted();
  const canvas = document.createElement("canvas");
  const touchChromium =
    window.matchMedia("(pointer: coarse)").matches &&
    /Chrome\//.test(navigator.userAgent);
  const context = canvas.getContext("webgl2", {
    alpha: true,
    // WebKit can present a blank transparent canvas with multisampling off.
    antialias: !touchChromium,
    powerPreference: "low-power",
  });
  if (!context) throw new Error("WebGL 2 unavailable");

  const renderer = new WebGLRenderer({ canvas, context, alpha: true });
  const scene = new Scene();
  const camera = new PerspectiveCamera(31, 1, 0.1, 20);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let asset: Awaited<ReturnType<GLTFLoader["parseAsync"]>>;
  try {
    asset = await loader.parseAsync(await getModel(url, signal), "");
  } catch (error) {
    // A damaged response is retryable.
    if (!signal.aborted) cachedModel = undefined;
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
  if (signal.aborted) {
    disposeModel(asset.scene);
    renderer.dispose();
    renderer.forceContextLoss();
    signal.throwIfAborted();
  }

  const bounds = new Box3().setFromObject(asset.scene);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const scale = 1 / Math.max(size.x, size.y, size.z);
  const rig = new Group();
  rig.scale.setScalar(scale);
  asset.scene.position.sub(center);
  rig.add(asset.scene);
  scene.add(rig);
  camera.position.set(0.47, 0.16, 2.03);
  camera.lookAt(0, 0, 0);
  scene.add(new HemisphereLight(0xfff9f1, 0x94a5c0, 1.65));
  const key = new DirectionalLight(0xfff0de, 2.0);
  key.position.set(2, 4, 4);
  scene.add(key);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  canvas.className = "block h-full w-full";
  host.append(canvas);
  const mixer = new AnimationMixer(asset.scene);
  const bones: Bone[] = [];
  const morphWeights: number[][] = [];
  asset.scene.traverse((object) => {
    if (object instanceof Bone) bones.push(object);
    if (object instanceof Mesh && object.morphTargetInfluences) {
      morphWeights.push(object.morphTargetInfluences);
    }
  });
  const clips = new Map(asset.animations.map((clip) => [clip.name, clip]));
  const canWalk = bones.length > 0 && clips.has("Walking");
  canvas.dataset.bones = String(bones.length);

  function capturePose() {
    return {
      joints: bones.map((bone) => ({
        position: bone.position.clone(),
        rotation: bone.quaternion.clone(),
        scale: bone.scale.clone(),
      })),
      morphs: morphWeights.map((weights) => [...weights]),
    };
  }

  function copyPose(pose: ReturnType<typeof capturePose>) {
    for (const [index, bone] of bones.entries()) {
      const joint = pose.joints[index];
      bone.position.copy(joint.position);
      bone.quaternion.copy(joint.rotation);
      bone.scale.copy(joint.scale);
    }
    for (const [index, weights] of morphWeights.entries()) {
      for (let i = 0; i < weights.length; i++)
        weights[i] = pose.morphs[index][i];
    }
  }

  const restClip = clips.get("Rest");
  const restAction = restClip ? mixer.clipAction(restClip).play() : undefined;
  mixer.update(0);
  const neutralPose = capturePose();
  restAction?.stop();
  copyPose(neutralPose);
  const frameInterval = 1000 / 30;
  const transitionSeconds = 0.24;
  let frame = 0;
  let lastTick: number | undefined;
  let elapsed = 0;
  let sinceDraw = 0;
  let transition:
    | { from: ReturnType<typeof capturePose>; time: number }
    | undefined;
  let returnToIdle = false;
  let motion: MascotMotion = "Rest";
  let disposed = false;
  let action: ReturnType<typeof mixer.clipAction> | undefined;

  function resize() {
    if (disposed) return;
    const { clientWidth, clientHeight } = host;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
    renderer.render(scene, camera);
  }

  function tick(time: number) {
    frame = 0;
    const tickDelta = lastTick === undefined ? frameInterval : time - lastTick;
    elapsed += tickDelta;
    sinceDraw += tickDelta;
    lastTick = time;
    if (elapsed + 1 >= frameInterval) {
      const delta = Math.min(sinceDraw / 1000, 0.1);
      sinceDraw = 0;
      elapsed = Math.max(0, elapsed - frameInterval) % frameInterval;
      if (transition) copyPose(neutralPose);
      if (action) mixer.update(delta);
      if (transition) {
        const blend = transition;
        blend.time += delta;
        const mix = MathUtils.smoothstep(blend.time, 0, transitionSeconds);
        for (const [index, bone] of bones.entries()) {
          const joint = blend.from.joints[index];
          bone.position.lerp(joint.position, 1 - mix);
          bone.quaternion.slerp(joint.rotation, 1 - mix);
          bone.scale.lerp(joint.scale, 1 - mix);
        }
        for (const [index, weights] of morphWeights.entries()) {
          for (let i = 0; i < weights.length; i++) {
            weights[i] = MathUtils.lerp(
              blend.from.morphs[index][i],
              weights[i],
              mix
            );
          }
        }
        if (mix === 1) transition = undefined;
      }
      renderer.render(scene, camera);
      if (returnToIdle) {
        returnToIdle = false;
        setMotion("Idle");
      }
    }
    scheduleFrame();
  }

  function scheduleFrame() {
    if (!frame && !disposed && !document.hidden && (action || transition)) {
      frame = window.requestAnimationFrame(tick);
    }
  }

  function syncLoop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    lastTick = undefined;
    elapsed = 0;
    sinceDraw = 0;
    scheduleFrame();
  }

  function setMotion(next: MascotMotion, immediate = false) {
    if (disposed || (motion === next && !immediate)) return;
    const from = capturePose();
    motion = next;
    canvas.dataset.motion = next;
    returnToIdle = false;
    action?.stop();
    const clip = next === "Rest" ? undefined : clips.get(next);
    action = clip ? mixer.clipAction(clip).reset() : undefined;
    if (action && (next === "Greeting" || next === "Happy")) {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    } else if (action && next === "Walking") {
      action.setLoop(LoopRepeat, 2);
    }
    if (action) {
      // Slow the idle breathing, and leave time to read while the planner runs.
      action
        .setEffectiveTimeScale(
          next === "Idle" ? 0.86 : next === "Thinking" ? 0.9 : 1
        )
        .play();
    }
    transition = immediate ? undefined : { from, time: 0 };
    // Stopping the previous action restores its starting pose. Put the last
    // displayed pose back until the next frame samples the new action.
    copyPose(immediate ? neutralPose : from);
    if (immediate) renderer.render(scene, camera);
    syncLoop();
  }

  function handleFinished(event: { action: typeof action }) {
    if (
      event.action === action &&
      (motion === "Greeting" || motion === "Happy" || motion === "Walking")
    ) {
      if (motion === "Walking") onWalkingFinished();
      returnToIdle = true;
    }
  }

  mixer.addEventListener("finished", handleFinished);
  canvas.dataset.motion = motion;

  const observer = new ResizeObserver(resize);
  function dispose() {
    if (disposed) return;
    disposed = true;
    syncLoop();
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncLoop);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    mixer.removeEventListener("finished", handleFinished);
    mixer.stopAllAction();
    mixer.uncacheRoot(asset.scene);
    disposeModel(asset.scene);
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  function handleContextLost(event: Event) {
    event.preventDefault();
    dispose();
    onContextLost();
  }

  canvas.addEventListener("webglcontextlost", handleContextLost);
  document.addEventListener("visibilitychange", syncLoop);
  observer.observe(host);
  resize();
  return { setMotion, dispose, canWalk };
}
