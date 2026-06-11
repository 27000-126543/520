import { Response } from 'express';
import { authService } from '../services/AuthService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, LoginRequest, RegisterRequest } from '../../shared/types';

export class AuthController {
  async login(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { username, password } = req.body as LoginRequest;
      const result = await authService.login({ username, password });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      });
    }
  }

  async register(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { username, email, password } = req.body as RegisterRequest;
      const result = await authService.register({ username, email, password });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '注册失败'
      });
    }
  }

  async me(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' });
      }
      res.json({
        success: true,
        data: {
          user: req.user,
          organization: null
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
  }
}

export const authController = new AuthController();
