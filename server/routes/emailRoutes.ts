import { Router, Request, Response } from 'express';
import {
  getEmailServiceStatus,
  sendLabReportCompletedEmail,
  sendPrescriptionCompletedEmail,
  sendEmail,
} from '../services/emailService';
import { User } from '../models/User';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

// Helper to resolve patient email from DB if not passed directly
export async function resolvePatientEmail(info: {
  email?: string;
  phone?: string;
  mrn?: string;
  patientId?: string;
  patientName?: string;
}): Promise<string | null> {
  if (info.email && info.email.includes('@')) {
    return info.email.trim();
  }

  try {
    if (getMongoConnectedStatus()) {
      if (info.phone) {
        const cleanPhone = info.phone.replace(/\D/g, '');
        const u = await User.findOne({
          $or: [{ phone: info.phone }, { phone: new RegExp(cleanPhone.slice(-7)) }],
        });
        if (u?.email && u.email.includes('@')) return u.email.trim();
      }

      if (info.mrn) {
        const u = await User.findOne({ mrn: info.mrn });
        if (u?.email && u.email.includes('@')) return u.email.trim();
      }

      if (info.patientId) {
        const u = await User.findOne({ $or: [{ _id: info.patientId }, { mrn: info.patientId }] });
        if (u?.email && u.email.includes('@')) return u.email.trim();
      }

      if (info.patientName) {
        const u = await User.findOne({ name: new RegExp(`^${info.patientName.trim()}$`, 'i') });
        if (u?.email && u.email.includes('@')) return u.email.trim();
      }
    }
  } catch (err) {
    console.error('Error resolving patient email:', err);
  }

  return null;
}

// GET /api/email/status - Checks SMTP service configuration status
router.get('/status', (req: Request, res: Response) => {
  return res.json({
    success: true,
    status: getEmailServiceStatus(),
  });
});

// POST /api/email/send-lab-report - Dispatches automated PDF Lab Report to patient
router.post('/send-lab-report', async (req: Request, res: Response) => {
  try {
    const { patientEmail, email, patientName, patientPhone, testName, reportData, customPdfBase64 } = req.body;

    let targetEmail = patientEmail || email;
    if (!targetEmail) {
      targetEmail = await resolvePatientEmail({
        email,
        phone: patientPhone || reportData?.patientPhone,
        patientName: patientName || reportData?.patientName,
        mrn: reportData?.mrn || reportData?.patientMrn,
      });
    }

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email address found for this patient. Please specify an email address.',
      });
    }

    const customPdfBuffer = customPdfBase64
      ? Buffer.from(customPdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
      : undefined;

    const result = await sendLabReportCompletedEmail({
      recipientEmail: targetEmail,
      patientName: patientName || reportData?.patientName || 'Valued Patient',
      testName: testName || reportData?.testName || 'Diagnostic Lab Investigation',
      reportData: reportData || {},
      customPdfBuffer,
    });

    return res.json({
      success: result.success,
      recipient: targetEmail,
      message: result.success
        ? `Lab report PDF successfully emailed to ${targetEmail}`
        : (result as any).error || (result as any).message || 'Failed to dispatch email',
      details: result,
    });
  } catch (err: any) {
    console.error('Error in send-lab-report endpoint:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/email/send-prescription - Dispatches automated PDF Prescription to patient
router.post('/send-prescription', async (req: Request, res: Response) => {
  try {
    const { patientEmail, email, patientName, patientPhone, doctorName, prescriptionData, customPdfBase64 } = req.body;

    let targetEmail = patientEmail || email;
    if (!targetEmail) {
      targetEmail = await resolvePatientEmail({
        email,
        phone: patientPhone || prescriptionData?.patientPhone,
        patientName: patientName || prescriptionData?.patientName,
        mrn: prescriptionData?.mrnNumber || prescriptionData?.patientId,
      });
    }

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email address found for this patient. Please specify an email address.',
      });
    }

    const customPdfBuffer = customPdfBase64
      ? Buffer.from(customPdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
      : undefined;

    const result = await sendPrescriptionCompletedEmail({
      recipientEmail: targetEmail,
      patientName: patientName || prescriptionData?.patientName || 'Valued Patient',
      doctorName: doctorName || prescriptionData?.doctorName || 'Dr. Zeeshan Chaudhry',
      prescriptionData: prescriptionData || {},
      customPdfBuffer,
    });

    return res.json({
      success: result.success,
      recipient: targetEmail,
      message: result.success
        ? `Prescription summary PDF successfully emailed to ${targetEmail}`
        : (result as any).error || (result as any).message || 'Failed to dispatch email',
      details: result,
    });
  } catch (err: any) {
    console.error('Error in send-prescription endpoint:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/email/test - Test email sending
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }

    const result = await sendEmail({
      to,
      subject: 'Hafiz Clinic & Healthcare - SMTP Test Notification',
      html: `
        <div style="font-family:sans-serif; padding:20px; color:#1e293b;">
          <h2 style="color:#065f46;">Hafiz Clinic Nodemailer Service Online</h2>
          <p>This is a test notification confirming that the backend email integration is functioning properly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
