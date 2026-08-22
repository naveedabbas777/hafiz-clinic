import React, { useState } from 'react';
import { ShoppingCart, AlertTriangle, Clock, Barcode, Plus, Trash2, Search, CheckCircle, Package, ArrowRight, Printer, RefreshCw, X, ShieldAlert, Sparkles } from 'lucide-react';
import { PharmacyBatchItem, Product, StaffUser } from '../types';
import { INITIAL_PHARMACY_BATCHES } from '../data/pharmacyBatchData';

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
  const [filterTab, setFilterTab] = useState<'all' | 'low_stock' | 'expiring_soon'>('all');

  // POS Cart State
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash'>('Cash');

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

  // Barcode quick search & instant cart add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = batches.find(
      (b) => b.barcode?.trim() === barcodeInput.trim() || b.batchNumber.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      handleAddToCart(matched);
      setBarcodeInput('');
    } else {
      alert(isUrdu ? `بارکوڈ (${barcodeInput}) کے ساتھ کوئی دوا نہیں ملی۔` : `No item found matching barcode: ${barcodeInput}`);
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

    // Deduct stock
    const updatedBatches = batches.map((b) => {
      const soldItem = posCart.find((ci) => ci.batch.id === b.id);
      if (soldItem) {
        return { ...b, currentStock: Math.max(0, b.currentStock - soldItem.quantity) };
      }
      return b;
    });
    saveBatchesState(updatedBatches);

    // Thermal Receipt HTML
    const slipNo = `PHARM-${Math.floor(1000 + Math.random() * 9000)}`;
    const printHtml = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Pharmacy Receipt — ${slipNo}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          body { font-family: system-ui, sans-serif; width: 72mm; margin: 0 auto; padding: 2mm; font-size: 11px; color: #000; }
          .center { text-align: center; }
          .title { font-size: 14px; font-weight: 900; margin: 0; }
          .sub { font-size: 9px; color: #333; margin-top: 2px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10px; }
          th { border-bottom: 1px solid #000; text-align: right; padding: 2px; }
          td { padding: 3px 2px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">${clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ فارمیسی'}</div>
          <div class="sub">PHC Reg No: ${clinicSettings?.phcApprovalNo || 'PHC-786/26'} | فون: ${clinicSettings?.phone1 || '0300-1234567'}</div>
          <div class="sub">آفیشل فارمیسی کیش میمو (Pharmacy Sale Slip)</div>
        </div>
        <div class="divider"></div>
        <div class="row"><span>پرچی نمبر:</span><span class="bold">${slipNo}</span></div>
        <div class="row"><span>تاریخ و وقت:</span><span>${new Date().toLocaleString()}</span></div>
        <div class="row"><span>کسٹمر نام:</span><span class="bold">${customerName || 'واک اِن کسٹمر'}</span></div>
        <div class="row"><span>پیمنٹ بذریعہ:</span><span class="bold">${paymentMethod}</span></div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>دوا کا نام</th>
              <th style="text-align:center;">تعداد</th>
              <th style="text-align:left;">قیمت</th>
            </tr>
          </thead>
          <tbody>
            ${posCart.map((i) => `
              <tr>
                <td>${i.batch.productNameUrdu || i.batch.productNameEnglish}<br/><small style="color:#555;">بیچ: ${i.batch.batchNumber}</small></td>
                <td style="text-align:center;">${i.quantity}</td>
                <td style="text-align:left;">Rs. ${i.batch.salePricePKR * i.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="row"><span>سب ٹوٹل:</span><span>Rs. ${subtotal}</span></div>
        ${discountAmount > 0 ? `<div class="row"><span>رعایت (Discount):</span><span>- Rs. ${discountAmount}</span></div>` : ''}
        <div class="row" style="font-size: 13px; font-weight: 900;"><span>کل واجب الادا:</span><span>Rs. ${totalPayable}</span></div>
        <div class="divider"></div>
        <div class="center" style="font-size: 9px; margin-top: 6px;">
          کھولی ہوئی یا خردبرد شدہ دوا واپس نہیں ہوگی۔ صحت یابی کی دعا کے ساتھ شکریہ!
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

  // Filtered batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productNameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.barcode && b.barcode.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterTab === 'low_stock') return b.currentStock <= b.minThreshold;
    if (filterTab === 'expiring_soon') return isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate);
    return true;
  });

  const totalLowStock = batches.filter((b) => b.currentStock <= b.minThreshold).length;
  const totalExpiringSoon = batches.filter((b) => isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate)).length;

  return (
    <div className="space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Banner with Alert Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200 font-bold uppercase">{isUrdu ? 'کل فارمیسی آئٹمز' : 'Total Batches'}</div>
            <div className="text-2xl font-black">{batches.length} {isUrdu ? 'میڈیسنز' : 'Items'}</div>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-2xl">
            <Package className="w-6 h-6 text-emerald-200" />
          </div>
        </div>

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
            {isUrdu ? 'دیکھیں' : 'Filter'}
          </span>
        </div>

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
            {isUrdu ? 'دیکھیں' : 'Filter'}
          </span>
        </div>
      </div>

      {/* Main POS & Inventory Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center (Columns 7): INVENTORY & FAST BARCODE SEARCH */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Fast Barcode Input */}
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
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'شامل کریں' : 'Add'}</span>
              </button>
            </form>

            {/* Controls Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold">
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

              {/* Add New Batch Button */}
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'نیا بیچ / دوا درج کریں' : 'New Batch'}</span>
              </button>
            </div>

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

            {/* Batches Table / Cards */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredBatches.map((b) => {
                const expiring = isExpiringSoon(b.expiryDate);
                const expired = isExpired(b.expiryDate);
                const isLow = b.currentStock <= b.minThreshold;

                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                      expired
                        ? 'bg-rose-50 border-rose-300'
                        : expiring
                        ? 'bg-amber-50/70 border-amber-200'
                        : isLow
                        ? 'bg-orange-50/50 border-orange-200'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{b.productNameUrdu || b.productNameEnglish}</span>
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
                      <div className="flex items-center gap-1.5 pt-0.5">
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
                        {isLow && (
                          <span className="text-[9px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full">
                            {isUrdu ? 'کم اسٹاک الرٹ' : 'Low Stock'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-800">Rs. {b.salePricePKR}</div>
                        <div className="text-[11px] font-bold text-slate-500">
                          اسٹاک:{' '}
                          <span className={isLow ? 'text-rose-600 font-black' : 'text-slate-900'}>
                            {b.currentStock} یونٹ
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(b)}
                        disabled={b.currentStock <= 0}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
                          b.currentStock > 0
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'بل میں شامل' : 'Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <div className="text-center py-10 text-slate-500 text-xs">
                  {isUrdu ? 'بل میں ادویات شامل کرنے کے لیے بائیں جانب کلک کریں یا بارکوڈ اسکین کریں۔' : 'Cart is empty. Scan barcode or click items.'}
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
    </div>
  );
}
