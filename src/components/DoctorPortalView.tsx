import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  CheckCircle2,
  UserCheck,
  FilePlus,
  Printer,
  Clock,
  Lock,
  MessageSquare,
  FileText,
  CheckCheck,
  Send,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Search,
  Activity,
  Award,
  Settings,
  TrendingUp,
  Globe,
  LogOut,
  PhoneCall,
  X,
  Plus,
  Filter,
  Check,
  AlertCircle,
  Video,
  Mic,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Receipt,
  Share2,
  ExternalLink,
  ShoppingBag,
  Eye,
  Glasses,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Appointment, Doctor, MoneySlip, MoneySlipItem } from '../types';
import { loginApi, getReportsApi, updateReportApi, getAppointmentsApi, updateAppointmentApi } from '../services/api';
import {
  createAutoInvoiceFromAppointment,
  addItemToPatientInvoice,
  referPatientToDoctor,
  fetchSlipsApi,
  saveSlipApi,
  HOSPITAL_SERVICES_CATALOG,
} from '../services/billingService';
import { printInvoiceHtml, printPrescriptionHtml, downloadInvoicePdf, downloadPrescriptionPdf, printInvoicePdf } from '../utils/printInvoice';
import { openWhatsAppNotification } from '../utils/notificationDispatcher';
import { DoctorPatientChatView } from './DoctorPatientChatView';

interface DoctorPortalProps {
  appointments: Appointment[];
  doctors?: Doctor[];
  language?: 'urdu' | 'english';
  setActiveView?: (view: string) => void;
  setLanguage?: (lang: 'urdu' | 'english') => void;
}

export const DoctorPortalView: React.FC<DoctorPortalProps> = ({
  appointments,
  doctors = [],
  language = 'urdu',
  setActiveView,
  setLanguage,
}) => {
  const isUrdu = language === 'urdu';
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(appointments);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(appointments[0] || null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [rxPrecautions, setRxPrecautions] = useState('');
  const [savedPrescriptions, setSavedPrescriptions] = useState<
    { id: string; patientName: string; date: string; content: string; prescriptionText?: string; rxNotes?: string; rxPrecautions?: string; doctorName?: string }[]
  >([]);
  const [selectedRxForPrint, setSelectedRxForPrint] = useState<any>(null);

  // Billing & Live Money Slip State
  const [patientActiveSlip, setPatientActiveSlip] = useState<MoneySlip | null>(null);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MoneySlip | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<any>('Medicine');
  const [customItemPrice, setCustomItemPrice] = useState<number>(1500);
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [catalogDeptFilter, setCatalogDeptFilter] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Referral Modal State
  const [referralModalApp, setReferralModalApp] = useState<Appointment | null>(null);
  const [referralTargetDocId, setReferralTargetDocId] = useState<string>(doctors[1]?.id || doctors[0]?.id || 'doc-2');
  const [referralReason, setReferralReason] = useState<string>('کمپیوٹرائزڈ آنکھوں کا معائنہ و عینک (Optical / Eye Vision Checkup)');
  const [includeReferralFee, setIncludeReferralFee] = useState<boolean>(true);
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);

  // Doctor Auth State
  const [isDoctorAuth, setIsDoctorAuth] = useState(false);
  const [username, setUsername] = useState('doctor1');
  const [password, setPassword] = useState('doc123');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);

  // Dedicated Pages / Tabs
  const [docPage, setDocPage] = useState<'dashboard' | 'queue' | 'chat' | 'reports' | 'schedule' | 'analytics'>('dashboard');

  // Search & Filter State in Queue
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled' | 'Referred'>('all');

  // Doctor Availability Toggle
  const [isOPDActive, setIsOPDActive] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setAppointmentsList(appointments);
  }, [appointments]);

  // Load Patient Running Slip whenever selectedApp changes
  useEffect(() => {
    if (selectedApp) {
      const tokenStr = selectedApp.tokenNumber ? String(selectedApp.tokenNumber) : undefined;
      fetchSlipsApi({
        phone: selectedApp.phone,
        appointmentId: selectedApp.id,
        tokenNumber: tokenStr,
      })
        .then((slips) => {
          const match = slips.find(
            (s) =>
              (tokenStr && String(s.tokenNumber) === tokenStr) ||
              s.appointmentId === selectedApp.id ||
              (s.patientPhone && selectedApp.phone && s.patientPhone.replace(/\D/g, '') === selectedApp.phone.replace(/\D/g, ''))
          );
          setPatientActiveSlip(match || null);
        })
        .catch(() => {});
    } else {
      setPatientActiveSlip(null);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (isDoctorAuth) {
      const fetchAppointments = () => {
        getAppointmentsApi()
          .then((res) => {
            if (res.success && res.appointments && res.appointments.length > 0) {
              setAppointmentsList(res.appointments);
            }
          })
          .catch(() => {});
      };
      fetchAppointments();
      const interval = setInterval(fetchAppointments, 3000);
      return () => clearInterval(interval);
    }
  }, [isDoctorAuth]);

  useEffect(() => {
    if (!selectedApp && appointmentsList.length > 0) {
      setSelectedApp(appointmentsList[0]);
    }
  }, [appointmentsList, selectedApp]);

  const handleUpdateStatus = async (appId: string, newStatus: 'Approved' | 'Cancelled' | 'Completed') => {
    const targetApp = appointmentsList.find((a) => a.id === appId || (a as any)._id === appId);

    setAppointmentsList((prev) =>
      prev.map((a) => {
        if (a.id === appId || (a as any)._id === appId) {
          return { ...a, status: newStatus };
        }
        return a;
      })
    );

    if (selectedApp && (selectedApp.id === appId || (selectedApp as any)._id === appId)) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await updateAppointmentApi(appId, { status: newStatus });
      if (newStatus === 'Approved' && targetApp) {
        // Automatic invoice generation with doctor's checkup fee
        const generatedSlip = await createAutoInvoiceFromAppointment(targetApp, doctors);
        setPatientActiveSlip(generatedSlip);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Add Pre-set Item or Custom Item to Patient's Invoice
  const handleAddBillingItem = async (item: {
    description: string;
    category: any;
    quantity: number;
    unitPrice: number;
    department?: string;
    servedBy?: string;
  }) => {
    if (!selectedApp) {
      alert(isUrdu ? 'برائے مہربانی پہلے او پی ڈی فہرست سے مریض منتخب کریں۔' : 'Please select a patient first.');
      return;
    }

    try {
      setIsAddingItem(true);
      const docName = currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
      const deptName = item.department || (currentDoctor?.department || 'OPD / Consultation');
      const identifier = selectedApp.tokenNumber ? String(selectedApp.tokenNumber) : (selectedApp.phone || selectedApp.id);
      const updatedSlip = await addItemToPatientInvoice(
        identifier,
        selectedApp.patientName,
        docName,
        {
          ...item,
          department: deptName,
          servedBy: item.servedBy || docName,
        }
      );
      setPatientActiveSlip(updatedSlip);
      setCustomItemDesc('');
      setCustomItemPrice(1500);
      setCustomItemQty(1);
    } catch (err) {
      alert('Error updating patient invoice.');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Refer Patient to Another Doctor
  const handleExecuteReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralModalApp) return;

    const targetDoc = doctors.find((d) => d.id === referralTargetDocId) || doctors[0];
    if (!targetDoc) return;

    try {
      setIsProcessingReferral(true);
      const fromDocName = currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
      const { updatedAppointment, slip } = await referPatientToDoctor({
        appointment: referralModalApp,
        fromDoctorName: fromDocName,
        toDoctor: targetDoc,
        referralReason,
        includeReferralFee,
      });

      // Update local queue
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === referralModalApp.id ? updatedAppointment : a))
      );
      if (selectedApp?.id === referralModalApp.id) {
        setSelectedApp(updatedAppointment);
        setPatientActiveSlip(slip);
      }

      await updateAppointmentApi(referralModalApp.id, updatedAppointment);

      alert(
        isUrdu
          ? `مریض ${referralModalApp.patientName} کو کامیابی سے ${targetDoc.nameUrdu} کو ریفر کر دیا گیا ہے اور بل خودکار اپ ڈیٹ ہو گیا ہے۔`
          : `Patient referred successfully to ${targetDoc.nameEnglish}. Invoice updated automatically.`
      );

      setReferralModalApp(null);
    } catch (err) {
      alert('Error processing patient referral.');
    } finally {
      setIsProcessingReferral(false);
    }
  };

  // Patient Reports for Doctor Review
  const [patientReports, setPatientReports] = useState<any[]>([
    {
      _id: 'rep-1',
      patientName: 'محمد فاروق (MRN-84920)',
      testNameUrdu: 'بائیو کوانٹم باڈی اسکین رپورٹ',
      testNameEnglish: 'Bio Quantum Body Scan Report',
      fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      summary: 'مریض کو کمر میں درد اور پٹھوں کا کھنچاؤ محسوس ہو رہا ہے۔',
      status: 'Under Review',
      doctorComment: '',
      date: '2026-08-04',
    },
    {
      _id: 'rep-2',
      patientName: 'عائشہ بی بی (MRN-91203)',
      testNameUrdu: 'کمپیوٹرائزڈ آئی اسکین و نذر رپورٹ',
      testNameEnglish: 'Computerized Eye Vision Scan',
      fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      summary: 'نذر کی کمزوری اور آنکھوں کی تھکاوٹ کا معائنہ۔',
      status: 'Under Review',
      doctorComment: '',
      date: '2026-08-10',
    },
  ]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [doctorAdvice, setDoctorAdvice] = useState('');

  useEffect(() => {
    if (isDoctorAuth) {
      getReportsApi(undefined, currentDoctor?.id)
        .then((res) => {
          if (res.success && res.reports && res.reports.length > 0) {
            setPatientReports(res.reports);
          }
        })
        .catch(() => {});
    }
  }, [isDoctorAuth, currentDoctor]);

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await loginApi(username, password, 'doctor');
      if (res.success) {
        let docUser = res.user;
        const uLower = (username || '').toLowerCase();
        if (
          uLower === 'doctor2' ||
          uLower === 'drwaqas' ||
          docUser.id === 'doc-2' ||
          docUser.email?.includes('waqas') ||
          docUser.name?.toLowerCase().includes('waqas') ||
          docUser.name?.includes('وقاص')
        ) {
          docUser = {
            ...docUser,
            id: 'doc-2',
            name: docUser.name || (isUrdu ? 'ڈاکٹر وقاص صغیر چوہدری' : 'Dr. Waqas Sagheer'),
          };
        } else {
          docUser = {
            ...docUser,
            id: 'doc-1',
            name: docUser.name || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
          };
        }
        setCurrentDoctor(docUser);
        setIsDoctorAuth(true);
      } else {
        setAuthError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setAuthError('Connection error to database server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRx = () => {
    if (!prescriptionText && !rxNotes) {
      alert(isUrdu ? 'برائے مہربانی ادویات یا ہدایات تحریر کریں۔' : 'Please enter medicine or instruction text.');
      return;
    }
    const docName = currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
    const newRx = {
      id: `Rx-${Date.now()}`,
      patientName: selectedApp?.patientName || 'General OPD Patient',
      date: new Date().toLocaleDateString(),
      content: `${prescriptionText}\n\n${rxNotes ? `ملاحظات: ${rxNotes}\n` : ''}${rxPrecautions ? `پرہیز: ${rxPrecautions}` : ''}`,
      prescriptionText,
      rxNotes,
      rxPrecautions,
      doctorName: docName,
    };
    setSavedPrescriptions([newRx, ...savedPrescriptions]);
    if (selectedApp) {
      handleUpdateStatus(selectedApp.id || (selectedApp as any)._id, 'Completed');
    }
    setSelectedRxForPrint(newRx);
    setPrescriptionText('');
    setRxNotes('');
    setRxPrecautions('');
  };

  // 1-Click Push Prescribed Medicines to Pharmacy Billing Queue
  const handlePushRxToBilling = async () => {
    if (!selectedApp) {
      alert(isUrdu ? 'برائے مہربانی او پی ڈی قطار سے پہلے مریض منتخب کریں۔' : 'Please select an active patient first.');
      return;
    }
    if (!prescriptionText.trim()) {
      alert(isUrdu ? 'برائے مہربانی پہلے تجویز کردہ ادویات تحریر کریں۔' : 'Please enter prescribed medicines first.');
      return;
    }

    try {
      setIsAddingItem(true);
      const lines = prescriptionText
        .split('\n')
        .map((l) => l.replace(/^[\d.-]+\s*/, '').trim())
        .filter((l) => l.length > 2);

      const docName = currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
      const identifier = selectedApp.tokenNumber ? String(selectedApp.tokenNumber) : (selectedApp.phone || selectedApp.id);

      let updated = patientActiveSlip;
      if (lines.length === 0) {
        // Add single prescription bundle
        updated = await addItemToPatientInvoice(
          identifier,
          selectedApp.patientName,
          docName,
          {
            description: `تجویز کردہ ادویات کورس (${selectedApp.problem || 'او پی ڈی'})`,
            category: 'Medicine',
            quantity: 1,
            unitPrice: 1500,
            department: 'Pharmacy & Medicines',
            servedBy: docName,
          }
        );
      } else {
        for (const line of lines) {
          const cleanDesc = line.split('—')[0].split('-')[0].trim();
          updated = await addItemToPatientInvoice(
            identifier,
            selectedApp.patientName,
            docName,
            {
              description: cleanDesc,
              category: 'Medicine',
              quantity: 1,
              unitPrice: 850,
              department: 'Pharmacy & Medicines',
              servedBy: docName,
            }
          );
        }
      }

      setPatientActiveSlip(updated);
      alert(
        isUrdu
          ? `✅ نسخہ کی ادویات کامیابی سے مریض ${selectedApp.patientName} کی انوائس میں شامل کر دی گئیں اور فارمیسی کاؤنٹر پر بھیج دی گئیں۔`
          : `Rx medicines pushed to active invoice (${updated.slipNo}) and pharmacy queue.`
      );
    } catch (e) {
      alert('Error pushing medicines to invoice.');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Send Direct WhatsApp Prescription & Advice to Patient
  const handleSendWhatsAppRx = () => {
    if (!selectedApp) return;
    const docName = currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
    const fullAdvisory = `${prescriptionText ? `💊 ادویات:\n${prescriptionText}\n\n` : ''}${rxNotes ? `📝 طبی ہدایات: ${rxNotes}\n` : ''}${rxPrecautions ? `⚠️ پرہیز: ${rxPrecautions}` : ''}`;

    openWhatsAppNotification({
      type: 'rx_advisory',
      recipientPhone: selectedApp.phone,
      recipientName: selectedApp.patientName,
      doctorName: docName,
      problemOrNotes: fullAdvisory || 'تمام ادویات وقت پر لیں اور پرہیز کا خیال رکھیں۔',
    }, isUrdu ? 'urdu' : 'english');
  };

  const handleReviewReport = async (repId: string) => {
    if (!doctorAdvice) return;
    try {
      await updateReportApi(repId, { status: 'Reviewed', doctorComment: doctorAdvice });
      setPatientReports(patientReports.map((r) => (r._id === repId ? { ...r, status: 'Reviewed', doctorComment: doctorAdvice } : r)));
      alert(isUrdu ? 'رپورٹ کا جائزہ اور طبی تبصرہ محفوظ کر لیا گیا ہے۔' : 'Report review & advice saved.');
      setDoctorAdvice('');
      setActiveReport(null);
    } catch (e) {
      alert('Error updating report.');
    }
  };

  // Get active doctor object with fallback image
  const activeDoctorObj = (doctors && doctors.length > 0)
    ? (doctors.find((d) => d.id === currentDoctor?.id || d.nameEnglish?.toLowerCase().includes('zeeshan')) || doctors[0])
    : null;

  const doctorImage = currentDoctor?.image || activeDoctorObj?.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600';
  const doctorName = currentDoctor?.fullName || (isUrdu ? (activeDoctorObj?.nameUrdu || 'ڈاکٹر زیشان چوہدری') : (activeDoctorObj?.nameEnglish || 'Dr. Zeeshan Chaudhry'));
  const doctorTitle = activeDoctorObj?.titleEnglish || 'MBBS, FCPS, Senior Herbal Practitioner';

  // Queue Filters
  const filteredQueue = appointmentsList.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (app.patientName || '').toLowerCase().includes(q) ||
      (app.phone || '').includes(q) ||
      (app.problem || '').toLowerCase().includes(q) ||
      (app.tokenNumber || '').toLowerCase().includes(q) ||
      (app.referralToken || '').toLowerCase().includes(q) ||
      (app.referralService || '').toLowerCase().includes(q) ||
      (app.id || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'Referred') {
      return app.referralStatus === 'Referred' || !!app.referralToken;
    }
    return app.status === statusFilter;
  });

  // Stats calculation
  const totalOPDCount = appointmentsList.length;
  const pendingCount = appointmentsList.filter((a) => a.status === 'Pending').length;
  const approvedCount = appointmentsList.filter((a) => a.status === 'Approved').length;
  const completedCount = appointmentsList.filter((a) => a.status === 'Completed').length;

  // LOGIN SCREEN FOR DOCTOR
  if (!isDoctorAuth) {
    return (
      <div className="py-12 bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center px-4 font-sans">
        <div className="bg-slate-800 border border-slate-700 p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3 relative z-10">
            <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-emerald-400 shadow-xl ring-4 ring-emerald-500/20">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-[11px] px-3 py-1 rounded-full font-bold">
              OFFICIAL MEDICAL EMR WORKSPACE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isUrdu ? 'معالج ڈیجیٹل ڈیک پورٹل' : 'Official Doctor Portal'}
            </h2>
            <p className="text-xs text-emerald-300 font-bold">
              {doctorName} ({doctorTitle})
            </p>
          </div>

          <form onSubmit={handleDoctorLogin} className="space-y-4 text-xs relative z-10">
            {authError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl font-bold text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                {isUrdu ? 'معالج یوزر نیم / آئی ڈی' : 'Doctor Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600"
                placeholder="doctor1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                {isUrdu ? 'محفوظ پاس ورڈ' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? isUrdu
                    ? 'تصدیق جاری ہے...'
                    : 'Authenticating...'
                  : isUrdu
                  ? 'پورٹل میں داخل ہوں (Login)'
                  : 'Enter Official Workspace'}
              </span>
            </button>

            {/* Demo Quick Auto-Fill */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setUsername('doctor1');
                  setPassword('doc123');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono"
              >
                {isUrdu ? 'ڈیمو لاگ ان ڈیٹا سیٹ کریں (doctor1 / doc123)' : 'Set Demo Credentials (doctor1 / doc123)'}
              </button>
            </div>
          </form>

          {/* Security Banner */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-center gap-2 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isUrdu
                ? 'حافظ کلینک کے مستند میڈیکل آفیسرز کے لیے اینکرپٹڈ پورٹل'
                : 'HIPAA compliant encrypted workspace for verified medical officers'}
            </span>
          </div>

          {setActiveView && (
            <div className="text-center pt-2">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-slate-400 hover:text-white underline font-semibold transition-colors"
              >
                ← {isUrdu ? 'عوام کے لیے ویب سائٹ پر واپس جائیں' : 'Back to Public Website'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN DEDICATED DOCTOR PORTAL WORKSPACE
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* 1. OFFICIAL TOP APP BAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Doctor Info */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0 shadow-md">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                  {isUrdu ? 'حافظ کلینک — آفیشل ڈاکٹر پورٹل' : 'Hafiz Clinic — Doctor EMR Workspace'}
                </h1>
                <span className="hidden md:inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">
                  v2.4 Official EMR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">
                  {doctorName}
                </span>
                <span className="hidden sm:inline text-slate-500">•</span>
                <span className="hidden sm:inline text-slate-400">{isUrdu ? 'سینئر ہیلتھ آفیسر' : 'Senior Medical Officer'}</span>
              </p>
            </div>
          </div>

          {/* Right Control Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* OPD Online Status Toggle */}
            <button
              onClick={() => setIsOPDActive(!isOPDActive)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                isOPDActive
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOPDActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
              <span className="hidden xs:inline">
                {isOPDActive
                  ? isUrdu
                    ? 'مطب فعال (Online)'
                    : 'OPD Active'
                  : isUrdu
                  ? 'غیر فعال (Offline)'
                  : 'OPD Paused'}
              </span>
            </button>

            {/* Language Toggle */}
            {setLanguage && (
              <button
                onClick={() => setLanguage(isUrdu ? 'english' : 'urdu')}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isUrdu ? 'English' : 'اردو'}</span>
              </button>
            )}

            {/* Switch to Public Site */}
            {setActiveView && (
              <button
                onClick={() => setActiveView('home')}
                className="hidden lg:flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'پبلک ویب سائٹ' : 'Public Site'}</span>
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={() => setIsDoctorAuth(false)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUrdu ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. DEDICATED PAGE NAVIGATION BAR (DESKTOP & MOBILE RESPONSIVE TABS) */}
      <nav className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 py-2">
            {/* Page 1: Dashboard */}
            <button
              onClick={() => setDocPage('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                docPage === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'ڈیش بورڈ (Overview)' : 'Dashboard'}</span>
            </button>

            {/* Page 2: OPD Queue & Digital Rx */}
            <button
              onClick={() => setDocPage('queue')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all relative ${
                docPage === 'queue'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'او پی ڈی کیو و نسخہ جات' : 'OPD Queue & Rx'}</span>
              {pendingCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Page 3: Live Patient Chat */}
            <button
              onClick={() => setDocPage('chat')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                docPage === 'chat'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'مریضوں سے لائیو چاٹ' : 'Live Patient Consultation'}</span>
            </button>

            {/* Page 4: Lab Reports Review */}
            <button
              onClick={() => setDocPage('reports')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all relative ${
                docPage === 'reports'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'لیبارٹری رپورٹس' : 'Lab Reports Review'}</span>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {patientReports.filter((r) => r.status !== 'Reviewed').length}
              </span>
            </button>

            {/* Page 5: Doctor Timings & Profile */}
            <button
              onClick={() => setDocPage('schedule')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                docPage === 'schedule'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'وقت مطب و پروفائل' : 'Clinic Schedule & Fee'}</span>
            </button>

            {/* Page 6: Practice Analytics */}
            <button
              onClick={() => setDocPage('analytics')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                docPage === 'analytics'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{isUrdu ? 'آمدن و شماریات' : 'Analytics & Earnings'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA BY SELECTED DEDICATED PAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* ==================== PAGE 1: DASHBOARD OVERVIEW ==================== */}
        {docPage === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="space-y-1 z-10">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  {isUrdu ? 'طبی معالجین کا آفیشل پینل' : 'Official Doctor EMR Workspace'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {isUrdu ? 'خوش آمدید، ڈاکٹر صاحب!' : 'Welcome Back, Doctor!'}
                </h2>
                <p className="text-xs text-emerald-100 max-w-xl">
                  {isUrdu
                    ? 'آج کی او پی ڈی کیو، الیکٹرانک نسخہ جات، مریضوں کے لائیو میسجز اور لیبارٹری رپورٹس کا معائنہ یہاں سے کریں۔'
                    : 'Manage today’s outpatient queue, write electronic prescriptions, communicate live with patients, and review diagnostic scans.'}
                </p>
              </div>

              <div className="flex gap-2.5 z-10 w-full sm:w-auto">
                <button
                  onClick={() => setDocPage('queue')}
                  className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>{isUrdu ? 'او پی ڈی کیو شروع کریں' : 'Start OPD Queue'}</span>
                </button>
                <button
                  onClick={() => setDocPage('chat')}
                  className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-500 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isUrdu ? 'لائیو چاٹ' : 'Live Chat'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isUrdu ? 'آج کل او پی ڈی' : 'Total OPD Today'}</span>
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{totalOPDCount}</div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'فعال کیو لسٹ' : 'Active Patient Appointments'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isUrdu ? 'منتظر مریض (Pending)' : 'Pending Queue'}</span>
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</div>
                <div className="text-[11px] text-amber-600 font-semibold">
                  {isUrdu ? 'منظوری و معاینے کے منتظر' : 'Awaiting Review'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isUrdu ? 'معائنہ مکمل (Completed)' : 'Completed OPD'}</span>
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{completedCount}</div>
                <div className="text-[11px] text-blue-600 font-semibold">
                  {isUrdu ? 'نسخہ جات جاری شدہ' : 'Prescriptions Delivered'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isUrdu ? 'زیر جائزہ رپورٹس' : 'Pending Lab Reports'}</span>
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {patientReports.filter((r) => r.status !== 'Reviewed').length}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold">
                  {isUrdu ? 'طبی مشورہ کے لیے موصولہ' : 'Awaiting Doctor Review'}
                </div>
              </div>
            </div>

            {/* Recent Patients Table & Quick Prescription Shortcut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'آج کے مریضوں کی فہرست' : 'Today’s Patient Queue'}</span>
                  </h3>
                  <button
                    onClick={() => setDocPage('queue')}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                  >
                    <span>{isUrdu ? 'تمام کیو دیکھیں' : 'View Full Queue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {appointmentsList.slice(0, 5).map((app, idx) => (
                    <div
                      key={app.id || idx}
                      className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{app.patientName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({app.phone})</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {app.problem} | {app.city} | <strong>{app.timeSlot}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : app.status === 'Completed'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setDocPage('queue');
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1 rounded-xl shadow-xs"
                        >
                          {isUrdu ? 'معائنہ کریں' : 'Examine'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Quick Actions & System Info */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{isUrdu ? 'معالج کوئیک ایکشنز' : 'Doctor Quick Access'}</h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu
                      ? 'پورٹل کے تمام فیچرز بائیں نیویگیشن بار کے ذریعے یا نیچے دیے گئے بٹنوں سے ڈائریکٹ استعمال کر سکتے ہیں۔'
                      : 'Access patient records, teleconsultation tools, and EMR features directly.'}
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setDocPage('queue')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FilePlus className="w-4 h-4 text-amber-300" />
                        <span>{isUrdu ? 'نیا ڈیجیٹل نسخہ تیار کریں' : 'Create Electronic Rx'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDocPage('chat')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-2xl text-xs flex items-center justify-between border border-slate-700 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>{isUrdu ? 'مریض سے رابطہ و وائس کال' : 'Patient Video / Voice Call'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDocPage('reports')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-2xl text-xs flex items-center justify-between border border-slate-700 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>{isUrdu ? 'موصلہ میڈیکل رپورٹس' : 'Review Diagnostic Reports'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isUrdu
                      ? 'حافظ کلینک ڈجیٹل ہیلتھ نیٹ ورک پر تمام ڈیٹا اینکرپٹڈ اور محفوظ ہے۔'
                      : 'All medical records are synchronized and end-to-end encrypted.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE 2: OPD QUEUE & PRESCRIPTION WRITER ==================== */}
        {docPage === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Queue Filter & List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-3 border-b border-slate-200 pb-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'او پی ڈی مریضوں کی فہرست' : 'Patient OPD Queue'}</span>
                  </h3>
                  <span className="bg-emerald-700 text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {filteredQueue.length}
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isUrdu ? 'مریض کا نام، فون، ٹوکن یا ریفرل ٹوکن تلاش کریں...' : 'Search by name, phone, Token #, or Referral Token...'}
                    className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {(['all', 'Pending', 'Approved', 'Referred', 'Completed', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all ${
                        statusFilter === st
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all'
                        ? isUrdu
                          ? 'تمام'
                          : 'All'
                        : st === 'Pending'
                        ? isUrdu
                          ? 'منتظر'
                          : 'Pending'
                        : st === 'Approved'
                        ? isUrdu
                          ? 'منظور'
                          : 'Approved'
                        : st === 'Referred'
                        ? isUrdu
                          ? '🔄 ریفرڈ'
                          : '🔄 Referred'
                        : st === 'Completed'
                        ? isUrdu
                          ? 'مکمل'
                          : 'Completed'
                        : isUrdu
                        ? 'مسترد'
                        : 'Cancelled'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue Items */}
              <div className="space-y-2.5 text-xs max-h-[600px] overflow-y-auto pr-1">
                {filteredQueue.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-medium">
                    {isUrdu ? 'کوئی مریض نہیں ملا۔' : 'No patients match your search.'}
                  </div>
                ) : (
                  filteredQueue.map((app, idx) => {
                    const itemKey = app.id || (app as any)._id || `app-${idx}`;
                    const isSelected = selectedApp?.id === app.id || (selectedApp && (selectedApp as any)._id === (app as any)._id);
                    const tokenNum = app.tokenNumber || (app as any).token || (app.id && app.id.startsWith('APP-') ? app.id.replace('APP-', 'TK-') : `TK-${idx + 101}`);

                    return (
                      <div
                        key={itemKey}
                        onClick={() => setSelectedApp(app)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-md ring-2 ring-emerald-400/40'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 gap-2">
                          <div className="truncate">
                            <span className="text-sm block truncate">{app.patientName}</span>
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded text-[10px] font-mono inline-block font-bold">
                              🎫 {tokenNum}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 font-bold ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : app.status === 'Completed'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : app.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        {app.referralToken && (
                          <div className="bg-amber-100/90 border border-amber-300 text-amber-950 p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between">
                            <span>🔄 {isUrdu ? 'ریفرل ٹوکن:' : 'Ref Token:'} {app.referralToken}</span>
                            <span className="text-amber-800 font-medium truncate max-w-[120px]">{app.referralService || app.doctorName}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div>
                            <strong>{isUrdu ? 'وقت / سلاٹ:' : 'Time:'}</strong> {app.date || 'Today'} ({app.timeSlot})
                          </div>
                          <div>
                            <strong>{isUrdu ? 'عارضہ:' : 'Condition:'}</strong> {app.problem} | {app.city}
                          </div>
                          <div>
                            <strong>{isUrdu ? 'فون:' : 'Phone:'}</strong> {app.phone}
                          </div>
                        </div>

                        {/* Quick Status Handler */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id || (app as any)._id, 'Approved')}
                            className={`flex-1 min-w-[70px] py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                              app.status === 'Approved'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isUrdu ? 'منظور' : 'Approve'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReferralModalApp(app)}
                            className="py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-900 border border-amber-300 transition-all cursor-pointer"
                            title={isUrdu ? 'دیگر معالج کو ریفر کریں' : 'Refer Patient to Another Doctor'}
                          >
                            <Share2 className="w-3 h-3" />
                            <span>{isUrdu ? 'ریفر' : 'Refer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id || (app as any)._id, 'Completed')}
                            className={`flex-1 min-w-[70px] py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                              app.status === 'Completed'
                                ? 'bg-blue-700 text-white shadow-xs'
                                : 'bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-900 border border-blue-300'
                            }`}
                          >
                            <span>{isUrdu ? 'مکمل' : 'Complete'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id || (app as any)._id, 'Cancelled')}
                            className={`py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                              app.status === 'Cancelled'
                                ? 'bg-rose-700 text-white shadow-xs'
                                : 'bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-900 border border-rose-300'
                            }`}
                          >
                            <span>{isUrdu ? 'مسترد' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Col: Electronic Prescription Writer & Live Billing Workspace */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'الیکٹرانک نسخہ و مریض بلنگ (EMR & Live Billing)' : 'Electronic Rx & Billing Workspace'}</span>
                </h3>
                {selectedApp && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReferralModalApp(selectedApp)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isUrdu ? 'دیگر ڈاکٹر کو ریفر کریں' : 'Refer to Doctor'}</span>
                    </button>
                    <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300 font-bold">
                      {isUrdu ? 'مریض:' : 'Patient:'} {selectedApp.patientName}
                    </span>
                  </div>
                )}
              </div>

              {selectedApp ? (
                <div className="space-y-5 text-xs font-semibold">
                  {/* Patient Profile Header Card */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">{isUrdu ? 'مریض کا نام و ٹوکن' : 'Patient Name & Token'}</span>
                        <strong className="text-slate-900 text-sm block">{selectedApp.patientName}</strong>
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono inline-block mt-0.5 font-bold">
                          🎫 {selectedApp.tokenNumber || (selectedApp.id && selectedApp.id.startsWith('APP-') ? selectedApp.id.replace('APP-', 'TK-') : 'TK-101')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">{isUrdu ? 'شہر / فون' : 'City / Phone'}</span>
                        <strong className="text-slate-900">{selectedApp.city || 'Lahore'} | {selectedApp.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">{isUrdu ? 'موقع و تاریخ' : 'Slot Date'}</span>
                        <strong className="text-slate-900">{selectedApp.date || 'Today'} ({selectedApp.timeSlot})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">{isUrdu ? 'بیماری / معائنہ فیس' : 'Complaint / Doctor Fee'}</span>
                        <strong className="text-emerald-700 font-mono">
                          {selectedApp.problem} — Rs. {selectedApp.doctorFee || 1500}
                        </strong>
                      </div>
                    </div>

                    {selectedApp.referralToken && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex flex-wrap justify-between items-center gap-2 text-amber-950">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold block text-xs">
                              {isUrdu ? 'ریفرل ٹوکن:' : 'Official Referral Token:'}{' '}
                              <strong className="font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded ml-1">
                                {selectedApp.referralToken}
                              </strong>
                            </span>
                            <span className="text-[11px] text-amber-800">
                              {isUrdu ? 'ریفر کردہ معالج / سروس:' : 'Referred to / Service:'}{' '}
                              <strong>{selectedApp.referralService || selectedApp.doctorName}</strong>
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] bg-amber-200/80 px-2.5 py-1 rounded-xl font-bold">
                          {isUrdu ? 'ریفرل فیس انوائس میں شامل ہے' : 'Referral fee linked to invoice'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ================= LIVE PATIENT INVOICE & BILLING SECTION ================= */}
                  <div className="bg-emerald-950/5 border border-emerald-300/80 rounded-2xl p-4 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-emerald-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-700" />
                        <div>
                          <span className="font-black text-emerald-950 text-sm block">
                            {isUrdu ? 'مریض کی خودکار انوائس و اشیاء کا بل (Active Patient Invoice & Money Slip)' : 'Live Patient Invoice & Charges'}
                          </span>
                          <span className="text-[11px] text-emerald-800 font-normal">
                            {patientActiveSlip
                              ? `${isUrdu ? 'سلپ نمبر:' : 'Slip #'}: ${patientActiveSlip.slipNumber} | ${isUrdu ? 'حالت:' : 'Status'}: ${patientActiveSlip.paymentStatus}`
                              : isUrdu
                              ? 'اپائنٹمنٹ منظور ہونے پر خودکار سلپ بن جائے گی یا نیچے اشیاء شامل کریں۔'
                              : 'Automatic invoice generates on approval or add items below.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {patientActiveSlip && (
                          <button
                            type="button"
                            onClick={() => setSelectedSlipForPrint(patientActiveSlip)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'رسید / سلپ پرنٹ کریں' : 'Print Invoice'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedApp) {
                              fetchSlipsApi({ phone: selectedApp.phone, appointmentId: selectedApp.id }).then((slips) => {
                                const match = slips.find((s) => s.appointmentId === selectedApp.id || (s.patientPhone && selectedApp.phone && s.patientPhone.replace(/\D/g, '') === selectedApp.phone.replace(/\D/g, '')));
                                setPatientActiveSlip(match || null);
                              });
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 rounded-xl border border-slate-300"
                          title="Refresh Invoice"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Add Hospital Catalog Services & Charges */}
                    <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-emerald-700" />
                          <span>{isUrdu ? 'ہسپتال سروسز کیٹلاگ (1-کلک بل میں شامل کریں):' : 'Hospital Services Catalog (1-Click Add to Token Invoice):'}</span>
                        </label>
                        <div className="relative w-full sm:w-56">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            placeholder={isUrdu ? 'سروس یا ٹیسٹ تلاش کریں (X-Ray, CBC...)' : 'Search services (X-Ray, Scan, CBC...)'}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Department Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
                        {[
                          { id: 'all', label: isUrdu ? 'تمام شعبہ جات' : 'All Departments' },
                          { id: 'Radiology / X-Ray & Scans', label: isUrdu ? '📷 ریڈیالوجی و ایکسرے' : '📷 Radiology & X-Ray' },
                          { id: 'Clinical Laboratory', label: isUrdu ? '🔬 لیبارٹری ٹیسٹ' : '🔬 Clinical Lab' },
                          { id: 'Hijama & Cupping Therapy', label: isUrdu ? '🩸 حجامہ تھراپی' : '🩸 Hijama Therapy' },
                          { id: 'Physiotherapy & Spine Care', label: isUrdu ? '⚡ فزیوتھراپی' : '⚡ Physiotherapy' },
                          { id: 'Ophthalmology & Optical Care', label: isUrdu ? '👓 آئی کیئر و عینک' : '👓 Eye Care & Optical' },
                          { id: 'Pharmacy & Medicines', label: isUrdu ? '💊 فارمیسی ادویات' : '💊 Pharmacy Meds' },
                          { id: 'General OPD & Consultation', label: isUrdu ? '🩺 چیک اپ و فیس' : '🩺 OPD Consultation' },
                        ].map((dept) => (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => setCatalogDeptFilter(dept.id)}
                            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                              catalogDeptFilter === dept.id
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {dept.label}
                          </button>
                        ))}
                      </div>

                      {/* Catalog Items Grid */}
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {HOSPITAL_SERVICES_CATALOG
                          .filter((item) => {
                            const matchDept = catalogDeptFilter === 'all' || item.department === catalogDeptFilter;
                            const matchSearch =
                              !catalogSearch ||
                              item.nameEnglish.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                              item.nameUrdu.includes(catalogSearch) ||
                              item.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                              item.department.toLowerCase().includes(catalogSearch.toLowerCase());
                            return matchDept && matchSearch;
                          })
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              disabled={isAddingItem}
                              onClick={() =>
                                handleAddBillingItem({
                                  description: isUrdu ? item.nameUrdu : item.nameEnglish,
                                  category: item.category,
                                  quantity: 1,
                                  unitPrice: item.unitPrice,
                                  department: item.department,
                                  servedBy: currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
                                })
                              }
                              className="bg-slate-50 hover:bg-emerald-700 hover:text-white text-slate-800 border border-slate-200 hover:border-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
                              title={`${item.department} — Rs. ${item.unitPrice}`}
                            >
                              <span>{isUrdu ? item.nameUrdu : item.nameEnglish}</span>
                              <span className="bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                Rs. {item.unitPrice.toLocaleString()}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Custom Item Form */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">
                          {isUrdu ? 'دوا / چشمہ / سروس کی تفصیل' : 'Item / Medicine / Optical Description'}
                        </label>
                        <input
                          type="text"
                          placeholder={isUrdu ? 'مثلاً: ٹیبلٹ، چشمہ فریم، ٹیسٹ...' : 'e.g. Optical Frame, Medicine, Scan...'}
                          value={customItemDesc}
                          onChange={(e) => setCustomItemDesc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">
                          {isUrdu ? 'کیٹگری' : 'Category'}
                        </label>
                        <select
                          value={customItemCategory}
                          onChange={(e) => setCustomItemCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium"
                        >
                          <option value="Medicine">Medicine (ادویات)</option>
                          <option value="Eye Care / Glasses">Eye Care / Glasses (آنکھوں کا چشمہ)</option>
                          <option value="Physiotherapy">Physiotherapy (فزیوتھراپی)</option>
                          <option value="Lab Test / Scan">Lab Test / Scan (ٹیسٹ)</option>
                          <option value="Custom">Other Service (دیگر)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">
                            {isUrdu ? 'تعداد' : 'Qty'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={customItemQty}
                            onChange={(e) => setCustomItemQty(Number(e.target.value) || 1)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">
                            {isUrdu ? 'قیمت (Rs)' : 'Price'}
                          </label>
                          <input
                            type="number"
                            value={customItemPrice}
                            onChange={(e) => setCustomItemPrice(Number(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          disabled={!customItemDesc || isAddingItem}
                          onClick={() =>
                            handleAddBillingItem({
                              description: customItemDesc,
                              category: customItemCategory,
                              quantity: customItemQty,
                              unitPrice: customItemPrice,
                            })
                          }
                          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isUrdu ? 'بل میں ڈالیں' : 'Add Item'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Invoice Items Table & Totals */}
                    {patientActiveSlip && (
                      <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden text-xs">
                        <div className="p-2.5 bg-emerald-50/80 border-b border-emerald-200 font-bold text-emerald-950 flex justify-between items-center">
                          <span>{isUrdu ? 'انوائس کی تمام تفاصیل (Itemized Charges Breakdown):' : 'Itemized Charges in Current Invoice:'}</span>
                          <span className="font-mono text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                            {patientActiveSlip.items.length} {isUrdu ? 'اشیاء' : 'Items'}
                          </span>
                        </div>
                        <div className="overflow-x-auto max-h-48">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 text-[10px] uppercase font-bold">
                                <th className="p-2">#</th>
                                <th className="p-2">{isUrdu ? 'تفصیل' : 'Description'}</th>
                                <th className="p-2">{isUrdu ? 'کیٹگری' : 'Category'}</th>
                                <th className="p-2">{isUrdu ? 'تعداد' : 'Qty'}</th>
                                <th className="p-2">{isUrdu ? 'ریٹ' : 'Unit'}</th>
                                <th className="p-2">{isUrdu ? 'ٹوٹل' : 'Total'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {patientActiveSlip.items.map((it, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 font-medium">
                                  <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                                  <td className="p-2 font-bold text-slate-900">{it.description}</td>
                                  <td className="p-2">
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                      {it.category}
                                    </span>
                                  </td>
                                  <td className="p-2 font-mono">{it.quantity}</td>
                                  <td className="p-2 font-mono">Rs. {(it.unitPrice ?? 0).toLocaleString()}</td>
                                  <td className="p-2 font-mono font-bold text-emerald-700">Rs. {(it.totalPrice ?? (it as any).total ?? ((it.unitPrice || 0) * (it.quantity || 1))).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals Bar */}
                        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs font-mono font-bold">
                          <div className="text-slate-600">
                            {isUrdu ? 'سب ٹوٹل:' : 'Subtotal:'} <span className="text-slate-900">Rs. {(patientActiveSlip.subtotal ?? 0).toLocaleString()}</span>
                            {((patientActiveSlip as any).discountAmount || patientActiveSlip.discount || 0) > 0 && (
                              <span className="text-rose-600 ml-2">(-{((patientActiveSlip as any).discountAmount || patientActiveSlip.discount || 0).toLocaleString()})</span>
                            )}
                          </div>
                          <div className="text-emerald-800 text-sm">
                            {isUrdu ? 'کل رقم:' : 'Grand Total:'} <span>Rs. {(patientActiveSlip.totalAmount ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="text-teal-700">
                            {isUrdu ? 'وصول شدہ:' : 'Paid:'} <span>Rs. {(patientActiveSlip.paidAmount ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="text-amber-800">
                            {isUrdu ? 'بقایا:' : 'Balance:'} <span>Rs. {(patientActiveSlip.balanceAmount ?? 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medicines Prescription Field */}
                  <div>
                    <label className="block mb-1.5 text-slate-800 font-bold flex items-center justify-between">
                      <span>{isUrdu ? 'تجویز کردہ ادویات و خوراک (Prescribed Medicines & Dosage)' : 'Medicines & Dosage Instructions'}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{isUrdu ? 'مثال: 1+1+1 (صبح، دوپہر، شام)' : 'Format: Med Name - 1+0+1'}</span>
                    </label>
                    <textarea
                      rows={6}
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder={
                        isUrdu
                          ? '1. Tab Paracetamol 500mg — 1+1+1 (کھانے کے بعد)\n2. Hoorab Hair Oil — رات کو سر میں ہلکا مساج کریں\n3. Syp B-Complex — 2 چمچ روزانہ صبح\n4. Physio Laser Session — 3 دن مسلسل'
                          : '1. Tab Paracetamol 500mg — 1+1+1 (After Meals)\n2. Hoorab Hair Oil — Night Massage Daily\n3. Syrup B-Complex — 2 tsp morning\n4. Physio Therapy Session — 3 days'
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  {/* Notes & Precautions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'طبی مشورہ و ہدایات' : 'Doctor Notes / Advice'}</label>
                      <input
                        type="text"
                        value={rxNotes}
                        onChange={(e) => setRxNotes(e.target.value)}
                        placeholder={isUrdu ? 'پانی کا زیادہ استعمال کریں، 1 ہفتہ بعد دوبارہ معائنہ...' : 'Drink plenty of fluids, follow up in 1 week...'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'پرہیز (Precautions)' : 'Precautions / Avoid'}</label>
                      <input
                        type="text"
                        value={rxPrecautions}
                        onChange={(e) => setRxPrecautions(e.target.value)}
                        placeholder={isUrdu ? 'ٹھنڈے پانی، چاول اور تلی ہوئی چیزوں سے پرہیز کریں۔' : 'Avoid cold drinks, rice, and oily food.'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Actions & Automation Hub */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handleSaveRx}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{isUrdu ? 'نسخہ محفوظ و پرنٹ کریں' : 'Save & Print Rx'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePushRxToBilling}
                        disabled={isAddingItem}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                        title="Directly add prescribed medicines to patient billing slip & notify pharmacy POS"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isUrdu ? '🚀 1-کلک بلنگ و فارمیسی بھیجیں' : 'Push Rx to Pharmacy Billing'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendWhatsAppRx}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isUrdu ? 'واٹس ایپ پر نسخہ بھیجیں' : 'Send Rx to WhatsApp'}</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setDocPage('chat')}
                        className="text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1 underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isUrdu ? 'مریض سے ویڈیو و چیٹ مشاورت شروع کریں' : 'Start Video / Chat Consultation'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Saved Rx Log */}
                  {savedPrescriptions.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs">{isUrdu ? 'جاری کردہ الیکٹرانک نسخہ جات کا لاگ:' : 'Saved Prescription Log:'}</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {savedPrescriptions.map((rx) => (
                          <div key={rx.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-[11px] space-y-2">
                            <div className="flex justify-between items-center font-mono">
                              <span className="font-bold text-emerald-800">{rx.patientName} — {rx.date}</span>
                              <button
                                onClick={() => setSelectedRxForPrint(rx)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Printer className="w-3 h-3" />
                                <span>{isUrdu ? 'پرنٹ کریں' : 'Print Slip'}</span>
                              </button>
                            </div>
                            <div className="whitespace-pre-wrap font-mono text-[10px] text-slate-700">{rx.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <Clock className="w-10 h-10 mx-auto text-slate-300" />
                  <div>{isUrdu ? 'برائے مہربانی بائیں جانب فہرست سے کسی مریض کو منتخب کریں۔' : 'Please select a patient from the OPD queue on the left to issue Rx.'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PAGE 3: LIVE PATIENT CONSULTATION CHAT ==================== */}
        {docPage === 'chat' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[680px]">
            <DoctorPatientChatView
              currentUser={{
                role: 'doctor',
                id: currentDoctor?.id || 'doc-1',
                name: currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
              }}
              doctors={doctors}
              language={language}
            />
          </div>
        )}

        {/* ==================== PAGE 4: LAB REPORTS REVIEW ==================== */}
        {docPage === 'reports' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'مریضوں کی موصول شدہ لیبارٹری و بائیو اسکین رپورٹس' : 'Received Patient Lab & Diagnostic Reports'}</span>
              </h3>
              <span className="bg-emerald-100 text-emerald-900 text-xs px-3 py-1 rounded-full font-bold">
                {patientReports.length} Total Received
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {patientReports.map((rep, idx) => (
                <div key={rep._id || idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{rep.patientName}</div>
                      <div className="text-emerald-700 font-bold text-xs">{isUrdu ? rep.testNameUrdu : rep.testNameEnglish}</div>
                    </div>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'Reviewed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-slate-700 font-medium">{rep.summary}</p>

                  {rep.fileUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner max-h-52">
                      <img src={rep.fileUrl} alt="Report preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {rep.doctorComment && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
                      <strong>{isUrdu ? 'ڈاکٹر کا طبی مشورہ:' : 'Doctor Advice:'}</strong> {rep.doctorComment}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder={isUrdu ? 'مریض کے لیے طبی ہدایت یا نسخہ یہاں تحریر کریں...' : 'Write official doctor advice for patient...'}
                      value={activeReport === rep._id ? doctorAdvice : ''}
                      onChange={(e) => {
                        setActiveReport(rep._id);
                        setDoctorAdvice(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleReviewReport(rep._id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{isUrdu ? 'طبی مشورہ محفوظ کریں و مریض کو بھیجیں' : 'Submit Review & Notify Patient'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAGE 5: CLINIC SCHEDULE & DOCTOR PROFILE ==================== */}
        {docPage === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 col-span-1">
              <div className="text-center space-y-2">
                <div className="relative w-28 h-28 rounded-full overflow-hidden mx-auto border-4 border-emerald-400 shadow-lg ring-4 ring-emerald-100">
                  <img
                    src={doctorImage}
                    alt={doctorName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h3 className="font-black text-slate-900 text-lg">
                  {doctorName}
                </h3>
                <p className="text-xs text-emerald-700 font-bold">{doctorTitle}</p>
                <div className="inline-block bg-slate-100 text-slate-700 font-mono text-[11px] px-3 py-1 rounded-full">
                  PMC Reg # 48201-P
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'شعبہ:' : 'Specialization:'}</span>
                  <strong className="text-slate-900">{isUrdu ? 'ہربل ہیلتھ و او پی ڈی' : 'Herbal & General OPD'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'معائنہ فیس:' : 'Consultation Fee:'}</span>
                  <strong className="text-emerald-700 font-bold">Rs. 1,000 / Session</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'آن لائن ریٹنگ:' : 'Rating:'}</span>
                  <strong className="text-amber-500 font-bold">4.9 ★ (340+ Verified Patients)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 md:col-span-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-3">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'مطب کے اوقات کار و دستیابی کا شیڈول' : 'OPD Timings & Weekly Schedule'}</span>
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { dayUrdu: 'پیر تا جمعرات', dayEng: 'Monday to Thursday', time: '09:00 AM — 08:00 PM', status: 'Active' },
                  { dayUrdu: 'جمعہ مبارک', dayEng: 'Friday', time: '09:00 AM — 01:00 PM / 03:00 PM — 08:00 PM', status: 'Active' },
                  { dayUrdu: 'ہفتہ', dayEng: 'Saturday', time: '10:00 AM — 06:00 PM', status: 'Active' },
                  { dayUrdu: 'اتوار', dayEng: 'Sunday', time: 'Special Tele-Consultation Only', status: 'Online Only' },
                ].map((s, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{isUrdu ? s.dayUrdu : s.dayEng}</div>
                      <div className="text-slate-600 text-xs">{s.time}</div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-3 py-1 rounded-full border border-emerald-300">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE 6: PRACTICE ANALYTICS & EARNINGS ==================== */}
        {docPage === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold">{isUrdu ? 'ماہانہ کل او پی ڈی' : 'Monthly OPD Patients'}</span>
                <div className="text-3xl font-black text-emerald-800 font-mono">184 Patients</div>
                <div className="text-[11px] text-emerald-600 font-semibold">+18% vs last month</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold">{isUrdu ? 'الیکٹرانک نسخہ جات کا لاگ' : 'Issued Prescriptions'}</span>
                <div className="text-3xl font-black text-blue-800 font-mono">162 Prescriptions</div>
                <div className="text-[11px] text-blue-600 font-semibold">Digital PDF & SMS Delivery</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold">{isUrdu ? 'آن لائن لائیو مشاورت' : 'Live Online Consults'}</span>
                <div className="text-3xl font-black text-purple-800 font-mono">92 Sessions</div>
                <div className="text-[11px] text-purple-600 font-semibold">Video / Audio Telemedicine</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
                {isUrdu ? 'حالیہ معائنہ ریکارڈ کی سرگرمی' : 'Recent Medical Session Logs'}
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { patient: 'محمد فاروق', time: '10:30 AM', type: 'OPD Physical Checkup', status: 'Prescription Saved' },
                  { patient: 'عائشہ بی بی', time: '11:15 AM', type: 'Computerized Eye Scan', status: 'Report Reviewed' },
                  { patient: 'کامران علی', time: '12:00 PM', type: 'Online Voice Consultation', status: 'Call Completed' },
                ].map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-slate-800">
                    <div>
                      <strong className="text-slate-900">{log.patient}</strong> — <span className="text-slate-600">{log.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{log.time}</span>
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: DOCTOR PATIENT REFERRAL ================= */}
      {referralModalApp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-slate-900 border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isUrdu ? 'مریض کو دیگر معالج کو ریفر کریں' : 'Refer Patient to Another Doctor'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {referralModalApp.patientName} ({referralModalApp.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReferralModalApp(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteReferral} className="space-y-4 font-semibold">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                ℹ️ {isUrdu
                  ? 'مریض کو دوبارہ نئی اپائنٹمنٹ لینے کی ضرورت نہیں ہوگی۔ وہ براہ راست منتخب معالج کے او پی ڈی رجسٹر میں شامل ہو جائے گا اور انوائس خودکار اپ ڈیٹ ہو جائے گی۔'
                  : 'The patient will not need to book a new appointment. They will automatically be queued for the referred doctor with fees synced.'}
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  {isUrdu ? 'جس معالج / سپیشلسٹ کو ریفر کرنا ہے:' : 'Select Target Doctor:'}
                </label>
                <select
                  value={referralTargetDocId}
                  onChange={(e) => setReferralTargetDocId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {isUrdu ? doc.nameUrdu : doc.nameEnglish} — {isUrdu ? doc.specializationUrdu : doc.specializationEnglish} (معائنہ فیس: Rs. {doc.checkupFee || 1500})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  {isUrdu ? 'ریفرل کی وجہ / درکار معائنہ:' : 'Referral Reason / Required Treatment:'}
                </label>
                <input
                  type="text"
                  required
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: کمپیوٹرائزڈ آنکھوں کا معائنہ و عینک کی تیاری' : 'e.g. Computerized Eye Vision Checkup & Prescription'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                {/* Quick Reason Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    isUrdu ? 'کمپیوٹرائزڈ آنکھوں کا معائنہ و عینک' : 'Optical Vision Test & Glasses',
                    isUrdu ? 'ریڑھ کی ہڈی و مہروں کی فزیو تھراپی' : 'Spine Physiotherapy & Laser',
                    isUrdu ? 'بائیو کوانٹم باڈی اسکین ٹیسٹ' : 'Bio Quantum Body Scan Test',
                    isUrdu ? 'گرتے بالوں کا علاج و پی آر پی' : 'Hair Fall & Skin Consultation',
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReferralReason(tag)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="includeReferralFee"
                  checked={includeReferralFee}
                  onChange={(e) => setIncludeReferralFee(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="includeReferralFee" className="text-slate-800 font-bold text-xs cursor-pointer">
                  {isUrdu
                    ? 'ریفرل کنسلٹیشن فیس مریض کے رننگ بل میں خودکار شامل کریں'
                    : 'Auto-add Referral Consultation Fee to Patient Invoice'}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReferralModalApp(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessingReferral}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isProcessingReferral ? 'Processing...' : isUrdu ? 'ریفرل مکمل کریں اور بل اپ ڈیٹ کریں' : 'Confirm Referral & Update Bill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINTABLE MONEY SLIP / INVOICE ================= */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="no-print flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'مریض کی رسید و کیش سلپ کا پرنٹ پریویو' : 'Patient Money Slip Print Preview'}</span>
              </h3>
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Printable Slip */}
            <div id="doc-printable-slip" className="printable-area bg-white p-6 rounded-2xl border border-slate-300 space-y-5 text-xs text-slate-900">
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-emerald-950">
                    {isUrdu ? 'حافظ کلینک اینڈ ہاسپٹل' : 'Hafiz Clinic & Medical Center'}
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    {isUrdu ? 'شعبہ او پی ڈی، چشمہ سازی و ہربل فارمیسی' : 'OPD, Optical Eye Care & Herbal Pharmacy'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC Reg # PHC-REG-84920 | ہیلپ لائن: 0300-1234567
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-emerald-900 font-mono">
                    SLIP #{selectedSlipForPrint.slipNo || (selectedSlipForPrint as any).slipNumber || 'HC-000'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold mt-0.5">
                    {isUrdu ? 'تاریخ:' : 'Date:'} {selectedSlipForPrint.date}
                  </div>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    selectedSlipForPrint.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : selectedSlipForPrint.paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {selectedSlipForPrint.paymentStatus} ({selectedSlipForPrint.paymentMethod || 'Cash'})
                  </span>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isUrdu ? 'مریض کا نام' : 'Patient Name'}</span>
                  <strong className="text-slate-900">{selectedSlipForPrint.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isUrdu ? 'موبائل نمبر' : 'Phone'}</span>
                  <strong className="text-slate-900 font-mono">{selectedSlipForPrint.patientPhone || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isUrdu ? 'متعلقہ معالج' : 'Doctor'}</span>
                  <strong className="text-emerald-800">{selectedSlipForPrint.doctorName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}</span>
                  <strong className="text-slate-900">{selectedSlipForPrint.paymentMethod || 'Cash'}</strong>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-bold">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">{isUrdu ? 'تفصیل سروس / آئٹم' : 'Item / Service Description'}</th>
                      <th className="p-2.5">{isUrdu ? 'شعبہ' : 'Category'}</th>
                      <th className="p-2.5">{isUrdu ? 'تعداد' : 'Qty'}</th>
                      <th className="p-2.5">{isUrdu ? 'ریٹ' : 'Unit Price'}</th>
                      <th className="p-2.5">{isUrdu ? 'ٹوٹل' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {(selectedSlipForPrint.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{item.description}</td>
                        <td className="p-2.5 text-slate-600">{item.category}</td>
                        <td className="p-2.5 font-mono">{item.quantity}</td>
                        <td className="p-2.5 font-mono">Rs. {(item.unitPrice ?? 0).toLocaleString()}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-800">Rs. {(item.totalPrice ?? (item as any).total ?? ((item.unitPrice || 0) * (item.quantity || 1))).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Calculation Box */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-64 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono font-bold text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{isUrdu ? 'سب ٹوٹل:' : 'Subtotal:'}</span>
                    <span>Rs. {(selectedSlipForPrint.subtotal ?? 0).toLocaleString()}</span>
                  </div>
                  {(((selectedSlipForPrint as any).discountAmount ?? selectedSlipForPrint.discount ?? 0) > 0) && (
                    <div className="flex justify-between text-rose-600">
                      <span>{isUrdu ? 'رعایت / ڈسکاؤنٹ:' : 'Discount:'}</span>
                      <span>- Rs. {(((selectedSlipForPrint as any).discountAmount ?? selectedSlipForPrint.discount ?? 0)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-1 text-sm font-black">
                    <span>{isUrdu ? 'کل واجب الادا:' : 'Grand Total:'}</span>
                    <span className="text-emerald-800">Rs. {(selectedSlipForPrint.totalAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-teal-800">
                    <span>{isUrdu ? 'وصول شدہ رقم:' : 'Paid Amount:'}</span>
                    <span>Rs. {(selectedSlipForPrint.paidAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 border-t border-slate-200 pt-1">
                    <span>{isUrdu ? 'بقایا واجب الادا:' : 'Balance Due:'}</span>
                    <span>Rs. {(selectedSlipForPrint.balanceAmount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer & Signature */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                <div className="space-y-0.5 text-[10px] text-slate-500">
                  <div>• ادویات اور عینک واپس یا تبدیل نہیں ہوں گی۔</div>
                  <div>• یہ رسید کمپیوٹر سے باضابطہ جاری کی گئی ہے۔</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="font-serif italic text-xs font-bold border-b border-slate-400 px-4 pb-1 text-slate-800">
                    Hafiz Clinic Accounts
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">{isUrdu ? 'کیشیئر / کیش انچارج' : 'Cashier / Accounts Authority'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print flex flex-wrap justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSlipForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedSlipForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadInvoicePdf(selectedSlipForPrint, 'doc-printable-slip');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Direct Download PDF Document"
              >
                {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isUrdu ? 'ڈاؤنلوڈ PDF رسید' : 'Save PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => selectedSlipForPrint && printInvoiceHtml(selectedSlipForPrint, { method: 'window' })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open dedicated print page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'نئی ونڈو میں پرنٹ' : 'Open Clean Print Tab'}</span>
              </button>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedSlipForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadInvoicePdf(selectedSlipForPrint, 'doc-printable-slip');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>{isUrdu ? 'رسید پرنٹ کریں / PDF ڈاؤن لوڈ کریں' : 'Print Slip / Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE PRESCRIPTION SLIP MODAL */}
      {selectedRxForPrint && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="no-print flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {isUrdu ? 'الیکٹرانک نسخہ کا پرنٹ پریویو (Print Preview)' : 'Electronic Prescription Print Preview'}
              </h3>
              <button
                onClick={() => setSelectedRxForPrint(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Printable Prescription Container */}
            <div id="doc-printable-rx" className="printable-area bg-white p-6 rounded-2xl border border-slate-300 space-y-6">
              {/* Prescription Header */}
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-emerald-950">
                    {isUrdu ? 'حافظ کلینک اینڈ آن لائن ہسپتال' : 'Hafiz Clinic & Medical Center'}
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    {selectedRxForPrint.doctorName || (isUrdu ? 'ڈاکٹر زیشان چوہدری (MBBS)' : 'Dr. Zeeshan Chaudhry (MBBS)')}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC Reg # PHC-REG-84920 | Tel: 0300-1234567
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">{isUrdu ? 'تاریخ:' : 'Date:'} {selectedRxForPrint.date}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Rx ID: {selectedRxForPrint.id}</div>
                  <div className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded font-bold text-[10px] inline-block mt-1">
                    ✓ Official Electronic Rx
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center font-semibold">
                <div>
                  <span className="text-slate-500">{isUrdu ? 'مریض کا نام:' : 'Patient Name:'} </span>
                  <strong className="text-slate-900">{selectedRxForPrint.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{isUrdu ? 'نوعیت معائنہ:' : 'Consultation Type:'} </span>
                  <strong className="text-emerald-800">{isUrdu ? 'او پی ڈی چیک اپ / آن لائن' : 'OPD Checkup / Online'}</strong>
                </div>
              </div>

              {/* Prescription Content (Rx Symbol & Medicines) */}
              <div className="space-y-4">
                <div className="text-3xl font-black text-emerald-900 font-serif">Rx</div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs leading-relaxed font-semibold whitespace-pre-wrap text-slate-900">
                  {selectedRxForPrint.prescriptionText || selectedRxForPrint.content}
                </div>

                {selectedRxForPrint.rxNotes && (
                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900">
                    <strong className="block mb-1 font-bold">{isUrdu ? 'طبی ملاحظات / ہدایات:' : 'Clinical Notes / Instructions:'}</strong>
                    {selectedRxForPrint.rxNotes}
                  </div>
                )}

                {selectedRxForPrint.rxPrecautions && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong className="block mb-1 font-bold">{isUrdu ? 'پرہیز:' : 'Precautions / Avoid:'}</strong>
                    {selectedRxForPrint.rxPrecautions}
                  </div>
                )}
              </div>

              {/* Footer & Doctor Signature */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    {isUrdu ? 'یہ الیکٹرانک نسخہ کمپیوٹر سے باضابطہ جاری کیا گیا ہے۔' : 'Computer-generated authenticated prescription document.'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold">Hafiz Clinic Telemedicine Portal</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-emerald-900 font-serif italic text-sm font-bold border-b border-slate-400 px-4 pb-1">
                    {selectedRxForPrint.doctorName || 'Dr. Zeeshan Chaudhry'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold">{isUrdu ? 'دستخط معالج و مہر' : 'Doctor Signature & Stamp'}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="no-print flex flex-wrap justify-end items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedRxForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
              <button
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedRxForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadPrescriptionPdf(selectedRxForPrint, 'doc-printable-rx');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save PDF file"
              >
                {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isUrdu ? 'ڈاؤنلوڈ PDF نسخہ' : 'Save PDF'}</span>
              </button>
              <button
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedRxForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadPrescriptionPdf(selectedRxForPrint, 'doc-printable-rx');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>{isUrdu ? 'نسخہ پرنٹ کریں / PDF میں محفوظ کریں' : 'Print Prescription / Save PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BAR FOR DOCTOR WORKSPACE */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>Hafiz Clinic & Vision Center — Doctor EMR Official Portal</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Encrypted Session | Logged in as: {currentDoctor?.fullName || 'Dr. Zeeshan Chaudhry'}
          </div>
        </div>
      </footer>
    </div>
  );
};
