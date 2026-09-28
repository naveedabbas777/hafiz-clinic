import { Router, Request, Response } from 'express';
import { getMongoConnectedStatus, getMongoDiagnostics, connectDB, MONGODB_URI } from '../config/db';

const router = Router();

// GET /api/db-status - Live health status and diagnostics
router.get('/db-status', (req: Request, res: Response) => {
  const rawUri = process.env.MONGODB_URI || MONGODB_URI || '';
  const maskedUri = rawUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
  const diag = getMongoDiagnostics();
  res.json({
    connected: getMongoConnectedStatus(),
    database: diag,
    uri: maskedUri,
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// POST /api/db-status/reload - Hot reload environment and reconnect to MongoDB Atlas
router.post('/db-status/reload', async (req: Request, res: Response) => {
  try {
    const success = await connectDB(true);
    const diag = getMongoDiagnostics();
    res.json({
      success,
      message: success ? 'Hot reload successful: Reconnected to MongoDB Atlas' : 'Hot reload attempt completed with warning',
      database: diag,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Error during database reload',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
