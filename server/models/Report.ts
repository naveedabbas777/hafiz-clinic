import mongoose from 'mongoose';

export interface IReport extends mongoose.Document {
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  testNameUrdu: string;
  testNameEnglish: string;
  summary?: string;
  fileUrl?: string;
  status?: string;
  doctorComment?: string;
  date?: string;
  createdAt?: Date;
}

const ReportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String },
  doctorName: { type: String },
  testNameUrdu: { type: String, required: true },
  testNameEnglish: { type: String, required: true },
  summary: { type: String },
  fileUrl: { type: String },
  status: { type: String, default: 'Submitted' },
  doctorComment: { type: String },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now },
});

export const Report: any = mongoose.models.Report || mongoose.model('Report', ReportSchema);
