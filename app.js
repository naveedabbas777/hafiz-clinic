const path = require('path');
const { loadRuntimeEnv, logMissingEnvKeys } = require('./server/config/env.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

try {
	const projectRootEnv = path.resolve(__dirname, '.env');
	loadRuntimeEnv(projectRootEnv);
	logMissingEnvKeys(['MONGODB_URI', 'JWT_SECRET', 'APP_URL']);

	require('./dist/server.cjs');
} catch (err) {
	console.error('Failed to start Hafiz Clinic server on Namecheap cPanel:', err);
	process.exit(1);
}
