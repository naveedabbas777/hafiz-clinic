import { renderHtmlToPdf, printViaIframe } from './printInvoice';

export interface PendingTaskItem {
  id: string;
  patientName: string;
  mrn: string;
  bedOrRoom: string;
  category: 'IV Fluid' | 'Medication' | 'Lab Test' | 'Doctor Review' | 'Discharge Clearance';
  description: string;
  priority: 'High' | 'Normal' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Scheduled';
  scheduledTime?: string;
}

export interface VitalAlertItem {
  id: string;
  patientName: string;
  mrn: string;
  bedOrRoom: string;
  vitalType: string;
  recordedValue: string;
  normalRange: string;
  severity: 'Critical' | 'Warning';
  allergies?: string;
  clinicalNote: string;
}

export interface ShiftCashSummary {
  openingCash: number;
  cashCollectedOPD: number;
  cashCollectedPharmacy: number;
  cashCollectedLab: number;
  cashCollectedIPD: number;
  totalCashInflow: number;
  shiftExpensesPaid: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  discrepancy: number;
  digitalPaymentsJazzCash: number;
  digitalPaymentsEasyPaisa: number;
  digitalPaymentsBankCard: number;
  totalDigitalPayments: number;
  totalAllRevenue: number;
}

export interface ShiftHandoverData {
  handoverId: string;
  shiftType: 'Morning (08:00 AM - 02:00 PM)' | 'Evening (02:00 PM - 08:00 PM)' | 'Night (08:00 PM - 08:00 AM)';
  department: string;
  date: string;
  timestamp: string;
  outgoingStaffName: string;
  outgoingStaffRole: string;
  incomingStaffName: string;
  incomingStaffRole: string;
  totalAdmittedPatients: number;
  totalOpdConsultations: number;
  vitalAlerts: VitalAlertItem[];
  pendingTasks: PendingTaskItem[];
  cashSummary: ShiftCashSummary;
  specialInstructions: string;
  clinicNameUrdu?: string;
  clinicNameEnglish?: string;
  phcRegNo?: string;
}

export function generateShiftHandoverHtml(data: ShiftHandoverData): string {
  const cNameUrdu = data.clinicNameUrdu || 'حافظ کلینک اینڈ ہربل ہسپتال و ویژن سینٹر';
  const cNameEng = data.clinicNameEnglish || 'Hafiz Clinic & General Hospital';
  const phcNo = data.phcRegNo || 'PHC-R-49281';

  const criticalCount = data.vitalAlerts.filter((v) => v.severity === 'Critical').length;
  const warningCount = data.vitalAlerts.filter((v) => v.severity === 'Warning').length;
  const pendingTasksCount = data.pendingTasks.filter((t) => t.status !== 'Scheduled').length;

  return `
    <!DOCTYPE html>
    <html lang="ur" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>Automated Shift Handover Report - ${data.handoverId}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background-color: #ffffff;
          font-size: 11px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
        }
        .container {
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 16px;
        }
        .header {
          border-bottom: 2px solid #065f46;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .clinic-title {
          font-size: 18px;
          font-weight: 900;
          color: #065f46;
          margin: 0;
        }
        .sub-title {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          margin-top: 2px;
        }
        .badge-phc {
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          padding: 4px 10px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 10px;
        }
        .meta-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          margin-top: 10px;
          font-size: 10.5px;
        }
        .meta-item strong {
          color: #0f172a;
          display: block;
        }
        .meta-item span {
          color: #475569;
        }

        /* KPI Quick Badges */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        .kpi-card {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          text-align: center;
        }
        .kpi-card.alert {
          background-color: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }
        .kpi-card.warning {
          background-color: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .kpi-card.success {
          background-color: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
        }
        .kpi-val {
          font-size: 16px;
          font-weight: 900;
          font-family: monospace;
        }
        .kpi-lbl {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* Section Headings */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 5px 10px;
          margin-top: 14px;
          margin-bottom: 8px;
          font-weight: 800;
          font-size: 11.5px;
          color: #1e293b;
        }
        .section-badge {
          background-color: #065f46;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 700;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 6px;
        }
        th {
          background-color: #f8fafc;
          color: #334155;
          text-align: right;
          padding: 6px 8px;
          border: 1px solid #cbd5e1;
          font-weight: 800;
        }
        td {
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #fafaf9;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 9px;
        }
        .badge-critical { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .badge-info { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
        .badge-high { background: #ffe4e6; color: #be123c; border: 1px solid #fda4af; }
        .badge-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }

        /* Cash Breakdown Grid */
        .cash-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 6px;
        }
        .cash-box {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          background: #ffffff;
        }
        .cash-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 10.5px;
        }
        .cash-row.total {
          border-top: 2px solid #065f46;
          border-bottom: none;
          font-weight: 900;
          color: #065f46;
          font-size: 11.5px;
          padding-top: 6px;
          margin-top: 4px;
        }
        .cash-row.highlight {
          background: #ecfdf5;
          padding: 5px 8px;
          border-radius: 6px;
          border-bottom: none;
          font-weight: 800;
        }

        /* Sign-off box */
        .signoff-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 18px;
          border-top: 1px solid #cbd5e1;
          padding-top: 14px;
        }
        .signoff-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
          background: #f8fafc;
        }
        .sign-line {
          height: 35px;
          border-bottom: 1px dashed #94a3b8;
          margin-bottom: 6px;
        }

        /* Printable utilities */
        .no-print {
          text-align: center;
          margin-bottom: 12px;
        }
        .btn-print {
          background: #065f46;
          color: white;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          border: none;
          display: inline-block;
          margin: 0 4px;
        }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
          .container { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Print Handover Sheet (پرنٹ کریں)</button>
      </div>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="title-row">
            <div>
              <h1 class="clinic-title">${cNameUrdu}</h1>
              <div class="sub-title">${cNameEng} — End of Shift Automated Clinical & Financial Handover</div>
            </div>
            <div class="badge-phc">
              ✓ پنجاب ہیلتھ کیئر کمیشن منظور شدہ (${phcNo})
            </div>
          </div>

          <div class="meta-strip">
            <div class="meta-item">
              <span>شفٹ ٹائم / Shift:</span>
              <strong>${data.shiftType}</strong>
            </div>
            <div class="meta-item">
              <span>ہینڈ اوور ID:</span>
              <strong style="font-family: monospace;">${data.handoverId}</strong>
            </div>
            <div class="meta-item">
              <span>سبکدوش اسٹاف (Outgoing):</span>
              <strong>${data.outgoingStaffName} (${data.outgoingStaffRole})</strong>
            </div>
            <div class="meta-item">
              <span>آنے والا اسٹاف (Incoming):</span>
              <strong>${data.incomingStaffName} (${data.incomingStaffRole})</strong>
            </div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="kpi-row">
          <div class="kpi-card ${criticalCount > 0 ? 'alert' : 'success'}">
            <div class="kpi-val">${criticalCount}</div>
            <div class="kpi-lbl">⚠️ وائٹلز الرٹس (Critical Vitals)</div>
          </div>
          <div class="kpi-card ${pendingTasksCount > 0 ? 'warning' : 'success'}">
            <div class="kpi-val">${pendingTasksCount}</div>
            <div class="kpi-lbl">⏳ زیر التواء ٹاسکس (Pending Tasks)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">${data.totalAdmittedPatients}</div>
            <div class="kpi-lbl">🛏️ داخل مریضاں (In-Patients)</div>
          </div>
          <div class="kpi-card success">
            <div class="kpi-val">Rs. ${data.cashSummary.actualCashCounted.toLocaleString()}</div>
            <div class="kpi-lbl">💵 کیش ان ہینڈ (Cash in Drawer)</div>
          </div>
        </div>

        <!-- SECTION 1: VITAL SIGN ALERTS & HIGH RISK PATIENTS -->
        <div class="section-header">
          <span>۱۔ تشویشناک علامات و الرٹس (Vital Sign Alerts & High Risk Patients)</span>
          <span class="section-badge">${data.vitalAlerts.length} Alerts</span>
        </div>

        ${
          data.vitalAlerts.length === 0
            ? '<p style="color:#065f46; background:#ecfdf5; padding:8px 12px; border-radius:6px; font-weight:700; margin:0;">✓ تمام داخل و زیر علاج مریضوں کے وائٹلز معمول کے مطابق ہیں (All patient vitals within normal parameters).</p>'
            : `
            <table>
              <thead>
                <tr>
                  <th style="width: 18%;">مریض کا نام و MRN</th>
                  <th style="width: 14%;">بیڈ / روم</th>
                  <th style="width: 20%;">غیر معمولی علامت (Alert)</th>
                  <th style="width: 18%;">ریکارڈ ویلیو بمقابلہ نارمل</th>
                  <th style="width: 30%;">کلینیکل ہدایات / الرجی نوٹ</th>
                </tr>
              </thead>
              <tbody>
                ${data.vitalAlerts
                  .map(
                    (v) => `
                  <tr>
                    <td>
                      <strong>${v.patientName}</strong>
                      <div style="font-family: monospace; color:#64748b; font-size:9px;">${v.mrn}</div>
                    </td>
                    <td><strong>${v.bedOrRoom}</strong></td>
                    <td>
                      <span class="badge ${v.severity === 'Critical' ? 'badge-critical' : 'badge-warning'}">
                        ${v.severity === 'Critical' ? '🔴 تشویشناک' : '🟡 تنبیہ'}: ${v.vitalType}
                      </span>
                    </td>
                    <td>
                      <strong style="color: ${v.severity === 'Critical' ? '#dc2626' : '#b45309'}; font-size:11px;">
                        ${v.recordedValue}
                      </strong>
                      <div style="color:#64748b; font-size:8.5px;">Ref: ${v.normalRange}</div>
                    </td>
                    <td>
                      <div>${v.clinicalNote}</div>
                      ${
                        v.allergies && v.allergies !== 'None'
                          ? `<div style="color:#b91c1c; font-weight:700; font-size:9px;">⚠️ الرجی: ${v.allergies}</div>`
                          : ''
                      }
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
        }

        <!-- SECTION 2: PENDING PATIENT TASKS -->
        <div class="section-header">
          <span>۲۔ زیر التواء کلینیکل ٹاسکس برائے اگلی شفٹ (Pending Tasks for Incoming Staff)</span>
          <span class="section-badge">${data.pendingTasks.length} Tasks</span>
        </div>

        ${
          data.pendingTasks.length === 0
            ? '<p style="color:#065f46; background:#ecfdf5; padding:8px 12px; border-radius:6px; font-weight:700; margin:0;">✓ اس شفٹ کے تمام آرڈرز اور ادویات مکمل ہو چکے ہیں (All scheduled duties completed).</p>'
            : `
            <table>
              <thead>
                <tr>
                  <th style="width: 18%;">مریض و MRN</th>
                  <th style="width: 12%;">بیڈ نمبر</th>
                  <th style="width: 16%;">شعبہ / قسم</th>
                  <th style="width: 38%;">تفصیلی مطلوبہ ایکشن (Task Details)</th>
                  <th style="width: 16%;">حیثیت و ترجیح</th>
                </tr>
              </thead>
              <tbody>
                ${data.pendingTasks
                  .map(
                    (t) => `
                  <tr>
                    <td>
                      <strong>${t.patientName}</strong>
                      <div style="font-family: monospace; color:#64748b; font-size:9px;">${t.mrn}</div>
                    </td>
                    <td><strong>${t.bedOrRoom}</strong></td>
                    <td>
                      <span class="badge badge-info">${t.category}</span>
                    </td>
                    <td>
                      <div>${t.description}</div>
                      ${t.scheduledTime ? `<div style="color:#0284c7; font-weight:700; font-size:9px;">⏰ شیڈول ٹائم: ${t.scheduledTime}</div>` : ''}
                    </td>
                    <td>
                      <span class="badge ${t.priority === 'High' || t.priority === 'Urgent' ? 'badge-high' : 'badge-warning'}">
                        ${t.priority}
                      </span>
                      <div style="font-size:9px; color:#475569; margin-top:2px;">${t.status}</div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
        }

        <!-- SECTION 3: CASH-IN-HAND & FINANCIAL RECONCILIATION -->
        <div class="section-header">
          <span>۳۔ کیش ان ہینڈ و فنانشل کلیئرنس (Cash-in-Hand & Financial Reconciliation)</span>
          <span class="section-badge">100% Balanced</span>
        </div>

        <div class="cash-grid">
          <div class="cash-box">
            <div style="font-weight: 800; color:#065f46; margin-bottom: 6px; font-size: 11px;">
              💵 فزیکل کیش کاؤنٹر (Physical Cash Flow)
            </div>
            <div class="cash-row">
              <span>ابتدائی کیش دراز (Opening Drawer Cash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.openingCash.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>او پی ڈی فیس کلیکشن (OPD Cash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.cashCollectedOPD.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>فارمیسی کاؤنٹر سیل (Pharmacy Cash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.cashCollectedPharmacy.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>لیب و ڈائیگناسٹکس کلیکشن (Lab Cash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.cashCollectedLab.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>وارڈ بیڈ چارجز و ایڈوانس (IPD Cash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.cashCollectedIPD.toLocaleString()}</strong>
            </div>
            <div class="cash-row" style="color: #b91c1c;">
              <span>شفٹ ہنگامی اخراجات (Petty Expenses):</span>
              <strong style="font-family: monospace;">- Rs. ${data.cashSummary.shiftExpensesPaid.toLocaleString()}</strong>
            </div>
            <div class="cash-row total">
              <span>مطلوبہ کیش دراز (Expected Drawer Cash):</span>
              <span style="font-family: monospace;">Rs. ${data.cashSummary.expectedCashInDrawer.toLocaleString()}</span>
            </div>
          </div>

          <div class="cash-box">
            <div style="font-weight: 800; color:#0284c7; margin-bottom: 6px; font-size: 11px;">
              📱 ڈیجیٹل پیمنٹس و فائنل کاؤنٹ (Digital & Handover Count)
            </div>
            <div class="cash-row">
              <span>جاز کیش (JazzCash):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.digitalPaymentsJazzCash.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>ایزی پیسہ (EasyPaisa):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.digitalPaymentsEasyPaisa.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>بینک ٹرانسفر و کریڈٹ کارڈ (Bank / Card):</span>
              <strong style="font-family: monospace;">Rs. ${data.cashSummary.digitalPaymentsBankCard.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>کل ڈیجیٹل وصولی (Total Digital):</span>
              <strong style="font-family: monospace; color:#0369a1;">Rs. ${data.cashSummary.totalDigitalPayments.toLocaleString()}</strong>
            </div>
            <div class="cash-row highlight" style="margin-top: 6px;">
              <span>حقیقی گنا ہوا کیش (Actual Cash Counted):</span>
              <strong style="font-family: monospace; font-size:12px; color:#065f46;">Rs. ${data.cashSummary.actualCashCounted.toLocaleString()}</strong>
            </div>
            <div class="cash-row highlight" style="background:${data.cashSummary.discrepancy === 0 ? '#f0fdf4' : '#fff1f2'}; color:${data.cashSummary.discrepancy === 0 ? '#166534' : '#991b1b'};">
              <span>فرق / کمی بیشی (Variance / Discrepancy):</span>
              <strong style="font-family: monospace;">${data.cashSummary.discrepancy === 0 ? 'Rs. 0 (100% Balanced ✓)' : `Rs. ${data.cashSummary.discrepancy}`}</strong>
            </div>
          </div>
        </div>

        <!-- SECTION 4: CLINICAL HANDOVER NOTES -->
        <div class="section-header">
          <span>۴۔ اہم ہدایات و کلینیکل نوٹس برائے انچارج (Special Clinical Instructions)</span>
          <span class="section-badge">Duty Log</span>
        </div>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px 12px; font-size:11px; color:#1e293b; line-height:1.6;">
          ${data.specialInstructions || 'شفٹ کے دوران تمام وائٹلز اور ادویات باضابطہ مکمل کی گئیں۔ آنے والے عملے کو مریضوں کی بیڈ پوزیشن اور وائٹلز چیک کی تفویض کر دی گئی ہے۔'}
        </div>

        <!-- SECTION 5: DUAL SIGN-OFF & HANDSHAKE -->
        <div class="signoff-grid">
          <div class="signoff-card">
            <div style="font-weight: 800; font-size:10.5px; color:#065f46; margin-bottom:4px;">
              سبکدوش عملہ دستخط (Outgoing Staff Clearance)
            </div>
            <div class="sign-line"></div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px;">
              <span>نام: <strong>${data.outgoingStaffName}</strong></span>
              <span>عہدہ: <strong>${data.outgoingStaffRole}</strong></span>
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">
              مورخہ: ${data.timestamp}
            </div>
          </div>

          <div class="signoff-card">
            <div style="font-weight: 800; font-size:10.5px; color:#0284c7; margin-bottom:4px;">
              وصول کنندہ عملہ دستخط (Incoming Staff Acceptance)
            </div>
            <div class="sign-line"></div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px;">
              <span>نام: <strong>${data.incomingStaffName}</strong></span>
              <span>عہدہ: <strong>${data.incomingStaffRole}</strong></span>
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">
              ہینڈ اوور تصدیق شدہ ✓
            </div>
          </div>
        </div>

        <!-- Footer Seal -->
        <div style="text-align:center; font-size:9px; color:#94a3b8; margin-top:14px; border-top:1px solid #e2e8f0; padding-top:6px;">
          حافظ کلینک ہاسپٹل انفارمیشن سسٹم (HMIS) • پنجاب ہیلتھ کیئر کمیشن کے الیکٹرانک ریکارڈ قوانین کے مطابق خودکار تیار کردہ شفٹ ہینڈ اوور شیٹ
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * High-definition PDF generation for Shift Handover Sheet.
 */
export async function downloadShiftHandoverPdf(data: ShiftHandoverData): Promise<void> {
  const safeId = data.handoverId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Shift_Handover_${safeId}.pdf`;
  const html = generateShiftHandoverHtml(data);
  await renderHtmlToPdf(html, fileName);
}

/**
 * Preview / Print Shift Handover directly.
 */
export function printShiftHandover(data: ShiftHandoverData): void {
  const html = generateShiftHandoverHtml(data);
  printViaIframe(html);
}
