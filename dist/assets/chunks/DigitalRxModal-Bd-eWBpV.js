import{r,j as e,ab as be,X as he,U as fe,x as V,m as K,a4 as X,a5 as ve,ag as ye,ae as je}from"./vendor-framework-DTeZnrUx.js";const $="hafiz_clinic_prescriptions_v2",_=[{id:"RX-2026-001",rxNumber:"RX-1001",patientId:"PT-901",patientName:"محمد عثمان علی",patientAge:42,patientGender:"Male",patientPhone:"0301-7654321",patientCity:"لاہور",mrnNumber:"MRN-78601",doctorId:"dr-hafiz-suleman",doctorName:"حکیم محمد سلیمان",doctorSpecialization:"ہربل کنسلٹنٹ و ماہر نبض",doctorQualification:"MD / BEMS (Gold Medalist), R.U.M.P",date:"2026-08-18",vitals:{bpSystolic:125,bpDiastolic:82,pulse:76,temperature:98.4,weightKg:78,bloodSugarMgDl:110,sugarType:"Random",spo2:98},presentingComplaintsUrdu:"معدے میں جلن، گیس، اور کندھوں اور پٹھوں میں کھچاؤ۔",clinicalDiagnosisUrdu:"ضعفِ معدہ و عضلاتی کھچاؤ (Gastric Dyspepsia & Muscle Spasm)",medicines:[{id:"m1",name:"جوارش کمونی خاص (Jawarish Kamuni)",form:"Herbal Majoon",dosage:"1 چمچ",frequency:"1-0-1 (صبح و شام)",timing:"After Meal (کھانے کے بعد)",durationDays:14,instructionsUrdu:"کھانے کے بعد نیم گرم پانی کے ساتھ استعمال کریں۔"},{id:"m2",name:"شربتِ بزوری معتدل (Sharbat Bazoori)",form:"Syrup",dosage:"2 چمچ",frequency:"1-0-1 (صبح و شام)",timing:"Before Meal (کھانے سے پہلے)",durationDays:10,instructionsUrdu:"ایک کپ پانی میں ملا کر پیئیں۔"},{id:"m3",name:"حبِ مقوی اعصاب (Habb-e-Muqawwi)",form:"Tablet",dosage:"1 گولی",frequency:"0-0-1 (رات کو)",timing:"With Water (پانی کے ساتھ)",durationDays:20,instructionsUrdu:"رات کو نیم گرم دودھ کے ساتھ لیں۔"}],advisedTests:["Complete Blood Count (CBC)","Serum Uric Acid"],dietaryAdviceUrdu:"تلی ہوئی، تیز مرچ مصالحہ دار اور بادی اشیاء (چاول، بڑا گوشت، کولڈ ڈرنکس) سے سخت پرہیز کریں۔ تازہ پھل، ابلے ہوئے کھانے اور مولی و سلاد استعمال کریں۔",precautionsUrdu:"روزانہ ۲۰ منٹ صبح واک کریں اور کھانا کھانے کے فوری بعد لیٹنے سے گریز کریں۔",followUpDate:"2026-09-01",qrVerificationCode:"https://hafizclinic.pk/verify-rx?rx=RX-1001",status:"Dispensed",createdAt:"2026-08-18T10:30:00Z"},{id:"RX-2026-002",rxNumber:"RX-1002",patientId:"PT-902",patientName:"شمیم اختر بیگم",patientAge:56,patientGender:"Female",patientPhone:"0322-8877665",patientCity:"شیخوپورہ",mrnNumber:"MRN-78602",doctorId:"dr-asim-farooq",doctorName:"ڈاکٹر عاصم فاروق",doctorSpecialization:"ماہر امراض چشم و سرجن",doctorQualification:"MBBS, D.O (Opht), FCPS-I",date:"2026-08-19",vitals:{bpSystolic:138,bpDiastolic:88,pulse:80,temperature:98.6,weightKg:64,bloodSugarMgDl:142,sugarType:"Fasting",spo2:97},presentingComplaintsUrdu:"آنکھوں میں خارش، دھندلا پن اور کمپیوٹر استعمال کے بعد سر میں درد۔",clinicalDiagnosisUrdu:"Computer Vision Syndrome (CVS) & Dry Eye with Astigmatism",medicines:[{id:"m4",name:"Lubricant Eye Drops (Carboxymethylcellulose)",form:"Eye Drops",dosage:"1 قطرہ",frequency:"1-1-1 (تین وقت)",timing:"With Water (پانی کے ساتھ)",durationDays:30,instructionsUrdu:"دونوں آنکھوں میں دن میں ۳ سے ۴ بار ڈالیں۔"},{id:"m5",name:"عرقِ مروارید خاص چشم (Herbal Eye Drops)",form:"Drops",dosage:"2 قطرے",frequency:"0-0-1 (رات کو)",timing:"Empty Stomach (نہار منہ)",durationDays:20,instructionsUrdu:"رات سوتے وقت آنکھوں میں ڈالیں۔"}],advisedTests:["Computerized Auto-Refractometer Eye Scan","Blood Sugar Fasting"],dietaryAdviceUrdu:"گاlightجر کا جوس، مچھلی اور بادام کی گریاں استعمال کریں۔ سکرین پر 20-20-20 فارمولہ اپنائیں۔",precautionsUrdu:"کمپیوٹر استعمال کے دوران اینٹی گلئیر نیلی روشنی فلٹر گلاسز استعمال کریں۔",followUpDate:"2026-09-10",qrVerificationCode:"https://hafizclinic.pk/verify-rx?rx=RX-1002",status:"Active",createdAt:"2026-08-19T11:15:00Z"}];async function Ne(){try{const a=localStorage.getItem($);if(a){const n=JSON.parse(a);if(Array.isArray(n)&&n.length>0)return n}}catch{}return localStorage.setItem($,JSON.stringify(_)),_}async function J(a){const n=await Ne(),o=n.findIndex(N=>N.id===a.id||N.rxNumber===a.rxNumber);let d;return o>=0?(d=[...n],d[o]=a):d=[a,...n],localStorage.setItem($,JSON.stringify(d)),fetch("/api/prescriptions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}).catch(()=>{}),a}function we(a,n){const o=n?.clinicNameUrdu||"حافظ کلینک اینڈ ہربل ریسرچ سینٹر",d=n?.clinicNameEnglish||"Hafiz Clinic & Herbal Research Center",N=n?.taglineUrdu||"قدرتی جڑی بوٹیوں سے مستند و جدید علاج — کمپیوٹرائزڈ آئی سینٹر و فزیوتھراپی",D=n?.addressUrdu||"نزد مین مارکیٹ، حافظ آباد روڈ، لاہور / گوجرانوالہ، پنجاب پاکستان",h=n?.phone1||"0300-1234567",U=n?.whatsappNumber||"0300-1234567",s=n?.phcApprovalNo||"PHC-REG-786/2026",f=`
    <!DOCTYPE html>
    <html lang="ur" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>Prescription — ${a.rxNumber} — ${a.patientName}</title>
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
            <h1>${o}</h1>
            <h2>${d}</h2>
            <div class="clinic-tagline">${N}</div>
            <div style="font-size: 10px; color: #047857; margin-top: 3px; font-weight: bold;">
              PHC Reg No: ${s} | رابطہ: ${h} / ${U}
            </div>
          </div>
          <div class="doc-badge">
            <div class="doc-name">${a.doctorName}</div>
            <div class="doc-spec">${a.doctorSpecialization||"ماہر معالج"}</div>
            <div class="doc-qual">${a.doctorQualification||"MD / BEMS (Consultant)"}</div>
          </div>
        </div>

        <!-- Patient Demographics -->
        <div class="patient-banner">
          <div class="p-field"><span class="p-label">مریض کا نام:</span><span class="p-val">${a.patientName}</span></div>
          <div class="p-field"><span class="p-label">عمر / جنس:</span><span class="p-val">${a.patientAge||"—"} سال / ${a.patientGender==="Male"?"مرد":a.patientGender==="Female"?"خاتون":"—"}</span></div>
          <div class="p-field"><span class="p-label">نسخہ نمبر / تاریخ:</span><span class="p-val">${a.rxNumber} | ${a.date}</span></div>
          <div class="p-field"><span class="p-label">فون / شہر:</span><span class="p-val">${a.patientPhone} (${a.patientCity||"لاہور"})</span></div>
        </div>

        <!-- Vitals -->
        ${a.vitals?`
        <div class="vitals-bar">
          ${a.vitals.bpSystolic?`<div class="vital-chip">BP: <span>${a.vitals.bpSystolic}/${a.vitals.bpDiastolic||80} mmHg</span></div>`:""}
          ${a.vitals.pulse?`<div class="vital-chip">Pulse: <span>${a.vitals.pulse} bpm</span></div>`:""}
          ${a.vitals.temperature?`<div class="vital-chip">Temp: <span>${a.vitals.temperature} °F</span></div>`:""}
          ${a.vitals.weightKg?`<div class="vital-chip">Weight: <span>${a.vitals.weightKg} kg</span></div>`:""}
          ${a.vitals.bloodSugarMgDl?`<div class="vital-chip">Sugar (${a.vitals.sugarType||"R"}): <span>${a.vitals.bloodSugarMgDl} mg/dL</span></div>`:""}
          ${a.vitals.spo2?`<div class="vital-chip">SpO2: <span>${a.vitals.spo2}%</span></div>`:""}
        </div>`:""}

        <!-- Complaints & Diagnosis -->
        <div class="diagnosis-box">
          ${a.presentingComplaintsUrdu?`<div><span class="diag-label">شکایت مریض:</span> <span style="color:#334155;">${a.presentingComplaintsUrdu}</span></div>`:""}
          <div><span class="diag-label">تشخیص (Diagnosis):</span> <span class="diag-text">${a.clinicalDiagnosisUrdu}</span></div>
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
            ${a.medicines.map(c=>`
              <tr>
                <td>
                  <div class="med-name">${c.name}</div>
                  ${c.instructionsUrdu?`<div class="med-instructions">ہدایت: ${c.instructionsUrdu}</div>`:""}
                </td>
                <td><strong>${c.dosage}</strong> (${c.form})</td>
                <td><strong>${c.frequency}</strong></td>
                <td>${c.timing}</td>
                <td><strong>${c.durationDays} دن</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- Lab Tests & Dietary Advice -->
        <div class="advice-grid">
          <div class="advice-card">
            <div class="advice-title">🔬 تجویز کردہ ٹیسٹ و معائنے (Lab Investigations)</div>
            <div class="advice-content">
              ${a.advisedTests&&a.advisedTests.length>0?a.advisedTests.map(c=>`• ${c}`).join("<br/>"):"کوئی خاص ٹیسٹ درکار نہیں۔"}
            </div>
          </div>
          <div class="advice-card">
            <div class="advice-title">🥗 پرہیز، غذا و ہدایات (Diet & Precautions)</div>
            <div class="advice-content">
              ${a.dietaryAdviceUrdu||"بادی اور تیز مصالحہ دار کھانوں سے پرہیز کریں۔"}
              ${a.precautionsUrdu?`<br/>• ${a.precautionsUrdu}`:""}
            </div>
          </div>
        </div>

        ${a.followUpDate?`
          <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: #047857;">
            🗓️ اگلی ملاقات / چیک اپ کی تاریخ (Follow-Up): ${a.followUpDate}
          </div>
        `:""}

        <!-- Signatures & Verification -->
        <div class="footer-signatures">
          <div class="qr-placeholder">
            <div style="font-weight: bold; color: #065f46;">VERIFIED DIGITAL Rx</div>
            <div>${a.rxNumber}</div>
            <div style="font-size: 8px;">Scan to Verify authenticity</div>
          </div>
          <div style="font-size: 10px; color: #64748b;">
            پتہ: ${D}
          </div>
          <div class="doc-signature">
            <div class="sig-line">${a.doctorName} — دستخط و مہر معالج</div>
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
      <\/script>
    </body>
    </html>
  `,v=window.open("","_blank","width=900,height=1100");v&&(v.document.open(),v.document.write(f),v.document.close())}const Se=[{name:"جوارش کمونی خاص (Jawarish Kamuni)",form:"Herbal Majoon",dosage:"1 چمچ",freq:"1-0-1 (صبح و شام)",timing:"After Meal (کھانے کے بعد)",days:14},{name:"شربتِ بزوری معتدل (Sharbat Bazoori)",form:"Syrup",dosage:"2 چمچ",freq:"1-0-1 (صبح و شام)",timing:"Before Meal (کھانے سے پہلے)",days:10},{name:"حبِ مقوی اعصاب (Habb-e-Muqawwi)",form:"Tablet",dosage:"1 گولی",freq:"0-0-1 (رات کو)",timing:"With Water (پانی کے ساتھ)",days:20},{name:"عرقِ مروارید خاص چشم (Eye Drops)",form:"Eye Drops",dosage:"2 قطرے",freq:"1-0-1 (صبح و شام)",timing:"With Water (پانی کے ساتھ)",days:20},{name:"سفوفِ ضیابیطس شوگر کنٹرول",form:"Herbal Safoof",dosage:"آدھا چمچ",freq:"1-0-1 (صبح و شام)",timing:"Empty Stomach (نہار منہ)",days:30},{name:"درد ریلیف خاص جوائنٹ آئل",form:"Cream / Ointment",dosage:"مالش",freq:"0-0-1 (رات کو)",timing:"With Water (پانی کے ساتھ)",days:15},{name:"معجون فلاسفہ مقوی گردہ و مثانہ",form:"Herbal Majoon",dosage:"1 چمچ",freq:"0-0-1 (رات کو)",timing:"After Meal (کھانے کے بعد)",days:20}],Ce=[{id:"gastric",labelUrdu:"معدے کی تیزابیت و جلن (Gastric)",labelEnglish:"Gastritis & Dyspepsia",diagnosisUrdu:"ضعفِ معدہ و تیزابیت (Gastric Hyperacidity)",diagnosisEnglish:"Gastric Dyspepsia & Hyperacidity",complaintsUrdu:"کھانے کے بعد سینے میں جلن، اپھارہ، گیس اور بدہضمی۔",complaintsEnglish:"Post-prandial heartburn, bloating, flatulence, and epigastric discomfort.",dietUrdu:"تیز مرچ، مصالحہ جات، کولڈ ڈرنکس اور تلی ہوئی اشیاء سے مکمل پرہیز کریں۔ دہی اور سونف کا قہوہ پئیں۔",dietEnglish:"Avoid oily and spicy foods, sodas, and heavy fats. Prefer yogurt, light broths, and boiled water.",medicines:[{name:"جوارش کمونی خاص (Jawarish Kamuni)",form:"Herbal Majoon",dosage:"1 چمچ",frequency:"1-0-1 (صبح و شام)",timing:"After Meal (کھانے کے بعد)",durationDays:14,instructionsUrdu:"کھانے کے بعد پانی کے ساتھ لیں۔"},{name:"شربتِ بزوری معتدل (Sharbat Bazoori)",form:"Syrup",dosage:"2 چمچ",frequency:"1-0-1 (صبح و شام)",timing:"Before Meal (کھانے سے پہلے)",durationDays:10,instructionsUrdu:"ایک گلاس پانی میں ملا کر پیئیں۔"}],tests:["Complete Blood Count (CBC)","Serum H. Pylori Antigen","Ultrasound Upper Abdomen"]},{id:"joint",labelUrdu:"جوڑوں اور پٹھوں کا درد (Joint Pain)",labelEnglish:"Arthritis & Musculoskeletal Pain",diagnosisUrdu:"وجع المفاصل و عرق النساء (Osteoarthritis / Sciatica)",diagnosisEnglish:"Osteoarthritis & Lumbar Radiculopathy",complaintsUrdu:"گھٹنوں اور کمر میں شدید درد، صبح اٹھنے پر سختی اور چلنے میں دشواری۔",complaintsEnglish:"Knee and lower back pain, morning stiffness, difficulty climbing stairs.",dietUrdu:"ٹھنڈا پانی، دہی، چاول اور بادی اشیاء سے پرہیز کریں۔ کلونجی اور زیتون کا استعمال رکھیں۔",dietEnglish:"Avoid chilled beverages and processed carbs. Increase warm anti-inflammatory broths.",medicines:[{name:"حبِ مقوی اعصاب (Habb-e-Muqawwi)",form:"Tablet",dosage:"1 گولی",frequency:"0-0-1 (رات کو)",timing:"With Water (پانی کے ساتھ)",durationDays:20,instructionsUrdu:"رات سوتے وقت نیم گرم دودھ کے ساتھ لیں۔"},{name:"درد ریلیف خاص جوائنٹ آئل",form:"Cream / Ointment",dosage:"مالش",frequency:"0-0-1 (رات کو)",timing:"With Water (پانی کے ساتھ)",durationDays:15,instructionsUrdu:"متاثرہ جوڑوں پر ہلکے ہاتھ سے مالش کریں۔"}],tests:["Digital X-Ray Knee / Spine","Serum Uric Acid","Erythrocyte Sedimentation Rate (ESR)"]},{id:"diabetes",labelUrdu:"ذیابیطس و شوگر کنٹرول (Diabetes)",labelEnglish:"Type 2 Diabetes Mellitus",diagnosisUrdu:"ذیابیطس شکری نوع دوم (Type 2 Diabetes)",diagnosisEnglish:"Type 2 Diabetes Mellitus (Uncontrolled)",complaintsUrdu:"زیادہ پیاس لگنا، بار بار پیشاب آنا اور جسمانی کمزوری و نقاہت۔",complaintsEnglish:"Polydipsia, polyuria, chronic fatigue, and lethargy.",dietUrdu:"چینی، مٹھائیاں، بیکری مصنوعات سے پرہیز۔ روزانہ 40 منٹ تیز چہل قدمی لازم ہے۔",dietEnglish:"Strict avoidance of refined sugars, sweets, and high-glycemic carbohydrates. Daily 40-min brisk walk.",medicines:[{name:"سفوفِ ضیابیطس شوگر کنٹرول",form:"Herbal Safoof",dosage:"آدھا چمچ",frequency:"1-0-1 (صبح و شام)",timing:"Empty Stomach (نہار منہ)",durationDays:30,instructionsUrdu:"نہار منہ اور رات کھانے سے پہلے نیم گرم پانی سے لیں۔"}],tests:["Fasting Blood Glucose (BSF)","HbA1c Glycated Hemoglobin","Serum Creatinine & eGFR"]},{id:"eyestrain",labelUrdu:"کمپیوٹر آئی اسٹرین و سر درد (Eye Strain)",labelEnglish:"Computer Vision Syndrome",diagnosisUrdu:"کمپیوٹر ویژن سنڈروم و کمزوریٔ بینائی (CVS & Asthenopia)",diagnosisEnglish:"Computer Vision Syndrome & Refractive Error",complaintsUrdu:"سکرین کے استعمال پر آنکھوں میں جلن، دھندلا پن اور پیشانی میں درد۔",complaintsEnglish:"Ocular fatigue, blurred vision with prolonged screen time, frontal headache.",dietUrdu:"پالک، گاجر اور مچھلی کا استعمال کریں۔ سکرین استعمال کرتے وقت 20-20-20 اصول اپنائیں۔",dietEnglish:"Adequate hydration, leafy greens, vitamin A rich diet. Follow 20-20-20 rule.",medicines:[{name:"عرقِ مروارید خاص چشم (Eye Drops)",form:"Eye Drops",dosage:"2 قطرے",frequency:"1-0-1 (صبح و شام)",timing:"With Water (پانی کے ساتھ)",durationDays:20,instructionsUrdu:"صبح اور شام دونوں آنکھوں میں ۲، ۲ قطرے ڈالیں۔"}],tests:["Computerized Auto-Refraction","Non-Contact Intraocular Pressure (IOP)","Slit Lamp Examination"]}];function Ae({isOpen:a,onClose:n,doctor:o,initialPatient:d,diseases:N=[],clinicSettings:D,onSaved:h,language:U}){const s=U==="urdu",[f,v]=r.useState(d?.name||""),[c,Q]=r.useState(d?.phone||""),[P,Z]=r.useState(d?.age||35),[M,Y]=r.useState(d?.gender||"Male"),[k,ee]=r.useState(d?.city||"لاہور"),[p,te]=r.useState(120),[m,ae]=r.useState(80),[E,se]=r.useState(74),[u,ie]=r.useState(98.6),[T,ne]=r.useState(70),[x,re]=r.useState(110),[g,le]=r.useState(98),[R,z]=r.useState(""),[q,I]=r.useState(""),[O,H]=r.useState("بادی، تیز مرچ اور تلی ہوئی اشیاء سے پرہیز کریں۔ نیم گرم پانی اور پھلوں کا استعمال بڑھائیں۔"),[oe,De]=r.useState("روزانہ مناسب واک کریں اور وقت پر آرام کریں۔"),[F,de]=r.useState(()=>{const t=new Date;return t.setDate(t.getDate()+14),t.toISOString().split("T")[0]}),[y,w]=r.useState([{id:"m-1",name:"جوارش کمونی خاص (Jawarish Kamuni)",form:"Herbal Majoon",dosage:"1 چمچ",frequency:"1-0-1 (صبح و شام)",timing:"After Meal (کھانے کے بعد)",durationDays:14,instructionsUrdu:"کھانے کے بعد نیم گرم پانی سے لیں۔"}]),[S,A]=r.useState(["Complete Blood Count (CBC)"]),[C,B]=r.useState("");if(!a)return null;const ce=()=>{const t={id:`med-${Date.now()}`,name:"",form:"Tablet",dosage:"1 گولی",frequency:"1-0-1 (صبح و شام)",timing:"After Meal (کھانے کے بعد)",durationDays:10,instructionsUrdu:""};w([...y,t])},pe=t=>{const l={id:`med-${Date.now()}`,name:t.name,form:t.form,dosage:t.dosage,frequency:t.freq,timing:t.timing,durationDays:t.days,instructionsUrdu:"معالج کی ہدایت کے مطابق استعمال کریں۔"};w([...y,l])},me=t=>{w(y.filter(l=>l.id!==t))},j=(t,l,i)=>{w(y.map(b=>b.id===t?{...b,[l]:i}:b))},G=()=>{C.trim()&&!S.includes(C.trim())&&(A([...S,C.trim()]),B(""))},ue=t=>{A(S.filter(l=>l!==t))},L=()=>{const t=`RX-${Math.floor(1e3+Math.random()*9e3)}`;return{id:`RX-${Date.now()}`,rxNumber:t,patientName:f.trim()||"محترم مریض",patientPhone:c.trim()||"0300-0000000",patientAge:Number(P)||30,patientGender:M,patientCity:k,doctorId:o.id,doctorName:o.nameUrdu||o.nameEnglish,doctorSpecialization:o.specializationUrdu||o.specializationEnglish,doctorQualification:o.qualification,date:new Date().toISOString().split("T")[0],vitals:{bpSystolic:p,bpDiastolic:m,pulse:E,temperature:u,weightKg:T,bloodSugarMgDl:x,sugarType:"Random",spo2:g},presentingComplaintsUrdu:R,clinicalDiagnosisUrdu:q||"طبی معائنہ و ضعفِ عمومی (General Weakness)",medicines:y.filter(l=>l.name.trim().length>0),advisedTests:S,dietaryAdviceUrdu:O,precautionsUrdu:oe,followUpDate:F,qrVerificationCode:`https://hafizclinic.pk/verify-rx?rx=${t}`,appointmentId:d?.appointmentId,status:"Active",createdAt:new Date().toISOString()}},xe=async()=>{if(!f.trim()){alert(s?"براہ کرم مریض کا نام درج کریں۔":"Please enter patient name.");return}const t=L();await J(t),h&&h(t),alert(s?`ڈیجیٹل نسخہ (${t.rxNumber}) کامیابی سے محفوظ ہو گیا ہے۔`:`Prescription ${t.rxNumber} saved successfully.`),n()},ge=async()=>{if(!f.trim()){alert(s?"براہ کرم مریض کا نام درج کریں۔":"Please enter patient name.");return}const t=L();await J(t),h&&h(t),we(t,D),n()};return e.jsx("div",{className:"fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto",children:e.jsxs("div",{className:"bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-5xl my-4 overflow-hidden flex flex-col max-h-[92vh]",children:[e.jsxs("div",{className:"bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl",children:e.jsx(be,{className:"w-6 h-6 text-emerald-300"})}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-emerald-300 font-bold uppercase tracking-wider",children:s?"آفیشل ڈیجیٹل نسخہ و EMR پیڈ":"Official Digital Rx Pad & EMR"}),e.jsx("h2",{className:"text-xl font-black",children:s?"نیا نسخہ جاری کریں":"Generate Digital Prescription"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-700 hidden sm:inline-block",children:o.nameUrdu||o.nameEnglish}),e.jsx("button",{onClick:n,className:"p-2 hover:bg-emerald-800 rounded-full text-emerald-200 hover:text-white transition-colors",children:e.jsx(he,{className:"w-6 h-6"})})]})]}),e.jsxs("div",{className:"p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm",children:[e.jsxs("div",{className:"bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4",children:[e.jsxs("div",{className:"font-bold text-emerald-900 flex items-center gap-2 mb-3",children:[e.jsx(fe,{className:"w-4 h-4 text-emerald-700"}),e.jsx("span",{children:s?"۱۔ مریض کی بنیادی معلومات (Patient Demographics)":"1. Patient Demographics"})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"مریض کا نام *":"Patient Name *"}),e.jsx("input",{type:"text",value:f,onChange:t=>v(t.target.value),className:"w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none",placeholder:"محمد عثمان"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"فون نمبر":"Phone Number"}),e.jsx("input",{type:"text",value:c,onChange:t=>Q(t.target.value),className:"w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none",placeholder:"0300-1234567"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"عمر اور جنس":"Age & Gender"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"number",value:P,onChange:t=>Z(t.target.value),className:"w-16 bg-white border border-emerald-300 rounded-xl px-2 py-2 text-sm text-center font-bold",placeholder:"سال"}),e.jsxs("select",{value:M,onChange:t=>Y(t.target.value),className:"flex-1 bg-white border border-emerald-300 rounded-xl px-2 py-2 text-xs font-bold",children:[e.jsx("option",{value:"Male",children:s?"مرد (Male)":"Male"}),e.jsx("option",{value:"Female",children:s?"خاتون (Female)":"Female"}),e.jsx("option",{value:"Child",children:s?"بچہ (Child)":"Child"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"شہر / علاقہ":"City / Location"}),e.jsx("input",{type:"text",value:k,onChange:t=>ee(t.target.value),className:"w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none",placeholder:"لاہور"})]})]})]}),e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4",children:[e.jsxs("div",{className:"font-bold text-slate-800 flex items-center gap-2 mb-3",children:[e.jsx(V,{className:"w-4 h-4 text-rose-600"}),e.jsx("span",{children:s?"۲۔ مریض کے وائٹلز و علامات (Clinical Vitals)":"2. Clinical Vitals"})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3",children:[e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"BP (mmHg)"}),e.jsxs("div",{className:"flex items-center justify-center gap-1 mt-1",children:[e.jsx("input",{type:"number",value:p||"",onChange:t=>te(t.target.value?Number(t.target.value):void 0),className:"w-12 text-center font-black text-emerald-800 text-sm border-b border-emerald-400 outline-none",placeholder:"120"}),e.jsx("span",{children:"/"}),e.jsx("input",{type:"number",value:m||"",onChange:t=>ae(t.target.value?Number(t.target.value):void 0),className:"w-12 text-center font-black text-emerald-800 text-sm border-b border-emerald-400 outline-none",placeholder:"80"})]})]}),e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"Pulse (bpm)"}),e.jsx("input",{type:"number",value:E||"",onChange:t=>se(t.target.value?Number(t.target.value):void 0),className:"w-full text-center font-black text-rose-700 text-sm mt-1 border-b border-rose-300 outline-none",placeholder:"76"})]}),e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"Temp (°F)"}),e.jsx("input",{type:"number",step:"0.1",value:u||"",onChange:t=>ie(t.target.value?Number(t.target.value):void 0),className:"w-full text-center font-black text-amber-700 text-sm mt-1 border-b border-amber-300 outline-none",placeholder:"98.6"})]}),e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"Weight (kg)"}),e.jsx("input",{type:"number",value:T||"",onChange:t=>ne(t.target.value?Number(t.target.value):void 0),className:"w-full text-center font-black text-blue-700 text-sm mt-1 border-b border-blue-300 outline-none",placeholder:"70"})]}),e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"Sugar (mg/dL)"}),e.jsx("input",{type:"number",value:x||"",onChange:t=>re(t.target.value?Number(t.target.value):void 0),className:"w-full text-center font-black text-purple-700 text-sm mt-1 border-b border-purple-300 outline-none",placeholder:"110"})]}),e.jsxs("div",{className:"bg-white p-2.5 rounded-xl border border-slate-200 text-center",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-500 block",children:"SpO2 (%)"}),e.jsx("input",{type:"number",value:g||"",onChange:t=>le(t.target.value?Number(t.target.value):void 0),className:"w-full text-center font-black text-teal-700 text-sm mt-1 border-b border-teal-300 outline-none",placeholder:"98"})]})]}),(p&&p>=140||m&&m>=90||x&&x>=140||u&&u>=99.5||g&&g<95)&&e.jsxs("div",{className:"mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs",children:[e.jsxs("div",{className:"flex items-center gap-1.5 font-bold text-amber-900",children:[e.jsx(V,{className:"w-4 h-4 text-amber-700"}),e.jsx("span",{children:s?"طبی انتباہ و خودکار تشخیصی اشارے (CDSS Clinical Alerts):":"Clinical Decision Support Alerts:"})]}),e.jsxs("div",{className:"space-y-1 text-slate-700 font-medium",children:[(p&&p>=140||m&&m>=90)&&e.jsxs("div",{className:"flex items-center gap-1 text-rose-800",children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s?`ہائی بلڈ پریشر الرٹ (${p}/${m} mmHg): مریض کا بی پی بلند ہے۔ نمک اور چکنائی سے پرہیز اور معجون شفائے فشارِ خون تجویز کی جا سکتی ہے۔`:`Hypertension Flag (${p}/${m} mmHg): Recommend sodium restriction and antihypertensive review.`})]}),x&&x>=140&&e.jsxs("div",{className:"flex items-center gap-1 text-purple-800",children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s?`شوگر الرٹ (${x} mg/dL): بلڈ گلوکوز لیول ہائی ہے۔ سفوفِ ضیابیطس شوگر کنٹرول اور فاسٹنگ بی ایس ایف ٹیسٹ تجویز کریں۔`:`Hyperglycemia Alert (${x} mg/dL): Fasting glucose elevated. Recommend Safoof Diabetics and HbA1c screening.`})]}),u&&u>=99.5&&e.jsxs("div",{className:"flex items-center gap-1 text-amber-800",children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s?`بخار الرٹ (${u}°F): مریض کو بخار کی کیفیت ہے۔ شربتِ بنفشہ اور پیراسیٹامول معائنہ ضروری ہے۔`:`Pyrexia Alert (${u}°F): Patient is febrile. Consider antipyretic relief.`})]}),g&&g<95&&e.jsxs("div",{className:"flex items-center gap-1 text-rose-900 font-bold",children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s?`آکسیجن تنبیہ (SpO2: ${g}%): آکسیجن سیچوریشن کم ہے۔ فوری سینے کا معائنہ یا نیبولائزیشن درکار ہے۔`:`Hypoxemia Warning (SpO2: ${g}%): Saturation below normal target (>=95%). Assess airway and respiratory status.`})]})]})]})]}),e.jsxs("div",{className:"bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3.5 space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs font-bold text-emerald-950",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(K,{className:"w-4 h-4 text-emerald-700"}),e.jsx("span",{children:s?"خودکار پروٹوکول سلیکٹر (1-کلک مکمل نسخہ و ہدایات لوڈ کریں):":"Adaptive Clinical Protocols (1-Click Fill Rx & Care Plan):"})]}),e.jsx("span",{className:"text-[11px] text-emerald-700 font-mono",children:"Verified Protocols"})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:Ce.map(t=>e.jsxs("button",{type:"button",onClick:()=>{I(s?t.diagnosisUrdu:t.diagnosisEnglish),z(s?t.complaintsUrdu:t.complaintsEnglish),H(s?t.dietUrdu:t.dietEnglish);const l=t.medicines.map((i,b)=>({id:`med-${Date.now()}-${b}`,name:i.name,form:i.form,dosage:i.dosage,frequency:i.frequency,timing:i.timing,durationDays:i.durationDays,instructionsUrdu:i.instructionsUrdu}));w(i=>{const b=[...i,...l];return Array.from(new Map(b.map(W=>[W.name,W])).values())}),A(i=>Array.from(new Set([...i,...t.tests])))},className:"bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs",children:[e.jsx("span",{children:s?t.labelUrdu:t.labelEnglish}),e.jsx(X,{className:"w-3 h-3 text-emerald-600"})]},t.id))})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"مریض کی بنیادی شکایات و علامات (Complaints)":"Presenting Complaints"}),e.jsx("textarea",{value:R,onChange:t=>z(t.target.value),rows:2,className:"w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none",placeholder:s?"مثلاً: معدے میں جلن، گیس، سر درد، گھٹنوں میں درد...":"e.g. Gastric pain, headache, joint ache..."})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:s?"تشخیص معالج (Clinical Diagnosis) *":"Clinical Diagnosis *"}),e.jsx("input",{type:"text",value:q,onChange:t=>I(t.target.value),className:"w-full bg-white border border-emerald-400 rounded-xl p-2.5 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none",placeholder:s?"مثلاً: ضعفِ معدہ، کمپیوٹر ویژن سنڈروم، جوڑوں کا درد...":"e.g. Gastric Dyspepsia, CVS, Arthritis..."})]})]}),e.jsxs("div",{className:"border border-emerald-300 rounded-2xl p-4 bg-emerald-50/30",children:[e.jsxs("div",{className:"flex justify-between items-center mb-3",children:[e.jsxs("div",{className:"font-black text-emerald-900 flex items-center gap-2 text-base",children:[e.jsx("span",{className:"text-2xl font-serif text-emerald-700",children:"℞"}),e.jsx("span",{children:s?"تجویز کردہ ادویات و نسخہ (Prescription Medicines)":"Prescribed Medicines"})]}),e.jsxs("button",{type:"button",onClick:ce,className:"bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors",children:[e.jsx(X,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:s?"مزید دوا شامل کریں":"Add Medicine"})]})]}),e.jsxs("div",{className:"mb-3 flex items-center gap-1.5 flex-wrap",children:[e.jsxs("span",{className:"text-[11px] font-bold text-emerald-800 flex items-center gap-1",children:[e.jsx(K,{className:"w-3 h-3"}),s?"فوری نسخہ جات:":"Quick Presets:"]}),Se.slice(0,4).map((t,l)=>e.jsxs("button",{type:"button",onClick:()=>pe(t),className:"text-[10px] bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg transition-colors font-bold",children:["+ ",t.name.split(" ")[0]]},l))]}),e.jsx("div",{className:"space-y-3",children:y.map((t,l)=>e.jsxs("div",{className:"bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-12 gap-2 items-center",children:[e.jsx("div",{className:"sm:col-span-4",children:e.jsx("input",{type:"text",value:t.name,onChange:i=>j(t.id,"name",i.target.value),placeholder:s?"دوا کا نام درج کریں...":"Medicine name...",className:"w-full font-bold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"})}),e.jsx("div",{className:"sm:col-span-2",children:e.jsxs("select",{value:t.form,onChange:i=>j(t.id,"form",i.target.value),className:"w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px] font-medium",children:[e.jsx("option",{value:"Tablet",children:"Tablet (گولی)"}),e.jsx("option",{value:"Syrup",children:"Syrup (شربت)"}),e.jsx("option",{value:"Herbal Majoon",children:"Majoon (معجون)"}),e.jsx("option",{value:"Herbal Safoof",children:"Safoof (سفوف)"}),e.jsx("option",{value:"Eye Drops",children:"Eye Drops (قطرے)"}),e.jsx("option",{value:"Capsule",children:"Capsule"}),e.jsx("option",{value:"Cream / Ointment",children:"Cream / Oil"})]})}),e.jsx("div",{className:"sm:col-span-2",children:e.jsx("input",{type:"text",value:t.dosage,onChange:i=>j(t.id,"dosage",i.target.value),placeholder:"1 چمچ / 1 گولی",className:"w-full text-center border border-slate-300 rounded-lg px-2 py-1.5 text-xs"})}),e.jsx("div",{className:"sm:col-span-2",children:e.jsxs("select",{value:t.frequency,onChange:i=>j(t.id,"frequency",i.target.value),className:"w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px]",children:[e.jsx("option",{value:"1-0-1 (صبح و شام)",children:"1-0-1 (صبح و شام)"}),e.jsx("option",{value:"1-1-1 (تین وقت)",children:"1-1-1 (تین وقت)"}),e.jsx("option",{value:"0-0-1 (رات کو)",children:"0-0-1 (رات کو)"}),e.jsx("option",{value:"1-0-0 (صبح نہار)",children:"1-0-0 (صبح نہار)"}),e.jsx("option",{value:"ضرورت کے وقت (SOS)",children:"ضرورت کے وقت"})]})}),e.jsx("div",{className:"sm:col-span-1",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("input",{type:"number",value:t.durationDays,onChange:i=>j(t.id,"durationDays",Number(i.target.value)),className:"w-12 text-center border border-slate-300 rounded-lg px-1 py-1.5 text-xs font-bold"}),e.jsx("span",{className:"text-[10px] text-slate-500",children:"دن"})]})}),e.jsx("div",{className:"sm:col-span-1 text-right",children:e.jsx("button",{type:"button",onClick:()=>me(t.id),className:"p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors",title:"Remove Medicine",children:e.jsx(ve,{className:"w-4 h-4"})})})]}),e.jsx("input",{type:"text",value:t.instructionsUrdu||"",onChange:i=>j(t.id,"instructionsUrdu",i.target.value),placeholder:s?"خاص ہدایت: مثلاً نیم گرم دودھ کے ساتھ، کھانے کے بعد...":"Special instructions...",className:"w-full text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none"})]},t.id))})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4",children:[e.jsxs("div",{className:"font-bold text-slate-800 text-xs mb-2",children:["🔬 ",s?"تجویز کردہ لیب ٹیسٹ (Advised Lab Investigations)":"Advised Lab Investigations"]}),e.jsxs("div",{className:"flex gap-2 mb-2",children:[e.jsx("input",{type:"text",value:C,onChange:t=>B(t.target.value),onKeyDown:t=>t.key==="Enter"&&(t.preventDefault(),G()),placeholder:s?"ٹیسٹ کا نام درج کریں...":"Test name (e.g. CBC, Lipid Profile)...",className:"flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none"}),e.jsx("button",{type:"button",onClick:G,className:"bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs",children:"+"})]}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:S.map((t,l)=>e.jsxs("span",{className:"inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200",children:[t,e.jsx("button",{type:"button",onClick:()=>ue(t),className:"hover:text-rose-600 ml-1",children:"×"})]},l))})]}),e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"block text-xs font-bold text-slate-700 mb-1",children:["🥗 ",s?"پرہیز و غذائی رہنمائی (Diet & Lifestyle Advice)":"Dietary & Lifestyle Advice"]}),e.jsx("textarea",{value:O,onChange:t=>H(t.target.value),rows:2,className:"w-full bg-white border border-slate-300 rounded-xl p-2 text-xs outline-none"})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-xs font-bold text-emerald-800 mb-1",children:["🗓️ ",s?"اگلی چیک اپ کی تاریخ (Follow-Up Date)":"Follow-Up Date"]}),e.jsx("input",{type:"date",value:F,onChange:t=>de(t.target.value),className:"bg-white border border-emerald-400 font-bold rounded-xl px-3 py-1.5 text-xs outline-none text-emerald-900"})]})]})]})]}),e.jsxs("div",{className:"bg-slate-100 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3 shrink-0",children:[e.jsx("button",{type:"button",onClick:n,className:"px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors",children:s?"منسوخ کریں":"Cancel"}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("button",{type:"button",onClick:xe,className:"px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5",children:[e.jsx(ye,{className:"w-4 h-4"}),e.jsx("span",{children:s?"محفوظ کریں":"Save Prescription"})]}),e.jsxs("button",{type:"button",onClick:ge,className:"px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2",children:[e.jsx(je,{className:"w-4 h-4"}),e.jsx("span",{children:s?"محفوظ کریں اور پرنٹ نکالیں (Print Rx Pad)":"Save & Print Rx Pad"})]})]})]})]})})}export{Ce as ADAPTIVE_CLINICAL_PROTOCOLS,Ae as DigitalRxModal};
