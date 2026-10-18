import React from 'react';
import { ClinicSettings, YouTubeChannel } from '../types';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  Navigation,
  Youtube,
  Radio,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

interface FooterProps {
  settings: ClinicSettings;
  setActiveView: (view: string) => void;
  onOpenAppointment: () => void;
  language?: 'urdu' | 'english';
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActiveView,
  onOpenAppointment,
  language = 'english',
}) => {
  const isUrdu = language === 'urdu';
  const primaryPhone = settings.phone1 || '03450457087';
  const cleanPhone = (settings.phone1 || '03450457087').replace(/[^0-9+]/g, '');
  const displayPhone = '0345-0457087';
  const whatsappNum = (settings.whatsappNumber || '923450457087').replace(/[^0-9]/g, '');

  const googleMapsDirectionsUrl =
    settings.googleMapsUrl ||
    'https://www.google.com/maps?q=32.04806537151092,72.92899862887525';

  const defaultYoutubeChannels: YouTubeChannel[] = [
    {
      id: 'yt-1',
      name: 'Guldasta-e-Sagheer',
      nameUrdu: 'گلدستہ صغیر',
      handle: '@guldasta-e-sagheer',
      url: 'https://youtube.com/@guldasta-e-sagheer?si=1GV-sLdp9Kv9Zfd0',
      descriptionUrdu: 'ہربل ہیلتھ، گھریلو نسخہ جات، طب نبوی اور ہوم ریمیڈیز رہنمائی',
      descriptionEnglish: 'Herbal Health, Natural Home Remedies & Prophetic Medicine Advice',
    },
    {
      id: 'yt-2',
      name: 'Love 1s Life',
      nameUrdu: 'لو ونز لائف',
      handle: '@love1slife',
      url: 'https://youtube.com/@love1slife?si=csaMQh87B2awoDii',
      descriptionUrdu: 'صحت مند لائف اسٹائل، روزمرہ عادات اور فٹنس رہنمائی',
      descriptionEnglish: 'Healthy Lifestyle, Fitness & Daily Wellness Guidance',
    },
    {
      id: 'yt-3',
      name: 'Good P Live',
      nameUrdu: 'گڈ پی لائیو',
      handle: '@goodplive',
      url: 'https://youtube.com/@goodplive?si=O_OeWKZpMHKOTIem',
      descriptionUrdu: 'لائیو طبی معلوماتی نشریات اور کلینیکل کونسلنگ',
      descriptionEnglish: 'Live Clinical Consultations & Health Broadcasting',
    },
  ];

  const youtubeChannels =
    settings.youtubeChannels && settings.youtubeChannels.length >= 3
      ? settings.youtubeChannels
      : defaultYoutubeChannels;

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Top 4-Column Clinical & Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {isUrdu ? settings.clinicNameUrdu : settings.clinicNameEnglish}
                </h3>
                <p className="text-xs text-emerald-400 font-bold">
                  {isUrdu ? settings.clinicNameEnglish : settings.clinicNameUrdu}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isUrdu
                ? 'پنجاب ہیلتھ کیئر کمیشن سے باقاعدہ منظور شدہ کلینک۔ 15+ سالہ تجربہ کار MBBS معالجین، جدید فزیوتھراپی، کمپیوٹر چیک اپ، اور ہربل مصنوعات کی پاکستان اور دنیا بھر میں ہوم ڈیلیوری۔'
                : 'Approved by Punjab Healthcare Commission (PHC). Managed by experienced MBBS physicians providing computerized diagnosis, laboratory diagnostics, and nationwide home delivery.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PHC Reg: {settings.phcApprovalNo || settings.punjabHealthRegNo || 'PHC-REG-849201'}</span>
            </div>

            {/* Direct Helpline Badge */}
            <div className="pt-1">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-mono font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all"
              >
                <Phone className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{isUrdu ? 'ہیلپ لائن:' : 'Helpline:'} {primaryPhone}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'اہم صفحہ جات' : 'Quick Site Navigation'}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'ہوم (Home Overview)' : 'Home Overview'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('diseases')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'تمام 40+ بیماریاں و علاج' : 'All 40+ Medical Conditions'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('eyecare')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'آئی کیئر و کمپیوٹرائزڈ چشمے' : 'Eye Care & Computer Glasses'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('hairoil')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'ہوراب ہیئر آئل (Hoorab Hair Oil)' : 'Hoorab Herbal Hair Oil'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('beautycream')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'ہوراب بیوٹی کریم (Beauty Cream)' : 'Hoorab Radiance Beauty Cream'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('services')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'کلینک سروسز (Clinical Services)' : 'Clinical Services'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('patient-dashboard')}
                  className="hover:text-emerald-400 transition-colors text-amber-300 font-bold cursor-pointer text-left"
                >
                  • {isUrdu ? 'مریض پورٹل و ڈیش بورڈ' : 'Patient Portal & Dashboard'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('lab-reports')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  • {isUrdu ? 'آن لائن لیب رپورٹس و QR تصدیق' : 'Lab Reports & QR Verification'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Timings */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'اوقات کار، پتہ و فون' : 'Hours, Location & Phone'}
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">
                    {isUrdu ? 'او پی ڈی ٹائمنگ:' : 'OPD Timings:'}
                  </strong>
                  <span>{isUrdu ? settings.timingUrdu : settings.timingEnglish || '8:00 AM - 8:00 PM (Daily)'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">
                    {isUrdu ? 'کلینک کا پتہ:' : 'Clinic Physical Address:'}
                  </strong>
                  <span>{isUrdu ? settings.addressUrdu : settings.addressEnglish}</span>
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline mt-1 font-semibold"
                  >
                    <span>{isUrdu ? 'گوگل میپ پر راستہ دیکھیں' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">
                    {isUrdu ? 'کال ہیلپ لائن (Phone):' : 'Call Helpline:'}
                  </strong>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-mono text-emerald-300 hover:text-white font-bold transition-colors"
                  >
                    {primaryPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">
                    {isUrdu ? 'واٹس ایپ آرڈر و مشورہ:' : 'WhatsApp Support:'}
                  </strong>
                  <a
                    href={`https://wa.me/${whatsappNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-300 hover:text-white font-bold transition-colors"
                  >
                    0{whatsappNum.replace(/^92/, '')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Action CTAs */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              {isUrdu ? 'فوری رابطہ و بکنگ' : 'Direct Patient Booking'}
            </h4>
            <button
              type="button"
              onClick={onOpenAppointment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all hover:scale-[1.02] cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 text-amber-300" />
              <span>{isUrdu ? 'آن لائن اپائنٹمنٹ لیں' : 'Book Online Appointment'}</span>
            </button>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'واٹس ایپ آرڈر سروس' : 'WhatsApp Express Order'}</span>
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Phone className="w-4 h-4" />
              <span>{isUrdu ? `کال کریں: ${primaryPhone}` : `Call: ${primaryPhone}`}</span>
            </a>
          </div>
        </div>

        {/* Section 2: Official YouTube Channels with Channel Names & Direct Redirection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Youtube className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{isUrdu ? 'ہمارے آفیشل یوٹیوب چینلز' : 'Our Official YouTube Channels'}</span>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Official Media
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'صحت سے متعلق معلوماتی ویڈیوز، ہربل نسخہ جات اور لائیو نشریات دیکھنے کے لیے کلک کریں:'
                    : 'Watch certified medical advice, herbal health guidelines, and clinical broadcasts:'}
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-semibold self-start sm:self-auto">
              {isUrdu ? 'چینل پر جانے کے لیے کارڈ پر کلک کریں' : 'Click to visit and subscribe'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {youtubeChannels.map((channel) => (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-slate-950/80 hover:bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-red-600/60 shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 group-hover:bg-red-600 group-hover:text-white text-red-400 flex items-center justify-center transition-colors">
                      <Youtube className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h5 className="font-black text-white text-sm group-hover:text-red-400 transition-colors">
                        {isUrdu ? channel.nameUrdu || channel.name : channel.name}
                      </h5>
                      <span className="text-[11px] text-slate-400 font-mono font-semibold block">
                        {channel.handle}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors shrink-0" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isUrdu
                    ? channel.descriptionUrdu || 'طبی و معلوماتی ویڈیوز'
                    : channel.descriptionEnglish || 'Health & Clinical Videos'}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-red-400 font-bold group-hover:underline flex items-center gap-1">
                    <span>{isUrdu ? 'یوٹیوب چینل دیکھیں' : 'Visit YouTube Channel'}</span>
                    <span>→</span>
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40 font-bold">
                    YouTube
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Section 3: Interactive Google Maps & Physical Address Location */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{isUrdu ? 'گوگل میپ لوکیشن و کلینک پتہ' : 'Clinic Location & Google Maps Navigation'}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    GPS Coordinates
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'کلینک کا لائیو نقشہ، راستہ اور براہ راست تشریف لانے کی تفصیلات:'
                    : 'Find our physical medical center and navigate directly via GPS:'}
                </p>
              </div>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-105 self-start sm:self-auto cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>{isUrdu ? 'گوگل میپ پر لوکیشن کھولیں' : 'Get Directions in Google Maps'}</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Embedded Google Maps iFrame */}
            <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-950 aspect-[16/9] sm:aspect-[21/9] max-h-80 w-full relative">
              <iframe
                title="Hafiz Clinic Google Maps Location"
                src={
                  settings.googleMapsEmbedUrl ||
                  'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d20504.00514421851!2d72.92899862887525!3d32.04806537151092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDAyJzQ4LjgiTiA3MsKwNTUnNTAuNSJF!5e0!3m2!1sen!2s!4v1792298252624!5m2!1sen!2s'
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full min-h-[260px]"
              />
            </div>

            {/* Address & Fast Navigation Card */}
            <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {isUrdu ? 'مرکزی ایڈریس' : 'Physical Address'}
                </span>
                <p className="text-sm font-bold text-white leading-snug">
                  {isUrdu ? settings.addressUrdu : settings.addressEnglish}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  {isUrdu ? 'جی پی ایس کوآرڈینیٹس' : 'GPS Coordinates'}
                </span>
                <p className="font-mono text-xs text-slate-300 font-bold">
                  32°02'48.8"N 72°55'50.5"E (32.048065, 72.928998)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {isUrdu ? 'براہ راست کال ہیلپ لائن' : 'Direct Call Helpline'}
                </span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-mono text-sm text-emerald-400 hover:text-white font-black block transition-colors"
                >
                  {primaryPhone}
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? 'مکمل راستہ دیکھیں' : 'Turn-by-Turn Navigation'}</span>
                </a>

                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-700/50 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'واٹس ایپ لوکیشن مانگیں' : 'Request WhatsApp Live Pin'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-900 text-center text-slate-500 text-[11px] space-y-2">
          <p>
            {isUrdu
              ? 'طبی انتباہ: اس ویب سائٹ پر موجود تمام معلومات آگاہی کے لیے ہیں۔ کسی بھی دوا کے استعمال سے قبل اپنے MBBS معالج سے مشورہ ضروری ہے۔'
              : 'Medical Disclaimer: Information on this site is provided for educational and clinical awareness purposes only. Please consult a qualified MBBS physician before commencing treatments.'}
          </p>
          <div className="flex justify-center items-center gap-4 text-slate-400 font-bold text-[11px] flex-wrap">
            <span>{isUrdu ? 'پرائیویسی پالیسی' : 'Privacy Policy'}</span>
            <span>•</span>
            <span>{isUrdu ? 'شرائط و ضوابط' : 'Terms of Service'}</span>
            <span>•</span>
            <span>{isUrdu ? 'طبی ڈسکلیمر' : 'Clinical Disclaimer'}</span>
            <span>•</span>
            <span>{isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ' : 'PHC Accredited'}</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">{primaryPhone}</span>
          </div>
          <p className="text-slate-600 pt-2">
            © 2026 {isUrdu ? settings.clinicNameUrdu : settings.clinicNameEnglish}. All rights reserved. Designed for Production Deployment.
          </p>
        </div>
      </div>
    </footer>
  );
};
