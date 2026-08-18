import { MoneySlip, MoneySlipItem, Doctor, Appointment } from '../types';

const STORAGE_KEY = 'hafiz_hospital_money_slips';

export interface HospitalServiceItem {
  id: string;
  code: string;
  nameUrdu: string;
  nameEnglish: string;
  category: 'Checkup Fee' | 'X-Ray / Radiology' | 'Lab Test / Scan' | 'Medicine' | 'Eye Care / Glasses' | 'Operation / Surgery' | 'Hijama / Cupping' | 'Physiotherapy' | 'Dressing / Nursing' | 'Bed Charge' | 'Consultation' | 'Misc Service';
  department: string;
  unitPrice: number;
}

// Comprehensive Hospital Services Catalog across all departments
export const HOSPITAL_SERVICES_CATALOG: HospitalServiceItem[] = [
  // 1. Radiology & X-Ray
  { id: 'srv-xr-1', code: 'XR-01', nameUrdu: 'چیسٹ ایکسرے ڈیجیٹل (Digital Chest X-Ray PA)', nameEnglish: 'Digital Chest X-Ray PA View', category: 'X-Ray / Radiology', department: 'Radiology / X-Ray', unitPrice: 1200 },
  { id: 'srv-xr-2', code: 'XR-02', nameUrdu: 'کمر و مہروں کا ایکسرے (Spine / Lumbar X-Ray)', nameEnglish: 'Lumbar Spine X-Ray (AP/Lat)', category: 'X-Ray / Radiology', department: 'Radiology / X-Ray', unitPrice: 1500 },
  { id: 'srv-xr-3', code: 'XR-03', nameUrdu: 'جوڑوں و گھٹنوں کا ایکسرے (Knee / Joint X-Ray)', nameEnglish: 'Knee Joint X-Ray Both', category: 'X-Ray / Radiology', department: 'Radiology / X-Ray', unitPrice: 1200 },
  { id: 'srv-xr-4', code: 'XR-04', nameUrdu: 'الٹراساؤنڈ پیٹ و مثانہ (Ultrasound Abdomen & Pelvis)', nameEnglish: 'Ultrasound Whole Abdomen & Pelvis', category: 'X-Ray / Radiology', department: 'Radiology / X-Ray', unitPrice: 2000 },
  { id: 'srv-xr-5', code: 'XR-05', nameUrdu: 'کلر ڈوپلر اسکین (Color Doppler Vascular Scan)', nameEnglish: 'Color Doppler Scan', category: 'X-Ray / Radiology', department: 'Radiology / X-Ray', unitPrice: 3500 },

  // 2. Pathology & Lab Tests
  { id: 'srv-lab-1', code: 'LAB-01', nameUrdu: 'خون کا مکمل ٹیسٹ (Complete Blood Count - CBC)', nameEnglish: 'CBC (Complete Blood Count)', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 850 },
  { id: 'srv-lab-2', code: 'LAB-02', nameUrdu: 'خون میں شوگر ٹیسٹ (Blood Sugar Fasting / Random)', nameEnglish: 'Blood Sugar (Fasting / Random)', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 300 },
  { id: 'srv-lab-3', code: 'LAB-03', nameUrdu: 'تین ماہ کی شوگر کا ٹیسٹ (HbA1c Glycated Hemoglobin)', nameEnglish: 'HbA1c 3-Month Glucose', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 1500 },
  { id: 'srv-lab-4', code: 'LAB-04', nameUrdu: 'جگر کے افعال کا ٹیسٹ (Liver Function Test - LFT)', nameEnglish: 'Liver Function Test (LFT)', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 1800 },
  { id: 'srv-lab-5', code: 'LAB-05', nameUrdu: 'گردوں کا ٹیسٹ (Renal Function Test - RFT / Urea Creatinine)', nameEnglish: 'Renal Function Test (RFT)', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 1400 },
  { id: 'srv-lab-6', code: 'LAB-06', nameUrdu: 'کولیسٹرول و چکنائی ٹیسٹ (Lipid Profile Complete)', nameEnglish: 'Lipid Profile Complete', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 1600 },
  { id: 'srv-lab-7', code: 'LAB-07', nameUrdu: 'یورک ایسڈ ٹیسٹ (Serum Uric Acid)', nameEnglish: 'Serum Uric Acid', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 500 },
  { id: 'srv-lab-8', code: 'LAB-08', nameUrdu: 'کمپیوٹرائزڈ بائیو کوانٹم باڈی اسکین (Full Body Scan)', nameEnglish: 'Computerized Bio-Quantum Body Scan', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 1500 },
  { id: 'srv-lab-9', code: 'LAB-09', nameUrdu: 'پیشاب کا تفصیلی ٹیسٹ (Urine Routine Examination)', nameEnglish: 'Urine Routine Examination', category: 'Lab Test / Scan', department: 'Laboratory & Pathology', unitPrice: 400 },

  // 3. Hijama & Cupping Therapy
  { id: 'srv-hij-1', code: 'HIJ-01', nameUrdu: 'سنت حجامہ سیشن مکمل کمر (Full Back Sunnah Hijama 7 Cups)', nameEnglish: 'Full Back Sunnah Hijama (7 Cups)', category: 'Hijama / Cupping', department: 'Hijama & Natural Healing', unitPrice: 2500 },
  { id: 'srv-hij-2', code: 'HIJ-02', nameUrdu: 'مائیگرین و سر درد حجامہ (Head & Migraine Hijama 5 Cups)', nameEnglish: 'Migraine / Head Hijama (5 Cups)', category: 'Hijama / Cupping', department: 'Hijama & Natural Healing', unitPrice: 2000 },
  { id: 'srv-hij-3', code: 'HIJ-03', nameUrdu: 'گھٹنوں و جوڑوں کے درد کا حجامہ (Joint & Knee Pain Hijama)', nameEnglish: 'Joint & Knee Pain Hijama', category: 'Hijama / Cupping', department: 'Hijama & Natural Healing', unitPrice: 2000 },
  { id: 'srv-hij-4', code: 'HIJ-04', nameUrdu: 'فل باڈی آرگن ڈیٹاکس حجامہ (Full Body Organ Detox Hijama)', nameEnglish: 'Organ Detox Cupping Therapy', category: 'Hijama / Cupping', department: 'Hijama & Natural Healing', unitPrice: 3000 },

  // 4. Physiotherapy & Spine Care
  { id: 'srv-pt-1', code: 'PT-01', nameUrdu: 'مہرے سیدھا کرنے کا سیشن (Spine Decompression Therapy)', nameEnglish: 'Spine Decompression Therapy Session', category: 'Physiotherapy', department: 'Physiotherapy & Spine Care', unitPrice: 2500 },
  { id: 'srv-pt-2', code: 'PT-02', nameUrdu: 'گردن کے مہروں کا ٹریکشن (Cervical Traction Session)', nameEnglish: 'Cervical Neck Traction Session', category: 'Physiotherapy', department: 'Physiotherapy & Spine Care', unitPrice: 1800 },
  { id: 'srv-pt-3', code: 'PT-03', nameUrdu: 'گھٹنوں کی فزیوتھراپی و ورزش (Knee Rehabilitation Session)', nameEnglish: 'Knee Rehab Therapy Session', category: 'Physiotherapy', department: 'Physiotherapy & Spine Care', unitPrice: 2000 },
  { id: 'srv-pt-4', code: 'PT-04', nameUrdu: 'فالج و لقوہ بحالی سیشن (Stroke & Paralysis Rehab Session)', nameEnglish: 'Paralysis & Stroke Rehab Session', category: 'Physiotherapy', department: 'Physiotherapy & Spine Care', unitPrice: 3500 },
  { id: 'srv-pt-5', code: 'PT-05', nameUrdu: 'الیکٹرک پین ریلیف و ہیٹ تھراپی (TENS & Infrared Heat)', nameEnglish: 'TENS & Infrared Heat Therapy', category: 'Physiotherapy', department: 'Physiotherapy & Spine Care', unitPrice: 1200 },

  // 5. Eye Care & Optical Department
  { id: 'srv-eye-1', code: 'EYE-01', nameUrdu: 'کمپیوٹرائزڈ آنکھوں کا معائنہ (Computerized Eye Vision Exam)', nameEnglish: 'Computerized Eye Vision Exam', category: 'Eye Care / Glasses', department: 'Eye Care & Optical', unitPrice: 500 },
  { id: 'srv-eye-2', code: 'EYE-02', nameUrdu: 'اینٹی گلیئر بلیو کٹ لینس (Anti-Glare Blue Cut Lenses)', nameEnglish: 'Anti-Glare Blue Cut Optical Lens Pair', category: 'Eye Care / Glasses', department: 'Eye Care & Optical', unitPrice: 2500 },
  { id: 'srv-eye-3', code: 'EYE-03', nameUrdu: 'پریمیم نظر کا چشمہ فریم (Premium Titanium Glasses Frame)', nameEnglish: 'Premium Titanium Glasses Frame', category: 'Eye Care / Glasses', department: 'Eye Care & Optical', unitPrice: 2000 },
  { id: 'srv-eye-4', code: 'EYE-04', nameUrdu: 'پروگریسو / بائی فوکل لینس (Progressive / Bifocal Lenses)', nameEnglish: 'Progressive Bifocal Lens Pair', category: 'Eye Care / Glasses', department: 'Eye Care & Optical', unitPrice: 4500 },
  { id: 'srv-eye-5', code: 'EYE-05', nameUrdu: 'کولنگ ہربل آئی ڈراپس کورس (Cooling Herbal Eye Drops Course)', nameEnglish: 'Cooling Herbal Eye Drops Course', category: 'Eye Care / Glasses', department: 'Eye Care & Optical', unitPrice: 650 },

  // 6. Surgery, Emergency & Nursing
  { id: 'srv-surg-1', code: 'SURG-01', nameUrdu: 'وارٹ، مسے و گلٹی کا چھوٹا آپریشن (Minor Surgery / Cyst Removal)', nameEnglish: 'Minor Surgery / Cyst Removal', category: 'Operation / Surgery', department: 'Surgical & Minor Procedures', unitPrice: 5000 },
  { id: 'srv-surg-2', code: 'NUR-01', nameUrdu: 'زخم کی جراثیم کش پٹی و ڈریسنگ (Sterile Wound Dressing)', nameEnglish: 'Sterile Wound Dressing / Bandage', category: 'Dressing / Nursing', department: 'Emergency & Nursing', unitPrice: 500 },
  { id: 'srv-surg-3', code: 'NUR-02', nameUrdu: 'ڈرپ و آئی وی کینولا فیس (IV Cannula & Drip Administration)', nameEnglish: 'IV Cannula & Drip Administration', category: 'Dressing / Nursing', department: 'Emergency & Nursing', unitPrice: 600 },
  { id: 'srv-surg-4', code: 'NUR-03', nameUrdu: 'ایمرجنسی ای سی جی دل کا معائنہ (Emergency ECG with Report)', nameEnglish: 'Emergency ECG with Report', category: 'Lab Test / Scan', department: 'Emergency & Nursing', unitPrice: 1000 },
  { id: 'srv-surg-5', code: 'NUR-04', nameUrdu: 'دمہ و سانس کا نیبولائزیشن سیشن (Nebulization Session)', nameEnglish: 'Nebulization Session', category: 'Dressing / Nursing', department: 'Emergency & Nursing', unitPrice: 400 },

  // 7. Pharmacy & Medicines
  { id: 'srv-med-1', code: 'MED-01', nameUrdu: 'ہوراب ہیئر گروتھ آئل 200 ملی لیٹر (Hoorab Hair Growth Oil)', nameEnglish: 'Hoorab Hair Growth Oil 200ml', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 1650 },
  { id: 'srv-med-2', code: 'MED-02', nameUrdu: 'جوڑوں و پٹھوں کا درد کشا مرہم و آئل (Pain Relief Balm & Oil)', nameEnglish: 'Joint & Muscle Pain Balm & Oil', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 950 },
  { id: 'srv-med-3', code: 'MED-03', nameUrdu: 'نرو ٹانک و حبِ سورنجان کورس (Nerve Tonic & Joint Tablets)', nameEnglish: 'Nerve Tonic & Joint Care Course', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 1800 },
  { id: 'srv-med-4', code: 'MED-04', nameUrdu: 'معدہ و تیزابیت شربت و سفوف (Stomach & Acidity Syrup Pack)', nameEnglish: 'Stomach Acidity Relief Syrup Pack', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 550 },
  { id: 'srv-med-5', code: 'MED-05', nameUrdu: 'خالص ہمالیائی سلاجیت 20 گرام (Pure Himalayan Shilajit 20g)', nameEnglish: 'Pure Himalayan Shilajit 20g', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 2200 },
  { id: 'srv-med-6', code: 'MED-06', nameUrdu: 'قوتِ مدافعت ہربل کورس (Immunity Booster Course)', nameEnglish: 'Herbal Immunity Booster Course', category: 'Medicine', department: 'Pharmacy / Dispensary', unitPrice: 2500 },
];

export const initialDefaultSlips: MoneySlip[] = [
  {
    id: 'slip-1001',
    slipNo: 'SLIP-1001',
    tokenNumber: 'TK-101',
    patientName: 'محمد طارق (Tariq)',
    patientPhone: '03001234567',
    mrnNumber: 'MRN-4589',
    doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', description: 'ڈاکٹر معائنہ و چیک اپ فیس (OPD Checkup) (ٹوکن #TK-101)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500, department: 'OPD / Doctor Checkup', servedBy: 'ڈاکٹر زیشان چوہدری' },
      { id: 'item-2', description: 'ہوراب ہیئر آئل (Hoorab Hair Oil 200ml)', category: 'Medicine', quantity: 2, unitPrice: 1650, totalPrice: 3300, department: 'Pharmacy / Dispensary' },
      { id: 'item-3', description: 'کمپیوٹرائزڈ بائیو کوانٹم باڈی اسکین', category: 'Lab Test / Scan', quantity: 1, unitPrice: 1500, totalPrice: 1500, department: 'Laboratory & Pathology' },
    ],
    subtotal: 6300,
    discount: 300,
    totalAmount: 6000,
    paidAmount: 6000,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    notes: 'مکمل ادائیگی نقد وصول کر لی گئی۔',
    appointmentId: 'APP-001',
    isAutoGenerated: true,
    source: 'Appointment',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slip-1002',
    slipNo: 'SLIP-1002',
    tokenNumber: 'TK-102',
    patientName: 'کامران علی (Kamran Ali)',
    patientPhone: '03219876543',
    mrnNumber: 'MRN-6520',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری (MBBS)',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', description: 'فزیو تھراپی کنسلٹیشن فیس (ٹوکن #TK-102)', category: 'Checkup Fee', quantity: 1, unitPrice: 2000, totalPrice: 2000, department: 'Physiotherapy & Spine Care', servedBy: 'ڈاکٹر وقاص صغیر چوہدری' },
      { id: 'item-2', description: 'مہرے سیدھا کرنے کا سیشن (Spine Decompression)', category: 'Physiotherapy', quantity: 2, unitPrice: 2500, totalPrice: 5000, department: 'Physiotherapy & Spine Care' },
      { id: 'item-3', description: 'درد کشا مرہم اور نرو ٹانک', category: 'Medicine', quantity: 1, unitPrice: 2500, totalPrice: 2500, department: 'Pharmacy / Dispensary' },
    ],
    subtotal: 9500,
    discount: 1000,
    totalAmount: 8500,
    paidAmount: 5000,
    balanceAmount: 3500,
    paymentStatus: 'Partial',
    paymentMethod: 'EasyPaisa',
    notes: 'بقایا جات 3,500 روپے اگلے سیشن پر واجب الادا ہیں۔',
    appointmentId: 'APP-002',
    isAutoGenerated: true,
    source: 'Appointment',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slip-1003',
    slipNo: 'SLIP-1003',
    tokenNumber: 'TK-103',
    patientName: 'زینب بی بی (Zainab Bibi)',
    patientPhone: '03221122334',
    mrnNumber: 'MRN-99110',
    doctorName: 'ڈاکٹر زیشان چوہدری',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', description: 'کمپیوٹرائزڈ نظر کا چشمہ و فریم (Anti-Glare Optical Lens) (ٹوکن #TK-103)', category: 'Eye Care / Glasses', quantity: 1, unitPrice: 3500, totalPrice: 3500, department: 'Eye Care & Optical' },
      { id: 'item-2', description: 'کولنگ ہربل آئی ڈراپس', category: 'Eye Care / Glasses', quantity: 1, unitPrice: 650, totalPrice: 650, department: 'Pharmacy / Dispensary' },
    ],
    subtotal: 4150,
    discount: 150,
    totalAmount: 4000,
    paidAmount: 4000,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    notes: 'نظر کا فریم اور لینس ڈیلیور کر دیا گیا۔',
    isAutoGenerated: false,
    source: 'Doctor OPD',
    createdAt: new Date().toISOString(),
  },
];

// Helper to get local slips
export function getLocalSlips(): MoneySlip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore error
  }
  return initialDefaultSlips;
}

// Helper to save local slips
export function setLocalSlips(slips: MoneySlip[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slips));
  } catch (e) {
    // Ignore error
  }
}

// Fetch all slips with API & fallback to localStorage
export async function fetchSlipsApi(params?: {
  phone?: string;
  mrn?: string;
  doctorName?: string;
  appointmentId?: string;
  tokenNumber?: string;
  q?: string;
}): Promise<MoneySlip[]> {
  try {
    const query = new URLSearchParams();
    if (params?.phone) query.append('phone', params.phone);
    if (params?.mrn) query.append('mrn', params.mrn);
    if (params?.doctorName) query.append('doctorName', params.doctorName);
    if (params?.appointmentId) query.append('appointmentId', params.appointmentId);
    if (params?.tokenNumber) query.append('tokenNumber', params.tokenNumber);
    if (params?.q) query.append('q', params.q);

    const res = await fetch(`/api/slips?${query.toString()}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.slips) && data.slips.length > 0) {
      setLocalSlips(data.slips);
      return data.slips;
    }
  } catch (e) {
    // API failed, fallback to local
  }
  return getLocalSlips();
}

// Save or Update a Money Slip
export async function saveSlipApi(slip: Partial<MoneySlip>): Promise<MoneySlip> {
  const currentSlips = getLocalSlips();
  let updatedSlip: MoneySlip;

  const isExisting = slip.id && currentSlips.some((s) => s.id === slip.id);

  if (isExisting) {
    const existingIndex = currentSlips.findIndex((s) => s.id === slip.id);
    const merged = { ...currentSlips[existingIndex], ...slip } as MoneySlip;
    currentSlips[existingIndex] = merged;
    updatedSlip = merged;
  } else {
    const newSlip: MoneySlip = {
      id: slip.id || `slip-${Date.now()}`,
      slipNo: slip.slipNo || `SLIP-${1000 + currentSlips.length + 1}`,
      tokenNumber: slip.tokenNumber || (slip.appointmentId ? `TK-${slip.appointmentId.replace('APP-', '')}` : `TK-${100 + currentSlips.length + 1}`),
      patientName: slip.patientName || '',
      patientPhone: slip.patientPhone || '',
      mrnNumber: slip.mrnNumber || `MRN-${(slip.patientPhone || '').replace(/\D/g, '').slice(-4) || '1001'}`,
      doctorName: slip.doctorName || 'ڈاکٹر زیشان چوہدری',
      date: slip.date || new Date().toISOString().split('T')[0],
      items: slip.items || [],
      subtotal: slip.subtotal || 0,
      discount: slip.discount || 0,
      totalAmount: slip.totalAmount || 0,
      paidAmount: slip.paidAmount || 0,
      balanceAmount: slip.balanceAmount || 0,
      paymentStatus: slip.paymentStatus || 'Unpaid',
      paymentMethod: slip.paymentMethod || 'Cash',
      notes: slip.notes || '',
      appointmentId: slip.appointmentId,
      isAutoGenerated: slip.isAutoGenerated || false,
      source: slip.source || 'Manual',
      referralInfo: slip.referralInfo,
      createdAt: slip.createdAt || new Date().toISOString(),
    };
    currentSlips.unshift(newSlip);
    updatedSlip = newSlip;
  }

  setLocalSlips(currentSlips);

  // Sync with Backend API
  try {
    if (isExisting) {
      await fetch(`/api/slips/${updatedSlip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlip),
      });
    } else {
      await fetch('/api/slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlip),
      });
    }
  } catch (e) {
    // Background sync failed, local copy preserved
  }

  return updatedSlip;
}

// Delete a Money Slip
export async function deleteSlipApi(id: string): Promise<boolean> {
  const currentSlips = getLocalSlips().filter((s) => s.id !== id && s.slipNo !== id);
  setLocalSlips(currentSlips);

  try {
    await fetch(`/api/slips/${id}`, { method: 'DELETE' });
    return true;
  } catch (e) {
    return true;
  }
}

// Automatically create an Invoice when an Appointment is approved
export async function createAutoInvoiceFromAppointment(
  appointment: Appointment,
  doctorList: Doctor[]
): Promise<MoneySlip> {
  const currentSlips = getLocalSlips();

  // Check if invoice already exists for this appointmentId or token
  const existing = currentSlips.find(
    (s) =>
      s.appointmentId === appointment.id ||
      (appointment.tokenNumber && String(s.tokenNumber) === String(appointment.tokenNumber))
  );
  if (existing) {
    if (appointment.tokenNumber && !existing.tokenNumber) {
      existing.tokenNumber = appointment.tokenNumber;
      setLocalSlips(currentSlips);
    }
    return existing;
  }

  // Find the doctor fee
  const docObj = doctorList.find(
    (d) =>
      d.nameUrdu === appointment.doctorName ||
      d.nameEnglish === appointment.doctorName ||
      (appointment.doctorName && d.nameUrdu.includes(appointment.doctorName)) ||
      (appointment.doctorName && appointment.doctorName.includes(d.nameUrdu))
  );

  const fee = appointment.doctorFee || docObj?.checkupFee || 1500;
  const cleanPhone = (appointment.phone || '').replace(/\D/g, '');
  const mrnNumber = `MRN-${cleanPhone.slice(-4) || '1001'}`;
  const slipNo = `SLIP-${1000 + currentSlips.length + 1}`;
  const tokenNum = appointment.tokenNumber || (appointment.id ? `TK-${appointment.id.replace('APP-', '')}` : `TK-${100 + currentSlips.length + 1}`);
  const tokenDisplay = ` (ٹوکن #${tokenNum})`;

  const items: MoneySlipItem[] = [
    {
      id: `it-${Date.now()}-1`,
      description: `ڈاکٹر معائنہ و اپائنٹمنٹ فیس (${appointment.doctorName || 'Senior Consultant'})${tokenDisplay}`,
      category: 'Checkup Fee',
      quantity: 1,
      unitPrice: fee,
      totalPrice: fee,
      department: 'OPD / Doctor Checkup',
      servedBy: appointment.doctorName || 'Senior Doctor',
    },
  ];

  const newSlip: MoneySlip = {
    id: `slip-${Date.now()}`,
    slipNo,
    tokenNumber: tokenNum,
    patientName: appointment.patientName,
    patientPhone: appointment.phone,
    mrnNumber,
    doctorName: appointment.doctorName || 'ڈاکٹر زیشان چوہدری',
    date: appointment.date || new Date().toISOString().split('T')[0],
    items,
    subtotal: fee,
    discount: 0,
    totalAmount: fee,
    paidAmount: 0,
    balanceAmount: fee,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
    notes: `خودکار بل برائے اپائنٹمنٹ (${appointment.id}) — ٹوکن #${tokenNum} — عارضہ: ${appointment.problem || 'معائنہ'}`,
    appointmentId: appointment.id,
    isAutoGenerated: true,
    source: 'Appointment',
    createdAt: new Date().toISOString(),
  };

  currentSlips.unshift(newSlip);
  setLocalSlips(currentSlips);

  // Trigger backend API
  try {
    await fetch('/api/slips/auto-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: appointment.id,
        tokenNumber: tokenNum,
        patientName: appointment.patientName,
        patientPhone: appointment.phone,
        doctorName: appointment.doctorName,
        checkupFee: fee,
        city: appointment.city,
        problem: appointment.problem,
      }),
    });
  } catch (e) {
    // API failure handled gracefully
  }

  return newSlip;
}

// Find an existing invoice by Token Number, Appointment ID, Phone, SlipNo, or Patient Name
export function findPatientInvoice(searchKey: string): MoneySlip | null {
  if (!searchKey || !searchKey.trim()) return null;
  const currentSlips = getLocalSlips();
  const q = searchKey.trim().toLowerCase();
  const cleanNum = searchKey.replace(/\D/g, '');

  return (
    currentSlips.find((s) => {
      // 1. Direct Token Match
      if (s.tokenNumber && String(s.tokenNumber).toLowerCase() === q) return true;
      if (s.tokenNumber && String(s.tokenNumber).toLowerCase() === `tk-${q}`) return true;
      if (s.tokenNumber && `tk-${String(s.tokenNumber).toLowerCase()}` === q) return true;

      // 2. Slip Number Match
      if (s.slipNo && s.slipNo.toLowerCase() === q) return true;

      // 3. Appointment Id Match
      if (s.appointmentId && s.appointmentId.toLowerCase() === q) return true;

      // 4. Phone Match
      if (cleanNum && cleanNum.length >= 7 && s.patientPhone && s.patientPhone.replace(/\D/g, '').includes(cleanNum)) {
        return true;
      }

      // 5. Patient Name Exact or Substring
      if (s.patientName && s.patientName.toLowerCase().includes(q)) return true;

      return false;
    }) || null
  );
}

// Add an item (Medicine / X-Ray / Lab / Procedure / Service / Checkup) to Patient's Unified Token Invoice
export async function addItemToPatientInvoice(
  patientTokenOrPhoneOrApptId: string,
  patientName: string,
  doctorOrDepartmentName: string,
  item: Omit<MoneySlipItem, 'id' | 'totalPrice'> & { department?: string; servedBy?: string }
): Promise<MoneySlip> {
  const currentSlips = getLocalSlips();
  const rawKey = (patientTokenOrPhoneOrApptId || '').trim();
  const cleanKey = rawKey.replace(/\D/g, '');
  const rawLower = rawKey.toLowerCase();

  let slipIndex = currentSlips.findIndex((s) => {
    // 1. Match by Token Number
    if (s.tokenNumber && String(s.tokenNumber).toLowerCase() === rawLower) return true;
    if (s.tokenNumber && String(s.tokenNumber).toLowerCase() === `tk-${rawLower}`) return true;
    if (s.tokenNumber && `tk-${String(s.tokenNumber).toLowerCase()}` === rawLower) return true;

    // 2. Match by Appointment Id
    if (s.appointmentId && s.appointmentId.toLowerCase() === rawLower) return true;

    // 3. Match by Slip No
    if (s.slipNo && s.slipNo.toLowerCase() === rawLower) return true;

    // 4. Match by Phone Number
    if (cleanKey && cleanKey.length >= 7 && s.patientPhone && s.patientPhone.replace(/\D/g, '').includes(cleanKey)) {
      return true;
    }

    // 5. Match by Patient Name if phone/token is missing
    if (patientName && s.patientName && s.patientName.toLowerCase().trim() === patientName.toLowerCase().trim()) {
      return true;
    }

    return false;
  });

  let targetSlip: MoneySlip;

  const newItem: MoneySlipItem = {
    id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    description: item.description,
    category: item.category,
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
    department: item.department || (item.category as any) || 'Hospital Service',
    servedBy: item.servedBy || doctorOrDepartmentName,
  };

  if (slipIndex !== -1) {
    targetSlip = currentSlips[slipIndex];
    targetSlip.items = [...targetSlip.items, newItem];
    const subtotal = targetSlip.items.reduce((s, it) => s + it.totalPrice, 0);
    targetSlip.subtotal = subtotal;
    targetSlip.totalAmount = Math.max(0, subtotal - (targetSlip.discount || 0));
    targetSlip.balanceAmount = Math.max(0, targetSlip.totalAmount - (targetSlip.paidAmount || 0));
    if (targetSlip.paidAmount >= targetSlip.totalAmount && targetSlip.totalAmount > 0) {
      targetSlip.paymentStatus = 'Paid';
    } else if (targetSlip.paidAmount > 0) {
      targetSlip.paymentStatus = 'Partial';
    } else {
      targetSlip.paymentStatus = 'Unpaid';
    }
    currentSlips[slipIndex] = targetSlip;
  } else {
    // Create new unified slip stamped with Token
    const slipNo = `SLIP-${1000 + currentSlips.length + 1}`;
    const tokenNumber = rawKey.startsWith('TK-') ? rawKey : (cleanKey ? `TK-${cleanKey.slice(-3)}` : `TK-${100 + currentSlips.length + 1}`);
    const mrnNumber = `MRN-${cleanKey.slice(-4) || '1001'}`;
    targetSlip = {
      id: `slip-${Date.now()}`,
      slipNo,
      tokenNumber,
      patientName: patientName || 'Patient',
      patientPhone: rawKey.length >= 10 ? rawKey : '',
      mrnNumber,
      doctorName: doctorOrDepartmentName || 'ڈاکٹر زیشان چوہدری',
      date: new Date().toISOString().split('T')[0],
      items: [newItem],
      subtotal: newItem.totalPrice,
      discount: 0,
      totalAmount: newItem.totalPrice,
      paidAmount: 0,
      balanceAmount: newItem.totalPrice,
      paymentStatus: 'Unpaid',
      paymentMethod: 'Cash',
      notes: `سروس و ادویات بلنگ (ٹوکن #${tokenNumber})`,
      isAutoGenerated: false,
      source: 'Doctor OPD',
      createdAt: new Date().toISOString(),
    };
    currentSlips.unshift(targetSlip);
  }

  setLocalSlips(currentSlips);

  try {
    await fetch(`/api/slips/${targetSlip.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetSlip),
    });
  } catch (e) {
    // Silently continue
  }

  return targetSlip;
}

// Doctor or Admin Patient Referral Handler to another Doctor or Specialized Clinic Service
export async function referPatientToDoctor(params: {
  appointment: Appointment;
  fromDoctorName: string;
  toDoctor?: Doctor;
  referralService?: string;
  referralReason: string;
  referralFee?: number;
  includeReferralFee?: boolean;
}): Promise<{ updatedAppointment: Appointment; slip: MoneySlip; referralToken: string }> {
  const {
    appointment,
    fromDoctorName,
    toDoctor,
    referralService,
    referralReason,
    referralFee,
    includeReferralFee = true,
  } = params;

  // Generate a distinct sequential/unique Referral Token
  const referralToken = `REF-${Math.floor(100 + Math.random() * 900)}`;
  const targetName = toDoctor ? toDoctor.nameUrdu : (referralService || 'اسپیشلسٹ کلینک سروس');
  const targetFee = referralFee !== undefined ? referralFee : (toDoctor?.checkupFee || 1500);

  // 1. Update appointment object with referral metadata & token
  const updatedAppointment: Appointment = {
    ...appointment,
    referralToken,
    referralFromDoctor: fromDoctorName,
    referralToDoctor: targetName,
    referralService: referralService || (toDoctor ? toDoctor.specializationUrdu : 'کلینک سروس'),
    referralNotes: referralReason,
    referralFee: targetFee,
    referralStatus: 'Approved',
    isReferral: true,
    doctorName: targetName,
  };

  // 2. Add Referral Service / Consultation Fee to Patient's Running Invoice
  const description = referralService
    ? `سروس ریفرل: ${referralService} (${fromDoctorName} -> ${targetName}) — ٹوکن #${referralToken}`
    : `ڈاکٹر ریفرل کنسلٹیشن: ${fromDoctorName} -> ${targetName} (${referralReason || 'سپیشلسٹ معائنہ'}) — ٹوکن #${referralToken}`;

  const category = referralService
    ? (referralService.includes('Eye') || referralService.includes('چشمہ')
        ? 'Eye Care / Glasses'
        : referralService.includes('فزیو') || referralService.includes('Spine')
        ? 'Physiotherapy'
        : referralService.includes('اسکین') || referralService.includes('Test')
        ? 'Lab Test / Scan'
        : referralService.includes('سرجری') || referralService.includes('آپریشن')
        ? 'Operation / Surgery'
        : 'Referral Consultation')
    : 'Referral Consultation';

  const slip = await addItemToPatientInvoice(
    appointment.phone || appointment.id,
    appointment.patientName,
    targetName,
    {
      description,
      category: category as any,
      quantity: 1,
      unitPrice: includeReferralFee ? targetFee : 0,
    }
  );

  return { updatedAppointment, slip, referralToken };
}
