import mongoose from 'mongoose';

export interface IAppointment extends mongoose.Document {
  id?: string;
  patientName: string;
  phone: string;
  city: string;
  problem: string;
  doctorName: string;
  doctorFee?: number;
  timeSlot: string;
  status?: string;
  date?: string;
  patientId?: string;
  tokenNumber?: number | string;
  referralToken?: string;
  referralFromDoctor?: string;
  referralToDoctor?: string;
  referralService?: string;
  referralNotes?: string;
  referralFee?: number;
  referralStatus?: string;
  isReferral?: boolean;
  invoiceId?: string;
  createdAt?: Date;
}

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, index: true },
  patientName: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  city: { type: String, required: true },
  problem: { type: String, required: true },
  doctorName: { type: String, required: true, index: true },
  doctorFee: { type: Number, default: 1500 },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'Pending', index: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0], index: true },
  patientId: { type: String, index: true },
  tokenNumber: { type: mongoose.Schema.Types.Mixed },
  referralToken: { type: String, index: true },
  referralFromDoctor: { type: String },
  referralToDoctor: { type: String },
  referralService: { type: String },
  referralNotes: { type: String },
  referralFee: { type: Number, default: 0 },
  referralStatus: { type: String, default: 'Pending' },
  isReferral: { type: Boolean, default: false },
  invoiceId: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

AppointmentSchema.index({ phone: 1, date: -1 });
AppointmentSchema.index({ doctorName: 1, date: -1, status: 1 });

export const Appointment: any = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
