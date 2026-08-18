import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

let inMemoryUsers: any[] = [
  {
    id: 'usr-1',
    _id: 'usr-1',
    name: 'محمد فاروق',
    email: 'farooq@example.com',
    username: 'MRN-84920',
    role: 'patient',
    mrn: 'MRN-84920',
    phone: '03019876543',
    city: 'گوجرانوالہ',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-2',
    _id: 'usr-2',
    name: 'کامران علی',
    email: 'kamran@example.com',
    username: 'MRN-84921',
    role: 'patient',
    mrn: 'MRN-84921',
    phone: '03219876543',
    city: 'لاہور',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

let apptCounter = 20;

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const mongoUsers = await User.find().select('-password').sort({ createdAt: -1 });
      const usersList = mongoUsers.map((mu) => ({
        id: mu._id.toString(),
        _id: mu._id.toString(),
        name: mu.name,
        email: mu.email,
        username: mu.username,
        role: mu.role,
        mrn: mu.mrn,
        phone: mu.phone,
        city: mu.city || 'گوجرانوالہ',
        status: mu.status || 'active',
        createdAt: mu.createdAt,
      }));
      return res.json({ success: true, users: usersList });
    }
    return res.json({ success: true, users: inMemoryUsers });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, users: inMemoryUsers });
  }
});

// POST /api/users
router.post('/', async (req: Request, res: Response) => {
  try {
    const rawPassword = req.body.password || 'user123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      username: req.body.username || req.body.email,
      password: hashedPassword,
      role: req.body.role || 'patient',
      mrn: req.body.mrn || (req.body.role === 'patient' ? `MRN-${Math.floor(10000 + Math.random() * 90000)}` : undefined),
      phone: req.body.phone,
      city: req.body.city || 'گوجرانوالہ',
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUser);

    if (getMongoConnectedStatus()) {
      await User.create(newUser).catch(() => {});
    }

    if (newUser.role === 'patient') {
      apptCounter += 1;
      const apptObj = {
        id: `APP-${String(apptCounter).padStart(3, '0')}`,
        patientId: newUser.id,
        patientName: newUser.name,
        phone: newUser.phone || '03000000000',
        city: newUser.city || 'گوجرانوالہ',
        problem: 'رجسٹرڈ بیمار (OPD Checkup)',
        doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
        date: new Date().toISOString().split('T')[0],
        timeSlot: 'صبح 10:00 - 01:00',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      if (getMongoConnectedStatus()) {
        await Appointment.create(apptObj).catch(() => {});
      }
    }

    return res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      const updated = await User.findByIdAndUpdate(id, req.body, { returnDocument: 'after' }).select('-password');
      if (updated) {
        return res.json({ success: true, user: updated });
      }
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id || u._id === id);
    if (idx !== -1) {
      inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...req.body };
    }
    return res.json({ success: true, user: inMemoryUsers[idx] || { id, ...req.body } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      await User.findByIdAndDelete(id);
    }
    inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id && u._id !== id);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
