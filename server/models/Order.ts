import mongoose from 'mongoose';

export interface IOrderItem {
  productId?: string;
  productName?: string;
  quantity?: number;
  pricePKR?: number;
}

export interface IOrder extends mongoose.Document {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  country?: string;
  items: IOrderItem[];
  totalPricePKR: number;
  paymentMethod?: string;
  status?: string;
  date?: string;
  trackingId?: string;
  createdAt?: Date;
}

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, default: 'Pakistan' },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    pricePKR: Number
  }],
  totalPricePKR: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, default: 'Processing' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  trackingId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Order: any = mongoose.models.Order || mongoose.model('Order', OrderSchema);
