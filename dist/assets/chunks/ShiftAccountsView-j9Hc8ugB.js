import{r as d,j as e,aB as H,v as V,ab as J,_ as L,w as Y,ai as G,ae as D}from"./vendor-framework-DTeZnrUx.js";import{S as q}from"./ShiftHandoverModal-DIXqGtEJ.js";import"./printInvoice-BFMvlnnu.js";import"./vendor-pdf-CshCadcp.js";function ee({doctors:f,slips:i,expenses:z,language:P,clinicSettings:g}){const a=P==="urdu",[m,k]=d.useState("shift_closing"),[A,R]=d.useState(!1),[S,E]=d.useState("محمد علی (کاؤنٹر انچارج)"),[u,O]=d.useState(5e3),[r,K]=d.useState(0),[v,M]=d.useState(""),[j,T]=d.useState(()=>{const t={};return f.forEach(s=>{t[s.id]=70}),t}),p=i.filter(t=>t.paymentMethod==="Cash").reduce((t,s)=>t+s.paidAmount,0),N=i.filter(t=>t.paymentMethod==="EasyPaisa").reduce((t,s)=>t+s.paidAmount,0),y=i.filter(t=>t.paymentMethod==="JazzCash").reduce((t,s)=>t+s.paidAmount,0),w=i.filter(t=>t.paymentMethod==="Card"||t.paymentMethod==="Bank Transfer").reduce((t,s)=>t+s.paidAmount,0),$=p+N+y+w,_=z.reduce((t,s)=>t+s.amount,0),b=u+p-_,o=r>0?r-b:0,F=f.map(t=>{const s=i.filter(c=>c.doctorName&&(c.doctorName.includes(t.nameUrdu)||c.doctorName.includes(t.nameEnglish))||c.items.some(h=>h.servedBy===t.nameUrdu||h.servedBy===t.nameEnglish)),l=s.length,x=s.reduce((c,h)=>c+h.paidAmount,0),n=j[t.id]??70,C=Math.round(x*n/100),B=x-C;return{doctorId:t.id,doctorName:t.nameUrdu||t.nameEnglish,totalConsultations:l,totalOPDFeesPKR:x,doctorSharePercentage:n,doctorPayablePKR:C,hospitalSharePKR:B,paidAmountPKR:0,balancePayablePKR:C}}),I=()=>{const s=`
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
            <div class="title">${g?.clinicNameUrdu||"حافظ کلینک اینڈ ہربل ہسپتال"}</div>
            <div>روزانہ کیش دراز کلوزنگ و شفٹ آڈٹ رپورٹ (Shift Cash Closing Report)</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">تاریخ: ${new Date().toLocaleDateString()} | کیشیر: ${S}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div>اوپننگ کیش دراز (Opening Cash): <strong>Rs. ${u}</strong></div>
              <div>نقد کلیکشن (Cash Collected): <strong>Rs. ${p}</strong></div>
              <div>ایزی پیسہ (EasyPaisa): <strong>Rs. ${N}</strong></div>
              <div>جاز کیش (JazzCash): <strong>Rs. ${y}</strong></div>
              <div>بینک کارڈ (Cards/Bank): <strong>Rs. ${w}</strong></div>
            </div>
            <div class="card">
              <div>کل آمدن (Total Inflow): <strong style="color:#047857;">Rs. ${$}</strong></div>
              <div>روزانہ کے اخراجات (Total Expenses Paid): <strong style="color:#dc2626;">Rs. ${_}</strong></div>
              <div style="margin-top:6px; border-top:1px dashed #cbd5e1; padding-top:6px;">
                دراز میں متوقع نقد رقم: <strong>Rs. ${b}</strong>
              </div>
              <div>کاؤنٹ شدہ نقد رقم: <strong>Rs. ${r}</strong></div>
              <div>فرق (Discrepancy): <strong style="color:${o<0?"#dc2626":"#047857"};">Rs. ${o}</strong></div>
            </div>
          </div>

          <div class="grand-total">
            <div style="display:flex; justify-content:space-between;">
              <span>خالص نقد بیلنس (Net Cash In Hand):</span>
              <span>Rs. ${r>0?r:b}</span>
            </div>
          </div>

          ${v?`<div style="margin-top:16px; font-size:12px;"><strong>نوٹ:</strong> ${v}</div>`:""}

          <div style="display:flex; justify-content:space-between; margin-top:60px; border-top:1px solid #cbd5e1; padding-top:10px;">
            <div>دستخط کیشیر: ________________</div>
            <div>دستخط ہسپتال ایڈمنسٹریٹر: ________________</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `,l=window.open("","_blank","width=900,height=1100");l&&(l.document.open(),l.document.write(s),l.document.close())},U=t=>{const s=g?.clinicNameUrdu||"حافظ کلینک اینڈ ہربل ریسرچ سینٹر",l=`DOC-PAY-${Math.floor(1e3+Math.random()*9e3)}`,x=`
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Doctor Payout Voucher — ${t.doctorName}</title>
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
            <div class="title">${s}</div>
            <div>ڈاکٹر شیئر ادائیگی واؤچر (Doctor Revenue Payout Slip)</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">واؤچر نمبر: ${l} | تاریخ: ${new Date().toLocaleDateString()}</div>
          </div>

          <div style="background:#f0fdfa; border:1px solid #99f6e4; padding:12px; border-radius:8px; margin-bottom:16px;">
            <div><strong>ڈاکٹر کا نام:</strong> ${t.doctorName}</div>
            <div><strong>کل چیک اپس (Consultations):</strong> ${t.totalConsultations} مریض</div>
            <div><strong>شیئر تناسب (Doctor Ratio):</strong> ${t.doctorSharePercentage}% معالج / ${100-t.doctorSharePercentage}% کلینک</div>
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
                <td style="text-align:left; font-weight:bold;">Rs. ${t.totalOPDFeesPKR}</td>
              </tr>
              <tr>
                <td>کلینک مینجمنٹ کٹوتی (${100-t.doctorSharePercentage}%)</td>
                <td style="text-align:left; color:#64748b;">Rs. ${t.hospitalSharePKR}</td>
              </tr>
              <tr style="background:#f0fdf4; font-weight:900; font-size:15px; color:#065f46;">
                <td>ڈاکٹر کو واجب الادا رقم (${t.doctorSharePercentage}%)</td>
                <td style="text-align:left;">Rs. ${t.doctorPayablePKR}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; justify-content:space-between; margin-top:80px; border-top:1px solid #cbd5e1; padding-top:12px;">
            <div>دستخط وصول کنندہ ڈاکٹر: ________________</div>
            <div>دستخط اکاونٹنٹ / فنانس مینیجر: ________________</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `,n=window.open("","_blank","width=900,height=1100");n&&(n.document.open(),n.document.write(x),n.document.close())};return e.jsxs("div",{className:"space-y-6",dir:a?"rtl":"ltr",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex bg-white p-1.5 rounded-3xl border border-slate-200 shadow-sm gap-2 max-w-md",children:[e.jsxs("button",{type:"button",onClick:()=>k("shift_closing"),className:`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${m==="shift_closing"?"bg-emerald-800 text-white shadow-sm":"text-slate-600 hover:bg-slate-50"}`,children:[e.jsx(H,{className:"w-4 h-4"}),e.jsx("span",{children:a?"شفٹ کیش کلوزنگ":"Daily Shift Closing"})]}),e.jsxs("button",{type:"button",onClick:()=>k("doctor_split"),className:`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${m==="doctor_split"?"bg-emerald-800 text-white shadow-sm":"text-slate-600 hover:bg-slate-50"}`,children:[e.jsx(V,{className:"w-4 h-4"}),e.jsx("span",{children:a?"ڈاکٹر ریونیو شیئر":"Doctor Split"})]})]}),e.jsxs("button",{type:"button",onClick:()=>R(!0),className:"bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 transition-all cursor-pointer",children:[e.jsx(J,{className:"w-4 h-4 text-amber-300"}),e.jsx("span",{children:a?"📋 مکمل شفٹ ہینڈ اوور (PDF رپورٹ)":"📋 Automated Shift Handover (PDF)"})]})]}),m==="shift_closing"&&e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-6",children:[e.jsx("div",{className:"lg:col-span-7 space-y-4",children:e.jsxs("div",{className:"bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5",children:[e.jsxs("div",{className:"flex justify-between items-center border-b border-slate-100 pb-3",children:[e.jsxs("h3",{className:"font-black text-slate-900 text-base flex items-center gap-2",children:[e.jsx(L,{className:"w-5 h-5 text-emerald-700"}),e.jsx("span",{children:a?"آج کی کلیکشن اور کیش فلو بریک ڈاؤن":"Collections & Cash Flow"})]}),e.jsx("span",{className:"text-xs font-bold text-slate-400 font-mono",children:new Date().toLocaleDateString()})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs",children:[e.jsxs("div",{className:"bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl",children:[e.jsx("span",{className:"text-emerald-800 font-bold block",children:"Cash (نقد)"}),e.jsxs("div",{className:"text-base font-black text-emerald-900 font-mono mt-1",children:["Rs. ",p]})]}),e.jsxs("div",{className:"bg-teal-50/70 border border-teal-200 p-3 rounded-2xl",children:[e.jsx("span",{className:"text-teal-800 font-bold block",children:"EasyPaisa"}),e.jsxs("div",{className:"text-base font-black text-teal-900 font-mono mt-1",children:["Rs. ",N]})]}),e.jsxs("div",{className:"bg-amber-50/70 border border-amber-200 p-3 rounded-2xl",children:[e.jsx("span",{className:"text-amber-800 font-bold block",children:"JazzCash"}),e.jsxs("div",{className:"text-base font-black text-amber-900 font-mono mt-1",children:["Rs. ",y]})]}),e.jsxs("div",{className:"bg-blue-50/70 border border-blue-200 p-3 rounded-2xl",children:[e.jsx("span",{className:"text-blue-800 font-bold block",children:"Cards / Bank"}),e.jsxs("div",{className:"text-base font-black text-blue-900 font-mono mt-1",children:["Rs. ",w]})]})]}),e.jsxs("div",{className:"space-y-2.5 text-xs pt-2",children:[e.jsxs("div",{className:"flex justify-between items-center p-3 bg-slate-50 rounded-xl",children:[e.jsx("span",{className:"text-slate-600 font-bold",children:"کل موصولہ رقم (Total Inflow):"}),e.jsxs("span",{className:"font-mono text-sm font-black text-slate-900",children:["Rs. ",$]})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-rose-50 rounded-xl text-rose-900",children:[e.jsx("span",{className:"font-bold",children:"کل اخراجات ادائیگی (Expenses Paid Out):"}),e.jsxs("span",{className:"font-mono text-sm font-black text-rose-700",children:["- Rs. ",_]})]}),e.jsxs("div",{className:"flex justify-between items-center p-3.5 bg-emerald-900 text-white rounded-2xl",children:[e.jsx("span",{className:"font-black text-sm",children:"متوقع نقد رقم دراز (Expected Drawer Cash):"}),e.jsxs("span",{className:"font-mono text-base font-black text-emerald-300",children:["Rs. ",b]})]})]})]})}),e.jsx("div",{className:"lg:col-span-5 space-y-4",children:e.jsxs("div",{className:"bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs",children:[e.jsx("h3",{className:"font-black text-slate-900 text-sm",children:a?"کیش دراز کاؤنٹنگ و شفٹ ویری فکیشن":"Drawer Cash Verification"}),e.jsxs("div",{children:[e.jsx("label",{className:"block font-bold text-slate-700 mb-1",children:a?"کیشیر نام":"Cashier Name"}),e.jsx("input",{type:"text",value:S,onChange:t=>E(t.target.value),className:"w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block font-bold text-slate-700 mb-1",children:a?"اوپننگ کیش":"Opening Cash"}),e.jsx("input",{type:"number",value:u||"",onChange:t=>O(Number(t.target.value)||0),className:"w-full border border-slate-300 rounded-xl px-3 py-2 outline-none font-mono font-bold"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block font-bold text-slate-700 mb-1",children:a?"گنی گئی نقد رقم":"Counted Cash"}),e.jsx("input",{type:"number",value:r||"",onChange:t=>K(Number(t.target.value)||0),placeholder:"گن کر درج کریں",className:"w-full border-2 border-emerald-500 rounded-xl px-3 py-2 outline-none font-mono font-black text-emerald-900 bg-emerald-50/30"})]})]}),r>0&&e.jsxs("div",{className:`p-3.5 rounded-2xl border flex items-center justify-between font-bold ${o===0?"bg-emerald-50 border-emerald-200 text-emerald-900":o<0?"bg-rose-50 border-rose-300 text-rose-900":"bg-blue-50 border-blue-300 text-blue-900"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[o===0?e.jsx(Y,{className:"w-4 h-4 text-emerald-600"}):e.jsx(G,{className:"w-4 h-4 text-rose-600"}),e.jsx("span",{children:o===0?"کیش دراز بالکل برابر ہے!":o<0?"کیش کم ہے (Shortage)":"کیش زیادہ ہے (Surplus)"})]}),e.jsxs("span",{className:"font-mono text-sm font-black",children:["Rs. ",o]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block font-bold text-slate-700 mb-1",children:a?"شفٹ اختتامی نوٹس":"Shift Notes"}),e.jsx("textarea",{value:v,onChange:t=>M(t.target.value),rows:2,placeholder:a?"کوئی خاص تفصیل...":"Closing remarks...",className:"w-full border border-slate-300 rounded-xl p-2.5 outline-none"})]}),e.jsxs("button",{type:"button",onClick:I,className:"w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2",children:[e.jsx(D,{className:"w-4 h-4"}),e.jsx("span",{children:a?"شفٹ کلوزنگ پرنٹ نکالیں":"Print Shift Closing Report"})]})]})})]}),m==="doctor_split"&&e.jsxs("div",{className:"bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5",children:[e.jsx("div",{className:"flex justify-between items-center border-b border-slate-100 pb-3",children:e.jsxs("div",{children:[e.jsx("h3",{className:"font-black text-slate-900 text-base",children:a?"ڈاکٹرز کمیشن و ریونیو شیئر کیلکولیٹر":"Doctor Revenue Split & Payouts"}),e.jsx("p",{className:"text-xs text-slate-500",children:a?"او پی ڈی فیس کی خودکار تقسیم بلحاظ معالج":"Automatic OPD percentage calculation per physician"})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:F.map(t=>e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-emerald-300 transition-all",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-black text-slate-900 text-sm",children:t.doctorName}),e.jsxs("span",{className:"text-xs text-slate-500 font-bold",children:[t.totalConsultations," ",a?"مریض چیک کیے":"Patients seen"]})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs",children:[e.jsx("span",{className:"text-slate-500 font-bold",children:a?"شیئر:":"Share:"}),e.jsx("input",{type:"number",value:j[t.doctorId]??70,onChange:s=>T({...j,[t.doctorId]:Number(s.target.value)||0}),className:"w-10 text-center font-black text-emerald-800 outline-none"}),e.jsx("span",{className:"font-bold",children:"%"})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 text-xs text-center",children:[e.jsxs("div",{className:"bg-white p-2.5 rounded-2xl border border-slate-200",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block font-bold",children:"کل او پی ڈی فیس"}),e.jsxs("div",{className:"font-mono font-bold text-slate-800 text-xs mt-0.5",children:["Rs. ",t.totalOPDFeesPKR]})]}),e.jsxs("div",{className:"bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200",children:[e.jsxs("span",{className:"text-[10px] text-emerald-700 block font-bold",children:["ڈاکٹر شیئر (",t.doctorSharePercentage,"%)"]}),e.jsxs("div",{className:"font-mono font-black text-emerald-900 text-xs mt-0.5",children:["Rs. ",t.doctorPayablePKR]})]}),e.jsxs("div",{className:"bg-teal-50 p-2.5 rounded-2xl border border-teal-200",children:[e.jsxs("span",{className:"text-[10px] text-teal-700 block font-bold",children:["ہسپتال شیئر (",100-t.doctorSharePercentage,"%)"]}),e.jsxs("div",{className:"font-mono font-black text-teal-900 text-xs mt-0.5",children:["Rs. ",t.hospitalSharePKR]})]})]}),e.jsx("div",{className:"pt-2 flex justify-end",children:e.jsxs("button",{type:"button",onClick:()=>U(t),className:"bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors",children:[e.jsx(D,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a?"ادائیگی واؤچر پرنٹ کریں":"Print Payout Voucher"})]})})]},t.doctorId))})]}),e.jsx(q,{isOpen:A,onClose:()=>R(!1),currentUser:null,doctors:f,slips:i,clinicSettings:g,language:P})]})}export{ee as ShiftAccountsView};
