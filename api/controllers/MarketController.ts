import { Response } from 'express';
import { marketService } from '../services/MarketService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, MarketListing, CreateListingRequest, TradeHistory } from '../../shared/types';

export class MarketController {
  async getListings(req: AuthRequest, res: Response<ApiResponse<MarketListing[]>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const listings = marketService.getListings();
      res.json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取市场列表失败'
      });
    }
  }

  async getTradeHistories(req: AuthRequest, res: Response<ApiResponse<TradeHistory[]>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const histories = marketService.getTradeHistories(limit);
      res.json({ success: true, data: histories });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取成交记录失败'
      });
    }
  }

  async getMyTrades(req: AuthRequest, res: Response<ApiResponse<TradeHistory[]>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const trades = marketService.getMyTrades(req.user.organizationId);
      res.json({ success: true, data: trades });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取我的交易失败'
      });
    }
  }

  async getPriceTrends(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const trends = marketService.getPriceTrends();
      res.json({ success: true, data: trends });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取价格走势失败'
      });
    }
  }

  async getMyScrolls(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const scrolls = marketService.getScrolls(req.user.organizationId);
      res.json({ success: true, data: scrolls });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取卷轴列表失败'
      });
    }
  }

  async getPriceSuggestion(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { rarity } = req.params;
      const suggestion = marketService.getPriceSuggestion(rarity);
      res.json({ success: true, data: suggestion });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取价格建议失败'
      });
    }
  }

  async createListing(req: AuthRequest, res: Response<ApiResponse<MarketListing>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const org = req.user;
      const listing = marketService.createListing(
        org.organizationId,
        org.username,
        req.body as CreateListingRequest
      );
      res.status(201).json({ success: true, data: listing, message: '上架成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '上架失败'
      });
    }
  }

  async buyListing(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const result = marketService.buyListing(id, req.user.organizationId);
      res.json({ success: true, data: result, message: '购买成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '购买失败'
      });
    }
  }

  async cancelListing(req: AuthRequest, res: Response<ApiResponse<boolean>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const result = marketService.cancelListing(id, req.user.organizationId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '取消失败'
      });
    }
  }
}

export const marketController = new MarketController();
