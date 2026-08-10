import { Router, Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

// Initial Doctors fallback
const initialDoctors = [
  {
    id: 'doc1',
    nameUrdu: 'ڈاکٹر زیشان چوہدری',
    nameEnglish: 'Dr. Zeeshan Chaudhry',
    qualification: 'MBBS, RMP (Reg. No. 45892)',
    experience: '15+ سال کا وسیع تجربہ',
    specializationUrdu: 'جوڑوں کا درد، اعصابی کمزوری، معدہ و جگر کے امراض اور کمپیوٹرائزڈ ڈائیگنوسس',
    specializationEnglish: 'Joint Pain, Neurological Disorders, Gastrointestinal Health & Computer Diagnosis',
    timingUrdu: 'صبح 8:00 بجے سے دوپہر 2:00 بجے تک (مارننگ او پی ڈی)',
    timingEnglish: '8:00 AM - 2:00 PM (Morning OPD)',
    eveningTimingUrdu: 'شام 5:00 بجے سے رات 9:00 بجے تک (ایوننگ او پی ڈی)',
    eveningTimingEnglish: '5:00 PM - 9:00 PM (Evening OPD)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    phone: '+92 300 1234567',
    email: 'dr.zeeshan@hafizclinic.com',
  },
  {
    id: 'doc2',
    nameUrdu: 'ڈاکٹر وقاص صغیر چوہدری',
    nameEnglish: 'Dr. Waqas Sageer Chaudhry',
    qualification: 'MBBS, DPT (Reg. No. 51204)',
    experience: '12+ سال کا تجربہ',
    specializationUrdu: 'فالج، لقوہ، کمر کے مہروں کا درد، فزیوتھراپی اور آنکھوں کے معائنے کے ماہر',
    specializationEnglish: 'Stroke Rehab, Sciatica, Disc Issues, Physiotherapy & Eye Care',
    timingUrdu: 'دوپہر 2:00 بجے سے رات 8:00 بجے تک (او پی ڈی)',
    timingEnglish: '2:00 PM - 8:00 PM (Regular OPD)',
    eveningTimingUrdu: 'شام 6:00 بجے سے رات 10:00 بجے تک (سپیشل کنسلٹیشن)',
    eveningTimingEnglish: '6:00 PM - 10:00 PM (Special Consultation)',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    phone: '+92 345 7654321',
    email: 'dr.waqas@hafizclinic.com',
  },
];

// GET /api/doctors
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const doctors = await Doctor.find().sort({ createdAt: -1 });
      return res.json({ success: true, doctors });
    }
    return res.json({ success: true, doctors: initialDoctors });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, doctors: initialDoctors });
  }
});

// POST /api/doctors
router.post('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const doctor = await Doctor.create(req.body);
      return res.status(201).json({ success: true, doctor });
    }
    return res.status(201).json({ success: true, doctor: { id: `doc_${Date.now()}`, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/doctors/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, doctor: updated });
    }
    return res.json({ success: true, doctor: { id: req.params.id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      await Doctor.findByIdAndDelete(req.params.id);
    }
    return res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
