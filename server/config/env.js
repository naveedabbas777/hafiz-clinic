const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const REQUIRED_ENV_KEYS = ['MONGODB_URI', 'JWT_SECRET', 'APP_URL'];

function loadRuntimeEnv(envPath = path.resolve(process.cwd(), '.env')) {
  if (!fs.existsSync(envPath)) {
    console.warn(`[env] No .env file found at ${envPath}. Ensure cPanel environment variables are configured.`);
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

module.exports = {
  REQUIRED_ENV_KEYS,
  loadRuntimeEnv,
  getMissingEnvKeys,
  logMissingEnvKeys,
};
