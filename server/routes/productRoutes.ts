import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { getMongoConnectedStatus } from '../config/db';

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

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      await Product.findByIdAndDelete(req.params.id);
    }
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
