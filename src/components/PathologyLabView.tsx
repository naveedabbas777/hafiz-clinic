import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle,
  Activity,
  AlertCircle,
  Sparkles,
  User,
  Calendar,
  Save,
  Download,
  X,
  Filter,
  Eye,
  ShieldCheck,
  Check,
  Stethoscope,
  Image as ImageIcon,
  QrCode,
  Sliders,
  Settings,
  Lock,
  LogOut,
} from 'lucide-react';
import { LabTestOrder, LabTestParameter, PredefinedLabTest, StaffUser } from '../types';
import { PREDEFINED_LAB_TESTS, INITIAL_LAB_ORDERS, getLocalLabTests, saveLocalLabTests } from '../data/labCatalogData';
import { INITIAL_STAFF_USERS } from '../data/staffData';

interface Props {
  language: 'urdu' | 'english';
  clinicSettings?: any;
  currentUser?: StaffUser | null;
  onLogin?: (user: StaffUser) => void;
  onLogout?: () => void;
}

export function PathologyLabView({ language, clinicSettings, currentUser, onLogin, onLogout }: Props) {
  const isUrdu = language === 'urdu';

  // Dynamic Catalog of Hospital Tests (localStorage backed)
  const [testCatalog, setTestCatalog] = useState<PredefinedLabTest[]>(() => getLocalLabTests());

  // Lab Orders
  const [labOrders, setLabOrders] = useState<LabTestOrder[]>(() => {
    const saved = localStorage.getItem('hafiz_lab_orders_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_LAB_ORDERS;
  });

  // Department / Category Filter
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAdminTestCatalogModalOpen, setIsAdminTestCatalogModalOpen] = useState(false);

  // New Order Form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | string>(35);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [referredBy, setReferredBy] = useState('Dr. Zeeshan Chaudhry (MBBS)');
  const [selectedPredefinedTest, setSelectedPredefinedTest] = useState<PredefinedLabTest>(testCatalog[0]);

  // Parameters editing on active order
  const [editingParams, setEditingParams] = useState<LabTestParameter[]>([]);
  const [clinicalRemarks, setClinicalRemarks] = useState('');
  const [attachedFilmUrl, setAttachedFilmUrl] = useState<string>('');

  // Admin New Test Creator Form
  const [newTestName, setNewTestName] = useState('');
  const [newTestNameUrdu, setNewTestNameUrdu] = useState('');
  const [newTestCategory, setNewTestCategory] = useState<string>('Radiology / X-Ray');
  const [newTestDepartment, setNewTestDepartment] = useState('Digital Radiology & X-Ray');
  const [newTestPrice, setNewTestPrice] = useState(1500);
  const [newTestSampleType, setNewTestSampleType] = useState('Digital X-Ray Radiograph');
  const [newTestAssignedDoctor, setNewTestAssignedDoctor] = useState('Dr. Tariq Mehmood (Radiologist)');
  const [newTestInstructionsUrdu, setNewTestInstructionsUrdu] = useState('');
  const [newTestParams, setNewTestParams] = useState<LabTestParameter[]>([
    { name: 'Finding / Parameter 1', unit: 'Observation', normalRange: 'Normal / Intact' },
  ]);

  // Role-based Department restriction logic
  const isLabDoctor = currentUser?.role === 'lab_doctor';
  const isAdmin = currentUser?.role === 'admin';

  // Automatically filter if logged in as a specific lab doctor
  useEffect(() => {
    if (isLabDoctor && currentUser?.assignedLabCategory) {
      setSelectedDepartmentFilter(currentUser.assignedLabCategory);
    }
  }, [currentUser]);

  const saveOrdersState = (updated: LabTestOrder[]) => {
    setLabOrders(updated);
    localStorage.setItem('hafiz_lab_orders_v2', JSON.stringify(updated));
  };

  const handleOpenOrderDetails = (order: LabTestOrder) => {
    setSelectedOrder(order);
    setEditingParams(JSON.parse(JSON.stringify(order.parameters)));
    setClinicalRemarks(order.clinicalInterpretationUrdu || '');
    setAttachedFilmUrl(order.fileUrl || '');
  };

  const handleParameterValueChange = (paramIndex: number, val: string) => {
    const updated = [...editingParams];
    const target = updated[paramIndex];
    target.value = val;

    // Check if abnormal numerically
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && target.minNormal !== undefined && target.maxNormal !== undefined) {
      target.isAbnormal = numVal < target.minNormal || numVal > target.maxNormal;
    }
    setEditingParams(updated);
  };

  const handleSaveOrderResults = (finalStatus: 'Processing' | 'Report Ready' | 'Delivered' = 'Report Ready') => {
    if (!selectedOrder) return;
    const approvingDocName =
      currentUser?.role === 'lab_doctor' || currentUser?.role === 'admin'
        ? currentUser.name
        : selectedOrder.approvedByPathologist || 'Dr. Saima Rehman (Pathologist)';

    const updatedOrder: LabTestOrder = {
      ...selectedOrder,
      parameters: editingParams,
      clinicalInterpretationUrdu: clinicalRemarks,
      fileUrl: attachedFilmUrl,
      approvedByPathologist: approvingDocName,
      status: finalStatus,
    };

    const updatedList = labOrders.map((o) => (o.id === selectedOrder.id ? updatedOrder : o));
    saveOrdersState(updatedList);
    setSelectedOrder(updatedOrder);
    alert(isUrdu ? 'لیب ٹیسٹ رپورٹ کے نتائج و تصدیق کامیابی سے محفوظ ہو گئے۔' : 'Lab test report results & sign-off saved successfully.');
  };

  const handleCreateNewOrder = () => {
    if (!patientName.trim()) {
      alert(isUrdu ? 'براہ کرم مریض کا نام درج کریں۔' : 'Please enter patient name.');
      return;
    }

    const orderNum = `LAB-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: LabTestOrder = {
      id: `LAB-ORD-${Date.now()}`,
      orderNumber: orderNum,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '0300-1234567',
      patientAge,
      patientGender,
      referredByDoctor: referredBy,
      testCategory: selectedPredefinedTest.category as any,
      testName: selectedPredefinedTest.name,
      testDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date().toISOString().split('T')[0],
      pricePKR: selectedPredefinedTest.pricePKR,
      paymentStatus: 'Paid',
      status: 'Processing',
      reportedByTechnician: currentUser?.name || 'Lab Technician',
      approvedByPathologist: selectedPredefinedTest.assignedDoctorName || 'Dr. Saima Rehman (Pathologist)',
      parameters: JSON.parse(JSON.stringify(selectedPredefinedTest.parameters)),
      clinicalInterpretationUrdu: 'ٹیسٹ رزلٹ پروسیسنگ کے بعد ڈاکٹر کا تشخیصی تبصرہ درج کیا جائے گا۔',
      createdAt: new Date().toISOString(),
    };

    saveOrdersState([newOrder, ...labOrders]);
    setIsNewOrderModalOpen(false);
    handleOpenOrderDetails(newOrder);
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm(isUrdu ? 'کیا آپ واقعی اس لیب رپورٹ کو ڈیلیٹ کرنا چاہتے ہیں؟' : 'Delete this lab test order?')) {
      const filtered = labOrders.filter((o) => o.id !== id);
      saveOrdersState(filtered);
      if (selectedOrder?.id === id) setSelectedOrder(null);
    }
  };

  // Admin Add New Custom Test to Catalog
  const handleAddNewTestToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestNameUrdu.trim()) {
      alert('برائے مہربانی ٹیسٹ کا نام اردو اور انگریزی دونوں میں درج کریں!');
      return;
    }

    const createdTest: PredefinedLabTest = {
      id: `custom-test-${Date.now()}`,
      name: newTestName.trim(),
      nameUrdu: newTestNameUrdu.trim(),
      category: newTestCategory,
      department: newTestDepartment,
      pricePKR: Number(newTestPrice) || 1000,
      sampleType: newTestSampleType,
      assignedDoctorName: newTestAssignedDoctor,
      assignedDoctorRole: 'lab_doctor',
      instructionsUrdu: newTestInstructionsUrdu || 'معمول کے مطابق تیاری۔',
      parameters: newTestParams,
      isCustomAdded: true,
    };

    const updatedCatalog = [...testCatalog, createdTest];
    setTestCatalog(updatedCatalog);
    saveLocalLabTests(updatedCatalog);
    setIsAdminTestCatalogModalOpen(false);
    alert(`نیا ٹیسٹ "${createdTest.nameUrdu}" کامیابی سے کیٹلاگ میں شامل کر دیا گیا ہے!`);

    // Reset Form
    setNewTestName('');
    setNewTestNameUrdu('');
  };

  const handlePrintLabReport = (order: LabTestOrder) => {
    const cName = clinicSettings?.clinicNameUrdu || 'حافظ کلینک، میڈیکل اینڈ پیتھالوجی لیب';
    const cAddress = clinicSettings?.addressUrdu || 'حافظ آباد روڈ، نزد مین مارکیٹ، پنجاب پاکستان';
    const cPhone = clinicSettings?.phone1 || '0300-1234567';

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Lab Report — ${order.orderNumber} — ${order.patientName}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 13px; }
          .report-box { border: 2px solid #047857; border-radius: 12px; padding: 24px; min-height: 920px; box-sizing: border-box; position: relative; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 14px; }
          .title { font-size: 22px; font-weight: 900; color: #047857; margin: 0; }
          .patient-bar { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #047857; color: white; padding: 8px 10px; font-size: 11px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          .abnormal-val { color: #dc2626; font-weight: 900; background: #fee2e2; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          .remarks-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 16px; }
          .sig-box { text-align: center; width: 220px; }
          .sig-line { border-top: 1.5px solid #000; margin-top: 40px; padding-top: 4px; font-weight: bold; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="report-box">
          <div class="header">
            <div>
              <div class="title">${cName}</div>
              <div style="font-size:12px; color:#475569; margin-top:3px;">Official Diagnostic, X-Ray & Pathology Laboratory</div>
              <div style="font-size:10px; color:#047857; font-weight:bold; margin-top:2px;">Phone: ${cPhone} | ${cAddress}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px; font-weight:bold; color:#0f172a;">REPORT #: ${order.orderNumber}</div>
              <div style="font-size:11px; color:#64748b;">Date: ${order.testDate}</div>
              <div style="font-size:11px; color:#047857; font-weight:bold;">Status: ${order.status}</div>
            </div>
          </div>

          <div class="patient-bar">
            <div><strong>Patient Name:</strong> ${order.patientName}</div>
            <div><strong>Age / Gender:</strong> ${order.patientAge || '—'} Y / ${order.patientGender}</div>
            <div><strong>Phone:</strong> ${order.patientPhone}</div>
            <div><strong>Ref By:</strong> ${order.referredByDoctor}</div>
          </div>

          <div style="font-size: 15px; font-weight: 800; color: #047857; margin-bottom: 10px;">
            🔬 ${order.testName} (${order.testCategory})
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 38%;">Parameter</th>
                <th style="width: 22%;">Observed Value</th>
                <th style="width: 15%;">Unit</th>
                <th style="width: 25%;">Reference Range</th>
              </tr>
            </thead>
            <tbody>
              ${order.parameters
                .map(
                  (p) => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>
                    ${p.isAbnormal ? `<span class="abnormal-val">${p.value || '—'} (High/Low)</span>` : `<strong>${p.value || '—'}</strong>`}
                  </td>
                  <td>${p.unit}</td>
                  <td style="color:#475569;">${p.normalRange}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="remarks-card">
            <strong style="color: #047857;">Clinical Interpretation / Diagnostic Findings:</strong>
            <p style="margin: 6px 0 0 0; line-height: 1.6;">${order.clinicalInterpretationUrdu || 'Findings are consistent with clinical history.'}</p>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-line">Medical Technologist</div>
            </div>
            <div class="sig-box">
              <div class="sig-line">${order.approvedByPathologist || 'Consultant Pathologist'}</div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=1100');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  };

  // Filtered Orders
  const filteredOrders = labOrders.filter((o) => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDepartmentFilter === 'All' ||
      (selectedDepartmentFilter === 'Radiology / X-Ray' && o.testCategory === 'Radiology / X-Ray') ||
      (selectedDepartmentFilter === 'Hematology / CBC' &&
        (o.testCategory === 'Hematology / CBC' ||
          o.testCategory === 'Biochemistry & Diabetes' ||
          o.testCategory === 'Lipid Profile' ||
          o.testCategory === 'Liver LFT' ||
          o.testCategory === 'Renal / Kidney RFT' ||
          o.testCategory === 'Urine & Stool R/E')) ||
      (selectedDepartmentFilter === 'Computerized Eye Scan' && o.testCategory === 'Computerized Eye Scan') ||
      (selectedDepartmentFilter === 'Ultrasound & Imaging' && o.testCategory === 'Ultrasound & Imaging');

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar - Crisp White Theme */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-wrap justify-between items-center gap-4 text-slate-900">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                {isLabDoctor
                  ? `${currentUser.name} — Diagnostic Portal (${currentUser.department || currentUser.assignedLabCategory})`
                  : isUrdu
                  ? 'کمپیوٹرائزڈ تشخیصی و پیتھالوجی لیب پورٹل'
                  : 'Diagnostic & Pathology Laboratory Portal'}
              </h1>
              {isLabDoctor && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                  ASSIGNED SPECIALIST
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentUser
                ? `${isUrdu ? 'لاگ ان بطور:' : 'Logged in as:'} ${currentUser.name} (${currentUser.specialtyTitleUrdu || currentUser.role})`
                : isUrdu
                ? 'تمام تشخیصی شعبہ جات: ایکسرے (X-Ray)، خون و پیتھالوجی (Blood Tests)، اور آئی اسکین (Eye Scan)'
                : 'All diagnostic departments: Digital X-Ray, Blood & Pathology, Ultrasound & Vision Scan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Admin Add New Test to Hospital Catalog */}
          {(isAdmin || !currentUser) && (
            <button
              onClick={() => setIsAdminTestCatalogModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>{isUrdu ? '+ ہسپتال ٹیسٹ مینیجمنٹ' : '+ Manage Test Catalog'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedPredefinedTest(testCatalog[0]);
              setIsNewOrderModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا لیب ٹیسٹ آرڈر (+ New Order)' : '+ New Lab Test Order'}</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setSelectedDepartmentFilter('All')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              selectedDepartmentFilter === 'All'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isUrdu ? 'تمام ٹیسٹ (All Tests)' : 'All Diagnostics'}
          </button>
          <button
            onClick={() => setSelectedDepartmentFilter('Radiology / X-Ray')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDepartmentFilter === 'Radiology / X-Ray'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🩻 {isUrdu ? 'ایکسرے و ریڈیالوجی (X-Ray)' : 'Digital X-Ray'}</span>
          </button>
          <button
            onClick={() => setSelectedDepartmentFilter('Hematology / CBC')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDepartmentFilter === 'Hematology / CBC'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🔬 {isUrdu ? 'خون و پیتھالوجی (Blood & CBC)' : 'Blood & Pathology'}</span>
          </button>
          <button
            onClick={() => setSelectedDepartmentFilter('Computerized Eye Scan')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDepartmentFilter === 'Computerized Eye Scan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>👁️ {isUrdu ? 'آئی و وژن اسکین (Eye Scan)' : 'Vision & Eye Scan'}</span>
          </button>
          <button
            onClick={() => setSelectedDepartmentFilter('Ultrasound & Imaging')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDepartmentFilter === 'Ultrasound & Imaging'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📡 {isUrdu ? 'الٹراساؤنڈ (Ultrasound)' : 'Ultrasound Imaging'}</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'مریض کا نام، ٹیسٹ یا نمبر تلاش کریں...' : 'Search patient, MRN or test...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Grid: Orders List (Left) & Active Report Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? `ٹیسٹ رپورٹس فہرست (${filteredOrders.length})` : `Test Reports Queue (${filteredOrders.length})`}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-xs shadow-2xs">
              {isUrdu ? 'کوئی ٹیسٹ رپورٹ نہیں ملی' : 'No diagnostic reports found matching search criteria.'}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const hasAbnormal = order.parameters.some((p) => p.isAbnormal);

                return (
                  <div
                    key={order.id}
                    onClick={() => handleOpenOrderDetails(order)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-150 bg-white ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          order.status === 'Report Ready' || order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {order.status === 'Report Ready' ? 'Report Ready' : 'In Processing'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 mb-0.5">{order.patientName}</h4>
                    <p className="text-xs text-slate-600 font-semibold mb-2">{order.testName}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Date: {order.testDate}</span>
                      <span>Ref: {order.referredByDoctor}</span>
                      {hasAbnormal && (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Abnormal Values
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Report Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedOrder.patientName}</h2>
                    <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                      {selectedOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test: <strong className="text-slate-900">{selectedOrder.testName}</strong> | Department:{' '}
                    <strong className="text-emerald-800">{selectedOrder.testCategory}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintLabReport(selectedOrder)}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isUrdu ? 'رپورٹ پرنٹ کریں' : 'Print Official Report'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">Patient Phone:</span>
                  <span className="text-slate-900 font-mono font-bold">{selectedOrder.patientPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">Age / Gender:</span>
                  <span className="text-slate-900 font-bold">
                    {selectedOrder.patientAge || '—'} Y ({selectedOrder.patientGender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">Referred By:</span>
                  <span className="text-slate-900 font-bold">{selectedOrder.referredByDoctor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">Billing Status:</span>
                  <span className="text-emerald-800 font-bold">Rs. {selectedOrder.pricePKR} (Paid)</span>
                </div>
              </div>

              {/* Parameter Values Editor Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>Test Parameters & Observed Findings (ٹیسٹ رزلٹس درج کریں)</span>
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3">Parameter Name</th>
                        <th className="p-3 w-40">Observed Value</th>
                        <th className="p-3">Unit</th>
                        <th className="p-3">Reference Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingParams.map((param, index) => (
                        <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-800">{param.name}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={param.value ?? ''}
                              onChange={(e) => handleParameterValueChange(index, e.target.value)}
                              className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                param.isAbnormal
                                  ? 'border-rose-300 text-rose-700 bg-rose-50'
                                  : 'border-slate-300 text-slate-900 bg-slate-50'
                              }`}
                              placeholder="Enter value..."
                            />
                          </td>
                          <td className="p-3 text-slate-600 font-mono">{param.unit}</td>
                          <td className="p-3 text-slate-600">{param.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinical Interpretation & Digital Sign-Off */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {isUrdu
                    ? 'ڈاکٹر کی تشخیصی رائے و تبصرہ (Clinical Interpretation & Radiograph Findings):'
                    : 'Clinical Interpretation / Diagnostic Impression:'}
                </label>
                <textarea
                  rows={3}
                  value={clinicalRemarks}
                  onChange={(e) => setClinicalRemarks(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter clinical notes, radiograph observations, or advice for the treating physician..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-600">
                  {isUrdu ? 'تصدیق کنندہ ڈاکٹر:' : 'Reporting Pathologist:'}{' '}
                  <strong className="text-emerald-800">
                    {currentUser?.name || selectedOrder.approvedByPathologist || 'Dr. Saima Rehman'}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveOrderResults('Processing')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'عارضی محفوظ کریں (Draft)' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => handleSaveOrderResults('Report Ready')}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isUrdu ? 'رپورٹ تصدیق و دستخط (Sign & Ready)' : 'Approve & Mark Ready'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-2xs">
              <Activity className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-700 text-sm font-bold">
                {isUrdu ? 'بائیں جانب سے کسی ٹیسٹ رپورٹ کا انتخاب کریں' : 'Select a test report from the list on the left'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {isUrdu ? 'یا نیا ٹیسٹ آرڈر شامل کریں' : 'or click "+ New Lab Test Order" to create an order'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: NEW LAB TEST ORDER */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-4 sm:p-6 text-slate-900 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isUrdu ? 'نیا تشخیصی / لیب ٹیسٹ بک کریں' : 'Book New Diagnostic / Lab Test'}
              </h3>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Select Diagnostic Test</label>
                <select
                  value={selectedPredefinedTest.id}
                  onChange={(e) => {
                    const found = testCatalog.find((t) => t.id === e.target.value);
                    if (found) setSelectedPredefinedTest(found);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {testCatalog.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.nameUrdu}) — Rs. {t.pricePKR}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Muhammad Usman..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Mobile Phone</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0300-1234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Age (Years)</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Male">Male (مرد)</option>
                    <option value="Female">Female (خاتون)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Test Price</label>
                  <input
                    type="text"
                    disabled
                    value={`Rs. ${selectedPredefinedTest.pricePKR}`}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Referred By Consultant</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewOrder}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Create Order (آرڈر بنائیں)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN TEST CATALOG MANAGER */}
      {isAdminTestCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-slate-900 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hospital Diagnostic Catalog & Doctor Assignment
                </h3>
                <p className="text-xs text-slate-600">
                  {isUrdu ? 'نیا ٹیسٹ شامل کریں اور متعلقہ لیب ڈاکٹر کو تفویض کریں' : 'Add new lab test and assign to responsible diagnostic consultant'}
                </p>
              </div>
              <button onClick={() => setIsAdminTestCatalogModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewTestToCatalog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Test Name (English)</label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    placeholder="e.g. Chest X-Ray Lateral View / Thyroid TSH"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Test Name (Urdu)</label>
                  <input
                    type="text"
                    value={newTestNameUrdu}
                    onChange={(e) => setNewTestNameUrdu(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    placeholder="مثلاً: ایکسرے سائیڈ ویو / تھائیرائیڈ ٹیسٹ"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <select
                    value={newTestCategory}
                    onChange={(e) => {
                      setNewTestCategory(e.target.value);
                      if (e.target.value === 'Radiology / X-Ray') {
                        setNewTestAssignedDoctor('Dr. Tariq Mehmood (Radiologist)');
                        setNewTestDepartment('Digital Radiology & X-Ray');
                      } else if (e.target.value === 'Computerized Eye Scan') {
                        setNewTestAssignedDoctor('Dr. Asim Farooq (Optometrist)');
                        setNewTestDepartment('Eye & Vision Diagnostic Lab');
                      } else if (e.target.value === 'Ultrasound & Imaging') {
                        setNewTestAssignedDoctor('Dr. Farhana Chaudhry (Sonologist)');
                        setNewTestDepartment('Ultrasound & Sonology');
                      } else {
                        setNewTestAssignedDoctor('Dr. Saima Rehman (Pathologist)');
                        setNewTestDepartment('Pathology & Blood Diagnostics');
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Radiology / X-Ray">🩻 Radiology / X-Ray</option>
                    <option value="Hematology / CBC">🔬 Hematology / CBC & Blood</option>
                    <option value="Biochemistry & Diabetes">🩸 Biochemistry & Sugar</option>
                    <option value="Liver LFT">🧪 Liver LFT Profile</option>
                    <option value="Renal / Kidney RFT">🫘 Kidney RFT Profile</option>
                    <option value="Computerized Eye Scan">👁️ Computerized Eye Scan</option>
                    <option value="Ultrasound & Imaging">📡 Ultrasound & Imaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Assigned Specialist Doctor</label>
                  <input
                    type="text"
                    value={newTestAssignedDoctor}
                    onChange={(e) => setNewTestAssignedDoctor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-emerald-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Price (PKR)</label>
                  <input
                    type="number"
                    value={newTestPrice}
                    onChange={(e) => setNewTestPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    placeholder="1500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Sample / Specimen Type</label>
                <input
                  type="text"
                  value={newTestSampleType}
                  onChange={(e) => setNewTestSampleType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  placeholder="Digital X-Ray Radiograph / Whole Blood EDTA / Serum"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 font-bold">Test Parameters List</label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewTestParams([
                        ...newTestParams,
                        { name: `Parameter ${newTestParams.length + 1}`, unit: '', normalRange: 'Normal' },
                      ])
                    }
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Add Parameter
                  </button>
                </div>

                <div className="space-y-2">
                  {newTestParams.map((param, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => {
                          const copy = [...newTestParams];
                          copy[pIdx].name = e.target.value;
                          setNewTestParams(copy);
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                        placeholder="Parameter name..."
                      />
                      <input
                        type="text"
                        value={param.unit}
                        onChange={(e) => {
                          const copy = [...newTestParams];
                          copy[pIdx].unit = e.target.value;
                          setNewTestParams(copy);
                        }}
                        className="w-20 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        placeholder="Unit (g/dL)"
                      />
                      <input
                        type="text"
                        value={param.normalRange}
                        onChange={(e) => {
                          const copy = [...newTestParams];
                          copy[pIdx].normalRange = e.target.value;
                          setNewTestParams(copy);
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        placeholder="Normal Range..."
                      />
                      {newTestParams.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewTestParams(newTestParams.filter((_, idx) => idx !== pIdx))}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminTestCatalogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save to Hospital Catalog (محفوظ کریں)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
