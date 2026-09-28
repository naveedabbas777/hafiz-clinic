import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  Clock,
  Barcode,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  Package,
  ArrowRight,
  Printer,
  RefreshCw,
  X,
  ShieldAlert,
  Sparkles,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  BarChart3,
  Table as TableIcon,
  LayoutGrid,
  AlertCircle,
  TrendingDown,
  Camera,
  QrCode,
} from 'lucide-react';
import { PharmacyBatchItem, Product, StaffUser } from '../types';
import { INITIAL_PHARMACY_BATCHES } from '../data/pharmacyBatchData';
import {
  calculatePredictiveReorderForecasts,
  recordDispensing,
  generatePurchaseOrderHtml,
  PredictiveReorderForecast,
} from '../utils/predictiveInventory';
import {
  InventoryPredictionService,
  ReorderPrediction,
  recordDispensingTransaction,
} from '../services/inventoryPredictionService';

// Lazy-loaded chart and QR scanner modules for high performance
const MedicineUsageTrendChart = React.lazy(() => import('./MedicineUsageTrendChart').then((m) => ({ default: m.MedicineUsageTrendChart })));
const Modal30DayLineChart = React.lazy(() => import('./Modal30DayLineChart').then((m) => ({ default: m.Modal30DayLineChart })));
const PharmacyQrScannerModal = React.lazy(() => import('./PharmacyQrScannerModal').then((m) => ({ default: m.PharmacyQrScannerModal })));

interface Props {
  products: Product[];
  language: 'urdu' | 'english';
  clinicSettings?: any;
  currentUser?: StaffUser | null;
  onLogin?: (user: StaffUser) => void;
  onLogout?: () => void;
}

interface PosCartItem {
  batch: PharmacyBatchItem;
  quantity: number;
}

export function SmartPharmacyPosView({ products, language, clinicSettings, currentUser, onLogin, onLogout }: Props) {
  const isUrdu = language === 'urdu';
  const [batches, setBatches] = useState<PharmacyBatchItem[]>(() => {
    const saved = localStorage.getItem('hafiz_pharmacy_batches_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_PHARMACY_BATCHES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'trending_stockout' | 'low_stock' | 'expiring_soon' | 'reorder_needed'>('all');
  const [inventoryViewMode, setInventoryViewMode] = useState<'table' | 'cards'>('table');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(4);
  const [selectedBatchIdForChart, setSelectedBatchIdForChart] = useState<string>(() => {
    return INITIAL_PHARMACY_BATCHES[0]?.id || 'BATCH-JOINT-01';
  });
  const [showUsageTrendChart, setShowUsageTrendChart] = useState<boolean>(true);
  const [isPredictiveModalOpen, setIsPredictiveModalOpen] = useState(false);
  const [selectedForecastForDetail, setSelectedForecastForDetail] = useState<PredictiveReorderForecast | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // POS Cart State
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash'>('Cash');

  // Doctor Digital Prescriptions Queue (1-Click Dispensing)
  const [pendingDoctorRxList, setPendingDoctorRxList] = useState<any[]>(() => {
    const saved = localStorage.getItem('hafiz_pending_pharmacy_rx_queue');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return [
      {
        id: 'Rx-101',
        patientName: 'محمد فاروق (Muhammad Farooq)',
        phone: '0301-9876543',
        tokenNumber: 'TK-101',
        mrnNumber: 'MRN-6543',
        doctorName: 'Dr. Zeeshan Chaudhry (MBBS)',
        date: new Date().toISOString(),
        medicinesList: [
          'Hoorab Joint Pain Herbal Oil',
          'Tab Hab-e-Suranjan',
          'Syp Calcium & Vitamin D3',
        ],
        notes: 'وزن اٹھانے سے پرہیز کریں۔',
        status: 'Pending Dispensing',
      },
      {
        id: 'Rx-102',
        patientName: 'چوہدری بشیر احمد (Ch. Bashir)',
        phone: '0321-7654321',
        tokenNumber: 'TK-102',
        mrnNumber: 'MRN-4321',
        doctorName: 'Dr. Waqas Saghir (MBBS)',
        date: new Date().toISOString(),
        medicinesList: [
          'Hab-e-Fishar Herbal Tab',
          'Cap Cardioprotect',
          'Syp Relax-o-Nerve',
        ],
        notes: 'صبح و شام بی پی چیک کریں۔',
        status: 'Pending Dispensing',
      },
    ];
  });

  const handleLoadRxIntoCart = (rx: any) => {
    setCustomerName(rx.patientName || 'OPD Patient');
    setCustomerPhone(rx.phone || '');

    const newCartItems: PosCartItem[] = [];
    (rx.medicinesList || []).forEach((medStr: string, idx: number) => {
      const cleanMedName = medStr.split('—')[0].split('-')[0].trim();
      const matchedBatch = batches.find(
        (b) =>
          b.productNameUrdu.toLowerCase().includes(cleanMedName.toLowerCase()) ||
          b.productNameEnglish.toLowerCase().includes(cleanMedName.toLowerCase()) ||
          cleanMedName.toLowerCase().includes(b.productNameEnglish.toLowerCase())
      );

      if (matchedBatch) {
        newCartItems.push({ batch: matchedBatch, quantity: 1 });
      } else {
        const fallbackBatch: PharmacyBatchItem = {
          id: `BAT-RX-${Date.now()}-${idx}`,
          productId: cleanMedName.toLowerCase().replace(/\s+/g, '-'),
          productNameUrdu: cleanMedName,
          productNameEnglish: cleanMedName,
          barcode: String(896400000000 + Math.floor(Math.random() * 99999)),
          batchNumber: `BAT-RX-${Math.floor(100 + Math.random() * 900)}`,
          expiryDate: '2028-12-31',
          costPricePKR: 450,
          salePricePKR: 850,
          currentStock: 25,
          minThreshold: 5,
          rackLocation: 'Dispensing Rack',
          supplierName: 'Doctor Rx Requisition',
        };
        newCartItems.push({ batch: fallbackBatch, quantity: 1 });
      }
    });

    setPosCart(newCartItems);

    const updatedQueue = pendingDoctorRxList.filter((r) => r.id !== rx.id);
    setPendingDoctorRxList(updatedQueue);
    localStorage.setItem('hafiz_pending_pharmacy_rx_queue', JSON.stringify(updatedQueue));
    alert(
      isUrdu
        ? `✅ مریض ${rx.patientName} کا نسخہ فارمیسی کاؤنٹر کارٹ میں لوڈ کر دیا گیا ہے۔`
        : `Rx for ${rx.patientName} loaded into cart!`
    );
  };

  // New Batch Modal
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState<Partial<PharmacyBatchItem>>({
    productNameUrdu: '',
    productNameEnglish: '',
    batchNumber: `BAT-${Math.floor(100 + Math.random() * 900)}`,
    barcode: '',
    expiryDate: '2027-12-31',
    costPricePKR: 500,
    salePricePKR: 900,
    currentStock: 20,
    minThreshold: 5,
    rackLocation: 'Rack A-1',
    supplierName: 'Hafiz Herbal Labs',
  });

  const saveBatchesState = (updated: PharmacyBatchItem[]) => {
    setBatches(updated);
    localStorage.setItem('hafiz_pharmacy_batches_v2', JSON.stringify(updated));
  };

  // Expiry check logic (today vs expiry date)
  const isExpiringSoon = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const today = new Date();
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 45; // Within 45 days
  };

  const isExpired = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const today = new Date();
    return exp.getTime() < today.getTime();
  };

  // Barcode / Token / MRN quick search & instant cart add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // 1. Check if input matches an active Doctor Prescription Token or MRN (1-Click Prescription-to-Cart)
    const queryClean = query.toLowerCase();
    const queryDigits = query.replace(/\D/g, '');
    const matchedRx = pendingDoctorRxList.find((rx) => {
      const tok = (rx.tokenNumber || '').toLowerCase();
      const tokDigits = tok.replace(/\D/g, '');
      const mrn = (rx.mrnNumber || '').toLowerCase();
      const mrnDigits = mrn.replace(/\D/g, '');
      const ph = (rx.phone || '').replace(/\D/g, '');

      return (
        tok === queryClean ||
        (queryDigits && tokDigits === queryDigits) ||
        mrn === queryClean ||
        (queryDigits && mrnDigits === queryDigits) ||
        (queryDigits && ph.includes(queryDigits)) ||
        (rx.patientName && rx.patientName.toLowerCase().includes(queryClean))
      );
    });

    if (matchedRx) {
      handleLoadRxIntoCart(matchedRx);
      setBarcodeInput('');
      return;
    }

    // 2. Check batches by Barcode or Batch Number
    const matched = batches.find(
      (b) => b.barcode?.trim() === query || b.batchNumber.toLowerCase() === queryClean
    );

    if (matched) {
      handleAddToCart(matched);
      setBarcodeInput('');
    } else {
      alert(
        isUrdu
          ? `بارکوڈ، بیچ یا ٹوکن نمبر (${query}) کے ساتھ کوئی دوا یا او پی ڈی نسخہ نہیں ملا۔`
          : `No medicine batch or active doctor prescription found matching: ${query}`
      );
    }
  };

  const handleAddToCart = (batch: PharmacyBatchItem) => {
    if (batch.currentStock <= 0) {
      alert(isUrdu ? 'اس دوا کا اسٹاک ختم ہے!' : 'This medicine is out of stock!');
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((item) => item.batch.id === batch.id);
      if (existing) {
        if (existing.quantity >= batch.currentStock) {
          alert(isUrdu ? 'موجودہ اسٹاک سے زیادہ مقدار شامل نہیں ہو سکتی۔' : 'Cannot exceed available stock.');
          return prev;
        }
        return prev.map((item) =>
          item.batch.id === batch.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { batch, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (batchId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((i) => i.batch.id !== batchId));
    } else {
      setPosCart((prev) =>
        prev.map((i) => (i.batch.id === batchId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleRemoveFromCart = (batchId: string) => {
    setPosCart((prev) => prev.filter((i) => i.batch.id !== batchId));
  };

  const handleCreateNewBatch = () => {
    if (!newBatch.productNameUrdu && !newBatch.productNameEnglish) {
      alert(isUrdu ? 'براہ کرم دوا کا نام درج کریں۔' : 'Please enter medicine name.');
      return;
    }
    const item: PharmacyBatchItem = {
      id: `BAT-${Date.now()}`,
      productId: (newBatch.productNameEnglish || newBatch.productNameUrdu || 'med').toLowerCase().replace(/\s+/g, '-'),
      productNameUrdu: newBatch.productNameUrdu || newBatch.productNameEnglish || '',
      productNameEnglish: newBatch.productNameEnglish || newBatch.productNameUrdu || '',
      barcode: newBatch.barcode || String(Math.floor(896400000000 + Math.random() * 99999)),
      batchNumber: newBatch.batchNumber || `BAT-${Date.now()}`,
      expiryDate: newBatch.expiryDate || '2027-12-31',
      costPricePKR: Number(newBatch.costPricePKR) || 500,
      salePricePKR: Number(newBatch.salePricePKR) || 800,
      currentStock: Number(newBatch.currentStock) || 10,
      minThreshold: Number(newBatch.minThreshold) || 5,
      rackLocation: newBatch.rackLocation || 'Rack A-1',
      supplierName: newBatch.supplierName || 'Hafiz Herbal Labs',
    };

    saveBatchesState([item, ...batches]);
    setIsAddBatchOpen(false);
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm(isUrdu ? 'کیا آپ واقعی اس بیچ کو ڈیلیٹ کرنا چاہتے ہیں؟' : 'Delete this batch?')) {
      saveBatchesState(batches.filter((b) => b.id !== id));
    }
  };

  // Calculate POS totals
  const subtotal = posCart.reduce((sum, item) => sum + item.batch.salePricePKR * item.quantity, 0);
  const totalPayable = Math.max(0, subtotal - discountAmount);

  // Complete Sale & Print Slip
  const handleCompleteSaleAndPrint = () => {
    if (posCart.length === 0) {
      alert(isUrdu ? 'کارٹ خالی ہے!' : 'Cart is empty!');
      return;
    }

    // Deduct stock locally
    const updatedBatches = batches.map((b) => {
      const soldItem = posCart.find((ci) => ci.batch.id === b.id);
      if (soldItem) {
        return { ...b, currentStock: Math.max(0, b.currentStock - soldItem.quantity) };
      }
      return b;
    });
    saveBatchesState(updatedBatches);

    // Record dispensing in 30-day time series for predictive algorithm
    const slipNo = `PHARM-${Math.floor(1000 + Math.random() * 9000)}`;
    posCart.forEach((ci) => {
      recordDispensing(ci.batch, ci.quantity, slipNo, customerName || 'Walk-in Patient');
      recordDispensingTransaction(ci.batch, ci.quantity, slipNo, customerName || 'Walk-in Patient');
    });
    try {
      fetch('/api/erp/pharmacy-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slipNo,
          customerName: customerName || 'Walk-in Patient',
          customerPhone,
          paymentMethod,
          subtotal,
          discount: discountAmount,
          totalAmount: totalPayable,
          items: posCart.map((ci) => ({
            batchId: ci.batch.id,
            productName: ci.batch.productNameEnglish || ci.batch.productNameUrdu,
            quantity: ci.quantity,
            salePrice: ci.batch.salePricePKR,
            batchNumber: ci.batch.batchNumber,
          })),
        }),
      }).catch(() => {});
    } catch (_) {}

    // Thermal Receipt HTML (Standard 80mm ESC/POS Computerized Receipt with PHC seal)
    const printHtml = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Pharmacy Receipt — ${slipNo}</title>
        <style>
          @page { size: 80mm auto; margin: 3mm; }
          body { font-family: system-ui, -apple-system, sans-serif; width: 74mm; margin: 0 auto; padding: 2mm; font-size: 11px; color: #000; }
          .center { text-align: center; }
          .title { font-size: 15px; font-weight: 900; margin: 0; }
          .sub { font-size: 9.5px; color: #333; margin-top: 2px; }
          .phc-badge { display: block; border: 1.5px solid #047857; color: #047857; padding: 3px 6px; border-radius: 5px; font-size: 8.5px; font-weight: 900; margin: 5px 0; text-align: center; background: #f0fdf4; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10.5px; }
          .bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px; }
          th { border-bottom: 1.5px solid #000; text-align: right; padding: 2px; font-weight: bold; }
          td { padding: 3px 2px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">${clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ فارمیسی'}</div>
          <div class="sub">${clinicSettings?.addressUrdu || 'حافظ آباد روڈ، نزد مین مارکیٹ، پنجاب پاکستان'}</div>
          <div class="sub">فون: ${clinicSettings?.phone1 || '0300-1234567'} | PHC Lic: ${clinicSettings?.phcApprovalNo || 'PHC/2026/8940'}</div>
          <div class="phc-badge">★ PUNJAB HEALTHCARE COMMISSION CERTIFIED PHARMACY ★<br/><span style="font-size:7.5px; color:#475569;">TAX NTN: 4892019-2 | GD-PHARM-2026</span></div>
          <div style="font-size: 10px; font-weight: bold;">کمپیوٹرائزڈ فارمیسی کیش میمو (80mm Computerized POS)</div>
        </div>
        <div class="divider"></div>
        <div class="row"><span>پرچی نمبر / Slip #:</span><span class="bold font-mono">${slipNo}</span></div>
        <div class="row"><span>تاریخ و وقت:</span><span>${new Date().toLocaleString()}</span></div>
        <div class="row"><span>کسٹمر نام:</span><span class="bold">${customerName || 'واک اِن کسٹمر'}</span></div>
        <div class="row"><span>ادائیگی طریقہ:</span><span class="bold">${paymentMethod} (موصول شد)</span></div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>دوا کا نام و تفصیل</th>
              <th style="text-align:center;">تعداد</th>
              <th style="text-align:left;">رقم</th>
            </tr>
          </thead>
          <tbody>
            ${posCart
              .map(
                (i) => `
              <tr>
                <td><strong>${i.batch.productNameUrdu || i.batch.productNameEnglish}</strong><br/><small style="color:#555;">بیچ: ${i.batch.batchNumber} | میعاد: ${i.batch.expiryDate}</small></td>
                <td style="text-align:center; font-weight:bold;">${i.quantity}</td>
                <td style="text-align:left; font-weight:bold;">Rs. ${i.batch.salePricePKR * i.quantity}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="row"><span>سب ٹوٹل (Subtotal):</span><span>Rs. ${subtotal}</span></div>
        ${discountAmount > 0 ? `<div class="row"><span>رعایت (Special Discount):</span><span style="color:#b91c1c;">- Rs. ${discountAmount}</span></div>` : ''}
        <div class="row" style="font-size: 13px; font-weight: 900; border-top: 1px solid #000; padding-top: 3px; margin-top: 3px;">
          <span>کل وصول شدہ (Total Paid):</span><span>Rs. ${totalPayable}</span>
        </div>
        <div class="divider"></div>
        <div class="center" style="font-size: 8.5px; margin-top: 5px; line-height: 1.4;">
          کھولی ہوئی یا بغیر رسید دوا تبدیل نہیں ہوگی۔ صحت یابی کی مخلصانہ دعا کے ساتھ شکریہ!<br/>
          <strong style="font-size:7.5px; color:#047857;">Hafiz Clinic Smart Pharmacy ERP • System Verified</strong>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=400,height=600');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }

    setPosCart([]);
    setDiscountAmount(0);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Inventory Prediction Service: 30-Day average usage & Recommended Reorder Date calculation
  const inventoryPredictions = useMemo(() => {
    return InventoryPredictionService.generateInventoryPredictions(batches, leadTimeDays);
  }, [batches, leadTimeDays]);

  const predictionMap = useMemo(() => {
    const map = new Map<string, ReorderPrediction>();
    inventoryPredictions.forEach((p) => map.set(p.batchId, p));
    return map;
  }, [inventoryPredictions]);

  const trendingStockoutCount = useMemo(() => {
    return inventoryPredictions.filter((p) => p.isTrendingTowardStockout).length;
  }, [inventoryPredictions]);

  // Predictive Inventory & 30-Day Dispensing Pattern Algorithm (compat)
  const predictiveForecasts = useMemo(() => {
    return calculatePredictiveReorderForecasts(batches, leadTimeDays);
  }, [batches, leadTimeDays]);

  const forecastMap = useMemo(() => {
    const map = new Map<string, PredictiveReorderForecast>();
    predictiveForecasts.forEach((f) => map.set(f.batchId, f));
    return map;
  }, [predictiveForecasts]);

  const criticalReorderCount = predictiveForecasts.filter((f) => f.urgency === 'CRITICAL_NOW').length;
  const soonReorderCount = predictiveForecasts.filter((f) => f.urgency === 'REORDER_SOON').length;
  const totalReorderNeeded = criticalReorderCount + soonReorderCount;

  // Filtered batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productNameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.barcode && b.barcode.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterTab === 'trending_stockout') {
      const p = predictionMap.get(b.id);
      return p?.isTrendingTowardStockout ?? false;
    }
    if (filterTab === 'low_stock') return b.currentStock <= b.minThreshold;
    if (filterTab === 'expiring_soon') return isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate);
    if (filterTab === 'reorder_needed') {
      const f = forecastMap.get(b.id);
      return f?.urgency === 'CRITICAL_NOW' || f?.urgency === 'REORDER_SOON';
    }
    return true;
  });

  const totalLowStock = batches.filter((b) => b.currentStock <= b.minThreshold).length;
  const totalExpiringSoon = batches.filter((b) => isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate)).length;

  // Enforce FIFO (First-In, First-Out): identify earliest expiration date batch for each product
  const fifoNearestMap = useMemo(() => {
    const map: Record<string, string> = {};
    batches.forEach((b) => {
      const prodKey = (b.productNameEnglish || b.productNameUrdu || '').trim().toLowerCase();
      if (!prodKey) return;
      if (!map[prodKey]) {
        map[prodKey] = b.id;
      } else {
        const existingBatch = batches.find((item) => item.id === map[prodKey]);
        if (existingBatch && new Date(b.expiryDate).getTime() < new Date(existingBatch.expiryDate).getTime()) {
          map[prodKey] = b.id;
        }
      }
    });
    return map;
  }, [batches]);

  return (
    <div className="space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Banner with Alert Counters & Predictive Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200 font-bold uppercase">{isUrdu ? 'کل فارمیسی آئٹمز' : 'Total Batches'}</div>
            <div className="text-2xl font-black">{batches.length} {isUrdu ? 'میڈیسنز' : 'Items'}</div>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-2xl">
            <Package className="w-6 h-6 text-emerald-200" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => setFilterTab('low_stock')}
          className={`p-4 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer border transition-all ${
            totalLowStock > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div>
            <div className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'کم اسٹاک الرٹ' : 'Low Stock Warning'}</span>
            </div>
            <div className="text-2xl font-black text-rose-700">{totalLowStock} {isUrdu ? 'آئٹمز' : 'Items'}</div>
          </div>
          <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full">
            {isUrdu ? 'فلٹر' : 'Filter'}
          </span>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setFilterTab('expiring_soon')}
          className={`p-4 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer border transition-all ${
            totalExpiringSoon > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div>
            <div className="text-xs text-amber-600 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ایکسپائری الرٹ (< 45 دن)' : 'Expiring Soon'}</span>
            </div>
            <div className="text-2xl font-black text-amber-700">{totalExpiringSoon} {isUrdu ? 'آئٹمز' : 'Items'}</div>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
            {isUrdu ? 'فلٹر' : 'Filter'}
          </span>
        </div>

        {/* Predictive Inventory & Reorder Intelligence (30-Day Average Usage & Auto Reorder Date) */}
        <div
          onClick={() => {
            if (trendingStockoutCount > 0 && filterTab !== 'trending_stockout') {
              setFilterTab('trending_stockout');
            } else {
              setIsPredictiveModalOpen(true);
            }
          }}
          className={`p-4 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer border transition-all ${
            trendingStockoutCount > 0
              ? 'bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 border-amber-300 text-amber-950 hover:shadow-md'
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 text-purple-900 hover:bg-purple-100'
          }`}
        >
          <div>
            <div className="text-xs text-amber-700 font-black flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{isUrdu ? 'انوینٹری پیشین گوئی سروس' : 'Inventory Prediction Service'}</span>
            </div>
            <div className="text-2xl font-black text-rose-700 flex items-baseline gap-1.5">
              <span>{trendingStockoutCount}</span>
              <span className="text-xs font-bold text-amber-800">{isUrdu ? 'اسٹاک آؤٹ خطرہ' : 'Trending to Stockout'}</span>
            </div>
            <div className="text-[10px] text-slate-600 font-bold mt-0.5">
              ۳۰ روزہ اوسط کھپت و تجویز کردہ ری آرڈر تاریخ
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-black bg-amber-600 hover:bg-amber-700 text-slate-950 px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-amber-700/30">
              <Zap className="w-3 h-3 text-slate-950" />
              <span>{isUrdu ? 'فلٹر دیکھیں' : 'Filter'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Doctor Digital Prescriptions Ready to Dispense Queue (1-Click Dispensing) */}
      {pendingDoctorRxList.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 p-4 sm:p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {isUrdu
                    ? '🚨 او پی ڈی ڈاکٹر کے جاری کردہ نسخہ جات (Doctor Prescriptions Queue)'
                    : '🚨 Active Doctor Prescriptions Ready for Dispensing'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {isUrdu
                    ? 'ڈاکٹر زیشان / ڈاکٹر وقاص کے تجویز کردہ نسخہ جات یہاں خودکار ظاہر ہوتے ہیں۔ ۱-کلک سے فارمیسی بل میں لوڈ کریں۔'
                    : 'Prescriptions issued in the OPD suite automatically arrive here for 1-click dispensing & stock deduction.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title={isUrdu ? 'مریض کا پرچی / ٹوکن کیو آر کوڈ اسکین کریں' : 'Scan Patient Token QR Code'}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isUrdu ? 'ٹوکن اسکین کریں' : 'Scan Token QR'}</span>
              </button>
              <span className="bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-full">
                {pendingDoctorRxList.length} {isUrdu ? 'نسخہ جات تیار ہیں' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingDoctorRxList.map((rx) => (
              <div
                key={rx.id}
                className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-slate-900 text-sm font-black">{rx.patientName}</span>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {rx.tokenNumber} • {rx.mrnNumber}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {rx.doctorName}
                  </div>
                  <div className="mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800 space-y-0.5">
                    {(rx.medicinesList || []).map((m: string, i: number) => (
                      <div key={i} className="truncate">• {m}</div>
                    ))}
                  </div>
                  {rx.notes && (
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      "{rx.notes}"
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleLoadRxIntoCart(rx)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isUrdu ? '⚡ 1-کلک کارٹ میں لوڈ کریں (Load Rx to POS)' : '⚡ 1-Click Load into POS Cart'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main POS & Inventory Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center (Columns 7): INVENTORY & FAST BARCODE SEARCH */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Fast Barcode Input & Live Camera QR Scanner */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={isUrdu ? 'بارکوڈ اسکینر سے اسکین کریں یا بیچ نمبر درج کر کے Enter دبائیں...' : 'Scan Barcode or enter Batch #...'}
                  className="w-full bg-slate-50 border-2 border-emerald-500 rounded-2xl pr-10 pl-3 py-2.5 text-xs font-bold outline-none focus:bg-white"
                />
              </div>

              {/* Camera QR Scanner Trigger Button */}
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                title={isUrdu ? 'کیمرہ کیو آر اسکینر کھولیں (مریض کا ٹوکن یا دوا لیبل اسکین کریں)' : 'Open Camera QR Scanner (Scan Patient MRN or Medicine Label)'}
              >
                <Camera className="w-4 h-4 text-emerald-200" />
                <span className="hidden sm:inline">{isUrdu ? '📷 کیمرہ اسکینر' : '📷 Camera QR'}</span>
                <span className="sm:hidden">QR</span>
              </button>

              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'شامل کریں' : 'Add'}</span>
              </button>
            </form>

            {/* Controls Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterTab === 'all' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {isUrdu ? 'تمام ادویات' : 'All'} ({batches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('trending_stockout')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    filterTab === 'trending_stockout' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-950" />
                  <span>{isUrdu ? 'اسٹاک آؤٹ خطرہ' : 'Trending to Stockout'}</span> ({trendingStockoutCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('reorder_needed')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    filterTab === 'reorder_needed' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>{isUrdu ? 'ری آرڈر طلب' : 'Reorder Due'}</span> ({totalReorderNeeded})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('low_stock')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterTab === 'low_stock' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'
                  }`}
                >
                  {isUrdu ? 'کم اسٹاک' : 'Low Stock'} ({totalLowStock})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('expiring_soon')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterTab === 'expiring_soon' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700'
                  }`}
                >
                  {isUrdu ? 'ایکسپائری الرٹس' : 'Expiring'} ({totalExpiringSoon})
                </button>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Table vs Cards Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('table')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      inventoryViewMode === 'table' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'جدول انوینٹری (Table)' : 'Table View'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('cards')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      inventoryViewMode === 'cards' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'کارڈز ویو (Cards)' : 'Cards View'}</span>
                  </button>
                </div>

                {/* 30-Day Recharts Trend Chart Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowUsageTrendChart(!showUsageTrendChart)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                    showUsageTrendChart
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="30-Day Usage Trend & Consumption Spikes Chart"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? (showUsageTrendChart ? 'چارٹ بند کریں' : '📈 ۳۰ روزہ کھپت چارٹ') : (showUsageTrendChart ? 'Hide Chart' : '📈 30-Day Trend')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPredictiveModalOpen(true)}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="30-Day Dispensing Pattern Algorithm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isUrdu ? 'پیشین گوئی تجزیہ' : 'Prediction Model'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'نیا بیچ' : 'New Batch'}</span>
                </button>
              </div>
            </div>

            {/* Trending Stockout Warning Alert Banner */}
            {trendingStockoutCount > 0 && filterTab !== 'trending_stockout' && (
              <div
                onClick={() => setFilterTab('trending_stockout')}
                className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs cursor-pointer shadow-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-500 text-slate-950 rounded-lg">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                  </span>
                  <div>
                    <span className="font-black">
                      {isUrdu
                        ? `⚠️ انوینٹری پیشین گوئی سروس الرٹ: ${trendingStockoutCount} ادویات اسٹاک آؤٹ کے خطرے کی طرف بڑھ رہی ہیں!`
                        : `⚠️ Inventory Prediction Alert: ${trendingStockoutCount} medicines are trending toward stockout!`}
                    </span>
                    <span className="block text-[10.5px] text-amber-900 font-medium">
                      {isUrdu
                        ? '۳۰ روزہ اوسط کھپت کی بنیاد پر خودکار تجویز کردہ ری آرڈر تاریخیں نیچے جدول میں ملاحظہ کریں۔'
                        : 'View auto-calculated Recommended Reorder Dates in the table below to prevent supply disruption.'}
                    </span>
                  </div>
                </div>
                <span className="bg-amber-900 text-amber-100 font-bold px-3 py-1 rounded-xl text-[11px] whitespace-nowrap">
                  {isUrdu ? 'فلٹر دیکھیں' : 'Filter Items'} &rarr;
                </span>
              </div>
            )}

            {/* Recharts 30-Day Usage Trend & Consumption Spike Visualizer */}
            {showUsageTrendChart && (
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">{isUrdu ? 'چارٹ لوڈ ہو رہا ہے...' : 'Loading Medicine Analytics Chart...'}</div>}>
                <MedicineUsageTrendChart
                  batches={batches}
                  selectedBatchId={selectedBatchIdForChart}
                  onSelectBatch={setSelectedBatchIdForChart}
                  predictionMap={predictionMap}
                  isUrdu={isUrdu}
                />
              </React.Suspense>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'دوا کا نام، کیٹیگری، یا بیچ نمبر تلاش کریں...' : 'Search medicine name, category, batch...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-9 pl-3 py-2 text-xs outline-none focus:bg-white"
              />
            </div>

            {/* INVENTORY TABLE VIEW */}
            {inventoryViewMode === 'table' ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-slate-900 text-white sticky top-0 z-10 text-[11px] font-bold">
                      <tr>
                        <th className="py-3 px-3">{isUrdu ? 'دوا کا نام و تفصیل' : 'Medicine & Batch'}</th>
                        <th className="py-3 px-2.5 text-center">{isUrdu ? 'موجودہ اسٹاک' : 'Remaining Qty'}</th>
                        <th className="py-3 px-2.5 text-center bg-slate-800">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span>{isUrdu ? '۳۰ روزہ اوسط کھپت' : '30-Day Avg Usage'}</span>
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center bg-purple-950 text-purple-200">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{isUrdu ? 'تجویز کردہ ری آرڈر تاریخ' : 'Recommended Reorder Date'}</span>
                          </div>
                        </th>
                        <th className="py-3 px-2.5 text-center">{isUrdu ? 'اسٹاک آؤٹ انتباہ' : 'Stockout Warning'}</th>
                        <th className="py-3 px-2 text-left">{isUrdu ? 'قیمت' : 'Price'}</th>
                        <th className="py-3 px-2 text-center">{isUrdu ? 'کارروائی' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBatches.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs">
                            {isUrdu ? 'کوئی میڈیسن اس فلٹر کے مطابق موجود نہیں۔' : 'No medicines matched the filter.'}
                          </td>
                        </tr>
                      ) : (
                        filteredBatches.map((b) => {
                          const expiring = isExpiringSoon(b.expiryDate);
                          const expired = isExpired(b.expiryDate);
                          const isLow = b.currentStock <= b.minThreshold;
                          const prodKey = (b.productNameEnglish || b.productNameUrdu || '').trim().toLowerCase();
                          const isFifoFirst = fifoNearestMap[prodKey] === b.id && !expired && b.currentStock > 0;
                          const forecast = forecastMap.get(b.id);
                          const prediction = predictionMap.get(b.id);
                          const isSelectedForChart = b.id === selectedBatchIdForChart;

                          const safeThreshold = prediction?.safetyStockUnits ?? forecast?.safetyStockUnits ?? (b.minThreshold || 8);
                          const isTrending = prediction?.isTrendingTowardStockout ?? (b.currentStock <= safeThreshold && !expired);
                          const isCriticalStockout = prediction?.stockoutRiskLevel === 'CRITICAL_STOCKOUT' || forecast?.urgency === 'CRITICAL_NOW';

                          return (
                            <tr
                              key={b.id}
                              onClick={() => setSelectedBatchIdForChart(b.id)}
                              className={`transition-all cursor-pointer ${
                                isSelectedForChart
                                  ? 'bg-emerald-50/90 ring-2 ring-emerald-500 font-semibold shadow-xs'
                                  : expired
                                  ? 'bg-rose-50/70 hover:bg-rose-100/70'
                                  : isCriticalStockout
                                  ? 'bg-rose-50/90 hover:bg-rose-100/90 font-medium'
                                  : isTrending
                                  ? 'bg-amber-50/80 hover:bg-amber-100/80 font-medium'
                                  : expiring
                                  ? 'bg-amber-50/40 hover:bg-amber-100/50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* Medicine & Batch info */}
                              <td className="py-2.5 px-3">
                                <div className="space-y-0.5">
                                  <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                    <span>{b.productNameUrdu || b.productNameEnglish}</span>
                                    {isSelectedForChart && (
                                      <span className="text-[9px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                                        <TrendingUp className="w-2.5 h-2.5 text-emerald-200" />
                                        <span>{isUrdu ? 'چارٹ فعال' : 'Chart Active'}</span>
                                      </span>
                                    )}
                                    {isFifoFirst && (
                                      <span className="text-[9px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-full">
                                        FIFO
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-sans">
                                    {b.productNameEnglish}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span>بیچ: <strong className="text-slate-700 font-mono">{b.batchNumber}</strong></span>
                                    <span>ریک: <strong className="text-slate-700">{b.rackLocation || 'A-1'}</strong></span>
                                    <span>میعاد: <strong className={expired ? 'text-rose-600 font-bold' : expiring ? 'text-amber-600 font-bold' : 'text-slate-700'}>{b.expiryDate}</strong></span>
                                  </div>
                                </div>
                              </td>

                              {/* Remaining Stock */}
                              <td className="py-2.5 px-2.5 text-center">
                                <div className="space-y-0.5">
                                  <span
                                    className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg inline-block ${
                                      b.currentStock <= 0
                                        ? 'bg-rose-100 text-rose-800'
                                        : isTrending
                                        ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {b.currentStock} یونٹ
                                  </span>
                                  <div className="text-[9.5px] text-slate-500 font-medium">
                                    محفوظ حد: <strong>{safeThreshold}</strong>
                                  </div>
                                </div>
                              </td>

                              {/* 30-Day Avg Usage */}
                              <td className="py-2.5 px-2.5 text-center bg-slate-50/70">
                                <div className="space-y-0.5">
                                  <div className="font-black text-emerald-800 font-mono text-xs">
                                    {prediction?.averageDailyBurnRate ?? forecast?.averageDailyBurnRate ?? 0}{' '}
                                    <span className="text-[9.5px] font-sans font-medium text-slate-500">/یومیہ</span>
                                  </div>
                                  <div className="text-[9.5px] text-slate-500">
                                    کل: <strong>{prediction?.dispensedLast30Days ?? forecast?.dispensedLast30Days ?? 0}</strong> یونٹ
                                  </div>
                                </div>
                              </td>

                              {/* Recommended Reorder Date */}
                              <td className="py-2.5 px-3 text-center bg-purple-50/50">
                                <div className="space-y-1">
                                  <div className="font-black text-slate-900 text-xs flex items-center justify-center gap-1 font-mono">
                                    <Calendar className="w-3.5 h-3.5 text-purple-700" />
                                    <span>{prediction?.recommendedReorderDateFormatted ?? forecast?.reorderDateFormatted ?? '—'}</span>
                                  </div>
                                  <div>
                                    {isCriticalStockout || (prediction?.daysUntilReorder === 0) ? (
                                      <span className="text-[9.5px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 animate-pulse">
                                        🚨 آج ہی ری آرڈر! (0 دن باقی)
                                      </span>
                                    ) : (prediction?.daysUntilReorder ?? forecast?.daysUntilReorder ?? 0) <= 7 ? (
                                      <span className="text-[9.5px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                        ⚠️ {prediction?.daysUntilReorder ?? forecast?.daysUntilReorder} دن باقی
                                      </span>
                                    ) : (
                                      <span className="text-[9.5px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                                        {prediction?.daysUntilReorder ?? forecast?.daysUntilReorder} دن بعد
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Stockout Warning Status */}
                              <td className="py-2.5 px-2.5 text-center">
                                {isCriticalStockout ? (
                                  <div className="space-y-0.5">
                                    <span className="text-[9.5px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse shadow-xs">
                                      <AlertTriangle className="w-3 h-3 text-white" />
                                      <span>فوری ری آرڈر (Stockout Risk)</span>
                                    </span>
                                    <div className="text-[9px] text-rose-700 font-bold">
                                      {prediction?.runoutDaysRemaining ?? forecast?.runoutDaysRemaining} دن میں صفر
                                    </div>
                                  </div>
                                ) : isTrending ? (
                                  <div className="space-y-0.5">
                                    <span className="text-[9.5px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-500 shadow-xs">
                                      <AlertTriangle className="w-3 h-3 text-amber-900" />
                                      <span>اسٹاک آؤٹ خطرہ (Trending)</span>
                                    </span>
                                    <div className="text-[9px] text-amber-800 font-bold">
                                      محفوظ حد &le; {safeThreshold} سے کم
                                    </div>
                                  </div>
                                ) : isLow ? (
                                  <span className="text-[9.5px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full inline-block">
                                    کم اسٹاک
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>تسلی بخش اسٹاک</span>
                                  </span>
                                )}
                              </td>

                              {/* Price */}
                              <td className="py-2.5 px-2 text-left font-mono font-black text-emerald-800 text-xs">
                                Rs. {b.salePricePKR}
                              </td>

                              {/* Actions */}
                              <td className="py-2.5 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(b);
                                    }}
                                    disabled={b.currentStock <= 0}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
                                      b.currentStock > 0
                                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                    title="بل میں شامل کریں"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{isUrdu ? 'کارٹ' : 'Add'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBatchIdForChart(b.id);
                                      setShowUsageTrendChart(true);
                                    }}
                                    className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                      isSelectedForChart
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-700'
                                    }`}
                                    title={isUrdu ? 'اس دوا کا ۳۰ روزہ کھپت گراف دیکھیں' : 'View 30-Day Trend Chart'}
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  </button>

                                  {forecast && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedForecastForDetail(forecast);
                                        setIsPredictiveModalOpen(true);
                                      }}
                                      className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg cursor-pointer"
                                      title="30-Day Dispensing Analytics & Reorder PO"
                                    >
                                      <Activity className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBatch(b.id);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer"
                                    title="بیچ ختم کریں"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Batches Card Grid View */
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredBatches.map((b) => {
                  const expiring = isExpiringSoon(b.expiryDate);
                  const expired = isExpired(b.expiryDate);
                  const isLow = b.currentStock <= b.minThreshold;
                  const prodKey = (b.productNameEnglish || b.productNameUrdu || '').trim().toLowerCase();
                  const isFifoFirst = fifoNearestMap[prodKey] === b.id && !expired && b.currentStock > 0;
                  const forecast = forecastMap.get(b.id);
                  const prediction = predictionMap.get(b.id);
                  const isSelectedForChart = b.id === selectedBatchIdForChart;

                  // Algorithmic Safe Threshold comparison
                  const safeThreshold = prediction?.safetyStockUnits ?? forecast?.safetyStockUnits ?? (b.minThreshold || 8);
                  const isTrending = prediction?.isTrendingTowardStockout ?? (b.currentStock <= safeThreshold && !expired);
                  const isCriticalStockout = prediction?.stockoutRiskLevel === 'CRITICAL_STOCKOUT' || forecast?.urgency === 'CRITICAL_NOW';

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBatchIdForChart(b.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
                        isSelectedForChart
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                          : expired
                          ? 'bg-rose-50 border-rose-300'
                          : isCriticalStockout
                          ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400 shadow-sm'
                          : isTrending
                          ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/70 shadow-sm'
                          : expiring
                          ? 'bg-amber-50/70 border-amber-200'
                          : isLow
                          ? 'bg-orange-50/50 border-orange-200'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{b.productNameUrdu || b.productNameEnglish}</span>
                            {isSelectedForChart && (
                              <span className="text-[9px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                                <TrendingUp className="w-2.5 h-2.5 text-emerald-200" />
                                <span>{isUrdu ? 'چارٹ فعال' : 'Chart Active'}</span>
                              </span>
                            )}
                            {b.barcode && (
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border">
                                {b.barcode}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span>بیچ: <strong>{b.batchNumber}</strong></span>
                            <span>ریک: <strong>{b.rackLocation || 'A-1'}</strong></span>
                            <span>
                              ایکسپائری:{' '}
                              <strong className={expired ? 'text-rose-600 font-black' : expiring ? 'text-amber-600 font-black' : 'text-slate-700'}>
                                {b.expiryDate}
                              </strong>
                            </span>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {/* Visual Amber/Red 'Restock Now' badge if trending toward stockout */}
                            {isTrending && (
                              <span className="text-[9.5px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-600/40 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-slate-950" />
                                <span>{isUrdu ? '⚠️ ابھی ری اسٹاک کریں (Restock Now)' : '⚠️ Restock Now'}</span>
                                <span className="text-[8.5px] bg-amber-950 text-amber-200 px-1.5 py-0.2 rounded-full font-mono font-bold">
                                  &le; {safeThreshold} محفوظ حد
                                </span>
                              </span>
                            )}
                            {isFifoFirst && (
                              <span className="text-[9px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                                🟢 {isUrdu ? 'فیفو اولویت (FIFO Nearest Expiry)' : 'FIFO Priority (Earliest Expiry)'}
                              </span>
                            )}
                            {expired && (
                              <span className="text-[9px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                                {isUrdu ? 'میعاد ختم (Expired)' : 'Expired'}
                              </span>
                            )}
                            {expiring && !expired && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                                {isUrdu ? 'جلد میعاد ختم ہوگی' : 'Expiring Soon'}
                              </span>
                            )}
                            {isLow && !isTrending && (
                              <span className="text-[9px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full">
                                {isUrdu ? 'کم اسٹاک الرٹ' : 'Low Stock'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-black text-emerald-800 font-mono">Rs. {b.salePricePKR}</div>
                            <div className="text-[11px] font-bold text-slate-500">
                              اسٹاک:{' '}
                              <span
                                className={
                                  isTrending
                                    ? 'text-amber-950 font-black bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-300'
                                    : isLow
                                    ? 'text-rose-600 font-black'
                                    : 'text-slate-900'
                                }
                              >
                                {b.currentStock} یونٹ
                              </span>
                            </div>
                            <div className="text-[9px] text-amber-800 font-bold mt-0.5">
                              محفوظ حد: <strong>{safeThreshold}</strong> یونٹ
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(b);
                            }}
                            disabled={b.currentStock <= 0}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
                              b.currentStock > 0
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'بل میں شامل' : 'Cart'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBatchIdForChart(b.id);
                              setShowUsageTrendChart(true);
                            }}
                            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                              isSelectedForChart
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                            }`}
                            title={isUrdu ? 'اس دوا کا ۳۰ روزہ کھپت گراف دیکھیں' : 'View 30-Day Trend Chart'}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'گراف' : 'Chart'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBatch(b.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Predictive Reorder Forecast Telemetry Strip */}
                      {(prediction || forecast) && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black flex items-center gap-1.5 border shadow-xs ${
                                isCriticalStockout
                                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                                  : isTrending
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-purple-50 text-purple-900 border-purple-200'
                              }`}
                              title={`Algorithm Details:\n• 30-Day Dispensed: ${prediction?.dispensedLast30Days ?? forecast?.dispensedLast30Days} units\n• Daily Burn Rate: ${prediction?.averageDailyBurnRate ?? forecast?.averageDailyBurnRate} units/day\n• Supplier Lead Time: ${prediction?.supplierLeadTimeDays ?? forecast?.supplierLeadTimeDays} days\n• Safety Stock Buffer: ${prediction?.safetyStockUnits ?? forecast?.safetyStockUnits} units`}
                            >
                              <Calendar className="w-3.5 h-3.5 text-current" />
                              <span>
                                {isUrdu ? 'تجویز کردہ ری آرڈر تاریخ:' : 'Reorder Date:'}{' '}
                                <strong>{prediction?.recommendedReorderDateFormatted ?? forecast?.reorderDateFormatted}</strong>
                                {isCriticalStockout
                                  ? ' (🚨 فوری آرڈر!)'
                                  : ` (${prediction?.daysUntilReorder ?? forecast?.daysUntilReorder} دن بعد)`}
                              </span>
                            </span>

                            <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                              <span>۳۰ دن کھپت: <strong>{prediction?.dispensedLast30Days ?? forecast?.dispensedLast30Days}</strong> ({prediction?.averageDailyBurnRate ?? forecast?.averageDailyBurnRate}/دن)</span>
                            </span>

                            <span className="text-[10px] text-slate-500 font-bold">
                              باقی ایام: <strong className={(prediction?.runoutDaysRemaining ?? forecast?.runoutDaysRemaining ?? 10) <= 5 ? 'text-rose-600' : 'text-slate-700'}>{prediction?.runoutDaysRemaining ?? forecast?.runoutDaysRemaining} دن</strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedForecastForDetail(forecast || null);
                              setIsPredictiveModalOpen(true);
                            }}
                            className="text-[10.5px] font-bold text-purple-700 hover:text-purple-950 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Activity className="w-3 h-3 text-purple-600" />
                            <span>{isUrdu ? 'کھپت و ری آرڈر تجزیہ' : 'Dispensing Analytics'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right (Columns 5): FAST POS CART & BILLING COUNTER */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{isUrdu ? 'فارمیسی کاؤنٹر بلنگ (POS)' : 'Pharmacy Quick POS'}</h3>
                  <span className="text-[10px] text-slate-400">{posCart.length} {isUrdu ? 'ادویات منتخب' : 'Items'}</span>
                </div>
              </div>
              {posCart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPosCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                >
                  {isUrdu ? 'خالی کریں' : 'Clear'}
                </button>
              )}
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isUrdu ? 'کسٹمر نام (اختیاری)' : 'Customer Name'}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={isUrdu ? 'فون نمبر' : 'Phone'}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {posCart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2.5">
                  <p>{isUrdu ? 'بل میں ادویات شامل کرنے کے لیے بائیں جانب کلک کریں یا بارکوڈ اسکین کریں۔' : 'Cart is empty. Scan barcode or click items.'}</p>
                  <button
                    type="button"
                    onClick={() => setIsQrScannerOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{isUrdu ? '📷 کیمرہ کیو آر اسکینر کھولیں' : '📷 Open Camera QR Scanner'}</span>
                  </button>
                </div>
              ) : (
                posCart.map((ci) => (
                  <div
                    key={ci.batch.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-2.5 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-white">{ci.batch.productNameUrdu || ci.batch.productNameEnglish}</div>
                      <div className="text-[10px] text-slate-400">بیچ: {ci.batch.batchNumber} | Rs. {ci.batch.salePricePKR}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(ci.batch.id, ci.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-xs font-mono">{ci.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(ci.batch.id, ci.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-16 text-right font-black text-xs text-emerald-400 font-mono">
                        Rs. {ci.batch.salePricePKR * ci.quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(ci.batch.id)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discount */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{isUrdu ? 'سب ٹوٹل:' : 'Subtotal:'}</span>
                <span className="font-mono text-white font-bold">Rs. {subtotal}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>{isUrdu ? 'رعایت (Discount Rs):' : 'Discount:'}</span>
                <input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-amber-300 font-bold outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>{isUrdu ? 'ادائیگی کا ذریعہ:' : 'Payment:'}</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300 font-bold outline-none"
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Card">Bank Card</option>
                </select>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span className="text-emerald-400">{isUrdu ? 'کل واجب الادا:' : 'Net Total:'}</span>
                <span className="text-emerald-400 font-mono">Rs. {totalPayable}</span>
              </div>
            </div>

            {/* Print & Sale Button */}
            <button
              type="button"
              onClick={handleCompleteSaleAndPrint}
              disabled={posCart.length === 0}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                posCart.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50 cursor-pointer active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span>{isUrdu ? 'بل مکمل کریں اور پرچی نکالیں (Print Bill)' : 'Complete Sale & Print Slip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Batch Modal */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-black text-sm">{isUrdu ? 'نیا بیچ و دوا درج کریں' : 'Add New Pharmacy Batch'}</h3>
              <button onClick={() => setIsAddBatchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'دوا کا نام (اردو)' : 'Medicine Name'}</label>
                <input
                  type="text"
                  value={newBatch.productNameUrdu || ''}
                  onChange={(e) => setNewBatch({ ...newBatch, productNameUrdu: e.target.value })}
                  placeholder="حوراب ہیئر آئل / شربت بزوری"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'بیچ نمبر' : 'Batch Number'}</label>
                  <input
                    type="text"
                    value={newBatch.batchNumber || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'بارکوڈ' : 'Barcode'}</label>
                  <input
                    type="text"
                    value={newBatch.barcode || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, barcode: e.target.value })}
                    placeholder="8964000123"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'تاریخ تنسیخ (Expiry Date)' : 'Expiry Date'}</label>
                  <input
                    type="date"
                    value={newBatch.expiryDate || '2027-12-31'}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'ریک لوکیشن' : 'Rack'}</label>
                  <input
                    type="text"
                    value={newBatch.rackLocation || 'Rack A-1'}
                    onChange={(e) => setNewBatch({ ...newBatch, rackLocation: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'خرید قیمت' : 'Cost'}</label>
                  <input
                    type="number"
                    value={newBatch.costPricePKR || 0}
                    onChange={(e) => setNewBatch({ ...newBatch, costPricePKR: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'فروخت قیمت' : 'Sale'}</label>
                  <input
                    type="number"
                    value={newBatch.salePricePKR || 0}
                    onChange={(e) => setNewBatch({ ...newBatch, salePricePKR: Number(e.target.value) })}
                    className="w-full border border-emerald-400 rounded-xl px-3 py-2 outline-none font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'اسٹاک تعداد' : 'Stock Qty'}</label>
                  <input
                    type="number"
                    value={newBatch.currentStock || 0}
                    onChange={(e) => setNewBatch({ ...newBatch, currentStock: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-700 bg-white border font-bold text-xs"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateNewBatch}
                className="px-5 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold text-xs shadow-xs"
              >
                {isUrdu ? 'محفوظ کریں' : 'Save Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PREDICTIVE INVENTORY & REORDER INTELLIGENCE MODAL        */}
      {/* 30-Day Dispensing Pattern Algorithm & Stockout Guard     */}
      {/* ======================================================== */}
      {isPredictiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-purple-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black">
                      {isUrdu
                        ? '🤖 پیشین گوئی انوینٹری ری آرڈر ماڈل (Predictive Reorder Algorithm)'
                        : '🤖 Predictive Pharmacy Reorder Intelligence & Stockout Guard'}
                    </h3>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      30-Day Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-1 max-w-2xl">
                    {isUrdu
                      ? 'گزشتہ ۳۰ ایام کے اخراجاتی پیٹرن، یومیہ کھپت کی رفتار (Burn Rate) اور سپلائر لیڈ ٹائم کی بنیاد پر اگلی "ری آرڈر تاریخ" کا خودکار حساب، تاکہ کلینک میں ضروری ادویات کا اسٹاک کبھی ختم نہ ہو۔'
                      : 'Mathematical forecasting analyzing 30-day dispensing velocity, supplier lead time buffers, and safety margins to calculate exact Reorder Dates and avert stockouts.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPredictiveModalOpen(false);
                  setSelectedForecastForDetail(null);
                }}
                className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Summary Cards & Lead Time Selector */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
                  <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'فوری ری آرڈر ضروری' : 'Immediate Reorder'}</span>
                  </div>
                  <div className="text-2xl font-black text-rose-700 mt-1">
                    {criticalReorderCount} <span className="text-xs font-bold text-slate-500">ادویات</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">اسٹاک سیفٹی بفر سے نیچے</div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                  <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'آئندہ ۷ دن میں ری آرڈر' : 'Due in ≤ 7 Days'}</span>
                  </div>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    {soonReorderCount} <span className="text-xs font-bold text-slate-500">ادویات</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">مطلوبہ پیشگی آرڈر</div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isUrdu ? '۳۰ روزہ کل کھپت' : '30-Day Dispensed'}</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mt-1">
                    {predictiveForecasts.reduce((sum, f) => sum + f.dispensedLast30Days, 0)}{' '}
                    <span className="text-xs font-bold text-slate-500">یونٹس</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">کل مریضوں کو فراہم کردہ</div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'سپلائر لیڈ ٹائم بفر' : 'Supplier Lead Time'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[2, 4, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setLeadTimeDays(days)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            leadTimeDays === days
                              ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {days} {isUrdu ? 'دن' : 'D'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9.5px] text-slate-500 mt-1">پہنچنے کی متوقع مدت</div>
                </div>
              </div>

              {/* Action Banner for Requisition */}
              <div className="bg-gradient-to-r from-purple-100/80 via-emerald-50 to-teal-50 border border-purple-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-purple-950 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>
                    {isUrdu
                      ? `کل ${totalReorderNeeded} ادویات ری آرڈر کے دائرہ کار میں شامل ہیں۔ پیشگی آرڈر کا تخمینہ: PKR ${predictiveForecasts
                          .filter((f) => f.urgency === 'CRITICAL_NOW' || f.urgency === 'REORDER_SOON')
                          .reduce((sum, f) => sum + f.estimatedReorderCostPKR, 0)
                          .toLocaleString()}`
                      : `${totalReorderNeeded} medicines flagged for replenishment. Estimated Reorder Budget: PKR ${predictiveForecasts
                          .filter((f) => f.urgency === 'CRITICAL_NOW' || f.urgency === 'REORDER_SOON')
                          .reduce((sum, f) => sum + f.estimatedReorderCostPKR, 0)
                          .toLocaleString()}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const itemsToReorder = predictiveForecasts.filter(
                      (f) => f.urgency === 'CRITICAL_NOW' || f.urgency === 'REORDER_SOON'
                    );
                    const targetList = itemsToReorder.length > 0 ? itemsToReorder : predictiveForecasts.slice(0, 5);
                    const html = generatePurchaseOrderHtml(targetList, clinicSettings);
                    const win = window.open('', '_blank', 'width=900,height=1100');
                    if (win) {
                      win.document.open();
                      win.document.write(html);
                      win.document.close();
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'آفیشل پرچیز آرڈر (PO) پرنٹ کریں' : 'Generate & Print Supplier PO Requisition'}</span>
                </button>
              </div>
            </div>

            {/* Predictive Table */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Recharts LineChart for 30-Day Dispensing Volume & Seasonal Demand Spikes */}
              {(() => {
                const activeForecast = selectedForecastForDetail || predictiveForecasts[0];
                const activeBatch = batches.find((b) => b.id === activeForecast?.batchId) || batches[0];
                if (!activeBatch) return null;

                return (
                  <div className="mb-5">
                    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">{isUrdu ? 'چارٹ لوڈ ہو رہا ہے...' : 'Loading Predictive Forecast Chart...'}</div>}>
                      <Modal30DayLineChart
                        batch={activeBatch}
                        forecast={activeForecast}
                        allBatches={batches}
                        onSelectBatch={(batchId) => {
                          const fc = predictiveForecasts.find((f) => f.batchId === batchId);
                          if (fc) setSelectedForecastForDetail(fc);
                        }}
                        isUrdu={isUrdu}
                      />
                    </React.Suspense>
                  </div>
                );
              })()}

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">دوا کا نام و تفصیل</th>
                      <th className="p-3 text-center">موجودہ اسٹاک</th>
                      <th className="p-3 text-center">۳۰ دن کھپت (Burn Rate)</th>
                      <th className="p-3 text-center">باقی ایام (Runway)</th>
                      <th className="p-3 text-center">پیشین گوئی ری آرڈر تاریخ</th>
                      <th className="p-3 text-center">تجویز کردہ آرڈر</th>
                      <th className="p-3 text-center">حالت (Urgency)</th>
                      <th className="p-3 text-center">۳۰ دن گراف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {predictiveForecasts.map((f, idx) => {
                      const isCritical = f.urgency === 'CRITICAL_NOW';
                      const isSoon = f.urgency === 'REORDER_SOON';
                      const isSelectedInModal = (selectedForecastForDetail?.batchId || predictiveForecasts[0]?.batchId) === f.batchId;

                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedForecastForDetail(f)}
                          className={`transition-all cursor-pointer ${
                            isSelectedInModal
                              ? 'bg-purple-100/90 ring-2 ring-purple-600 font-semibold'
                              : isCritical
                              ? 'bg-rose-50/70 font-semibold'
                              : isSoon
                              ? 'bg-amber-50/50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{f.productNameUrdu || f.productNameEnglish}</span>
                              {isSelectedInModal && (
                                <span className="text-[9px] bg-purple-700 text-white font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                                  <TrendingUp className="w-2.5 h-2.5 text-purple-200" />
                                  <span>{isUrdu ? 'چارٹ فعال' : 'Chart Active'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              {f.productNameEnglish} • ریک: {f.rackLocation}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                                f.currentStock <= f.safetyStockUnits
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {f.currentStock} یونٹ
                            </span>
                            <div className="text-[9.5px] text-slate-400 mt-0.5">
                              سیفٹی: {f.safetyStockUnits}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <div className="font-mono font-bold text-slate-800">
                              {f.dispensedLast30Days} <span className="text-[10px] text-slate-500 font-normal">کل</span>
                            </div>
                            <div className="text-[10px] text-emerald-700 font-bold">
                              {f.averageDailyBurnRate} یونٹ/روزانہ
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`font-mono font-bold ${
                                f.runoutDaysRemaining <= leadTimeDays
                                  ? 'text-rose-600 font-black'
                                  : f.runoutDaysRemaining <= 10
                                  ? 'text-amber-700 font-bold'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {f.runoutDaysRemaining} دن
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-xs ${
                                isCritical
                                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                                  : isSoon
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{f.reorderDateFormatted}</span>
                            </div>
                            <div className="text-[10px] text-slate-600 font-bold mt-0.5">
                              {isCritical ? '🚨 آج ہی آرڈر کریں' : `${f.daysUntilReorder} دن باقی`}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <div className="font-black text-purple-950">
                              +{f.suggestedReorderUnits} یونٹ
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Rs. {f.estimatedReorderCostPKR.toLocaleString()}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isCritical
                                  ? 'bg-rose-200 text-rose-950 border border-rose-300 font-black'
                                  : isSoon
                                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                  : f.urgency === 'LOW_MOVEMENT'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {isUrdu ? f.urgencyLabelUrdu : f.urgencyLabelEnglish}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedForecastForDetail(f);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                                isSelectedInModal
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                              }`}
                              title={isUrdu ? 'اس دوا کا ۳۰ روزہ یومیہ کھپت لائن چارٹ دیکھیں' : 'View 30-Day Dispensing LineChart'}
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>{isUrdu ? 'گراف' : 'Chart'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Informational Guidance Box */}
              <div className="mt-4 p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-950 flex items-start gap-2.5 leading-relaxed">
                <Sparkles className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>{isUrdu ? 'الگورتھم کا طریقۂ کار (Algorithm Logic):' : 'Forecasting Logic:'}</strong>{' '}
                  {isUrdu
                    ? `یہ پیشین گوئی ماڈل فارمیسی کاؤنٹر سے گزشتہ ۳۰ ایام میں فروخت ہونے والی ادویات کے اعداد و شمار لے کر یومیہ برن ریٹ (Burn Rate) نکالتا ہے۔ اس کے بعد سپلائر لیڈ ٹائم (${leadTimeDays} دن) اور حفاظتی بفر (Safety Stock) کے تحت بالکل درست ری آرڈر تاریخ کا تعین کرتا ہے تاکہ ادویات ختم ہونے سے پہلے سپلائر کو پرچیز آرڈر ارسال ہو سکے۔`
                    : `This algorithm extracts 30-day dispensing quantities to determine the Average Daily Consumption (ADR). Factoring in distributor lead times (${leadTimeDays} days) and safety stock cushions, it establishes the precise calendar date by which purchase orders must be dispatched to avoid stockouts.`}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div className="text-xs text-slate-500 font-medium">
                {isUrdu ? 'ماڈل اپ ڈیٹ: ریئل ٹائم فارمیسی سیلز ٹیلی میٹری' : 'Model updated: Real-time checkout telemetry synced.'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPredictiveModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-slate-700 bg-white border border-slate-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera QR Code & Barcode Scanner Modal */}
      {isQrScannerOpen && (
        <React.Suspense fallback={null}>
          <PharmacyQrScannerModal
            isOpen={isQrScannerOpen}
            onClose={() => setIsQrScannerOpen(false)}
            batches={batches}
            pendingDoctorRxList={pendingDoctorRxList}
            onScannedPatient={(rx) => handleLoadRxIntoCart(rx)}
            onScannedMedicine={(batch) => {
              handleAddToCart(batch);
              setSelectedBatchIdForChart(batch.id);
            }}
            onScannedRawQuery={(query) => {
              setSearchQuery(query);
              setBarcodeInput(query);
            }}
            isUrdu={isUrdu}
          />
        </React.Suspense>
      )}
    </div>
  );
}
