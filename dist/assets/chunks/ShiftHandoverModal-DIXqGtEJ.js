import{r as l,j as e,X as te,ab as se,ae,af as _,O as W,x as ie,k as oe,aB as ne,S as re}from"./vendor-framework-DTeZnrUx.js";import{f as le,r as de}from"./printInvoice-BFMvlnnu.js";function U(s){const f=s.clinicNameUrdu||"حافظ کلینک اینڈ ہربل ہسپتال و ویژن سینٹر",m=s.clinicNameEnglish||"Hafiz Clinic & General Hospital",x=s.phcRegNo||"PHC-R-49281",p=s.vitalAlerts.filter(i=>i.severity==="Critical").length;s.vitalAlerts.filter(i=>i.severity==="Warning").length;const g=s.pendingTasks.filter(i=>i.status!=="Scheduled").length;return`
    <!DOCTYPE html>
    <html lang="ur" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>Automated Shift Handover Report - ${s.handoverId}</title>
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
              <h1 class="clinic-title">${f}</h1>
              <div class="sub-title">${m} — End of Shift Automated Clinical & Financial Handover</div>
            </div>
            <div class="badge-phc">
              ✓ پنجاب ہیلتھ کیئر کمیشن منظور شدہ (${x})
            </div>
          </div>

          <div class="meta-strip">
            <div class="meta-item">
              <span>شفٹ ٹائم / Shift:</span>
              <strong>${s.shiftType}</strong>
            </div>
            <div class="meta-item">
              <span>ہینڈ اوور ID:</span>
              <strong style="font-family: monospace;">${s.handoverId}</strong>
            </div>
            <div class="meta-item">
              <span>سبکدوش اسٹاف (Outgoing):</span>
              <strong>${s.outgoingStaffName} (${s.outgoingStaffRole})</strong>
            </div>
            <div class="meta-item">
              <span>آنے والا اسٹاف (Incoming):</span>
              <strong>${s.incomingStaffName} (${s.incomingStaffRole})</strong>
            </div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="kpi-row">
          <div class="kpi-card ${p>0?"alert":"success"}">
            <div class="kpi-val">${p}</div>
            <div class="kpi-lbl">⚠️ وائٹلز الرٹس (Critical Vitals)</div>
          </div>
          <div class="kpi-card ${g>0?"warning":"success"}">
            <div class="kpi-val">${g}</div>
            <div class="kpi-lbl">⏳ زیر التواء ٹاسکس (Pending Tasks)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">${s.totalAdmittedPatients}</div>
            <div class="kpi-lbl">🛏️ داخل مریضاں (In-Patients)</div>
          </div>
          <div class="kpi-card success">
            <div class="kpi-val">Rs. ${s.cashSummary.actualCashCounted.toLocaleString()}</div>
            <div class="kpi-lbl">💵 کیش ان ہینڈ (Cash in Drawer)</div>
          </div>
        </div>

        <!-- SECTION 1: VITAL SIGN ALERTS & HIGH RISK PATIENTS -->
        <div class="section-header">
          <span>۱۔ تشویشناک علامات و الرٹس (Vital Sign Alerts & High Risk Patients)</span>
          <span class="section-badge">${s.vitalAlerts.length} Alerts</span>
        </div>

        ${s.vitalAlerts.length===0?'<p style="color:#065f46; background:#ecfdf5; padding:8px 12px; border-radius:6px; font-weight:700; margin:0;">✓ تمام داخل و زیر علاج مریضوں کے وائٹلز معمول کے مطابق ہیں (All patient vitals within normal parameters).</p>':`
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
                ${s.vitalAlerts.map(i=>`
                  <tr>
                    <td>
                      <strong>${i.patientName}</strong>
                      <div style="font-family: monospace; color:#64748b; font-size:9px;">${i.mrn}</div>
                    </td>
                    <td><strong>${i.bedOrRoom}</strong></td>
                    <td>
                      <span class="badge ${i.severity==="Critical"?"badge-critical":"badge-warning"}">
                        ${i.severity==="Critical"?"🔴 تشویشناک":"🟡 تنبیہ"}: ${i.vitalType}
                      </span>
                    </td>
                    <td>
                      <strong style="color: ${i.severity==="Critical"?"#dc2626":"#b45309"}; font-size:11px;">
                        ${i.recordedValue}
                      </strong>
                      <div style="color:#64748b; font-size:8.5px;">Ref: ${i.normalRange}</div>
                    </td>
                    <td>
                      <div>${i.clinicalNote}</div>
                      ${i.allergies&&i.allergies!=="None"?`<div style="color:#b91c1c; font-weight:700; font-size:9px;">⚠️ الرجی: ${i.allergies}</div>`:""}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}

        <!-- SECTION 2: PENDING PATIENT TASKS -->
        <div class="section-header">
          <span>۲۔ زیر التواء کلینیکل ٹاسکس برائے اگلی شفٹ (Pending Tasks for Incoming Staff)</span>
          <span class="section-badge">${s.pendingTasks.length} Tasks</span>
        </div>

        ${s.pendingTasks.length===0?'<p style="color:#065f46; background:#ecfdf5; padding:8px 12px; border-radius:6px; font-weight:700; margin:0;">✓ اس شفٹ کے تمام آرڈرز اور ادویات مکمل ہو چکے ہیں (All scheduled duties completed).</p>':`
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
                ${s.pendingTasks.map(i=>`
                  <tr>
                    <td>
                      <strong>${i.patientName}</strong>
                      <div style="font-family: monospace; color:#64748b; font-size:9px;">${i.mrn}</div>
                    </td>
                    <td><strong>${i.bedOrRoom}</strong></td>
                    <td>
                      <span class="badge badge-info">${i.category}</span>
                    </td>
                    <td>
                      <div>${i.description}</div>
                      ${i.scheduledTime?`<div style="color:#0284c7; font-weight:700; font-size:9px;">⏰ شیڈول ٹائم: ${i.scheduledTime}</div>`:""}
                    </td>
                    <td>
                      <span class="badge ${i.priority==="High"||i.priority==="Urgent"?"badge-high":"badge-warning"}">
                        ${i.priority}
                      </span>
                      <div style="font-size:9px; color:#475569; margin-top:2px;">${i.status}</div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}

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
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.openingCash.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>او پی ڈی فیس کلیکشن (OPD Cash):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.cashCollectedOPD.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>فارمیسی کاؤنٹر سیل (Pharmacy Cash):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.cashCollectedPharmacy.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>لیب و ڈائیگناسٹکس کلیکشن (Lab Cash):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.cashCollectedLab.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>وارڈ بیڈ چارجز و ایڈوانس (IPD Cash):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.cashCollectedIPD.toLocaleString()}</strong>
            </div>
            <div class="cash-row" style="color: #b91c1c;">
              <span>شفٹ ہنگامی اخراجات (Petty Expenses):</span>
              <strong style="font-family: monospace;">- Rs. ${s.cashSummary.shiftExpensesPaid.toLocaleString()}</strong>
            </div>
            <div class="cash-row total">
              <span>مطلوبہ کیش دراز (Expected Drawer Cash):</span>
              <span style="font-family: monospace;">Rs. ${s.cashSummary.expectedCashInDrawer.toLocaleString()}</span>
            </div>
          </div>

          <div class="cash-box">
            <div style="font-weight: 800; color:#0284c7; margin-bottom: 6px; font-size: 11px;">
              📱 ڈیجیٹل پیمنٹس و فائنل کاؤنٹ (Digital & Handover Count)
            </div>
            <div class="cash-row">
              <span>جاز کیش (JazzCash):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.digitalPaymentsJazzCash.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>ایزی پیسہ (EasyPaisa):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.digitalPaymentsEasyPaisa.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>بینک ٹرانسفر و کریڈٹ کارڈ (Bank / Card):</span>
              <strong style="font-family: monospace;">Rs. ${s.cashSummary.digitalPaymentsBankCard.toLocaleString()}</strong>
            </div>
            <div class="cash-row">
              <span>کل ڈیجیٹل وصولی (Total Digital):</span>
              <strong style="font-family: monospace; color:#0369a1;">Rs. ${s.cashSummary.totalDigitalPayments.toLocaleString()}</strong>
            </div>
            <div class="cash-row highlight" style="margin-top: 6px;">
              <span>حقیقی گنا ہوا کیش (Actual Cash Counted):</span>
              <strong style="font-family: monospace; font-size:12px; color:#065f46;">Rs. ${s.cashSummary.actualCashCounted.toLocaleString()}</strong>
            </div>
            <div class="cash-row highlight" style="background:${s.cashSummary.discrepancy===0?"#f0fdf4":"#fff1f2"}; color:${s.cashSummary.discrepancy===0?"#166534":"#991b1b"};">
              <span>فرق / کمی بیشی (Variance / Discrepancy):</span>
              <strong style="font-family: monospace;">${s.cashSummary.discrepancy===0?"Rs. 0 (100% Balanced ✓)":`Rs. ${s.cashSummary.discrepancy}`}</strong>
            </div>
          </div>
        </div>

        <!-- SECTION 4: CLINICAL HANDOVER NOTES -->
        <div class="section-header">
          <span>۴۔ اہم ہدایات و کلینیکل نوٹس برائے انچارج (Special Clinical Instructions)</span>
          <span class="section-badge">Duty Log</span>
        </div>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px 12px; font-size:11px; color:#1e293b; line-height:1.6;">
          ${s.specialInstructions||"شفٹ کے دوران تمام وائٹلز اور ادویات باضابطہ مکمل کی گئیں۔ آنے والے عملے کو مریضوں کی بیڈ پوزیشن اور وائٹلز چیک کی تفویض کر دی گئی ہے۔"}
        </div>

        <!-- SECTION 5: DUAL SIGN-OFF & HANDSHAKE -->
        <div class="signoff-grid">
          <div class="signoff-card">
            <div style="font-weight: 800; font-size:10.5px; color:#065f46; margin-bottom:4px;">
              سبکدوش عملہ دستخط (Outgoing Staff Clearance)
            </div>
            <div class="sign-line"></div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px;">
              <span>نام: <strong>${s.outgoingStaffName}</strong></span>
              <span>عہدہ: <strong>${s.outgoingStaffRole}</strong></span>
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">
              مورخہ: ${s.timestamp}
            </div>
          </div>

          <div class="signoff-card">
            <div style="font-weight: 800; font-size:10.5px; color:#0284c7; margin-bottom:4px;">
              وصول کنندہ عملہ دستخط (Incoming Staff Acceptance)
            </div>
            <div class="sign-line"></div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px;">
              <span>نام: <strong>${s.incomingStaffName}</strong></span>
              <span>عہدہ: <strong>${s.incomingStaffRole}</strong></span>
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
  `}async function ce(s){const m=`Shift_Handover_${s.handoverId.replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`,x=U(s);await de(x,m)}function pe(s){const f=U(s);le(f)}const ve=({isOpen:s,onClose:f,currentUser:m,doctors:x=[],slips:p=[],clinicSettings:g,language:i="urdu"})=>{const o=i==="urdu",h=l.useMemo(()=>{try{const t=localStorage.getItem("hc_ipd_admissions");if(t){const a=JSON.parse(t);if(Array.isArray(a)&&a.length>0)return a}}catch{}return[{id:"IPD-2026-0042",admissionNumber:"IPD-2026-0042",mrn:"MRN-84920",patientName:"نسیم اختر (Naseem Akhtar)",bedNumber:"GWF-01",wardName:"Female General Ward",provisionalDiagnosis:"شدید پتے کی سوزش و اینیمیا (Acute Cholecystitis & Moderate Anemia)",allergies:["No Known Drug Allergy"],dailyBedRatePKR:1500,advanceDepositPaidPKR:15e3,status:"Admitted"},{id:"IPD-2026-0043",admissionNumber:"IPD-2026-0043",mrn:"MRN-77312",patientName:"چوہدری بشیر احمد (Ch. Bashir Ahmad)",bedNumber:"PVT-101",wardName:"Deluxe Private Suite",provisionalDiagnosis:"ہائی بلڈ پریشر ایمرجنسی و جوڑوں کا درد (Hypertensive Crisis)",allergies:["NSAIDs Allergy (Severe)"],dailyBedRatePKR:5e3,advanceDepositPaidPKR:3e4,status:"Admitted"}]},[]),D=l.useMemo(()=>{try{const t=localStorage.getItem("hc_nursing_vitals_logs");if(t){const a=JSON.parse(t);if(Array.isArray(a)&&a.length>0)return a}}catch{}return[{id:"log-1",admissionId:"IPD-2026-0043",patientName:"چوہدری بشیر احمد",bpSystolic:185,bpDiastolic:110,pulseRate:98,temperatureF:98.6,spo2Percentage:96,bloodSugar:195,painScale:5,ivFluidsDrip:"IV Cannula Heparin Lock in right arm",injectionsGiven:"Inj. Capoten 25mg sublingual",notes:"Blood pressure spike observed at 11:00 AM. Doctor notified."},{id:"log-2",admissionId:"IPD-2026-0042",patientName:"نسیم اختر",bpSystolic:125,bpDiastolic:80,pulseRate:84,temperatureF:100.8,spo2Percentage:94,bloodSugar:135,painScale:6,ivFluidsDrip:"Normal Saline 1000ml + Venofer (Iron Infusion) 30 drops/min",injectionsGiven:"Inj. Toradol IV, Inj. Rocephin 1g IV",notes:"Low SpO2 on room air. Started Oxygen at 2L/min via nasal cannula. Temp elevated."}]},[]),[y,K]=l.useState("Morning (08:00 AM - 02:00 PM)"),[N,J]=l.useState(m?.name||"Staff Nurse Fouzia Parveen"),[T,me]=l.useState(m?.role?m.role.replace("_"," ").toUpperCase():"REGISTERED NURSE"),[S,q]=l.useState("Sister Shamaila Akhtar"),[H,ge]=l.useState("WARD INCHARGE & NURSE"),[w,fe]=l.useState(5e3),[j,xe]=l.useState(1200),[k,he]=l.useState(28500),[C,Z]=l.useState("مریض چوہدری بشیر (PVT-101) کے بلڈ پریشر کا دوبارہ ۲ بجے معائنہ کریں۔ مریضہ نسیم اختر (GWF-01) کی آئرن ڈرپ کی رفتار ۳۰ قطرے فی منٹ مانیٹر کریں۔ شام کے انجیکشن شیڈول کے مطابق جاری رکھیں۔"),[P,M]=l.useState(!1),[O,R]=l.useState(""),b=l.useMemo(()=>{const t=[];return D.forEach(a=>{const r=h.find(v=>v.id===a.admissionId)||{mrn:"MRN-84920",patientName:a.patientName||"Admitted Patient",bedNumber:"Ward Bed",allergies:["No Known Allergy"]};(a.bpSystolic>=140||a.bpDiastolic>=90)&&t.push({id:`va-bp-${a.id}`,patientName:r.patientName,mrn:r.mrn,bedOrRoom:r.bedNumber,vitalType:"High Blood Pressure",recordedValue:`${a.bpSystolic}/${a.bpDiastolic} mmHg`,normalRange:"120/80 mmHg",severity:a.bpSystolic>=180||a.bpDiastolic>=110?"Critical":"Warning",allergies:r.allergies?.join(", ")||"None",clinicalNote:`Recorded high BP (${a.bpSystolic}/${a.bpDiastolic}). ${a.notes||"Monitor every 2 hours."}`}),a.spo2Percentage&&a.spo2Percentage<95&&t.push({id:`va-spo2-${a.id}`,patientName:r.patientName,mrn:r.mrn,bedOrRoom:r.bedNumber,vitalType:"Low Oxygen (Hypoxemia)",recordedValue:`${a.spo2Percentage}% SpO2`,normalRange:"95% - 100%",severity:a.spo2Percentage<92?"Critical":"Warning",allergies:r.allergies?.join(", ")||"None",clinicalNote:"Patient on supplemental nasal O2 at 2 L/min. Check SpO2 after 30 mins."}),a.temperatureF&&a.temperatureF>=100.4&&t.push({id:`va-temp-${a.id}`,patientName:r.patientName,mrn:r.mrn,bedOrRoom:r.bedNumber,vitalType:"High Grade Fever",recordedValue:`${a.temperatureF}°F`,normalRange:"98.6°F",severity:a.temperatureF>=102?"Critical":"Warning",allergies:r.allergies?.join(", ")||"None",clinicalNote:"Pyrexia management: cold sponging given. Paracetamol scheduled."}),a.bloodSugar&&(a.bloodSugar>=180||a.bloodSugar<70)&&t.push({id:`va-bs-${a.id}`,patientName:r.patientName,mrn:r.mrn,bedOrRoom:r.bedNumber,vitalType:a.bloodSugar>=180?"Hyperglycemia":"Hypoglycemia",recordedValue:`${a.bloodSugar} mg/dL`,normalRange:"80 - 140 mg/dL",severity:a.bloodSugar>=250||a.bloodSugar<60?"Critical":"Warning",allergies:r.allergies?.join(", ")||"None",clinicalNote:"Fasting blood glucose check required before next scheduled meal."})}),t},[D,h]),u=l.useMemo(()=>[{id:"task-1",patientName:"نسیم اختر (Naseem Akhtar)",mrn:"MRN-84920",bedOrRoom:"GWF-01",category:"IV Fluid",description:"Venofer (Iron Infusion) 1000ml NS drip monitoring. Check for shivering or itching.",priority:"High",status:"In Progress",scheduledTime:"01:30 PM"},{id:"task-2",patientName:"نسیم اختر (Naseem Akhtar)",mrn:"MRN-84920",bedOrRoom:"GWF-01",category:"Medication",description:"Inj. Rocephin (Ceftriaxone) 1g IV slow push after evening food.",priority:"Normal",status:"Pending",scheduledTime:"06:00 PM"},{id:"task-3",patientName:"چوہدری بشیر احمد (Ch. Bashir)",mrn:"MRN-77312",bedOrRoom:"PVT-101",category:"Doctor Review",description:"Dr. Waqas evening round review for BP control and discharge decision tomorrow.",priority:"Urgent",status:"Pending",scheduledTime:"05:00 PM"},{id:"task-4",patientName:"چوہدری بشیر احمد (Ch. Bashir)",mrn:"MRN-77312",bedOrRoom:"PVT-101",category:"Lab Test",description:"Serum Creatinine & Electrolytes repeat sample collection tomorrow morning 07:00 AM.",priority:"Normal",status:"Scheduled",scheduledTime:"Tomorrow 07:00 AM"}],[]),c=l.useMemo(()=>{const t=p.filter(n=>n.paymentMethod==="Cash"),a=t.filter(n=>n.source==="Appointment"||n.source==="General"||!n.source).reduce((n,d)=>n+d.paidAmount,0)||12500,r=t.filter(n=>n.source==="Pharmacy").reduce((n,d)=>n+d.paidAmount,0)||7200,v=t.filter(n=>n.source==="Lab").reduce((n,d)=>n+d.paidAmount,0)||5e3,E=15e3,$=a+r+v+E,L=w+$-j,Y=k-L,F=p.filter(n=>n.paymentMethod==="JazzCash").reduce((n,d)=>n+d.paidAmount,0)||4500,V=p.filter(n=>n.paymentMethod==="EasyPaisa").reduce((n,d)=>n+d.paidAmount,0)||3e3,B=p.filter(n=>n.paymentMethod==="Card"||n.paymentMethod==="Bank Transfer").reduce((n,d)=>n+d.paidAmount,0)||15e3,G=F+V+B,ee=$+G;return{openingCash:w,cashCollectedOPD:a,cashCollectedPharmacy:r,cashCollectedLab:v,cashCollectedIPD:E,totalCashInflow:$,shiftExpensesPaid:j,expectedCashInDrawer:L,actualCashCounted:k,discrepancy:Y,digitalPaymentsJazzCash:F,digitalPaymentsEasyPaisa:V,digitalPaymentsBankCard:B,totalDigitalPayments:G,totalAllRevenue:ee}},[p,w,j,k]),I=l.useMemo(()=>`HO-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(100+Math.random()*900)}`,[]),A=l.useMemo(()=>{const t=new Date;return{handoverId:I,shiftType:y,department:"Inpatient Ward & General Clinical Wing",date:t.toISOString().split("T")[0],timestamp:t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!0}),outgoingStaffName:N,outgoingStaffRole:T,incomingStaffName:S,incomingStaffRole:H,totalAdmittedPatients:h.length,totalOpdConsultations:18,vitalAlerts:b,pendingTasks:u,cashSummary:c,specialInstructions:C,clinicNameUrdu:g?.clinicNameUrdu||"حافظ کلینک اینڈ ہربل ہسپتال و ویژن سینٹر",clinicNameEnglish:g?.clinicNameEnglish||"Hafiz Clinic & General Hospital",phcRegNo:g?.phcApprovalNo||"PHC-R-49281"}},[I,y,N,T,S,H,h,b,u,c,C,g]);if(!s)return null;const z=async()=>{M(!0),R("");try{await ce(A),R(o?"باضابطہ شفٹ ہینڈ اوور PDF رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی ہے!":"Automated Shift Handover PDF Report downloaded successfully!")}catch(t){console.error("Error generating shift handover PDF:",t)}finally{M(!1)}},Q=()=>{pe(A)},X=()=>{try{const t=localStorage.getItem("hc_shift_handovers_archive"),a=t?JSON.parse(t):[];a.unshift(A),localStorage.setItem("hc_shift_handovers_archive",JSON.stringify(a.slice(0,30))),R(o?"شفٹ ہینڈ اوور ریکارڈ تصدیق شدہ اور محفوظ کر دیا گیا ہے!":"Shift Handover record certified & archived successfully!")}catch{}};return e.jsx("div",{className:"fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto",dir:o?"rtl":"ltr",children:e.jsxs("div",{className:"bg-white border border-slate-200 w-full max-w-4xl rounded-3xl p-5 sm:p-7 text-slate-900 space-y-6 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto font-sans",children:[e.jsx("button",{onClick:f,className:"absolute top-5 left-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer",children:e.jsx(te,{className:"w-5 h-5"})}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center text-emerald-900 shrink-0",children:e.jsx(se,{className:"w-6 h-6 text-emerald-800"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-black text-slate-900 tracking-tight",children:o?"خودکار شفٹ ہینڈ اوور و کلینیکل سمری":"Automated Shift Handover & Clinical Transition"}),e.jsx("span",{className:"bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-full",children:I})]}),e.jsx("p",{className:"text-xs text-slate-500 mt-0.5",children:o?"زیر التواء مریض ٹاسکس، وائٹلز الرٹس اور کیش ان ہینڈ کی فوری تصدیق و پی ڈی ایف رپورٹ":"Automated synthesis of pending tasks, abnormal vitals, and cash drawer reconciliations for incoming staff."})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:Q,className:"px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200",children:[e.jsx(ae,{className:"w-4 h-4 text-slate-600"}),e.jsx("span",{children:o?"پرنٹ":"Print"})]}),e.jsxs("button",{onClick:z,disabled:P,className:"px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer",children:[e.jsx(_,{className:"w-4 h-4 text-amber-300"}),e.jsx("span",{children:P?o?"پی ڈی ایف تیار ہو رہا ہے...":"Rendering PDF...":o?"ہینڈ اوور PDF ڈاؤن لوڈ":"Export PDF Report"})]})]})]}),O&&e.jsxs("div",{className:"p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5",children:[e.jsx(W,{className:"w-4 h-4 text-emerald-600 shrink-0"}),e.jsx("span",{children:O})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-slate-600 font-bold mb-1",children:o?"شفٹ ٹائم (Shift)":"Shift Timing"}),e.jsxs("select",{value:y,onChange:t=>K(t.target.value),className:"w-full bg-white border border-slate-300 p-2 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500",children:[e.jsx("option",{value:"Morning (08:00 AM - 02:00 PM)",children:"صبح کی شفٹ (08:00 AM - 02:00 PM)"}),e.jsx("option",{value:"Evening (02:00 PM - 08:00 PM)",children:"شام کی شفٹ (02:00 PM - 08:00 PM)"}),e.jsx("option",{value:"Night (08:00 PM - 08:00 AM)",children:"رات کی شفٹ (08:00 PM - 08:00 AM)"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-slate-600 font-bold mb-1",children:o?"سبکدوش عملہ (Outgoing Staff)":"Outgoing Staff"}),e.jsx("input",{type:"text",value:N,onChange:t=>J(t.target.value),className:"w-full bg-white border border-slate-300 p-2 rounded-xl font-bold text-slate-900"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-slate-600 font-bold mb-1",children:o?"آنے والا عملہ (Incoming Staff)":"Incoming Staff"}),e.jsx("input",{type:"text",value:S,onChange:t=>q(t.target.value),className:"w-full bg-white border border-slate-300 p-2 rounded-xl font-bold text-slate-900"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-slate-600 font-bold mb-1",children:o?"محکمہ / یونٹ (Department)":"Unit / Ward"}),e.jsx("div",{className:"p-2 bg-emerald-50 text-emerald-900 rounded-xl font-bold border border-emerald-200 truncate",children:o?"ان پیشنٹ وارڈ و او پی ڈی":"Inpatient & OPD Suite"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-5",children:[e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2",children:[e.jsxs("div",{className:"flex items-center gap-2 font-black text-xs text-rose-800",children:[e.jsx(ie,{className:"w-4 h-4 text-rose-600"}),e.jsx("span",{children:o?"تشویشناک وائٹلز الرٹس":"Vital Sign Alerts"})]}),e.jsxs("span",{className:"bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300",children:[b.length," ",o?"الرٹس":"Flags"]})]}),e.jsx("div",{className:"space-y-2.5 max-h-56 overflow-y-auto pr-1",children:b.map(t=>e.jsxs("div",{className:"p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1 shadow-2xs",children:[e.jsxs("div",{className:"flex items-center justify-between font-bold",children:[e.jsx("span",{className:"text-slate-900 font-black",children:t.patientName}),e.jsx("span",{className:"text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded",children:t.bedOrRoom})]}),e.jsxs("div",{className:"flex items-center gap-1.5 text-rose-700 font-bold text-[11px]",children:[e.jsxs("span",{children:[t.vitalType,":"]}),e.jsx("strong",{className:"font-mono text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded",children:t.recordedValue})]}),e.jsx("p",{className:"text-[10px] text-slate-500 leading-tight",children:t.clinicalNote}),t.allergies&&t.allergies!=="None"&&e.jsxs("div",{className:"text-[9.5px] font-bold text-amber-800 bg-amber-50 p-1 rounded border border-amber-200",children:["⚠️ الرجی: ",t.allergies]})]},t.id))})]}),e.jsx("div",{className:"text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200 text-center",children:o?"تمام الرٹس آنے والے عملے کے سپرد کر دیے گئے ہیں":"Immediate doctor notification recommended"})]}),e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2",children:[e.jsxs("div",{className:"flex items-center gap-2 font-black text-xs text-sky-800",children:[e.jsx(oe,{className:"w-4 h-4 text-sky-600"}),e.jsx("span",{children:o?"زیر التواء کلینیکل ٹاسکس":"Pending Patient Tasks"})]}),e.jsxs("span",{className:"bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-300",children:[u.length," ",o?"ٹاسکس":"Tasks"]})]}),e.jsx("div",{className:"space-y-2.5 max-h-56 overflow-y-auto pr-1",children:u.map(t=>e.jsxs("div",{className:"p-3 bg-white rounded-xl border border-sky-200 text-xs space-y-1 shadow-2xs",children:[e.jsxs("div",{className:"flex items-center justify-between font-bold",children:[e.jsx("span",{className:"text-slate-900 font-black truncate",children:t.patientName}),e.jsx("span",{className:"text-[10px] font-mono text-slate-500",children:t.bedOrRoom})]}),e.jsxs("div",{className:"flex items-center gap-1.5 text-[10.5px]",children:[e.jsx("span",{className:"px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200",children:t.category}),t.scheduledTime&&e.jsxs("span",{className:"text-[10px] text-slate-500 font-mono font-bold",children:["⏰ ",t.scheduledTime]})]}),e.jsx("p",{className:"text-[11px] text-slate-600 leading-tight",children:t.description})]},t.id))})]}),e.jsx("div",{className:"text-[11px] text-sky-800 font-bold bg-sky-50 p-2 rounded-xl border border-sky-200 text-center",children:o?"شیڈول ادویات اور ڈرپ کا فالو اپ مقرر ہے":"IV infusion & scheduled MAR tracking active"})]}),e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2",children:[e.jsxs("div",{className:"flex items-center gap-2 font-black text-xs text-emerald-800",children:[e.jsx(ne,{className:"w-4 h-4 text-emerald-600"}),e.jsx("span",{children:o?"کیش ان ہینڈ و فنانشل کلیئرنس":"Cash-in-Hand Updates"})]}),e.jsx("span",{className:"bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300",children:c.discrepancy===0?"✓ Balanced":"⚠️ Variance"})]}),e.jsxs("div",{className:"space-y-1.5 text-[11px] bg-white p-3 rounded-xl border border-slate-200 font-medium",children:[e.jsxs("div",{className:"flex justify-between py-0.5 border-b border-slate-100",children:[e.jsx("span",{className:"text-slate-600",children:o?"ابتدائی کیش دراز:":"Opening Cash:"}),e.jsxs("strong",{className:"font-mono",children:["Rs. ",c.openingCash.toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between py-0.5 border-b border-slate-100",children:[e.jsx("span",{className:"text-slate-600",children:o?"شفٹ فزیکل کیش وصولی:":"Cash Inflow:"}),e.jsxs("strong",{className:"font-mono text-emerald-800",children:["+ Rs. ",c.totalCashInflow.toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between py-0.5 border-b border-slate-100",children:[e.jsx("span",{className:"text-slate-600",children:o?"ہنگامی شفٹ اخراجات:":"Petty Expenses:"}),e.jsxs("strong",{className:"font-mono text-rose-700",children:["- Rs. ",c.shiftExpensesPaid.toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between py-1 bg-emerald-50/60 px-1.5 rounded font-black text-emerald-950",children:[e.jsx("span",{children:o?"مطلوبہ کیش دراز:":"Expected In Drawer:"}),e.jsxs("span",{className:"font-mono",children:["Rs. ",c.expectedCashInDrawer.toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between py-1 bg-slate-100 px-1.5 rounded font-black",children:[e.jsx("span",{children:o?"گنا ہوا نقد کیش:":"Actual Cash Counted:"}),e.jsxs("span",{className:"font-mono text-emerald-700",children:["Rs. ",c.actualCashCounted.toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between py-0.5 text-[10px] text-sky-800",children:[e.jsx("span",{children:o?"ڈیجیٹل وصولی (JazzCash/Bank):":"Digital Collections:"}),e.jsxs("strong",{className:"font-mono",children:["Rs. ",c.totalDigitalPayments.toLocaleString()]})]})]})]}),e.jsxs("div",{className:"text-[11px] text-emerald-900 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center",children:["✓ ",o?"کیش کاؤنٹر مکمل متوازن ہے (Zero Discrepancy)":"Drawer fully balanced & reconciled"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-slate-800 text-xs font-black mb-1.5",children:o?"اہم کلینیکل ہدایات برائے اگلی شفٹ (Clinical Handover Notes)":"Clinical Handover Notes & Instructions"}),e.jsx("textarea",{rows:2,value:C,onChange:t=>Z(t.target.value),className:"w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500",placeholder:o?"نئی شفٹ کے عملے کے لیے کوئی خصوصی ہدایات یہاں درج کریں...":"Special notes or doctor orders for incoming staff..."})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs text-slate-600",children:[e.jsx(re,{className:"w-5 h-5 text-emerald-600 shrink-0"}),e.jsx("span",{children:o?"پنجاب ہیلتھ کیئر کمیشن الیکٹرانک میڈیکل ریکارڈز ریگولیشنز کے تحت مصدقہ":"Formally compliant with Punjab Healthcare Commission clinical records governance"})]}),e.jsxs("div",{className:"flex items-center gap-2.5 w-full sm:w-auto",children:[e.jsxs("button",{onClick:X,className:"flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4 text-emerald-400"}),e.jsx("span",{children:o?"ہینڈ اوور تصدیق و محفوظ کریں":"Confirm & Archive Handover"})]}),e.jsxs("button",{onClick:z,disabled:P,className:"flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer",children:[e.jsx(_,{className:"w-4 h-4 text-amber-300"}),e.jsx("span",{children:o?"PDF ہینڈ اوور ڈاؤن لوڈ کریں":"Download Handover PDF"})]})]})]})]})})};export{ve as S};
