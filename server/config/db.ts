import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMongoUri, loadRuntimeEnv, logMissingEnvKeys, normalizeMongoUri } from './env';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Disease } from '../models/Disease';
import { Product } from '../models/Product';

loadRuntimeEnv();

export const MONGODB_URI = process.env.MONGODB_URI || '';

let lastConnectedTime: string | null = null;
let lastError: string | null = null;

export function getMongoConnectedStatus() {
  return mongoose.connection.readyState === 1;
}

export function getMongoDiagnostics() {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    connected: readyState === 1,
    status: states[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    lastConnectedTime,
    lastError,
  };
}

export async function connectDB(forceReload = false) {
  if (forceReload) {
    loadRuntimeEnv();
  }
  const uri = normalizeMongoUri(process.env.MONGODB_URI || MONGODB_URI);
  if (!uri) {
    const missing = logMissingEnvKeys(['MONGODB_URI']);
    lastError = missing.length
      ? `MongoDB Atlas URI is empty. Missing required deployment variables: ${missing.join(', ')}`
      : 'MongoDB Atlas URI is empty in process.env.MONGODB_URI';
    console.warn(lastError);
    return false;
  }
  if (!isMongoUri(uri)) {
    lastError = 'MONGODB_URI has an invalid format. It must start with mongodb:// or mongodb+srv://. In cPanel, enter only the URI as the value, without MONGODB_URI= or surrounding quotes.';
    console.error(`[env] ${lastError}`);
    return false;
  }
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    lastConnectedTime = new Date().toISOString();
    lastError = null;
    console.log('Successfully connected to MongoDB Atlas.');
    await seedInitialData();
    return true;
  } catch (err: any) {
    lastError = err.message || 'Unknown MongoDB connection error';
    console.error('MongoDB Atlas Connection Error:', lastError);
    return false;
  }
}

async function seedInitialData() {
  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Hafiz Clinic Admin',
        email: 'admin@hafizclinic.com',
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        phone: '03001234567',
        city: 'گوجرانوالہ',
      });
      console.log('Seeded initial Admin user in MongoDB Atlas: admin / admin123');
    }

    // 2. Seed Doctors
    const doctorUserExists = await User.findOne({ role: 'doctor' });
    if (!doctorUserExists) {
      const hashedDoctorPassword = await bcrypt.hash('doc123', 10);
      await User.create({
        name: 'Dr. Zeeshan Sagheer',
        email: 'dr.zeeshan@hafizclinic.com',
        username: 'drzeeshan',
        password: hashedDoctorPassword,
        role: 'doctor',
        phone: '03001234567',
        specialization: 'General Physician & Quantum Scanning',
        city: 'گوجرانوالہ',
      });
      await User.create({
        name: 'Dr. Waqas Sagheer',
        email: 'dr.waqas@hafizclinic.com',
        username: 'drwaqas',
        password: hashedDoctorPassword,
        role: 'doctor',
        phone: '03007654321',
        specialization: 'Physiotherapy & Eye Care Specialist',
        city: 'لاہور',
      });
      console.log('Seeded initial Doctor users in MongoDB Atlas');
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.create([
        {
          nameUrdu: 'ڈاکٹر زیشان چوہدری',
          nameEnglish: 'Dr. Zeeshan Chaudhry',
          qualification: 'MBBS, RMP (Reg. No. 45892)',
          experience: '15+ سال کا وسیع تجربہ',
          specializationUrdu: 'جوڑوں کا درد، اعصابی کمزوری، معدہ و جگر کے امراض اور کمپیوٹرائزڈ ڈائیگنوسس',
          specializationEnglish: 'Joint Pain, Neurological Disorders, Gastrointestinal Health & Computer Diagnosis',
          timingUrdu: 'صبح 8:00 بجے سے دوپہر 2:00 بجے تک (مارننگ او پی ڈی)',
          timingEnglish: '8:00 AM - 2:00 PM (Morning OPD)',
          eveningTimingUrdu: 'شام 5:00 بجے سے رات 9:00 بجے تک (ایوننگ او پی ڈی)',
          eveningTimingEnglish: '5:00 PM - 9:00 PM (Evening OPD)',
          image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
          phone: '+92 300 1234567',
          email: 'dr.zeeshan@hafizclinic.com',
        },
        {
          nameUrdu: 'ڈاکٹر وقاص صغیر چوہدری',
          nameEnglish: 'Dr. Waqas Sageer Chaudhry',
          qualification: 'MBBS, DPT (Reg. No. 51204)',
          experience: '12+ سال کا تجربہ',
          specializationUrdu: 'فالج، لقوہ، کمر کے مہروں کا درد، فزیوتھراپی اور آنکھوں کے معائنے کے ماہر',
          specializationEnglish: 'Stroke Rehab, Sciatica, Disc Issues, Physiotherapy & Eye Care',
          timingUrdu: 'دوپہر 2:00 بجے سے رات 8:00 بجے تک (او پی ڈی)',
          timingEnglish: '2:00 PM - 8:00 PM (Regular OPD)',
          eveningTimingUrdu: 'شام 6:00 بجے سے رات 10:00 بجے تک (سپیشل کنسلٹیشن)',
          eveningTimingEnglish: '6:00 PM - 10:00 PM (Special Consultation)',
          image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
          phone: '+92 345 7654321',
          email: 'dr.waqas@hafizclinic.com',
        },
      ]);
      console.log('Seeded initial Doctors in MongoDB Atlas');
    }

    // 3. Seed Diseases
    const diseaseCount = await Disease.countDocuments();
    if (diseaseCount === 0) {
      await Disease.create([
        {
          nameUrdu: 'جسمانی درد',
          nameEnglish: 'Body Pain',
          category: 'pain',
          symptomsUrdu: ['پورے جسم میں مسلسل میٹھا درد', 'تھکاوٹ اور سستی', 'صبح اٹھتے ہی جسم کا اکڑ جانا'],
          causesUrdu: ['وٹامن ڈی اور کیلشیم کی کمی', 'پٹھوں کی کمزوری'],
          treatmentUrdu: 'کمپیوٹرائزڈ چیک اپ کے بعد مخصوص طبی نسخہ اور لیزر و اسٹیم تھراپی',
          recommendedDoctor: 'ڈاکٹر زیشان چوہدری',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
        },
        {
          nameUrdu: 'جوڑوں کا درد',
          nameEnglish: 'Joint Pain (Arthritis)',
          category: 'pain',
          symptomsUrdu: ['جوڑوں میں سوجن اور سرخی', 'چلنے پھرنے میں شدید تکلیف', 'نماز پڑھنے میں دشواری'],
          causesUrdu: ['یورک ایسڈ کی زیادہ مقدار', 'جوڑوں کی چکنائی کا کم ہونا'],
          treatmentUrdu: 'حافظ جوائنٹ کیئر فارمولہ اور فزیوتھراپی سیشنز',
          recommendedDoctor: 'ڈاکٹر زیشان چوہدری',
          image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
        },
      ]);
      console.log('Seeded initial Diseases in MongoDB Atlas');
    }

    // 4. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create([
        {
          nameUrdu: 'حافظ جوائنٹ کیئر ہربل آئل و سیرپ',
          nameEnglish: 'Hafiz Joint Care Herbal Syrup',
          pricePKR: 1850,
          originalPricePKR: 2200,
          category: 'supplements',
          categoryUrdu: 'مقوی ادویات',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
          descriptionUrdu: 'جوڑوں اور گھٹنوں کے درد کا مکمل شافی علاج۔',
          stock: 45,
          isFeatured: true,
        },
        {
          nameUrdu: 'حافظ گیسترو ریلیف سفوف',
          nameEnglish: 'Hafiz Gastro Relief Powder',
          pricePKR: 1200,
          originalPricePKR: 1500,
          category: 'syrups',
          categoryUrdu: 'شربت اور معجون',
          image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600',
          descriptionUrdu: 'معدے کی تیزابیت، گیس، تبخیر اور بدہضمی کا فوری حل۔',
          stock: 60,
          isFeatured: true,
        },
      ]);
      console.log('Seeded initial Products in MongoDB Atlas');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
}
