import { Response } from 'express';
import { missionEngine } from '../services/MissionEngine';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, AcceptMissionRequest, MissionActionRequest } from '../../shared/types';

export class MissionController {
  async getMissions(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const missions = missionEngine.getMissions();
      res.json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取任务列表失败'
      });
    }
  }

  async getMission(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const mission = missionEngine.getMission(id);
      if (!mission) {
        return res.status(404).json({ success: false, error: '任务不存在' });
      }
      res.json({ success: true, data: mission });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取任务信息失败'
      });
    }
  }

  async calculateSuccessRate(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const { spyIds } = req.body as { spyIds: string[] };
      const successRate = missionEngine.calculateSuccessRate(id, spyIds, req.user.organizationId);
      res.json({ success: true, data: { successRate } });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '计算成功率失败'
      });
    }
  }

  async acceptMission(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const { spyIds } = req.body as AcceptMissionRequest;
      const execution = missionEngine.acceptMission(
        id,
        spyIds,
        req.user.organizationId,
        req.user.username
      );
      res.json({ success: true, data: execution, message: '任务已开始！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '接受任务失败'
      });
    }
  }

  async getExecutions(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const executions = missionEngine.getExecutions(req.user.organizationId);
      res.json({ success: true, data: executions });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取任务执行记录失败'
      });
    }
  }

  async getExecution(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const execution = missionEngine.getExecution(id);
      if (!execution) {
        return res.status(404).json({ success: false, error: '执行记录不存在' });
      }
      res.json({ success: true, data: execution });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取执行信息失败'
      });
    }
  }

  async handleAction(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { id, eventId } = req.params;
      const { action } = req.body as MissionActionRequest;
      const event = missionEngine.handlePlayerAction(id, eventId, action);
      if (!event) {
        return res.status(404).json({ success: false, error: '事件不存在或已处理' });
      }
      res.json({ success: true, data: event, message: '操作已执行' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '操作失败'
      });
    }
  }

  async refreshMissions(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const missions = missionEngine.refreshMissions();
      res.json({ success: true, data: missions, message: '任务已刷新' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '刷新任务失败'
      });
    }
  }
}

export const missionController = new MissionController();
