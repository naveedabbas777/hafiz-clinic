/**
 * Namecheap cPanel / Phusion Passenger Entry Point
 *
 * Namecheap's "Setup Node.js App" defaults to looking for 'app.js' in the application root.
 * This runner sets production environment and loads the compiled bundle in 'dist/server.cjs'.
 */

require('dotenv').config();

process.env.NODE_ENV = 'production';

// Import the bundled production Express server
require('./dist/server.cjs');
