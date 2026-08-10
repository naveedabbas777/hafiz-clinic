import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ShoppingBag, CheckCircle, MessageCircle, Heart, Shield, Droplets } from 'lucide-react';

interface BeautyCreamViewProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  language?: 'urdu' | 'english';
}

export const BeautyCreamView: React.FC<BeautyCreamViewProps> = ({ product, onAddToCart, language = 'english' }) => {
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const isUrdu = language === 'urdu';

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
