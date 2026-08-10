import mongoose from 'mongoose';

export interface IDoctor extends mongoose.Document {
  nameUrdu: string;
  nameEnglish: string;
  qualification: string;
  experience?: string;
  specializationUrdu?: string;
  specializationEnglish?: string;
  timingUrdu?: string;
  timingEnglish?: string;
  eveningTimingUrdu?: string;
  eveningTimingEnglish?: string;
  image?: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
}

const DoctorSchema = new mongoose.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, default: '10+ Years' },
  specializationUrdu: { type: String },
  specializationEnglish: { type: String },
  timingUrdu: { type: String },
  timingEnglish: { type: String },
  eveningTimingUrdu: { type: String },
  eveningTimingEnglish: { type: String },
  image: { type: String },
  phone: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Doctor: any = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
