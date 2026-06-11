import { v4 as uuidv4 } from 'uuid';
import { store } from '../data/store';
import { organizationService } from './OrganizationService';
import type {
  MarketListing, CreateListingRequest, ListingType, IntelScroll, Spy
} from '../../shared/types';

export class MarketService {
  private io: any;

  setSocketIO(io: any) {
    this.io = io;
  }

  getListings(): MarketListing[] {
    return store.getListings();
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

    if (request.type === 'intel_scroll') {
      const scroll = store.getScrolls(orgId).find(s => s.id === request.itemId);
      if (!scroll) throw new Error('情报卷轴不存在');
      itemName = scroll.name;
      itemRarity = scroll.rarity;
    } else if (request.type === 'spy_contract') {
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
      type: request.type,
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

  buyListing(listingId: string, buyerOrgId: string): MarketListing {
    const listing = store.getListings().find(l => l.id === listingId);
    if (!listing) throw new Error('商品不存在');
    if (listing.sellerId === buyerOrgId) throw new Error('不能购买自己的商品');

    const buyer = store.getOrganization(buyerOrgId);
    if (!buyer) throw new Error('买家组织不存在');
    if (buyer.intelPoints < listing.price) throw new Error('情报点数不足');

    const seller = store.getOrganization(listing.sellerId);
    if (!seller) throw new Error('卖家组织不存在');

    store.updateOrganization(buyerOrgId, { intelPoints: buyer.intelPoints - listing.price });
    store.updateOrganization(listing.sellerId, { intelPoints: seller.intelPoints + listing.price });

    if (listing.type === 'intel_scroll') {
      store.updateScrollOwner(listing.itemId, buyerOrgId);
    } else if (listing.type === 'spy_contract') {
      store.updateSpy(listing.itemId, { organizationId: buyerOrgId });
    }

    store.removeListing(listingId);

    store.addAnnouncement({
      id: Date.now().toString(),
      type: 'trade',
      message: `【${buyer.name}】以 ${listing.price.toLocaleString()} 积分购买了【${listing.itemName}】！`,
      timestamp: new Date(),
      data: { price: listing.price, itemName: listing.itemName }
    });

    if (this.io) {
      this.io.emit('globalAnnouncement', {
        id: Date.now().toString(),
        type: 'trade',
        message: `【${buyer.name}】以 ${listing.price.toLocaleString()} 积分购买了【${listing.itemName}】！`,
        timestamp: new Date()
      });
    }

    return listing;
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
