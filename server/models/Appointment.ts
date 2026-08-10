import mongoose from 'mongoose';

export interface IAppointment extends mongoose.Document {
  id?: string;
  patientName: string;
  phone: string;
  city: string;
  problem: string;
  doctorName: string;
  timeSlot: string;
  status?: string;
  date?: string;
  patientId?: string;
  createdAt?: Date;
}

const AppointmentSchema = new mongoose.Schema({
  id: { type: String },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  problem: { type: String, required: true },
  doctorName: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  patientId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Appointment: any = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
