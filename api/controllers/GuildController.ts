import { Response } from 'express';
import { guildService } from '../services/GuildService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, DonateMaterialRequest } from '../../shared/types';

export class GuildController {
  async getAllGuilds(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const guilds = guildService.getAllGuilds();
      res.json({ success: true, data: guilds });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取公会列表失败'
      });
    }
  }

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

  async joinGuild(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { guildId } = req.params;
      const guild = guildService.joinGuild(guildId, req.user.organizationId);
      res.json({ success: true, data: guild, message: '加入公会成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '加入公会失败'
      });
    }
  }

  async getContributionRanking(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { guildId } = req.params;
      const ranking = guildService.getContributionRanking(guildId);
      res.json({ success: true, data: ranking });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取贡献排行失败'
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
