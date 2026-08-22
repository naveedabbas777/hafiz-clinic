import { StaffUser } from '../types';

export interface RBACRuleDefinition {
  id: string;
  nameEnglish: string;
  nameUrdu: string;
  category: 'OPD' | 'IPD' | 'Nursing' | 'Pharmacy' | 'Diagnostics' | 'System';
  descriptionEnglish: string;
  descriptionUrdu: string;
  applicableRoles: string[];
}

export const HOSPITAL_RBAC_RULES: RBACRuleDefinition[] = [
  {
    id: 'opd_consultation',
    nameEnglish: 'OPD Patient Consultation',
    nameUrdu: 'او پی ڈی مریض معائنہ و چیک اپ',
    category: 'OPD',
    descriptionEnglish: 'Allows conducting outpatient consultations, diagnosing medical issues, and managing queue.',
    descriptionUrdu: 'او پی ڈی مریضوں کا معائنہ، تشخیص اور مشاورت مکمل کرنے کی اجازت۔',
    applicableRoles: ['doctor', 'admin'],
  },
  {
    id: 'opd_queue_call',
    nameEnglish: 'Live OPD Queue & Token Calling',
    nameUrdu: 'لائیو ٹوکن کال و ٹی وی اسکرین کنٹرول',
    category: 'OPD',
    descriptionEnglish: 'Allows calling patient tokens to consultation room and updating waiting TV display.',
    descriptionUrdu: 'مریضوں کے ٹوکن پکارنا اور ویٹنگ ٹی وی پر لائیو ڈسپلے نشر کرنا۔',
    applicableRoles: ['doctor', 'receptionist', 'admin'],
  },
  {
    id: 'digital_rx',
    nameEnglish: 'Digital EMR & Prescription Writing',
    nameUrdu: 'ڈیجیٹل نسخہ (Digital Rx) و ادویات تجویز',
    category: 'OPD',
    descriptionEnglish: 'Allows creating, editing, and issuing official printable digital prescriptions with dosage instructions.',
    descriptionUrdu: 'ڈیجیٹل نسخہ جات، خوراک کی ہدایات اور پرنٹ نسخہ جاری کرنے کی اجازت۔',
    applicableRoles: ['doctor', 'admin'],
  },
  {
    id: 'bed_allocation',
    nameEnglish: 'IPD Bed & Private Room Allocation',
    nameUrdu: 'ان ڈور بیڈ و پرائیویٹ روم الاٹمنٹ',
    category: 'IPD',
    descriptionEnglish: 'Allows admitting in-patients and allocating general ward beds or private VIP rooms.',
    descriptionUrdu: 'داخل مریضوں کو جنرل وارڈ بیڈ یا پرائیویٹ روم الاٹ کرنے کا اختیار۔',
    applicableRoles: ['ipd_incharge', 'admin'],
  },
  {
    id: 'ipd_discharge',
    nameEnglish: 'IPD Discharge & Clearance Summary',
    nameUrdu: 'مریض ڈسچارج سمری و کلیئرنس بلنگ',
    category: 'IPD',
    descriptionEnglish: 'Allows generating discharge summaries, bed clearance reports, and releasing admitted patients.',
    descriptionUrdu: 'مریضوں کی ڈسچارج سمری، بیڈ کلیئرنس اور حتمی ہسپتال بلنگ بنانے کی اجازت۔',
    applicableRoles: ['ipd_incharge', 'admin'],
  },
  {
    id: 'nursing_vitals_sheet',
    nameEnglish: '4-Hourly Vitals & Nursing Charting',
    nameUrdu: '۴ گھنٹے بعد وائٹلز و نرسنگ چارٹ لاگنگ',
    category: 'Nursing',
    descriptionEnglish: 'Allows recording blood pressure, pulse, temperature, SpO2, blood sugar, and nursing notes.',
    descriptionUrdu: 'بی پی، شوگر، نبض، بخار، آکسیجن اور نرسنگ نوٹس کا باقاعدہ اندراج۔',
    applicableRoles: ['nurse', 'doctor', 'admin'],
  },
  {
    id: 'iv_fluid_administration',
    nameEnglish: 'IV Fluids & Medication Administration (MAR)',
    nameUrdu: 'آئی وی ڈرپ، انجیکشن اور ادویات فراہمی ریکارڈ',
    category: 'Nursing',
    descriptionEnglish: 'Allows logging IV cannula status, drip flow rates, and administration of scheduled injections.',
    descriptionUrdu: 'کینولہ حالت، آئی وی ڈرپس اور ٹائم شیڈول کے مطابق انجیکشن لگانے کا ریکارڈ۔',
    applicableRoles: ['nurse', 'admin'],
  },
  {
    id: 'pos_billing',
    nameEnglish: 'Pharmacy POS Billing & Dispensing',
    nameUrdu: 'فارمیسی کیش بلنگ و ادویات ڈسپنسنگ',
    category: 'Pharmacy',
    descriptionEnglish: 'Allows scanning barcodes, dispensing medicines, generating receipts, and handling cash drawers.',
    descriptionUrdu: 'بارکوڈ بلنگ، تھرمل رسید پرنٹنگ اور ادویات کی فوری فروخت کا اختیار۔',
    applicableRoles: ['pharmacist', 'admin'],
  },
  {
    id: 'stock_batches',
    nameEnglish: 'Medicine Batches & Expiry Control',
    nameUrdu: 'میڈیسن بیج نمبر و ایکسپائری کنٹرول',
    category: 'Pharmacy',
    descriptionEnglish: 'Allows managing batch numbers, setting near-expiry alerts, and adjusting stock quantities.',
    descriptionUrdu: 'ادویات کے بیج نمبر، ایکسپائری الرٹس اور اسٹاک انوینٹری ایڈجسٹمنٹ۔',
    applicableRoles: ['pharmacist', 'admin'],
  },
  {
    id: 'radiology_reporting',
    nameEnglish: 'Digital X-Ray & Radiology Reporting',
    nameUrdu: 'ڈیجیٹل ایکسرے و ریڈیالوجی تشخیصی رپورٹس',
    category: 'Diagnostics',
    descriptionEnglish: 'Allows reading digital X-ray films, documenting radiologist findings, and signing off X-ray reports.',
    descriptionUrdu: 'ایکسرے فلموں کا معائنہ، ہڈیوں کے فریکچر کی تشخیص اور ریڈیالوجی رپورٹ سائن آف۔',
    applicableRoles: ['lab_doctor', 'admin'],
  },
  {
    id: 'pathology_reporting',
    nameEnglish: 'Blood, CBC & Pathology Lab Reporting',
    nameUrdu: 'خون، سی بی سی و پیتھالوجی لیب رپورٹس',
    category: 'Diagnostics',
    descriptionEnglish: 'Allows entering clinical pathology test parameters, biochemistry values, and issuing lab reports.',
    descriptionUrdu: 'سی بی سی، شوگر، ایل ایف ٹی، آر ایف ٹی ٹیسٹ کے نتائج درج کرنا اور رپورٹس جاری کرنا۔',
    applicableRoles: ['lab_doctor', 'admin'],
  },
  {
    id: 'eye_refraction_scan',
    nameEnglish: 'Computerized Eye Scan & Vision Refraction',
    nameUrdu: 'کمپیوٹرائزڈ آئی اسکین و نظر ٹیسٹ',
    category: 'Diagnostics',
    descriptionEnglish: 'Allows logging auto-refractometer readings, vision acuity numbers, and eyecare prescriptions.',
    descriptionUrdu: 'آٹو ریفریکشن آئی اسکین، نظر کا کمپیوٹرائزڈ نمبر اور عینک نسخہ جاری کرنا۔',
    applicableRoles: ['lab_doctor', 'admin'],
  },
  {
    id: 'ultrasound_reporting',
    nameEnglish: 'Ultrasound & Sonology Diagnosis',
    nameUrdu: 'الٹراساؤنڈ و سونوگرافی تشخیصی رپورٹنگ',
    category: 'Diagnostics',
    descriptionEnglish: 'Allows logging ultrasound scans, abdominal sonography impressions, and pelvic imaging findings.',
    descriptionUrdu: 'پیٹ و اعضاء کا الٹراساؤنڈ، سونوگرافی رپورٹس اور امپریشن درج کرنا۔',
    applicableRoles: ['lab_doctor', 'admin'],
  },
];

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Hafiz Clinic Administrator',
    nameUrdu: 'حافظ کلینک ایڈمنسٹریٹر (سپروائزر)',
    role: 'admin',
    department: 'Hospital Administration & Executive Directorate',
    specialtyTitleEnglish: 'Chief Executive & Medical Director',
    specialtyTitleUrdu: 'چیف ایگزیکٹو و میڈیکل ڈائریکٹر',
    phone: '0300-7654321',
    isActive: true,
    qualification: 'Hospital Management & M.Phil',
    shiftTiming: 'Full Day (24/7 Access)',
    permissions: [
      'all',
      'opd_consultation',
      'opd_queue_call',
      'digital_rx',
      'bed_allocation',
      'ipd_discharge',
      'nursing_vitals_sheet',
      'iv_fluid_administration',
      'pos_billing',
      'stock_batches',
      'radiology_reporting',
      'pathology_reporting',
      'eye_refraction_scan',
      'ultrasound_reporting',
    ],
  },
  {
    id: 'staff-doc-1',
    username: 'doctor1',
    password: 'doc123',
    name: 'Dr. Zeeshan Chaudhry',
    nameUrdu: 'ڈاکٹر زیشان چوہدری',
    role: 'doctor',
    assignedDoctorId: 'doc-1',
    department: 'General OPD & Advanced Herbal Medicine (Room 1)',
    specialtyTitleEnglish: 'Senior Consultant Physician & Herbal Specialist',
    specialtyTitleUrdu: 'سینئر فزیشن و ہربل میڈیکل اسپیشلسٹ',
    phone: '0300-1122334',
    isActive: true,
    qualification: 'MBBS, BEMS, Senior Consultant',
    shiftTiming: 'Morning & Evening (09:00 AM - 09:00 PM)',
    permissions: ['opd_consultation', 'digital_rx', 'opd_queue_call'],
  },
  {
    id: 'staff-doc-2',
    username: 'doctor2',
    password: 'doc123',
    name: 'Dr. Waqas Sagheer Chaudhry',
    nameUrdu: 'ڈاکٹر وقاص صغیر چوہدری',
    role: 'doctor',
    assignedDoctorId: 'doc-2',
    department: 'Physiotherapy & Eye Care Clinic (Room 2)',
    specialtyTitleEnglish: 'Physiotherapy & Rehabilitation Specialist',
    specialtyTitleUrdu: 'کنسلٹنٹ فزیوتھراپسٹ و ری ہیب اسپیشلسٹ',
    phone: '0300-2233445',
    isActive: true,
    qualification: 'MBBS, DPT, Senior Physiotherapist',
    shiftTiming: 'Morning & Evening (10:00 AM - 08:00 PM)',
    permissions: ['opd_consultation', 'digital_rx', 'opd_queue_call'],
  },
  {
    id: 'staff-ward-1',
    username: 'ward_incharge',
    password: 'ward123',
    name: 'Sister Shamaila Akhtar',
    nameUrdu: 'سسٹر شمائلہ اختر (وارڈ انچارج)',
    role: 'ipd_incharge',
    department: 'In-Patient Department (IPD) & Ward Management',
    specialtyTitleEnglish: 'IPD In-Charge & Bed Allocation Head',
    specialtyTitleUrdu: 'ان ڈور وارڈ انچارج و داخلہ نگران',
    phone: '0321-4455667',
    isActive: true,
    qualification: 'B.Sc Nursing, Ward Administration Diploma',
    shiftTiming: 'Day Shift (08:00 AM - 08:00 PM)',
    permissions: ['bed_allocation', 'ipd_discharge'],
  },
  {
    id: 'staff-nurse-1',
    username: 'nurse1',
    password: 'nurse123',
    name: 'Staff Nurse Fouzia Parveen',
    nameUrdu: 'نرس فوزیہ پروین (سٹاف نرس)',
    role: 'nurse',
    department: 'Inpatient Nursing Station & Care Unit',
    specialtyTitleEnglish: 'Senior Registered Staff Nurse',
    specialtyTitleUrdu: 'سینئر رجسٹرڈ اسٹاف نرس (وارڈ ڈیوٹی)',
    phone: '0304-5566778',
    isActive: true,
    qualification: 'General Nursing & Midwifery (PNC Registered)',
    shiftTiming: 'Rotational 8-Hour Nursing Shifts',
    permissions: ['nursing_vitals_sheet', 'iv_fluid_administration'],
  },
  {
    id: 'staff-pharm-1',
    username: 'pharmacist',
    password: 'pharmacy123',
    name: 'Dr. Muhammad Bilal Ansari',
    nameUrdu: 'ڈاکٹر محمد بلال انصاری (فارماسسٹ)',
    role: 'pharmacist',
    department: 'Central Pharmacy & POS Dispensing',
    specialtyTitleEnglish: 'Chief Clinical Pharmacist & POS In-Charge',
    specialtyTitleUrdu: 'چیف کلینیکل فارماسسٹ و انوینٹری نگران',
    phone: '0333-8899001',
    isActive: true,
    qualification: 'Pharm-D, Clinical Pharmacology Specialist',
    shiftTiming: 'Morning & Evening (08:00 AM - 11:00 PM)',
    permissions: ['pos_billing', 'stock_batches'],
  },
  {
    id: 'staff-lab-xray',
    username: 'dr_xray',
    password: 'lab123',
    name: 'Dr. Tariq Mehmood',
    nameUrdu: 'ڈاکٹر طارق محمود (کنسلٹنٹ ریڈیالوجسٹ)',
    role: 'lab_doctor',
    assignedLabCategory: 'Radiology / X-Ray',
    department: 'Digital Radiology & X-Ray Imaging',
    specialtyTitleEnglish: 'Consultant Radiologist & X-Ray Diagnostics Head',
    specialtyTitleUrdu: 'کنسلٹنٹ ریڈیالوجسٹ و ایکسرے انچارج',
    phone: '0300-9988771',
    isActive: true,
    qualification: 'MBBS, DMRD, FCPS (Radiology)',
    shiftTiming: '09:00 AM - 06:00 PM',
    permissions: ['radiology_reporting'],
  },
  {
    id: 'staff-lab-pathology',
    username: 'dr_pathology',
    password: 'lab123',
    name: 'Dr. Saima Rehman',
    nameUrdu: 'ڈاکٹر صائمہ رحمان (کنسلٹنٹ پیتھالوجسٹ)',
    role: 'lab_doctor',
    assignedLabCategory: 'Hematology / CBC',
    department: 'Pathology, Hematology & Clinical Biochemistry',
    specialtyTitleEnglish: 'Consultant Pathologist & Lab Director',
    specialtyTitleUrdu: 'کنسلٹنٹ پیتھالوجسٹ و لیبارٹری ڈائریکٹر',
    phone: '0301-3344556',
    isActive: true,
    qualification: 'MBBS, M.Phil (Hematology & Pathology)',
    shiftTiming: '08:30 AM - 07:30 PM',
    permissions: ['pathology_reporting'],
  },
  {
    id: 'staff-lab-eye',
    username: 'dr_eye',
    password: 'eye123',
    name: 'Dr. Asim Farooq',
    nameUrdu: 'ڈاکٹر عاصم فاروق (کنسلٹنٹ آپٹومیٹرسٹ)',
    role: 'lab_doctor',
    assignedLabCategory: 'Computerized Eye Scan',
    department: 'Computerized Vision & Eye Diagnostic Lab',
    specialtyTitleEnglish: 'Consultant Optometrist & Vision Diagnostics Specialist',
    specialtyTitleUrdu: 'کنسلٹنٹ آپٹومیٹرسٹ و آئی اسکیننگ انچارج',
    phone: '0322-7788990',
    isActive: true,
    qualification: 'Doctor of Optometry (OD), Refraction Specialist',
    shiftTiming: '10:00 AM - 08:00 PM',
    permissions: ['eye_refraction_scan'],
  },
  {
    id: 'staff-lab-ultrasound',
    username: 'dr_ultrasound',
    password: 'lab123',
    name: 'Dr. Farhana Chaudhry',
    nameUrdu: 'ڈاکٹر فرحانہ چوہدری (کنسلٹنٹ سونوگرافر)',
    role: 'lab_doctor',
    assignedLabCategory: 'Ultrasound & Imaging',
    department: 'Ultrasound & Color Doppler Imaging Unit',
    specialtyTitleEnglish: 'Consultant Sonologist & Ultrasound Specialist',
    specialtyTitleUrdu: 'کنسلٹنٹ سونوگرافر و الٹراساؤنڈ انچارج',
    phone: '0302-6677889',
    isActive: true,
    qualification: 'MBBS, Diploma in Medical Ultrasound (DMU)',
    shiftTiming: '11:00 AM - 05:00 PM',
    permissions: ['ultrasound_reporting'],
  },
];

export function getLocalStaffUsers(): StaffUser[] {
  const saved = localStorage.getItem('hc_hospital_staff_users_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return INITIAL_STAFF_USERS;
}

export function saveLocalStaffUsers(users: StaffUser[]): void {
  localStorage.setItem('hc_hospital_staff_users_v3', JSON.stringify(users));
}

export function getOperationalStaffOnly(): StaffUser[] {
  return getLocalStaffUsers().filter((u) => u.role !== 'admin');
}

export function authenticateStaffUser(username: string, password?: string): { success: boolean; user?: StaffUser; message: string } {
  const allUsers = getLocalStaffUsers();
  const foundUser = allUsers.find((u) => u.username.trim().toLowerCase() === username.trim().toLowerCase());

  if (!foundUser) {
    return {
      success: false,
      message: 'Staff user not found. Please verify the username provided by the Hospital Administrator.',
    };
  }

  if (foundUser.isActive === false) {
    return {
      success: false,
      message: 'Account Disabled: This staff member account has been suspended by Administration. Contact Executive Admin.',
    };
  }

  if (foundUser.password && password !== foundUser.password) {
    return {
      success: false,
      message: 'Incorrect password! Please enter the exact password assigned to this account by the Admin.',
    };
  }

  return {
    success: true,
    user: foundUser,
    message: 'Staff authentication verified successfully.',
  };
}

export function userHasPermission(user: StaffUser | null | undefined, permissionId: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!user.permissions || user.permissions.length === 0) return false;
  if (user.permissions.includes('all')) return true;
  return user.permissions.includes(permissionId);
}
