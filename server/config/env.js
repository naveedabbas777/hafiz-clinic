const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const REQUIRED_ENV_KEYS = ['MONGODB_URI', 'JWT_SECRET', 'APP_URL'];
let envLoadAttempted = false;
let missingEnvFileWarningShown = false;

function loadRuntimeEnv(envPath = path.resolve(process.cwd(), '.env')) {
  if (envLoadAttempted) {
    return fs.existsSync(envPath);
  }
  envLoadAttempted = true;

  if (!fs.existsSync(envPath)) {
    if (!missingEnvFileWarningShown) {
      console.warn(`[env] No .env file found at ${envPath}. Ensure cPanel environment variables are configured.`);
      missingEnvFileWarningShown = true;
    }
    return false;
  }

  const result = dotenv.config({ path: envPath, override: false });

  if (result.error) {
    console.warn(`[env] Failed to load ${envPath}: ${result.error.message}`);
    return false;
  }

  return true;
}

function getMissingEnvKeys(keys = REQUIRED_ENV_KEYS) {
  return keys.filter((key) => {
    const value = process.env[key];
    return value === undefined || String(value).trim() === '';
  });
}

function logMissingEnvKeys(keys = REQUIRED_ENV_KEYS) {
  const missing = getMissingEnvKeys(keys);

  if (missing.length) {
    console.warn(`[env] Missing required deployment variables: ${missing.join(', ')}`);
    console.warn('[env] Add them to cPanel Environment Variables or add a project-root .env file before deployment.');
  }

  return missing;
}

function normalizeMongoUri(value) {
  let uri = String(value || '').trim();
  uri = uri.replace(/^MONGODB_URI\s*=\s*/i, '').trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

function isMongoUri(value) {
  return /^(mongodb|mongodb\+srv):\/\//i.test(normalizeMongoUri(value));
}

module.exports = {
  REQUIRED_ENV_KEYS,
  loadRuntimeEnv,
  getMissingEnvKeys,
  logMissingEnvKeys,
  normalizeMongoUri,
  isMongoUri,
};
