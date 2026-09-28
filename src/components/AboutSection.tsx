import React, { useState } from 'react';
import { ShieldCheck, Cpu, FlaskConical, Users, Award, Clock, HeartHandshake, CheckCircle, Play, Volume2, VolumeX, Maximize2, Film } from 'lucide-react';
import { ClinicSettings } from '../types';

interface AboutSectionProps {
  settings?: ClinicSettings;
  language?: 'urdu' | 'english';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const [isMuted, setIsMuted] = useState(true);

  const videoUrl = settings?.clinicVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4';
  const videoTitle = isUrdu 
    ? (settings?.clinicVideoTitleUrdu || 'حافظ کلینک کا تعارف اور جدید سہولیات کی ویڈیو') 
    : (settings?.clinicVideoTitleEnglish || 'Hafiz Clinic & Diagnostic Center Video Tour');

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const embedYoutubeUrl = isYouTube 
    ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&mute=1&loop=1'
    : '';

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'پنجاب ہیلتھ کیئر سے باقاعدہ منظور شدہ' : 'PHC Officially Approved Healthcare Facility'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isUrdu ? 'حافظ کلینک کا تعارف اور جدید سہولیات' : 'About Hafiz Clinic & Modern Facilities'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {isUrdu
              ? 'پچھلے 15+ سالوں سے مریضوں کی بے لوث خدمت، جدید کمپیوٹرائزڈ چیک اپ، لیبارٹری ٹیسٹس، اور فزیوتھراپی کے ذریعے شفابخش علاج۔'
              : 'Serving patients for 15+ years with dedication, offering computerized health diagnosis, certified lab diagnostics, physical therapy, and herbal treatments.'}
          </p>
        </div>

        {/* Prominent Clinic Video Showcase */}
        <div className="mb-14 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Video Player */}
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700 group">
                {isYouTube ? (
                  <iframe
                    src={embedYoutubeUrl}
                    title="Clinic Video Tour"
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
                        title={isMuted ? 'Unmute Video' : 'Mute Video'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        <span className="text-[11px]">{isMuted ? (isUrdu ? 'آواز کھولیں' : 'Unmute') : (isUrdu ? 'آواز بند' : 'Mute')}</span>
                      </button>
                    </div>
                  </>
                )}
                <div className="absolute bottom-2 left-2 pointer-events-none">
                  <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    <span>{isUrdu ? 'لائیو کلینک ویڈیو' : 'Live Clinic Video'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Video Details & Highlights */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isUrdu ? 'ویڈیو ٹور اور سہولیات' : 'Featured Video Presentation'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {videoTitle}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isUrdu
                  ? 'ہمارے جدید کلینک کا معائنہ کریں جہاں مریضوں کو صاف ستھرا پرسکون ماحول، جدید ڈائیگنوسٹک مشینیں، مستند ڈاکٹرز اور 100% خالص قدرتی ادویات فراہم کی جاتی ہیں۔'
                  : 'Watch an authentic tour of Hafiz Clinic featuring our advanced computerized scanning equipment, private male/female consultation suites, accredited clinical testing, and pharmacy.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-200">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isUrdu ? 'کمپیوٹرائزڈ معائنہ' : 'Computer Scan'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{isUrdu ? 'مکمل لیب ٹیسٹس' : 'Certified Labs'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isUrdu ? 'پردہ دار خواتین ہال' : 'Private Suites'}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isUrdu ? '15+ سال کا تجربہ' : '15+ Years Trust'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
                  alt={isUrdu ? 'جدید کمپیوٹرائزڈ چیک اپ' : 'Advanced Computerized Checkup'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-emerald-500/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {isUrdu ? 'جدید کمپیوٹرائزڈ چیک اپ' : 'Advanced Computerized Checkup'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isUrdu
                    ? 'جدید کمپیوٹر ڈائیگنوسس مشین کے ذریعے بغیر کسی درد کے جسمانی اعصاب، بلڈ سرکولیشن اور اندرونی سوجن کا فوری اور دقیق معائنہ۔'
                    : 'Painless diagnostic checkup using advanced magnetic impulse scanning to detect nerve pressure, blood flow, joint inflammation, and vital imbalances.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800"
                  alt={isUrdu ? 'لیبارٹری اور ٹیسٹنگ سروسز' : 'Laboratory & Diagnostic Testing'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-teal-500/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <FlaskConical className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {isUrdu ? 'لیبارٹری اور ٹیسٹنگ سروسز' : 'Laboratory & Diagnostic Testing'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isUrdu
                    ? 'خون کے تمام بنیادی ٹیسٹ، یورک ایسڈ، شوگر، کڈنی پروفائل، اور ہورمونل معائنہ کی مستند ڈائریکٹ سہولت۔'
                    : 'Certified blood lab testing, uric acid evaluation, blood sugar tracking, renal profile, and hormonal diagnostic screenings.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                  alt={isUrdu ? 'خواتین اور مردوں کے الگ شعبے' : 'Separate Wings for Male & Female'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-amber-500/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {isUrdu ? 'خواتین اور مردوں کے الگ شعبے' : 'Separate Wings for Male & Female'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isUrdu
                    ? 'خواتین مریضات کے لیے الگ اور محفوظ پردے دار ہال، لیڈی عملہ، اور تسلی بخش ماحول میں مکمل رازداری سے علاج۔'
                    : 'Dedicated private examination suites for female patients with female medical staff, ensuring maximum privacy and dignity.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Treatment Process */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <h3 className="text-2xl font-black text-center text-white mb-2">
            {isUrdu ? 'علاج کا 5 مرحلہ وار طریقہ کار (Treatment Process)' : '5-Step Structured Healing Process'}
          </h3>
          <p className="text-center text-emerald-200 text-xs sm:text-sm mb-8">
            {isUrdu ? 'شفایابی کے سفر میں مریض کی مکمل رہنمائی' : 'Complete patient guidance from registration to full recovery'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {[
              {
                step: 'Step 1',
                titleUrdu: 'مریض کی رجسٹریشن',
                titleEnglish: 'Patient Registration',
                descUrdu: 'ابتدائی بائیو ڈیٹا، سابقہ میڈیکل ہسٹری اور علامات کا اندراج',
                descEnglish: 'Initial medical history logging and symptomatology entry',
              },
              {
                step: 'Step 2',
                titleUrdu: 'کمپیوٹر چیک اپ',
                titleEnglish: 'Computerized Checkup',
                descUrdu: 'جدید ڈائیگنوسس ڈیوائس کے ذریعے جسمانی معائنہ',
                descEnglish: 'Painless scanning of nerves, organs, and joint pressure',
              },
              {
                step: 'Step 3',
                titleUrdu: 'ڈاکٹر مشاورت',
                titleEnglish: 'Doctor Consultation',
                descUrdu: 'سنیئر MBBS معالجین سے تفصیلی معائنہ و تشخیص',
                descEnglish: 'Detailed evaluation by senior MBBS physician consultants',
              },
              {
                step: 'Step 4',
                titleUrdu: 'مخصوص دوا و تھراپی',
                titleEnglish: 'Therapy & Medication',
                descUrdu: 'خالص ہربل فارمولہ ادویات یا فزیوتھراپی سیشنز',
                descEnglish: 'Targeted natural formulations and physical rehab sessions',
              },
              {
                step: 'Step 5',
                titleUrdu: 'مکمل شفایابی',
                titleEnglish: 'Complete Recovery',
                descUrdu: 'فالو اپ چیک اپ اور تندرستی کا سفر',
                descEnglish: 'Follow-up checks, diet plans, and wellness tracking',
              },
            ].map((st, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/10 text-center space-y-2 backdrop-blur-sm">
                <span className="inline-block px-2.5 py-0.5 bg-amber-400 text-emerald-950 text-[10px] font-black rounded-full">
                  {st.step}
                </span>
                <div className="font-bold text-sm text-white">{isUrdu ? st.titleUrdu : st.titleEnglish}</div>
                <div className="text-[11px] text-emerald-100 leading-tight">{isUrdu ? st.descUrdu : st.descEnglish}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Checkmarks */}
        <div className="mt-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
          <h4 className="text-xl font-bold text-slate-900 mb-6 text-center">
            {isUrdu ? 'ہماری خصوصی وجوہات (Why Choose Us)' : 'Why Choose Hafiz Clinic'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold text-slate-800">
            {(isUrdu
              ? [
                  '✓ جدید کمپیوٹرائزڈ آئی ٹیسٹ اور ڈائیگنوسس',
                  '✓ 15+ سالہ تجربہ کار MBBS ڈاکٹرز',
                  '✓ خواتین و مردوں کے لیے الگ پردے دار ماحول',
                  '✓ مناسب فیس اور غریب مریضوں کے لیے رعایت',
                  '✓ فزیوتھراپی، لیزر و اسٹیم تھراپی یونٹ',
                  '✓ ہزاروں مطمئن مریضوں کی گواہی',
                  '✓ پاکستان سمیت دنیا بھر میں ہوم ڈیلیوری',
                  '✓ 100% خالص ہربل و سائنسی ادویات',
                  '✓ روزانہ صبح 8:00 سے رات 8:00 تک او پی ڈی',
                ]
              : [
                  '✓ Advanced Computerized Health Diagnostics',
                  '✓ Experienced 15+ Years MBBS Physicians',
                  '✓ Dedicated Private Wings for Male & Female Patients',
                  '✓ Affordable Consultation & Needy Patient Waivers',
                  '✓ Modern Physical Therapy & Laser Rehab Unit',
                  '✓ Thousands of Verified Satisfied Patients',
                  '✓ Nationwide & Worldwide Herbal Home Delivery',
                  '✓ 100% Organic & Scientifically Tested Products',
                  '✓ OPD Hours: 8:00 AM to 8:00 PM Daily',
                ]
            ).map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
