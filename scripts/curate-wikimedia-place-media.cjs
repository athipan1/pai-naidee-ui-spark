#!/usr/bin/env node
// One-time, reviewable Wikimedia metadata harvest. Not run by the API at boot.
// The generated manifest records image URLs, creator and license; no image is
// accepted merely because a search returned a similarly named location.
const { execFileSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { SEED_PLACES } = require('../api/postgres-db.cjs');

const outFile = resolve(__dirname, '../api/curated-wikimedia-media.json');

function getJson(url) {
  const data = execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--location', '--retry', '2',
    '--max-time', '30', '--user-agent', 'PaiNaiDeePhotoCurator/1.0 (attribution-preserving Wikimedia metadata)', url,
  ], { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  return JSON.parse(data);
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[_()–—-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleForPlace(place) {
  const match = place.sourceUrl?.match(/^https:\/\/(en|fr|th)\.wikipedia\.org\/wiki\/([^#?]+)/);
  if (match) return { language: match[1], title: decodeURIComponent(match[2]).replace(/_/g, ' '), sourced: true };
  if (place.name === 'Floating Market' || place.name === 'Bridge on the River Kwai') return null;
  return { language: 'en', title: place.name, sourced: false };
}

function batches(items, size = 30) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
}

function plain(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function creatorName(value) {
  const text = plain(value);
  // Some Commons Artist fields contain a paragraph asking for attribution;
  // preserve the actual photographer's name, not a cut-off request sentence.
  const photographer = /^This Photo was taken by (.+?)\s*\./i.exec(text);
  return photographer ? photographer[1].trim() : text;
}

function eligibleLicense(metadata) {
  const licenseName = plain(metadata?.LicenseShortName?.value);
  const licenseUrl = String(metadata?.LicenseUrl?.value || '');
  const isFree = /^https:\/\/creativecommons\.org\/licenses\/(?:by|by-sa)\/[1-4]\.0(?:\/|$)/.test(licenseUrl)
    || /^https:\/\/creativecommons\.org\/publicdomain\//.test(licenseUrl)
    || /^(?:Public domain|PD-old|PD-self|PD-US|CC0 1\.0)$/i.test(licenseName);
  if (!isFree) return null;
  // Reuse only files whose license information can be linked by site visitors.
  if (!/^https:\/\/(?:creativecommons\.org|creativecommons\.net)\//.test(licenseUrl)
      && !/Public domain|^PD-/i.test(licenseName)) return null;
  return { licenseName, licenseUrl: licenseUrl || 'https://commons.wikimedia.org/wiki/Commons:Licensing' };
}

function articleLooksRelevant(place, title, extract, sourced) {
  if (sourced) return true;
  const resolved = normalizeTitle(title);
  const requested = normalizeTitle(place.name);
  if (resolved !== requested) return false;
  return /Thailand|Thai|province|Bangkok|Buddhist|Siam|Ayutthaya|Phuket/i.test(extract);
}

function main() {
  const candidates = SEED_PLACES.map(place => ({ place, article: titleForPlace(place) }))
    .filter(entry => entry.article);
  const resolvedPages = new Map();

  for (const language of new Set(candidates.map(x => x.article.language))) {
    const entries = candidates.filter(x => x.article.language === language);
    for (const group of batches(entries)) {
      const query = new URLSearchParams({
        action: 'query', format: 'json', formatversion: '2', redirects: '1',
        prop: 'pageimages|extracts', piprop: 'name|thumbnail', pithumbsize: '800',
        exintro: '1', explaintext: '1', titles: group.map(x => x.article.title).join('|'),
      });
      const result = getJson(`https://${language}.wikipedia.org/w/api.php?${query}`);
      const aliases = new Map();
      for (const changed of [...(result.query?.normalized || []), ...(result.query?.redirects || [])]) {
        aliases.set(normalizeTitle(changed.from), normalizeTitle(changed.to));
      }
      const pageByTitle = new Map((result.query?.pages || []).map(page => [normalizeTitle(page.title), page]));
      for (const { place, article } of group) {
        let title = normalizeTitle(article.title);
        for (let i = 0; i < 3 && aliases.has(title); i++) title = aliases.get(title);
        const page = pageByTitle.get(title);
        const extract = plain(page?.extract || '').slice(0, 1600);
        if (!page?.pageimage || !articleLooksRelevant(place, page.title, extract, article.sourced)) continue;
        const filename = page.pageimage;
        if (!/\.(jpg|jpeg|png|webp)$/i.test(filename) || /\b(flag|map|locator|emblem|logo|diagram|symbol)\b/i.test(filename)) continue;
        resolvedPages.set(place.id, {
          place, filename, extract,
          articleUrl: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
        });
      }
    }
  }

  const photoByFilename = new Map();
  const filenames = [...new Set([...resolvedPages.values()].map(x => x.filename))];
  for (const group of batches(filenames, 25)) {
    const query = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2',
      prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '800',
      titles: group.map(x => `File:${x}`).join('|'),
    });
    const result = getJson(`https://commons.wikimedia.org/w/api.php?${query}`);
    for (const page of result.query?.pages || []) {
      if (page.missing || !page.imageinfo?.[0]) continue;
      const file = page.imageinfo[0];
      const license = eligibleLicense(file.extmetadata);
      const author = creatorName(file.extmetadata?.Artist?.value);
      const filePage = file.descriptionurl;
      if (!license || !author || author.length > 500 || !file.thumburl || !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(filePage)) continue;
      const filename = page.title.replace(/^File:/, '').replace(/_/g, ' ');
      photoByFilename.set(normalizeTitle(filename), {
        url: file.thumburl.split('?')[0],
        sourcePage: filePage, photographer: author,
        ...license,
      });
    }
  }

  const manifest = [];
  for (const place of SEED_PLACES) {
    const page = resolvedPages.get(place.id);
    const photo = page && photoByFilename.get(normalizeTitle(page.filename.replace(/_/g, ' ')));
    if (!photo) continue;
    manifest.push({
      placeId: place.id,
      placeName: place.name,
      url: photo.url,
      filename: page.filename,
      sourcePage: photo.sourcePage,
      photographer: photo.photographer,
      licenseName: photo.licenseName,
      licenseUrl: photo.licenseUrl,
      detailText: page.extract,
      detailSourceUrl: page.articleUrl,
    });
  }

  writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);
  const misses = SEED_PLACES.filter(place => !manifest.some(photo => photo.placeId === place.id));
  process.stdout.write(JSON.stringify({
    totalPlaces: SEED_PLACES.length, imageMatched: manifest.length,
    missingNames: misses.map(place => place.name), output: outFile,
  }, null, 2) + '\n');
}

main();
