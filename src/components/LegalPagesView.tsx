import React, { useState } from 'react';
import { ShieldCheck, FileText, Truck, RefreshCw, Cookie, Lock } from 'lucide-react';

interface LegalPagesViewProps {
  language?: 'urdu' | 'english';
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({ language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'refund' | 'shipping' | 'cookie'>('privacy');

  return (
    <div className="py-12 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full inline-block mb-2">
            {isUrdu ? 'قوانین و ضوابط و پالیسی' : 'Legal & Compliance Framework'}
          </span>
          <h1 className="text-3xl font-black">
            {isUrdu ? 'حافظ کلینک — قانونی قوانین، پالیسی اور شرائط' : 'Hafiz Clinic Legal Policies & Terms of Service'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {isUrdu
              ? 'پنجاب ہیلتھ کیئر کمیشن کے ضوابط اور مریض کی پرائیویسی، ریفنڈ، اور ہوم ڈیلیوری پالیسی کا تفصیلی گائیڈ۔'
              : 'Official policies regarding patient privacy, e-commerce shipping, refund terms, cookies, and clinical compliance.'}
          </p>
        </div>

        {/* Policy Switcher Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-emerald-800 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'پرائیویسی پالیسی (Privacy Policy)' : 'Privacy Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'terms' ? 'bg-emerald-800 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'شرائط و ضوابط (Terms & Conditions)' : 'Terms & Conditions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'refund' ? 'bg-emerald-800 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ریفنڈ و واپسی پالیسی (Refund Policy)' : 'Refund & Return Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipping' ? 'bg-emerald-800 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'شپنگ و ڈیلیوری پالیسی (Shipping Policy)' : 'Shipping & Delivery Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cookie')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'cookie' ? 'bg-emerald-800 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کوکیز پالیسی (Cookie Policy)' : 'Cookie Policy'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-sm space-y-6 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-emerald-950 pb-2 border-b">
                {isUrdu ? 'پرائیویسی پالیسی (Privacy Policy)' : '1. Privacy Policy & Patient Confidentiality'}
              </h2>
              <p>
                {isUrdu
                  ? 'حافظ کلینک پر ہم آپ کے ذاتی ڈیٹا اور میڈیکل ہسٹری کی مکمل تحفظ کی ضمانت دیتے ہیں۔ تمام ڈیٹا محفوط سرورز پر انکرپٹڈ فارمیٹ میں رکھا جاتا ہے۔'
                  : 'Hafiz Clinic respects patient confidentiality. Medical records, prescription details, and lab diagnostics are strictly safeguarded under Punjab Healthcare Commission data privacy protocols.'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs">
                <li>Patient records are never shared with third-party advertisers.</li>
                <li>Online payment information is processed directly via encrypted payment gateways (Easypaisa / JazzCash / Visa).</li>
                <li>Patients have full access to request copies or deletion of their patient portal account data.</li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-emerald-950 pb-2 border-b">
                {isUrdu ? 'شرائط و ضوابط (Terms & Conditions)' : '2. Terms & Conditions of Clinical Care'}
              </h2>
              <p>
                {isUrdu
                  ? 'ہمارے کلینک پر تشریف لانے اور ویب سائٹ استعمال کرنے والے تمام صارفین مندرجہ ذیل شرائط و ضوابط کے پابند ہیں۔'
                  : 'By booking appointments or purchasing herbal health products from Hafiz Clinic, you agree to these operational terms.'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs">
                <li>Consultation fees are non-refundable once the doctor examination has been conducted.</li>
                <li>Online appointments must be cancelled at least 2 hours prior to scheduled OPD time.</li>
                <li>Prescribed herbal oils, beauty creams, and optical items are supplied with 100% genuine formulation guarantees.</li>
              </ul>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-emerald-950 pb-2 border-b">
                {isUrdu ? 'ریفنڈ و تبدیلی پالیسی (Refund Policy)' : '3. Refund & Product Return Policy'}
              </h2>
              <p>
                {isUrdu
                  ? 'اگر آپ کو موصول شدہ ہوراب ہربل پروڈکٹس یا آئی فریمز میں کوئی نقصان، ٹوٹ پھوٹ یا خرابی ملے تو 7 دنوں کے اندر 100% رقم کی واپسی کا کلیم کریں۔'
                  : 'We offer a hassle-free 7-day exchange or refund guarantee on all sealed herbal products, perfumes, and optical frames.'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs">
                <li>Damaged or defective products during shipping will be replaced free of delivery charges.</li>
                <li>Opened liquid medicine or custom optical lenses are non-returnable due to hygiene regulations.</li>
                <li>Refunds are processed to Easypaisa/JazzCash or Bank account within 3-5 business days.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-emerald-950 pb-2 border-b">
                {isUrdu ? 'شپنگ و ڈیلیوری پالیسی (Shipping Policy)' : '4. Domestic & International Shipping Policy'}
              </h2>
              <p>
                {isUrdu
                  ? 'پاکستان کے تمام شہروں میں 2 سے 4 دنوں کے اندر کوریئر سروس (Leopards / TCS / M&P) کے ذریعے ڈیلیوری کی جاتی ہے۔'
                  : 'Hafiz Clinic ships herbal products and eyewear nationwide across Pakistan within 2-4 business days and worldwide within 7-10 business days.'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs">
                <li>Free home delivery across Pakistan on orders above PKR 2,500.</li>
                <li>Cash on Delivery (COD) is available in 250+ cities across Pakistan.</li>
                <li>International shipments are handled via DHL / FedEx with live tracking code provided.</li>
              </ul>
            </div>
          )}

          {activeTab === 'cookie' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-emerald-950 pb-2 border-b">
                {isUrdu ? 'کوکیز پالیسی (Cookie Policy)' : '5. Web Cookies & Local Storage Policy'}
              </h2>
              <p>
                {isUrdu
                  ? 'ہمارے پورٹل پر زبان کی ترجیح، کارٹ آئٹمز، اور لاگ ان سیشن کو برقرار رکھنے کے لیے کوکیز کا استعمال کیا جاتا ہے۔'
                  : 'We use essential web browser cookies and local storage purely to remember your language choice (English/Urdu), shopping cart state, and portal session.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
