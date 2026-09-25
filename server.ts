import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db';
import { authenticateToken } from './server/middleware/authMiddleware';

import statusRoutes from './server/routes/statusRoutes';
import authRoutes from './server/routes/authRoutes';
import doctorRoutes from './server/routes/doctorRoutes';
import diseaseRoutes from './server/routes/diseaseRoutes';
import productRoutes from './server/routes/productRoutes';
import appointmentRoutes from './server/routes/appointmentRoutes';
import orderRoutes from './server/routes/orderRoutes';
import userRoutes from './server/routes/userRoutes';
import messageRoutes from './server/routes/messageRoutes';
import reportRoutes from './server/routes/reportRoutes';
import uploadRoutes from './server/routes/uploadRoutes';
import callRoutes from './server/routes/callRoutes';
import slipRoutes from './server/routes/slipRoutes';
import erpRoutes from './server/routes/erpRoutes';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();

  // Core Express Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(authenticateToken);

  // Connect to MongoDB Atlas & seed default data
  await connectDB();

  // Register Express Modular API Routers
  app.use('/api', statusRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/diseases', diseaseRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/calls', callRoutes);
  app.use('/api/slips', slipRoutes);
  app.use('/api/erp', erpRoutes);

  // Vite Development / Production SPA Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hafiz Clinic Express Framework Server listening on http://localhost:${PORT}`);
  });
}

startServer();
