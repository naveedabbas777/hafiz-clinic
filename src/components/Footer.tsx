import React from 'react';
import { ClinicSettings } from '../types';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Heart, Stethoscope, FileText } from 'lucide-react';

interface FooterProps {
  settings: ClinicSettings;
  setActiveView: (view: string) => void;
  onOpenAppointment: () => void;
  language?: 'urdu' | 'english';
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveView, onOpenAppointment, language = 'english' }) => {
  const isUrdu = language === 'urdu';

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {isUrdu ? settings.clinicNameUrdu : settings.clinicNameEnglish}
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold">
                  {isUrdu ? settings.clinicNameEnglish : settings.clinicNameUrdu}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isUrdu
                ? 'پنجاب ہیلتھ کیئر کمیشن سے باقاعدہ منظور شدہ کلینک۔ 15+ سالہ تجربہ کار MBBS معالجین، جدید فزیوتھراپی، کمپیوٹر چیک اپ، اور ہربل مصنوعات کی پاکستان اور دنیا بھر میں ہوم ڈیلیوری۔'
                : 'Approved by Punjab Healthcare Commission (PHC). Managed by experienced MBBS physicians providing clinical diagnosis, lab tests, computerized checkups, and nationwide product delivery.'}
            </p>

            <div className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>PHC Reg No: {settings.phcApprovalNo}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'اہم صفحہ جات' : 'Quick Site Navigation'}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'ہوم (Home)' : 'Home Overview'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('diseases')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'تمام بیماریاں (40+ Disease Pages)' : 'All 40+ Medical Conditions'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('eyecare')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'آئی کیئر و کمپیوٹرائزڈ چشمے' : 'Eye Care & Computer Glasses'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('hairoil')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'ہوراب ہیئر آئل (Hoorab Hair Oil)' : 'Hoorab Herbal Hair Oil'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('beautycream')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'ہوراب بیوٹی کریم (Beauty Cream)' : 'Hoorab Radiance Beauty Cream'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('services')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'کلینک سروسز (Clinic Services)' : 'Clinical Services'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('lab-reports')} className="hover:text-emerald-400 transition-colors">
                  • {isUrdu ? 'آن لائن لیب رپورٹس (Lab Reports)' : 'Lab Reports & QR Verification'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('legal')} className="hover:text-emerald-400 transition-colors text-amber-300">
                  • {isUrdu ? 'قوانین و پالیسی (Legal Policies)' : 'Legal Policies & Terms'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('seo')} className="hover:text-emerald-400 transition-colors text-emerald-300">
                  • {isUrdu ? 'SEO و میٹا ڈیٹا' : 'SEO & Schema Data'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Timings */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'اوقات کار و پتہ' : 'Clinic Hours & Location'}
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'او پی ڈی ٹائمنگ:' : 'OPD Hours:'}</strong> {isUrdu ? settings.timingUrdu : settings.timingEnglish}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'پتہ:' : 'Address:'}</strong> {isUrdu ? settings.addressUrdu : settings.addressEnglish}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'کال کریں:' : 'Call Helpline:'}</strong> {settings.phone1} / {settings.phone2}</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? 'واٹس ایپ:' : 'WhatsApp:'}</strong> {settings.whatsappNumber}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Action CTAs */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'فوری رابطہ' : 'Direct Booking'}
            </h4>
            <button
              onClick={onOpenAppointment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              {isUrdu ? 'آن لائن اپائنٹمنٹ لیں' : 'Book Online Appointment'}
            </button>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'واٹس ایپ آرڈر سروس' : 'WhatsApp Express Order'}</span>
            </a>
            <a
              href={`tel:${settings.phone1}`}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>{isUrdu ? 'فوری ڈاکٹر سے بات کریں' : 'Call Doctor Directly'}</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-8 border-t border-slate-900 text-center text-slate-500 text-[11px] space-y-2">
          <p>
            {isUrdu
              ? 'طبی انتباہ: اس ویب سائٹ پر موجود تمام معلومات آگاہی کے لیے ہیں۔ کسی بھی دوا کے استعمال سے قبل اپنے MBBS معالج سے مشورہ ضروری ہے۔'
              : 'Medical Disclaimer: Information on this site is provided for educational and clinical awareness purposes only. Please consult a qualified MBBS physician before commencing treatments.'}
          </p>
          <div className="flex justify-center items-center gap-4 text-slate-400 font-bold text-[11px]">
            <span>{isUrdu ? 'پرائیویسی پالیسی' : 'Privacy Policy'}</span>
            <span>•</span>
            <span>{isUrdu ? 'شرائط و ضوابط' : 'Terms of Service'}</span>
            <span>•</span>
            <span>{isUrdu ? 'طبی ڈسکلیمر' : 'Clinical Disclaimer'}</span>
            <span>•</span>
            <span>{isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ' : 'PHC Accredited'}</span>
          </div>
          <p className="text-slate-600 pt-2">
            © 2026 {isUrdu ? settings.clinicNameUrdu : settings.clinicNameEnglish}. All rights reserved. Designed for Production Deployment.
          </p>
        </div>
      </div>
    </footer>
  );
};
