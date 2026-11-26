'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { applySelection, duplicateResponse } = require('./admin-duplicate-resolution.cjs');

test('resolution field selection defaults to the current edit and only clears explicitly', () => {
  const base = { name: 'Existing', nameLocal: 'เดิม', description: 'Original', descriptionEn: 'English',
    category: 'Culture', categories: ['Culture'], tags: ['Trail'], lat: 14, lng: 101, imageUrl: 'old' };
  const source = { name: 'New', description: '', category: 'Park', categories: ['park', 'Nature'], tags: ['trail', 'New'],
    lat: 18, lng: 100 };
  assert.equal(applySelection(base, source, {}, [], undefined, []).name, 'Existing');
  assert.equal(applySelection(base, source, { description: 'draft' }, [], undefined, []), null);
  assert.equal(applySelection(base, source, { description: 'clear' }, [], undefined, []).description, '');
  const merged = applySelection(base, source, { categories: 'merge', tags: 'merge', coordinates: 'draft' }, ['new', 'new'], 'new', ['old']);
  assert.deepEqual(merged.categories, ['Culture', 'Park', 'Nature']);
  assert.deepEqual(merged.tags, ['Trail', 'New']);
  assert.deepEqual([merged.lat, merged.lng], [18, 100]);
  assert.equal(merged.imageUrl, 'new');
  assert.deepEqual(merged.imageUrls, ['new']);
  assert.equal(applySelection(base, source, {}, [], 'unrelated', ['old']), null);
});

test('structured conflicts show all matches while disallowing unrelated identity targets', () => {
  const match = duplicateResponse([
    { id: 'external', identity_match: true, name_match: false },
    { id: 'name-and-province', identity_match: false, name_match: true },
  ]);
  assert.equal(match.conflictType, 'MULTIPLE_CONFLICT_CANDIDATES');
  assert.deepEqual(match.existingPlaces.map(candidate => [candidate.placeId, candidate.canResolve]), [
    ['external', true], ['name-and-province', false],
  ]);
  assert.ok(!duplicateResponse([{ id: 'other', name_match: true }], true).availableActions.includes('RESOLVE_WITH_DRAFT'));
});
