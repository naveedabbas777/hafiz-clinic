import React from 'react';
import { Zap, Activity, Flame, Heart, Calendar, CheckCircle } from 'lucide-react';

interface PhysiotherapyViewProps {
  onOpenAppointment: (service?: string) => void;
  language?: 'urdu' | 'english';
}

export const PhysiotherapyView: React.FC<PhysiotherapyViewProps> = ({ onOpenAppointment, language = 'english' }) => {
  const isUrdu = language === 'urdu';

  const conditionsUrdu = [
    'فالج کے اثرات', 'منہ کا لقوہ', 'پولیو اور معذوری',
    'کمر اور مہروں کا درد', 'گردن اور کندھوں کا کھچاؤ', 'سائیٹیکا کا درد',
    'گھٹنوں کا درد', 'جام کندھا', 'پاؤں کی سوجن',
    'پٹھوں کی اکڑن', 'کھیلوں کی چوٹیں', 'عصبی دباؤ'
  ];

  const conditionsEnglish = [
    'Stroke Rehab', 'Facial Paralysis (Bell\'s Palsy)', 'Post-Polio Mobility',
    'Lumbar Disc Herniation', 'Cervical Spondylosis', 'Sciatica Pain',
    'Knee Joint Pain', 'Frozen Shoulder', 'Peripheral Edema',
    'Muscle Spasms', 'Sports Injuries', 'Nerve Compression'
  ];

  const conditions = isUrdu ? conditionsUrdu : conditionsEnglish;

  return (
    <div className="py-12 bg-white text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-4">
          <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
            {isUrdu ? 'اعصابی، فالج اور ہڈیوں کے مسائل کا جدید یونٹ' : 'Advanced Physical Rehabilitation & Laser Unit'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            {isUrdu
              ? 'فزیوتھراپی، لیزر اور اسٹیم تھراپی'
              : 'Physiotherapy, Laser & Thermal Rehab Therapy'}
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-3xl">
            {isUrdu
              ? 'ڈاکٹر وقاص صغیر چوہدری (MBBS) کی زیر نگرانی فالج، لقوہ، کمر و مہروں کے درد، سائیٹیکا، اور اسپورٹس انجری کی جدید فزیوتھراپی اور بحالی۔'
              : 'Supervised by qualified physical rehab experts for stroke recovery, facial paralysis, sciatica, lumbar disc herniation, and sports injury rehabilitation.'}
          </p>
          <button
            onClick={() => onOpenAppointment(isUrdu ? 'فزیوتھراپی سیشن' : 'Physiotherapy Session')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            <span>{isUrdu ? 'فزیوتھراپی اپائنٹمنٹ لیں' : 'Book Physiotherapy Session'}</span>
          </button>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <Zap className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {isUrdu ? 'لیزر تھراپی' : 'Cold Laser Pain Therapy'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isUrdu
                ? 'جدید لیزر ڈیوائس کے ذریعے پٹھوں کی اندرونی سوزش، جوڑوں کی سختی اور مہروں کے دباؤ میں فوری افاقہ۔'
                : 'Targeted bio-laser stimulation to reduce deep tissue inflammation, joint stiffness, and nerve entrapment pain.'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <Flame className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {isUrdu ? 'اسٹیم تھراپی' : 'Herbal Steam & Muscle Relax'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isUrdu
                ? 'پٹھوں کی اکڑن، کمر اور گردن کے شدید کھنچاؤ کو دور کرنے کے لیے ہربل اسٹیم مساج یونٹ۔'
                : 'Therapeutic herbal steam diffusion to ease chronic muscle spasms, cervical stiffness, and lower back tension.'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <Activity className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {isUrdu ? 'فالج و لقوہ بحالی یونٹ' : 'Stroke & Paralysis Rehab'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isUrdu
                ? 'فالج اور منہ کے لقوہ کے بعد الیکٹرک مسل سٹیولیشن سے عضلات کو دوبارہ فعال بنانا۔'
                : 'Electrical muscle stimulation (EMS) and motor retraining for post-stroke paralysis and Bell\'s Palsy recovery.'}
            </p>
          </div>
        </div>

        {/* Conditions Treated */}
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200">
          <h2 className="text-xl font-black text-emerald-950 mb-4 text-center">
            {isUrdu ? 'جن مسائل کے لیے فزیوتھراپی کی سہولت دستیاب ہے' : 'Conditions Treated in Rehabilitation Unit'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-emerald-900">
            {conditions.map((c, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-200 text-center shadow-sm">
                ✔ {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
