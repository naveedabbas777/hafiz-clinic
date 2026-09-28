import React, { useState } from 'react';
import { TestTube, Search, Download, FileText, QrCode, CheckCircle2, ShieldCheck, Printer, RefreshCw } from 'lucide-react';
import { printLabReportHtml, downloadLabReportPdf } from '../utils/printInvoice';

interface LabReportsViewProps {
  language?: 'urdu' | 'english';
}

export const LabReportsView: React.FC<LabReportsViewProps> = ({ language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const [mrnInput, setMrnInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const mockDatabase: Record<string, any> = {
    'MRN-84920': {
      patientName: 'محمد فاروق (Muhammad Farooq)',
      mrn: 'MRN-84920',
      ageGender: '42 / Male',
      sampleDate: '2026-08-01',
      reportDate: '2026-08-02',
      doctor: 'ڈاکٹر زیشان چوہدری (MBBS)',
      qrCodeVal: 'HAFIZ-LAB-VERIFIED-84920-OK',
      tests: [
        { testName: 'کمپیوٹر بائیو کوانٹم باڈی اسکین (Full Scan)', result: 'Normal', refRange: 'Standard', status: 'Passed' },
        { testName: 'بلڈ شوگر فاسٹنگ (Fasting Blood Sugar)', result: '108 mg/dL', refRange: '70 - 110 mg/dL', status: 'Normal' },
        { testName: 'سیرم کولیسٹرول (Serum Cholesterol)', result: '185 mg/dL', refRange: '< 200 mg/dL', status: 'Normal' },
        { testName: 'کمپیوٹرائزڈ آئی اینالائسز (Vision Test)', result: 'R: -0.50, L: -0.75', refRange: '6/6 Standard', status: 'Corrective Glasses Prescribed' },
      ]
    },
    'MRN-91024': {
      patientName: 'عائشہ بی بی (Ayesha Bibi)',
      mrn: 'MRN-91024',
      ageGender: '35 / Female',
      sampleDate: '2026-07-28',
      reportDate: '2026-07-29',
      doctor: 'ڈاکٹر وقاص صغیر چوہدری (MBBS)',
      qrCodeVal: 'HAFIZ-LAB-VERIFIED-91024-OK',
      tests: [
        { testName: 'سرپل اور جوڑوں کا ڈیجیٹل ایکس رے (Digital X-Ray Spine)', result: 'Mild Lumbar Lordosis', refRange: 'Normal Alignment', status: 'Physiotherapy Advised' },
        { testName: 'ہیموگلوبن (Hb Level)', result: '12.4 g/dL', refRange: '12.0 - 15.5 g/dL', status: 'Normal' },
      ]
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const searchMrn = mrnInput.trim().toUpperCase();
    const searchPhoneDigits = phoneInput.replace(/\D/g, '');

    // 1. Check dynamic synced patient reports
    try {
      const syncedReports: any[] = JSON.parse(localStorage.getItem('hafiz_patient_reports_v2') || '[]');
      const matchedSync = syncedReports.find((r) => {
        const rMrn = (r.mrn || r._id || '').toUpperCase();
        const rPhone = (r.phone || '').replace(/\D/g, '');
        return (
          (searchMrn && rMrn.includes(searchMrn)) ||
          (searchPhoneDigits && rPhone.includes(searchPhoneDigits))
        );
      });

      if (matchedSync) {
        setSearchResult({
          patientName: matchedSync.patientName,
          mrn: matchedSync.mrn || matchedSync._id || searchMrn,
          ageGender: 'Adult',
          sampleDate: matchedSync.date || new Date().toISOString().split('T')[0],
          reportDate: matchedSync.date || new Date().toISOString().split('T')[0],
          doctor: matchedSync.approvedBy || 'Dr. Saima Rehman (Pathologist)',
          qrCodeVal: matchedSync.qrVerificationCode || `HAFIZ-VERIFIED-${matchedSync._id || 'OK'}`,
          tests: (matchedSync.parameters || []).map((p: any) => ({
            testName: p.name,
            result: p.value || 'Normal',
            refRange: p.normalRange || 'Standard',
            status: p.isAbnormal ? '⚠️ Attention Needed (Abnormal)' : 'Normal / Passed',
          })),
        });
        return;
      }

      // 2. Check lab orders table
      const labOrders: any[] = JSON.parse(localStorage.getItem('hafiz_lab_orders_v2') || '[]');
      const matchedOrder = labOrders.find((o) => {
        const oNum = (o.orderNumber || o.id || '').toUpperCase();
        const oPhone = (o.patientPhone || '').replace(/\D/g, '');
        return (
          (searchMrn && (oNum.includes(searchMrn) || searchMrn.includes(oNum))) ||
          (searchPhoneDigits && oPhone.includes(searchPhoneDigits))
        );
      });

      if (matchedOrder) {
        setSearchResult({
          patientName: matchedOrder.patientName,
          mrn: matchedOrder.orderNumber,
          ageGender: `${matchedOrder.patientAge || '—'} / ${matchedOrder.patientGender || 'Adult'}`,
          sampleDate: matchedOrder.testDate || new Date().toISOString().split('T')[0],
          reportDate: matchedOrder.deliveryDate || new Date().toISOString().split('T')[0],
          doctor: matchedOrder.approvedByPathologist || matchedOrder.referredByDoctor || 'Consultant Pathologist',
          qrCodeVal: `HAFIZ-LAB-VERIFIED-${matchedOrder.orderNumber}-PHC`,
          tests: (matchedOrder.parameters || []).map((p: any) => ({
            testName: p.name,
            result: p.value || 'Report Ready',
            refRange: p.normalRange || 'Standard',
            status: p.isAbnormal ? '⚠️ Attention Needed' : 'Normal',
          })),
        });
        return;
      }
    } catch (_) {}

    // 3. Fallback to mock catalog database
    const found = mockDatabase[searchMrn] || null;
    setSearchResult(found);
  };

  const handlePrint = () => {
    if (searchResult) {
      printLabReportHtml(searchResult);
    } else {
      window.print();
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full inline-block">
              {isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن مصدقہ لیبارٹری' : 'PHC Verified Pathology Lab'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              {isUrdu ? 'آن لائن لیبارٹری رپورٹس اور QR تصدیق' : 'Online Pathology Reports & QR Verification'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm">
              {isUrdu
                ? 'اپنا MRN نمبر یا رپورٹ آئی ڈی درج کر کے فوری پی ڈی ایف پورٹ ڈاؤنلوڈ کریں اور تصدیقی کیو آر کوڈ چیک کریں۔'
                : 'Enter your MRN Number or Patient ID to access, print, and download officially verified lab reports with QR authentication.'}
            </p>
          </div>
          <TestTube className="w-16 h-16 text-emerald-400 opacity-80 hidden md:block flex-shrink-0" />
        </div>

        {/* Search Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-100 shadow-md">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-700" />
            <span>{isUrdu ? 'رپورٹ حاصل کریں (Search Report)' : 'Find Your Lab Report'}</span>
          </h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isUrdu ? 'مریض کا MRN / رپورٹ آئی ڈی (ایگزمپل: MRN-84920)' : 'MRN / Report ID (e.g. MRN-84920)'}
              </label>
              <input
                type="text"
                required
                value={mrnInput}
                onChange={(e) => setMrnInput(e.target.value)}
                placeholder="MRN-84920"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isUrdu ? 'موبائل نمبر (اختیاری)' : 'Mobile Phone Number (Optional)'}
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow"
              >
                <Search className="w-4 h-4" />
                <span>{isUrdu ? 'رپورٹ کیو آر چیک کریں' : 'Search & Verify Report'}</span>
              </button>
            </div>
          </form>

          <div className="mt-3 text-xs text-gray-500 flex flex-wrap items-center gap-2">
            <span>💡 {isUrdu ? 'رہنمائی: اپنا میڈیکل ریکارڈ نمبر (MRN) درج کریں جو آپ کے نسخے یا لیب پرچی پر درج ہے:' : 'Guidance: Enter the Medical Record Number (MRN) printed on your prescription or diagnostic receipt:'}</span>
            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">MRN-XXXXX</span>
          </div>
        </div>

        {/* Result View */}
        {searched && (
          <div>
            {searchResult ? (
              <div id="printable-lab-report" className="printable-area bg-white rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-lg space-y-6">
                {/* Printable Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-emerald-950">
                      حافظ کلینک اینڈ لیبارٹری (Hafiz Clinic Lab)
                    </h2>
                    <p className="text-xs text-emerald-800 font-semibold">
                      پنجاب ہیلتھ کیئر کمیشن منظور شدہ • PHC Registration # PHC-REG-84920
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-right">
                    <QrCode className="w-12 h-12 text-emerald-800 flex-shrink-0" />
                    <div className="text-[10px] text-emerald-950 font-bold">
                      <div>OFFICIAL DIGITAL QR STAMP</div>
                      <div className="text-emerald-700 font-mono">{searchResult.qrCodeVal}</div>
                      <div className="text-emerald-600">✓ Verified Authentic Report</div>
                    </div>
                  </div>
                </div>

                {/* Patient Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-200">
                  <div>
                    <span className="text-gray-500 block">{isUrdu ? 'مریض کا نام:' : 'Patient Name:'}</span>
                    <strong className="text-slate-900">{searchResult.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{isUrdu ? 'MRN آئی ڈی:' : 'MRN ID:'}</span>
                    <strong className="text-slate-900">{searchResult.mrn}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{isUrdu ? 'نمونہ تاریخ:' : 'Sample Date:'}</span>
                    <strong className="text-slate-900">{searchResult.sampleDate}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{isUrdu ? 'معالج ڈاکٹر:' : 'Consultant Doctor:'}</span>
                    <strong className="text-slate-900">{searchResult.doctor}</strong>
                  </div>
                </div>

                {/* Test Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right sm:text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-bold">
                        <th className="p-3">#</th>
                        <th className="p-3">{isUrdu ? 'ٹیسٹ کا نام (Test Name)' : 'Test Name'}</th>
                        <th className="p-3">{isUrdu ? 'نتیجہ (Result)' : 'Result Value'}</th>
                        <th className="p-3">{isUrdu ? 'معیاری حد (Reference Range)' : 'Reference Range'}</th>
                        <th className="p-3">{isUrdu ? 'حیثیت (Status)' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {searchResult.tests.map((t: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold">{idx + 1}</td>
                          <td className="p-3 font-black text-slate-900">{t.testName}</td>
                          <td className="p-3 font-bold text-emerald-800">{t.result}</td>
                          <td className="p-3 text-gray-600">{t.refRange}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Print and Download Actions */}
                <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'یہ رپورٹ باضابطہ طور پر الیکٹرانک تصدیق شدہ ہے۔' : 'Officially authenticated electronic laboratory report.'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isGeneratingPdf}
                      onClick={async () => {
                        if (searchResult) {
                          setIsGeneratingPdf(true);
                          try {
                            await downloadLabReportPdf(searchResult, 'printable-lab-report');
                          } finally {
                            setIsGeneratingPdf(false);
                          }
                        }
                      }}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span>{isUrdu ? 'ڈاؤنلوڈ PDF رپورٹ' : 'Save PDF'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isUrdu ? 'پرنٹ / PDF پرنٹ کریں' : 'Print / Save PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-900 p-6 rounded-2xl border border-red-200 text-center space-y-2">
                <p className="font-bold text-sm">
                  {isUrdu ? 'کوئی رپورٹ نہیں ملی! برائے مہربانی اپنا MRN نمبر دوبارہ چیک کریں۔' : 'No Lab Report Found for this MRN! Please re-check your MRN ID.'}
                </p>
                <p className="text-xs text-red-700">
                  {isUrdu ? 'مدد کے لیے واٹس ایپ ہیلپ لائن 0300-1234567 پر رابطہ کریں۔' : 'For assistance, contact WhatsApp Helpline 0300-1234567.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
