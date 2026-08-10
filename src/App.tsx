import React, { useState, useEffect } from 'react';
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
import { getAppointmentsApi, createAppointmentApi, updateAppointmentApi } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { AboutSection } from './components/AboutSection';
import { DoctorsSection } from './components/DoctorsSection';
import { DiseasesGrid } from './components/DiseasesGrid';
import { DiseaseDetailModal } from './components/DiseaseDetailModal';
import { ComputerCheckupSection } from './components/ComputerCheckupSection';
import { EyeCareView } from './components/EyeCareView';
import { HairOilView } from './components/HairOilView';
import { BeautyCreamView } from './components/BeautyCreamView';
import { PerfumesView } from './components/PerfumesView';
import { PhysiotherapyView } from './components/PhysiotherapyView';
import { HomeDeliveryView } from './components/HomeDeliveryView';
import { StoreView } from './components/StoreView';
import { AppointmentModal } from './components/AppointmentModal';
import { PatientPortalView } from './components/PatientPortalView';
import { DoctorPortalView } from './components/DoctorPortalView';
import { AdminPanel } from './components/AdminPanel';
import { FAQSection } from './components/FAQSection';
import { BlogSection } from './components/BlogSection';
import { ServicesView } from './components/ServicesView';
import { LabReportsView } from './components/LabReportsView';
import { LegalPagesView } from './components/LegalPagesView';
import { SeoToolsView } from './components/SeoToolsView';

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
  const [settings, setSettings] = useState<ClinicSettings>(initialClinicSettings);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [diseases, setDiseases] = useState<Disease[]>(initialDiseases);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [articles, setArticles] = useState<HealthArticle[]>(initialArticles);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // SEO Dynamic Title Update
  useEffect(() => {
    const titles: Record<string, { ur: string; en: string }> = {
      home: {
        ur: 'حافظ کلینک — ہربل ہیلتھ، کمپیوٹرائزڈ آئی ٹیسٹ و فزیوتھراپی',
        en: 'Hafiz Clinic — Herbal Health, Computerized Eye Test & Physiotherapy',
      },
      diseases: {
        ur: 'بیماریاں اور جدید علاج | حافظ کلینک',
        en: 'Diseases & Advanced Herbal Treatments | Hafiz Clinic',
      },
      eyecare: {
        ur: 'حافظ ویژن سینٹر — آنکھوں کا کمپیوٹرائزڈ معائنہ',
        en: 'Hafiz Vision Center — Computerized Eye Scan & Eyewear',
      },
      store: {
        ur: 'آن لائن ہربل اسٹور — ہوراب ہیئر آئل و نیچرل پروڈکٹس',
        en: 'Online Herbal Store — Horab Hair Oil & Natural Remedies',
      },
      articles: {
        ur: 'صحت کے مضامین اور طبی رہنمائی | حافظ کلینک بلاگ',
        en: 'Health Articles & Medical Guides | Hafiz Clinic Blog',
      },
      appointment: {
        ur: 'آن لائن اپائنٹمنٹ بکنگ | حافظ کلینک',
        en: 'Book Online Doctor Appointment | Hafiz Clinic',
      },
      faq: {
        ur: 'عام معلومات اور سوالات (FAQ) | حافظ کلینک',
        en: 'Frequently Asked Questions & Info | Hafiz Clinic',
      },
      contact: {
        ur: 'رابطہ کریں اور پتا | حافظ کلینک لاہور',
        en: 'Contact Us & Clinic Location | Hafiz Clinic Lahore',
      },
      seotools: {
        ur: 'SEO اسکیما و میٹا مینجر | حافظ کلینک',
        en: 'SEO Schema, Meta & Sitemap Center | Hafiz Clinic',
      },
    };

    const currentTitle = titles[activeView]
      ? language === 'urdu'
        ? titles[activeView].ur
        : titles[activeView].en
      : 'Hafiz Clinic & Vision Center';

    document.title = `${currentTitle} | Hafiz Clinic`;
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
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    await updateAppointmentApi(id, { status });
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
      {/* Header */}
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
      />

      {/* Main Body Routing */}
      <main>
        {activeView === 'home' && (
          <>
            <HeroSlider
              language={language}
              onOpenAppointment={() => handleOpenAppointment()}
              onSelectCategory={(cat) => setActiveView('diseases')}
            />
            <AboutSection language={language} />
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
            <AboutSection language={language} />
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
            onAddToCart={handleAddToCart}
            onOpenAppointment={handleOpenAppointment}
            language={language}
          />
        )}

        {activeView === 'hairoil' && (
          <HairOilView product={hairOilProduct} onAddToCart={handleAddToCart} language={language} />
        )}

        {activeView === 'beautycream' && (
          <BeautyCreamView product={beautyCreamProduct} onAddToCart={handleAddToCart} language={language} />
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
          <div className="py-16 bg-white max-w-4xl mx-auto px-4 space-y-8">
            <h2 className="text-3xl font-black text-center">
              {isUrdu ? 'رابطہ فارم اور پتہ (Contact & Location)' : 'Contact Us & Clinic Location'}
            </h2>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 space-y-3 text-sm">
              <div><strong>{isUrdu ? 'پتہ:' : 'Address:'}</strong> {isUrdu ? settings.addressUrdu : settings.addressEnglish}</div>
              <div><strong>{isUrdu ? 'فون نمبرز:' : 'Phone Numbers:'}</strong> {settings.phone1} / {settings.phone2}</div>
              <div><strong>{isUrdu ? 'واٹس ایپ:' : 'WhatsApp:'}</strong> {settings.whatsappNumber}</div>
              <div><strong>{isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن منظور شدہ:' : 'Punjab Healthcare Commission Reg No:'}</strong> {settings.phcApprovalNo}</div>
            </div>
          </div>
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

        {activeView === 'doctor-portal' && <DoctorPortalView appointments={appointments} doctors={doctors} language={language} />}

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
            onUpdateSettings={setSettings}
            onAddProduct={(p) => setProducts([p, ...products])}
            onDeleteProduct={(id) => setProducts(products.filter((p) => p.id !== id))}
            onAddDoctor={(d) => setDoctors([d, ...doctors])}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={(id) => setDoctors(doctors.filter((d) => d.id !== id))}
            onAddDisease={(dis) => setDiseases([dis, ...diseases])}
            onDeleteDisease={(id) => setDiseases(diseases.filter((dis) => dis.id !== id))}
            onAddArticle={handleAddArticle}
            onDeleteArticle={handleDeleteArticle}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            language={language}
            setLanguage={setLanguage}
          />
        )}
      </main>

      {/* Disease Detail Modal */}
      <DiseaseDetailModal
        disease={selectedDisease}
        onClose={() => setSelectedDisease(null)}
        onOpenAppointment={handleOpenAppointment}
        language={language}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        preselectedDoctor={appointmentDoc}
        preselectedDisease={appointmentProblem}
        currentUser={currentUser}
        language={language}
        onAddAppointment={handleAddAppointment}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveView={setActiveView}
        onOpenAppointment={() => handleOpenAppointment()}
        language={language}
      />
    </div>
  );
}
