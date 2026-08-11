import { Router, Request, Response } from 'express';

const router = Router();

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor';
  receiverId: string;
  receiverName: string;
  receiverRole: 'patient' | 'doctor';
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  createdAt: string;
  updatedAt: string;
}

let activeCalls: CallSession[] = [];

// GET /api/calls/active?userId=...
router.get('/active', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json({ success: true, call: null });
  }

  const uId = String(userId);
  const found = activeCalls.find(
    (c) => (c.callerId === uId || c.receiverId === uId) && (c.status === 'ringing' || c.status === 'connected')
  );

  return res.json({ success: true, call: found || null });
});

// POST /api/calls/start
router.post('/start', (req: Request, res: Response) => {
  const { callerId, callerName, callerRole, receiverId, receiverName, receiverRole, type } = req.body;

  // Clear previous calls for caller/receiver
  activeCalls = activeCalls.filter(
    (c) => c.callerId !== callerId && c.receiverId !== receiverId && c.callerId !== receiverId && c.receiverId !== callerId
  );

  const newCall: CallSession = {
    id: `call_${Date.now()}`,
    callerId,
    callerName,
    callerRole: callerRole || 'patient',
    receiverId,
    receiverName,
    receiverRole: receiverRole || 'doctor',
    type: type || 'audio',
    status: 'ringing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  activeCalls.push(newCall);
  return res.status(201).json({ success: true, call: newCall });
});

// POST /api/calls/accept
router.post('/accept', (req: Request, res: Response) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = 'connected';
    call.updatedAt = new Date().toISOString();
    return res.json({ success: true, call });
  }
  return res.status(404).json({ success: false, message: 'Call session not found' });
});

// POST /api/calls/decline
router.post('/decline', (req: Request, res: Response) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = 'declined';
    call.updatedAt = new Date().toISOString();
    activeCalls = activeCalls.filter((c) => c.id !== callId);
    return res.json({ success: true, call });
  }
  return res.json({ success: true, call: null });
});

// POST /api/calls/end
router.post('/end', (req: Request, res: Response) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = 'ended';
    call.updatedAt = new Date().toISOString();
    activeCalls = activeCalls.filter((c) => c.id !== callId);
    return res.json({ success: true, call });
  }
  return res.json({ success: true, call: null });
});

// WebRTC Signaling Store
let callSignals: { [callId: string]: { [userId: string]: any[] } } = {};

// POST /api/calls/signal
router.post('/signal', (req: Request, res: Response) => {
  const { callId, userId, signal } = req.body;
  if (!callId || !userId || !signal) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  if (!callSignals[callId]) {
    callSignals[callId] = {};
  }
  if (!callSignals[callId][userId]) {
    callSignals[callId][userId] = [];
  }

  callSignals[callId][userId].push(signal);
  return res.json({ success: true });
});

// GET /api/calls/signals?callId=...&userId=...
router.get('/signals', (req: Request, res: Response) => {
  const { callId, userId } = req.query;
  if (!callId || !userId) {
    return res.json({ success: true, signals: [] });
  }

  const cId = String(callId);
  const uId = String(userId);

  if (!callSignals[cId]) {
    return res.json({ success: true, signals: [] });
  }

  // Return signals from the OTHER user in this call
  const otherUserIds = Object.keys(callSignals[cId]).filter((id) => id !== uId);
  let accumulatedSignals: any[] = [];
  for (const otherId of otherUserIds) {
    const sigs = callSignals[cId][otherId] || [];
    accumulatedSignals = accumulatedSignals.concat(sigs);
  }

  return res.json({ success: true, signals: accumulatedSignals });
});

export default router;
