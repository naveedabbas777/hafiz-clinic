import { Router, Request, Response } from 'express';
import { cloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary } from '../config/cloudinary';

const router = Router();

async function handleCloudinaryUpload(req: Request, res: Response, folder: string, resourceType: 'auto' | 'image' | 'video' = 'auto') {
  try {
    const media = req.body.image || req.body.imageBase64 || req.body.video || req.body.videoBase64 || req.body.media;
    if (!media) {
      return res.status(400).json({ success: false, message: 'Base64 media data or URL is required.' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(media, {
      folder,
      resource_type: resourceType,
    });

    return res.json({
      success: true,
      url: result.secure_url,
      imageUrl: result.secure_url,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (err: any) {
    console.error(`Cloudinary Upload Error (${folder}):`, err);
    // If Cloudinary credentials fail, gracefully return original URL if available
    const media = req.body.image || req.body.imageBase64 || req.body.video || req.body.videoBase64 || req.body.media;
    if (media && typeof media === 'string' && (media.startsWith('http') || media.startsWith('data:'))) {
      return res.json({
        success: true,
        url: media,
        imageUrl: media,
        videoUrl: media,
      });
    }
    return res.status(500).json({ success: false, message: err.message || 'Media upload failed' });
  }
}

router.post('/disease-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/diseases', 'image'));
router.post('/doctor-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/doctors', 'image'));
router.post('/product-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/products', 'image'));
router.post('/product-video', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/products/videos', 'video'));
router.post('/video', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/videos', 'video'));
router.post('/image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/general', 'auto'));

// Delete single media from Cloudinary
router.post('/delete-media', async (req: Request, res: Response) => {
  try {
    const { url, publicId, resourceType } = req.body;
    const target = url || publicId;
    if (!target) {
      return res.status(400).json({ success: false, message: 'URL or publicId is required for deletion' });
    }

    const result = await deleteFromCloudinary(target, resourceType);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Delete Media Route Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to delete media from Cloudinary' });
  }
});

// Delete batch media from Cloudinary
router.post('/delete-batch', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: 'urls array is required' });
    }

    const results = await deleteMultipleFromCloudinary(urls);
    return res.json({ success: true, results });
  } catch (err: any) {
    console.error('Delete Batch Media Route Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to batch delete media' });
  }
});

export default router;

