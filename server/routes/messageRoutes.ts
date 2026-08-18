import { Router, Request, Response } from 'express';
import { Message } from '../models/Message';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

let inMemoryMessages: any[] = [];

// Helper to get normalized aliases for strict 1-to-1 isolation
const getAliases = (id: string): string[] => {
  if (!id) return [];
  const cleanId = String(id).trim().toLowerCase();
  
  if (['doc-1', 'doc1', 'doctor1', 'drzeeshan', 'dr.zeeshan@hafizclinic.com'].includes(cleanId)) {
    return ['doc-1', 'doc1', 'doctor1', 'drzeeshan'];
  }
  if (['doc-2', 'doc2', 'doctor2', 'drwaqas', 'dr.waqas@hafizclinic.com'].includes(cleanId)) {
    return ['doc-2', 'doc2', 'doctor2', 'drwaqas'];
  }
  if (['usr-1', 'usr1', 'patient1', 'mrn-84920', 'farooq@example.com'].includes(cleanId)) {
    return ['usr-1', 'usr1', 'patient1', 'mrn-84920', 'MRN-84920'];
  }
  if (['usr-2', 'usr2', 'patient2', 'mrn-84921', 'kamran@example.com'].includes(cleanId)) {
    return ['usr-2', 'usr2', 'patient2', 'mrn-84921', 'MRN-84921'];
  }
  return [id, cleanId];
};

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

    const u1 = String(userId || user1 || '').trim();
    const u2 = String(doctorId || user2 || '').trim();

    if (u1 === 'admin-monitor' || (!u1 && !u2)) {
      // Admin inspection view: return all clinic messages
    } else if (u1 && u2) {
      // Strict 1-to-1 conversation filtering
      const aliases1 = getAliases(u1);
      const aliases2 = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || '').trim();
        const rId = String(m.receiverId || '').trim();
        const match1to2 = aliases1.some((a) => a.toLowerCase() === sId.toLowerCase()) &&
                          aliases2.some((b) => b.toLowerCase() === rId.toLowerCase());
        const match2to1 = aliases2.some((b) => b.toLowerCase() === sId.toLowerCase()) &&
                          aliases1.some((a) => a.toLowerCase() === rId.toLowerCase());
        return match1to2 || match2to1;
      });
    } else if (u1) {
      const aliases = getAliases(u1);
      list = list.filter((m) => {
        const sId = String(m.senderId || '').trim().toLowerCase();
        const rId = String(m.receiverId || '').trim().toLowerCase();
        return aliases.some((a) => a.toLowerCase() === sId || a.toLowerCase() === rId);
      });
    } else if (u2) {
      const aliases = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || '').trim().toLowerCase();
        const rId = String(m.receiverId || '').trim().toLowerCase();
        return aliases.some((a) => a.toLowerCase() === sId || a.toLowerCase() === rId);
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
