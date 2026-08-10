import React from 'react';
import { Cpu, CheckCircle, Activity, Sparkles, Shield, Zap } from 'lucide-react';

interface ComputerCheckupProps {
  onOpenAppointment: () => void;
  language?: 'urdu' | 'english';
}

export const ComputerCheckupSection: React.FC<ComputerCheckupProps> = ({ onOpenAppointment, language = 'english' }) => {
  const isUrdu = language === 'urdu';

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black">
              <Cpu className="w-4 h-4" />
              <span>{isUrdu ? 'اشتہار میں موجود بار بار کمپیوٹر چیک اپ کا نظام' : 'Featured Computerized Diagnostic System'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {isUrdu
                ? 'جدید کمپیوٹرائزڈ چیک اپ اور ڈائیگنوسس'
                : 'Advanced Computerized Diagnostic Checkup'}
            </h2>

            <p className="text-emerald-100 text-sm leading-relaxed">
              {isUrdu
                ? 'حافظ کلینک میں جدید کمپیوٹرائزڈ بائیو کوانٹم مشین ڈائیگنوسس کے ذریعے جسمانی اعصاب، بلڈ سرکولیشن، جوڑوں کی چکنائی، اور اندرونی اعضاء کی کارکردگی کا بغیر کسی درد، سوئی یا تکلیف کے 10 منٹ میں مکمل معائنہ کیا جاتا ہے۔'
                : 'Our non-invasive Bio-Quantum Diagnostic Scanner evaluates bodily nerves, vascular circulation, joint synovial fluid, and organ performance in just 10 minutes without needles or discomfort.'}
            </p>

            <div className="space-y-3 font-semibold text-xs sm:text-sm">
              {(isUrdu
                ? [
                    '✔ بغیر کسی سوئی، خون یا درد کے فوری سائنسی تشخیصی معائنہ',
                    '✔ جسمانی اعصاب، رگوں کی رکاوٹ اور خون کی گردش کی جانچ',
                    '✔ جوڑوں کی چکنائی، وٹامن ڈی اور کیلشیم کی کمی کی نشان دہی',
                    '✔ معدہ، جگر اور گردوں کے ابتدائی عوارض کی بروقت رپورٹ',
                    '✔ معائنے کے بعد MBBS ڈاکٹرز کی جانب سے فوری مفت مشورہ',
                  ]
                : [
                    '✔ Non-invasive, needle-free, painless 10-minute diagnostic checkup',
                    '✔ Real-time assessment of nerve compression and blood flow circulation',
                    '✔ Evaluates joint lubrication, Vitamin D levels, and calcium deficiencies',
                    '✔ Early detection of stomach, liver, and kidney functional stress',
                    '✔ Post-checkup direct consultation with qualified MBBS physicians',
                  ]
              ).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-200 bg-white/5 p-3 rounded-xl border border-white/10">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAppointment}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>{isUrdu ? 'کمپیوٹر چیک اپ کے لیے ابھی ٹائم بک کریں' : 'Book Computerized Checkup Now'}</span>
              </button>
            </div>
          </div>

          {/* Machine Display Image & Features */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/30">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000"
                alt="Computerized Diagnosis Machine"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                  <span>Quantum Health Diagnostic Sensor</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded">99.2% Accuracy</span>
                </div>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'کمپیوٹر بائیو الیکٹرک سینسر مریض کی نبض اور اعصابی سگنلز کو ریڈ کر کے کمپیوٹر اسکرین پر گرافکل رپورٹ پیش کرتا ہے۔'
                    : 'Bio-electric pulse sensor translates neural signals into instant diagnostic graphical reports on the monitor screen.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
