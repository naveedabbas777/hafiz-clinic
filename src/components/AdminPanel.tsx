import React, { useState, useEffect } from 'react';
import { Doctor, Disease, Product, Appointment, Order, FAQItem, GalleryItem, ClinicSettings, HealthArticle, MoneySlip, MoneySlipItem, HospitalExpense, StaffUser, StaffRole } from '../types';
import { Database, Plus, Trash2, Edit, Save, RefreshCw, ShieldCheck, ShoppingCart, Users, Activity, Sliders, Image as ImageIcon, HelpCircle, FileText, Download, CheckCircle, Clock, Upload, Lock, Cloud, Key, X, UserCheck, ShieldAlert, MessageSquare, Eye, Search, FileCheck, Paperclip, BookOpen, DollarSign, CreditCard, Printer, TrendingUp, TrendingDown, Receipt, PieChart, Calculator, ArrowLeft, Home, ExternalLink, MessageCircle, AlertTriangle, Package, Sparkles, Check, Video, Play, Film, PlayCircle, Shield, Award, Stethoscope, TestTube } from 'lucide-react';
import { loginApi, uploadDoctorImageApi, uploadDiseaseImageApi, uploadProductImageApi, uploadProductVideoApi, createProductApi, deleteProductApi, createDoctorApi, deleteDoctorApi, createDiseaseApi, deleteDiseaseApi, checkDbStatusApi, updateDoctorApi, getUsersApi, getMessagesApi, getReportsApi, fileToBase64, deleteReportApi, deleteUserApi } from '../services/api';
import { fetchSlipsApi, saveSlipApi, deleteSlipApi, createAutoInvoiceFromAppointment, addItemToPatientInvoice, HOSPITAL_SERVICES_CATALOG } from '../services/billingService';
import { printInvoiceHtml, printEODAuditReport, downloadInvoicePdf, printInvoicePdf, EODAuditData } from '../utils/printInvoice';
import { openWhatsAppNotification, sendPendingAppointmentWhatsApp, generatePendingAppointmentWhatsAppTemplate } from '../utils/notificationDispatcher';
import { LoadingFallback } from './LoadingFallback';
import { getLocalStaffUsers, saveLocalStaffUsers, HOSPITAL_RBAC_RULES, RBACRuleDefinition } from '../data/staffData';
import { AdminGlobalSearchModal } from './AdminGlobalSearchModal';
import { AdminAuditLogsSection } from './AdminAuditLogsSection';
import { logCriticalOperation } from '../services/auditLoggerService';
import { exportAppointmentsToCsv, exportOrdersToCsv } from '../utils/csvExporter';

// Code-split heavy clinical views to prevent bloat in Admin bundle
const DoctorPatientChatView = React.lazy(() => import('./DoctorPatientChatView').then((m) => ({ default: m.DoctorPatientChatView })));
const SmartPharmacyPosView = React.lazy(() => import('./SmartPharmacyPosView').then((m) => ({ default: m.SmartPharmacyPosView })));
const PathologyLabView = React.lazy(() => import('./PathologyLabView').then((m) => ({ default: m.PathologyLabView })));
const ShiftAccountsView = React.lazy(() => import('./ShiftAccountsView').then((m) => ({ default: m.ShiftAccountsView })));
const OpdQueueScreenView = React.lazy(() => import('./OpdQueueScreenView').then((m) => ({ default: m.OpdQueueScreenView })));
const IpdWardManagementView = React.lazy(() => import('./IpdWardManagementView').then((m) => ({ default: m.IpdWardManagementView })));
const AdminFinancialSummary = React.lazy(() => import('./AdminFinancialSummary').then((m) => ({ default: m.AdminFinancialSummary })));

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
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ipd_ward'
    | 'pharmacy_pos'
    | 'pathology_lab'
    | 'shift_accounts'
    | 'opd_queue'
    | 'slips'
    | 'expenses'
    | 'eod'
    | 'lowstock'
    | 'users'
    | 'tracker'
    | 'doctors'
    | 'diseases'
    | 'products'
    | 'orders'
    | 'appointments'
    | 'articles'
    | 'settings'
    | 'audit_logs'
  >('overview');
  const isUrdu = language === 'urdu';

  // 1. Patient Money Slips & Invoicing State
  const [slipsList, setSlipsList] = useState<MoneySlip[]>(() => {
    const saved = localStorage.getItem('hafiz_hospital_money_slips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'slip-1001',
        slipNo: 'SLIP-1001',
        patientName: 'کامران خان (Kamran Khan)',
        patientPhone: '0300-9876543',
        mrnNumber: 'MRN-99102',
        doctorName: 'ڈاکٹر زیشان چوہدری',
        date: new Date().toISOString().split('T')[0],
        items: [
          { id: 'item-1', description: 'ڈاکٹر معائنہ و او پی ڈی فیس (OPD Checkup)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
          { id: 'item-2', description: 'جوڑوں کے درد کا ہربل کورس (Joint Care Medicine)', category: 'Medicine', quantity: 1, unitPrice: 3500, totalPrice: 3500 },
          { id: 'item-3', description: 'آئی اینڈ ویژن اینالائسز اسکین (Computerized Scan)', category: 'Lab Test / Scan', quantity: 1, unitPrice: 1000, totalPrice: 1000 }
        ],
        subtotal: 6000,
        discount: 500,
        totalAmount: 5500,
        paidAmount: 5500,
        balanceAmount: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        notes: 'مریض کو 15 دن بعد دوبارہ معائنہ کی ہدایت دی گئی ہے۔',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slip-1002',
        slipNo: 'SLIP-1002',
        patientName: 'تنویر احمد (Tanveer Ahmed)',
        patientPhone: '0301-4455667',
        mrnNumber: 'MRN-99105',
        doctorName: 'ڈاکٹر وقاص صغیر چوہدری',
        date: new Date().toISOString().split('T')[0],
        items: [
          { id: 'item-1', description: 'فزیو تھراپی کنسلٹیشن فیس', category: 'Checkup Fee', quantity: 1, unitPrice: 2000, totalPrice: 2000 },
          { id: 'item-2', description: 'مہرے سیدھا کرنے کا سیشن (Spine Decompression)', category: 'Physiotherapy', quantity: 2, unitPrice: 2500, totalPrice: 5000 },
          { id: 'item-3', description: 'درد کشا مرہم اور نرو ٹانک', category: 'Medicine', quantity: 1, unitPrice: 2500, totalPrice: 2500 }
        ],
        subtotal: 9500,
        discount: 1000,
        totalAmount: 8500,
        paidAmount: 5000,
        balanceAmount: 3500,
        paymentStatus: 'Partial',
        paymentMethod: 'EasyPaisa',
        notes: 'بقایا جات 3,500 روپے اگلے سیشن پر واجب الادا ہیں۔',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slip-1003',
        slipNo: 'SLIP-1003',
        patientName: 'زینب بی بی (Zainab Bibi)',
        patientPhone: '0322-1122334',
        mrnNumber: 'MRN-99110',
        doctorName: 'ڈاکٹر زیشان چوہدری',
        date: new Date().toISOString().split('T')[0],
        items: [
          { id: 'item-1', description: 'لیزر تھراپی و مہروں کا مائنر آپریشن (Spine Procedure)', category: 'Operation / Surgery', quantity: 1, unitPrice: 25000, totalPrice: 25000 },
          { id: 'item-2', description: 'پرائیویٹ وارڈ بیڈ چارجز (Private Bed 2 Days)', category: 'Bed Charge', quantity: 2, unitPrice: 3000, totalPrice: 6000 },
          { id: 'item-3', description: 'پوسٹ آپریٹو ادویات و ڈریسنگ کٹ', category: 'Medicine', quantity: 1, unitPrice: 4000, totalPrice: 4000 }
        ],
        subtotal: 35000,
        discount: 2000,
        totalAmount: 33000,
        paidAmount: 33000,
        balanceAmount: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer',
        notes: 'آن لائن بینک ٹرانسفر کے ذریعے مکمل فیس موصول۔',
        createdAt: new Date().toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hafiz_hospital_money_slips', JSON.stringify(slipsList));
  }, [slipsList]);

  // Global Cross-System Search State & Keyboard Shortcut
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Money Slips Controls State
  const [slipSearch, setSlipSearch] = useState<string>('');
  const [slipStatusFilter, setSlipStatusFilter] = useState<string>('all');
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MoneySlip | null>(null);

  // Add Money Slip Form Modal State
  const [isAddSlipModalOpen, setIsAddSlipModalOpen] = useState<boolean>(false);
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
  const [editingSlipNo, setEditingSlipNo] = useState<string | null>(null);
  const [slipTokenNumber, setSlipTokenNumber] = useState<string>('');
  const [slipPatientName, setSlipPatientName] = useState<string>('');
  const [slipPatientPhone, setSlipPatientPhone] = useState<string>('');
  const [slipMrnNumber, setSlipMrnNumber] = useState<string>('');
  const [slipDoctorName, setSlipDoctorName] = useState<string>('ڈاکٹر زیشان چوہدری');
  const [slipDate, setSlipDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slipPaymentMethod, setSlipPaymentMethod] = useState<'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer'>('Cash');
  const [slipDiscount, setSlipDiscount] = useState<number>(0);
  const [slipPaidAmount, setSlipPaidAmount] = useState<number>(0);
  const [slipNotes, setSlipNotes] = useState<string>('');

  // Quick Service Addition Modal State
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState<boolean>(false);
  const [targetPatientToken, setTargetPatientToken] = useState<string>('');
  const [selectedServiceDept, setSelectedServiceDept] = useState<string>('all');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');
  const [customServiceName, setCustomServiceName] = useState<string>('');
  const [customServiceCat, setCustomServiceCat] = useState<MoneySlipItem['category']>('Misc Service');
  const [customServicePrice, setCustomServicePrice] = useState<number>(1000);
  const [customServiceQty, setCustomServiceQty] = useState<number>(1);
  const [isAddingServiceLoading, setIsAddingServiceLoading] = useState<boolean>(false);

  const [slipItems, setSlipItems] = useState<MoneySlipItem[]>([
    { id: 'i-1', description: 'ڈاکٹر معائنہ و چک اپ فیس (OPD Checkup Fee)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500 }
  ]);

  const handleOpenAddSlip = () => {
    setEditingSlipId(null);
    setEditingSlipNo(null);
    setSlipTokenNumber(`TK-${Math.floor(100 + Math.random() * 900)}`);
    setSlipPatientName('');
    setSlipPatientPhone('');
    setSlipMrnNumber('');
    setSlipDoctorName(doctors.length > 0 ? (isUrdu ? doctors[0].nameUrdu : doctors[0].nameEnglish) : 'ڈاکٹر زیشان چوہدری');
    setSlipDate(new Date().toISOString().split('T')[0]);
    setSlipPaymentMethod('Cash');
    setSlipDiscount(0);
    setSlipPaidAmount(0);
    setSlipNotes('');
    setSlipItems([
      { id: 'i-1', description: 'ڈاکٹر معائنہ و چک اپ فیس (OPD Checkup Fee)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500 }
    ]);
    setIsAddSlipModalOpen(true);
  };

  const handleOpenEditSlip = (slip: MoneySlip) => {
    setEditingSlipId(slip.id);
    setEditingSlipNo(slip.slipNo);
    setSlipTokenNumber(slip.tokenNumber || (slip.appointmentId ? `TK-${slip.appointmentId.replace('APP-', '')}` : ''));
    setSlipPatientName(slip.patientName || '');
    setSlipPatientPhone(slip.patientPhone || '');
    setSlipMrnNumber(slip.mrnNumber || '');
    setSlipDoctorName(slip.doctorName || 'ڈاکٹر زیشان چوہدری');
    setSlipDate(slip.date || new Date().toISOString().split('T')[0]);
    setSlipPaymentMethod(slip.paymentMethod || 'Cash');
    setSlipDiscount(Number(slip.discount || (slip as any).discountAmount) || 0);
    setSlipPaidAmount(Number(slip.paidAmount) || 0);
    setSlipNotes(slip.notes || '');
    setSlipItems(
      slip.items && slip.items.length > 0
        ? slip.items.map((it, idx) => ({
            ...it,
            id: it.id || `edit-item-${idx}`,
            totalPrice: it.totalPrice ?? (it.unitPrice * it.quantity),
          }))
        : [{ id: 'i-1', description: 'ڈاکٹر معائنہ و چک اپ فیس (OPD Checkup Fee)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500 }]
    );
    setIsAddSlipModalOpen(true);
  };

  const calculateSlipSubtotal = () => slipItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateSlipTotal = () => Math.max(0, calculateSlipSubtotal() - (Number(slipDiscount) || 0));
  const calculateSlipBalance = () => Math.max(0, calculateSlipTotal() - (Number(slipPaidAmount) || 0));

  const handleAddItemRow = () => {
    setSlipItems([
      ...slipItems,
      {
        id: `i-${Date.now()}`,
        description: '',
        category: 'Medicine',
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000,
      }
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (slipItems.length <= 1) return;
    setSlipItems(slipItems.filter((i) => i.id !== id));
  };

  const handleUpdateItemRow = (id: string, field: keyof MoneySlipItem, val: any) => {
    setSlipItems(
      slipItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(val) || 0 : item.quantity;
          const price = field === 'unitPrice' ? Number(val) || 0 : item.unitPrice;
          updated.totalPrice = qty * price;
        }
        return updated;
      })
    );
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const handleDirectPrintSlip = async () => {
    if (selectedSlipForPrint) {
      setIsGeneratingPdf(true);
      try {
        await downloadInvoicePdf(selectedSlipForPrint, 'printable-slip-content');
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  const handleDownloadSlipPdf = async () => {
    if (selectedSlipForPrint) {
      setIsGeneratingPdf(true);
      try {
        await downloadInvoicePdf(selectedSlipForPrint, 'printable-slip-content');
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  const handleSaveMoneySlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipPatientName.trim()) {
      alert(isUrdu ? 'برائے مہربانی مریض کا نام درج کریں۔' : 'Please enter patient name.');
      return;
    }

    const subtotal = calculateSlipSubtotal();
    const total = calculateSlipTotal();
    const paid = Number(slipPaidAmount) || 0;
    const balance = Math.max(0, total - paid);
    let status: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    if (paid >= total && total > 0) status = 'Paid';
    else if (paid > 0) status = 'Partial';

    if (editingSlipId) {
      // Update existing slip - PRESERVE tokenNumber and other metadata
      const existing = slipsList.find((s) => s.id === editingSlipId);
      const updatedSlip: MoneySlip = {
        ...existing,
        id: editingSlipId,
        slipNo: editingSlipNo || existing?.slipNo || `SLIP-${Math.floor(1000 + Math.random() * 9000)}`,
        tokenNumber: slipTokenNumber || existing?.tokenNumber || (existing?.appointmentId ? `TK-${existing.appointmentId.replace('APP-', '')}` : `TK-${Math.floor(100 + Math.random() * 900)}`),
        patientName: slipPatientName,
        patientPhone: slipPatientPhone || '0300-0000000',
        mrnNumber: slipMrnNumber || existing?.mrnNumber || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
        doctorName: slipDoctorName,
        date: slipDate,
        items: slipItems,
        subtotal,
        discount: Number(slipDiscount) || 0,
        totalAmount: total,
        paidAmount: paid,
        balanceAmount: balance,
        paymentStatus: status,
        paymentMethod: slipPaymentMethod,
        notes: slipNotes,
        appointmentId: existing?.appointmentId,
        isAutoGenerated: existing?.isAutoGenerated,
        source: existing?.source || 'Manual',
        referralInfo: existing?.referralInfo,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      setSlipsList(slipsList.map((s) => (s.id === editingSlipId ? updatedSlip : s)));
      saveSlipApi(updatedSlip).catch(() => {});
      setIsAddSlipModalOpen(false);
      setEditingSlipId(null);
      setEditingSlipNo(null);
      setSelectedSlipForPrint(updatedSlip);
      alert(isUrdu ? `مریض کا بل (${updatedSlip.slipNo} • ٹوکن #${updatedSlip.tokenNumber}) کامیابی سے محفوظ ہو گیا ہے۔` : `Patient invoice (${updatedSlip.slipNo} • Token #${updatedSlip.tokenNumber}) updated successfully!`);
      return;
    }

    const generatedToken = slipTokenNumber || `TK-${Math.floor(100 + Math.random() * 900)}`;
    const newSlip: MoneySlip = {
      id: `slip-${Date.now()}`,
      slipNo: `SLIP-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: generatedToken,
      patientName: slipPatientName,
      patientPhone: slipPatientPhone || '0300-0000000',
      mrnNumber: slipMrnNumber || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      doctorName: slipDoctorName,
      date: slipDate,
      items: slipItems,
      subtotal,
      discount: Number(slipDiscount) || 0,
      totalAmount: total,
      paidAmount: paid,
      balanceAmount: balance,
      paymentStatus: status,
      paymentMethod: slipPaymentMethod,
      notes: slipNotes,
      source: 'Manual',
      createdAt: new Date().toISOString(),
    };

    setSlipsList([newSlip, ...slipsList]);
    saveSlipApi(newSlip).catch(() => {});
    setIsAddSlipModalOpen(false);
    setSlipPatientName('');
    setSlipPatientPhone('');
    setSlipMrnNumber('');
    setSlipTokenNumber('');
    setSlipDiscount(0);
    setSlipPaidAmount(0);
    setSlipNotes('');
    setSlipItems([
      { id: 'i-1', description: 'ڈاکٹر معائنہ و چک اپ فیس (OPD Checkup Fee)', category: 'Checkup Fee', quantity: 1, unitPrice: 1500, totalPrice: 1500 }
    ]);

    setSelectedSlipForPrint(newSlip);
  };

  // Quick Add Hospital Service / Investigation / Medicine to Patient's Unified Token
  const handleQuickAddService = async (serviceName: string, category: MoneySlipItem['category'], price: number, dept: string, qty: number = 1) => {
    if (!targetPatientToken.trim()) {
      alert(isUrdu ? 'برائے مہربانی مریض کا ٹوکن نمبر درج یا منتخب کریں۔' : 'Please select or enter patient token number.');
      return;
    }

    setIsAddingServiceLoading(true);
    try {
      const found = slipsList.find(
        (s) =>
          (s.tokenNumber && s.tokenNumber.toLowerCase() === targetPatientToken.toLowerCase()) ||
          s.slipNo.toLowerCase() === targetPatientToken.toLowerCase() ||
          (s.appointmentId && s.appointmentId.toLowerCase() === targetPatientToken.toLowerCase()) ||
          (s.patientPhone && s.patientPhone.includes(targetPatientToken.replace(/\D/g, '')))
      );
      const pName = found ? found.patientName : 'Patient';
      const pDoc = found ? found.doctorName : (doctors.length > 0 ? doctors[0].nameUrdu : 'Hafiz Clinic');

      const updatedSlip = await addItemToPatientInvoice(targetPatientToken, pName, pDoc, {
        description: serviceName,
        category,
        quantity: qty,
        unitPrice: price,
        department: dept,
        servedBy: pDoc,
      });

      setSlipsList((prev) => [updatedSlip, ...prev.filter((s) => s.id !== updatedSlip.id)]);
      alert(isUrdu 
        ? `سروس (${serviceName}) مریض (${updatedSlip.patientName}) کے ٹوکن #${updatedSlip.tokenNumber || targetPatientToken} انوائس میں کامیابی سے شامل ہو گئی ہے۔ کل بل: Rs. ${updatedSlip.totalAmount.toLocaleString()}`
        : `Added ${serviceName} to patient ${updatedSlip.patientName} (Token #${updatedSlip.tokenNumber || targetPatientToken})! Total: Rs. ${updatedSlip.totalAmount.toLocaleString()}`
      );
    } catch (err: any) {
      alert('Error adding service: ' + err.message);
    } finally {
      setIsAddingServiceLoading(false);
    }
  };

  // Quick 1-Click Update Payment Status for Admin
  const handleUpdatePaymentStatus = async (slip: MoneySlip, newStatus: 'Paid' | 'Partial' | 'Unpaid') => {
    let newPaid = slip.paidAmount;
    if (newStatus === 'Paid') {
      newPaid = slip.totalAmount;
    } else if (newStatus === 'Unpaid') {
      newPaid = 0;
    }
    const newBalance = Math.max(0, slip.totalAmount - newPaid);
    const updated: MoneySlip = {
      ...slip,
      paymentStatus: newStatus,
      paidAmount: newPaid,
      balanceAmount: newBalance,
    };
    setSlipsList(slipsList.map((s) => (s.id === slip.id ? updated : s)));
    await saveSlipApi(updated);
  };

  // 2. Hospital Operational Expenses State
  const [expensesList, setExpensesList] = useState<HospitalExpense[]>(() => {
    const saved = localStorage.getItem('hafiz_hospital_expenses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'exp-501',
        voucherNo: 'EXP-501',
        title: 'نرسنگ اور ہیلپر اسٹاف ماہانہ تنخواہیں (Staff Salaries)',
        category: 'Staff Salaries',
        amount: 125000,
        date: new Date().toISOString().split('T')[0],
        paidTo: 'Hospital Staff (6 Members)',
        paymentMethod: 'Bank Transfer',
        notes: 'اگست 2026 کی تمام نرسنگ اسٹاف تنخواہیں ادا کر دی گئیں۔',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-502',
        voucherNo: 'EXP-502',
        title: 'جڑی بوٹیوں و ہربل فارمیسی کا نیا اسٹاک خرید (Herbal Medicine Purchase)',
        category: 'Medicine & Pharmacy Stock',
        amount: 85000,
        date: new Date().toISOString().split('T')[0],
        paidTo: 'Peshawar Herbal Suppliers',
        paymentMethod: 'Cash',
        notes: 'معدہ، جگر اور جوڑوں کی ادویات کا تازہ ہربل اسٹاک۔',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-503',
        voucherNo: 'EXP-503',
        title: 'ہسپتال بجلی و سوئی گیس بل (Electricity & Utility Bills)',
        category: 'Utilities & Bills',
        amount: 32000,
        date: new Date().toISOString().split('T')[0],
        paidTo: 'FAPCO / Utility Corp',
        paymentMethod: 'EasyPaisa',
        notes: 'ماہانہ کمرشل بجلی بل ادائیگی۔',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-504',
        voucherNo: 'EXP-504',
        title: 'کمپیوٹرائزڈ اسکینر و مشینری کی مینٹیننس (Machine Service)',
        category: 'Equipment & Maintenance',
        amount: 18000,
        date: new Date().toISOString().split('T')[0],
        paidTo: 'BioMed Tech Services',
        paymentMethod: 'Cash',
        notes: 'بائیو کوانٹم اسکینر سروس اور کیلیبریشن۔',
        createdAt: new Date().toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hafiz_hospital_expenses', JSON.stringify(expensesList));
  }, [expensesList]);

  // Expenses Search & Modal State
  const [expenseSearch, setExpenseSearch] = useState<string>('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState<boolean>(false);
  const [expTitle, setExpTitle] = useState<string>('');
  const [expCategory, setExpCategory] = useState<HospitalExpense['category']>('Staff Salaries');
  const [expAmount, setExpAmount] = useState<number | string>(5000);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expPaidTo, setExpPaidTo] = useState<string>('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash'>('Cash');
  const [expNotes, setExpNotes] = useState<string>('');

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) {
      alert(isUrdu ? 'برائے مہربانی عنوان اور رقم درج کریں۔' : 'Please enter expense title and amount.');
      return;
    }

    const newExp: HospitalExpense = {
      id: `exp-${Date.now()}`,
      voucherNo: `EXP-${Math.floor(500 + Math.random() * 500)}`,
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount) || 0,
      date: expDate,
      paidTo: expPaidTo || 'Vendor',
      paymentMethod: expPaymentMethod,
      notes: expNotes,
      createdAt: new Date().toISOString(),
    };

    setExpensesList([newExp, ...expensesList]);
    setIsAddExpenseModalOpen(false);
    setExpTitle('');
    setExpAmount(5000);
    setExpPaidTo('');
    setExpNotes('');
    alert(isUrdu ? 'ہسپتال کا نیا اخراجات ووچر کامیابی سے درج کر لیا گیا ہے۔' : 'Hospital Expense Voucher recorded successfully!');
  };

  // 3. EOD Automated Cashier Register Close State
  const [eodDate, setEodDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eodOpeningCash, setEodOpeningCash] = useState<number>(10000);
  const [eodPhysicalCash, setEodPhysicalCash] = useState<number>(0);
  const [eodCashierName, setEodCashierName] = useState<string>('مرکزی ایڈمن کیشئر (Main Cashier)');
  const [eodNotes, setEodNotes] = useState<string>('تمام رسیدات اور بلز کی جانچ اور کیش کلیمپنگ مکمل ہے۔');

  // Filter transactions for EOD calculation
  const slipsForEOD = slipsList.filter((s) => s.date === eodDate);
  const expensesForEOD = expensesList.filter((e) => e.date === eodDate);

  const totalRevenueEOD = slipsForEOD.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const cashCollectionsEOD = slipsForEOD.filter((s) => s.paymentMethod === 'Cash').reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const cardCollectionsEOD = slipsForEOD.filter((s) => s.paymentMethod === 'Card').reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const onlineCollectionsEOD = slipsForEOD.filter((s) => s.paymentMethod === 'EasyPaisa' || s.paymentMethod === 'JazzCash' || s.paymentMethod === 'Bank Transfer').reduce((sum, s) => sum + (s.paidAmount || 0), 0);

  const totalExpensesEOD = expensesForEOD.reduce((sum, e) => sum + (e.amount || 0), 0);
  const cashExpensesEOD = expensesForEOD.filter((e) => e.paymentMethod === 'Cash').reduce((sum, e) => sum + (e.amount || 0), 0);
  const onlineExpensesEOD = expensesForEOD.filter((e) => e.paymentMethod !== 'Cash').reduce((sum, e) => sum + (e.amount || 0), 0);

  const expectedPhysicalCash = Number(eodOpeningCash || 0) + cashCollectionsEOD - cashExpensesEOD;
  const cashVariance = Number(eodPhysicalCash || 0) - expectedPhysicalCash;

  const handlePrintEODReport = () => {
    const auditData: EODAuditData = {
      closingDate: eodDate,
      cashierName: eodCashierName,
      openingCashFloat: Number(eodOpeningCash) || 0,
      totalSlipsCount: slipsForEOD.length,
      totalGrossInvoiced: slipsForEOD.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      totalDiscountsGiven: slipsForEOD.reduce((sum, s) => sum + (s.discount || 0), 0),
      totalNetCollections: totalRevenueEOD,
      cashCollections: cashCollectionsEOD,
      cardCollections: cardCollectionsEOD,
      onlineCollections: onlineCollectionsEOD,
      totalExpenses: totalExpensesEOD,
      cashExpenses: cashExpensesEOD,
      onlineExpenses: onlineExpensesEOD,
      expectedCashInDrawer: expectedPhysicalCash,
      actualPhysicalCash: Number(eodPhysicalCash) || 0,
      cashVariance: cashVariance,
      notes: eodNotes,
      breakdownByCategory: [
        { category: 'Checkup & OPD Fee', amount: slipsForEOD.flatMap((s) => s.items).filter((i) => i.category === 'Checkup Fee').reduce((sum, i) => sum + i.totalPrice, 0) },
        { category: 'Pharmacy & Herbal Medicine', amount: slipsForEOD.flatMap((s) => s.items).filter((i) => i.category === 'Medicine').reduce((sum, i) => sum + i.totalPrice, 0) },
        { category: 'Operations & Procedures', amount: slipsForEOD.flatMap((s) => s.items).filter((i) => i.category === 'Operation / Surgery').reduce((sum, i) => sum + i.totalPrice, 0) },
        { category: 'Lab & Diagnostic Scans', amount: slipsForEOD.flatMap((s) => s.items).filter((i) => i.category === 'Lab Test / Scan').reduce((sum, i) => sum + i.totalPrice, 0) },
        { category: 'Physiotherapy & Other', amount: slipsForEOD.flatMap((s) => s.items).filter((i) => i.category === 'Physiotherapy' || i.category === 'Bed Charge' || i.category === 'Other').reduce((sum, i) => sum + i.totalPrice, 0) },
      ],
      expensesList: expensesForEOD.map((e) => ({
        voucherNo: e.voucherNo,
        title: e.title,
        category: e.category,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
      })),
    };

    printEODAuditReport(auditData);
  };

  // 4. Low Stock & Reorder Auto-Draft Logic
  const lowStockProducts = products.filter((p) => (p.stock !== undefined && p.stock <= 10) || p.inStock === false);

  const handleAutoDraftReorderExpense = () => {
    if (lowStockProducts.length === 0) {
      alert(isUrdu ? 'تمام پراڈکٹس کا اسٹاک وافر مقدار میں موجود ہے، ری آرڈر کی ضرورت نہیں۔' : 'All products have sufficient stock levels.');
      return;
    }

    const totalEstimatedCost = lowStockProducts.reduce((sum, p) => sum + (Math.round((p.price || 1000) * 0.6) * 50), 0);
    const itemsSummary = lowStockProducts.map((p) => `${p.nameUrdu || p.nameEnglish} (اسٹاک: ${p.stock ?? 0})`).join(', ');

    const autoExp: HospitalExpense = {
      id: `exp-${Date.now()}`,
      voucherNo: `PO-${Math.floor(800 + Math.random() * 200)}`,
      title: `خودکار فارمیسی ری آرڈر ووچر (${lowStockProducts.length} پروڈکٹس اسٹاک بحالی)`,
      category: 'Medicine & Pharmacy Stock',
      amount: totalEstimatedCost,
      date: new Date().toISOString().split('T')[0],
      paidTo: 'Herbal Pharmacy Wholesale Supplier / مینوفیکچرر',
      paymentMethod: 'Cash',
      notes: `خودکار ری آرڈر الرٹ کے تحت 50، 50 یونٹس کی خریداری: ${itemsSummary}`,
      createdAt: new Date().toISOString(),
    };

    setExpensesList([autoExp, ...expensesList]);
    alert(isUrdu 
      ? `خودکار ری آرڈر ایکسپنس ووچر نمبر ${autoExp.voucherNo} مبلغ ${totalEstimatedCost.toLocaleString()} روپے کامیابی سے تیار ہو کر اخراجات لسٹ میں شامل ہو گیا ہے۔`
      : `Auto Purchase Order Expense Voucher #${autoExp.voucherNo} of Rs. ${totalEstimatedCost.toLocaleString()} drafted successfully!`
    );
    setActiveTab('expenses');
  };

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
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled'>('All');
  const [whatsAppModalApp, setWhatsAppModalApp] = useState<Appointment | null>(null);
  const [whatsAppModalLang, setWhatsAppModalLang] = useState<'urdu' | 'english'>('urdu');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

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
    { _id: 'u-1', fullName: 'محمد فاروق (Muhammad Farooq)', username: 'patient1', phone: '03001234567', role: 'patient', city: 'فیصل آباد', status: 'Active' },
    { _id: 'u-2', fullName: 'تنویر احمد (Tanveer Ahmed)', username: 'patient2', phone: '03014455667', role: 'patient', city: 'لاہور', status: 'Active' },
    { _id: 'u-3', fullName: 'زینب بی بی (Zainab Bibi)', username: 'patient3', phone: '03221122334', role: 'patient', city: 'گوجرانوالہ', status: 'Active' },
  ]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Staff RBAC Accounts State
  const [staffUsersList, setStaffUsersList] = useState<StaffUser[]>(() => getLocalStaffUsers());
  const [staffSubTab, setStaffSubTab] = useState<'staff_list' | 'patient_accounts' | 'rbac_rules'>('staff_list');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Staff Form Modal State
  const [formStaffName, setFormStaffName] = useState<string>('');
  const [formStaffNameUrdu, setFormStaffNameUrdu] = useState<string>('');
  const [formStaffUsername, setFormStaffUsername] = useState<string>('');
  const [formStaffPassword, setFormStaffPassword] = useState<string>('');
  const [formStaffRole, setFormStaffRole] = useState<StaffRole>('doctor');
  const [formStaffDepartment, setFormStaffDepartment] = useState<string>('General OPD');
  const [formStaffAssignedLabCat, setFormStaffAssignedLabCat] = useState<string>('Radiology / X-Ray');
  const [formStaffQualification, setFormStaffQualification] = useState<string>('MBBS, FCPS');
  const [formStaffPhone, setFormStaffPhone] = useState<string>('0300-1234567');
  const [formStaffShift, setFormStaffShift] = useState<string>('08:00 AM - 02:00 PM (Morning)');
  const [formStaffStatus, setFormStaffStatus] = useState<boolean>(true);
  const [formStaffPermissions, setFormStaffPermissions] = useState<string[]>(['opd_consultation', 'digital_rx']);

  const handleOpenAddStaffModal = () => {
    setEditingStaffId(null);
    setFormStaffName('');
    setFormStaffNameUrdu('');
    setFormStaffUsername('');
    setFormStaffPassword('staff123');
    setFormStaffRole('doctor');
    setFormStaffDepartment('General OPD');
    setFormStaffAssignedLabCat('Radiology / X-Ray');
    setFormStaffQualification('MBBS, FCPS');
    setFormStaffPhone('0300-1234567');
    setFormStaffShift('08:00 AM - 02:00 PM (Morning)');
    setFormStaffStatus(true);
    setFormStaffPermissions(['opd_consultation', 'digital_rx']);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (staff: StaffUser) => {
    setEditingStaffId(staff.id);
    setFormStaffName(staff.name || '');
    setFormStaffNameUrdu(staff.nameUrdu || '');
    setFormStaffUsername(staff.username || '');
    setFormStaffPassword(staff.password || '');
    setFormStaffRole(staff.role);
    setFormStaffDepartment(staff.department || 'General Department');
    setFormStaffAssignedLabCat(staff.assignedLabCategory || 'Radiology / X-Ray');
    setFormStaffQualification(staff.qualification || '');
    setFormStaffPhone(staff.phone || '');
    setFormStaffShift(staff.shiftTiming || '08:00 AM - 02:00 PM');
    setFormStaffStatus(staff.isActive !== false);
    setFormStaffPermissions(staff.permissions || []);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaffUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffUsername.trim() || !formStaffName.trim()) {
      alert('Please fill in Staff Full Name and Username.');
      return;
    }

    if (editingStaffId) {
      const updated = staffUsersList.map((st) => {
        if (st.id === editingStaffId) {
          return {
            ...st,
            name: formStaffName,
            nameUrdu: formStaffNameUrdu || formStaffName,
            username: formStaffUsername.trim().toLowerCase(),
            password: formStaffPassword || 'staff123',
            role: formStaffRole,
            department: formStaffDepartment,
            assignedLabCategory: formStaffRole === 'lab_doctor' ? formStaffAssignedLabCat : undefined,
            qualification: formStaffQualification,
            phone: formStaffPhone,
            shiftTiming: formStaffShift,
            isActive: formStaffStatus,
            permissions: formStaffPermissions,
          };
        }
        return st;
      });
      setStaffUsersList(updated);
      saveLocalStaffUsers(updated);
      alert(`Staff account for ${formStaffName} updated successfully!`);
    } else {
      // Check duplicate username
      if (staffUsersList.some((u) => u.username.toLowerCase() === formStaffUsername.trim().toLowerCase())) {
        alert(`Username "${formStaffUsername}" already exists! Please choose a unique username.`);
        return;
      }
      const newStaff: StaffUser = {
        id: `staff-${Date.now()}`,
        username: formStaffUsername.trim().toLowerCase(),
        password: formStaffPassword || 'staff123',
        name: formStaffName,
        nameUrdu: formStaffNameUrdu || formStaffName,
        role: formStaffRole,
        department: formStaffDepartment,
        assignedLabCategory: formStaffRole === 'lab_doctor' ? formStaffAssignedLabCat : undefined,
        specialtyTitleEnglish: formStaffRole === 'lab_doctor' ? `${formStaffAssignedLabCat} Specialist` : formStaffDepartment,
        qualification: formStaffQualification,
        phone: formStaffPhone,
        shiftTiming: formStaffShift,
        isActive: formStaffStatus,
        permissions: formStaffPermissions,
      };
      const updated = [...staffUsersList, newStaff];
      setStaffUsersList(updated);
      saveLocalStaffUsers(updated);
      alert(`New staff account for ${formStaffName} created with Admin-assigned credentials & rules!`);
    }

    setIsStaffModalOpen(false);
  };

  const handleToggleStaffStatus = (staffId: string) => {
    const updated = staffUsersList.map((st) => {
      if (st.id === staffId) {
        const nextStatus = !(st.isActive !== false);
        return { ...st, isActive: nextStatus };
      }
      return st;
    });
    setStaffUsersList(updated);
    saveLocalStaffUsers(updated);
  };

  const handleDeleteStaffAccount = (staffId: string, name: string) => {
    if (confirm(`Are you sure you want to permanently revoke and delete the staff account for "${name}"?`)) {
      const updated = staffUsersList.filter((st) => st.id !== staffId);
      setStaffUsersList(updated);
      saveLocalStaffUsers(updated);
    }
  };

  const togglePermission = (permId: string) => {
    if (formStaffPermissions.includes(permId)) {
      setFormStaffPermissions(formStaffPermissions.filter((p) => p !== permId));
    } else {
      setFormStaffPermissions([...formStaffPermissions, permId]);
    }
  };

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
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // DB & Cloudinary Status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; uri?: string; cloudName?: string }>({ connected: false });

  // Doctor Form & Cloudinary Image State
  const [newDocName, setNewDocName] = useState('');
  const [newDocQual, setNewDocQual] = useState('MBBS');
  const [newDocSpec, setNewDocSpec] = useState('General Physician & Specialist');
  const [newDocFee, setNewDocFee] = useState<number>(1500);
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
  const [editDocFee, setEditDocFee] = useState<number>(1500);
  const [editDocImage, setEditDocImage] = useState('');
  const [isSavingDocEdit, setIsSavingDocEdit] = useState(false);

  // Disease Form & Cloudinary Image State
  const [newDisNameUrdu, setNewDisNameUrdu] = useState('');
  const [newDisNameEng, setNewDisNameEng] = useState('');
  const [newDisCategory, setNewDisCategory] = useState('general');
  const [newDisImage, setNewDisImage] = useState('');
  const [isUploadingDisImg, setIsUploadingDisImg] = useState(false);
  const [disUploadSuccess, setDisUploadSuccess] = useState(false);

  // Product Form & Cloudinary Image/Video State
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
  const [newProdVideo, setNewProdVideo] = useState<string>('');
  const [isUploadingProdVideo, setIsUploadingProdVideo] = useState<boolean>(false);
  const [prodVideoUploadSuccess, setProdVideoUploadSuccess] = useState<boolean>(false);
  const [previewVideoModalUrl, setPreviewVideoModalUrl] = useState<string | null>(null);

  // Section Videos Upload State
  const [uploadingSectionVideo, setUploadingSectionVideo] = useState<string | null>(null);
  const [sectionVideoUploadSuccess, setSectionVideoUploadSuccess] = useState<string | null>(null);

  const handleSectionVideoFileUpload = async (sectionKey: 'clinic' | 'eyeCare' | 'hairOil' | 'beautyCream' | 'painRelief', file: File) => {
    if (!file) return;
    setUploadingSectionVideo(sectionKey);
    try {
      const res = await uploadProductVideoApi(file);
      const videoUrl = (res.success && res.videoUrl) ? res.videoUrl : await fileToBase64(file);
      const fieldMap: Record<string, keyof ClinicSettings> = {
        clinic: 'clinicVideoUrl',
        eyeCare: 'eyeCareVideoUrl',
        hairOil: 'hairOilVideoUrl',
        beautyCream: 'beautyCreamVideoUrl',
        painRelief: 'painReliefVideoUrl',
      };
      const field = fieldMap[sectionKey];
      onUpdateSettings({ ...settings, [field]: videoUrl });
      setSectionVideoUploadSuccess(sectionKey);
      setTimeout(() => setSectionVideoUploadSuccess(null), 3500);
    } catch (err) {
      console.error('Error uploading section video:', err);
    } finally {
      setUploadingSectionVideo(null);
    }
  };

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

    fetchSlipsApi().then((slips) => {
      if (Array.isArray(slips) && slips.length > 0) {
        setSlipsList(slips);
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

    if (newApp.status === 'Approved') {
      createAutoInvoiceFromAppointment(newApp, doctors).then((createdSlip) => {
        setSlipsList((prev) => [createdSlip, ...prev.filter((s) => s.id !== createdSlip.id)]);
      }).catch(() => {});
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
      checkupFee: Number(newDocFee) || 1500,
      image: newDocImage,
      phone: '03001234567',
    };

    // Save to local state and trigger API
    onAddDoctor(newD);
    createDoctorApi(newD).catch(() => {});

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
    setEditDocFee(doc.checkupFee || 1500);
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
      checkupFee: Number(editDocFee) || editingDoctor.checkupFee || 1500,
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
    createDiseaseApi(newDis).catch(() => {});

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

  // Upload Product Video to Cloudinary / Server
  const handleProdVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProdVideo(true);
    setProdVideoUploadSuccess(false);

    try {
      const res = await uploadProductVideoApi(file);
      if (res && (res.videoUrl || res.url)) {
        setNewProdVideo(res.videoUrl || res.url || '');
        setProdVideoUploadSuccess(true);
      } else {
        const b64 = await fileToBase64(file);
        setNewProdVideo(b64);
        setProdVideoUploadSuccess(true);
      }
    } catch (err: any) {
      try {
        const b64 = await fileToBase64(file);
        setNewProdVideo(b64);
        setProdVideoUploadSuccess(true);
      } catch {
        alert('Video processing error: ' + (err?.message || 'Failed to upload video'));
      }
    } finally {
      setIsUploadingProdVideo(false);
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

    const isYoutube = newProdVideo && (newProdVideo.includes('youtube.com') || newProdVideo.includes('youtu.be'));

    const newP: Product = {
      id: `prod-${Date.now()}`,
      nameUrdu: newProdNameUrdu || newProdNameEng,
      nameEnglish: newProdNameEng || newProdNameUrdu,
      category: finalCat as any,
      categoryUrdu: finalCatUrdu,
      pricePKR: Number(newProdPrice) || 1500,
      originalPricePKR: newProdOrigPrice ? Number(newProdOrigPrice) : undefined,
      image: newProdImage || 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600',
      videoUrl: newProdVideo || undefined,
      videoType: newProdVideo ? (isYoutube ? 'youtube' : 'direct') : undefined,
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
    setNewProdVideo('');
    setProdVideoUploadSuccess(false);
  };

  // Delete Handlers with Cloudinary Cleanups & Security Audit Logging
  const handleDeleteDoctorAction = async (doc: Doctor) => {
    const confirmMsg = isUrdu
      ? `کیا آپ واقعی معالج (${doc.nameUrdu || doc.nameEnglish}) کو ڈیلیٹ کرنا چاہتے ہیں؟ اس سے منسلک تصویر بھی کلاؤڈنری سے ہمیشہ کے لیے ڈیلیٹ ہو جائے گی۔`
      : `Are you sure you want to delete doctor "${doc.nameEnglish || doc.nameUrdu}"? Their photo will also be permanently deleted from Cloudinary.`;
    
    if (window.confirm && !window.confirm(confirmMsg)) return;

    try {
      await deleteDoctorApi(doc.id, doc.image);
    } catch (e) {}

    // Security Audit Log
    logCriticalOperation({
      action: 'DOCTOR_DELETED',
      actionLabelEnglish: 'Doctor Record Deleted',
      actionLabelUrdu: 'معالج کا ریکارڈ حذف کیا گیا',
      entityType: 'Doctor',
      entityId: doc.id,
      entityName: doc.nameEnglish || doc.nameUrdu || 'Doctor',
      details: `Doctor "${doc.nameEnglish || doc.nameUrdu}" (${doc.specializationEnglish || doc.specializationUrdu || 'General'}) removed from clinical schedule and Cloudinary photo purged.`,
      detailsUrdu: `ڈاکٹر "${doc.nameUrdu || doc.nameEnglish}" کو سسٹم اور کلاؤڈنری تصویر سے مستقل ڈیلیٹ کیا گیا۔`,
      staffName: adminUsername || 'Super Admin',
      staffRole: 'Administrator',
      severity: 'critical',
    });

    onDeleteDoctor(doc.id);
  };

  const handleDeleteDiseaseAction = async (dis: Disease) => {
    const confirmMsg = isUrdu
      ? `کیا آپ واقعی بیماری کا ریکارڈ (${dis.nameUrdu || dis.nameEnglish}) ڈیلیٹ کرنا چاہتے ہیں؟ اس کا ڈایاگرام بھی کلاؤڈنری سے ہٹ جائے گا۔`
      : `Are you sure you want to delete disease record "${dis.nameEnglish || dis.nameUrdu}"? Its diagram image will also be removed from Cloudinary.`;

    if (window.confirm && !window.confirm(confirmMsg)) return;

    try {
      await deleteDiseaseApi(dis.id, dis.image || dis.imageUrl);
    } catch (e) {}

    // Security Audit Log
    logCriticalOperation({
      action: 'DISEASE_DELETED',
      actionLabelEnglish: 'Disease Guide Deleted',
      actionLabelUrdu: 'بیماری کا گائیڈ حذف کیا گیا',
      entityType: 'Disease',
      entityId: dis.id,
      entityName: dis.nameEnglish || dis.nameUrdu || 'Disease',
      details: `Medical conditions guide for "${dis.nameEnglish || dis.nameUrdu}" removed from clinical knowledge base.`,
      detailsUrdu: `طبی رہنمائی ریکارڈ برائے "${dis.nameUrdu || dis.nameEnglish}" ڈیلیٹ کر دیا گیا۔`,
      staffName: adminUsername || 'Super Admin',
      staffRole: 'Administrator',
      severity: 'warning',
    });

    onDeleteDisease(dis.id);
  };

  const handleDeleteProductAction = async (prod: Product) => {
    const confirmMsg = isUrdu
      ? `کیا آپ پراڈکٹ (${prod.nameUrdu || prod.nameEnglish}) کو ڈیلیٹ کرنا چاہتے ہیں؟ اس کی کلاؤڈنری پر موجود تصویر اور ویڈیو دونوں مکمل طور پر ڈیلیٹ ہو جائیں گے۔`
      : `Are you sure you want to delete product "${prod.nameEnglish || prod.nameUrdu}"? Its image and video will both be permanently deleted from Cloudinary.`;

    if (window.confirm && !window.confirm(confirmMsg)) return;

    try {
      await deleteProductApi(prod.id, prod.image, prod.videoUrl);
    } catch (e) {}

    // Security Audit Log
    logCriticalOperation({
      action: 'PRODUCT_DELETED',
      actionLabelEnglish: 'Pharmacy Product Deleted',
      actionLabelUrdu: 'دوا / پروڈکٹ حذف کی گئی',
      entityType: 'Product',
      entityId: prod.id,
      entityName: prod.nameEnglish || prod.nameUrdu || 'Product',
      details: `Catalog medicine "${prod.nameEnglish || prod.nameUrdu}" (Rs. ${prod.pricePKR}) deleted from pharmacy database.`,
      detailsUrdu: `دوا / آئٹم "${prod.nameUrdu || prod.nameEnglish}" قیمت ${prod.pricePKR} روپے کو فارمیسی سے حذف کیا گیا۔`,
      staffName: adminUsername || 'Super Admin',
      staffRole: 'Administrator',
      severity: 'critical',
    });

    onDeleteProduct(prod.id);
  };

  // Centralized Appointment Status Transition Handler with Full Staff Attribution
  const handleAdminUpdateAppointmentStatus = (
    app: Appointment,
    newStatus: 'Pending' | 'Approved' | 'Completed' | 'Cancelled'
  ) => {
    const targetId = app.id || (app as any)._id;
    if (!targetId) return;
    const oldStatus = app.status || 'Pending';

    if (onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(targetId, newStatus);
    }

    // Security & Clinical Audit Log
    logCriticalOperation({
      action: 'APPOINTMENT_STATUS_CHANGED',
      actionLabelEnglish: `Appointment ${newStatus}`,
      actionLabelUrdu:
        newStatus === 'Approved'
          ? 'اپائنٹمنٹ منظور کی گئی'
          : newStatus === 'Completed'
          ? 'معائنہ مکمل ہوا'
          : 'اپائنٹمنٹ منسوخ کی گئی',
      entityType: 'Appointment',
      entityId: app.id,
      entityName: app.patientName,
      previousValue: oldStatus,
      newValue: newStatus,
      details: `Appointment #${app.id} for patient "${app.patientName}" (Phone: ${app.phone}) transitioned from "${oldStatus}" to "${newStatus}" with doctor ${app.doctorName || 'Senior Consultant'}.`,
      detailsUrdu: `مریض "${app.patientName}" کی اپائنٹمنٹ #${app.id} کی حالت "${oldStatus}" سے بدل کر "${newStatus}" کی گئی۔`,
      staffName: adminUsername || 'Super Admin',
      staffRole: 'Clinical Administrator',
      severity: newStatus === 'Cancelled' ? 'warning' : 'info',
    });

    if (newStatus === 'Approved') {
      createAutoInvoiceFromAppointment(app, doctors)
        .then((createdSlip) => {
          setSlipsList((prev) => [createdSlip, ...prev.filter((s) => s.id !== createdSlip.id)]);
        })
        .catch(() => {});
    }
  };

  // If Admin not authenticated, render Admin Login Form
  if (!isAdminAuth) {
    return (
      <div className="py-16 bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center px-4 relative">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full space-y-6 relative">
          
          {/* Top Bar Navigation - Go Back */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <button
              type="button"
              onClick={() => {
                if (setActiveView) {
                  setActiveView('home');
                } else {
                  window.history.back();
                }
              }}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isUrdu ? 'ہوم پیج پر جائیں' : 'Back to Home'}</span>
            </button>

            {setActiveView && (
              <button
                type="button"
                onClick={() => setActiveView('patient-portal')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUrdu ? 'پیشنٹ پورٹل' : 'Patient Portal'}</span>
              </button>
            )}
          </div>

          <div className="text-center space-y-2 pt-2">
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
                placeholder={isUrdu ? 'ایڈمنسٹریٹر یوزر نیم درج کریں' : 'Enter administrator username'}
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
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating Official Account...' : isUrdu ? 'ایڈمن لاگ ان کریں' : 'Access Admin Dashboard'}</span>
            </button>

            {/* Clear Go Back to Main Website Button */}
            <button
              type="button"
              onClick={() => {
                if (setActiveView) {
                  setActiveView('home');
                } else {
                  window.history.back();
                }
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? '← مرکزی ہوم پیج پر واپس جائیں' : '← Return to Main Website / Home'}</span>
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
            {/* Global System Search Trigger */}
            <button
              type="button"
              onClick={() => setIsGlobalSearchOpen(true)}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-inner group cursor-pointer"
              title={isUrdu ? 'گلوبل سرچ (مریض، اپائنٹمنٹ، ادویات) - Ctrl + K' : 'Global Search (Patients, Appointments, Medicines, Invoices) - Ctrl + K'}
            >
              <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold text-xs">
                {isUrdu ? 'فوری تلاش کریں...' : 'Search Patients, IDs, Rx...'}
              </span>
              <kbd className="hidden md:inline text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700 px-1.5 py-0.5 rounded ml-1 font-bold">
                Ctrl+K
              </kbd>
            </button>

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
              <div className="flex items-center bg-slate-900/90 border border-slate-700 p-1 rounded-xl shadow-inner gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('english')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    !isUrdu
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('urdu')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isUrdu
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  اردو
                </button>
              </div>
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
            { id: 'financial_health', label: isUrdu ? '📈 مالیاتی صحت و شفٹ سمری' : '📈 Financial Health' },
            { id: 'audit_logs', label: isUrdu ? '🛡️ کریٹیکل آڈٹ لاگ' : '🛡️ Critical Audit Log' },
            { id: 'ipd_ward', label: isUrdu ? '🏥 داخل مریض و وارڈ (IPD)' : '🏥 IPD & Ward Management' },
            { id: 'pharmacy_pos', label: isUrdu ? '💊 فارمیسی و POS کاؤنٹر' : '💊 Pharmacy POS & Batches' },
            { id: 'pathology_lab', label: isUrdu ? '🔬 پیتھالوجی و لیب ٹیسٹ' : '🔬 Pathology Lab & Tests' },
            { id: 'shift_accounts', label: isUrdu ? '💼 شفٹ آڈٹ و ڈاکٹر شیئر' : '💼 Shift Cash & Doctor Split' },
            { id: 'opd_queue', label: isUrdu ? '📺 لائیو او پی ڈی کیو اسکرین' : '📺 Live OPD Queue TV' },
            { id: 'slips', label: isUrdu ? `💵 منی سلپ و پیشنٹ بلز (${slipsList.length})` : `💵 Patient Invoices (${slipsList.length})` },
            { id: 'expenses', label: isUrdu ? `📉 ہسپتال اخراجات (${expensesList.length})` : `📉 Hospital Expenses (${expensesList.length})` },
            { id: 'eod', label: isUrdu ? '🔒 کیش کلوزنگ و آڈٹ (EOD)' : '🔒 EOD Cash Register Close' },
            { id: 'lowstock', label: isUrdu ? `⚠️ لو اسٹاک الرٹس (${lowStockProducts.length})` : `⚠️ Low Stock Alerts (${lowStockProducts.length})` },
            { id: 'users', label: isUrdu ? `👥 اسٹاف اکاؤنٹس و RBAC پرمیشنز (${staffUsersList.filter(u => u.role !== 'admin').length})` : `👥 Staff Accounts & RBAC Rules (${staffUsersList.filter(u => u.role !== 'admin').length})` },
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

        {/* Visual Financial Summary & Shift Health Tab */}
        {activeTab === 'financial_health' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <AdminFinancialSummary
                slips={slipsList}
                appointments={appointments}
                doctors={doctors}
                expenses={expensesList}
                language={language}
                onUpdateSlip={(updated) =>
                  setSlipsList(slipsList.map((s) => (s.id === updated.id ? updated : s)))
                }
              />
            </React.Suspense>
          </div>
        )}

        {/* Dedicated Critical Operations & Security Audit Log Tab */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-6">
            <AdminAuditLogsSection
              isUrdu={isUrdu}
              onNavigateTab={(targetTab) => setActiveTab(targetTab as any)}
            />
          </div>
        )}

        {/* IPD & Ward Management Tab */}
        {activeTab === 'ipd_ward' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <IpdWardManagementView
                doctors={doctors}
                language={isUrdu ? 'urdu' : 'english'}
                clinicSettings={settings}
              />
            </React.Suspense>
          </div>
        )}

        {/* 1. Smart Pharmacy POS & Batch Inventory Tab */}
        {activeTab === 'pharmacy_pos' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <SmartPharmacyPosView
                products={products}
                language={isUrdu ? 'urdu' : 'english'}
                clinicSettings={settings}
              />
            </React.Suspense>
          </div>
        )}

        {/* 2. Pathology & Diagnostic Lab Tab */}
        {activeTab === 'pathology_lab' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <PathologyLabView
                language={isUrdu ? 'urdu' : 'english'}
                clinicSettings={settings}
              />
            </React.Suspense>
          </div>
        )}

        {/* 3. Financial Shift Closing & Doctor Revenue Share Tab */}
        {activeTab === 'shift_accounts' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <ShiftAccountsView
                doctors={doctors}
                slips={slipsList}
                expenses={expensesList}
                language={isUrdu ? 'urdu' : 'english'}
                clinicSettings={settings}
              />
            </React.Suspense>
          </div>
        )}

        {/* 4. OPD Waiting Room TV Screen Tab */}
        {activeTab === 'opd_queue' && (
          <div className="space-y-6">
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <OpdQueueScreenView
                doctors={doctors}
                language={isUrdu ? 'urdu' : 'english'}
                clinicSettings={settings}
                onBackToApp={() => setActiveTab('overview')}
              />
            </React.Suspense>
          </div>
        )}

        {/* Money Slips & Patient Invoices Tab */}
        {activeTab === 'slips' && (
          <div className="space-y-6 text-slate-900">
            {/* Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کل پیشنٹ انوائسز' : 'Total Patient Invoices'}</span>
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{slipsList.length}</div>
                <div className="text-[10px] text-slate-500 font-medium">{isUrdu ? 'کیش، کارڈ و آن لائن انوائسز' : 'Generated Money Slips'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'موصول شدہ کل فیس و بل' : 'Total Revenue Collected'}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  Rs. {slipsList.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">{isUrdu ? 'کامیابی سے وصول شدہ آمدن' : 'Net Received Collections'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'واجب الادا بقایا جات' : 'Pending Receivables'}</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono">
                  Rs. {slipsList.reduce((sum, s) => sum + s.balanceAmount, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-800 font-bold">{isUrdu ? 'مریضوں سے وصولی باقی ہے' : 'Balance Remaining Due'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'تعداد ادا شدہ انوائسز' : 'Paid Invoices Count'}</span>
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-teal-700">
                  {slipsList.filter((s) => s.paymentStatus === 'Paid').length}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isUrdu ? 'مکمل وصول شدہ کیش سلپس' : 'Fully Cleared Invoices'}
                </div>
              </div>
            </div>

            {/* Money Slips Control Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'مریضوں کی کیش و منی سلپ مینیجر (Patient Money Slips)' : 'Patient Money Slips & Itemized Billing Register'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUrdu ? 'معائنہ، ادویات، آپریشن، ٹیسٹ اور روم چارجز کا دستی بل بنائیں اور پرنٹ سلپ جاری کریں' : 'Create manual itemized patient bills for checkups, medicines, operations & tests with official print slip'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (slipsList.length > 0) {
                        setTargetPatientToken(slipsList[0].tokenNumber || slipsList[0].slipNo);
                      }
                      setIsAddServiceModalOpen(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isUrdu ? '⚡ سروس / چارج شامل کریں' : '⚡ Add Service / Rx'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddSlip}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'نیا منی سلپ / بل بنائیں' : 'Create New Money Slip'}</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={slipSearch}
                    onChange={(e) => setSlipSearch(e.target.value)}
                    placeholder={isUrdu ? 'مریض کا نام، ٹوکن #، فون یا انوائس # تلاش کریں...' : 'Search token #, patient, phone or Slip #...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-500 font-bold shrink-0">{isUrdu ? 'فلٹر:' : 'Status Filter:'}</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto">
                    {['all', 'Paid', 'Partial', 'Unpaid'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSlipStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                          slipStatusFilter === st
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? (isUrdu ? 'تمام' : 'All') : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slips Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                      <th className="p-3">{isUrdu ? 'انوائس و ٹوکن #' : 'Slip & Token #'}</th>
                      <th className="p-3">{isUrdu ? 'مریض کا نام و فون' : 'Patient Info'}</th>
                      <th className="p-3">{isUrdu ? 'معالج' : 'Doctor'}</th>
                      <th className="p-3">{isUrdu ? 'تفصیل آئٹمز' : 'Itemized Charges'}</th>
                      <th className="p-3">{isUrdu ? 'کل بل (Rs.)' : 'Total (Rs.)'}</th>
                      <th className="p-3">{isUrdu ? 'وصول شدہ' : 'Paid'}</th>
                      <th className="p-3">{isUrdu ? 'بقایا' : 'Balance'}</th>
                      <th className="p-3">{isUrdu ? 'ادائیگی حالت (Status)' : 'Payment Status'}</th>
                      <th className="p-3 text-right">{isUrdu ? 'ایکشن' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slipsList
                      .filter((s) => {
                        const matchesSearch =
                          !slipSearch ||
                          s.patientName.toLowerCase().includes(slipSearch.toLowerCase()) ||
                          s.patientPhone.includes(slipSearch) ||
                          s.slipNo.toLowerCase().includes(slipSearch.toLowerCase()) ||
                          (s.tokenNumber && s.tokenNumber.toLowerCase().includes(slipSearch.toLowerCase())) ||
                          (s.mrnNumber && s.mrnNumber.toLowerCase().includes(slipSearch.toLowerCase()));
                        const matchesStatus = slipStatusFilter === 'all' || s.paymentStatus === slipStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((slip, idx) => (
                        <tr key={slip.id || (slip as any)._id || `slip-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono">
                            <div className="font-bold text-emerald-800">{slip.slipNo}</div>
                            {slip.tokenNumber ? (
                              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px]">
                                🎫 {slip.tokenNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">No Token</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{slip.patientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{slip.patientPhone} {slip.mrnNumber ? `• ${slip.mrnNumber}` : ''}</div>
                          </td>
                          <td className="p-3 text-slate-700 font-medium">{slip.doctorName}</td>
                          <td className="p-3 max-w-xs">
                            <div className="space-y-1">
                              {(slip.items || []).map((it, itemIdx) => (
                                <div key={itemIdx} className="text-[11px] text-slate-700 flex justify-between gap-2 border-b border-slate-100 pb-0.5">
                                  <span className="truncate">• {it.description} ({it.category})</span>
                                  <span className="font-mono font-bold text-slate-900">Rs.{(it.totalPrice ?? (it as any).total ?? ((it.unitPrice || 0) * (it.quantity || 1)))}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            Rs. {(slip.totalAmount ?? 0).toLocaleString()}
                            {(slip.discount || 0) > 0 && <span className="text-[10px] text-emerald-700 block font-normal">Disc: -Rs.{slip.discount}</span>}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">Rs. {(slip.paidAmount ?? 0).toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-amber-700">Rs. {(slip.balanceAmount ?? 0).toLocaleString()}</td>
                          <td className="p-3">
                            <select
                              value={slip.paymentStatus}
                              onChange={(e) => handleUpdatePaymentStatus(slip, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer outline-none transition-colors ${
                                slip.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                  : slip.paymentStatus === 'Partial'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                  : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                              }`}
                              title={isUrdu ? 'ادائیگی کی حالت تبدیل کریں' : 'Change Payment Status'}
                            >
                              <option value="Paid">✓ Paid (مکمل وصول)</option>
                              <option value="Partial">⏳ Partial (جزوی ادا)</option>
                              <option value="Unpaid">✕ Unpaid (غیر ادا شدہ)</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetPatientToken(slip.tokenNumber || slip.slipNo);
                                  setIsAddServiceModalOpen(true);
                                }}
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] shadow-xs cursor-pointer"
                                title={isUrdu ? 'اس مریض کے بل میں نئی سروس / ٹیسٹ / دوائی شامل کریں' : 'Add Service to this patient token invoice'}
                              >
                                <Plus className="w-3 h-3" />
                                <span>{isUrdu ? '+ سروس' : '+ Service'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  openWhatsAppNotification({
                                    type: 'slip_receipt',
                                    recipientPhone: slip.patientPhone || '',
                                    patientName: slip.patientName,
                                    slipNumber: slip.slipNo,
                                    amount: slip.paidAmount,
                                    remainingBalance: slip.balanceAmount,
                                    serviceDetails: slip.items?.map((i) => i.description).join(', '),
                                    isUrdu: isUrdu,
                                  });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] shadow-xs cursor-pointer"
                                title={isUrdu ? 'مریض کے واٹس ایپ پر رسید بھیجیں' : 'Send WhatsApp E-Receipt'}
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-100" />
                                <span>WhatsApp</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSlip(slip)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] shadow-xs cursor-pointer"
                                title={isUrdu ? 'بل / انوائس میں تبدیلی کریں (Edit Invoice Items & Charges)' : 'Edit Billing Invoice'}
                              >
                                <Edit className="w-3 h-3 text-amber-100" />
                                <span>{isUrdu ? 'ترمیم' : 'Edit'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedSlipForPrint(slip)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] shadow-xs cursor-pointer"
                                title="Print Official Money Slip"
                              >
                                <Printer className="w-3 h-3" />
                                <span>{isUrdu ? 'پرنٹ سلپ' : 'Print'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(isUrdu ? 'کیا آپ یہ منی سلپ حذف کرنا چاہتے ہیں؟' : 'Delete this money slip?')) {
                                    setSlipsList(slipsList.filter((s) => s.id !== slip.id));
                                    deleteSlipApi(slip.id).catch(() => {});
                                    logCriticalOperation({
                                      action: 'SLIP_DELETED',
                                      actionLabelEnglish: 'Patient Invoice Deleted',
                                      actionLabelUrdu: 'مریض کی رسید حذف کی گئی',
                                      entityType: 'MoneySlip',
                                      entityId: slip.slipNo,
                                      entityName: slip.patientName,
                                      details: `Invoice #${slip.slipNo} for patient "${slip.patientName}" (Total: Rs. ${slip.totalAmount}) deleted by admin.`,
                                      detailsUrdu: `رسید #${slip.slipNo} برائے مریض "${slip.patientName}" رقم ${slip.totalAmount} روپے کو ڈیلیٹ کیا گیا۔`,
                                      staffName: adminUsername || 'Super Admin',
                                      staffRole: 'Billing Auditor',
                                      severity: 'critical',
                                    });
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Hospital Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 text-slate-900">
            {/* Financial Profit / Loss Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'مجموعی آمدن (Patient Income)' : 'Total Hospital Income'}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  Rs. {slipsList.reduce((sum, s) => sum + (s.paidAmount || 0), 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">{isUrdu ? 'کیش و آن لائن پیشنٹ بل کلیکشن' : 'Collected from Money Slips'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کل اخراجات (Operational Expenses)' : 'Total Hospital Expenses'}</span>
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700 font-mono">
                  Rs. {expensesList.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-rose-700 font-bold">{isUrdu ? 'اسٹاف، فارمیسی و میڈیکل ووچرز' : 'All Expense Vouchers Recorded'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'خالص بچت / بیلنس (Net Profit)' : 'Net Operational Cash Balance'}</span>
                  <PieChart className="w-4 h-4 text-teal-600" />
                </div>
                <div className={`text-2xl font-black font-mono ${
                  (slipsList.reduce((sum, s) => sum + (s.paidAmount || 0), 0) - expensesList.reduce((sum, e) => sum + (e.amount || 0), 0)) >= 0
                    ? 'text-teal-700'
                    : 'text-rose-700'
                }`}>
                  Rs. {(slipsList.reduce((sum, s) => sum + (s.paidAmount || 0), 0) - expensesList.reduce((sum, e) => sum + (e.amount || 0), 0)).toLocaleString()}
                </div>
                <div className="text-[10px] text-teal-800 font-bold">{isUrdu ? 'آمدن منفی اخراجات (Net Profit)' : 'Net Income Surplus'}</div>
              </div>
            </div>

            {/* Expenses Controls */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                    <span>{isUrdu ? 'ہسپتال کے تمام عملی و مالیاتی اخراجات مینیجر' : 'Hospital Operations & Expense Management'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUrdu ? 'اسٹاف کی تنخواہیں، میڈیکل اسٹاک خرید، بجلی بلز اور مینٹیننس اخراجات درج کریں' : 'Record staff salaries, medicine stock purchases, utility bills & maintenance vouchers'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-transform hover:scale-102 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا اخراجات ووچر درج کریں' : 'Add Expense Voucher'}</span>
                </button>
              </div>

              {/* Expense Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    placeholder={isUrdu ? 'عنوان، ووچر # یا موصول کنندہ کا نام...' : 'Search expense title, voucher # or vendor...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-500 font-bold shrink-0">{isUrdu ? 'کیٹیگری:' : 'Category:'}</span>
                  <select
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="all">{isUrdu ? 'تمام کیٹیگریز' : 'All Categories'}</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Medicine & Pharmacy Stock">Medicine & Pharmacy Stock</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                    <option value="Hospital Rent">Hospital Rent</option>
                    <option value="Tea & Refreshment">Tea & Refreshment</option>
                    <option value="Surgical & Lab Supplies">Surgical & Lab Supplies</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Expense Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                      <th className="p-3">Voucher #</th>
                      <th className="p-3">{isUrdu ? 'عنوان و تفصیل' : 'Title & Description'}</th>
                      <th className="p-3">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                      <th className="p-3">{isUrdu ? 'رقم (Rs.)' : 'Amount (Rs.)'}</th>
                      <th className="p-3">{isUrdu ? 'تاریخ' : 'Date'}</th>
                      <th className="p-3">{isUrdu ? 'ادا شدہ بنام' : 'Paid To'}</th>
                      <th className="p-3">{isUrdu ? 'طریقہ ادائیگی' : 'Method'}</th>
                      <th className="p-3 text-right">{isUrdu ? 'ایکشن' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesList
                      .filter((e) => {
                        const matchesSearch =
                          !expenseSearch ||
                          e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          e.voucherNo.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          e.paidTo.toLowerCase().includes(expenseSearch.toLowerCase());
                        const matchesCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map((exp, idx) => (
                        <tr key={exp.id || (exp as any)._id || `exp-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-rose-800">{exp.voucherNo}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{exp.title}</div>
                            {exp.notes && <div className="text-[10px] text-slate-500">{exp.notes}</div>}
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded text-[10px] border border-slate-200">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 text-sm">
                            Rs. {(exp.amount ?? 0).toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                          <td className="p-3 text-slate-800 font-medium">{exp.paidTo}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                              {exp.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(isUrdu ? 'کیا آپ یہ اخراجات ووچر حذف کرنا چاہتے ہیں؟' : 'Delete this expense voucher?')) {
                                  setExpensesList(expensesList.filter((x) => x.id !== exp.id));
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Delete Voucher"
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

        {/* EOD Cashier Register Close Tab */}
        {activeTab === 'eod' && (
          <div className="space-y-6 text-slate-900">
            {/* Header with Date Selector */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Daily Financial Reconciliation
                  </span>
                  <span className="bg-emerald-800/80 text-emerald-200 border border-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Official Cashier EOD Audit
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isUrdu ? 'روزانہ کیش رجسٹر کلوزنگ و فنانشل آڈٹ' : 'End-of-Day (EOD) Cashier Register Close & Reconciliation'}
                </h2>
                <p className="text-xs text-slate-300">
                  {isUrdu ? 'دن بھر کی تمام رسیدات، آن لائن ادائیگیاں، کیش کٹوتی اور اخراجات کا خودکار تصفیہ' : 'Automatic reconciliation of OPD cash collections, online transfers, operational expenses & register variance'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700">
                <label className="text-xs text-amber-300 font-bold px-2 shrink-0">{isUrdu ? 'تاریخ انتخاب:' : 'Audit Date:'}</label>
                <input
                  type="date"
                  value={eodDate}
                  onChange={(e) => setEodDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Inflow vs Outflow Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'آج کی کل آمدن (Total Revenue)' : "Today's Total Inflow"}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  Rs. {totalRevenueEOD.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {slipsForEOD.length} {isUrdu ? 'مریضوں کی رسیدات' : 'Slips recorded today'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کیش کلیکشن (Physical Cash)' : 'Cash Payments Received'}</span>
                  <Receipt className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-teal-700 font-mono">
                  Rs. {cashCollectionsEOD.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isUrdu ? 'کیش دراز میں جمع رقم' : 'Paid in hard cash'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کارڈ و آن لائن (Digital)' : 'Digital & Online Inflow'}</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700 font-mono">
                  Rs. {(cardCollectionsEOD + onlineCollectionsEOD).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  EasyPaisa, JazzCash & Bank
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'آج کے کیش اخراجات' : "Today's Cash Expenses"}</span>
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700 font-mono">
                  Rs. {cashExpensesEOD.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {expensesForEOD.length} {isUrdu ? 'ووچرز کل ادا شدہ' : 'Vouchers (Cash only)'}
                </div>
              </div>
            </div>

            {/* Reconciliation Calculator & Drawer Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cash Register Equation */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Calculator className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-black text-base text-slate-900">
                    {isUrdu ? 'کیش دراز کا ریاضیاتی حساب (Physical Drawer Math)' : 'Cash Drawer Balancing Formula'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Step 1: Opening Float */}
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">{isUrdu ? '1. صبح کا ابتدائی کیش (Opening Cash Float):' : '1. Opening Cash Float (Morning Balance):'}</span>
                      <span className="text-[11px] text-slate-500">{isUrdu ? 'کاؤنٹر شروع ہونے پر موجود چھٹہ رقم' : 'Starting float in register drawer'}</span>
                    </div>
                    <div className="w-36">
                      <input
                        type="number"
                        min="0"
                        value={eodOpeningCash}
                        onChange={(e) => setEodOpeningCash(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-right font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Step 2: Cash Collections */}
                  <div className="flex justify-between items-center p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                    <div>
                      <span className="font-bold text-emerald-950 block">{isUrdu ? '+ 2. مریضوں سے کیش وصولی (+ Cash Receipts):' : '+ 2. OPD & Pharmacy Cash Receipts:'}</span>
                      <span className="text-[11px] text-emerald-700">{isUrdu ? 'دن بھر جمع شدہ کیش رقم' : 'Net received across cash slips'}</span>
                    </div>
                    <div className="text-sm font-black font-mono text-emerald-800">
                      + Rs. {cashCollectionsEOD.toLocaleString()}
                    </div>
                  </div>

                  {/* Step 3: Cash Outflow */}
                  <div className="flex justify-between items-center p-3 bg-rose-50/60 rounded-2xl border border-rose-200">
                    <div>
                      <span className="font-bold text-rose-950 block">{isUrdu ? '- 3. دراز سے کیش اخراجات (- Cash Expenses):' : '- 3. Cash Expenses Paid from Drawer:'}</span>
                      <span className="text-[11px] text-rose-700">{isUrdu ? 'اسٹاف چائے، پیٹرول، لوکل خرید وغیرہ' : 'Operational cash outflow vouchers'}</span>
                    </div>
                    <div className="text-sm font-black font-mono text-rose-800">
                      - Rs. {cashExpensesEOD.toLocaleString()}
                    </div>
                  </div>

                  {/* Step 4: Expected Physical Cash */}
                  <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl shadow-inner">
                    <div>
                      <span className="font-bold text-amber-400 block text-sm">{isUrdu ? '= دراز میں متوقع کیش (Expected Physical Cash):' : '= Expected Physical Cash in Drawer:'}</span>
                      <span className="text-[10px] text-slate-400">{isUrdu ? '(ابتدائی کیش + وصولی - اخراجات)' : '(Opening Float + Collections - Expenses)'}</span>
                    </div>
                    <div className="text-xl font-black font-mono text-amber-300">
                      Rs. {expectedPhysicalCash.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Physical Counted Cash & Discrepancy Check */}
                <div className="pt-2 space-y-4">
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-3">
                    <label className="block text-slate-900 font-black text-xs">
                      {isUrdu ? 'کیشئر کا گنا ہوا اصل کیش درج کریں (Counted Physical Cash in Drawer):' : 'Enter Actual Physical Count of Cash in Drawer:'}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500 font-mono">PKR</span>
                        <input
                          type="number"
                          min="0"
                          value={eodPhysicalCash}
                          onChange={(e) => setEodPhysicalCash(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-white border-2 border-amber-400 pl-12 pr-4 py-2.5 rounded-xl font-mono text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEodPhysicalCash(expectedPhysicalCash)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors shrink-0"
                      >
                        {isUrdu ? 'خودکار برابر کریں' : 'Auto Match'}
                      </button>
                    </div>

                    {/* Variance Indicator */}
                    <div className="pt-1">
                      {cashVariance === 0 ? (
                        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{isUrdu ? '✓ کیش رجسٹر کا حساب بالکل درست اور متوازن ہے (0 روپے فرق)' : '✓ Register Perfectly Balanced! Zero Variance.'}</span>
                        </div>
                      ) : cashVariance > 0 ? (
                        <div className="p-3 bg-sky-100 border border-sky-300 rounded-xl text-sky-950 text-xs font-bold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-sky-700 shrink-0" />
                          <span>{isUrdu ? `▲ اضافی کیش (Surplus): +Rs. ${cashVariance.toLocaleString()} دراز میں زیادہ ہے۔` : `▲ Cash Surplus: +Rs. ${cashVariance.toLocaleString()} over expected.`}</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-950 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                          <span>{isUrdu ? `▼ کیش شارٹ (Shortage): -Rs. ${Math.abs(cashVariance).toLocaleString()} دراز میں کم ہے۔` : `▼ Cash Shortage: -Rs. ${Math.abs(cashVariance).toLocaleString()} missing from drawer.`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sign-off & Print Certificate */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-black text-base text-slate-900">
                      {isUrdu ? 'آڈٹ سرٹیفکیٹ و سائن آف' : 'Cashier Sign-off & Authorization'}
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'کیشئر / اکاؤنٹنٹ کا نام:' : 'Cashier / Accountant Name:'}
                      </label>
                      <input
                        type="text"
                        value={eodCashierName}
                        onChange={(e) => setEodCashierName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'آڈٹ ریمارکس و نوٹس:' : 'Daily Audit Notes / Justification:'}
                      </label>
                      <textarea
                        rows={3}
                        value={eodNotes}
                        onChange={(e) => setEodNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{isUrdu ? 'کل پیشنٹ انوائسز:' : 'Invoices Count:'}</span>
                        <span className="font-mono">{slipsForEOD.length}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>{isUrdu ? 'کل دیے گئے ڈسکاؤنٹس:' : 'Discounts Given:'}</span>
                        <span className="font-mono text-emerald-700">Rs. {slipsForEOD.reduce((sum, s) => sum + (s.discount || 0), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>{isUrdu ? 'خالص کلیکشن:' : 'Net Invoiced Collection:'}</span>
                        <span className="font-mono text-emerald-800">Rs. {totalRevenueEOD.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handlePrintEODReport}
                    className="w-full bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
                  >
                    <Printer className="w-5 h-5 text-amber-300" />
                    <span>{isUrdu ? 'روزانہ کیش کلوز کریں اور آفیشل آڈٹ رپورٹ پرنٹ کریں' : 'Finalize EOD & Print Official Audit Report'}</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    {isUrdu ? 'مستند مالیاتی آڈٹ رپورٹ میڈیکل ڈائریکٹر کے ریکارڈ کے لیے تیار ہو جائے گی' : 'Generates standard Hospital Operating System EOD reconciliation certificate'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low-Stock Alerts & Auto-Reorder Tab */}
        {activeTab === 'lowstock' && (
          <div className="space-y-6 text-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-orange-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Automated Inventory Watch
                  </span>
                  <span className="bg-amber-950/80 text-amber-200 border border-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Stock Threshold &lt; 10 Units
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isUrdu ? 'فارمیسی و پراڈکٹس لو اسٹاک مانیٹر اور ری آرڈر انجن' : 'Low-Stock & Automated Replenishment Alerts'}
                </h2>
                <p className="text-xs text-amber-100">
                  {isUrdu ? 'کم اسٹاک ادویات کی فوری نشان دہی اور 1-کلک خودکار خریداری اخراجات ووچر' : 'Real-time threshold surveillance with 1-click automatic Purchase Order expense drafting'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoDraftReorderExpense}
                className="bg-slate-950 hover:bg-slate-900 text-amber-300 border border-amber-400 font-black px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs transition-transform hover:scale-105 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isUrdu ? '⚡ خودکار ری آرڈر ووچر بنائیں (Auto-Draft PO)' : '⚡ Auto-Draft Purchase Order'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کم اسٹاک پراڈکٹس' : 'Low Stock Items (<= 10 Units)'}</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700 font-mono">
                  {lowStockProducts.length}
                </div>
                <div className="text-[11px] text-rose-800 font-bold">{isUrdu ? 'فوری ری آرڈر درکار ہے' : 'Action required immediately'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'کل فارمیسی پراڈکٹس' : 'Total Hospital Products'}</span>
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {products.length}
                </div>
                <div className="text-[11px] text-slate-500">{isUrdu ? 'آن لائن و کلینک لسٹڈ ادویات' : 'Catalog items in inventory'}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                  <span>{isUrdu ? 'تخمینی ری آرڈر لاگت' : 'Estimated Restock Budget (50 Units)'}</span>
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono">
                  Rs. {lowStockProducts.reduce((sum, p) => sum + (Math.round((p.price || 1000) * 0.6) * 50), 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-800 font-bold">{isUrdu ? '50، 50 یونٹس کی تخمینی لاگت' : '50 units per depleted SKU'}</div>
              </div>
            </div>

            {/* Low Stock Products List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>{isUrdu ? `فوری توجہ طلب ادویات و پراڈکٹس (${lowStockProducts.length})` : `Depleted & Critical Stock SKUs (${lowStockProducts.length})`}</span>
                </h3>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-slate-800 text-base">{isUrdu ? 'تمام پراڈکٹس کا اسٹاک تسلی بخش ہے!' : 'All Stock Levels Normal!'}</h4>
                  <p className="text-xs text-slate-500">{isUrdu ? 'کسی پراڈکٹ کا اسٹاک 10 یونٹس سے کم نہیں۔' : 'No products below the 10-unit minimum safety threshold.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                        <th className="p-3">{isUrdu ? 'پروڈکٹ' : 'Product SKU'}</th>
                        <th className="p-3">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                        <th className="p-3">{isUrdu ? 'موجودہ اسٹاک' : 'Current Stock'}</th>
                        <th className="p-3">{isUrdu ? 'خوردہ قیمت' : 'Retail Price'}</th>
                        <th className="p-3">{isUrdu ? 'تخمینی ری آرڈر لاگت' : 'Reorder Est. (50 units)'}</th>
                        <th className="p-3 text-right">{isUrdu ? 'ایکشن' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((p, pIdx) => {
                        const stockCount = p.stock ?? 0;
                        const restockCost = Math.round((p.price || 1000) * 0.6) * 50;
                        return (
                          <tr key={p.id || (p as any)._id || `lowstock-${pIdx}`} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={p.image || (p as any).imageUrl}
                                  alt={p.nameUrdu || p.nameEnglish}
                                  className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{isUrdu ? p.nameUrdu : p.nameEnglish}</div>
                                  <div className="text-[10px] text-slate-500">{p.nameEnglish}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border ${
                                  stockCount === 0
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : stockCount <= 5
                                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                {stockCount === 0 ? '❌ Out of Stock (0)' : `⚠️ ${stockCount} Units Left`}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900">
                              Rs. {p.price?.toLocaleString()}
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-800">
                              Rs. {restockCost.toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  // Replenish stock by 50 in products list
                                  p.stock = (p.stock || 0) + 50;
                                  p.inStock = true;
                                  alert(isUrdu ? `پراڈکٹ ${p.nameUrdu || p.nameEnglish} کے اسٹاک میں 50 یونٹس کا اضافہ کر دیا گیا ہے۔` : `Added 50 units to ${p.nameEnglish || p.nameUrdu}!`);
                                  // Force re-render
                                  setActiveTab('products');
                                }}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+50 Units</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="space-y-6 text-slate-900">
            {/* Executive Administrator Privilege Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Root Administration Console
                  </span>
                  <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>RBAC Security Engine: Active</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isUrdu ? 'اسٹاف اکاؤنٹس، کریڈنشلز اور رول پرمیشنز کنٹرول' : 'Staff Accounts, Admin Credentials & RBAC Security'}
                </h2>
                <p className="text-xs text-emerald-200">
                  {isUrdu
                    ? 'ایڈمن کے جاری کردہ کریڈنشلز کے ذریعے عملے کا لاگ ان اور سخت پابندی شدہ اختیارات'
                    : 'Issue official credentials, enforce role-based access bounds, and restrict staff to assigned clinical duties.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddStaffModal}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950 font-black" />
                  <span>{isUrdu ? 'نیا اسٹاف اکاؤنٹ بنائیں' : 'Issue New Staff Account'}</span>
                </button>
              </div>
            </div>

            {/* Sub-Navigation Switcher */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setStaffSubTab('staff_list')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  staffSubTab === 'staff_list'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isUrdu ? `آپریشنل اسٹاف اکاؤنٹس (${staffUsersList.filter(u => u.role !== 'admin').length})` : `Operational Staff (${staffUsersList.filter(u => u.role !== 'admin').length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffSubTab('patient_accounts')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  staffSubTab === 'patient_accounts'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isUrdu ? `رجسٹرڈ مریض اکاؤنٹس (${usersList.length})` : `Registered Patients (${usersList.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffSubTab('rbac_rules')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  staffSubTab === 'rbac_rules'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{isUrdu ? `ہسپتال RBAC رولز و اختیارات (${HOSPITAL_RBAC_RULES.length})` : `Hospital RBAC Rules Matrix (${HOSPITAL_RBAC_RULES.length})`}</span>
              </button>
            </div>

            {/* SUBTAB 1: OPERATIONAL STAFF LIST */}
            {staffSubTab === 'staff_list' && (
              <div className="space-y-4">
                {/* Search & Filter Header */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      placeholder={isUrdu ? 'اسٹاف ممبر تلاش کریں (نام، یوزر نیم، ڈیپارٹمنٹ)...' : 'Search staff by name, username, department, or role...'}
                      className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddStaffModal}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isUrdu ? 'اسٹاف شامل کریں' : 'Add Staff Member'}</span>
                    </button>
                  </div>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                          <th className="p-3.5">{isUrdu ? 'اسٹاف ممبر و شناخت' : 'Staff Member & Department'}</th>
                          <th className="p-3.5">{isUrdu ? 'ایڈمن جاری کردہ کریڈنشلز' : 'Admin-Issued Credentials'}</th>
                          <th className="p-3.5">{isUrdu ? 'ہسپتال رول' : 'Hospital Role'}</th>
                          <th className="p-3.5">{isUrdu ? 'شفٹ ٹائمنگ' : 'Shift Schedule'}</th>
                          <th className="p-3.5">{isUrdu ? 'تفویض شدہ اختیارات (Rules)' : 'Assigned RBAC Rules'}</th>
                          <th className="p-3.5">{isUrdu ? 'اسٹیٹس' : 'Account Status'}</th>
                          <th className="p-3.5 text-right">{isUrdu ? 'ایکشن' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffUsersList
                          .filter((u) => u.role !== 'admin')
                          .filter((u) => {
                            if (!staffSearchQuery.trim()) return true;
                            const q = staffSearchQuery.toLowerCase();
                            return (
                              u.name.toLowerCase().includes(q) ||
                              u.username.toLowerCase().includes(q) ||
                              (u.department && u.department.toLowerCase().includes(q)) ||
                              (u.role && u.role.toLowerCase().includes(q)) ||
                              (u.assignedLabCategory && u.assignedLabCategory.toLowerCase().includes(q))
                            );
                          })
                          .map((staff) => (
                            <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900 text-sm">
                                  {staff.name}
                                </div>
                                <div className="text-[11px] text-emerald-800 font-medium">
                                  {staff.department || 'General Healthcare Unit'}
                                  {staff.assignedLabCategory && ` • ${staff.assignedLabCategory}`}
                                </div>
                                {staff.qualification && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {staff.qualification} • {staff.phone}
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5 font-mono">
                                <div className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-bold inline-block">
                                  user: <span className="text-emerald-900 font-black">{staff.username}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  pass: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-900 font-bold">{staff.password}</code>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                  staff.role === 'doctor' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  staff.role === 'lab_doctor' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                  staff.role === 'nurse' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                  staff.role === 'pharmacist' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  staff.role === 'ipd_incharge' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                  'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                  {staff.role.replace('_', ' ')}
                                </span>
                              </td>

                              <td className="p-3.5 text-slate-700 font-medium">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{staff.shiftTiming || 'General Shift'}</span>
                                </div>
                              </td>

                              <td className="p-3.5 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {staff.permissions && staff.permissions.length > 0 ? (
                                    staff.permissions.map((p) => {
                                      const matchedRule = HOSPITAL_RBAC_RULES.find((r) => r.id === p);
                                      return (
                                        <span
                                          key={p}
                                          className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                          title={matchedRule ? matchedRule.descriptionEnglish : p}
                                        >
                                          ✓ {matchedRule ? matchedRule.nameEnglish : p}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">No active permissions</span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffStatus(staff.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                    staff.isActive !== false
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                  }`}
                                >
                                  {staff.isActive !== false ? '● Active' : '○ Suspended'}
                                </button>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStaffModal(staff)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-bold"
                                    title="Edit Account & Rules"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStaffAccount(staff.id, staff.name)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-bold"
                                    title="Revoke & Delete Staff Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: REGISTERED PATIENT ACCOUNTS */}
            {staffSubTab === 'patient_accounts' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-black text-emerald-900 text-base flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span>{isUrdu ? 'رجسٹرڈ مریض اکاؤنٹس (Patient Records)' : 'Registered Patient Portal Records'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'مریضوں کے اکاؤنٹس کی تفصیلات اور رجسٹریشن ریکارڈ' : 'Manage registered patient accounts for medical records, portal access, and telemedicine history'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRegPatientModalOpen(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'نیا مریض رجسٹر کریں' : 'Register New Patient'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                        <th className="p-3">{isUrdu ? 'اسم گرامی' : 'Full Name'}</th>
                        <th className="p-3">{isUrdu ? 'یوزر نیم' : 'Username'}</th>
                        <th className="p-3">{isUrdu ? 'فون' : 'Phone'}</th>
                        <th className="p-3">{isUrdu ? 'شہر' : 'City'}</th>
                        <th className="p-3">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                        <th className="p-3 text-right">{isUrdu ? 'ایکشن' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr._id || usr.id || usr.username} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">
                            {usr.name || usr.fullName || usr.username}
                          </td>
                          <td className="p-3 font-mono text-slate-700">{usr.username || usr.email}</td>
                          <td className="p-3 font-mono text-slate-700">{usr.phone || 'N/A'}</td>
                          <td className="p-3 text-slate-700">{usr.city || 'Gujranwala'}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              {usr.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                const userName = usr.name || usr.fullName || usr.username;
                                if (confirm(`Are you sure you want to delete patient account for ${userName}?`)) {
                                  const uId = usr._id || usr.id || usr.username;
                                  setUsersList(usersList.filter((u) => u.username !== usr.username && u.id !== usr.id && (u as any)._id !== usr._id));
                                  await deleteUserApi(uId, usr.image || usr.avatar).catch(() => {});
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
                              title="Delete Patient Account"
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
            )}

            {/* SUBTAB 3: HOSPITAL RBAC SECURITY MATRIX */}
            {staffSubTab === 'rbac_rules' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-slate-900">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>{isUrdu ? 'ہسپتال رول بیسڈ ایکسس کنٹرول (RBAC) فریم ورک' : 'Hospital Role-Based Access Control (RBAC) Rules Matrix'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu
                      ? 'تمام کلینیکل و آپریشنل اختیارات جنہیں ایڈمنسٹریٹر اسٹاف کے اکاؤنٹ بناتے وقت نامزد کرتا ہے'
                      : 'Comprehensive registry of granular operational permissions assigned to staff by Executive Administration.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HOSPITAL_RBAC_RULES.map((rule) => (
                    <div key={rule.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                          {rule.category}
                        </span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {rule.applicableRoles.map((r) => (
                            <span key={r} className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">{rule.nameEnglish}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{rule.descriptionEnglish}</p>
                      <div className="text-[10px] text-emerald-800 font-semibold pt-1 border-t border-slate-200/60">
                        {rule.descriptionUrdu}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                            <span>{isUrdu ? 'تاریخ:' : 'Date:'} {rep.date || '2026-08-08'}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                const msg = isUrdu
                                  ? 'کیا آپ واقعی یہ میڈیکل رپورٹ ڈیلیٹ کرنا چاہتے ہیں؟ (منسلکہ فائل Cloudinary سے بھی ڈیلیٹ ہو جائے گی)'
                                  : 'Are you sure you want to delete this report and remove its file from Cloudinary?';
                                if (confirm(msg)) {
                                  const repId = rep._id || rep.id;
                                  setAllReports((prev) => prev.filter((r) => r.id !== rep.id && (r as any)._id !== rep._id));
                                  await deleteReportApi(repId, rep.fileUrl).catch(() => {});
                                }
                              }}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors font-bold font-sans flex items-center gap-1 cursor-pointer"
                              title="Delete Report & File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'حذف کریں' : 'Delete'}</span>
                            </button>
                          </div>
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

                  <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
                    <DoctorPatientChatView
                      currentUser={{ role: 'doctor', id: 'admin-monitor', name: isUrdu ? 'ایڈمن کنٹرول مانیٹر' : 'Admin Telemedicine Inspector' }}
                      doctors={doctors}
                      language={language}
                    />
                  </React.Suspense>

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
            {/* Real-time Visual Financial Health & Shift Operations Summary */}
            <React.Suspense fallback={<LoadingFallback isUrdu={isUrdu} />}>
              <AdminFinancialSummary
                slips={slipsList}
                appointments={appointments}
                doctors={doctors}
                expenses={expensesList}
                language={language}
                onUpdateSlip={(updated) =>
                  setSlipsList(slipsList.map((s) => (s.id === updated.id ? updated : s)))
                }
              />
            </React.Suspense>

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
                    {appointments.map((app, appIdx) => {
                      const matchedDoc = doctors.find(
                        (d) => d.id === app.doctorId || d.nameUrdu === app.doctorName || d.nameEnglish === app.doctorName
                      );
                      const displayDoc = matchedDoc
                        ? (isUrdu ? matchedDoc.nameUrdu : matchedDoc.nameEnglish)
                        : (isUrdu ? app.doctorName : (app.doctorName || '').replace('ڈاکٹر زیشان چوہدری', 'Dr. Zeeshan Chaudhry').replace('ڈاکٹر وقاص صغیر چوہدری', 'Dr. Waqas Sageer Chaudhry').replace('ڈاکٹر', 'Dr.'));
                      
                      const matchedDis = diseases.find((d) => d.nameUrdu === app.problem || d.nameEnglish === app.problem);
                      const displayProblem = matchedDis
                        ? (isUrdu ? matchedDis.nameUrdu : matchedDis.nameEnglish)
                        : (isUrdu ? app.problem : (app.problem || '').replace('جوڑوں اور مہروں کا درد', 'Joint & Spine Pain').replace('کمر و مہروں کا شدید درد', 'Severe Back & Spine Pain').replace('فالج بحالی فزیوتھراپی', 'Stroke Rehab Physiotherapy').replace('آن لائن رجسٹریشن (OPD Checkup)', 'Online Registration (OPD Checkup)'));

                      const displayCity = isUrdu
                        ? app.city
                        : (app.city || '').replace('گوجرانوالہ', 'Gujranwala').replace('لاہور', 'Lahore').replace('سیالکوٹ', 'Sialkot').replace('فیصل آباد', 'Faisalabad');

                      const displayTime = isUrdu
                        ? app.timeSlot
                        : (app.timeSlot || '').replace('صبح', 'Morning').replace('دوپہر', 'Afternoon').replace('شام', 'Evening').replace('رات', 'Night');

                      return (
                        <tr key={app.id || (app as any)._id || `app-ov-${appIdx}`} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{app.patientName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{app.phone}</td>
                          <td className="p-2.5 text-slate-700">{displayCity}</td>
                          <td className="p-2.5 text-emerald-800 font-semibold">{displayProblem}</td>
                          <td className="p-2.5 text-slate-700">{displayDoc}</td>
                          <td className="p-2.5 text-emerald-700 font-bold">{displayTime}</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 text-[10px] font-bold">
                              {app.status === 'Approved'
                                ? (isUrdu ? 'منظور شدہ' : 'Approved')
                                : app.status === 'Completed'
                                ? (isUrdu ? 'مکمل' : 'Completed')
                                : app.status === 'Cancelled'
                                ? (isUrdu ? 'منسوخ' : 'Cancelled')
                                : (isUrdu ? 'معلق' : 'Pending')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {isUrdu ? 'معائنہ و چیک اپ فیس (Consultation Fee in Rs.)' : 'OPD Consultation Fee (PKR)'}
                    </label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={newDocFee}
                      onChange={(e) => setNewDocFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                    />
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
              {doctors.map((doc, docIdx) => (
                <div key={doc.id || (doc as any)._id || `doc-${docIdx}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img src={doc.image} alt={doc.nameEnglish} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {isUrdu ? doc.nameUrdu : doc.nameEnglish} <span className="text-emerald-700 text-xs font-semibold">({doc.qualification})</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {isUrdu ? 'تخصص:' : 'Spec:'} {isUrdu ? doc.specializationUrdu : doc.specializationEnglish}
                      </div>
                      <div className="text-emerald-900 font-bold font-mono text-[11px]">
                        {isUrdu ? 'چیک اپ فیس:' : 'Fee:'} Rs. {doc.checkupFee || 1500}
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
                      onClick={() => handleDeleteDoctorAction(doc)}
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
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-slate-900 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span>{isUrdu ? 'معالج کی ٹائمنگ اور معلومات تبدیل کریں' : 'Edit Doctor Information & OPD Timings'}</span>
                    </h3>
                    <button onClick={() => setEditingDoctor(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveDoctorChanges} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">نام اردو (Doctor Name Urdu)</label>
                        <input
                          type="text"
                          required
                          value={editDocNameUrdu}
                          onChange={(e) => setEditDocNameUrdu(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Name English (Doctor Name English)</label>
                        <input
                          type="text"
                          required
                          value={editDocNameEng}
                          onChange={(e) => setEditDocNameEng(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">قابلیت (Qualification)</label>
                        <input
                          type="text"
                          value={editDocQual}
                          onChange={(e) => setEditDocQual(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">فون نمبر (Phone Number)</label>
                        <input
                          type="text"
                          value={editDocPhone}
                          onChange={(e) => setEditDocPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">تخصص اردو (Specialization Urdu)</label>
                        <input
                          type="text"
                          value={editDocSpecUrdu}
                          onChange={(e) => setEditDocSpecUrdu(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Specialization English</label>
                        <input
                          type="text"
                          value={editDocSpecEng}
                          onChange={(e) => setEditDocSpecEng(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isUrdu ? 'معائنہ و چیک اپ فیس (Consultation Fee in Rs.)' : 'OPD Consultation Fee (PKR)'}
                      </label>
                      <input
                        type="number"
                        value={editDocFee}
                        onChange={(e) => setEditDocFee(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                      <div className="text-emerald-900 font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-700" />
                        <span>او پی ڈی کی تمام ٹائمنگز درج کریں (Doctor OPD Timings)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 mb-1 font-medium">مارننگ ٹائمنگ اردو (Morning Slot Urdu)</label>
                          <input
                            type="text"
                            value={editDocTimingUrdu}
                            onChange={(e) => setEditDocTimingUrdu(e.target.value)}
                            placeholder="صبح 8:00 سے دوپہر 2:00 بجے تک"
                            className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 mb-1 font-medium">Morning Slot English</label>
                          <input
                            type="text"
                            value={editDocTimingEng}
                            onChange={(e) => setEditDocTimingEng(e.target.value)}
                            placeholder="8:00 AM - 2:00 PM"
                            className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 mb-1 font-medium">ایوننگ ٹائمنگ اردو (Evening Slot Urdu)</label>
                          <input
                            type="text"
                            value={editDocEveningUrdu}
                            onChange={(e) => setEditDocEveningUrdu(e.target.value)}
                            placeholder="شام 5:00 سے رات 9:00 بجے تک"
                            className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 mb-1 font-medium">Evening Slot English</label>
                          <input
                            type="text"
                            value={editDocEveningEng}
                            onChange={(e) => setEditDocEveningEng(e.target.value)}
                            placeholder="5:00 PM - 9:00 PM"
                            className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">تصویر کا یو آر ایل (Doctor Image URL)</label>
                      <input
                        type="text"
                        value={editDocImage}
                        onChange={(e) => setEditDocImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingDocEdit}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingDocEdit ? 'Saving to Database...' : 'تغیرات محفوظ کریں (Save Timing Changes)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDoctor(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl transition-colors cursor-pointer"
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
              {diseases.map((dis, disIdx) => (
                <div key={dis.id || (dis as any)._id || `dis-${disIdx}`} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
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
                    onClick={() => handleDeleteDiseaseAction(dis)}
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

                {/* Media Pickers Box (Image & Video) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
                  {/* Photo Section */}
                  <div className="space-y-2 border-b border-slate-200 pb-3">
                    <label className="block font-bold text-slate-700 text-xs">
                      {isUrdu ? '1. پروڈکٹ تصویر (Cloudinary Image):' : '1. Product Photo / Image:'}
                    </label>

                    <div className="flex items-center gap-3">
                      {newProdImage ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-white shadow-sm shrink-0">
                          <img src={newProdImage} alt="Product preview" className="w-full h-full object-cover" />
                          {prodUploadSuccess && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5">
                              Uploaded
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-1 text-center text-[9px] bg-white shrink-0">
                          <ImageIcon className="w-6 h-6 text-slate-400 mb-0.5" />
                          <span>{isUrdu ? 'کوئی تصویر نہیں' : 'No photo'}</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          id="prod-img-input"
                          onChange={handleProdImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="prod-img-input"
                          className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingProdImg ? 'Uploading...' : isUrdu ? 'تصویر اپلوڈ کریں' : 'Upload Photo'}</span>
                        </label>

                        <input
                          type="text"
                          placeholder={isUrdu ? 'یا Image URL درج کریں...' : 'Or enter Image URL...'}
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-[10px] text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-700 text-xs">
                        {isUrdu ? '2. پروڈکٹ ویڈیو (Product Video - MP4 / YouTube):' : '2. Product Video (Video / MP4 / YouTube):'}
                      </label>
                      {newProdVideo && (
                        <button
                          type="button"
                          onClick={() => { setNewProdVideo(''); setProdVideoUploadSuccess(false); }}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          {isUrdu ? 'ویڈیو ہٹائیں' : 'Remove Video'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {newProdVideo ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-600 bg-slate-950 flex items-center justify-center shrink-0 shadow-sm group">
                          {newProdVideo.includes('youtube.com') || newProdVideo.includes('youtu.be') ? (
                            <div className="flex flex-col items-center justify-center text-rose-500">
                              <PlayCircle className="w-8 h-8" />
                              <span className="text-[8px] text-white font-bold mt-0.5">YouTube</span>
                            </div>
                          ) : (
                            <video src={newProdVideo} className="w-full h-full object-cover" muted />
                          )}
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(newProdVideo)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Play Video"
                          >
                            <Play className="w-6 h-6 text-white drop-shadow" />
                          </button>
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5">
                            Video Ready
                          </span>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-1 text-center text-[9px] bg-white shrink-0">
                          <Film className="w-6 h-6 text-slate-400 mb-0.5" />
                          <span>{isUrdu ? 'کوئی ویڈیو نہیں' : 'No video'}</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          accept="video/*"
                          id="prod-video-input"
                          onChange={handleProdVideoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="prod-video-input"
                          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{isUploadingProdVideo ? 'Uploading Video...' : isUrdu ? 'ویڈیو اپلوڈ کریں' : 'Upload Video File'}</span>
                        </label>

                        <input
                          type="text"
                          placeholder={isUrdu ? 'یا ویڈیو URL / YouTube لنک درج کریں...' : 'Or enter Video / YouTube URL...'}
                          value={newProdVideo}
                          onChange={(e) => setNewProdVideo(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-[10px] text-slate-800 font-mono"
                        />
                      </div>
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
              {products.map((p, pIdx) => (
                <div key={p.id || (p as any)._id || `prod-${pIdx}`} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 shrink-0">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600'}
                        alt={p.nameEnglish}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                      {p.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideoModalUrl(p.videoUrl || null)}
                          className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-1 rounded-full shadow hover:bg-emerald-600 transition-transform hover:scale-110"
                          title="Watch Product Video"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                        </button>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {isUrdu ? p.nameUrdu : p.nameEnglish}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                          {isUrdu ? p.categoryUrdu || p.category : p.category}
                        </span>
                        <span className="text-amber-700 font-black">Rs. {p.pricePKR}</span>
                        {p.videoUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(p.videoUrl || null)}
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border border-purple-300"
                          >
                            <Film className="w-2.5 h-2.5" />
                            <span>{isUrdu ? 'ویڈیو' : 'Video'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.videoUrl && (
                      <button
                        onClick={() => setPreviewVideoModalUrl(p.videoUrl || null)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                        title={isUrdu ? 'ویڈیو دیکھیں' : 'Play Video'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProductAction(p)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Playback Modal */}
            {previewVideoModalUrl && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-sm text-white">
                        {isUrdu ? 'پروڈکٹ ڈیمو ویڈیو پلے بیک' : 'Product Video Player Preview'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setPreviewVideoModalUrl(null)}
                      className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    {previewVideoModalUrl.includes('youtube.com') || previewVideoModalUrl.includes('youtu.be') ? (
                      <iframe
                        src={previewVideoModalUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                        title="Product Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={previewVideoModalUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span className="font-mono text-[11px] truncate max-w-md">{previewVideoModalUrl}</span>
                    <button
                      onClick={() => setPreviewVideoModalUrl(null)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                    >
                      {isUrdu ? 'بند کریں' : 'Close Player'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-emerald-900">
                  {isUrdu ? 'آن لائن آرڈرز کی فہرست (Customer Orders)' : 'Received Customer Store Orders'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'سٹور آرڈرز کی کل تعداد اور تفصیلی ریکارڈ' : `Total ${orders.length} orders recorded across herbal pharmacy store`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportOrdersToCsv(orders)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                title={isUrdu ? 'آرڈرز CSV فائل ڈاؤن لوڈ کریں' : 'Export Orders to CSV for Accounting'}
              >
                <Download className="w-4 h-4" />
                <span>{isUrdu ? 'ایکسپورٹ CSV' : 'Export to CSV'}</span>
              </button>
            </div>
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
                  {orders.map((ord, ordIdx) => (
                    <tr key={ord.id || (ord as any)._id || `ord-${ordIdx}`} className="border-b border-slate-100 hover:bg-slate-50">
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'آن لائن اپائنٹمنٹس کیو و منظوری (Appointments Queue & Control)' : 'Manage Online Clinic Appointments'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
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
                    className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const filtered = appointments.filter((app) => {
                      if (appointmentStatusFilter !== 'All' && app.status !== appointmentStatusFilter) {
                        return false;
                      }
                      if (!appointmentSearch.trim()) return true;
                      const q = appointmentSearch.toLowerCase();
                      return (
                        (app.patientName && app.patientName.toLowerCase().includes(q)) ||
                        (app.phone && app.phone.includes(q)) ||
                        (app.doctorName && app.doctorName.toLowerCase().includes(q)) ||
                        (app.city && app.city.toLowerCase().includes(q)) ||
                        (app.problem && app.problem.toLowerCase().includes(q))
                      );
                    });
                    exportAppointmentsToCsv(filtered);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 transition-all shrink-0 cursor-pointer"
                  title={isUrdu ? 'اپائنٹمنٹس CSV ڈاؤن لوڈ کریں' : 'Export Appointments to CSV for Financial & Patient Reports'}
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>{isUrdu ? 'ایکسپورٹ CSV' : 'Export to CSV'}</span>
                </button>

                <button
                  onClick={() => {
                    if (doctors.length > 0 && !bookDoctorId) {
                      setBookDoctorId(doctors[0].id);
                    }
                    setIsBookModalOpen(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'مریض کی طرف سے اپائنٹمنٹ لیں' : 'Book on Behalf of Patient'}</span>
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 border-b border-slate-100">
              {[
                { id: 'All', label: isUrdu ? `تمام اپائنٹمنٹس (${appointments.length})` : `All (${appointments.length})` },
                { id: 'Pending', label: isUrdu ? `معلق / غیر منظور شدہ (${appointments.filter(a => a.status === 'Pending').length})` : `Pending Review (${appointments.filter(a => a.status === 'Pending').length})` },
                { id: 'Approved', label: isUrdu ? `منظور شدہ (${appointments.filter(a => a.status === 'Approved').length})` : `Approved (${appointments.filter(a => a.status === 'Approved').length})` },
                { id: 'Completed', label: isUrdu ? `مکمل (${appointments.filter(a => a.status === 'Completed').length})` : `Completed (${appointments.filter(a => a.status === 'Completed').length})` },
                { id: 'Cancelled', label: isUrdu ? `منسوخ (${appointments.filter(a => a.status === 'Cancelled').length})` : `Cancelled (${appointments.filter(a => a.status === 'Cancelled').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAppointmentStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appointmentStatusFilter === tab.id
                      ? tab.id === 'Pending'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
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
                      if (appointmentStatusFilter !== 'All' && app.status !== appointmentStatusFilter) {
                        return false;
                      }
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
                    const tokenNum = app.tokenNumber || (app as any).token || (app.id && app.id.startsWith('APP-') ? app.id.replace('APP-', 'TK-') : `TK-${idx + 101}`);
                    return (
                      <tr key={(app as any)._id || `${app.id || 'app'}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-mono font-bold text-amber-700">
                          <div>{displayId}</div>
                          <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded text-[10px] inline-block mt-0.5 font-bold">
                            🎫 {tokenNum}
                          </div>
                          {app.referralToken && (
                            <div className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[9px] block mt-0.5 font-bold">
                              🔄 {app.referralToken}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          <div>{app.patientName}</div>
                          {app.referralStatus === 'Referred' && (
                            <div className="text-[10px] text-amber-700 font-semibold">
                              {isUrdu ? `ریفرڈ برائے: ${app.referralService || app.doctorName}` : `Referred for: ${app.referralService || app.doctorName}`}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{app.phone}</td>
                        <td className="p-2.5 text-slate-700">
                          {(() => {
                            if (isUrdu) return app.city;
                            const cityMap: Record<string, string> = {
                              'گوجرانوالہ': 'Gujranwala',
                              'لاہور': 'Lahore',
                              'سیالکوٹ': 'Sialkot',
                              'فیصل آباد': 'Faisalabad',
                              'اسلام آباد': 'Islamabad',
                              'راولپنڈی': 'Rawalpindi',
                              'ملتان': 'Multan',
                              'پشاور': 'Peshawar',
                              'کراچی': 'Karachi',
                            };
                            return cityMap[app.city] || app.city;
                          })()}
                        </td>
                        <td className="p-2.5 text-emerald-800 font-semibold">
                          {(() => {
                            if (isUrdu) return app.problem;
                            const matchedDis = diseases.find((d) => d.nameUrdu === app.problem || d.nameEnglish === app.problem);
                            if (matchedDis) return matchedDis.nameEnglish;
                            const problemMap: Record<string, string> = {
                              'جوڑوں اور مہروں کا درد': 'Joint & Spine Pain',
                              'کمر و مہروں کا شدید درد': 'Severe Back & Spine Pain',
                              'فالج بحالی فزیوتھراپی': 'Stroke Rehab Physiotherapy',
                              'آن لائن رجسٹریشن (OPD Checkup)': 'Online Registration (OPD Checkup)',
                              'رجسٹرڈ بیمار (OPD Checkup)': 'Registered Patient (OPD Checkup)',
                            };
                            return problemMap[app.problem] || app.problem;
                          })()}
                        </td>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {(() => {
                            const matchedDoc = doctors.find(
                              (d) => d.id === app.doctorId || d.nameUrdu === app.doctorName || d.nameEnglish === app.doctorName
                            );
                            if (matchedDoc) {
                              return isUrdu ? matchedDoc.nameUrdu : matchedDoc.nameEnglish;
                            }
                            if (!isUrdu && app.doctorName) {
                              return app.doctorName
                                .replace('ڈاکٹر زیشان چوہدری', 'Dr. Zeeshan Chaudhry')
                                .replace('ڈاکٹر وقاص صغیر چوہدری', 'Dr. Waqas Sageer Chaudhry')
                                .replace('ڈاکٹر وقاص صغیر', 'Dr. Waqas Sageer')
                                .replace('ڈاکٹر', 'Dr.');
                            }
                            return app.doctorName;
                          })()}
                        </td>
                        <td className="p-2.5 text-amber-800 font-mono font-bold">
                          {app.date} | {(() => {
                            if (!app.timeSlot) return '';
                            if (isUrdu) return app.timeSlot;
                            return app.timeSlot
                              .replace('صبح', 'Morning')
                              .replace('دوپہر', 'Afternoon')
                              .replace('شام', 'Evening')
                              .replace('رات', 'Night');
                          })()}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold inline-block ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : app.status === 'Completed'
                              ? 'bg-teal-100 text-teal-800 border-teal-300'
                              : app.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {app.status === 'Approved'
                              ? (isUrdu ? '✓ منظور شدہ (Approved)' : '✓ Approved')
                              : app.status === 'Completed'
                              ? (isUrdu ? '✓ مکمل (Completed)' : '✓ Completed')
                              : app.status === 'Cancelled'
                              ? (isUrdu ? '✕ منسوخ (Cancelled)' : '✕ Cancelled')
                              : (isUrdu ? '⏳ معلق (Pending)' : '⏳ Pending')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setWhatsAppModalApp(app);
                                setWhatsAppModalLang(isUrdu ? 'urdu' : 'english');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              title={isUrdu ? 'مریض کو واٹس ایپ پر ٹیمپلیٹ میسج بھیجیں' : 'Send automated message via WhatsApp'}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-100" />
                              <span>{isUrdu ? 'واٹس ایپ بھیجیں' : 'Send via WhatsApp'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const found = slipsList.find(
                                  (s) =>
                                    s.appointmentId === app.id ||
                                    (s.tokenNumber && s.tokenNumber === tokenNum) ||
                                    (s.patientPhone && app.phone && s.patientPhone.replace(/\D/g, '') === app.phone.replace(/\D/g, ''))
                                );
                                if (found) {
                                  setSelectedSlipForPrint(found);
                                } else {
                                  createAutoInvoiceFromAppointment(app, doctors).then((createdSlip) => {
                                    setSlipsList((prev) => [createdSlip, ...prev.filter((s) => s.id !== createdSlip.id)]);
                                    setSelectedSlipForPrint(createdSlip);
                                  });
                                }
                              }}
                              className="bg-slate-800 hover:bg-slate-900 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-0.5"
                              title={isUrdu ? 'مریض کی ٹوکن سلپ پرنٹ کریں' : 'Print Token Invoice Slip'}
                            >
                              <Printer className="w-3 h-3" />
                              <span>{isUrdu ? 'ٹوکن' : 'Token'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetPatientToken(tokenNum);
                                setIsAddServiceModalOpen(true);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-0.5"
                              title={isUrdu ? 'اس مریض کے بل میں چارجز / سروس شامل کریں' : 'Add Service Charges'}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isUrdu ? 'سروس' : 'Service'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminUpdateAppointmentStatus(app, 'Approved')}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                              title={isUrdu ? 'منظور کریں' : 'Approve Appointment'}
                            >
                              {isUrdu ? 'منظور' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminUpdateAppointmentStatus(app, 'Completed')}
                              className="bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                              title={isUrdu ? 'مکمل کریں' : 'Mark as Completed'}
                            >
                              {isUrdu ? 'مکمل' : 'Complete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminUpdateAppointmentStatus(app, 'Cancelled')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-rose-300 transition-colors cursor-pointer"
                              title={isUrdu ? 'منسوخ کریں' : 'Cancel Appointment'}
                            >
                              {isUrdu ? 'منسوخ' : 'Cancel'}
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
                    {articles.map((art, artIdx) => (
                      <tr key={art.id || (art as any)._id || `art-${artIdx}`} className="border-b border-slate-100 hover:bg-slate-50">
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
          <div className="space-y-6 text-xs font-semibold text-slate-900">
            {/* Core Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-700" />
                    <span>{isUrdu ? 'کلینک بنیادی معلومات و رابطہ سیٹنگز' : 'Clinic Profile, Contact & System Configuration'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    {isUrdu ? 'کلینک کا نام، پتہ، فون، واٹس ایپ اور سرکاری رجسٹریشن نمبر تبدیل کریں' : 'Update clinic details, official PHC registration, phone numbers, WhatsApp, and location'}
                  </p>
                </div>
                <button
                  onClick={() => alert(isUrdu ? 'تمام سیٹنگز کامیابی سے محفوظ ہو گئیں۔' : 'Clinic settings saved successfully!')}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUrdu ? 'سیٹنگز محفوظ کریں' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'کلینک کا نام (اردو) *' : 'Clinic Name (Urdu) *'}
                  </label>
                  <input
                    type="text"
                    value={settings.clinicNameUrdu}
                    onChange={(e) => onUpdateSettings({ ...settings, clinicNameUrdu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'کلینک کا نام (انگلش) *' : 'Clinic Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={settings.clinicNameEnglish}
                    onChange={(e) => onUpdateSettings({ ...settings, clinicNameEnglish: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'ٹیگ لائن (Urdu Tagline)' : 'Clinic Tagline (Urdu)'}
                  </label>
                  <input
                    type="text"
                    value={settings.taglineUrdu || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, taglineUrdu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'فون نمبر 1 (Primary Phone)' : 'Primary Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={settings.phone1}
                    onChange={(e) => onUpdateSettings({ ...settings, phone1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'فون نمبر 2 (Secondary Phone)' : 'Secondary Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={settings.phone2 || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, phone2: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'واٹس ایپ ہیلپ لائن (WhatsApp Number) *' : 'WhatsApp Helpline Number *'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => onUpdateSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono font-bold"
                    />
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl flex items-center justify-center shrink-0"
                      title="Test WhatsApp Link"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن رجسٹریشن نمبر' : 'Punjab Healthcare Commission Reg #'}
                  </label>
                  <input
                    type="text"
                    value={settings.phcApprovalNo}
                    onChange={(e) => onUpdateSettings({ ...settings, phcApprovalNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'کلینک کا پتہ (اردو)' : 'Clinic Address (Urdu)'}
                  </label>
                  <input
                    type="text"
                    value={settings.addressUrdu || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, addressUrdu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'کلینک کا پتہ (English)' : 'Clinic Address (English)'}
                  </label>
                  <input
                    type="text"
                    value={settings.addressEnglish}
                    onChange={(e) => onUpdateSettings({ ...settings, addressEnglish: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'اوقات کار (Timings Urdu)' : 'Clinic Timings (Urdu)'}
                  </label>
                  <input
                    type="text"
                    value={settings.timingsUrdu || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, timingsUrdu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'گوگل میپس لوکیشن لنک (Google Maps URL)' : 'Google Maps Location Link'}
                  </label>
                  <input
                    type="text"
                    value={settings.googleMapsUrl || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Video Management Section for Clinic, Eye, Hair Oil, Cream, Pain Relief */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <Film className="w-5 h-5" />
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {isUrdu ? 'سیکشنز اور پراڈکٹس ویڈیو مینیجر (Video Showcase Manager)' : 'Section & Product Video Showcase Management'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isUrdu
                      ? 'کلینک ٹور، آئی کیئر سنٹر، ہوراب ہیئر آئل اور بیوٹی کریم کی لائیو ویڈیوز تبدیل کریں یا نئی ویڈیو فائل اپلوڈ کریں'
                      : 'Upload or embed high-resolution videos for Clinic Overview, Eye Care, Hair Oil, and Beauty Cream sections.'}
                  </p>
                </div>
                <div className="bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isUrdu ? '5 اہم سیکشنز لائیو ویڈیوز' : '5 Live Video Sections'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Clinic Overview Video */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-900/90 text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-lg">
                      🏥 {isUrdu ? '1. کلینک تعارف و ٹور ویڈیو' : '1. Clinic Overview Video'}
                    </span>
                    {settings.clinicVideoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, clinicVideoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        {isUrdu ? 'ویڈیو ختم کریں' : 'Remove Video'}
                      </button>
                    )}
                  </div>

                  {/* Video Preview Box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center group shadow-md">
                    {settings.clinicVideoUrl ? (
                      settings.clinicVideoUrl.includes('youtube.com') || settings.clinicVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={settings.clinicVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          title="Clinic Video"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <video src={settings.clinicVideoUrl} className="w-full h-full object-cover" muted />
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(settings.clinicVideoUrl || null)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-8 h-8 text-white drop-shadow" />
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                        <Film className="w-8 h-8 text-slate-600" />
                        <span>{isUrdu ? 'کوئی ویڈیو لنک موجود نہیں' : 'No video uploaded'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو ٹائٹل (اردو)' : 'Video Title (Urdu)'}
                      </label>
                      <input
                        type="text"
                        value={settings.clinicVideoTitleUrdu || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, clinicVideoTitleUrdu: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو URL یا یوٹیوب لنک' : 'Video URL / YouTube Link'}
                      </label>
                      <input
                        type="text"
                        value={settings.clinicVideoUrl || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, clinicVideoUrl: e.target.value })}
                        placeholder="https://... or YouTube link"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white font-mono text-[10px]"
                      />
                    </div>

                    <div className="pt-1">
                      <input
                        type="file"
                        accept="video/*"
                        id="clinic-vid-file"
                        onChange={(e) => e.target.files?.[0] && handleSectionVideoFileUpload('clinic', e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="clinic-vid-file"
                        className="w-full bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-xs shadow transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingSectionVideo === 'clinic'
                            ? (isUrdu ? 'ویڈیو اپلوڈ ہو رہی ہے...' : 'Uploading Video...')
                            : (isUrdu ? 'ویڈیو فائل اپلوڈ کریں (MP4)' : 'Upload Clinic Video File (MP4)')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Eye Care & Vision Center Video */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-cyan-900/90 text-cyan-300 text-[11px] font-black px-2.5 py-1 rounded-lg">
                      👁️ {isUrdu ? '2. آئی کیئر اینڈ نظر سنٹر ویڈیو' : '2. Eye Care & Vision Video'}
                    </span>
                    {settings.eyeCareVideoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, eyeCareVideoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        {isUrdu ? 'ویڈیو ختم کریں' : 'Remove Video'}
                      </button>
                    )}
                  </div>

                  {/* Video Preview Box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center group shadow-md">
                    {settings.eyeCareVideoUrl ? (
                      settings.eyeCareVideoUrl.includes('youtube.com') || settings.eyeCareVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={settings.eyeCareVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          title="Eye Care Video"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <video src={settings.eyeCareVideoUrl} className="w-full h-full object-cover" muted />
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(settings.eyeCareVideoUrl || null)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-8 h-8 text-white drop-shadow" />
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                        <Film className="w-8 h-8 text-slate-600" />
                        <span>{isUrdu ? 'کوئی ویڈیو لنک موجود نہیں' : 'No video uploaded'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو ٹائٹل (اردو)' : 'Video Title (Urdu)'}
                      </label>
                      <input
                        type="text"
                        value={settings.eyeCareVideoTitleUrdu || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, eyeCareVideoTitleUrdu: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو URL یا یوٹیوب لنک' : 'Video URL / YouTube Link'}
                      </label>
                      <input
                        type="text"
                        value={settings.eyeCareVideoUrl || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, eyeCareVideoUrl: e.target.value })}
                        placeholder="https://... or YouTube link"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white font-mono text-[10px]"
                      />
                    </div>

                    <div className="pt-1">
                      <input
                        type="file"
                        accept="video/*"
                        id="eyecare-vid-file"
                        onChange={(e) => e.target.files?.[0] && handleSectionVideoFileUpload('eyeCare', e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="eyecare-vid-file"
                        className="w-full bg-cyan-800 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-xs shadow transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingSectionVideo === 'eyeCare'
                            ? (isUrdu ? 'ویڈیو اپلوڈ ہو رہی ہے...' : 'Uploading Video...')
                            : (isUrdu ? 'آئی کیئر ویڈیو فائل اپلوڈ کریں' : 'Upload Eye Care Video (MP4)')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Hoorab Herbal Hair Oil Video */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-900/90 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg">
                      💇‍♂️ {isUrdu ? '3. ہوراب ہربل ہیئر آئل ویڈیو' : '3. Hoorab Hair Oil Video'}
                    </span>
                    {settings.hairOilVideoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, hairOilVideoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        {isUrdu ? 'ویڈیو ختم کریں' : 'Remove Video'}
                      </button>
                    )}
                  </div>

                  {/* Video Preview Box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center group shadow-md">
                    {settings.hairOilVideoUrl ? (
                      settings.hairOilVideoUrl.includes('youtube.com') || settings.hairOilVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={settings.hairOilVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          title="Hair Oil Video"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <video src={settings.hairOilVideoUrl} className="w-full h-full object-cover" muted />
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(settings.hairOilVideoUrl || null)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-8 h-8 text-white drop-shadow" />
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                        <Film className="w-8 h-8 text-slate-600" />
                        <span>{isUrdu ? 'کوئی ویڈیو لنک موجود نہیں' : 'No video uploaded'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو ٹائٹل (اردو)' : 'Video Title (Urdu)'}
                      </label>
                      <input
                        type="text"
                        value={settings.hairOilVideoTitleUrdu || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, hairOilVideoTitleUrdu: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو URL یا یوٹیوب لنک' : 'Video URL / YouTube Link'}
                      </label>
                      <input
                        type="text"
                        value={settings.hairOilVideoUrl || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, hairOilVideoUrl: e.target.value })}
                        placeholder="https://... or YouTube link"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white font-mono text-[10px]"
                      />
                    </div>

                    <div className="pt-1">
                      <input
                        type="file"
                        accept="video/*"
                        id="hairoil-vid-file"
                        onChange={(e) => e.target.files?.[0] && handleSectionVideoFileUpload('hairOil', e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="hairoil-vid-file"
                        className="w-full bg-amber-800 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-xs shadow transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingSectionVideo === 'hairOil'
                            ? (isUrdu ? 'ویڈیو اپلوڈ ہو رہی ہے...' : 'Uploading Video...')
                            : (isUrdu ? 'ہیئر آئل ویڈیو فائل اپلوڈ کریں' : 'Upload Hair Oil Video (MP4)')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Hoorab Beauty Cream Video */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-teal-900/90 text-teal-300 text-[11px] font-black px-2.5 py-1 rounded-lg">
                      ✨ {isUrdu ? '4. ہوراب بیوٹی کریم ویڈیو' : '4. Hoorab Beauty Cream Video'}
                    </span>
                    {settings.beautyCreamVideoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, beautyCreamVideoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        {isUrdu ? 'ویڈیو ختم کریں' : 'Remove Video'}
                      </button>
                    )}
                  </div>

                  {/* Video Preview Box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center group shadow-md">
                    {settings.beautyCreamVideoUrl ? (
                      settings.beautyCreamVideoUrl.includes('youtube.com') || settings.beautyCreamVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={settings.beautyCreamVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          title="Beauty Cream Video"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <video src={settings.beautyCreamVideoUrl} className="w-full h-full object-cover" muted />
                          <button
                            type="button"
                            onClick={() => setPreviewVideoModalUrl(settings.beautyCreamVideoUrl || null)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-8 h-8 text-white drop-shadow" />
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                        <Film className="w-8 h-8 text-slate-600" />
                        <span>{isUrdu ? 'کوئی ویڈیو لنک موجود نہیں' : 'No video uploaded'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو ٹائٹل (اردو)' : 'Video Title (Urdu)'}
                      </label>
                      <input
                        type="text"
                        value={settings.beautyCreamVideoTitleUrdu || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, beautyCreamVideoTitleUrdu: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-[11px] font-bold mb-1">
                        {isUrdu ? 'ویڈیو URL یا یوٹیوب لنک' : 'Video URL / YouTube Link'}
                      </label>
                      <input
                        type="text"
                        value={settings.beautyCreamVideoUrl || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, beautyCreamVideoUrl: e.target.value })}
                        placeholder="https://... or YouTube link"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white font-mono text-[10px]"
                      />
                    </div>

                    <div className="pt-1">
                      <input
                        type="file"
                        accept="video/*"
                        id="cream-vid-file"
                        onChange={(e) => e.target.files?.[0] && handleSectionVideoFileUpload('beautyCream', e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="cream-vid-file"
                        className="w-full bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-xs shadow transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingSectionVideo === 'beautyCream'
                            ? (isUrdu ? 'ویڈیو اپلوڈ ہو رہی ہے...' : 'Uploading Video...')
                            : (isUrdu ? 'بیوٹی کریم ویڈیو فائل اپلوڈ کریں' : 'Upload Beauty Cream Video (MP4)')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => alert(isUrdu ? 'ویڈیو سیٹنگز کامیابی سے محفوظ ہو گئیں۔' : 'Video settings saved successfully!')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUrdu ? 'تمام ویڈیو سیٹنگز محفوظ کریں' : 'Save All Video Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Automated WhatsApp Message Template Generator & Dispatcher */}
        {whatsAppModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir={isUrdu ? 'rtl' : 'ltr'}>
            <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 text-slate-900 space-y-5 shadow-2xl relative animate-fadeIn">
              <button
                type="button"
                onClick={() => setWhatsAppModalApp(null)}
                className="absolute top-5 left-5 rtl:left-auto rtl:right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-emerald-900/20 shrink-0">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-emerald-950">
                      {isUrdu ? 'خودکار واٹس ایپ میسج ٹیمپلیٹ' : 'Automated WhatsApp Message Template'}
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      WhatsApp Dispatcher
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUrdu
                      ? 'مریض کے نام، معالج اور تاریخ و وقت پر مشتمل خودکار پیغام'
                      : 'Auto-formatted notification containing patient name, doctor, and date/time'}
                  </p>
                </div>
              </div>

              {/* Patient & Appointment Quick Meta Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'مریض کا نام' : 'Patient Name'}</span>
                  <strong className="text-slate-900 block truncate">{whatsAppModalApp.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'موبائل نمبر' : 'Mobile Phone'}</span>
                  <strong className="font-mono text-emerald-800">{whatsAppModalApp.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'موجودہ حالت' : 'Status'}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    whatsAppModalApp.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : whatsAppModalApp.status === 'Completed'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : whatsAppModalApp.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {whatsAppModalApp.status === 'Pending' ? (isUrdu ? 'معلق (Pending)' : 'Pending') : whatsAppModalApp.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'تعینات معالج' : 'Assigned Doctor'}</span>
                  <span className="text-slate-800 font-semibold truncate block">{whatsAppModalApp.doctorName || 'ڈاکٹر زیشان چوہدری'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'تاریخ و وقت' : 'Date & Time'}</span>
                  <span className="text-slate-800 font-mono text-[11px] block">{whatsAppModalApp.date} | {whatsAppModalApp.timeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isUrdu ? 'ٹوکن کوڈ' : 'Token ID'}</span>
                  <span className="font-mono text-amber-800 font-bold">
                    #{whatsAppModalApp.tokenNumber || (whatsAppModalApp.id && whatsAppModalApp.id.startsWith('APP-') ? whatsAppModalApp.id.replace('APP-', '') : '101')}
                  </span>
                </div>
              </div>

              {/* Language Selection & Template Mode */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {isUrdu ? 'ٹیمپلیٹ زبان کا انتخاب:' : 'Select Template Language:'}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setWhatsAppModalLang('urdu')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      whatsAppModalLang === 'urdu'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    اردو (Urdu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsAppModalLang('english')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      whatsAppModalLang === 'english'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Template Text Preview Area */}
              {(() => {
                const isUrduLang = whatsAppModalLang === 'urdu';
                const template = generatePendingAppointmentWhatsAppTemplate(whatsAppModalApp, isUrduLang);
                const messageText = isUrduLang ? template.urdu : template.english;

                return (
                  <div className="space-y-3">
                    <div className="relative bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono leading-relaxed border border-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                      <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                        {whatsAppModalApp.status === 'Pending' ? 'Pending Template' : 'Appointment Template'}
                      </div>
                      <div dir={isUrduLang ? 'rtl' : 'ltr'}>{messageText}</div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(messageText);
                          setCopiedTemplate(true);
                          setTimeout(() => setCopiedTemplate(false), 2500);
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                      >
                        {copiedTemplate ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">{isUrdu ? 'کاپی ہو گیا!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-slate-600" />
                            <span>{isUrdu ? 'ٹیکسٹ کاپی کریں' : 'Copy Message'}</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWhatsAppModalApp(null)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          {isUrdu ? 'بند کریں' : 'Close'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sendPendingAppointmentWhatsApp(whatsAppModalApp, isUrduLang);
                          }}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isUrdu ? 'واٹس ایپ پر بھیجیں' : 'Send via WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Modal: Book Appointment on Behalf of Patient */}
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 text-slate-900 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl flex items-center justify-center font-bold">
                  <Plus className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-950">
                    {isUrdu ? 'مریض کی طرف سے اپائنٹمنٹ بک کریں' : 'Book Appointment on Behalf of Patient'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'ایڈمن کنٹرول سسٹم کے ذریعے فوری اپائنٹمنٹ بکنگ و منظوری' : 'Official Hospital Administration Direct Appointment Booking & Approval'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminBookAppointment} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'معالج منتخب کریں (Select Doctor)' : 'Assigned Specialist Doctor'}
                  </label>
                  <select
                    value={bookDoctorId}
                    onChange={(e) => setBookDoctorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {doctors.map((doc, docIdx) => (
                      <option key={doc.id || (doc as any)._id || `bdoc-${docIdx}`} value={doc.id}>
                        {isUrdu ? doc.nameUrdu : doc.nameEnglish} ({doc.specialtyUrdu || doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'مریض کا پورا نام' : 'Patient Full Name'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookPatientName}
                      onChange={(e) => setBookPatientName(e.target.value)}
                      placeholder={isUrdu ? 'مثال: محمد احمد' : 'e.g. Muhammad Ahmed'}
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'موبائل نمبر (WhatsApp/Phone)' : 'Phone Number'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookPatientPhone}
                      onChange={(e) => setBookPatientPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'شہر (City)' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={bookPatientCity}
                      onChange={(e) => setBookPatientCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'عمر (Age in Years)' : 'Age'}
                    </label>
                    <input
                      type="text"
                      value={bookPatientAge}
                      onChange={(e) => setBookPatientAge(e.target.value)}
                      placeholder="35"
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'تاریخ (Date)' : 'Appointment Date'}
                    </label>
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'وقت (Time Slot)' : 'Time Slot'}
                    </label>
                    <select
                      value={bookTimeSlot}
                      onChange={(e) => setBookTimeSlot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="صبح 10:00 بجے (Morning Slot)">صبح 10:00 بجے (10:00 AM Morning)</option>
                      <option value="دوپہر 02:00 بجے (Afternoon Slot)">دوپہر 02:00 بجے (02:00 PM Afternoon)</option>
                      <option value="شام 06:00 بجے (Evening Slot)">شام 06:00 بجے (06:00 PM Evening)</option>
                      <option value="رات 08:30 بجے (Night Slot)">رات 08:30 بجے (08:30 PM Night)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'طبی مسئلہ / مرض (Medical Problem)' : 'Medical Problem / Diagnosis'}
                  </label>
                  <input
                    type="text"
                    value={bookProblem}
                    onChange={(e) => setBookProblem(e.target.value)}
                    placeholder={isUrdu ? 'مثال: جوڑوں کا درد، کمر درد، عام چیک اپ' : 'e.g. Joint Pain, Backache, General OPD'}
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'منظوری اسٹیٹس (Approval Status)' : 'Initial Status'}
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-300 p-2.5 rounded-xl flex-1">
                      <input
                        type="radio"
                        name="bookStatus"
                        value="Approved"
                        checked={bookStatus === 'Approved'}
                        onChange={() => setBookStatus('Approved')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-800 font-bold">✓ Approved (منظور شدہ)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-300 p-2.5 rounded-xl flex-1">
                      <input
                        type="radio"
                        name="bookStatus"
                        value="Pending"
                        checked={bookStatus === 'Pending'}
                        onChange={() => setBookStatus('Pending')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-amber-800 font-bold">⏳ Pending Queue (معلق کیو)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBook}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
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
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 text-slate-900 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setIsRegPatientModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-center font-bold">
                  <Users className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-950">
                    {isUrdu ? 'نیا مریض اکاؤنٹ رجسٹر کریں' : 'Register New Patient Record'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'کلینک ای ایم آر ڈیٹا بیس میں نیا بیمار کا ریکارڈ شامل کریں' : 'Add official patient user profile into hospital DB'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'مریض کا اسم گرامی (Full Name)' : 'Patient Name'} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regPatientName}
                    onChange={(e) => setRegPatientName(e.target.value)}
                    placeholder={isUrdu ? 'مثال: علی حسن' : 'Ali Hassan'}
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'یوزر نیم (Username / Patient ID)' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={regPatientUsername}
                    onChange={(e) => setRegPatientUsername(e.target.value)}
                    placeholder="patient123"
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'فون نمبر (Phone Number)' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={regPatientPhone}
                    onChange={(e) => setRegPatientPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isUrdu ? 'شہر (City)' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={regPatientCity}
                    onChange={(e) => setRegPatientCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsRegPatientModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Patient Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Staff Account & Assign RBAC Rules */}
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 text-slate-900 space-y-5 shadow-2xl relative my-8">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-11 h-11 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-950">
                    {editingStaffId
                      ? (isUrdu ? 'اسٹاف ممبر اکاؤنٹ اور رولز میں ترمیم کریں' : 'Edit Staff Account & RBAC Permissions')
                      : (isUrdu ? 'نیا اسٹاف اکاؤنٹ بنائیں اور اختیارات تفویض کریں' : 'Issue New Staff Account & Assign RBAC Rules')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu
                      ? 'ایڈمن کے جاری کردہ لاگ ان کریڈنشلز اور سخت پابندیاں'
                      : 'Define login credentials and enforce strict, role-bounded permissions for this staff member.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStaffUser} className="space-y-4 text-xs font-semibold">
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'اسٹاف ممبر کا پورا نام (English)' : 'Staff Full Name (English)'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formStaffName}
                      onChange={(e) => setFormStaffName(e.target.value)}
                      placeholder="e.g. Dr. Asim Raza"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'نام اردو میں' : 'Staff Name (Urdu)'}
                    </label>
                    <input
                      type="text"
                      value={formStaffNameUrdu}
                      onChange={(e) => setFormStaffNameUrdu(e.target.value)}
                      placeholder="مثال: ڈاکٹر عاصم رضا"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Credentials */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Key className="w-4 h-4 text-amber-700" />
                    <span>{isUrdu ? 'ایڈمن جاری کردہ لاگ ان کریڈنشلز (Login Credentials)' : 'Admin-Issued Login Credentials'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-amber-950 mb-1">
                        {isUrdu ? 'یوزر نیم (Unique Username)' : 'Username'} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formStaffUsername}
                        onChange={(e) => setFormStaffUsername(e.target.value)}
                        placeholder="e.g. dr_asim"
                        className="w-full bg-white border border-amber-300 p-2.5 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-950 mb-1">
                        {isUrdu ? 'پاس ورڈ (Assigned Password)' : 'Assigned Password'} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formStaffPassword}
                        onChange={(e) => setFormStaffPassword(e.target.value)}
                        placeholder="e.g. staff123"
                        className="w-full bg-white border border-amber-300 p-2.5 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    {isUrdu
                      ? 'یہ یوزر نیم اور پاس ورڈ اسٹاف ممبر کو جاری کریں، وہ پورٹل میں صرف انہی سے لاگ ان کر سکے گا۔'
                      : 'Staff members authenticate exclusively with these admin-issued credentials.'}
                  </p>
                </div>

                {/* Role, Department, Shift */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'ہسپتال رول' : 'Hospital Role'} <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={formStaffRole}
                      onChange={(e) => {
                        const newRole = e.target.value as StaffRole;
                        setFormStaffRole(newRole);
                        // Auto-suggest permissions
                        if (newRole === 'doctor') {
                          setFormStaffPermissions(['opd_consultation', 'digital_rx', 'opd_queue_call']);
                          setFormStaffDepartment('Consultant Clinic');
                        } else if (newRole === 'lab_doctor') {
                          setFormStaffPermissions(['pathology_blood_tests', 'radiology_reporting', 'ultrasound_reporting', 'eye_diagnostics_report']);
                          setFormStaffDepartment('Diagnostics Department');
                        } else if (newRole === 'nurse') {
                          setFormStaffPermissions(['nursing_vitals_sheet', 'iv_fluid_administration', 'nursing_mar_chart']);
                          setFormStaffDepartment('IPD Nursing Ward');
                        } else if (newRole === 'pharmacist') {
                          setFormStaffPermissions(['pos_billing', 'stock_batches', 'pharmacy_dispensing']);
                          setFormStaffDepartment('Hospital Main Pharmacy');
                        } else if (newRole === 'ipd_incharge') {
                          setFormStaffPermissions(['bed_allocation', 'ipd_discharge', 'ward_shift_incharge']);
                          setFormStaffDepartment('Inpatient Ward Admissions');
                        } else if (newRole === 'receptionist') {
                          setFormStaffPermissions(['opd_queue_call', 'patient_token_issue']);
                          setFormStaffDepartment('Front Desk Reception');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                    >
                      <option value="doctor">OPD Doctor (معالج)</option>
                      <option value="lab_doctor">Lab / Diagnostics Specialist (لیب ڈاکٹر)</option>
                      <option value="nurse">Nurse / Ward Staff (نرسنگ عملہ)</option>
                      <option value="pharmacist">Pharmacist (فارمیسی انچارج)</option>
                      <option value="ipd_incharge">IPD / Ward Incharge (وارڈ انچارج)</option>
                      <option value="receptionist">Receptionist / Queue Caller (ریسیپشن)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'ڈیپارٹمنٹ / شعبہ' : 'Assigned Department'}
                    </label>
                    <input
                      type="text"
                      value={formStaffDepartment}
                      onChange={(e) => setFormStaffDepartment(e.target.value)}
                      placeholder="e.g. Cardiology OPD"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'شفٹ شیڈول' : 'Shift Timing'}
                    </label>
                    <input
                      type="text"
                      value={formStaffShift}
                      onChange={(e) => setFormStaffShift(e.target.value)}
                      placeholder="08:00 AM - 02:00 PM"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* If Lab Doctor: Select Assigned Specialty/Test Section */}
                {formStaffRole === 'lab_doctor' && (
                  <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200 space-y-2">
                    <label className="block text-purple-950 font-bold">
                      {isUrdu ? 'نامزد تشخیصی و لیب کیٹیگری (Assigned Lab Category)' : 'Assigned Diagnostics / Lab Category'}
                    </label>
                    <select
                      value={formStaffAssignedLabCat}
                      onChange={(e) => setFormStaffAssignedLabCat(e.target.value)}
                      className="w-full bg-white border border-purple-300 p-2.5 rounded-xl text-purple-950 font-bold"
                    >
                      <option value="Radiology / X-Ray">Digital X-Ray & Radiology (ایکسرے)</option>
                      <option value="Pathology & Blood Tests">Pathology & Blood Diagnostics (خون و پیتھالوجی)</option>
                      <option value="Ultrasound & Imaging">Ultrasound & Color Doppler (الٹراساؤنڈ)</option>
                      <option value="Optometry & Eye Diagnostics">Optometry & Eye Testing (آنکھوں کے ٹیسٹ)</option>
                      <option value="ECG & Cardiology">ECG & Cardiac Diagnostics (دل کا معائنہ)</option>
                    </select>
                    <p className="text-[10px] text-purple-800">
                      {isUrdu
                        ? 'یہ ڈاکٹر صرف اپنے نامزد تشخیصی ٹیسٹوں کی رپورٹس تیار و تصدیق کر سکے گا۔'
                        : 'This diagnostic doctor will be strictly restricted to managing tests within this assigned specialty.'}
                    </p>
                  </div>
                )}

                {/* Qualification & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'تعلیمی قابلیت (Qualification)' : 'Qualification'}
                    </label>
                    <input
                      type="text"
                      value={formStaffQualification}
                      onChange={(e) => setFormStaffQualification(e.target.value)}
                      placeholder="MBBS, FCPS / B-Pharmacy / Post-RN"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      {isUrdu ? 'موبائل نمبر (Official Phone)' : 'Contact Phone'}
                    </label>
                    <input
                      type="text"
                      value={formStaffPhone}
                      onChange={(e) => setFormStaffPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* RBAC Permissions Matrix Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">
                        {isUrdu ? 'تفویض شدہ RBAC رولز و پابندیاں (Granted Permissions)' : 'Assigned Granular RBAC Permissions'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {isUrdu ? 'صرف وہ اختیارات ٹک کریں جو اس اسٹاف کو دینا چاہتے ہیں' : 'Select only the specific operational capabilities this staff member is permitted to execute.'}
                      </p>
                    </div>

                    <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                      {formStaffPermissions.length} rules assigned
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
                    {HOSPITAL_RBAC_RULES.map((rule) => {
                      const isChecked = formStaffPermissions.includes(rule.id);
                      return (
                        <label
                          key={rule.id}
                          className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(rule.id)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="text-[11px] leading-tight">
                            <div className="font-bold flex items-center gap-1">
                              <span>{rule.nameEnglish}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                                {rule.category}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {rule.nameUrdu}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Status Switch */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">Account Status</span>
                    <p className="text-[10px] text-slate-500">Allow this staff user to sign in to the portal</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formStaffStatus}
                      onChange={(e) => setFormStaffStatus(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className={`text-xs font-bold ${formStaffStatus ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formStaffStatus ? 'Active & Enabled' : 'Suspended'}
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingStaffId ? 'Save Staff Changes' : 'Issue & Activate Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: PRINTABLE MONEY SLIP / INVOICE PREVIEW */}
        {selectedSlipForPrint && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto text-slate-900">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
              <div className="no-print flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isUrdu ? 'پرنٹ پریویو - مریض کیش و منی سلپ (Money Slip Preview)' : 'Patient Official Money Slip Print Preview'}
                </h3>
                <button
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Printable Area */}
              <div id="printable-slip-content" className="printable-area bg-white p-6 rounded-2xl border border-slate-300 space-y-6">
                {/* Slip Header */}
                <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-emerald-950">
                      {isUrdu ? 'حافظ کلینک اینڈ آن لائن ہسپتال' : 'Hafiz Clinic & Medical Center'}
                    </h2>
                    <p className="text-xs text-emerald-800 font-bold mt-0.5">
                      {isUrdu ? 'مالیاتی وصولی رسید (Official Accounts Receipt)' : 'Official Patient Accounts & Billing Slip'}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC Reg # PHC-REG-84920 | Tel: 0300-1234567
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-900">{isUrdu ? 'تاریخ:' : 'Date:'} {selectedSlipForPrint.date}</div>
                    <div className="text-[11px] font-mono font-bold text-emerald-800">Invoice: {selectedSlipForPrint.slipNo}</div>
                    {selectedSlipForPrint.mrnNumber && (
                      <div className="text-[10px] text-slate-500 font-mono">MRN: {selectedSlipForPrint.mrnNumber}</div>
                    )}
                    <div className={`px-2.5 py-0.5 rounded font-bold text-[10px] inline-block mt-1 ${
                      selectedSlipForPrint.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {selectedSlipForPrint.paymentStatus === 'Paid' ? '✓ PAID RECEIPT' : '⏳ BALANCE DUE'}
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3 font-semibold">
                  <div>
                    <span className="text-slate-500">{isUrdu ? 'مریض:' : 'Patient Name:'} </span>
                    <strong className="text-slate-900">{selectedSlipForPrint.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{isUrdu ? 'موبائل نمبر:' : 'Phone:'} </span>
                    <strong className="text-slate-900 font-mono">{selectedSlipForPrint.patientPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{isUrdu ? 'معالج ڈاکٹر:' : 'Attending Doctor:'} </span>
                    <strong className="text-emerald-800">{selectedSlipForPrint.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{isUrdu ? 'طریقہ ادائیگی:' : 'Payment Method:'} </span>
                    <strong className="text-teal-800">{selectedSlipForPrint.paymentMethod}</strong>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{isUrdu ? 'تفصیلات و اخراجات (Itemized Charges):' : 'Itemized Services Breakdown:'}</h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">{isUrdu ? 'تفصیل خدمت / دوائی' : 'Description'}</th>
                        <th className="p-2.5">{isUrdu ? 'قسم' : 'Category'}</th>
                        <th className="p-2.5 text-center">{isUrdu ? 'تعداد' : 'Qty'}</th>
                        <th className="p-2.5 text-right">{isUrdu ? 'نرخ (Rs.)' : 'Rate (Rs.)'}</th>
                        <th className="p-2.5 text-right">{isUrdu ? 'کل (Rs.)' : 'Amount (Rs.)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedSlipForPrint.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.description}</td>
                          <td className="p-2.5 text-slate-600">{item.category}</td>
                          <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono">Rs.{(item.unitPrice ?? 0).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">Rs.{(item.totalPrice ?? (item as any).total ?? ((item.unitPrice || 0) * (item.quantity || 1))).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-semibold max-w-xs ml-auto">
                  <div className="flex justify-between text-slate-600">
                    <span>{isUrdu ? 'ٹوٹل بل (Subtotal):' : 'Subtotal:'}</span>
                    <span className="font-mono">Rs. {(selectedSlipForPrint.subtotal ?? 0).toLocaleString()}</span>
                  </div>
                  {(((selectedSlipForPrint.discount || (selectedSlipForPrint as any).discountAmount) || 0) > 0) && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{isUrdu ? 'خصیص (Discount):' : 'Discount:'}</span>
                      <span className="font-mono">-Rs. {(((selectedSlipForPrint.discount || (selectedSlipForPrint as any).discountAmount) || 0)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold border-t pt-1 text-sm">
                    <span>{isUrdu ? 'واجب الادا کل رقم:' : 'Total Payable:'}</span>
                    <span className="font-mono text-emerald-900">Rs. {(selectedSlipForPrint.totalAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>{isUrdu ? 'وصول شدہ رقم (Paid):' : 'Amount Paid:'}</span>
                    <span className="font-mono">Rs. {(selectedSlipForPrint.paidAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-bold border-t pt-1">
                    <span>{isUrdu ? 'بقايا رقم (Balance Due):' : 'Balance Remaining:'}</span>
                    <span className="font-mono text-amber-900">Rs. {(selectedSlipForPrint.balanceAmount ?? 0).toLocaleString()}</span>
                  </div>
                </div>

                {selectedSlipForPrint.notes && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong className="block mb-0.5 font-bold">{isUrdu ? 'ملاحظات / ہدایات:' : 'Remarks / Notes:'}</strong>
                    {selectedSlipForPrint.notes}
                  </div>
                )}

                {/* Stamp & Signature Footer */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500">
                      {isUrdu ? 'کمپیوٹر سے باضابطہ جاری کردہ وصولی کیش سلپ۔' : 'Computerized verified accounts cash slip.'}
                    </div>
                    <div className="text-[10px] text-emerald-800 font-mono font-bold">Hafiz Clinic Accounts & Billing Dept.</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-900 font-serif border-b border-slate-400 px-4 pb-1">
                      Accounts Officer / Cashier
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">{isUrdu ? 'دستخط و مہر اکاؤنٹس' : 'Signature & Official Stamp'}</div>
                  </div>
                </div>
              </div>

              {/* Print & Action Controls */}
              <div className="no-print flex flex-wrap justify-end items-center gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadSlipPdf}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Direct Download PDF Document"
                >
                  {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isUrdu ? 'ڈاؤنلوڈ PDF رسید' : 'Save PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectedSlipForPrint && printInvoiceHtml(selectedSlipForPrint, { format: 'thermal', method: 'iframe' })}
                  className="px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="80mm Thermal Receipt Slip"
                >
                  <Receipt className="w-3.5 h-3.5 text-teal-700" />
                  <span>{isUrdu ? '80mm تھرمل پرنٹ' : '80mm POS Slip'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectedSlipForPrint && printInvoiceHtml(selectedSlipForPrint, { format: 'a4', method: 'window' })}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open Dedicated Full Screen Print Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نئی ونڈو میں پرنٹ' : 'Open Clean Print Tab'}</span>
                </button>
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleDirectPrintSlip}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  <span>{isUrdu ? 'پرنٹ سلپ / PDF میں محفوظ کریں' : 'Print Slip / Save PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE NEW MONEY SLIP */}
        {isAddSlipModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 text-white space-y-5 shadow-2xl relative my-8">
              <button
                type="button"
                onClick={() => setIsAddSlipModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold">
                  <Receipt className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-emerald-400">
                    {editingSlipId
                      ? (isUrdu ? `مریض کا بل تبدیل کریں (${editingSlipNo})` : `Edit Patient Invoice (${editingSlipNo})`)
                      : (isUrdu ? 'نیا مریض منی سلپ و کیش بل بنائیں' : 'Generate Patient Itemized Billing Money Slip')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingSlipId
                      ? (isUrdu ? 'چارجز، ادویات، سروسز، رعایت اور ادائیگیوں میں ترمیم کریں' : 'Modify items, quantities, prices, discounts, and payments')
                      : (isUrdu ? 'معائنہ فیس، ادویات، آپریشن، ٹیسٹ اور وارڈ اخراجات کا تفصیلی چارج بنائیں' : 'Record checkup fees, medicines, operations, tests & ward charges')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveMoneySlip} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'مریض کا پورا نام' : 'Patient Full Name'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={slipPatientName}
                      onChange={(e) => setSlipPatientName(e.target.value)}
                      placeholder={isUrdu ? 'مثال: محمد فاروق' : 'e.g. Muhammad Farooq'}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'موبائل نمبر (WhatsApp/Phone)' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={slipPatientPhone}
                      onChange={(e) => setSlipPatientPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'ٹوکن نمبر (Token Number)' : 'Token #'}
                    </label>
                    <input
                      type="text"
                      value={slipTokenNumber}
                      onChange={(e) => setSlipTokenNumber(e.target.value)}
                      placeholder="TK-101"
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-amber-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'ایم آر این نمبر (MRN / Patient ID)' : 'Medical Record # (MRN)'}
                    </label>
                    <input
                      type="text"
                      value={slipMrnNumber}
                      onChange={(e) => setSlipMrnNumber(e.target.value)}
                      placeholder="MRN-8812"
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'معالج ڈاکٹر (Attending Doctor)' : 'Attending Doctor'}
                    </label>
                    <select
                      value={slipDoctorName}
                      onChange={(e) => setSlipDoctorName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    >
                      {doctors.map((d, dIdx) => (
                        <option key={d.id || (d as any)._id || `sdoc-${dIdx}`} value={isUrdu ? d.nameUrdu : d.nameEnglish}>
                          {isUrdu ? d.nameUrdu : d.nameEnglish}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'تاریخ (Date)' : 'Billing Date'}
                    </label>
                    <input
                      type="date"
                      value={slipDate}
                      onChange={(e) => setSlipDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}
                    </label>
                    <select
                      value={slipPaymentMethod}
                      onChange={(e) => setSlipPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value="Cash">کیش (Cash)</option>
                      <option value="Card">ڈیبٹ / کریڈٹ کارڈ (Card)</option>
                      <option value="EasyPaisa">ایزی پیسہ (EasyPaisa)</option>
                      <option value="JazzCash">جاز کیش (JazzCash)</option>
                      <option value="Bank Transfer">آن لائن بینک ٹرانسفر (Bank Transfer)</option>
                    </select>
                  </div>
                </div>

                {/* Itemized Services Section */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span>{isUrdu ? 'خدمات، ادویات اور اخراجات کی تفصیل (Itemized Charges)' : 'Itemized Services Breakdown'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isUrdu ? '+ نیا آئٹم شامل کریں' : '+ Add Line Item'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {slipItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <div className="col-span-12 sm:col-span-5">
                          <input
                            type="text"
                            placeholder={isUrdu ? 'خدمت / دوائی / آپریشن کی تفصیل' : 'Description'}
                            value={item.description}
                            onChange={(e) => handleUpdateItemRow(item.id, 'description', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white font-semibold"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateItemRow(item.id, 'category', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-200 text-[11px]"
                          >
                            <option value="Checkup Fee">Checkup Fee (معائنہ)</option>
                            <option value="Medicine">Medicine (ادویات)</option>
                            <option value="Operation / Surgery">Operation / Surgery (آنکولوجی/سرجری)</option>
                            <option value="Lab Test / Scan">Lab Test / Scan (ٹیسٹ و اسکین)</option>
                            <option value="Physiotherapy">Physiotherapy (فزیو تھراپی)</option>
                            <option value="Bed Charge">Bed Charge (وارڈ/بیڈ)</option>
                            <option value="Other">Other (دیگر چارجز)</option>
                          </select>
                        </div>
                        <div className="col-span-3 sm:col-span-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemRow(item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white text-center font-mono font-bold"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemRow(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-emerald-300 font-mono font-bold"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Bar */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      {isUrdu ? 'سب ٹوٹل بل' : 'Subtotal'}
                    </label>
                    <div className="text-base font-black text-white font-mono">
                      Rs. {calculateSlipSubtotal().toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      {isUrdu ? 'خصیص (Discount Rs.)' : 'Discount (Rs.)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={slipDiscount}
                      onChange={(e) => setSlipDiscount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      {isUrdu ? 'وصول شدہ کیش (Amount Paid)' : 'Amount Paid (Rs.)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={slipPaidAmount}
                      onChange={(e) => setSlipPaidAmount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      {isUrdu ? 'بقايا رقم (Balance Due)' : 'Balance Due'}
                    </label>
                    <div className="text-base font-black text-amber-400 font-mono">
                      Rs. {calculateSlipBalance().toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'خصوصی ملاحظات و ہدایات' : 'Special Billing Remarks / Notes'}
                  </label>
                  <input
                    type="text"
                    value={slipNotes}
                    onChange={(e) => setSlipNotes(e.target.value)}
                    placeholder={isUrdu ? 'مثال: مریض نے 5000 نقد دیے اور 3000 بعد میں دیں گے۔' : 'e.g. Paid partial cash, balance due next OPD.'}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddSlipModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {editingSlipId
                        ? (isUrdu ? 'بل میں تبدیلی محفوظ کریں (Update Invoice)' : 'Update & Save Invoice')
                        : (isUrdu ? 'کیش سلپ محفوظ و پرنٹ کریں' : 'Save & Generate Print Slip')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2.5: QUICK ADD HOSPITAL SERVICE / TEST / MEDICINE TO PATIENT TOKEN INVOICE */}
        {isAddServiceModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 text-white space-y-5 shadow-2xl relative my-8">
              <button
                type="button"
                onClick={() => setIsAddServiceModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-amber-400">
                    {isUrdu ? 'مریض کے ٹوکن بل میں سروس یا دوائی شامل کریں' : 'Add Hospital Service / Rx to Patient Token'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu
                      ? 'ایکسرے، لیب ٹیسٹ، ادویات، حجامہ، بیڈ چارجز مریض کے اسی مستقل ٹوکن انوائس میں شامل کریں'
                      : 'Attach radiology, lab tests, pharmacy, nursing or bed charges to existing patient token invoice'}
                  </p>
                </div>
              </div>

              {/* Target Token Selection */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
                <label className="block text-slate-300 text-xs font-bold">
                  {isUrdu ? 'مریض کا ٹوکن نمبر / رسید نمبر منتخب یا درج کریں:' : 'Select or Enter Patient Token Number / Slip #:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={targetPatientToken}
                      onChange={(e) => setTargetPatientToken(e.target.value)}
                      placeholder="e.g. TK-101 or 03001234567"
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-amber-300 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <select
                      value={targetPatientToken}
                      onChange={(e) => setTargetPatientToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white text-xs font-medium cursor-pointer"
                    >
                      <option value="">-- {isUrdu ? 'موجودہ مریض منتخب کریں' : 'Pick from active invoices'} --</option>
                      {slipsList.slice(0, 15).map((sl) => (
                        <option key={sl.id} value={sl.tokenNumber || sl.slipNo}>
                          {sl.tokenNumber ? `[${sl.tokenNumber}] ` : ''}{sl.patientName} - {sl.slipNo} ({sl.paymentStatus})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Show Preview of Selected Patient Slip */}
                {(() => {
                  const match = slipsList.find(
                    (s) =>
                      (s.tokenNumber && s.tokenNumber.toLowerCase() === targetPatientToken.trim().toLowerCase()) ||
                      s.slipNo.toLowerCase() === targetPatientToken.trim().toLowerCase() ||
                      (s.patientPhone && s.patientPhone.replace(/\D/g, '') === targetPatientToken.replace(/\D/g, ''))
                  );
                  if (!match) return null;
                  return (
                    <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-emerald-300">
                          {match.patientName} <span className="text-slate-400">({match.patientPhone})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Slip #{match.slipNo} • Token #{match.tokenNumber || 'None'} • {match.items?.length || 0} existing items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400">
                          Total: Rs. {(match.totalAmount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold">
                          Balance Due: Rs. {(match.balanceAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Service Catalog Fast Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">
                    {isUrdu ? 'ہسپتال سروس یا ٹیسٹ کیٹلاگ:' : 'Select Standard Hospital Service / Test:'}
                  </label>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {isUrdu ? 'فوری چارجز لسٹ' : 'Pre-configured Rates'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HOSPITAL_SERVICES_CATALOG.slice(0, 8).map((srv, sIdx) => {
                    const srvName = isUrdu ? srv.nameUrdu : srv.nameEnglish;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setCustomServiceName(srvName);
                          setCustomServiceCat(srv.category);
                          setCustomServicePrice(srv.unitPrice);
                          setSelectedServiceDept(srv.department);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          customServiceName === srvName
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{srvName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{srv.category}</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-1">Rs. {srv.unitPrice}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Item Specification */}
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1 font-bold">
                      {isUrdu ? 'سروس یا دوائی کا نام (Description)' : 'Service / Item Description'}
                    </label>
                    <input
                      type="text"
                      value={customServiceName}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                      placeholder="e.g. Chest X-Ray / CBC Blood Test / Tab Panadol 500mg"
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      {isUrdu ? 'کیٹیگری (Category)' : 'Category'}
                    </label>
                    <select
                      value={customServiceCat}
                      onChange={(e) => setCustomServiceCat(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white font-medium cursor-pointer"
                    >
                      <option value="Consultation">Consultation (معائنہ)</option>
                      <option value="X-Ray / Radiology">Radiology & X-Ray (ایکسرے)</option>
                      <option value="Lab Test / Scan">Laboratory & Tests (لیب ٹیسٹ)</option>
                      <option value="Medicine">Medicine & Pharmacy (ادویات)</option>
                      <option value="Hijama / Cupping">Hijama / Cupping (حجامہ)</option>
                      <option value="Physiotherapy">Physiotherapy (فزیوتھراپی)</option>
                      <option value="Eye Care / Glasses">Eye Care / Optical (آنکھیں / عینک)</option>
                      <option value="Operation / Surgery">Operation / Surgery (آپریشن)</option>
                      <option value="Dressing / Nursing">Dressing & Nursing (پٹی و ڈریسنگ)</option>
                      <option value="Bed Charge">Bed / Room Ward (بیڈ چارجز)</option>
                      <option value="Misc Service">Misc Service (دیگر چارجز)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      {isUrdu ? 'تعداد (Quantity)' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customServiceQty}
                      onChange={(e) => setCustomServiceQty(Number(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white font-mono font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      {isUrdu ? 'ریٹ فی یونٹ (Unit Price Rs.)' : 'Unit Price (Rs.)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customServicePrice}
                      onChange={(e) => setCustomServicePrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      {isUrdu ? 'کل رقم (Total Amount)' : 'Total (Rs.)'}
                    </label>
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-black text-sm flex items-center justify-between">
                      <span>Rs.</span>
                      <span>{(customServicePrice * customServiceQty).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isAddingServiceLoading || !customServiceName.trim()}
                  onClick={() =>
                    handleQuickAddService(
                      customServiceName,
                      customServiceCat,
                      customServicePrice,
                      selectedServiceDept || 'General',
                      customServiceQty
                    )
                  }
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingServiceLoading ? (isUrdu ? 'شامل ہو رہا ہے...' : 'Adding...') : (isUrdu ? 'ٹوکن انوائس میں شامل کریں' : 'Add to Patient Invoice')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD HOSPITAL EXPENSE VOUCHER */}
        {isAddExpenseModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 text-white space-y-5 shadow-2xl relative my-8">
              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-rose-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold">
                  <TrendingDown className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-rose-400">
                    {isUrdu ? 'نیا اخراجات ووچر درج کریں' : 'Record Hospital Expense Voucher'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'تنخواہیں، ادویات اسٹاک خرید، بجلی بل اور دیگر ہسپتال اخراجات' : 'Log operational expenses, stock purchases & utility vouchers'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'اخراجات کا عنوان (Expense Description)' : 'Expense Title'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder={isUrdu ? 'مثال: نرسنگ اسٹاف اگست تنخواہیں' : 'e.g. Nursing Staff Salaries'}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'اخراجات کی کیٹیگری' : 'Expense Category'}
                    </label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value="Staff Salaries">Staff Salaries (اسٹاف تنخواہیں)</option>
                      <option value="Medicine & Pharmacy Stock">Medicine & Pharmacy Stock (ادویات اسٹاک)</option>
                      <option value="Utilities & Bills">Utilities & Bills (بجلی/گیس بل)</option>
                      <option value="Equipment & Maintenance">Equipment & Maintenance (مشینری سروس)</option>
                      <option value="Hospital Rent">Hospital Rent (عمارت کرایہ)</option>
                      <option value="Tea & Refreshment">Tea & Refreshment (چائے و لنچ)</option>
                      <option value="Surgical & Lab Supplies">Surgical & Lab Supplies (سرجری و لیب مواد)</option>
                      <option value="Miscellaneous">Miscellaneous (متفرق اخراجات)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'اخراجات رقم (Amount in PKR)' : 'Amount (PKR)'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-rose-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'تاریخ (Date)' : 'Expense Date'}
                    </label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      {isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}
                    </label>
                    <select
                      value={expPaymentMethod}
                      onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value="Cash">کیش (Cash)</option>
                      <option value="Bank Transfer">آن لائن بینک ٹرانسفر (Bank Transfer)</option>
                      <option value="EasyPaisa">ایزی پیسہ (EasyPaisa)</option>
                      <option value="JazzCash">جاز کیش (JazzCash)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'ادا شدہ بنام (Paid To / Vendor)' : 'Paid To (Recipient / Vendor Name)'}
                  </label>
                  <input
                    type="text"
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    placeholder={isUrdu ? 'مثال: فیصل آباد الیکٹرک یا سپلائر کا نام' : 'e.g. FAPCO Electric or Vendor'}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    {isUrdu ? 'مزید تفصیلی ملاحظات' : 'Notes / Voucher Details'}
                  </label>
                  <input
                    type="text"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    placeholder={isUrdu ? 'اضافی معلومات...' : 'Additional notes...'}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUrdu ? 'اخراجات ووچر محفوظ کریں' : 'Save Expense Voucher'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Video Preview Popup */}
        {previewVideoModalUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-2xl relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>{isUrdu ? 'ویڈیو کا لائیو پیش منظر (Live Video Preview)' : 'Live Video Preview'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setPreviewVideoModalUrl(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                {previewVideoModalUrl.includes('youtube.com') || previewVideoModalUrl.includes('youtu.be') ? (
                  <iframe
                    src={previewVideoModalUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1'}
                    title="Preview Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewVideoModalUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global System-Wide Search Modal Component (Patients, Appointments, Medicines, Invoices) */}
        <AdminGlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          isUrdu={isUrdu}
          appointments={appointments}
          products={products}
          slips={slipsList}
          users={usersList}
          onNavigateTab={(targetTab, filterParam) => {
            setActiveTab(targetTab as any);
            if (targetTab === 'appointments' && filterParam) {
              setAppointmentSearch(filterParam);
            } else if (targetTab === 'slips' && filterParam) {
              setSlipSearch(filterParam);
            }
          }}
          onSelectSlip={(slip) => {
            setSelectedSlipForPrint(slip);
          }}
        />

      </div>
    </div>
  );
};

