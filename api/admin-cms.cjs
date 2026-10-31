const { randomUUID } = require('node:crypto');

function cleanPlace(input) {
  const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const name = text(input?.name, 200);
  const province = text(input?.province, 120);
  const category = text(input?.category, 120);
  const lat = Number(input?.lat);
  const lng = Number(input?.lng);
  const imageUrl = text(input?.imageUrl, 2000);
  const errors = [];
  if (!name || !province || !category) errors.push('Name, province and category are required.');
  if (input?.lat === '' || input?.lng === '' || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < 5 || lat > 21 || lng < 97 || lng > 106) errors.push('Coordinates must be within Thailand.');
  if (imageUrl && (!/^https:\/\//i.test(imageUrl) || /[\s<>]/.test(imageUrl))) errors.push('Image URL must be HTTPS.');
  if (typeof input?.description === 'string' && input.description.length > 10000) errors.push('Description is too long.');
  return {
    errors,
    value: { name, nameLocal: text(input?.nameLocal, 200), province, category,
      description: text(input?.description, 10000), lat, lng, imageUrl },
  };
}

function registerAdminCms(app, { getSql, requireAdmin, storage, uploadImage, invalidateSearchIndex = () => {} }) {
  const wrap = (handler) => async (req, res) => {
    try { await handler(req, res); }
    catch (error) {
      console.error('Admin CMS failed:', error?.message);
      res.status(503).json({ error: 'Admin CMS is unavailable.' });
    }
  };

  app.get('/api/admin/places', requireAdmin, wrap(async (_req, res) => {
    const sql = getSql();
    const drafts = await sql`SELECT id, payload, status, created_at, updated_at FROM place_drafts ORDER BY updated_at DESC LIMIT 100`;
    res.json({ drafts });
  }));

  app.post('/api/admin/places', requireAdmin, wrap(async (req, res) => {
    const parsed = cleanPlace(req.body);
    if (parsed.errors.length) return res.status(400).json({ errors: parsed.errors });
    const sql = getSql();
    const { value } = parsed;
    // Drafts are isolated from public catalog. Publication is explicit.
    const id = randomUUID();
    await sql`INSERT INTO place_drafts (id, payload, author_id) VALUES (${id}, ${sql.json(value)}, ${req.auth.user.id})`;
    res.status(201).json({ id, status: 'draft' });
  }));

  app.put('/api/admin/places/:draftId', requireAdmin, wrap(async (req, res) => {
    const parsed = cleanPlace(req.body);
    if (parsed.errors.length) return res.status(400).json({ errors: parsed.errors });
    const sql = getSql();
    const rows = await sql`UPDATE place_drafts SET payload = ${sql.json(parsed.value)}, updated_at = NOW()
      WHERE id = ${req.params.draftId} AND status = 'draft' RETURNING id`;
    if (!rows.length) return res.status(404).json({ error: 'Editable draft not found.' });
    res.json({ id: rows[0].id, status: 'draft' });
  }));

  app.post('/api/admin/places/:draftId/publish', requireAdmin, wrap(async (req, res) => {
    const sql = getSql();
    const result = await sql.begin(async tx => {
      const rows = await tx`SELECT * FROM place_drafts WHERE id = ${req.params.draftId} FOR UPDATE`;
      const draft = rows[0];
      if (!draft || draft.status !== 'draft') return { status: 404, error: 'Draft not found.' };
      const parsed = cleanPlace(draft.payload);
      if (parsed.errors.length) return { status: 400, errors: parsed.errors };
      const p = parsed.value;
      // Cross-check against existing names and near-identical coordinates, including seed data.
      const duplicates = await tx`SELECT id, name FROM places WHERE
        (LOWER(TRIM(name)) = LOWER(${p.name}) OR (name_local IS NOT NULL AND LOWER(TRIM(name_local)) = LOWER(${p.nameLocal || p.name})))
        AND LOWER(TRIM(province)) = LOWER(${p.province})
        OR (ABS(lat - ${p.lat}) < 0.0003 AND ABS(lng - ${p.lng}) < 0.0003) LIMIT 3`;
      if (duplicates.length) return { status: 409, error: 'Possible duplicate place.', duplicates };
      const placeId = `cms:${draft.id}`;
      await tx`INSERT INTO places (id, name, name_local, province, category, description, lat, lng, image_url, source_name)
        VALUES (${placeId}, ${p.name}, ${p.nameLocal}, ${p.province}, ${p.category}, ${p.description}, ${p.lat}, ${p.lng}, ${p.imageUrl || null}, 'PaiNaiDee Admin CMS')`;
      if (p.imageUrl) await tx`INSERT INTO media (id, place_id, url, type, title)
        VALUES (${`cms-media:${draft.id}`}, ${placeId}, ${p.imageUrl}, 'image', ${p.name})`;
      await tx`UPDATE place_drafts SET status = 'published', published_place_id = ${placeId}, updated_at = NOW() WHERE id = ${draft.id}`;
      return { status: 200, placeId, published: true };
    });
    if (result.published) invalidateSearchIndex();
    res.status(result.status).json(result);
  }));

  app.post('/api/admin/media', requireAdmin, storage.single('image'), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image file required (JPEG, PNG or WebP; max 5 MB).' });
    try { res.status(201).json({ imageUrl: await uploadImage(req.file) }); }
    catch (error) { res.status(400).json({ error: error.message }); }
  }));
}

module.exports = { cleanPlace, registerAdminCms };
