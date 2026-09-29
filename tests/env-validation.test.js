const test = require('node:test');
const assert = require('node:assert/strict');

const { getMissingEnvKeys, isMongoUri, normalizeMongoUri } = require('../server/config/env.js');

test('returns missing deployment env keys when required variables are unset', () => {
  const original = { ...process.env };
  delete process.env.MONGODB_URI;
  delete process.env.JWT_SECRET;
  delete process.env.APP_URL;

  const missing = getMissingEnvKeys(['MONGODB_URI', 'JWT_SECRET', 'APP_URL']);

  assert.deepEqual(missing, ['MONGODB_URI', 'JWT_SECRET', 'APP_URL']);

  for (const key of Object.keys(process.env)) {
    if (!(key in original)) delete process.env[key];
  }
  Object.assign(process.env, original);
});

test('normalizes MongoDB URIs pasted with quotes or an env assignment prefix', () => {
  assert.equal(normalizeMongoUri(' "mongodb+srv://user:pass@cluster.example/db" '), 'mongodb+srv://user:pass@cluster.example/db');
  assert.equal(normalizeMongoUri('MONGODB_URI=mongodb://localhost:27017/clinic'), 'mongodb://localhost:27017/clinic');
});

test('rejects MongoDB env values with a malformed scheme', () => {
  assert.equal(isMongoUri('mongodb+srv://cluster.example/clinic'), true);
  assert.equal(isMongoUri('https://cluster.example/clinic'), false);
});
