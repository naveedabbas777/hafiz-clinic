import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export const REQUIRED_ENV_KEYS = ['MONGODB_URI', 'JWT_SECRET', 'APP_URL'];
let envLoadAttempted = false;
let missingEnvFileWarningShown = false;

export function loadRuntimeEnv(envPath: string = path.resolve(process.cwd(), '.env')): boolean {
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

  // If process.env.MONGODB_URI is default localhost or not set, allow .env to override
  const isDefaultLocalMongo = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017') || process.env.MONGODB_URI.includes('127.0.0.1:27017');
  const result = dotenv.config({ path: envPath, override: isDefaultLocalMongo });

  if (result.error) {
    console.warn(`[env] Failed to load ${envPath}: ${result.error.message}`);
    return false;
  }

  return true;
}

export function getMissingEnvKeys(keys: string[] = REQUIRED_ENV_KEYS): string[] {
  return keys.filter((key) => {
    const value = process.env[key];
    return value === undefined || String(value).trim() === '';
  });
}

export function logMissingEnvKeys(keys: string[] = REQUIRED_ENV_KEYS): string[] {
  const missing = getMissingEnvKeys(keys);

  if (missing.length) {
    console.warn(`[env] Missing required deployment variables: ${missing.join(', ')}`);
    console.warn('[env] Add them to cPanel Environment Variables or add a project-root .env file before deployment.');
  }

  return missing;
}

export function normalizeMongoUri(value: string | undefined): string {
  let uri = String(value || '').trim();
  uri = uri.replace(/^MONGODB_URI\s*=\s*/i, '').trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

export function isMongoUri(value: string | undefined): boolean {
  return /^(mongodb|mongodb\+srv):\/\//i.test(normalizeMongoUri(value));
}
