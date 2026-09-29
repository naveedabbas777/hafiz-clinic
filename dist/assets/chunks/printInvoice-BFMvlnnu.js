import{_ as z}from"./vendor-pdf-CshCadcp.js";const w=async(t,e)=>new Promise(o=>{const n=document.createElement("iframe");n.setAttribute("style","position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:0;visibility:hidden;z-index:-9999;"),document.body.appendChild(n);const a=()=>{try{n&&n.parentNode&&n.parentNode.removeChild(n)}catch{}},s=n.contentWindow?.document||n.contentDocument;if(!s){a(),x(t),o();return}const p=t.replace(/<div class="no-print"[\s\S]*?<\/div>/gi,"").replace(/<div class="toolbar"[\s\S]*?<\/div>/gi,"");s.open(),s.write(p),s.close(),setTimeout(async()=>{try{const r=n.contentDocument||n.contentWindow?.document||s,c=n.contentWindow||window,g=r.querySelector(".invoice-card")||r.querySelector(".container")||r.body,[{jsPDF:b},l]=await Promise.all([z(()=>import("./vendor-pdf-CshCadcp.js").then(m=>m.j),[]),z(()=>import("./vendor-pdf-CshCadcp.js").then(m=>m.h),[])]),d=await(l.default||l)(g,{window:c,scale:2,useCORS:!0,logging:!1,backgroundColor:"#ffffff",windowWidth:800,onclone:m=>{m.querySelectorAll('style, link[rel="stylesheet"]').forEach(f=>{f.tagName.toLowerCase()==="style"&&f.textContent&&(f.textContent.includes("oklch")||f.textContent.includes("color-mix"))&&(f.textContent=f.textContent.replace(/oklch\([^)]+\)/g,"#065f46").replace(/color-mix\([^)]+\)/g,"#0f172a"))}),m.querySelectorAll("*").forEach(f=>{const y=f;if(y.style){const u=y.getAttribute("style")||"";(u.includes("oklch")||u.includes("color-mix"))&&y.setAttribute("style",u.replace(/oklch\([^)]+\)/g,"#065f46").replace(/color-mix\([^)]+\)/g,"#0f172a"))}})}}),R=d.toDataURL("image/png"),v=new b("p","mm","a4"),$=v.internal.pageSize.getWidth(),C=d.height*$/d.width;v.addImage(R,"PNG",0,0,$,Math.min(C,v.internal.pageSize.getHeight())),v.save(e),a(),o()}catch(r){console.warn("PDF export encountered issue, triggering fallback print dialog:",r),a(),x(t),o()}},300)}),A=async(t,e="printable-invoice")=>{const o=(t.patientName||"Patient").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g,"_"),a=`Invoice_${(t.slipNo||t.slipNumber||"SLIP-1001").replace(/[^a-zA-Z0-9_-]/g,"")}_${o}.pdf`,s=k(t,"a4");await w(s,a)},I=async(t,e="printable-prescription")=>{const o=(t.patientName||"Patient").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g,"_"),a=`Prescription_${t.id||"RX-PRESCRIPTION"}_${o}.pdf`,s=S(t);await w(s,a)},T=async(t,e="printable-lab-report")=>{const o=(t.patientName||"Patient").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g,"_"),a=`LabReport_${(t.mrn||"LAB-REPORT").replace(/[^a-zA-Z0-9_-]/g,"")}_${o}.pdf`,s=P(t);await w(s,a)},x=t=>{try{const e=document.getElementById("hafiz-print-frame");e&&e.remove();const o=document.createElement("iframe");o.id="hafiz-print-frame",o.setAttribute("style","position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;"),document.body.appendChild(o);const n=o.contentWindow?.document||o.contentDocument;n?(n.open(),n.write(t),n.close(),setTimeout(()=>{try{o.contentWindow?.focus(),o.contentWindow?.print()}catch(a){console.warn("Iframe print failed, falling back to Blob tab:",a),h(t)}},350)):h(t)}catch(e){console.error("Print frame error:",e),h(t)}},h=t=>{try{const e=new Blob([t],{type:"text/html;charset=utf-8"}),o=URL.createObjectURL(e);if(!window.open(o,"_blank")){const a=document.createElement("a");a.href=o,a.target="_blank",a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),setTimeout(()=>{a.remove(),URL.revokeObjectURL(o)},5e3)}}catch(e){console.error("Blob URL creation error:",e),window.print()}},k=(t,e="a4")=>{const o=t.slipNo||t.slipNumber||"SLIP-0001",n=t.mrnNumber||"MRN-REG",a=t.tokenNumber||t.token||(t.appointmentId&&t.appointmentId.startsWith("APP-")?t.appointmentId.replace("APP-","TK-"):t.slipNo?`TK-${t.slipNo.replace(/\D/g,"")||"101"}`:"TK-101"),s=t.date||new Date().toISOString().split("T")[0],p=t.items||[],r=t.subtotal??p.reduce((i,d)=>i+(d.totalPrice||d.unitPrice*d.quantity),0),c=t.discount??t.discountAmount??0,g=t.totalAmount??Math.max(0,r-c),b=t.paidAmount??0,l=t.balanceAmount??Math.max(0,g-b);return e==="thermal"?`
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${o}</title>
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
    <div class="token-number">🎫 ${a}</div>
  </div>
  <div class="divider"></div>
  <div class="row"><span class="bold">رسید نمبر:</span><span class="mono bold">${o}</span></div>
  <div class="row"><span>تاریخ:</span><span class="mono">${s}</span></div>
  <div class="row"><span>MRN:</span><span class="mono">${n}</span></div>
  <div class="row"><span class="bold">مریض:</span><span class="bold">${t.patientName}</span></div>
  <div class="row"><span>فون:</span><span class="mono">${t.patientPhone||"—"}</span></div>
  <div class="row"><span>معالج:</span><span>${t.doctorName}</span></div>
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
      ${p.map(i=>`
        <tr>
          <td>
            <div>${i.description}</div>
            ${i.department||i.servedBy?`<div style="font-size:8px;color:#475569;">${[i.department,i.servedBy].filter(Boolean).join(" • ")}</div>`:""}
          </td>
          <td style="text-align:center;" class="mono">${i.quantity}</td>
          <td style="text-align:left;" class="mono bold">Rs.${(i.totalPrice||i.unitPrice*i.quantity).toLocaleString()}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="divider"></div>
  <div class="row"><span>ٹوٹل بل:</span><span class="mono">Rs. ${r.toLocaleString()}</span></div>
  ${c>0?`<div class="row"><span>رعایت:</span><span class="mono">-Rs. ${c.toLocaleString()}</span></div>`:""}
  <div class="row bold" style="font-size:12px;"><span>کل واجب الادا:</span><span class="mono">Rs. ${g.toLocaleString()}</span></div>
  <div class="row bold"><span>ادا شدہ:</span><span class="mono">Rs. ${b.toLocaleString()}</span></div>
  ${l>0?`<div class="row bold" style="color:#b91c1c;"><span>بقایا رقم:</span><span class="mono">Rs. ${l.toLocaleString()}</span></div>`:""}
  <div class="row bold" style="font-size:11px; margin-top:2px;">
    <span>حالت ادائیگی:</span>
    <span class="mono">${l===0?"✓ PAID (مکمل ادا شدہ)":"⏳ BALANCE DUE (بقایا)"}</span>
  </div>
  <div class="divider"></div>
  ${t.notes?`<div style="font-size:9px; margin-bottom:6px;"><strong>نوٹ:</strong> ${t.notes}</div>`:""}
  <div class="center" style="font-size:9px; margin-top:6px;">
    <div>کمپیوٹرائزڈ کیش سلپ - حافظ کلینک</div>
    <div>تمام سروسز، ادویات اور ٹیسٹ اسی ٹوکن میں شامل ہیں</div>
    <div>صحت و تندرستی کی دعا گو ٹیم</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.focus(); window.print(); }, 300);
    };
  <\/script>
</body>
</html>
    `:`
<!DOCTYPE html>
<html dir="ltr" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${o} - Hafiz Clinic</title>
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
        <div class="slip-badge">${o}</div>
        <div style="font-size: 13px; color: #022c22; margin-top: 6px; font-weight: 900; background: #fef08a; padding: 3px 8px; border-radius: 6px; border: 1px solid #facc15;">
          🎫 ٹوکن #${a}
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: bold;">تاریخ: ${s}</div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">MRN: ${n}</div>
        <div class="status-badge ${l===0?"status-paid":"status-unpaid"}">
          ${l===0?"✓ PAID RECEIPT (مکمل ادا شدہ)":"⏳ BALANCE DUE (بقایا رقم)"}
        </div>
      </div>
    </div>

    <div class="patient-grid">
      <div>
        <div class="grid-label">مریض کا نام (Patient)</div>
        <div class="grid-val">${t.patientName}</div>
      </div>
      <div>
        <div class="grid-label">موبائل فون (Phone)</div>
        <div class="grid-val grid-val-mono">${t.patientPhone||"—"}</div>
      </div>
      <div>
        <div class="grid-label">معالج ڈاکٹر (Attending Doctor)</div>
        <div class="grid-val" style="color: #065f46;">${t.doctorName}</div>
      </div>
      <div>
        <div class="grid-label">مستقل ٹوکن و ادائیگی (Token / Mode)</div>
        <div class="grid-val font-mono" style="color: #065f46;">Token #${a} • ${t.paymentMethod||"Cash"}</div>
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
        ${p.map((i,d)=>`
          <tr>
            <td style="font-family: monospace; color: #64748b;">${d+1}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${i.description}</div>
              ${i.department||i.servedBy?`<div style="font-size: 10px; color: #047857; margin-top: 2px;">🏢 ${[i.department,i.servedBy].filter(Boolean).join(" • ")}</div>`:""}
            </td>
            <td style="color: #475569; font-size: 11px;">${i.category}</td>
            <td style="text-align: center; font-family: monospace; font-weight: 700;">${i.quantity}</td>
            <td style="text-align: right; font-family: monospace;">Rs. ${(i.unitPrice??0).toLocaleString()}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">
              Rs. ${(i.totalPrice??i.unitPrice*i.quantity).toLocaleString()}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="table-totals-wrapper">
      <div class="totals-box">
        <div class="totals-row">
          <span style="color: #64748b;">ذیلی ٹوٹل (Subtotal):</span>
          <span style="font-family: monospace; font-weight: 700;">Rs. ${r.toLocaleString()}</span>
        </div>
        ${c>0?`<div class="totals-row" style="color: #065f46;">
                <span>رعایت (Discount):</span>
                <span style="font-family: monospace; font-weight: 700;">- Rs. ${c.toLocaleString()}</span>
              </div>`:""}
        <div class="totals-row totals-row-net">
          <span>کل واجب الادا (Net Total):</span>
          <span style="font-family: monospace;">Rs. ${g.toLocaleString()}</span>
        </div>
        <div class="totals-row" style="color: #065f46; font-weight: 700;">
          <span>وصول شدہ رقم (Paid Amount):</span>
          <span style="font-family: monospace;">Rs. ${b.toLocaleString()}</span>
        </div>
        ${l>0?`<div class="totals-row totals-row-bal">
                <span>بقایا رقم (Balance Due):</span>
                <span style="font-family: monospace;">Rs. ${l.toLocaleString()}</span>
              </div>`:""}
      </div>
    </div>

    ${t.notes?`<div class="notes-box">
            <strong>ملاحظات و ہدایات:</strong> ${t.notes}
          </div>`:""}

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
  <\/script>
</body>
</html>
  `},_=(t,e={})=>{const o=k(t,e.format||"a4");e.method==="window"?h(o):x(o)},N=t=>{const e=t.date||t.closingDate||new Date().toISOString().split("T")[0],o=t.grossCollections??t.totalNetCollections??t.totalGrossInvoiced??0,n=t.expensesTotal??t.totalExpenses??t.cashExpenses??0,a=t.expectedNetCash??t.expectedCashInDrawer??0,s=t.openingCash??t.openingCashFloat??0,p=t.variance??t.cashVariance??t.actualPhysicalCash-a,r=t.slipsCount??t.totalSlipsCount??0,c=t.expensesCount??t.expensesList?.length??0,g=t.paymentBreakdown||[{method:"Cash (کیش دراز)",count:t.cashCollections>0?1:0,amount:t.cashCollections||0},{method:"Card (بینک کارڈ)",count:(t.cardCollections||0)>0?1:0,amount:t.cardCollections||0},{method:"Online / EasyPaisa / JazzCash",count:(t.onlineCollections||0)>0?1:0,amount:t.onlineCollections||0}],b=t.categoryCollections||t.breakdownByCategory||[],l=g.map(d=>`
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${d.method}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${d.count} رسیدیں</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">Rs. ${d.amount.toLocaleString()}</td>
      </tr>
    `).join(""),i=b.map(d=>`
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${d.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #065f46;">Rs. ${d.amount.toLocaleString()}</td>
      </tr>
    `).join("");return`
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>EOD Cashier Register Audit - ${e}</title>
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
        تاریخ: <strong>${e}</strong> | کیشئر: <strong>${t.cashierName}</strong> | جاری کنندہ: Hafiz Clinic ERP
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">کل وصول شدہ رقم (Gross Inflow)</div>
        <div class="card-val" style="color: #065f46;">Rs. ${o.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">کل رسیدیں: ${r}</div>
      </div>
      <div class="card">
        <div class="card-title">روزانہ کے اخراجات (Cash Outflow)</div>
        <div class="card-val" style="color: #dc2626;">Rs. ${n.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">واؤچرز: ${c}</div>
      </div>
      <div class="card" style="background: #f0fdf4; border-color: #86efac;">
        <div class="card-title">متوقع کیش دراز (Expected Drawer)</div>
        <div class="card-val" style="color: #065f46;">Rs. ${a.toLocaleString()}</div>
        <div style="font-size: 10px; color: #64748b;">بشمول اوپننگ کیش: Rs. ${s.toLocaleString()}</div>
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
          <tbody>${l}</tbody>
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
          <tbody>${i}</tbody>
        </table>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>اصل گنا ہوا کیش (Physical Drawer Count):</strong>
          <span style="font-family: monospace; font-size: 16px; font-weight: bold; margin-right: 8px;">Rs. ${t.actualPhysicalCash.toLocaleString()}</span>
        </div>
        <div>
          <strong>حساب کا فرق (Variance):</strong>
          <span class="${p===0?"variance-ok":"variance-bad"}" style="font-family: monospace; font-size: 16px; font-weight: bold; margin-right: 8px;">
            ${p===0?"0 (برابر / Balanced)":p>0?`+Rs. ${p.toLocaleString()} (اضافی)`:`-Rs. ${Math.abs(p).toLocaleString()} (شارٹ)`}
          </span>
        </div>
      </div>
      ${t.notes?`<div style="font-size: 11px; color: #475569; margin-top: 6px;"><strong>آڈٹ ریمارکس:</strong> ${t.notes}</div>`:""}
    </div>

    <div class="footer">
      <div style="text-align: center;">
        <div style="font-weight: bold; border-bottom: 1px solid #64748b; width: 180px; padding-bottom: 4px;">${t.cashierName}</div>
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
  <\/script>
</body>
</html>
  `},j=t=>{const e=N(t);x(e)},S=t=>{const e=t.id||`RX-${Math.floor(1e3+Math.random()*9e3)}`,o=t.doctorName||"ڈاکٹر زیشان چوہدری (MBBS, FCPS)";return`
<!DOCTYPE html>
<html dir="rtl" lang="ur">
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${e} - ${t.patientName}</title>
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
        <div class="doc-sub">${o}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">پنجاب ہیلتھ کیئر کمیشن رجسٹرڈ • PHC Reg # 84920 | ہیلپ لائن: 0300-1234567</div>
      </div>
      <div style="text-align: left;">
        <div style="background: #065f46; color: #fef08a; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 12px; display: inline-block;">${e}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">تاریخ: ${t.date}</div>
      </div>
    </div>

    <div class="patient-bar">
      <div><strong>مریض کا نام:</strong> ${t.patientName}</div>
      <div><strong>معائنہ:</strong> جنرل او پی ڈی / کنسلٹیشن</div>
      <div><strong>سٹیٹس:</strong> باضابطہ تصدیق شدہ</div>
    </div>

    <div class="rx-symbol">Rx</div>
    <div class="rx-content">${t.prescriptionText||t.content||"کوئی نسخہ درج نہیں ہے۔"}</div>

    ${t.rxNotes?`<div class="adv-box"><strong>طبی ہدایات:</strong> ${t.rxNotes}</div>`:""}
    ${t.rxPrecautions?`<div class="prec-box"><strong>پرہیز و احتیاط:</strong> ${t.rxPrecautions}</div>`:""}

    <div class="footer">
      <div style="font-size: 10px; color: #64748b;">
        <div>کمپیوٹرائزڈ باضابطہ الیکٹرانک نسخہ۔</div>
        <div style="color: #065f46; font-weight: bold; margin-top: 2px;">Hafiz Clinic Telemedicine & Health Care System</div>
      </div>
      <div style="text-align: center;">
        <div style="font-family: serif; font-weight: bold; font-style: italic; border-bottom: 1px solid #64748b; width: 160px; padding-bottom: 4px;">${o}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">دستخط و تصدیقی مہر معالج</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.focus(); window.print(); }, 350);
    };
  <\/script>
</body>
</html>
  `},P=t=>`
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8" />
  <title>Lab Report - ${t.mrn||"Report"}</title>
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
        <div style="font-weight: 900; font-family: monospace; color: #065f46;">${t.mrn||"MRN-000"}</div>
        <div style="font-size: 11px; color: #64748b;">Date: ${t.reportDate||new Date().toISOString().split("T")[0]}</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; font-size: 12px;">
      <div><strong>Patient:</strong> ${t.patientName}</div>
      <div><strong>Age/Gender:</strong> ${t.ageGender||"—"}</div>
      <div><strong>Referred By:</strong> ${t.doctor||"Dr. Zeeshan"}</div>
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
        ${(t.tests||[]).map(e=>`
          <tr>
            <td style="font-weight: bold;">${e.testName}</td>
            <td style="font-family: monospace; font-weight: bold; color: #065f46;">${e.result}</td>
            <td style="color: #64748b;">${e.refRange}</td>
            <td><strong>${e.status}</strong></td>
          </tr>
        `).join("")}
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
  <\/script>
</body>
</html>
  `,O=t=>{const e=P(t);x(e)};export{A as a,I as b,j as c,T as d,O as e,x as f,_ as p,w as r};
