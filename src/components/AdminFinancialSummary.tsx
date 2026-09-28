import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Activity,
  Filter,
  RefreshCw,
  MessageCircle,
  FileText,
  Building,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowUpRight,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { Doctor, Appointment, MoneySlip, HospitalExpense } from '../types';
import { openWhatsAppNotification } from '../utils/notificationDispatcher';

interface AdminFinancialSummaryProps {
  slips: MoneySlip[];
  appointments: Appointment[];
  doctors: Doctor[];
  expenses?: HospitalExpense[];
  language?: 'urdu' | 'english';
  onUpdateSlip?: (updatedSlip: MoneySlip) => void;
}

type TimeRangeFilter = 'today' | '7days' | 'month' | 'all';

export const AdminFinancialSummary: React.FC<AdminFinancialSummaryProps> = ({
  slips,
  appointments,
  doctors,
  expenses = [],
  language = 'urdu',
  onUpdateSlip,
}) => {
  const isUrdu = language === 'urdu';
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>('all');
  const [selectedShiftTab, setSelectedShiftTab] = useState<'all' | 'Morning' | 'Evening' | 'Night'>('all');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [searchPendingPatient, setSearchPendingPatient] = useState('');
  const [settledSlipSuccessId, setSettledSlipSuccessId] = useState<string | null>(null);

  // Today's date in YYYY-MM-DD format
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter slips by selected time range
  const filteredSlips = useMemo(() => {
    if (timeFilter === 'all') return slips;

    const now = new Date();
    return slips.filter((s) => {
      if (!s.date) return true;
      const slipDate = new Date(s.date);
      if (isNaN(slipDate.getTime())) return true;

      if (timeFilter === 'today') {
        return s.date === todayStr;
      }
      if (timeFilter === '7days') {
        const diffDays = (now.getTime() - slipDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return (
          slipDate.getMonth() === now.getMonth() &&
          slipDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [slips, timeFilter, todayStr]);

  // Filter appointments by selected time range
  const filteredAppointments = useMemo(() => {
    if (timeFilter === 'all') return appointments;

    const now = new Date();
    return appointments.filter((app) => {
      if (!app.date) return true;
      const appDate = new Date(app.date);
      if (isNaN(appDate.getTime())) return true;

      if (timeFilter === 'today') {
        return app.date === todayStr;
      }
      if (timeFilter === '7days') {
        const diffDays = (now.getTime() - appDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return (
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [appointments, timeFilter, todayStr]);

  // Filter expenses by selected time range
  const filteredExpenses = useMemo(() => {
    if (timeFilter === 'all') return expenses;
    const now = new Date();
    return expenses.filter((e) => {
      if (!e.date) return true;
      const expDate = new Date(e.date);
      if (isNaN(expDate.getTime())) return true;

      if (timeFilter === 'today') return e.date === todayStr;
      if (timeFilter === '7days') {
        const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [expenses, timeFilter, todayStr]);

  // 1. Shift categorization helper
  const getSlipShift = (s: MoneySlip, index: number): 'Morning' | 'Evening' | 'Night' => {
    if ((s as any).shift) return (s as any).shift;
    if (s.createdAt) {
      try {
        const dateObj = new Date(s.createdAt);
        const hours = dateObj.getHours();
        if (hours >= 8 && hours < 14) return 'Morning';
        if (hours >= 14 && hours < 20) return 'Evening';
        return 'Night';
      } catch (_) {}
    }
    // Deterministic distribution for sample records without timestamp
    const mod = index % 3;
    if (mod === 0) return 'Morning';
    if (mod === 1) return 'Evening';
    return 'Night';
  };

  // 2. Real-Time Shift Financial Health Metrics
  const shiftMetrics = useMemo(() => {
    const shifts = {
      Morning: { revenue: 0, cash: 0, digital: 0, balanceDue: 0, patients: 0, expenses: 0 },
      Evening: { revenue: 0, cash: 0, digital: 0, balanceDue: 0, patients: 0, expenses: 0 },
      Night: { revenue: 0, cash: 0, digital: 0, balanceDue: 0, patients: 0, expenses: 0 },
    };

    filteredSlips.forEach((slip, idx) => {
      const shift = getSlipShift(slip, idx);
      const paid = slip.paidAmount || 0;
      const balance = slip.balanceAmount || 0;

      shifts[shift].revenue += paid;
      shifts[shift].balanceDue += balance;
      shifts[shift].patients += 1;

      if (slip.paymentMethod === 'Cash') {
        shifts[shift].cash += paid;
      } else {
        shifts[shift].digital += paid;
      }
    });

    // Allocate expenses across shifts
    filteredExpenses.forEach((exp, idx) => {
      const shiftKey = (exp as any).shift || (idx % 3 === 0 ? 'Morning' : idx % 3 === 1 ? 'Evening' : 'Night');
      if (shifts[shiftKey as 'Morning' | 'Evening' | 'Night']) {
        shifts[shiftKey as 'Morning' | 'Evening' | 'Night'].expenses += exp.amount || 0;
      }
    });

    const shiftChartData = [
      {
        name: isUrdu ? 'صبح شفٹ (8 AM - 2 PM)' : 'Morning (8 AM - 2 PM)',
        shiftKey: 'Morning',
        revenue: shifts.Morning.revenue,
        expenses: shifts.Morning.expenses,
        netProfit: Math.max(0, shifts.Morning.revenue - shifts.Morning.expenses),
        cash: shifts.Morning.cash,
        digital: shifts.Morning.digital,
        patients: shifts.Morning.patients,
      },
      {
        name: isUrdu ? 'شام شفٹ (2 PM - 8 PM)' : 'Evening (2 PM - 8 PM)',
        shiftKey: 'Evening',
        revenue: shifts.Evening.revenue,
        expenses: shifts.Evening.expenses,
        netProfit: Math.max(0, shifts.Evening.revenue - shifts.Evening.expenses),
        cash: shifts.Evening.cash,
        digital: shifts.Evening.digital,
        patients: shifts.Evening.patients,
      },
      {
        name: isUrdu ? 'رات شفٹ (8 PM - 8 AM)' : 'Night (8 PM - 8 AM)',
        shiftKey: 'Night',
        revenue: shifts.Night.revenue,
        expenses: shifts.Night.expenses,
        netProfit: Math.max(0, shifts.Night.revenue - shifts.Night.expenses),
        cash: shifts.Night.cash,
        digital: shifts.Night.digital,
        patients: shifts.Night.patients,
      },
    ];

    const totalCollected = shifts.Morning.revenue + shifts.Evening.revenue + shifts.Night.revenue;
    const totalExp = shifts.Morning.expenses + shifts.Evening.expenses + shifts.Night.expenses;
    const netHospitalProfit = totalCollected - totalExp;

    return {
      shifts,
      shiftChartData,
      totalCollected,
      totalExp,
      netHospitalProfit,
    };
  }, [filteredSlips, filteredExpenses, isUrdu]);

  // 3. Total Patients Seen per Doctor
  const doctorWorkloadData = useMemo(() => {
    return doctors.map((doc) => {
      const docUrdu = doc.nameUrdu || '';
      const docEng = doc.nameEnglish || '';

      // Count appointments
      const matchedAppointments = filteredAppointments.filter(
        (a) =>
          a.doctorId === doc.id ||
          (a.doctorName && (a.doctorName.includes(docUrdu) || a.doctorName.includes(docEng)))
      );

      const completedAppointments = matchedAppointments.filter((a) => a.status === 'Completed').length;
      const waitingAppointments = matchedAppointments.filter((a) => a.status === 'Pending' || a.status === 'Approved').length;

      // Count consultation slips
      const docSlips = filteredSlips.filter(
        (s) =>
          (s.doctorName && (s.doctorName.includes(docUrdu) || s.doctorName.includes(docEng))) ||
          s.items.some((i) => i.servedBy === docUrdu || i.servedBy === docEng)
      );

      const totalRevenueFromDoctor = docSlips.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      const totalPatients = Math.max(completedAppointments + waitingAppointments, docSlips.length);
      const completedPatients = Math.max(completedAppointments, docSlips.length);

      return {
        id: doc.id,
        doctorName: isUrdu ? (doc.nameUrdu || doc.nameEnglish) : (doc.nameEnglish || doc.nameUrdu),
        shortName: (isUrdu ? (doc.nameUrdu || doc.nameEnglish) : (doc.nameEnglish || doc.nameUrdu)).replace('ڈاکٹر ', 'Dr. '),
        completed: completedPatients,
        waiting: waitingAppointments,
        totalPatients,
        revenue: totalRevenueFromDoctor,
        specialty: isUrdu ? doc.specializationUrdu : doc.specializationEnglish,
      };
    });
  }, [doctors, filteredAppointments, filteredSlips, isUrdu]);

  // 4. Pharmacy Invoices & Pending Receivables Breakdown
  const pharmacyAnalysis = useMemo(() => {
    // Identify slips that have medicine items or are categorized as pharmacy
    const pharmacySlips = filteredSlips.filter((slip) => {
      const isPharmDept = (slip as any).department === 'Pharmacy';
      const hasMedicine = slip.items && slip.items.some((item) => item.category === 'Medicine' || item.department === 'Pharmacy');
      return isPharmDept || hasMedicine;
    });

    const fullyPaidSlips = pharmacySlips.filter((s) => s.paymentStatus === 'Paid' || (s.balanceAmount || 0) <= 0);
    const partialSlips = pharmacySlips.filter((s) => s.paymentStatus === 'Partial' && (s.balanceAmount || 0) > 0);
    const unpaidSlips = pharmacySlips.filter((s) => s.paymentStatus === 'Unpaid' || ((s.paidAmount || 0) === 0 && (s.balanceAmount || 0) > 0));

    const totalPharmacyBilled = pharmacySlips.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalPharmacyCollected = pharmacySlips.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
    const totalPharmacyPending = pharmacySlips.reduce((sum, s) => sum + (s.balanceAmount || 0), 0);

    const pendingInvoicesList = pharmacySlips.filter((s) => (s.balanceAmount || 0) > 0);

    const recoveryRate = totalPharmacyBilled > 0
      ? Math.round((totalPharmacyCollected / totalPharmacyBilled) * 100)
      : 100;

    const pieChartData = [
      {
        name: isUrdu ? 'مکمل ادا شدہ (Cleared)' : 'Paid In Full',
        value: fullyPaidSlips.length || (pharmacySlips.length === 0 ? 1 : 0),
        amount: totalPharmacyCollected,
        color: '#10b981', // emerald-500
      },
      {
        name: isUrdu ? 'جزوی ادائیگی (Partial)' : 'Partial Payment',
        value: partialSlips.length,
        amount: partialSlips.reduce((sum, s) => sum + (s.balanceAmount || 0), 0),
        color: '#f59e0b', // amber-500
      },
      {
        name: isUrdu ? 'مکمل واجب الادا (Unpaid)' : 'Pending / Unpaid',
        value: unpaidSlips.length,
        amount: unpaidSlips.reduce((sum, s) => sum + (s.balanceAmount || 0), 0),
        color: '#ef4444', // rose-500
      },
    ];

    return {
      totalSlips: pharmacySlips.length,
      fullyPaidCount: fullyPaidSlips.length,
      partialCount: partialSlips.length,
      unpaidCount: unpaidSlips.length,
      totalPharmacyBilled,
      totalPharmacyCollected,
      totalPharmacyPending,
      pendingInvoicesList,
      recoveryRate,
      pieChartData,
    };
  }, [filteredSlips, isUrdu]);

  // 5. Departmental Revenue Breakdown
  const departmentalRevenue = useMemo(() => {
    let pharmacy = 0;
    let opd = 0;
    let lab = 0;
    let physio = 0;
    let ipd = 0;

    filteredSlips.forEach((s) => {
      s.items.forEach((item) => {
        const cat = item.category;
        const total = item.totalPrice || 0;
        if (cat === 'Medicine' || item.department === 'Pharmacy') {
          pharmacy += total;
        } else if (cat === 'Lab Test / Scan' || item.department === 'Lab') {
          lab += total;
        } else if (cat === 'Physiotherapy' || item.department === 'Physiotherapy') {
          physio += total;
        } else if (cat === 'Bed Charge' || item.department === 'IPD' || cat === 'Dressing / Nursing') {
          ipd += total;
        } else {
          opd += total;
        }
      });
    });

    return [
      { name: isUrdu ? 'فارمیسی' : 'Pharmacy', amount: pharmacy, color: '#059669' },
      { name: isUrdu ? 'ڈاکٹر OPD' : 'Doctor OPD', amount: opd, color: '#0284c7' },
      { name: isUrdu ? 'پیتھالوجی لیب' : 'Diagnostic Lab', amount: lab, color: '#7c3aed' },
      { name: isUrdu ? 'فزیوتھراپی' : 'Physiotherapy', amount: physio, color: '#d97706' },
      { name: isUrdu ? 'وارڈ / IPD' : 'IPD & Ward', amount: ipd, color: '#dc2626' },
    ];
  }, [filteredSlips, isUrdu]);

  // Quick Settle invoice action
  const handleQuickSettle = (slip: MoneySlip) => {
    const updated: MoneySlip = {
      ...slip,
      paidAmount: slip.totalAmount,
      balanceAmount: 0,
      paymentStatus: 'Paid',
    };
    if (onUpdateSlip) {
      onUpdateSlip(updated);
    }
    setSettledSlipSuccessId(slip.id);
    setTimeout(() => setSettledSlipSuccessId(null), 3000);
  };

  // WhatsApp balance reminder
  const handleSendReminder = (slip: MoneySlip) => {
    openWhatsAppNotification({
      type: 'custom',
      recipientPhone: slip.patientPhone,
      recipientName: slip.patientName,
      customMessage: isUrdu
        ? `محترم ${slip.patientName} صاحب! حافظ کلینک اینڈ فارمیسی کے ریکارڈ کے مطابق آپ کی دواؤں کی مد میں بقایا رقم Rs. ${slip.balanceAmount.toLocaleString()} واجب الادا ہے۔ رسید نمبر: ${slip.slipNo || slip.id}۔ براہ کرم کاؤنٹر پر تشریف لا کر یا ایزی پیسہ/جاز کیش کے ذریعے ادا فرمائیں۔ شکریہ! حافظ کلینک فارمیسی ڈیپارٹمنٹ۔`
        : `Dear ${slip.patientName}, this is a reminder from Hafiz Clinic Pharmacy. You have an outstanding balance of Rs. ${slip.balanceAmount.toLocaleString()} on Invoice #${slip.slipNo || slip.id}. Please clear this at the billing counter or via JazzCash/EasyPaisa. Thank you!`,
      isUrdu,
    });
  };

  return (
    <div className="space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Header & Range Filters */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/40 text-emerald-200 text-xs font-bold tracking-wide uppercase">
                <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                {isUrdu ? 'ریئل ٹائم مالیاتی و کلینیکل سمری' : 'Real-Time Financial & Clinical Pulse'}
              </span>
              <span className="text-[11px] font-mono text-emerald-300/80 bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-700/40">
                L-4 Enterprise BI
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{isUrdu ? 'کلینک مالیاتی صحت و شفٹ اکاؤنٹس اوور ویو' : 'Clinic Financial Health & Real-time Operations'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
              {isUrdu
                ? 'تینوں شفٹوں کی فوری وصولیاں، معالجین کے معائنے، اور فارمیسی کے زیر التواء واجبات کا تفصیلی مالیاتی تجزیہ۔'
                : 'Live multi-shift cashflow tracking, doctor-wise patient throughput, and receivables recovery analysis.'}
            </p>
          </div>

          {/* Time Range Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-emerald-950/70 p-1.5 rounded-2xl border border-emerald-700/50 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              {isUrdu ? 'آج (Today)' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('7days')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === '7days'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              {isUrdu ? 'گزشتہ 7 دن' : '7 Days'}
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('month')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              {isUrdu ? 'اس ماہ (Month)' : 'This Month'}
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              {isUrdu ? 'مکمل ریکارڈ' : 'All Time'}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Shift Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل شفٹ وصولیاں' : 'Total Shift Collections'}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rs. {shiftMetrics.totalCollected.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                {isUrdu
                  ? `${filteredSlips.length} تصدیق شدہ رسیدیں`
                  : `${filteredSlips.length} Verified Invoices`}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{isUrdu ? 'خالص بچت:' : 'Net Profit:'}</span>
            <span className="font-bold text-slate-900">
              Rs. {shiftMetrics.netHospitalProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Total Patients Seen */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل معائنہ شدہ مریض' : 'Total Patients Seen'}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {doctorWorkloadData.reduce((sum, d) => sum + d.completed, 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold mt-1">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>
                {isUrdu
                  ? `${doctors.length} سینئر کنسلٹنٹس آن ڈیوٹی`
                  : `${doctors.length} Physicians on Duty`}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{isUrdu ? 'منتظر / شیڈول:' : 'Pending in Queue:'}</span>
            <span className="font-bold text-amber-700">
              {doctorWorkloadData.reduce((sum, d) => sum + d.waiting, 0)} {isUrdu ? 'مریض' : 'Patients'}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Pharmacy Invoices */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'فارمیسی واجب الادا بلز' : 'Pending Pharmacy Dues'}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              Rs. {pharmacyAnalysis.totalPharmacyPending.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold mt-1">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>
                {isUrdu
                  ? `${pharmacyAnalysis.pendingInvoicesList.length} غیر ادا شدہ بلز`
                  : `${pharmacyAnalysis.pendingInvoicesList.length} Unsettled Bills`}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>{isUrdu ? 'ریکوری شرح:' : 'Recovery Rate:'}</span>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {pharmacyAnalysis.recoveryRate}%
            </span>
          </div>
        </div>

        {/* Card 4: Operating Expenses & Margin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کلینک اخراجات و اوور ہیڈ' : 'Clinic Expenses & Dues'}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rs. {shiftMetrics.totalExp.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mt-1">
              <Building className="w-4 h-4 text-amber-600" />
              <span>
                {isUrdu
                  ? `${filteredExpenses.length} اندراج شدہ واؤچرز`
                  : `${filteredExpenses.length} Logged Expense Vouchers`}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{isUrdu ? 'مارجن ریٹ:' : 'Profit Margin:'}</span>
            <span className="font-bold text-emerald-800">
              {shiftMetrics.totalCollected > 0
                ? `${Math.round((shiftMetrics.netHospitalProfit / shiftMetrics.totalCollected) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Shift Earnings + Patients Per Doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Real-time Shift Earnings & Cash Collection (Recharts BarChart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-base text-slate-900">
                  {isUrdu ? 'شفٹ وار مالیاتی وصولیاں و اخراجات' : 'Real-Time Shift Earnings & Net Outflow'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'صبح، شام اور نائٹ شفٹ کی کل کیش آمدن بمقابلہ اخراجات'
                  : 'Comparative revenue, expenditures, and net cash retention by shift'}
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs self-start sm:self-auto">
              {isUrdu ? '3 فعال شفٹیں' : '3 Operational Shifts'}
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shiftMetrics.shiftChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5" dir={isUrdu ? 'rtl' : 'ltr'}>
                          <div className="font-black text-emerald-300 border-b border-slate-800 pb-1">
                            {data.name}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">{isUrdu ? 'کل وصولی (Gross):' : 'Gross Revenue:'}</span>
                            <span className="font-bold text-emerald-400">Rs. {data.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">{isUrdu ? 'اخراجات (Expenses):' : 'Expenses:'}</span>
                            <span className="font-bold text-rose-400">Rs. {data.expenses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                            <span className="text-slate-300 font-bold">{isUrdu ? 'خالص منافع (Net):' : 'Net Margin:'}</span>
                            <span className="font-black text-amber-300">Rs. {data.netProfit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[10px] text-slate-400 pt-0.5">
                            <span>{isUrdu ? 'مریضوں کی تعداد:' : 'Patients Handled:'}</span>
                            <span className="text-teal-300 font-semibold">{data.patients}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => (
                    <span className="text-slate-600 font-semibold">{val}</span>
                  )}
                />
                <Bar
                  dataKey="revenue"
                  name={isUrdu ? 'آمدن (Revenue)' : 'Revenue (PKR)'}
                  fill="#059669"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="expenses"
                  name={isUrdu ? 'اخراجات (Expenses)' : 'Expenses (PKR)'}
                  fill="#f43f5e"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="netProfit"
                  name={isUrdu ? 'خالص بچت (Net)' : 'Net Profit (PKR)'}
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Shift Badges Summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {shiftMetrics.shiftChartData.map((shift) => (
              <div key={shift.shiftKey} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 truncate">{shift.name.split('(')[0]}</div>
                <div className="text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                  Rs. {shift.revenue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {shift.patients} {isUrdu ? 'مریض' : 'Patients'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Total Patients Seen Per Doctor (Recharts BarChart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <h3 className="font-black text-base text-slate-900">
                  {isUrdu ? 'ڈاکٹرز کے زیر معائنہ مریض و آمدن' : 'Patients Seen & Consultations Per Doctor'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'ہر معالج کی مکمل شدہ او پی ڈی بمقابلہ منتظر مریضوں کا حجم'
                  : 'Completed consultations vs waiting queue volume per specialist'}
              </p>
            </div>
            <span className="bg-teal-100 text-teal-900 font-bold px-3 py-1 rounded-full text-xs self-start sm:self-auto">
              {doctorWorkloadData.reduce((sum, d) => sum + d.completed, 0)} {isUrdu ? 'مکمل معائنے' : 'Consultations'}
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorWorkloadData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5" dir={isUrdu ? 'rtl' : 'ltr'}>
                          <div className="font-black text-teal-300 border-b border-slate-800 pb-1">
                            {data.doctorName}
                          </div>
                          <div className="text-[10px] text-slate-400">{data.specialty}</div>
                          <div className="flex justify-between gap-4 pt-1">
                            <span className="text-slate-400">{isUrdu ? 'مکمل معائنے:' : 'Completed Visits:'}</span>
                            <span className="font-bold text-emerald-400">{data.completed}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">{isUrdu ? 'منتظر مریض:' : 'Waiting Queue:'}</span>
                            <span className="font-bold text-amber-400">{data.waiting}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                            <span className="text-slate-300 font-bold">{isUrdu ? 'حاصل شدہ فیس:' : 'Consultation Revenue:'}</span>
                            <span className="font-black text-emerald-300">Rs. {data.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => (
                    <span className="text-slate-600 font-semibold">{val}</span>
                  )}
                />
                <Bar
                  dataKey="completed"
                  name={isUrdu ? 'مکمل معائنے (Completed)' : 'Completed OPD'}
                  fill="#0d9488"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="waiting"
                  name={isUrdu ? 'منتظر / شیڈول (Queue)' : 'Waiting in Queue'}
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor Performance Summary Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {doctorWorkloadData.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    {doc.doctorName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{doc.doctorName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{doc.specialty}</div>
                  </div>
                </div>
                <div className="text-end shrink-0 ps-3">
                  <div className="font-black text-emerald-800">Rs. {doc.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-teal-700 font-bold">{doc.completed} {isUrdu ? 'مریض' : 'Patients'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Pending Pharmacy Invoices Analysis + Department Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 3: Pharmacy Invoices Donut Chart & Recovery Metric (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-900">
                  {isUrdu ? 'فارمیسی بلز کی ادائیگی اسٹیٹس' : 'Pharmacy Invoices Health'}
                </h3>
              </div>
              <span className="bg-rose-100 text-rose-800 font-black px-2.5 py-1 rounded-full text-xs">
                {pharmacyAnalysis.recoveryRate}% Cleared
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {isUrdu
                ? 'فارمیسی کسٹمرز کے ادا شدہ، جزوی اور واجب الادا بلز کی تقسیم'
                : 'Settled, partially paid, and unpaid pharmacy dispensing slips'}
            </p>

            {/* Donut Chart */}
            <div className="h-56 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pharmacyAnalysis.pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pharmacyAnalysis.pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1" dir={isUrdu ? 'rtl' : 'ltr'}>
                            <div className="font-bold text-emerald-300">{data.name}</div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">{isUrdu ? 'رسیدیں:' : 'Invoice Count:'}</span>
                              <span className="font-black text-white">{data.value}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">{isUrdu ? 'حجم:' : 'Total Volume:'}</span>
                              <span className="font-black text-emerald-400">Rs. {data.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Recovery Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {pharmacyAnalysis.recoveryRate}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isUrdu ? 'وصول شدہ' : 'Recovered'}
                </span>
              </div>
            </div>

            {/* Legend & Summary List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-950">{isUrdu ? 'مکمل ادا شدہ بلز' : 'Paid In Full'}</span>
                </div>
                <span className="font-black text-emerald-900">{pharmacyAnalysis.fullyPaidCount} {isUrdu ? 'بلز' : 'Bills'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-amber-950">{isUrdu ? 'جزوی بقایا جات' : 'Partially Paid'}</span>
                </div>
                <span className="font-black text-amber-900">{pharmacyAnalysis.partialCount} {isUrdu ? 'بلز' : 'Bills'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-rose-950">{isUrdu ? 'مکمل واجب الادا' : 'Unpaid Bills'}</span>
                </div>
                <span className="font-black text-rose-900">{pharmacyAnalysis.unpaidCount} {isUrdu ? 'بلز' : 'Bills'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to Open Pending Invoices Drawer */}
          <button
            type="button"
            onClick={() => setShowPendingModal(true)}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/10 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>
              {isUrdu
                ? `واجب الادا بلز وصول کریں (${pharmacyAnalysis.pendingInvoicesList.length})`
                : `View & Collect Pending Invoices (${pharmacyAnalysis.pendingInvoicesList.length})`}
            </span>
          </button>
        </div>

        {/* CHART 4: Departmental Revenue Contribution & Pending Invoices Table (2 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-800" />
                <h3 className="font-black text-base text-slate-900">
                  {isUrdu ? 'شعبہ جاتی مالیاتی تناسب (Clinical Revenue Streams)' : 'Departmental Revenue Breakdown'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'فارمیسی، او پی ڈی معائنہ، لیبارٹری، فزیوتھراپی اور وارڈ کی کل آمدن کا تقابلی جائزہ'
                  : 'Comparative volume contribution across Pharmacy, OPD, Lab, Physiotherapy, and In-Patient Ward'}
              </p>
            </div>
            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full text-xs self-start sm:self-auto">
              5 {isUrdu ? 'شعبہ جات' : 'Revenue Units'}
            </span>
          </div>

          {/* Horizontal Metric Bars for Departments */}
          <div className="space-y-3 pt-1">
            {departmentalRevenue.map((dept) => {
              const totalAllDept = departmentalRevenue.reduce((sum, d) => sum + d.amount, 0) || 1;
              const percent = Math.round((dept.amount / totalAllDept) * 100);

              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span>{dept.name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      Rs. {dept.amount.toLocaleString()}{' '}
                      <span className="text-[11px] font-normal text-slate-400">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percent, 3)}%`,
                        backgroundColor: dept.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Pharmacy Invoices Quick Action Panel */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h4 className="font-black text-xs text-slate-900">
                  {isUrdu ? 'فوری توجہ طلب واجب الادا فارمیسی بلز:' : 'Urgent Outstanding Pharmacy Slips:'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPendingModal(true)}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{isUrdu ? 'تمام دیکھیں' : 'View Full List'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pharmacyAnalysis.pendingInvoicesList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'تمام فارمیسی بلز کامیابی سے وصول شدہ ہیں!' : 'All pharmacy bills are fully cleared!'}</span>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold text-[11px]">
                      <th className="p-2">{isUrdu ? 'رسید / ٹوکن' : 'Slip / Token'}</th>
                      <th className="p-2">{isUrdu ? 'مریض کا نام' : 'Patient'}</th>
                      <th className="p-2">{isUrdu ? 'کل بل' : 'Total'}</th>
                      <th className="p-2">{isUrdu ? 'بقایا واجبات' : 'Balance Due'}</th>
                      <th className="p-2 text-center">{isUrdu ? 'کارروائی' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyAnalysis.pendingInvoicesList.slice(0, 4).map((slip) => (
                      <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-mono font-bold text-slate-800">
                          {slip.slipNo || `#${slip.tokenNumber || slip.id.slice(-4)}`}
                        </td>
                        <td className="p-2">
                          <div className="font-bold text-slate-900">{slip.patientName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{slip.patientPhone}</div>
                        </td>
                        <td className="p-2 font-mono text-slate-700">Rs. {slip.totalAmount.toLocaleString()}</td>
                        <td className="p-2 font-mono font-black text-rose-600">
                          Rs. {slip.balanceAmount.toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSendReminder(slip)}
                              title={isUrdu ? 'واٹس ایپ ریمائنڈر بھیجیں' : 'Send WhatsApp Reminder'}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-all cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickSettle(slip)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                            >
                              {settledSlipSuccessId === slip.id ? (
                                <span className="text-emerald-400 font-bold">✓ {isUrdu ? 'ادا شدہ' : 'Paid'}</span>
                              ) : (
                                <span>{isUrdu ? 'وصول کریں' : 'Collect'}</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL PENDING PHARMACY INVOICES MODAL / DRAWER */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" dir={isUrdu ? 'rtl' : 'ltr'}>
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-rose-300">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {isUrdu ? 'فارمیسی غیر ادا شدہ و بقایا بلز مانیٹر' : 'Pending Pharmacy Receivables & Recovery'}
                  </h3>
                  <p className="text-xs text-rose-200">
                    {isUrdu
                      ? `کل واجب الادا رقم: Rs. ${pharmacyAnalysis.totalPharmacyPending.toLocaleString()} (${pharmacyAnalysis.pendingInvoicesList.length} رسیدیں)`
                      : `Total Receivables: Rs. ${pharmacyAnalysis.totalPharmacyPending.toLocaleString()} across ${pharmacyAnalysis.pendingInvoicesList.length} slips`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
              <input
                type="text"
                placeholder={isUrdu ? 'مریض کا نام، رسید نمبر یا فون تلاش کریں...' : 'Search patient name, slip # or phone...'}
                value={searchPendingPatient}
                onChange={(e) => setSearchPendingPatient(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-600 font-semibold"
              />
              <div className="text-slate-500 font-medium">
                {isUrdu ? 'فوری وصولی بٹن سے بل موقع پر ادا شدہ نشان زد کریں' : 'Click "Collect" to mark invoice settled in real-time'}
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {pharmacyAnalysis.pendingInvoicesList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-bold space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p>{isUrdu ? 'کوئی واجب الادا فارمیسی بل موجود نہیں ہے!' : 'No outstanding pharmacy receivables found!'}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="p-3">{isUrdu ? 'رسید / ٹوکن' : 'Slip ID'}</th>
                      <th className="p-3">{isUrdu ? 'مریض کا نام و فون' : 'Patient Name & Phone'}</th>
                      <th className="p-3">{isUrdu ? 'تاریخ' : 'Date'}</th>
                      <th className="p-3">{isUrdu ? 'کل بل' : 'Total Amount'}</th>
                      <th className="p-3">{isUrdu ? 'وصول شدہ' : 'Paid Amount'}</th>
                      <th className="p-3">{isUrdu ? 'بقایا واجبات' : 'Balance Due'}</th>
                      <th className="p-3 text-center">{isUrdu ? 'کارروائی' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyAnalysis.pendingInvoicesList
                      .filter(
                        (s) =>
                          !searchPendingPatient ||
                          s.patientName.toLowerCase().includes(searchPendingPatient.toLowerCase()) ||
                          s.patientPhone.includes(searchPendingPatient) ||
                          s.slipNo?.toLowerCase().includes(searchPendingPatient.toLowerCase())
                      )
                      .map((slip) => (
                        <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {slip.slipNo || `#${slip.tokenNumber || slip.id.slice(-5)}`}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{slip.patientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{slip.patientPhone}</div>
                          </td>
                          <td className="p-3 text-slate-600 font-mono">{slip.date || todayStr}</td>
                          <td className="p-3 font-mono text-slate-700">Rs. {slip.totalAmount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">
                            Rs. {slip.paidAmount.toLocaleString()}
                          </td>
                          <td className="p-3 font-mono font-black text-rose-600">
                            Rs. {slip.balanceAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendReminder(slip)}
                                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickSettle(slip)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {settledSlipSuccessId === slip.id
                                    ? isUrdu
                                      ? 'ادا کر دیا گیا!'
                                      : 'Settled!'
                                    : isUrdu
                                    ? 'وصول کریں'
                                    : 'Mark Paid'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">
                {isUrdu ? 'حافظ کلینک آٹومیٹڈ بلنگ و ریکوری پروٹوکول' : 'Hafiz Clinic Billing & Receivables Protocol'}
              </span>
              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer hover:bg-slate-800"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
