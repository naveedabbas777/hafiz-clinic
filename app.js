// ==============================================================================
// Namecheap cPanel CloudLinux Node.js Startup File (app.js)
// Hafiz Clinic & Healthcare System
// ==============================================================================

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load compiled backend bundle
try {
  require('./dist/server.cjs');
} catch (err) {
  console.error('Failed to start Hafiz Clinic server on Namecheap cPanel:', err);
  process.exit(1);
}
