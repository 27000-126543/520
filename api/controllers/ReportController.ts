import { Response } from 'express';
import { reportService } from '../services/ReportService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, RankingType } from '../../shared/types';

export class ReportController {
  async getWeeklyReport(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const report = reportService.getWeeklyReport();
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取周报失败'
      });
    }
  }

  async getRankings(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const { type } = req.params as { type: RankingType };
      const rankings = reportService.getRankings(type);
      res.json({ success: true, data: rankings });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取排行榜失败'
      });
    }
  }

  async getAnnouncements(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const announcements = reportService.getAnnouncements();
      res.json({ success: true, data: announcements });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取公告失败'
      });
    }
  }

  async exportPDF(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const reportData = reportService.generatePDFReport();
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: { report: reportData },
        message: 'PDF数据已生成，前端将使用此数据生成PDF'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导出PDF失败'
      });
    }
  }
}

export const reportController = new ReportController();
