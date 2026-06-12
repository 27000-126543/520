import { Response } from 'express';
import { marketService } from '../services/MarketService';
import { AuthRequest } from '../middleware/auth';
import type { ApiResponse, CreateListingRequest } from '../../shared/types';

export class MarketController {
  async getListings(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      const listings = marketService.getListings();
      res.json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取商品列表失败'
      });
    }
  }

  async getPriceSuggestion(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
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

  async createListing(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const request = req.body as CreateListingRequest;
      const listing = marketService.createListing(
        req.user.organizationId,
        req.user.username,
        request
      );
      res.json({ success: true, data: listing, message: '商品已上架' });
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
      const listing = marketService.buyListing(id, req.user.organizationId);
      res.json({ success: true, data: listing, message: '购买成功！' });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '购买失败'
      });
    }
  }

  async cancelListing(req: AuthRequest, res: Response<ApiResponse<any>>) {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ success: false, error: '您还没有创建组织' });
      }
      const { id } = req.params;
      const success = marketService.cancelListing(id, req.user.organizationId);
      if (success) {
        res.json({ success: true, message: '已下架商品' });
      } else {
        res.status(400).json({ success: false, error: '下架失败' });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '下架失败'
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
        error: error instanceof Error ? error.message : '获取情报卷轴失败'
      });
    }
  }
}

export const marketController = new MarketController();
