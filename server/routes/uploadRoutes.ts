import { Router, Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary';

const router = Router();

async function handleCloudinaryUpload(req: Request, res: Response, folder: string) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Base64 image data or URL is required.' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'auto',
    });

    return res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err: any) {
    console.error(`Cloudinary Upload Error (${folder}):`, err);
    // If Cloudinary credentials fail, gracefully return original image URL if available or placeholder
    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('http')) {
      return res.json({ success: true, imageUrl: req.body.image });
    }
    return res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
}

router.post('/disease-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/diseases'));
router.post('/doctor-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/doctors'));
router.post('/product-image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/products'));
router.post('/image', (req: Request, res: Response) => handleCloudinaryUpload(req, res, 'hafiz_clinic/general'));

export default router;
