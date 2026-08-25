import React, { useState } from 'react';
import { Eye, ShieldCheck, ShoppingBag, Calendar, CheckCircle2, Phone, MessageCircle, Play, Volume2, VolumeX, Film } from 'lucide-react';
import { Product, ClinicSettings } from '../types';

interface EyeCareViewProps {
  eyeProducts: Product[];
  settings?: ClinicSettings;
  onAddToCart: (product: Product) => void;
  onOpenAppointment: (service?: string) => void;
  language?: 'urdu' | 'english';
}

export const EyeCareView: React.FC<EyeCareViewProps> = ({
  eyeProducts,
  settings,
  onAddToCart,
  onOpenAppointment,
  language = 'english',
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'glasses' | 'lenses' | 'sunglasses'>('all');
  const [isMuted, setIsMuted] = useState(true);
  const isUrdu = language === 'urdu';

  const videoUrl = settings?.eyeCareVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4';
  const videoTitle = isUrdu
    ? (settings?.eyeCareVideoTitleUrdu || 'کمپیوٹرائزڈ آئی چیک اپ اور پریمیم چشموں کا لائیو معائنہ')
    : (settings?.eyeCareVideoTitleEnglish || 'Computerized Eye Testing & Optical Frames Live Showcase');

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const embedYoutubeUrl = isYouTube 
    ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&mute=1&loop=1'
    : '';

  const categoriesUrdu = [
    'نظر کے چشمے', 'قریب کے چشمے', 'دور کے چشمے', 'کمپیوٹر گلاسز',
    'بلیو کٹ گلاسز', 'پروگریسو چشمے', 'بائی فوکل گلاسز', 'بچوں کے فریمز',
    'مناسب قیمت فریمز', 'کانٹیکٹ لینز (روزانہ/ماہانہ)', 'کلرڈ کانٹیکٹ لینز', 'یو وی سن گلاسز'
  ];

  const categories = isUrdu ? categoriesUrdu : [
    'Eye Glasses', 'Reading Glasses', 'Distance Glasses', 'Computer Glasses',
    'Blue Cut Glasses', 'Progressive Glasses', 'Bifocal Glasses', 'Kids Glasses',
    'Budget Frames', 'Contact Lenses (Daily/Monthly)', 'Colored Contact Lenses', 'UV Sunglasses'
  ];

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Hero Hub */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'آئی کیئر اینڈ ویژن سینٹر' : 'Hafiz Eye Care & Vision Center'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              {isUrdu
                ? 'کمپیوٹرائزڈ آئی ٹیسٹ، جدید چشمے اور کانٹیکٹ لینز'
                : 'Computerized Eye Testing, Blue Cut Glasses & Prescription Lenses'}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'اگر آپ کو دور یا قریب کی نظر کی کمزوری، دھندلا پن، پڑھتے وقت سر درد، یا موبائل/کمپیوٹر استعمال کرتے وقت آنکھوں میں تھکن ہوتی ہے تو فوری آنکھوں کا کمپیوٹرائزڈ معائنہ کروائیں۔'
                : 'Struggling with blurred vision, eye strain from mobile screens, or headaches during reading? Book a comprehensive computerized eye testing session today.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onOpenAppointment(isUrdu ? 'آنکھوں کا کمپیوٹرائزڈ معائنہ' : 'Computerized Eye Test')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>{isUrdu ? 'کمپیوٹرائزڈ آئی ٹیسٹ بک کریں' : 'Book Computerized Eye Test'}</span>
              </button>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isUrdu ? 'واٹس ایپ فریم پسند کریں' : 'Select Frames on WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Eye Care Video Showcase */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700">
                {isYouTube ? (
                  <iframe
                    src={embedYoutubeUrl}
                    title="Eye Care Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      src={videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-1.5 shadow-lg border border-white/20"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        <span className="text-[11px]">{isMuted ? (isUrdu ? 'آواز کھولیں' : 'Unmute') : (isUrdu ? 'آواز بند' : 'Mute')}</span>
                      </button>
                    </div>
                  </>
                )}
                <div className="absolute bottom-2 left-2 pointer-events-none">
                  <span className="bg-teal-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    <span>{isUrdu ? 'آئی کیئر ڈیمو ویڈیو' : 'Eye Care Video'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'بصارت اور آئی ٹیسٹنگ ویڈیو' : 'Vision Health Demo'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {videoTitle}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isUrdu
                  ? 'آنکھوں کی بصارت، کمپیوٹر اسکرین کے نقصانات سے بچاؤ، بلیو کٹ لینز اور کمپیوٹرائزڈ آئی ٹیسٹ کے مراحل کو اس لائیو ویڈیو میں دیکھیں۔'
                  : 'Discover how computerized refraction and blue-cut optical filters shield your vision from screen fatigue, digital strain, and refractive errors.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-200">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{isUrdu ? '99% بلیو کٹ' : 'Blue Filter'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isUrdu ? 'کمپیوٹرائزڈ نمبر' : 'Exact Power'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isUrdu ? 'پائیدار فریمز' : 'TR90 Frames'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{isUrdu ? 'کانٹیکٹ لینز کٹ' : 'Soft Lenses'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eye Services Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              {isUrdu ? 'کمپیوٹرائزڈ آئی ٹیسٹ' : 'Computerized Eye Testing'}
            </h3>
            <ul className="text-xs space-y-1.5 text-gray-600">
              {isUrdu ? (
                <>
                  <li>• دور و قریب کی نظر کا کمپیوٹرائزڈ معائنہ</li>
                  <li>• نمبر اور سلنڈر کی مکمل تشخیص</li>
                  <li>• آنکھوں کے دباؤ اور کھچاؤ کی جانچ</li>
                  <li>• رنگوں کی شناخت اور بصارت کا جائزہ</li>
                </>
              ) : (
                <>
                  <li>• Eye Sight & Refraction Testing</li>
                  <li>• Distance & Reading Prescription</li>
                  <li>• Astigmatism & Cylinder Evaluation</li>
                  <li>• Color Vision & Ocular Pressure Check</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              {isUrdu ? 'بلیو کٹ کمپیوٹر گلاسز' : 'Blue Cut Computer Glasses'}
            </h3>
            <ul className="text-xs space-y-1.5 text-gray-600">
              {isUrdu ? (
                <>
                  <li>• 99٪ نقصان دہ نیلی روشنی سے تحفظ</li>
                  <li>• سکرین کے استعمال سے سر درد اور تھکاوٹ میں کمی</li>
                  <li>• ہلکے وزن کے پائیدار فریمز</li>
                  <li>• اینٹی ریفلیکٹو کوٹنگ لیس لینز</li>
                </>
              ) : (
                <>
                  <li>• 99% Harmful Blue Light Blocking</li>
                  <li>• Relieves Screen Fatigue & Headaches</li>
                  <li>• Ultra-Lightweight TR90 & Metal Frames</li>
                  <li>• Anti-Reflective & Hydrophobic Coating</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              {isUrdu ? 'کانٹیکٹ لینز و سن گلاسز' : 'Contact Lenses & Sunglasses'}
            </h3>
            <ul className="text-xs space-y-1.5 text-gray-600">
              {isUrdu ? (
                <>
                  <li>• روزانہ، ماہانہ اور سالانہ سوفٹ لینز</li>
                  <li>• قدرتی خوبصورت شیڈز میں کلرڈ لینز</li>
                  <li>• یو وی 400 ڈیزائنر سن گلاسز</li>
                  <li>• بچوں کے لیے فلیکسایبل فریمز</li>
                </>
              ) : (
                <>
                  <li>• Daily, Monthly & Yearly Soft Lenses</li>
                  <li>• Natural Shade Color Lenses (Hazel, Gray, Blue)</li>
                  <li>• UV400 Polarized Designer Sunglasses</li>
                  <li>• Flexible Safety Frames for Kids</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Categories Chips */}
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-4">
            {isUrdu ? 'دستیاب فریمز اور لینز کیٹلاگ' : 'Available Frame & Lens Catalog'}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {categories.map((cat, i) => (
              <span key={i} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 shadow-sm">
                ✔ {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6">
            {isUrdu ? 'آئی کیئر آن لائن پروڈکٹس' : 'Eye Care Products & Glasses Catalog'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {eyeProducts.map((prod) => (
              <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img src={prod.image} alt={prod.nameUrdu} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {isUrdu ? 'آئی کیئر' : 'Eye Care'}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">{isUrdu ? prod.nameUrdu : prod.nameEnglish}</h4>
                    <p className="text-xs text-gray-500">{isUrdu ? prod.nameEnglish : prod.nameUrdu}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{isUrdu ? prod.descriptionUrdu : prod.descriptionEnglish}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-base font-black text-emerald-800">Rs. {prod.pricePKR}</span>
                      {prod.originalPricePKR && (
                        <span className="text-xs text-gray-400 line-through">Rs. {prod.originalPricePKR}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isUrdu ? 'آرڈر یا کارٹ میں شامل کریں' : 'Add to Cart / Order Now'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
