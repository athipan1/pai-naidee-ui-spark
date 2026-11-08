'use strict';
const { licenseAllowed } = require('./place-media-quality.cjs');
const provided = require('./user-provided-place-media.json');
const reviewed = require('./curated-wikimedia-media.json');
const FALLBACK = '/placeholder-attraction.svg';
function safeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password &&
      !/(^|\.)(googleusercontent\.com|googleapis\.com|ggpht\.com|gstatic\.com)$/.test(u.hostname);
  } catch { return false; }
}
function photoCredit(item, placeId) {
  if (!safeUrl(item.url)) return null;
  const base = process.env.PUBLIC_API_BASE_URL || 'https://painaidee-api-production.up.railway.app';
  const u = new URL(item.url);
  // IDs and lookalike paths on external origins never establish upload ownership.
  const cms = item.id?.startsWith('cms-media:') && u.origin === new URL(base).origin &&
    /^\/api\/media\/cms\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(u.pathname) && !u.search && !u.hash;
  const legacy = provided.some(p => p.id === item.id && p.url === item.url && p.placeId === placeId);
  if (cms || legacy) return {url:item.url,photographer:'PaiNaiDee Admin upload',
    licenseName:'Admin-provided photo for PaiNaiDee',licenseUrl:'',sourcePage:'',kind:'user-provided'};
  const recordedReview = reviewed.some(p => p.placeId === placeId && p.url === item.url && p.photographer === item.creatorName && p.licenseName === item.licenseName && p.licenseUrl === item.licenseUrl && p.sourcePage === item.sourcePage);
  if (!item.creatorName?.trim() || !safeUrl(item.sourcePage) || !safeUrl(item.licenseUrl) ||
      !(recordedReview || licenseAllowed(item.licenseName, item.licenseUrl))) return null;
  return {url:item.url,photographer:item.creatorName,licenseName:item.licenseName,
    licenseUrl:item.licenseUrl,sourcePage:item.sourcePage,
    kind:item.sourcePage.startsWith('https://commons.wikimedia.org/')?'commons':'licensed-source'};
}
function publishedPlaceImages(row, media) {
  // Legacy records without a selected primary use the existing deterministic media
  // order. Once places.image_url is set it always wins, even if missing/unusable.
  const primary = row.image_url || media[0]?.url || null;
  const issues = [];
  const credits = new Map();
  const seen = new Set();
  for (const item of media) {
    if (seen.has(item.url)) issues.push('duplicate_gallery_url');
    seen.add(item.url);
    const credit = photoCredit(item, row.id);
    if (credit) credits.set(item.url, credit);
    else issues.push('gallery_credit_or_rights_missing');
  }
  if (!primary) issues.push('primary_missing');
  else if (!credits.has(primary)) issues.push('primary_credit_or_rights_missing');
  if (row.image_url && !seen.has(row.image_url)) issues.push('primary_not_in_gallery');
  const image = primary && credits.has(primary) ? primary : FALLBACK;
  const images = [image, ...credits.keys()].filter((url, i, all) => all.indexOf(url) === i);
  return {image,images,publishedPrimaryImage:primary,mediaCredits:[...credits.values()],imageIssues:[...new Set(issues)]};
}
module.exports = { publishedPlaceImages, photoCredit, safeUrl, FALLBACK };
