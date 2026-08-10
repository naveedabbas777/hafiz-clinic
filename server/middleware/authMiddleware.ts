import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'hafiz_clinic_jwt_secret_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'patient' | 'doctor' | 'admin';
    name?: string;
    email?: string;
    mrn?: string;
  };
}

// Middleware to verify JWT token from Authorization header or Query or Body
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (req.query.token as string || req.body?.token);

  if (!token) {
    return next(); // Proceed without auth attached
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
}

// Guard middleware to enforce role requirements
export function requireRole(allowedRoles: Array<'patient' | 'doctor' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}
