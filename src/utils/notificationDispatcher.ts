import { Appointment, MoneySlip } from '../types';

export interface DispatchNotificationParams {
  type: 'appointment_confirm' | 'slip_receipt' | 'rx_advisory' | 'lab_ready' | 'custom';
  recipientPhone?: string;
  recipientName?: string;
  patientName?: string;
  doctorName?: string;
  tokenNumber?: number | string;
  date?: string;
  appointmentDate?: string;
  timeSlot?: string;
  slipNo?: string;
  slipNumber?: string;
  amountPaid?: number;
  amount?: number;
  balanceAmount?: number;
  remainingBalance?: number;
  totalAmount?: number;
  serviceDetails?: string;
  problemOrNotes?: string;
  customMessage?: string;
  isUrdu?: boolean;
}

export function cleanPakistanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  return clean;
}

export function generateNotificationText(params: DispatchNotificationParams): { urdu: string; english: string } {
  const recipientName = params.recipientName || params.patientName || 'مریض';
  const doctorName = params.doctorName || 'ڈاکٹر زیشان چوہدری';
  const tokenNumber = params.tokenNumber || '1';
  const date = params.date || params.appointmentDate || 'آج';
  const timeSlot = params.timeSlot || 'صبح 10:00 - 01:00';
  const slipNo = params.slipNo || params.slipNumber || 'SLIP-1001';
  const amountPaid = params.amountPaid ?? params.amount ?? 0;
  const balanceAmount = params.balanceAmount ?? params.remainingBalance ?? 0;
  const totalAmount = params.totalAmount ?? (amountPaid + balanceAmount);
  const problemOrNotes = params.problemOrNotes || params.serviceDetails;
  const customMessage = params.customMessage;

  switch (params.type) {
    case 'appointment_confirm':
      return {
        urdu: `محترم ${recipientName} صاحب!
حافظ کلینک اینڈ ویژن سنٹر میں آپ کی اپائنٹمنٹ کامیابی سے بک ہو چکی ہے۔

📋 ٹوکن نمبر: #${tokenNumber}
👨‍⚕️ معالج: ${doctorName}
📅 تاریخ: ${date}
⏰ وقت: ${timeSlot}
🏥 پتہ: حافظ کلینک، نزد الحبیب بیکری، وزیرآباد روڈ، گوجرانوالہ
📞 رابطہ: 0300-6428789

برائے مہربانی اپنے مقررہ وقت سے 10 منٹ قبل تشریف لائیں۔ شکریہ!`,
        english: `Dear ${recipientName},
Your appointment at Hafiz Clinic & Vision Center is confirmed.

Token Number: #${tokenNumber}
Doctor: ${doctorName}
Date: ${date}
Slot: ${timeSlot}
Location: Hafiz Clinic, Wazirabad Road, Gujranwala
Helpline: 0300-6428789

Please arrive 10 minutes prior to your time. Thank you!`,
      };

    case 'slip_receipt':
      return {
        urdu: `محترم ${recipientName} صاحب!
حافظ کلینک سے آپ کی فیس اور ادویات کی آفیشل رسید جاری کر دی گئی ہے۔

🧾 رسید نمبر: ${slipNo}
👨‍⚕️ ڈاکٹر / شعبہ: ${doctorName}
${problemOrNotes ? `📑 تفصیل: ${problemOrNotes}\n` : ''}💰 کل رقم: Rs. ${totalAmount.toLocaleString()}
✅ وصول شدہ رقم: Rs. ${amountPaid.toLocaleString()}
${balanceAmount > 0 ? `⚠️ واجب الادا بقایا: Rs. ${balanceAmount.toLocaleString()}\n` : '✨ اسٹیٹس: مکمل ادا شدہ (Paid)\n'}
🏥 حافظ کلینک اینڈ آئی کیئر سنٹر، گوجرانوالہ
📞 ہیلپ لائن: 0300-6428789`,
        english: `Dear ${recipientName},
Here is your official receipt from Hafiz Clinic & Vision Center.

Receipt No: ${slipNo}
Doctor / Service: ${doctorName}
${problemOrNotes ? `Details: ${problemOrNotes}\n` : ''}Total Amount: Rs. ${totalAmount.toLocaleString()}
Amount Paid: Rs. ${amountPaid.toLocaleString()}
Balance: Rs. ${balanceAmount.toLocaleString()}
Status: ${balanceAmount > 0 ? 'Partial' : 'Fully Paid'}

Hafiz Clinic & Vision Center, Gujranwala
Helpline: 0300-6428789`,
      };

    case 'rx_advisory':
      return {
        urdu: `محترم مریض ${recipientName}!
ڈاکٹر ${doctorName} کی جانب سے آپ کا ڈیجیٹل نسخہ اور ضروری طبی ہدایات درج ذیل ہیں:

📋 نسخہ و خوراک:
${problemOrNotes || 'تمام ادویات پانی کے ساتھ وقت پر استعمال کریں۔'}

⚠️ کسی بھی تکلیف یا ایمرجنسی کی صورت میں فوری رابطہ کریں۔
📞 ہیلپ لائن: 0300-6428789`,
        english: `Dear ${recipientName},
Prescription advisory and instructions from Dr. ${doctorName}:

Instructions & Rx:
${problemOrNotes || 'Take all prescribed medicines on time with water.'}

Helpline: 0300-6428789`,
      };

    case 'lab_ready':
      return {
        urdu: `محترم ${recipientName}!
حافظ کلینک کی بائیو کوانٹم لیب سے آپ کی تشخیصی رپورٹ تیار ہو چکی ہے۔ آپ کلینک کاؤنٹر سے اصل رپورٹ حاصل کر سکتے ہیں یا اپنے پیشنٹ پورٹل پر لاگ ان کر کے آن لائن چیک کر سکتے ہیں۔
ہیلپ لائن: 0300-6428789`,
        english: `Dear ${recipientName},
Your diagnostic lab report is now ready. You can collect it from Hafiz Clinic reception or view it on your Patient Portal.`,
      };

    default:
      return {
        urdu: customMessage || `محترم ${recipientName}، حافظ کلینک کی جانب سے آپ کی خیریت دریافت کی جا رہی ہے۔`,
        english: customMessage || `Dear ${recipientName}, Greetings from Hafiz Clinic & Vision Center.`,
      };
  }
}

export function openWhatsAppNotification(params: DispatchNotificationParams, language?: 'urdu' | 'english'): void {
  const phone = cleanPakistanPhoneNumber(params.recipientPhone);
  if (!phone) {
    alert(params.isUrdu || language === 'urdu' ? 'مریض کا فون نمبر درست نہیں ہے۔' : 'Invalid recipient phone number.');
    return;
  }
  const useUrdu = params.isUrdu !== undefined ? params.isUrdu : language !== 'english';
  const texts = generateNotificationText(params);
  const message = useUrdu ? texts.urdu : texts.english;
  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encoded}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

export function sendSMSNotification(params: DispatchNotificationParams, language?: 'urdu' | 'english'): void {
  const phone = cleanPakistanPhoneNumber(params.recipientPhone);
  const useUrdu = params.isUrdu !== undefined ? params.isUrdu : language !== 'english';
  const texts = generateNotificationText(params);
  const message = useUrdu ? texts.urdu : texts.english;
  const encoded = encodeURIComponent(message);
  const smsUrl = `sms:${phone}?body=${encoded}`;
  window.open(smsUrl, '_blank');
}

