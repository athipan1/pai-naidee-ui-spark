const { InvalidImageError } = require('./railway-media.cjs');
const { randomUUID } = require('node:crypto');
const { geocodeCandidates } = require('./admin-geocode.cjs');
const { finishDirectPublication } = require('./admin-direct-publication.cjs');
const { aliasKey, validateAlias } = require('./place-alias.cjs');


const draftVersion = value => typeof value === 'string' && /^\d{1,12}\.\d{6}$/.test(value);

function validateImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (!/^https:\/\//i.test(imageUrl)) return 'Image URL must be HTTPS.';
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'https:' || url.username || url.password || /[\s<>]/.test(imageUrl)) throw new Error();
    const host = url.hostname.replace(/\.$/, '');
    const googlePhotoHost = /(^|\.)(googleusercontent\.com|ggpht\.com|gstatic\.com|googleapis\.com)$/.test(host);
    const googleMapsLink = /(^|\.)google\.(com|co\.th)$/.test(host) && url.pathname.startsWith('/maps');
    if (googlePhotoHost || googleMapsLink || /\/google-preview(?:\/|$)/i.test(url.pathname)) {
      return 'Google Places images cannot be saved in the CMS.';
    }
    return null;
  } catch {
    return 'Image URL must be HTTPS.';
  }
}

async function preservePlaceImage(tx, placeId, url, title) {
  if (!url) return;
  const existing = await tx`SELECT id FROM media WHERE place_id = ${placeId} AND url = ${url} AND type = 'image' LIMIT 1`;
  if (!existing.length) await tx`INSERT INTO media (id, place_id, url, type, title)
    VALUES (${`cms-media:${randomUUID()}`}, ${placeId}, ${url}, 'image', ${title})`;
}

function cleanPlace(input, { draft = false } = {}) {
  const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const name = text(input?.name, 200);
  const province = text(input?.province, 120);
  const category = text(input?.category, 120);
  const number = value => typeof value === 'number' || (typeof value === 'string' && value.trim())
    ? Number(value) : NaN;
  const lat = number(input?.lat);
  const lng = number(input?.lng);
  const imageUrl = text(input?.imageUrl, 2000);
  const errors = [];
  const removedImageUrls = input?.removedImageUrls ?? [];
  if (!Array.isArray(removedImageUrls) || removedImageUrls.length > 50 || removedImageUrls.some(url => typeof url !== 'string' || url.length > 2000 || validateImageUrl(url))) errors.push('Invalid removed image URLs.');
  const rawImages = input?.imageUrls ?? [];
  if (!Array.isArray(rawImages) || rawImages.length > 20) errors.push('Choose up to 20 images.');
  const imageUrls = Array.isArray(rawImages) ? [...new Set(rawImages.map(url => typeof url === 'string' ? url.trim() : ''))].filter(Boolean) : [];
  if (imageUrls.some(url => url.length > 2000 || validateImageUrl(url))) errors.push('All gallery images must have valid HTTPS URLs.');
  if (imageUrls.length > 20) errors.push('Choose up to 20 images.');
  if (!name || (!draft && (!province || !category))) errors.push('Name, province and category are required.');
  const absent = value => value == null || (typeof value === 'string' && !value.trim());
  const missingCoordinates = absent(input?.lat) && absent(input?.lng);
  if (!(draft && missingCoordinates) && (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 5 || lat > 21 || lng < 97 || lng > 106)) errors.push('Coordinates must be within Thailand.');
  const imageError = validateImageUrl(imageUrl);
  if (imageError) errors.push(imageError);
  if (typeof input?.description === 'string' && input.description.length > 10000) errors.push('Description is too long.');
  return {
    errors,
    value: { name, nameLocal: text(input?.nameLocal, 200), province, category,
      description: text(input?.description, 10000), lat: missingCoordinates ? null : lat, lng: missingCoordinates ? null : lng, imageUrl, imageUrls: [...new Set([imageUrl, ...imageUrls].filter(Boolean))], removedImageUrls: Array.isArray(removedImageUrls) ? [...new Set(removedImageUrls)] : [] },
  };
}

function registerAdminCms(app, { getSql, listPlaces, requireAdmin, storage, uploadImage, invalidateSearchIndex = () => {} }) {
  const wrap = (handler) => async (req, res) => {
    try { await handler(req, res); }
    catch (error) {
      if(error?.code==='23503' && req.method === 'DELETE') return res.status(409).json({error:'This draft has linked review or import history and cannot be deleted safely.'});
      if(error?.code==='PUBLICATION_DUPLICATE')return res.status(409).json({error:'External identity already belongs to another place.'});
      console.error('Admin CMS failed.');
      res.status(503).json({ error: 'Admin CMS is unavailable.' });
    }
  };

  app.get('/api/admin/places', requireAdmin, wrap(async (_req, res) => {
    const sql = getSql();
    const [schema] = await sql`SELECT to_regclass('public.place_reviews') AS reviews`;
    const drafts = schema.reviews
      ? await sql`SELECT d.id, d.payload, d.status, d.target_place_id, d.created_at, d.updated_at,
        r.state AS review_state, EXTRACT(EPOCH FROM d.updated_at)::text AS version
        FROM place_drafts d LEFT JOIN place_reviews r ON r.draft_id = d.id ORDER BY d.updated_at DESC LIMIT 100`
      : await sql`SELECT id, payload, status, target_place_id, created_at, updated_at,
        EXTRACT(EPOCH FROM updated_at)::text AS version FROM place_drafts ORDER BY updated_at DESC LIMIT 100`;
    res.json({ drafts });
  }));

  app.get('/api/admin/catalog', requireAdmin, wrap(async (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const page = Math.min(100, Math.max(1, Math.trunc(Number(req.query.page) || 1)));
    // Reuse the public search ranking, normalization and aliases so an admin
    // can find every place that public visitors can find.
    const result = await listPlaces({ search: q, province: String(req.query.province || '').trim().slice(0, 120), page, limit: 30 });
    res.json({ places: result.attractions.map(place => ({ id: place.id, name: place.name,
      name_local: place.nameLocal, province: place.province, imageUrl: place.publishedPrimaryImage || place.imageUrl || null })), total: result.total, page });
  }));

  app.get('/api/admin/geocode', requireAdmin, wrap(async (req, res) => {
    if (typeof req.query.name !== 'string' || (req.query.province !== undefined && typeof req.query.province !== 'string') ||
        req.query.name.length > 120 || String(req.query.province || '').length > 100) {
      return res.status(400).json({ error: 'Invalid place name or province.' });
    }
    const result = await geocodeCandidates({ name: req.query.name, province: req.query.province,
      listPlaces, apiKey: process.env.GEOAPIFY_API_KEY,
      resolveNames: async name => {
        const sql = getSql();
        const rows = await sql`SELECT p.name, p.name_local FROM place_aliases a JOIN places p ON p.id = a.place_id
          WHERE a.alias_key = ${aliasKey(name)} AND a.status = 'approved' LIMIT 5`;
        return rows.flatMap(row => [row.name, row.name_local].filter(Boolean));
      },
    });
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  }));

  app.get('/api/admin/catalog/:placeId/aliases', requireAdmin, wrap(async (req, res) => {
    const sql = getSql();
    const rows = await sql`SELECT id, alias_name, language, status, created_at FROM place_aliases
      WHERE place_id = ${req.params.placeId} ORDER BY created_at DESC LIMIT 100`;
    res.json({ aliases: rows });
  }));

  app.post('/api/admin/catalog/:placeId/aliases', requireAdmin, wrap(async (req, res) => {
    const parsed = validateAlias(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const sql = getSql();
    const places = await sql`SELECT id, name, name_local FROM places WHERE id = ${req.params.placeId}`;
    if (!places.length) return res.status(404).json({ error: 'Place not found.' });
    if ([places[0].name, places[0].name_local].some(name => name && aliasKey(name) === parsed.key))
      return res.status(409).json({ error: 'Already a primary place name.' });
    const id = randomUUID();
    const inserted = await sql`INSERT INTO place_aliases (id, place_id, alias_name, alias_key, language, created_by)
      VALUES (${id}, ${req.params.placeId}, ${parsed.name}, ${parsed.key}, ${parsed.language}, ${req.auth.user.id})
      ON CONFLICT (place_id, alias_key) DO NOTHING RETURNING id`;
    if (!inserted.length) return res.status(409).json({ error: 'Alias already exists.' });
    res.status(201).json({ id, status: 'pending' });
  }));

  app.post('/api/admin/aliases/:aliasId/review', requireAdmin, wrap(async (req, res) => {
    if (!['approved', 'rejected'].includes(req.body?.status))
      return res.status(400).json({ error: 'Invalid review status.' });
    const result = await getSql().begin(async tx => {
      if (req.body.status === 'approved') {
        // Serialize approvals so two candidates cannot claim the same alias concurrently.
        await tx`LOCK TABLE place_aliases IN SHARE ROW EXCLUSIVE MODE`;
        const conflicts = await tx`SELECT a.id FROM place_aliases candidate
          JOIN place_aliases a ON a.alias_key = candidate.alias_key AND a.place_id <> candidate.place_id
          WHERE candidate.id = ${req.params.aliasId} AND a.status = 'approved' LIMIT 1`;
        if (conflicts.length) return { code: 409, error: 'This alias already belongs to another approved place.' };
        const primaryConflicts = await tx`SELECT p.id FROM place_aliases candidate JOIN places p
          ON p.id <> candidate.place_id AND (
            LOWER(TRIM(p.name)) = LOWER(candidate.alias_name) OR LOWER(TRIM(p.name_local)) = LOWER(candidate.alias_name))
          WHERE candidate.id = ${req.params.aliasId} LIMIT 1`;
        if (primaryConflicts.length) return { code: 409, error: 'This alias matches another place’s primary name.' };
      }
      const [row] = await tx`UPDATE place_aliases SET status = ${req.body.status}, reviewed_by = ${req.auth.user.id},
        reviewed_at = NOW() WHERE id = ${req.params.aliasId} AND status = 'pending' RETURNING id`;
      return row ? { code: 200, id: row.id } : { code: 404, error: 'Pending alias not found.' };
    });
    if (result.error) return res.status(result.code).json({ error: result.error });
    invalidateSearchIndex();
    res.json({ id: result.id, status: req.body.status });
  }));

  app.get('/api/admin/catalog/:placeId/media', requireAdmin, wrap(async (req, res) => {
    const sql = getSql();
    const rows = await sql`SELECT image_url FROM places WHERE id = ${req.params.placeId}`;
    if (!rows.length) return res.status(404).json({ error: 'Place not found.' });
    const media = await sql`SELECT id, url, title FROM media
      WHERE place_id = ${req.params.placeId} AND type = 'image' ORDER BY created_at ASC LIMIT 50`;
    const seen = new Set();
    const images = [rows[0].image_url && { id: 'main', url: rows[0].image_url, title: 'รูปภาพหลัก' }, ...media]
      .filter(item => item && item.url && !seen.has(item.url) && seen.add(item.url));
    res.json({ images });
  }));

  app.post('/api/admin/catalog/:placeId/edit', requireAdmin, wrap(async (req, res) => {
    const result = await getSql().begin(async tx => {
      const [place] = await tx`SELECT id, name, name_local, province, category, description, lat, lng, image_url
        FROM places WHERE id = ${req.params.placeId} FOR UPDATE`;
      if (!place) return { code: 404, error: 'Place not found.' };
      const existing = await tx`SELECT id, status, target_place_id, payload, EXTRACT(EPOCH FROM updated_at)::text AS version
        FROM place_drafts WHERE target_place_id = ${place.id} AND status = 'draft' ORDER BY updated_at DESC LIMIT 1`;
      if (existing.length) return { code: 200, draft: existing[0] };
      const id = randomUUID();
      const payload = { name: place.name, nameLocal: place.name_local || '', province: place.province,
        category: place.category, description: place.description || '', lat: place.lat, lng: place.lng, imageUrl: place.image_url || '', imageUrls: [], removedImageUrls: [] };
      const [draft] = await tx`INSERT INTO place_drafts (id, payload, author_id, target_place_id, target_updated_at)
        SELECT ${id}, ${tx.json(payload)}, ${req.auth.user.id}, id, updated_at FROM places WHERE id = ${place.id}
        RETURNING id, status, target_place_id, payload, EXTRACT(EPOCH FROM updated_at)::text AS version`;
      return { code: 201, draft };
    });
    res.status(result.code).json(result.draft || { error: result.error });
  }));

  // Google Discovery creates an ID-only draft. Google name and coordinates are
  // never persisted; the administrator supplies verified place data later.
  app.post('/api/admin/places/google-reference', requireAdmin, wrap(async (req, res) => {
    const placeId = typeof req.body?.placeId === 'string' ? req.body.placeId.trim() : '';
    if (!/^[A-Za-z0-9_-]{8,256}$/.test(placeId)) return res.status(400).json({ error: 'Invalid Google Place ID.' });
    const sql = getSql();
    const result = await sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(hashtext(${'google-place-draft:'+placeId}))`;
      const existing = await tx`SELECT id FROM place_drafts
        WHERE payload->>'googlePlaceId' = ${placeId} AND status = 'draft' LIMIT 1`;
      if (existing.length) return { code: 200, id: existing[0].id, existing: true };
      const linked = await tx`SELECT place_id FROM place_external_ids
        WHERE namespace = 'google_places' AND external_id = ${placeId} LIMIT 1`;
      if (linked.length) return { code: 409, error: 'This Google Place ID is already linked to a published place.' };
      const payload = { name: 'รอยืนยันชื่อสถานที่', nameLocal: '', province: 'ชลบุรี',
        category: 'attraction', description: '', lat: null, lng: null,
        imageUrl: '', imageUrls: [], removedImageUrls: [],
        googlePlaceId: placeId, verificationStatus: 'PENDING_VERIFICATION' };
      const id = randomUUID();
      await tx`INSERT INTO place_drafts (id, payload, author_id)
        VALUES (${id}, ${tx.json(payload)}, ${req.auth.user.id})`;
      return { code: 201, id, existing: false };
    });
    res.status(result.code).json(result.error ? { error: result.error } : {
      id: result.id, status: 'draft', verificationStatus: 'PENDING_VERIFICATION',
      existing: result.existing, coordinatesRequired: true });
  }));

  app.post('/api/admin/places', requireAdmin, wrap(async (req, res) => {
    const parsed = cleanPlace(req.body, { draft: true });
    if (parsed.errors.length) return res.status(400).json({ errors: parsed.errors });
    const sql = getSql();
    const id = randomUUID();
    const [draft] = await sql`INSERT INTO place_drafts (id, payload, author_id)
      VALUES (${id}, ${sql.json(parsed.value)}, ${req.auth.user.id})
      RETURNING id, status, payload, EXTRACT(EPOCH FROM updated_at)::text AS version`;
    res.status(201).json(draft);
  }));

  app.put('/api/admin/places/:draftId', requireAdmin, wrap(async (req, res) => {
    const parsed = cleanPlace(req.body, { draft: true });
    if (parsed.errors.length) return res.status(400).json({ errors: parsed.errors });
    const version = req.body?.version;
    if (!draftVersion(version)) return res.status(400).json({ error: 'Draft version required. Reload the draft.' });
    const sql = getSql();
    const result = await sql.begin(async tx => {
      const [draft] = await tx`SELECT status, payload, EXTRACT(EPOCH FROM updated_at)::text AS version
        FROM place_drafts WHERE id = ${req.params.draftId} FOR UPDATE`;
      if (!draft) return { code: 404, error: 'Editable draft not found.' };
      if (draft.status !== 'draft' || draft.version !== version) return { code: 409, error: 'Draft changed. Reload it before saving.' };
      if (typeof draft.payload?.googlePlaceId === 'string') parsed.value.googlePlaceId = draft.payload.googlePlaceId;
      const [saved] = await tx`UPDATE place_drafts SET payload = ${tx.json(parsed.value)},
        updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond')
        WHERE id = ${req.params.draftId}
        RETURNING id, status, payload, target_place_id, EXTRACT(EPOCH FROM updated_at)::text AS version`;
      return { code: 200, draft: saved };
    });
    res.status(result.code).json(result.draft || { error: result.error });
  }));

  app.delete('/api/admin/places/:draftId', requireAdmin, wrap(async (req, res) => {
    const version = req.body?.version;
    if (!draftVersion(version)) return res.status(400).json({ error: 'Draft version required. Reload the draft.' });
    const result = await getSql().begin(async tx => {
      const [draft] = await tx`SELECT status, payload, EXTRACT(EPOCH FROM updated_at)::text AS version
        FROM place_drafts WHERE id = ${req.params.draftId} FOR UPDATE`;
      if (!draft) return { code: 404, error: 'Draft not found.' };
      if (draft.status !== 'draft') return { code: 409, error: 'Published places cannot be deleted from drafts.' };
      if (draft.version !== version) return { code: 409, error: 'Draft changed. Reload before deleting.' };
      // Foreign keys protect linked review/import evidence. A failed delete rolls back.
      await tx`DELETE FROM place_drafts WHERE id = ${req.params.draftId} AND status = 'draft'`;
      return { code: 200, deleted: true };
    });
    res.status(result.code).json(result.error ? { error: result.error } : { deleted: true });
  }));

  const editableFields = ['name', 'nameLocal', 'province', 'category', 'description', 'lat', 'lng', 'imageUrl'];
  const placeSnapshot = place => ({
    name: place.name, nameLocal: place.name_local || '', province: place.province,
    category: place.category, description: place.description || '', lat: Number(place.lat),
    lng: Number(place.lng), imageUrl: place.image_url || '',
  });
  // A stale draft is never rebased implicitly. Admin must review and choose every field to retain.
  app.get('/api/admin/places/:draftId/reconcile', requireAdmin, wrap(async (req, res) => {
    const sql = getSql();
    const [draft] = await sql`SELECT id, status, target_place_id, payload,
      EXTRACT(EPOCH FROM updated_at)::text AS version FROM place_drafts WHERE id = ${req.params.draftId}`;
    if (!draft || draft.status !== 'draft' || !draft.target_place_id) return res.status(404).json({ error: 'Editable place draft not found.' });
    // Use PostgreSQL's exact timestamp comparison, just like the publish gate.
    // Converting timestamps to JavaScript Date first loses microseconds and can
    // incorrectly report a conflicting draft as safe to publish.
    const [place] = await sql`SELECT p.name, p.name_local, p.province, p.category,
      p.description, p.lat, p.lng, p.image_url, p.updated_at,
      p.updated_at IS DISTINCT FROM d.target_updated_at AS stale,
      EXTRACT(EPOCH FROM p.updated_at)::text AS place_version
      FROM places p JOIN place_drafts d ON d.id = ${draft.id}
      WHERE p.id = ${draft.target_place_id}`;
    if (!place) return res.status(404).json({ error: 'Published place not found.' });
    res.json({ draft: draft.payload, latest: placeSnapshot(place), version: draft.version,
      stale: place.stale, placeVersion: place.place_version,
      placeUpdatedAt: new Date(place.updated_at).toISOString(),
      fields: editableFields });
  }));

  app.post('/api/admin/places/:draftId/reconcile', requireAdmin, wrap(async (req, res) => {
    const selected = req.body?.selectedFields;
    if (!Array.isArray(selected) || selected.some(field => !editableFields.includes(field)) ||
      new Set(selected).size !== selected.length || !draftVersion(req.body?.version))
      return res.status(400).json({ error: 'Select valid fields and provide the current draft version.' });
    if (selected.includes('lat') !== selected.includes('lng'))
      return res.status(400).json({ error: 'Select both latitude and longitude together.' });
    if (req.body?.expectedPlaceVersion !== undefined && !draftVersion(req.body.expectedPlaceVersion))
      return res.status(400).json({ error: 'Invalid published-place version.' });
    const result = await getSql().begin(async tx => {
      const [draft] = await tx`SELECT *, EXTRACT(EPOCH FROM updated_at)::text AS version FROM place_drafts
        WHERE id = ${req.params.draftId} FOR UPDATE`;
      if (!draft || draft.status !== 'draft' || !draft.target_place_id) return { code: 404, error: 'Editable draft not found.' };
      if (draft.version !== req.body.version) return { code: 409, error: 'Draft changed. Reload before reconciling.' };
      const [place] = await tx`SELECT name, name_local, province, category, description, lat, lng, image_url, updated_at,
        EXTRACT(EPOCH FROM updated_at)::text AS place_version
        FROM places WHERE id = ${draft.target_place_id} FOR UPDATE`;
      if (!place) return { code: 404, error: 'Published place not found.' };
      // The opaque microsecond version is authoritative. Retain the legacy
      // millisecond field only for clients still rolling over to this API.
      const currentVersionMatches = req.body?.expectedPlaceVersion !== undefined
        ? req.body.expectedPlaceVersion === place.place_version
        : req.body?.expectedPlaceUpdatedAt === new Date(place.updated_at).toISOString();
      if (!currentVersionMatches)
        return { code: 409, error: 'Published place changed again. Reload the comparison.' };
      const latest = placeSnapshot(place);
      const payload = { ...latest };
      for (const field of selected) payload[field] = draft.payload[field] ?? latest[field];
      // Gallery modifications are an explicit separate selection, never silently replayed.
      if (req.body?.retainGallery === true) {
        payload.imageUrls = draft.payload.imageUrls || [];
        payload.removedImageUrls = draft.payload.removedImageUrls || [];
      } else {
        payload.imageUrls = [];
        payload.removedImageUrls = [];
      }
      const parsed = cleanPlace(payload);
      if (parsed.errors.length) return { code: 400, errors: parsed.errors };
      const [saved] = await tx`UPDATE place_drafts SET payload = ${tx.json(parsed.value)},
        target_updated_at = ${place.updated_at},
        updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond')
        WHERE id = ${draft.id} RETURNING id, status, target_place_id, payload,
        EXTRACT(EPOCH FROM updated_at)::text AS version`;
      return { code: 200, draft: saved };
    });
    res.status(result.code).json(result.draft || { error: result.error, errors: result.errors });
  }));

  app.post('/api/admin/places/:draftId/publish', requireAdmin, wrap(async (req, res) => {
    const sql = getSql();
    const result = await sql.begin(async tx => {
      const [draft] = await tx`SELECT *, EXTRACT(EPOCH FROM updated_at)::text AS version
        FROM place_drafts WHERE id = ${req.params.draftId} FOR UPDATE`;
      if (!draft) return { status: 404, error: 'Draft not found.' };
      if (draft.status === 'published') return { status: 200, placeId: draft.published_place_id, published: true };
      if (!draftVersion(req.body?.version)) return { status: 400, error: 'Draft version required. Reload the draft.' };
      if (draft.version !== req.body.version) return { status: 409, error: 'Draft changed. Reload it before publishing.' };
      const parsed = cleanPlace(draft.payload);
      if (parsed.errors.length) return { status: 400, errors: parsed.errors };
      const p = parsed.value;
      if (draft.payload?.googlePlaceId && p.name === 'รอยืนยันชื่อสถานที่')
        return { status: 400, error: 'Admin must verify and enter the place name before publishing.' };
      // Serialize the duplicate check and write, including publications of different drafts.
      await tx`LOCK TABLE places IN SHARE ROW EXCLUSIVE MODE`;
      // Admin direct publication retains payload, identity, conflict and duplicate protection.
      // An exact normalized name in the same province must not create a second place.
      if (!draft.target_place_id) {
        const duplicates = await tx`SELECT id FROM places
          WHERE LOWER(TRIM(province)) = LOWER(TRIM(${p.province}))
          AND (LOWER(TRIM(name)) IN (LOWER(TRIM(${p.name})), LOWER(TRIM(${p.nameLocal || p.name})))
            OR LOWER(TRIM(COALESCE(name_local,''))) IN (LOWER(TRIM(${p.name})), LOWER(TRIM(${p.nameLocal || p.name}))))
          LIMIT 1`;
        if (duplicates.length) return {status:409,error:'A place with this name already exists in this province. Edit the existing place instead.'};
      }
      if (draft.target_place_id) {
        const [current] = await tx`SELECT id, name, name_local, province, lat, lng, image_url,
          updated_at IS NOT DISTINCT FROM (SELECT target_updated_at FROM place_drafts WHERE id = ${draft.id}) AS version_matches
          FROM places WHERE id = ${draft.target_place_id} FOR UPDATE`;
        if (!current) return { status: 404, error: 'Original place no longer exists.' };
        if (!current.version_matches)
          return { status: 409, error: 'Place changed since this draft was created. Review the latest place before updating.' };
        // Explicit removal only: never erase existing gallery images merely because a draft omitted them.
        // Verify every removal belongs to this place, and do not remove the selected primary.
        if (p.removedImageUrls.includes(p.imageUrl)) return { status: 400, error: 'The primary image cannot be removed.' };
        if (p.removedImageUrls.length) {
          const existingMedia = await tx`SELECT url FROM media WHERE place_id = ${current.id} AND type = 'image'`;
          const known = new Set([current.image_url, ...existingMedia.map(item => item.url)].filter(Boolean));
          if (p.removedImageUrls.some(url => !known.has(url))) return { status: 409, error: 'Gallery changed. Reload the place before removing images.' };
          for (const url of p.removedImageUrls) {
            await tx`DELETE FROM media WHERE place_id = ${current.id} AND type = 'image' AND url = ${url}`;
          }
        }
        await tx`UPDATE places SET name = ${p.name}, name_local = ${p.nameLocal}, province = ${p.province},
          category = ${p.category}, description = ${p.description}, lat = ${p.lat}, lng = ${p.lng},
          image_url = ${p.imageUrl || null}, updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond')
          WHERE id = ${draft.target_place_id}`;
        if (current.image_url && current.image_url !== p.imageUrl && !p.removedImageUrls.includes(current.image_url)) await preservePlaceImage(tx, current.id, current.image_url, current.name);
        for (const url of p.imageUrls.filter(url => !p.removedImageUrls.includes(url))) await preservePlaceImage(tx, current.id, url, p.name);
        await tx`UPDATE place_drafts SET status = 'published', published_place_id = ${current.id}, updated_at = clock_timestamp() WHERE id = ${draft.id}`;

        await finishDirectPublication(tx, draft, current.id, req.auth.user.id);
        return { status: 200, placeId: current.id, published: true, updated: true };
      }
      const placeId = `cms:${draft.id}`;
      await tx`INSERT INTO places (id, name, name_local, province, category, description, lat, lng, image_url, source_name)
        VALUES (${placeId}, ${p.name}, ${p.nameLocal}, ${p.province}, ${p.category}, ${p.description}, ${p.lat}, ${p.lng}, ${p.imageUrl || null}, 'PaiNaiDee Admin CMS')`;
      for (const url of p.imageUrls) await preservePlaceImage(tx, placeId, url, p.name);
      await tx`UPDATE place_drafts SET status = 'published', published_place_id = ${placeId}, updated_at = clock_timestamp() WHERE id = ${draft.id}`;

      await finishDirectPublication(tx, draft, placeId, req.auth.user.id);
      return { status: 200, placeId, published: true };
    });
    if (result.published) invalidateSearchIndex();
    res.status(result.status).json(result);
  }));

  const parseImage = storage.single('image');
  app.post('/api/admin/media', requireAdmin, (req, res, next) => {
    parseImage(req, res, error => {
      if (!error) return next();
      if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be at most 5 MB.' });
      res.status(400).json({ error: 'Invalid image upload.' });
    });
  }, wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image file required (JPEG, PNG or WebP; max 5 MB).' });
    try { res.status(201).json({ imageUrl: await uploadImage(req.file) }); }
    catch (error) {
      if (error instanceof InvalidImageError) return res.status(error.status).json({ error: error.message });
      throw error;
    }
  }));
}

module.exports = { cleanPlace, registerAdminCms };
