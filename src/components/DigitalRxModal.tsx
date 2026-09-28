import React, { useState } from 'react';
import { X, Plus, Trash2, Printer, Save, Sparkles, Activity, FileText, CheckCircle, Heart, Thermometer, Droplet, User, Phone, MapPin, Search } from 'lucide-react';
import { Prescription, PrescriptionMedicine, Doctor, Disease } from '../types';
import { savePrescription } from '../services/prescriptionService';
import { printPrescriptionHtml } from '../utils/printPrescription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  initialPatient?: {
    name?: string;
    phone?: string;
    age?: number | string;
    gender?: 'Male' | 'Female' | 'Child' | 'Other';
    city?: string;
    appointmentId?: string;
  };
  diseases?: Disease[];
  clinicSettings?: any;
  onSaved?: (rx: Prescription) => void;
  language: 'urdu' | 'english';
}

const COMMON_HERBAL_MEDICINES = [
  { name: 'جوارش کمونی خاص (Jawarish Kamuni)', form: 'Herbal Majoon', dosage: '1 چمچ', freq: '1-0-1 (صبح و شام)', timing: 'After Meal (کھانے کے بعد)', days: 14 },
  { name: 'شربتِ بزوری معتدل (Sharbat Bazoori)', form: 'Syrup', dosage: '2 چمچ', freq: '1-0-1 (صبح و شام)', timing: 'Before Meal (کھانے سے پہلے)', days: 10 },
  { name: 'حبِ مقوی اعصاب (Habb-e-Muqawwi)', form: 'Tablet', dosage: '1 گولی', freq: '0-0-1 (رات کو)', timing: 'With Water (پانی کے ساتھ)', days: 20 },
  { name: 'عرقِ مروارید خاص چشم (Eye Drops)', form: 'Eye Drops', dosage: '2 قطرے', freq: '1-0-1 (صبح و شام)', timing: 'With Water (پانی کے ساتھ)', days: 20 },
  { name: 'سفوفِ ضیابیطس شوگر کنٹرول', form: 'Herbal Safoof', dosage: 'آدھا چمچ', freq: '1-0-1 (صبح و شام)', timing: 'Empty Stomach (نہار منہ)', days: 30 },
  { name: 'درد ریلیف خاص جوائنٹ آئل', form: 'Cream / Ointment', dosage: 'مالش', freq: '0-0-1 (رات کو)', timing: 'With Water (پانی کے ساتھ)', days: 15 },
  { name: 'معجون فلاسفہ مقوی گردہ و مثانہ', form: 'Herbal Majoon', dosage: '1 چمچ', freq: '0-0-1 (رات کو)', timing: 'After Meal (کھانے کے بعد)', days: 20 },
];

export const ADAPTIVE_CLINICAL_PROTOCOLS = [
  {
    id: 'gastric',
    labelUrdu: 'معدے کی تیزابیت و جلن (Gastric)',
    labelEnglish: 'Gastritis & Dyspepsia',
    diagnosisUrdu: 'ضعفِ معدہ و تیزابیت (Gastric Hyperacidity)',
    diagnosisEnglish: 'Gastric Dyspepsia & Hyperacidity',
    complaintsUrdu: 'کھانے کے بعد سینے میں جلن، اپھارہ، گیس اور بدہضمی۔',
    complaintsEnglish: 'Post-prandial heartburn, bloating, flatulence, and epigastric discomfort.',
    dietUrdu: 'تیز مرچ، مصالحہ جات، کولڈ ڈرنکس اور تلی ہوئی اشیاء سے مکمل پرہیز کریں۔ دہی اور سونف کا قہوہ پئیں۔',
    dietEnglish: 'Avoid oily and spicy foods, sodas, and heavy fats. Prefer yogurt, light broths, and boiled water.',
    medicines: [
      { name: 'جوارش کمونی خاص (Jawarish Kamuni)', form: 'Herbal Majoon', dosage: '1 چمچ', frequency: '1-0-1 (صبح و شام)', timing: 'After Meal (کھانے کے بعد)', durationDays: 14, instructionsUrdu: 'کھانے کے بعد پانی کے ساتھ لیں۔' },
      { name: 'شربتِ بزوری معتدل (Sharbat Bazoori)', form: 'Syrup', dosage: '2 چمچ', frequency: '1-0-1 (صبح و شام)', timing: 'Before Meal (کھانے سے پہلے)', durationDays: 10, instructionsUrdu: 'ایک گلاس پانی میں ملا کر پیئیں۔' },
    ],
    tests: ['Complete Blood Count (CBC)', 'Serum H. Pylori Antigen', 'Ultrasound Upper Abdomen'],
  },
  {
    id: 'joint',
    labelUrdu: 'جوڑوں اور پٹھوں کا درد (Joint Pain)',
    labelEnglish: 'Arthritis & Musculoskeletal Pain',
    diagnosisUrdu: 'وجع المفاصل و عرق النساء (Osteoarthritis / Sciatica)',
    diagnosisEnglish: 'Osteoarthritis & Lumbar Radiculopathy',
    complaintsUrdu: 'گھٹنوں اور کمر میں شدید درد، صبح اٹھنے پر سختی اور چلنے میں دشواری۔',
    complaintsEnglish: 'Knee and lower back pain, morning stiffness, difficulty climbing stairs.',
    dietUrdu: 'ٹھنڈا پانی، دہی، چاول اور بادی اشیاء سے پرہیز کریں۔ کلونجی اور زیتون کا استعمال رکھیں۔',
    dietEnglish: 'Avoid chilled beverages and processed carbs. Increase warm anti-inflammatory broths.',
    medicines: [
      { name: 'حبِ مقوی اعصاب (Habb-e-Muqawwi)', form: 'Tablet', dosage: '1 گولی', frequency: '0-0-1 (رات کو)', timing: 'With Water (پانی کے ساتھ)', durationDays: 20, instructionsUrdu: 'رات سوتے وقت نیم گرم دودھ کے ساتھ لیں۔' },
      { name: 'درد ریلیف خاص جوائنٹ آئل', form: 'Cream / Ointment', dosage: 'مالش', frequency: '0-0-1 (رات کو)', timing: 'With Water (پانی کے ساتھ)', durationDays: 15, instructionsUrdu: 'متاثرہ جوڑوں پر ہلکے ہاتھ سے مالش کریں۔' },
    ],
    tests: ['Digital X-Ray Knee / Spine', 'Serum Uric Acid', 'Erythrocyte Sedimentation Rate (ESR)'],
  },
  {
    id: 'diabetes',
    labelUrdu: 'ذیابیطس و شوگر کنٹرول (Diabetes)',
    labelEnglish: 'Type 2 Diabetes Mellitus',
    diagnosisUrdu: 'ذیابیطس شکری نوع دوم (Type 2 Diabetes)',
    diagnosisEnglish: 'Type 2 Diabetes Mellitus (Uncontrolled)',
    complaintsUrdu: 'زیادہ پیاس لگنا، بار بار پیشاب آنا اور جسمانی کمزوری و نقاہت۔',
    complaintsEnglish: 'Polydipsia, polyuria, chronic fatigue, and lethargy.',
    dietUrdu: 'چینی، مٹھائیاں، بیکری مصنوعات سے پرہیز۔ روزانہ 40 منٹ تیز چہل قدمی لازم ہے۔',
    dietEnglish: 'Strict avoidance of refined sugars, sweets, and high-glycemic carbohydrates. Daily 40-min brisk walk.',
    medicines: [
      { name: 'سفوفِ ضیابیطس شوگر کنٹرول', form: 'Herbal Safoof', dosage: 'آدھا چمچ', frequency: '1-0-1 (صبح و شام)', timing: 'Empty Stomach (نہار منہ)', durationDays: 30, instructionsUrdu: 'نہار منہ اور رات کھانے سے پہلے نیم گرم پانی سے لیں۔' },
    ],
    tests: ['Fasting Blood Glucose (BSF)', 'HbA1c Glycated Hemoglobin', 'Serum Creatinine & eGFR'],
  },
  {
    id: 'eyestrain',
    labelUrdu: 'کمپیوٹر آئی اسٹرین و سر درد (Eye Strain)',
    labelEnglish: 'Computer Vision Syndrome',
    diagnosisUrdu: 'کمپیوٹر ویژن سنڈروم و کمزوریٔ بینائی (CVS & Asthenopia)',
    diagnosisEnglish: 'Computer Vision Syndrome & Refractive Error',
    complaintsUrdu: 'سکرین کے استعمال پر آنکھوں میں جلن، دھندلا پن اور پیشانی میں درد۔',
    complaintsEnglish: 'Ocular fatigue, blurred vision with prolonged screen time, frontal headache.',
    dietUrdu: 'پالک، گاجر اور مچھلی کا استعمال کریں۔ سکرین استعمال کرتے وقت 20-20-20 اصول اپنائیں۔',
    dietEnglish: 'Adequate hydration, leafy greens, vitamin A rich diet. Follow 20-20-20 rule.',
    medicines: [
      { name: 'عرقِ مروارید خاص چشم (Eye Drops)', form: 'Eye Drops', dosage: '2 قطرے', frequency: '1-0-1 (صبح و شام)', timing: 'With Water (پانی کے ساتھ)', durationDays: 20, instructionsUrdu: 'صبح اور شام دونوں آنکھوں میں ۲، ۲ قطرے ڈالیں۔' },
    ],
    tests: ['Computerized Auto-Refraction', 'Non-Contact Intraocular Pressure (IOP)', 'Slit Lamp Examination'],
  },
];

export function DigitalRxModal({
  isOpen,
  onClose,
  doctor,
  initialPatient,
  diseases = [],
  clinicSettings,
  onSaved,
  language,
}: Props) {
  const isUrdu = language === 'urdu';

  const [patientName, setPatientName] = useState(initialPatient?.name || '');
  const [patientPhone, setPatientPhone] = useState(initialPatient?.phone || '');
  const [patientAge, setPatientAge] = useState(initialPatient?.age || 35);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Child' | 'Other'>(initialPatient?.gender || 'Male');
  const [patientCity, setPatientCity] = useState(initialPatient?.city || 'لاہور');

  // Vitals
  const [bpSystolic, setBpSystolic] = useState<number | undefined>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number | undefined>(80);
  const [pulse, setPulse] = useState<number | undefined>(74);
  const [temp, setTemp] = useState<number | undefined>(98.6);
  const [weight, setWeight] = useState<number | undefined>(70);
  const [sugar, setSugar] = useState<number | undefined>(110);
  const [spo2, setSpo2] = useState<number | undefined>(98);

  // Complaints & Diagnosis
  const [complaints, setComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [dietAdvice, setDietAdvice] = useState('بادی، تیز مرچ اور تلی ہوئی اشیاء سے پرہیز کریں۔ نیم گرم پانی اور پھلوں کا استعمال بڑھائیں۔');
  const [precautions, setPrecautions] = useState('روزانہ مناسب واک کریں اور وقت پر آرام کریں۔');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Medicines List
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'm-1',
      name: 'جوارش کمونی خاص (Jawarish Kamuni)',
      form: 'Herbal Majoon',
      dosage: '1 چمچ',
      frequency: '1-0-1 (صبح و شام)',
      timing: 'After Meal (کھانے کے بعد)',
      durationDays: 14,
      instructionsUrdu: 'کھانے کے بعد نیم گرم پانی سے لیں۔',
    },
  ]);

  // Advised Tests
  const [advTests, setAdvTests] = useState<string[]>(['Complete Blood Count (CBC)']);
  const [newTestInput, setNewTestInput] = useState('');

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}`,
      name: '',
      form: 'Tablet',
      dosage: '1 گولی',
      frequency: '1-0-1 (صبح و شام)',
      timing: 'After Meal (کھانے کے بعد)',
      durationDays: 10,
      instructionsUrdu: '',
    };
    setMedicines([...medicines, newMed]);
  };

  const handleSelectPresetMedicine = (preset: typeof COMMON_HERBAL_MEDICINES[0]) => {
    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}`,
      name: preset.name,
      form: preset.form as any,
      dosage: preset.dosage,
      frequency: preset.freq,
      timing: preset.timing as any,
      durationDays: preset.days,
      instructionsUrdu: 'معالج کی ہدایت کے مطابق استعمال کریں۔',
    };
    setMedicines([...medicines, newMed]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, val: any) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleAddAdvisedTest = () => {
    if (newTestInput.trim() && !advTests.includes(newTestInput.trim())) {
      setAdvTests([...advTests, newTestInput.trim()]);
      setNewTestInput('');
    }
  };

  const handleRemoveAdvisedTest = (t: string) => {
    setAdvTests(advTests.filter((item) => item !== t));
  };

  const buildPrescriptionObject = (): Prescription => {
    const rxNo = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: `RX-${Date.now()}`,
      rxNumber: rxNo,
      patientName: patientName.trim() || 'محترم مریض',
      patientPhone: patientPhone.trim() || '0300-0000000',
      patientAge: Number(patientAge) || 30,
      patientGender,
      patientCity,
      doctorId: doctor.id,
      doctorName: doctor.nameUrdu || doctor.nameEnglish,
      doctorSpecialization: doctor.specializationUrdu || doctor.specializationEnglish,
      doctorQualification: doctor.qualification,
      date: new Date().toISOString().split('T')[0],
      vitals: {
        bpSystolic,
        bpDiastolic,
        pulse,
        temperature: temp,
        weightKg: weight,
        bloodSugarMgDl: sugar,
        sugarType: 'Random',
        spo2,
      },
      presentingComplaintsUrdu: complaints,
      clinicalDiagnosisUrdu: diagnosis || 'طبی معائنہ و ضعفِ عمومی (General Weakness)',
      medicines: medicines.filter((m) => m.name.trim().length > 0),
      advisedTests: advTests,
      dietaryAdviceUrdu: dietAdvice,
      precautionsUrdu: precautions,
      followUpDate,
      qrVerificationCode: `https://hafizclinic.pk/verify-rx?rx=${rxNo}`,
      appointmentId: initialPatient?.appointmentId,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
  };

  const handleSaveOnly = async () => {
    if (!patientName.trim()) {
      alert(isUrdu ? 'براہ کرم مریض کا نام درج کریں۔' : 'Please enter patient name.');
      return;
    }
    const rxObj = buildPrescriptionObject();
    await savePrescription(rxObj);
    if (onSaved) onSaved(rxObj);
    alert(isUrdu ? `ڈیجیٹل نسخہ (${rxObj.rxNumber}) کامیابی سے محفوظ ہو گیا ہے۔` : `Prescription ${rxObj.rxNumber} saved successfully.`);
    onClose();
  };

  const handleSaveAndPrint = async () => {
    if (!patientName.trim()) {
      alert(isUrdu ? 'براہ کرم مریض کا نام درج کریں۔' : 'Please enter patient name.');
      return;
    }
    const rxObj = buildPrescriptionObject();
    await savePrescription(rxObj);
    if (onSaved) onSaved(rxObj);
    printPrescriptionHtml(rxObj, clinicSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-5xl my-4 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
              <FileText className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                {isUrdu ? 'آفیشل ڈیجیٹل نسخہ و EMR پیڈ' : 'Official Digital Rx Pad & EMR'}
              </div>
              <h2 className="text-xl font-black">{isUrdu ? 'نیا نسخہ جاری کریں' : 'Generate Digital Prescription'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-700 hidden sm:inline-block">
              {doctor.nameUrdu || doctor.nameEnglish}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-800 rounded-full text-emerald-200 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: Patient Profile & Demographics */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <div className="font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? '۱۔ مریض کی بنیادی معلومات (Patient Demographics)' : '1. Patient Demographics'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'مریض کا نام *' : 'Patient Name *'}</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="محمد عثمان"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'فون نمبر' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0300-1234567"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'عمر اور جنس' : 'Age & Gender'}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-16 bg-white border border-emerald-300 rounded-xl px-2 py-2 text-sm text-center font-bold"
                    placeholder="سال"
                  />
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-2 py-2 text-xs font-bold"
                  >
                    <option value="Male">{isUrdu ? 'مرد (Male)' : 'Male'}</option>
                    <option value="Female">{isUrdu ? 'خاتون (Female)' : 'Female'}</option>
                    <option value="Child">{isUrdu ? 'بچہ (Child)' : 'Child'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'شہر / علاقہ' : 'City / Location'}</label>
                <input
                  type="text"
                  value={patientCity}
                  onChange={(e) => setPatientCity(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="لاہور"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vitals & Health Indicators */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>{isUrdu ? '۲۔ مریض کے وائٹلز و علامات (Clinical Vitals)' : '2. Clinical Vitals'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">BP (mmHg)</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={bpSystolic || ''}
                    onChange={(e) => setBpSystolic(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-12 text-center font-black text-emerald-800 text-sm border-b border-emerald-400 outline-none"
                    placeholder="120"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={bpDiastolic || ''}
                    onChange={(e) => setBpDiastolic(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-12 text-center font-black text-emerald-800 text-sm border-b border-emerald-400 outline-none"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Pulse (bpm)</span>
                <input
                  type="number"
                  value={pulse || ''}
                  onChange={(e) => setPulse(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-center font-black text-rose-700 text-sm mt-1 border-b border-rose-300 outline-none"
                  placeholder="76"
                />
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Temp (°F)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp || ''}
                  onChange={(e) => setTemp(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-center font-black text-amber-700 text-sm mt-1 border-b border-amber-300 outline-none"
                  placeholder="98.6"
                />
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Weight (kg)</span>
                <input
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-center font-black text-blue-700 text-sm mt-1 border-b border-blue-300 outline-none"
                  placeholder="70"
                />
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Sugar (mg/dL)</span>
                <input
                  type="number"
                  value={sugar || ''}
                  onChange={(e) => setSugar(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-center font-black text-purple-700 text-sm mt-1 border-b border-purple-300 outline-none"
                  placeholder="110"
                />
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2 || ''}
                  onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-center font-black text-teal-700 text-sm mt-1 border-b border-teal-300 outline-none"
                  placeholder="98"
                />
              </div>
            </div>

            {/* Adaptive CDSS (Clinical Decision Support Alerts) */}
            {((bpSystolic && bpSystolic >= 140) || (bpDiastolic && bpDiastolic >= 90) || (sugar && sugar >= 140) || (temp && temp >= 99.5) || (spo2 && spo2 < 95)) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>{isUrdu ? 'طبی انتباہ و خودکار تشخیصی اشارے (CDSS Clinical Alerts):' : 'Clinical Decision Support Alerts:'}</span>
                </div>
                <div className="space-y-1 text-slate-700 font-medium">
                  {((bpSystolic && bpSystolic >= 140) || (bpDiastolic && bpDiastolic >= 90)) && (
                    <div className="flex items-center gap-1 text-rose-800">
                      <span>•</span>
                      <span>
                        {isUrdu
                          ? `ہائی بلڈ پریشر الرٹ (${bpSystolic}/${bpDiastolic} mmHg): مریض کا بی پی بلند ہے۔ نمک اور چکنائی سے پرہیز اور معجون شفائے فشارِ خون تجویز کی جا سکتی ہے۔`
                          : `Hypertension Flag (${bpSystolic}/${bpDiastolic} mmHg): Recommend sodium restriction and antihypertensive review.`}
                      </span>
                    </div>
                  )}
                  {sugar && sugar >= 140 && (
                    <div className="flex items-center gap-1 text-purple-800">
                      <span>•</span>
                      <span>
                        {isUrdu
                          ? `شوگر الرٹ (${sugar} mg/dL): بلڈ گلوکوز لیول ہائی ہے۔ سفوفِ ضیابیطس شوگر کنٹرول اور فاسٹنگ بی ایس ایف ٹیسٹ تجویز کریں۔`
                          : `Hyperglycemia Alert (${sugar} mg/dL): Fasting glucose elevated. Recommend Safoof Diabetics and HbA1c screening.`}
                      </span>
                    </div>
                  )}
                  {temp && temp >= 99.5 && (
                    <div className="flex items-center gap-1 text-amber-800">
                      <span>•</span>
                      <span>
                        {isUrdu
                          ? `بخار الرٹ (${temp}°F): مریض کو بخار کی کیفیت ہے۔ شربتِ بنفشہ اور پیراسیٹامول معائنہ ضروری ہے۔`
                          : `Pyrexia Alert (${temp}°F): Patient is febrile. Consider antipyretic relief.`}
                      </span>
                    </div>
                  )}
                  {spo2 && spo2 < 95 && (
                    <div className="flex items-center gap-1 text-rose-900 font-bold">
                      <span>•</span>
                      <span>
                        {isUrdu
                          ? `آکسیجن تنبیہ (SpO2: ${spo2}%): آکسیجن سیچوریشن کم ہے۔ فوری سینے کا معائنہ یا نیبولائزیشن درکار ہے۔`
                          : `Hypoxemia Warning (SpO2: ${spo2}%): Saturation below normal target (>=95%). Assess airway and respiratory status.`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Adaptive Clinical Disease Protocols Selector */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{isUrdu ? 'خودکار پروٹوکول سلیکٹر (1-کلک مکمل نسخہ و ہدایات لوڈ کریں):' : 'Adaptive Clinical Protocols (1-Click Fill Rx & Care Plan):'}</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-mono">Verified Protocols</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ADAPTIVE_CLINICAL_PROTOCOLS.map((proto) => (
                <button
                  key={proto.id}
                  type="button"
                  onClick={() => {
                    setDiagnosis(isUrdu ? proto.diagnosisUrdu : proto.diagnosisEnglish);
                    setComplaints(isUrdu ? proto.complaintsUrdu : proto.complaintsEnglish);
                    setDietAdvice(isUrdu ? proto.dietUrdu : proto.dietEnglish);

                    const newMeds: PrescriptionMedicine[] = proto.medicines.map((m, idx) => ({
                      id: `med-${Date.now()}-${idx}`,
                      name: m.name,
                      form: m.form as PrescriptionMedicine['form'],
                      dosage: m.dosage,
                      frequency: m.frequency,
                      timing: m.timing as PrescriptionMedicine['timing'],
                      durationDays: m.durationDays,
                      instructionsUrdu: m.instructionsUrdu,
                    }));
                    setMedicines((prev) => {
                      const combined = [...prev, ...newMeds];
                      return Array.from(new Map(combined.map((item) => [item.name, item])).values());
                    });
                    setAdvTests((prev) => Array.from(new Set([...prev, ...proto.tests])));
                  }}
                  className="bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>{isUrdu ? proto.labelUrdu : proto.labelEnglish}</span>
                  <Plus className="w-3 h-3 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Complaints & Clinical Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isUrdu ? 'مریض کی بنیادی شکایات و علامات (Complaints)' : 'Presenting Complaints'}
              </label>
              <textarea
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={isUrdu ? 'مثلاً: معدے میں جلن، گیس، سر درد، گھٹنوں میں درد...' : 'e.g. Gastric pain, headache, joint ache...'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isUrdu ? 'تشخیص معالج (Clinical Diagnosis) *' : 'Clinical Diagnosis *'}
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-white border border-emerald-400 rounded-xl p-2.5 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={isUrdu ? 'مثلاً: ضعفِ معدہ، کمپیوٹر ویژن سنڈروم، جوڑوں کا درد...' : 'e.g. Gastric Dyspepsia, CVS, Arthritis...'}
              />
            </div>
          </div>

          {/* Section 4: Prescribed Medicines (Rx) */}
          <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/30">
            <div className="flex justify-between items-center mb-3">
              <div className="font-black text-emerald-900 flex items-center gap-2 text-base">
                <span className="text-2xl font-serif text-emerald-700">℞</span>
                <span>{isUrdu ? 'تجویز کردہ ادویات و نسخہ (Prescription Medicines)' : 'Prescribed Medicines'}</span>
              </div>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'مزید دوا شامل کریں' : 'Add Medicine'}</span>
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="mb-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {isUrdu ? 'فوری نسخہ جات:' : 'Quick Presets:'}
              </span>
              {COMMON_HERBAL_MEDICINES.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetMedicine(p)}
                  className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg transition-colors font-bold"
                >
                  + {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Medicines Form Table */}
            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={med.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                        placeholder={isUrdu ? 'دوا کا نام درج کریں...' : 'Medicine name...'}
                        className="w-full font-bold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <select
                        value={med.form}
                        onChange={(e) => handleUpdateMedicine(med.id, 'form', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px] font-medium"
                      >
                        <option value="Tablet">Tablet (گولی)</option>
                        <option value="Syrup">Syrup (شربت)</option>
                        <option value="Herbal Majoon">Majoon (معجون)</option>
                        <option value="Herbal Safoof">Safoof (سفوف)</option>
                        <option value="Eye Drops">Eye Drops (قطرے)</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Cream / Ointment">Cream / Oil</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                        placeholder="1 چمچ / 1 گولی"
                        className="w-full text-center border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px]"
                      >
                        <option value="1-0-1 (صبح و شام)">1-0-1 (صبح و شام)</option>
                        <option value="1-1-1 (تین وقت)">1-1-1 (تین وقت)</option>
                        <option value="0-0-1 (رات کو)">0-0-1 (رات کو)</option>
                        <option value="1-0-0 (صبح نہار)">1-0-0 (صبح نہار)</option>
                        <option value="ضرورت کے وقت (SOS)">ضرورت کے وقت</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={med.durationDays}
                          onChange={(e) => handleUpdateMedicine(med.id, 'durationDays', Number(e.target.value))}
                          className="w-12 text-center border border-slate-300 rounded-lg px-1 py-1.5 text-xs font-bold"
                        />
                        <span className="text-[10px] text-slate-500">دن</span>
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Special instruction per medicine */}
                  <input
                    type="text"
                    value={med.instructionsUrdu || ''}
                    onChange={(e) => handleUpdateMedicine(med.id, 'instructionsUrdu', e.target.value)}
                    placeholder={isUrdu ? 'خاص ہدایت: مثلاً نیم گرم دودھ کے ساتھ، کھانے کے بعد...' : 'Special instructions...'}
                    className="w-full text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Advised Lab Tests & Dietary Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="font-bold text-slate-800 text-xs mb-2">
                🔬 {isUrdu ? 'تجویز کردہ لیب ٹیسٹ (Advised Lab Investigations)' : 'Advised Lab Investigations'}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTestInput}
                  onChange={(e) => setNewTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAdvisedTest())}
                  placeholder={isUrdu ? 'ٹیسٹ کا نام درج کریں...' : 'Test name (e.g. CBC, Lipid Profile)...'}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAdvisedTest}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {advTests.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveAdvisedTest(t)}
                      className="hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🥗 {isUrdu ? 'پرہیز و غذائی رہنمائی (Diet & Lifestyle Advice)' : 'Dietary & Lifestyle Advice'}
                </label>
                <textarea
                  value={dietAdvice}
                  onChange={(e) => setDietAdvice(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  🗓️ {isUrdu ? 'اگلی چیک اپ کی تاریخ (Follow-Up Date)' : 'Follow-Up Date'}
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="bg-white border border-emerald-400 font-bold rounded-xl px-3 py-1.5 text-xs outline-none text-emerald-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isUrdu ? 'محفوظ کریں' : 'Save Prescription'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndPrint}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isUrdu ? 'محفوظ کریں اور پرنٹ نکالیں (Print Rx Pad)' : 'Save & Print Rx Pad'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
