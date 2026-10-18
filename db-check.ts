import mongoose from 'mongoose';
import { loadRuntimeEnv, normalizeMongoUri } from './server/config/env';

// Load environment variables from .env or system environment
loadRuntimeEnv();

async function checkDatabaseConnection(): Promise<void> {
  console.log('====================================================');
  console.log('🔍 HAFIZ CLINIC - DATABASE CONNECTION CHECK');
  console.log('====================================================');
  console.log(`Current Working Directory : ${process.cwd()}`);
  console.log(`Node Environment          : ${process.env.NODE_ENV || 'development'}`);

  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || !rawUri.trim()) {
    console.error('\n❌ ERROR: MONGODB_URI is undefined or empty in environment.');
    console.error('👉 Make sure MONGODB_URI is configured in your .env or cPanel Environment Variables.');
    process.exit(1);
  }

  const uri = normalizeMongoUri(rawUri);

  // Mask password for safe logging
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connection URI Target     : ${maskedUri}`);

  console.log('\n⏳ Attempting connection to MongoDB Atlas (Timeout: 8s)...');

  try {
    const startTime = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    const duration = Date.now() - startTime;

    console.log('\n✅ SUCCESS: Connected to MongoDB Atlas successfully!');
    console.log(`Database Name  : ${mongoose.connection.name}`);
    console.log(`Database Host  : ${mongoose.connection.host}`);
    console.log(`Connection Port: ${mongoose.connection.port}`);
    console.log(`Ready State    : ${mongoose.connection.readyState} (1 = connected)`);
    console.log(`Response Time  : ${duration}ms`);
    console.log('====================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ FAILED: Unable to connect to MongoDB:');
    console.error(`Error Name    : ${err.name}`);
    console.error(`Error Message : ${err.message}`);
    if (err.code) {
      console.error(`Error Code    : ${err.code}`);
    }

    console.log('\n🛠️ DIAGNOSTIC GUIDANCE:');
    if (err.message.includes('ENOTFOUND')) {
      console.log('• DNS Lookup Failure (ENOTFOUND):');
      console.log('  The cluster domain name could not be resolved. Ensure you are using the full host:');
      console.log('  e.g. cluster0.jyuvw0u.mongodb.net (not just @cluster0/)');
    } else if (err.message.includes('Authentication failed') || err.message.includes('auth failed')) {
      console.log('• Authentication Failure:');
      console.log('  Username or password is incorrect. Verify user credentials in MongoDB Atlas -> Database Access.');
    } else if (err.message.includes('timed out') || err.message.includes('selection timed out')) {
      console.log('• Connection Timed Out:');
      console.log('  The database server is unreachable or IP is blocked.');
      console.log('  In Atlas -> Network Access -> Add IP Address -> Choose "Allow Access From Anywhere" (0.0.0.0/0).');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('• Connection Refused (ECONNREFUSED):');
      console.log('  The server tried to connect to a local port (e.g. 127.0.0.1:27017) with no local database running.');
      console.log('  Set MONGODB_URI to your live MongoDB Atlas mongodb+srv:// connection string.');
    }
    console.log('====================================================\n');

    process.exit(1);
  }
}

checkDatabaseConnection();
