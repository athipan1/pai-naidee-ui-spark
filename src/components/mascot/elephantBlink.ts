import { Group, Mesh, MeshStandardMaterial, LinearInterpolant } from "three";

// The approved rig has painted eyes and no eyelid bones or morph targets.
const blink = new LinearInterpolant(
  new Float32Array([0, 0.6, 0.68, 0.73, 0.84]),
  new Float32Array([0, 0, 1, 1, 0]),
  1
);

export function bindElephantBlink(model: Group) {
  const eyelid = { value: 0 };
  model.traverse((object) => {
    if (
      !(object instanceof Mesh) ||
      !(object.material instanceof MeshStandardMaterial)
    )
      return;
    const material = object.material;
    if (
      material.name !== "tripo_mat_53df1cd4" ||
      material.map?.name !== "cute_elephant_3d_model_basecolor"
    )
      return;

    // Coordinates are in the approved rig's 1024px UV atlas. The paint follows
    // the original skinned head and needs no second model or texture download.
    material.onBeforeCompile = (shader) => {
      shader.uniforms.mascotEyelid = eyelid;
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <map_pars_fragment>",
          `
          #include <map_pars_fragment>
          uniform float mascotEyelid;

          vec3 closeElephantEye(vec3 openColor, vec2 uv, vec2 center, vec2 radius) {
            vec2 local = (uv - center) / radius;
            float mask = 1.0 - smoothstep(0.80, 1.06, length(local));
            float halfOpening = 1.11 * (1.0 - mascotEyelid);
            float cover = smoothstep(halfOpening - 0.07, halfOpening + 0.07, abs(local.y));
            vec2 skinUV = vec2(uv.x, center.y + radius.y * (1.12 + 0.14 * local.y));
            vec3 skin = texture2D(map, skinUV).rgb;
            float crease = (1.0 - smoothstep(0.03, 0.10, abs(local.y + 0.10 * local.x * local.x)))
              * (1.0 - smoothstep(0.58, 0.88, abs(local.x)))
              * smoothstep(0.83, 1.0, mascotEyelid);
            return mix(openColor, skin * (1.0 - crease * 0.55), mask * max(cover, crease));
          }
        `
        )
        .replace(
          "#include <map_fragment>",
          `
          #include <map_fragment>
          if (mascotEyelid > 0.0) {
            diffuseColor.rgb = closeElephantEye(diffuseColor.rgb, vMapUv, vec2(599.0, 305.0) / 1024.0, vec2(25.0, 27.0) / 1024.0);
            diffuseColor.rgb = closeElephantEye(diffuseColor.rgb, vMapUv, vec2(387.0, 650.0) / 1024.0, vec2(24.0, 24.0) / 1024.0);
          }
        `
        );
    };
  });
  return (time?: number) => {
    eyelid.value = time === undefined ? 0 : blink.evaluate(time)[0];
  };
}
