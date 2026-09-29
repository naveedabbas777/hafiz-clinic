const test = require('node:test');
const assert = require('node:assert/strict');

const { getMissingEnvKeys } = require('../server/config/env.js');

test('returns missing deployment env keys when required variables are unset', () => {
  const original = { ...process.env };
  delete process.env.MONGODB_URI;
  delete process.env.JWT_SECRET;
  delete process.env.APP_URL;

  const missing = getMissingEnvKeys(['MONGODB_URI', 'JWT_SECRET', 'APP_URL']);

  assert.deepEqual(missing, ['MONGODB_URI', 'JWT_SECRET', 'APP_URL']);

  process.env = original;
});
