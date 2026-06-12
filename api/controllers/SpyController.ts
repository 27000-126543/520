import { Response } from 'express';
import { spyService } from '../services/SpyService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, Spy } from '../../shared/types';

export class SpyController {
  async getSpies(req: AuthRequest, res: Response<ApiResponse<Spy[]>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const spies = spyService.getSpies(req.user.organizationId);
      res.json({ success: true, data: spies });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取间谍列表失败'
      });
    }
  }

  async getSpy(req: AuthRequest, res: Response<ApiResponse<Spy>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const spy = spyService.getSpy(req.params.id);
      if (!spy) {
        return res.status(404).json({ success: false, error: '间谍不存在' });
      }
      res.json({ success: true, data: spy });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取间谍详情失败'
      });
    }
  }

  async recruitSpy(req: AuthRequest, res: Response<ApiResponse<Spy>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const spy = spyService.recruitSpy(req.user.organizationId);
      res.json({ success: true, data: spy, message: '招募成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '招募失败'
      });
    }
  }

  async equipScroll(req: AuthRequest, res: Response<ApiResponse<Spy>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { spyId, scrollId } = req.body;
      const spy = spyService.equipScroll(req.user.organizationId, spyId, scrollId);
      res.json({ success: true, data: spy, message: '装备成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '装备失败'
      });
    }
  }

  async unequipScroll(req: AuthRequest, res: Response<ApiResponse<Spy>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { spyId, scrollId } = req.body;
      const spy = spyService.unequipScroll(req.user.organizationId, spyId, scrollId);
      res.json({ success: true, data: spy, message: '卸下成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '卸下失败'
      });
    }
  }

  async upgradeSkill(req: AuthRequest, res: Response<ApiResponse<Spy>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const { skill } = req.body;
      const spy = spyService.upgradeSkill(req.user.organizationId, id, skill);
      res.json({ success: true, data: spy, message: '升级成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '升级失败'
      });
    }
  }
}

export const spyController = new SpyController();
