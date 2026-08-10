import React from 'react';
import {
  Stethoscope,
  Activity,
  Zap,
  Flame,
  HeartPulse,
  Film,
  Waves,
  Scan,
  TestTube,
  Calendar,
  CreditCard,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

interface ServicesViewProps {
  onOpenAppointment: (serviceName?: string) => void;
  language?: 'urdu' | 'english';
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onOpenAppointment,
  language = 'english',
}) => {
  const isUrdu = language === 'urdu';

  const servicesList = [
    {
      id: 'consultation',
      titleUrdu: 'ڈاکٹر مشاورت',
      titleEnglish: 'Specialist Doctor Consultation',
      icon: Stethoscope,
      categoryUrdu: 'طبی او پی ڈی',
      categoryEnglish: 'Medical OPD',
      badgeUrdu: 'ڈاکٹر زیشان / ڈاکٹر وقاص',
      badgeEnglish: 'Dr. Zeeshan / Dr. Waqas',
      descUrdu:
        'مبصر اور سینئر ایلوپیتھک و ہربل فزیشنز کی زیر نگرانی تمام جسمانی بیماریوں کا جامع معائنہ اور بہترین علاج۔',
      descEnglish:
        'Comprehensive medical examination and specialized treatment for all acute and chronic diseases under experienced doctors.',
      featuresUrdu: ['مکمل جسمانی معائنہ', 'پلس و کوانٹم اسکین', 'مستند تجاویز و نسخہ', 'فالو اپ رہنمائی'],
      featuresEnglish: ['Full Body Diagnosis', 'Pulse & Bio-Quantum Scan', 'Personalized Prescription', 'Follow-up Guidance'],
    },
    {
      id: 'physiotherapy',
      titleUrdu: 'فزیوتھراپی',
      titleEnglish: 'Advanced Physiotherapy & Rehab',
      icon: Activity,
      categoryUrdu: 'جسمانی بحالی',
      categoryEnglish: 'Physical Rehab',
      badgeUrdu: 'جدید مشینیں و ورزشیں',
      badgeEnglish: 'Modern Rehab Machines',
      descUrdu:
        'جوڑوں کا درد، کمر درد، عرق النساء (سائٹیکا)، گردن کے پٹھوں کا کھچاؤ اور فالج کے بعد کی بحالی کی جدید فزیوتھراپی۔',
      descEnglish:
        'Advanced electrotherapy, spinal decompression, joint mobilization, and post-stroke paralysis rehabilitation.',
      featuresUrdu: ['ریڑھ کی ہڈی کا مساج', 'الٹراساؤنڈ تھراپی', 'پٹھوں کی مضبوطی', 'پوزیشن کی درستی'],
      featuresEnglish: ['Spine Decompression', 'TENS & Ultrasound Therapy', 'Muscle Strengthening', 'Posture Correction'],
    },
    {
      id: 'laser-therapy',
      titleUrdu: 'لیزر تھراپی',
      titleEnglish: 'Cold Laser & Pain Relief Therapy',
      icon: Zap,
      categoryUrdu: 'جدید تسکین درد',
      categoryEnglish: 'Modern Pain Relief',
      badgeUrdu: 'بغیر درد و سائیڈ افیکٹ',
      badgeEnglish: 'Painless & Safe',
      descUrdu:
        'پٹھوں کے شدید درد، عضلاتی سوجن، اور جوڑوں کی سوزش کو کم کرنے کے لیے جدید کوالڈ لیزر لائٹ تھراپی۔',
      descEnglish:
        'Non-invasive cold laser light therapy for fast tissue healing, inflammation reduction, and chronic pain relief.',
      featuresUrdu: ['گہرے عضلات تک رسائی', 'خلیات کی تیز بحالی', 'بغیر درد علاج', 'جوڑوں کے درد میں افاقہ'],
      featuresEnglish: ['Deep Tissue Penetration', 'Fast Cell Regeneration', 'Zero Pain Treatment', 'Arthritis Relief'],
    },
    {
      id: 'steam-therapy',
      titleUrdu: 'سٹیم تھراپی',
      titleEnglish: 'Herbal Steam Detox Therapy',
      icon: Flame,
      categoryUrdu: 'قدرتی زہر کشی',
      categoryEnglish: 'Natural Detox',
      badgeUrdu: 'ہربل ڈس انفیکشن',
      badgeEnglish: 'Herbal Disinfection',
      descUrdu:
        'دیسی جڑی بوٹیوں سے لیس گرم بھاپ کے ذریعے جسم کے زہریلے مادوں کا اخراج، بلڈ سرکولیشن اور پٹھوں کو سکون۔',
      descEnglish:
        'Natural detox steam bath infused with aromatic medicinal herbs to improve blood circulation and muscle relaxation.',
      featuresUrdu: ['زہریلے مادوں کا اخراج', 'جلد کی صفائی', 'ذہنی و جسمانی سکون', 'خون کا بہتر بہاؤ'],
      featuresEnglish: ['Body Toxins Removal', 'Skin Pore Cleansing', 'Stress & Pain Relief', 'Improved Blood Flow'],
    },
    {
      id: 'massage-therapy',
      titleUrdu: 'مساج تھراپی',
      titleEnglish: 'Therapeutic Herbal Massage',
      icon: HeartPulse,
      categoryUrdu: 'صحت و تندرستی',
      categoryEnglish: 'Wellness',
      badgeUrdu: 'خاص روغن شفا',
      badgeEnglish: 'Special Healing Oil',
      descUrdu:
        'مخصوص شفا بخش جڑی بوٹیوں کے تیل سے پٹھوں، اعصاب اور جوڑوں کی مالش جو جسمانی تھکاوٹ اور درد دور کرتی ہے۔',
      descEnglish:
        'Specialized therapeutic herbal oil massage designed to reduce tension, soothe nerve pain, and revitalize body energy.',
      featuresUrdu: ['خالص نباتاتی تیل', 'اعصاب کی بیداری', 'پٹھوں کو سکون', 'تھکاوٹ کا خاتمہ'],
      featuresEnglish: ['Pure Herbal Oils', 'Nerve Stimulation', 'Deep Tissue Relaxation', 'Fatigue Reduction'],
    },
    {
      id: 'xray',
      titleUrdu: 'ڈیجیٹل ایکسرے',
      titleEnglish: 'Digital High-Resolution X-Ray',
      icon: Film,
      categoryUrdu: 'تشخیصی معائنہ',
      categoryEnglish: 'Diagnostics',
      badgeUrdu: 'کم سے کم تابکاری',
      badgeEnglish: 'Low Radiation',
      descUrdu:
        'ہڈیوں کے فریکچر، جوڑوں کی سوزش اور چھاتی کے انفیکشن کی درست تشخیص کے لیے جدید ڈیجیٹل ایکسرے سسٹم۔',
      descEnglish:
        'High-precision low-radiation digital imaging for accurate fracture, joint, and chest diagnosis with instant prints.',
      featuresUrdu: ['فوری تصاویر', 'کم تابکاری معیار', 'تفصیلی رپورٹ', 'ڈیجیٹل کاپی'],
      featuresEnglish: ['Instant HD Imaging', 'Low Radiation Dose', 'Radiology Report', 'Digital Softcopy'],
    },
    {
      id: 'ultrasound',
      titleUrdu: 'الٹراساؤنڈ',
      titleEnglish: '3D/4D Abdominal Ultrasound',
      icon: Waves,
      categoryUrdu: 'تشخیصی اسکین',
      categoryEnglish: 'Diagnostics',
      badgeUrdu: 'لیڈی ڈاکٹر سہولت',
      badgeEnglish: 'Lady Doctor Facility',
      descUrdu:
        'پیٹ، گردے، جگر، پتے کی پتھری، اور حمل کے دوران تمام اندرونی اعضاء کی درست و محفوظ الٹراساؤنڈ اسکیننگ۔',
      descEnglish:
        'Diagnostic sonography for abdomen, liver, kidneys, gallbladder stones, and fetal health during pregnancy.',
      featuresUrdu: ['اعلیٰ کوالٹی اسکین', 'گردے کی پتھری کی جانچ', 'جگر و پتا جائزہ', 'حمل کا معائنہ'],
      featuresEnglish: ['High Resolution Probe', 'Kidney Stone Scan', 'Liver & Gallbladder', 'Pregnancy Scanning'],
    },
    {
      id: 'doppler',
      titleUrdu: 'کلر ڈوپلر',
      titleEnglish: 'Color Doppler Vascular Scan',
      icon: Scan,
      categoryUrdu: 'نالیوں کا معائنہ',
      categoryEnglish: 'Vascular Diagnostics',
      badgeUrdu: 'شریانوں کا معائنہ',
      badgeEnglish: 'Vascular Scan',
      descUrdu:
        'خون کی نالیوں، شریانوں کے بہاؤ اور ویری کوز وینز کا جدید ترین کلر اسکین۔',
      descEnglish:
        'Specialized vascular ultrasound to evaluate blood circulation, deep vein thrombosis, and arterial blockages.',
      featuresUrdu: ['خون کی رفتار میپنگ', 'رگوں میں لوتھڑے کی جانچ', 'سوجی نالیوں کا معائنہ', 'شریانوں کی روانی'],
      featuresEnglish: ['Blood Velocity Mapping', 'Deep Vein Thrombosis', 'Varicose Veins', 'Arterial Flow Check'],
    },
    {
      id: 'lab-center',
      titleUrdu: 'لیبارٹری نمونہ جات',
      titleEnglish: 'Pathology & Blood Lab Collection',
      icon: TestTube,
      categoryUrdu: 'پیتھالوجی لیب',
      categoryEnglish: 'Pathology',
      badgeUrdu: 'آن لائن رپورٹس',
      badgeEnglish: 'Online PDF Reports',
      descUrdu:
        'خون، پیشاب، شوگر، کولیسٹرول اور بائیو کیمسٹری کے تمام ٹیسٹوں کی 100% مستند نمونہ جات کی سہولت۔',
      descEnglish:
        'Full spectrum pathology lab services including CBC, LFT, RFT, Lipid Profile, HbA1c, and Vitamin tests.',
      featuresUrdu: ['100٪ مستند نتائج', 'گھر سے نمونہ کی جمع آوری', 'آن لائن پی ڈی ایف ڈاؤنلوڈ', 'واٹس ایپ رپورٹ الرٹ'],
      featuresEnglish: ['100% Accurate Results', 'Home Sample Collection', 'Online PDF Downloads', 'WhatsApp Report Alert'],
    },
    {
      id: 'online-appointment',
      titleUrdu: 'آن لائن اپائنٹمنٹ',
      titleEnglish: 'Online Appointment Booking',
      icon: Calendar,
      categoryUrdu: 'آن لائن علاج',
      categoryEnglish: 'Telehealth & OPD',
      badgeUrdu: '100% فوری تصدیق',
      badgeEnglish: '100% Instant Confirmation',
      descUrdu:
        'گھر بیٹھے ڈاکٹر زیشان چوہدری اور ڈاکٹر وقاص صغیر سے آن لائن یا کلینک وزٹ کے لیے ٹائم سلاٹ بک کریں۔',
      descEnglish:
        'Book instant physical OPD visits or online video consultations with our senior medical specialists.',
      featuresUrdu: ['ڈاکٹر کا انتخاب', 'مناسب وقت منتخب کریں', 'ایس ایم ایس و واٹس ایپ یاد دہانی', 'فوری ٹوکن'],
      featuresEnglish: ['Select Preferred Doctor', 'Choose Convenient Time', 'SMS & WhatsApp Reminder', 'Instant Token'],
    },
    {
      id: 'online-billing',
      titleUrdu: 'آن لائن بلنگ و ڈیلیوری',
      titleEnglish: 'Online Digital Billing & Checkout',
      icon: CreditCard,
      categoryUrdu: 'ڈیجیٹل سروسز',
      categoryEnglish: 'Digital Services',
      badgeUrdu: 'ایزی پیسہ / جاز کیش',
      badgeEnglish: 'EasyPaisa / JazzCash / Card',
      descUrdu:
        'کلینک فیس اور میڈیسن آرڈر کی آن لائن بلنگ، ڈیجیٹل رسیدیں اور پاکستان بھر میں ہوم ڈیلیوری۔',
      descEnglish:
        'Secure online payments for consultation fees, prescribed medicines, lab reports, and doorstep delivery.',
      featuresUrdu: ['ایزی پیسہ اور جاز کیش', 'ویزا و ماسٹر کارڈ', 'بینک ٹرانسفر', 'کیش آن ڈلیوری'],
      featuresEnglish: ['Easypaisa & JazzCash', 'Visa & Mastercard', 'Bank Transfer (IBAN)', 'Cash on Delivery (COD)'],
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'جامع طبی سروسز' : 'Hafiz Clinic Complete Services'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              {isUrdu
                ? 'حافظ کلینک کی تمام طبی، تشخیصی اور بحالی سروسز'
                : 'Advanced Clinical, Diagnostic & Therapeutic Healthcare Services'}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'پنجاب ہیلتھ کیئر کمیشن سے منظور شدہ حافظ کلینک پر تمام طبی معائنے، کمپیوٹرائزڈ بائیو اسکین، فزیوتھراپی، ڈیجیٹل ایکسرے اور لیبارٹری رپورٹس کی سہولت دستیاب ہے۔'
                : 'Certified by Punjab Healthcare Commission. Providing expert medical consultations, physical rehab, computerized scanning, pathology, and online healthcare options.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onOpenAppointment()}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>{isUrdu ? 'آن لائن اپائنٹمنٹ بک کریں' : 'Book Appointment Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((srv) => {
            const IconComp = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                      {isUrdu ? srv.badgeUrdu : srv.badgeEnglish}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    {isUrdu ? srv.categoryUrdu : srv.categoryEnglish}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {isUrdu ? srv.titleUrdu : srv.titleEnglish}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {isUrdu ? srv.descUrdu : srv.descEnglish}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    {(isUrdu ? srv.featuresUrdu : srv.featuresEnglish).map((ft, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{ft}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenAppointment(isUrdu ? srv.titleUrdu : srv.titleEnglish)}
                  className="w-full bg-slate-900 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{isUrdu ? 'یہ سروس بک کریں' : 'Book This Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
