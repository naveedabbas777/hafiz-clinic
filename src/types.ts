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
  category: 'hair' | 'skin' | 'eye' | 'perfume' | 'pain';
  categoryUrdu: string;
  pricePKR: number;
  originalPricePKR?: number;
  image: string;
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

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  phone: string;
  city: string;
  problem: string;
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

