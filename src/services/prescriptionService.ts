import { Prescription } from '../types';

const STORAGE_KEY = 'hafiz_clinic_prescriptions_v2';

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-2026-001',
    rxNumber: 'RX-1001',
    patientId: 'PT-901',
    patientName: 'محمد عثمان علی',
    patientAge: 42,
    patientGender: 'Male',
    patientPhone: '0301-7654321',
    patientCity: 'لاہور',
    mrnNumber: 'MRN-78601',
    doctorId: 'dr-hafiz-suleman',
    doctorName: 'حکیم محمد سلیمان',
    doctorSpecialization: 'ہربل کنسلٹنٹ و ماہر نبض',
    doctorQualification: 'MD / BEMS (Gold Medalist), R.U.M.P',
    date: '2026-08-18',
    vitals: {
      bpSystolic: 125,
      bpDiastolic: 82,
      pulse: 76,
      temperature: 98.4,
      weightKg: 78,
      bloodSugarMgDl: 110,
      sugarType: 'Random',
      spo2: 98,
    },
    presentingComplaintsUrdu: 'معدے میں جلن، گیس، اور کندھوں اور پٹھوں میں کھچاؤ۔',
    clinicalDiagnosisUrdu: 'ضعفِ معدہ و عضلاتی کھچاؤ (Gastric Dyspepsia & Muscle Spasm)',
    medicines: [
      {
        id: 'm1',
        name: 'جوارش کمونی خاص (Jawarish Kamuni)',
        form: 'Herbal Majoon',
        dosage: '1 چمچ',
        frequency: '1-0-1 (صبح و شام)',
        timing: 'After Meal (کھانے کے بعد)',
        durationDays: 14,
        instructionsUrdu: 'کھانے کے بعد نیم گرم پانی کے ساتھ استعمال کریں۔',
      },
      {
        id: 'm2',
        name: 'شربتِ بزوری معتدل (Sharbat Bazoori)',
        form: 'Syrup',
        dosage: '2 چمچ',
        frequency: '1-0-1 (صبح و شام)',
        timing: 'Before Meal (کھانے سے پہلے)',
        durationDays: 10,
        instructionsUrdu: 'ایک کپ پانی میں ملا کر پیئیں۔',
      },
      {
        id: 'm3',
        name: 'حبِ مقوی اعصاب (Habb-e-Muqawwi)',
        form: 'Tablet',
        dosage: '1 گولی',
        frequency: '0-0-1 (رات کو)',
        timing: 'With Water (پانی کے ساتھ)',
        durationDays: 20,
        instructionsUrdu: 'رات کو نیم گرم دودھ کے ساتھ لیں۔',
      },
    ],
    advisedTests: ['Complete Blood Count (CBC)', 'Serum Uric Acid'],
    dietaryAdviceUrdu: 'تلی ہوئی، تیز مرچ مصالحہ دار اور بادی اشیاء (چاول، بڑا گوشت، کولڈ ڈرنکس) سے سخت پرہیز کریں۔ تازہ پھل، ابلے ہوئے کھانے اور مولی و سلاد استعمال کریں۔',
    precautionsUrdu: 'روزانہ ۲۰ منٹ صبح واک کریں اور کھانا کھانے کے فوری بعد لیٹنے سے گریز کریں۔',
    followUpDate: '2026-09-01',
    qrVerificationCode: 'https://hafizclinic.pk/verify-rx?rx=RX-1001',
    status: 'Dispensed',
    createdAt: '2026-08-18T10:30:00Z',
  },
  {
    id: 'RX-2026-002',
    rxNumber: 'RX-1002',
    patientId: 'PT-902',
    patientName: 'شمیم اختر بیگم',
    patientAge: 56,
    patientGender: 'Female',
    patientPhone: '0322-8877665',
    patientCity: 'شیخوپورہ',
    mrnNumber: 'MRN-78602',
    doctorId: 'dr-asim-farooq',
    doctorName: 'ڈاکٹر عاصم فاروق',
    doctorSpecialization: 'ماہر امراض چشم و سرجن',
    doctorQualification: 'MBBS, D.O (Opht), FCPS-I',
    date: '2026-08-19',
    vitals: {
      bpSystolic: 138,
      bpDiastolic: 88,
      pulse: 80,
      temperature: 98.6,
      weightKg: 64,
      bloodSugarMgDl: 142,
      sugarType: 'Fasting',
      spo2: 97,
    },
    presentingComplaintsUrdu: 'آنکھوں میں خارش، دھندلا پن اور کمپیوٹر استعمال کے بعد سر میں درد۔',
    clinicalDiagnosisUrdu: 'Computer Vision Syndrome (CVS) & Dry Eye with Astigmatism',
    medicines: [
      {
        id: 'm4',
        name: 'Lubricant Eye Drops (Carboxymethylcellulose)',
        form: 'Eye Drops',
        dosage: '1 قطرہ',
        frequency: '1-1-1 (تین وقت)',
        timing: 'With Water (پانی کے ساتھ)',
        durationDays: 30,
        instructionsUrdu: 'دونوں آنکھوں میں دن میں ۳ سے ۴ بار ڈالیں۔',
      },
      {
        id: 'm5',
        name: 'عرقِ مروارید خاص چشم (Herbal Eye Drops)',
        form: 'Drops',
        dosage: '2 قطرے',
        frequency: '0-0-1 (رات کو)',
        timing: 'Empty Stomach (نہار منہ)',
        durationDays: 20,
        instructionsUrdu: 'رات سوتے وقت آنکھوں میں ڈالیں۔',
      },
    ],
    advisedTests: ['Computerized Auto-Refractometer Eye Scan', 'Blood Sugar Fasting'],
    dietaryAdviceUrdu: 'گاlightجر کا جوس، مچھلی اور بادام کی گریاں استعمال کریں۔ سکرین پر 20-20-20 فارمولہ اپنائیں۔',
    precautionsUrdu: 'کمپیوٹر استعمال کے دوران اینٹی گلئیر نیلی روشنی فلٹر گلاسز استعمال کریں۔',
    followUpDate: '2026-09-10',
    qrVerificationCode: 'https://hafizclinic.pk/verify-rx?rx=RX-1002',
    status: 'Active',
    createdAt: '2026-08-19T11:15:00Z',
  },
];

export async function getPrescriptions(): Promise<Prescription[]> {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRESCRIPTIONS));
  return INITIAL_PRESCRIPTIONS;
}

export async function savePrescription(rx: Prescription): Promise<Prescription> {
  const list = await getPrescriptions();
  const index = list.findIndex((item) => item.id === rx.id || item.rxNumber === rx.rxNumber);
  let updatedList: Prescription[];
  if (index >= 0) {
    updatedList = [...list];
    updatedList[index] = rx;
  } else {
    updatedList = [rx, ...list];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to server API if available
  fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rx),
  }).catch(() => {});

  return rx;
}

export async function deletePrescription(id: string): Promise<boolean> {
  const list = await getPrescriptions();
  const filtered = list.filter((p) => p.id !== id && p.rxNumber !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  fetch(`/api/prescriptions/${id}`, { method: 'DELETE' }).catch(() => {});
  return true;
}
