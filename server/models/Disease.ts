import mongoose from 'mongoose';

export interface IDisease extends mongoose.Document {
  nameUrdu: string;
  nameEnglish: string;
  category?: string;
  symptomsUrdu?: string[];
  causesUrdu?: string[];
  treatmentUrdu?: string;
  precautionsUrdu?: string[];
  recommendedDoctor?: string;
  image?: string;
  icon?: string;
  createdAt?: Date;
}

const DiseaseSchema = new mongoose.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  category: { type: String, default: 'general' },
  symptomsUrdu: [{ type: String }],
  causesUrdu: [{ type: String }],
  treatmentUrdu: { type: String },
  precautionsUrdu: [{ type: String }],
  recommendedDoctor: { type: String },
  image: { type: String },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Disease: any = mongoose.models.Disease || mongoose.model('Disease', DiseaseSchema);
