import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, MessageCircle, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroSliderProps {
  onOpenAppointment: () => void;
  onSelectCategory?: (category: string) => void;
  language?: 'urdu' | 'english';
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onOpenAppointment, language = 'english' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isUrdu = language === 'urdu';

  const slides = [
    {
      id: 1,
      badgeUrdu: 'پرانی سے پرانی بیماریوں کا شافی علاج',
      badgeEnglish: 'Effective Treatment for Chronic & Persistent Conditions',
      titleUrdu: 'دوائی کھائیں صرف 2 دن!',
      titleEnglish: 'Specialized 2-Day Treatment Regimen',
      subtitleUrdu: 'حافظ کلینک گوجرانوالہ / لاہور — پنجاب ہیلتھ کیئر کمیشن سے منظور شدہ',
      subtitleEnglish: 'Hafiz Clinic Gujranwala / Lahore — PHC Approved Healthcare Center',
      descriptionUrdu: 'جوڑوں، کمر اور گھٹنوں کے درد، اعصابی کمزوری، فالج، لقوہ، گردے کی پتھری، اور معدہ کی تیزابیت کا جدید کمپیوٹرائزڈ چیک اپ اور شفابخش علاج۔',
      descriptionEnglish: 'Advanced computerized diagnosis and effective recovery therapies for joint pain, sciatica, paralysis, kidney stones, neurological weakness, and gastric disorders.',
      bgImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600',
      ctaTextUrdu: 'آن لائن اپائنٹمنٹ لیں',
      ctaTextEnglish: 'Book Online Appointment',
      phoneTextUrdu: 'ابھی کال کریں',
      phoneTextEnglish: 'Call Doctor Now',
    },
    {
      id: 2,
      badgeUrdu: 'جدید سائنسی و ہربل علاج',
      badgeEnglish: 'Modern Medical Diagnosis & Natural Therapies',
      titleUrdu: 'کیا آپ پرانی بیماری سے شدید پریشان ہیں؟',
      titleEnglish: 'Struggling with Chronic Health Issues?',
      subtitleUrdu: 'ڈاکٹر زیشان چوہدری (MBBS) • ڈاکٹر وقاص صغیر چوہدری (MBBS)',
      subtitleEnglish: 'Dr. Zeeshan Chaudhry (MBBS) • Dr. Waqas Sagheer Chaudhry (MBBS)',
      descriptionUrdu: 'کمپیوٹر ڈائیگنوسس مشین سے فوری تشخیصی معائنہ، لیبارٹری ٹیسٹ، اور خواتین و مردوں کا بالکل الگ پردے دار علاج۔',
      descriptionEnglish: 'Painless computerized body diagnostics, full laboratory tests, and dedicated separate privacy wings for male and female patients.',
      bgImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600',
      ctaTextUrdu: 'ڈاکٹر سے مشورہ کریں',
      ctaTextEnglish: 'Consult Doctor Now',
      phoneTextUrdu: 'واٹس ایپ پر رابطہ',
      phoneTextEnglish: 'WhatsApp Chat',
    },
    {
      id: 3,
      badgeUrdu: 'خالص قدرتی پروڈکٹس اور بینائی سینٹر',
      badgeEnglish: 'Pure Herbal Products & Eye Vision Center',
      titleUrdu: 'ہوراب ہیئر آئل، بیوٹی کریم، آئی کیئر اور عطر پرفیومز',
      titleEnglish: 'Hoorab Hair Oil, Beauty Cream, Eye Care & Fragrances',
      subtitleUrdu: 'پاکستان سمیت دنیا بھر میں محفوظ ہوم ڈیلیوری دستیاب',
      subtitleEnglish: 'Worldwide Safe Home Delivery Service Available',
      descriptionUrdu: 'بال گرنا بند کریں، چہرے کی چھائیاں ختم کریں، اور بینائی کی حفاظت کے لیے جدید کمپیوٹرائزڈ چشمے اور پریمیم عطر آن لائن آرڈر کریں۔',
      descriptionEnglish: 'Stop hair loss, restore skin radiance, protect your eyesight with computerized anti-glare glasses, and order authentic herbal products.',
      bgImage: 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=1600',
      ctaTextUrdu: 'آن لائن اسٹور دیکھیں',
      ctaTextEnglish: 'Explore Online Store',
      phoneTextUrdu: 'ہوم ڈیلیوری آرڈر',
      phoneTextEnglish: 'Order Home Delivery',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden min-h-[480px] sm:min-h-[540px] flex items-center">
      {/* Background Images with Overlay */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.bgImage}
            alt={isUrdu ? slide.titleUrdu : slide.titleEnglish}
            className="w-full h-full object-cover opacity-35 transform scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-slate-950/85 to-teal-950/70" />
        </div>
      ))}

      {/* Main Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3.5 py-1.5 rounded-full font-black text-xs md:text-sm shadow-lg shadow-amber-500/20 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>{isUrdu ? activeSlide.badgeUrdu : activeSlide.badgeEnglish}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-sans">
            {isUrdu ? activeSlide.titleUrdu : activeSlide.titleEnglish}
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-300 font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{isUrdu ? activeSlide.subtitleUrdu : activeSlide.subtitleEnglish}</span>
          </p>

          {/* Description */}
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl bg-slate-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            {isUrdu ? activeSlide.descriptionUrdu : activeSlide.descriptionEnglish}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAppointment}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span>{isUrdu ? activeSlide.ctaTextUrdu : activeSlide.ctaTextEnglish}</span>
            </button>

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 hover:text-white font-bold px-5 py-3.5 rounded-xl text-sm border border-emerald-500/40 transition-all hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>{isUrdu ? 'واٹس ایپ چیٹ' : 'WhatsApp Chat'}</span>
            </a>

            <a
              href="tel:+923001234567"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3.5 rounded-xl text-sm shadow-md transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              <span>{isUrdu ? 'کال کریں: 0300-1234567' : 'Call: 0300-1234567'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/70 text-white hover:bg-emerald-600 transition-colors border border-white/20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/70 text-white hover:bg-emerald-600 transition-colors border border-white/20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === currentSlide ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
