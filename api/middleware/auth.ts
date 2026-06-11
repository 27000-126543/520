import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_for_demo_only';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    organizationId?: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; organizationId?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: '认证令牌无效或已过期' });
  }
};

export const generateToken = (payload: { id: string; username: string; organizationId?: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
