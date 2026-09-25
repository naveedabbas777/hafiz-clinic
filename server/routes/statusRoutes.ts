import { Router, Request, Response } from 'express';
import { getMongoConnectedStatus, MONGODB_URI } from '../config/db';

const router = Router();

// GET /api/db-status
router.get('/db-status', (req: Request, res: Response) => {
  const rawUri = process.env.MONGODB_URI || MONGODB_URI || '';
  const maskedUri = rawUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
  res.json({
    connected: getMongoConnectedStatus(),
    uri: maskedUri,
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    timestamp: new Date().toISOString(),
  });
});

export default router;
