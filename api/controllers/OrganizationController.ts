import { Response } from 'express';
import { organizationService } from '../services/OrganizationService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, CreateOrganizationRequest } from '../../shared/types';

export class OrganizationController {
  async getOrganization(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' });
      }
      const org = organizationService.getOrganization(req.user.id);
      res.json({ success: true, data: org });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取组织信息失败'
      });
    }
  }

  async createOrganization(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' });
      }
      const { name, codeName, baseLocation } = req.body as CreateOrganizationRequest;
      const org = organizationService.createOrganization(req.user.id, {
        name,
        codeName,
        baseLocation
      });
      res.json({ success: true, data: org });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建组织失败'
      });
    }
  }

  async updateOrganization(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const updates = req.body;
      const org = organizationService.updateOrganization(req.user.organizationId, updates);
      res.json({ success: true, data: org });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '更新组织失败'
      });
    }
  }
}

export const organizationController = new OrganizationController();
