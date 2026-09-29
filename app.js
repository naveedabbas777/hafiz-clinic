// ==============================================================================
// Namecheap cPanel CloudLinux Node.js Startup File (app.js)
// Hafiz Clinic & Healthcare System
// ==============================================================================

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Namecheap loads this file with CommonJS. Keep it CommonJS compatible.
try {
  require('./dist/server.cjs');
