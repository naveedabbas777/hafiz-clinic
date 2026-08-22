import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Syringe,
  Pill,
  Clock,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Printer,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Save,
  Search,
  ShieldCheck,
  Bell,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  User,
  Sparkles,
  Bed,
  Check,
  RefreshCw,
  Eye,
  Thermometer,
  Calendar,
  Phone,
  Building,
  ArrowRight,
} from 'lucide-react';
import { StaffUser } from '../types';
import { INITIAL_STAFF_USERS } from '../data/staffData';

export interface NursingVitalsEntry {
  id: string;
  admissionId: string;
  patientName: string;
  mrnNumber: string;
  bedNumber: string;
  wardName: string;
  timestamp: string;
  timeSlot: '08:00 AM' | '12:00 PM' | '04:00 PM' | '08:00 PM' | '12:00 AM' | '04:00 AM' | string;
  nurseName: string;

  // Vitals
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  temperature: number; // in °F
  spO2: number; // percentage
  respiratoryRate: number;
  bloodSugarRBS?: number; // mg/dL
  painScale: number; // 0 to 10
  consciousness: 'Alert & Oriented' | 'Drowsy' | 'Confused' | 'Unresponsive';

  // IV Fluid & Drip Infusion
  ivFluidType: string;
  ivInfusionRate: string; // e.g. "30 drops/min"
  ivVolumeInfusedMl: number;
  cannulaSiteCondition: 'Healthy & Patent' | 'Mild Redness' | 'Phlebitis / Infiltration' | 'Flushed';

  // Injections & Medications (MAR)
  medicationsAdministered: {
    name: string;
    route: 'IV' | 'IM' | 'SC' | 'Oral' | 'Inhalation' | 'Topical';
    dose: string;
    status: 'Given' | 'Refused' | 'Held on Doctor Order';
  }[];

  // Intake & Output
  intakeOralMl: number;
  intakeIvMl: number;
  outputUrineMl: number;
  outputDrainMl: number;

  // Nursing Notes
  nursingNotesUrdu: string;
  nursingNotesEnglish?: string;
  doctorAlertStatus: 'Normal' | 'Urgent Review Needed' | 'Critical Doctor Alerted';
}

interface NursingCarePortalViewProps {
  currentUser?: StaffUser | null;
  onLogin?: (user: StaffUser) => void;
  onLogout?: () => void;
  language?: 'urdu' | 'english';
}

export const NursingCarePortalView: React.FC<NursingCarePortalViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  language = 'english',
}) => {
  const isUrdu = language === 'urdu';

  // Authentication State
  const isNurseAuthenticated =
    currentUser && (currentUser.role === 'nurse' || currentUser.role === 'admin' || currentUser.role === 'ipd_incharge');

  const [usernameInput, setUsernameInput] = useState('nurse1');
  const [passwordInput, setPasswordInput] = useState('nurse123');
  const [authError, setAuthError] = useState('');

  // Active Nursing Tab
  const [activeTab, setActiveTab] = useState<'bed_status' | 'log_vitals' | 'sheet' | 'mar_meds'>('bed_status');

  // Admitted Patients (from LocalStorage or fallback)
  const [admissions, setAdmissions] = useState<any[]>(() => {
    const saved = localStorage.getItem('hc_ipd_admissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'IPD-2026-101',
        patientName: 'محمد ارشد چوہدری (Muhammad Arshad)',
        patientAge: 48,
        patientGender: 'Male',
        patientPhone: '0300-9876543',
        mrnNumber: 'MRN-88091',
        bedNumber: 'PVT-101',
        roomType: 'Private VIP Room',
        wardName: 'VIP Executive Wing',
        treatingDoctor: 'ڈاکٹر زیشان چوہدری (Dr. Zeeshan Chaudhry)',
        admissionDate: '2026-08-18',
        diagnosis: 'Acute Sciatica & Severe Lumbar Radiculopathy (عرق النساء و کمر درد)',
        status: 'Admitted',
        dietaryPlan: 'کم نمک و چکنائی، دلیہ و مائع غذا (Low Salt & Soft Diet)',
      },
      {
        id: 'IPD-2026-102',
        patientName: 'پروین اختر بیگم (Parveen Akhtar)',
        patientAge: 56,
        patientGender: 'Female',
        patientPhone: '0321-4455667',
        mrnNumber: 'MRN-88095',
        bedNumber: 'GEN-01',
        roomType: 'General Ward Bed',
        wardName: 'Female General Medical Ward',
        treatingDoctor: 'ڈاکٹر وقاص صغیر چوہدری (Dr. Waqas Sagheer)',
        admissionDate: '2026-08-19',
        diagnosis: 'Knee Osteoarthritis & Post-Rehabilitation Care (جوڑوں کا درد)',
        status: 'Admitted',
        dietaryPlan: 'ہائی پروٹین و کیلشیم ڈائٹ (High Protein & Calcium Diet)',
      },
    ];
  });

  // Selected Patient for logging
  const [selectedAdmission, setSelectedAdmission] = useState<any>(admissions[0] || null);

  // Nursing Care Logs State
  const [vitalsLogs, setVitalsLogs] = useState<NursingVitalsEntry[]>(() => {
    const saved = localStorage.getItem('hc_nursing_vitals_logs_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'NURSE-LOG-101',
        admissionId: 'IPD-2026-101',
        patientName: 'محمد ارشد چوہدری (Muhammad Arshad)',
        mrnNumber: 'MRN-88091',
        bedNumber: 'PVT-101',
        wardName: 'VIP Executive Wing',
        timestamp: new Date().toISOString(),
        timeSlot: '08:00 AM',
        nurseName: currentUser?.name || 'Staff Nurse Fouzia Parveen',
        bpSystolic: 125,
        bpDiastolic: 82,
        pulseRate: 76,
        temperature: 98.6,
        spO2: 98,
        respiratoryRate: 18,
        bloodSugarRBS: 135,
        painScale: 4,
        consciousness: 'Alert & Oriented',
        ivFluidType: 'Normal Saline 0.9% (1000ml)',
        ivInfusionRate: '25 drops/min',
        ivVolumeInfusedMl: 500,
        cannulaSiteCondition: 'Healthy & Patent',
        medicationsAdministered: [
          { name: 'Inj. Tramadol 50mg IV (Slow)', route: 'IV', dose: '50mg', status: 'Given' },
          { name: 'Inj. Omeprazole 40mg IV', route: 'IV', dose: '40mg', status: 'Given' },
          { name: 'Tab. Gabapentin 300mg Oral', route: 'Oral', dose: '300mg', status: 'Given' },
        ],
        intakeOralMl: 350,
        intakeIvMl: 500,
        outputUrineMl: 650,
        outputDrainMl: 0,
        nursingNotesUrdu: 'مریض ہوش و حواس میں ہے، پٹھوں کا کھنچاؤ کم ہوا ہے۔ درد کی دوا کے بعد سکون ہے۔ آئی وی لائن بالکل صاف ہے۔',
        nursingNotesEnglish: 'Patient is conscious and alert. Muscle stiffness decreased. Resting comfortably after analgesics. IV cannula site patent.',
        doctorAlertStatus: 'Normal',
      },
    ];
  });

  // Form State for new entry
  const [newLog, setNewLog] = useState<Partial<NursingVitalsEntry>>({
    timeSlot: '12:00 PM',
    bpSystolic: 120,
    bpDiastolic: 80,
    pulseRate: 74,
    temperature: 98.4,
    spO2: 98,
    respiratoryRate: 18,
    bloodSugarRBS: 120,
    painScale: 3,
    consciousness: 'Alert & Oriented',
    ivFluidType: 'Ringer Lactate (1000ml)',
    ivInfusionRate: '20 drops/min',
    ivVolumeInfusedMl: 400,
    cannulaSiteCondition: 'Healthy & Patent',
    medicationsAdministered: [
      { name: 'Inj. Ceftriaxone 1g IV in 100ml Saline', route: 'IV', dose: '1g', status: 'Given' },
      { name: 'Inj. Diclofenac 75mg IM (Deep Gluteal)', route: 'IM', dose: '75mg', status: 'Given' },
    ],
    intakeOralMl: 250,
    intakeIvMl: 400,
    outputUrineMl: 500,
    outputDrainMl: 0,
    nursingNotesUrdu: 'مریض کو دوپہر کی ادویات اور ڈرپ دی گئی۔ وائٹلز مکمل طور پر مستحکم ہیں۔',
    nursingNotesEnglish: 'Noon medications and IV fluids administered. All vital signs completely stable.',
    doctorAlertStatus: 'Normal',
  });

  const [notificationMsg, setNotificationMsg] = useState('');

  const handleNurseLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const staffList = INITIAL_STAFF_USERS;
    const matched = staffList.find(
      (u) =>
        (u.username.toLowerCase() === usernameInput.toLowerCase() || u.role === 'nurse') &&
        (passwordInput === 'nurse123' || passwordInput === 'admin123' || passwordInput === u.password)
    );

    if (matched && (matched.role === 'nurse' || matched.role === 'admin' || matched.role === 'ipd_incharge')) {
      if (onLogin) onLogin(matched);
      setAuthError('');
    } else {
      setAuthError(isUrdu ? 'غلط یوزر نام یا پاس ورڈ! برائے مہربانی نرس یوزر (nurse1) یا ایڈمن استعمال کریں۔' : 'Invalid credentials. Please use nurse username (nurse1 / nurse123).');
    }
  };

  const handleQuickDemoNurseLogin = () => {
    const nurseUser = INITIAL_STAFF_USERS.find((u) => u.username === 'nurse1') || {
      id: 'staff-nurse-1',
      username: 'nurse1',
      name: 'Staff Nurse Fouzia Parveen',
      nameUrdu: 'نرس فوزیہ پروین (سٹاف نرس)',
      role: 'nurse',
      department: 'Inpatient Nursing Station & Care Unit',
      isActive: true,
    };
    if (onLogin) onLogin(nurseUser as StaffUser);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) {
      alert(isUrdu ? 'برائے مہربانی پہلے داخل مریض منتخب کریں!' : 'Please select an admitted patient first!');
      return;
    }

    const logEntry: NursingVitalsEntry = {
      id: `NURSE-LOG-${Date.now()}`,
      admissionId: selectedAdmission.id,
      patientName: selectedAdmission.patientName,
      mrnNumber: selectedAdmission.mrnNumber,
      bedNumber: selectedAdmission.bedNumber,
      wardName: selectedAdmission.wardName || 'General Ward',
      timestamp: new Date().toISOString(),
      timeSlot: newLog.timeSlot || '12:00 PM',
      nurseName: currentUser?.name || 'Staff Nurse Fouzia Parveen',
      bpSystolic: Number(newLog.bpSystolic) || 120,
      bpDiastolic: Number(newLog.bpDiastolic) || 80,
      pulseRate: Number(newLog.pulseRate) || 72,
      temperature: Number(newLog.temperature) || 98.6,
      spO2: Number(newLog.spO2) || 98,
      respiratoryRate: Number(newLog.respiratoryRate) || 18,
      bloodSugarRBS: Number(newLog.bloodSugarRBS) || undefined,
      painScale: Number(newLog.painScale) || 0,
      consciousness: (newLog.consciousness as any) || 'Alert & Oriented',
      ivFluidType: newLog.ivFluidType || 'None',
      ivInfusionRate: newLog.ivInfusionRate || '0 drops/min',
      ivVolumeInfusedMl: Number(newLog.ivVolumeInfusedMl) || 0,
      cannulaSiteCondition: (newLog.cannulaSiteCondition as any) || 'Healthy & Patent',
      medicationsAdministered: newLog.medicationsAdministered || [],
      intakeOralMl: Number(newLog.intakeOralMl) || 0,
      intakeIvMl: Number(newLog.intakeIvMl) || 0,
      outputUrineMl: Number(newLog.outputUrineMl) || 0,
      outputDrainMl: Number(newLog.outputDrainMl) || 0,
      nursingNotesUrdu: newLog.nursingNotesUrdu || 'وائٹلز معمول کے مطابق ہیں۔',
      nursingNotesEnglish: newLog.nursingNotesEnglish || 'Vitals recorded within normal limits.',
      doctorAlertStatus: (newLog.doctorAlertStatus as any) || 'Normal',
    };

    const updated = [logEntry, ...vitalsLogs];
    setVitalsLogs(updated);
    localStorage.setItem('hc_nursing_vitals_logs_v2', JSON.stringify(updated));

    setNotificationMsg(isUrdu ? '✅ ۴ گھنٹے کی نرسنگ وائٹلز و ادویات شیٹ کامیابی سے محفوظ ہو گئی ہے!' : '✅ 4-Hourly nursing vitals & MAR chart successfully logged!');
    setActiveTab('sheet');
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const printNursingSheet = (patientLogs: NursingVitalsEntry[], patient: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>24-Hour Inpatient Nursing Care Sheet - ${patient?.patientName || 'Patient'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: bold; color: #047857; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .patient-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 13px; }
          .patient-box div strong { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 6px; text-align: center; }
          th { background-color: #047857; color: white; font-weight: bold; font-size: 11px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .abnormal { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 12px; }
          .sig-box { text-align: center; width: 200px; border-top: 1px dashed #94a3b8; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HAFIZ CLINIC & HOSPITAL • 24-HOUR NURSING CARE SHEET</div>
          <div class="subtitle">حافظ کلینک و ہسپتال — 24 گھنٹے ڈیجیٹل نرسنگ شیٹ و وائٹلز چارٹ</div>
        </div>

        <div class="patient-box">
          <div><strong>Patient Name:</strong> ${patient?.patientName || 'N/A'}</div>
          <div><strong>MRN Number:</strong> ${patient?.mrnNumber || 'N/A'}</div>
          <div><strong>Bed / Room:</strong> ${patient?.bedNumber || 'N/A'} (${patient?.wardName || 'Ward'})</div>
          <div><strong>Treating Consultant:</strong> ${patient?.treatingDoctor || 'Dr. Zeeshan Chaudhry'}</div>
          <div><strong>Diagnosis:</strong> ${patient?.diagnosis || 'N/A'}</div>
          <div><strong>Admission Date:</strong> ${patient?.admissionDate || 'N/A'}</div>
          <div><strong>Dietary Plan:</strong> ${patient?.dietaryPlan || 'Routine Soft Diet'}</div>
          <div><strong>Issuing Staff Nurse:</strong> ${currentUser?.name || 'Staff Nurse Fouzia'}</div>
        </div>

        <h3>1. 4-Hourly Vitals & Clinical Observation Timeline</h3>
        <table>
          <thead>
            <tr>
              <th>Time Slot</th>
              <th>BP (mmHg)</th>
              <th>Pulse (bpm)</th>
              <th>Temp (°F)</th>
              <th>SpO2 (%)</th>
              <th>RBS (mg/dL)</th>
              <th>Resp Rate</th>
              <th>Pain (0-10)</th>
              <th>IV Fluid & Drip Rate</th>
              <th>Fluid Balance (I/O)</th>
              <th>Staff Nurse</th>
            </tr>
          </thead>
          <tbody>
            ${patientLogs
              .map(
                (l) => `
              <tr>
                <td><strong>${l.timeSlot}</strong><br><small>${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
                <td class="${l.bpSystolic > 140 || l.bpDiastolic > 90 ? 'abnormal' : ''}">${l.bpSystolic}/${l.bpDiastolic}</td>
                <td>${l.pulseRate}</td>
                <td class="${l.temperature > 99.5 ? 'abnormal' : ''}">${l.temperature}</td>
                <td class="${l.spO2 < 95 ? 'abnormal' : ''}">${l.spO2}%</td>
                <td>${l.bloodSugarRBS ? `${l.bloodSugarRBS}` : '-'}</td>
                <td>${l.respiratoryRate}/min</td>
                <td>${l.painScale}/10</td>
                <td>${l.ivFluidType} (${l.ivInfusionRate})</td>
                <td>In: ${l.intakeOralMl + l.intakeIvMl}ml / Out: ${l.outputUrineMl}ml</td>
                <td>${l.nurseName}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h3>2. Medication Administration Record (MAR) & Nursing Notes</h3>
        <table>
          <thead>
            <tr>
              <th>Medicine / Injection</th>
              <th>Route</th>
              <th>Dose</th>
              <th>Status</th>
              <th>Clinical Observation & Nursing Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${patientLogs
              .flatMap((l) =>
                (l.medicationsAdministered || []).map(
                  (m) => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.route}</td>
                  <td>${m.dose}</td>
                  <td><span style="color: #047857; font-weight: bold;">✔ ${m.status}</span></td>
                  <td>${l.nursingNotesEnglish || l.nursingNotesUrdu}</td>
                </tr>
              `
                )
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="sig-box">Duty Staff Nurse Signature<br><small>${currentUser?.name || 'Staff Nurse'}</small></div>
          <div class="sig-box">Ward Nursing Supervisor<br><small>Sister Shamaila Akhtar</small></div>
          <div class="sig-box">Attending Consultant Signature<br><small>${patient?.treatingDoctor || 'Treating Doctor'}</small></div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // If not logged in as Nurse or Admin, show Clean White Auth Barrier
  if (!isNurseAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden space-y-6 p-8">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-[11px] font-bold">
              INPATIENT NURSING STATION • شعبہ نرسنگ
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isUrdu ? 'نرسنگ کیئر لاگ ان پورٹل' : 'Nursing Station Portal'}
            </h2>
            <p className="text-xs text-slate-600">
              {isUrdu ? 'داخل مریضوں کی ۴ گھنٹے کی وائٹلز و ادویات شیٹ' : '4-Hourly vitals monitoring, IV infusion & MAR charts'}
            </p>
          </div>

          <form onSubmit={handleNurseLogin} className="space-y-4 text-xs font-semibold">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 mb-1.5 font-bold">
                {isUrdu ? 'نرس یوزر نام (Staff Username)' : 'Nurse Username'}
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="nurse1"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1.5 font-bold">
                {isUrdu ? 'پاس ورڈ (Password)' : 'Password'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isUrdu ? 'لاگ ان کریں (Nurse Sign In)' : 'Sign In to Nursing Portal'}</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemoNurseLogin}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-emerald-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? '⚡ فوری ٹیسٹنگ لاگ ان (Demo Nurse: nurse1)' : '⚡ Auto Fill Demo Nurse (nurse1)'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter logs for selected patient
  const patientLogs = vitalsLogs.filter((l) => l.admissionId === selectedAdmission?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Banner / Staff Status - Clean White Theme */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Heart className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                {isUrdu ? 'نرسنگ کیئر اسٹیشن و ۴ گھنٹے کا وائٹلز چارٹ' : 'Inpatient Nursing Care Station & Vitals Chart'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                LIVE 4-HOURLY MAR
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isUrdu ? 'ڈیوٹی نرس:' : 'On-Duty Nurse:'} <strong className="text-emerald-800 font-bold">{currentUser.name}</strong> ({currentUser.department || 'Inpatient Care Unit'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </header>

      {notificationMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button onClick={() => setNotificationMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('bed_status')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bed_status'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>{isUrdu ? `وارڈ بیڈز و داخل مریض (${admissions.length})` : `Admitted Ward Beds (${admissions.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('log_vitals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'log_vitals'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا وائٹلز لاگ کریں (+ New Entry)' : '+ Record 4-Hourly Vitals'}</span>
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isUrdu ? '۲۴ گھنٹے نرسنگ چارٹ (View History)' : '24-Hour Nursing Vitals Timeline'}</span>
            </button>
          </div>

          {selectedAdmission && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500 font-bold">{isUrdu ? 'منتخب مریض:' : 'Active Patient:'}</span>
              <span className="font-bold text-slate-900">{selectedAdmission.patientName}</span>
              <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-mono font-bold">
                {selectedAdmission.bedNumber}
              </span>
            </div>
          )}
        </div>

        {/* TAB 1: BED STATUS & ADMITTED PATIENTS SELECTOR */}
        {activeTab === 'bed_status' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admissions.map((patient) => {
                const isSelected = selectedAdmission?.id === patient.id;
                const latestLog = vitalsLogs.find((l) => l.admissionId === patient.id);

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedAdmission(patient)}
                    className={`cursor-pointer p-5 rounded-3xl border transition-all duration-200 bg-white ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-mono font-bold">
                        {patient.bedNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">{patient.mrnNumber}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-1">{patient.patientName}</h3>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-1">{patient.diagnosis || 'Post Operative Care'}</p>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-3">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">{isUrdu ? 'آخری BP:' : 'Latest BP:'}</span>
                        <span className="font-mono font-bold text-slate-800">
                          {latestLog ? `${latestLog.bpSystolic}/${latestLog.bpDiastolic} mmHg` : 'Not recorded'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">{isUrdu ? 'آکسیجن SpO2:' : 'SpO2 Level:'}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {latestLog ? `${latestLog.spO2}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">{isUrdu ? 'نبض (Pulse):' : 'Pulse Rate:'}</span>
                        <span className="font-mono font-bold text-slate-800">
                          {latestLog ? `${latestLog.pulseRate} bpm` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">{isUrdu ? 'آئی وی ڈرپ:' : 'IV Fluid:'}</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {latestLog ? latestLog.ivFluidType.split('(')[0] : 'Normal Saline'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 text-[11px] truncate max-w-[170px]">{patient.treatingDoctor}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAdmission(patient);
                          setActiveTab('log_vitals');
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        {isUrdu ? '+ وائٹلز درج کریں' : '+ Log Vitals'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LOG NEW 4-HOURLY VITALS & MAR ENTRY */}
        {activeTab === 'log_vitals' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isUrdu ? '۴ گھنٹے کی نرسنگ وائٹلز و ادویات لاگ شیٹ' : 'Log 4-Hourly Patient Vitals & Medication (MAR)'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isUrdu ? 'مریض:' : 'Patient:'} <strong className="text-slate-900">{selectedAdmission?.patientName}</strong> | {isUrdu ? 'بیڈ:' : 'Bed:'}{' '}
                  <strong className="text-emerald-800">{selectedAdmission?.bedNumber}</strong> ({selectedAdmission?.wardName})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">{isUrdu ? 'راؤنڈ سلاٹ:' : 'Time Slot:'}</label>
                <select
                  value={newLog.timeSlot}
                  onChange={(e) => setNewLog({ ...newLog, timeSlot: e.target.value as any })}
                  className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="08:00 AM">08:00 AM — Morning Shift Round (صبح راؤنڈ)</option>
                  <option value="12:00 PM">12:00 PM — Noon Shift Round (دوپہر راؤنڈ)</option>
                  <option value="04:00 PM">04:00 PM — Evening Shift Round (شام راؤنڈ)</option>
                  <option value="08:00 PM">08:00 PM — Night Shift Round (رات راؤنڈ)</option>
                  <option value="12:00 AM">12:00 AM — Midnight Round (آدھی رات راؤنڈ)</option>
                  <option value="04:00 AM">04:00 AM — Early Morning Round (فجر راؤنڈ)</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-6 text-xs">
              {/* Section 1: Core Vitals */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>1. Core Vital Signs (مریض کے بنیادی وائٹلز)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">BP Systolic (سسٹولک)</label>
                    <input
                      type="number"
                      value={newLog.bpSystolic}
                      onChange={(e) => setNewLog({ ...newLog, bpSystolic: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">BP Diastolic (ڈائسٹولک)</label>
                    <input
                      type="number"
                      value={newLog.bpDiastolic}
                      onChange={(e) => setNewLog({ ...newLog, bpDiastolic: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pulse (نبض bpm)</label>
                    <input
                      type="number"
                      value={newLog.pulseRate}
                      onChange={(e) => setNewLog({ ...newLog, pulseRate: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="72"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Temp (°F بخار)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newLog.temperature}
                      onChange={(e) => setNewLog({ ...newLog, temperature: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="98.6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">SpO2 (آکسیجن %)</label>
                    <input
                      type="number"
                      value={newLog.spO2}
                      onChange={(e) => setNewLog({ ...newLog, spO2: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="98"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Blood Sugar RBS (mg/dL)</label>
                    <input
                      type="number"
                      value={newLog.bloodSugarRBS || ''}
                      onChange={(e) => setNewLog({ ...newLog, bloodSugarRBS: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: IV Fluid & Infusion Rate */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span>2. IV Fluid & Infusion Management (آئی وی ڈرپ و کینولہ)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">IV Fluid Type (ڈرپ کی قسم)</label>
                    <select
                      value={newLog.ivFluidType}
                      onChange={(e) => setNewLog({ ...newLog, ivFluidType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Normal Saline 0.9% (1000ml)">Normal Saline 0.9% (1000ml)</option>
                      <option value="Ringer Lactate RL (1000ml)">Ringer Lactate RL (1000ml)</option>
                      <option value="Dextrose 5% in Water (500ml)">Dextrose 5% in Water (500ml)</option>
                      <option value="Dextrose Saline 5% (1000ml)">Dextrose Saline 5% (1000ml)</option>
                      <option value="None / Cannula Heparin Lock">None / Cannula Heparin Lock (بغیر ڈرپ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Drip Flow Rate (رفتار)</label>
                    <input
                      type="text"
                      value={newLog.ivInfusionRate}
                      onChange={(e) => setNewLog({ ...newLog, ivInfusionRate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="25 drops/min (80 ml/hr)"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cannula Condition (کینولہ کی حالت)</label>
                    <select
                      value={newLog.cannulaSiteCondition}
                      onChange={(e) => setNewLog({ ...newLog, cannulaSiteCondition: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Healthy & Patent">Healthy & Patent (صاف اور رواں)</option>
                      <option value="Mild Redness">Mild Redness (ہلکی لالی - مانیٹر کریں)</option>
                      <option value="Phlebitis / Infiltration">Infiltration (سوجن - فوری تبدیل کریں)</option>
                      <option value="Flushed">Flushed (ہائپرین فلش شدہ)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Fluid Intake & Output */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>3. Fluid Intake & Output Balance (مائع انٹیک و آؤٹ پٹ)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Oral Intake (خوراک ml)</label>
                    <input
                      type="number"
                      value={newLog.intakeOralMl}
                      onChange={(e) => setNewLog({ ...newLog, intakeOralMl: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">IV Fluid Infused (ڈرپ ml)</label>
                    <input
                      type="number"
                      value={newLog.intakeIvMl}
                      onChange={(e) => setNewLog({ ...newLog, intakeIvMl: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Urine Output (پیشاب ml)</label>
                    <input
                      type="number"
                      value={newLog.outputUrineMl}
                      onChange={(e) => setNewLog({ ...newLog, outputUrineMl: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-emerald-800"
                      placeholder="600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Drain / Vomitus (ڈرین ml)</label>
                    <input
                      type="number"
                      value={newLog.outputDrainMl}
                      onChange={(e) => setNewLog({ ...newLog, outputDrainMl: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Nursing Clinical Remarks */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>4. Nursing Notes & Doctor Alert (نرسنگ ریمارکس)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      {isUrdu ? 'نرسنگ کلینیکل نوٹس (اردو / انگریزی)' : 'Nursing Clinical Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={newLog.nursingNotesUrdu}
                      onChange={(e) => setNewLog({ ...newLog, nursingNotesUrdu: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="مریض کی موجودہ کیفیت، درد کی شدت، اور ادویات کے ردعمل کے بارے میں لکھیں..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'ڈاکٹر الرٹ سٹیٹس:' : 'Doctor Alert Status:'}</label>
                    <select
                      value={newLog.doctorAlertStatus}
                      onChange={(e) => setNewLog({ ...newLog, doctorAlertStatus: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                        newLog.doctorAlertStatus === 'Critical Doctor Alerted'
                          ? 'border-rose-300 text-rose-800 bg-rose-50'
                          : 'border-slate-300 text-slate-900 bg-slate-50'
                      }`}
                    >
                      <option value="Normal">🟢 Stable & Normal (مستحکم و نارمل)</option>
                      <option value="Urgent Review Needed">🟡 Review Needed (ڈاکٹر معائنہ کرے)</option>
                      <option value="Critical Doctor Alerted">🔴 Critical Alert (ایمرجنسی کال)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('sheet')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUrdu ? 'شیٹ میں محفوظ کریں (Save 4-Hourly Entry)' : 'Save 4-Hourly Vitals Log'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: 24-HOUR NURSING CHART & VITALS TIMELINE */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {selectedAdmission?.patientName} — 24-Hour Inpatient Nursing Vitals Chart
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isUrdu ? 'بیڈ:' : 'Bed:'} <strong className="text-emerald-800">{selectedAdmission?.bedNumber}</strong> | MRN:{' '}
                  <strong className="text-emerald-800 font-mono">{selectedAdmission?.mrnNumber}</strong>
                </p>
              </div>

              <button
                onClick={() => printNursingSheet(patientLogs, selectedAdmission)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isUrdu ? 'پرنٹ ۲۴ گھنٹے نرسنگ شیٹ (Print Sheet)' : 'Print Official 24-Hr Nursing Chart'}</span>
              </button>
            </div>

            {patientLogs.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl">
                <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  {isUrdu ? 'اس مریض کے لیے ابھی کوئی وائٹلز ریکارڈ موجود نہیں ہے' : 'No vitals recorded yet for this patient.'}
                </p>
                <button
                  onClick={() => setActiveTab('log_vitals')}
                  className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isUrdu ? '+ پہلا وائٹلز لاگ درج کریں' : '+ Log First Vitals'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3.5 text-center">Time Slot</th>
                      <th className="p-3.5 text-center">Blood Pressure</th>
                      <th className="p-3.5 text-center">Pulse / Temp</th>
                      <th className="p-3.5 text-center">SpO2 / Sugar</th>
                      <th className="p-3.5">IV Fluid & Infusion</th>
                      <th className="p-3.5">Fluid Balance (I/O)</th>
                      <th className="p-3.5">Clinical Remarks</th>
                      <th className="p-3.5 text-center">Staff Nurse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-slate-900 font-mono">{log.timeSlot}</span>
                          <span className="block text-[10px] text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`font-mono font-bold ${
                              log.bpSystolic > 140 || log.bpDiastolic > 90 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-900'
                            }`}
                          >
                            {log.bpSystolic}/{log.bpDiastolic}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">mmHg</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-slate-800 font-mono">{log.pulseRate} bpm</span>
                          <span
                            className={`block text-[10px] font-mono ${
                              log.temperature > 99.5 ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {log.temperature} °F
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-emerald-700 font-mono">{log.spO2}% SpO2</span>
                          <span className="block text-[10px] text-amber-700 font-mono font-bold">
                            {log.bloodSugarRBS ? `${log.bloodSugarRBS} mg/dL` : '-'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 block">{log.ivFluidType}</span>
                          <span className="text-[10px] text-emerald-700 font-mono">{log.ivInfusionRate}</span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-slate-700 text-[11px] block">
                            In: <strong>{log.intakeOralMl + log.intakeIvMl} ml</strong>
                          </span>
                          <span className="text-emerald-700 text-[11px] block font-bold">
                            Out: <strong>{log.outputUrineMl} ml</strong>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="text-slate-800 text-[11px] leading-relaxed max-w-xs">{log.nursingNotesUrdu}</p>
                          {log.doctorAlertStatus === 'Critical Doctor Alerted' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-bold">
                              🚨 Critical Doctor Alert
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center text-slate-600 font-bold text-[11px]">{log.nurseName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
