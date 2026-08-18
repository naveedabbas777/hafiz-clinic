import React, { useState, useEffect } from 'react';
import { User, FileText, Download, Calendar, ShieldCheck, CheckCircle2, Lock, UserPlus, LogIn, ShoppingBag, MessageSquare, Upload, Save, Edit, Phone, Mail, MapPin, Loader2, Printer, X, QrCode, Receipt, DollarSign, ExternalLink } from 'lucide-react';
import { loginApi, registerApi, createReportApi, uploadDiseaseImageApi, updateUserApi, getReportsApi } from '../services/api';
import { fetchSlipsApi } from '../services/billingService';
import { printInvoiceHtml, printLabReportHtml, downloadInvoicePdf, downloadLabReportPdf, printInvoicePdf } from '../utils/printInvoice';
import { DoctorPatientChatView } from './DoctorPatientChatView';
import { Doctor, MoneySlip } from '../types';

interface PatientPortalViewProps {
  currentUser?: any;
  doctors?: Doctor[];
  appointments?: any[];
  onLoginSuccess?: (user: any) => void;
  onLogout?: () => void;
  setActiveView?: (view: string) => void;
  onOpenAppointment?: () => void;
  language?: 'urdu' | 'english';
  setLanguage?: (lang: 'urdu' | 'english') => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  currentUser,
  doctors = [],
  appointments = [],
  onLoginSuccess,
  onLogout,
  setActiveView,
  onOpenAppointment,
  language = 'urdu',
  setLanguage,
}) => {
  const isUrdu = language === 'urdu';
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [portalTab, setPortalTab] = useState<'chat' | 'appointments' | 'invoices' | 'reports' | 'profile'>('chat');

  // Auth Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Edit Inputs
  const [editName, setEditName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editCity, setEditCity] = useState(currentUser?.city || (isUrdu ? 'گوجرانوالہ' : 'Gujranwala'));
  const [editHistory, setEditHistory] = useState(currentUser?.medicalHistory || (isUrdu ? 'شوگر اور بلڈ پریشر نارمل' : 'Normal Sugar & BP'));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Report Sending Modal State
  const [reportTitle, setReportTitle] = useState(isUrdu ? 'بلڈ رپورٹ / کوانٹم اسکین' : 'Blood Report / Quantum Scan');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [selectedReportFile, setSelectedReportFile] = useState<File | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  const isLogged = !!currentUser;

  const [patientReports, setPatientReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any>(null);

  // Patient Invoices & Money Slips
  const [patientSlips, setPatientSlips] = useState<MoneySlip[]>([]);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MoneySlip | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch only this logged in patient's reports and invoices
  useEffect(() => {
    if (currentUser) {
      const pId = currentUser.id || currentUser._id;
      const pPhone = currentUser.phone || '';
      const pName = currentUser.fullName || currentUser.name || '';

      if (pId) {
        setIsLoadingReports(true);
        getReportsApi(pId)
          .then((res) => {
            if (res.success && Array.isArray(res.reports)) {
              setPatientReports(res.reports);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingReports(false));
      }

      fetchSlipsApi({ phone: pPhone, mrn: currentUser.mrn })
        .then((slips) => {
          const matched = slips.filter((s) => {
            if (pPhone && s.patientPhone && s.patientPhone.replace(/\D/g, '') === pPhone.replace(/\D/g, '')) return true;
            if (currentUser.mrn && s.mrnNumber && s.mrnNumber === currentUser.mrn) return true;
            if (pName && s.patientName && s.patientName.toLowerCase().includes(pName.toLowerCase())) return true;
            return false;
          });
          setPatientSlips(matched.length > 0 ? matched : slips.slice(0, 2));
        })
        .catch(() => {});
    } else {
      setPatientReports([]);
      setPatientSlips([]);
    }
  }, [currentUser]);

  const handleDownloadPdf = (url?: string, defaultName = 'medical_report.pdf') => {
    if (!url) {
      alert(isUrdu ? 'رپورٹ فائل کا لنک دستیابی کے عمل میں ہے۔' : 'Report file is being prepared.');
      return;
    }
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Download failed');
          return res.blob();
        })
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = defaultName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(url, '_blank');
        });
    }
  };

  const handlePatientAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeMode === 'login') {
        const res = await loginApi(username, password, 'patient');
        if (res.success && res.user) {
          if (onLoginSuccess) onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.message || 'Login failed. Invalid credentials.');
        }
      } else {
        const res = await registerApi(username, password, 'patient', fullName, phone);
        if (res.success && res.user) {
          if (onLoginSuccess) onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Server connection issue. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg('');

    try {
      const res = await updateUserApi(currentUser?.id || currentUser?._id, {
        name: editName,
        phone: editPhone,
        city: editCity,
        medicalHistory: editHistory,
      });
      if (res.success) {
        setProfileMsg(isUrdu ? 'پروفائل کامیابی سے اپڈیٹ ہو گیا ہے۔' : 'Profile updated successfully.');
      }
    } catch (err) {
      setProfileMsg(isUrdu ? 'تغیرات محفوظ نہیں ہو سکے۔' : 'Failed to save changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitReportForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportFile) {
      alert(isUrdu ? 'برائے مہربانی پہلے رپورٹ فائل (PDF یا تصویر) سلیکٹ کریں۔' : 'Please select a report file first.');
      return;
    }

    setIsUploadingReport(true);
    try {
      const uploadRes = await uploadDiseaseImageApi(selectedReportFile);
      const fileUrl = uploadRes.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800';
      const doc = doctors.find((d) => d.id === selectedDoctorId);

      const newRep = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        testNameUrdu: reportTitle || 'لیب رپورٹ',
        testNameEnglish: reportTitle || 'Patient Uploaded Lab Report',
        testName: reportTitle || (isUrdu ? 'لیب رپورٹ' : 'Lab Report'),
        createdAt: new Date().toISOString(),
        status: 'Under Review',
        doctorName: doc ? (isUrdu ? doc.nameUrdu : doc.nameEnglish) : (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
        doctor: doc ? (isUrdu ? doc.nameUrdu : doc.nameEnglish) : (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
        fileUrl,
      };

      setPatientReports((prev) => [newRep, ...prev]);

      await createReportApi({
        patientId: currentUser?.id || currentUser?._id || 'demo-p1',
        patientName: currentUser?.fullName || currentUser?.name || (isUrdu ? 'مریض' : 'Patient'),
        doctorId: selectedDoctorId,
        doctorName: doc ? (isUrdu ? doc.nameUrdu : doc.nameEnglish) : (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry'),
        testNameUrdu: reportTitle || 'لیب رپورٹ',
        testNameEnglish: reportTitle || 'Patient Uploaded Lab Report',
        fileUrl,
        summary: 'Patient sent report for medical evaluation',
      });

      alert(isUrdu ? 'رپورٹ ڈاکٹر صاحب کو کامیابی سے ارسال کر دی گئی ہے۔' : 'Report sent to doctor successfully.');
      setSelectedReportFile(null);
    } catch (err) {
      alert(isUrdu ? 'فائل اپلوڈ کرنے میں ناکامی ہوئی۔' : 'Failed to send report file.');
    } finally {
      setIsUploadingReport(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full mb-2 inline-block">
              {isUrdu ? 'مریض پورٹل' : 'Patient Portal'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              {isUrdu ? 'لیبارٹری رپورٹس اور نسخہ جات ڈاؤن لوڈ کریں' : 'Download Lab Reports & Prescriptions'}
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              {isUrdu ? 'اپنا موبائل نمبر یا یوزر نیم درج کر کے سیکیور لاگ ان کریں' : 'Login securely using your mobile number or username'}
            </p>
          </div>
          <User className="w-12 h-12 text-amber-300 opacity-80 hidden sm:block" />
        </div>

        {!isLogged ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md max-w-md mx-auto space-y-5">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => { setActiveMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${activeMode === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {isUrdu ? 'مریض لاگ ان' : 'Patient Login'}
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('register'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${activeMode === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {isUrdu ? 'نیا اکاؤنٹ' : 'Register Account'}
              </button>
            </div>

            <form onSubmit={handlePatientAuth} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl font-bold text-center">
                  {errorMsg}
                </div>
              )}

              {activeMode === 'register' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'پورا نام' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً: محمد فاروق' : 'e.g. Muhammad Farooq'}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'یوزر نیم / موبائل نمبر' : 'Username / Mobile Number'}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="03001234567 or patient1"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {activeMode === 'register' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'فون نمبر' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'پاس ورڈ' : 'Password'}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-2 transition-colors"
              >
                {activeMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>
                  {loading
                    ? (isUrdu ? 'پراسیسنگ جاری ہے...' : 'Processing...')
                    : activeMode === 'login'
                    ? (isUrdu ? 'لاگ ان کریں' : 'Login to Patient Portal')
                    : (isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Patient Account')}
                </span>
              </button>
            </form>

            <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isUrdu ? 'حافظ کلینک کے علاج و دوا کی سہولت برائے مریضین' : 'Official Patient Telemedicine & Record Access'}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-950 p-4 rounded-2xl border border-emerald-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-white">
              <div>
                <span className="font-bold text-amber-300">{isUrdu ? 'مریض کا نام:' : 'Patient Name:'}</span> {currentUser?.fullName || currentUser?.name || (isUrdu ? 'محمد فاروق' : 'Muhammad Farooq')} | <span className="font-bold text-amber-300">MRN:</span> {currentUser?.mrn || currentUser?.id || 'MRN-84920'}
              </div>
              <button
                onClick={() => { if (onLogout) onLogout(); }}
                className="text-red-300 hover:text-red-100 font-bold bg-red-950 border border-red-800 px-3 py-1 rounded-lg self-end sm:self-auto"
              >
                {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
              </button>
            </div>

            {/* Navigation Tabs for Patient Portal */}
            <div className="flex bg-slate-200 p-1.5 rounded-2xl text-xs font-black shadow-inner overflow-x-auto">
              <button
                onClick={() => setPortalTab('chat')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  portalTab === 'chat'
                    ? 'bg-emerald-700 text-white shadow-lg scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'ڈاکٹر سے گفتگو' : 'Doctor Chat'}</span>
              </button>

              <button
                onClick={() => setPortalTab('appointments')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  portalTab === 'appointments'
                    ? 'bg-emerald-700 text-white shadow-lg scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'اپائنٹمنٹس کیو' : 'Appointments Queue'}</span>
              </button>

              <button
                onClick={() => setPortalTab('invoices')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  portalTab === 'invoices'
                    ? 'bg-emerald-700 text-white shadow-lg scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
              >
                <Receipt className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'بلز و انوائسز' : 'Invoices & Bills'}</span>
              </button>

              <button
                onClick={() => setPortalTab('reports')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  portalTab === 'reports'
                    ? 'bg-emerald-700 text-white shadow-lg scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'میڈیکل رپورٹس' : 'Medical Reports'}</span>
              </button>

              <button
                onClick={() => setPortalTab('profile')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  portalTab === 'profile'
                    ? 'bg-emerald-700 text-white shadow-lg scale-[1.01]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
              >
                <User className="w-4 h-4 text-amber-300" />
                <span>{isUrdu ? 'میرا پروفائل' : 'My Profile'}</span>
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { if (setActiveView) setActiveView('store'); }}
                className="p-4 bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-2xl shadow-md hover:scale-[1.01] transition-transform flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>{isUrdu ? 'آن لائن میڈیسن اسٹور' : 'Online Medicine Store'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-1">
                    {isUrdu ? 'ہربل، آئی کیئر پروڈکٹس اور عطورات خریدیں' : 'Buy herbal remedies, eye care & perfumes'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => { if (onOpenAppointment) onOpenAppointment(); }}
                className="p-4 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl shadow-md hover:scale-[1.01] transition-transform flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>{isUrdu ? 'آن لائن اپائنٹمنٹ لیں' : 'Book Online Appointment'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-1">
                    {isUrdu ? 'ڈاکٹر کا ٹائم اور تاریخ سلیکٹ کریں' : 'Select preferred doctor, date & time slot'}
                  </p>
                </div>
              </button>
            </div>

            {/* TAB CONTENT: 1. CHAT WITH DOCTOR */}
            {portalTab === 'chat' && (
              <div className="space-y-2">
                <DoctorPatientChatView currentUser={currentUser} doctors={doctors} language={language} />
              </div>
            )}

            {/* TAB CONTENT: 2. APPOINTMENTS QUEUE */}
            {portalTab === 'appointments' && (() => {
              const myAppointments = (appointments || []).filter((app) => {
                if (!currentUser) return true;
                const pId = currentUser.id || currentUser._id;
                if (app.patientId && pId && String(app.patientId) === String(pId)) return true;
                if (currentUser.phone && app.phone && currentUser.phone === app.phone) return true;
                const patientNameClean = currentUser.fullName || currentUser.name || '';
                if (patientNameClean && app.patientName && app.patientName.toLowerCase().includes(patientNameClean.toLowerCase())) return true;
                return false;
              });

              return (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <span>{isUrdu ? 'آپ کی آن لائن اپائنٹمنٹس کیو (My Appointments Queue)' : 'My Appointments Queue'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isUrdu ? 'آپ کی تمام بکنگز کی آئی ڈی نمبرز، تاریخ و وقت اور معالج کی منظوری کا سٹیٹس یہاں دیکھیں' : 'View your sequential booking IDs and approval status here'}
                      </p>
                    </div>
                    <button
                      onClick={() => { if (onOpenAppointment) onOpenAppointment(); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{isUrdu ? 'نئی اپائنٹمنٹ بک کریں' : 'Book New Appointment'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {myAppointments && myAppointments.length > 0 ? (
                      myAppointments.map((app, idx) => {
                        const displayId = app.id && app.id.startsWith('APP-') ? app.id : `APP-${String(idx + 1).padStart(3, '0')}`;
                        return (
                          <div key={app.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-2 font-mono text-sm font-black text-emerald-800">
                                <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                                  {displayId}
                                </span>
                                <span className="text-slate-900 font-sans font-bold">{app.patientName}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                                app.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : app.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : app.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {app.status === 'Approved' ? '✓ Approved (منظور شدہ)' : app.status === 'Completed' ? '✓ Completed (مکمل)' : app.status === 'Cancelled' ? '✕ Cancelled (منسوخ)' : '⏳ Pending Approval (منظوری کا منتظر)'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 font-semibold pt-1">
                              <div><span className="text-slate-400 font-normal">معالج:</span> <span className="font-bold text-slate-900">{app.doctorName}</span></div>
                              <div><span className="text-slate-400 font-normal">تاریخ و وقت:</span> <span className="font-bold text-slate-900 font-mono">{app.date} | {app.timeSlot}</span></div>
                              <div><span className="text-slate-400 font-normal">مسئلہ:</span> <span className="font-bold text-emerald-700">{app.problem}</span></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                        {isUrdu ? 'آپ کے اکاؤنٹ پر کوئی بک شدہ اپائنٹمنٹ موجود نہیں ہے۔ اوپر دیے گئے بٹن سے نئی اپائنٹمنٹ بک کریں۔' : 'No appointment records found for your account. Click the button above to book a new appointment.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: 2. LAB REPORTS & SENDING TO DOCTOR */}
            {portalTab === 'reports' && (
              <div className="space-y-6">
                {/* Upload Report to Doctor Form */}
                <form onSubmit={handleSubmitReportForm} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'ڈاکٹر کو نئی لیب رپورٹ یا ایکس رے ارسال کریں' : 'Send Lab Report or X-Ray to Doctor'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-800">
                    <div>
                      <label className="block mb-1">{isUrdu ? 'رپورٹ کا عنوان (Test Name)' : 'Report Title'}</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder={isUrdu ? 'مثلاً: بائیو کوانٹم باڈی اسکین یا ایکس رے' : 'e.g. Quantum Scan or X-Ray'}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">{isUrdu ? 'ڈاکٹر کا انتخاب کریں (Select Target Doctor)' : 'Select Target Doctor'}</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                      >
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {isUrdu ? doc.nameUrdu : doc.nameEnglish} ({doc.qualification})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isUrdu ? 'رپورٹ فائل سلیکٹ کریں (PDF or Image Upload)' : 'Select Report File (PDF/Image)'}
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedReportFile(e.target.files?.[0] || null)}
                      disabled={isUploadingReport}
                      className="w-full p-2 border rounded-xl bg-slate-50 text-xs text-slate-700 cursor-pointer"
                    />
                    {selectedReportFile && (
                      <p className="mt-1 text-xs text-emerald-700 font-bold flex items-center gap-1">
                        ✓ سلیکٹ شدہ فائل: {selectedReportFile.name}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploadingReport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {isUploadingReport
                          ? (isUrdu ? 'ارسال ہو رہا ہے...' : 'Sending...')
                          : (isUrdu ? 'ڈاکٹر کو رپورٹ بھیجیں (Send Report to Doctor)' : 'Send Report to Doctor')}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Patient Reports List */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'آپ کی تمام لیبارٹری رپورٹس (Laboratory Reports)' : 'Your Laboratory Reports'}</span>
                  </h3>

                  {isLoadingReports ? (
                    <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>{isUrdu ? 'رپورٹس لوڈ ہو رہی ہیں...' : 'Loading your reports...'}</span>
                    </div>
                  ) : patientReports.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2 text-xs">
                      <p className="font-bold text-slate-700">
                        {isUrdu
                          ? 'آپ کی ابھی کوئی سابقہ لیبارٹری رپورٹ ریکارڈ نہیں ہے۔'
                          : 'No medical reports found for your account.'}
                      </p>
                      <p className="text-slate-500">
                        {isUrdu
                          ? 'اگر آپ کے پاس کوئی جدید ٹیسٹ یا ایکس رے رپورٹ ہے تو اوپر فارم سے معالج کو بھیج سکتے ہیں۔'
                          : 'If you have any lab test or X-Ray files, you can upload them using the form above.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientReports.map((rep) => {
                        const title = isUrdu ? (rep.testNameUrdu || rep.testName || 'لیب رپورٹ') : (rep.testNameEnglish || rep.testName || 'Lab Report');
                        const doc = rep.doctorName || rep.doctor || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry');
                        const dateStr = rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : (rep.date || '—');

                        return (
                          <div key={rep.id || rep._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                                <span>{title}</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {rep.status || 'Reviewed'}
                                </span>
                              </div>
                              <div className="text-gray-500 mt-1">
                                {isUrdu ? 'تاریخ:' : 'Date:'} {dateStr} | {isUrdu ? 'معالج:' : 'Doctor:'} {doc}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedReportForPrint(rep)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow transition-transform hover:scale-105 cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                                <span>{isUrdu ? 'رپورٹ پرنٹ کریں' : 'Print Report'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(rep.fileUrl, `${title}.pdf`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow transition-transform hover:scale-105 cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                                <span>{isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVOICES & BILLS */}
            {portalTab === 'invoices' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-600" />
                      <span>{isUrdu ? 'مریض کا باضابطہ مالیاتی ریکارڈ و انوائسز' : 'Patient Itemized Invoices & Bills'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'معائنہ فیس، ادویات، ٹیسٹ اور عینک کے تمام چارجز کی الیکٹرانک سلپ دیکھیں اور پرنٹ کریں' : 'View computerized money slips for checkup fees, medicines, optical frames & tests'}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    {isUrdu ? `کل سلپس: ${patientSlips.length}` : `Total Invoices: ${patientSlips.length}`}
                  </span>
                </div>

                {patientSlips.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2 text-xs">
                    <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700">
                      {isUrdu ? 'آپ کے اکاؤنٹ کے لیے ابھی کوئی کیش سلپ ریکارڈ نہیں ہے۔' : 'No invoices or money slips found for your account.'}
                    </p>
                    <p className="text-slate-500">
                      {isUrdu ? 'جب بھی آپ کلینک سے معائنہ یا ادویات لیں گے، آپ کی انوائس یہاں خودکار ظاہر ہو جائے گی۔' : 'When you visit the clinic or book an appointment, your official receipt will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientSlips.map((slip) => (
                      <div key={slip.id} className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-4 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-emerald-800 text-sm">{slip.slipNo}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                slip.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : slip.paymentStatus === 'Partial'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}>
                                {slip.paymentStatus === 'Paid' ? '✓ Paid (ادا شدہ)' : slip.paymentStatus === 'Partial' ? '⏳ Partial (جزوی)' : '✕ Unpaid (غیر ادا شدہ)'}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              {isUrdu ? 'تاریخ:' : 'Date:'} <span className="font-mono">{slip.date}</span> • {isUrdu ? 'معالج:' : 'Doctor:'} <strong className="text-slate-800">{slip.doctorName}</strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedSlipForPrint(slip)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow transition-all cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>{isUrdu ? 'پرنٹ رسید / PDF' : 'Print Invoice / PDF'}</span>
                          </button>
                        </div>

                        {/* Itemized Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-white">
                                <th className="p-2">#</th>
                                <th className="p-2">{isUrdu ? 'تفصیل خدمت / میڈیسن' : 'Description'}</th>
                                <th className="p-2">{isUrdu ? 'قسم' : 'Category'}</th>
                                <th className="p-2 text-center">{isUrdu ? 'تعداد' : 'Qty'}</th>
                                <th className="p-2 text-right">{isUrdu ? 'رقم (Rs.)' : 'Amount (Rs.)'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60">
                              {slip.items.map((it, idx) => (
                                <tr key={idx} className="hover:bg-white/60">
                                  <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                                  <td className="p-2 font-bold text-slate-900">{it.description}</td>
                                  <td className="p-2 text-slate-600 text-[11px]">{it.category}</td>
                                  <td className="p-2 text-center font-mono font-bold">{it.quantity}</td>
                                  <td className="p-2 text-right font-mono font-bold text-slate-900">Rs. {it.totalPrice.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs font-semibold bg-white p-3 rounded-xl border">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <span className="text-slate-500">{isUrdu ? 'ٹوٹل:' : 'Total:'} </span>
                              <span className="font-mono font-bold text-slate-900">Rs. {slip.totalAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">{isUrdu ? 'وصول شدہ:' : 'Paid:'} </span>
                              <span className="font-mono font-bold text-emerald-700">Rs. {slip.paidAmount.toLocaleString()}</span>
                            </div>
                            {slip.balanceAmount > 0 && (
                              <div>
                                <span className="text-slate-500">{isUrdu ? 'بقایا واجب الادا:' : 'Balance Due:'} </span>
                                <span className="font-mono font-black text-rose-700">Rs. {slip.balanceAmount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Method: {slip.paymentMethod || 'Cash'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. PATIENT PROFILE */}
            {portalTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      <span>{isUrdu ? 'مریض کا ذاتی پروفائل' : 'Patient Profile'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'اپنی معلوماتی تفصیلات اپڈیٹ کریں' : 'Update your personal details & medical history'}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    MRN: {currentUser?.mrn || 'MRN-84920'}
                  </span>
                </div>

                {profileMsg && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl text-center">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-bold">{isUrdu ? 'پورا نام' : 'Full Name'}</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">{isUrdu ? 'موبائل نمبر' : 'Phone Number'}</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">{isUrdu ? 'شہر' : 'City'}</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">{isUrdu ? 'ای میل ایڈریس' : 'Email Address'}</label>
                      <input
                        type="text"
                        disabled
                        value={currentUser?.email || `${currentUser?.username || 'patient'}@hafizclinic.com`}
                        className="w-full p-3 border rounded-xl bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold">{isUrdu ? 'سابقہ طبی ہسٹری / علامات' : 'Medical History & Notes'}</label>
                    <textarea
                      rows={3}
                      value={editHistory}
                      onChange={(e) => setEditHistory(e.target.value)}
                      placeholder={isUrdu ? 'اپنی سابقہ بیماریوں کے بارے میں تحریر کریں...' : 'Enter your medical history or symptoms...'}
                      className="w-full p-3 border rounded-xl bg-slate-50 font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSavingProfile
                        ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...')
                        : (isUrdu ? 'پروفائل تبدیلیاں محفوظ کریں' : 'Save Profile Changes')}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRINTABLE PATIENT REPORT MODAL */}
      {selectedReportForPrint && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="no-print flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {isUrdu ? 'میڈیکل رپورٹ پرنٹ پریویو (Print Preview)' : 'Medical Report Print Preview'}
              </h3>
              <button
                onClick={() => setSelectedReportForPrint(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Printable Area */}
            <div id="patient-printable-report" className="printable-area bg-white p-6 rounded-2xl border border-slate-300 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-emerald-950">
                    {isUrdu ? 'حافظ کلینک اینڈ پیتھالوجی لیبارٹری' : 'Hafiz Clinic & Pathology Lab'}
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • Registration # PHC-REG-84920
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">
                    {isUrdu ? 'تاریخ:' : 'Date:'} {selectedReportForPrint.createdAt ? new Date(selectedReportForPrint.createdAt).toLocaleDateString() : 'Today'}
                  </div>
                  <div className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold text-[10px] inline-block mt-1">
                    ✓ Verified Patient Record
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3 font-semibold">
                <div>
                  <span className="text-slate-500">{isUrdu ? 'مریض:' : 'Patient:'} </span>
                  <strong className="text-slate-900">{currentUser?.fullName || currentUser?.name || 'Valued Patient'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{isUrdu ? 'رپورٹ کا عنوان:' : 'Report Title:'} </span>
                  <strong className="text-emerald-900">
                    {isUrdu ? (selectedReportForPrint.testNameUrdu || selectedReportForPrint.testName) : (selectedReportForPrint.testNameEnglish || selectedReportForPrint.testName)}
                  </strong>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-1">
                  {isUrdu ? 'طبی خلاصہ و معالج کا تبصرہ' : 'Medical Summary & Doctor Commentary'}
                </h4>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs leading-relaxed text-slate-800 font-medium">
                  {selectedReportForPrint.doctorComment || selectedReportForPrint.summary || (isUrdu ? 'رپورٹ کا باضابطہ جائزہ لے لیا گیا ہے اور تمام نتائج تسلی بخش ہیں۔' : 'Report officially evaluated. Results reviewed by consultant physician.')}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="text-[10px] text-slate-500">
                  {isUrdu ? 'یہ رپورٹ باضابطہ تصدیق شدہ الیکٹرانک میڈیکل ریکارڈ ہے۔' : 'Officially authenticated electronic lab document.'}
                </div>
                <div className="text-center">
                  <div className="font-bold text-emerald-900 font-serif italic border-b border-slate-400 px-3 pb-1">
                    Hafiz Clinic Medical Board
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-1">{isUrdu ? 'مہر و تصدیق' : 'Official Stamp'}</div>
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap justify-end items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedReportForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
              <button
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedReportForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadLabReportPdf(selectedReportForPrint, 'patient-printable-report');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save PDF file"
              >
                {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isUrdu ? 'ڈاؤنلوڈ PDF رپورٹ' : 'Save PDF'}</span>
              </button>
              <button
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (selectedReportForPrint) {
                    setIsGeneratingPdf(true);
                    try {
                      await downloadLabReportPdf(selectedReportForPrint, 'patient-printable-report');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>{isUrdu ? 'رپورٹ پرنٹ کریں / PDF' : 'Print Report / Save PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE PATIENT MONEY SLIP / INVOICE MODAL */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 space-y-6 shadow-2xl relative text-slate-900 my-8">
            <div className="no-print flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  {isUrdu ? 'باضابطہ کمپیوٹرائزڈ کیش سلپ / انوائس' : 'Official Computerized Patient Money Slip'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Printable Slip Layout */}
            <div id="patient-printable-slip" className="printable-area bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-300 space-y-5 text-xs text-slate-900">
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                    {isUrdu ? 'حافظ کلینک اینڈ پیتھالوجی لیبارٹری' : 'Hafiz Clinic & Pathology Lab'}
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC-REG-84920
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    جی ٹی روڈ، گوجرانوالہ • ہیلپ لائن: 0300-1234567
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-emerald-900 text-amber-300 font-mono font-black text-xs px-3 py-1 rounded-lg inline-block">
                    {selectedSlipForPrint.slipNo}
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold mt-1">
                    {isUrdu ? 'تاریخ:' : 'Date:'} {selectedSlipForPrint.date}
                  </div>
                  {selectedSlipForPrint.time && (
                    <div className="text-[10px] text-slate-400 font-mono">{selectedSlipForPrint.time}</div>
                  )}
                </div>
              </div>

              {/* Patient & Doctor Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{isUrdu ? 'مریض کا نام' : 'Patient Name'}</div>
                  <div className="font-black text-slate-900">{selectedSlipForPrint.patientName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{isUrdu ? 'موبائل نمبر' : 'Phone'}</div>
                  <div className="font-mono font-bold text-slate-800">{selectedSlipForPrint.patientPhone || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{isUrdu ? 'طبی نمبر' : 'MRN'}</div>
                  <div className="font-mono font-bold text-emerald-900">{selectedSlipForPrint.mrnNumber || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{isUrdu ? 'معالج' : 'Doctor'}</div>
                  <div className="font-bold text-emerald-800">{selectedSlipForPrint.doctorName}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-700 font-bold">
                      <th className="p-2">#</th>
                      <th className="p-2">{isUrdu ? 'تفصیل خدمت / میڈیسن / ٹیسٹ' : 'Description'}</th>
                      <th className="p-2">{isUrdu ? 'شعبہ' : 'Category'}</th>
                      <th className="p-2 text-center">{isUrdu ? 'تعداد' : 'Qty'}</th>
                      <th className="p-2 text-right">{isUrdu ? 'یونٹ ریٹ' : 'Rate'}</th>
                      <th className="p-2 text-right">{isUrdu ? 'رقم (Rs.)' : 'Total (Rs.)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(selectedSlipForPrint.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{item.description}</td>
                        <td className="p-2 text-slate-600 text-[11px]">{item.category}</td>
                        <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2 text-right font-mono text-slate-700">Rs. {(item.unitPrice ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">Rs. {(item.totalPrice ?? (item as any).total ?? ((item.unitPrice || 0) * (item.quantity || 1))).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>{isUrdu ? 'ذیلی ٹوٹل:' : 'Subtotal:'}</span>
                    <span className="font-mono font-bold text-slate-900">Rs. {(selectedSlipForPrint.subtotal ?? 0).toLocaleString()}</span>
                  </div>
                  {(((selectedSlipForPrint as any).discountAmount ?? selectedSlipForPrint.discount ?? 0) > 0) && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{isUrdu ? 'رعایت:' : 'Discount:'}</span>
                      <span className="font-mono font-bold">- Rs. {(((selectedSlipForPrint as any).discountAmount ?? selectedSlipForPrint.discount ?? 0)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1 text-sm">
                    <span>{isUrdu ? 'کل رقم:' : 'Net Total:'}</span>
                    <span className="font-mono font-black text-emerald-950">Rs. {(selectedSlipForPrint.totalAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>{isUrdu ? 'ادا شدہ رقم:' : 'Paid Amount:'}</span>
                    <span className="font-mono font-bold">Rs. {(selectedSlipForPrint.paidAmount ?? 0).toLocaleString()}</span>
                  </div>
                  {(selectedSlipForPrint.balanceAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold border-t border-dashed pt-1">
                      <span>{isUrdu ? 'بقایا واجب الادا:' : 'Balance Due:'}</span>
                      <span className="font-mono font-black">Rs. {(selectedSlipForPrint.balanceAmount ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    {isUrdu ? 'کمپیوٹرائزڈ رسید برائے حافظ کلینک' : 'System generated billing slip. No manual signature required.'}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                    ادویات اور خدمات پر حکومتی قواعد لاگو ہیں۔
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold font-serif italic text-emerald-950 border-b border-slate-400 px-4 pb-1">
                    Cashier / Accounts Officer
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">{isUrdu ? 'دستخط و تصدیق' : 'Official Signature'}</div>
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
                      await downloadInvoicePdf(selectedSlipForPrint, 'patient-printable-slip');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Direct Download PDF Document"
              >
                {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
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
                      await downloadInvoicePdf(selectedSlipForPrint, 'patient-printable-slip');
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }
                }}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>{isUrdu ? 'سلپ پرنٹ کریں / PDF' : 'Print Slip / Save PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
