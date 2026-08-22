import { Router, Request, Response } from 'express';
import { Report } from '../models/Report';
import { getMongoConnectedStatus } from '../config/db';
import { deleteFromCloudinary } from '../config/cloudinary';

const router = Router();

let inMemoryReports: any[] = [];

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

    let list = [...inMemoryReports];
    if (patientId) list = list.filter((r) => r.patientId === String(patientId));
    if (doctorId) list = list.filter((r) => r.doctorId === String(doctorId));
    return res.json({ success: true, reports: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, reports: inMemoryReports });
  }
});

// POST /api/reports
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData = {
      id: req.body.id || `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    inMemoryReports.unshift(reportData);

    if (getMongoConnectedStatus()) {
      const newReport = await Report.create(reportData);
      return res.status(201).json({ success: true, report: newReport });
    }
    return res.status(201).json({ success: true, report: reportData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (getMongoConnectedStatus()) {
      const existing = await Report.findById(id) || await Report.findOne({ id });
      // If fileUrl is changed and old file was on Cloudinary, delete old file
      if (existing?.fileUrl && req.body.fileUrl && existing.fileUrl !== req.body.fileUrl) {
        deleteFromCloudinary(existing.fileUrl).catch((err) => console.error('Report old file cleanup error:', err));
      }

      const updated = await Report.findByIdAndUpdate(id, req.body, { returnDocument: 'after' }) ||
        await Report.findOneAndUpdate({ id }, req.body, { returnDocument: 'after' });
      return res.json({ success: true, report: updated });
    }

    const idx = inMemoryReports.findIndex((r) => r.id === id || r._id === id);
    if (idx !== -1) {
      if (inMemoryReports[idx].fileUrl && req.body.fileUrl && inMemoryReports[idx].fileUrl !== req.body.fileUrl) {
        deleteFromCloudinary(inMemoryReports[idx].fileUrl).catch(() => {});
      }
      inMemoryReports[idx] = { ...inMemoryReports[idx], ...req.body };
    }
    return res.json({ success: true, report: inMemoryReports[idx] || { id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reports/:id (Purges report and associated Cloudinary file)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fileUrl = req.body?.fileUrl || (req.query?.fileUrl as string);

    if (getMongoConnectedStatus()) {
      const report = await Report.findById(id) || await Report.findOne({ id });
      const targetFile = report?.fileUrl || fileUrl;

      if (targetFile) {
        await deleteFromCloudinary(targetFile);
      }

      await Report.findByIdAndDelete(id);
      await Report.findOneAndDelete({ id });
    } else {
      const memReport = inMemoryReports.find((r) => r.id === id || r._id === id);
      const targetFile = memReport?.fileUrl || fileUrl;
      if (targetFile) {
        await deleteFromCloudinary(targetFile);
      }
    }

    inMemoryReports = inMemoryReports.filter((r) => r.id !== id && r._id !== id);

    return res.json({
      success: true,
      message: 'Medical report and attached Cloudinary file deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
