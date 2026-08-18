export interface TriageResult {
  departmentUrdu: string;
  departmentEnglish: string;
  recommendedDoctor: string;
  doctorFee: number;
  urgencyLevel: 'Normal' | 'Priority' | 'Immediate';
  urgencyUrdu: string;
  adviceUrdu: string;
  matchedKeywords: string[];
}

export function analyzeSymptoms(symptomsText: string): TriageResult | null {
  if (!symptomsText || symptomsText.trim().length < 2) return null;
  const text = symptomsText.toLowerCase();

  // 1. Physiotherapy & Spine & Neuro Rehabilitation
  const physioKeywords = [
    'جوڑوں', 'درد', 'کمر', 'مہروں', 'فالج', 'گردن', 'ہڈی', 'گھٹنے', 'شیاٹیکا', 'عرق النساء', 
    'پٹھوں', 'کھچاؤ', 'سوجن', 'لکوہ', 'مہرے', 'ریڑھ', 'ہاتھ سن', 'پاؤں سن', 'لچک', 'فزیو',
    'back', 'joint', 'knee', 'spine', 'disc', 'paralysis', 'stroke', 'physio', 'sciatica', 'neck', 'shoulder', 'bone', 'muscle'
  ];
  const matchedPhysio = physioKeywords.filter(k => text.includes(k.toLowerCase()));

  // 2. Optical, Eye Care & Vision Center
  const eyeKeywords = [
    'آنکھ', 'نظر', 'عینک', 'دھندلا', 'خارش', 'سرخی', 'پانی', 'کمپیوٹر', 'چشمہ', 'موتیا', 'بینائی', 'پپوٹے', 'چبھن', 'تھکاوٹ',
    'eye', 'vision', 'glasses', 'optical', 'blur', 'strain', 'cataract', 'glaucoma', 'cornea', 'lens', 'sight'
  ];
  const matchedEye = eyeKeywords.filter(k => text.includes(k.toLowerCase()));

  // 3. Herbal Pharmacy, Skin & Hair, General Health
  const skinHairKeywords = [
    'بال', 'گرنا', 'خشکی', 'گنجا', 'رنگت', 'چھائیاں', 'کیل', 'مہاسے', 'جھائیاں', 'خارش', 'چہرہ', 'تیل', 'کریم',
    'hair', 'fall', 'dandruff', 'bald', 'skin', 'freckles', 'acne', 'glow', 'beauty', 'cream', 'oil'
  ];
  const matchedSkinHair = skinHairKeywords.filter(k => text.includes(k.toLowerCase()));

  // 4. Stomach, Liver & Internal Medicine
  const stomachKeywords = [
    'معدہ', 'تیزابیت', 'گیس', 'الٹی', 'قبض', 'جگر', 'یرقان', 'شوگر', 'بلڈ پریشر', 'بخار', 'کھانسی', 'گردے', 'پتھری',
    'stomach', 'acidity', 'gas', 'constipation', 'liver', 'jaundice', 'diabetes', 'bp', 'fever', 'kidney', 'stone'
  ];
  const matchedStomach = stomachKeywords.filter(k => text.includes(k.toLowerCase()));

  if (matchedPhysio.length > 0 && matchedPhysio.length >= matchedEye.length) {
    return {
      departmentUrdu: 'فزیوتھراپی، فالج بحالی و مہرہ سنٹر',
      departmentEnglish: 'Physiotherapy & Spine Rehabilitation',
      recommendedDoctor: 'ڈاکٹر وقاص صغیر چوہدری (MBBS)',
      doctorFee: 2000,
      urgencyLevel: text.includes('فالج') || text.includes('شدید') || text.includes('paralysis') ? 'Priority' : 'Normal',
      urgencyUrdu: text.includes('فالج') || text.includes('شدید') ? 'فوری توجہ درکار' : 'معمول کا معائنہ',
      adviceUrdu: 'مہروں اور پٹھوں کی جانچ کے لیے خصوصی بائیو مکینیکل معائنہ تجویز کیا جاتا ہے۔',
      matchedKeywords: matchedPhysio,
    };
  }

  if (matchedEye.length > 0) {
    return {
      departmentUrdu: 'ویژن سنٹر و کمپیوٹرائزڈ آئی ٹیسٹ',
      departmentEnglish: 'Computerized Eye Clinic & Vision Center',
      recommendedDoctor: 'ڈاکٹر زیشان چوہدری (MBBS)',
      doctorFee: 1500,
      urgencyLevel: 'Normal',
      urgencyUrdu: 'معمول کا معائنہ',
      adviceUrdu: 'کمپیوٹرائزڈ آٹو ریفریکٹومیٹر ٹیسٹ اور بلیو کٹ اینٹی گلیر اسکرین گلاسز کا معائنہ تجویز ہے۔',
      matchedKeywords: matchedEye,
    };
  }

  if (matchedSkinHair.length > 0) {
    return {
      departmentUrdu: 'ہوراب ہربل بیوٹی و ہیئر کیئر کلینک',
      departmentEnglish: 'Herbal Dermatology & Hair Care',
      recommendedDoctor: 'ڈاکٹر زیشان چوہدری (MBBS)',
      doctorFee: 1500,
      urgencyLevel: 'Normal',
      urgencyUrdu: 'معمول کا معائنہ',
      adviceUrdu: 'ہوراب ہربل ہیئر آئل اور نیچرل بیوٹی فارمولیشن کے ساتھ خصوصی طبی رہنمائی۔',
      matchedKeywords: matchedSkinHair,
    };
  }

  if (matchedStomach.length > 0) {
    return {
      departmentUrdu: 'اندرونی امراض و قدرتی یونانی علاج',
      departmentEnglish: 'Internal Medicine & Herbal Health',
      recommendedDoctor: 'ڈاکٹر زیشان چوہدری (MBBS)',
      doctorFee: 1500,
      urgencyLevel: text.includes('یرقان') || text.includes('شدید') ? 'Priority' : 'Normal',
      urgencyUrdu: 'ترجیحی معائنہ',
      adviceUrdu: 'معدے اور جگر کی بحالی کے لیے دیسی ہربل ڈائیٹ پلان اور بائیو کوانٹم چیک اپ تجویز ہے۔',
      matchedKeywords: matchedStomach,
    };
  }

  return {
    departmentUrdu: 'جنرل او پی ڈی و طبی معائنہ',
    departmentEnglish: 'General Medical OPD',
    recommendedDoctor: 'ڈاکٹر زیشان چوہدری (MBBS)',
    doctorFee: 1500,
    urgencyLevel: 'Normal',
    urgencyUrdu: 'معمول کا معائنہ',
    adviceUrdu: 'ماہر فزیشن کے ساتھ جامع طبی معائنہ اور مشاورت۔',
    matchedKeywords: [],
  };
}
