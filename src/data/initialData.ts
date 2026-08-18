import { Doctor, Disease, Product, FAQItem, Testimonial, GalleryItem, HealthArticle, ClinicSettings, Appointment, Order } from '../types';

export const initialClinicSettings: ClinicSettings = {
  clinicNameUrdu: 'حافظ کلینک',
  clinicNameEnglish: 'Hafiz Clinic',
  taglineUrdu: 'پرانی سے پرانی بیماریوں کا جدید اور شفابخش علاج',
  punjabHealthRegNo: 'PHC-REG-849201',
  isPunjabHealthApproved: true,
  phone1: '+92 300 1234567',
  phone2: '+92 345 7654321',
  whatsappNumber: '923001234567',
  email: 'info@hafizclinic.com',
  addressUrdu: 'مین روڈ، بالمقابل پنجاب نیشنل بینک، گوجرانوالہ / لاہور، پنجاب، پاکستان',
  addressEnglish: 'Main Road, Opposite Punjab National Bank, Gujranwala / Lahore, Punjab, Pakistan',
  timingUrdu: 'صبح 8:00 بجے سے رات 8:00 بجے تک (روزانہ)',
  googleMapsUrl: 'https://maps.google.com',
  facebookUrl: 'https://facebook.com/hafizclinic',
  youtubeUrl: 'https://youtube.com/c/hafizclinic',
};

export const initialDoctors: Doctor[] = [
  {
    id: 'doc-1',
    nameUrdu: 'ڈاکٹر زیشان چوہدری',
    nameEnglish: 'Dr. Zeeshan Chaudhry',
    titleUrdu: 'سنیئر فزیشن اور ہربل کنسلٹنٹ',
    titleEnglish: 'Senior Physician & Herbal Consultant',
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
    checkupFee: 1500,
  },
  {
    id: 'doc-2',
    nameUrdu: 'ڈاکٹر وقاص صغیر چوہدری',
    nameEnglish: 'Dr. Waqas Sageer Chaudhry',
    titleUrdu: 'فزیوتھراپسٹ اور ریسرچ سپیشلسٹ',
    titleEnglish: 'Physiotherapist & Pain Specialist',
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
    checkupFee: 2000,
  },
];

export const initialDiseases: Disease[] = [
  // Pain category
  {
    id: 'dis-1',
    nameUrdu: 'جسمانی درد',
    nameEnglish: 'Body Pain',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['پورے جسم میں مسلسل میٹھا درد', 'تھکاوٹ اور سستی', 'صبح اٹھتے ہی جسم کا اکڑ جانا', 'کام کرنے سے جلدی تھکن'],
    causesUrdu: ['وٹامن ڈی اور کیلشیم کی کمی', 'پٹھوں کی کمزوری', 'بے قاعدہ طرز زندگی', 'ذہنی تناؤ'],
    treatmentUrdu: ['کمپیوٹرائزڈ چیک اپ کے بعد مخصوص طبی نسخہ', 'لیزر و اسٹیم تھراپی', 'قدرتی ہربل ٹونکس', 'طرز زندگی میں تبدیلی'],
    shortDescUrdu: ['پورے جسم کے درد، تھکاوٹ اور اکڑن کا مکمل تدارک۔'],
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-2',
    nameUrdu: 'جوڑوں کا درد',
    nameEnglish: 'Joint Pain (Arthritis)',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['جوڑوں میں سوجن اور سرخی', 'چلنے پھرنے میں شدید تکلیف', 'جوڑوں سے کٹ کٹ کی آوازیں آنا', 'نماز پڑھنے میں دشواری'],
    causesUrdu: ['یورک ایسڈ کی زیادہ مقدار', 'جوڑوں کی چکنائی (Synovial Fluid) کا کم ہونا', 'عمر کی زیادتی', 'پرانی چوٹ'],
    treatmentUrdu: ['حافظ جوائنٹ کیئر فارمولہ', 'فزیوتھراپی سیشنز', 'قدرتی تیل کا مساج', 'یورک ایسڈ کنٹرول ادویات'],
    shortDescUrdu: ['جوڑوں میں سوجن، اکڑن اور چلنے پھرنے میں تکلیف کا قدرتی علاج۔'],
    iconName: 'Bone',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-3',
    nameUrdu: 'گھٹنوں کا درد',
    nameEnglish: 'Knee Pain',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['گھٹنے موڑنے میں شدید درد', 'سیدڑیاں چڑھنے اترنے میں دشواری', 'گھٹنوں کی سوجن', 'کھڑے ہونے میں بے چینی'],
    causesUrdu: ['گھٹنے کے کارٹیلیج کا گھس جانا', 'وزن کی زیادتی', 'کیلشیم کی شدید کمی', 'گھٹنے پر دباؤ'],
    treatmentUrdu: ['خاص گھٹنا بحالی فزیوتھراپی', 'لیزر تھراپی', 'حافظ نی ریلیو کریم', 'غذائی رہنما چارٹ'],
    shortDescUrdu: ['گھٹنوں کی سوجن، گھسنے اور چلنے میں دشواری کا جدید علاج۔'],
    iconName: 'Crosshair',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-4',
    nameUrdu: 'کمر درد و مہرے',
    nameEnglish: 'Back Pain & Disc Problem',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['کمر کے نیچے حصے میں شدید درد', 'جھکنے سے درد کا بڑھنا', 'درد کا ٹانگ میں منتقل ہونا', 'لیٹنے میں بھی بے چینی'],
    causesUrdu: ['ڈسک کا اپنی جگہ سے سرک جانا (Slipped Disc)', 'وزن اٹھانے سے چوٹ', 'غلط بیٹھنے کا انداز', 'پٹھوں کا کھنچاؤ'],
    treatmentUrdu: ['کمپیوٹر سپائن چیک اپ', 'الٹراسونک و الیکٹرک تھراپی', 'خاص ہربل بیک کیئر مساج', 'مہروں کی سیدھ فزیو'],
    shortDescUrdu: ['کمر درد اور ڈسک کے مسائل کا بغیر آپریشن جدید علاج۔'],
    iconName: 'ShieldAlert',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-5',
    nameUrdu: 'گردن درد (Cervical)',
    nameEnglish: 'Neck Pain (Cervical Spondylosis)',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['گردن گھمانے میں شدید درد', 'درد کا کندھے اور ہاتھوں تک جانا', 'سر کے پچھلے حصے میں درد', 'ہاتھوں میں سن پن'],
    causesUrdu: ['موبائل و کمپیوٹر کا زیادہ استعمال', 'گردن کے مہروں کی گھسائی', 'تکیہ اونچا لینا', 'اعصاب پر دباؤ'],
    treatmentUrdu: ['سروائیکل سٹرچنگ فزیوتھراپی', 'اسٹیم مساج', 'مخصوص ہربل کیپسول', 'پوسچر کریکشن رهنمائی'],
    shortDescUrdu: ['گردن کی اکڑن، مہروں کے درد اور سر درد کا علاج۔'],
    iconName: 'Zap',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-6',
    nameUrdu: 'کندھے کا درد (Frozen Shoulder)',
    nameEnglish: 'Shoulder Pain & Frozen Shoulder',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['کندھا جام ہو جانا', 'ہاتھ اوپر اٹھانے میں شدید تکلیف', 'رات کو کندھے پر سونے سے درد', 'کپڑے بدلنے میں دشواری'],
    causesUrdu: ['شوگر کی بیماری', 'کندھے کے کیپسول کا سخت ہونا', 'ساکٹ کی سوزش', 'چوٹ یا کھنچاؤ'],
    treatmentUrdu: ['شولڈر موبلائزیشن فزیوتھراپی', 'لیزر تھراپی', 'خاص گرم ہربل کمپریس', 'درد کش ہربل ادویات'],
    shortDescUrdu: ['جام کندھے کو کھولنے اور درد ختم کرنے کی جدید تھراپی۔'],
    iconName: 'Maximize2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-7',
    nameUrdu: 'ہاتھوں اور ٹانگوں کا درد',
    nameEnglish: 'Hand & Leg Pain',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['ٹانگوں میں بے چینی اور اینٹھن', 'ہاتھوں میں تھکن اور سستی', 'رات کو سوتے وقت ٹانگوں کا درد', 'چلنے سے ٹانگوں کا بھر جانا'],
    causesUrdu: ['خون کی گردش کی کمی', 'بی وٹامنز کی کمی', 'ذیابیطس کے اثرات', 'پٹھوں کی سوزش'],
    treatmentUrdu: ['بلڈ سرکولیشن مساج تھراپی', 'اعصابی مقوی نسخہ جات', 'ویتامنز اور منرلز سپلیمنٹس'],
    shortDescUrdu: ['ٹانگوں کی اینٹھن، ہاتھوں کے درد اور بے چینی کا شافی علاج۔'],
    iconName: 'Footprints',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-8',
    nameUrdu: 'ایڑی کا درد (Plantar Fasciitis)',
    nameEnglish: 'Heel Pain',
    category: 'pain',
    categoryUrdu: 'درد اور مہرے',
    symptomsUrdu: ['صبح زمین پر پہلا قدم رکھتے ہی شدید چوبن', 'ایڑی میں سوئی لگنے کا احساس', 'زیادہ دیر کھڑے رہنے سے درد'],
    causesUrdu: ['ایڑی کی ہڈی کا بڑھنا (Heel Spur)', 'وزن کا دباؤ', 'سخت جوتے پہننا', 'پاؤں کا فلیٹ ہونا'],
    treatmentUrdu: ['ایڑی کی خصوصی الٹراساؤنڈ تھراپی', 'سافٹ انسول مشورہ', 'ہربل اینٹی انفلیمیٹری ٹریٹمنٹ'],
    shortDescUrdu: ['ایڑی کی چوبن اور ہڈی بڑھنے کا جدید غیر آپریشن علاج۔'],
    iconName: 'Anchor',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  },

  // Neurological category
  {
    id: 'dis-9',
    nameUrdu: 'اعصابی کمزوری',
    nameEnglish: 'Nerve Weakness / Neuropathy',
    category: 'neurological',
    categoryUrdu: 'اعصابی اور فالج',
    symptomsUrdu: ['جسم میں جان نہ ہونا', 'ہاتھ پاؤں میں سوئیاں چھبنا', 'حافظہ کمزور ہونا', 'نیند نہ آنا اور نروس پن'],
    causesUrdu: ['وٹامن B12 کی شدید کمی', 'ذیابیطس (ڈیابیٹک نیوروپتی)', 'ذہنی دباؤ اور بے خوابی', 'ضعف اعصاب'],
    treatmentUrdu: ['اعصابی تقویت کا شاہی نسخہ', 'کمپیوٹرائزڈ نرو ٹیسٹنگ', 'طبی ہربل ٹونکس', 'ڈائٹ پلان'],
    shortDescUrdu: ['عصاب کو طاقت دینے اور سستی و سوئیاں ختم کرنے کا علاج۔'],
    iconName: 'Cpu',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-10',
    nameUrdu: 'ہاتھ پاؤں سن ہونا',
    nameEnglish: 'Numbness in Hands & Feet',
    category: 'neurological',
    categoryUrdu: 'اعصابی اور فالج',
    symptomsUrdu: ['ہاتھوں اور پاؤں کی حس ختم ہونا', 'چیزیں ہاتھ سے چھوٹ جانا', 'پاؤں کا سن ہو کر چلنے میں توازن نہ رہنا'],
    causesUrdu: ['عصب پر دباؤ (Nerve Compression)', 'خون کی سپلائی میں رکاوٹ', 'شوگر کے اثرات'],
    treatmentUrdu: ['نیورو ویسکولر فزیوتھراپی', 'خون کی گردش تیز کرنے والی ادویات', 'لیزر مساج'],
    shortDescUrdu: ['ہاتھ پاؤں کے سن پن اور حس بحال کرنے کا بہترین طریقہ۔'],
    iconName: 'HandMetal',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-11',
    nameUrdu: 'رعشہ (Parkinson\'s / Tremors)',
    nameEnglish: 'Tremors / Parkinsonism',
    category: 'neurological',
    categoryUrdu: 'اعصابی اور فالج',
    symptomsUrdu: ['ہاتھوں کا مسلسل کانپنا', 'چائے کا کپ یا قلم نہ پکڑا جانا', 'جسم میں سخت پن', 'آواز میں لرزش'],
    causesUrdu: ['دماغی اعصاب کے کیمیکلز میں کمی', 'بڑھاپا', 'اعصابی نظام کا خلیل'],
    treatmentUrdu: ['دماغی و اعصابی مقوی ہربل ٹریٹمنٹ', 'اعصابی توازن فزیوتھراپی', 'خاص جڑی بوٹیوں کا مجموعہ'],
    shortDescUrdu: ['ہاتھوں کے کانپنے اور رعشہ کو کنٹرول کرنے کا تجربہ شدہ علاج۔'],
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-12',
    nameUrdu: 'فالج (Paralysis / Stroke Rehab)',
    nameEnglish: 'Paralysis & Stroke',
    category: 'neurological',
    categoryUrdu: 'اعصابی اور فالج',
    symptomsUrdu: ['جسم کے ایک طرف کی حرکت ختم ہونا', 'بولنے میں دشواری', 'ہاتھ پاؤں کا بے جان ہونا', 'توازن قائم نہ رہنا'],
    causesUrdu: ['دماغ کی رگ میں خون کا لوتھڑا یا پھٹنا', 'بلڈ پریشر کی زیادہ مقدار', 'ذیابیطس'],
    treatmentUrdu: ['جامع فالج ری ہیبلیٹیشن سینٹر', 'الیکٹرک مسل سٹیولیشن', 'خاص فالج بحالی مساج و فزیو', 'اعصابی تندرستی'],
    shortDescUrdu: ['فالج کے مریضوں کو دوبارہ پاؤں پر کھڑا کرنے کی جدید بحالی۔'],
    iconName: 'UserX',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-13',
    nameUrdu: 'لقوہ (Facial Paralysis / Bell\'s Palsy)',
    nameEnglish: 'Facial Paralysis (Bell\'s Palsy)',
    category: 'neurological',
    categoryUrdu: 'اعصابی اور فالج',
    symptomsUrdu: ['منہ کا ایک طرف ٹیڑھا ہو جانا', 'ایک آنکھ کا بند نہ ہونا', 'پانی پیتے وقت منہ سے نکلنا', 'رخسار کا بے حس ہونا'],
    causesUrdu: ['چہرے کی رگ کی سوزش (7th Cranial Nerve)', 'سرد ہوا کا لگنا', 'وائرل انفیکشن'],
    treatmentUrdu: ['فیشل نروا فزیوتھراپی', 'اسٹیم اینڈ الیکٹرک تھراپی', 'ہربل اینٹی سوجن علاج', 'چہرے کی ورزشیں'],
    shortDescUrdu: ['منہ کا ٹیڑھا پن اور چہرے کا لقوہ ٹھیک کرنے کی گارنٹی شدہ تھراپی۔'],
    iconName: 'Smile',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },

  // Kidney & Urinary Category
  {
    id: 'dis-14',
    nameUrdu: 'گردے کی پتھری',
    nameEnglish: 'Kidney Stones',
    category: 'kidney',
    categoryUrdu: 'گردہ و پیشاب',
    symptomsUrdu: ['کمر کی سائیڈ میں شدید لہر والا درد', 'پیشاب میں خون یا پیپ آنا', 'متلی اور الٹی ہونا', 'پیشاب میں رکاوٹ'],
    causesUrdu: ['پانی کم پینا', 'کیلشیم یا آکسیلیٹ کا زیادہ ہونا', 'یورک ایسڈ کرسٹلز', 'موروثی رجحان'],
    treatmentUrdu: ['بغیر آپریشن ہربل سٹون ریموور', 'گردہ صفائی کٹ', 'قدرتی پتھری ریزہ ریزہ کرنے والی ادویات'],
    shortDescUrdu: ['گردے اور مثانے کی پتھری کو بغیر آپریشن نکالنے کا علاج۔'],
    iconName: 'Droplet',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-15',
    nameUrdu: 'گردے کی سوزش و انفیکشن',
    nameEnglish: 'Kidney Infection & Nephritis',
    category: 'kidney',
    categoryUrdu: 'گردہ و پیشاب',
    symptomsUrdu: ['پاؤں اور چہرے پر سوجن', 'کمر میں مسلسل دباؤ', 'پیشاب کی مقدار کم یا زیادہ ہونا', 'بخار اور کپکپی'],
    causesUrdu: ['گردوں کا انفیکشن', 'ذیابیطس اور ہائی بلڈ پریشر', 'ٹاکسنز کا جمع ہونا'],
    treatmentUrdu: ['گردہ کیئر ہربل فیلٹریشن نُسخہ', 'اینٹی انفلیمیٹری ٹریٹمنٹ', 'کمپیوٹرائزڈ کڈنی ٹیسٹ'],
    shortDescUrdu: ['گردے کی ورم، سوجن اور کارکردگی بحال کرنے کا علاج۔'],
    iconName: 'Shield',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-16',
    nameUrdu: 'پیشاب کی جلن و بار بار پیشاب',
    nameEnglish: 'Urinary Tract Burning & Frequency',
    category: 'kidney',
    categoryUrdu: 'گردہ و پیشاب',
    symptomsUrdu: ['پیشاب کرتے وقت شدید جلن اور درد', 'بار بار مثانہ بھرنے کا احساس', 'رات کو بار بار اٹھنا', 'قطرہ قطرہ پیشاب'],
    causesUrdu: ['یو ٹی آئی انفیکشن (UTI)', 'مثانے کی گرمی', 'پروسٹیٹ غدود کا بڑھنا (Prostate Enlargement)'],
    treatmentUrdu: ['مثانہ مبرد و صفائی شربت', 'ہربل اینٹی بیوٹک کٹ', 'پروسٹیٹ کیئر فارمولہ'],
    shortDescUrdu: ['پیشاب کی جلن، رکاوٹ اور مثانے کی گرمی کا ہربل شفا۔'],
    iconName: 'Flame',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
  },

  // Stomach Category
  {
    id: 'dis-17',
    nameUrdu: 'معدہ، گیس اور تیزابیت',
    nameEnglish: 'Stomach Gas, Acidity & GERD',
    category: 'stomach',
    categoryUrdu: 'معدہ و نظام انہضام',
    symptomsUrdu: ['سینے میں شدید جلن', 'پیٹ کا پھولنا اور گیس', 'کھٹی ڈکاریں آنا', 'کھانا کھانے کے بعد پیٹ میں بھاری پن'],
    causesUrdu: ['مرچ مسالے والے کھانوں کا استعمال', 'معدے میں تیزاب کی زیادہ مقدار', 'ایچ پیلوری انفیکشن (H. Pylori)', 'سگریٹ نوشی'],
    treatmentUrdu: ['حافظ معدہ شفا سفوف', 'ایچ پیلوری ہربل کورس', 'معدے کے السر کا علاج', 'ڈیٹوکس ڈرنک'],
    shortDescUrdu: ['سینے کی جلن، بدہضمی اور گیس کا دائمی خاتمہ۔'],
    iconName: 'CircleAlert',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-18',
    nameUrdu: 'دائمی قبض و بدہضمی',
    nameEnglish: 'Chronic Constipation & Indigestion',
    category: 'stomach',
    categoryUrdu: 'معدہ و نظام انہضام',
    symptomsUrdu: ['کئی کئی دن اجابت نہ ہونا', 'پیٹ میں سخت درد', 'سر کا بھاری رہنا', 'رنگت کا پیلا پڑنا'],
    causesUrdu: ['آنتوں کی سستی (Lazy Bowel)', 'فائبر کی کمی', 'پانی کا کم استعمال', 'بے قاعدہ وقت'],
    treatmentUrdu: ['آنتوں کی صفائی کا قدرتی نُسخہ', 'ملین ہربل سیرپ', 'معدہ قوت ہاضمہ ٹونک'],
    shortDescUrdu: ['پرانی سے پرانی قبض اور آنتوں کی سستی دور کرنے کا علاج۔'],
    iconName: 'RefreshCw',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-19',
    nameUrdu: 'بواسیر و فشر (Piles & Fissure)',
    nameEnglish: 'Piles, Hemorrhoids & Fissure',
    category: 'stomach',
    categoryUrdu: 'معدہ و نظام انہضام',
    symptomsUrdu: ['پاخانے کے ساتھ خون آنا', 'مسوں میں درد اور خارش', 'بیٹھنے میں شدید تکلیف', 'جلن کا احساس'],
    causesUrdu: ['دائمی قبض', 'معدے کی شدید گرمی', 'زیادہ دیر بیٹھ کر کام کرنا', 'مرچ مصالحہ'],
    treatmentUrdu: ['بغیر آپریشن بواسیر مسے ختم کورس', 'فشر جلن مرہم', 'خون بند ہربل ادویات'],
    shortDescUrdu: ['بادی و خونی بواسیر کے مسے بغیر آپریشن خشک کرنے کا طریقہ۔'],
    iconName: 'OctagonAlert',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },

  // Male Health
  {
    id: 'dis-20',
    nameUrdu: 'مردانہ کمزوری',
    nameEnglish: 'Male Vitality & Weakness',
    category: 'male',
    categoryUrdu: 'مردانہ امراض',
    symptomsUrdu: ['جسمانی و اعصابی طاقت میں کمی', 'جلد تھک جانا', 'توجہ مرکوز نہ ہونا', 'احساس کمتری'],
    causesUrdu: ['ٹیسٹوسٹیرون ہارمون کی کمی', 'اعصابی کمزوری', 'ذہنی تناؤ', 'ذیابیطس'],
    treatmentUrdu: ['حافظ شاہی معجون و مقوی اعصاب کورس', 'قدرتی جڑی بوٹیوں سے تیار خالص نسخہ جات', 'ہارمونل بیلنس رہنمائی'],
    shortDescUrdu: ['قدرتی اجزاء اور ہربل فارمولہ سے جسمانی و اعصابی توانائ۔'],
    iconName: 'HeartHandshake',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-21',
    nameUrdu: 'سرعت انزال، جریان و احتلام',
    nameEnglish: 'Premature Ejaculation & Spermatorrhea',
    category: 'male',
    categoryUrdu: 'مردانہ امراض',
    symptomsUrdu: ['پیشاب کے بعد قطرے آنا', 'نیند میں احتلام ہونا', 'کمر میں درد رہنا', 'آنکھوں کے آگے اندھیرا آنا'],
    causesUrdu: ['مثانے کی گرمی', 'اعصاب کی سستی', 'غلط غذاؤں کا استعمال'],
    treatmentUrdu: ['مغلظ و مبرد ہربل کورس', 'مثانے کی گرمی دور کرنے کا نُسخہ', 'تقویت اعصاب'],
    shortDescUrdu: ['مثانے کی گرمی، جریان اور احتلام کا شافی علاج۔'],
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
  },

  // Female Health
  {
    id: 'dis-22',
    nameUrdu: 'لیکوریا (Leucorrhea)',
    nameEnglish: 'Leucorrhea & White Discharge',
    category: 'female',
    categoryUrdu: 'زنانہ امراض',
    symptomsUrdu: ['کمر اور پنڈلیوں میں شدید درد', 'چہرے کی رنگت زرد ہونا', 'جسمانی نڈھالی', 'خارش اور جلن'],
    causesUrdu: ['رحم کی سوزش', 'انفیکشن', 'ویتامنز کی کمی', 'گرم اشیاء کا استعمال'],
    treatmentUrdu: ['حافظ زنانہ کیئر کورس', 'لیکوریا شفا سیرپ', 'رحم کی سوزش کا ہربل علاج'],
    shortDescUrdu: ['خواتین کے پرانے لیکوریا اور کمر درد کا مکمل خاندانی علاج۔'],
    iconName: 'Heart',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-23',
    nameUrdu: 'بانجھ پن (Female Infertility)',
    nameEnglish: 'Infertility & PCOS',
    category: 'female',
    categoryUrdu: 'زنانہ امراض',
    symptomsUrdu: ['اولاد کی نعمت سے محرومی', 'اووری میں رسولیاں (PCOS)', 'وزن کا تیزی سے بڑھنا', 'چہرے پر غیر ضروری بال'],
    causesUrdu: ['ہارمونز کا عدم توازن', 'پی سی او ایس (PCOS)', 'انڈے نہ بننا', 'رحم کی کمزوری'],
    treatmentUrdu: ['پی سی او ایس ختم کورس', 'ہارمونل نارملائزیشن ہربل تھراپی', 'رحم مقوی کورس'],
    shortDescUrdu: ['اووری کی رسولیوں اور ہارمونز کی خرابی کا شافی علاج۔'],
    iconName: 'Baby',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-24',
    nameUrdu: 'ماہواری کی خرابی (Menstrual Irregularities)',
    nameEnglish: 'Menstrual Disorders',
    category: 'female',
    categoryUrdu: 'زنانہ امراض',
    symptomsUrdu: ['ماہواری کا رک رک کر یا درد کے ساتھ آنا', 'وقت پر نہ آنا', 'زیادہ بلڈنگ ہونا', 'پیٹ کے نیچے شدید اینٹھن'],
    causesUrdu: ['خون کی کمی (Anemia)', 'تھائرائڈ کی خرابی', 'ہارمونز کا غیر متوازن ہونا'],
    treatmentUrdu: ['ماہواری باقاعدگی ہربل سيرپ', 'خون پیدا کرنے کا شاہی شربت', 'رحم تسکین کورس'],
    shortDescUrdu: ['ماہواری کے درد، بے قاعدگی اور خون کی کمی کا علاج۔'],
    iconName: 'Calendar',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
  },

  // General & Chronic
  {
    id: 'dis-25',
    nameUrdu: 'شوگر (Diabetes Mellitus)',
    nameEnglish: 'Diabetes Control & Management',
    category: 'general',
    categoryUrdu: 'دیگر عام بیماریوں',
    symptomsUrdu: ['بار بار پیشاب اور پیاس لگنا', 'زخموں کا دیر سے بھرنا', 'بینائی کا دھندلا ہونا', 'وزن کم ہونا'],
    causesUrdu: ['لب لبہ (Pancreas) کی انسولین سستی', 'موروثی', 'موٹاپا'],
    treatmentUrdu: ['حافظ شوگر کنٹرول ہربل فارمولہ', 'شوگر نیوروپتی کیئر', 'ڈیلی انسولین سپورٹ'],
    shortDescUrdu: ['شوگر کو قدرتی سطح پر رکھنے اور عوارض سے بچانے کا علاج۔'],
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-26',
    nameUrdu: 'بلڈ پریشر (Hypertension)',
    nameEnglish: 'High Blood Pressure',
    category: 'general',
    categoryUrdu: 'دیگر عام بیماریوں',
    symptomsUrdu: ['سر کا گھومنا اور بھاری پن', 'آنکھوں کے سامنے تارے آنا', 'غصہ اور بے چینی', 'گردن کے پچھلے حصے کا درد'],
    causesUrdu: ['شریانوں کی سختی', 'نمک اور چکنائی کا زیادہ استعمال', 'کولیسٹرول', 'ذہنی دباؤ'],
    treatmentUrdu: ['بلڈ پریشر تسکین و کولیسٹرول صفائی سفوف', 'دل کی رگوں کی صفائی'],
    shortDescUrdu: ['بلڈ پریشر اور کولیسٹرول کو نارمل رکھنے کی قدرتی شفا۔'],
    iconName: 'HeartPulse',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-27',
    nameUrdu: 'دمہ، دمہ و الرجی',
    nameEnglish: 'Asthma, Allergy & Breathing Problems',
    category: 'general',
    categoryUrdu: 'دیگر عام بیماریوں',
    symptomsUrdu: ['سانس پھولنا اور سیٹی کی آواز آنا', 'سردی یا گرد و غبار سے چھینکیں', 'ناک سے پانی بہنا', 'سیٹیوں والی کھانسی'],
    causesUrdu: ['سانس کی نالیوں کی سوزش', 'الرجنز', 'موسمی تغیر'],
    treatmentUrdu: ['دمہ شفا سیرپ و معجون', 'الرجی اینٹی ہسٹامائن ہربل کٹ', 'ریسپائریٹری اسٹیم'],
    shortDescUrdu: ['دمہ، سانس پھولنے اور چھینکوں کی دائمی الرجی کا علاج۔'],
    iconName: 'Wind',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-28',
    nameUrdu: 'یرقان و جگر کی خرابی (Jaundice & Fatty Liver)',
    nameEnglish: 'Jaundice, Hepatitis & Fatty Liver',
    category: 'general',
    categoryUrdu: 'دیگر عام بیماریوں',
    symptomsUrdu: ['آنکھوں اور پیشاب کا پیلا ہونا', 'جگر کے مقام پر درد', 'روٹی نہ ہضم ہونا', 'متلی اور الٹی'],
    causesUrdu: ['ہپاٹائٹس وائرس (Hepatitis A, B, C)', 'جگر پر چربی (Fatty Liver)', 'آلودہ پانی'],
    treatmentUrdu: ['جگر صفائی اکسیر سیرپ', 'ہپاٹائٹس وائرس فلٹر کورس', 'جگر کی چربی پگھلاؤ فارمولہ'],
    shortDescUrdu: ['یرقان، ہیپاٹائٹس اور جگر کی چربی کا ہربل تدارک۔'],
    iconName: 'ShieldPlus',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-29',
    nameUrdu: 'جلدی امراض (Skin Diseases & Eczema)',
    nameEnglish: 'Skin Diseases, Eczema & Psoriasis',
    category: 'skin',
    categoryUrdu: 'جلدی امراض',
    symptomsUrdu: ['جلد پر سرخ دھبے اور خارش', 'چھالے بننا', 'جلد کا چھلکا اترنا', 'کیل مہاسے اور چھائیاں'],
    causesUrdu: ['خون کی خرابی', 'الرجی', 'فنگل انفیکشن', 'میڈی کیٹڈ صابن کی کمی'],
    treatmentUrdu: ['خون مصفی ہربل شربت', 'حافظ سکن اِکزیما لوشن', 'ہربل فیشل تھراپی'],
    shortDescUrdu: ['داد، خارش، چھائیوں اور جلدی الرجی کا مکمل تدارک۔'],
    iconName: 'Sun',
    image: 'https://images.unsplash.com/photo-1512290900673-2070e6a8d6f9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dis-30',
    nameUrdu: 'بچوں کی بیماریاں (Pediatric Diseases)',
    nameEnglish: 'Pediatric Health & Growth Issue',
    category: 'general',
    categoryUrdu: 'دیگر عام بیماریوں',
    symptomsUrdu: ['بچوں کا سوکھا پن', 'بار بار نمونیا اور بخار', 'پوٹیاں لگنا', 'قد نہ بڑھنا'],
    causesUrdu: ['غذائیت کی کمی', 'کمزور مدافعتی نظام', 'پیٹ کے کیڑے'],
    treatmentUrdu: ['حافظ کڈز ڈائجسٹ ڈراپس', 'قد بڑھاؤ ہربل سیرپ', 'پیٹ کیڑے صفائی شربت'],
    shortDescUrdu: ['بچوں کی صحت، قد کی نشوونما اور ہضم کی بہتری۔'],
    iconName: 'SmilePlus',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800',
  },
];

export const initialProducts: Product[] = [
  // Hair Products
  {
    id: 'prod-1',
    nameUrdu: 'ہوراب ہربل ہیئر آئل',
    nameEnglish: 'Hoorab Herbal Hair Oil',
    category: 'hair',
    categoryUrdu: 'ہیئر کیئر',
    pricePKR: 1250,
    originalPricePKR: 1500,
    image: 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'قدرتی جڑی بوٹیوں، زیتون، ناریل، جوجوبا، زعفران اور بادام کے تیل سے تیار کردہ شاہی فارمولہ۔ بالوں کو مضبوط، لمبا، گھنا اور خشکی سے پاک بنائے۔',
    ingredientsUrdu: ['جوجوبا آئل', 'ناریل آئل', 'زیتون کا تیل', 'زعفران', 'بادام کا تیل', 'روغن کدو', 'آملہ', 'برہمی', 'بھنگرہ', 'میتھی دانہ', 'ایلوویرا'],
    benefitsUrdu: ['بال گرنا 7 دن میں بند کرنے میں مددگار', 'خشکی و سکری کا خاتمہ', 'سفید بالوں کی روک تھام اور قدرتی چمک', 'بالوں کو نرم، چمکدار اور مضبوط بنانے میں معاون'],
    howToUseUrdu: 'رات کو سونے سے قبل یا نہانے سے 2 گھنٹے پہلے سر کی جلد پر انگلیاں پھیر کر ہلکا مساج کریں۔ ہفتے میں 3 بار استعمال کریں۔',
    inStock: true,
    rating: 4.9,
    reviewsCount: 384,
  },
  // Skin Products
  {
    id: 'prod-2',
    nameUrdu: 'ہوراب بیوٹی کریم (گلو وائٹننگ کیئر)',
    nameEnglish: 'Hoorab Beauty Cream',
    category: 'skin',
    categoryUrdu: 'اسکن کیئر',
    pricePKR: 1450,
    originalPricePKR: 1800,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'وٹامن A، B، C اور فروٹ ایکسٹریکٹس پر مشتمل نائٹ و ڈے بیوٹی کریم۔ داغ، دھبے، چھائیاں اور ایکنی کے نشانات دور کر کے جلد کو نکھار اور تازگی فراہم کرے۔',
    ingredientsUrdu: ['وٹامن A, B, C', 'فروٹ ایکسٹریکٹس', 'ایلوویرا جەل', 'شہد ایکسٹریکٹ', 'کوجک ایسڈ ہربل', 'روز واٹر'],
    benefitsUrdu: ['جلد کو نمی اور نرمی فراہم کرنے میں مددگار', 'چھائیوں اور داغ دھبوں کو ہلکا کرنا', 'غیر یکساں رنگت کو ہموار بنانا', 'قدرتی اور سائیڈ ایفیکٹ سے پاک'],
    howToUseUrdu: 'چہرے کو اچھے صابن یا فیس واش سے دھو کر رات کو ہلکے ہاتھ سے لگائیں۔ صبح نیم گرم پانی سے دھولیں۔',
    inStock: true,
    rating: 4.8,
    reviewsCount: 295,
  },
  {
    id: 'prod-3',
    nameUrdu: 'حافظ جوائنٹ پین ریلیف آئل و کریم',
    nameEnglish: 'Hafiz Joint Pain Oil & Relief Balm',
    category: 'pain',
    categoryUrdu: 'درد شفا مصنوعات',
    pricePKR: 950,
    originalPricePKR: 1200,
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'جوڑوں، گھٹنوں، کمر اور پٹھوں کے پرانے درد کے لیے فوری اثر انگیز نُسخہ۔ سوجن اور اینٹھن کا خاتمہ کرتا ہے۔',
    ingredientsUrdu: ['روغن زیتون', 'روغن تارامیرہ', 'سرخ مرچ ہربل نچوڑ', 'کافور', 'دارچینی تیل', 'لونگ تیل'],
    benefitsUrdu: ['فوری درد کش اثر', 'جوڑوں کی سوجن میں کمی', 'پٹھوں کی اینٹھن کھولنا', 'فالج و لقوہ میں مساج کے لیے بہترین'],
    howToUseUrdu: 'متاثرہ حصے پر ہلکے ہاتھ سے 5 منٹ مساج کریں اور گرم کپڑے سے ڈھانپ لیں۔',
    inStock: true,
    rating: 4.9,
    reviewsCount: 512,
  },

  // Eye Glasses & Optical
  {
    id: 'prod-4',
    nameUrdu: 'بلیو کٹ کمپیوٹر پروٹیکشن گلاسز (Blue Cut Glasses)',
    nameEnglish: 'Blue Cut Glasses for Computer & Mobile',
    category: 'eye',
    categoryUrdu: 'آئی کیئر و چشمے',
    pricePKR: 1850,
    originalPricePKR: 2500,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'موبائل، لیپ ٹاپ اور ٹی وی کی نقصان دہ نیلی روشنی (Blue Light) سے آنکھوں کو محفوظ رکھنے والے پریمیم فریم گلاسز۔ آنکھوں کے درد اور تھکن کا تدارک۔',
    benefitsUrdu: ['99% بلیو لائٹ فلٹر', 'سر درد اور آنکھوں کی سرخی ختم کریں', 'ہلکے وزن کا فلیکسیبل فریم', 'ہر عمر کے افراد کے لیے موزوں'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 180,
  },
  {
    id: 'prod-5',
    nameUrdu: 'ریڈنگ اینڈ ڈسٹنس اینٹی ریفلیکشن گلاسز',
    nameEnglish: 'Reading & Distance Anti-Reflective Glasses',
    category: 'eye',
    categoryUrdu: 'آئی کیئر و چشمے',
    pricePKR: 2200,
    originalPricePKR: 3000,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'مطالعہ اور دور کی بینائی کے لیے میٹل و ٹائٹینیم فریم کے ساتھ شائستہ چشمے۔ پروگریسو اور بائی فوکل لینز بھی دستیاب ہیں۔',
    inStock: true,
    rating: 4.7,
    reviewsCount: 142,
  },
  {
    id: 'prod-6',
    nameUrdu: 'کلر کانٹیکٹ لینز کٹ (Soft Color Lenses)',
    nameEnglish: 'Soft Colored Contact Lenses (Monthly/Yearly)',
    category: 'eye',
    categoryUrdu: 'آئی کیئر و چشمے',
    pricePKR: 1600,
    originalPricePKR: 2000,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'براؤن، ہیزل، گرے اور گرین قدرتی شیڈز میں ملائم کانٹیکٹ لینز مع فلوڈ سولوشن کٹ۔',
    inStock: true,
    rating: 4.8,
    reviewsCount: 98,
  },
  {
    id: 'prod-7',
    nameUrdu: 'یو وی پروٹیکشن سن گلاسز (Men & Women)',
    nameEnglish: 'Polarized UV400 Sunglasses Collection',
    category: 'eye',
    categoryUrdu: 'آئی کیئر و چشمے',
    pricePKR: 2400,
    originalPricePKR: 3200,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'دھوپ کی چبھن سے حفاظت کے لیے ڈیزائنر اور پولرائزڈ ڈرائیونگ سن گلاسز۔',
    inStock: true,
    rating: 4.9,
    reviewsCount: 210,
  },

  // Perfumes & Oud
  {
    id: 'prod-8',
    nameUrdu: 'حافظ شاہی عود پرفیوم (Royal Oud Perfume 50ml)',
    nameEnglish: 'Royal Oud Luxury Perfume (50ml)',
    category: 'perfume',
    categoryUrdu: 'عطر و پرفیوم کلیکشن',
    pricePKR: 2800,
    originalPricePKR: 3500,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'عربی اور فرانسیسی خوشبوؤں کا شاہکار پریمیم اور لانگ لاسٹنگ عود پرفیوم۔ 24 گھنٹے تک خوشبو برقرار رہے۔',
    benefitsUrdu: ['خالص اور الکحل فری پریمیم نوٹس', '24 گھنٹے پائیداری', 'خاص تقریبات اور ہدیہ کے لیے لاجواب'],
    inStock: true,
    rating: 5.0,
    reviewsCount: 164,
  },
  {
    id: 'prod-9',
    nameUrdu: 'خالص سفید مسک و روز عطر کٹ (Pure Musk & Rose Attar 12ml)',
    nameEnglish: 'Alcohol-Free Musk & Rose Attar Set (12ml)',
    category: 'perfume',
    categoryUrdu: 'عطر و پرفیوم کلیکشن',
    pricePKR: 1100,
    originalPricePKR: 1500,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600',
    descriptionUrdu: 'نماز اور روزمرہ استعمال کے لیے الکحل سے پاک خالص سفید مسک، گلاب اور چندن کا عطر۔',
    inStock: true,
    rating: 4.9,
    reviewsCount: 230,
  },
];

export const initialAppointments: Appointment[] = [
  {
    id: 'app-1',
    patientName: 'محمد طارق',
    phone: '03001234567',
    city: 'گوجرانوالہ',
    problem: 'کمر و مہروں کا شدید درد',
    doctorName: 'ڈاکٹر زیشان چوہدری (MBBS)',
    date: '2026-08-05',
    timeSlot: 'صبح 10:00 - 11:00',
    status: 'Confirmed',
    createdAt: '2026-08-04',
  },
  {
    id: 'app-2',
    patientName: 'کامران علی',
    phone: '03219876543',
    city: 'لاہور',
    problem: 'فالج بحالی فزیوتھراپی',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری (MBBS)',
    date: '2026-08-05',
    timeSlot: 'دوپہر 02:00 - 03:00',
    status: 'Pending',
    createdAt: '2026-08-04',
  },
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    customerName: 'حاجی محمد رفیق',
    phone: '03014567890',
    city: 'سیالکوٹ',
    address: 'محلہ مسلم گنج، گلی نمبر 4، سیالکوٹ',
    country: 'پاکستان',
    items: [
      { product: initialProducts[0], quantity: 2 },
      { product: initialProducts[1], quantity: 1 },
    ],
    totalAmountPKR: 4400,
    paymentMethod: 'COD',
    status: 'Processing',
    createdAt: '2026-08-04',
  },
];

export const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'کلینک و اپائنٹمنٹ',
    questionUrdu: 'کیا حافظ کلینک پنجاب ہیلتھ کیئر سے منظور شدہ ہے؟',
    answerUrdu: 'جی ہاں، حافظ کلینک پنجاب ہیلتھ کیئر کمیشن سے باقاعدہ رجسٹرڈ اور منظور شدہ ہے اور تمام قوانین کی پابندی کرتا ہے۔',
  },
  {
    id: 'faq-2',
    category: 'کلینک و اپائنٹمنٹ',
    questionUrdu: 'کیا کلینک میں معائنہ سے پہلے اپائنٹمنٹ لینا ضروری ہے؟',
    answerUrdu: 'مریضوں کی سہولت کے لیے آن لائن اپائنٹمنٹ یا واٹس ایپ پر وقت بک کروانا بہتر ہے تا کہ رش سے بچا جا سکے، تاہم واک ان مریضوں کا بھی معائنہ کیا جاتا ہے۔',
  },
  {
    id: 'faq-3',
    category: 'معائنہ و لیبارٹری',
    questionUrdu: 'کمپیوٹر چیک اپ میں کس قسم کا معائنہ ہوتا ہے؟',
    answerUrdu: 'جدید کمپیوٹرائزڈ ڈائیگنوسس مشین کے ذریعے جسمانی اعصاب، بلڈ سرکولیشن، اور ابتدائی عوارض کا فوری اور بغیر تکلیف معائنہ کیا جاتا ہے۔',
  },
  {
    id: 'faq-4',
    category: 'خواتین کا علاج',
    questionUrdu: 'کیا خواتین کے علاج کے لیے الگ اور محفوظ انتظام موجود ہے؟',
    answerUrdu: 'جی ہاں! حافظ کلینک میں خواتین مریضات کے لیے الگ پردے دار ہال، لیڈی عملہ اور تسلی بخش مشاورتی ماحول فراہم کیا جاتا ہے۔',
  },
  {
    id: 'faq-5',
    category: 'ڈلیوری و مصنوعات',
    questionUrdu: 'کیا ادویات اور پروڈکٹس کی ہوم ڈلیوری دستیاب ہے؟',
    answerUrdu: 'جی بالکل! ہوراب ہیئر آئل، بیوٹی کریم، پین آئل، گلاسز اور پرفیوم کی پاکستان بھر (TCS/Leopard) میں اور دنیا بھر میں ہوم ڈلیوری دستیاب ہے۔',
  },
  {
    id: 'faq-6',
    category: 'علاج کا طریقہ',
    questionUrdu: 'کیا حافظ کلینک کے علاج میں سائیڈ ایفیکٹ ہوتا ہے؟',
    answerUrdu: 'ہمارا تمام علاج اور ادویات قدرتی جڑی بوٹیوں، سائنسی اصولوں اور تجربہ کار ڈاکٹرز کی دیکھ بھال میں تیار کی جاتی ہیں جن کا کوئی نقصان دہ سائیڈ ایفیکٹ نہیں۔',
  },
  {
    id: 'faq-7',
    category: 'فزیوتھراپی',
    questionUrdu: 'فالج اور لقوہ کے مریضوں کے لیے کیا سہولیات ہیں؟',
    answerUrdu: 'ہمارے پاس لیزر تھراپی، الیکٹرک مسل سٹیولیشن، اسٹیم ہربل تھراپی اور ماہر فزیوتھراپسٹ کے ذریعے فالج کے مریضوں کی بحالی کی مکمل سہولت موجود ہے۔',
  },
  {
    id: 'faq-8',
    category: 'آئی کیئر',
    questionUrdu: 'آنکھوں کے کمپیوٹر ٹیسٹ کے بعد چشمہ کتنی دیر میں ملتا ہے؟',
    answerUrdu: 'آنکھوں کے کمپیوٹر ٹیسٹ اور نمبر چیک کے بعد فوری طور پر یا 24 گھنٹے کے اندر حسب خواہش فریم اور لینز تیار کر کے فراہم کیے جاتے ہیں۔',
  },
  {
    id: 'faq-9',
    category: 'ہوراب ہیئر آئل',
    questionUrdu: 'ہوراب ہیئر آئل کو کتنے دن استعمال کرنا چاہئے؟',
    answerUrdu: 'بہترین نتائج کے لیے کم از کم 4 سے 6 ہفتے باقاعدگی سے استعمال کریں۔ بالوں کا گرنا پہلے ہفتے میں ہی نمایاں کم ہو جاتا ہے۔',
  },
  {
    id: 'faq-10',
    category: 'دکان و آرڈر',
    questionUrdu: 'آن لائن آرڈر پر پیسے کس طرح ادا کیے جا سکتے ہیں؟',
    answerUrdu: 'آپ کیش آن ڈلیوری (COD)، جاز کیش، ایزی پیسہ یا بینک ٹرانسفر کے ذریعے آرڈر کی ادائیگی کر سکتے ہیں۔',
  },
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'محمد یاسین',
    city: 'گوجرانوالہ',
    rating: 5,
    commentUrdu: 'مجھے 5 سال سے گھٹنوں اور کمر کا شدید درد تھا، کئی جگہ دکھایا۔ حافظ کلینک کی فزیوتھراپی اور ہربل دوا سے 15 دن میں اللہ نے مکمل شفاء دی۔',
    diseaseTreatedUrdu: 'گھٹنوں و کمر کا درد',
    date: '12 جنوری 2026',
  },
  {
    id: 'test-2',
    patientName: 'محترمہ ثنا طارق',
    city: 'لاہور',
    rating: 5,
    commentUrdu: 'ہوراب ہیئر آئل اور بیوٹی کریم استعمال کی۔ میرے بال گرنا بالکل بند ہو گئے ہیں اور چھائیاں بھی ختم ہو رہی ہیں۔ بہترین معیار!',
    diseaseTreatedUrdu: 'ہوراب ہیئر و اسکن کیئر',
    date: '28 فروری 2026',
  },
  {
    id: 'test-3',
    patientName: 'چوہدری بشیر احمد',
    city: 'سیالکوٹ',
    rating: 5,
    commentUrdu: 'میرے والد صاحب کو فالج کا حملہ ہوا تھا۔ ڈاکٹر وقاص صاحب نے جس محبت اور توجہ سے فزیوتھراپی کی، الحمدللہ والد صاحب اب خود چل سکتے ہیں۔',
    diseaseTreatedUrdu: 'فالج بحالی تھراپی',
    date: '10 مارچ 2026',
  },
  {
    id: 'test-4',
    patientName: 'ارسلان علی',
    city: 'فیصل آباد',
    rating: 5,
    commentUrdu: 'کمپیوٹر چیک اپ کے بعد گردے کی پتھری کی دوا لی۔ صرف 10 دن میں 8mm کی پتھری بغیر آپریشن نکل گئی۔ جزاک اللہ حافظ کلینک!',
    diseaseTreatedUrdu: 'گردے کی پتھری',
    date: '02 اپریل 2026',
  },
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    titleUrdu: 'حافظ کلینک کا بیرونی و اندرونی استقبالیہ',
    category: 'Clinic',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gal-2',
    titleUrdu: 'ڈاکٹر زیشان اور ڈاکٹر وقاص صغیر چوہدری معائنہ کے دوران',
    category: 'Doctors',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gal-3',
    titleUrdu: 'جدید کمپیوٹرائزڈ ڈائیگنوسس مشین ڈیوائس',
    category: 'Machines',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gal-4',
    titleUrdu: 'لیزر و فزیوتھراپی بحالی یونٹ',
    category: 'Machines',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gal-5',
    titleUrdu: 'آئی کیئر اینڈ آپٹیکل ٹیسٹنگ روم',
    category: 'Clinic',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'gal-6',
    titleUrdu: 'پنجاب ہیلتھ کیئر رجسٹریشن سرٹیفکیٹ',
    category: 'Certificates',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  },
];

export const initialArticles: HealthArticle[] = [
  {
    id: 'art-1',
    titleUrdu: 'جوڑوں اور گھٹنوں کے درد سے نجات کے 5 قدرتی طریقے',
    titleEnglish: '5 Natural Ways to Relief Joint & Knee Pain',
    category: 'درد اور مہرے',
    categoryUrdu: 'درد اور مہرے',
    date: '15 مئی 2026',
    author: 'ڈاکٹر زیشان چوہدری',
    authorUrdu: 'ڈاکٹر زیشان چوہدری (مبشر فزیشن)',
    authorEnglish: 'Dr. Zeeshan Chaudhry (Senior Physician)',
    readTime: '4 min read',
    excerptUrdu: 'جوڑوں کا درد بڑھتی عمر یا یورک ایسڈ کی وجہ سے ہو تو طبی غذائیت اور قدرتی مساج سے کیسے راحت حاصل کی جائے۔',
    excerptEnglish: 'Learn how to manage joint pain and uric acid naturally using herbal nutrition, posture adjustments, and targeted massage.',
    contentUrdu: `جوڑوں کا درد آج کل ہر دوسرے شخص کا مسئلہ بن چکا ہے۔ اس کی بنیادی وجوہات میں وٹامن ڈی کی کمی، یورک ایسڈ کی زیادہ مقدار اور جوڑوں کی چکنائی (Synovial Fluid) کا خشک ہونا شامل ہیں۔

۱۔ صبح ہلکی دھوپ میں بیٹھنا: روزانہ 15 سے 20 منٹ صبح کی دھوپ میں بیٹھنے سے وٹامن ڈی کی قدرتی مقدار پوری ہوتی ہے۔
۲۔ زیتون اور سرخ مرچ کے تیل کا مساج: حافظ کلینک جوائنٹ کیئر آئل سے روزانہ رات ہلکے ہاتھ سے مساج کریں۔
۳۔ پانی کا وافر استعمال: دن میں کم از کم 10 سے 12 گلاس پانی پئیں تا کہ یورک ایسڈ گردوں کے ذریعے خارج ہو جائے۔
۴۔ ہلکی فزیوتھراپی ورزشیں: گھٹنوں کی لچک بحال رکھنے کے لیے روزانہ ہلکی واک اور فزیوتھراپی اسٹریچنگ کریں۔
۵۔ پرہیز و غذائیت: بڑا گوشت، چاول اور ڈبے والے مشروبات سے پرہیز کریں۔`,
    contentEnglish: `Joint pain is becoming increasingly common due to vitamin D deficiency, elevated uric acid levels, and loss of synovial fluid in knees.

1. Morning Sunlight: Spend 15-20 minutes in gentle morning sunlight to restore Vitamin D levels naturally.
2. Herbal Oil Massage: Use Hafiz Joint Care herbal oil for a gentle night massage to improve blood circulation.
3. Adequate Hydration: Drink 10-12 glasses of water daily to flush excess uric acid via kidneys.
4. Physiotherapy Exercises: Perform daily low-impact stretches to preserve joint mobility.
5. Dietary Restrictions: Avoid excessive red meat, cold beverages, and refined flour.`,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    likes: 42,
    tags: ['درد', 'گھٹنے', 'جوائنٹ کیئر', 'Joint Pain', 'Uric Acid'],
  },
  {
    id: 'art-2',
    titleUrdu: 'موبائل اور کمپیوٹر کی بلیو لائٹ سے آنکھوں کی حفاظت کا طریقہ',
    titleEnglish: 'Protecting Eyes from Mobile & Computer Blue Light',
    category: 'آئی کیئر',
    categoryUrdu: 'آئی کیئر (چشمے)',
    date: '20 جون 2026',
    author: 'ڈاکٹر وقاص صغیر',
    authorUrdu: 'ڈاکٹر وقاص صغیر (آئی و فزیو سپیشلسٹ)',
    authorEnglish: 'Dr. Waqas Sageer (Eye & Rehab Specialist)',
    readTime: '3 min read',
    excerptUrdu: 'اسکرین کا زیادہ استعمال آنکھوں میں خشکی اور بینائی کو دھندلا کر سکتا ہے۔ Blue Cut گلاسز کا کردار۔',
    excerptEnglish: 'Excessive screen time causes dry eyes and strain. Discover the 20-20-20 rule and Blue Cut anti-glare optical glasses.',
    contentUrdu: `روزمرہ زندگی میں موبائل اور لیپ ٹاپ کا استعمال ناگزیر ہو چکا ہے۔ تاہم اسکرین سے نکلنے والی HEV Blue Rays آنکھوں کے ریٹینا کو متاثر کرتی ہیں۔

۱۔ 20-20-20 کا قانون اپنائیں: ہر 20 منٹ بعد 20 سیکنڈ کے لیے 20 فٹ دور کسی چیز کو دیکھیں۔
۲۔ Blue Cut Glasses استعمال کریں: خاص نیلی روشنی کو روکنے والے چشمے پہن کر کام کریں۔
۳۔ آنکھوں میں عرق گلاب کی ڈراپس: رات کو سونے سے پہلے آنکھوں کو ٹھنڈے پانی سے دھوئیں۔
۴۔ لائٹ کنٹرول: اندھیرے کمرے میں موبائل اسکرین کا استعمال ہرگز نہ کریں۔`,
    contentEnglish: `Smartphones and laptops emit high-energy visible (HEV) blue light that can strain the retina and dry out the cornea.

1. Practice the 20-20-20 Rule: Every 20 minutes, look at an object 20 feet away for 20 seconds.
2. Wear Blue Cut Lenses: Use anti-blue ray computer glasses during long working hours.
3. Proper Lighting: Avoid using phones in pitch-dark rooms to prevent eye fatigue.
4. Eye Drop & Hydration: Keep eyes lubricated with natural rose water or prescribed drops.`,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
    likes: 38,
    tags: ['آئی کیئر', 'چشمے', 'Eye Care', 'Blue Cut', 'Optical'],
  },
  {
    id: 'art-3',
    titleUrdu: 'کمپیوٹرائزڈ باڈی اسکین اور کوانٹم چیک اپ کی اہمیت',
    titleEnglish: 'Importance of Computerized Body Scan & Quantum Diagnosis',
    category: 'ڈائیگنوسس',
    categoryUrdu: 'کمپیوٹر چیک اپ',
    date: '02 جولائی 2026',
    author: 'ڈاکٹر زیشان چوہدری',
    authorUrdu: 'ڈاکٹر زیشان چوہدری',
    authorEnglish: 'Dr. Zeeshan Chaudhry',
    readTime: '5 min read',
    excerptUrdu: 'بغیر خون لیے جسم کے تمام اندرونی اعضاء، جگر، گردے اور دل کے سگنلز کی کمپیوٹرائزڈ رپورٹ کا طریقہ۔',
    excerptEnglish: 'Learn how non-invasive electromagnetic computerized bio-scans detect health imbalances before severe symptoms appear.',
    contentUrdu: `جدید بائیو الیکٹرانک کوانٹم اسکینر ڈیوائس جسم کے سیلولر سگنلز کا تجزیہ کر کے منٹوں میں تمام اندرونی اعضاء کی رپورٹ فراہم کرتی ہے۔

۱۔ بغیر سوئی کے چیک اپ: اس ٹیسٹ میں کوئی بلڈ سیمپل نہیں لیا جاتا، ہاتھ کے سینسر سے چیک اپ ہوتا ہے۔
۲۔ اعضاء کی کارکردگی: جگر کی چربی، گردے کے افعال، اور معدہ کی تیزابیت کا فوری علم ہوتا ہے۔
۳۔ وٹامنز اور منرلز کی کمی: باڈی میں کیلشیم، وٹامن بی12 اور زنک کی مقدار کا تعین۔`,
    contentEnglish: `Bio-quantum computerized body analyzers assess cellular electromagnetic signals to provide comprehensive health insights safely and non-invasively.

1. Non-Invasive Diagnostic: No blood sampling or needle prick needed—simply hold the bio-sensor wand.
2. Organ Function Analysis: Evaluates liver fat, kidney clearance, gastric activity, and vascular flow.
3. Vitamin & Mineral Check: Detects deficiencies in calcium, zinc, iron, and B-complex vitamins instantly.`,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    likes: 55,
    tags: ['کمپیوٹر چیک اپ', 'کوانٹم اسکین', 'Quantum Scan', 'Diagnosis'],
  },
  {
    id: 'art-4',
    titleUrdu: 'معدے کی تیزابیت، گیس اور جگر کی گرمی کا قدرتی علاج',
    titleEnglish: 'Natural Remedies for Gastric Acidity, Bloating & Liver Heat',
    category: 'معدہ و جگر',
    categoryUrdu: 'معدہ و جگر',
    date: '10 جولائی 2026',
    author: 'ڈاکٹر زیشان چوہدری',
    authorUrdu: 'ڈاکٹر زیشان چوہدری',
    authorEnglish: 'Dr. Zeeshan Chaudhry',
    readTime: '4 min read',
    excerptUrdu: 'معدے میں جلن، اپھارہ اور جگر کی گرمی سے نجات کے لیے نباتی نسخہ جات اور احتیاطی تدابیر۔',
    excerptEnglish: 'Effective lifestyle and herbal tips to relieve acidity, heartburn, fatty liver, and chronic bloating naturally.',
    contentUrdu: `غلط طرزِ زندگی اور فاسٹ فوڈ کے مسلسل استعمال سے معدہ میں تیزابیت اور جگر میں گرمی پیدا ہو جاتی ہے۔

۱۔ سونف اور الائچی کا قہوہ: کھانے کے بعد سونف اور سبز الائچی کا گرم قہوہ معدہ کو فوری سکون دیتا ہے۔
۲۔ وقت پر کھانا کھانا: رات کا کھانا سونے سے کم از کم 2 گھنٹے پہلے کھائیں۔
۳۔ مرغن اشیاء سے پرہیز: تلی ہوئی چیزوں اور مرچ مصالحہ کو محدود کریں۔`,
    contentEnglish: `Poor dietary habits and fast food often cause chronic acidity, bloating, and sluggish liver digestion.

1. Fennel & Cardamom Infusion: Drink warm fennel tea after meals to soothe the digestive lining.
2. Meal Timing: Have dinner at least 2 hours before sleeping to avoid acid reflux.
3. Avoid Deep Fried Foods: Limit excessive spices, carbonated drinks, and processed oils.`,
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
    likes: 61,
    tags: ['معدہ', 'جگر', 'Gastro', 'Acidity', 'Herbal Care'],
  },
  {
    id: 'art-5',
    titleUrdu: 'بال گرنے کی بنیادی وجوہات اور ہوراب ہیئر آئل کی افادیت',
    titleEnglish: 'Root Causes of Hair Loss & Benefits of Hoorab Herbal Oil',
    category: 'ہیئر کیئر',
    categoryUrdu: 'ہیئر آئل و سکن',
    date: '18 جولائی 2026',
    author: 'ڈاکٹر وقاص صغیر',
    authorUrdu: 'ڈاکٹر وقاص صغیر چوہدری',
    authorEnglish: 'Dr. Waqas Sageer Chaudhry',
    readTime: '3 min read',
    excerptUrdu: 'بالوں کا وقت سے پہلے سفید ہونا، خشکی اور گنج پن سے بچاؤ کے لیے قدرتی جڑی بوٹیوں سے تیار کردہ ہوراب آئل۔',
    excerptEnglish: 'Combat premature hair thinning, dandruff, and scalp dryness using pure cold-pressed botanical herbal oils.',
    contentUrdu: `بالوں کی صحت کا تعلق سر کی جلد (Scalp Blood Circulation) اور غذائی عناصل سے ہے۔

۱۔ آملہ، سیکا کائی اور روغنِ زیتون کا امتزاج بالوں کی جڑوں کو مضبوط بناتا ہے۔
۲۔ ہفتے میں 3 بار انگلیوں کے پوروں سے 10 منٹ کا مساج کریں۔
۳۔ کیمیکل والے شیمپو کے بجائے ارگینک شیمپو کا استعمال کریں۔`,
    contentEnglish: `Healthy hair requires optimal scalp blood circulation and vital nutrients like Vitamin E and essential fatty acids.

1. Pure Herbal Botanical Blend: Amla, Sikakai, and Cold-pressed Olive Oil strengthen hair follicles.
2. Scalp Massage Routine: Gently massage scalp for 10 minutes 3 times a week.
3. Avoid Harsh Chemicals: Switch to sulfate-free herbal shampoos.`,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    likes: 47,
    tags: ['ہیئر آئل', 'بالوں کا علاج', 'Hair Care', 'Hoorab Oil'],
  },
];

export const SRS_DOCUMENT_MARKDOWN = `# 📄 Hafiz Clinic (حافظ کلینک) — Full Software Requirements Specification (SRS) Document

**Document Title:** Hafiz Clinic Bilingual Healthcare Portal, Online Store & Dynamic Management System  
**Organization:** Hafiz Clinic (حافظ کلینک) — Punjab Healthcare Commission Approved  
**Prepared By:** AI Studio Application Generator  
**Version:** 1.0 (Production Blueprint)  
**Target Platform:** Web (HTML5, CSS3, React 19, Tailwind CSS, TypeScript, Express / Node.js) & Responsive Mobile/Tablet/Desktop  

---

## 1. Executive Summary & Core Objectives
Hafiz Clinic (حافظ کلینک) is a premier healthcare institution providing modern medical consultation, computerized diagnostic checking, physiotherapy, laboratory services, and specialized product lines (Eye Care Optical, Hoorab Herbal Hair Oil, Hoorab Beauty Cream, Perfumes Collection, and Pain Care Treatments) with worldwide & Pakistan-wide home delivery.

This Requirements Document outlines the architectural specifications for building the complete digital web platform, patient portal, doctor panel, e-commerce store, and administrative control panel.

---

## 2. Key System Features & Capabilities
- **Bilingual Interface:** Dual Urdu (RTL - Nastaliq UI) and English support.
- **Urdu Healthcare Marketing & Visual Aesthetics:** Urdu headline sliders ("دوائی کھائیں صرف 2 دن", "پرانی سے پرانی بیماریوں کا شافی علاج"), trust badges (PHC Approval), direct call & WhatsApp floaters.
- **Disease Directory (40+ Conditions):** Categorized pages for Joint Pain, Knee Pain, Sciatica, Cervical, Paralysis (فالج), Bell's Palsy (لقوہ), Kidney Stones (گردے کی پتھری), Stomach Gas/Acidity, Diabetes, BP, Asthma, Male & Female health.
- **Specialized Vertical Hubs:**
  1. Eye Care & Optical Center (Reading, Distance, Computer Blue-Cut, Progressive, Contact Lenses, Sunglasses)
  2. Hoorab Herbal Hair Oil (Ingredients, Spa, Hair Care)
  3. Hoorab Beauty Cream & Face Care (Facial Menu, Vitamin Care, Skin Brightening)
  4. Luxury Perfume & Alcohol-Free Oud Attar Store
  5. Physiotherapy & Laser/Steam Rehab Unit
  6. Computer Diagnosis & Laboratory Section
- **Patient Portal:** Appointment history, medical records, online prescription viewer, lab report downloads with QR verification.
- **Doctor Panel:** Patient queue management, schedule control, digital prescription writing.
- **E-Commerce Online Store:** Product catalog, Shopping Cart, Express Checkout (COD, JazzCash, Easypaisa, Bank Transfer), Order tracking.
- **Comprehensive Admin Panel:** Full dynamic CRUD for Doctors, Diseases, Products, Orders, Appointments, Sliders, Testimonials, FAQ, SEO, Database Backups.

---

## 3. Web System Architecture & Database Schema

### Database Tables Schema (MySQL / PostgreSQL / Firestore Ready)

1. **\`doctors\`**: \`id, name_urdu, name_en, title_urdu, qualification, experience, specialization, timing, image, phone\`
2. **\`diseases\`**: \`id, name_urdu, name_en, category, symptoms, causes, treatment, icon\`
3. **\`products\`**: \`id, name_urdu, name_en, category, price_pkr, original_price, image, description, ingredients, benefits, how_to_use, stock, rating\`
4. **\`appointments\`**: \`id, patient_name, phone, city, problem, doctor_id, date, time_slot, status, created_at\`
5. **\`orders\`**: \`id, customer_name, phone, city, address, country, items_json, total_amount, payment_method, status, tracking_number\`
6. **\`lab_reports\`**: \`id, patient_id, patient_name, test_name, doctor_name, date, status, file_url, qr_code\`
7. **\`gallery\`**: \`id, title_urdu, category, image_url\`
8. **\`testimonials\`**: \`id, patient_name, city, rating, comment_urdu, disease_treated, date\`
9. **\`faq\`**: \`id, category, question_urdu, answer_urdu\`
10. **\`sliders\`**: \`id, heading_urdu, tagline_urdu, bg_image, button_text\`
11. **\`settings\`**: \`clinic_name, phone1, phone2, whatsapp, address, timing, phc_approval_no, seo_meta\`
12. **\`users\`**: \`id, username, email, password_hash, role (admin|doctor|patient)\`

---

## 4. Website Page Hierarchy & Navigation Structure
- **Header:** Logo | Punjab Healthcare Approved Badge | Phone | WhatsApp | Appointment Button | Language Toggle
- **Home Page:** Hero Slider | About Clinic | Doctors Profile | 40+ Diseases Grid | Treatment 5-Step Process | Computer Checkup | Why Choose Us | Testimonials | FAQ | Appointment Form | Map & Footer
- **Clinic Page:** Full clinic overview, doctors rights, patient rights, PHC guidelines.
- **Eye Care Page:** Computer Eye Test, Blue Cut Glasses, Frames Collection, Contact Lenses, Sunglasses.
- **Hoorab Hair Oil Page:** Natural Ingredients, Benefits, Hair Spa, Order Form.
- **Hoorab Beauty Cream Page:** Features, Facial Therapy Menu, Skin Care, Order Form.
- **Perfume & Attar Page:** Men's, Women's, Unisex, Oud Attar, Order Form.
- **Physiotherapy & Laser Unit Page:** Rehab procedures for Stroke, Facial Paralysis, Sciatica.
- **Home Delivery Page:** Pakistan & International courier logistics (TCS, Leopard, DHL).
- **Online Store Page:** Cart system, checkout, instant WhatsApp order option.
- **Patient Portal:** Download lab reports, view prescriptions.
- **Doctor Panel:** Manage appointments & write prescription.
- **Admin Panel:** Complete management control center.

---

## 5. Technical Stack Specification
- **Frontend Framework:** React 19 + TypeScript + Vite + Motion
- **Styling:** Tailwind CSS (RTL support, responsive breakpoints)
- **Icons:** Lucide React
- **PDF Requirements Exporter:** Integrated dynamic HTML/CSS to PDF & Document Print Engine
- **Backend Architecture:** Express.js + Node.js API ready
- **Database Engine:** MySQL / PostgreSQL / Firestore Compatible

---

*Hafiz Clinic Requirements Specification generated successfully.*
`;
