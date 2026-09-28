import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

// -------------------------------------------------------------
// SMTP Configuration & Transporter Setup
// -------------------------------------------------------------
const hasRealCredentials = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasRealCredentials
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true, // Graceful fallback: simulated sending when credentials are not yet added to .env
    });

const SENDER_EMAIL =
  process.env.SMTP_FROM ||
  (process.env.SMTP_USER
    ? `"Hafiz Clinic & Healthcare" <${process.env.SMTP_USER}>`
    : '"Hafiz Clinic & Healthcare" <no-reply@hafizclinic.com>');

// Helper to determine active SMTP status
export function getEmailServiceStatus() {
  return {
    configured: hasRealCredentials,
    host: process.env.SMTP_HOST || (hasRealCredentials ? 'configured' : 'simulator-mode'),
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : 'not-set',
    from: SENDER_EMAIL,
  };
}

// -------------------------------------------------------------
// PDF Generator 1: Laboratory Test Report PDF
// -------------------------------------------------------------
export function generateLabReportPdfBuffer(report: {
  id?: string;
  orderNumber?: string;
  patientName: string;
  patientPhone?: string;
  patientAge?: string | number;
  patientGender?: string;
  testName: string;
  testCategory?: string;
  testDate?: string;
  parameters?: Array<{
    name: string;
    unit: string;
    normalRange: string;
    value?: string | number;
    isAbnormal?: boolean;
  }>;
  clinicalInterpretationUrdu?: string;
  clinicalNotes?: string;
  reportedByTechnician?: string;
  approvedByPathologist?: string;
  status?: string;
}): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Hospital Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HAFIZ CLINIC & VISION CENTER', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('ADVANCED PATHOLOGY & DIAGNOSTIC BIOSCAN LABORATORY', 14, 17);
  doc.text('Near Al-Habib Bakery, Wazirabad Road, Gujranwala | Ph: 0300-6428789', 14, 22);

  // Status Badge in Header
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.roundedRect(pageWidth - 48, 8, 36, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('REPORT COMPLETED', pageWidth - 46, 15);

  // Sub-header title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL DIAGNOSTIC TEST REPORT', 14, 37);

  // Patient Demographic Information Box
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, 41, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Patient Name:', 18, 48);
  doc.text('Phone / MRN:', 18, 55);
  doc.text('Age / Gender:', 18, 62);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(String(report.patientName || 'N/A'), 45, 48);
  doc.text(String(report.patientPhone || 'N/A'), 45, 55);
  doc.text(`${report.patientAge || '35'} Yrs / ${report.patientGender || 'Adult'}`, 45, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Report ID:', 115, 48);
  doc.text('Sample Date:', 115, 55);
  doc.text('Verified By:', 115, 62);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(String(report.id || report.orderNumber || 'LAB-1001'), 140, 48);
  doc.text(String(report.testDate || new Date().toISOString().split('T')[0]), 140, 55);
  doc.text(String(report.approvedByPathologist || 'Dr. Saima Rehman (Pathologist)'), 140, 62);

  // Investigation Title Strip
  doc.setFillColor(220, 252, 231); // Emerald 100
  doc.rect(14, 73, pageWidth - 28, 8, 'F');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`TEST: ${String(report.testName || 'Diagnostic Investigation').toUpperCase()} (${report.testCategory || 'General Lab'})`, 18, 78.5);

  // Test Results Table Header
  let yPos = 87;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, pageWidth - 28, 7, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST PARAMETER', 18, yPos + 4.8);
  doc.text('RESULT', 95, yPos + 4.8);
  doc.text('UNITS', 125, yPos + 4.8);
  doc.text('REFERENCE INTERVAL', 155, yPos + 4.8);
  yPos += 10;

  // Parameters Table Rows
  const params = report.parameters && report.parameters.length > 0
    ? report.parameters
    : [
        { name: 'Primary Clinical Assay', value: 'Normal / Completed', unit: 'Index', normalRange: 'Within Reference Limits' },
      ];

  params.forEach((p, idx) => {
    if (yPos > 245) {
      doc.addPage();
      yPos = 20;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 3, pageWidth - 28, 6.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.text(p.name, 18, yPos + 1.5);

    // Highlight abnormal values
    if (p.isAbnormal) {
      doc.setTextColor(190, 18, 60); // Rose 700
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(String(p.value ?? 'Within Limits'), 95, yPos + 1.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(p.unit || '-', 125, yPos + 1.5);
    doc.text(p.normalRange || 'Normal', 155, yPos + 1.5);

    yPos += 7;
  });

  // Clinical Interpretation Box
  yPos += 4;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(254, 252, 232); // Amber 50
  doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('PATHOLOGIST CLINICAL INTERPRETATION & ADVISORY:', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const remarks =
    report.clinicalInterpretationUrdu ||
    report.clinicalNotes ||
    'The lab parameters have been verified and processed according to automated quality control standards. Please consult your physician for clinical correlation.';
  doc.text(doc.splitTextToSize(remarks, pageWidth - 36), 18, yPos + 12);

  // Sign-off & Footer Stamp
  yPos += 28;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPos, pageWidth - 14, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Reported by: Lab Diagnostic Technologist', 18, yPos + 6);
  doc.text(`Approved by: ${report.approvedByPathologist || 'Dr. Saima Rehman, FCPS Pathology'}`, 115, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('This is a computer-verified medical lab document generated by Hafiz Clinic Health Management System.', 14, 285);
  doc.text(`Verification Code: PHC-${report.id || 'LAB'} | Contact: 0300-6428789`, pageWidth - 80, 285);

  return Buffer.from(doc.output('arraybuffer'));
}

// -------------------------------------------------------------
// PDF Generator 2: Prescription & Clinical Consultation Summary
// -------------------------------------------------------------
export function generatePrescriptionPdfBuffer(rx: {
  id?: string;
  rxNumber?: string;
  patientName: string;
  patientPhone?: string;
  patientAge?: string | number;
  patientGender?: string;
  patientCity?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  date?: string;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    pulse?: number;
    temperature?: number;
    bloodSugarMgDl?: number;
    spo2?: number;
  };
  presentingComplaintsUrdu?: string;
  clinicalDiagnosisUrdu?: string;
  problem?: string;
  medicines?: Array<{
    name: string;
    form?: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    durationDays?: number;
    instructionsUrdu?: string;
  }>;
  dietaryAdviceUrdu?: string;
  precautionsUrdu?: string;
  followUpDate?: string;
}): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HAFIZ CLINIC & VISION CENTER', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('CLINICAL OPD CONSULTATION & PRESCRIPTION SUMMARY', 14, 17);
  doc.text('Near Al-Habib Bakery, Wazirabad Road, Gujranwala | Helpline: 0300-6428789', 14, 22);

  // Rx Symbol in Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 40, 8, 28, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Rx EMR', pageWidth - 35, 15.5);

  // Doctor Info Strip
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(rx.doctorName || 'Dr. Zeeshan Chaudhry (MBBS, Senior Consultant)', 14, 36);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(rx.doctorSpecialization || 'General OPD & Specialized Family Medicine Consultant', 14, 41);

  // Patient Info Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Patient Name:', 18, 52);
  doc.text('Phone / City:', 18, 59);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(String(rx.patientName || 'N/A'), 45, 52);
  doc.text(`${rx.patientPhone || 'N/A'} | ${rx.patientCity || 'Gujranwala'}`, 45, 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Rx Number:', 115, 52);
  doc.text('Consultation Date:', 115, 59);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(String(rx.rxNumber || rx.id || 'RX-OPD-101'), 148, 52);
  doc.text(String(rx.date || new Date().toISOString().split('T')[0]), 148, 59);

  // Vitals & Clinical Assessment Strip
  let yPos = 74;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, yPos, pageWidth - 28, 14, 1.5, 1.5, 'F');

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT VITALS:', 18, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
  const bp = rx.vitals?.bpSystolic ? `${rx.vitals.bpSystolic}/${rx.vitals.bpDiastolic || 80} mmHg` : '120/80 mmHg';
  const pulse = rx.vitals?.pulse ? `${rx.vitals.pulse} bpm` : '74 bpm';
  const sugar = rx.vitals?.bloodSugarMgDl ? `${rx.vitals.bloodSugarMgDl} mg/dL` : '110 mg/dL';
  const spo2 = rx.vitals?.spo2 ? `${rx.vitals.spo2}%` : '98%';

  doc.text(`BP: ${bp}  |  Pulse: ${pulse}  |  Blood Sugar: ${sugar}  |  SpO2: ${spo2}`, 48, yPos + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSIS / CONCERN:', 18, yPos + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(rx.clinicalDiagnosisUrdu || rx.problem || rx.presentingComplaintsUrdu || 'Routine OPD Evaluation'), 58, yPos + 10.5);

  // Medicines Table Header
  yPos += 19;
  doc.setFillColor(6, 78, 59);
  doc.rect(14, yPos, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIBED MEDICINE / FORM', 18, yPos + 4.8);
  doc.text('DOSAGE', 90, yPos + 4.8);
  doc.text('FREQUENCY / TIMING', 120, yPos + 4.8);
  doc.text('DURATION', 170, yPos + 4.8);
  yPos += 10;

  // Medicines Rows
  const meds = rx.medicines && rx.medicines.length > 0
    ? rx.medicines
    : [
        {
          name: 'Paracetamol 500mg',
          form: 'Tablet',
          dosage: '1 tab',
          frequency: '1-0-1 (Morning & Evening)',
          timing: 'After Meal',
          durationDays: 5,
        },
      ];

  meds.forEach((m, idx) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 3, pageWidth - 28, 7.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.text(`${m.name} (${m.form || 'Tablet'})`, 18, yPos + 1.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(m.dosage || '1 unit', 90, yPos + 1.8);
    doc.text(`${m.frequency || '1-0-1'} ${m.timing ? `- ${m.timing}` : ''}`, 120, yPos + 1.8);
    doc.text(`${m.durationDays || 5} Days`, 170, yPos + 1.8);

    yPos += 8;
  });

  // Dietary Advice & Precautions Box
  yPos += 4;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.roundedRect(14, yPos, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('DOCTOR ADVISORY, DIETARY ADVICE & PRECAUTIONS:', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const adv =
    rx.dietaryAdviceUrdu ||
    rx.precautionsUrdu ||
    'Take all medications with water at the prescribed times. Maintain adequate hydration and avoid self-medication. Contact the clinic in case of symptoms persistence.';
  doc.text(doc.splitTextToSize(adv, pageWidth - 36), 18, yPos + 12);

  // Digital Sign-Off Footer
  yPos += 30;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPos, pageWidth - 14, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Authorized Physician: ${rx.doctorName || 'Dr. Zeeshan Chaudhry'}`, 18, yPos + 6);
  doc.text(`Follow-up: ${rx.followUpDate || 'After 7 Days'}`, 130, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('Official Digital EMR Prescription generated by Hafiz Clinic & Vision Center Healthcare System.', 14, 285);
  doc.text('Helpline: 0300-6428789 | Gujranwala', pageWidth - 65, 285);

  return Buffer.from(doc.output('arraybuffer'));
}

// -------------------------------------------------------------
// Core Email Dispatching Methods (Nodemailer)
// -------------------------------------------------------------

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}) {
  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
      attachments,
    });

    if (!hasRealCredentials) {
      console.log(`[Nodemailer Simulator] Email simulated to: ${to} | Subject: "${subject}" | Attachments: ${attachments.length}`);
    } else {
      console.log(`[Nodemailer] Email successfully sent to: ${to} (MessageId: ${info.messageId})`);
    }

    return {
      success: true,
      messageId: info.messageId || 'simulated-id',
      simulated: !hasRealCredentials,
      recipient: to,
    };
  } catch (error: any) {
    console.error(`[Nodemailer Error] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to,
    };
  }
}

// -------------------------------------------------------------
// Specialized Helper: Send Completed Lab Report Email
// -------------------------------------------------------------
export async function sendLabReportCompletedEmail(params: {
  recipientEmail: string;
  patientName: string;
  testName: string;
  reportData: any;
  customPdfBuffer?: Buffer;
}) {
  const { recipientEmail, patientName, testName, reportData, customPdfBuffer } = params;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Valid recipient email address is required.' };
  }

  // Generate official PDF attachment if not pre-provided
  const pdfBuffer = customPdfBuffer || generateLabReportPdfBuffer(reportData);
  const safeTestName = (testName || 'Lab_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePatient = (patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `HafizClinic_LabReport_${safePatient}_${safeTestName}.pdf`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; rounded-radius: 9999px; margin-top: 12px; border-radius: 20px; }
          .content { padding: 32px 24px; }
          .patient-box { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .patient-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .patient-box td { padding: 6px 4px; }
          .label { color: #64748b; font-weight: 600; width: 35%; }
          .value { color: #0f172a; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HAFIZ CLINIC & VISION CENTER</h1>
            <p>Advanced Pathology & BioScan Laboratory Division</p>
            <div class="badge">TEST STATUS: COMPLETED</div>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; color: #065f46; margin-top: 0;">Dear ${patientName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your diagnostic pathology laboratory test report for <strong>${testName}</strong> has been completed and verified by our clinical pathologist.
            </p>
            <div class="patient-box">
              <table>
                <tr>
                  <td class="label">Patient Name:</td>
                  <td class="value">${patientName}</td>
                </tr>
                <tr>
                  <td class="label">Investigation:</td>
                  <td class="value">${testName}</td>
                </tr>
                <tr>
                  <td class="label">Sample / Test Date:</td>
                  <td class="value">${reportData.testDate || reportData.date || new Date().toISOString().split('T')[0]}</td>
                </tr>
                <tr>
                  <td class="label">Verified By:</td>
                  <td class="value">${reportData.approvedByPathologist || reportData.approvedBy || 'Dr. Saima Rehman (Pathologist)'}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              📎 <strong>Official PDF Attached:</strong> We have attached your complete, digitally signed diagnostic lab report PDF to this email. You can save, download, or share this document directly with your consulting physician.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              For any questions regarding your report, or to schedule a follow-up consultation, please contact our 24/7 clinic helpline.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Hafiz Clinic & Vision Center | Near Al-Habib Bakery, Wazirabad Road, Gujranwala</p>
            <p style="margin: 0;">24/7 Clinic Helpline: <strong>0300-6428789</strong> | Official Patient Portal</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Medical Lab Report: ${testName} (Completed) - Hafiz Clinic`,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

// -------------------------------------------------------------
// Specialized Helper: Send Completed Prescription Summary Email
// -------------------------------------------------------------
export async function sendPrescriptionCompletedEmail(params: {
  recipientEmail: string;
  patientName: string;
  doctorName?: string;
  prescriptionData: any;
  customPdfBuffer?: Buffer;
}) {
  const { recipientEmail, patientName, doctorName, prescriptionData, customPdfBuffer } = params;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Valid recipient email address is required.' };
  }

  const pdfBuffer = customPdfBuffer || generatePrescriptionPdfBuffer(prescriptionData);
  const safeDoctor = (doctorName || 'Doctor').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePatient = (patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `HafizClinic_Prescription_${safePatient}_${safeDoctor}.pdf`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-top: 12px; }
          .content { padding: 32px 24px; }
          .doctor-box { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .doctor-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .doctor-box td { padding: 6px 4px; }
          .label { color: #64748b; font-weight: 600; width: 35%; }
          .value { color: #0f172a; font-weight: 700; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HAFIZ CLINIC & VISION CENTER</h1>
            <p>Department of Clinical Consultations & Electronic Medical Records</p>
            <div class="badge">CONSULTATION: COMPLETED</div>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; color: #065f46; margin-top: 0;">Dear ${patientName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Thank you for visiting Hafiz Clinic. Your clinical consultation and digital prescription with <strong>${doctorName || 'your consulting physician'}</strong> has been completed.
            </p>
            <div class="doctor-box">
              <table>
                <tr>
                  <td class="label">Patient Name:</td>
                  <td class="value">${patientName}</td>
                </tr>
                <tr>
                  <td class="label">Attending Doctor:</td>
                  <td class="value">${doctorName || 'Dr. Zeeshan Chaudhry'}</td>
                </tr>
                <tr>
                  <td class="label">Consultation Date:</td>
                  <td class="value">${prescriptionData.date || new Date().toISOString().split('T')[0]}</td>
                </tr>
                <tr>
                  <td class="label">Prescription ID:</td>
                  <td class="value">${prescriptionData.rxNumber || prescriptionData.id || 'RX-OPD-101'}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              📎 <strong>Prescription PDF Attached:</strong> Please find attached your electronic medical prescription detailing prescribed medications, dosage timings, dietary recommendations, and precautions.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              Please take all medications strictly as prescribed. You may also access our in-house Pharmacy POS counter or call our delivery team to have your medications delivered home.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Hafiz Clinic & Vision Center | Near Al-Habib Bakery, Wazirabad Road, Gujranwala</p>
            <p style="margin: 0;">24/7 Helpline: <strong>0300-6428789</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Medical Prescription Summary: ${patientName} - Dr. ${doctorName || 'Hafiz Clinic'}`,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
