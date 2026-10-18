function h(e){if(!e)return"";let t=e.replace(/\D/g,"");return t.startsWith("0")?t="92"+t.slice(1):t.startsWith("3")&&t.length===10&&(t="92"+t),t}function f(e){const t=e.recipientName||e.patientName||"مریض",n=e.doctorName||"ڈاکٹر زیشان چوہدری",i=e.tokenNumber||"1",o=e.date||e.appointmentDate||"آج",r=e.timeSlot||"صبح 10:00 - 01:00",a=e.slipNo||e.slipNumber||"SLIP-1001",s=e.amountPaid??e.amount??0,l=e.balanceAmount??e.remainingBalance??0,u=e.totalAmount??s+l,c=e.problemOrNotes||e.serviceDetails,d=e.customMessage;switch(e.type){case"appointment_confirm":return{urdu:`محترم ${t} صاحب!
حافظ کلینک اینڈ ویژن سنٹر میں آپ کی اپائنٹمنٹ کامیابی سے بک ہو چکی ہے۔

📋 ٹوکن نمبر: #${i}
👨‍⚕️ معالج: ${n}
📅 تاریخ: ${o}
⏰ وقت: ${r}
🏥 پتہ: حافظ کلینک، نزد الحبیب بیکری، وزیرآباد روڈ، گوجرانوالہ
📞 رابطہ: 0300-6428789

برائے مہربانی اپنے مقررہ وقت سے 10 منٹ قبل تشریف لائیں۔ شکریہ!`,english:`Dear ${t},
Your appointment at Hafiz Clinic & Vision Center is confirmed.

Token Number: #${i}
Doctor: ${n}
Date: ${o}
Slot: ${r}
Location: Hafiz Clinic, Wazirabad Road, Gujranwala
Helpline: 0300-6428789

Please arrive 10 minutes prior to your time. Thank you!`};case"pending_appointment":return{urdu:`محترم ${t} صاحب!
حافظ کلینک اینڈ ہیلتھ کیئر سنٹر میں آپ کی اپائنٹمنٹ کی درخواست موصول ہو چکی ہے اور تصدیق کے عمل میں ہے (Pending Verification)۔

📋 اپائنٹمنٹ تفصیلات:
👤 مریض کا نام: ${t}
👨‍⚕️ معالج / ڈاکٹر: ${n}
📅 تاریخ: ${o}
⏰ وقت / سلاٹ: ${r}
🎫 متوقع ٹوکن: #${i}
${c?`🩺 طبی معائنہ / مسئلہ: ${c}
`:""}🏥 کلینک کا پتہ: حافظ کلینک، نزد الحبیب بیکری، وزیرآباد روڈ، گوجرانوالہ

⚠️ ضروری نوٹ: کلینک کوآرڈینیٹر آپ کی آمد کے شیڈول کی تصدیق کرے گا۔ کسی بھی وقت تبدیلی یا استفسار کے لیے اس نمبر پر رابطہ فرمائیں۔
📞 ہیلپ لائن: 0300-6428789
شکریہ! حافظ کلینک اینڈ ہیلتھ کیئر سسٹم`,english:`Dear ${t},
Your appointment request at Hafiz Clinic & Healthcare System has been received and is currently under review (Pending Confirmation).

📋 Appointment Details:
👤 Patient Name: ${t}
👨‍⚕️ Assigned Doctor: ${n}
📅 Scheduled Date: ${o}
⏰ Time Slot: ${r}
🎫 Expected Token: #${i}
${c?`🩺 Concern / Service: ${c}
`:""}🏥 Address: Hafiz Clinic, Near Al-Habib Bakery, Wazirabad Road, Gujranwala

⚠️ Important: Our clinic reception will verify your schedule. Please arrive 10 minutes prior to your slot.
📞 Helpline: 0300-6428789
Thank you! Hafiz Clinic Healthcare Team`};case"diagnostic_appointment":const $=e.testName||"تشخیصی و لیب ٹیسٹ",m=e.departmentName||"لیب / ریڈیالوجی",g=e.testFee?`Rs. ${e.testFee.toLocaleString()}`:"حسبِ ٹیسٹ مینو",p=e.testInstructions?`⚠️ ضروری ہدایات: ${e.testInstructions}
`:"";return{urdu:`محترم ${t} صاحب!
حافظ کلینک کی تشخیصی و لیب سروس میں آپ کا ٹیسٹ کامیابی سے بک ہو چکا ہے۔

🔬 ٹیسٹ کا نام: ${$}
🏢 شعبہ: ${m}
🎫 لیب ٹوکن نمبر: #${i}
📅 تاریخ: ${o}
⏰ وقت: ${r}
💵 تخمینی فیس: ${g}
${p}🏥 پتہ: حافظ کلینک بائیو اسکین و پیتھالوجی لیب، وزیرآباد روڈ، گوجرانوالہ
📞 ہیلپ لائن: 0300-6428789

برائے مہربانی اپنے مقررہ وقت پر کاؤنٹر پر ٹوکن دکھائیں۔ شکریہ!`,english:`Dear ${t},
Your diagnostic / lab test at Hafiz Clinic is confirmed.

Test: ${$}
Department: ${m}
Lab Token: #${i}
Date: ${o}
Slot: ${r}
Estimated Fee: ${g}
${e.testInstructions?`Note: ${e.testInstructions}
`:""}Location: Hafiz Clinic BioScan & Pathology Lab, Gujranwala
Helpline: 0300-6428789`};case"slip_receipt":return{urdu:`محترم ${t} صاحب!
حافظ کلینک سے آپ کی فیس اور ادویات کی آفیشل رسید جاری کر دی گئی ہے۔

🧾 رسید نمبر: ${a}
👨‍⚕️ ڈاکٹر / شعبہ: ${n}
${c?`📑 تفصیل: ${c}
`:""}💰 کل رقم: Rs. ${u.toLocaleString()}
✅ وصول شدہ رقم: Rs. ${s.toLocaleString()}
${l>0?`⚠️ واجب الادا بقایا: Rs. ${l.toLocaleString()}
`:`✨ اسٹیٹس: مکمل ادا شدہ (Paid)
`}
🏥 حافظ کلینک اینڈ آئی کیئر سنٹر، گوجرانوالہ
📞 ہیلپ لائن: 0300-6428789`,english:`Dear ${t},
Here is your official receipt from Hafiz Clinic & Vision Center.

Receipt No: ${a}
Doctor / Service: ${n}
${c?`Details: ${c}
`:""}Total Amount: Rs. ${u.toLocaleString()}
Amount Paid: Rs. ${s.toLocaleString()}
Balance: Rs. ${l.toLocaleString()}
Status: ${l>0?"Partial":"Fully Paid"}

Hafiz Clinic & Vision Center, Gujranwala
Helpline: 0300-6428789`};case"rx_advisory":return{urdu:`محترم مریض ${t}!
ڈاکٹر ${n} کی جانب سے آپ کا ڈیجیٹل نسخہ اور ضروری طبی ہدایات درج ذیل ہیں:

📋 نسخہ و خوراک:
${c||"تمام ادویات پانی کے ساتھ وقت پر استعمال کریں۔"}

⚠️ کسی بھی تکلیف یا ایمرجنسی کی صورت میں فوری رابطہ کریں۔
📞 ہیلپ لائن: 0300-6428789`,english:`Dear ${t},
Prescription advisory and instructions from Dr. ${n}:

Instructions & Rx:
${c||"Take all prescribed medicines on time with water."}

Helpline: 0300-6428789`};case"lab_ready":return{urdu:`محترم ${t}!
حافظ کلینک کی بائیو کوانٹم لیب سے آپ کی تشخیصی رپورٹ تیار ہو چکی ہے۔ آپ کلینک کاؤنٹر سے اصل رپورٹ حاصل کر سکتے ہیں یا اپنے پیشنٹ پورٹل پر لاگ ان کر کے آن لائن چیک کر سکتے ہیں۔
ہیلپ لائن: 0300-6428789`,english:`Dear ${t},
Your diagnostic lab report is now ready. You can collect it from Hafiz Clinic reception or view it on your Patient Portal.`};default:return{urdu:d||`محترم ${t}، حافظ کلینک کی جانب سے آپ کی خیریت دریافت کی جا رہی ہے۔`,english:d||`Dear ${t}, Greetings from Hafiz Clinic & Vision Center.`}}}function b(e,t){const n=h(e.recipientPhone);if(!n){alert(e.isUrdu||t==="urdu"?"مریض کا فون نمبر درست نہیں ہے۔":"Invalid recipient phone number.");return}const i=e.isUrdu!==void 0?e.isUrdu:t!=="english",o=f(e),r=i?o.urdu:o.english,a=encodeURIComponent(r),s=`https://wa.me/${n}?text=${a}`;window.open(s,"_blank","noopener,noreferrer")}function N(e,t=!0){const n=e.tokenNumber||e.token||(e.id&&e.id.startsWith("APP-")?e.id.replace("APP-",""):"101"),i=f({type:"pending_appointment",recipientPhone:e.phone,patientName:e.patientName,doctorName:e.doctorName,appointmentDate:e.date,timeSlot:e.timeSlot,tokenNumber:n,problemOrNotes:e.problem}),o=h(e.phone),r=t?i.urdu:i.english,a=encodeURIComponent(r),s=o?`https://wa.me/${o}?text=${a}`:"";return{urdu:i.urdu,english:i.english,activeMessage:r,waUrl:s,phone:o}}function P(e,t=!0){const n=N(e,t);if(!n.phone){alert(t?"مریض کا درست موبائل فون نمبر موجود نہیں ہے۔":"Valid recipient mobile phone number is missing.");return}window.open(n.waUrl,"_blank","noopener,noreferrer")}export{N as g,b as o,P as s};
