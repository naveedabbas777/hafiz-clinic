import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, ShoppingCart, User, ShieldCheck, FileText, Menu, X, Globe, Stethoscope, Lock } from 'lucide-react';
import { ClinicSettings } from '../types';

interface HeaderProps {
  settings: ClinicSettings;
  cartCount: number;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAppointment: () => void;
  onOpenCart: () => void;
  language: 'urdu' | 'english';
  setLanguage: (lang: 'urdu' | 'english') => void;
  currentUser?: any;
  onLogout?: () => void;
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', labelUrdu: 'ہوم', labelEnglish: 'Home' },
    { id: 'clinic', labelUrdu: 'کلینک', labelEnglish: 'Clinic' },
    { id: 'services', labelUrdu: 'سروسز', labelEnglish: 'Services' },
    { id: 'diseases', labelUrdu: 'بیماریاں', labelEnglish: 'Diseases' },
    { id: 'eyecare', labelUrdu: 'آئی کیئر (چشمے)', labelEnglish: 'Eye Care' },
    { id: 'hairoil', labelUrdu: 'ہیئر آئل', labelEnglish: 'Hair Oil' },
    { id: 'beautycream', labelUrdu: 'بیوٹی کریم', labelEnglish: 'Beauty Care' },
    { id: 'perfumes', labelUrdu: 'پرفیوم کلیکشن', labelEnglish: 'Perfumes' },
    { id: 'physio', labelUrdu: 'فزیوتھراپی', labelEnglish: 'Physiotherapy' },
    { id: 'lab-reports', labelUrdu: 'لیب رپورٹس', labelEnglish: 'Lab Reports' },
    { id: 'delivery', labelUrdu: 'ہوم ڈیلیوری', labelEnglish: 'Delivery' },
    { id: 'store', labelUrdu: 'آن لائن اسٹور', labelEnglish: 'Store' },
    { id: 'patient-portal', labelUrdu: 'مریض پورٹل', labelEnglish: 'Patient Portal' },
    { id: 'doctor-portal', labelUrdu: 'ڈاکٹر پورٹل', labelEnglish: 'Doctor Panel' },
    { id: 'gallery', labelUrdu: 'گیلری', labelEnglish: 'Gallery' },
    { id: 'faq', labelUrdu: 'سوالات', labelEnglish: 'FAQ' },
    { id: 'articles', labelUrdu: 'بلاگ', labelEnglish: 'Blog' },
    { id: 'contact', labelUrdu: 'رابطہ', labelEnglish: 'Contact' },
    { id: 'legal', labelUrdu: 'قوانین و پالیسی', labelEnglish: 'Legal' },
    { id: 'seo', labelUrdu: 'SEO', labelEnglish: 'SEO' },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-emerald-100">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 text-white py-2 px-4 text-xs md:text-sm" dir="ltr">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Left / Accreditation */}
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-bold text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'urdu' ? 'پنجاب ہیلتھ کیئر کمیشن سے منظور شدہ' : 'PHC Approved Clinic'}
            </span>
            <span className="hidden sm:inline text-emerald-200">|</span>
            <span className="hidden sm:inline text-emerald-100 text-xs">
              {settings.taglineUrdu}
            </span>
          </div>

          {/* Right Contact Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.phone1}`}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors bg-emerald-800/60 px-2.5 py-1 rounded text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{settings.phone1}</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-300 hover:text-white bg-emerald-700/80 px-2.5 py-1 rounded text-xs font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>
            <button
              onClick={() => setLanguage(language === 'urdu' ? 'english' : 'urdu')}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-xs text-amber-200 border border-amber-300/30"
            >
              <Globe className="w-3 h-3" />
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight font-sans">
                {settings.clinicNameUrdu}
              </h1>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {settings.clinicNameEnglish}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              ڈاکٹر زیشان چوہدری (MBBS) • ڈاکٹر وقاص صغیر (MBBS)
            </p>
          </div>
        </div>

        {/* Action Buttons Header Right */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3.5 py-2 rounded-lg font-bold text-xs border border-emerald-200 transition-colors"
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
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'urdu' ? 'آن لائن اپائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
          </button>

          {/* User Portals Quick Menu */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
            <button
              onClick={() => setActiveView('doctor-portal')}
              title="Official Doctor Portal"
              className="px-2.5 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-700 transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>{language === 'urdu' ? 'معالج پورٹل' : 'Doctor Portal'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <button
                  onClick={() => setActiveView('patient-portal')}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-950 hover:underline"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentUser.name || currentUser.username}</span>
                </button>
                <button
                  onClick={() => { if (onLogout) onLogout(); }}
                  className="text-[10px] font-bold text-red-600 hover:underline bg-red-100 px-1.5 py-0.5 rounded"
                  title="Logout"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('patient-portal')}
                title="Patient Portal"
                className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded-lg text-xs flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="text-[11px] font-medium hidden sm:inline">{language === 'urdu' ? 'مریض لاگ ان' : 'Patient Login'}</span>
              </button>
            )}
            <button
              onClick={() => setActiveView('admin')}
              title="Admin Panel"
              className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded-lg text-xs flex items-center gap-1"
            >
              <Lock className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">{language === 'urdu' ? 'ایڈمن' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenCart}
            className="relative p-2 bg-emerald-100 text-emerald-900 rounded-lg"
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
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
                  className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
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
              onClick={() => setActiveView('doctor-portal')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-xs flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'urdu' ? 'ڈاکٹر پینل' : 'Doctor Portal'}</span>
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              <span>اپائنٹمنٹ بک کریں</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-right py-2 px-3 rounded text-xs font-semibold ${
                  activeView === link.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {language === 'urdu' ? link.labelUrdu : link.labelEnglish}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between gap-2 text-xs">
            <button
              onClick={() => handleNavClick('patient-portal')}
              className="flex-1 bg-slate-800 py-2 rounded text-center text-emerald-300"
            >
              {language === 'urdu' ? 'مریض پورٹل' : 'Patient Portal'}
            </button>
            <button
              onClick={() => handleNavClick('doctor-portal')}
              className="flex-1 bg-slate-800 py-2 rounded text-center text-amber-300"
            >
              {language === 'urdu' ? 'ڈاکٹر پینل' : 'Doctor Portal'}
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="flex-1 bg-slate-800 py-2 rounded text-center text-slate-300"
            >
              {language === 'urdu' ? 'ایڈمن پینل' : 'Admin Panel'}
            </button>
          </div>

          <button
            onClick={() => setLanguage(language === 'urdu' ? 'english' : 'urdu')}
            className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-center text-amber-200 border border-amber-300/30 flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'urdu' ? 'English (تبدیل کریں)' : 'اردو (Switch to Urdu)'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
