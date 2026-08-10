import React, { useState, useEffect } from 'react';
import { User, FileText, Download, Calendar, ShieldCheck, CheckCircle2, Lock, UserPlus, LogIn, ShoppingBag, MessageSquare, Upload, Save, Edit, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { loginApi, registerApi, createReportApi, uploadDiseaseImageApi, updateUserApi, getReportsApi } from '../services/api';
import { DoctorPatientChatView } from './DoctorPatientChatView';
import { Doctor } from '../types';

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
  const [portalTab, setPortalTab] = useState<'chat' | 'appointments' | 'reports' | 'profile'>('chat');

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

  // Fetch only this logged in patient's reports from DB
  useEffect(() => {
    if (currentUser) {
      const pId = currentUser.id || currentUser._id;
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
    } else {
      setPatientReports([]);
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
              <div className="space-y-4">
                <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
                  <span>{isUrdu ? '💬 ڈاکٹر سے براہ راست مشورہ و سوالات' : '💬 Direct Doctor Consultation & Chat'}</span>
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px]">Direct Doctor Consultation</span>
                </div>
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

                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(rep.fileUrl, `${title}.pdf`)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow transition-transform hover:scale-105"
                            >
                              <Download className="w-4 h-4" />
                              <span>{isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
    </div>
  );
};
