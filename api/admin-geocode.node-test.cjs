const { test } = require('node:test');
const assert = require('node:assert/strict');
const { geocodeCandidates, isThailandCoordinate } = require('./admin-geocode.cjs');

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
