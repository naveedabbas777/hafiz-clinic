import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ShoppingBag, CheckCircle, MessageCircle, Phone, Heart } from 'lucide-react';

interface HairOilViewProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  language?: 'urdu' | 'english';
}

export const HairOilView: React.FC<HairOilViewProps> = ({ product, onAddToCart, language = 'english' }) => {
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const isUrdu = language === 'urdu';

  const handleQuickOrder = () => {
    onAddToCart(product, quantity);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <div className="py-12 bg-white text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="space-y-4">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'خالص قدرتی ہربل شاہی نُسخہ' : '100% Pure Organic Herbal Formula'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              {isUrdu ? 'ہوراب ہربل ہیئر آئل' : 'Hoorab Organic Herbal Hair Oil'}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'بالوں کے گرنے، خشکی، سکری، کمزوری اور قبل از وقت سفید بالوں کی دیکھ بھال کے لیے قدرتی جڑی بوٹیوں اور خالص زیتون، ناریل اور جوجوبا کے تیل کا شاہکار امتزاج۔'
                : 'Formulated with cold-pressed botanical oils, Amla, Reetha, Shikakai, Jojoba, and Black Seed to combat hair loss, dandruff, and premature graying.'}
            </p>

            <div className="flex items-center gap-4 py-2">
              <span className="text-3xl font-black text-amber-300">Rs. {product.pricePKR}</span>
              {product.originalPricePKR && (
                <span className="text-sm text-gray-400 line-through">Rs. {product.originalPricePKR}</span>
              )}
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                {isUrdu ? 'پاکستان بھر میں ہوم ڈیلیوری' : 'Nationwide Home Delivery'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleQuickOrder}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isUrdu ? 'ابھی آن لائن آرڈر کریں' : 'Order Online Now'}</span>
              </button>
              <a
                href={`https://wa.me/923001234567?text=Assalam%20o%20Alaikum!%20I%20want%20to%20order%20Hoorab%20Hair%20Oil`}
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
                <span>{isUrdu ? 'ہوراب ہیئر آئل آپ کی کارٹ میں شامل ہو گیا ہے!' : 'Hoorab Hair Oil added to your cart successfully!'}</span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/30 max-w-sm">
              <img src={product.image} alt="Hoorab Hair Oil" className="w-full h-80 sm:h-96 object-cover" />
              <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                100% Herbal & Pure
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
            {isUrdu ? 'قدرتی اجزاء' : 'Botanical Herbal Ingredients'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
            {(isUrdu ? product.ingredientsUrdu : product.ingredientsEnglish || product.ingredientsUrdu)?.map((ing, i) => (
              <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-sm text-emerald-900">
                🌿 {ing}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits & How to Use */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 space-y-3">
            <h3 className="text-xl font-bold text-emerald-950">
              {isUrdu ? 'ہیئر کیئر فوائد' : 'Hair Health & Growth Benefits'}
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
              {isUrdu ? 'استعمال کرنے کا صحیح طریقہ' : 'Recommended Directions for Use'}
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {isUrdu ? product.howToUseUrdu : 'Gently massage a generous amount into the scalp with fingertips for 5 minutes before bedtime. Leave overnight or wash after 2 hours with mild shampoo.'}
            </p>
            <div className="space-y-2 text-xs text-slate-300 pt-2">
              {isUrdu ? (
                <>
                  <div>• <strong>صبح کے وقت:</strong> بالوں میں چمک کے لیے ہلکا مساج۔</div>
                  <div>• <strong>رات کو:</strong> سوتے وقت 5 منٹ تک سر کی جلد میں نرمی سے مساج کریں۔</div>
                  <div>• <strong>ہربل اسٹیم:</strong> بہترین نتائج کے لیے ہفتے میں دو بار نیم گرم تولیہ لپیٹیں۔</div>
                </>
              ) : (
                <>
                  <div>• <strong>Morning:</strong> Light application on hair strands for natural shine.</div>
                  <div>• <strong>Night:</strong> 5-minute scalp massage before sleep to stimulate follicles.</div>
                  <div>• <strong>Hair Spa:</strong> Wrap with warm damp towel twice a week for deep conditioning.</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
