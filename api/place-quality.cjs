// Read-only checks for curated seed imports. No database or network access.
const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { PROVINCE_EN } = require('./place-localizations.cjs');

const VALID_CATEGORIES = new Set(['Beach', 'Nature', 'Culture', 'Food']);
const VALID_PROVINCES = new Set(Object.keys(PROVINCE_EN));
const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[\s\u200b\-_.()]+/g, '');

function safeHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && Boolean(url.hostname); }
  catch { return false; }
}

function auditPlaceImport({ places, wikimediaMedia = [], missingMedia = [], userMedia = [], requireFullCoverage = false }) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(places)) return { errors: ['places must be an array'], warnings, coverage: null };
  const ids = new Set();
  const names = new Map();
  const nameEn = new Map();
  const coords = new Map();
  const provinces = new Set();

  for (const place of places) {
    const id = String(place?.id || '');
    if (!id.trim()) errors.push('place missing id');
    else if (ids.has(id)) errors.push(`${id}: duplicate ID`);
    ids.add(id);
    if (!place?.name || !String(place.name).trim()) errors.push(`${id}: missing English name`);
    if (!place?.nameLocal || !/[\u0e01-\u0e5b]/.test(place.nameLocal)) errors.push(`${id}: invalid Thai name`);
    if (!VALID_PROVINCES.has(place?.province)) errors.push(`${id}: unknown province ${place?.province}`);
    else provinces.add(place.province);
    if (!VALID_CATEGORIES.has(place?.category)) errors.push(`${id}: invalid category`);
    if (!place?.description || String(place.description).trim().length < 15) errors.push(`${id}: description too short`);
    if (!place?.sourceName || !safeHttps(place.sourceUrl)) errors.push(`${id}: missing/invalid HTTPS provenance`);
    if (!Number.isFinite(place?.lat) || !Number.isFinite(place?.lng) ||
        place.lat < 5 || place.lat > 21 || place.lng < 97 || place.lng > 106) {
      errors.push(`${id}: coordinates outside Thailand bounds or not numeric`);
    } else {
      const pin = `${place.lat.toFixed(5)},${place.lng.toFixed(5)}`;
      if (coords.has(pin)) warnings.push(`${id}: shares approximate pin with ${coords.get(pin)}; verify distinct locations`);
      else coords.set(pin, id);
    }
    for (const [label, value, index] of [
      ['Thai', place?.nameLocal, names], ['English', place?.name, nameEn],
    ]) {
      const key = `${place?.province}:${normalize(value)}`;
      if (normalize(value)) {
        if (index.has(key)) errors.push(`${id}: duplicate ${label} name in province (matches ${index.get(key)})`);
        else index.set(key, id);
      }
    }
    if (place?.rating !== 0 || place?.reviewCount !== 0) errors.push(`${id}: unverified seed rating/review count`);
    if (place?.imageUrl != null && !safeHttps(place.imageUrl)) errors.push(`${id}: invalid image URL`);
  }

  const mediaUrls = new Map();
  // Railway deploys from api/ and does not contain frontend public/ assets.
  // CI running from the full repository must still verify each asset exists.
  const localPhotoDirectory = join(__dirname, '..', 'public', 'place-photos');
  const canInspectLocalPhotos = existsSync(localPhotoDirectory);
  for (const [kind, collection] of [['Wikimedia', wikimediaMedia], ['Wikimedia', missingMedia], ['user', userMedia]]) {
    if (!Array.isArray(collection)) { errors.push(`${kind}: media list is not an array`); continue; }
    for (const photo of collection) {
      const placeId = String(photo?.placeId || '');
      if (!ids.has(placeId)) errors.push(`${kind}: photo references unknown place ${placeId}`);
      if (!safeHttps(photo?.url)) errors.push(`${kind}: ${placeId} has invalid image URL`);
      else if (mediaUrls.has(photo.url) && mediaUrls.get(photo.url) !== placeId) {
        errors.push(`${kind}: same image URL reused across ${placeId} and ${mediaUrls.get(photo.url)}`);
      } else mediaUrls.set(photo.url, placeId);
      if (kind === 'Wikimedia') {
        if (!/^https:\/\/(?:thumb|upload)\.wikimedia\.org\/|^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\//.test(photo?.url || ''))
          errors.push(`${placeId}: Wikimedia photo is not from Wikimedia CDN/Commons`);
        if (!photo?.photographer || !photo?.licenseName || !safeHttps(photo?.licenseUrl) ||
            !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(photo?.sourcePage || '')) {
          errors.push(`${placeId}: Wikimedia photo missing creator, license or source page`);
        }
      } else {
        if (!photo?.id || !photo?.filename ||
            photo?.url !== `https://pai-naidee-ui-spark.vercel.app/place-photos/${photo.filename}` ||
            (canInspectLocalPhotos && !existsSync(join(localPhotoDirectory, photo.filename)))) {
          errors.push(`${placeId}: user photo URL/local asset mismatch`);
        }
        if (photo?.licenseName || photo?.licenseUrl) warnings.push(`${placeId}: user photo license attribution needs explicit user evidence`);
      }
    }
  }
  const missingProvinces = [...VALID_PROVINCES].filter(p => !provinces.has(p));
  if (VALID_PROVINCES.size !== 77) errors.push(`province reference must contain 77 provinces, found ${VALID_PROVINCES.size}`);
  if (requireFullCoverage && missingProvinces.length) errors.push(`province coverage incomplete: ${missingProvinces.join(', ')}`);
  const photoPlaces = new Set([...wikimediaMedia, ...missingMedia, ...userMedia].map(photo => photo.placeId));
  const noPhoto = [...ids].filter(id => !photoPlaces.has(id));
  if (userMedia.length && !canInspectLocalPhotos) warnings.push('Frontend public/ photo assets are unavailable in API-only deploy; CI validates files in full repository');
  if (noPhoto.length) warnings.push(`${noPhoto.length} places have no verified photograph; leave image empty until sourced`);
  return {
    errors, warnings,
    coverage: { places: places.length, provinces: provinces.size, totalProvinces: VALID_PROVINCES.size,
      missingProvinces, verifiedPhotoPlaces: photoPlaces.size, withoutVerifiedPhoto: noPhoto.length },
  };
}

function assertPlaceImportReady(input) {
  const audit = auditPlaceImport(input);
  if (audit.errors.length) throw new Error(`Place import blocked (${audit.errors.length} issues):\n${audit.errors.join('\n')}`);
  return audit;
}

module.exports = { auditPlaceImport, assertPlaceImportReady };
