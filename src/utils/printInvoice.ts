import { MoneySlip } from '../types';

/**
 * Universal PDF Renderer using an isolated DOM context.
 * Bypasses Tailwind CSS v4 `oklch` color parsing limitations by rendering
 * purely formatted HTML in a sandboxed iframe with clean standard colors.
 */
export const renderHtmlToPdf = async (htmlContent: string, fileName: string): Promise<void> => {
  return new Promise((resolve) => {
    // Create isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:0;visibility:hidden;z-index:-9999;'
    );
    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (_) {}
    };

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      cleanup();
      printViaIframe(htmlContent);
      resolve();
      return;
    }

    // Strip out interactive buttons / toolbars before creating PDF
    const cleanHtml = htmlContent
      .replace(/<div class="no-print"[\s\S]*?<\/div>/gi, '')
      .replace(/<div class="toolbar"[\s\S]*?<\/div>/gi, '');

    doc.open();
    doc.write(cleanHtml);
    doc.close();

    setTimeout(async () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document || doc;
        const iframeWin = iframe.contentWindow || window;
        const targetEl =
          iframeDoc.querySelector('.invoice-card') ||
          iframeDoc.querySelector('.container') ||
          iframeDoc.body;

        const [{ jsPDF }, html2canvasModule] = await Promise.all([
          import('jspdf'),
          import('html2canvas'),
        ]);
        const html2canvas = (html2canvasModule as any).default || html2canvasModule;

        const canvas = await html2canvas(targetEl as HTMLElement, {
          window: iframeWin as any,
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 800,
          onclone: (clonedDoc) => {
            // Remove or sanitize any style tags containing modern CSS color functions
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach((s) => {
              if (s.tagName.toLowerCase() === 'style' && s.textContent) {
                if (s.textContent.includes('oklch') || s.textContent.includes('color-mix')) {
                  s.textContent = s.textContent
                    .replace(/oklch\([^)]+\)/g, '#065f46')
                    .replace(/color-mix\([^)]+\)/g, '#0f172a');
                }
              }
            });

            // Sanitize inline styles
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style) {
                const styleStr = htmlEl.getAttribute('style') || '';
                if (styleStr.includes('oklch') || styleStr.includes('color-mix')) {
                  htmlEl.setAttribute(
                    'style',
                    styleStr
                      .replace(/oklch\([^)]+\)/g, '#065f46')
                      .replace(/color-mix\([^)]+\)/g, '#0f172a')
                  );
                }
              }
            });
          },
        } as any);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
        pdf.save(fileName);
        cleanup();
        resolve();
      } catch (err) {
        console.warn('PDF export encountered issue, triggering fallback print dialog:', err);
        cleanup();
        printViaIframe(htmlContent);
        resolve();
      }
    }, 300);
  });
};

/**
 * High quality direct PDF generation & download for invoices.
 */
export const downloadInvoicePdf = async (slip: MoneySlip, _elementId: string = 'printable-invoice'): Promise<void> => {
  const safeName = (slip.patientName || 'Patient').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const slipNo = (slip.slipNo || (slip as any).slipNumber || 'SLIP-1001').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `Invoice_${slipNo}_${safeName}.pdf`;
  const html = generateInvoiceHtml(slip, 'a4');
  await renderHtmlToPdf(html, fileName);
};

/**
 * Generates PDF and opens it in a browser PDF preview/print tab.
 */
export const printInvoicePdf = async (slip: MoneySlip, _elementId: string = 'printable-invoice'): Promise<void> => {
  const html = generateInvoiceHtml(slip, 'a4');
  printViaIframe(html);
};

/**
 * Downloads a doctor prescription directly as a .pdf file.
 */
export const downloadPrescriptionPdf = async (rx: any, _elementId: string = 'printable-prescription'): Promise<void> => {
  const safeName = (rx.patientName || 'Patient').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const rxId = rx.id || 'RX-PRESCRIPTION';
  const fileName = `Prescription_${rxId}_${safeName}.pdf`;
  const html = generatePrescriptionHtml(rx);
  await renderHtmlToPdf(html, fileName);
};

/**
 * Downloads a diagnostic laboratory test report directly as a .pdf file.
 */
export const downloadLabReportPdf = async (report: any, _elementId: string = 'printable-lab-report'): Promise<void> => {
  const safeName = (report.patientName || 'Patient').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const mrn = (report.mrn || 'LAB-REPORT').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `LabReport_${mrn}_${safeName}.pdf`;
  const html = generateLabReportHtml(report);
  await renderHtmlToPdf(html, fileName);
};

/**
 * Executes high-reliability printing using an isolated hidden iframe.
 */
export const printViaIframe = (htmlContent: string) => {
  try {
    const oldIframe = document.getElementById('hafiz-print-frame');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'hafiz-print-frame';
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed, falling back to Blob tab:', e);
          openBlobWindow(htmlContent);
        }
      }, 350);
    } else {
      openBlobWindow(htmlContent);
    }
  } catch (err) {
    console.error('Print frame error:', err);
    openBlobWindow(htmlContent);
  }
};

/**
 * Opens a pristine standalone print tab with pre-configured print triggers and toolbar.
 */
export const openBlobWindow = (htmlContent: string) => {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printTab = window.open(url, '_blank');
    if (!printTab) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 5000);
    }
  } catch (err) {
    console.error('Blob URL creation error:', err);
    window.print();
  }
};

/**
 * Generates structured HTML for an official medical invoice/slip.
 */
export const generateInvoiceHtml = (slip: MoneySlip, format: 'a4' | 'thermal' = 'a4'): string => {
  const slipNo = slip.slipNo || (slip as any).slipNumber || 'SLIP-0001';
  const mrn = slip.mrnNumber || 'MRN-REG';
  const tokenNum = slip.tokenNumber || (slip as any).token || (slip.appointmentId && slip.appointmentId.startsWith('APP-') ? slip.appointmentId.replace('APP-', 'TK-') : (slip.slipNo ? `TK-${slip.slipNo.replace(/\D/g, '') || '101'}` : 'TK-101'));
  const formattedDate = slip.date || new Date().toISOString().split('T')[0];
  const items = slip.items || [];

  const subtotal = slip.subtotal ?? items.reduce((acc, item) => acc + (item.totalPrice || (item.unitPrice * item.quantity)), 0);
  const discount = slip.discount ?? (slip as any).discountAmount ?? 0;
  const total = slip.totalAmount ?? Math.max(0, subtotal - discount);
  const paid = slip.paidAmount ?? 0;
  const balance = slip.balanceAmount ?? Math.max(0, total - paid);

  if (format === 'thermal') {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${slipNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; width: 78mm; padding: 6mm 4mm; color: #000; font-size: 11px; }
    .no-print { display: flex; gap: 6px; margin-bottom: 12px; }
    .no-print button { padding: 6px 12px; font-weight: bold; background: #065f46; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; }
    .center { text-align: center; }
    .title { font-size: 15px; font-weight: 900; margin-bottom: 2px; }
    .subtitle { font-size: 10px; font-weight: bold; margin-bottom: 4px; }
    .token-box {
      border: 2px solid #000;
      border-radius: 6px;
      padding: 6px 4px;
      margin: 6px 0;
      text-align: center;
      background: #f8fafc;
    }
    .token-label { font-size: 10px; font-weight: bold; }
    .token-number { font-size: 17px; font-weight: 900; font-family: monospace; letter-spacing: 1px; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
    .bold { font-weight: bold; }
    .mono { font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10px; }
    th { border-bottom: 1px solid #000; padding: 3px 0; text-align: right; font-weight: bold; }
    td { padding: 3px 0; border-bottom: 1px dotted #ccc; }
    @media print {
      .no-print { display: none !important; }
      body { width: 100%; padding: 0; }
      @page { size: 80mm auto; margin: 2mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ پرنٹ کریں (Print)</button>
    <button onclick="window.close()" style="background:#475569;">بند کریں (Close)</button>
  </div>
  <div class="center">
    <div class="title">حافظ کلینک اینڈ میڈیکل سینٹر</div>
    <div class="subtitle">Hafiz Clinic & Vision Center</div>
    <div style="font-size: 9px;">PHC Reg: 84920 | فون: 0300-1234567</div>
  </div>
  <div class="token-box">
    <div class="token-label">مریض کا مستقل ٹوکن نمبر (PATIENT TOKEN)</div>
    <div class="token-number">🎫 ${tokenNum}</div>
  </div>
  <div class="divider"></div>
  <div class="row"><span class="bold">رسید نمبر:</span><span class="mono bold">${slipNo}</span></div>
  <div class="row"><span>تاریخ:</span><span class="mono">${formattedDate}</span></div>
  <div class="row"><span>MRN:</span><span class="mono">${mrn}</span></div>
  <div class="row"><span class="bold">مریض:</span><span class="bold">${slip.patientName}</span></div>
  <div class="row"><span>فون:</span><span class="mono">${slip.patientPhone || '—'}</span></div>
  <div class="row"><span>معالج:</span><span>${slip.doctorName}</span></div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>تفصیل خدمت / شعبہ</th>
        <th style="text-align:center;">تعداد</th>
        <th style="text-align:left;">رقم</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (it) => `
        <tr>
          <td>
            <div>${it.description}</div>
            ${(it.department || it.servedBy) ? `<div style="font-size:8px;color:#475569;">${[it.department, it.servedBy].filter(Boolean).join(' • ')}</div>` : ''}
          </td>
          <td style="text-align:center;" class="mono">${it.quantity}</td>
          <td style="text-align:left;" class="mono bold">Rs.${(it.totalPrice || (it.unitPrice * it.quantity)).toLocaleString()}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  <div class="divider"></div>
  <div class="row"><span>ٹوٹل بل:</span><span class="mono">Rs. ${subtotal.toLocaleString()}</span></div>
  ${discount > 0 ? `<div class="row"><span>رعایت:</span><span class="mono">-Rs. ${discount.toLocaleString()}</span></div>` : ''}
  <div class="row bold" style="font-size:12px;"><span>کل واجب الادا:</span><span class="mono">Rs. ${total.toLocaleString()}</span></div>
  <div class="row bold"><span>ادا شدہ:</span><span class="mono">Rs. ${paid.toLocaleString()}</span></div>
  ${balance > 0 ? `<div class="row bold" style="color:#b91c1c;"><span>بقایا رقم:</span><span class="mono">Rs. ${balance.toLocaleString()}</span></div>` : ''}
  <div class="row bold" style="font-size:11px; margin-top:2px;">
    <span>حالت ادائیگی:</span>
    <span class="mono">${balance === 0 ? '✓ PAID (مکمل ادا شدہ)' : '⏳ BALANCE DUE (بقایا)'}</span>
  </div>
  <div class="divider"></div>
  ${slip.notes ? `<div style="font-size:9px; margin-bottom:6px;"><strong>نوٹ:</strong> ${slip.notes}</div>` : ''}
  <div class="center" style="font-size:9px; margin-top:6px;">
    <div>کمپیوٹرائزڈ کیش سلپ - حافظ کلینک</div>
    <div>تمام سروسز، ادویات اور ٹیسٹ اسی ٹوکن میں شامل ہیں</div>
    <div>صحت و تندرستی کی دعا گو ٹیم</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.focus(); window.print(); }, 300);
    };
  </script>
</body>
</html>
    `;
  }

  // Standard A4 Layout
  return `
<!DOCTYPE html>
<html dir="ltr" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${slipNo} - Hafiz Clinic</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 24px;
      font-size: 13px;
    }
    .toolbar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #022c22;
      padding: 12px 18px;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }
    .toolbar-title {
      color: #fef08a;
      font-weight: 800;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary { background: #10b981; color: #022c22; }
    .btn-primary:hover { background: #34d399; }
    .btn-secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; }
    
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #065f46;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .brand-title-ur {
      font-family: 'Noto Nastaliq Urdu', serif;
      font-size: 22px;
      font-weight: bold;
      color: #022c22;
      line-height: 1.8;
    }
    .brand-title-en {
      font-size: 16px;
      font-weight: 900;
      color: #065f46;
      letter-spacing: -0.5px;
    }
    .brand-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .slip-badge-box {
      text-align: right;
    }
    .slip-badge {
      background: #022c22;
      color: #fef08a;
      font-family: monospace;
      font-weight: 900;
      font-size: 14px;
      padding: 6px 14px;
      border-radius: 8px;
      display: inline-block;
      letter-spacing: 0.5px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
    }
    .status-paid { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .status-unpaid { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .grid-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 2px;
    }
    .grid-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .grid-val-mono { font-family: monospace; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 11px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .table-totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-box {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 12px;
    }
    .totals-row-net {
      border-top: 2px solid #cbd5e1;
      margin-top: 6px;
      padding-top: 8px;
      font-size: 15px;
      font-weight: 900;
      color: #022c22;
    }
    .totals-row-bal {
      border-top: 1px dashed #fca5a5;
      margin-top: 6px;
      padding-top: 6px;
      font-weight: 800;
      color: #b91c1c;
    }

    .notes-box {
      background: #fffbeb;
      border: 1px solid #fef08a;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 24px;
      font-size: 12px;
      color: #92400e;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-stamp {
      text-align: center;
      width: 220px;
    }
    .footer-sign-line {
      border-bottom: 1px solid #64748b;
      font-family: serif;
      font-weight: bold;
      font-style: italic;
      padding-bottom: 4px;
      color: #022c22;
      font-size: 14px;
    }

    @media print {
      body { background: #ffffff; padding: 0; margin: 0; }
      .toolbar { display: none !important; }
      .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>🏥 حافظ کلینک - پرنٹ کنٹرول</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ پرنٹ سلپ (Print / PDF)
      </button>
      <button class="btn btn-secondary" onclick="window.close()">
        ✕ بند کریں (Close)
      </button>
    </div>
  </div>

  <div class="invoice-card" id="printable-invoice">
    <div class="header">
      <div>
        <div class="brand-title-ur">حافظ کلینک اینڈ پیتھالوجی لیبارٹری</div>
        <div class="brand-title-en">Hafiz Clinic & Vision Center</div>
        <div class="brand-meta">پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC-REG-84920 | ہیلپ لائن: 0300-1234567</div>
        <div class="brand-meta">مین جی ٹی روڈ / ستیانہ روڈ، بالمقابل سٹی ہسپتال، پاکستان</div>
      </div>
      <div class="slip-badge-box">
        <div class="slip-badge">${slipNo}</div>
        <div style="font-size: 13px; color: #022c22; margin-top: 6px; font-weight: 900; background: #fef08a; padding: 3px 8px; border-radius: 6px; border: 1px solid #facc15;">
          🎫 ٹوکن #${tokenNum}
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: bold;">تاریخ: ${formattedDate}</div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">MRN: ${mrn}</div>
        <div class="status-badge ${balance === 0 ? 'status-paid' : 'status-unpaid'}">
          ${balance === 0 ? '✓ PAID RECEIPT (مکمل ادا شدہ)' : '⏳ BALANCE DUE (بقایا رقم)'}
        </div>
      </div>
    </div>

    <div class="patient-grid">
      <div>
        <div class="grid-label">مریض کا نام (Patient)</div>
        <div class="grid-val">${slip.patientName}</div>
      </div>
      <div>
        <div class="grid-label">موبائل فون (Phone)</div>
        <div class="grid-val grid-val-mono">${slip.patientPhone || '—'}</div>
      </div>
      <div>
        <div class="grid-label">معالج ڈاکٹر (Attending Doctor)</div>
        <div class="grid-val" style="color: #065f46;">${slip.doctorName}</div>
      </div>
      <div>
        <div class="grid-label">مستقل ٹوکن و ادائیگی (Token / Mode)</div>
        <div class="grid-val font-mono" style="color: #065f46;">Token #${tokenNum} • ${slip.paymentMethod || 'Cash'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>تفصیل سروس / دوائی / ٹیسٹ (Description)</th>
          <th>کیٹیگری و شعبہ (Dept)</th>
          <th style="text-align: center; width: 60px;">تعداد</th>
          <th style="text-align: right; width: 110px;">نرخ (Rate)</th>
          <th style="text-align: right; width: 120px;">کل رقم (Amount)</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item, index) => `
          <tr>
            <td style="font-family: monospace; color: #64748b;">${index + 1}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${item.description}</div>
              ${(item.department || item.servedBy) ? `<div style="font-size: 10px; color: #047857; margin-top: 2px;">🏢 ${[item.department, item.servedBy].filter(Boolean).join(' • ')}</div>` : ''}
            </td>
            <td style="color: #475569; font-size: 11px;">${item.category}</td>
            <td style="text-align: center; font-family: monospace; font-weight: 700;">${item.quantity}</td>
            <td style="text-align: right; font-family: monospace;">Rs. ${(item.unitPrice ?? 0).toLocaleString()}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">
              Rs. ${(item.totalPrice ?? (item.unitPrice * item.quantity)).toLocaleString()}
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="table-totals-wrapper">
      <div class="totals-box">
        <div class="totals-row">
          <span style="color: #64748b;">ذیلی ٹوٹل (Subtotal):</span>
          <span style="font-family: monospace; font-weight: 700;">Rs. ${subtotal.toLocaleString()}</span>
        </div>
        ${
          discount > 0
            ? `<div class="totals-row" style="color: #065f46;">
                <span>رعایت (Discount):</span>
                <span style="font-family: monospace; font-weight: 700;">- Rs. ${discount.toLocaleString()}</span>
              </div>`
            : ''
        }
        <div class="totals-row totals-row-net">
          <span>کل واجب الادا (Net Total):</span>
          <span style="font-family: monospace;">Rs. ${total.toLocaleString()}</span>
        </div>
        <div class="totals-row" style="color: #065f46; font-weight: 700;">
          <span>وصول شدہ رقم (Paid Amount):</span>
          <span style="font-family: monospace;">Rs. ${paid.toLocaleString()}</span>
        </div>
        ${
          balance > 0
            ? `<div class="totals-row totals-row-bal">
                <span>بقایا رقم (Balance Due):</span>
                <span style="font-family: monospace;">Rs. ${balance.toLocaleString()}</span>
              </div>`
            : ''
        }
      </div>
    </div>

    ${
      slip.notes
        ? `<div class="notes-box">
            <strong>ملاحظات و ہدایات:</strong> ${slip.notes}
          </div>`
        : ''
    }

    <div class="footer">
      <div>
        <div style="font-size: 11px; color: #64748b;">کمپیوٹرائزڈ باضابطہ تصدیق شدہ مالیاتی رسید۔</div>
        <div style="font-size: 11px; font-weight: 700; color: #065f46; margin-top: 2px;">Hafiz Clinic Accounts & Billing Department</div>
      </div>
      <div class="footer-stamp">
        <div class="footer-sign-line">Accounts Officer / Cashier</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 3px; font-weight: bold;">دستخط و تصدیقی مہر</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;
};

/**
 * Universal print caller for invoices/slips.
 */
export const printInvoiceHtml = (slip: MoneySlip, options: { format?: 'a4' | 'thermal'; method?: 'iframe' | 'window' } = {}) => {
  const html = generateInvoiceHtml(slip, options.format || 'a4');
  if (options.method === 'window') {
    openBlobWindow(html);
  } else {
    printViaIframe(html);
  }
};

export interface EODAuditData {
  date?: string;
  closingDate?: string;
  cashierName: string;
  openingCash?: number;
  openingCashFloat?: number;
  grossCollections?: number;
  totalGrossInvoiced?: number;
  totalDiscountsGiven?: number;
  totalNetCollections?: number;
  cashCollections: number;
  cardCollections?: number;
  onlineCollections: number;
  expensesTotal?: number;
  totalExpenses?: number;
  cashExpenses?: number;
  onlineExpenses?: number;
  expectedNetCash?: number;
  expectedCashInDrawer?: number;
  actualPhysicalCash: number;
  variance?: number;
  cashVariance?: number;
  slipsCount?: number;
  totalSlipsCount?: number;
  expensesCount?: number;
  notes?: string;
  paymentBreakdown?: { method: string; count: number; amount: number }[];
  breakdownByCategory?: { category: string; amount: number }[];
  categoryCollections?: { category: string; amount: number }[];
  expensesList?: { voucherNo?: string; title: string; category: string; amount: number; paymentMethod: string }[];
}

export const generateEODAuditHtml = (audit: EODAuditData): string => {
  const displayDate = audit.date || audit.closingDate || new Date().toISOString().split('T')[0];
  const grossVal = audit.grossCollections ?? audit.totalNetCollections ?? audit.totalGrossInvoiced ?? 0;
  const expVal = audit.expensesTotal ?? audit.totalExpenses ?? audit.cashExpenses ?? 0;
  const expectedCash = audit.expectedNetCash ?? audit.expectedCashInDrawer ?? 0;
  const openCash = audit.openingCash ?? audit.openingCashFloat ?? 0;
  const varianceVal = audit.variance ?? audit.cashVariance ?? (audit.actualPhysicalCash - expectedCash);
  const slipsNum = audit.slipsCount ?? audit.totalSlipsCount ?? 0;
  const expNum = audit.expensesCount ?? audit.expensesList?.length ?? 0;

  const paymentBreakdown = audit.paymentBreakdown || [
    { method: 'Cash (کیش دراز)', count: audit.cashCollections > 0 ? 1 : 0, amount: audit.cashCollections || 0 },
    { method: 'Card (بینک کارڈ)', count: (audit.cardCollections || 0) > 0 ? 1 : 0, amount: audit.cardCollections || 0 },
    { method: 'Online / EasyPaisa / JazzCash', count: (audit.onlineCollections || 0) > 0 ? 1 : 0, amount: audit.onlineCollections || 0 },
  ];

  const categoryCollections = audit.categoryCollections || audit.breakdownByCategory || [];

  const breakdownRows = paymentBreakdown
    .map(
      (b) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${b.method}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${b.count} رسیدیں</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">Rs. ${b.amount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const catRows = categoryCollections
    .map(
      (c) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${c.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #065f46;">Rs. ${c.amount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>EOD Cashier Register Audit - ${displayDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #fff; color: #0f172a; padding: 30px; font-size: 13px; }
    .no-print { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; }
    .no-print button { background: #065f46; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .container { max-width: 800px; margin: 0 auto; border: 2px solid #065f46; border-radius: 16px; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 14px; margin-bottom: 16px; }
    .title { font-size: 24px; font-weight: 900; color: #022c22; }
    .subtitle { font-size: 14px; font-weight: bold; color: #065f46; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
    .card-title { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 4px; }
    .card-val { font-size: 18px; font-weight: 900; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    th { background: #065f46; color: white; padding: 8px; text-align: right; }
    .variance-ok { color: #065f46; }
    .variance-bad { color: #dc2626; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .container { border: none; padding: 0; }
      @page { size: A4 portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ پرنٹ آڈٹ سرٹیفکیٹ</button>
    <button onclick="window.close()" style="background: #334155;">بند کریں</button>
  </div>
  <div class="container">
    <div class="header">
      <div class="title">حافظ کلینک، میڈیکل اینڈ ویژن سنٹر</div>
      <div class="subtitle">روزانہ کیش رجسٹر کلوزنگ و مالیاتی آڈٹ سرٹیفکیٹ (EOD Audit Report)</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-family: monospace;">
        تاریخ: <strong>${displayDate}</strong> | کیشئر: <strong>${audit.cashierName}</strong> | جاری کنندہ: Hafiz Clinic ERP
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">کل وصول شدہ رقم (Gross Inflow)</div>
        <div class="card-val" style="color: #065f46;">Rs. ${grossVal.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">کل رسیدیں: ${slipsNum}</div>
      </div>
      <div class="card">
        <div class="card-title">روزانہ کے اخراجات (Cash Outflow)</div>
        <div class="card-val" style="color: #dc2626;">Rs. ${expVal.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">واؤچرز: ${expNum}</div>
      </div>
      <div class="card" style="background: #f0fdf4; border-color: #86efac;">
        <div class="card-title">متوقع کیش دراز (Expected Drawer)</div>
        <div class="card-val" style="color: #065f46;">Rs. ${expectedCash.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">بشمول اوپننگ کیش: Rs. ${openCash.toLocaleString()}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
      <div>
        <div style="font-weight: bold; margin-bottom: 6px; color: #022c22; font-size: 13px;">ادائیگی ذرائع کا خلاصہ (Payment Channels)</div>
        <table>
          <thead>
            <tr>
              <th>ذریعہ</th>
              <th style="text-align: center;">تعداد</th>
              <th style="text-align: right;">رقم</th>
            </tr>
          </thead>
          <tbody>${breakdownRows}</tbody>
        </table>
      </div>

      <div>
        <div style="font-weight: bold; margin-bottom: 6px; color: #022c22; font-size: 13px;">شعبہ جاتی آمدن (Department Collections)</div>
        <table>
          <thead>
            <tr>
              <th>شعبہ / مد</th>
              <th style="text-align: right;">رقم</th>
            </tr>
          </thead>
          <tbody>${catRows}</tbody>
        </table>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>اصل گنا ہوا کیش (Physical Drawer Count):</strong>
          <span style="font-family: monospace; font-size: 16px; font-weight: bold; margin-right: 8px;">Rs. ${audit.actualPhysicalCash.toLocaleString()}</span>
        </div>
        <div>
          <strong>حساب کا فرق (Variance):</strong>
          <span class="${varianceVal === 0 ? 'variance-ok' : 'variance-bad'}" style="font-family: monospace; font-size: 16px; font-weight: bold; margin-right: 8px;">
            ${varianceVal === 0 ? '0 (برابر / Balanced)' : (varianceVal > 0 ? `+Rs. ${varianceVal.toLocaleString()} (اضافی)` : `-Rs. ${Math.abs(varianceVal).toLocaleString()} (شارٹ)`)}
          </span>
        </div>
      </div>
      ${audit.notes ? `<div style="font-size: 11px; color: #475569; margin-top: 6px;"><strong>آڈٹ ریمارکس:</strong> ${audit.notes}</div>` : ''}
    </div>

    <div class="footer">
      <div style="text-align: center;">
        <div style="font-weight: bold; border-bottom: 1px solid #64748b; width: 180px; padding-bottom: 4px;">${audit.cashierName}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">دستخط ڈیوٹی کیشئر</div>
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold; border-bottom: 1px solid #64748b; width: 180px; padding-bottom: 4px;">ڈاکٹر زیشان چوہدری / ایڈمنسٹریٹر</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">تصدیق برائے میڈیکل ڈائریکٹر</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
  `;
};

export const printEODAuditReport = (audit: EODAuditData) => {
  const html = generateEODAuditHtml(audit);
  printViaIframe(html);
};

export const generatePrescriptionHtml = (rx: {
  id?: string;
  patientName: string;
  doctorName?: string;
  date: string;
  prescriptionText?: string;
  content?: string;
  rxNotes?: string;
  rxPrecautions?: string;
  isUrdu?: boolean;
}): string => {
  const rxId = rx.id || `RX-${Math.floor(1000 + Math.random() * 9000)}`;
  const docName = rx.doctorName || 'ڈاکٹر زیشان چوہدری (MBBS, FCPS)';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${rxId} - ${rx.patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #fff; color: #0f172a; padding: 24px; font-size: 13px; }
    .no-print { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 16px; }
    .no-print button { background: #065f46; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .container { max-width: 750px; margin: 0 auto; border: 2px solid #065f46; border-radius: 16px; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 900; color: #022c22; }
    .doc-sub { font-size: 13px; font-weight: bold; color: #065f46; margin-top: 2px; }
    .patient-bar { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
    .rx-symbol { font-size: 28px; font-weight: 900; font-family: serif; color: #065f46; margin-bottom: 8px; }
    .rx-content { min-height: 180px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; font-weight: 600; color: #0f172a; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
    .adv-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: #065f46; }
    .prec-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-size: 12px; color: #92400e; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 20px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .container { border: none; padding: 0; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ پرنٹ نسخہ (Print Rx)</button>
    <button onclick="window.close()" style="background: #475569;">بند کریں</button>
  </div>
  <div class="container">
    <div class="header">
      <div>
        <div class="title">حافظ کلینک اینڈ میڈیکل سینٹر</div>
        <div class="doc-sub">${docName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC Reg # 84920 | ہیلپ لائن: 0300-1234567</div>
      </div>
      <div style="text-align: left;">
        <div style="background: #065f46; color: #fef08a; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 12px; display: inline-block;">${rxId}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">تاریخ: ${rx.date}</div>
      </div>
    </div>

    <div class="patient-bar">
      <div><strong>مریض کا نام:</strong> ${rx.patientName}</div>
      <div><strong>معائنہ:</strong> جنرل او پی ڈی / کنسلٹیشن</div>
      <div><strong>سٹیٹس:</strong> باضابطہ تصدیق شدہ</div>
    </div>

    <div class="rx-symbol">Rx</div>
    <div class="rx-content">${rx.prescriptionText || rx.content || 'کوئی نسخہ درج نہیں ہے۔'}</div>

    ${rx.rxNotes ? `<div class="adv-box"><strong>طبی ہدایات:</strong> ${rx.rxNotes}</div>` : ''}
    ${rx.rxPrecautions ? `<div class="prec-box"><strong>پرہیز و احتیاط:</strong> ${rx.rxPrecautions}</div>` : ''}

    <div class="footer">
      <div style="font-size: 10px; color: #64748b;">
        <div>کمپیوٹرائزڈ باضابطہ الیکٹرانک نسخہ۔</div>
        <div style="color: #065f46; font-weight: bold; margin-top: 2px;">Hafiz Clinic Telemedicine & Health Care System</div>
      </div>
      <div style="text-align: center;">
        <div style="font-family: serif; font-weight: bold; font-style: italic; border-bottom: 1px solid #64748b; width: 160px; padding-bottom: 4px;">${docName}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">دستخط و تصدیقی مہر معالج</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.focus(); window.print(); }, 350);
    };
  </script>
</body>
</html>
  `;
};

export const printPrescriptionHtml = (rx: any) => {
  const html = generatePrescriptionHtml(rx);
  printViaIframe(html);
};

export const generateLabReportHtml = (report: any): string => {
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8" />
  <title>Lab Report - ${report.mrn || 'Report'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #fff; color: #0f172a; padding: 24px; font-size: 13px; }
    .no-print { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 16px; }
    .no-print button { background: #065f46; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .container { max-width: 750px; margin: 0 auto; border: 2px solid #065f46; border-radius: 16px; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #065f46; color: white; padding: 8px 12px; text-align: left; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .container { border: none; padding: 0; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Print Lab Report</button>
    <button onclick="window.close()" style="background: #475569;">Close</button>
  </div>
  <div class="container">
    <div class="header">
      <div>
        <h2 style="font-size: 20px; font-weight: 900; color: #022c22;">Hafiz Clinical Pathology & Diagnostic Lab</h2>
        <p style="font-size: 12px; color: #065f46; font-weight: bold;">PHC Reg: 84920 | ISO Certified Quality Testing</p>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 900; font-family: monospace; color: #065f46;">${report.mrn || 'MRN-000'}</div>
        <div style="font-size: 11px; color: #64748b;">Date: ${report.reportDate || new Date().toISOString().split('T')[0]}</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; font-size: 12px;">
      <div><strong>Patient:</strong> ${report.patientName}</div>
      <div><strong>Age/Gender:</strong> ${report.ageGender || '—'}</div>
      <div><strong>Referred By:</strong> ${report.doctor || 'Dr. Zeeshan'}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Investigation / Test Name</th>
          <th>Observed Result</th>
          <th>Biological Reference Range</th>
          <th>Status / Clinical Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${(report.tests || []).map((t: any) => `
          <tr>
            <td style="font-weight: bold;">${t.testName}</td>
            <td style="font-family: monospace; font-weight: bold; color: #065f46;">${t.result}</td>
            <td style="color: #64748b;">${t.refRange}</td>
            <td><strong>${t.status}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 16px;">
      <div style="font-size: 10px; color: #64748b;">Verified Electronic Diagnostic Report • Hafiz Clinic</div>
      <div style="text-align: center;">
        <div style="font-weight: bold; border-bottom: 1px solid #64748b; width: 160px; padding-bottom: 4px;">Pathologist / Lab In-charge</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Electronic Signature</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.focus(); window.print(); }, 350);
    };
  </script>
</body>
</html>
  `;
};

export const printLabReportHtml = (report: any) => {
  const html = generateLabReportHtml(report);
  printViaIframe(html);
};
