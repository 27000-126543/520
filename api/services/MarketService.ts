import { v4 as uuidv4 } from 'uuid';
import { store } from '../data/store';
import { organizationService } from './OrganizationService';
import type {
  MarketListing, CreateListingRequest, ListingType, IntelScroll, Spy,
  TradeHistory
} from '../../shared/types';

export class MarketService {
  private io: any;

  setSocketIO(io: any) {
    this.io = io;
  }

  getListings(): MarketListing[] {
    return store.getListings();
  }

  getTradeHistories(limit: number = 20): TradeHistory[] {
    return store.getTradeHistories(limit);
  }

  getMyTrades(orgId: string): TradeHistory[] {
    return store.getTradeHistoriesByOrg(orgId);
  }

  getPriceTrends(): Array<{ rarity: string; prices: number[]; average: number; volume: number }> {
    return store.getPriceTrends();
  }

  getPriceSuggestion(itemRarity: string): [number, number] {
    return store.getPriceSuggestion(itemRarity);
  }

  createListing(
    orgId: string,
    orgName: string,
    request: CreateListingRequest
  ): MarketListing {
    const org = store.getOrganization(orgId);
    if (!org) throw new Error('组织不存在');

    let itemName = '';
    let itemRarity = '';
    let listingType: ListingType = request.type;

    if (!listingType) {
      const scroll = store.getScrolls(orgId).find(s => s.id === request.itemId);
      if (scroll) listingType = 'intel_scroll';
      const spy = store.getSpy(request.itemId);
      if (spy && spy.organizationId === orgId) listingType = 'spy_contract';
    }
    if (!listingType) throw new Error('无法识别上架物品类型');

    if (listingType === 'intel_scroll') {
      const scroll = store.getScrolls(orgId).find(s => s.id === request.itemId);
      if (!scroll) throw new Error('情报卷轴不存在');
      if (scroll.organizationId !== orgId) throw new Error('卷轴不属于你的组织');

      const orgSpies = store.getSpies(orgId);
      for (const spy of orgSpies) {
        if (spy.equippedScrolls.includes(request.itemId)) {
          store.updateSpy(spy.id, {
            equippedScrolls: spy.equippedScrolls.filter(id => id !== request.itemId)
          });
        }
      }

      itemName = scroll.name;
      itemRarity = scroll.rarity;
    } else if (listingType === 'spy_contract') {
      const spy = store.getSpy(request.itemId);
      if (!spy || spy.organizationId !== orgId) throw new Error('间谍不存在');
      if (spy.status !== 'idle') throw new Error('该间谍正在执行任务，无法出售');
      itemName = spy.name;
      itemRarity = spy.rarity;
    }

    const suggestedRange = store.getPriceSuggestion(itemRarity);

    const listing: MarketListing = {
      id: uuidv4(),
      sellerId: orgId,
      sellerName: orgName,
      type: listingType,
      itemId: request.itemId,
      itemName,
      itemRarity,
      price: request.price,
      suggestedPriceRange: suggestedRange,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    return store.createListing(listing);
  }

  buyListing(listingId: string, buyerOrgId: string): {
    listing: MarketListing;
    buyerPoints: number;
    sellerPoints: number;
  } {
    const listing = store.getListings().find(l => l.id === listingId);
    if (!listing) throw new Error('商品不存在');
    if (listing.sellerId === buyerOrgId) throw new Error('不能购买自己的商品');

    const buyer = store.getOrganization(buyerOrgId);
    if (!buyer) throw new Error('买家组织不存在');
    if (buyer.intelPoints < listing.price) throw new Error('情报点数不足');

    const seller = store.getOrganization(listing.sellerId);
    if (!seller) throw new Error('卖家组织不存在');

    const newBuyerPoints = buyer.intelPoints - listing.price;
    const newSellerPoints = seller.intelPoints + listing.price;

    store.updateOrganization(buyerOrgId, { intelPoints: newBuyerPoints });
    store.updateOrganization(listing.sellerId, { intelPoints: newSellerPoints });

    if (listing.type === 'intel_scroll') {
      store.updateScrollOwner(listing.itemId, buyerOrgId);

      const sellerSpies = store.getSpies(listing.sellerId);
      for (const spy of sellerSpies) {
        if (spy.equippedScrolls.includes(listing.itemId)) {
          store.updateSpy(spy.id, {
            equippedScrolls: spy.equippedScrolls.filter(id => id !== listing.itemId)
          });
        }
      }
    } else if (listing.type === 'spy_contract') {
      store.updateSpy(listing.itemId, { organizationId: buyerOrgId, status: 'idle' });
    }

    store.removeListing(listingId);

    const buyerName = buyer.name;
    const sellerName = seller.name;

    const history: TradeHistory = {
      id: 'trade-' + uuidv4(),
      type: listing.type,
      itemRarity: listing.itemRarity,
      price: listing.price,
      timestamp: new Date(),
      sellerId: listing.sellerId,
      buyerId: buyerOrgId,
      itemName: listing.itemName,
      buyerName,
      sellerName
    };
    store.addTradeHistory(history);

    const announcement = {
      id: Date.now().toString(),
      type: 'trade' as const,
      message: `【${buyerName}】以 ${listing.price.toLocaleString()} 积分购买了【${listing.itemName}】！`,
      timestamp: new Date(),
      data: { price: listing.price, itemName: listing.itemName }
    };
    store.addAnnouncement(announcement);

    if (this.io) {
      this.io.emit('announcement:new', announcement);
      this.io.emit('market:update');
    }

    return {
      listing,
      buyerPoints: newBuyerPoints,
      sellerPoints: newSellerPoints
    };
  }

  cancelListing(listingId: string, orgId: string): boolean {
    const listing = store.getListings().find(l => l.id === listingId);
    if (!listing) throw new Error('商品不存在');
    if (listing.sellerId !== orgId) throw new Error('只能取消自己的商品');

    return store.removeListing(listingId);
  }

  getScrolls(orgId: string): IntelScroll[] {
    return store.getScrolls(orgId);
  }
}

export const marketService = new MarketService();
