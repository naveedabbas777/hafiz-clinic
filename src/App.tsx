import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  initialClinicSettings,
  initialDoctors,
  initialDiseases,
  initialProducts,
  initialAppointments,
  initialOrders,
  initialFAQs,
  initialGallery,
  initialArticles,
} from './data/initialData';
import { Disease, Product, OrderItem, Doctor, Appointment, Order, ClinicSettings, HealthArticle } from './types';
import { getAppointmentsApi, createAppointmentApi, updateAppointmentApi, deleteProductApi, deleteDoctorApi, deleteDiseaseApi } from './services/api';
import { createAutoInvoiceFromAppointment } from './services/billingService';
import { Phone, MessageCircle, MapPin, Youtube, ExternalLink, Navigation, Clock, ShieldCheck } from 'lucide-react';

// Immediate critical-path components for fast initial FCP/LCP
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { AboutSection } from './components/AboutSection';
import { DoctorsSection } from './components/DoctorsSection';
import { DiseasesGrid } from './components/DiseasesGrid';
import { DiseaseDetailModal } from './components/DiseaseDetailModal';
import { ComputerCheckupSection } from './components/ComputerCheckupSection';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StaffUser } from './types';

// Lazy-loaded heavy dashboard, ERP suite & auxiliary views
const EyeCareView = lazy(() => import('./components/EyeCareView').then((m) => ({ default: m.EyeCareView })));
const HairOilView = lazy(() => import('./components/HairOilView').then((m) => ({ default: m.HairOilView })));
const BeautyCreamView = lazy(() => import('./components/BeautyCreamView').then((m) => ({ default: m.BeautyCreamView })));
const PerfumesView = lazy(() => import('./components/PerfumesView').then((m) => ({ default: m.PerfumesView })));
const PhysiotherapyView = lazy(() => import('./components/PhysiotherapyView').then((m) => ({ default: m.PhysiotherapyView })));
const HomeDeliveryView = lazy(() => import('./components/HomeDeliveryView').then((m) => ({ default: m.HomeDeliveryView })));
const StoreView = lazy(() => import('./components/StoreView').then((m) => ({ default: m.StoreView })));
const AppointmentModal = lazy(() => import('./components/AppointmentModal').then((m) => ({ default: m.AppointmentModal })));
const PatientPortalView = lazy(() => import('./components/PatientPortalView').then((m) => ({ default: m.PatientPortalView })));
const PatientDashboardView = lazy(() => import('./components/PatientDashboardView').then((m) => ({ default: m.PatientDashboardView })));
const DoctorPortalView = lazy(() => import('./components/DoctorPortalView').then((m) => ({ default: m.DoctorPortalView })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const FAQSection = lazy(() => import('./components/FAQSection').then((m) => ({ default: m.FAQSection })));
const BlogSection = lazy(() => import('./components/BlogSection').then((m) => ({ default: m.BlogSection })));
const ServicesView = lazy(() => import('./components/ServicesView').then((m) => ({ default: m.ServicesView })));
const LabReportsView = lazy(() => import('./components/LabReportsView').then((m) => ({ default: m.LabReportsView })));
const LegalPagesView = lazy(() => import('./components/LegalPagesView').then((m) => ({ default: m.LegalPagesView })));
const SeoToolsView = lazy(() => import('./components/SeoToolsView').then((m) => ({ default: m.SeoToolsView })));
const SmartPharmacyPosView = lazy(() => import('./components/SmartPharmacyPosView').then((m) => ({ default: m.SmartPharmacyPosView })));
const PathologyLabView = lazy(() => import('./components/PathologyLabView').then((m) => ({ default: m.PathologyLabView })));
const ShiftAccountsView = lazy(() => import('./components/ShiftAccountsView').then((m) => ({ default: m.ShiftAccountsView })));
const OpdQueueScreenView = lazy(() => import('./components/OpdQueueScreenView').then((m) => ({ default: m.OpdQueueScreenView })));
const IpdWardManagementView = lazy(() => import('./components/IpdWardManagementView').then((m) => ({ default: m.IpdWardManagementView })));
const StaffPortalGateway = lazy(() => import('./components/StaffPortalGateway').then((m) => ({ default: m.StaffPortalGateway })));
const NursingCarePortalView = lazy(() => import('./components/NursingCarePortalView').then((m) => ({ default: m.NursingCarePortalView })));

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [language, setLanguage] = useState<'urdu' | 'english'>(() => {
    const saved = localStorage.getItem('hafiz_clinic_lang');
    return (saved === 'urdu' || saved === 'english') ? saved : 'english';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('hafiz_clinic_lang', language);
  }, [language]);

  // Dynamic States
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hafiz_clinic_settings_v4') || localStorage.getItem('hafiz_clinic_settings_v3');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...initialClinicSettings,
            ...parsed,
            phone1: '03450457087',
            phone2: '03450457087',
            whatsappNumber: '923450457087',
            googleMapsUrl: initialClinicSettings.googleMapsUrl,
            googleMapsEmbedUrl: initialClinicSettings.googleMapsEmbedUrl,
            youtubeChannels: initialClinicSettings.youtubeChannels,
          };
        } catch {
          // fallback to initialClinicSettings
        }
      }
    }
    return initialClinicSettings;
  });

  const handleUpdateSettings = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hafiz_clinic_settings_v4', JSON.stringify(newSettings));
      } catch {
        // ignore quota errors
      }
    }
  };
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [diseases, setDiseases] = useState<Disease[]>(initialDiseases);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [articles, setArticles] = useState<HealthArticle[]>(initialArticles);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Comprehensive SEO Dynamic Meta Manager (applet-seo standard)
  useEffect(() => {
    const metaMap: Record<string, { titleUr: string; titleEn: string; descUr: string; descEn: string }> = {
      home: {
        titleUr: 'حافظ کلینک — ہربل ہیلتھ، کمپیوٹرائزڈ آئی ٹیسٹ و فزیوتھراپی',
        titleEn: 'Hafiz Clinic — Herbal Health, Computerized Eye Test & Physiotherapy',
        descUr: 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ کلینک۔ ڈاکٹر زیشان و ڈاکٹر وقاص۔ جدید او پی ڈی، آنکھوں کا معائنہ، پیتھالوجی اور فارمیسی۔',
        descEn: 'Punjab Healthcare Commission accredited healthcare center offering computerized eye tests, OPD doctor consultations, digital pharmacy, and pathology.',
      },
      services: {
        titleUr: 'طبی خدمات اور سپیشلٹیز | حافظ کلینک',
        titleEn: 'Clinical Services & Specialized Departments | Hafiz Clinic',
        descUr: 'جامع او پی ڈی، کمپیوٹرائزڈ آئی ویژن، پیتھالوجی لیب، الٹراساؤنڈ اور فزیوتھراپی کی مکمل تفصیلات۔',
        descEn: 'Comprehensive OPD consultations, optical diagnostics, pathology blood laboratory, diagnostic ultrasound, and physical therapy.',
      },
      diseases: {
        titleUr: 'بیماریاں اور جدید علاج | حافظ کلینک',
        titleEn: 'Diseases & Advanced Herbal Treatments | Hafiz Clinic',
        descUr: 'جوڑوں کا درد، معدہ و جگر کے مسائل، شوگر اور دائمی امراض کا مستند اور جدید طریقہ علاج۔',
        descEn: 'Evidence-based clinical treatments for arthritis, joint pain, gastrointestinal health, diabetes, and chronic ailments.',
      },
      eyecare: {
        titleUr: 'حافظ ویژن سینٹر — آنکھوں کا کمپیوٹرائزڈ معائنہ و چشمہ جات',
        titleEn: 'Hafiz Vision Center — Computerized Optical Diagnostics & Eyewear',
        descUr: 'جدید آٹو ریفریکشن، بلیو کٹ اینٹی ریفلیکٹو لینز اور بینائی کے مسائل کا تسلی بخش معائنہ۔',
        descEn: 'Advanced computerized auto-refraction, anti-reflective blue-cut ophthalmic lenses, and certified optometrist consultations.',
      },
      store: {
        titleUr: 'آن لائن ہربل اسٹور — ہوراب ہیئر آئل و قدرتی ادویات',
        titleEn: 'Online Pharmacy & Natural Remedies | Hafiz Clinic',
        descUr: 'خالص ہوراب ہربل ہیئر آئل، بیوٹی پروڈکٹس، جوڑوں کے درد کا تیل اور ادویات کی کیش آن ڈلیوری۔',
        descEn: 'Certified natural herbal formulations, joint pain oils, organic skincare, and rapid home delivery across Pakistan.',
      },
      articles: {
        titleUr: 'طبی معلوماتی مضامین و رہنمائی | حافظ کلینک میڈیکل بلاگ',
        titleEn: 'Health Articles & Medical Research | Hafiz Clinic Blog',
        descUr: 'ڈاکٹرز کے تصدیق شدہ طبی مضامین، غذائی تجاویز اور روزمرہ صحت سے متعلق مفید مشورے۔',
        descEn: 'Physician-reviewed medical articles, clinical dietary guidelines, and proactive preventive health advice.',
      },
      appointment: {
        titleUr: 'آن لائن ڈاکٹر اپائنٹمنٹ بکنگ | حافظ کلینک',
        titleEn: 'Book Doctor Appointment Online | Hafiz Clinic',
        descUr: 'ڈاکٹر زیشان چوہدری اور ڈاکٹر وقاص صغیر سے آن لائن یا کلینک معائنے کا وقت حاصل کریں۔',
        descEn: 'Schedule in-person or telemedicine appointments with senior physicians and certified healthcare specialists.',
      },
      'patient-dashboard': {
        titleUr: 'مریض ڈیش بورڈ — اپائنٹمنٹس، لیب رپورٹس و وائٹلز | حافظ کلینک',
        titleEn: 'Patient Portal & Digital Health Records | Hafiz Clinic',
        descUr: 'اپنا مکمل میڈیکل ریکارڈ، ڈیجیٹل نسخہ جات، پیتھالوجی رپورٹس اور 30 روزہ وائٹلز ٹرینڈز دیکھیں۔',
        descEn: 'Access verified electronic health records, downloadable PDF lab reports, prescription tokens, and 30-day vitals trends.',
      },
      'doctor-portal': {
        titleUr: 'ڈاکٹر او پی ڈی کنسلٹیشن و ڈیجیٹل پریسکرپشن سسٹم | حافظ کلینک',
        titleEn: 'Doctor OPD Consultation & Digital Rx Suite | Hafiz Clinic',
        descUr: 'ڈاکٹرز کے لیے لائیو مریض کیو، الیکٹرانک ہیلتھ ریکارڈ، ادویات کا خودکار نسخہ اور لیب ٹیسٹ آرڈرز۔',
        descEn: 'Clinical OPD workspace featuring queue telemetry, electronic prescription builder, diagnosis intelligence, and lab orders.',
      },
      'pharmacy-pos': {
        titleUr: 'اسمارٹ فارمیسی POS و انوینٹری پریڈکشن | حافظ کلینک',
        titleEn: 'Smart Pharmacy POS & Inventory Prediction | Hafiz Clinic',
        descUr: 'بارکوڈ و کیمرہ کیو آر اسکینر، 30 روزہ کھپت کا الگورتھم، خودکار ری آرڈر تاریخ اور فوری بلنگ۔',
        descEn: 'Real-time pharmacy point of sale featuring live camera QR scanning, 30-day usage velocity forecasting, and restock alerts.',
      },
      'pathology-lab': {
        titleUr: 'پیتھالوجی و تشخیصی لیبارٹری سنٹر | حافظ کلینک',
        titleEn: 'Pathology & Diagnostic Laboratory Portal | Hafiz Clinic',
        descUr: 'سی بی سی، بلڈ شوگر، لیپڈ پروفائل، ڈیجیٹل ایکسرے اور الٹراساؤنڈ کی تصدیق شدہ رپورٹس۔',
        descEn: 'Comprehensive pathology diagnostic station with QR-authenticated reports, parameter tracking, and automated PDF export.',
      },
      'ipd-ward': {
        titleUr: 'ان پیشنٹ وارڈ و بیڈ مینجمنٹ | حافظ کلینک',
        titleEn: 'Inpatient Ward & Bed Management | Hafiz Clinic',
        descUr: 'داخل مریضوں کی بیڈ ایلوکیشن، ڈاکٹر راؤنڈز، نرسنگ کیئر پلان اور ڈسچارج سمری۔',
        descEn: 'Inpatient bed census, real-time admission tracking, clinical nursing rounds, and electronic discharge documentation.',
      },
      'nursing-portal': {
        titleUr: 'کلینیکل نرسنگ کیئر و وائٹلز مانیٹر | حافظ کلینک',
        titleEn: 'Clinical Nursing Care & 4-Hourly Vitals Station | Hafiz Clinic',
        descUr: 'وارڈ نرسنگ سٹیشن: 4 گھنٹے بعد وائٹلز چارٹنگ، آئی وی ڈرپ اور ادویات کا محفوظ ریکارڈ۔',
        descEn: 'Inpatient nursing care portal tracking 4-hourly vital signs, MAR injections, fluid intake/output, and doctor alert scores.',
      },
      'shift-accounts': {
        titleUr: 'ڈیلی شفٹ اکاؤنٹس و کیشئر آڈٹ | حافظ کلینک',
        titleEn: 'Daily Shift Settlement & Cashier Audit | Hafiz Clinic',
        descUr: 'روزانہ کی او پی ڈی، لیب اور فارمیسی فیسوں کا کمپیوٹرائزڈ حساب کتاب اور شفٹ ہینڈ اوور۔',
        descEn: 'End-of-shift revenue reconciliation, department-wise expense vouchers, and authenticated shift handover audit.',
      },
      'opd-queue': {
        titleUr: 'لائیو او پی ڈی ٹوکن ڈسپلے سکرین | حافظ کلینک',
        titleEn: 'Live OPD Queue & Waiting Area Display | Hafiz Clinic',
        descUr: 'ویٹنگ ایریا کے لیے مریضوں کے ٹوکن نمبرز، موجودہ کال اور ڈاکٹر سٹیٹس کا لائیو ٹی وی ڈسپلے۔',
        descEn: 'High-visibility waiting hall TV display showing real-time patient token announcements, room status, and doctor availability.',
      },
      faq: {
        titleUr: 'عام معلومات اور سوالات (FAQ) | حافظ کلینک',
        titleEn: 'Frequently Asked Questions & Info | Hafiz Clinic',
        descUr: 'کلینک کے اوقات، فیسوں، ہوم ڈلیوری اور ڈاکٹرز کی دستیابی سے متعلق عمومی سوالات کے جوابات۔',
        descEn: 'Answers to frequently asked questions regarding clinic timings, doctor checkup fees, home delivery, and diagnostic procedures.',
      },
      contact: {
        titleUr: 'رابطہ کریں، لوکیشن و ایمرجنسی نمبرز | حافظ کلینک',
        titleEn: 'Contact Us, Emergency Numbers & Location | Hafiz Clinic',
        descUr: 'فون، واٹس ایپ، گوگل میپ لوکیشن اور 24/7 ہیلپ لائن کے ذریعے کلینک انتظامیہ سے رابطہ کریں۔',
        descEn: 'Get in touch with Hafiz Clinic administration via 24/7 telephone, WhatsApp, or Google Maps navigation.',
      },
      seotools: {
        titleUr: 'SEO اسکیما، میٹا ٹیگز و سائٹ میپ مینجر | حافظ کلینک',
        titleEn: 'SEO Schema, Metadata & Sitemap Center | Hafiz Clinic',
        descUr: 'گوگل سرچ رینکنگ، میڈیکل کلینک اسکیما، روبوٹس اور سائٹ میپ کا انتظامی ڈیش بورڈ۔',
        descEn: 'Enterprise search engine optimization center, structured schema audit, XML sitemaps, and robots.txt management.',
      },
    };

    const currentMeta = metaMap[activeView] || metaMap.home;
    const finalTitle = language === 'urdu' ? currentMeta.titleUr : currentMeta.titleEn;
    const finalDesc = language === 'urdu' ? currentMeta.descUr : currentMeta.descEn;

    document.title = `${finalTitle} | Hafiz Clinic`;

    // Dynamically synchronize meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDesc);

    // Dynamically synchronize OpenGraph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDesc);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && typeof window !== 'undefined') {
      ogUrl.setAttribute('content', window.location.origin + window.location.pathname);
    }

    // Twitter Card sync
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', finalTitle);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', finalDesc);
  }, [activeView, language]);

  // Articles CRUD
  const handleAddArticle = (newArt: HealthArticle) => {
    setArticles((prev) => [newArt, ...prev]);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Update doctor
  const handleUpdateDoctor = (updatedDoc: Doctor) => {
    setDoctors(doctors.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  };

  // Modals
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentDoc, setAppointmentDoc] = useState('');
  const [appointmentProblem, setAppointmentProblem] = useState('');

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleClearCart = () => setCart([]);

  const handleOpenAppointment = (docOrProblem?: string) => {
    if (!currentUser) {
      alert(
        language === 'urdu'
          ? 'اپائنٹمنٹ بک کرنے کے لیے لاگ ان کرنا ضروری ہے۔ برائے مہربانی پہلے پیشنٹ پورٹل (Patient Portal) پر لاگ ان یا سائن اپ کریں۔'
          : 'Please log in or register first to book an appointment. Redirecting to Patient Portal.'
      );
      setActiveView('patient-portal');
      return;
    }
    if (docOrProblem) {
      if (docOrProblem.includes('ڈاکٹر') || docOrProblem.toLowerCase().includes('dr.')) {
        setAppointmentDoc(docOrProblem);
      } else {
        setAppointmentProblem(docOrProblem);
      }
    }
    setIsAppointmentOpen(true);
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await getAppointmentsApi();
      if (res.success && res.appointments && res.appointments.length > 0) {
        setAppointments(res.appointments);
      }
    } catch (e) {
      // Keep initial state
    }
  };

  const handleAddAppointment = async (newApp: Appointment) => {
    const seqNum = appointments.length + 1;
    const seqId = `APP-${String(seqNum).padStart(3, '0')}`;
    const appWithSeqId: Appointment = {
      ...newApp,
      id: seqId,
      status: newApp.status || 'Pending',
    };
    setAppointments((prev) => [appWithSeqId, ...prev]);
    await createAppointmentApi(appWithSeqId);
  };

  const handleUpdateAppointmentStatus = async (id: string, status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled') => {
    const targetApp = appointments.find((a) => a.id === id);
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    await updateAppointmentApi(id, { status });
    if (status === 'Approved' && targetApp) {
      createAutoInvoiceFromAppointment({ ...targetApp, status }, doctors).catch(() => {});
    }
  };

  // Dedicated Product Pages references
  const hairOilProduct = products.find((p) => p.id === 'hoorab-hair-oil') || products[0];
  const beautyCreamProduct = products.find((p) => p.id === 'hoorab-beauty-cream') || products[1];
  const eyeProducts = products.filter((p) => p.category === 'eye');
  const perfumeProducts = products.filter((p) => p.category === 'perfume');

  const isUrdu = language === 'urdu';

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Header (Hidden when inside dedicated Doctor Portal or Admin Portal) */}
      {activeView !== 'doctor-portal' && activeView !== 'admin' && (
        <Header
          settings={settings}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAppointment={() => handleOpenAppointment()}
          onOpenCart={() => setActiveView('store')}
          language={language}
          setLanguage={setLanguage}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onLogin={(user) => setCurrentUser(user)}
        />
      )}

      {/* Main Body Routing with System Error Boundary */}
      <main>
        <ErrorBoundary
          isUrdu={language === 'urdu'}
          viewContext={`view-${activeView}`}
          onReset={() => setActiveView('home')}
        >
          <Suspense fallback={<LoadingFallback isUrdu={language === 'urdu'} />}>
          {activeView === 'home' && (
            <>
              <HeroSlider
                language={language}
                onOpenAppointment={() => handleOpenAppointment()}
                onSelectCategory={(cat) => setActiveView('diseases')}
              />
              <AboutSection settings={settings} language={language} />
              <DoctorsSection doctors={doctors} onOpenAppointment={handleOpenAppointment} language={language} />
              <ComputerCheckupSection onOpenAppointment={() => handleOpenAppointment(isUrdu ? 'کمپیوٹر چیک اپ' : 'Computer Checkup')} language={language} />
              <DiseasesGrid
                diseases={diseases}
                onSelectDisease={(d) => setSelectedDisease(d)}
                onOpenAppointment={handleOpenAppointment}
                language={language}
              />
              <BlogSection
                articles={articles}
                language={language}
                onOpenAppointment={(doc) => handleOpenAppointment(doc)}
              />
              <FAQSection faqs={initialFAQs} language={language} />
            </>
          )}

          {activeView === 'clinic' && (
            <>
              <AboutSection settings={settings} language={language} />
              <ComputerCheckupSection onOpenAppointment={() => handleOpenAppointment(isUrdu ? 'کمپیوٹر چیک اپ' : 'Computer Checkup')} language={language} />
              <DoctorsSection doctors={doctors} onOpenAppointment={handleOpenAppointment} language={language} />
            </>
          )}

          {activeView === 'services' && (
            <ServicesView onOpenAppointment={handleOpenAppointment} language={language} />
          )}

          {activeView === 'lab-reports' && (
            <LabReportsView language={language} />
          )}

          {activeView === 'legal' && (
            <LegalPagesView language={language} />
          )}

          {activeView === 'seo' && (
            <SeoToolsView language={language} />
          )}

          {activeView === 'diseases' && (
            <DiseasesGrid
              diseases={diseases}
              onSelectDisease={(d) => setSelectedDisease(d)}
              onOpenAppointment={handleOpenAppointment}
              language={language}
            />
          )}

          {activeView === 'eyecare' && (
            <EyeCareView
              eyeProducts={eyeProducts}
              settings={settings}
              onAddToCart={handleAddToCart}
              onOpenAppointment={handleOpenAppointment}
              language={language}
            />
          )}

          {activeView === 'hairoil' && (
            <HairOilView product={hairOilProduct} settings={settings} onAddToCart={handleAddToCart} language={language} />
          )}

          {activeView === 'beautycream' && (
            <BeautyCreamView product={beautyCreamProduct} settings={settings} onAddToCart={handleAddToCart} language={language} />
          )}

          {activeView === 'perfumes' && (
            <PerfumesView products={perfumeProducts} onAddToCart={handleAddToCart} language={language} />
          )}

          {activeView === 'physio' && (
            <PhysiotherapyView onOpenAppointment={handleOpenAppointment} language={language} />
          )}

          {activeView === 'delivery' && (
            <HomeDeliveryView language={language} />
          )}

          {activeView === 'store' && (
            <StoreView
              products={products}
              cart={cart}
              currentUser={currentUser}
              onLoginSuccess={(user) => setCurrentUser(user)}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onClearCart={handleClearCart}
              language={language}
            />
          )}

          {activeView === 'gallery' && (
            <div className="py-16 bg-white max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-black mb-8 text-center">
                {isUrdu ? 'کلینک کی تصویریں اور گیلری (Photo Gallery)' : 'Clinic Photo Gallery'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {initialGallery.map((g) => (
                  <div key={g.id} className="rounded-2xl overflow-hidden border shadow-sm">
                    <img src={g.image || g.imageUrl} alt={g.titleUrdu} className="w-full h-56 object-cover hover:scale-105 transition-transform" />
                    <div className="p-4 font-bold text-center text-sm">{g.titleUrdu}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'faq' && <FAQSection faqs={initialFAQs} language={language} />}

          {activeView === 'articles' && (
            <BlogSection
              articles={articles}
              language={language}
              onOpenAppointment={(doc) => handleOpenAppointment(doc)}
            />
          )}

          {activeView === 'contact' && (
            <div className="py-12 bg-slate-50 min-h-screen">
              <div className="max-w-5xl mx-auto px-4 space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {isUrdu ? 'براہ راست رابطہ و لوکیشن' : 'Direct Helpline & Clinic Location'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                    {isUrdu ? 'حافظ کلینک رابطہ اور گوگل میپ لوکیشن' : 'Contact Us & Clinic GPS Location'}
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                    {isUrdu
                      ? 'مریضوں کی رہنمائی، او پی ڈی معائنے، آن لائن میڈیسن آرڈر اور کلینک تشریف لانے کے لیے ہم سے رابطہ کریں:'
                      : 'Reach our clinical team for OPD appointments, medicine delivery, or turn-by-turn navigation:'}
                  </p>
                </div>

                {/* Primary Contact Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href={`tel:${(settings.phone1 || '03450457087').replace(/[^0-9+]/g, '')}`}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase block">
                        {isUrdu ? 'کال ہیلپ لائن' : 'Call Helpline'}
                      </span>
                      <span className="text-base font-black font-mono text-emerald-950 group-hover:text-emerald-700">
                        {settings.phone1 || '0345-0457087'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {isUrdu ? 'فوری کال ملائیں' : 'Tap to Call'}
                      </span>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${(settings.whatsappNumber || '923450457087').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase block">
                        {isUrdu ? 'واٹس ایپ سروس' : 'WhatsApp Order'}
                      </span>
                      <span className="text-base font-black font-mono text-emerald-950 group-hover:text-emerald-700">
                        0{(settings.whatsappNumber || '923450457087').replace(/^92/, '')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {isUrdu ? 'میسج بھیجیں' : 'Chat on WhatsApp'}
                      </span>
                    </div>
                  </a>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase block">
                        {isUrdu ? 'او پی ڈی ٹائمنگ' : 'OPD Hours'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block">
                        {isUrdu ? settings.timingUrdu : settings.timingEnglish || '8:00 AM - 8:00 PM'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {isUrdu ? 'ہفتے کے تمام 7 دن' : '7 Days a Week'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Maps Embed with Directions Link */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {isUrdu ? 'گوگل میپ لوکیشن و کلینک پتہ' : 'Clinic Location & Navigation'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isUrdu ? settings.addressUrdu : settings.addressEnglish}
                        </p>
                      </div>
                    </div>

                    <a
                      href={settings.googleMapsUrl || 'https://www.google.com/maps?q=32.04806537151092,72.92899862887525'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-all hover:scale-105 self-start sm:self-auto cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-amber-300" />
                      <span>{isUrdu ? 'گوگل میپ پر راستہ کھولیں' : 'Open in Google Maps'}</span>
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner w-full aspect-[16/9] sm:aspect-[21/9] max-h-96">
                    <iframe
                      title="Clinic Google Maps Location Embed"
                      src={settings.googleMapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d20504.00514421851!2d72.92899862887525!3d32.04806537151092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDAyJzQ4LjgiTiA3MsKwNTUnNTAuNSJF!5e0!3m2!1sen!2s!4v1792298252624!5m2!1sen!2s'}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="w-full h-full min-h-[300px]"
                    />
                  </div>
                </div>

                {/* Official YouTube Channels Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow">
                      <Youtube className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {isUrdu ? 'ہمارے آفیشل یوٹیوب چینلز' : 'Our Official YouTube Channels'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isUrdu
                          ? 'مفید طبی معلومات اور گھریلو نسخہ جات کے لیے ہمارے یوٹیوب چینلز وزٹ کریں'
                          : 'Subscribe to our official YouTube channels for authentic health guidance:'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Guldasta-e-Sagheer',
                        nameUrdu: 'گلدستہ صغیر',
                        handle: '@guldasta-e-sagheer',
                        url: 'https://youtube.com/@guldasta-e-sagheer?si=1GV-sLdp9Kv9Zfd0',
                        desc: isUrdu ? 'ہربل ہیلتھ و طب نبوی رہنمائی' : 'Herbal Health & Natural Remedies',
                      },
                      {
                        name: 'Love 1s Life',
                        nameUrdu: 'لو ونز لائف',
                        handle: '@love1slife',
                        url: 'https://youtube.com/@love1slife?si=csaMQh87B2awoDii',
                        desc: isUrdu ? 'صحت مند لائف اسٹائل و فٹنس ٹپس' : 'Healthy Living & Wellness Advice',
                      },
                      {
                        name: 'Good P Live',
                        nameUrdu: 'گڈ پی لائیو',
                        handle: '@goodplive',
                        url: 'https://youtube.com/@goodplive?si=O_OeWKZpMHKOTIem',
                        desc: isUrdu ? 'لائیو طبی نشریات و کلینک اپڈیٹس' : 'Live Health Broadcasts & Updates',
                      },
                    ].map((ch) => (
                      <a
                        key={ch.handle}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-2xl border border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors">
                              <Youtube className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-red-600 text-xs sm:text-sm transition-colors">
                                {isUrdu ? ch.nameUrdu : ch.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-mono font-semibold">
                                {ch.handle}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-600">{ch.desc}</p>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-red-600 font-bold group-hover:underline">
                          <span>{isUrdu ? 'یوٹیوب پر دیکھیں' : 'Watch on YouTube'}</span>
                          <span>→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'patient-dashboard' && (
            <PatientDashboardView
              currentUser={currentUser}
              doctors={doctors}
              appointments={appointments}
              clinicSettings={settings}
              language={language}
              setLanguage={setLanguage}
              onLoginSuccess={(user) => setCurrentUser(user)}
              onLogout={() => setCurrentUser(null)}
              onOpenAppointment={(docPref) => handleOpenAppointment(docPref)}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'patient-portal' && (
            <PatientPortalView
              currentUser={currentUser}
              doctors={doctors}
              appointments={appointments}
              onLoginSuccess={(user) => setCurrentUser(user)}
              onLogout={() => setCurrentUser(null)}
              setActiveView={setActiveView}
              onOpenAppointment={() => handleOpenAppointment()}
              language={language}
              setLanguage={setLanguage}
            />
          )}

          {activeView === 'doctor-portal' && (
            <DoctorPortalView
              appointments={appointments}
              doctors={doctors}
              language={language}
              setActiveView={setActiveView}
              setLanguage={setLanguage}
            />
          )}

          {/* Master Role-Based Staff Portals Gateway */}
          {activeView === 'staff-portals' && (
            <StaffPortalGateway
              currentUser={currentUser}
              language={language}
              onSelectPortal={(portalKey, userToLogin) => {
                if (userToLogin) {
                  setCurrentUser(userToLogin);
                }
                setActiveView(portalKey);
              }}
              onLogout={() => setCurrentUser(null)}
            />
          )}

          {/* Nursing Care Station & 4-Hourly Sheet View */}
          {activeView === 'nursing-station' && (
            <NursingCarePortalView
              currentUser={currentUser}
              language={language}
              onLogin={(user) => setCurrentUser(user)}
              onLogout={() => setCurrentUser(null)}
              clinicSettings={settings}
            />
          )}

          {/* Dedicated ERP Suite Views */}
          {activeView === 'opd-queue' && (
            <OpdQueueScreenView
              doctors={doctors}
              language={language}
              clinicSettings={settings}
              onBackToApp={() => setActiveView('home')}
            />
          )}

          {activeView === 'ipd-ward' && (
            <div className="py-12 bg-slate-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-4">
                <IpdWardManagementView
                  doctors={doctors}
                  language={language}
                  clinicSettings={settings}
                  currentUser={currentUser}
                  onLogin={(user) => setCurrentUser(user)}
                  onLogout={() => setCurrentUser(null)}
                />
              </div>
            </div>
          )}

          {activeView === 'pharmacy-pos' && (
            <div className="py-12 bg-slate-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-4">
                <SmartPharmacyPosView
                  products={products}
                  language={language}
                  clinicSettings={settings}
                  currentUser={currentUser}
                  onLogin={(user) => setCurrentUser(user)}
                  onLogout={() => setCurrentUser(null)}
                />
              </div>
            </div>
          )}

          {activeView === 'pathology-lab' && (
            <div className="py-12 bg-slate-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-4">
                <PathologyLabView
                  language={language}
                  clinicSettings={settings}
                  currentUser={currentUser}
                  onLogin={(user) => setCurrentUser(user)}
                  onLogout={() => setCurrentUser(null)}
                />
              </div>
            </div>
          )}

          {activeView === 'shift-accounts' && (
            <div className="py-12 bg-slate-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-4">
                <ShiftAccountsView
                  doctors={doctors}
                  slips={[]}
                  expenses={[]}
                  language={language}
                  clinicSettings={settings}
                />
              </div>
            </div>
          )}

          {activeView === 'admin' && (
            <AdminPanel
              doctors={doctors}
              diseases={diseases}
              products={products}
              appointments={appointments}
              orders={orders}
              faqs={initialFAQs}
              gallery={initialGallery}
              settings={settings}
              articles={articles}
              onUpdateSettings={handleUpdateSettings}
              onAddProduct={(p) => setProducts([p, ...products])}
              onDeleteProduct={(id) => {
                const target = products.find((p) => p.id === id || (p as any)._id === id);
                deleteProductApi(id, target?.image, target?.videoUrl).catch(() => {});
                setProducts(products.filter((p) => p.id !== id && (p as any)._id !== id));
              }}
              onAddDoctor={(d) => setDoctors([d, ...doctors])}
              onUpdateDoctor={handleUpdateDoctor}
              onDeleteDoctor={(id) => {
                const target = doctors.find((d) => d.id === id || (d as any)._id === id);
                deleteDoctorApi(id, target?.image).catch(() => {});
                setDoctors(doctors.filter((d) => d.id !== id && (d as any)._id !== id));
              }}
              onAddDisease={(dis) => setDiseases([dis, ...diseases])}
              onDeleteDisease={(id) => {
                const target = diseases.find((dis) => dis.id === id || (dis as any)._id === id);
                deleteDiseaseApi(id, target?.image || target?.imageUrl).catch(() => {});
                setDiseases(diseases.filter((dis) => dis.id !== id && (dis as any)._id !== id));
              }}
              onAddArticle={handleAddArticle}
              onDeleteArticle={handleDeleteArticle}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onAddAppointment={handleAddAppointment}
              setActiveView={setActiveView}
              language={language}
              setLanguage={setLanguage}
            />
          )}
        </Suspense>
        </ErrorBoundary>
      </main>

      {/* Disease Detail Modal */}
      <DiseaseDetailModal
        disease={selectedDisease}
        onClose={() => setSelectedDisease(null)}
        onOpenAppointment={handleOpenAppointment}
        language={language}
      />

      {/* Appointment Modal (Lazy Loaded) */}
      {isAppointmentOpen && (
        <Suspense fallback={null}>
          <AppointmentModal
            isOpen={isAppointmentOpen}
            onClose={() => setIsAppointmentOpen(false)}
            preselectedDoctor={appointmentDoc}
            preselectedDisease={appointmentProblem}
            currentUser={currentUser}
            language={language}
            onAddAppointment={handleAddAppointment}
          />
        </Suspense>
      )}

      {/* Footer (Hidden when inside dedicated Doctor Portal, Admin Portal, or Live OPD Queue) */}
      {activeView !== 'doctor-portal' && activeView !== 'admin' && activeView !== 'opd-queue' && (
        <Footer
          settings={settings}
          setActiveView={setActiveView}
          onOpenAppointment={() => handleOpenAppointment()}
          language={language}
        />
      )}
    </div>
  );
}
