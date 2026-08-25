export interface Doctor {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  titleUrdu?: string;
  titleEnglish?: string;
  qualification: string;
  experience: string;
  specializationUrdu: string;
  specializationEnglish: string;
  timingUrdu: string;
  timingEnglish?: string;
  eveningTimingUrdu?: string;
  eveningTimingEnglish?: string;
  image: string;
  phone: string;
  email?: string;
  checkupFee?: number;
}

export interface Disease {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  category: 'pain' | 'neurological' | 'kidney' | 'stomach' | 'male' | 'female' | 'general' | 'skin' | string;
  categoryUrdu: string;
  symptomsUrdu: string[];
  causesUrdu: string[];
  treatmentUrdu: string | string[];
  shortDescUrdu: string | string[];
  iconName?: string;
  image?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  category: 'hair' | 'skin' | 'eye' | 'perfume' | 'pain' | 'supplements' | 'syrups' | string;
  categoryUrdu: string;
  pricePKR: number;
  originalPricePKR?: number;
  image: string;
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | string;
  descriptionUrdu: string;
  descriptionEnglish?: string;
  ingredientsUrdu?: string[];
  benefitsUrdu?: string[];
  howToUseUrdu?: string;
  inStock?: boolean;
  stock?: number;
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export type AppointmentCategory = 'doctor_consultation' | 'diagnostic_test';

export interface DigitalSlipItem {
  name: string;
  category?: string;
  qty?: number;
  price?: number;
  total?: number;
  dosage?: string;
  instructions?: string;
}

export interface DigitalSlipData {
  slipType: 'prescription' | 'invoice' | 'lab_token' | 'discharge_summary' | 'diagnostic_appointment' | 'custom';
  slipNumber: string;
  patientName: string;
  patientPhone?: string;
  mrnNumber?: string;
  doctorName?: string;
  department?: string;
  date: string;
  timeSlot?: string;
  tokenNumber?: number | string;
  diagnosis?: string;
  medicinesText?: string;
  instructions?: string;
  precautions?: string;
  items?: DigitalSlipItem[];
  subtotal?: number;
  discount?: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  status?: string;
  verifiedBy?: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  phone: string;
  city: string;
  problem: string;
  appointmentCategory?: AppointmentCategory;
  testDepartment?: string;
  testName?: string;
  testFee?: number;
  testInstructions?: string;
  doctorId?: string;
  doctorName?: string;
  doctorPreference?: string;
  doctorFee?: number;
  date: string;
  timeSlot: string;
  status: string;
  tokenNumber?: number | string;
  referralToken?: string;
  referralFromDoctor?: string;
  referralToDoctor?: string;
  referralService?: string;
  referralNotes?: string;
  referralFee?: number;
  referralStatus?: 'Pending' | 'Approved' | 'Accepted' | 'Completed' | 'Cancelled';
  isReferral?: boolean;
  invoiceId?: string;
  createdAt?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedOption?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  country: string;
  items: OrderItem[];
  totalAmountPKR: number;
  paymentMethod: 'COD' | 'BankTransfer' | 'JazzCash' | 'Easypaisa';
  status: string;
  date?: string;
  createdAt?: string;
  trackingNumber?: string;
}

export interface FAQItem {
  id: string;
  questionUrdu: string;
  answerUrdu: string;
  questionEnglish?: string;
  answerEnglish?: string;
  category: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  city: string;
  rating: number;
  commentUrdu: string;
  diseaseTreatedUrdu: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  titleUrdu: string;
  category: 'Clinic' | 'Doctors' | 'Patients' | 'Medicines' | 'Machines' | 'Certificates';
  image?: string;
  imageUrl: string;
}

export interface HealthArticle {
  id: string;
  titleUrdu: string;
  titleEnglish?: string;
  category: string;
  categoryUrdu?: string;
  date: string;
  author?: string;
  authorUrdu?: string;
  authorEnglish?: string;
  readTime?: string;
  summaryUrdu?: string;
  excerptUrdu?: string;
  excerptEnglish?: string;
  contentUrdu?: string;
  contentEnglish?: string;
  image?: string;
  imageUrl?: string;
  likes?: number;
  tags?: string[];
}

export type Article = HealthArticle;

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testNameUrdu: string;
  testNameEnglish: string;
  doctorName: string;
  date: string;
  status: 'Ready' | 'In Progress';
  fileUrl?: string;
  summary: string;
}

export interface ClinicSettings {
  clinicNameUrdu: string;
  clinicNameEnglish: string;
  taglineUrdu: string;
  punjabHealthRegNo?: string;
  phcApprovalNo?: string;
  isPunjabHealthApproved?: boolean;
  phone1: string;
  phone2: string;
  whatsappNumber: string;
  email: string;
  addressUrdu: string;
  addressEnglish: string;
  timingUrdu: string;
  googleMapsUrl: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  // Dedicated Section Video Configurations
  clinicVideoUrl?: string;
  clinicVideoTitleUrdu?: string;
  clinicVideoTitleEnglish?: string;
  eyeCareVideoUrl?: string;
  eyeCareVideoTitleUrdu?: string;
  eyeCareVideoTitleEnglish?: string;
  hairOilVideoUrl?: string;
  hairOilVideoTitleUrdu?: string;
  hairOilVideoTitleEnglish?: string;
  beautyCreamVideoUrl?: string;
  beautyCreamVideoTitleUrdu?: string;
  beautyCreamVideoTitleEnglish?: string;
  painReliefVideoUrl?: string;
  painReliefVideoTitleUrdu?: string;
  painReliefVideoTitleEnglish?: string;
}

export interface MoneySlipItem {
  id: string;
  description: string;
  category: 'Checkup Fee' | 'Medicine' | 'X-Ray / Radiology' | 'Lab Test / Scan' | 'Eye Care / Glasses' | 'Operation / Surgery' | 'Hijama / Cupping' | 'Physiotherapy' | 'Dressing / Nursing' | 'Bed Charge' | 'Consultation' | 'Misc Service' | 'Referral Consultation' | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  department?: string;
  servedBy?: string;
}

export interface MoneySlip {
  id: string;
  slipNo: string;
  tokenNumber?: string | number;
  patientName: string;
  patientPhone: string;
  mrnNumber?: string;
  doctorName: string;
  date: string;
  items: MoneySlipItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod: 'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';
  notes?: string;
  appointmentId?: string;
  isAutoGenerated?: boolean;
  source?: 'Appointment' | 'Manual' | 'Doctor OPD' | 'Referral' | string;
  referralInfo?: string;
  createdAt?: string;
}

export interface HospitalExpense {
  id: string;
  voucherNo: string;
  title: string;
  category: 'Staff Salaries' | 'Medicine & Pharmacy Stock' | 'Utilities & Bills' | 'Equipment & Maintenance' | 'Hospital Rent' | 'Tea & Refreshment' | 'Surgical & Lab Supplies' | 'Miscellaneous';
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash';
  notes?: string;
  createdAt?: string;
}

// Staff & Role-Based Access Control
export type StaffRole =
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'ipd_incharge'
  | 'pharmacist'
  | 'lab_doctor'
  | 'receptionist';

export interface StaffUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  nameUrdu?: string;
  role: StaffRole;
  department?: string; // e.g. "General OPD", "In-Patient Ward", "Central Pharmacy", "Radiology / X-Ray", "Pathology & Blood Lab", "Eye Diagnostics & Optical"
  assignedLabCategory?: string; // e.g. "Radiology / X-Ray" | "Hematology / CBC" | "Computerized Eye Scan" | "Biochemistry & Diabetes" | "All"
  specialtyTitleUrdu?: string;
  specialtyTitleEnglish?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  assignedDoctorId?: string;
  qualification?: string;
  shiftTiming?: string;
  permissions?: string[];
}

export interface PredefinedLabTest {
  id: string;
  category: 'Hematology / CBC' | 'Biochemistry & Diabetes' | 'Lipid Profile' | 'Renal / Kidney RFT' | 'Liver LFT' | 'Urine & Stool R/E' | 'Computerized Eye Scan' | 'Hormones / Thyroid' | 'Radiology / X-Ray' | 'Ultrasound & Imaging' | string;
  name: string;
  nameUrdu: string;
  pricePKR: number;
  sampleType: string;
  department?: string;
  assignedDoctorName?: string;
  assignedDoctorRole?: string;
  instructionsUrdu?: string;
  parameters: LabTestParameter[];
  isCustomAdded?: boolean;
}

// Digital Prescription & EMR
export interface PrescriptionMedicine {
  id: string;
  name: string;
  form: 'Tablet' | 'Syrup' | 'Drops' | 'Capsule' | 'Injection' | 'Cream / Ointment' | 'Herbal Majoon' | 'Herbal Safoof' | 'Eye Drops' | 'Inhaler';
  dosage: string; // e.g. "500mg", "1 spoon", "2 drops"
  frequency: string; // e.g. "1-0-1 (صبح و شام)", "1-1-1 (تین وقت)", "0-0-1 (رات کو)", "ضرورت کے وقت"
  timing: 'Before Meal (کھانے سے پہلے)' | 'After Meal (کھانے کے بعد)' | 'With Water (پانی کے ساتھ)' | 'Empty Stomach (نہار منہ)';
  durationDays: number;
  instructionsUrdu?: string;
}

export interface PrescriptionVitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  temperature?: number; // °F
  weightKg?: number;
  bloodSugarMgDl?: number;
  sugarType?: 'Fasting' | 'Random' | 'Post-Prandial';
  spo2?: number;
}

export interface Prescription {
  id: string;
  rxNumber: string;
  patientId?: string;
  patientName: string;
  patientAge?: number | string;
  patientGender?: 'Male' | 'Female' | 'Child' | 'Other';
  patientPhone: string;
  patientCity?: string;
  mrnNumber?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorQualification?: string;
  date: string;
  vitals?: PrescriptionVitals;
  presentingComplaintsUrdu: string;
  clinicalDiagnosisUrdu: string;
  medicines: PrescriptionMedicine[];
  advisedTests: string[];
  dietaryAdviceUrdu?: string;
  precautionsUrdu?: string;
  followUpDate?: string;
  qrVerificationCode?: string;
  appointmentId?: string;
  status?: 'Active' | 'Dispensed' | 'Completed';
  createdAt?: string;
}

export type DigitalPrescription = Prescription;

// OPD Live Queue & Waiting Room Screen
export interface OPDQueueToken {
  id: string;
  tokenNumber: number;
  tokenCode: string; // e.g. "TK-042"
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  issueTime: string;
  estimatedWaitMins: number;
  status: 'Waiting' | 'Calling' | 'In Consultation' | 'Completed' | 'Skipped';
  appointmentId?: string;
  prescriptionId?: string;
  invoiceId?: string;
}

// Smart Pharmacy Batch & Barcode POS
export interface PharmacyBatchItem {
  id: string;
  productId: string;
  productNameUrdu: string;
  productNameEnglish: string;
  barcode?: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  mfgDate?: string;
  costPricePKR: number;
  salePricePKR: number;
  currentStock: number;
  minThreshold: number;
  rackLocation?: string;
  supplierName?: string;
}

// Pathology & Diagnostic Lab Tests
export interface LabTestParameter {
  name: string;
  unit: string;
  normalRange: string;
  minNormal?: number;
  maxNormal?: number;
  value?: string | number;
  isAbnormal?: boolean;
}

export interface LabTestOrder {
  id: string;
  orderNumber: string;
  patientId?: string;
  patientName: string;
  patientAge?: number | string;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  referredByDoctor: string;
  testCategory: 'Hematology / CBC' | 'Biochemistry & Diabetes' | 'Lipid Profile' | 'Renal / Kidney RFT' | 'Liver LFT' | 'Urine & Stool R/E' | 'Computerized Eye Scan' | 'Hormones / Thyroid' | 'Radiology / X-Ray';
  testName: string;
  testDate: string;
  deliveryDate?: string;
  parameters: LabTestParameter[];
  clinicalInterpretationUrdu?: string;
  reportedByTechnician?: string;
  approvedByPathologist?: string;
  pricePKR: number;
  paymentStatus: 'Paid' | 'Pending';
  status: 'Sample Collected' | 'Processing' | 'Report Ready' | 'Delivered';
  fileUrl?: string;
  createdAt?: string;
}

// Daily Cash Shift & Financial Audit
export interface DailyCashShiftReport {
  shiftId: string;
  cashierName: string;
  shiftDate: string;
  openingCashPKR: number;
  cashCollectionsPKR: number;
  easyPaisaCollectionsPKR: number;
  jazzCashCollectionsPKR: number;
  bankCardCollectionsPKR: number;
  totalCollectionsPKR: number;
  expensesPaidPKR: number;
  expectedCashInDrawerPKR: number;
  actualCashCountedPKR: number;
  discrepancyPKR: number;
  status: 'Open' | 'Closed' | 'Verified';
  notes?: string;
}

export interface DoctorRevenueShare {
  doctorId: string;
  doctorName: string;
  totalConsultations: number;
  totalOPDFeesPKR: number;
  doctorSharePercentage: number;
  doctorPayablePKR: number;
  hospitalSharePKR: number;
  paidAmountPKR: number;
  balancePayablePKR: number;
}

// ==========================================
// IPD & Ward Management Types
// ==========================================
export type WardType = 'General Ward (Male)' | 'General Ward (Female)' | 'Private Deluxe Room' | 'Semi-Private Room' | 'Emergency & Day Care' | 'ICU / High Dependency';

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Under Maintenance';

export interface WardBed {
  id: string;
  bedNumber: string;
  wardName: string;
  wardType: WardType;
  floor: string;
  dailyRentPKR: number;
  status: BedStatus;
  amenities: string[];
  currentAdmissionId?: string;
  currentPatientName?: string;
  admittedSince?: string;
}

export interface NursingCareLog {
  id: string;
  admissionId: string;
  timestamp: string;
  roundShift: 'Morning (08:00 AM)' | 'Afternoon (02:00 PM)' | 'Evening (08:00 PM)' | 'Night (02:00 AM)' | 'Emergency / Special';
  nurseName: string;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    pulseRate: number;
    temperatureF: number;
    respiratoryRate?: number;
    spo2Percentage?: number;
    randomBloodSugar?: number;
    painScale?: number; // 1 to 10
  };
  ivFluidsDrip?: string; // e.g. "Normal Saline 1000ml @ 30 drops/min"
  injectionsGiven?: string[]; // e.g. ["Inj. Tramadol IV", "Inj. Rocephin 1g"]
  oralMedicationsGiven?: string[]; // e.g. ["Tab. Hoorab Shifa 500mg", "Tab. Panadol 2 tabs"]
  intakeOutput: {
    oralFluidMl?: number;
    ivFluidMl?: number;
    urineOutputMl?: number;
    bowelMovement?: 'Normal' | 'Constipated' | 'Loose' | 'Nil';
  };
  clinicalNotes: string;
  doctorNotified?: boolean;
}

export interface IPDAdmission {
  id: string;
  admissionNumber: string; // e.g. "IPD-2026-0042"
  mrn: string; // Medical Record Number "MRN-88491"
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  cnicNumber?: string;
  address?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation: string;
  
  // Admission Details
  admittingDoctorId: string;
  admittingDoctorName: string;
  admittingDoctorSpecialty: string;
  admissionDate: string;
  admissionTime: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  wardType: WardType;
  
  provisionalDiagnosis: string;
  admissionReasonUrdu: string;
  allergies?: string[];
  initialVitals: {
    bpSystolic: number;
    bpDiastolic: number;
    pulse: number;
    temperatureF: number;
    spo2?: number;
  };
  
  // Financials
  dailyBedRatePKR: number;
  advanceDepositPaidPKR: number;
  depositPaymentMethod: 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  
  // Clinical Tracking
  nursingLogs: NursingCareLog[];
  doctorVisitNotes: Array<{
    id: string;
    doctorName: string;
    timestamp: string;
    notes: string;
    prescribedChanges?: string;
  }>;
  
  status: 'Admitted' | 'Discharged' | 'Transferred' | 'LAMA (Left Against Medical Advice)';
  
  // Discharge Summary & Billing (populated on discharge)
  dischargeDetails?: {
    dischargeDate: string;
    dischargeTime: string;
    finalDiagnosis: string;
    conditionAtDischarge: 'Recovered / Stable' | 'Improved' | 'Referred to Tertiary Care' | 'Critical / LAMA';
    hospitalCourseSummaryUrdu: string;
    dischargeAdviceUrdu: string;
    dischargeMedications: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      instructions: string;
    }>;
    followUpDate: string;
    emergencyWarningSignsUrdu: string;
    dischargingDoctorName: string;
    
    // Financial Itemized Clearance Bill
    stayDays: number;
    bedRentTotalPKR: number;
    nursingCareTotalPKR: number;
    doctorConsultationVisitsTotalPKR: number;
    pharmacyMedicationsTotalPKR: number;
    labInvestigationsTotalPKR: number;
    procedureChargesPKR: number;
    grossTotalPKR: number;
    advanceDeductedPKR: number;
    discountDiscountPKR: number;
    netBalancePayablePKR: number;
    paymentStatus: 'Paid & Cleared' | 'Partial / Pending';
    paymentMethod?: string;
    clearanceReceiptNo?: string;
  };
  
  createdAt: string;
}


