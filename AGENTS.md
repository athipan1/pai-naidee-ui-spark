# Project Rules

- All backend access goes through the generated client in `src/integrations/supabase/client.ts`; never build a client from environment keys, because the issued credentials change whenever the backend is reconnected.
- Place photos and videos live in the private `place-media` bucket; never render a stored path directly — resolve it to a signed URL with `src/shared/services/mediaUrls.ts` on every read, because public bucket URLs are blocked by workspace policy.
- `media` rows keep the object path in `storage_path` (mirrored in `url`); signed URLs are generated per read and must never be saved as canonical data, because they expire.
- Keep images in the layout while they load (fade with opacity, not `display: none`), because browsers skip fetching lazy images that are hidden.
- Public place data is readable without a session; writes (creating places, uploading media) require a signed-in user, so any admin write path needs a sign-in step.
