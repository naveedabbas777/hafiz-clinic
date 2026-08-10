import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  nameUrdu: string;
  nameEnglish: string;
  pricePKR: number;
  originalPricePKR?: number;
  category: string;
  categoryUrdu?: string;
  image?: string;
  descriptionUrdu?: string;
  descriptionEnglish?: string;
  stock?: number;
  isFeatured?: boolean;
  createdAt?: Date;
}

const ProductSchema = new mongoose.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  pricePKR: { type: Number, required: true },
  originalPricePKR: { type: Number },
  category: { type: String, required: true },
  categoryUrdu: { type: String },
  image: { type: String },
  descriptionUrdu: { type: String },
  descriptionEnglish: { type: String },
  stock: { type: Number, default: 50 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Product: any = mongoose.models.Product || mongoose.model('Product', ProductSchema);
