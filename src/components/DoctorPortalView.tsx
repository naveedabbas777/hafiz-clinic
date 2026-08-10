import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, CheckCircle2, UserCheck, FilePlus, Printer, Clock, Lock, Key, MessageSquare, FileText, CheckCheck, Send, ShieldCheck } from 'lucide-react';
import { Appointment, Doctor } from '../types';
import { loginApi, getReportsApi, updateReportApi, getAppointmentsApi } from '../services/api';
import { DoctorPatientChatView } from './DoctorPatientChatView';

interface DoctorPortalProps {
  appointments: Appointment[];
  doctors?: Doctor[];
  language?: 'urdu' | 'english';
}

export const DoctorPortalView: React.FC<DoctorPortalProps> = ({
  appointments,
  doctors = [],
  language = 'urdu',
}) => {
  const isUrdu = language === 'urdu';
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(appointments);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(appointments[0] || null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [savedPrescriptions, setSavedPrescriptions] = useState<string[]>([]);

  // Doctor Auth State
  const [isDoctorAuth, setIsDoctorAuth] = useState(false);
  const [username, setUsername] = useState('doctor1');
  const [password, setPassword] = useState('doc123');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);

  // Tab state
  const [docTab, setDocTab] = useState<'queue' | 'chat' | 'reports'>('queue');

  useEffect(() => {
    setAppointmentsList(appointments);
  }, [appointments]);

  useEffect(() => {
    if (isDoctorAuth) {
      const fetchAppointments = () => {
        getAppointmentsApi().then((res) => {
          if (res.success && res.appointments && res.appointments.length > 0) {
            setAppointmentsList(res.appointments);
          }
        }).catch(() => {});
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

  // Patient Reports for Doctor Review
  const [patientReports, setPatientReports] = useState<any[]>([
    {
      _id: 'rep-1',
      patientName: 'محمد فاروق (MRN-84920)',
      testNameUrdu: 'بائیو کوانٹم باڈی اسکین رپورٹ',
      fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      summary: 'مریض کو کمر میں درد اور پٹھوں کا کھنچاؤ محسوس ہو رہا ہے۔',
      status: 'Under Review',
      doctorComment: '',
      date: '2026-08-04',
    },
  ]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [doctorAdvice, setDoctorAdvice] = useState('');

  useEffect(() => {
    if (isDoctorAuth) {
      getReportsApi(undefined, currentDoctor?.id).then((res) => {
        if (res.success && res.reports && res.reports.length > 0) {
          setPatientReports(res.reports);
        }
      }).catch(() => {});
    }
  }, [isDoctorAuth, currentDoctor]);

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await loginApi(username, password, 'doctor');
      if (res.success) {
        setCurrentDoctor(res.user);
        setIsDoctorAuth(true);
      } else {
        setAuthError(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setAuthError('Connection error to database server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRx = () => {
    if (!prescriptionText) return;
    setSavedPrescriptions([prescriptionText, ...savedPrescriptions]);
    alert(isUrdu ? 'نسخہ کامیابی سے پرنٹ و محفوظ کر لیا گیا ہے۔' : 'Prescription saved & ready for print.');
    setPrescriptionText('');
  };

  const handleReviewReport = async (repId: string) => {
    if (!doctorAdvice) return;
    try {
      await updateReportApi(repId, { status: 'Reviewed', doctorComment: doctorAdvice });
      setPatientReports(patientReports.map((r) => r._id === repId ? { ...r, status: 'Reviewed', doctorComment: doctorAdvice } : r));
      alert(isUrdu ? 'رپورٹ کا جائزہ اور تبصرہ محفوظ کر لیا گیا ہے۔' : 'Report review & advice saved.');
      setDoctorAdvice('');
      setActiveReport(null);
    } catch (e) {
      alert('Error updating report.');
    }
  };

  if (!isDoctorAuth) {
    return (
      <div className="py-16 bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-800">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isUrdu ? 'ڈاکٹر پورٹل لاگ ان' : 'Doctor Portal Login'}
            </h2>
            <p className="text-xs text-slate-600">
              {isUrdu ? 'معالجین کے لیے ڈیجیٹل نسخہ جات اور او پی ڈی پورٹل' : 'Digital prescription & OPD management portal for doctors'}
            </p>
          </div>

          <form onSubmit={handleDoctorLogin} className="space-y-4 text-xs">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isUrdu ? 'یوزر نیم' : 'Doctor Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                placeholder="doctor1"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isUrdu ? 'پاس ورڈ' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? (isUrdu ? 'تصدیق ہو رہی ہے...' : 'Authenticating...') : (isUrdu ? 'لاگ ان کریں' : 'Doctor Login')}</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'حافظ کلینک کے تصدیق شدہ طبی معالجین کے لیے محفوظ پورٹل' : 'Official Portal for Verified Medical Practitioners'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 rounded-3xl text-white shadow-xl flex justify-between items-center">
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full mb-1 inline-block">
              {isUrdu ? 'ڈاکٹر پینل' : 'Doctor Portal'}
            </span>
            <h1 className="text-2xl font-black">
              {isUrdu ? 'ڈاکٹر ڈیش بورڈ — معائنہ و ڈیجیٹل نسخہ جات' : 'Doctor Dashboard — Prescriptions & Examination'}
            </h1>
            <p className="text-xs text-emerald-100">
              {isUrdu ? 'خوش آمدید:' : 'Welcome:'} <strong className="text-amber-300">{currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری (MBBS)' : 'Dr. Zeeshan Chaudhry (MBBS)')}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDoctorAuth(false)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl border border-emerald-700"
            >
              Sign Out
            </button>
            <Stethoscope className="w-10 h-10 text-amber-300 opacity-80 hidden sm:block" />
          </div>
        </div>

        {/* Doctor Portal Tabs */}
        <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl text-xs font-black shadow-sm overflow-x-auto">
          <button
            onClick={() => setDocTab('queue')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              docTab === 'queue'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-200" />
            <span>{isUrdu ? 'او پی ڈی کیو و ڈیجیٹل نسخہ' : 'OPD Queue & Rx'}</span>
          </button>

          <button
            onClick={() => setDocTab('chat')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              docTab === 'chat'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-200" />
            <span>{isUrdu ? 'مریضوں سے لائیو چاٹ' : 'Live Patient Chat'}</span>
          </button>

          <button
            onClick={() => setDocTab('reports')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              docTab === 'reports'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>{isUrdu ? 'مریضوں کی رپورٹس کا جائزہ' : 'Review Patient Lab Reports'}</span>
          </button>
        </div>

        {/* TAB 1: OPD QUEUE & PRESCRIPTION WRITER */}
        {docTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments Queue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'مریضوں کی فہرست' : 'Patient OPD Queue'}</span>
                </span>
                <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {appointmentsList.length} Total
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                {appointmentsList.map((app, idx) => {
                  const itemKey = app.id || (app as any)._id || `app-${idx}-${app.patientName || ''}`;
                  return (
                    <div
                      key={itemKey}
                      onClick={() => setSelectedApp(app)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedApp?.id === app.id || (selectedApp && (selectedApp as any)._id && (selectedApp as any)._id === (app as any)._id)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{app.patientName}</span>
                        <span className="text-emerald-700">{app.timeSlot}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {isUrdu ? 'بیماری:' : 'Condition:'} {app.problem} | {isUrdu ? 'شہر:' : 'City:'} {app.city}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Digital Prescription Writer */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'ڈیجیٹل نسخہ تحریر کریں' : 'Digital Prescription Writer'}</span>
                </h3>
                {selectedApp && (
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-300 font-bold">
                    {isUrdu ? 'مریض:' : 'Patient:'} {selectedApp.patientName} ({selectedApp.phone})
                  </span>
                )}
              </div>

              {selectedApp ? (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                    <div><strong>{isUrdu ? 'ڈاکٹر:' : 'Doctor:'}</strong> {selectedApp.doctorName}</div>
                    <div><strong>{isUrdu ? 'تشخیص:' : 'Diagnosis:'}</strong> {selectedApp.problem}</div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-700 font-bold">{isUrdu ? 'نسخہ جات و ادویات' : 'Medicines & Instructions'}</label>
                    <textarea
                      rows={8}
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder={isUrdu
                        ? '1. Tab Paracetamol 500mg - 1+1+1\n2. Hoorab Hair Oil - Daily Night Massage\n3. Physio Laser Session - 3 Days\n4. پرہیز: ٹھنڈے پانی اور چاول سے پرہیز کریں۔'
                        : '1. Tab Paracetamol 500mg - 1+1+1\n2. Hoorab Hair Oil - Daily Night Massage\n3. Physio Laser Session - 3 Days\n4. Precaution: Avoid cold water and rice.'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveRx}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isUrdu ? 'نسخہ محفوظ کریں و پرنٹ کریں' : 'Save & Print Prescription'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {isUrdu ? 'برائے مہربانی بائیں جانب سے کسی مریض کو منتخب کریں۔' : 'Please select a patient from the queue on the left.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT CHAT / CONSULTATIONS */}
        {docTab === 'chat' && (
          <div className="space-y-4">
            <div className="bg-emerald-900 p-4 rounded-2xl text-white flex justify-between items-center text-xs font-bold shadow-md">
              <span>{isUrdu ? '💬 آن لائن مریضوں سے براہ راست بات چیت اور رپورٹ کا تبادلہ' : '💬 Live Chat & Report Exchange with Online Patients'}</span>
              <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-bold">Live Patient Consultation</span>
            </div>
            <DoctorPatientChatView currentUser={{ role: 'doctor', id: currentDoctor?.id || 'doc-1', name: currentDoctor?.fullName || (isUrdu ? 'ڈاکٹر زیشان چوہدری' : 'Dr. Zeeshan Chaudhry') }} doctors={doctors} language={language} />
          </div>
        )}

        {/* TAB 3: PATIENT LAB REPORTS REVIEW */}
        {docTab === 'reports' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-emerald-900 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'مریضوں کی موصول شدہ لیبارٹری رپورٹس' : 'Received Patient Lab Reports'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {patientReports.map((rep, idx) => (
                <div key={rep._id || rep.id || `rep-${idx}-${rep.patientName || ''}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{rep.patientName}</div>
                      <div className="text-emerald-700 font-semibold">{isUrdu ? rep.testNameUrdu || rep.testName : rep.testNameEnglish || rep.testName}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rep.status === 'Reviewed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-slate-700">{rep.summary}</p>

                  {rep.fileUrl && (
                    <img
                      src={rep.fileUrl}
                      alt="Report preview"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    />
                  )}

                  {rep.doctorComment && (
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                      <strong>{isUrdu ? 'ڈاکٹر کا مشورہ:' : 'Doctor Advice:'}</strong> {rep.doctorComment}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder={isUrdu ? 'مریض کے لیے طبی مشورہ یا نسخہ ہدایت لکھیں...' : 'Write medical advice or instructions for patient...'}
                      value={activeReport === rep._id ? doctorAdvice : ''}
                      onChange={(e) => {
                        setActiveReport(rep._id);
                        setDoctorAdvice(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleReviewReport(rep._id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{isUrdu ? 'مشورہ محفوظ کریں' : 'Submit Doctor Review'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
