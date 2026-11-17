# PaiNaiDee Mascot Character Registry

The public mascot UI, Side-Peek interaction, Trip Planner handoff, and renderer
all share the character definition in `mascotCharacters.ts`. No new backend,
database, paid API, or Admin CMS feature is required to change the active model.

## Changing the character

1. Add **licensed** files named `<character-id>.glb` and
   `<character-id>.webp` to `src/components/mascot/assets/`. Do not upload
   source or derivative assets publicly before redistribution rights are clear.
2. Add the character to `registry` in `mascotCharacters.ts`, including its
   bilingual title, fallback emoji, asset paths, camera and semantic-to-GLB
   animation-clip names.
3. Set `VITE_MASCOT_CHARACTER=<character-id>` at **build time**, then rebuild.
   If the value is absent or unknown, the elephant remains the safe default.
4. Validate the model's coordinate system, camera framing, animation clips,
   optional Walking clip, 2D fallback, WebGL resource cleanup, mobile FPS, and
   accessibility before release.

The configuration is **build-time**, not a user-facing live character switch or
an Admin CMS upload/publish workflow. It does not change stored production data.
A separate, permissioned Admin workflow is needed if non-developers must upload
and publish characters at runtime.

The current PR deliberately keeps Tripo-derived GLB/portraits out of the public
repository until asset redistribution rights have been verified. Public CI
cannot claim to have tested the actual 3D asset if it was unavailable.
