import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  username: string;
  password?: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse' | 'ipd_incharge' | 'pharmacist' | 'lab_doctor' | 'receptionist';
  department?: string;
  assignedLabCategory?: string;
  phone?: string;
  city?: string;
  address?: string;
  mrn?: string;
  specialization?: string;
  qualification?: string;
  medicalHistory?: string;
  status?: string;
  createdAt?: Date;
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin', 'nurse', 'ipd_incharge', 'pharmacist', 'lab_doctor', 'receptionist'], default: 'patient', index: true },
  department: { type: String },
  assignedLabCategory: { type: String },
  phone: { type: String, index: true },
  city: { type: String },
  address: { type: String },
  mrn: { type: String, index: true },
  specialization: { type: String },
  qualification: { type: String },
  medicalHistory: { type: String },
  status: { type: String, default: 'active', index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

UserSchema.index({ role: 1, createdAt: -1 });

export const User: any = mongoose.models.User || mongoose.model('User', UserSchema);
