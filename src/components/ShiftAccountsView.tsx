import React, { useState } from 'react';
import { DollarSign, CreditCard, Calculator, Printer, CheckCircle, TrendingUp, TrendingDown, Users, FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Doctor, MoneySlip, HospitalExpense, DailyCashShiftReport, DoctorRevenueShare } from '../types';

interface Props {
  doctors: Doctor[];
  slips: MoneySlip[];
  expenses: HospitalExpense[];
  language: 'urdu' | 'english';
  clinicSettings?: any;
}

export function ShiftAccountsView({ doctors, slips, expenses, language, clinicSettings }: Props) {
  const isUrdu = language === 'urdu';

  const [activeTab, setActiveTab] = useState<'shift_closing' | 'doctor_split'>('shift_closing');

  // Shift closing state
  const [cashierName, setCashierName] = useState('محمد علی (کاؤنٹر انچارج)');
  const [openingCash, setOpeningCash] = useState<number>(5000);
  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState('');

  // Doctor share commission percentages (e.g. 70% doctor, 30% hospital or custom)
  const [doctorSplitPercentages, setDoctorSplitPercentages] = useState<Record<string, number>>(() => {
    const defaultSplits: Record<string, number> = {};
    doctors.forEach((d) => {
      defaultSplits[d.id] = 70; // 70% default doctor share
    });
    return defaultSplits;
  });

  // Calculate totals from slips
  const totalCashCollected = slips
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalEasyPaisa = slips
    .filter((s) => s.paymentMethod === 'EasyPaisa')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalJazzCash = slips
    .filter((s) => s.paymentMethod === 'JazzCash')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalCard = slips
    .filter((s) => s.paymentMethod === 'Card' || s.paymentMethod === 'Bank Transfer')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalAllCollections = totalCashCollected + totalEasyPaisa + totalJazzCash + totalCard;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expectedCashInDrawer = openingCash + totalCashCollected - totalExpenses;
  const discrepancy = actualCashCounted > 0 ? actualCashCounted - expectedCashInDrawer : 0;

  // Doctor revenue split calculation
  const doctorSplitData: DoctorRevenueShare[] = doctors.map((doc) => {
    const docSlips = slips.filter(
      (s) =>
        (s.doctorName && (s.doctorName.includes(doc.nameUrdu) || s.doctorName.includes(doc.nameEnglish))) ||
        s.items.some((i) => i.servedBy === doc.nameUrdu || i.servedBy === doc.nameEnglish)
    );

    const totalConsultations = docSlips.length;
    const totalOPDFees = docSlips.reduce((sum, s) => sum + s.paidAmount, 0);
    const splitPercent = doctorSplitPercentages[doc.id] ?? 70;
    const doctorPayable = Math.round((totalOPDFees * splitPercent) / 100);
    const hospitalShare = totalOPDFees - doctorPayable;

    return {
      doctorId: doc.id,
      doctorName: doc.nameUrdu || doc.nameEnglish,
      totalConsultations,
      totalOPDFeesPKR: totalOPDFees,
      doctorSharePercentage: splitPercent,
      doctorPayablePKR: doctorPayable,
      hospitalSharePKR: hospitalShare,
      paidAmountPKR: 0,
      balancePayablePKR: doctorPayable,
    };
  });

  const handlePrintShiftReport = () => {
    const cName = clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ ہربل ہسپتال';
    const printHtml = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Daily Cash Shift Report</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: system-ui, sans-serif; color: #0f172a; font-size: 13px; margin: 0; }
          .box { border: 2px solid #065f46; border-radius: 12px; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 10px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 900; color: #065f46; margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
          .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
          .grand-total { font-size: 16px; font-weight: 900; color: #065f46; background: #ecfdf5; padding: 10px; border-radius: 8px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="header">
            <div class="title">${cName}</div>
            <div>روزانہ کیش دراز کلوزنگ و شفٹ آڈٹ رپورٹ (Shift Cash Closing Report)</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">تاریخ: ${new Date().toLocaleDateString()} | کیشیر: ${cashierName}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div>اوپننگ کیش دراز (Opening Cash): <strong>Rs. ${openingCash}</strong></div>
              <div>نقد کلیکشن (Cash Collected): <strong>Rs. ${totalCashCollected}</strong></div>
              <div>ایزی پیسہ (EasyPaisa): <strong>Rs. ${totalEasyPaisa}</strong></div>
              <div>جاز کیش (JazzCash): <strong>Rs. ${totalJazzCash}</strong></div>
              <div>بینک کارڈ (Cards/Bank): <strong>Rs. ${totalCard}</strong></div>
            </div>
            <div class="card">
              <div>کل آمدن (Total Inflow): <strong style="color:#047857;">Rs. ${totalAllCollections}</strong></div>
              <div>روزانہ کے اخراجات (Total Expenses Paid): <strong style="color:#dc2626;">Rs. ${totalExpenses}</strong></div>
              <div style="margin-top:6px; border-top:1px dashed #cbd5e1; padding-top:6px;">
                دراز میں متوقع نقد رقم: <strong>Rs. ${expectedCashInDrawer}</strong>
              </div>
              <div>کاؤنٹ شدہ نقد رقم: <strong>Rs. ${actualCashCounted}</strong></div>
              <div>فرق (Discrepancy): <strong style="color:${discrepancy < 0 ? '#dc2626' : '#047857'};">Rs. ${discrepancy}</strong></div>
            </div>
          </div>

          <div class="grand-total">
            <div style="display:flex; justify-content:space-between;">
              <span>خالص نقد بیلنس (Net Cash In Hand):</span>
              <span>Rs. ${actualCashCounted > 0 ? actualCashCounted : expectedCashInDrawer}</span>
            </div>
          </div>

          ${shiftNotes ? `<div style="margin-top:16px; font-size:12px;"><strong>نوٹ:</strong> ${shiftNotes}</div>` : ''}

          <div style="display:flex; justify-content:space-between; margin-top:60px; border-top:1px solid #cbd5e1; padding-top:10px;">
            <div>دستخط کیشیر: ________________</div>
            <div>دستخط ہسپتال ایڈمنسٹریٹر: ________________</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=900,height=1100');
    if (win) {
      win.document.open();
      win.document.write(printHtml);
      win.document.close();
    }
  };

  const handlePrintDoctorVoucher = (docShare: DoctorRevenueShare) => {
    const cName = clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ ہربل ریسرچ سینٹر';
    const voucherNo = `DOC-PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    const printHtml = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Doctor Payout Voucher — ${docShare.doctorName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: system-ui, sans-serif; color: #0f172a; font-size: 13px; margin: 0; }
          .box { border: 2px solid #0f766e; border-radius: 12px; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 900; color: #0f766e; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { background: #0f766e; color: white; padding: 8px 10px; text-align: right; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="header">
            <div class="title">${cName}</div>
            <div>ڈاکٹر شیئر ادائیگی واؤچر (Doctor Revenue Payout Slip)</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">واؤچر نمبر: ${voucherNo} | تاریخ: ${new Date().toLocaleDateString()}</div>
          </div>

          <div style="background:#f0fdfa; border:1px solid #99f6e4; padding:12px; border-radius:8px; margin-bottom:16px;">
            <div><strong>ڈاکٹر کا نام:</strong> ${docShare.doctorName}</div>
            <div><strong>کل چیک اپس (Consultations):</strong> ${docShare.totalConsultations} مریض</div>
            <div><strong>شیئر تناسب (Doctor Ratio):</strong> ${docShare.doctorSharePercentage}% معالج / ${100 - docShare.doctorSharePercentage}% کلینک</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>تفصیل (Description)</th>
                <th style="text-align:left;">رقم (Amount)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>کل وصول شدہ او پی ڈی فیس (Total Gross Collection)</td>
                <td style="text-align:left; font-weight:bold;">Rs. ${docShare.totalOPDFeesPKR}</td>
              </tr>
              <tr>
                <td>کلینک مینجمنٹ کٹوتی (${100 - docShare.doctorSharePercentage}%)</td>
                <td style="text-align:left; color:#64748b;">Rs. ${docShare.hospitalSharePKR}</td>
              </tr>
              <tr style="background:#f0fdf4; font-weight:900; font-size:15px; color:#065f46;">
                <td>ڈاکٹر کو واجب الادا رقم (${docShare.doctorSharePercentage}%)</td>
                <td style="text-align:left;">Rs. ${docShare.doctorPayablePKR}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; justify-content:space-between; margin-top:80px; border-top:1px solid #cbd5e1; padding-top:12px;">
            <div>دستخط وصول کنندہ ڈاکٹر: ________________</div>
            <div>دستخط اکاونٹنٹ / فنانس مینیجر: ________________</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=900,height=1100');
    if (win) {
      win.document.open();
      win.document.write(printHtml);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-3xl border border-slate-200 shadow-sm gap-2 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('shift_closing')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'shift_closing'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{isUrdu ? 'شفٹ کیش کلوزنگ' : 'Daily Shift Closing'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctor_split')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'doctor_split'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isUrdu ? 'ڈاکٹر ریونیو شیئر' : 'Doctor Split'}</span>
        </button>
      </div>

      {/* Tab 1: DAILY SHIFT CLOSING */}
      {activeTab === 'shift_closing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Summary Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <span>{isUrdu ? 'آج کی کلیکشن اور کیش فلو بریک ڈاؤن' : 'Collections & Cash Flow'}</span>
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">{new Date().toLocaleDateString()}</span>
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl">
                  <span className="text-emerald-800 font-bold block">Cash (نقد)</span>
                  <div className="text-base font-black text-emerald-900 font-mono mt-1">Rs. {totalCashCollected}</div>
                </div>

                <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-2xl">
                  <span className="text-teal-800 font-bold block">EasyPaisa</span>
                  <div className="text-base font-black text-teal-900 font-mono mt-1">Rs. {totalEasyPaisa}</div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl">
                  <span className="text-amber-800 font-bold block">JazzCash</span>
                  <div className="text-base font-black text-amber-900 font-mono mt-1">Rs. {totalJazzCash}</div>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl">
                  <span className="text-blue-800 font-bold block">Cards / Bank</span>
                  <div className="text-base font-black text-blue-900 font-mono mt-1">Rs. {totalCard}</div>
                </div>
              </div>

              {/* Big Financial Summary */}
              <div className="space-y-2.5 text-xs pt-2">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-bold">کل موصولہ رقم (Total Inflow):</span>
                  <span className="font-mono text-sm font-black text-slate-900">Rs. {totalAllCollections}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl text-rose-900">
                  <span className="font-bold">کل اخراجات ادائیگی (Expenses Paid Out):</span>
                  <span className="font-mono text-sm font-black text-rose-700">- Rs. {totalExpenses}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 bg-emerald-900 text-white rounded-2xl">
                  <span className="font-black text-sm">متوقع نقد رقم دراز (Expected Drawer Cash):</span>
                  <span className="font-mono text-base font-black text-emerald-300">Rs. {expectedCashInDrawer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cash Drawer Count & Reconciliation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-black text-slate-900 text-sm">{isUrdu ? 'کیش دراز کاؤنٹنگ و شفٹ ویری فکیشن' : 'Drawer Cash Verification'}</h3>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'کیشیر نام' : 'Cashier Name'}</label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'اوپننگ کیش' : 'Opening Cash'}</label>
                  <input
                    type="number"
                    value={openingCash || ''}
                    onChange={(e) => setOpeningCash(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'گنی گئی نقد رقم' : 'Counted Cash'}</label>
                  <input
                    type="number"
                    value={actualCashCounted || ''}
                    onChange={(e) => setActualCashCounted(Number(e.target.value) || 0)}
                    placeholder="گن کر درج کریں"
                    className="w-full border-2 border-emerald-500 rounded-xl px-3 py-2 outline-none font-mono font-black text-emerald-900 bg-emerald-50/30"
                  />
                </div>
              </div>

              {actualCashCounted > 0 && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between font-bold ${
                    discrepancy === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : discrepancy < 0
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-blue-50 border-blue-300 text-blue-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {discrepancy === 0 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{discrepancy === 0 ? 'کیش دراز بالکل برابر ہے!' : discrepancy < 0 ? 'کیش کم ہے (Shortage)' : 'کیش زیادہ ہے (Surplus)'}</span>
                  </div>
                  <span className="font-mono text-sm font-black">Rs. {discrepancy}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isUrdu ? 'شفٹ اختتامی نوٹس' : 'Shift Notes'}</label>
                <textarea
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  rows={2}
                  placeholder={isUrdu ? 'کوئی خاص تفصیل...' : 'Closing remarks...'}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handlePrintShiftReport}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{isUrdu ? 'شفٹ کلوزنگ پرنٹ نکالیں' : 'Print Shift Closing Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DOCTOR REVENUE SHARE SPLIT */}
      {activeTab === 'doctor_split' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">{isUrdu ? 'ڈاکٹرز کمیشن و ریونیو شیئر کیلکولیٹر' : 'Doctor Revenue Split & Payouts'}</h3>
              <p className="text-xs text-slate-500">{isUrdu ? 'او پی ڈی فیس کی خودکار تقسیم بلحاظ معالج' : 'Automatic OPD percentage calculation per physician'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorSplitData.map((doc) => (
              <div
                key={doc.doctorId}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{doc.doctorName}</h4>
                    <span className="text-xs text-slate-500 font-bold">{doc.totalConsultations} {isUrdu ? 'مریض چیک کیے' : 'Patients seen'}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                    <span className="text-slate-500 font-bold">{isUrdu ? 'شیئر:' : 'Share:'}</span>
                    <input
                      type="number"
                      value={doctorSplitPercentages[doc.doctorId] ?? 70}
                      onChange={(e) =>
                        setDoctorSplitPercentages({
                          ...doctorSplitPercentages,
                          [doc.doctorId]: Number(e.target.value) || 0,
                        })
                      }
                      className="w-10 text-center font-black text-emerald-800 outline-none"
                    />
                    <span className="font-bold">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">کل او پی ڈی فیس</span>
                    <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">Rs. {doc.totalOPDFeesPKR}</div>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block font-bold">ڈاکٹر شیئر ({doc.doctorSharePercentage}%)</span>
                    <div className="font-mono font-black text-emerald-900 text-xs mt-0.5">Rs. {doc.doctorPayablePKR}</div>
                  </div>

                  <div className="bg-teal-50 p-2.5 rounded-2xl border border-teal-200">
                    <span className="text-[10px] text-teal-700 block font-bold">ہسپتال شیئر ({100 - doc.doctorSharePercentage}%)</span>
                    <div className="font-mono font-black text-teal-900 text-xs mt-0.5">Rs. {doc.hospitalSharePKR}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handlePrintDoctorVoucher(doc)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'ادائیگی واؤچر پرنٹ کریں' : 'Print Payout Voucher'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
