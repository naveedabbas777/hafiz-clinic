import { Router, Request, Response } from 'express';
import { getMongoConnectedStatus, MONGODB_URI } from '../config/db';

const router = Router();

// GET /api/db-status
router.get('/db-status', (req: Request, res: Response) => {
  res.json({
    connected: getMongoConnectedStatus(),
    uri: MONGODB_URI,
    cloudinaryConfigured: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'aiegavvw',
    timestamp: new Date().toISOString(),
  });
});

export default router;
