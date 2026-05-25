import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeApiBaseUrl } from '../src/api/config.js';

test('uses a same-origin API path when no URL is configured', () => {
  assert.equal(normalizeApiBaseUrl(undefined), '/api/');
});

test('normalizes configured API URLs to one trailing slash', () => {
  assert.equal(
    normalizeApiBaseUrl(' https://api.example.test/api/// '),
    'https://api.example.test/api/',
  );
});
