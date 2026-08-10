import { Router, Request, Response } from 'express';
import { Message } from '../models/Message';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

let inMemoryMessages: any[] = [
  {
    id: 'msg-1',
    senderId: 'doc-1',
    senderName: 'ڈاکٹر زیشان چوہدری',
    senderRole: 'doctor',
    receiverId: 'usr-1',
    receiverName: 'محمد فاروق',
    receiverRole: 'patient',
    text: 'السلام علیکم! حافظ کلینک ٹیلی میڈیسن پورٹل میں خوش آمدید۔ آپ اپنی بیماری اور علامات شیئر کر سکتے ہیں۔',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// GET /api/messages
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, doctorId } = req.query;
    let list: any[] = [];

    if (getMongoConnectedStatus()) {
      list = await Message.find().sort({ createdAt: 1 });
    } else {
      list = [...inMemoryMessages];
    }

    if (userId && doctorId) {
      const uId = String(userId);
      const dId = String(doctorId);
      list = list.filter(
        (m) =>
          (m.senderId === uId && m.receiverId === dId) ||
          (m.senderId === dId && m.receiverId === uId)
      );
    } else if (userId) {
      const uId = String(userId);
      list = list.filter((m) => m.senderId === uId || m.receiverId === uId);
    } else if (doctorId) {
      const dId = String(doctorId);
      list = list.filter((m) => m.senderId === dId || m.receiverId === dId);
    }

    return res.json({ success: true, messages: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, messages: inMemoryMessages });
  }
});

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  try {
    const msgItem = {
      id: req.body.id || `msg_${Date.now()}`,
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      senderRole: req.body.senderRole || 'patient',
      receiverId: req.body.receiverId,
      receiverName: req.body.receiverName,
      receiverRole: req.body.receiverRole || 'doctor',
      text: req.body.text || '',
      attachmentUrl: req.body.attachmentUrl,
      audioUrl: req.body.audioUrl,
      audioDuration: req.body.audioDuration,
      documentType: req.body.documentType,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    inMemoryMessages.push(msgItem);

    if (getMongoConnectedStatus()) {
      await Message.create(msgItem).catch(() => {});
    }

    return res.status(201).json({ success: true, messageItem: msgItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
