import test from 'node:test';
import assert from 'node:assert/strict';

import { formatSongDuration } from '../src/utils/duration.js';

test('formats stored audio seconds for song lists', () => {
  assert.equal(formatSongDuration(276), '04:36');
  assert.equal(formatSongDuration('301.58'), '05:02');
});

test('returns placeholder when a song has no recorded duration', () => {
  assert.equal(formatSongDuration(null), '--:--');
});
