import { Response } from 'express';
import { guildService } from '../services/GuildService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, DonateMaterialRequest } from '../../shared/types';

export class GuildController {
  async getMyGuild(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const guild = guildService.getGuildByMember(req.user.organizationId);
      res.json({ success: true, data: guild });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取公会信息失败'
      });
    }
  }

  async donateMaterial(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { buildingId } = req.params;
      const { materialType, amount } = req.body as DonateMaterialRequest;
      const building = guildService.donateMaterial(
        req.user.organizationId,
        buildingId,
        { materialType, amount }
      );
      res.json({ success: true, data: building, message: '捐献成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '捐献失败'
      });
    }
  }

  async upgradeBuilding(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { buildingId } = req.params;
      const building = guildService.upgradeBuilding(req.user.organizationId, buildingId);
      res.json({ success: true, data: building, message: '升级成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '升级失败'
      });
    }
  }
}

export const guildController = new GuildController();
