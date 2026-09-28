import { Router, Request, Response } from 'express';
import { INITIAL_LAB_ORDERS, PREDEFINED_LAB_TESTS } from '../../src/data/labCatalogData';
import { INITIAL_PHARMACY_BATCHES } from '../../src/data/pharmacyBatchData';
import { INITIAL_WARD_BEDS, INITIAL_IPD_ADMISSIONS } from '../../src/data/ipdWardData';

const router = Router();

// In-Memory Storage with Initial Mock Data
let inMemoryPrescriptions: any[] = [
  {
    id: 'RX-1001',
    prescriptionNo: 'RX-2026-08940',
    date: new Date().toISOString().split('T')[0],
    patientId: 'APP-1001',
    patientName: 'کامران خان (Kamran Khan)',
    patientAge: 38,
    patientGender: 'Male',
    patientPhone: '0300-9876543',
    tokenNumber: 'TK-101',
    mrn: 'MRN-88491',
    doctorId: 'doc-1',
    doctorName: 'ڈاکٹر زیشان چوہدری',
    doctorDegree: 'BEMS (Gold Medalist), MD (Herbal & General Medicine)',
    doctorPmcNumber: 'PHC/2026/8940',
    doctorDepartment: 'General Medicine & Herbal Specialist',
    vitals: {
      bpSystolic: 125,
      bpDiastolic: 82,
      pulse: 74,
      temperatureF: 98.4,
      weightKg: 76,
      bloodSugarRandom: 110,
    },
    chiefComplaints: ['سر درد و گردن میں کھچاؤ', 'نیند کی کمی اور بے چینی'],
    diagnosis: 'Cervical Tension Headache & Mild Hypertension',
    items: [
      {
        id: 'rx-it-1',
        medicineName: 'Hoorab Hair & Scalp Miracle Oil',
        form: 'Oil',
        dosage: '10ml',
        frequency: '0-0-1 (رات کو سوتے وقت)',
        duration: '15 Days',
        instructions: 'سر اور گردن کے پٹھوں میں ہلکا مساج کریں',
        quantity: 1,
      },
      {
        id: 'rx-it-2',
        medicineName: 'حَب شِفاء اعصاب (Nerve Calming Herbal Tablets)',
        form: 'Tablet',
        dosage: '500mg',
        frequency: '1-0-1 (صبح و شام بعد از غذا)',
        duration: '10 Days',
        instructions: 'تازہ پانی یا نیم گرم دودھ کے ساتھ لیں',
        quantity: 20,
      }
    ],
    recommendedTests: ['کمپیوٹرائزڈ نظر کا معائنہ (Vision Scan)', 'بلڈ شوگر فاسٹنگ (BSF)'],
    dietaryAdvice: 'چکنائی والی اور تلی ہوئی اشیاء سے پرہیز کریں، روزانہ 10 گلاس پانی پئیں۔',
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    isDigitalSigned: true,
    qrCodeData: 'https://hafizclinic.pk/verify-rx/RX-1001',
    createdAt: new Date().toISOString(),
  }
];

let inMemoryLabOrders: any[] = [...INITIAL_LAB_ORDERS];
let inMemoryBatches: any[] = [...INITIAL_PHARMACY_BATCHES];
let inMemoryShifts: any[] = [
  {
    id: 'shift-1001',
    shiftNo: 'SHIFT-2026-0819-M',
    shiftType: 'Morning',
    openedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    closedAt: new Date().toISOString(),
    status: 'Closed',
    cashierId: 'staff-1',
    cashierName: 'محمد علی (Reception Cashier)',
    openingFloat: 10000,
    totalGrossSales: 45000,
    totalDiscounts: 2500,
    totalNetSales: 42500,
    cashCollections: 32500,
    cardCollections: 5000,
    onlineCollections: 5000,
    totalExpenses: 4500,
    expectedCash: 38000,
    actualPhysicalCash: 38000,
    cashDifference: 0,
    doctorRevenueSplits: [
      {
        doctorId: 'doc-1',
        doctorName: 'ڈاکٹر زیشان چوہدری',
        consultationCount: 14,
        totalOpdFeeCollected: 21000,
        doctorSharePercentage: 70,
        doctorPayable: 14700,
        hospitalRetained: 6300,
        status: 'Paid',
      },
      {
        doctorId: 'doc-2',
        doctorName: 'ڈاکٹر وقاص صغیر چوہدری',
        consultationCount: 8,
        totalOpdFeeCollected: 16000,
        doctorSharePercentage: 70,
        doctorPayable: 11200,
        hospitalRetained: 4800,
        status: 'Pending',
      }
    ],
    notes: 'تمام کیش کاؤنٹنگ درست ہے۔',
  }
];

let inMemoryStaff: any[] = [
  {
    id: 'staff-1',
    name: 'حارث محمود (Haris Mehmood)',
    role: 'Pharmacist',
    phone: '0301-1122334',
    email: 'pharmacy@hafizclinic.pk',
    status: 'Active',
    joinedDate: '2024-01-15',
    permissions: ['pos_sales', 'inventory_manage', 'expiry_alerts', 'reports_view'],
  },
  {
    id: 'staff-2',
    name: 'سلمان اشرف (Salman Ashraf)',
    role: 'Lab Technician',
    phone: '0302-9988776',
    email: 'lab@hafizclinic.pk',
    status: 'Active',
    joinedDate: '2024-03-01',
    permissions: ['test_orders', 'result_entry', 'lab_printing', 'sample_dispatch'],
  },
  {
    id: 'staff-3',
    name: 'عثمان رفیق (Usman Rafique)',
    role: 'Receptionist',
    phone: '0303-5566778',
    email: 'reception@hafizclinic.pk',
    status: 'Active',
    joinedDate: '2023-11-20',
    permissions: ['opd_queue', 'appointments_book', 'slip_billing', 'shift_counter'],
  },
  {
    id: 'staff-4',
    name: 'ڈاکٹر زیشان چوہدری',
    role: 'Doctor',
    phone: '0300-1234567',
    email: 'dr.zeeshan@hafizclinic.pk',
    status: 'Active',
    joinedDate: '2020-05-10',
    permissions: ['doctor_consultation', 'digital_rx', 'telehealth_chat', 'split_reports'],
  }
];

let inMemoryIpdBeds: any[] = [...INITIAL_WARD_BEDS];
let inMemoryIpdAdmissions: any[] = [...INITIAL_IPD_ADMISSIONS];

// ==================== IPD & WARD MANAGEMENT ENDPOINTS ====================

// GET all beds
router.get('/ipd-beds', (req: Request, res: Response) => {
  res.json({ success: true, count: inMemoryIpdBeds.length, data: inMemoryIpdBeds });
});

// PUT update bed status
router.put('/ipd-beds/:id', (req: Request, res: Response) => {
  const idx = inMemoryIpdBeds.findIndex((b) => b.id === req.params.id || b.bedNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Bed not found' });
  }

  inMemoryIpdBeds[idx] = {
    ...inMemoryIpdBeds[idx],
    ...req.body,
  };

  res.json({ success: true, message: 'Bed updated', data: inMemoryIpdBeds[idx] });
});

// GET IPD admissions
router.get('/ipd-admissions', (req: Request, res: Response) => {
  const { status, patientPhone } = req.query;
  let result = inMemoryIpdAdmissions;

  if (status) {
    result = result.filter((a) => a.status === status);
  }
  if (patientPhone) {
    result = result.filter((a) => a.patientPhone === patientPhone);
  }

  res.json({ success: true, count: result.length, data: result });
});

// POST new IPD admission
router.post('/ipd-admissions', (req: Request, res: Response) => {
  const admData = req.body;
  const newAdm = {
    id: admData.id || `IPD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    admissionNumber: admData.admissionNumber || `IPD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    mrn: admData.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    admissionDate: admData.admissionDate || new Date().toISOString().split('T')[0],
    admissionTime: admData.admissionTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Admitted',
    nursingLogs: [],
    doctorVisitNotes: [],
    ...admData,
    createdAt: new Date().toISOString(),
  };

  inMemoryIpdAdmissions.unshift(newAdm);

  // Mark bed as occupied
  if (newAdm.bedId) {
    const bedIdx = inMemoryIpdBeds.findIndex((b) => b.id === newAdm.bedId);
    if (bedIdx !== -1) {
      inMemoryIpdBeds[bedIdx].status = 'Occupied';
      inMemoryIpdBeds[bedIdx].currentAdmissionId = newAdm.id;
      inMemoryIpdBeds[bedIdx].currentPatientName = newAdm.patientName;
      inMemoryIpdBeds[bedIdx].admittedSince = newAdm.admissionDate;
    }
  }

  res.status(201).json({ success: true, message: 'Patient admitted successfully', data: newAdm });
});

// POST add 4-hourly nursing care log
router.post('/ipd-admissions/:id/nursing-log', (req: Request, res: Response) => {
  const idx = inMemoryIpdAdmissions.findIndex((a) => a.id === req.params.id || a.admissionNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Admission record not found' });
  }

  const logData = req.body;
  const newLog = {
    id: logData.id || `nlog-${Date.now()}`,
    admissionId: req.params.id,
    timestamp: logData.timestamp || `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    ...logData,
  };

  inMemoryIpdAdmissions[idx].nursingLogs.push(newLog);
  res.json({ success: true, message: 'Nursing round log added', data: newLog, admission: inMemoryIpdAdmissions[idx] });
});

// PUT discharge patient & record clearance bill
router.put('/ipd-admissions/:id/discharge', (req: Request, res: Response) => {
  const idx = inMemoryIpdAdmissions.findIndex((a) => a.id === req.params.id || a.admissionNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Admission record not found' });
  }

  const dischargeDetails = req.body;
  inMemoryIpdAdmissions[idx].status = 'Discharged';
  inMemoryIpdAdmissions[idx].dischargeDetails = dischargeDetails;

  // Vacate bed and mark for cleaning
  const bedId = inMemoryIpdAdmissions[idx].bedId;
  const bedIdx = inMemoryIpdBeds.findIndex((b) => b.id === bedId);
  if (bedIdx !== -1) {
    inMemoryIpdBeds[bedIdx].status = 'Cleaning';
    inMemoryIpdBeds[bedIdx].currentAdmissionId = undefined;
    inMemoryIpdBeds[bedIdx].currentPatientName = undefined;
    inMemoryIpdBeds[bedIdx].admittedSince = undefined;
  }

  res.json({ success: true, message: 'Patient discharged and clearance bill finalized', data: inMemoryIpdAdmissions[idx] });
});

// ==================== PRESCRIPTION ENDPOINTS ====================

// GET all prescriptions
router.get('/prescriptions', (req: Request, res: Response) => {
  const { patientPhone, doctorId, date } = req.query;
  let result = inMemoryPrescriptions;

  if (patientPhone) {
    result = result.filter((p) => p.patientPhone === patientPhone);
  }
  if (doctorId) {
    result = result.filter((p) => p.doctorId === doctorId);
  }
  if (date) {
    result = result.filter((p) => p.date === date);
  }

  res.json({ success: true, count: result.length, data: result });
});

// POST new prescription
router.post('/prescriptions', (req: Request, res: Response) => {
  const rxData = req.body;
  const newRx = {
    id: rxData.id || `RX-${Date.now()}`,
    prescriptionNo: rxData.prescriptionNo || `RX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    date: rxData.date || new Date().toISOString().split('T')[0],
    ...rxData,
    createdAt: new Date().toISOString(),
  };

  inMemoryPrescriptions.unshift(newRx);
  res.status(201).json({ success: true, message: 'Prescription created successfully', data: newRx });
});

// GET single prescription
router.get('/prescriptions/:id', (req: Request, res: Response) => {
  const rx = inMemoryPrescriptions.find((p) => p.id === req.params.id || p.prescriptionNo === req.params.id);
  if (!rx) {
    return res.status(404).json({ success: false, error: 'Prescription not found' });
  }
  res.json({ success: true, data: rx });
});

// ==================== LAB ORDERS ENDPOINTS ====================

// GET all lab orders
router.get('/lab-orders', (req: Request, res: Response) => {
  const { status, patientPhone } = req.query;
  let result = inMemoryLabOrders;

  if (status) {
    result = result.filter((o) => o.status === status);
  }
  if (patientPhone) {
    result = result.filter((o) => o.patientPhone === patientPhone);
  }

  res.json({ success: true, count: result.length, data: result, catalog: PREDEFINED_LAB_TESTS });
});

// POST new lab order
router.post('/lab-orders', (req: Request, res: Response) => {
  const orderData = req.body;
  const newOrder = {
    id: orderData.id || `LAB-${Date.now()}`,
    orderNo: orderData.orderNo || `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: orderData.date || new Date().toISOString().split('T')[0],
    ...orderData,
    createdAt: new Date().toISOString(),
  };

  inMemoryLabOrders.unshift(newOrder);
  res.status(201).json({ success: true, message: 'Lab order created successfully', data: newOrder });
});

// PUT update lab order
router.put('/lab-orders/:id', (req: Request, res: Response) => {
  const idx = inMemoryLabOrders.findIndex((o) => o.id === req.params.id || o.orderNo === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Lab order not found' });
  }

  inMemoryLabOrders[idx] = {
    ...inMemoryLabOrders[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, message: 'Lab order updated successfully', data: inMemoryLabOrders[idx] });
});

// ==================== PHARMACY BATCHES ENDPOINTS ====================

// GET all pharmacy batches
router.get('/pharmacy-batches', (req: Request, res: Response) => {
  res.json({ success: true, count: inMemoryBatches.length, data: inMemoryBatches });
});

// POST new pharmacy batch
router.post('/pharmacy-batches', (req: Request, res: Response) => {
  const batchData = req.body;
  const newBatch = {
    id: batchData.id || `BATCH-${Date.now()}`,
    batchNumber: batchData.batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
    ...batchData,
    createdAt: new Date().toISOString(),
  };

  inMemoryBatches.unshift(newBatch);
  res.status(201).json({ success: true, message: 'Pharmacy batch added successfully', data: newBatch });
});

// PUT update pharmacy batch (e.g. sale deduction or adjustment)
router.put('/pharmacy-batches/:id', (req: Request, res: Response) => {
  const idx = inMemoryBatches.findIndex((b) => b.id === req.params.id || b.batchNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }

  inMemoryBatches[idx] = {
    ...inMemoryBatches[idx],
    ...req.body,
  };

  res.json({ success: true, message: 'Batch updated successfully', data: inMemoryBatches[idx] });
});

// POST process pharmacy sale with real-time stock deduction and low-stock check
router.post('/pharmacy-sale', (req: Request, res: Response) => {
  const { items, totalAmount, paymentMethod, customerName, slipNo } = req.body;
  const lowStockAlerts: string[] = [];

  if (Array.isArray(items)) {
    for (const item of items) {
      const bIdx = inMemoryBatches.findIndex(
        (b) => b.id === item.batchId || b.id === item.id || b.batchNumber === item.batchNumber
      );
      if (bIdx !== -1) {
        const qty = Number(item.quantity) || 1;
        inMemoryBatches[bIdx].currentStock = Math.max(0, (inMemoryBatches[bIdx].currentStock || 0) - qty);
        if (inMemoryBatches[bIdx].currentStock < (inMemoryBatches[bIdx].minThreshold || 10)) {
          lowStockAlerts.push(
            `Low Stock Warning: ${inMemoryBatches[bIdx].productNameUrdu || inMemoryBatches[bIdx].productNameEnglish} has ${inMemoryBatches[bIdx].currentStock} units remaining.`
          );
        }
      }
    }
  }

  res.json({
    success: true,
    message: 'Pharmacy sale processed and inventory updated',
    slipNo: slipNo || `PHARM-${Date.now()}`,
    totalAmount,
    paymentMethod,
    customerName,
    lowStockAlerts,
    updatedBatchesCount: inMemoryBatches.length,
    timestamp: new Date().toISOString(),
  });
});

// ==================== SHIFT ACCOUNTS ENDPOINTS ====================

// GET all financial shifts
router.get('/financial-shifts', (req: Request, res: Response) => {
  res.json({ success: true, count: inMemoryShifts.length, data: inMemoryShifts });
});

// POST open or create new shift
router.post('/financial-shifts', (req: Request, res: Response) => {
  const shiftData = req.body;
  const newShift = {
    id: shiftData.id || `shift-${Date.now()}`,
    shiftNo: shiftData.shiftNo || `SHIFT-${new Date().toISOString().split('T')[0]}-${Math.floor(100 + Math.random() * 900)}`,
    openedAt: new Date().toISOString(),
    status: 'Open',
    ...shiftData,
  };

  inMemoryShifts.unshift(newShift);
  res.status(201).json({ success: true, message: 'Shift created successfully', data: newShift });
});

// PUT close shift
router.put('/financial-shifts/:id/close', (req: Request, res: Response) => {
  const idx = inMemoryShifts.findIndex((s) => s.id === req.params.id || s.shiftNo === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Shift not found' });
  }

  inMemoryShifts[idx] = {
    ...inMemoryShifts[idx],
    ...req.body,
    closedAt: new Date().toISOString(),
    status: 'Closed',
  };

  res.json({ success: true, message: 'Shift closed and audited successfully', data: inMemoryShifts[idx] });
});

// ==================== STAFF & RBAC ENDPOINTS ====================

// GET staff members
router.get('/staff-users', (req: Request, res: Response) => {
  res.json({ success: true, count: inMemoryStaff.length, data: inMemoryStaff });
});

// POST new staff member
router.post('/staff-users', (req: Request, res: Response) => {
  const staffData = req.body;
  const newStaff = {
    id: staffData.id || `staff-${Date.now()}`,
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    ...staffData,
  };

  inMemoryStaff.push(newStaff);
  res.status(201).json({ success: true, message: 'Staff member registered', data: newStaff });
});

export default router;
