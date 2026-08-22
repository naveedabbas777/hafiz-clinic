import { Prescription } from '../types';

export function printPrescriptionHtml(rx: Prescription, clinicSettings?: any) {
  const cName = clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ ہربل ریسرچ سینٹر';
  const cNameEn = clinicSettings?.clinicNameEnglish || 'Hafiz Clinic & Herbal Research Center';
  const cTagline = clinicSettings?.taglineUrdu || 'قدرتی جڑی بوٹیوں سے مستند و جدید علاج — کمپیوٹرائزڈ آئی سینٹر و فزیوتھراپی';
  const cAddress = clinicSettings?.addressUrdu || 'نزد مین مارکیٹ، حافظ آباد روڈ، لاہور / گوجرانوالہ، پنجاب پاکستان';
  const cPhone = clinicSettings?.phone1 || '0300-1234567';
  const cWhatsApp = clinicSettings?.whatsappNumber || '0300-1234567';
  const cPhc = clinicSettings?.phcApprovalNo || 'PHC-REG-786/2026';

  const html = `
    <!DOCTYPE html>
    <html lang="ur" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>Prescription — ${rx.rxNumber} — ${rx.patientName}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm 15mm; }
        body {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Nastaliq Urdu", sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .rx-container {
          position: relative;
          border: 2px solid #065f46;
          border-radius: 12px;
          padding: 20px 24px;
          min-height: 940px;
          box-sizing: border-box;
        }
        .watermark {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px;
          font-weight: 900;
          color: rgba(6, 95, 70, 0.04);
          text-transform: uppercase;
          pointer-events: none;
          white-space: nowrap;
          z-index: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #065f46;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .clinic-brand h1 {
          margin: 0;
          color: #065f46;
          font-size: 22px;
          font-weight: 800;
        }
        .clinic-brand h2 {
          margin: 2px 0 0 0;
          color: #1e293b;
          font-size: 14px;
          font-weight: 600;
        }
        .clinic-tagline {
          font-size: 11px;
          color: #475569;
          margin-top: 3px;
        }
        .doc-badge {
          text-align: left;
          direction: ltr;
        }
        .doc-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }
        .doc-spec {
          font-size: 12px;
          color: #047857;
          font-weight: bold;
        }
        .doc-qual {
          font-size: 10px;
          color: #64748b;
        }
        
        .patient-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          font-size: 12px;
          margin-bottom: 14px;
        }
        .p-field { display: flex; flex-direction: column; }
        .p-label { font-size: 10px; color: #64748b; font-weight: bold; }
        .p-val { font-weight: 700; color: #0f172a; }

        .vitals-bar {
          display: flex;
          gap: 12px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 11px;
          margin-bottom: 14px;
        }
        .vital-chip { font-weight: bold; color: #334155; }
        .vital-chip span { color: #065f46; font-weight: 800; }

        .diagnosis-box {
          margin-bottom: 14px;
          border-right: 4px solid #047857;
          padding-right: 10px;
        }
        .diag-label { font-size: 11px; font-weight: bold; color: #475569; }
        .diag-text { font-size: 13px; font-weight: 700; color: #1e293b; }

        .rx-symbol {
          font-size: 28px;
          font-weight: 900;
          font-family: serif;
          color: #065f46;
          margin-bottom: 6px;
          direction: ltr;
        }

        .medicines-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .medicines-table th {
          background: #065f46;
          color: #ffffff;
          padding: 8px 10px;
          font-size: 11px;
          text-align: right;
          font-weight: bold;
        }
        .medicines-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .medicines-table tr:nth-child(even) { background: #f8fafc; }
        .med-name { font-weight: bold; color: #0f172a; }
        .med-instructions { font-size: 11px; color: #475569; margin-top: 2px; }

        .advice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
        .advice-card {
          background: #fafaf9;
          border: 1px solid #e7e5e4;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .advice-title { font-size: 11px; font-weight: bold; color: #b45309; margin-bottom: 4px; }
        .advice-content { font-size: 11px; color: #334155; }

        .footer-signatures {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #cbd5e1;
          padding-top: 12px;
        }
        .qr-placeholder {
          text-align: center;
          font-size: 9px;
          color: #64748b;
          border: 1px dashed #94a3b8;
          padding: 6px 10px;
          border-radius: 4px;
        }
        .doc-signature {
          text-align: center;
          min-width: 180px;
        }
        .sig-line {
          border-top: 1.5px solid #0f172a;
          margin-top: 35px;
          padding-top: 4px;
          font-size: 11px;
          font-weight: bold;
        }
        .legal-notice {
          font-size: 9px;
          color: #64748b;
          text-align: center;
          margin-top: 14px;
        }
      </style>
    </head>
    <body>
      <div class="rx-container">
        <div class="watermark">HAFIZ CLINIC Rx</div>

        <!-- Header -->
        <div class="header">
          <div class="clinic-brand">
            <h1>${cName}</h1>
            <h2>${cNameEn}</h2>
            <div class="clinic-tagline">${cTagline}</div>
            <div style="font-size: 10px; color: #047857; margin-top: 3px; font-weight: bold;">
              PHC Reg No: ${cPhc} | رابطہ: ${cPhone} / ${cWhatsApp}
            </div>
          </div>
          <div class="doc-badge">
            <div class="doc-name">${rx.doctorName}</div>
            <div class="doc-spec">${rx.doctorSpecialization || 'ماہر معالج'}</div>
            <div class="doc-qual">${rx.doctorQualification || 'MD / BEMS (Consultant)'}</div>
          </div>
        </div>

        <!-- Patient Demographics -->
        <div class="patient-banner">
          <div class="p-field"><span class="p-label">مریض کا نام:</span><span class="p-val">${rx.patientName}</span></div>
          <div class="p-field"><span class="p-label">عمر / جنس:</span><span class="p-val">${rx.patientAge || '—'} سال / ${rx.patientGender === 'Male' ? 'مرد' : rx.patientGender === 'Female' ? 'خاتون' : '—'}</span></div>
          <div class="p-field"><span class="p-label">نسخہ نمبر / تاریخ:</span><span class="p-val">${rx.rxNumber} | ${rx.date}</span></div>
          <div class="p-field"><span class="p-label">فون / شہر:</span><span class="p-val">${rx.patientPhone} (${rx.patientCity || 'لاہور'})</span></div>
        </div>

        <!-- Vitals -->
        ${rx.vitals ? `
        <div class="vitals-bar">
          ${rx.vitals.bpSystolic ? `<div class="vital-chip">BP: <span>${rx.vitals.bpSystolic}/${rx.vitals.bpDiastolic || 80} mmHg</span></div>` : ''}
          ${rx.vitals.pulse ? `<div class="vital-chip">Pulse: <span>${rx.vitals.pulse} bpm</span></div>` : ''}
          ${rx.vitals.temperature ? `<div class="vital-chip">Temp: <span>${rx.vitals.temperature} °F</span></div>` : ''}
          ${rx.vitals.weightKg ? `<div class="vital-chip">Weight: <span>${rx.vitals.weightKg} kg</span></div>` : ''}
          ${rx.vitals.bloodSugarMgDl ? `<div class="vital-chip">Sugar (${rx.vitals.sugarType || 'R'}): <span>${rx.vitals.bloodSugarMgDl} mg/dL</span></div>` : ''}
          ${rx.vitals.spo2 ? `<div class="vital-chip">SpO2: <span>${rx.vitals.spo2}%</span></div>` : ''}
        </div>` : ''}

        <!-- Complaints & Diagnosis -->
        <div class="diagnosis-box">
          ${rx.presentingComplaintsUrdu ? `<div><span class="diag-label">شکایت مریض:</span> <span style="color:#334155;">${rx.presentingComplaintsUrdu}</span></div>` : ''}
          <div><span class="diag-label">تشخیص (Diagnosis):</span> <span class="diag-text">${rx.clinicalDiagnosisUrdu}</span></div>
        </div>

        <!-- Rx Symbol -->
        <div class="rx-symbol">℞</div>

        <!-- Medicines Table -->
        <table class="medicines-table">
          <thead>
            <tr>
              <th style="width: 32%;">نام دوا (Medicine Name)</th>
              <th style="width: 16%;">قسم و مقدار</th>
              <th style="width: 22%;">اوقات (Frequency)</th>
              <th style="width: 15%;">طریقہ استعمال</th>
              <th style="width: 15%;">مدت (Days)</th>
            </tr>
          </thead>
          <tbody>
            ${rx.medicines.map((m) => `
              <tr>
                <td>
                  <div class="med-name">${m.name}</div>
                  ${m.instructionsUrdu ? `<div class="med-instructions">ہدایت: ${m.instructionsUrdu}</div>` : ''}
                </td>
                <td><strong>${m.dosage}</strong> (${m.form})</td>
                <td><strong>${m.frequency}</strong></td>
                <td>${m.timing}</td>
                <td><strong>${m.durationDays} دن</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Lab Tests & Dietary Advice -->
        <div class="advice-grid">
          <div class="advice-card">
            <div class="advice-title">🔬 تجویز کردہ ٹیسٹ و معائنے (Lab Investigations)</div>
            <div class="advice-content">
              ${rx.advisedTests && rx.advisedTests.length > 0 ? rx.advisedTests.map(t => `• ${t}`).join('<br/>') : 'کوئی خاص ٹیسٹ درکار نہیں۔'}
            </div>
          </div>
          <div class="advice-card">
            <div class="advice-title">🥗 پرہیز، غذا و ہدایات (Diet & Precautions)</div>
            <div class="advice-content">
              ${rx.dietaryAdviceUrdu || 'بادی اور تیز مصالحہ دار کھانوں سے پرہیز کریں۔'}
              ${rx.precautionsUrdu ? `<br/>• ${rx.precautionsUrdu}` : ''}
            </div>
          </div>
        </div>

        ${rx.followUpDate ? `
          <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: #047857;">
            🗓️ اگلی ملاقات / چیک اپ کی تاریخ (Follow-Up): ${rx.followUpDate}
          </div>
        ` : ''}

        <!-- Signatures & Verification -->
        <div class="footer-signatures">
          <div class="qr-placeholder">
            <div style="font-weight: bold; color: #065f46;">VERIFIED DIGITAL Rx</div>
            <div>${rx.rxNumber}</div>
            <div style="font-size: 8px;">Scan to Verify authenticity</div>
          </div>
          <div style="font-size: 10px; color: #64748b;">
            پتہ: ${cAddress}
          </div>
          <div class="doc-signature">
            <div class="sig-line">${rx.doctorName} — دستخط و مہر معالج</div>
          </div>
        </div>

        <div class="legal-notice">
          یہ نسخہ مستند میڈیکل سافٹ ویئر سے جاری شدہ ہے۔ دوا کے استعمال سے قبل معالج کی ہدایات ضرور پڑھیں۔
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
