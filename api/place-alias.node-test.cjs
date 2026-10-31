const { test } = require('node:test');
const assert = require('node:assert/strict');
const { aliasKey, validateAlias } = require('./place-alias.cjs');
const { geocodeCandidates } = require('./admin-geocode.cjs');

test('alias validation normalizes punctuation, whitespace, and restricts length/language', () => {
  assert.equal(aliasKey('วัด พระ แก้ว'), aliasKey('วัดพระแก้ว'));
  assert.equal(validateAlias({ aliasName: ' ' }).error !== undefined, true);
  assert.equal(validateAlias({ aliasName: 'Local name', language: 'other' }).name, 'Local name');
  assert.ok(validateAlias({ aliasName: 'Place', language: 'invalid' }).error);
});

test('approved database aliases resolve to canonical place names before lookup', async () => {
  const searches = [];
  const result = await geocodeCandidates({ name: 'ชื่อเรียกท้องถิ่น', province: 'มุกดาหาร',
    resolveNames: async name => name === 'ชื่อเรียกท้องถิ่น' ? ['วัดรอยพระพุทธบาทภูมโนรมย์'] : [],
    listPlaces: async ({ search }) => {
      searches.push(search);
      return { attractions: search === 'วัดรอยพระพุทธบาทภูมโนรมย์' ? [{
        nameLocal: 'วัดรอยพระพุทธบาทภูมโนรมย์', province: 'มุกดาหาร',
        coordinates: { lat: 16.57, lng: 104.72 },
      }] : [] };
    },
  });
  assert.deepEqual(searches, ['ชื่อเรียกท้องถิ่น', 'วัดรอยพระพุทธบาทภูมโนรมย์']);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'PaiNaiDee');
});
