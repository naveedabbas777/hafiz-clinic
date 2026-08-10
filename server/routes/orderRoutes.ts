import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';
import { getMongoConnectedStatus } from '../config/db';

const router = Router();

// GET /api/orders
router.get('/', async (req: Request, res: Response) => {
  try {
    if (getMongoConnectedStatus()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    }
    return res.json({ success: true, orders: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, orders: [] });
  }
});

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = {
      ...req.body,
      trackingId: req.body.trackingId || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: req.body.status || 'Processing',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    if (getMongoConnectedStatus()) {
      const createdOrder = await Order.create(orderData);
      return res.status(201).json({ success: true, order: createdOrder });
    }

    return res.status(201).json({ success: true, order: { id: `ord_${Date.now()}`, ...orderData } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
