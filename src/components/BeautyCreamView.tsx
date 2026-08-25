import React, { useState } from 'react';
import { Product, ClinicSettings } from '../types';
import { Sparkles, ShoppingBag, CheckCircle, MessageCircle, Heart, Shield, Droplets, Play, Volume2, VolumeX, Film, CheckCircle2 } from 'lucide-react';

interface BeautyCreamViewProps {
  product: Product;
  settings?: ClinicSettings;
  onAddToCart: (product: Product, quantity: number) => void;
  language?: 'urdu' | 'english';
}

export const BeautyCreamView: React.FC<BeautyCreamViewProps> = ({ product, settings, onAddToCart, language = 'english' }) => {
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const isUrdu = language === 'urdu';

  const videoUrl = settings?.beautyCreamVideoUrl || product?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4';
  const videoTitle = isUrdu
    ? (settings?.beautyCreamVideoTitleUrdu || 'ہوراب بیوٹی کریم کی نیچرل گلو اور استعمال کی ویڈیو')
    : (settings?.beautyCreamVideoTitleEnglish || 'Hoorab Radiance Beauty Cream Vitamin & Glow Video');

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const embedYoutubeUrl = isYouTube 
    ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&mute=1&loop=1'
    : '';

  const facialsListUrdu = [
    'ہربل فیشل', 'میڈیکیٹڈ فیشل', 'کاسمیٹک فیشل', 'فروٹ فیشل',
    'کولنگ فیشل', 'گلو فیشل', 'برائٹننگ فیشل', 'ہائیڈریٹنگ فیشل',
    'گولڈ فیشل', 'سلور فیشل', 'ڈائمنڈ فیشل', 'چارکول فیشل',
    'گرین ٹی فیشل', 'ککمبر فیشل', 'وٹامن C فیشل', 'اینٹی ایکنی فیشل'
  ];

  const facialsList = isUrdu ? facialsListUrdu : [
    'Herbal Facial', 'Medicated Facial', 'Cosmetic Facial', 'Fruit Facial',
    'Cooling Facial', 'Glow Facial', 'Brightening Facial', 'Hydrating Facial',
    'Gold Facial', 'Silver Facial', 'Diamond Facial', 'Charcoal Facial',
    'Green Tea Facial', 'Cucumber Facial', 'Vitamin-C Facial', 'Anti-Acne Facial'
  ];

  const handleQuickOrder = () => {
    onAddToCart(product, quantity);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <div className="py-12 bg-white text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="space-y-4">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'فیس بیوٹی اینڈ اسکن کیئر سینٹر' : 'Face Beauty & Skin Care Center'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              {isUrdu ? 'ہوراب بیوٹی کریم' : 'Hoorab Radiance Beauty Cream'}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'جلد کو نمی، نرمی اور تروتازہ رکھنے کے لیے وٹامن A، B، C اور فروٹ ایکسٹریکٹس سے مرصع اسکن کیئر فارمولہ۔ روزمرہ اسکن کیئر روٹین کے لیے بہترین۔'
                : 'Enriched with Vitamins A, B, C, Niacinamide, and fruit extracts to nourish skin, reduce dark spots, and maintain a radiant natural glow.'}
            </p>

            <div className="flex items-center gap-4 py-2">
              <span className="text-3xl font-black text-amber-300">Rs. {product.pricePKR}</span>
              {product.originalPricePKR && (
                <span className="text-sm text-gray-400 line-through">Rs. {product.originalPricePKR}</span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleQuickOrder}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isUrdu ? 'ابھی کریم آرڈر کریں' : 'Order Beauty Cream Now'}</span>
              </button>
              <a
                href={`https://wa.me/923001234567?text=Assalam%20o%20Alaikum!%20I%20want%20to%20order%20Hoorab%20Beauty%20Cream`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-xl text-sm flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isUrdu ? 'WhatsApp آرڈر' : 'WhatsApp Order'}</span>
              </a>
            </div>

            {orderSuccess && (
              <div className="bg-emerald-500 text-slate-950 font-extrabold p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{isUrdu ? 'ہوراب بیوٹی کریم کارٹ میں شامل کر دی گئی ہے!' : 'Hoorab Beauty Cream added to your cart successfully!'}</span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/30 max-w-sm">
              <img src={product.image} alt="Hoorab Beauty Cream" className="w-full h-80 sm:h-96 object-cover" />
              <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                Vitamin A, B, C Care
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Beauty Cream Video Showcase */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700">
                {isYouTube ? (
                  <iframe
                    src={embedYoutubeUrl}
                    title="Beauty Cream Video"
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
                    <span>{isUrdu ? 'بیوٹی کریم ویڈیو ٹور' : 'Beauty Cream Video'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{isUrdu ? 'اسکن گلو اور نیچرل ہائیڈریشن' : 'Skin Glow & Hydration Video'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {videoTitle}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isUrdu
                  ? 'دیکھیں کس طرح وٹامنز اور قدرتی اجزاء سے تیار کردہ ہوراب بیوٹی کریم آپ کی جلد کو چمکدار اور صحت مند رکھنے میں مدد دیتی ہے۔'
                  : 'Explore how natural vitamin complexes replenish essential moisture and support a clean, glowing complexion without harmful bleaches.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-200">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{isUrdu ? 'وٹامن A، B، C نکھار' : 'Multi-Vitamin'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isUrdu ? 'داغ دھبے ہلکے' : 'Spot Reduction'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isUrdu ? 'نان اسٹکی ٹیکسچر' : 'Non-Greasy'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{isUrdu ? 'ہر موسم کے لیے' : 'All Seasons'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits & Caution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 space-y-3">
            <h3 className="text-xl font-bold text-emerald-950">
              {isUrdu ? 'اسکن کیئر فوائد' : 'Skin Care Benefits'}
            </h3>
            <div className="space-y-2 text-xs font-semibold text-gray-800">
              {(isUrdu ? product.benefitsUrdu : product.benefitsEnglish || product.benefitsUrdu)?.map((ben, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-amber-400">
              {isUrdu ? 'طریقہ استعمال' : 'Directions for Use'}
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {isUrdu ? product.howToUseUrdu : 'Cleanse face gently with mild cleanser. Apply a small pea-sized amount evenly across face and neck before sleeping.'}
            </p>
            <div className="p-3 bg-white/10 rounded-xl text-xs text-amber-200 border border-amber-400/20">
              {isUrdu
                ? 'مجموعی رہنمائی: "7 دن میں گورا" جیسے غیر منطقی دعووں کے بجائے، ہماری پروڈکٹس جلد کو قدرتی نمی، ہمواری اور تروتازگی دینے کے لیے ڈیزائن کی گئی ہیں۔'
                : 'Note: Designed for organic hydration, skin barrier support, and natural radiance.'}
            </div>
          </div>
        </div>

        {/* Herbal Facial Services Grid */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">
            {isUrdu ? 'جدید ہربل فیشل اینڈ اسکن کیئر سروسز' : 'In-Clinic Herbal Facial & Skin Treatments'}
          </h2>
          <p className="text-center text-xs text-gray-600 mb-6">
            {isUrdu
              ? 'کلینک میں جدید مشینوں اور معیاری پراڈکٹس کے ذریعے تمام تر فیشل اور فیس تھراپی کی سہولت دستیاب ہے۔'
              : 'Our clinic offers professional skin facial therapies administered by trained aesthetic care specialists.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
            {facialsList.map((f, i) => (
              <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-sm text-emerald-900">
                ✨ {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
