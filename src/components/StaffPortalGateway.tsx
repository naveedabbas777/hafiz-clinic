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
  Search,
  EyeOff,
  PhoneCall,
  User,
  Check,
  FileText,
} from 'lucide-react';
import { StaffUser } from '../types';
import {
  getLocalStaffUsers,
  getOperationalStaffOnly,
  authenticateStaffUser,
  HOSPITAL_RBAC_RULES,
} from '../data/staffData';
import { ShiftHandoverModal } from './ShiftHandoverModal';

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showShiftHandoverModal, setShowShiftHandoverModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'portals' | 'login' | 'directory' | 'rules'>('portals');

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
      authorizedRolesLabel: 'Consultant Doctors & Physicians',
      authorizedRolesLabelUrdu: 'ماہر ڈاکٹرز و کنسلٹنٹس',
      location: 'Ground Floor, Clinical Wing A (Rooms 1 & 2)',
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
      authorizedRolesLabel: 'IPD Ward Incharge & Resident Staff',
      authorizedRolesLabelUrdu: 'وارڈ انچارج و ان ڈور ایڈمن',
      location: '1st Floor, IPD Care Wing B',
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
      authorizedRolesLabel: 'Registered Nurses & Clinical Caretakers',
      authorizedRolesLabelUrdu: 'رجسٹرڈ نرسنگ عملہ',
      location: '1st Floor Central Station (Counter 3)',
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
      authorizedRolesLabel: 'Licensed Pharmacists & Dispensers',
      authorizedRolesLabelUrdu: 'لائسنس یافتہ فارماسسٹ',
      location: 'Ground Floor, Main Reception Lobby',
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
      authorizedRolesLabel: 'Consultant Radiologists & Technicians',
      authorizedRolesLabelUrdu: 'ریڈیالوجسٹ و ایکسرے ٹیکنیشن',
      location: 'Basement Level, Diagnostic Suite 1',
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
      authorizedRolesLabel: 'Pathologists & Lab Technologists',
      authorizedRolesLabelUrdu: 'پیتھالوجسٹ و لیب ٹیکنالوجسٹ',
      location: 'Basement Level, Diagnostic Suite 2',
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
      authorizedRolesLabel: 'Optometrists & Eye Specialists',
      authorizedRolesLabelUrdu: 'آپٹومیٹرسٹ و ماہر امراض چشم',
      location: 'Ground Floor, Optical Center Room 3',
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
      authorizedRolesLabel: 'Consultant Sonologists & Ultrasound Specialists',
      authorizedRolesLabelUrdu: 'کنسلٹنٹ سونوگرافر',
      location: 'Basement Level, Ultrasound Suite 3',
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
      setAuthError(isUrdu ? 'براہ کرم ایڈمنسٹریشن کی جانب سے جاری کردہ اسٹاف یوزر نیم درج کریں۔' : 'Please enter the Staff Username / ID issued by Hospital Administration.');
      return;
    }

    if (!inputPassword.trim()) {
      setAuthError(isUrdu ? 'براہ کرم اکاؤنٹ کا پاس ورڈ درج کریں۔' : 'Please enter your account password.');
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

      setAuthSuccess(
        isUrdu
          ? `خوش آمدید، ${user.name}! ${user.department} میں رسائی کی باضابطہ تصدیق ہو گئی۔`
          : `Welcome, ${user.name}! Access authorized for ${user.department}.`
      );
      setIsAuthenticating(false);

      setTimeout(() => {
        onSelectPortal(targetView, user);
      }, 500);
    }, 300);
  };

  const handlePortalAction = (portal: typeof departmentalPortals[0]) => {
    // If the currently logged in user matches this role or is admin, launch directly
    if (currentUser) {
      if (
        currentUser.role === 'admin' ||
        (portal.authorizedRoles === 'doctor' && currentUser.role === 'doctor') ||
        (portal.authorizedRoles === 'nurse' && currentUser.role === 'nurse') ||
        (portal.authorizedRoles === 'pharmacist' && currentUser.role === 'pharmacist') ||
        (portal.authorizedRoles === 'ipd_incharge' && currentUser.role === 'ipd_incharge') ||
        (portal.authorizedRoles === 'lab_doctor' && currentUser.role === 'lab_doctor')
      ) {
        onSelectPortal(portal.viewKey);
        return;
      }
    }
    // Otherwise route to the clean authentication tab with clear guidance
    setActiveTab('login');
    setAuthError(
      isUrdu
        ? `براہ کرم ${portal.titleUrdu} میں داخل ہونے کے لیے اپنا تصدیق شدہ اسٹاف اکاؤنٹ درج کریں۔`
        : `Please sign in with credentials authorized for ${portal.titleEnglish}.`
    );
  };

  // Filter staff directory
  const filteredStaff = staffList.filter((s) => {
    const q = directorySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.nameUrdu && s.nameUrdu.includes(q)) ||
      s.department.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      (s.qualification && s.qualification.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner - Professional Healthcare Architecture */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'مرکزی اسٹاف ہب — تمام شعبہ جاتی پورٹلز کا محفوظ گیٹ وے' : 'Clinical Staff Hub — Master Departmental Gateway'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isUrdu ? 'حافظ کلینک و ہسپتال — اسٹاف ورک اسپیس سینٹر' : 'Hafiz Clinic — Staff & Departmental Workspace Hub'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isUrdu
                  ? 'او پی ڈی ڈاکٹرز، داخل مریضاں وارڈ، نرسنگ کیئر، فارمیسی کاؤنٹر، ایکسرے، پیتھالوجی اور الٹراساؤنڈ شعبہ جات کے لیے باضابطہ و محفوظ رسائی مرکز۔'
                  : 'Centralized operational gateway for medical specialists, nursing staff, pharmacists, and diagnostic technicians. Role-based access enforced in compliance with Punjab Healthcare Commission standards.'}
              </p>
            </div>

            {/* Right Side: Active User Badge or Executive Admin Link */}
            {currentUser && currentUser.role !== 'admin' ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 min-w-[280px] shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
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
                  <span>{isUrdu ? 'ایگزیکٹو ایڈمن پورٹل' : 'Executive Administration'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  {isUrdu ? 'ایڈمنسٹریٹر یہاں سے عملہ کے اکاؤنٹس اور کلینک کی ترتیبات کنٹرول کر سکتے ہیں۔' : 'Hospital administration controls staff provisioning & institutional settings.'}
                </p>
                <button
                  onClick={() => onSelectPortal('admin')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isUrdu ? 'ایڈمن کنٹرول پینل کھولیں' : 'Open Admin Panel'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('portals');
                setAuthError('');
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'portals'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'شعبہ جاتی پورٹلز (8 Department Workspaces)' : '8 Department Workspaces'}</span>
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اسٹاف سائن ان (Staff Authentication)' : 'Staff Authentication'}</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{isUrdu ? `ہسپتال عملہ ڈائریکٹری (${staffList.length} اراکین)` : `Medical Staff Directory (${staffList.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileBadge className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اختیارات و رولز میٹرکس (RBAC)' : 'Hospital RBAC Governance Matrix'}</span>
            </button>

            <button
              onClick={() => setShowShiftHandoverModal(true)}
              className="px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs ml-auto"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>{isUrdu ? '📋 خودکار شفٹ ہینڈ اوور (PDF رپورٹ)' : '📋 Automated Shift Handover (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 8 DEPARTMENTAL WORKSPACES */}
        {activeTab === 'portals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {isUrdu ? 'ہسپتال کے ۸ باضابطہ شعبہ جاتی پورٹلز' : '8 Authorized Departmental Workspaces'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'متعلقہ شعبے میں داخل ہونے کے لیے کلک کریں؛ سیکیورٹی پروٹوکول کے مطابق لاگ ان لازمی ہے۔' : 'Select a department workspace to launch. Authenticated session required for duty logging.'}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ' : 'PHC Regulated Infrastructure'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentalPortals.map((portal) => {
                const Icon = portal.icon;
                const isUserAuthorized =
                  currentUser &&
                  (currentUser.role === 'admin' || currentUser.role === portal.authorizedRoles);

                return (
                  <div
                    key={portal.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${portal.accentColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${portal.badgeColor}`}>
                          {isUrdu ? portal.categoryUrdu : portal.categoryEnglish}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-sm leading-snug">
                          {isUrdu ? portal.titleUrdu : portal.titleEnglish}
                        </h4>
                        <p className="text-[11px] text-emerald-800 font-bold mt-1">
                          {isUrdu ? portal.departmentUrdu : portal.departmentEnglish}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          📍 {portal.location}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {isUrdu ? portal.descriptionUrdu : portal.descriptionEnglish}
                      </p>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {isUrdu ? 'مجاز عملہ:' : 'Authorized Roles:'}{' '}
                        </span>
                        <span className="text-slate-600">
                          {isUrdu ? portal.authorizedRolesLabelUrdu : portal.authorizedRolesLabel}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handlePortalAction(portal)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                          isUserAuthorized
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200'
                        }`}
                      >
                        <span>
                          {isUserAuthorized
                            ? isUrdu ? 'پورٹل میں داخل ہوں' : 'Enter Workspace'
                            : isUrdu ? 'شعبہ میں لاگ ان کریں' : 'Authenticate & Enter'}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CLEAN STAFF AUTHENTICATION */}
        {activeTab === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Official Staff Login Form */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-800 font-bold">
                    <Lock className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {isUrdu ? 'اسٹاف سائن ان / تصدیق پورٹل' : 'Official Staff Authentication'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'ایڈمنسٹریشن کی جانب سے جاری کردہ یوزر نیم اور پاس ورڈ درج کریں' : 'Enter your credentials issued by Hospital Medical Administration'}
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
                      {isUrdu ? 'متعلقہ شعبہ (Department Unit)' : 'Target Department Unit'}
                    </label>
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">{isUrdu ? 'تمام شعبہ جات (All Clinical Departments)' : 'All Clinical Departments'}</option>
                      <option value="doctor-portal">{isUrdu ? 'او پی ڈی ڈاکٹر روم (OPD Consultation Suite)' : 'OPD Doctor Consultation Suite'}</option>
                      <option value="ipd-ward">{isUrdu ? 'داخل مریضاں وارڈ (Inpatient Ward & Bed Unit)' : 'Inpatient Department & Ward'}</option>
                      <option value="nursing-station">{isUrdu ? 'نرسنگ کیئر کاؤنٹر (Nursing Station)' : 'Inpatient Nursing Station'}</option>
                      <option value="pharmacy-pos">{isUrdu ? 'فارمیسی کیش کاؤنٹر (Smart Pharmacy POS)' : 'Smart Pharmacy POS & Dispensing'}</option>
                      <option value="pathology-lab">{isUrdu ? 'پیتھالوجی و تشخیصی لیب (Diagnostics Suite)' : 'Pathology & Diagnostic Laboratory'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      {isUrdu ? 'اسٹاف یوزر نیم یا آئی ڈی (Staff Username / ID)' : 'Staff Username / ID'} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={inputUsername}
                        onChange={(e) => setInputUsername(e.target.value)}
                        placeholder={isUrdu ? 'مثال: اپنا باضابطہ یوزر نیم درج کریں' : 'e.g. Enter your authorized staff username'}
                        className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      {isUrdu ? 'پاس ورڈ (Account Password)' : 'Account Password'} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 p-3 pr-10 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {isAuthenticating
                        ? isUrdu ? 'تصدیق کی جا رہی ہے...' : 'Verifying Credentials...'
                        : isUrdu ? 'لاگ ان کریں اور متعلقہ پورٹل میں داخل ہوں' : 'Authenticate & Enter Departmental Portal'}
                    </span>
                  </button>
                </form>

                {/* Privacy & Compliance Assurance Notice */}
                <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isUrdu
                      ? 'تمام کلینیکل سرگرمیاں اور لاگز پنجاب ہیلتھ کیئر کمیشن (PHC) ایکٹ کے تحت باقاعدگی سے محفوظ کی جاتی ہیں۔'
                      : 'All clinical activities and electronic medical records are logged in compliance with PHC healthcare data protection protocols.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: IT Governance & Institutional Support */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-800 font-bold">
                    <Building2 className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isUrdu ? 'ہسپتال عملہ پالیسی و آئی ٹی رہنمائی' : 'Hospital IT & Staff Access Policy'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'محفوظ کلینیکل ریکارڈ اور عملہ کے حقوق' : 'Standard Operating Procedures & Credentials Management'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block mb-0.5">
                        {isUrdu ? 'باضابطہ اکاونٹس کا اجراء' : 'Official Account Issuance'}
                      </strong>
                      <span>
                        {isUrdu
                          ? 'تمام کلینیکل اکاؤنٹس میڈیکل سپرنٹنڈنٹ اور ہسپتال ایڈمنسٹریشن کی جانب سے جاری کیے جاتے ہیں۔'
                          : 'Staff user accounts and departmental access roles are provisioned directly by the Medical Superintendent & Hospital Administration.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block mb-0.5">
                        {isUrdu ? 'شعبہ جاتی رازداری (RBAC)' : 'Departmental Isolation & RBAC'}
                      </strong>
                      <span>
                        {isUrdu
                          ? 'ہر عملہ ممبر صرف اپنے مقرر کردہ شعبہ (او پی ڈی، وارڈ، نرسنگ، فارمیسی یا لیب) کے اختیارات استعمال کر سکتا ہے۔'
                          : 'Each staff member is restricted to their assigned operational scope (Doctor EMR, Inpatient Nursing, Pharmacy POS, or Diagnostics).'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block mb-0.5">
                        {isUrdu ? 'پاس ورڈ ری سیٹ و آئی ٹی ہیلپ ڈیسک' : 'Password Reset & IT Helpdesk'}
                      </strong>
                      <span>
                        {isUrdu
                          ? 'اگر آپ اپنا پاس ورڈ بھول گئے ہیں یا نیا اکاؤنٹ درکار ہے تو مرکزی ایڈمن بلاک (ایکسٹینشن 101) سے رابطہ فرمائیں۔'
                          : 'If you require credentials recovery, account unlocking, or departmental transfer, contact the Administrative Helpdesk at Ext. 101.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                      {isUrdu ? 'ایڈمنسٹریٹو ہیلپ لائن' : 'Admin Operations Desk'}
                    </span>
                    <strong className="text-slate-900 font-mono text-sm">Ext: 101 / 0300-1234567</strong>
                  </div>
                  <span className="px-3 py-1 bg-white border border-emerald-300 rounded-full text-emerald-900 font-bold text-[11px] shadow-2xs">
                    {isUrdu ? 'دستیاب: 24/7' : 'Available 24/7'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDICAL STAFF DIRECTORY (PROFESSIONAL ROSTER - NO PASSWORDS) */}
        {activeTab === 'directory' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-700" />
                  <span>{isUrdu ? 'ہسپتال عملہ و ڈاکٹرز باضابطہ ڈائریکٹری' : 'Hospital Medical & Technical Staff Directory'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isUrdu
                    ? 'ہسپتال کے تمام فعال معالجین، نرسنگ آفیسرز، فارماسسٹس اور تشخیصی ماہرین کی سرکاری فہرست۔'
                    : 'Official roster of verified consultants, clinical officers, nursing heads, and diagnostic technologists.'}
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
                {filteredStaff.length} {isUrdu ? 'مستند اسٹاف اراکین' : 'Active Duty Personnel'}
              </span>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder={isUrdu ? 'نام، شعبہ یا قابلیت سے تلاش کریں...' : 'Search staff by name, department, or qualification...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase font-mono">
                        {staff.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isUrdu ? 'آن ڈیوٹی' : 'Active'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{staff.name}</h4>
                      {staff.nameUrdu && <p className="text-xs text-slate-600 font-urdu">{staff.nameUrdu}</p>}
                      <p className="text-[11px] text-emerald-800 font-bold mt-0.5">{staff.department}</p>
                    </div>

                    {staff.qualification && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 font-medium">
                        🎓 {staff.qualification}
                      </div>
                    )}

                    <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                      {staff.shiftTiming && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{staff.shiftTiming}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Staff ID: <strong className="text-slate-800 font-mono">{staff.username}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setInputUsername(staff.username);
                        setActiveTab('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="w-full py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-xl font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isUrdu ? 'اس یوزر کے ساتھ سائن ان کریں' : 'Authenticate this Account'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: HOSPITAL RBAC GOVERNANCE MATRIX */}
        {activeTab === 'rules' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-emerald-700" />
                <span>{isUrdu ? 'ہسپتال کے رولز و رسائی کے اختیارات (RBAC)' : 'Hospital Role-Based Access Control (RBAC) Governance Matrix'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'ایڈمنسٹریشن کی جانب سے ہر شعبے اور رول کے لیے مخصوص دائرہ کار و اختیارات کی باضابطہ حدود۔'
                  : 'Institutional boundaries and functional bounds assigned to staff accounts by Hospital Administration in alignment with PHC standards.'}
              </p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                    <th className="p-3 font-mono">{isUrdu ? 'رول کوڈ' : 'Rule ID'}</th>
                    <th className="p-3">{isUrdu ? 'اختیار / پالیسی' : 'Permission Domain'}</th>
                    <th className="p-3">{isUrdu ? 'شعبہ' : 'Category'}</th>
                    <th className="p-3">{isUrdu ? 'تفصیلی دائرہ کار' : 'Scope Description'}</th>
                    <th className="p-3">{isUrdu ? 'مجاز کلینیکل رولز' : 'Authorized Roles'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {HOSPITAL_RBAC_RULES.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-500 font-bold">{rule.id}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {isUrdu ? rule.nameUrdu : rule.nameEnglish}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {rule.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-md">
                        {isUrdu ? rule.descriptionUrdu : rule.descriptionEnglish}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {rule.applicableRoles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Automated Shift Handover Modal */}
      <ShiftHandoverModal
        isOpen={showShiftHandoverModal}
        onClose={() => setShowShiftHandoverModal(false)}
        currentUser={currentUser}
        language={language}
      />
    </div>
  );
};
