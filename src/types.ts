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
  patientName: string;
  phone: string;
  city: string;
  problem: string;
  doctorName?: string;
  doctorPreference?: string;
  date: string;
  timeSlot: string;
  status: string;
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
