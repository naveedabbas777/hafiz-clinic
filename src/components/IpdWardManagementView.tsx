import React, { useState } from 'react';
import {
  Bed,
  Activity,
  FileText,
  UserPlus,
  HeartPulse,
  Syringe,
  Pill,
  Droplets,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  ShieldCheck,
  Printer,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  Plus,
  Sparkles,
  ClipboardList,
  Eye,
  Stethoscope,
  Building,
  RefreshCw
} from 'lucide-react';
import { WardBed, IPDAdmission, NursingCareLog, WardType, BedStatus, Doctor, ClinicSettings, StaffUser } from '../types';
import { INITIAL_WARD_BEDS, INITIAL_IPD_ADMISSIONS } from '../data/ipdWardData';

interface IpdWardManagementViewProps {
  doctors: Doctor[];
  language?: 'english' | 'urdu';
  clinicSettings?: ClinicSettings;
  currentUser?: StaffUser | null;
  onLogin?: (user: StaffUser) => void;
  onLogout?: () => void;
}

export const IpdWardManagementView: React.FC<IpdWardManagementViewProps> = ({
  doctors = [],
  language = 'urdu',
  clinicSettings,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const isUrdu = language === 'urdu';

  // State
  const [bedsList, setBedsList] = useState<WardBed[]>(() => {
    const saved = localStorage.getItem('hc_ipd_beds');
    return saved ? JSON.parse(saved) : INITIAL_WARD_BEDS;
  });

  const [admissionsList, setAdmissionsList] = useState<IPDAdmission[]>(() => {
    const saved = localStorage.getItem('hc_ipd_admissions');
    return saved ? JSON.parse(saved) : INITIAL_IPD_ADMISSIONS;
  });

  const [activeTab, setActiveTab] = useState<'beds' | 'nursing' | 'discharge_records' | 'admit_patient'>('beds');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [selectedPatientForNursing, setSelectedPatientForNursing] = useState<IPDAdmission | null>(null);
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<IPDAdmission | null>(null);
  const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<WardBed | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDischargeDoc, setViewingDischargeDoc] = useState<IPDAdmission | null>(null);

  // New Nursing Round Form State
  const [isAddNursingModalOpen, setIsAddNursingModalOpen] = useState(false);
  const [nursingRoundShift, setNursingRoundShift] = useState<NursingCareLog['roundShift']>('Morning (08:00 AM)');
  const [nurseName, setNurseName] = useState('نرس فوزیہ پروین');
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [pulseRate, setPulseRate] = useState<number>(78);
  const [temperatureF, setTemperatureF] = useState<number>(98.6);
  const [spo2Percentage, setSpo2Percentage] = useState<number>(98);
  const [bloodSugar, setBloodSugar] = useState<number>(120);
  const [painScale, setPainScale] = useState<number>(2);
  const [ivFluidsDrip, setIvFluidsDrip] = useState('Normal Saline 1000ml @ 30 drops/min');
  const [injectionsGiven, setInjectionsGiven] = useState('Inj. Omeprazole 40mg IV');
  const [oralMeds, setOralMeds] = useState('حوراب شربت اکسیر معدہ 2 چمچ');
  const [urineOutputMl, setUrineOutputMl] = useState<number>(800);
  const [clinicalNotes, setClinicalNotes] = useState('مریض پرسکون ہے۔ درد میں نمایاں افاقہ ہے۔');

  // New Admission Form State
  const [newPtName, setNewPtName] = useState('');
  const [newPtAge, setNewPtAge] = useState<number>(40);
  const [newPtGender, setNewPtGender] = useState<'Male' | 'Female'>('Male');
  const [newPtPhone, setNewPtPhone] = useState('');
  const [newPtCnic, setNewPtCnic] = useState('');
  const [newPtAddress, setNewPtAddress] = useState('');
  const [newPtEmergencyName, setNewPtEmergencyName] = useState('');
  const [newPtEmergencyPhone, setNewPtEmergencyPhone] = useState('');
  const [newPtEmergencyRelation, setNewPtEmergencyRelation] = useState('Brother');
  const [newPtDoctorId, setNewPtDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [newPtBedId, setNewPtBedId] = useState('');
  const [newPtDiagnosis, setNewPtDiagnosis] = useState('');
  const [newPtReason, setNewPtReason] = useState('');
  const [newPtAdvance, setNewPtAdvance] = useState<number>(10000);
  const [newPtPayMethod, setNewPtPayMethod] = useState<'Cash' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer'>('Cash');

  // Discharge Modal Form State
  const [dcDiagnosis, setDcDiagnosis] = useState('');
  const [dcCondition, setDcCondition] = useState<IPDAdmission['dischargeDetails']['conditionAtDischarge']>('Recovered / Stable');
  const [dcSummary, setDcSummary] = useState('');
  const [dcAdvice, setDcAdvice] = useState('');
  const [dcWarningSigns, setDcWarningSigns] = useState('اگر تیز بخار، شدید درد یا سانس لینے میں دشواری ہو تو فوری ایمرجنسی رجوع کریں۔');
  const [dcFollowUpDate, setDcFollowUpDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [dcMedicines, setDcMedicines] = useState([
    { medicineName: 'حوراب اکسیر معدہ شربت', dosage: '2 چمچ', frequency: 'صبح و شام بعد از کھانا', durationDays: 15, instructions: 'پانی میں ملا کر پیئیں' },
    { medicineName: 'حب شفا اعصاب', dosage: '1 گولی', frequency: 'رات کو سوتے وقت', durationDays: 10, instructions: 'نیم گرم دودھ کے ساتھ' },
  ]);
  const [dcDoctorFee, setDcDoctorFee] = useState<number>(3000);
  const [dcNursingFee, setDcNursingFee] = useState<number>(2000);
  const [dcPharmacyFee, setDcPharmacyFee] = useState<number>(3500);
  const [dcLabFee, setDcLabFee] = useState<number>(2500);
  const [dcDiscount, setDcDiscount] = useState<number>(1000);

  // Sync to localStorage
  const saveAdmissions = (updated: IPDAdmission[]) => {
    setAdmissionsList(updated);
    localStorage.setItem('hc_ipd_admissions', JSON.stringify(updated));
  };

  const saveBeds = (updated: WardBed[]) => {
    setBedsList(updated);
    localStorage.setItem('hc_ipd_beds', JSON.stringify(updated));
  };

  // Stats
  const totalBeds = bedsList.length;
  const occupiedBeds = bedsList.filter((b) => b.status === 'Occupied').length;
  const availableBeds = bedsList.filter((b) => b.status === 'Available').length;
  const cleaningBeds = bedsList.filter((b) => b.status === 'Cleaning' || b.status === 'Under Maintenance').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const activeAdmissions = admissionsList.filter((a) => a.status === 'Admitted');
  const dischargedAdmissions = admissionsList.filter((a) => a.status === 'Discharged');

  // Filtered beds
  const filteredBeds = bedsList.filter((b) => {
    if (selectedWardFilter !== 'all' && b.wardType !== selectedWardFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.bedNumber.toLowerCase().includes(q) ||
        b.wardName.toLowerCase().includes(q) ||
        (b.currentPatientName && b.currentPatientName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle Bed Status Update
  const handleUpdateBedStatus = (bedId: string, newStatus: BedStatus) => {
    const updated = bedsList.map((b) => {
      if (b.id === bedId) {
        return {
          ...b,
          status: newStatus,
          currentAdmissionId: newStatus === 'Available' ? undefined : b.currentAdmissionId,
          currentPatientName: newStatus === 'Available' ? undefined : b.currentPatientName,
          admittedSince: newStatus === 'Available' ? undefined : b.admittedSince,
        };
      }
      return b;
    });
    saveBeds(updated);
  };

  // Handle Create New Admission
  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtName || !newPtPhone || !newPtBedId) {
      alert(isUrdu ? 'براہ کرم مریض کا نام، فون نمبر اور بیڈ منتخب کریں!' : 'Please fill all required fields!');
      return;
    }

    const targetBed = bedsList.find((b) => b.id === newPtBedId);
    if (!targetBed) return;

    const assignedDoctor = doctors.find((d) => d.id === newPtDoctorId) || doctors[0];
    const docName = assignedDoctor ? (isUrdu ? (assignedDoctor.nameUrdu || assignedDoctor.nameEnglish) : assignedDoctor.nameEnglish) : 'Dr. Zeeshan Chaudhry';

    const newAdmId = `IPD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newAdm: IPDAdmission = {
      id: newAdmId,
      admissionNumber: newAdmId,
      mrn: newMrn,
      patientName: newPtName,
      patientAge: Number(newPtAge) || 30,
      patientGender: newPtGender,
      patientPhone: newPtPhone,
      cnicNumber: newPtCnic,
      address: newPtAddress,
      emergencyContactName: newPtEmergencyName || 'وارث مریض',
      emergencyContactPhone: newPtEmergencyPhone || newPtPhone,
      emergencyRelation: newPtEmergencyRelation,
      admittingDoctorId: assignedDoctor?.id || 'doc-1',
      admittingDoctorName: docName,
      admittingDoctorSpecialty: assignedDoctor?.specializationUrdu || assignedDoctor?.specializationEnglish || 'General Medicine',
      admissionDate: new Date().toISOString().split('T')[0],
      admissionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      wardName: targetBed.wardName,
      wardType: targetBed.wardType,
      provisionalDiagnosis: newPtDiagnosis || 'زیر تشخیص و نگہداشت (Under Observation)',
      admissionReasonUrdu: newPtReason || 'نگہداشت اور علاج کی غرض سے داخل کیا گیا۔',
      initialVitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 80,
        temperatureF: 98.6,
        spo2: 98,
      },
      dailyBedRatePKR: targetBed.dailyRentPKR,
      advanceDepositPaidPKR: Number(newPtAdvance) || 0,
      depositPaymentMethod: newPtPayMethod,
      nursingLogs: [],
      doctorVisitNotes: [],
      status: 'Admitted',
      createdAt: new Date().toISOString(),
    };

    // Update Bed
    const updatedBeds = bedsList.map((b) => {
      if (b.id === targetBed.id) {
        return {
          ...b,
          status: 'Occupied' as BedStatus,
          currentAdmissionId: newAdmId,
          currentPatientName: newPtName,
          admittedSince: new Date().toISOString().split('T')[0],
        };
      }
      return b;
    });

    saveBeds(updatedBeds);
    saveAdmissions([newAdm, ...admissionsList]);

    alert(isUrdu ? `مریض ${newPtName} کو کامیابی سے بیڈ ${targetBed.bedNumber} پر داخل کر دیا گیا!` : `Patient successfully admitted to Bed ${targetBed.bedNumber}!`);
    setActiveTab('beds');
    // Reset
    setNewPtName('');
    setNewPtPhone('');
    setNewPtBedId('');
    setSelectedBedForAdmission(null);
  };

  // Handle Add Nursing Log
  const handleSaveNursingLog = () => {
    if (!selectedPatientForNursing) return;

    const newLog: NursingCareLog = {
      id: `nlog-${Date.now()}`,
      admissionId: selectedPatientForNursing.id,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      roundShift: nursingRoundShift,
      nurseName: nurseName || 'نرس انچارج',
      vitals: {
        bpSystolic: Number(bpSystolic) || 120,
        bpDiastolic: Number(bpDiastolic) || 80,
        pulseRate: Number(pulseRate) || 75,
        temperatureF: Number(temperatureF) || 98.6,
        spo2Percentage: Number(spo2Percentage) || 98,
        randomBloodSugar: Number(bloodSugar) || 120,
        painScale: Number(painScale) || 1,
      },
      ivFluidsDrip: ivFluidsDrip,
      injectionsGiven: injectionsGiven ? injectionsGiven.split(',').map((s) => s.trim()) : [],
      oralMedicationsGiven: oralMeds ? oralMeds.split(',').map((s) => s.trim()) : [],
      intakeOutput: {
        urineOutputMl: Number(urineOutputMl) || 0,
        bowelMovement: 'Normal',
      },
      clinicalNotes: clinicalNotes,
      doctorNotified: bpSystolic > 150 || temperatureF > 101,
    };

    const updatedAdmissions = admissionsList.map((adm) => {
      if (adm.id === selectedPatientForNursing.id) {
        return {
          ...adm,
          nursingLogs: [...adm.nursingLogs, newLog],
        };
      }
      return adm;
    });

    saveAdmissions(updatedAdmissions);
    setSelectedPatientForNursing({
      ...selectedPatientForNursing,
      nursingLogs: [...selectedPatientForNursing.nursingLogs, newLog],
    });
    setIsAddNursingModalOpen(false);
    alert(isUrdu ? 'نرسنگ راؤنڈ اور وائٹلز چارٹ میں نیا لاگ شامل کر دیا گیا!' : 'Nursing Round Log successfully saved!');
  };

  // Open Discharge Modal
  const handleOpenDischargeModal = (adm: IPDAdmission) => {
    setSelectedPatientForDischarge(adm);
    setDcDiagnosis(adm.provisionalDiagnosis);
    setDcSummary(isUrdu ? 'مریض ہسپتال میں مکمل نگہداشت اور علاج کے بعد صحت یاب ہو چکا ہے۔ تمام وائٹلز نارمل ہیں۔' : 'Patient treated successfully and discharged in stable condition.');
    setDcAdvice(isUrdu ? 'کھانے پینے میں پرہیز کریں۔ چکنائی اور مرچ مصالحہ بند رکھیں۔ دوائی وقت پر استعمال کریں۔' : 'Avoid oily foods, rest adequately, take prescribed medications on schedule.');
  };

  // Process Discharge & Final Bill
  const handleConfirmDischarge = () => {
    if (!selectedPatientForDischarge) return;

    const adm = selectedPatientForDischarge;
    // Calculate stay days
    const admDate = new Date(adm.admissionDate).getTime();
    const today = new Date().getTime();
    const stayDays = Math.max(1, Math.ceil((today - admDate) / (1000 * 3600 * 24)));

    const bedRentTotal = stayDays * adm.dailyBedRatePKR;
    const gross = bedRentTotal + dcDoctorFee + dcNursingFee + dcPharmacyFee + dcLabFee;
    const net = Math.max(0, gross - adm.advanceDepositPaidPKR - dcDiscount);

    const dischargeDetails: NonNullable<IPDAdmission['dischargeDetails']> = {
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      finalDiagnosis: dcDiagnosis || adm.provisionalDiagnosis,
      conditionAtDischarge: dcCondition,
      hospitalCourseSummaryUrdu: dcSummary,
      dischargeAdviceUrdu: dcAdvice,
      dischargeMedications: dcMedicines,
      followUpDate: dcFollowUpDate,
      emergencyWarningSignsUrdu: dcWarningSigns,
      dischargingDoctorName: adm.admittingDoctorName,
      stayDays: stayDays,
      bedRentTotalPKR: bedRentTotal,
      nursingCareTotalPKR: dcNursingFee,
      doctorConsultationVisitsTotalPKR: dcDoctorFee,
      pharmacyMedicationsTotalPKR: dcPharmacyFee,
      labInvestigationsTotalPKR: dcLabFee,
      procedureChargesPKR: 0,
      grossTotalPKR: gross,
      advanceDeductedPKR: adm.advanceDepositPaidPKR,
      discountDiscountPKR: dcDiscount,
      netBalancePayablePKR: net,
      paymentStatus: 'Paid & Cleared',
      paymentMethod: 'Cash / Direct Counter',
      clearanceReceiptNo: `CLR-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    const updatedAdmissions = admissionsList.map((a) => {
      if (a.id === adm.id) {
        return {
          ...a,
          status: 'Discharged' as const,
          dischargeDetails: dischargeDetails,
        };
      }
      return a;
    });

    // Vacate bed and mark cleaning
    const updatedBeds = bedsList.map((b) => {
      if (b.id === adm.bedId) {
        return {
          ...b,
          status: 'Cleaning' as BedStatus,
          currentAdmissionId: undefined,
          currentPatientName: undefined,
          admittedSince: undefined,
        };
      }
      return b;
    });

    saveAdmissions(updatedAdmissions);
    saveBeds(updatedBeds);

    const dischargedAdm = updatedAdmissions.find((a) => a.id === adm.id);
    setSelectedPatientForDischarge(null);
    if (dischargedAdm) {
      setViewingDischargeDoc(dischargedAdm);
    }
    alert(isUrdu ? 'مریض کی ڈسچارج سمری اور فائنل کلیئرنس بل کامیابی سے تیار ہو گیا ہے!' : 'Discharge Summary & Clearance Bill generated successfully!');
  };

  return (
    <div className={`space-y-6 ${isUrdu ? 'font-urdu text-right' : 'text-left'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Header Card - Clean White Medical Theme */}
      <div className="bg-white border border-slate-200 text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold mb-3">
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? 'حافظ کلینک اینڈ ہربل ہسپتال • شعبہ داخل مریضاں (IPD)' : 'Hafiz Clinic • Inpatient Department (IPD)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Bed className="w-8 h-8 text-emerald-700" />
              <span>{isUrdu ? 'وارڈ، بیڈ مینجمنٹ و نرسنگ کیئر سسٹم' : 'Ward & Bed Management, Nursing Chart'}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {isUrdu
                ? 'وارڈز اور پرائیویٹ رومز کی لائیو دستیابی، ہر ۴ گھنٹے بعد ڈیجیٹل نرسنگ راؤنڈز، وائٹلز مانیٹرنگ اور جامع ڈسچارج سمری بل'
                : 'Live ward & private room occupancy, 4-hourly digital nursing charts, vitals trending, and official discharge clearance billing.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setSelectedBedForAdmission(null);
                setActiveTab('admit_patient');
              }}
              className="flex-1 md:flex-none px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا داخلہ کریں (New Admission)' : 'Admit New Patient'}</span>
            </button>
          </div>
        </div>

        {/* Live Hospital Occupancy KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-600 font-bold block">{isUrdu ? 'کل بیڈز (Total Beds)' : 'Total Beds'}</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-between">
              <span>{totalBeds}</span>
              <Building className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
            <span className="text-xs text-rose-800 font-bold block">{isUrdu ? 'مقبوضہ بیڈز (Occupied)' : 'Occupied Beds'}</span>
            <div className="text-2xl font-black text-rose-800 mt-1 flex items-center justify-between">
              <span>{occupiedBeds}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-full">{occupancyRate}%</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold block">{isUrdu ? 'دستیاب بیڈز (Available)' : 'Available Beds'}</span>
            <div className="text-2xl font-black text-emerald-800 mt-1 flex items-center justify-between">
              <span>{availableBeds}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
            <span className="text-xs text-amber-800 font-bold block">{isUrdu ? 'زیر صفائی / مینٹیننس' : 'Cleaning / Maint.'}</span>
            <div className="text-2xl font-black text-amber-800 mt-1 flex items-center justify-between">
              <span>{cleaningBeds}</span>
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab('beds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'beds'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>{isUrdu ? `🛏️ وارڈ و بیڈ گرڈ (${bedsList.length})` : `🛏️ Live Beds Grid (${bedsList.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('nursing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'nursing'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isUrdu ? `📋 داخل مریض و نرسنگ چارٹ (${activeAdmissions.length})` : `📋 Admitted Patients & Nursing (${activeAdmissions.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('discharge_records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'discharge_records'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{isUrdu ? `📜 ڈسچارج ریکارڈز و بلز (${dischargedAdmissions.length})` : `📜 Discharged Records (${dischargedAdmissions.length})`}</span>
        </button>

        <button
          onClick={() => {
            setSelectedBedForAdmission(null);
            setActiveTab('admit_patient');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'admit_patient'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isUrdu ? '➕ نیا داخلہ فارم (Admission Form)' : '➕ Patient Admission Form'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIVE WARD & BED GRID                                   */}
      {/* ============================================================== */}
      {activeTab === 'beds' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isUrdu ? 'بیڈ نمبر، وارڈ یا داخل مریض کے نام سے تلاش کریں...' : 'Search by Bed #, Ward, or Patient name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                  isUrdu ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
              />
            </div>

            {/* Ward Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {[
                { id: 'all', label: isUrdu ? 'تمام وارڈز' : 'All Wards' },
                { id: 'General Ward (Male)', label: isUrdu ? 'مردانہ وارڈ' : 'Male General' },
                { id: 'General Ward (Female)', label: isUrdu ? 'زنانہ وارڈ' : 'Female General' },
                { id: 'Private Deluxe Room', label: isUrdu ? 'پرائیویٹ رومز' : 'Private Rooms' },
                { id: 'Semi-Private Room', label: isUrdu ? 'سیمی پرائیویٹ' : 'Semi-Private' },
                { id: 'Emergency & Day Care', label: isUrdu ? 'ایمرجنسی' : 'Emergency' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWardFilter(w.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedWardFilter === w.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bed Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => {
              const isOccupied = bed.status === 'Occupied';
              const isAvailable = bed.status === 'Available';
              const isCleaning = bed.status === 'Cleaning' || bed.status === 'Under Maintenance';
              const matchingAdm = admissionsList.find((a) => a.id === bed.currentAdmissionId && a.status === 'Admitted');

              return (
                <div
                  key={bed.id}
                  className={`rounded-3xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isOccupied
                      ? 'bg-red-50/50 border-red-200'
                      : isAvailable
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div>
                    {/* Header: Bed Number & Status Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                            isOccupied
                              ? 'bg-red-600 text-white'
                              : isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          <Bed className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">{bed.bedNumber}</h3>
                          <span className="text-xs text-slate-500 block">{bed.floor}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-black border ${
                          isOccupied
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isOccupied
                          ? (isUrdu ? 'مریض داخل ہے' : 'Occupied')
                          : isAvailable
                          ? (isUrdu ? 'دستیاب / خالی' : 'Available')
                          : (isUrdu ? 'زیر صفائی' : 'Cleaning')}
                      </span>
                    </div>

                    {/* Ward Type & Daily Rent */}
                    <div className="space-y-1.5 my-3 pb-3 border-b border-slate-200/60 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500">{isUrdu ? 'وارڈ کیٹیگری:' : 'Ward Type:'}</span>
                        <span className="font-bold text-slate-900">{bed.wardType}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500">{isUrdu ? 'روزانہ کرایہ (24 Hrs):' : 'Daily Rent:'}</span>
                        <span className="font-black text-teal-800">Rs. {bed.dailyRentPKR.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Occupant Info if occupied */}
                    {isOccupied && (
                      <div className="bg-white/80 p-3 rounded-2xl border border-red-200 mb-3 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                          <User className="w-3.5 h-3.5 text-red-600" />
                          <span>{bed.currentPatientName || matchingAdm?.patientName || 'نامعلوم مریض'}</span>
                        </div>
                        {matchingAdm && (
                          <>
                            <div className="text-slate-600 flex justify-between">
                              <span>MRN:</span>
                              <span className="font-bold">{matchingAdm.mrn}</span>
                            </div>
                            <div className="text-slate-600 flex justify-between">
                              <span>معالج:</span>
                              <span className="font-bold text-emerald-800">{matchingAdm.admittingDoctorName}</span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex justify-between">
                              <span>داخلہ تاریخ:</span>
                              <span>{matchingAdm.admissionDate}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {bed.amenities.slice(0, 3).map((am, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {am}
                        </span>
                      ))}
                      {bed.amenities.length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                          +{bed.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    {isAvailable ? (
                      <button
                        onClick={() => {
                          setSelectedBedForAdmission(bed);
                          setNewPtBedId(bed.id);
                          setActiveTab('admit_patient');
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'مریض داخل کریں' : 'Admit Patient'}</span>
                      </button>
                    ) : isOccupied ? (
                      <div className="grid grid-cols-2 gap-1.5 w-full">
                        <button
                          onClick={() => {
                            if (matchingAdm) {
                              setSelectedPatientForNursing(matchingAdm);
                              setActiveTab('nursing');
                            }
                          }}
                          className="py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'نرسنگ چارٹ' : 'Vitals Sheet'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (matchingAdm) {
                              handleOpenDischargeModal(matchingAdm);
                            }
                          }}
                          className="py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isUrdu ? 'ڈسچارج بل' : 'Discharge'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateBedStatus(bed.id, 'Available')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'صفائی مکمل (Mark Available)' : 'Ready for Patient'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ACTIVE ADMITTED PATIENTS & 4-HOURLY NURSING CARE SHEET  */}
      {/* ============================================================== */}
      {activeTab === 'nursing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patients List Left Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>{isUrdu ? 'داخل مریضاں کی فہرست' : 'Currently Admitted Patients'}</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {activeAdmissions.length}
              </span>
            </h3>

            {activeAdmissions.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
                {isUrdu ? 'اس وقت وارڈز میں کوئی مریض داخل نہیں ہے۔' : 'No patients currently admitted.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeAdmissions.map((adm) => {
                  const isSelected = selectedPatientForNursing?.id === adm.id;
                  const latestLog = adm.nursingLogs[adm.nursingLogs.length - 1];

                  return (
                    <div
                      key={adm.id}
                      onClick={() => setSelectedPatientForNursing(adm)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-teal-900 text-white border-teal-800 shadow-md scale-[1.01]'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-sm">{adm.patientName}</h4>
                          <span className={isSelected ? 'text-teal-200' : 'text-slate-500'}>
                            {adm.patientAge} سال • {adm.patientGender === 'Male' ? 'مرد' : 'خاتون'} • {adm.mrn}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                            isSelected ? 'bg-teal-800 text-teal-100' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {adm.bedNumber}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] pt-2 border-t border-slate-200/30">
                        <div className="flex justify-between">
                          <span className={isSelected ? 'text-teal-200' : 'text-slate-500'}>معالج:</span>
                          <span className="font-bold">{adm.admittingDoctorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isSelected ? 'text-teal-200' : 'text-slate-500'}>تشخیص:</span>
                          <span className="font-medium truncate max-w-[180px]">{adm.provisionalDiagnosis}</span>
                        </div>
                        {latestLog && (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>تازہ ترین BP:</span>
                            <span>
                              {latestLog.vitals.bpSystolic}/{latestLog.vitals.bpDiastolic} mmHg (HR: {latestLog.vitals.pulseRate})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Patient Nursing & Vitals Sheet Detail View */}
          <div className="lg:col-span-8">
            {selectedPatientForNursing ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                {/* Patient Header & Quick Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-100 text-teal-800 px-3 py-0.5 rounded-full font-black text-xs">
                        {selectedPatientForNursing.bedNumber} ({selectedPatientForNursing.wardType})
                      </span>
                      <span className="text-xs text-slate-500 font-bold">MRN: {selectedPatientForNursing.mrn}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">{selectedPatientForNursing.patientName}</h2>
                    <p className="text-xs text-slate-600">
                      معالج: <strong className="text-teal-900">{selectedPatientForNursing.admittingDoctorName}</strong> • داخلہ: {selectedPatientForNursing.admissionDate} ({selectedPatientForNursing.admissionTime})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddNursingModalOpen(true)}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isUrdu ? 'نیا نرسنگ راؤنڈ (Log 4-Hourly Vitals)' : 'Record Vitals & Nursing Round'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenDischargeModal(selectedPatientForNursing)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{isUrdu ? 'ڈسچارج سمری بنائیں' : 'Discharge Patient'}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Diagnosis & Emergency Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-bold">{isUrdu ? 'ابتدائی تشخیص و وجہ داخلہ:' : 'Diagnosis:'}</span>
                    <p className="font-bold text-slate-900">{selectedPatientForNursing.provisionalDiagnosis}</p>
                    <p className="text-slate-600 mt-1 text-[11px]">{selectedPatientForNursing.admissionReasonUrdu}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-bold">{isUrdu ? 'الرجی الرٹس:' : 'Allergies:'}</span>
                    {selectedPatientForNursing.allergies && selectedPatientForNursing.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatientForNursing.allergies.map((al, i) => (
                          <span key={i} className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            ⚠️ {al}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">{isUrdu ? 'کوئی معلوم الرجی نہیں' : 'None reported'}</span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-bold">{isUrdu ? 'ایمرجنسی رابطہ / وارث:' : 'Emergency Contact:'}</span>
                    <p className="font-bold text-slate-900">{selectedPatientForNursing.emergencyContactName} ({selectedPatientForNursing.emergencyRelation})</p>
                    <p className="text-teal-800 font-bold mt-0.5">{selectedPatientForNursing.emergencyContactPhone}</p>
                  </div>
                </div>

                {/* 4-Hourly Nursing Logs Timeline */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-teal-600" />
                      <span>{isUrdu ? 'ڈیجیٹل نرسنگ راؤنڈز اور وائٹلز لاگ شیٹ' : 'Nursing Care & 4-Hourly Vitals Log'}</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {selectedPatientForNursing.nursingLogs.length} {isUrdu ? 'راؤنڈز ریکارڈ شدہ' : 'Rounds Logged'}
                    </span>
                  </div>

                  {selectedPatientForNursing.nursingLogs.length === 0 ? (
                    <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                      <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 font-bold">
                        {isUrdu ? 'اس مریض کے لیے ابھی کوئی نرسنگ راؤنڈ لاگ نہیں کیا گیا۔' : 'No nursing rounds logged yet.'}
                      </p>
                      <button
                        onClick={() => setIsAddNursingModalOpen(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'پہلا راؤنڈ درج کریں' : 'Log First Round'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedPatientForNursing.nursingLogs.map((log) => (
                        <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                          {/* Round Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-teal-800 text-white font-black rounded-lg text-xs">
                                {log.roundShift}
                              </span>
                              <span className="text-slate-500 font-bold">{log.timestamp}</span>
                            </div>
                            <div className="text-slate-600">
                              نرس انچارج: <strong className="text-slate-900">{log.nurseName}</strong>
                            </div>
                          </div>

                          {/* Vitals Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">BP (mmHg)</span>
                              <span className="font-black text-slate-900 text-sm">
                                {log.vitals.bpSystolic}/{log.vitals.bpDiastolic}
                              </span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Pulse (bpm)</span>
                              <span className="font-black text-slate-900 text-sm">{log.vitals.pulseRate}</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Temp (°F)</span>
                              <span className={`font-black text-sm ${log.vitals.temperatureF > 99.5 ? 'text-red-600' : 'text-slate-900'}`}>
                                {log.vitals.temperatureF}°
                              </span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">SpO2 (%)</span>
                              <span className="font-black text-teal-700 text-sm">{log.vitals.spo2Percentage || 98}%</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Sugar (mg/dl)</span>
                              <span className="font-black text-slate-900 text-sm">{log.vitals.randomBloodSugar || 115}</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Pain Scale</span>
                              <span className="font-black text-amber-700 text-sm">{log.vitals.painScale || 0}/10</span>
                            </div>
                          </div>

                          {/* Meds, Drips, Injections & Notes */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                            {log.ivFluidsDrip && (
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block text-[11px] font-bold flex items-center gap-1">
                                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                  <span>ڈرپ / IV فلوئڈز:</span>
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{log.ivFluidsDrip}</p>
                              </div>
                            )}

                            {log.injectionsGiven && log.injectionsGiven.length > 0 && (
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block text-[11px] font-bold flex items-center gap-1">
                                  <Syringe className="w-3.5 h-3.5 text-red-500" />
                                  <span>انجیکشنز:</span>
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{log.injectionsGiven.join(', ')}</p>
                              </div>
                            )}

                            {log.oralMedicationsGiven && log.oralMedicationsGiven.length > 0 && (
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block text-[11px] font-bold flex items-center gap-1">
                                  <Pill className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>زبانی دوائیں (Oral Meds):</span>
                                </span>
                                <p className="font-bold text-slate-900 mt-1">{log.oralMedicationsGiven.join(', ')}</p>
                              </div>
                            )}
                          </div>

                          {/* Nurse Clinical Observation */}
                          {log.clinicalNotes && (
                            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200/80 text-xs text-slate-800">
                              <span className="font-bold text-teal-900 block mb-0.5">نرسنگ مشاہدہ و کیفیت:</span>
                              <p>{log.clinicalNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Bed className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-black text-slate-700">{isUrdu ? 'مریض کا انتخاب کریں' : 'Select a Patient'}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isUrdu
                    ? 'بائیں جانب دی گئی فہرست میں سے کسی بھی داخل مریض پر کلک کر کے اس کا لائیو نرسنگ چارٹ اور وائٹلز دیکھیں۔'
                    : 'Click any admitted patient from the left list to view and record their 4-hourly nursing chart.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DISCHARGE RECORDS & CLEARANCE BILLS ARCHIVE              */}
      {/* ============================================================== */}
      {activeTab === 'discharge_records' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <span>{isUrdu ? 'ڈسچارج شدہ مریضوں کا ریکارڈ اور فائنل بلز' : 'Discharge Summary & Billing Records'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu ? 'ہسپتال سے فارغ ہونے والے مریضوں کی مکمل ڈسچارج رپورٹس اور وصولیوں کی تفصیلات' : 'Official discharge summaries and finalized IPD clearance invoices.'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              {dischargedAdmissions.length} {isUrdu ? 'ڈسچارج فائلز' : 'Records'}
            </span>
          </div>

          {dischargedAdmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {isUrdu ? 'فی الحال کوئی ڈسچارج ریکارڈ موجود نہیں ہے۔' : 'No discharged patient records found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-right">MRN / ڈسچارج نمبر</th>
                    <th className="p-3 text-right">مریض کا نام</th>
                    <th className="p-3 text-right">بیڈ و وارڈ</th>
                    <th className="p-3 text-right">ڈسچارج تاریخ</th>
                    <th className="p-3 text-right">کل قیام (Days)</th>
                    <th className="p-3 text-right">حتمی بل (Net Bill)</th>
                    <th className="p-3 text-right">اسٹیٹس</th>
                    <th className="p-3 text-center">ایکشن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dischargedAdmissions.map((dc) => (
                    <tr key={dc.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">
                        {dc.mrn}
                        <span className="block text-[11px] text-slate-500">{dc.dischargeDetails?.clearanceReceiptNo}</span>
                      </td>
                      <td className="p-3 font-bold">{dc.patientName}</td>
                      <td className="p-3 text-slate-600">{dc.bedNumber} ({dc.wardType})</td>
                      <td className="p-3 text-slate-600">{dc.dischargeDetails?.dischargeDate}</td>
                      <td className="p-3 font-bold text-teal-800">{dc.dischargeDetails?.stayDays} دن</td>
                      <td className="p-3 font-black text-emerald-700">
                        Rs. {dc.dischargeDetails?.netBalancePayablePKR.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-full text-[11px]">
                          {dc.dischargeDetails?.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewingDischargeDoc(dc)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'رپورٹ دیکھیں / پرنٹ' : 'Print View'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: NEW PATIENT ADMISSION FORM                              */}
      {/* ============================================================== */}
      {activeTab === 'admit_patient' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-teal-600" />
              <span>{isUrdu ? 'داخلہ فارم • شعبہ داخل مریضاں (IPD Admission Form)' : 'New IPD Patient Admission Form'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isUrdu ? 'مریض کی مکمل تفصیلات، بیڈ الاٹمنٹ اور ابتدائی ایڈوانس ڈپازٹ کا اندراج کریں' : 'Enter patient personal data, ward/bed selection, and advance deposit.'}
            </p>
          </div>

          <form onSubmit={handleCreateAdmission} className="space-y-6 text-xs">
            {/* Section 1: Patient Personal Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-teal-900 border-b pb-1">۱. مریض کے ذاتی کوائف</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'مریض کا پورا نام *' : 'Patient Full Name *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isUrdu ? 'مثال: محمد اقبال چیمہ' : 'e.g. Muhammad Iqbal'}
                    value={newPtName}
                    onChange={(e) => setNewPtName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'عمر (سال) *' : 'Age (Years) *'}</label>
                  <input
                    type="number"
                    required
                    value={newPtAge}
                    onChange={(e) => setNewPtAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'جنس (Gender) *' : 'Gender *'}</label>
                  <select
                    value={newPtGender}
                    onChange={(e) => setNewPtGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Male">{isUrdu ? 'مرد (Male)' : 'Male'}</option>
                    <option value="Female">{isUrdu ? 'خاتون (Female)' : 'Female'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'موبائل نمبر *' : 'Phone Number *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={newPtPhone}
                    onChange={(e) => setNewPtPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'شناختی کارڈ (CNIC)' : 'CNIC Number'}</label>
                  <input
                    type="text"
                    placeholder="35201-XXXXXXX-X"
                    value={newPtCnic}
                    onChange={(e) => setNewPtCnic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'رہائشی پتہ و شہر' : 'Address & City'}</label>
                  <input
                    type="text"
                    placeholder={isUrdu ? 'منڈی بہاؤالدین، پاکستان' : 'City/Town'}
                    value={newPtAddress}
                    onChange={(e) => setNewPtAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Emergency Contact & Attendant */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-teal-900 border-b pb-1">۲. ایمرجنسی رابطہ و وارث</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'وارث / تیماردار کا نام *' : 'Emergency Contact Name *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isUrdu ? 'مثال: علی حسن (بھائی)' : 'Attendant Name'}
                    value={newPtEmergencyName}
                    onChange={(e) => setNewPtEmergencyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'وارث کا موبائل نمبر *' : 'Emergency Phone *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="0301-7654321"
                    value={newPtEmergencyPhone}
                    onChange={(e) => setNewPtEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'رشتہ (Relation)' : 'Relationship'}</label>
                  <input
                    type="text"
                    placeholder={isUrdu ? 'بھائی / بیٹا / والد' : 'Brother / Son'}
                    value={newPtEmergencyRelation}
                    onChange={(e) => setNewPtEmergencyRelation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Ward Bed Allotment & Doctor */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-teal-900 border-b pb-1">۳. بیڈ الاٹمنٹ و معالج کا انتخاب</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'منتخب بیڈ و وارڈ *' : 'Select Bed *'}</label>
                  <select
                    required
                    value={newPtBedId}
                    onChange={(e) => setNewPtBedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  >
                    <option value="">{isUrdu ? '-- بیڈ منتخب کریں --' : '-- Select Available Bed --'}</option>
                    {bedsList
                      .filter((b) => b.status === 'Available' || b.id === selectedBedForAdmission?.id)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bedNumber} - {b.wardName} (Rs. {b.dailyRentPKR}/day)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'نگران معالج (Admitting Doctor) *' : 'Admitting Doctor *'}</label>
                  <select
                    value={newPtDoctorId}
                    onChange={(e) => setNewPtDoctorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {isUrdu ? (doc.nameUrdu || doc.nameEnglish) : doc.nameEnglish} ({doc.specializationEnglish})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'ابتدائی تشخیص / بیماری (Diagnosis) *' : 'Provisional Diagnosis *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isUrdu ? 'مثال: شدید معدہ السر و ڈی ہائیڈریشن' : 'e.g. Acute Gastroenteritis'}
                    value={newPtDiagnosis}
                    onChange={(e) => setNewPtDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'وجہ داخلہ و علامات' : 'Admission Notes / Symptoms'}</label>
                  <textarea
                    rows={2}
                    placeholder={isUrdu ? 'مسلسل الٹیاں، پیٹ میں شدید درد اور کمزوری...' : 'Admission details...'}
                    value={newPtReason}
                    onChange={(e) => setNewPtReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Advance Deposit & Billing */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-teal-900 border-b pb-1">۴. ایڈوانس ڈپازٹ (Advance Payment)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'پیشگی رقم (Advance Amount PKR) *' : 'Advance Amount PKR *'}</label>
                  <input
                    type="number"
                    required
                    value={newPtAdvance}
                    onChange={(e) => setNewPtAdvance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-black text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'طریقہ ادائیگی (Payment Method)' : 'Payment Method'}</label>
                  <select
                    value={newPtPayMethod}
                    onChange={(e) => setNewPtPayMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Cash">کیش (Cash Counter)</option>
                    <option value="JazzCash">جاز کیش (JazzCash)</option>
                    <option value="EasyPaisa">ایزی پیسہ (EasyPaisa)</option>
                    <option value="Bank Transfer">بینک ٹرانسفر (Bank Transfer)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('beds')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-black rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all"
              >
                {isUrdu ? 'مریض داخل کریں اور پرچی بنائیں' : 'Confirm Admission & Allot Bed'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD 4-HOURLY NURSING CARE LOG                           */}
      {/* ============================================================== */}
      {isAddNursingModalOpen && selectedPatientForNursing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-4 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-600" />
                  <span>{isUrdu ? '۴ گھنٹے بعد نرسنگ راؤنڈ و وائٹلز اندراج' : '4-Hourly Nursing Round Entry'}</span>
                </h3>
                <span className="text-slate-500 font-bold">
                  مریض: {selectedPatientForNursing.patientName} ({selectedPatientForNursing.bedNumber})
                </span>
              </div>
              <button
                onClick={() => setIsAddNursingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Shift & Nurse Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'راؤنڈ شفٹ ٹائم *' : 'Round Shift *'}</label>
                  <select
                    value={nursingRoundShift}
                    onChange={(e) => setNursingRoundShift(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                  >
                    <option value="Morning (08:00 AM)">Morning (08:00 AM)</option>
                    <option value="Afternoon (02:00 PM)">Afternoon (02:00 PM)</option>
                    <option value="Evening (08:00 PM)">Evening (08:00 PM)</option>
                    <option value="Night (02:00 AM)">Night (02:00 AM)</option>
                    <option value="Emergency / Special">Emergency / Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isUrdu ? 'نرس کا نام *' : 'Nurse Incharge *'}</label>
                  <input
                    type="text"
                    value={nurseName}
                    onChange={(e) => setNurseName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Vitals Input Grid */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-teal-900 block">وائٹلز سائنز (Vital Signs):</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">BP Systolic</label>
                    <input
                      type="number"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">BP Diastolic</label>
                    <input
                      type="number"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">Pulse (HR)</label>
                    <input
                      type="number"
                      value={pulseRate}
                      onChange={(e) => setPulseRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperatureF}
                      onChange={(e) => setTemperatureF(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2Percentage}
                      onChange={(e) => setSpo2Percentage(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-bold">Sugar (BSR)</label>
                    <input
                      type="number"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Drips, Injections & Meds */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">IV ڈرپ / فلوئڈز (Drip & Rate):</label>
                  <input
                    type="text"
                    value={ivFluidsDrip}
                    onChange={(e) => setIvFluidsDrip(e.target.value)}
                    placeholder="Normal Saline 1000ml @ 30 drops/min"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">انجیکشنز (Injections Given):</label>
                    <input
                      type="text"
                      value={injectionsGiven}
                      onChange={(e) => setInjectionsGiven(e.target.value)}
                      placeholder="Inj. Omeprazole 40mg IV"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">زبانی دوائیں (Oral Meds):</label>
                    <input
                      type="text"
                      value={oralMeds}
                      onChange={(e) => setOralMeds(e.target.value)}
                      placeholder="حوراب اکسیر معدہ 2 چمچ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">نرسنگ مشاہدہ و ہدایات (Nurse Notes):</label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddNursingModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                منسوخ
              </button>
              <button
                type="button"
                onClick={handleSaveNursingLog}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md cursor-pointer"
              >
                راؤنڈ محفوظ کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DISCHARGE SUMMARY & ITEMIZED CLEARANCE BILL             */}
      {/* ============================================================== */}
      {selectedPatientForDischarge && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-4 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-teal-600" />
                  <span>{isUrdu ? 'ڈسچارج سمری و حتمی کلیئرنس بل' : 'Discharge Summary & Itemized Final Bill'}</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  مریض: <strong className="text-slate-900">{selectedPatientForDischarge.patientName}</strong> • بیڈ: {selectedPatientForDischarge.bedNumber} ({selectedPatientForDischarge.wardType})
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientForDischarge(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Section 1: Clinical Discharge Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-teal-900 border-b pb-1">۱. کلینیکل ڈسچارج رپورٹس و ہدایات</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">حتمی تشخیص (Final Diagnosis) *</label>
                    <input
                      type="text"
                      value={dcDiagnosis}
                      onChange={(e) => setDcDiagnosis(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ڈسچارج پر کیفیت (Condition at Discharge) *</label>
                    <select
                      value={dcCondition}
                      onChange={(e) => setDcCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    >
                      <option value="Recovered / Stable">صحت یاب / مستحکم (Recovered / Stable)</option>
                      <option value="Improved">بہتری کی طرف (Improved)</option>
                      <option value="Referred to Tertiary Care">ریفر برائے مزید علاج (Referred)</option>
                      <option value="Critical / LAMA">بغیر اجازت رخصت (LAMA)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">ہسپتال میں کورس و علاج سمری (Hospital Course):</label>
                    <textarea
                      rows={2}
                      value={dcSummary}
                      onChange={(e) => setDcSummary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">گھر کے لیے پرہیز و ہدایات (Discharge Advice):</label>
                    <textarea
                      rows={2}
                      value={dcAdvice}
                      onChange={(e) => setDcAdvice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">دوبارہ معائنے کی تاریخ (Follow-up Date):</label>
                    <input
                      type="date"
                      value={dcFollowUpDate}
                      onChange={(e) => setDcFollowUpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ایمرجنسی علامات و وارننگ:</label>
                    <input
                      type="text"
                      value={dcWarningSigns}
                      onChange={(e) => setDcWarningSigns(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Itemized Financial Clearance Bill */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-black text-slate-900 border-b pb-1">۲. حتمی فنانشل بل و کلیرنس تفصیل</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">ڈاکٹر وزٹ فیس</span>
                    <input
                      type="number"
                      value={dcDoctorFee}
                      onChange={(e) => setDcDoctorFee(Number(e.target.value))}
                      className="w-full text-center font-bold text-slate-900 text-xs mt-1 border rounded p-1"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">نرسنگ کیئر چارجز</span>
                    <input
                      type="number"
                      value={dcNursingFee}
                      onChange={(e) => setDcNursingFee(Number(e.target.value))}
                      className="w-full text-center font-bold text-slate-900 text-xs mt-1 border rounded p-1"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">فارمیسی / ادویات بل</span>
                    <input
                      type="number"
                      value={dcPharmacyFee}
                      onChange={(e) => setDcPharmacyFee(Number(e.target.value))}
                      className="w-full text-center font-bold text-slate-900 text-xs mt-1 border rounded p-1"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">لیب ٹیسٹ چارجز</span>
                    <input
                      type="number"
                      value={dcLabFee}
                      onChange={(e) => setDcLabFee(Number(e.target.value))}
                      className="w-full text-center font-bold text-slate-900 text-xs mt-1 border rounded p-1"
                    />
                  </div>
                </div>

                {/* Net Bill Calculation Summary */}
                <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>ایڈوانس ڈپازٹ منہا:</span>
                    <span className="font-bold text-emerald-700">- Rs. {selectedPatientForDischarge.advanceDepositPaidPKR.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>رعایت (Special Discount):</span>
                    <input
                      type="number"
                      value={dcDiscount}
                      onChange={(e) => setDcDiscount(Number(e.target.value))}
                      className="w-24 text-right font-bold text-xs p-1 border rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPatientForDischarge(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                منسوخ
              </button>
              <button
                type="button"
                onClick={handleConfirmDischarge}
                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
              >
                ڈسچارج تصدیق کریں اور بل جاری کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* OFFICIAL PRINT PREVIEW: DISCHARGE SUMMARY & BILL RECEIPT       */}
      {/* ============================================================== */}
      {viewingDischargeDoc && viewingDischargeDoc.dischargeDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto text-xs text-slate-900 border print:border-none print:shadow-none">
            {/* Print Header */}
            <div className="flex justify-between items-start border-b-2 border-teal-800 pb-4">
              <div>
                <span className="text-xs bg-teal-900 text-white px-2.5 py-0.5 rounded font-black tracking-wider uppercase">
                  Official IPD Discharge Certificate
                </span>
                <h1 className="text-2xl font-black text-teal-900 mt-1">حافظ کلینک اینڈ ہربل ہسپتال</h1>
                <p className="text-slate-600 text-xs">
                  {clinicSettings?.tagline || 'شعبہ داخل مریضاں و ہربل ریسرچ سینٹر'} • پھالیہ روڈ، منڈی بہاؤالدین
                </p>
                <p className="text-slate-500 text-[11px]">ہیلپ لائن: {clinicSettings?.phone || '0300-1234567'} | فون: 0546-500000</p>
              </div>

              <div className="text-left" dir="ltr">
                <span className="text-xs font-bold text-slate-500 block">RECEIPT / DISCHARGE NO:</span>
                <span className="font-black text-sm text-teal-800">{viewingDischargeDoc.dischargeDetails.clearanceReceiptNo}</span>
                <span className="text-[11px] text-slate-500 block mt-1">MRN: {viewingDischargeDoc.mrn}</span>
                <span className="text-[11px] text-slate-500 block">Date: {viewingDischargeDoc.dischargeDetails.dischargeDate}</span>
              </div>
            </div>

            {/* Patient & Admission Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 block font-bold">مریض کا نام:</span>
                <strong className="text-slate-900 text-xs">{viewingDischargeDoc.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">عمر و جنس:</span>
                <span>{viewingDischargeDoc.patientAge} Yrs / {viewingDischargeDoc.patientGender}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">داخلہ تا ڈسچارج:</span>
                <span>{viewingDischargeDoc.admissionDate} تا {viewingDischargeDoc.dischargeDetails.dischargeDate} ({viewingDischargeDoc.dischargeDetails.stayDays} دن)</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">نگران معالج:</span>
                <strong className="text-teal-900">{viewingDischargeDoc.admittingDoctorName}</strong>
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="space-y-3">
              <div className="border-b pb-2">
                <span className="font-black text-teal-900 block text-xs">حتمی تشخیص (Final Diagnosis):</span>
                <p className="font-bold text-slate-900">{viewingDischargeDoc.dischargeDetails.finalDiagnosis}</p>
              </div>

              <div className="border-b pb-2">
                <span className="font-black text-teal-900 block text-xs">ہسپتال علاج کی سمری (Hospital Course Summary):</span>
                <p className="text-slate-700">{viewingDischargeDoc.dischargeDetails.hospitalCourseSummaryUrdu}</p>
              </div>

              <div className="border-b pb-2">
                <span className="font-black text-teal-900 block text-xs">گھر کے لیے پرہیز و ہدایات (Discharge Advice):</span>
                <p className="text-slate-700">{viewingDischargeDoc.dischargeDetails.dischargeAdviceUrdu}</p>
              </div>

              {viewingDischargeDoc.dischargeDetails.dischargeMedications && viewingDischargeDoc.dischargeDetails.dischargeMedications.length > 0 && (
                <div className="border-b pb-3">
                  <span className="font-black text-teal-900 block text-xs mb-2">تجویز کردہ ادویات (Discharge Rx):</span>
                  <table className="w-full text-[11px] border text-slate-800">
                    <thead className="bg-teal-50 text-teal-950 font-bold border-b">
                      <tr>
                        <th className="p-1.5 text-right">دوا کا نام</th>
                        <th className="p-1.5 text-right">خوراک</th>
                        <th className="p-1.5 text-right">طریقہ استعمال</th>
                        <th className="p-1.5 text-right">مدت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingDischargeDoc.dischargeDetails.dischargeMedications.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-bold">{m.medicineName}</td>
                          <td className="p-1.5">{m.dosage}</td>
                          <td className="p-1.5">{m.frequency} - {m.instructions}</td>
                          <td className="p-1.5">{m.durationDays} دن</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Financial Clearance Receipt Table */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-black text-slate-900 block text-xs border-b pb-1">حتمی فنانشل بل و ادائیگی کلیئرنس (Financial Settlement):</span>
              <div className="grid grid-cols-2 gap-y-1 text-slate-700 text-xs">
                <span>بیڈ و کمرہ کرایہ ({viewingDischargeDoc.dischargeDetails.stayDays} دن):</span>
                <span className="text-left font-bold" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.bedRentTotalPKR.toLocaleString()}</span>

                <span>ڈاکٹر وزٹس و کنسلٹیشن فیس:</span>
                <span className="text-left font-bold" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.doctorConsultationVisitsTotalPKR.toLocaleString()}</span>

                <span>نرسنگ کیئر و مانیٹرنگ چارجز:</span>
                <span className="text-left font-bold" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.nursingCareTotalPKR.toLocaleString()}</span>

                <span>ہسپتال فارمیسی و ادویات چارجز:</span>
                <span className="text-left font-bold" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.pharmacyMedicationsTotalPKR.toLocaleString()}</span>

                <span>پیتھالوجی لیب ٹیسٹ چارجز:</span>
                <span className="text-left font-bold" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.labInvestigationsTotalPKR.toLocaleString()}</span>

                <span className="font-bold border-t pt-1">کل گراس رقم (Gross Total):</span>
                <span className="text-left font-black border-t pt-1" dir="ltr">Rs. {viewingDischargeDoc.dischargeDetails.grossTotalPKR.toLocaleString()}</span>

                <span className="text-emerald-700 font-bold">ایڈوانس ڈپازٹ منہا:</span>
                <span className="text-left font-bold text-emerald-700" dir="ltr">- Rs. {viewingDischargeDoc.dischargeDetails.advanceDeductedPKR.toLocaleString()}</span>

                <span className="font-black text-slate-900 text-sm border-t-2 border-teal-800 pt-1">قابل ادائیگی واجب الادا (Net Cleared):</span>
                <span className="text-left font-black text-emerald-800 text-sm border-t-2 border-teal-800 pt-1" dir="ltr">
                  Rs. {viewingDischargeDoc.dischargeDetails.netBalancePayablePKR.toLocaleString()} (PAID)
                </span>
              </div>
            </div>

            {/* Doctor & Hospital Stamp signatures */}
            <div className="flex justify-between items-end pt-6 border-t text-xs">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="text-slate-500 font-bold">وارث / مریض کے دستخط</span>
              </div>

              <div className="text-center">
                <div className="inline-block p-2 border border-teal-400 rounded-lg text-teal-800 text-[10px] font-black mb-2 uppercase">
                  HAFIZ CLINIC IPD SEAL & VERIFIED
                </div>
                <div className="w-36 border-b border-slate-400 mb-1" />
                <strong className="text-slate-900 block">{viewingDischargeDoc.admittingDoctorName}</strong>
                <span className="text-slate-500 text-[10px]">Medical Superintendent</span>
              </div>
            </div>

            {/* Print Buttons Bar */}
            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setViewingDischargeDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                بند کریں
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2 bg-teal-800 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>پرنٹ / محفوظ کریں (Print PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
