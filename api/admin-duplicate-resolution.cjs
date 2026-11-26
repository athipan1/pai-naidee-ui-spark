'use strict';

const { createHash, randomUUID } = require('node:crypto');
const { isGooglePlaceId } = require('./admin-direct-publication.cjs');

const fields = ['name', 'nameLocal', 'description', 'descriptionEn', 'province', 'coordinates', 'categories', 'tags'];
const clearable = new Set(['nameLocal', 'description', 'descriptionEn', 'tags']);
const mergeable = new Set(['categories', 'tags']);
const version = value => typeof value === 'string' && /^\d{1,12}\.\d{6}$/.test(value);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const distinct = values => [...new Set(values.filter(Boolean))];
const error = (status, code, message) => ({ status, code, error: message });

function externalIdentities(payload) {
  const source = payload.autoFillSource;
  const sources = {
    'Tourism Authority of Thailand — Open Data': 'tat',
    'Geoapify / OpenStreetMap': 'geoapify',
  };
  return [
    isGooglePlaceId(payload.googlePlaceId) && { namespace: 'google_places', external_id: payload.googlePlaceId },
    typeof source?.id === 'string' && source.id && Object.hasOwn(sources, source.name) &&
      { namespace: sources[source.name], external_id: source.id },
  ].filter(Boolean);
}

async function findDuplicatePlaces(sql, payload) {
  const nameLocal = payload.nameLocal || payload.name;
  const identities = externalIdentities(payload);
  return sql`WITH matches AS (
    SELECT p.id, TRUE AS name_match, FALSE AS identity_match FROM places p
    WHERE LOWER(TRIM(p.province)) = LOWER(TRIM(${payload.province}))
      AND (LOWER(TRIM(p.name)) IN (LOWER(TRIM(${payload.name})), LOWER(TRIM(${nameLocal})))
       OR LOWER(TRIM(COALESCE(p.name_local,''))) IN (LOWER(TRIM(${payload.name})), LOWER(TRIM(${nameLocal}))))
    UNION ALL
    SELECT p.place_id, FALSE, TRUE FROM place_external_ids p
      JOIN jsonb_to_recordset(${sql.json(identities)}::jsonb) AS i(namespace TEXT, external_id TEXT)
        USING (namespace, external_id)
  ), candidates AS (
    SELECT id, BOOL_OR(name_match) AS name_match, BOOL_OR(identity_match) AS identity_match FROM matches GROUP BY id
  )
  SELECT p.id, p.name, p.name_local, p.province, p.category, p.lat, p.lng, p.image_url,
    c.name_match, c.identity_match
  FROM candidates c JOIN places p USING (id)
  ORDER BY c.identity_match DESC, c.name_match DESC, p.id`;
}

function duplicateResponse(matches, existingTarget) {
  return {
    ...error(409, 'DUPLICATE_PLACE', 'พบสถานที่นี้ในระบบแล้ว'),
    conflictType: matches.length > 1 ? 'MULTIPLE_CONFLICT_CANDIDATES'
      : matches[0].identity_match ? 'EXTERNAL_IDENTITY_MATCH' : 'EXACT_NAME_MATCH',
    existingPlaces: matches.map(row => ({
      placeId: row.id, name: row.name, nameLocal: row.name_local, province: row.province,
      category: row.category, lat: row.lat, lng: row.lng, imageUrl: row.image_url,
      reasons: [row.name_match && 'EXACT_NAME_MATCH', row.identity_match && 'EXTERNAL_IDENTITY_MATCH'].filter(Boolean),
      canResolve: !existingTarget && (!matches.some(match => match.identity_match) || row.identity_match),
    })),
    availableActions: ['VIEW_EXISTING', ...(!existingTarget ? ['RESOLVE_WITH_DRAFT'] : []), 'RETURN_TO_DRAFT'],
  };
}

async function gallerySnapshot(sql, placeId, primary) {
  const rows = await sql`SELECT id, url, title, description, creator_name, license_name, license_url, source_page
    FROM media WHERE place_id = ${placeId} AND type = 'image' ORDER BY id`;
  return { version: hash([primary, rows]), urls: distinct([primary, ...rows.map(row => row.url)]) };
}

const snapshot = row => ({
  name: row.name, nameLocal: row.name_local || '', description: row.description || '',
  descriptionEn: row.description_en || '', province: row.province, lat: row.lat, lng: row.lng,
  category: row.category, categories: row.categories?.length ? row.categories : [row.category],
  tags: row.tags || [], imageUrl: row.image_url || '', imageUrls: [], removedImageUrls: [],
});

function mergeLabels(base, incoming) {
  const seen = new Set();
  return [...base, ...incoming].filter(value => {
    const key = value.trim().normalize('NFC').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const galleryUrls = payload => distinct([payload.imageUrl, ...(Array.isArray(payload.imageUrls) ? payload.imageUrls : [])]);

function applySelection(base, source, choices, imageUrls, primaryImage, publishedGallery) {
  const payload = { ...base, imageUrls: distinct([...(base.imageUrls || []), ...imageUrls]) };
  for (const field of fields) {
    const choice = choices[field];
    if (!choice || choice === 'keep') continue;
    if (choice === 'clear') {
      payload[field] = field === 'tags' ? [] : '';
      continue;
    }
    if (field === 'coordinates') {
      if (source.lat == null || source.lng == null) return null;
      Object.assign(payload, { lat: source.lat, lng: source.lng });
      continue;
    }
    if (field === 'categories' || field === 'tags') {
      const incoming = field === 'categories'
        ? distinct([source.category, ...(source.categories || [])]) : source.tags;
      if (!incoming?.length) return null;
      payload[field] = choice === 'merge' ? mergeLabels(base[field] || [], incoming) : incoming;
      if (field === 'categories' && choice === 'draft') payload.category = source.category;
      continue;
    }
    if (typeof source[field] !== 'string' || !source[field].trim()) return null;
    payload[field] = source[field];
  }
  const retained = [...publishedGallery, ...galleryUrls(payload)].filter(url => !payload.removedImageUrls?.includes(url));
  if (primaryImage !== undefined) {
    if (!retained.includes(primaryImage)) return null;
    payload.imageUrl = primaryImage;
  }
  return payload;
}

function validateRequest(body) {
  const { targetPlaceId, sourceVersion, targetVersion, galleryVersion, editVersion, choices, imageUrls, primaryImage, preview, confirmGoogleIdentity } = body || {};
  if (typeof targetPlaceId !== 'string' || !targetPlaceId || targetPlaceId.length > 200 || !version(sourceVersion) ||
    !version(targetVersion) || typeof galleryVersion !== 'string' || !/^[a-f0-9]{64}$/.test(galleryVersion) ||
    (editVersion !== null && !version(editVersion)) ||
    !choices || typeof choices !== 'object' || Array.isArray(choices) ||
    Object.entries(choices).some(([field, choice]) => !fields.includes(field) ||
      !(['keep', 'draft'].includes(choice) || choice === 'clear' && clearable.has(field) || choice === 'merge' && mergeable.has(field))) ||
    !Array.isArray(imageUrls) || imageUrls.length > 20 || imageUrls.some(url => typeof url !== 'string' || url.length > 2000) ||
    (primaryImage !== undefined && (typeof primaryImage !== 'string' || primaryImage.length > 2000)) ||
    (preview !== undefined && typeof preview !== 'boolean') ||
    (confirmGoogleIdentity !== undefined && typeof confirmGoogleIdentity !== 'boolean')) return null;
  return { targetPlaceId, sourceVersion, targetVersion, galleryVersion, editVersion, choices: Object.fromEntries(
    Object.entries(choices).sort(([a], [b]) => a.localeCompare(b))), imageUrls: distinct(imageUrls), primaryImage,
    ...(confirmGoogleIdentity === true && { confirmGoogleIdentity: true }), preview: preview === true };
}

async function readDraft(sql, id, lock) {
  return (await sql`SELECT id, status, target_place_id, payload, EXTRACT(EPOCH FROM updated_at)::text AS version
    FROM place_drafts WHERE id = ${id} ${lock ? sql`FOR UPDATE` : sql``}`)[0];
}

async function comparison(sql, draft, id, lock) {
  const candidates = await findDuplicatePlaces(sql, draft.payload);
  const identityMatch = candidates.some(candidate => candidate.identity_match);
  if (!candidates.some(candidate => candidate.id === id && (!identityMatch || candidate.identity_match)))
    return error(409, 'INVALID_CONFLICT_TARGET', 'สถานที่นี้ไม่ใช่รายการซ้ำที่ยืนยันได้');
  const [place] = await sql`SELECT id, name, name_local, description, description_en, province, category, categories,
    tags, lat, lng, image_url, EXTRACT(EPOCH FROM updated_at)::text AS version
    FROM places WHERE id = ${id} ${lock ? sql`FOR UPDATE` : sql``}`;
  if (!place) return error(404, 'TARGET_NOT_FOUND', 'ไม่พบสถานที่เดิม');
  const edits = await sql`SELECT id, status, target_place_id, payload,
    EXTRACT(EPOCH FROM updated_at)::text AS version,
    target_updated_at IS DISTINCT FROM (SELECT updated_at FROM places WHERE id = ${id}) AS stale
    FROM place_drafts WHERE target_place_id = ${id} AND status = 'draft' ORDER BY id LIMIT 2
    ${lock ? sql`FOR UPDATE` : sql``}`;
  if (edits.length > 1) return error(409, 'MULTIPLE_EDIT_DRAFTS', 'มีฉบับร่างแก้ไขหลายรายการ กรุณาตรวจสอบในรายการฉบับร่าง');
  const gallery = await gallerySnapshot(sql, id, place.image_url);
  return { place, edit: edits[0] || null, gallery };
}

function reviewableGoogleId(payload, cleanPlace) {
  const { googlePlaceId, name } = payload;
  // The reference endpoint validates and stores only the provider ID. The
  // existing manual publish policy requires completed, independently entered
  // place fields; a placeholder or incomplete import is not confirmation.
  return isGooglePlaceId(googlePlaceId) && name !== 'รอยืนยันชื่อสถานที่' && !cleanPlace(payload).errors.length
    ? googlePlaceId : null;
}

function registerDuplicateResolution(app, { requireAdmin, wrap, getSql, cleanPlace, verifyMedia }) {
  const path = '/api/admin/places/:draftId/duplicate-resolution';
  app.get(path, requireAdmin, wrap(async (req, res) => {
    const target = req.query.targetPlaceId;
    const sql = getSql();
    const source = await readDraft(sql, req.params.draftId, false);
    if (!source || source.status !== 'draft' || source.target_place_id)
      return res.status(404).json(error(404, 'SOURCE_NOT_FOUND', 'ไม่พบฉบับร่างต้นทาง'));
    const receipt = source.payload._duplicateReceipt;
    if (receipt) {
      const linkedDraft = await readDraft(sql, receipt.editId, false);
      if (linkedDraft) return res.json({ linkedDraft });
    }
    if (typeof target !== 'string' || !target || target.length > 200)
      return res.status(400).json(error(400, 'INVALID_TARGET', 'กรุณาเลือกสถานที่เดิม'));
    const data = await comparison(sql, source, target, false);
    if (data.error) return res.status(data.status).json(data);
    res.json({
      source: Object.fromEntries([...fields, 'category', 'lat', 'lng', 'imageUrl', 'imageUrls']
        .map(key => [key, source.payload[key]])), published: snapshot(data.place), existingEdit: data.edit,
      gallery: data.gallery.urls, sourceVersion: source.version, targetVersion: data.place.version,
      galleryVersion: data.gallery.version, fields,
      googlePlaceIdForReview: reviewableGoogleId(source.payload, cleanPlace),
    });
  }));

  app.post(path, requireAdmin, wrap(async (req, res) => {
    const request = validateRequest(req.body);
    if (!request) return res.status(400).json(error(400, 'INVALID_SELECTION', 'ข้อมูลเปรียบเทียบหรือฟิลด์ที่เลือกไม่ถูกต้อง'));
    const { preview, ...selection } = request;
    const fingerprint = hash(selection);
    const sql = getSql();
    // Storage checks do not hold publication locks. The transaction rechecks
    // the exact source version and permits only URLs from that same draft.
    const preliminary = await readDraft(sql, req.params.draftId, false);
    const checked = new Set();
    if (preliminary?.status === 'draft' && !preliminary.target_place_id &&
      preliminary.version === request.sourceVersion && request.imageUrls.length) {
      const allowed = galleryUrls(preliminary.payload);
      if (request.imageUrls.some(url => !allowed.includes(url)))
        return res.status(400).json(error(400, 'INVALID_MEDIA_REFERENCE', 'รูปภาพไม่ได้อยู่ในฉบับร่างต้นทาง'));
      const rows = await sql`SELECT DISTINCT url FROM media WHERE type = 'image' AND url IN ${sql(request.imageUrls)}`;
      const knownUrls = new Set(rows.map(row => row.url));
      for (let start = 0; start < request.imageUrls.length; start += 3) {
        const batch = request.imageUrls.slice(start, start + 3);
        const verified = await Promise.all(batch.map(url => verifyMedia(url, knownUrls.has(url))));
        if (!verified.every(Boolean))
          return res.status(400).json(error(400, 'INVALID_MEDIA_REFERENCE', 'ยืนยันรูปภาพต้นทางไม่ได้'));
        batch.forEach(url => checked.add(url));
      }
    }
    const result = await sql.begin(async tx => {
      // Match publish lock order so edit publication and resolution cannot
      // hold opposite row locks while waiting for the catalogue lock.
      if (!preview) await tx`LOCK TABLE places IN SHARE ROW EXCLUSIVE MODE`;
      const source = await readDraft(tx, req.params.draftId, !preview);
      if (!source || source.status !== 'draft' || source.target_place_id)
        return error(404, 'SOURCE_NOT_FOUND', 'ไม่พบฉบับร่างต้นทาง');
      const receipt = source.payload._duplicateReceipt;
      if (receipt) {
        const draft = await readDraft(tx, receipt.editId, false);
        if (draft) return !preview && receipt.fingerprint === fingerprint
          ? { status: 200, draft, replayed: true }
          : error(409, 'SOURCE_ALREADY_RESOLVED', 'ข้อมูลถูกนำเข้าฉบับร่างเดิมแล้ว กรุณาเปิดฉบับร่างนั้น');
      }
      if (source.version !== request.sourceVersion)
        return error(409, 'DRAFT_VERSION_CONFLICT', 'ฉบับร่างต้นทางเปลี่ยนแล้ว กรุณาเปรียบเทียบใหม่');
      const confirmedGoogleId = request.confirmGoogleIdentity ? reviewableGoogleId(source.payload, cleanPlace) : null;
      if (request.confirmGoogleIdentity && !confirmedGoogleId)
        return error(400, 'GOOGLE_IDENTITY_NOT_CONFIRMABLE', 'กรุณาตรวจสอบและกรอกข้อมูลฉบับร่าง Google ให้ครบก่อนยืนยันรหัสสถานที่');
      if (!preview) await tx`LOCK TABLE media IN SHARE MODE`;
      const data = await comparison(tx, source, request.targetPlaceId, !preview);
      if (data.error) return data;
      if (data.place.version !== request.targetVersion)
        return error(409, 'TARGET_PLACE_VERSION_CONFLICT', 'สถานที่เดิมเปลี่ยนแล้ว กรุณาเปรียบเทียบใหม่');
      if (data.gallery.version !== request.galleryVersion)
        return error(409, 'GALLERY_VERSION_CONFLICT', 'แกลเลอรีเปลี่ยนแล้ว กรุณาเปรียบเทียบใหม่');
      if ((data.edit?.version ?? null) !== request.editVersion || data.edit?.stale)
        return error(409, 'EDIT_DRAFT_VERSION_CONFLICT', 'ฉบับร่างแก้ไขเปลี่ยนหรือเก่ากว่าข้อมูลเผยแพร่ กรุณาเปิดฉบับร่างเดิม');
      if (request.imageUrls.some(url => !checked.has(url) || !galleryUrls(source.payload).includes(url)))
        return error(400, 'INVALID_MEDIA_REFERENCE', 'ยืนยันรูปภาพต้นทางไม่ได้');
      const published = snapshot(data.place);
      // Older Edit Drafts may omit fields whose published values are inherited.
      const base = { ...published, ...data.edit?.payload };
      const payload = applySelection(base, source.payload, request.choices, request.imageUrls, request.primaryImage, data.gallery.urls);
      if (!payload) return error(400, 'INVALID_SELECTION', 'ข้อมูลว่างหรือรูปภาพที่เลือกไม่พร้อมใช้งาน');
      const parsed = cleanPlace(payload);
      if (parsed.errors.length) return { status: 400, errors: parsed.errors };
      const googleId = data.edit?.payload.googlePlaceId;
      const selectedConflicts = await findDuplicatePlaces(tx, { ...parsed.value, googlePlaceId: googleId, autoFillSource: base.autoFillSource });
      const others = selectedConflicts.filter(candidate => candidate.id !== data.place.id);
      // Existing duplicate names are left alone unless this edit changes the
      // identity fields. An external identity collision is always rejected.
      const changedIdentity = ['name', 'nameLocal', 'province'].some(field => parsed.value[field] !== published[field]);
      if (others.some(candidate => candidate.identity_match || changedIdentity)) return duplicateResponse(others, true);
      if (preview) return { status: 200, confirmedGoogleId, preview: { ...parsed.value,
        imageUrls: distinct([...data.gallery.urls, ...galleryUrls(parsed.value)]).filter(url => !parsed.value.removedImageUrls.includes(url)) } };

      const googleIdentityConfirmations = new Map((base._duplicateEdit?.googleIdentityConfirmations ?? [])
        .map(confirmation => [confirmation.id, confirmation]));
      if (confirmedGoogleId && !googleIdentityConfirmations.has(confirmedGoogleId))
        googleIdentityConfirmations.set(confirmedGoogleId, { id: confirmedGoogleId, confirmedBy: req.auth.user.id });
      const metadata = { googleIdentityConfirmations: [...googleIdentityConfirmations.values()], sourceDraftIds: distinct([...(base._duplicateEdit?.sourceDraftIds || []), source.id]),
        galleryVersion: data.gallery.version,
        externalIds: [...new Map([...(base._duplicateEdit?.externalIds || []), ...externalIdentities(source.payload)]
          .map(identity => [JSON.stringify(identity), identity])).values()] };
      const next = { ...parsed.value, ...(googleId ? { googlePlaceId: googleId } : {}),
        ...(base.autoFillSource ? { autoFillSource: base.autoFillSource } : {}), _duplicateEdit: metadata };
      const id = data.edit?.id ?? randomUUID();
      const [draft] = data.edit
        ? await tx`UPDATE place_drafts SET payload = ${tx.json(next)},
            updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond') WHERE id = ${id}
            RETURNING id, status, target_place_id, payload, EXTRACT(EPOCH FROM updated_at)::text AS version`
        : await tx`INSERT INTO place_drafts (id, payload, author_id, target_place_id, target_updated_at)
            SELECT ${id}, ${tx.json(next)}, ${req.auth.user.id}, id, updated_at FROM places WHERE id = ${data.place.id}
            RETURNING id, status, target_place_id, payload, EXTRACT(EPOCH FROM updated_at)::text AS version`;
      await tx`UPDATE place_drafts SET payload = payload || ${tx.json({ _duplicateReceipt: { editId: id, fingerprint } })}::jsonb,
        updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond') WHERE id = ${source.id}`;
      return { status: data.edit ? 200 : 201, draft };
    });
    res.status(result.status).json(result);
  }));
}

module.exports = { findDuplicatePlaces, duplicateResponse, registerDuplicateResolution, gallerySnapshot, applySelection };
