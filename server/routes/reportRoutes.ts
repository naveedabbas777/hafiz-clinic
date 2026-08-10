import { Router, Request, Response } from 'express';
import { Report } from '../models/Report';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

// GET /api/reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId } = req.query;
    if (getMongoConnectedStatus()) {
      let filter: any = {};
      if (patientId) filter.patientId = patientId;
      if (doctorId) filter.doctorId = doctorId;
      const reports = await Report.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, reports });
    }
    return res.json({ success: true, reports: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reports
router.post('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const newReport = await Report.create(req.body);
      return res.status(201).json({ success: true, report: newReport });
    }
    return res.status(201).json({ success: true, report: { id: 'REP-' + Math.floor(1000 + Math.random() * 9000), ...req.body, date: new Date().toISOString().split('T')[0] } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const updated = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, report: updated });
    }
    return res.json({ success: true, report: { id: req.params.id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
