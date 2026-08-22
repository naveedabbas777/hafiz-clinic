import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Eye,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { analyzeSymptoms, TriageResult } from '../services/triageService';
import { openWhatsAppNotification } from '../utils/notificationDispatcher';

interface DiagnosticTestOption {
  id: string;
  department: string;
  nameUrdu: string;
  nameEnglish: string;
  fee: number;
  instructionsUrdu: string;
  instructionsEnglish: string;
  icon: string;
  tag: string;
}

const DIAGNOSTIC_TESTS: DiagnosticTestOption[] = [
  {
    id: 'xray-chest',
    department: 'Digital X-Ray & Imaging',
    nameUrdu: 'ڈیجیٹل ایکسرے (چیسٹ / سینہ یا جوڑ و ہڈیاں)',
    nameEnglish: 'Digital X-Ray (Chest / Spine / Extremities)',
    fee: 1200,
    instructionsUrdu: 'کسی خاص پرہیز کی ضرورت نہیں ہے۔ دھاتی اشیاء اتار کر تشریف لائیں۔',
    instructionsEnglish: 'No special fasting required. Remove metallic objects before scan.',
    icon: 'xray',
    tag: 'Digital CR/DR Scan',
  },
  {
    id: 'cbc-blood',
    department: 'Pathology & Blood Lab',
    nameUrdu: 'خون کا مکمل ٹیسٹ (CBC Profile + ESR + Hemoglobin)',
    nameEnglish: 'Complete Blood Count (CBC + ESR + Platelets)',
    fee: 1500,
    instructionsUrdu: 'نہار منہ سیمپل دینا افضل ہے۔ پانی پی سکتے ہیں۔',
    instructionsEnglish: 'Morning fasting sample preferred. Water intake is fine.',
    icon: 'blood',
    tag: 'Automated 5-Part Cell Counter',
  },
  {
    id: 'sugar-hba1c',
    department: 'Pathology & Blood Lab',
    nameUrdu: 'شوگر و 3 ماہ کا اوسط ٹیسٹ (Fasting Sugar + HbA1c)',
    nameEnglish: 'Diabetes Diagnostic Panel (Fasting Glucose + HbA1c)',
    fee: 1000,
    instructionsUrdu: 'ٹیسٹ سے قبل 8 سے 10 گھنٹے کا روزہ / ناشتے سے پہلے تشریف لائیں۔',
    instructionsEnglish: 'Requires 8-10 hours fasting prior to blood draw.',
    icon: 'sugar',
    tag: 'Bio-Rad HPLC Certified',
  },
  {
    id: 'eye-scan',
    department: 'Computerized Eye Care',
    nameUrdu: 'کمپیوٹرائزڈ آنکھوں کا اسکین و نظر معائنہ (Auto-Refraction)',
    nameEnglish: 'Computerized Eye Vision & Retinal Scan',
    fee: 800,
    instructionsUrdu: 'کانٹیکٹ لینز ٹیسٹ سے 2 گھنٹے پہلے اتار لیں۔',
    instructionsEnglish: 'Remove contact lenses 2 hours before examination.',
    icon: 'eye',
    tag: 'Topcon Japanese Auto-Refractometer',
  },
  {
    id: 'ultrasound',
    department: 'Ultrasound & Sonology',
    nameUrdu: 'ڈیجیٹل الٹراساؤنڈ اسکین (پیٹ، گردے، مثانہ و پتے کی پتھری)',
    nameEnglish: 'Abdomen & Pelvis Ultrasound Scan',
    fee: 2000,
    instructionsUrdu: 'اسکین سے 1 گھنٹہ قبل 4 سے 5 گلاس پانی پیئیں تاکہ مثانہ بھرا ہو۔',
    instructionsEnglish: 'Drink 4-5 glasses of water 1 hour prior for full bladder.',
    icon: 'ultrasound',
    tag: 'Color Doppler High-Res 4D',
  },
  {
    id: 'lft-rft',
    department: 'Pathology & Blood Lab',
    nameUrdu: 'جگر و گردوں کا پینل (LFT + RFT + Serum Creatinine + Uric Acid)',
    nameEnglish: 'Liver & Renal Function Profile (LFT / RFT / Uric Acid)',
    fee: 1800,
    instructionsUrdu: 'نہار منہ سیمپل لیا جائے گا۔ چکنائی والی غذا سے پرہیز کریں۔',
    instructionsEnglish: 'Fasting sample required. Avoid heavy fatty meals overnight.',
    icon: 'blood',
    tag: 'Fully Automated Chemistry Analyzer',
  },
  {
    id: 'physio-session',
    department: 'Physiotherapy & Spine Care',
    nameUrdu: 'فزیو تھراپی و مہروں کی بحالی سیشن (Spine & Joint Decompression)',
    nameEnglish: 'Physiotherapy & Targeted Pain Relief Session',
    fee: 1200,
    instructionsUrdu: 'آرام دہ ڈھیلا لباس پہن کر تشریف لائیں۔',
    instructionsEnglish: 'Wear comfortable, loose clothing for therapy session.',
    icon: 'physio',
    tag: 'Specialized Traction & Laser Unit',
  },
];

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctor?: string;
  preselectedDisease?: string;
  currentUser?: any;
  language?: 'urdu' | 'english';
  onAddAppointment?: (appointment: any) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor = '',
  preselectedDisease = '',
  currentUser,
  language = 'urdu',
  onAddAppointment,
}) => {
  const isUrdu = language === 'urdu';
  const [bookingType, setBookingType] = React.useState<'doctor' | 'diagnostic'>('doctor');
  const [patientName, setPatientName] = React.useState(currentUser?.fullName || currentUser?.name || '');
  const [phone, setPhone] = React.useState(currentUser?.phone || '');
  const [city, setCity] = React.useState(currentUser?.city || 'گوجرانوالہ');
  const [selectedDoctor, setSelectedDoctor] = React.useState(preselectedDoctor || 'ڈاکٹر زیشان چوہدری (MBBS)');
  const [problem, setProblem] = React.useState(preselectedDisease || 'جوڑوں اور مہروں کا درد');
  const [selectedTestId, setSelectedTestId] = React.useState<string>('cbc-blood');
  const [date, setDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = React.useState('صبح 10:00 - 11:00');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedAppt, setSubmittedAppt] = React.useState<any>(null);

  const currentSelectedTest = useMemo(() => {
    return DIAGNOSTIC_TESTS.find((t) => t.id === selectedTestId) || DIAGNOSTIC_TESTS[0];
  }, [selectedTestId]);

  // Real-Time AI Symptom Triage Analysis
  const triageResult: TriageResult | null = useMemo(() => {
    if (bookingType === 'doctor') {
      return analyzeSymptoms(problem);
    }
    return null;
  }, [problem, bookingType]);

  React.useEffect(() => {
    if (currentUser) {
      if (!patientName) setPatientName(currentUser.fullName || currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (currentUser.city) setCity(currentUser.city);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (preselectedDoctor) setSelectedDoctor(preselectedDoctor);
    if (preselectedDisease) setProblem(preselectedDisease);
  }, [preselectedDoctor, preselectedDisease]);

  if (!isOpen) return null;

  const handleApplyTriage = (triage: TriageResult) => {
    setSelectedDoctor(triage.recommendedDoctor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert(isUrdu ? 'برائے مہربانی اپنا نام اور فون نمبر لازمی درج کریں۔' : 'Please enter your name and phone number.');
      return;
    }

    if (bookingType === 'diagnostic') {
      const prefix = currentSelectedTest.id.includes('xray') ? 'XRAY' : currentSelectedTest.id.includes('eye') ? 'EYE' : 'LAB';
      const tokenNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
      const newApp = {
        id: `DIAG-${Math.floor(100000 + Math.random() * 900000)}`,
        patientId: currentUser?.id || currentUser?._id || undefined,
        patientName,
        phone,
        city,
        appointmentCategory: 'diagnostic_test' as const,
        testDepartment: currentSelectedTest.department,
        testName: isUrdu ? currentSelectedTest.nameUrdu : currentSelectedTest.nameEnglish,
        testFee: currentSelectedTest.fee,
        testInstructions: isUrdu ? currentSelectedTest.instructionsUrdu : currentSelectedTest.instructionsEnglish,
        doctorName: `شعبہ ${currentSelectedTest.department}`,
        problem: `تشخیصی ٹیسٹ: ${isUrdu ? currentSelectedTest.nameUrdu : currentSelectedTest.nameEnglish}`,
        date,
        timeSlot,
        tokenNumber,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      if (onAddAppointment) {
        onAddAppointment(newApp);
      }

      setSubmittedAppt(newApp);
      setIsSubmitted(true);
    } else {
      const tokenNumber = Math.floor(1 + Math.random() * 25);
      const newApp = {
        id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        patientId: currentUser?.id || currentUser?._id || undefined,
        patientName,
        phone,
        city,
        appointmentCategory: 'doctor_consultation' as const,
        doctorName: selectedDoctor,
        problem,
        date,
        timeSlot,
        tokenNumber,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      if (onAddAppointment) {
        onAddAppointment(newApp);
      }

      setSubmittedAppt(newApp);
      setIsSubmitted(true);
    }
  };

  const handleSendWhatsAppNotification = () => {
    if (!submittedAppt) return;
    if (submittedAppt.appointmentCategory === 'diagnostic_test') {
      openWhatsAppNotification({
        type: 'diagnostic_appointment',
        recipientPhone: submittedAppt.phone,
        recipientName: submittedAppt.patientName,
        departmentName: submittedAppt.testDepartment,
        testName: submittedAppt.testName,
        testFee: submittedAppt.testFee,
        testInstructions: submittedAppt.testInstructions,
        tokenNumber: submittedAppt.tokenNumber,
        date: submittedAppt.date,
        timeSlot: submittedAppt.timeSlot,
      }, isUrdu ? 'urdu' : 'english');
    } else {
      openWhatsAppNotification({
        type: 'appointment_confirm',
        recipientPhone: submittedAppt.phone,
        recipientName: submittedAppt.patientName,
        doctorName: submittedAppt.doctorName,
        tokenNumber: submittedAppt.tokenNumber,
        date: submittedAppt.date,
        timeSlot: submittedAppt.timeSlot,
      }, isUrdu ? 'urdu' : 'english');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black">
                {isUrdu ? 'آن لائن بکنگ و ٹوکن سسٹم' : 'Online Booking & Token Service'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isUrdu ? 'ڈاکٹر معائنہ، ایکسرے، خون ٹیسٹ، آئی اسکین و الٹراساؤنڈ' : 'Doctor OPD, X-Ray, Blood CBC, Eye Scan & Ultrasound'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Top Level Category Tabs (Doctor OPD vs Diagnostic Test) */}
          {!isSubmitted && (
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBookingType('doctor')}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bookingType === 'doctor'
                    ? 'bg-white text-emerald-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? '👨‍⚕️ معالج / ڈاکٹر معائنہ' : 'Doctor OPD'}</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('diagnostic')}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  bookingType === 'diagnostic'
                    ? 'bg-white text-emerald-950 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <span>{isUrdu ? '🔬 لیب و تشخیصی ٹیسٹ' : 'Lab / X-Ray / Tests'}</span>
              </button>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-emerald-950">
                  {submittedAppt?.appointmentCategory === 'diagnostic_test'
                    ? isUrdu
                      ? 'تشخیصی ٹیسٹ کامیابی سے بک ہو گیا ہے!'
                      : 'Diagnostic Test Successfully Booked!'
                    : isUrdu
                    ? 'آپ کی او پی ڈی اپائنٹمنٹ بک ہو گئی ہے!'
                    : 'Appointment Successfully Booked!'}
                </h4>
                <p className="text-xs text-slate-600">
                  {isUrdu
                    ? 'آپ کو تصدیقی ٹوکن نمبر الاٹ کر دیا گیا ہے۔ رسید و تفصیل درج ذیل ہیں:'
                    : 'A sequential confirmation token has been generated. Details below:'}
                </p>
              </div>

              {submittedAppt && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-2.5 text-right">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{isUrdu ? 'مریض کا نام:' : 'Patient:'}</span>
                    <strong className="text-slate-900">{submittedAppt.patientName}</strong>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">
                      {submittedAppt.appointmentCategory === 'diagnostic_test'
                        ? isUrdu ? 'لیب و ٹیسٹ ٹوکن:' : 'Lab Token:'
                        : isUrdu ? 'او پی ڈی ٹوکن نمبر:' : 'OPD Token:'}
                    </span>
                    <span className="bg-emerald-700 text-white font-mono font-black px-3 py-1 rounded-lg text-sm shadow-xs">
                      #{submittedAppt.tokenNumber || '1'}
                    </span>
                  </div>

                  {submittedAppt.appointmentCategory === 'diagnostic_test' ? (
                    <>
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-slate-500">{isUrdu ? 'ٹیسٹ کا نام:' : 'Test Name:'}</span>
                        <strong className="text-emerald-800">{submittedAppt.testName}</strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-slate-500">{isUrdu ? 'شعبہ:' : 'Department:'}</span>
                        <span className="text-slate-700 font-bold">{submittedAppt.testDepartment}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-slate-500">{isUrdu ? 'تخمینی فیس:' : 'Fee:'}</span>
                        <span className="text-emerald-700 font-black">Rs. {submittedAppt.testFee?.toLocaleString()}</span>
                      </div>
                      {submittedAppt.testInstructions && (
                        <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-900 text-[11px] text-right font-medium">
                          ⚠️ <strong>{isUrdu ? 'ضروری پرہیز / ہدایت:' : 'Preparation:'}</strong> {submittedAppt.testInstructions}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500">{isUrdu ? 'معالج / شعبہ:' : 'Doctor:'}</span>
                      <strong className="text-emerald-800">{submittedAppt.doctorName}</strong>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">{isUrdu ? 'تاریخ و وقت:' : 'Date & Slot:'}</span>
                    <span className="font-mono text-slate-700">{submittedAppt.date} ({submittedAppt.timeSlot})</span>
                  </div>
                </div>
              )}

              {/* 1-Click WhatsApp Token Dispatch */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppNotification}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {submittedAppt?.appointmentCategory === 'diagnostic_test'
                      ? isUrdu ? 'لیب ٹوکن سلپ واٹس ایپ پر حاصل کریں' : 'Receive Lab Slip on WhatsApp'
                      : isUrdu ? 'اپائنٹمنٹ ٹوکن اپنے واٹس ایپ پر حاصل کریں' : 'Receive Token on WhatsApp'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-colors"
                >
                  {isUrdu ? 'بند کریں' : 'Close Window'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800">
              {currentUser && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isUrdu ? 'تصدیق شدہ مریض:' : 'Verified Patient:'}{' '}
                      <span className="text-emerald-800 font-black">{currentUser.fullName || currentUser.name}</span>
                    </span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {isUrdu ? 'لاگ ان فعال' : 'Logged In'}
                  </span>
                </div>
              )}

              <div>
                <label className="block mb-1 font-bold">مریض کا پورا نام (Patient Name) *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="اپنا نام لکھیں"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">موبائل نمبر (Phone) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">شہر (City)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              {/* ================= DIAGNOSTIC TEST SPECIFIC SELECTOR ================= */}
              {bookingType === 'diagnostic' ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block mb-1 font-bold flex items-center justify-between">
                      <span>{isUrdu ? 'مطلوبہ ٹیسٹ کا انتخاب کریں (Select Diagnostic Test)' : 'Select Test'}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{DIAGNOSTIC_TESTS.length} Tests Available</span>
                    </label>
                    <select
                      value={selectedTestId}
                      onChange={(e) => setSelectedTestId(e.target.value)}
                      className="w-full p-2.5 border border-emerald-300 rounded-lg bg-emerald-50/50 font-bold text-emerald-950"
                    >
                      {DIAGNOSTIC_TESTS.map((test) => (
                        <option key={test.id} value={test.id}>
                          {isUrdu ? test.nameUrdu : test.nameEnglish} — Rs. {test.fee.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Test Information Card */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-amber-950">
                        {isUrdu ? currentSelectedTest.nameUrdu : currentSelectedTest.nameEnglish}
                      </span>
                      <span className="bg-amber-600 text-white font-black px-2.5 py-0.5 rounded-full text-[11px]">
                        Rs. {currentSelectedTest.fee.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-slate-700 text-[11px] leading-relaxed">
                      <strong className="text-amber-900">{isUrdu ? '⚠️ ٹیسٹ کی تیاری / پرہیز:' : 'Preparation Instructions:'}</strong>{' '}
                      {isUrdu ? currentSelectedTest.instructionsUrdu : currentSelectedTest.instructionsEnglish}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-amber-200/70 pt-1.5">
                      <span>{isUrdu ? 'شعبہ:' : 'Dept:'} <strong>{currentSelectedTest.department}</strong></span>
                      <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded-md font-mono text-slate-700">
                        {currentSelectedTest.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= DOCTOR CONSULTATION SPECIFIC SELECTOR ================= */
                <>
                  {/* Problem / Symptoms with Real-time AI Triage */}
                  <div>
                    <label className="block mb-1 font-bold">بیماری یا معائنے کی نوعیت (Problem / Symptoms)</label>
                    <input
                      type="text"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="مثلاً: جوڑوں کا درد، فالج، کمپیوٹر آئی ٹیسٹ، بالوں کا گرنا..."
                      className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-900"
                    />
                  </div>

                  {/* AI Triage Recommendation Card */}
                  {triageResult && (
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>{isUrdu ? 'طبی تشخیص و شعبہ کی خودکار تجویز (Smart AI Triage)' : 'AI Clinical Routing'}</span>
                        </div>
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {triageResult.urgencyUrdu}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {triageResult.adviceUrdu}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200">
                        <div className="text-[11px] text-emerald-950 font-bold">
                          {isUrdu ? 'تجویز کردہ ڈاکٹر:' : 'Recommended:'}{' '}
                          <span className="text-emerald-800 font-extrabold">{triageResult.recommendedDoctor}</span>
                        </div>
                        {selectedDoctor !== triageResult.recommendedDoctor && (
                          <button
                            type="button"
                            onClick={() => handleApplyTriage(triageResult)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>{isUrdu ? 'تجویز لاگو کریں' : 'Apply'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block mb-1 font-bold">ڈاکٹر کا انتخاب کریں (Select Doctor)</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-emerald-900"
                    >
                      <option value="ڈاکٹر زیشان چوہدری (MBBS)">ڈاکٹر زیشان چوہدری (MBBS) - Senior Physician & Eye Specialist</option>
                      <option value="ڈاکٹر وقاص صغیر چوہدری (MBBS)">ڈاکٹر وقاص صغیر چوہدری (MBBS) - Physiotherapist & Spine Care</option>
                    </select>
                  </div>
                </>
              )}

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">
                    {bookingType === 'diagnostic' ? (isUrdu ? 'ٹیسٹ کی تاریخ (Date)' : 'Test Date') : (isUrdu ? 'معائنے کی تاریخ (Date)' : 'Date')}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">وقت (Time Slot)</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="صبح 09:00 - 10:00">صبح 09:00 - 10:00</option>
                    <option value="صبح 10:00 - 11:00">صبح 10:00 - 11:00</option>
                    <option value="صبح 11:00 - 12:00">صبح 11:00 - 12:00</option>
                    <option value="دوپہر 02:00 - 03:00">دوپہر 02:00 - 03:00</option>
                    <option value="شام 05:00 - 06:00">شام 05:00 - 06:00</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                {bookingType === 'diagnostic' ? (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    <span>{isUrdu ? 'لیب ٹیسٹ بک کریں و ٹوکن حاصل کریں' : 'Book Diagnostic Test & Get Token'}</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>{isUrdu ? 'او پی ڈی اپائنٹمنٹ کی تصدیق کریں' : 'Confirm Doctor Appointment'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
