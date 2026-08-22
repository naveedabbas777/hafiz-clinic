import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { getMongoConnectedStatus } from '../config/db';
import { deleteFromCloudinary } from '../config/cloudinary';

const router = Router();

const initialProducts = [
  {
    id: 'prod-1',
    nameUrdu: 'حافظ جوائنٹ کیئر ہربل آئل و سیرپ',
    nameEnglish: 'Hafiz Joint Care Herbal Syrup',
    pricePKR: 1850,
    originalPricePKR: 2200,
    category: 'supplements',
    categoryUrdu: 'مقوی ادویات',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'جوڑوں اور گھٹنوں کے درد کا مکمل شافی علاج۔',
    stock: 45,
    isFeatured: true,
  },
  {
    id: 'prod-2',
    nameUrdu: 'حافظ گیسترو ریلیف سفوف',
    nameEnglish: 'Hafiz Gastro Relief Powder',
    pricePKR: 1200,
    originalPricePKR: 1500,
    category: 'syrups',
    categoryUrdu: 'شربت اور معجون',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'معدے کی تیزابیت، گیس، تبخیر اور بدہضمی کا فوری حل۔',
    stock: 60,
    isFeatured: true,
  },
];

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ success: true, products });
    }
    return res.json({ success: true, products: initialProducts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, products: initialProducts });
  }
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, product });
    }
    return res.status(201).json({ success: true, product: { id: `prod_${Date.now()}`, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const existing = await Product.findById(req.params.id) || await Product.findOne({ id: req.params.id });
      if (existing?.image && req.body.image && existing.image !== req.body.image) {
        deleteFromCloudinary(existing.image, 'image').catch((err) => console.error('Product old image cleanup error:', err));
      }
      if (existing?.videoUrl && req.body.videoUrl && existing.videoUrl !== req.body.videoUrl) {
        deleteFromCloudinary(existing.videoUrl, 'video').catch((err) => console.error('Product old video cleanup error:', err));
      }
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
      return res.json({ success: true, product: updated });
    }
    return res.json({ success: true, product: { id: req.params.id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.body?.imageUrl || (req.query?.imageUrl as string);
    const videoUrl = req.body?.videoUrl || (req.query?.videoUrl as string);

    if (getMongoConnectedStatus()) {
      const product = await Product.findById(req.params.id) || await Product.findOne({ id: req.params.id });
      const targetImage = product?.image || imageUrl;
      const targetVideo = product?.videoUrl || videoUrl;

      if (targetImage) {
        await deleteFromCloudinary(targetImage, 'image');
      }
      if (targetVideo) {
        await deleteFromCloudinary(targetVideo, 'video');
      }

      await Product.findByIdAndDelete(req.params.id);
      await Product.findOneAndDelete({ id: req.params.id });
    } else {
      if (imageUrl) {
        await deleteFromCloudinary(imageUrl, 'image');
      }
      if (videoUrl) {
        await deleteFromCloudinary(videoUrl, 'video');
      }
    }

    return res.json({ success: true, message: 'Product, image, and video deleted from Cloudinary & Database successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
