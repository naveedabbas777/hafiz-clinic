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
    const { userId, doctorId, user1, user2 } = req.query;
    let list: any[] = [];

    if (getMongoConnectedStatus()) {
      try {
        const mongoMsgs = await Message.find().sort({ createdAt: 1 }).lean();
        const formattedMongo = mongoMsgs.map((m: any) => ({
          ...m,
          id: m.id || String(m._id),
        }));
        const mongoIds = new Set(formattedMongo.map((m: any) => String(m.id)));
        const memoryOnly = inMemoryMessages.filter((m) => !mongoIds.has(String(m.id)));
        list = [...formattedMongo, ...memoryOnly];
      } catch (err) {
        list = [...inMemoryMessages];
      }
    } else {
      list = [...inMemoryMessages];
    }

    const u1 = String(userId || user1 || '');
    const u2 = String(doctorId || user2 || '');

    const getAliases = (id: string) => {
      const arr = [id];
      if (!id) return arr;
      if (id === 'doc-1' || id === 'doctor-demo-1') {
        arr.push('doc-1', 'doctor-demo-1');
      }
      if (id === 'usr-1' || id === 'patient-demo-1') {
        arr.push('usr-1', 'patient-demo-1');
      }
      return Array.from(new Set(arr));
    };

    if (u1 && u2) {
      const aliases1 = getAliases(u1);
      const aliases2 = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || '');
        const rId = String(m.receiverId || '');
        return (
          (aliases1.includes(sId) && aliases2.includes(rId)) ||
          (aliases2.includes(sId) && aliases1.includes(rId)) ||
          (sId === u1 && rId === u2) ||
          (sId === u2 && rId === u1)
        );
      });
    } else if (u1) {
      const aliases = getAliases(u1);
      list = list.filter((m) => {
        const sId = String(m.senderId || '');
        const rId = String(m.receiverId || '');
        return aliases.includes(sId) || aliases.includes(rId) || sId === u1 || rId === u1;
      });
    } else if (u2) {
      const aliases = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || '');
        const rId = String(m.receiverId || '');
        return aliases.includes(sId) || aliases.includes(rId) || sId === u2 || rId === u2;
      });
    }

    // Deduplicate messages by id or exact match
    const seenMap = new Map<string, boolean>();
    const uniqueList: any[] = [];
    for (const m of list) {
      const key = m.id || `${m.senderId}_${m.receiverId}_${m.text}_${m.createdAt}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, true);
        uniqueList.push(m);
      }
    }

    return res.json({ success: true, messages: uniqueList });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, messages: inMemoryMessages });
  }
});

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  try {
    const msgId = req.body.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const msgItem = {
      id: msgId,
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

    // Prevent duplicate push to inMemoryMessages
    const existsInMemory = inMemoryMessages.some((m) => m.id === msgItem.id);
    if (!existsInMemory) {
      inMemoryMessages.push(msgItem);
    }

    if (getMongoConnectedStatus()) {
      await Message.create(msgItem).catch(() => {});
    }

    return res.status(201).json({ success: true, messageItem: msgItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
