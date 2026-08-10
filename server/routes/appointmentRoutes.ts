import { Router, Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

let inMemoryAppointments: any[] = [
  {
    id: 'APP-001',
    patientName: 'محمد طارق',
    phone: '03001234567',
    city: 'گوجرانوالہ',
    problem: 'کمر و مہروں کا شدید درد',
    doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
    date: '2026-08-08',
    timeSlot: 'صبح 10:00 - 11:00',
    status: 'Approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APP-002',
    patientName: 'کامران علی',
    phone: '03219876543',
    city: 'لاہور',
    problem: 'فالج بحالی فزیوتھراپی',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری (MBBS)',
    date: '2026-08-08',
    timeSlot: 'دوپہر 02:00 - 03:00',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
];

let apptSeqCount = 10;
function generateSequentialAppointmentId() {
  apptSeqCount += 1;
  const num = String(apptSeqCount).padStart(3, '0');
  return `APP-${num}`;
}

// GET /api/appointments
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      let dbList: any[] = await Appointment.find().sort({ createdAt: -1 });

      // Auto-sync any registered patient users from MongoDB Atlas into appointments / OPD queue
      const mongoPatients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
      for (const u of mongoPatients) {
        const uId = u._id.toString();
        const uName = u.name || u.username;
        const uPhone = u.phone;
        const alreadyInList = dbList.some((a) =>
          (a.patientId && String(a.patientId) === uId) ||
          (a.patientName && uName && a.patientName.toLowerCase() === uName.toLowerCase()) ||
          (uPhone && a.phone && uPhone === a.phone)
        );
        if (!alreadyInList) {
          const autoAppt = {
            id: `APP-P${uId.slice(-4)}`,
            patientId: uId,
            patientName: uName,
            phone: uPhone || '03000000000',
            city: u.city || 'گوجرانوالہ',
            problem: 'رجسٹرڈ بیمار (OPD Checkup)',
            doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
            date: new Date(u.createdAt || Date.now()).toISOString().split('T')[0],
            timeSlot: 'صبح 10:00 - 01:00',
            status: 'Pending',
            createdAt: u.createdAt || new Date().toISOString(),
          };
          const createdAppt = await Appointment.create(autoAppt).catch(() => null);
          if (createdAppt) {
            dbList.unshift(createdAppt);
          }
        }
      }
      return res.json({ success: true, appointments: dbList });
    }

    return res.json({ success: true, appointments: inMemoryAppointments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, appointments: inMemoryAppointments });
  }
});

// POST /api/appointments
router.post('/', async (req: Request, res: Response) => {
  try {
    let apptId = req.body.id;
    if (!apptId || !apptId.startsWith('APP-')) {
      apptId = generateSequentialAppointmentId();
    }

    const apptObj = {
      ...req.body,
      id: apptId,
      status: req.body.status || 'Pending',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    inMemoryAppointments.unshift(apptObj);

    if (getMongoConnectedStatus()) {
      await Appointment.create(apptObj).catch(() => {});
    }

    return res.status(201).json({ success: true, appointment: apptObj });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      const updated = await Appointment.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        req.body,
        { new: true }
      );
      if (updated) {
        return res.json({ success: true, appointment: updated });
      }
    }

    const index = inMemoryAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      inMemoryAppointments[index] = { ...inMemoryAppointments[index], ...req.body };
    }
    return res.json({ success: true, appointment: inMemoryAppointments[index] || { id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
