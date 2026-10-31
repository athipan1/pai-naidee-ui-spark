const { test } = require('node:test');
const assert = require('node:assert/strict');
const { geocodeCandidates, isThailandCoordinate, matchesPlaceName, searchNames } = require('./admin-geocode.cjs');

test('geocoding searches existing Railway places without a paid provider', async () => {
  const calls = [];
  const result = await geocodeCandidates({ name: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
    listPlaces: async options => {
      calls.push(options);
      return { attractions: [{ nameLocal: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
        coordinates: { lat: 13.42479, lng: 99.9556 } }] };
    }, request: () => assert.fail('Must not use an external provider without a key') });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'PaiNaiDee');
  assert.equal(calls[0].province, 'สมุทรสงคราม');
  assert.equal(result.providerConfigured, false);
});

test('geocoding excludes wrong-country and out-of-bounds coordinates', async () => {
  const result = await geocodeCandidates({ name: 'Temple', province: 'มุกดาหาร', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [] }),
    request: async () => ({ ok: true, json: async () => ({ results: [
      { lat: 16.5, lon: 104.7, country_code: 'th', formatted: 'Thai temple' },
      { lat: 16.5, lon: 104.7, country_code: 'la', formatted: 'Wrong country' },
      { lat: 45, lon: 104.7, country_code: 'th', formatted: 'Outside bounds' },
    ] }) }),
  });
  assert.deepEqual(result.candidates.map(item => item.label), ['Thai temple']);
  assert.equal(isThailandCoordinate(90, 100), false);
});

test('map search accepts a place name without a province and retains candidate selection', async () => {
  const result = await geocodeCandidates({ name: 'ตลาดน้ำอัมพวา',
    listPlaces: async options => {
      assert.equal(options.province, '');
      return { attractions: [{ nameLocal: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
        coordinates: { lat: 13.42479, lng: 99.9556 } }] };
    }, request: () => assert.fail('Provider requires an API key'),
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].label, 'ตลาดน้ำอัมพวา · สมุทรสงคราม');
});

test('quality gate rejects a nearby national park and city centroid for Cheow Lan Dam', async () => {
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [
      { nameLocal: 'อุทยานแห่งชาติเขาสก', province: 'สุราษฎร์ธานี', coordinates: { lat: 8.91493, lng: 98.53017 } },
    ] }),
    request: async () => ({ ok: true, json: async () => ({ results: [
      { lat: 9.14041, lon: 99.32413, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี, ประเทศไทย' },
      { lat: 8.98, lon: 98.82, country_code: 'th', name: 'Ratchaprapha Dam', formatted: 'Ratchaprapha Dam, Surat Thani' },
    ] }) }),
  });
  assert.equal(result.candidates.length, 1);
  assert.match(result.candidates[0].label, /Ratchaprapha Dam/);
});

test('quality gate rejects unrecognised place names even if they are in the same province', async () => {
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['อุทยานแห่งชาติเขาสก']), false);
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['เขื่อนรัชชประภา']), true);
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['เทศบาลนครสุราษฎร์ธานี']), false);
  assert.equal(matchesPlaceName('ตลาดน้ำอัมพวา', ['ตลาดน้ำอัมพวา']), true);
});

test('fallback name search resolves Cheow Lan through the Ratchaprapha alternate name', async () => {
  const requested = [];
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async options => ({ attractions: options.search === 'เขื่อนรัชชประภา' ? [
      { nameLocal: 'เขื่อนรัชชประภา', province: 'สุราษฎร์ธานี', coordinates: { lat: 8.99, lng: 98.81 } },
    ] : [] }),
    request: async url => {
      const text = new URL(url).searchParams.get('text');
      requested.push(text);
      return { ok: true, json: async () => ({ results: text.startsWith('เขื่อนรัชชประภา') ? [
        { lat: 8.99, lon: 98.81, country_code: 'th', formatted: 'เขื่อนรัชชประภา, ประเทศไทย' },
      ] : [{ lat: 9.14, lon: 99.32, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี' }] }) };
    },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'PaiNaiDee');
  assert.equal(requested.length, 1); // Already verified from Railway, no unnecessary alias requests.
});

test('Geoapify retries alternate names after an unrelated first response', async () => {
  const queried = [];
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [] }),
    request: async url => {
      const text = new URL(url).searchParams.get('text');
      queried.push(text);
      return { ok: true, json: async () => ({ results: text.startsWith('เขื่อนรัชชประภา') ? [
        { lat: 8.99, lon: 98.81, country_code: 'th', name: 'เขื่อนรัชชประภา', formatted: 'เขื่อนรัชชประภา, สุราษฎร์ธานี' },
      ] : [{ lat: 9.14, lon: 99.32, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี' }] }) };
    },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'Geoapify');
  assert.equal(queried.length, 2);
  assert.deepEqual(searchNames('ตลาดน้ำอัมพวา'), ['ตลาดน้ำอัมพวา']);
});
