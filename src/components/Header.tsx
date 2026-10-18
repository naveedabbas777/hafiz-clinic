import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Calendar,
  ShoppingCart,
  User,
  ShieldCheck,
  FileText,
  Menu,
  X,
  Globe,
  Stethoscope,
  Lock,
  Layers,
  Bed,
  Heart,
  Activity,
  Radio,
  ChevronDown,
  Sparkles,
  KeyRound,
  Youtube,
} from 'lucide-react';
import { ClinicSettings, StaffUser } from '../types';

interface HeaderProps {
  settings: ClinicSettings;
  cartCount: number;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAppointment: () => void;
  onOpenCart: () => void;
  language: 'urdu' | 'english';
  setLanguage: (lang: 'urdu' | 'english') => void;
  currentUser?: StaffUser | any;
  onLogout?: () => void;
  onLogin?: (user: StaffUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  activeView,
  setActiveView,
  onOpenAppointment,
  onOpenCart,
  language,
  setLanguage,
  currentUser,
  onLogout,
  onLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStaffMenuDropdownOpen, setIsStaffMenuDropdownOpen] = useState(false);
  const [isYouTubeMenuOpen, setIsYouTubeMenuOpen] = useState(false);

  const officialYouTubeChannels = [
    {
      id: 'yt-1',
      name: 'Guldasta-e-Sagheer',
      nameUrdu: 'گلدستہ صغیر',
      handle: '@guldasta-e-sagheer',
      url: 'https://youtube.com/@guldasta-e-sagheer?si=1GV-sLdp9Kv9Zfd0',
    },
    {
      id: 'yt-2',
      name: 'Love 1s Life',
      nameUrdu: 'لو ونز لائف',
      handle: '@love1slife',
      url: 'https://youtube.com/@love1slife?si=csaMQh87B2awoDii',
    },
    {
      id: 'yt-3',
      name: 'Good P Live',
      nameUrdu: 'گڈ پی لائیو',
      handle: '@goodplive',
      url: 'https://youtube.com/@goodplive?si=O_OeWKZpMHKOTIem',
    },
  ];

  const navLinks = [
    { id: 'home', labelUrdu: 'ہوم', labelEnglish: 'Home' },
    { id: 'clinic', labelUrdu: 'کلینک', labelEnglish: 'Clinic' },
    { id: 'services', labelUrdu: 'سروسز', labelEnglish: 'Services' },
    { id: 'diseases', labelUrdu: 'بیماریاں', labelEnglish: 'Diseases' },
    { id: 'eyecare', labelUrdu: 'آئی کیئر (چشمے)', labelEnglish: 'Eye Care' },
    { id: 'hairoil', labelUrdu: 'ہیئر آئل', labelEnglish: 'Hair Oil' },
    { id: 'beautycream', labelUrdu: 'بیوٹی کریم', labelEnglish: 'Beauty Care' },
    { id: 'physio', labelUrdu: 'فزیوتھراپی', labelEnglish: 'Physiotherapy' },
    { id: 'lab-reports', labelUrdu: 'لیب رپورٹس', labelEnglish: 'Lab Reports' },
    { id: 'store', labelUrdu: 'آن لائن اسٹور', labelEnglish: 'Store' },
    { id: 'patient-dashboard', labelUrdu: '🏥 مریض ڈیش بورڈ', labelEnglish: '🏥 Patient Dashboard' },
    { id: 'patient-portal', labelUrdu: 'مریض پورٹل', labelEnglish: 'Patient Portal' },
    { id: 'staff-portals', labelUrdu: '🏥 عملہ و شعبہ جاتی پورٹلز', labelEnglish: '🏥 Staff Hub' },
    { id: 'gallery', labelUrdu: 'گیلری', labelEnglish: 'Gallery' },
    { id: 'faq', labelUrdu: 'سوالات', labelEnglish: 'FAQ' },
    { id: 'articles', labelUrdu: 'بلاگ', labelEnglish: 'Blog' },
    { id: 'contact', labelUrdu: 'رابطہ', labelEnglish: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setMobileMenuOpen(false);
    setIsStaffMenuDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-emerald-100">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white py-2 px-4 text-xs md:text-sm" dir="ltr">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Left / Official Accreditation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold tracking-tight">
              {language === 'urdu' ? 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ سنٹر' : 'PHC Accredited Healthcare System'}
            </span>
            <span aria-hidden="true" className="text-emerald-500">·</span>
            <span className="text-emerald-300 font-mono text-[11px]">
              {settings.punjabHealthRegNo || 'PHC-REG-849201'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-emerald-500">·</span>
            <span className="hidden sm:inline text-emerald-200 text-xs">
              {settings.taglineUrdu}
            </span>
          </div>

          {/* Right Contact Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <a
              href={`tel:${(settings.phone1 || '03450457087').replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors bg-emerald-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
              title="Call Helpline: 03450457087"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>0345-0457087</span>
            </a>
            <a
              href={`https://wa.me/${(settings.whatsappNumber || '923450457087').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-300 hover:text-white bg-emerald-700/80 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>

            {/* YouTube Channels Multi-Link Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsYouTubeMenuOpen(!isYouTubeMenuOpen)}
                className="hidden sm:flex items-center gap-1.5 text-red-200 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-700/60 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Official YouTube Channels"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>YouTube (3)</span>
                <ChevronDown className="w-3 h-3 text-red-300" />
              </button>

              {isYouTubeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsYouTubeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-red-800/80 rounded-xl shadow-2xl p-2 z-50 space-y-1.5 text-slate-100">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                      <span>{language === 'urdu' ? 'آفیشل یوٹیوب چینلز' : 'Official YouTube Channels'}</span>
                      <span className="text-[9px] bg-red-600/30 text-red-300 px-1.5 py-0.5 rounded font-mono">3 Channels</span>
                    </div>
                    {officialYouTubeChannels.map((ch) => (
                      <a
                        key={ch.id}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsYouTubeMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-red-950/60 hover:border-red-700/50 border border-transparent transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Youtube className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white group-hover:text-red-300 truncate">
                            {language === 'urdu' ? ch.nameUrdu : ch.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{ch.handle}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setLanguage(language === 'urdu' ? 'english' : 'urdu')}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-xs text-amber-200 border border-amber-300/30 font-bold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'urdu' ? 'English' : 'اردو'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Controls Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand Name */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight font-sans">
                {settings.clinicNameUrdu}
              </h1>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline">
                {settings.clinicNameEnglish}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium font-urdu">
              ڈاکٹر زیشان چوہدری (MBBS) • ڈاکٹر وقاص صغیر (MBBS) • مستند سپیشلسٹ میڈیکل سٹاف
            </p>
          </div>
        </div>

        {/* Action Buttons Header Right */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3.5 py-2 rounded-xl font-bold text-xs border border-emerald-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>{language === 'urdu' ? 'کارٹ' : 'Cart'}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAppointment}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'urdu' ? 'آن لائن اپائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
          </button>

          {/* Single Unified Staff Hub Button */}
          <div className="relative flex items-center">
            <button
              onClick={() => setActiveView('staff-portals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                activeView === 'staff-portals'
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300'
              }`}
              title="Hospital Staff Master Hub"
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>{language === 'urdu' ? 'اسٹاف ہب (Staff Hub)' : 'Staff Hub'}</span>
            </button>
          </div>

          {/* User Status / Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <button
                  onClick={() => {
                    if (currentUser.role === 'nurse') setActiveView('nursing-station');
                    else if (currentUser.role === 'pharmacist') setActiveView('pharmacy-pos');
                    else if (currentUser.role === 'ipd_incharge') setActiveView('ipd-ward');
                    else if (currentUser.role === 'lab_doctor') setActiveView('pathology-lab');
                    else if (currentUser.role === 'doctor') setActiveView('doctor-portal');
                    else if (currentUser.role === 'patient') setActiveView('patient-dashboard');
                    else setActiveView('admin');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentUser.name || currentUser.username}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded font-mono font-bold">
                    {currentUser.role}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                  }}
                  className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100 px-2 py-0.5 rounded-lg"
                  title="Logout"
                >
                  لاگ آؤٹ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('patient-portal')}
                title="Patient Portal"
                className="p-2 text-gray-700 hover:text-emerald-700 hover:bg-gray-100 rounded-xl text-xs flex items-center gap-1 font-semibold"
              >
                <User className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">{language === 'urdu' ? 'مریض لاگ ان' : 'Patient Login'}</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('admin')}
              title="Admin Control"
              className="p-2 text-gray-700 hover:text-emerald-700 hover:bg-gray-100 rounded-xl text-xs flex items-center gap-1 font-semibold"
            >
              <Lock className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">{language === 'urdu' ? 'ایڈمن' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenCart}
            className="relative p-2 bg-emerald-100 text-emerald-900 rounded-xl"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="hidden lg:block bg-slate-900 text-slate-100 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-bold overflow-x-auto">
          <div className="flex items-center space-x-1 space-x-reverse py-1.5">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-200 hover:text-emerald-300'
                  }`}
                >
                  {language === 'urdu' ? link.labelUrdu : link.labelEnglish}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 py-1.5 border-r border-slate-800 pr-3">
            <button
              onClick={() => setActiveView('staff-portals')}
              className="px-3 py-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-90 text-white rounded-xl border border-emerald-500/40 text-xs flex items-center gap-1.5 shadow"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'urdu' ? 'پورٹلز سینٹر (8 شعبہ جات)' : '8 Portals Hub'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white border-t border-slate-800 px-4 py-4 space-y-3">
          <div>
            <button
              onClick={() => {
                onOpenAppointment();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>اپائنٹمنٹ بک کریں</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-right py-2 px-3 rounded-xl text-xs font-semibold ${
                  activeView === link.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {language === 'urdu' ? link.labelUrdu : link.labelEnglish}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('staff-portals')}
              className="w-full bg-emerald-700 hover:bg-emerald-600 py-2.5 rounded-xl text-center text-white font-bold flex items-center justify-center gap-2 shadow"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>{language === 'urdu' ? 'اسٹاف ہب (Staff Hub) — تمام شعبہ جات' : 'Staff Hub — Departmental Gateway'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('patient-dashboard')}
              className="bg-emerald-800 text-white py-2.5 rounded-xl text-center font-bold flex items-center justify-center gap-1"
            >
              <span>{language === 'urdu' ? 'مریض ڈیش بورڈ' : 'Patient Dashboard'}</span>
            </button>
            <button
              onClick={() => handleNavClick('patient-portal')}
              className="bg-slate-800 py-2.5 rounded-xl text-center text-emerald-300 font-bold"
            >
              {language === 'urdu' ? 'مریض پورٹل' : 'Patient Portal'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('admin')}
              className="bg-slate-800 py-2.5 rounded-xl text-center text-slate-300 font-bold"
            >
              {language === 'urdu' ? 'ایڈمن پینل' : 'Admin Panel'}
            </button>
          </div>

          {/* Mobile Contact Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <a
              href={`tel:${(settings.phone1 || '03450457087').replace(/[^0-9+]/g, '')}`}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-mono font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>0345-0457087</span>
            </a>
            <a
              href={`https://wa.me/${(settings.whatsappNumber || '923450457087').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="bg-teal-800 hover:bg-teal-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp Order</span>
            </a>
          </div>

          {/* Mobile YouTube Official Channels */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-red-400 px-1">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-4 h-4 fill-current text-red-500" />
                <span>{language === 'urdu' ? 'ہمارے آفیشل یوٹیوب چینلز' : 'Official YouTube Channels'}</span>
              </span>
              <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40 font-bold">
                Subscribe
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {officialYouTubeChannels.map((ch) => (
                <a
                  key={ch.id}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700/80 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                      <Youtube className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {language === 'urdu' ? ch.nameUrdu : ch.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{ch.handle}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-red-400">Visit →</span>
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={() => setLanguage(language === 'urdu' ? 'english' : 'urdu')}
            className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-center text-amber-200 border border-amber-300/30 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'urdu' ? 'English (تبدیل کریں)' : 'اردو (Switch to Urdu)'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
