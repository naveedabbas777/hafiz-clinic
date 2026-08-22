import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Bed,
  Heart,
  ShoppingCart,
  Activity,
  Eye,
  Radio,
  Key,
  Lock,
  UserCheck,
  ChevronRight,
  Shield,
  Layers,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Building2,
  FileBadge,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { StaffUser } from '../types';
import {
  getLocalStaffUsers,
  getOperationalStaffOnly,
  authenticateStaffUser,
  HOSPITAL_RBAC_RULES,
} from '../data/staffData';

interface StaffPortalGatewayProps {
  currentUser: StaffUser | null;
  onSelectPortal: (portalKey: string, userToLogin?: StaffUser) => void;
  onLogout: () => void;
  language?: 'urdu' | 'english';
}

export const StaffPortalGateway: React.FC<StaffPortalGatewayProps> = ({
  currentUser,
  onSelectPortal,
  onLogout,
  language = 'urdu',
}) => {
  const isUrdu = language === 'urdu';
  const staffList = getOperationalStaffOnly();

  // Authentication State
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'directory' | 'rules'>('login');

  const departmentalPortals = [
    {
      id: 'doctor-portal',
      titleEnglish: 'OPD Doctor Consultation Suite',
      titleUrdu: 'او پی ڈی ڈاکٹر کنسلٹیشن روم (EMR & Prescription)',
      categoryEnglish: 'OPD & EMR',
      categoryUrdu: 'او پی ڈی پرچی و نسخہ',
      icon: Stethoscope,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      departmentEnglish: 'General OPD & Herbal Medicine (Rooms 1 & 2)',
      departmentUrdu: 'جنرل او پی ڈی و ہربل میڈیسن (کمرہ نمبر ۱ و ۲)',
      authorizedRoles: 'doctor',
      demoUsernames: ['doctor1', 'doctor2'],
      descriptionEnglish:
        'Live patient queue management, calling tokens to waiting room TV, creating digital prescriptions, and inspecting patient history.',
      descriptionUrdu:
        'مریضوں کی لائیو قطار، ویٹنگ روم ٹی وی پر ٹوکن کالنگ، ڈیجیٹل نسخہ جات کی تیاری اور سابقہ طبی ریکارڈ کا معائنہ۔',
      viewKey: 'doctor-portal',
    },
    {
      id: 'ipd-ward',
      titleEnglish: 'In-Patient Department (IPD) & Ward',
      titleUrdu: 'داخل مریضاں وارڈ، بیڈ الاٹمنٹ و ڈسچارج بلنگ',
      categoryEnglish: 'In-Patient Care',
      categoryUrdu: 'وارڈ و بیڈ سسٹم',
      icon: Bed,
      accentColor: 'text-teal-700 bg-teal-50 border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      departmentEnglish: 'In-Patient Ward & Private VIP Rooms',
      departmentUrdu: 'شعبہ داخل مریضاں وارڈ و پرائیویٹ رومز',
      authorizedRoles: 'ipd_incharge',
      demoUsernames: ['ward_incharge'],
      descriptionEnglish:
        'General ward bed and private VIP room allocations, admission intake, bed tracking, and discharge clearance billing.',
      descriptionUrdu:
        'وارڈز اور پرائیویٹ رومز کی لائیو بیڈ ایلوکیشن، نیا داخلہ، مریض کی بیڈ پوزیشن اور فائنل ڈسچارج سمری و بل۔',
      viewKey: 'ipd-ward',
    },
    {
      id: 'nursing-station',
      titleEnglish: 'Inpatient Nursing Station & 4-Hourly Sheet',
      titleUrdu: 'ان پیشنٹ نرسنگ کیئر اسٹیشن و وائٹلز چارٹ',
      categoryEnglish: 'Nursing Care',
      categoryUrdu: 'نرسنگ کیئر',
      icon: Heart,
      accentColor: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      departmentEnglish: 'Nursing Station & Inpatient Care Unit',
      departmentUrdu: 'نرسنگ کاؤنٹر و مریضاں وائٹلز شیٹ',
      authorizedRoles: 'nurse',
      demoUsernames: ['nurse1'],
      descriptionEnglish:
        'Digital 4-hourly vitals chart (BP, Pulse, Blood Sugar, SpO2, Temp), IV cannula flow rates, medication administration records (MAR), and shift handovers.',
      descriptionUrdu:
        'ہر ۴ گھنٹے بعد وائٹلز لاگنگ (بلڈ پریشر، شوگر، آکسیجن، نبض، بخار)، ڈرپ و انجیکشن کا ریکارڈ اور شفٹ ہینڈ اوور۔',
      viewKey: 'nursing-station',
    },
    {
      id: 'pharmacy-pos',
      titleEnglish: 'Smart Pharmacy POS & Inventory Unit',
      titleUrdu: 'فارمیسی کیش کاؤنٹر (POS) و میڈیسن اسٹاک',
      categoryEnglish: 'Pharmacy POS',
      categoryUrdu: 'فارمیسی پی او ایس',
      icon: ShoppingCart,
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      departmentEnglish: 'Central Pharmacy & Dispensing Store',
      departmentUrdu: 'مین فارمیسی و میڈیسن ڈسپنسری',
      authorizedRoles: 'pharmacist',
      demoUsernames: ['pharmacist'],
      descriptionEnglish:
        'Barcode POS checkout, medicine dispensing, batch tracking, expiry date alerts, thermal receipt printing, and low stock monitoring.',
      descriptionUrdu:
        'بارکوڈ سیل کاؤنٹر، تھرمل پرچی پرنٹنگ، زائد المیعاد (Expiry) الرٹس اور کم اسٹاک کی فوری وارننگ۔',
      viewKey: 'pharmacy-pos',
    },
    {
      id: 'pathology-lab-xray',
      titleEnglish: 'Digital X-Ray & Radiology Specialist Portal',
      titleUrdu: 'ڈیجیٹل ایکسرے و ریڈیالوجی تشخیصی پورٹل',
      categoryEnglish: 'Diagnostic Imaging',
      categoryUrdu: 'ایکسرے و ریڈیالوجی',
      icon: Radio,
      accentColor: 'text-sky-700 bg-sky-50 border-sky-200',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      departmentEnglish: 'Digital Radiology & X-Ray Lab',
      departmentUrdu: 'شعبہ ایکسرے و ڈیجیٹل ریڈیوگرافی',
      authorizedRoles: 'lab_doctor',
      demoUsernames: ['dr_xray'],
      descriptionEnglish:
        'Reading digital X-ray films, documenting radiology findings (chest, spine, bone fractures), and issuing certified X-ray reports.',
      descriptionUrdu:
        'ڈیجیٹل ایکسرے فلموں کا معائنہ، ریڈیالوجسٹ کی فائنڈنگز اور باضابطہ تصدیق شدہ ایکسرے رپورٹ کا اجراء۔',
      viewKey: 'pathology-lab',
    },
    {
      id: 'pathology-lab-blood',
      titleEnglish: 'Clinical Pathology & Hematology Diagnostics',
      titleUrdu: 'کلینیکل پیتھالوجی، خون و شوگر ٹیسٹ پورٹل',
      categoryEnglish: 'Pathology Diagnostics',
      categoryUrdu: 'پیتھالوجی و بلڈ ٹیسٹ',
      icon: Activity,
      accentColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      departmentEnglish: 'Pathology, CBC & Biochemistry Lab',
      departmentUrdu: 'پیتھالوجی، سی بی سی و شوگر ٹیسٹ لیب',
      authorizedRoles: 'lab_doctor',
      demoUsernames: ['dr_pathology'],
      descriptionEnglish:
        'Logging CBC, Blood Sugar (HbA1c), LFT, RFT, Lipid Profile test results, automated abnormal value highlighting, and QR report signing.',
      descriptionUrdu:
        'سی بی سی، شوگر، ایل ایف ٹی، آر ایف ٹی ٹیسٹ رزلٹس، غیر معمولی ویلیوز کی خودکار نشاندہی اور کیو آر تصدیق۔',
      viewKey: 'pathology-lab',
    },
    {
      id: 'pathology-lab-eye',
      titleEnglish: 'Computerized Eye Scan & Optometry Unit',
      titleUrdu: 'کمپیوٹرائزڈ آئی اسکین و نظر ٹیسٹ پورٹل',
      categoryEnglish: 'Eye Diagnostics',
      categoryUrdu: 'آئی و وژن اسکین',
      icon: Eye,
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      departmentEnglish: 'Vision Diagnostic Lab & Optical Center',
      departmentUrdu: 'آئی اسکیننگ لیب و آپٹیکل کاؤنٹر',
      authorizedRoles: 'lab_doctor',
      demoUsernames: ['dr_eye'],
      descriptionEnglish:
        'Auto-refractometer eye scan analysis, visual acuity charting, intraocular pressure (IOP), and digital eyeglass prescription stamping.',
      descriptionUrdu:
        'آٹو ریفریکٹومیٹر آئی اسکین تجزیہ، بصارت نمبر چارٹ اور ڈیجیٹل چشمہ نمبر پرچی کی تصدیق۔',
      viewKey: 'pathology-lab',
    },
    {
      id: 'pathology-lab-ultrasound',
      titleEnglish: 'Ultrasound & Sonology Specialist Portal',
      titleUrdu: 'الٹراساؤنڈ، کلر ڈوپلر و سونوگرافی پورٹل',
      categoryEnglish: 'Sonology Diagnostics',
      categoryUrdu: 'الٹراساؤنڈ و سونوگرافی',
      icon: Activity,
      accentColor: 'text-purple-700 bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      departmentEnglish: 'Ultrasound & Color Doppler Unit',
      departmentUrdu: 'الٹراساؤنڈ و ڈوپلر اسکیننگ یونٹ',
      authorizedRoles: 'lab_doctor',
      demoUsernames: ['dr_ultrasound'],
      descriptionEnglish:
        'Abdominal ultrasound, pelvic imaging, obstetric scans, Doppler assessments, and detailed sonologist reports.',
      descriptionUrdu:
        'پیٹ، گائنی اور ڈوپلر الٹراساؤنڈ رپورٹس، امیجنگ نوٹس اور سونوگرافر کی حتمی تصدیق۔',
      viewKey: 'pathology-lab',
    },
  ];

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!inputUsername.trim()) {
      setAuthError('Please enter the Staff Username issued by Administration.');
      return;
    }

    if (!inputPassword.trim()) {
      setAuthError('Please enter your account Password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const result = authenticateStaffUser(inputUsername, inputPassword);

      if (!result.success || !result.user) {
        setAuthError(result.message);
        setIsAuthenticating(false);
        return;
      }

      const user = result.user;

      // Determine target departmental view
      let targetView = 'staff-portals';
      if (user.role === 'doctor') targetView = 'doctor-portal';
      else if (user.role === 'nurse') targetView = 'nursing-station';
      else if (user.role === 'pharmacist') targetView = 'pharmacy-pos';
      else if (user.role === 'ipd_incharge') targetView = 'ipd-ward';
      else if (user.role === 'lab_doctor') targetView = 'pathology-lab';
      else targetView = 'admin';

      setAuthSuccess(`Welcome, ${user.name}! Access authorized for ${user.department}.`);
      setIsAuthenticating(false);

      setTimeout(() => {
        onSelectPortal(targetView, user);
      }, 500);
    }, 300);
  };

  const handleSelectDemoCredentials = (user: StaffUser) => {
    setInputUsername(user.username);
    setInputPassword(user.password || 'doc123');
    setAuthError('');
    setAuthSuccess('');
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner - Clean White / Medical Theme */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'اسٹاف ہب — تمام شعبہ جاتی پورٹلز کا مین گیٹ وے' : 'Staff Hub — Departmental Master Gateway'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isUrdu ? 'حافظ کلینک و ہسپتال — مرکزی عملہ پورٹل ڈیش بورڈ' : 'Hafiz Clinic — Staff & Departmental Master Hub'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isUrdu
                  ? 'تمام شعبہ جات (او پی ڈی ڈاکٹرز، ان پیشنٹ وارڈز، نرسنگ کیئر، فارمیسی کاؤنٹر، ایکسرے، پیتھالوجی، آئی اسکین و الٹراساؤنڈ) تک رسائی کے لیے مستند لاگ ان۔'
                  : 'Centralized workspace for clinical, nursing, pharmacy, and diagnostic laboratory personnel. Log in with credentials issued by Hospital Administration.'}
              </p>
            </div>

            {/* Currently Active User Status or Quick Admin Link */}
            {currentUser && currentUser.role !== 'admin' ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 min-w-[280px] shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{currentUser.name}</h4>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full uppercase">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mb-3 truncate font-medium">{currentUser.department}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'doctor') onSelectPortal('doctor-portal');
                      else if (currentUser.role === 'nurse') onSelectPortal('nursing-station');
                      else if (currentUser.role === 'pharmacist') onSelectPortal('pharmacy-pos');
                      else if (currentUser.role === 'ipd_incharge') onSelectPortal('ipd-ward');
                      else if (currentUser.role === 'lab_doctor') onSelectPortal('pathology-lab');
                    }}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer shadow-xs"
                  >
                    {isUrdu ? 'اپنے پورٹل میں داخل ہوں ←' : 'Enter My Portal →'}
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 min-w-[280px]">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>{isUrdu ? 'ایگزیکٹو ایڈمن پورٹل' : 'Executive Admin Access'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  {isUrdu ? 'ایڈمنسٹریٹر یہاں سے اسٹاف اکاؤنٹس اور کلینک کی ترتیبات کنٹرول کر سکتے ہیں۔' : 'Hospital administrator manages staff accounts and permissions.'}
                </p>
                <button
                  onClick={() => onSelectPortal('admin')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isUrdu ? 'ایڈمن لاگ ان کھولیں' : 'Open Executive Admin'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اسٹاف لاگ ان و شعبہ جات ڈیش بورڈ' : 'Staff Login & Department Portals'}</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{isUrdu ? `اسٹاف ڈائریکٹری و لاگ ان لسٹ (${staffList.length} ممبران)` : `Staff Directory (${staffList.length} Roles)`}</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileBadge className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اختیارات و رولز میٹرکس (RBAC)' : 'Hospital RBAC Permissions Matrix'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: AUTHENTICATION LOGIN & DEPARTMENTAL PORTALS */}
        {activeTab === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Official Staff Login Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-11 h-11 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-800 font-bold">
                    <Lock className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      {isUrdu ? 'اسٹاف سائن ان / تصدیق' : 'Staff Credential Verification'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'ایڈمنسٹریشن کی جانب سے دیا گیا یوزر نیم اور پاس ورڈ درج کریں' : 'Enter authorized hospital username & password'}
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{authSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAuthenticate} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      {isUrdu ? 'اسٹاف یوزر نیم (Username)' : 'Staff Username / User ID'} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={inputUsername}
                        onChange={(e) => setInputUsername(e.target.value)}
                        placeholder="e.g. doctor1, nurse1, pharmacist, dr_xray"
                        className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      {isUrdu ? 'پاس ورڈ (Password)' : 'Account Password'} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {isAuthenticating
                        ? isUrdu ? 'تصدیق کی جا رہی ہے...' : 'Verifying Credentials...'
                        : isUrdu ? 'لاگ ان کریں اور متعلقہ پورٹل میں داخل ہوں' : 'Authenticate & Enter Departmental Portal'}
                    </span>
                  </button>
                </form>

                {/* Quick Helper / Demo Credentials Autofill Helper */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isUrdu ? 'فوری ٹیسٹنگ یوزرز:' : 'Quick Demo Credentials:'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directory')}
                      className="text-emerald-700 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      {isUrdu ? 'مکمل فہرست دیکھیں ←' : 'View All →'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1" dir="ltr">
                    {staffList.slice(0, 6).map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => handleSelectDemoCredentials(staff)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer shadow-2xs"
                        title={`Click to populate credentials for ${staff.name}`}
                      >
                        {staff.username}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {isUrdu
                      ? 'کسی بھی یوزر پر کلک کرنے سے اس کا یوزر نیم اور پاس ورڈ خود بخود لاگ ان فارم میں بھر جائے گا۔'
                      : 'Click any username above to populate username and password into the login form for testing.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Departmental Portals Overview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isUrdu ? 'ہسپتال کے ۸ مستند شعبہ جاتی پورٹلز' : '8 Authorized Departmental Portals'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'مخصوص شعبے میں کام کرنے کے لیے عملہ کا لاگ ان ہونا ضروری ہے' : 'Clinical departments accessible based on admin assigned permissions'}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  {departmentalPortals.length} {isUrdu ? 'شعبہ جات' : 'Units'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departmentalPortals.map((portal) => {
                  const Icon = portal.icon;
                  return (
                    <div
                      key={portal.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${portal.accentColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${portal.badgeColor}`}>
                            {portal.authorizedRoles}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {isUrdu ? portal.titleUrdu : portal.titleEnglish}
                          </h4>
                          <p className="text-[11px] text-emerald-800 font-medium">
                            {isUrdu ? portal.departmentUrdu : portal.departmentEnglish}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {isUrdu ? portal.descriptionUrdu : portal.descriptionEnglish}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                          User: <strong className="text-slate-800">{portal.demoUsernames[0]}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const matchedStaff = staffList.find((s) => portal.demoUsernames.includes(s.username));
                            if (matchedStaff) {
                              handleSelectDemoCredentials(matchedStaff);
                            }
                          }}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isUrdu ? 'لاگ ان منتخب کریں' : 'Select Login'}</span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEMO STAFF CREDENTIALS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-700" />
                  <span>{isUrdu ? 'اسٹاف ممبران اور اکاؤنٹس ڈائریکٹری' : 'Hospital Staff Accounts & Credentials Directory'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isUrdu
                    ? 'صرف وہ اکاؤنٹس جو ایڈمنسٹریشن کی جانب سے جاری کیے گئے ہیں کام کر سکتے ہیں۔'
                    : 'Only accounts created by Administration can access the system. Click any account to test authentication.'}
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                {staffList.length} {isUrdu ? 'فعال اسٹاف ممبران' : 'Operational Staff Members'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
                        {staff.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {isUrdu ? 'حیثیت:' : 'Status:'}{' '}
                        <strong className="text-emerald-700">{staff.isActive ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Disabled')}</strong>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                      {staff.nameUrdu && <p className="text-xs text-slate-600 font-urdu">{staff.nameUrdu}</p>}
                      <p className="text-[11px] text-emerald-800 font-medium">{staff.department}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]" dir="ltr">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Username:</span>
                        <strong className="text-slate-900 font-bold">{staff.username}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Password:</span>
                        <strong className="text-emerald-800 font-bold">{staff.password || 'doc123'}</strong>
                      </div>
                      {staff.qualification && (
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 truncate">
                          {staff.qualification}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoCredentials(staff)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>{isUrdu ? 'یہ کریڈینشلز استعمال کریں' : 'Use These Credentials to Login'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITAL RBAC RULES & PERMISSIONS MATRIX */}
        {activeTab === 'rules' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-emerald-700" />
                <span>{isUrdu ? 'ہسپتال کے رولز و رسائی کے اختیارات (RBAC)' : 'Hospital Role-Based Access Control (RBAC) Rules Matrix'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'ایڈمنسٹریشن کی جانب سے ہر شعبے اور رول کے لیے مخصوص دائرہ کار و اختیارات'
                  : 'Hospital policies and specific functional bounds assigned to staff accounts by the Administration'}
              </p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                    <th className="p-3 font-mono">Rule ID</th>
                    <th className="p-3">{isUrdu ? 'اختیار / پرمیشن' : 'Permission / Capability'}</th>
                    <th className="p-3">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                    <th className="p-3">{isUrdu ? 'مجاز رولز' : 'Allowed Department Roles'}</th>
                    <th className="p-3">{isUrdu ? 'تفصیلی دائرہ کار' : 'Detailed Functional Bounds'}</th>
                  </tr>
                </thead>
                <tbody>
                  {HOSPITAL_RBAC_RULES.map((rule) => (
                    <tr key={rule.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800" dir="ltr">{rule.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{isUrdu ? rule.nameUrdu : rule.nameEnglish}</div>
                        <div className="text-[11px] text-slate-500">{isUrdu ? rule.nameEnglish : rule.nameUrdu}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                          {rule.category}
                        </span>
                      </td>
                      <td className="p-3" dir="ltr">
                        <div className="flex flex-wrap gap-1">
                          {rule.applicableRoles.map((r) => (
                            <span
                              key={r}
                              className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{isUrdu ? rule.descriptionUrdu : rule.descriptionEnglish}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{isUrdu ? rule.descriptionEnglish : rule.descriptionUrdu}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
