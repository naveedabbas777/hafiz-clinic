import React from 'react';
import { Truck, Globe, ShieldCheck, CreditCard, Clock, Phone, MessageCircle } from 'lucide-react';

interface HomeDeliveryViewProps {
  language?: 'urdu' | 'english';
}

export const HomeDeliveryView: React.FC<HomeDeliveryViewProps> = ({ language = 'english' }) => {
  const isUrdu = language === 'urdu';

  return (
    <div className="py-12 bg-white text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-4">
          <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
            {isUrdu ? 'پاکستان سمیت دنیا بھر میں محفوظ ہوم ڈیلیوری' : 'Nationwide & Worldwide Express Delivery'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            {isUrdu ? 'ہوم ڈیلیوری سروس' : 'Home Delivery Service (Pakistan & Overseas)'}
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-3xl">
            {isUrdu
              ? 'ہماری تمام پروڈکٹس (ہوراب ہیئر آئل، بیوٹی کریم، پین آئل، آئی گلاسز، کانٹیکٹ لینز، پرفیومز، اور ادویات) پاکستان بھر میں اور بین الاقوامی ممالک میں کورئیر کے ذریعے محفوظ طریقے سے بھیجی جاتی ہیں۔'
              : 'Order Hoorab Hair Oil, Beauty Cream, Pain Relief Oil, Glasses, Contact Lenses, and herbal products directly to your doorstep anywhere in Pakistan or internationally.'}
          </p>
        </div>

        {/* Delivery Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
            <Truck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {isUrdu ? 'پاکستان میں ڈیلیوری' : 'Domestic Pakistan Delivery'}
            </h3>
            <p className="text-xs text-gray-600">
              {isUrdu ? '2 سے 4 کاروباری دنوں میں بذریعہ TCS, Leopard, M&P' : '2 to 4 business days via TCS, Leopard, M&P Courier'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
            <Globe className="w-8 h-8 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {isUrdu ? 'بین الاقوامی ڈیلیوری' : 'Worldwide International Shipping'}
            </h3>
            <p className="text-xs text-gray-600">
              {isUrdu ? '5 سے 12 دن میں بذریعہ DHL, FedEx, Pakistan Post EMS' : '5 to 12 days via DHL Express, FedEx, & EMS Air Mail'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
            <CreditCard className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {isUrdu ? 'ادائیگی کے طریقے' : 'Flexible Payment Options'}
            </h3>
            <p className="text-xs text-gray-600">
              {isUrdu ? 'کیش آن ڈلیوری (COD)، جاز کیش، ایزی پیسہ، بینک ٹرانسفر' : 'Cash on Delivery (COD), JazzCash, EasyPaisa, & Bank Transfer'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {isUrdu ? 'محفوظ پیکنگ' : 'Tamper-Evident Packaging'}
            </h3>
            <p className="text-xs text-gray-600">
              {isUrdu ? 'لیبارٹری منظور شدہ سیل پیکنگ مع ٹریکنگ آئی ڈی' : 'Hygienic sealed packaging with real-time tracking number'}
            </p>
          </div>
        </div>

        {/* Courier Partners */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-black text-amber-400 text-center">
            {isUrdu ? 'کورئیر پارٹنرز' : 'Official Logistics & Courier Partners'}
          </h2>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-200">
            {['TCS Courier', 'Leopard Courier', 'M&P Courier', 'Pakistan Post EMS', 'DHL Express', 'FedEx', 'Aramex'].map((p, i) => (
              <span key={i} className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                📦 {p}
              </span>
            ))}
          </div>
        </div>

        {/* Order Process */}
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200 space-y-4">
          <h2 className="text-xl font-black text-emerald-950 text-center">
            {isUrdu ? 'آرڈر کرنے کا آسان طریقہ' : 'Simple 4-Step Order Process'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold text-gray-800">
            <div className="bg-white p-4 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 font-bold">{isUrdu ? 'مرحلہ 1:' : 'Step 1:'}</span> {isUrdu ? 'مطلوبہ پروڈکٹ منتخب کریں۔' : 'Select desired product or eyeglasses'}
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 font-bold">{isUrdu ? 'مرحلہ 2:' : 'Step 2:'}</span> {isUrdu ? '"آرڈر کریں" یا "واٹس ایپ" پر کلک کریں۔' : 'Click "Add to Cart" or "WhatsApp Order"'}
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 font-bold">{isUrdu ? 'مرحلہ 3:' : 'Step 3:'}</span> {isUrdu ? 'نام، فون نمبر اور پتہ درج کریں۔' : 'Enter recipient name, phone, and delivery address'}
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 font-bold">{isUrdu ? 'مرحلہ 4:' : 'Step 4:'}</span> {isUrdu ? '2 سے 4 دن میں پارسل موصول کریں۔' : 'Receive parcel at door within 2-4 days'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
