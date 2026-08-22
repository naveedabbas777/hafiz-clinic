import { Router, Request, Response } from 'express';
import { Disease } from '../models/Disease';
import { getMongoConnectedStatus } from '../config/db';
import { deleteFromCloudinary } from '../config/cloudinary';

const router = Router();

const initialDiseases = [
  {
    id: 'dis-1',
    nameUrdu: 'جسمانی درد',
    nameEnglish: 'Body Pain',
    category: 'pain',
    symptomsUrdu: ['پورے جسم میں مسلسل میٹھا درد', 'تھکاوٹ اور سستی', 'صبح اٹھتے ہی جسم کا اکڑ جانا'],
    causesUrdu: ['وٹامن ڈی اور کیلشیم کی کمی', 'پٹھوں کی کمزوری'],
    treatmentUrdu: 'کمپیوٹرائزڈ چیک اپ کے بعد مخصوص طبی نسخہ اور لیزر و اسٹیم تھراپی',
    recommendedDoctor: 'ڈاکٹر زیشان چوہدری',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-2',
    nameUrdu: 'جوڑوں کا درد',
    nameEnglish: 'Joint Pain (Arthritis)',
    category: 'pain',
    symptomsUrdu: ['جوڑوں میں سوجن اور سرخی', 'چلنے پھرنے میں شدید تکلیف', 'نماز پڑھنے میں دشواری'],
    causesUrdu: ['یورک ایسڈ کی زیادہ مقدار', 'جوڑوں کی چکنائی کا کم ہونا'],
    treatmentUrdu: 'حافظ جوائنٹ کیئر فارمولہ اور فزیوتھراپی سیشنز',
    recommendedDoctor: 'ڈاکٹر زیشان چوہدری',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },
];

// GET /api/diseases
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const diseases = await Disease.find().sort({ createdAt: -1 });
      return res.json({ success: true, diseases });
    }
    return res.json({ success: true, diseases: initialDiseases });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, diseases: initialDiseases });
  }
});

// POST /api/diseases
router.post('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const disease = await Disease.create(req.body);
      return res.status(201).json({ success: true, disease });
    }
    return res.status(201).json({ success: true, disease: { id: `dis_${Date.now()}`, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/diseases/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const existing = await Disease.findById(req.params.id) || await Disease.findOne({ id: req.params.id });
      if (existing?.image && req.body.image && existing.image !== req.body.image) {
        deleteFromCloudinary(existing.image, 'image').catch((err) => console.error('Disease old image cleanup error:', err));
      }
      const updated = await Disease.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
      return res.json({ success: true, disease: updated });
    }
    return res.json({ success: true, disease: { id: req.params.id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/diseases/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.body?.imageUrl || (req.query?.imageUrl as string);

    if (getMongoConnectedStatus()) {
      const disease = await Disease.findById(req.params.id) || await Disease.findOne({ id: req.params.id });
      const targetImage = disease?.image || imageUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage, 'image');
      }
      await Disease.findByIdAndDelete(req.params.id);
      await Disease.findOneAndDelete({ id: req.params.id });
    } else if (imageUrl) {
      await deleteFromCloudinary(imageUrl, 'image');
    }

    return res.json({ success: true, message: 'Disease and Cloudinary image deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
