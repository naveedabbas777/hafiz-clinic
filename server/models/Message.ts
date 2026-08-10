import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  text: string;
  attachmentUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  documentType?: string;
  reportId?: string;
  read?: boolean;
  createdAt?: Date;
}

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, required: true },
  text: { type: String, required: true },
  attachmentUrl: { type: String },
  audioUrl: { type: String },
  audioDuration: { type: Number },
  documentType: { type: String },
  reportId: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Message: any = mongoose.models.Message || mongoose.model('Message', MessageSchema);
