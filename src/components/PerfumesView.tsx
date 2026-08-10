import React from 'react';
import { Product } from '../types';
import { Sparkles, ShoppingBag, CheckCircle, Flame, ShieldCheck } from 'lucide-react';

interface PerfumesViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  language?: 'urdu' | 'english';
}

export const PerfumesView: React.FC<PerfumesViewProps> = ({ products, onAddToCart, language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const notesUrdu = ['عود اور لکڑی', 'پھول اور گلاب', 'مشک اور وائٹ عنبر', 'تازہ لیموں اور آبی', 'شرقی اور مسالےدار'];
  const notes = isUrdu ? notesUrdu : ['Oud & Woody', 'Floral & Rose', 'Musk & White Amber', 'Fresh Citrus & Aquatic', 'Oriental & Spicy'];
  const sizes = ['10ml', '20ml', '30ml', '50ml', '100ml', '200ml'];

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'پریمیم پرفیوم و الکحل فری عطر کلیکشن' : 'Premium Non-Alcoholic Attar & Fragrance Line'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              {isUrdu
                ? 'خالص شاہی عود، مسک اور فرانسیسی خوشبوئیں'
                : 'Pure Royal Oud, White Musk & French Fragrances'}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'روزمرہ، آفس، شادی اور تحفے کے لیے دیرپا اور دلکش خوشبوئیں۔ 100% الکحل سے پاک پریمیم عطریات اور لانگ لاسٹنگ عود پرفیومز۔'
                : 'Long-lasting alcohol-free attars and luxury concentrated sprays crafted for daily wear, office elegance, and luxury gift boxes.'}
            </p>
          </div>
        </div>

        {/* Sizes and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-3">
              {isUrdu ? 'دستیاب خوشبوئیں' : 'Signature Fragrance Notes'}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {notes.map((n, i) => (
                <span key={i} className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
                  ✨ {n}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-3">
              {isUrdu ? 'دستیاب سائز' : 'Bottle Sizes Available'}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {sizes.map((s, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200">
                  📦 {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6">
            {isUrdu ? 'پرفیومز اور عطریات کیٹلاگ' : 'Luxury Perfumes & Attar Catalog'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="h-56 overflow-hidden relative">
                    <img src={prod.image} alt={isUrdu ? prod.nameUrdu : prod.nameEnglish} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded">
                      {isUrdu ? 'دیرپا خوشبو' : 'Long Lasting'}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-black text-slate-900 text-base">{isUrdu ? prod.nameUrdu : prod.nameEnglish}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{isUrdu ? prod.descriptionUrdu : prod.descriptionEnglish}</p>
                    <div className="pt-2 text-lg font-black text-emerald-800">Rs. {prod.pricePKR}</div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isUrdu ? 'کارٹ میں شامل کریں' : 'Add to Cart / Buy Now'}</span>
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
