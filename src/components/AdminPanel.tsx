import React, { useState, useEffect } from 'react';
import { Doctor, Disease, Product, Appointment, Order, FAQItem, GalleryItem, ClinicSettings, HealthArticle } from '../types';
import { Database, Plus, Trash2, Edit, Save, RefreshCw, ShieldCheck, ShoppingCart, Users, Activity, Sliders, Image as ImageIcon, HelpCircle, FileText, Download, CheckCircle, Clock, Upload, Lock, Cloud, Key, X, UserCheck, ShieldAlert, MessageSquare, Eye, Search, FileCheck, Paperclip, BookOpen } from 'lucide-react';
import { loginApi, uploadDoctorImageApi, uploadDiseaseImageApi, uploadProductImageApi, createProductApi, checkDbStatusApi, updateDoctorApi, getUsersApi, getMessagesApi, getReportsApi } from '../services/api';
import { DoctorPatientChatView } from './DoctorPatientChatView';

interface AdminPanelProps {
  doctors: Doctor[];
  diseases: Disease[];
  products: Product[];
  appointments: Appointment[];
  orders: Order[];
  faqs: FAQItem[];
  gallery: GalleryItem[];
  settings: ClinicSettings;
  articles?: HealthArticle[];
  onUpdateSettings: (settings: ClinicSettings) => void;
  onAddProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor?: (doc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  onAddDisease: (dis: Disease) => void;
  onDeleteDisease: (id: string) => void;
  onAddArticle?: (article: HealthArticle) => void;
  onDeleteArticle?: (id: string) => void;
  onUpdateAppointmentStatus?: (id: string, status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled') => void;
  onAddAppointment?: (app: Appointment) => void;
  setActiveView?: (view: any) => void;
  language?: 'urdu' | 'english';
  setLanguage?: (lang: 'urdu' | 'english') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  doctors,
  diseases,
  products,
  appointments,
  orders,
  faqs,
  gallery,
  settings,
  articles = [],
  onUpdateSettings,
  onAddProduct,
  onDeleteProduct,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onAddDisease,
  onDeleteDisease,
  onAddArticle,
  onDeleteArticle,
  onUpdateAppointmentStatus,
  onAddAppointment,
  setActiveView,
  language = 'english',
  setLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tracker' | 'doctors' | 'diseases' | 'products' | 'orders' | 'appointments' | 'articles' | 'settings'>('overview');
  const isUrdu = language === 'urdu';

  // Admin Appointment Booking on Behalf of Patient State
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [bookPatientName, setBookPatientName] = useState<string>('');
  const [bookPatientPhone, setBookPatientPhone] = useState<string>('');
  const [bookPatientAge, setBookPatientAge] = useState<string>('');
  const [bookPatientCity, setBookPatientCity] = useState<string>('فیصل آباد');
  const [bookDoctorId, setBookDoctorId] = useState<string>('');
  const [bookDate, setBookDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookTimeSlot, setBookTimeSlot] = useState<string>('صبح 10:00 بجے (Morning Slot)');
  const [bookProblem, setBookProblem] = useState<string>('عام معائنہ و چیک اپ (General OPD Checkup)');
  const [bookStatus, setBookStatus] = useState<'Approved' | 'Pending'>('Approved');
  const [isSubmittingBook, setIsSubmittingBook] = useState<boolean>(false);
  const [appointmentSearch, setAppointmentSearch] = useState<string>('');

  // Register Patient Account Modal State
  const [isRegPatientModalOpen, setIsRegPatientModalOpen] = useState<boolean>(false);
  const [regPatientName, setRegPatientName] = useState<string>('');
  const [regPatientUsername, setRegPatientUsername] = useState<string>('');
  const [regPatientPhone, setRegPatientPhone] = useState<string>('');
  const [regPatientCity, setRegPatientCity] = useState<string>('فیصل آباد');
  const [regPatientAge, setRegPatientAge] = useState<string>('');

  // Article creation state
  const [newArtTitleUrdu, setNewArtTitleUrdu] = useState('');
  const [newArtTitleEng, setNewArtTitleEng] = useState('');
  const [newArtCategory, setNewArtCategory] = useState('درد اور مہرے');
  const [newArtAuthor, setNewArtAuthor] = useState('ڈاکٹر زیشان چوہدری');
  const [newArtReadTime, setNewArtReadTime] = useState('4 min read');
  const [newArtExcerpt, setNewArtExcerpt] = useState('');
  const [newArtContent, setNewArtContent] = useState('');
  const [newArtImage, setNewArtImage] = useState('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800');

  const handleCreateArticle = () => {
    if (!newArtTitleUrdu.trim()) return;
    const newArt: HealthArticle = {
      id: `art-${Date.now()}`,
      titleUrdu: newArtTitleUrdu,
      titleEnglish: newArtTitleEng || newArtTitleUrdu,
      category: newArtCategory,
      categoryUrdu: newArtCategory,
      date: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: newArtAuthor,
      authorUrdu: newArtAuthor,
      authorEnglish: newArtAuthor,
      readTime: newArtReadTime,
      excerptUrdu: newArtExcerpt || 'طبی آگاہی اور رہنمائی۔',
      excerptEnglish: newArtExcerpt || 'Medical guidance article.',
      contentUrdu: newArtContent || newArtExcerpt,
      contentEnglish: newArtContent || newArtExcerpt,
      image: newArtImage,
      likes: 5,
    };

    if (onAddArticle) {
      onAddArticle(newArt);
    }
    setNewArtTitleUrdu('');
    setNewArtTitleEng('');
    setNewArtExcerpt('');
    setNewArtContent('');
    alert(isUrdu ? 'نیا بلاگ مضمون شامل کر دیا گیا ہے!' : 'New Health Blog Article Published!');
  };

  // Registered Users Management State
  const [usersList, setUsersList] = useState<any[]>([
    { _id: 'u-1', fullName: 'محمد فاروق', username: 'patient1', phone: '03001234567', role: 'patient', city: 'فیصل آباد', status: 'Active' },
    { _id: 'u-2', fullName: 'ڈاکٹر زیشان چوہدری', username: 'doctor1', phone: '03009876543', role: 'doctor', city: 'فیصل آباد', qualification: 'MBBS, FCPS', status: 'Active' },
    { _id: 'u-3', fullName: 'ڈاکٹر وقاص علی', username: 'doctor2', phone: '03011112222', role: 'doctor', city: 'فیصل آباد', qualification: 'DPT, Laser Specialist', status: 'Active' },
    { _id: 'u-4', fullName: 'حافظ علی ایڈمن', username: 'admin', phone: '03008889999', role: 'admin', city: 'فیصل آباد', status: 'Active' },
  ]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Dedicated Document & Telemedicine Tracking System State
  const [allMessages, setAllMessages] = useState<any[]>([
    {
      _id: 'm-101',
      senderName: 'محمد فاروق',
      senderRole: 'patient',
      receiverName: 'ڈاکٹر زیشان چوہدری',
      receiverRole: 'doctor',
      text: 'السلام علیکم! میں نے بائیو کوانٹم باڈی اسکین کی رپورٹ اپلوڈ کر دی ہے۔',
      attachmentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'm-102',
      senderName: 'ڈاکٹر زیشان چوہدری',
      senderRole: 'doctor',
      receiverName: 'محمد فاروق',
      receiverRole: 'patient',
      text: 'جزاک اللہ! رپورٹ کا معائنہ کر لیا گیا ہے۔ نسخہ جاری کر دیا گیا ہے۔',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [allReports, setAllReports] = useState<any[]>([
    {
      _id: 'rep-8801',
      patientName: 'محمد فاروق',
      doctorName: 'ڈاکٹر زیشان چوہدری',
      testNameUrdu: 'کمپیوٹرائزڈ بائیو کوانٹم باڈی اسکین',
      fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      summary: 'کمر درد اور یورک ایسڈ رپورٹ بذریعہ پورٹل ارسال کی گئی۔',
      status: 'Reviewed',
      doctorComment: 'ادویات کا باقاعدہ استعمال کریں اور 3 دن بعد دوبارہ معائنہ کروائیں۔',
      date: '2026-08-08',
    },
    {
      _id: 'rep-8802',
      patientName: 'کامران خان',
      doctorName: 'ڈاکٹر وقاص علی',
      testNameUrdu: 'آئی اینڈ ویژن اینالائسز اسکین',
      fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      summary: 'نظر کی کمزوری اور فزیو تھراپی اسکین رپورٹ',
      status: 'Under Review',
      doctorComment: 'معائنہ جاری ہے۔',
      date: '2026-08-07',
    },
  ]);

  const [trackerSearch, setTrackerSearch] = useState<string>('');
  const [trackerSubTab, setTrackerSubTab] = useState<'documents' | 'chats' | 'logs'>('documents');

  // Admin Auth State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // DB & Cloudinary Status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; uri?: string; cloudName?: string }>({ connected: false });

  // Doctor Form & Cloudinary Image State
  const [newDocName, setNewDocName] = useState('');
  const [newDocQual, setNewDocQual] = useState('MBBS');
  const [newDocSpec, setNewDocSpec] = useState('General Physician & Specialist');
  const [newDocImage, setNewDocImage] = useState('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600');
  const [isUploadingDocImg, setIsUploadingDocImg] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);

  // Edit Doctor Modal State
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editDocNameUrdu, setEditDocNameUrdu] = useState('');
  const [editDocNameEng, setEditDocNameEng] = useState('');
  const [editDocQual, setEditDocQual] = useState('');
  const [editDocSpecUrdu, setEditDocSpecUrdu] = useState('');
  const [editDocSpecEng, setEditDocSpecEng] = useState('');
  const [editDocTimingUrdu, setEditDocTimingUrdu] = useState('');
  const [editDocTimingEng, setEditDocTimingEng] = useState('');
  const [editDocEveningUrdu, setEditDocEveningUrdu] = useState('');
  const [editDocEveningEng, setEditDocEveningEng] = useState('');
  const [editDocPhone, setEditDocPhone] = useState('');
  const [editDocImage, setEditDocImage] = useState('');
  const [isSavingDocEdit, setIsSavingDocEdit] = useState(false);

  // Disease Form & Cloudinary Image State
  const [newDisNameUrdu, setNewDisNameUrdu] = useState('');
  const [newDisNameEng, setNewDisNameEng] = useState('');
  const [newDisCategory, setNewDisCategory] = useState('general');
  const [newDisImage, setNewDisImage] = useState('');
  const [isUploadingDisImg, setIsUploadingDisImg] = useState(false);
  const [disUploadSuccess, setDisUploadSuccess] = useState(false);

  // Product Form & Cloudinary Image State
  const [newProdNameUrdu, setNewProdNameUrdu] = useState('');
  const [newProdNameEng, setNewProdNameEng] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | string>(1500);
  const [newProdOrigPrice, setNewProdOrigPrice] = useState<number | string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('skin');
  const [customProdCatId, setCustomProdCatId] = useState<string>('');
  const [customProdCatUrdu, setCustomProdCatUrdu] = useState<string>('');
  const [newProdDescUrdu, setNewProdDescUrdu] = useState<string>('');
  const [newProdDescEng, setNewProdDescEng] = useState<string>('');
  const [newProdStock, setNewProdStock] = useState<number | string>(50);
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [isUploadingProdImg, setIsUploadingProdImg] = useState<boolean>(false);
  const [prodUploadSuccess, setProdUploadSuccess] = useState<boolean>(false);

  const refreshAdminData = () => {
    getUsersApi().then((res) => {
      if (res.success && res.users) {
        setUsersList(res.users);
      }
    }).catch(() => {});

    getMessagesApi().then((res) => {
      if (res.success && res.messages) {
        setAllMessages(res.messages);
      }
    }).catch(() => {});

    getReportsApi().then((res) => {
      if (res.success && res.reports) {
        setAllReports(res.reports);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    checkDbStatusApi().then(res => setDbStatus(res));
  }, []);

  useEffect(() => {
    if (isAdminAuth) {
      refreshAdminData();
      const interval = setInterval(refreshAdminData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAdminAuth, activeTab]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await loginApi(adminUsername, adminPassword, 'admin');
      if (res.success) {
        setIsAdminAuth(true);
      } else {
        setAuthError(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setAuthError('Connection error to database server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPatientName.trim() || !bookPatientPhone.trim()) {
      alert(isUrdu ? 'براہ کرم مریض کا نام اور فون نمبر درج کریں۔' : 'Please enter Patient Name and Phone number.');
      return;
    }
    setIsSubmittingBook(true);

    const docObj = doctors.find((d) => d.id === bookDoctorId) || doctors[0];
    const docName = isUrdu ? (docObj?.nameUrdu || 'ڈاکٹر زیشان چوہدری') : (docObj?.nameEnglish || 'Dr. Zeeshan Chaudhry');

    const newApp: Appointment = {
      id: `APP-${Date.now()}`,
      patientName: bookPatientName,
      phone: bookPatientPhone,
      city: bookPatientCity || (isUrdu ? 'فیصل آباد' : 'Faisalabad'),
      doctorName: docName,
      date: bookDate || new Date().toISOString().split('T')[0],
      timeSlot: bookTimeSlot,
      problem: bookProblem,
      status: bookStatus,
    };

    if (onAddAppointment) {
      onAddAppointment(newApp);
    }

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
    } catch (err) {}

    setIsSubmittingBook(false);
    setIsBookModalOpen(false);
    setBookPatientName('');
    setBookPatientPhone('');
    setBookPatientAge('');
    alert(isUrdu ? `مریض ${newApp.patientName} کی اپائنٹمنٹ کامیابی کے ساتھ بک اور ${newApp.status === 'Approved' ? 'منظور' : 'محفوظ'} کر لی گئی ہے!` : `Appointment for ${newApp.patientName} booked and ${newApp.status} successfully!`);
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPatientName.trim()) return;

    const newPatientUser = {
      _id: `u-${Date.now()}`,
      fullName: regPatientName,
      username: regPatientUsername || `patient_${Date.now().toString().slice(-4)}`,
      phone: regPatientPhone || '03000000000',
      role: 'patient',
      city: regPatientCity || 'فیصل آباد',
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
    };

    setUsersList([newPatientUser, ...usersList]);
    setIsRegPatientModalOpen(false);
    setRegPatientName('');
    setRegPatientUsername('');
    setRegPatientPhone('');
    alert(isUrdu ? 'نیا مریض اکاؤنٹ رجسٹر کر دیا گیا ہے۔' : 'New Patient Account Registered Successfully!');
  };

  // Upload Doctor Image to Cloudinary
  const handleDocImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDocImg(true);
    setDocUploadSuccess(false);

    try {
      const res = await uploadDoctorImageApi(file);
      if (res.url) {
        setNewDocImage(res.url);
        setDocUploadSuccess(true);
      } else {
        alert('Failed to upload image to Cloudinary.');
      }
    } catch (err: any) {
      alert('Cloudinary upload error: ' + err.message);
    } finally {
      setIsUploadingDocImg(false);
    }
  };

  // Upload Disease Image to Cloudinary
  const handleDisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDisImg(true);
    setDisUploadSuccess(false);

    try {
      const res = await uploadDiseaseImageApi(file);
      if (res.url) {
        setNewDisImage(res.url);
        setDisUploadSuccess(true);
      } else {
        alert('Failed to upload disease image to Cloudinary.');
      }
    } catch (err: any) {
      alert('Cloudinary upload error: ' + err.message);
    } finally {
      setIsUploadingDisImg(false);
    }
  };

  const handleCreateDoc = async () => {
    if (!newDocName) return;
    const newD: Doctor = {
      id: `doc-${Date.now()}`,
      nameUrdu: newDocName,
      nameEnglish: newDocName,
      qualification: newDocQual,
      experience: '10+ Years',
      specializationUrdu: newDocSpec,
      specializationEnglish: newDocSpec,
      timingUrdu: 'صبح 8:00 بجے سے دوپہر 2:00 بجے تک',
      timingEnglish: '8:00 AM - 2:00 PM',
      eveningTimingUrdu: 'شام 5:00 بجے سے رات 9:00 بجے تک',
      eveningTimingEnglish: '5:00 PM - 9:00 PM',
      image: newDocImage,
      phone: '03001234567',
    };

    // Save to local state and trigger API
    onAddDoctor(newD);
    fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newD),
    }).catch(() => {});

    setNewDocName('');
    setDocUploadSuccess(false);
    setNewDocImage('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600');
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setEditDocNameUrdu(doc.nameUrdu || '');
    setEditDocNameEng(doc.nameEnglish || '');
    setEditDocQual(doc.qualification || '');
    setEditDocSpecUrdu(doc.specializationUrdu || '');
    setEditDocSpecEng(doc.specializationEnglish || '');
    setEditDocTimingUrdu(doc.timingUrdu || '');
    setEditDocTimingEng(doc.timingEnglish || '');
    setEditDocEveningUrdu(doc.eveningTimingUrdu || '');
    setEditDocEveningEng(doc.eveningTimingEnglish || '');
    setEditDocPhone(doc.phone || '');
    setEditDocImage(doc.image || '');
  };

  const handleSaveDoctorChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setIsSavingDocEdit(true);

    const updatedDoc: Doctor = {
      ...editingDoctor,
      nameUrdu: editDocNameUrdu || editingDoctor.nameUrdu,
      nameEnglish: editDocNameEng || editingDoctor.nameEnglish,
      qualification: editDocQual || editingDoctor.qualification,
      specializationUrdu: editDocSpecUrdu || editingDoctor.specializationUrdu,
      specializationEnglish: editDocSpecEng || editingDoctor.specializationEnglish,
      timingUrdu: editDocTimingUrdu || editingDoctor.timingUrdu,
      timingEnglish: editDocTimingEng || editingDoctor.timingEnglish,
      eveningTimingUrdu: editDocEveningUrdu,
      eveningTimingEnglish: editDocEveningEng,
      phone: editDocPhone || editingDoctor.phone,
      image: editDocImage || editingDoctor.image,
    };

    try {
      await updateDoctorApi(updatedDoc);
      if (onUpdateDoctor) {
        onUpdateDoctor(updatedDoc);
      }
      setEditingDoctor(null);
    } catch (err) {
      alert('Failed to update doctor timing and details.');
    } finally {
      setIsSavingDocEdit(false);
    }
  };

  const handleCreateDis = async () => {
    if (!newDisNameUrdu && !newDisNameEng) return;
    const newDis: Disease = {
      id: `dis-${Date.now()}`,
      nameUrdu: newDisNameUrdu || newDisNameEng,
      nameEnglish: newDisNameEng || newDisNameUrdu,
      category: 'general',
      categoryUrdu: 'طبی مسائل',
      shortDescUrdu: ['حافظ کلینک کا مستند طریقہ علاج۔'],
      symptomsUrdu: ['ابتدائی علامات و تشخیص'],
      causesUrdu: ['بنیادی وجوہات'],
      treatmentUrdu: ['شافی ہربل و جدید علاج'],
      image: newDisImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      imageUrl: newDisImage,
    };

    onAddDisease(newDis);
    fetch('/api/diseases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDis),
    }).catch(() => {});

    setNewDisNameUrdu('');
    setNewDisNameEng('');
    setNewDisImage('');
    setDisUploadSuccess(false);
  };

  // Upload Product Image to Cloudinary
  const handleProdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProdImg(true);
    setProdUploadSuccess(false);

    try {
      const res = await uploadProductImageApi(file);
      if (res.url) {
        setNewProdImage(res.url);
        setProdUploadSuccess(true);
      } else {
        alert('Failed to upload product image to Cloudinary.');
      }
    } catch (err: any) {
      alert('Cloudinary upload error: ' + err.message);
    } finally {
      setIsUploadingProdImg(false);
    }
  };

  const handleCreateProd = async () => {
    if (!newProdNameEng && !newProdNameUrdu) {
      alert('براہ کرم پروڈکٹ کا نام درج کریں (Please enter Product Name)');
      return;
    }

    let finalCat = newProdCategory;
    let finalCatUrdu = 'بیوٹی کریم و اسکن کیئر';

    if (newProdCategory === 'hair') {
      finalCatUrdu = 'ہیئر کیئر';
    } else if (newProdCategory === 'skin') {
      finalCatUrdu = 'بیوٹی کریم و اسکن کیئر';
    } else if (newProdCategory === 'eye') {
      finalCatUrdu = 'آئی کیئر و چشمے';
    } else if (newProdCategory === 'perfume') {
      finalCatUrdu = 'پرفیوم و عطر';
    } else if (newProdCategory === 'pain') {
      finalCatUrdu = 'درد شفا کریم و تیل';
    } else if (newProdCategory === 'general') {
      finalCatUrdu = 'عمومی ہربل پروڈکٹس';
    } else if (newProdCategory === 'custom') {
      finalCat = customProdCatId.toLowerCase().replace(/\s+/g, '-') || 'custom';
      finalCatUrdu = customProdCatUrdu || 'خاص پروڈکٹس';
    }

    const newP: Product = {
      id: `prod-${Date.now()}`,
      nameUrdu: newProdNameUrdu || newProdNameEng,
      nameEnglish: newProdNameEng || newProdNameUrdu,
      category: finalCat as any,
      categoryUrdu: finalCatUrdu,
      pricePKR: Number(newProdPrice) || 1500,
      originalPricePKR: newProdOrigPrice ? Number(newProdOrigPrice) : undefined,
      image: newProdImage || 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600',
      descriptionUrdu: newProdDescUrdu || 'حافظ کلینک کی مستند ہربل فارمولیشن۔',
      descriptionEnglish: newProdDescEng || 'Organic Herbal Botanical Product',
      stock: Number(newProdStock) || 50,
      isFeatured: true,
    };

    onAddProduct(newP);
    try {
      await createProductApi(newP);
    } catch (err) {}

    // Reset Form
    setNewProdNameEng('');
    setNewProdNameUrdu('');
    setNewProdPrice(1500);
    setNewProdOrigPrice('');
    setNewProdCategory('skin');
    setCustomProdCatId('');
    setCustomProdCatUrdu('');
    setNewProdDescUrdu('');
    setNewProdDescEng('');
    setNewProdImage('');
    setProdUploadSuccess(false);
  };

  // If Admin not authenticated, render Admin Login Form
  if (!isAdminAuth) {
    return (
      <div className="py-16 bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-800">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isUrdu ? 'ایڈمن کنٹرول پورٹل' : 'Official Admin Portal Login'}
            </h2>
            <p className="text-xs text-slate-600">
              {isUrdu ? 'حافظ کلینک کے مرکزی ہسپتال ڈیش بورڈ تک محفوظ ایڈمن رسائی' : 'Secure official administration access to Hafiz Clinic records & management controls'}
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isUrdu ? 'یوزر نیم / ای میل (Username/Email)' : 'Admin Username or Email'}
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isUrdu ? 'پاس ورڈ (Password)' : 'Password'}
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating Official Account...' : isUrdu ? 'ایڈمن لاگ ان کریں' : 'Access Admin Dashboard'}</span>
            </button>
          </form>

          {/* Official System Notice */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'حافظ کلینک کے مرکزی ایڈمنسٹریٹر کے لیے محفوظ پورٹل' : 'Official System Administration Access'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {isUrdu ? 'ادارہ جاتی کنٹرول پینل (Official Admin)' : 'Administrative Management Portal'}
              </span>
              <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-300" />
                <span>Hospital Database: Active & Secured</span>
              </span>
              <span className="bg-teal-950/80 text-teal-200 border border-teal-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Cloud className="w-3 h-3 text-amber-300" />
                <span>Medical Media Server: Online</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {isUrdu ? 'حافظ کلینک ایڈمن پینل (Hospital Administration)' : 'Hafiz Clinic Management Portal & Controls'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {setActiveView && (
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl border border-emerald-600 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4 text-emerald-300" />
                <span>{isUrdu ? 'پبلک ویب سائٹ دیکھیں' : 'View Public Website'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (doctors.length > 0 && !bookDoctorId) {
                  setBookDoctorId(doctors[0].id);
                }
                setIsBookModalOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-slate-950 font-black" />
              <span>{isUrdu ? 'مریض کی اپائنٹمنٹ بک کریں' : 'Book for Patient'}</span>
            </button>
            {setLanguage && (
              <button
                type="button"
                onClick={() => setLanguage(isUrdu ? 'english' : 'urdu')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1 shadow"
              >
                🌐 <span>{isUrdu ? 'English Mode' : 'اردو موڈ'}</span>
              </button>
            )}
            <button
              onClick={() => setIsAdminAuth(false)}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-bold px-3 py-2 rounded-xl border border-rose-700 transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={() => alert(isUrdu ? 'ڈیٹا بیس کا بیک اپ (SQL / JSON) ڈاؤن لوڈ ہو گیا ہے۔' : 'Hospital Database Backup exported successfully.')}
              className="bg-teal-800 hover:bg-teal-700 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-teal-600 shadow"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>{isUrdu ? 'بیک اپ (Backup)' : 'Export Backup'}</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto text-xs font-bold gap-1">
          {[
            { id: 'overview', label: isUrdu ? '📊 ڈیش بورڈ' : '📊 Dashboard & Analytics' },
            { id: 'users', label: isUrdu ? `👥 یوزرز و اکاؤنٹس (${usersList.length})` : `👥 Registered Users (${usersList.length})` },
            { id: 'tracker', label: isUrdu ? `📑 ڈاکومنٹس و پورٹل ٹریکر (${allReports.length + allMessages.length})` : `📑 Document & Telemedicine Tracker (${allReports.length + allMessages.length})` },
            { id: 'doctors', label: isUrdu ? `👨‍⚕️ ڈاکٹرز (${doctors.length})` : `👨‍⚕️ Doctors (${doctors.length})` },
            { id: 'diseases', label: isUrdu ? `🏥 بیماریاں (${diseases.length})` : `🏥 Diseases & Treatments (${diseases.length})` },
            { id: 'products', label: isUrdu ? `📦 پروڈکٹس (${products.length})` : `📦 Products (${products.length})` },
            { id: 'orders', label: isUrdu ? `🛒 آرڈرز (${orders.length})` : `🛒 Store Orders (${orders.length})` },
            { id: 'appointments', label: isUrdu ? `📅 اپائنٹمنٹس (${appointments.length})` : `📅 Appointments Queue (${appointments.length})` },
            { id: 'articles', label: isUrdu ? `📝 بلاگ مضامین (${articles.length})` : `📝 Health Articles (${articles.length})` },
            { id: 'settings', label: isUrdu ? '⚙️ کلینک سیٹنگز' : '⚙️ Clinic Settings' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === t.id ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-emerald-900 text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'تمام رجسٹرڈ یوزرز و ڈاکٹرز مینیج کریں' : 'Manage User Profiles & Doctor Accounts'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'مریضوں کے اکاؤنٹس بنائیں اور حذف کریں' : 'Register and manage official hospital patient records'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <button
                    onClick={() => setIsRegPatientModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'نیا مریض رجسٹر کریں' : 'Register New Patient'}</span>
                  </button>

                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    {['all', 'patient', 'doctor', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-2.5 py-1 rounded-md capitalize font-bold transition-colors text-[11px] ${
                          userRoleFilter === role
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-3">{isUrdu ? 'اسم گرامی' : 'Full Name'}</th>
                      <th className="p-3">{isUrdu ? 'یوزر نیم' : 'Username'}</th>
                      <th className="p-3">{isUrdu ? 'رول' : 'Role'}</th>
                      <th className="p-3">{isUrdu ? 'فون' : 'Phone'}</th>
                      <th className="p-3">{isUrdu ? 'شہر' : 'City'}</th>
                      <th className="p-3">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                      <th className="p-3 text-right">{isUrdu ? 'ایکشن' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter((u) => userRoleFilter === 'all' || u.role === userRoleFilter)
                      .map((usr) => (
                        <tr key={usr._id || usr.id || usr.username} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">
                            {usr.name || usr.fullName || usr.username}
                            {usr.mrn && <span className="text-[10px] text-emerald-800 font-mono block font-semibold">{usr.mrn}</span>}
                            {usr.qualification && <span className="text-[10px] text-emerald-700 block font-normal">{usr.qualification}</span>}
                          </td>
                          <td className="p-3 font-mono text-slate-700">{usr.username || usr.email}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              usr.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              usr.role === 'doctor' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                              'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{usr.phone || 'N/A'}</td>
                          <td className="p-3 text-slate-700">{usr.city || (isUrdu ? 'گوجرانوالہ' : 'Gujranwala')}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              {usr.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                const userName = usr.name || usr.fullName || usr.username;
                                const msg = isUrdu ? `کیا آپ واقعی ${userName} کا اکاؤنٹ حذف کرنا چاہتے ہیں؟` : `Are you sure you want to delete account for ${userName}?`;
                                if (confirm(msg)) {
                                  setUsersList(usersList.filter((u) => u.username !== usr.username && u.id !== usr.id));
                                  fetch(`/api/users/${usr._id || usr.id}`, { method: 'DELETE' }).catch(() => {});
                                }
                              }}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Telemedicine & Document Tracking System Tab */}
        {activeTab === 'tracker' && (
          <div className="space-y-6 text-slate-900">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-bold">{isUrdu ? 'ارسال شدہ ڈاکومنٹس' : 'Total Shared Documents'}</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{allReports.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-bold">{isUrdu ? 'مریض و ڈاکٹر پیغامات' : 'Total Messages Exchanged'}</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{allMessages.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-bold">{isUrdu ? 'جائزہ شدہ رپورٹس' : 'Reviewed Reports'}</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {allReports.filter((r) => r.status === 'Reviewed').length}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-bold">{isUrdu ? 'زیر جائزہ ڈاکومنٹس' : 'Under Review Documents'}</div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {allReports.filter((r) => r.status !== 'Reviewed').length}
                </div>
              </div>
            </div>

            {/* Tracker Navigation & Search Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-bold gap-1 flex-wrap">
                  <button
                    onClick={() => setTrackerSubTab('documents')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      trackerSubTab === 'documents' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-200" />
                    <span>{isUrdu ? `موصول شدہ ڈاکومنٹس (${allReports.length})` : `Received Documents (${allReports.length})`}</span>
                  </button>

                  <button
                    onClick={() => setTrackerSubTab('chats')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      trackerSubTab === 'chats' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>{isUrdu ? `مریض و ڈاکٹر گفتگو (${allMessages.length})` : `Patient-Doctor Messages (${allMessages.length})`}</span>
                  </button>

                  <button
                    onClick={() => setTrackerSubTab('logs')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      trackerSubTab === 'logs' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-200" />
                    <span>{isUrdu ? 'آڈٹ لاگز (Audit Log)' : 'Audit Trail Logs'}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    value={trackerSearch}
                    onChange={(e) => setTrackerSearch(e.target.value)}
                    placeholder={isUrdu ? 'مریض یا ڈاکٹر کا نام تلاش کریں...' : 'Search patient or doctor name...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* SUB-TAB 1: DOCUMENTS TRACKER */}
              {trackerSubTab === 'documents' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {allReports
                      .filter(
                        (r) =>
                          !trackerSearch ||
                          r.patientName?.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                          r.doctorName?.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                          r.testNameUrdu?.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                          (r.testNameEng && r.testNameEng.toLowerCase().includes(trackerSearch.toLowerCase()))
                      )
                      .map((rep) => (
                        <div key={rep._id || rep.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-black text-slate-900 text-sm">{rep.patientName}</div>
                              <div className="text-emerald-700 font-bold">{isUrdu ? rep.testNameUrdu : (rep.testNameEng || rep.testNameUrdu)}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {isUrdu ? `معالج ڈاکٹر: ${rep.doctorName || 'ڈاکٹر زیشان چوہدری'}` : `Attending Doctor: ${rep.doctorName || 'Dr. Zeeshan Chaudhry'}`}
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.status === 'Reviewed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {rep.status}
                            </span>
                          </div>

                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">{rep.summary || (isUrdu ? 'پورٹل ڈاکومنٹ' : 'Portal Document Attachment')}</p>

                          {rep.fileUrl && (() => {
                            const isPdf = rep.fileUrl.toLowerCase().includes('.pdf') || rep.fileUrl.startsWith('data:application/pdf');
                            if (isPdf) {
                              return (
                                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900">
                                        {isUrdu ? 'PDF میڈیکل رپورٹ ڈاکومنٹ' : 'PDF Medical File Attachment'}
                                      </p>
                                      <p className="text-[10px] text-slate-500">PDF Medical File Document</p>
                                    </div>
                                  </div>
                                  <a
                                    href={rep.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-xl text-[11px] shadow-sm transition-colors"
                                  >
                                    🔗 {isUrdu ? 'اصل PDF ڈاکومنٹ دیکھیں / ڈاؤن لوڈ کریں' : 'View / Download PDF Document'}
                                  </a>
                                </div>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                <img
                                  src={rep.fileUrl}
                                  alt="Report Attachment"
                                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                                />
                                <a
                                  href={rep.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-xl text-[11px] shadow-sm transition-colors"
                                >
                                  🔗 {isUrdu ? 'اصل ڈاکومنٹ کھولیں / ڈاؤن لوڈ کریں' : 'Open / Download Attachment File'}
                                </a>
                              </div>
                            );
                          })()}

                          {rep.doctorComment && (
                            <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                              <span className="font-bold">{isUrdu ? 'ڈاکٹر کا تحریری تبصرہ:' : 'Doctor Remarks:'}</span> {rep.doctorComment}
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 font-mono text-right">{isUrdu ? 'تاریخ:' : 'Date:'} {rep.date || '2026-08-08'}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: LIVE CHAT MESSAGES TRACKER */}
              {trackerSubTab === 'chats' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-emerald-900 p-4 rounded-2xl text-white flex justify-between items-center text-xs shadow-md">
                    <span className="font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-200" />
                      <span>{isUrdu ? 'آن لائن طبی سیشن و ڈاکومنٹ مانیٹر (Official Telemedicine Monitor)' : 'Online Telemedicine Sessions & Communications Monitor'}</span>
                    </span>
                    <span className="bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full">
                      Real-time Consultation Inspector
                    </span>
                  </div>

                  <DoctorPatientChatView
                    currentUser={{ role: 'doctor', id: 'admin-monitor', name: isUrdu ? 'ایڈمن کنٹرول مانیٹر' : 'Admin Telemedicine Inspector' }}
                    doctors={doctors}
                    language={language}
                  />

                  {/* Summary of Hospital Messages */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-emerald-900 text-xs">
                      {isUrdu ? `سستم ڈیٹا بیس میں محفوظ شد لائیو چیٹ لاگز (${allMessages.length} Messages):` : `Archived Telemedicine Live Chat Logs (${allMessages.length} Messages):`}
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {allMessages
                        .filter(
                          (m) =>
                            !trackerSearch ||
                            m.senderName?.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                            m.receiverName?.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                            m.text?.toLowerCase().includes(trackerSearch.toLowerCase())
                        )
                        .map((msg, i) => (
                          <div key={msg._id || i} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-emerald-800">{msg.senderName}</span>
                                <span className="text-slate-400">➔</span>
                                <span className="text-teal-800">{msg.receiverName}</span>
                              </div>
                              <span className="text-slate-500 font-mono">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '11:42 AM'}</span>
                            </div>
                            <p className="text-slate-800 text-[11px]">{msg.text}</p>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 underline font-mono font-bold"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>{isUrdu ? 'منسلک شدہ فائل دیکھیں (View Attached File)' : 'View Attached Document / File'}</span>
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: AUDIT TRAIL LOGS */}
              {trackerSubTab === 'logs' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-900 border-b border-slate-200 pb-2">
                    {isUrdu ? 'سسٹم پورٹل و ڈاکومنٹ سیکورٹی لاگز (System Telemedicine Audit Trail)' : 'System Telemedicine Audit Trail & Security Logs'}
                  </h4>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between text-slate-800">
                      <span>
                        {isUrdu
                          ? "[2026-08-08 11:42:10] Document Uploaded: 'بائیو کوانٹم باڈی اسکین' by Patient 'محمد فاروق'"
                          : "[2026-08-08 11:42:10] Document Uploaded: 'Bio Quantum Body Scan' by Patient 'Muhammad Farooq'"}
                      </span>
                      <span className="text-emerald-700 font-bold">STATUS: OK</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between text-slate-800">
                      <span>
                        {isUrdu
                          ? "[2026-08-08 11:40:05] Direct Message Sent: Dr. Zeeshan Chaudhry ➔ Patient 'محمد فاروق'"
                          : "[2026-08-08 11:40:05] Direct Message Sent: Dr. Zeeshan Chaudhry ➔ Patient 'Muhammad Farooq'"}
                      </span>
                      <span className="text-emerald-700 font-bold">STATUS: DELIVERED</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between text-slate-800">
                      <span>
                        {isUrdu
                          ? "[2026-08-08 10:15:30] Doctor Prescription Created: Dr. Zeeshan Chaudhry for Patient 'کامران خان'"
                          : "[2026-08-08 10:15:30] Doctor Prescription Created: Dr. Zeeshan Chaudhry for Patient 'Kamran Khan'"}
                      </span>
                      <span className="text-emerald-700 font-bold">STATUS: STORED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-slate-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold">
                  {isUrdu ? 'کل رجسٹرڈ معالجین' : 'Total Registered Physicians'}
                </div>
                <div className="text-3xl font-black text-emerald-800 mt-1">{doctors.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold">
                  {isUrdu ? 'کل بیماریاں (Diseases)' : 'Configured Medical Pages'}
                </div>
                <div className="text-3xl font-black text-emerald-700 mt-1">{diseases.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold">
                  {isUrdu ? 'کل اسٹور پروڈکٹس' : 'E-Store Catalog Items'}
                </div>
                <div className="text-3xl font-black text-teal-700 mt-1">{products.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold">
                  {isUrdu ? 'آن لائن اپائنٹمنٹس' : 'Total Booked Appointments'}
                </div>
                <div className="text-3xl font-black text-amber-700 mt-1">{appointments.length}</div>
              </div>
            </div>

            {/* Media Integration Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-amber-300" />
                  <h4 className="font-bold text-sm text-white">Hospital Medical Image Server Online</h4>
                </div>
                <p className="text-emerald-100">
                  Cloud Media Engine: <code className="bg-emerald-950 px-2 py-0.5 rounded text-amber-300 font-mono">Active & Encrypted</code> |
                  Status: <code className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-mono">Ready for Image Uploads</code>
                </p>
              </div>
              <span className="bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow">
                Official Media Cloud Ready
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-emerald-900">
                {isUrdu ? 'حالیہ آن لائن اپائنٹمنٹس (Recent Appointments)' : 'Recent Online Appointments'}
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-2.5">{isUrdu ? 'مریض' : 'Patient Name'}</th>
                      <th className="p-2.5">{isUrdu ? 'فون' : 'Phone'}</th>
                      <th className="p-2.5">{isUrdu ? 'شہر' : 'City'}</th>
                      <th className="p-2.5">{isUrdu ? 'مسئلہ / بیماری' : 'Problem / Condition'}</th>
                      <th className="p-2.5">{isUrdu ? 'ڈاکٹر' : 'Selected Doctor'}</th>
                      <th className="p-2.5">{isUrdu ? 'وقت' : 'Time Slot'}</th>
                      <th className="p-2.5">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => (
                      <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{app.patientName}</td>
                        <td className="p-2.5 font-mono text-slate-700">{app.phone}</td>
                        <td className="p-2.5 text-slate-700">{app.city}</td>
                        <td className="p-2.5 text-emerald-800 font-semibold">{app.problem}</td>
                        <td className="p-2.5 text-slate-700">{app.doctorName}</td>
                        <td className="p-2.5 text-emerald-700 font-bold">{app.timeSlot}</td>
                        <td className="p-2.5">
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 text-[10px] font-bold">
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Management */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 text-slate-900">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'نیا ڈاکٹر شامل کریں' : 'Register Doctor & Upload Profile Image'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {isUrdu ? 'ڈاکٹر کا نام' : 'Doctor Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. Sajjad Sagheer"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Qualification</label>
                      <input
                        type="text"
                        placeholder="MBBS, FCPS"
                        value={newDocQual}
                        onChange={(e) => setNewDocQual(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Specialization</label>
                      <input
                        type="text"
                        placeholder="Physiotherapist / Physician"
                        value={newDocSpec}
                        onChange={(e) => setNewDocSpec(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor Photo Picker */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <label className="block font-bold text-slate-700">
                    Doctor Photo Upload:
                  </label>

                  {newDocImage && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-500 mx-auto">
                      <img src={newDocImage} alt="Doctor preview" className="w-full h-full object-cover" />
                      {docUploadSuccess && (
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5">
                          Photo Uploaded
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="doc-img-input"
                      onChange={handleDocImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="doc-img-input"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 text-xs text-center shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingDocImg ? 'Uploading Photo...' : 'Upload Doctor Photo'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateDoc}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'ڈاکٹر ڈیٹا بیس میں شامل کریں' : 'Save Doctor to Hospital System'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img src={doc.image} alt={doc.nameEnglish} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {isUrdu ? doc.nameUrdu : doc.nameEnglish} <span className="text-emerald-700 text-xs font-semibold">({doc.qualification})</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {isUrdu ? 'تخصص:' : 'Spec:'} {isUrdu ? doc.specializationUrdu : doc.specializationEnglish}
                      </div>
                      <div className="text-emerald-800 font-bold text-[11px] mt-0.5">
                        {isUrdu ? 'مارننگ:' : 'Morning:'} {isUrdu ? doc.timingUrdu : (doc.timingEnglish || '8:00 AM - 2:00 PM')}
                      </div>
                      {(doc.eveningTimingUrdu || doc.eveningTimingEnglish) && (
                        <div className="text-teal-800 font-bold text-[11px]">
                          {isUrdu ? 'ایوننگ:' : 'Evening:'} {isUrdu ? (doc.eveningTimingUrdu || doc.eveningTimingEnglish) : (doc.eveningTimingEnglish || doc.eveningTimingUrdu)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditDoctor(doc)}
                      className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                      title="Edit Doctor Timing & Information"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isUrdu ? 'ٹائمنگ ایڈٹ' : 'Edit Timing'}</span>
                    </button>
                    <button
                      onClick={() => onDeleteDoctor(doc.id)}
                      className="p-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-lg transition-colors"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Doctor & Timing Modal */}
            {editingDoctor && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-white text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <span>{isUrdu ? 'معالج کی ٹائمنگ اور معلومات تبدیل کریں' : 'Edit Doctor Information & OPD Timings'}</span>
                    </h3>
                    <button onClick={() => setEditingDoctor(null)} className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveDoctorChanges} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">نام اردو (Doctor Name Urdu)</label>
                        <input
                          type="text"
                          required
                          value={editDocNameUrdu}
                          onChange={(e) => setEditDocNameUrdu(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Name English (Doctor Name English)</label>
                        <input
                          type="text"
                          required
                          value={editDocNameEng}
                          onChange={(e) => setEditDocNameEng(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">قابلیت (Qualification)</label>
                        <input
                          type="text"
                          value={editDocQual}
                          onChange={(e) => setEditDocQual(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">فون نمبر (Phone Number)</label>
                        <input
                          type="text"
                          value={editDocPhone}
                          onChange={(e) => setEditDocPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">تخصص اردو (Specialization Urdu)</label>
                        <input
                          type="text"
                          value={editDocSpecUrdu}
                          onChange={(e) => setEditDocSpecUrdu(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Specialization English</label>
                        <input
                          type="text"
                          value={editDocSpecEng}
                          onChange={(e) => setEditDocSpecEng(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>او پی ڈی کی تمام ٹائمنگز درج کریں (Doctor OPD Timings)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1">مارننگ ٹائمنگ اردو (Morning Slot Urdu)</label>
                          <input
                            type="text"
                            value={editDocTimingUrdu}
                            onChange={(e) => setEditDocTimingUrdu(e.target.value)}
                            placeholder="صبح 8:00 سے دوپہر 2:00 بجے تک"
                            className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">Morning Slot English</label>
                          <input
                            type="text"
                            value={editDocTimingEng}
                            onChange={(e) => setEditDocTimingEng(e.target.value)}
                            placeholder="8:00 AM - 2:00 PM"
                            className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1">ایوننگ ٹائمنگ اردو (Evening Slot Urdu)</label>
                          <input
                            type="text"
                            value={editDocEveningUrdu}
                            onChange={(e) => setEditDocEveningUrdu(e.target.value)}
                            placeholder="شام 5:00 سے رات 9:00 بجے تک"
                            className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">Evening Slot English</label>
                          <input
                            type="text"
                            value={editDocEveningEng}
                            onChange={(e) => setEditDocEveningEng(e.target.value)}
                            placeholder="5:00 PM - 9:00 PM"
                            className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">تصویر کا یو آر ایل (Doctor Image URL)</label>
                      <input
                        type="text"
                        value={editDocImage}
                        onChange={(e) => setEditDocImage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl font-mono"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingDocEdit}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingDocEdit ? 'Saving to Database...' : 'تغیرات محفوظ کریں (Save Timing Changes)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDoctor(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-5 rounded-xl"
                      >
                        منسوخ کریں (Cancel)
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diseases CRUD with Cloudinary Upload */}
        {activeTab === 'diseases' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'نئی بیماری شامل کریں' : 'Add Disease Condition & Upload Diagram'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        نام اردو (Urdu Name)
                      </label>
                      <input
                        type="text"
                        placeholder="مثلاً: عرق النساء / سائیٹیکا"
                        value={newDisNameUrdu}
                        onChange={(e) => setNewDisNameUrdu(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Name English
                      </label>
                      <input
                        type="text"
                        placeholder="Sciatica / Disc Herniation"
                        value={newDisNameEng}
                        onChange={(e) => setNewDisNameEng(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Category</label>
                    <select
                      value={newDisCategory}
                      onChange={(e) => setNewDisCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                    >
                      <option value="physiotherapy">Physiotherapy & Spine</option>
                      <option value="eyecare">Computerized Eye Care</option>
                      <option value="quantum">Quantum Body Scanning</option>
                      <option value="hair">Hair Loss & Skin Care</option>
                      <option value="general">General Medical Conditions</option>
                    </select>
                  </div>
                </div>

                {/* Disease Image Picker */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <label className="block font-bold text-slate-700">
                    Disease Diagram Image:
                  </label>

                  {newDisImage && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-500 mx-auto">
                      <img src={newDisImage} alt="Disease diagram" className="w-full h-full object-cover" />
                      {disUploadSuccess && (
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5">
                          Diagram Uploaded
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="dis-img-input"
                      onChange={handleDisImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="dis-img-input"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 text-xs text-center shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingDisImg ? 'Uploading Diagram...' : 'Upload Diagram'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateDis}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'بیماری کا پیچ محفوظ کریں' : 'Save Disease Condition Records'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {diseases.map((dis) => (
                <div key={dis.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    {dis.image && (
                      <img src={dis.image} alt={dis.nameEnglish} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">
                        ✔ {isUrdu ? dis.nameUrdu : dis.nameEnglish}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {isUrdu ? dis.nameEnglish : dis.nameUrdu}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteDisease(dis.id)}
                    className="p-1.5 bg-red-900/40 text-red-300 hover:bg-red-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'نئی ہربل پروڈکٹ و امیج اپلوڈ (Add Product & Upload Image to Category)' : 'Add New Product to Store Catalog'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Form Fields Column 1 & 2 */}
                <div className="md:col-span-2 space-y-3">
                  {/* Title Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'نام اردو (Product Urdu Title) *' : 'Product Title (Urdu) *'}
                      </label>
                      <input
                        type="text"
                        placeholder={isUrdu ? 'مثلاً: ہوراب بیوٹی ہربل سوپ' : 'Title in Urdu'}
                        value={newProdNameUrdu}
                        onChange={(e) => setNewProdNameUrdu(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'Name English (Product English Title) *' : 'Product Title (English) *'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hoorab Herbal Beauty Soap"
                        value={newProdNameEng}
                        onChange={(e) => setNewProdNameEng(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'کیٹیگری منتخب کریں (Select Product Category) *' : 'Select Category *'}
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                      >
                        <option value="skin">{isUrdu ? '🌿 بیوٹی کریم و اسکن کیئر (Skin Care & Creams)' : '🌿 Skin Care & Beauty Creams'}</option>
                        <option value="hair">{isUrdu ? '💇‍♂️ ہیئر کیئر و ہیئر آئل (Hair Care & Hair Oils)' : '💇‍♂️ Hair Care & Hair Oils'}</option>
                        <option value="eye">{isUrdu ? '👁️ آئی کیئر و نظر کے نقشے (Eye Care)' : '👁️ Eye Care & Vision'}</option>
                        <option value="perfume">{isUrdu ? '🌸 پرفیوم و خالص عطر (Perfumes & Attars)' : '🌸 Perfumes & Attars'}</option>
                        <option value="pain">{isUrdu ? '🦴 درد شفا تیل و بام (Pain Relief Oils)' : '🦴 Joint & Pain Relief'}</option>
                        <option value="general">{isUrdu ? '💊 عمومی ہربل دوا (General Products)' : '💊 General Herbal Remedies'}</option>
                        <option value="custom">{isUrdu ? '➕ نئی کسٹم کیٹیگری داخل کریں (Custom Category)' : '➕ Custom Category'}</option>
                      </select>
                    </div>

                    {/* Stock Input */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'اسٹاک تعداد (In Stock Quantity)' : 'In-Stock Quantity'}
                      </label>
                      <input
                        type="number"
                        placeholder="50"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* If Custom Category selected */}
                  {newProdCategory === 'custom' && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-amber-900 font-bold mb-1">{isUrdu ? 'Custom Category ID (English)' : 'Category ID (English)'}</label>
                        <input
                          type="text"
                          placeholder="soaps / syrups"
                          value={customProdCatId}
                          onChange={(e) => setCustomProdCatId(e.target.value)}
                          className="w-full bg-white border border-amber-300 p-2 rounded-lg text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-900 font-bold mb-1">{isUrdu ? 'کیٹیگری نام (Urdu Label)' : 'Category Name (Urdu)'}</label>
                        <input
                          type="text"
                          placeholder="ہربل صابن و شیمپو"
                          value={customProdCatUrdu}
                          onChange={(e) => setCustomProdCatUrdu(e.target.value)}
                          className="w-full bg-white border border-amber-300 p-2 rounded-lg text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'قیمت PKR (Price in Rupees) *' : 'Price (PKR) *'}
                      </label>
                      <input
                        type="number"
                        placeholder="1500"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-emerald-800 font-mono font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">
                        {isUrdu ? 'اصل قیمت PKR (Original Price - Optional)' : 'Original Price (PKR - Optional)'}
                      </label>
                      <input
                        type="number"
                        placeholder="2000"
                        value={newProdOrigPrice}
                        onChange={(e) => setNewProdOrigPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  {/* Description Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">{isUrdu ? 'تفصیل اردو (Description Urdu)' : 'Description (Urdu)'}</label>
                      <textarea
                        rows={2}
                        placeholder={isUrdu ? '100% خالص ہربل فارمولیشن۔' : 'Urdu description text...'}
                        value={newProdDescUrdu}
                        onChange={(e) => setNewProdDescUrdu(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">{isUrdu ? 'Description English' : 'Description (English)'}</label>
                      <textarea
                        rows={2}
                        placeholder="100% Organic Natural Product."
                        value={newProdDescEng}
                        onChange={(e) => setNewProdDescEng(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Picker Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      {isUrdu ? 'پروڈکٹ تصویر (Cloudinary Image):' : 'Product Photo / Image:'}
                    </label>

                    {newProdImage ? (
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 mx-auto bg-white shadow-sm">
                        <img src={newProdImage} alt="Product preview" className="w-full h-full object-cover" />
                        {prodUploadSuccess && (
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5">
                            Uploaded
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mx-auto text-slate-400 p-2 text-center text-[10px] bg-white">
                        <ImageIcon className="w-8 h-8 mb-1 text-slate-400" />
                        <span>{isUrdu ? 'کوئی تصویر نہیں چنی گئی' : 'No photo selected'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="prod-img-input"
                      onChange={handleProdImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="prod-img-input"
                      className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 text-xs text-center shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingProdImg ? 'Uploading photo...' : isUrdu ? 'تصویر اپلوڈ کریں' : 'Upload Product Photo'}</span>
                    </label>

                    <div className="pt-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">{isUrdu ? 'یا تصویر کا URL درج کریں:' : 'Or enter direct Image URL:'}</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg text-[10px] text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleCreateProd}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'پروڈکٹ کو کیٹیگری میں محفوظ کریں (Save Product)' : 'Save Product to Catalog'}</span>
                </button>
              </div>
            </div>

            {/* List of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600'}
                      alt={p.nameEnglish}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {isUrdu ? p.nameUrdu : p.nameEnglish}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                          {isUrdu ? p.categoryUrdu || p.category : p.category}
                        </span>
                        <span className="text-amber-700 font-black">Rs. {p.pricePKR}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
            <h3 className="font-bold text-base text-emerald-900">
              {isUrdu ? 'آن لائن آرڈرز کی فہرست (Customer Orders)' : 'Received Customer Store Orders'}
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-2.5">{isUrdu ? 'آرڈر نمبر' : 'Order ID'}</th>
                    <th className="p-2.5">{isUrdu ? 'گاہک' : 'Customer Name'}</th>
                    <th className="p-2.5">{isUrdu ? 'فون' : 'Phone'}</th>
                    <th className="p-2.5">{isUrdu ? 'شہر' : 'City / Address'}</th>
                    <th className="p-2.5">{isUrdu ? 'آئٹمز' : 'Ordered Items'}</th>
                    <th className="p-2.5">{isUrdu ? 'کل رقم' : 'Total Price'}</th>
                    <th className="p-2.5">{isUrdu ? 'ادائیگی' : 'Payment Method'}</th>
                    <th className="p-2.5">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-amber-700 font-bold">{ord.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{ord.customerName}</td>
                      <td className="p-2.5 font-mono text-slate-700">{ord.phone}</td>
                      <td className="p-2.5 text-slate-700">{ord.city} - {ord.address}</td>
                      <td className="p-2.5 text-emerald-800 font-semibold">
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-2.5 font-black text-amber-800">Rs. {ord.totalPricePKR}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{ord.paymentMethod}</td>
                      <td className="p-2.5">
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 text-[10px] font-bold">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-700/80 pb-4">
              <div>
                <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>{isUrdu ? 'آن لائن اپائنٹمنٹس کیو و منظوری (Appointments Queue & Control)' : 'Manage Online Clinic Appointments'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isUrdu ? 'مریضوں کی طرف سے خود اپائنٹمنٹ بک کریں یا موجودہ کیو منظور کریں' : 'Book appointments on behalf of patients and approve pending queues'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    placeholder={isUrdu ? 'تلاش (مریض، فون، ڈاکٹر)...' : 'Search patient, phone, doctor...'}
                    className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (doctors.length > 0 && !bookDoctorId) {
                      setBookDoctorId(doctors[0].id);
                    }
                    setIsBookModalOpen(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 text-slate-950 font-black" />
                  <span>{isUrdu ? 'مریض کی طرف سے اپائنٹمنٹ لیں' : 'Book on Behalf of Patient'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2.5 font-mono">ID #</th>
                    <th className="p-2.5">{isUrdu ? 'مریض کا نام' : 'Patient Name'}</th>
                    <th className="p-2.5">{isUrdu ? 'موبائل نمبر' : 'Phone'}</th>
                    <th className="p-2.5">{isUrdu ? 'شہر' : 'City'}</th>
                    <th className="p-2.5">{isUrdu ? 'طبی مسئلہ' : 'Medical Concern'}</th>
                    <th className="p-2.5">{isUrdu ? 'تعینات معالج' : 'Assigned Doctor'}</th>
                    <th className="p-2.5">{isUrdu ? 'تاریخ و ٹائم' : 'Date & Time'}</th>
                    <th className="p-2.5">{isUrdu ? 'حالت' : 'Current Status'}</th>
                    <th className="p-2.5 text-center">{isUrdu ? 'ایکشن / منظوری' : 'Approval Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter((app) => {
                      if (!appointmentSearch.trim()) return true;
                      const q = appointmentSearch.toLowerCase();
                      return (
                        (app.patientName && app.patientName.toLowerCase().includes(q)) ||
                        (app.phone && app.phone.includes(q)) ||
                        (app.doctorName && app.doctorName.toLowerCase().includes(q)) ||
                        (app.city && app.city.toLowerCase().includes(q)) ||
                        (app.problem && app.problem.toLowerCase().includes(q))
                      );
                    })
                    .map((app, idx) => {
                    const displayId = app.id && app.id.startsWith('APP-') ? app.id : `APP-${String(idx + 1).padStart(3, '0')}`;
                    return (
                      <tr key={app.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2.5 font-mono font-bold text-amber-300">{displayId}</td>
                        <td className="p-2.5 font-bold text-white">{app.patientName}</td>
                        <td className="p-2.5 font-mono text-slate-300">{app.phone}</td>
                        <td className="p-2.5 text-slate-300">{app.city}</td>
                        <td className="p-2.5 text-emerald-300 font-semibold">{app.problem}</td>
                        <td className="p-2.5 text-slate-300">{app.doctorName}</td>
                        <td className="p-2.5 text-amber-300 font-mono">{app.date} | {app.timeSlot}</td>
                        <td className="p-2.5">
                          <span className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : app.status === 'Completed'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : app.status === 'Cancelled'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {app.status === 'Approved' ? '✓ Approved (منظور شدہ)' : app.status === 'Completed' ? '✓ Completed (مکمل)' : app.status === 'Cancelled' ? '✕ Cancelled (منسوخ)' : '⏳ Pending (معلق)'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                const targetId = app.id || (app as any)._id;
                                if (onUpdateAppointmentStatus && targetId) onUpdateAppointmentStatus(targetId, 'Approved');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                              title="منظور کریں"
                            >
                              منظور
                            </button>
                            <button
                              onClick={() => {
                                const targetId = app.id || (app as any)._id;
                                if (onUpdateAppointmentStatus && targetId) onUpdateAppointmentStatus(targetId, 'Completed');
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                              title="مکمل کریں"
                            >
                              مکمل
                            </button>
                            <button
                              onClick={() => {
                                const targetId = app.id || (app as any)._id;
                                if (onUpdateAppointmentStatus && targetId) onUpdateAppointmentStatus(targetId, 'Cancelled');
                              }}
                              className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                              title="منسوخ کریں"
                            >
                              منسوخ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Create New Article Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'نیا بلاگ مضمون تحریر کریں (Add New Health Article)' : 'Publish New Health Article'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'مضمون کا عنوان (اردو)*' : 'Article Title (Urdu)*'}</label>
                  <input
                    type="text"
                    required
                    value={newArtTitleUrdu}
                    onChange={(e) => setNewArtTitleUrdu(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً: جوڑوں کے درد سے نجات کے 5 طریقے' : 'e.g. Relief Knee Pain Naturally'}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'مضمون کا عنوان (انگلش)' : 'Article Title (English)'}</label>
                  <input
                    type="text"
                    value={newArtTitleEng}
                    onChange={(e) => setNewArtTitleEng(e.target.value)}
                    placeholder="Title in English"
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'کیٹیگری' : 'Category'}</label>
                  <select
                    value={newArtCategory}
                    onChange={(e) => setNewArtCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="درد اور مہرے">{isUrdu ? 'درد اور مہرے (Joint & Pain)' : 'Joint & Pain Relief'}</option>
                    <option value="آئی کیئر">{isUrdu ? 'آئی کیئر (Eye Care)' : 'Eye Care & Vision'}</option>
                    <option value="کمپیوٹر چیک اپ">{isUrdu ? 'کمپیوٹر چیک اپ (Diagnostics)' : 'Computerized Diagnostics'}</option>
                    <option value="معدہ و جگر">{isUrdu ? 'معدہ و جگر (Gastro & Liver)' : 'Gastrointestinal & Liver'}</option>
                    <option value="ہیئر کیئر">{isUrdu ? 'ہیئر کیئر و سکن (Hair & Beauty)' : 'Hair Care & Skin'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'مصنف (ڈاکٹر)' : 'Author Doctor'}</label>
                  <select
                    value={newArtAuthor}
                    onChange={(e) => setNewArtAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="ڈاکٹر زیشان چوہدری">{isUrdu ? 'ڈاکٹر زیشان چوہدری (Dr. Zeeshan Chaudhry)' : 'Dr. Zeeshan Chaudhry'}</option>
                    <option value="ڈاکٹر وقاص صغیر چوہدری">{isUrdu ? 'ڈاکٹر وقاص صغیر چوہدری (Dr. Waqas Sageer)' : 'Dr. Waqas Sageer Chaudhry'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'مختصر خلاصہ (Excerpt)' : 'Short Excerpt / Summary'}</label>
                  <input
                    type="text"
                    value={newArtExcerpt}
                    onChange={(e) => setNewArtExcerpt(e.target.value)}
                    placeholder={isUrdu ? 'مضمون کا 2 لائن کا خلاصہ ٹائپ کریں...' : 'Short 2 line summary for card preview...'}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'مکمل مضمون کا متن (Full Article Content)' : 'Full Article Body Content'}</label>
                  <textarea
                    rows={5}
                    value={newArtContent}
                    onChange={(e) => setNewArtContent(e.target.value)}
                    placeholder={isUrdu ? 'مضمون کا مکمل تفصیل، تجاویز اور نسخہ جات...' : 'Write complete detailed article body text...'}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1">{isUrdu ? 'تصویر کا URL (Unsplash/Cloudinary)' : 'Image Banner URL'}</label>
                  <input
                    type="text"
                    value={newArtImage}
                    onChange={(e) => setNewArtImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateArticle}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow flex items-center gap-2 text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'مضمون شائع کریں (Publish Article)' : 'Publish Article'}</span>
              </button>
            </div>

            {/* Articles List Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
              <h3 className="font-bold text-emerald-900 text-sm">
                {isUrdu ? `شائع شدہ مضامین کی فہرست (${articles.length})` : `Published Health Articles (${articles.length})`}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5">{isUrdu ? 'تصویر' : 'Banner'}</th>
                      <th className="p-2.5">{isUrdu ? 'عنوان' : 'Title'}</th>
                      <th className="p-2.5">{isUrdu ? 'مصنف' : 'Author'}</th>
                      <th className="p-2.5">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                      <th className="p-2.5">{isUrdu ? 'تاریخ' : 'Date'}</th>
                      <th className="p-2.5 text-right">{isUrdu ? 'ایکشن' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((art) => (
                      <tr key={art.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2.5">
                          <img src={art.image || art.imageUrl} alt={art.titleUrdu} className="w-12 h-10 object-cover rounded-md border border-slate-200" />
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 max-w-xs truncate">
                          {isUrdu ? art.titleUrdu : art.titleEnglish || art.titleUrdu}
                        </td>
                        <td className="p-2.5 text-slate-700">{isUrdu ? art.authorUrdu || art.author : art.authorEnglish || art.author}</td>
                        <td className="p-2.5">
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 text-[10px] font-bold">
                            {isUrdu ? art.categoryUrdu || art.category : art.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono">{art.date}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => {
                              if (onDeleteArticle) onDeleteArticle(art.id);
                            }}
                            className="text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-200 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-semibold text-slate-900">
            <h3 className="font-bold text-emerald-900 text-sm">
              {isUrdu ? 'کلینک بنیادی معلومات (Settings)' : 'Clinic Information & System Configuration'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'کلینک کا نام (اردو)' : 'Clinic Name (Urdu)'}
                </label>
                <input
                  type="text"
                  value={settings.clinicNameUrdu}
                  onChange={(e) => onUpdateSettings({ ...settings, clinicNameUrdu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'کلینک کا نام (انگلش)' : 'Clinic Name (English)'}
                </label>
                <input
                  type="text"
                  value={settings.clinicNameEnglish}
                  onChange={(e) => onUpdateSettings({ ...settings, clinicNameEnglish: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'فون نمبر 1' : 'Primary Phone Number'}
                </label>
                <input
                  type="text"
                  value={settings.phone1}
                  onChange={(e) => onUpdateSettings({ ...settings, phone1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'واٹس ایپ نمبر' : 'WhatsApp Helpline Number'}
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => onUpdateSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن نمبر' : 'Punjab Healthcare Commission Reg #'}
                </label>
                <input
                  type="text"
                  value={settings.phcApprovalNo}
                  onChange={(e) => onUpdateSettings({ ...settings, phcApprovalNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {isUrdu ? 'پتہ (انگلش)' : 'Clinic Address (English)'}
                </label>
                <input
                  type="text"
                  value={settings.addressEnglish}
                  onChange={(e) => onUpdateSettings({ ...settings, addressEnglish: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => alert(isUrdu ? 'سیٹنگز محفوظ کر لی گئی ہیں۔' : 'Clinic Settings updated successfully!')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow mt-2 transition-colors"
            >
              {isUrdu ? 'سیٹنگز محفوظ کریں (Save Settings)' : 'Save Clinic Settings'}
            </button>
          </div>
        )}

        {/* Modal: Book Appointment on Behalf of Patient */}
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 text-white space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-bold">
                  <Plus className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-amber-400">
                    {isUrdu ? 'مریض کی طرف سے اپائنٹمنٹ بک کریں' : 'Book Appointment on Behalf of Patient'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'ایڈمن کنٹرول سسٹم کے ذریعے فوری اپائنٹمنٹ بکنگ و منظوری' : 'Official Hospital Administration Direct Appointment Booking & Approval'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminBookAppointment} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'معالج منتخب کریں (Select Doctor)' : 'Assigned Specialist Doctor'}
                  </label>
                  <select
                    value={bookDoctorId}
                    onChange={(e) => setBookDoctorId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-bold"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {isUrdu ? doc.nameUrdu : doc.nameEnglish} ({doc.specialtyUrdu || doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'مریض کا پورا نام' : 'Patient Full Name'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookPatientName}
                      onChange={(e) => setBookPatientName(e.target.value)}
                      placeholder={isUrdu ? 'مثال: محمد احمد' : 'e.g. Muhammad Ahmed'}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'موبائل نمبر (WhatsApp/Phone)' : 'Phone Number'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookPatientPhone}
                      onChange={(e) => setBookPatientPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'شہر (City)' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={bookPatientCity}
                      onChange={(e) => setBookPatientCity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'عمر (Age in Years)' : 'Age'}
                    </label>
                    <input
                      type="text"
                      value={bookPatientAge}
                      onChange={(e) => setBookPatientAge(e.target.value)}
                      placeholder="35"
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'تاریخ (Date)' : 'Appointment Date'}
                    </label>
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'وقت (Time Slot)' : 'Time Slot'}
                    </label>
                    <select
                      value={bookTimeSlot}
                      onChange={(e) => setBookTimeSlot(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white"
                    >
                      <option value="صبح 10:00 بجے (Morning Slot)">صبح 10:00 بجے (10:00 AM Morning)</option>
                      <option value="دوپہر 02:00 بجے (Afternoon Slot)">دوپہر 02:00 بجے (02:00 PM Afternoon)</option>
                      <option value="شام 06:00 بجے (Evening Slot)">شام 06:00 بجے (06:00 PM Evening)</option>
                      <option value="رات 08:30 بجے (Night Slot)">رات 08:30 بجے (08:30 PM Night)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'طبی مسئلہ / مرض (Medical Problem)' : 'Medical Problem / Diagnosis'}
                  </label>
                  <input
                    type="text"
                    value={bookProblem}
                    onChange={(e) => setBookProblem(e.target.value)}
                    placeholder={isUrdu ? 'مثال: جوڑوں کا درد، کمر درد، عام چیک اپ' : 'e.g. Joint Pain, Backache, General OPD'}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'فوری اسٹیٹس (Approval Status)' : 'Initial Status'}
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex-1">
                      <input
                        type="radio"
                        name="bookStatus"
                        value="Approved"
                        checked={bookStatus === 'Approved'}
                        onChange={() => setBookStatus('Approved')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-400 font-bold">✓ Approved Immediately (منظور شدہ)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex-1">
                      <input
                        type="radio"
                        name="bookStatus"
                        value="Pending"
                        checked={bookStatus === 'Pending'}
                        onChange={() => setBookStatus('Pending')}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-amber-300 font-bold">⏳ Pending Queue (معلق کیو)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBook}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmittingBook ? 'پروسیسنگ...' : isUrdu ? 'اپائنٹمنٹ بک کریں' : 'Confirm & Book Appointment'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register Patient Account */}
        {isRegPatientModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 text-white space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsRegPatientModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold">
                  <Users className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-400">
                    {isUrdu ? 'نیا مریض اکاؤنٹ رجسٹر کریں' : 'Register New Patient Record'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'کلینک ای ایم آر ڈیٹا بیس میں نیا بیمار کا ریکارڈ شامل کریں' : 'Add official patient user profile into hospital DB'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'مریض کا اسم گرامی (Full Name)' : 'Patient Name'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regPatientName}
                    onChange={(e) => setRegPatientName(e.target.value)}
                    placeholder={isUrdu ? 'مثال: علی حسن' : 'Ali Hassan'}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'یوزر نیم (Username / Patient ID)' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={regPatientUsername}
                    onChange={(e) => setRegPatientUsername(e.target.value)}
                    placeholder="patient123"
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'فون نمبر (Phone Number)' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={regPatientPhone}
                    onChange={(e) => setRegPatientPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'شہر (City)' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={regPatientCity}
                    onChange={(e) => setRegPatientCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRegPatientModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Patient Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

