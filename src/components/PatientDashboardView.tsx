import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  FileText,
  Clock,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Bell,
  User,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Filter,
  Plus,
  X,
  Search,
  LogIn,
  UserPlus,
  ArrowRight,
  Eye,
  Activity,
  Pill,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  Share2,
  Lock,
  ExternalLink,
  MessageSquare,
  QrCode,
  Check,
  AlertTriangle,
  RefreshCw,
  Upload,
  Video,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';
import { Doctor, Appointment, ClinicSettings, FollowUpReminder, DigitalMedicalReport } from '../types';
import { loginApi, registerApi, getReportsApi, uploadDiseaseImageApi } from '../services/api';
import { downloadLabReportPdf, printLabReportHtml, renderHtmlToPdf } from '../utils/printInvoice';
import { Telehealth } from './Telehealth';
import { PatientVitalsTrendChart } from './PatientVitalsTrendChart';

interface PatientDashboardViewProps {
  currentUser?: any;
  doctors: Doctor[];
  appointments: Appointment[];
  clinicSettings: ClinicSettings;
  language: 'urdu' | 'english';
  setLanguage: (lang: 'urdu' | 'english') => void;
  onLoginSuccess: (user: any) => void;
  onLogout: () => void;
  onOpenAppointment: (doctorPref?: string) => void;
  setActiveView: (view: string) => void;
}

// Initial Curated Digital Medical Reports for Patient
const defaultPatientReports: DigitalMedicalReport[] = [
  {
    id: 'REP-8491',
    reportNumber: 'LAB-2026-8491',
    mrn: 'MRN-84920',
    patientName: 'محمد فاروق / Muhammad Farooq',
    patientAge: '46 Y',
    patientGender: 'Male',
    testName: 'Complete Blood & Lipid Profile',
    testNameUrdu: 'مکمل بلڈ ٹیسٹ و لپڈ پروفائل',
    category: 'Pathology Lab',
    doctorName: 'Dr. Zeeshan Chaudhry (MBBS, FCPS)',
    date: '2026-09-15',
    status: 'Normal',
    summary: 'Blood parameters within healthy biological range. Cholesterol and blood sugar fasting controlled.',
    summaryUrdu: 'خون کے تمام ٹیسٹ تسلی بخش ہیں۔ شوگر اور کولیسٹرول نارمل حدود میں ہے۔',
    impression: 'Satisfactory metabolic & hematologic parameters. Continue prescribed diet.',
    verifiedBy: 'Dr. Waqas Saghir (Consultant Pathologist)',
    parameters: [
      { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', normalRange: '13.0 - 17.5', status: 'normal' },
      { name: 'Fasting Blood Glucose', value: '98', unit: 'mg/dL', normalRange: '70 - 105', status: 'normal' },
      { name: 'Total Cholesterol', value: '175', unit: 'mg/dL', normalRange: '125 - 200', status: 'normal' },
      { name: 'Triglycerides', value: '142', unit: 'mg/dL', normalRange: '< 150', status: 'normal' },
      { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', normalRange: '0.6 - 1.2', status: 'normal' },
      { name: 'Uric Acid', value: '5.4', unit: 'mg/dL', normalRange: '3.5 - 7.2', status: 'normal' },
    ],
  },
  {
    id: 'REP-8492',
    reportNumber: 'EYE-2026-104',
    mrn: 'MRN-84920',
    patientName: 'محمد فاروق / Muhammad Farooq',
    patientAge: '46 Y',
    patientGender: 'Male',
    testName: 'Computerized Auto-Refraction & Vision Test',
    testNameUrdu: 'کمپیوٹرائزڈ آنکھوں کا معائنہ و بینائی ٹیسٹ',
    category: 'Eye Examination',
    doctorName: 'Dr. Zeeshan Chaudhry (Eye Specialist)',
    date: '2026-09-02',
    status: 'Reviewed',
    summary: 'Mild screen strain detected. Blue-cut anti-reflective lenses prescribed for desktop computer usage.',
    summaryUrdu: 'کمپیوٹر استعمال کے دوران آنکھوں پر دباؤ۔ اینٹی ریفلیکٹو بلیو کٹ چشمہ تجویز کیا گیا۔',
    impression: 'Presbyopia correction +0.75 D. Retinal fundus scan clear.',
    verifiedBy: 'Hafiz Vision Center Optical Lab',
    parameters: [
      { name: 'Right Eye (OD) Sph', value: '+0.75', unit: 'Diopter', normalRange: '0.00', status: 'normal' },
      { name: 'Right Eye (OD) Cyl', value: '-0.25', unit: 'Axis 90°', normalRange: '0.00', status: 'normal' },
      { name: 'Left Eye (OS) Sph', value: '+0.75', unit: 'Diopter', normalRange: '0.00', status: 'normal' },
      { name: 'Visual Acuity Dist.', value: '6/6', unit: 'Snellen', normalRange: '6/6', status: 'normal' },
      { name: 'Intraocular Pressure (IOP)', value: '14', unit: 'mmHg', normalRange: '10 - 21', status: 'normal' },
    ],
  },
  {
    id: 'REP-8493',
    reportNumber: 'QSC-2026-552',
    mrn: 'MRN-84920',
    patientName: 'محمد فاروق / Muhammad Farooq',
    patientAge: '46 Y',
    patientGender: 'Male',
    testName: 'Quantum Body Health & Spine Scan',
    testNameUrdu: 'بائیو کوانٹم فل باڈی و مہرہ اسکین',
    category: 'Bio Quantum Scan',
    doctorName: 'Dr. Waqas Saghir Chaudhry (Physiotherapist & Rehab)',
    date: '2026-08-18',
    status: 'Normal',
    summary: 'Spinal alignment assessment shows improvement in L4-L5 disc tension after physiotherapy.',
    summaryUrdu: 'کمر کے نچلے مہروں میں فزیوتھراپی اور مساج کے بعد مثبت بہتری۔ کھنچاؤ نمایاں کم۔',
    impression: 'Spinal rehabilitation 85% restored. Continue ergonomic posture.',
    verifiedBy: 'Rehab Department Hafiz Clinic',
    parameters: [
      { name: 'Lumbar Flexibility Range', value: '88%', unit: 'Normal', normalRange: '> 80%', status: 'normal' },
      { name: 'Nerve Conduction Index', value: 'Optimal', unit: 'Index', normalRange: 'Optimal', status: 'normal' },
      { name: 'Muscle Tension Level', value: 'Mild', unit: 'Grade I', normalRange: 'Normal', status: 'normal' },
    ],
  },
];

// Initial Curated Follow-Up Reminders
const defaultFollowUpReminders: FollowUpReminder[] = [
  {
    id: 'REM-1',
    doctorName: 'Dr. Zeeshan Chaudhry (MBBS)',
    doctorId: 'doc-1',
    title: 'Routine Post-Therapy Consultation & BP Check',
    titleUrdu: 'علاج کے بعد فالو اپ معائنہ و بلڈ پریشر ٹیسٹ',
    category: 'checkup',
    dueDate: '2026-10-02',
    dueTime: '11:00 AM',
    status: 'due_soon',
    priority: 'high',
    notes: 'Bring last blood test report and current medicines prescription.',
    notesUrdu: 'سابقہ بلڈ رپورٹ اور دوائیوں کی پرچی ساتھ لائیں۔',
    doctorAdvice: 'Maintain light walking and salt restriction before visit.',
    department: 'General OPD',
  },
  {
    id: 'REM-2',
    doctorName: 'Hafiz Pathology Lab',
    doctorId: 'lab-1',
    title: 'Fasting Sugar & Lipid Profile Re-test',
    titleUrdu: 'فاسٹنگ شوگر و کولیسٹرول ری چیک',
    category: 'lab_test',
    dueDate: '2026-10-10',
    dueTime: '08:30 AM',
    status: 'upcoming',
    priority: 'medium',
    notes: 'Require 10-12 hours fasting before early morning sample collection.',
    notesUrdu: 'ٹیسٹ سے قبل 10 سے 12 گھنٹے کا فاقہ ضروری ہے۔',
    department: 'Pathology Lab',
  },
  {
    id: 'REM-3',
    doctorName: 'Dr. Waqas Saghir (Rehab)',
    doctorId: 'doc-2',
    title: 'Joint Relief Oil & Spine Exercise Session #4',
    titleUrdu: 'فزیوتھراپی سیشن #4 و پین آئل مساج جائزہ',
    category: 'physiotherapy',
    dueDate: '2026-09-28',
    dueTime: '04:30 PM',
    status: 'due_soon',
    priority: 'high',
    notes: 'Bring comfortable physical therapy clothing.',
    notesUrdu: 'ہلکے اور آرام دہ کپڑے پہن کر تشریف لائیں۔',
    department: 'Physiotherapy Center',
  },
  {
    id: 'REM-4',
    doctorName: 'Hafiz Vision Center',
    doctorId: 'doc-1',
    title: '6-Month Computer Eyewear & Screen Vision Screen',
    titleUrdu: 'چھ ماہی نظر معائنہ اور بلیو کٹ چشمہ چیک اپ',
    category: 'eye_exam',
    dueDate: '2026-11-15',
    dueTime: '02:00 PM',
    status: 'upcoming',
    priority: 'normal',
    notes: 'Free computerized checkup under Hafiz Vision Member Card.',
    notesUrdu: 'ممبر شپ کارڈ پر مفت کمپیوٹرائزڈ چیک اپ۔',
    department: 'Vision Center',
  },
];

export const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({
  currentUser,
  doctors = [],
  appointments = [],
  clinicSettings,
  language,
  setLanguage,
  onLoginSuccess,
  onLogout,
  onOpenAppointment,
  setActiveView,
}) => {
  const isUrdu = language === 'urdu';

  // Active Tab: 'overview' | 'appointments' | 'reports' | 'reminders' | 'vitals'
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'reports' | 'reminders' | 'vitals'>('overview');

  // Login & Registration state for unauthenticated screen
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Reminders state (stored in local storage to preserve patient additions)
  const [reminders, setReminders] = useState<FollowUpReminder[]>(() => {
    const saved = localStorage.getItem('hafiz_patient_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultFollowUpReminders;
      }
    }
    return defaultFollowUpReminders;
  });

  // Digital reports state
  const [reports, setReports] = useState<DigitalMedicalReport[]>(defaultPatientReports);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<DigitalMedicalReport | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // New Reminder Modal
  const [isNewReminderOpen, setIsNewReminderOpen] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState<'checkup' | 'lab_test' | 'medication' | 'eye_exam' | 'physiotherapy'>('checkup');
  const [newReminderDoctor, setNewReminderDoctor] = useState(doctors[0]?.nameEnglish || 'Dr. Zeeshan Chaudhry (MBBS)');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('10:00 AM');
  const [newReminderNotes, setNewReminderNotes] = useState('');

  // Appointment filters
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('all');

  // External report upload
  const [isUploadReportOpen, setIsUploadReportOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTestTitle, setUploadTestTitle] = useState('');
  const [uploadDoctorName, setUploadDoctorName] = useState(doctors[0]?.nameEnglish || 'Dr. Zeeshan Chaudhry');
  const [isUploading, setIsUploading] = useState(false);

  // Telehealth Video Consultation Modal
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [telehealthTargetUser, setTelehealthTargetUser] = useState<any>({
    id: 'doc-1',
    name: 'Dr. Zeeshan Chaudhry (MBBS, Senior Physician)',
    role: 'doctor',
    specialization: 'Senior Physician & Telemedicine',
  });
  const [telehealthAppointmentContext, setTelehealthAppointmentContext] = useState<any>(null);

  const handleStartVideoCall = (doctorName?: string, problem?: string, tokenNum?: string | number) => {
    setTelehealthTargetUser({
      id: 'doc-1',
      name: doctorName || 'Dr. Zeeshan Chaudhry (MBBS, Senior Physician)',
      role: 'doctor',
      specialization: 'Senior Physician & Telemedicine',
    });
    setTelehealthAppointmentContext({
      doctorName: doctorName || 'Dr. Zeeshan Chaudhry',
      problem: problem || 'Online Telehealth Video Consultation',
      tokenNumber: tokenNum || personalAppointments[0]?.tokenNumber || 'TK-01',
      patientName: currentUser?.name || currentUser?.fullName || 'Patient',
    });
    setIsTelehealthOpen(true);
  };

  // Save reminders changes to localStorage
  useEffect(() => {
    localStorage.setItem('hafiz_patient_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Load patient reports from server if user is logged in
  useEffect(() => {
    if (currentUser) {
      const pId = currentUser.id || currentUser._id;
      if (pId) {
        setIsLoadingReports(true);
        getReportsApi(pId)
          .then((res) => {
            if (res.success && Array.isArray(res.reports) && res.reports.length > 0) {
              const mapped: DigitalMedicalReport[] = res.reports.map((r: any, idx: number) => ({
                id: r.id || r._id || `SRV-${idx}`,
                reportNumber: `LAB-2026-${String(idx + 100).padStart(3, '0')}`,
                mrn: currentUser.mrn || 'MRN-84920',
                patientName: currentUser.name || currentUser.fullName || 'Patient',
                testName: r.testNameEnglish || r.testName || 'Laboratory Test',
                testNameUrdu: r.testNameUrdu || 'لیب ٹیسٹ رپورٹ',
                category: 'Pathology Lab',
                doctorName: r.doctorName || 'Dr. Zeeshan Chaudhry',
                date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '2026-09-20',
                status: 'Reviewed',
                fileUrl: r.fileUrl,
                summary: r.summary || 'Lab report uploaded and reviewed.',
                summaryUrdu: 'لیب رپورٹ اپلوڈ ہو چکی ہے اور معالج نے ملاحظہ کر لی ہے۔',
                impression: 'Diagnostic verification completed.',
                verifiedBy: 'Hafiz Clinic Lab',
              }));
              setReports([...mapped, ...defaultPatientReports]);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingReports(false));
      }
    }
  }, [currentUser]);

  // Handle Authentication for Protected View
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await loginApi(authUsername, authPassword, 'patient');
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setAuthError(res.message || (isUrdu ? 'غلط یوزر نیم یا پاس ورڈ درج کیا گیا ہے۔' : 'Invalid login credentials.'));
        }
      } else {
        const res = await registerApi(authUsername, authPassword, 'patient', authFullName, authPhone);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setAuthError(res.message || (isUrdu ? 'اکاؤنٹ بنانے میں رکاوٹ آئی ہے۔' : 'Registration failed.'));
        }
      }
    } catch (err: any) {
      setAuthError(isUrdu ? 'سرور سے رابطہ نہ ہو سکا۔' : 'Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Filter personal appointments for this patient
  const personalAppointments = useMemo(() => {
    const list = appointments || [];
    if (!currentUser) return [];

    const pPhone = (currentUser.phone || '').replace(/\D/g, '');
    const pName = (currentUser.fullName || currentUser.name || '').toLowerCase();
    const pId = String(currentUser.id || currentUser._id || '');

    // Match appointments by phone, ID, or patient name
    let matched = list.filter((app) => {
      if (app.patientId && String(app.patientId) === pId) return true;
      if (pPhone && app.phone && app.phone.replace(/\D/g, '') === pPhone) return true;
      if (pName && app.patientName && app.patientName.toLowerCase().includes(pName)) return true;
      return false;
    });

    // If no direct matches in mock data, provide curated sample records for patient
    if (matched.length === 0) {
      matched = [
        {
          id: 'APP-8491',
          patientName: currentUser.name || 'محمد فاروق',
          phone: currentUser.phone || '03001234567',
          city: currentUser.city || 'گوجرانوالہ',
          problem: 'کمر درد و مہروں کی فزیوتھراپی معائنہ (Spine & Joint Assessment)',
          doctorName: 'ڈاکٹر وقاص صغیر چوہدری (MBBS, Rehab)',
          date: '2026-09-28',
          timeSlot: 'شام 04:30 - 05:30',
          status: 'Confirmed',
          tokenNumber: 4,
          doctorFee: 1500,
          appointmentCategory: 'doctor_consultation',
          createdAt: '2026-09-20',
        },
        {
          id: 'APP-8490',
          patientName: currentUser.name || 'محمد فاروق',
          phone: currentUser.phone || '03001234567',
          city: currentUser.city || 'گوجرانوالہ',
          problem: 'کمپیوٹرائزڈ آنکھوں کا مکمل ٹیسٹ (Computerized Eye Screen)',
          doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
          date: '2026-09-02',
          timeSlot: 'دوپہر 02:00 - 03:00',
          status: 'Completed',
          tokenNumber: 9,
          doctorFee: 1200,
          appointmentCategory: 'diagnostic_test',
          createdAt: '2026-08-30',
        },
        {
          id: 'APP-8488',
          patientName: currentUser.name || 'محمد فاروق',
          phone: currentUser.phone || '03001234567',
          city: currentUser.city || 'گوجرانوالہ',
          problem: 'ابتدائی میڈیکل مشاورت و بلڈ پریشر چیک اپ',
          doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
          date: '2026-08-15',
          timeSlot: 'صبح 11:00 - 12:00',
          status: 'Completed',
          tokenNumber: 12,
          doctorFee: 1200,
          createdAt: '2026-08-14',
        },
      ];
    }

    if (appointmentFilter === 'all') return matched;
    if (appointmentFilter === 'upcoming') {
      return matched.filter((a) => a.status === 'Confirmed' || a.status === 'Pending' || a.status === 'Approved');
    }
    if (appointmentFilter === 'completed') {
      return matched.filter((a) => a.status === 'Completed');
    }
    if (appointmentFilter === 'cancelled') {
      return matched.filter((a) => a.status === 'Cancelled');
    }
    return matched;
  }, [appointments, currentUser, appointmentFilter]);

  // Toggle Reminder Status
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          const newStatus = rem.status === 'completed' ? 'upcoming' : 'completed';
          return { ...rem, status: newStatus };
        }
        return rem;
      })
    );
  };

  // Add Custom Follow-up Reminder
  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDate) return;

    const newRem: FollowUpReminder = {
      id: `REM-${Date.now()}`,
      title: newReminderTitle,
      category: newReminderCategory,
      doctorName: newReminderDoctor,
      dueDate: newReminderDate,
      dueTime: newReminderTime,
      status: 'upcoming',
      priority: 'high',
      notes: newReminderNotes,
      patientName: currentUser?.name || 'Patient',
    };

    setReminders([newRem, ...reminders]);
    setIsNewReminderOpen(false);
    setNewReminderTitle('');
    setNewReminderNotes('');
    setNewReminderDate('');
  };

  // Download Report as formatted PDF
  const handleDownloadReportPdf = async (report: DigitalMedicalReport) => {
    setIsGeneratingPdf(true);
    try {
      const safeName = report.testName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Medical_Report_${report.reportNumber}_${safeName}.pdf`;

      const paramsHtml = (report.parameters || [])
        .map(
          (p) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${p.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #065f46;">${p.value} ${p.unit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${p.normalRange}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${p.status === 'normal' ? '#065f46' : '#dc2626'};">${p.status.toUpperCase()}</td>
        </tr>
      `
        )
        .join('');

      const html = `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8" />
  <title>${report.testName} - ${report.reportNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #ffffff; color: #0f172a; padding: 24px; font-size: 13px; }
    .container { max-width: 780px; margin: 0 auto; border: 2px solid #065f46; border-radius: 16px; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 16px; }
    .brand-title { font-size: 22px; font-weight: 900; color: #022c22; }
    .brand-sub { font-size: 12px; color: #065f46; font-weight: bold; margin-top: 2px; }
    .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #065f46; color: white; padding: 10px; text-align: left; font-size: 12px; }
    .summary-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 14px; margin-bottom: 16px; font-size: 12px; color: #065f46; line-height: 1.6; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 24px; font-size: 11px; }
    .stamp-box { text-align: center; }
    .stamp-line { border-bottom: 1px solid #475569; width: 170px; padding-bottom: 4px; font-weight: bold; font-family: serif; color: #022c22; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">حافظ کلینک اینڈ پیتھالوجی لیبارٹری</div>
        <div class="brand-sub">Hafiz Clinic & Diagnostic Pathology Center</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">PHC Reg: 84920 • Punjab Healthcare Commission Approved</div>
      </div>
      <div style="text-align: right;">
        <div style="background: #065f46; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 12px; display: inline-block;">${report.reportNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: <strong>${report.date}</strong></div>
        <div style="font-size: 11px; color: #065f46; font-weight: bold;">MRN: ${report.mrn}</div>
      </div>
    </div>

    <div class="meta-box">
      <div><strong>Patient:</strong> ${report.patientName}</div>
      <div><strong>Age / Gender:</strong> ${report.patientAge || '46 Y'} / ${report.patientGender || 'Male'}</div>
      <div><strong>Consultant:</strong> ${report.doctorName}</div>
      <div><strong>Test Name:</strong> ${report.testName}</div>
      <div><strong>Category:</strong> ${report.category}</div>
      <div><strong>Status:</strong> <span style="color: #065f46; font-weight: bold;">Verified ✓</span></div>
    </div>

    ${
      report.parameters && report.parameters.length > 0
        ? `
      <table>
        <thead>
          <tr>
            <th>Diagnostic Parameter</th>
            <th>Observed Result</th>
            <th>Biological Reference</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${paramsHtml}</tbody>
      </table>
    `
        : ''
    }

    <div class="summary-box">
      <strong>Clinical Findings & Doctor's Interpretation:</strong>
      <div style="margin-top: 4px;">${report.summary || ''}</div>
      <div style="font-family: 'Noto Nastaliq Urdu', serif; margin-top: 6px; color: #022c22;">${report.summaryUrdu || ''}</div>
    </div>

    <div class="footer">
      <div>
        <div>Official Electronic Health Record • Hafiz Clinic</div>
        <div style="color: #065f46; font-weight: bold; margin-top: 2px;">Verified QR Diagnostic Authentication Available</div>
      </div>
      <div class="stamp-box">
        <div class="stamp-line">${report.verifiedBy || 'Dr. Waqas Saghir (Pathologist)'}</div>
        <div style="color: #64748b; margin-top: 4px;">Electronic Medical Board Signature</div>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await renderHtmlToPdf(html, fileName);
    } catch (e) {
      alert(isUrdu ? 'PDF ڈاؤن لوڈ میں مسئلہ آیا ہے۔ براہ کرم پرنٹ آپشن استعمال کریں۔' : 'Failed to generate PDF. You can use the Print option.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Upload new external lab test
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert(isUrdu ? 'براہ کرم پہلے رپورٹ فائل منتخب کریں۔' : 'Please choose a report file first.');
      return;
    }
    setIsUploading(true);

    try {
      const uploadRes = await uploadDiseaseImageApi(uploadFile);
      const fileUrl = uploadRes.url || '';

      const newReport: DigitalMedicalReport = {
        id: `REP-${Date.now()}`,
        reportNumber: `LAB-2026-${Math.floor(100 + Math.random() * 900)}`,
        mrn: currentUser?.mrn || 'MRN-84920',
        patientName: currentUser?.name || currentUser?.fullName || 'Patient',
        testName: uploadTestTitle || 'External Diagnostic Report',
        testNameUrdu: uploadTestTitle || 'مریض اپلوڈ شدہ رپورٹ',
        category: 'Pathology Lab',
        doctorName: uploadDoctorName,
        date: new Date().toISOString().split('T')[0],
        status: 'Reviewed',
        fileUrl,
        summary: 'Uploaded external report submitted for doctor evaluation.',
        summaryUrdu: 'مریض کی جانب سے اپلوڈ کی گئی رپورٹ ڈاکٹر کے معائنے کے لیے ریکارڈ میں درج کر لی گئی ہے۔',
        impression: 'Uploaded document attached to patient electronic health file.',
        verifiedBy: uploadDoctorName,
      };

      setReports([newReport, ...reports]);
      setIsUploadReportOpen(false);
      setUploadFile(null);
      setUploadTestTitle('');
      alert(isUrdu ? 'رپورٹ کامیابی سے اپلوڈ ہو کر ریکارڈ میں شامل ہو گئی ہے۔' : 'Report successfully uploaded to your digital record.');
    } catch (err) {
      alert(isUrdu ? 'اپلوڈ کرنے میں ناکامی ہوئی۔' : 'Upload failed. Please check network.');
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================================================
  // 1. UNAUTHENTICATED GUARD SCREEN (Strictly accessible only after login)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="py-12 bg-slate-900/5 min-h-[85vh] flex items-center justify-center px-4" dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          {/* Security Header Banner */}
          <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-6 text-white text-center relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <span className="bg-emerald-800/80 text-emerald-200 text-[11px] font-bold px-3 py-0.5 rounded-full inline-block mb-1 border border-emerald-700/60">
              {isUrdu ? 'محفوظ طبی ریکارڈ پورٹل' : 'Confidential Medical Record Hub'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {isUrdu ? 'مریض ڈیش بورڈ (Patient Dashboard)' : 'Protected Patient Dashboard'}
            </h2>
            <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
              {isUrdu
                ? 'ذاتی اپائنٹمنٹس کی تاریخ، ڈیجیٹل میڈیکل رپورٹس اور فالو اپ ریمائنڈرز دیکھنے کے لیے سیکیور لاگ ان ضروری ہے۔'
                : 'Access your personal appointment history, download digital medical reports, and track doctor follow-up reminders.'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Auth Mode Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'مریض لاگ ان' : 'Patient Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'New Registration'}
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-semibold text-slate-800">
              {authMode === 'register' && (
                <div>
                  <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'پورا نام' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً: محمد فاروق' : 'e.g. Muhammad Farooq'}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-slate-700 font-bold">
                  {isUrdu ? 'یوزر نیم یا موبائل نمبر' : 'Username or Mobile Number'}
                </label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder={isUrdu ? '03001234567 یا یوزر نیم' : '03001234567 or username'}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'فون نمبر' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'پاس ورڈ' : 'Password'}</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : authMode === 'login' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {authLoading
                    ? isUrdu
                      ? 'تصدیق جاری ہے...'
                      : 'Authenticating...'
                    : authMode === 'login'
                    ? isUrdu
                      ? 'ڈیش بورڈ میں داخل ہوں'
                      : 'Sign In to Dashboard'
                    : isUrdu
                    ? 'اکاؤنٹ رجسٹر کریں'
                    : 'Create Patient Account'}
                </span>
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{clinicSettings.phcApprovalNo} • Punjab Healthcare Commission Reg.</span>
              </div>
              <p>Helpline: {clinicSettings.phone1} | WhatsApp: {clinicSettings.whatsappNumber}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED PATIENT DASHBOARD
  // =========================================================================
  const patientDisplayName = currentUser.name || currentUser.fullName || currentUser.username || (isUrdu ? 'معزز مریض' : 'Valued Patient');
  const patientMrn = currentUser.mrn || 'MRN-84920';

  const upcomingCount = personalAppointments.filter((a) => a.status === 'Confirmed' || a.status === 'Approved').length;
  const activeRemindersCount = reminders.filter((r) => r.status !== 'completed').length;

  return (
    <div className="py-8 bg-slate-50 min-h-screen text-slate-900" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* =================================================================== */}
        {/* HERO PROFILE & KPI BAR */}
        {/* =================================================================== */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/60 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            {/* Left: Patient Avatar & Demographics */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                {patientDisplayName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{patientDisplayName}</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{patientMrn}</span>
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {isUrdu ? 'تصدیق شدہ مریض' : 'Verified Patient'}
                  </span>
                </div>

                <div className="text-xs text-emerald-200/80 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                  {currentUser.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-300" />
                      <span>{currentUser.phone}</span>
                    </span>
                  )}
                  {currentUser.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{currentUser.city}</span>
                    </span>
                  )}
                  <span className="bg-emerald-900/80 text-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    Blood: <strong>{currentUser.bloodGroup || 'B+'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Fast-Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                onClick={() => handleStartVideoCall()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <Video className="w-4 h-4 text-cyan-200" />
                <span>{isUrdu ? 'آن لائن ویڈیو کال (Start Video Call)' : 'Start Video Call'}</span>
              </button>

              <button
                onClick={() => onOpenAppointment()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{isUrdu ? 'نئی اپائنٹمنٹ لیں' : 'Book Appointment'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  if (reports[0]) handleDownloadReportPdf(reports[0]);
                }}
                disabled={isGeneratingPdf}
                className="bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-emerald-600/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'تازہ ترین رپورٹ ڈاؤن لوڈ' : 'Download Latest Report'}</span>
              </button>

              <button
                onClick={onLogout}
                className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout"
              >
                <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
              </button>
            </div>
          </div>

          {/* 5 Interactive KPI Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-emerald-800/60 text-xs">
            <div
              onClick={() => setActiveTab('appointments')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-emerald-800/60 border-amber-400/80 ring-2 ring-amber-400/20'
                  : 'bg-emerald-900/30 border-emerald-800/60 hover:bg-emerald-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="font-bold">{isUrdu ? 'کل اپائنٹمنٹس' : 'Appointments'}</span>
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black font-mono text-white">{personalAppointments.length}</div>
              <div className="text-[10px] text-emerald-200 mt-1">
                {upcomingCount} {isUrdu ? 'آئندہ طے شدہ' : 'Upcoming active visits'}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('reports')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-emerald-800/60 border-amber-400/80 ring-2 ring-amber-400/20'
                  : 'bg-emerald-900/30 border-emerald-800/60 hover:bg-emerald-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="font-bold">{isUrdu ? 'ڈیجیٹل میڈیکل رپورٹس' : 'Digital Reports'}</span>
                <FileText className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black font-mono text-white">{reports.length}</div>
              <div className="text-[10px] text-emerald-200 mt-1">
                {isUrdu ? 'باضابطہ تصدیق شدہ PDF ڈاؤن لوڈ' : 'Verified & PDF Ready'}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('vitals')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-emerald-800/60 border-rose-400/80 ring-2 ring-rose-400/20'
                  : 'bg-emerald-900/30 border-emerald-800/60 hover:bg-emerald-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="font-bold">{isUrdu ? 'وائٹلز ٹرینڈ چارٹ' : 'Vital Signs Trend'}</span>
                <HeartPulse className="w-4 h-4 text-rose-300 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-200">120/80</div>
              <div className="text-[10px] text-emerald-200 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{isUrdu ? 'بی پی و شوگر اینالیسس' : 'BP & Sugar Visualizer'}</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('reminders')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-emerald-800/60 border-amber-400/80 ring-2 ring-amber-400/20'
                  : 'bg-emerald-900/30 border-emerald-800/60 hover:bg-emerald-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="font-bold">{isUrdu ? 'فالو اپ ریمائنڈرز' : 'Follow-up Reminders'}</span>
                <Bell className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">{activeRemindersCount}</div>
              <div className="text-[10px] text-emerald-200 mt-1">
                {isUrdu ? 'معائنے و ٹیسٹ یاد دہانیاں' : 'Upcoming doctor/test alerts'}
              </div>
            </div>

            <div
              onClick={() => setActiveView('store')}
              className="p-3.5 rounded-2xl bg-emerald-900/30 border border-emerald-800/60 hover:bg-emerald-900/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="font-bold">{isUrdu ? 'پرسنل نسخہ و میڈیسن' : 'Prescribed Medicine'}</span>
                <Pill className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black font-mono text-white">Active</div>
              <div className="text-[10px] text-emerald-200 mt-1">
                {isUrdu ? 'ہربل دوا ری فل و ڈلیوری' : 'Herbal Refill & Home Delivery'}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* DASHBOARD NAVIGATION TABS */}
        {/* =================================================================== */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-black gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-300" />
            <span>{isUrdu ? 'ڈیش بورڈ خلاصہ' : 'Dashboard Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>{isUrdu ? 'اپائنٹمنٹس کی ہسٹری' : 'Appointment History'}</span>
            <span className="bg-emerald-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
              {personalAppointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>{isUrdu ? 'ڈیجیٹل میڈیکل رپورٹس' : 'Digital Medical Reports'}</span>
            <span className="bg-emerald-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>{isUrdu ? 'فالو اپ ریمائنڈرز' : 'Follow-up Reminders'}</span>
            {activeRemindersCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                {activeRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-300" />
            <span>{isUrdu ? 'وائٹلز ٹرینڈ چارٹ' : 'Vital Signs Trends'}</span>
            <span className="bg-emerald-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
              Recharts
            </span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: OVERVIEW COMPREHENSIVE HUB */}
        {/* =================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Row 1: Follow-Up Urgent Attention Banner */}
            {reminders.find((r) => r.status === 'due_soon') && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-200 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded">
                        {isUrdu ? 'فوری توجہ' : 'Urgent Reminder'}
                      </span>
                      <h3 className="font-black text-sm text-amber-950">
                        {isUrdu ? 'آپ کا آئندہ فالو اپ وزٹ قریب ہے' : 'Upcoming Follow-up Visit Due Soon'}
                      </h3>
                    </div>
                    <p className="text-xs text-amber-900 mt-1 font-medium">
                      {reminders.find((r) => r.status === 'due_soon')?.title} •{' '}
                      <strong>{reminders.find((r) => r.status === 'due_soon')?.dueDate}</strong> (
                      {reminders.find((r) => r.status === 'due_soon')?.doctorName})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reminders')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow transition-colors cursor-pointer shrink-0"
                >
                  {isUrdu ? 'تفصیلات دیکھیں' : 'View Reminder'}
                </button>
              </div>
            )}

            {/* Row 2: Grid of Quick Previews: Next Appointment & Recent Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointment Preview Box */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      {isUrdu ? 'آئندہ کلینک اپائنٹمنٹ' : 'Next Scheduled Visit'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isUrdu ? 'تمام دیکھیں' : 'View All'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {personalAppointments[0] ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                        {personalAppointments[0].id}
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {personalAppointments[0].status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        {personalAppointments[0].problem}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {personalAppointments[0].doctorName}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 font-semibold gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{personalAppointments[0].date} • {personalAppointments[0].timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                          Token #{personalAppointments[0].tokenNumber || '01'}
                        </span>
                        <button
                          onClick={() => handleStartVideoCall(personalAppointments[0]?.doctorName, personalAppointments[0]?.problem, personalAppointments[0]?.tokenNumber)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-cyan-200" />
                          <span>{isUrdu ? 'ویڈیو کال' : 'Start Video Call'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {isUrdu ? 'کوئی فعال اپائنٹمنٹ نہیں ہے۔' : 'No upcoming appointments booked.'}
                  </div>
                )}
              </div>

              {/* Latest Digital Medical Report Preview Box */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      {isUrdu ? 'تازہ ترین میڈیکل رپورٹ' : 'Latest Medical Report'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isUrdu ? 'تمام رپورٹس' : 'All Reports'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {reports[0] ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                        {reports[0].reportNumber}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ {reports[0].status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        {isUrdu ? reports[0].testNameUrdu || reports[0].testName : reports[0].testName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {reports[0].doctorName} • {reports[0].date}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {isUrdu ? reports[0].summaryUrdu || reports[0].summary : reports[0].summary}
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReportForPreview(reports[0])}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'پریویو' : 'Preview'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadReportPdf(reports[0])}
                        disabled={isGeneratingPdf}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'PDF محفوظ کریں' : 'Download PDF'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {isUrdu ? 'کوئی رپورٹ دستیاب نہیں ہے۔' : 'No reports available.'}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Live Recharts Vital Signs Trend Analysis */}
            <PatientVitalsTrendChart
              patientMrn={patientMrn}
              patientName={patientDisplayName}
              language={language}
              showSelfLogOption={true}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PERSONAL APPOINTMENT HISTORY */}
        {/* =================================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'آپ کی ذاتی اپائنٹمنٹ ہسٹری' : 'Personal Appointment History'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isUrdu
                    ? 'آپ کی تمام پچھلی اور آئندہ ڈاکٹر وزٹ بکنگز کی مکمل تفصیلات اور ٹوکن نمبرز'
                    : 'Complete chronological record of all your doctor consultations and diagnostic visits.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter buttons */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      appointmentFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {isUrdu ? 'تمام' : 'All'}
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      appointmentFilter === 'upcoming' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {isUrdu ? 'آئندہ' : 'Upcoming'}
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      appointmentFilter === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {isUrdu ? 'مکمل شدہ' : 'Completed'}
                  </button>
                </div>

                <button
                  onClick={() => onOpenAppointment()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>{isUrdu ? 'نئی بکنگ' : 'Book New'}</span>
                </button>
              </div>
            </div>

            {/* Appointments List */}
            {personalAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2 text-xs">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">
                  {isUrdu ? 'اس فلٹر کے تحت کوئی اپائنٹمنٹ نہیں ملی۔' : 'No appointments found for the selected filter.'}
                </p>
                <button
                  onClick={() => onOpenAppointment()}
                  className="mt-2 text-emerald-700 hover:underline font-bold"
                >
                  {isUrdu ? '+ نئی اپائنٹمنٹ بک کریں' : '+ Book an appointment now'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {personalAppointments.map((app, idx) => (
                  <div
                    key={(app as any)._id || `${app.id || 'app'}-${idx}`}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-black px-2.5 py-1 rounded-lg">
                          {app.id}
                        </span>
                        <div>
                          <div className="text-sm font-black text-slate-900">{app.problem}</div>
                          <div className="text-xs text-slate-500 font-medium">{app.doctorName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="bg-amber-100 text-amber-950 font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-amber-300">
                          🎫 Token #{app.tokenNumber || (idx + 1)}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            app.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : app.status === 'Confirmed' || app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : app.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {app.status === 'Completed'
                            ? '✓ Completed'
                            : app.status === 'Confirmed'
                            ? '✓ Confirmed'
                            : app.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 font-normal">{isUrdu ? 'تاریخ و وقت:' : 'Scheduled Date & Time:'}</span>
                        <div className="font-mono text-slate-900 font-bold mt-0.5">
                          {app.date} • {app.timeSlot}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-normal">{isUrdu ? 'شعبہ:' : 'Department:'}</span>
                        <div className="text-emerald-800 font-bold mt-0.5">
                          {app.testDepartment || 'General Specialist OPD'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-normal">{isUrdu ? 'معائنہ فیس:' : 'Consultation Fee:'}</span>
                        <div className="font-mono text-slate-900 font-bold mt-0.5">
                          Rs. {(app.doctorFee || app.testFee || 1200).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        {isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن مجاز تصدیق شدہ وزٹ' : 'PHC Reg Approved Electronic Appointment'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartVideoCall(app.doctorName, app.problem, app.tokenNumber)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-cyan-200" />
                          <span>{isUrdu ? 'ویڈیو کال شروع کریں' : 'Start Video Call'}</span>
                        </button>
                        <button
                          onClick={() => onOpenAppointment(app.doctorName)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'دوبارہ بک کریں' : 'Rebook / Follow-up'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: DOWNLOAD DIGITAL MEDICAL REPORTS */}
        {/* =================================================================== */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'ڈیجیٹل میڈیکل لیب رپورٹس' : 'Digital Medical Reports & Diagnostics'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isUrdu
                    ? 'لیبارٹری، کوانٹم اسکین اور آئی کیئر کی تمام مصدقہ رپورٹس فوری PDF ڈاؤن لوڈ کریں'
                    : 'Download official computerized PDF test reports with verified clinical reference parameters.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsUploadReportOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>{isUrdu ? 'اپنی رپورٹ اپلوڈ کریں' : 'Upload External Report'}</span>
                </button>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-900 text-xs bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                          {report.reportNumber}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {isUrdu ? report.testNameUrdu || report.testName : report.testName}
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {report.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        {report.category} • {report.doctorName} • Date: <strong>{report.date}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setSelectedReportForPreview(report)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-amber-300" />
                        <span>{isUrdu ? 'پریویو و پرنٹ' : 'Print / View'}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadReportPdf(report)}
                        disabled={isGeneratingPdf}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Callout */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                    <strong className="text-emerald-900 font-bold">
                      {isUrdu ? 'ڈاکٹر کا طبی تبصرہ: ' : 'Doctor Commentary: '}
                    </strong>
                    <span>{isUrdu ? report.summaryUrdu || report.summary : report.summary}</span>
                  </div>

                  {/* Diagnostic Parameters Snippet if present */}
                  {report.parameters && report.parameters.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                      {report.parameters.slice(0, 6).map((param, pIdx) => (
                        <div key={pIdx} className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] text-slate-500 truncate">{param.name}</div>
                          <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                            {param.value} <span className="text-[9px] text-slate-400 font-normal">{param.unit}</span>
                          </div>
                          <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                            Ref: {param.normalRange}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: UPCOMING FOLLOW-UP REMINDERS */}
        {/* =================================================================== */}
        {activeTab === 'reminders' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'آئندہ فالو اپ ریمائنڈرز و یاد دہانیاں' : 'Upcoming Follow-up Reminders'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isUrdu
                    ? 'ڈاکٹر معائنے، ادویات ری فل، اور لیب ٹیسٹ کی بروقت یاد دہانی کا خودکار نظام'
                    : 'Track doctor consultation dates, routine lab reviews, eye checkups, and medication refills.'}
                </p>
              </div>

              <button
                onClick={() => setIsNewReminderOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? '+ نیا ریمائنڈر شامل کریں' : '+ Add Follow-up Reminder'}</span>
              </button>
            </div>

            {/* Reminders Cards List */}
            <div className="space-y-4">
              {reminders.map((rem) => {
                const isCompleted = rem.status === 'completed';
                const isDueSoon = rem.status === 'due_soon';

                return (
                  <div
                    key={rem.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isCompleted
                        ? 'bg-slate-100/60 border-slate-200 opacity-70'
                        : isDueSoon
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
                          }`}
                          title={isCompleted ? 'Mark Active' : 'Mark Completed'}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm sm:text-base font-black ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {isUrdu ? rem.titleUrdu || rem.title : rem.title}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-slate-200 text-slate-700'
                                  : isDueSoon
                                  ? 'bg-amber-200 text-amber-950 font-black'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isCompleted ? '✓ Completed' : isDueSoon ? 'Due Soon' : 'Upcoming'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {rem.doctorName} • {rem.department || 'Specialist Consultation'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rem.dueDate}</span>
                          {rem.dueTime && <span className="text-slate-400 font-normal">({rem.dueTime})</span>}
                        </div>
                      </div>
                    </div>

                    {(rem.notes || rem.notesUrdu || rem.doctorAdvice) && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                        <strong className="text-emerald-900 font-bold">{isUrdu ? 'ہدایات / نوٹس: ' : 'Doctor Notes: '}</strong>
                        <span>{isUrdu ? rem.notesUrdu || rem.notes : rem.notes}</span>
                        {rem.doctorAdvice && <p className="text-emerald-700 font-medium mt-1">Advice: {rem.doctorAdvice}</p>}
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleReminder(rem.id)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        {isCompleted ? (
                          <span>{isUrdu ? 'دوبارہ فالو اپ لسٹ میں شامل کریں' : 'Reactivate Reminder'}</span>
                        ) : (
                          <span>{isUrdu ? '✓ مکمل ہو گیا (Done)' : '✓ Mark as Completed'}</span>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenAppointment(rem.doctorName)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'اس فالو اپ کے لیے وقت لیں' : 'Book for this Follow-up'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: VITAL SIGNS TREND & NURSING CARE INPUTS (RECHARTS) */}
        {/* =================================================================== */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <PatientVitalsTrendChart
              patientMrn={patientMrn}
              patientName={patientDisplayName}
              language={language}
              showSelfLogOption={true}
            />
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: PRINT / PREVIEW DIGITAL MEDICAL REPORT */}
      {/* =================================================================== */}
      {selectedReportForPreview && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  {isUrdu ? 'ڈیجیٹل میڈیکل رپورٹ پریویو' : 'Digital Medical Report Preview'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportForPreview(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Report Canvas */}
            <div className="bg-white border-2 border-emerald-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-emerald-950">
                    {isUrdu ? 'حافظ کلینک اینڈ پیتھالوجی لیبارٹری' : 'Hafiz Clinic & Pathology Diagnostic Center'}
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    پنجاب ہیلتھ کیئر کمیشن منظور شدہ • Registration # PHC-REG-84920
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-mono font-black text-sm text-emerald-900">{selectedReportForPreview.reportNumber}</div>
                  <div className="text-slate-500 font-medium">Date: {selectedReportForPreview.date}</div>
                  <div className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] inline-block mt-1">
                    ✓ Verified Lab Document
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3 font-semibold">
                <div>
                  <span className="text-slate-400 font-normal">Patient Name:</span>
                  <div className="text-slate-900 font-bold">{selectedReportForPreview.patientName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">Age / Gender:</span>
                  <div className="text-slate-900 font-bold">{selectedReportForPreview.patientAge || '46 Y'} / {selectedReportForPreview.patientGender || 'Male'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">MRN #:</span>
                  <div className="font-mono text-emerald-900 font-bold">{selectedReportForPreview.mrn}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">Test Category:</span>
                  <div className="text-slate-900 font-bold">{selectedReportForPreview.category}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-normal">Consultant Physician:</span>
                  <div className="text-slate-900 font-bold">{selectedReportForPreview.doctorName}</div>
                </div>
              </div>

              {selectedReportForPreview.parameters && selectedReportForPreview.parameters.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-bold">
                        <th className="p-2.5">Investigation Parameter</th>
                        <th className="p-2.5">Observed Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedReportForPreview.parameters.map((param, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{param.name}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-900">{param.value} {param.unit}</td>
                          <td className="p-2.5 text-slate-500">{param.normalRange}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{param.status.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <strong className="text-emerald-950 font-black">Findings & Medical Impression:</strong>
                <p className="text-slate-800 leading-relaxed font-medium">{selectedReportForPreview.summary}</p>
                {selectedReportForPreview.summaryUrdu && (
                  <p className="text-emerald-950 font-urdu leading-relaxed pt-1">{selectedReportForPreview.summaryUrdu}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <div className="font-bold text-emerald-900">Hafiz Clinic Medical Board</div>
                  <div className="text-[10px] text-slate-500">ISO & PHC Standards Compliant Diagnostic Testing</div>
                </div>
                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-900 border-b border-slate-400 px-4 pb-1">
                    {selectedReportForPreview.verifiedBy || 'Dr. Waqas Saghir (Pathologist)'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-1">Authorized Medical Stamp</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedReportForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>

              <button
                onClick={() => handleDownloadReportPdf(selectedReportForPreview)}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isUrdu ? 'PDF ڈاؤن لوڈ کریں' : 'Download PDF Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD CUSTOM FOLLOW-UP REMINDER */}
      {/* =================================================================== */}
      {isNewReminderOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {isUrdu ? 'نیا فالو اپ ریمائنڈر شامل کریں' : 'Add Follow-up Reminder'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewReminderOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomReminder} className="space-y-4 text-xs font-semibold text-slate-800">
              <div>
                <label className="block mb-1 font-bold">{isUrdu ? 'عنوان / معائنے کی تفصیل' : 'Reminder Title'}</label>
                <input
                  type="text"
                  required
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: 15 روزہ مہروں کا فالو اپ معائنہ' : 'e.g. 15-Day Spine Post-Checkup'}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold">{isUrdu ? 'قسم' : 'Category'}</label>
                  <select
                    value={newReminderCategory}
                    onChange={(e: any) => setNewReminderCategory(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="checkup">{isUrdu ? 'ڈاکٹر معائنہ' : 'Doctor Checkup'}</option>
                    <option value="lab_test">{isUrdu ? 'لیب ٹیسٹ' : 'Lab Test'}</option>
                    <option value="medication">{isUrdu ? 'دوا ری فل' : 'Medication Refill'}</option>
                    <option value="eye_exam">{isUrdu ? 'نظر چشمہ ٹیسٹ' : 'Eye Exam'}</option>
                    <option value="physiotherapy">{isUrdu ? 'فزیوتھراپی سیشن' : 'Physiotherapy'}</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">{isUrdu ? 'ڈاکٹر / معالج' : 'Doctor'}</label>
                  <select
                    value={newReminderDoctor}
                    onChange={(e) => setNewReminderDoctor(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.nameEnglish}>
                        {isUrdu ? d.nameUrdu : d.nameEnglish}
                      </option>
                    ))}
                    <option value="Hafiz Pathology Lab">Hafiz Pathology Lab</option>
                    <option value="Hafiz Vision Center">Hafiz Vision Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold">{isUrdu ? 'تاریخ' : 'Due Date'}</label>
                  <input
                    type="date"
                    required
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">{isUrdu ? 'وقت' : 'Due Time'}</label>
                  <input
                    type="text"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold">{isUrdu ? 'نوٹس یا ہدایات' : 'Notes / Instructions'}</label>
                <textarea
                  rows={2}
                  value={newReminderNotes}
                  onChange={(e) => setNewReminderNotes(e.target.value)}
                  placeholder={isUrdu ? 'معائنے کے لیے ضروری ہدایات درج کریں...' : 'Enter instructions or doctor advice...'}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewReminderOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  {isUrdu ? 'ریمائنڈر محفوظ کریں' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: UPLOAD EXTERNAL LAB REPORT */}
      {/* =================================================================== */}
      {isUploadReportOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {isUrdu ? 'نئی بیرونی میڈیکل رپورٹ اپلوڈ کریں' : 'Upload External Medical Report'}
                </h3>
              </div>
              <button
                onClick={() => setIsUploadReportOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReport} className="space-y-4 text-xs font-semibold text-slate-800">
              <div>
                <label className="block mb-1 font-bold">{isUrdu ? 'ٹیسٹ کا نام / عنوان' : 'Test / Report Title'}</label>
                <input
                  type="text"
                  required
                  value={uploadTestTitle}
                  onChange={(e) => setUploadTestTitle(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: بلڈ شوگر یا الٹراساؤنڈ رپورٹ' : 'e.g. Ultrasound Abdomen / Lipid Test'}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">{isUrdu ? 'معالج کا انتخاب' : 'Select Doctor'}</label>
                <select
                  value={uploadDoctorName}
                  onChange={(e) => setUploadDoctorName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.nameEnglish}>
                      {isUrdu ? d.nameUrdu : d.nameEnglish} ({d.qualification})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold">{isUrdu ? 'رپورٹ فائل منتخب کریں (PDF یا تصویر)' : 'Select File (PDF or Image)'}</label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                />
                {uploadFile && (
                  <p className="mt-1 text-emerald-700 font-bold">✓ Selected: {uploadFile.name}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadReportOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {isUploading ? (isUrdu ? 'اپلوڈ جاری ہے...' : 'Uploading...') : (isUrdu ? 'ریکارڈ میں اپلوڈ کریں' : 'Upload to Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telehealth Live WebRTC Video Consultation Screen */}
      <Telehealth
        isOpen={isTelehealthOpen}
        onClose={() => setIsTelehealthOpen(false)}
        currentUser={currentUser}
        targetUser={telehealthTargetUser}
        callerRole="patient"
        appointmentContext={telehealthAppointmentContext}
        language={language}
      />
    </div>
  );
};
