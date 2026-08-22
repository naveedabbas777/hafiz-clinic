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
  audioDuration?: number | string;
  documentType?: string;
  reportId?: string;
  digitalSlip?: any;
  read?: boolean;
  createdAt?: Date;
}

const MessageSchema = new mongoose.Schema({
  id: { type: String },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, required: true },
  text: { type: String, default: '' },
  attachmentUrl: { type: String },
  audioUrl: { type: String },
  audioDuration: { type: String },
  documentType: { type: String },
  reportId: { type: String },
  digitalSlip: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Message: any = mongoose.models.Message || mongoose.model('Message', MessageSchema);
