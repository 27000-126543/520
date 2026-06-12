import { create } from 'zustand';
import type {
  Spy, Mission, MissionExecution, MarketListing,
  IntelScroll, Guild, WeeklyReport, RankingEntry,
  Announcement, RankingType
} from '../../shared/types';
import {
  spyAPI, missionAPI, marketAPI, guildAPI, reportAPI, organizationAPI
} from '../lib/api';
import { useAuthStore } from './useAuthStore';

interface GameState {
  spies: Spy[];
  missions: Mission[];
  executions: MissionExecution[];
  listings: MarketListing[];
  scrolls: IntelScroll[];
  guild: Guild | null;
  weeklyReport: WeeklyReport | null;
  rankings: Record<string, RankingEntry[]>;
  announcements: Announcement[];
  notifications: { id: string; type: string; message: string; timestamp: number }[];
  isLoading: boolean;

  allGuilds: Guild[];
  tradeHistories: any[];
  myTrades: any[];
  priceTrends: Array<{ rarity: string; prices: number[]; average: number; volume: number }>;
  lastMissionResult: any | null;
  guildRanking: Array<{ orgId: string; orgName: string; amount: number }>;

  loadSpies: () => Promise<void>;
  loadMissions: () => Promise<void>;
  loadExecutions: () => Promise<void>;
  loadMarket: () => Promise<void>;
  loadScrolls: () => Promise<void>;
  loadGuild: () => Promise<void>;
  loadAllGuilds: () => Promise<void>;
  loadTradeHistories: () => Promise<void>;
  loadMyTrades: () => Promise<void>;
  loadPriceTrends: () => Promise<void>;
  loadWeeklyReport: () => Promise<void>;
  loadRankings: (type: RankingType) => Promise<void>;
  loadAnnouncements: () => Promise<void>;
  loadAll: () => Promise<void>;
  loadOrganizationData: () => Promise<void>;
  loadGuildRanking: (guildId: string) => Promise<void>;

  recruitSpy: () => Promise<Spy | null>;
  upgradeSpySkill: (spyId: string, skill: 'stealth' | 'disguise' | 'decryption') => Promise<Spy | null>;
  equipScroll: (spyId: string, scrollId: string) => Promise<Spy | null>;
  unequipScroll: (spyId: string, scrollId: string) => Promise<Spy | null>;
  acceptMission: (missionId: string, spyIds: string[]) => Promise<MissionExecution | null>;
  handleMissionAction: (executionId: string, eventId: string, action: 'support' | 'destroy') => Promise<any>;
  buyListing: (listingId: string) => Promise<boolean>;
  createListing: (type: 'intel_scroll' | 'spy_contract', itemId: string, price: number) => Promise<MarketListing | null>;
  donateMaterial: (buildingId: string, materialType: string, amount: number) => Promise<boolean>;
  upgradeBuilding: (buildingId: string) => Promise<boolean>;
  joinGuild: (guildId: string) => Promise<Guild | null>;
  createOrganization: (name: string, codeName: string, baseLocation: string) => Promise<void>;

  setLastMissionResult: (result: any) => void;
  clearLastMissionResult: () => void;
  addNotification: (type: string, message: string) => void;
  removeNotification: (id: string) => void;
  updateExecution: (execution: MissionExecution) => void;
  addAnnouncement: (announcement: Announcement) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  spies: [],
  missions: [],
  executions: [],
  listings: [],
  scrolls: [],
  guild: null,
  weeklyReport: null,
  rankings: {},
  announcements: [],
  notifications: [],
  isLoading: false,

  allGuilds: [],
  tradeHistories: [],
  myTrades: [],
  priceTrends: [],
  lastMissionResult: null,
  guildRanking: [],

  loadSpies: async () => {
    try {
      const response = await spyAPI.getAll();
      if (response.success) {
        set({ spies: response.data || [] });
      }
    } catch (error) {
      console.error('加载间谍失败:', error);
    }
  },

  loadMissions: async () => {
    try {
      const response = await missionAPI.getAll();
      if (response.success) {
        set({ missions: response.data || [] });
      }
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  },

  loadExecutions: async () => {
    try {
      const response = await missionAPI.getExecutions();
      if (response.success) {
        set({ executions: response.data || [] });
      }
    } catch (error) {
      console.error('加载执行记录失败:', error);
    }
  },

  loadMarket: async () => {
    try {
      const [listingsRes, histRes, trendsRes, myTradesRes] = await Promise.all([
        marketAPI.getListings(),
        marketAPI.getTradeHistories(20),
        marketAPI.getPriceTrends(),
        marketAPI.getMyTrades().catch(() => ({ success: true, data: [] }))
      ]);
      if (listingsRes.success) set({ listings: listingsRes.data || [] });
      if (histRes.success) set({ tradeHistories: histRes.data || [] });
      if (trendsRes.success) set({ priceTrends: trendsRes.data || [] });
      if (myTradesRes.success) set({ myTrades: myTradesRes.data || [] });
    } catch (error) {
      console.error('加载市场失败:', error);
    }
  },

  loadScrolls: async () => {
    try {
      const response = await marketAPI.getScrolls();
      if (response.success) {
        set({ scrolls: response.data || [] });
      }
    } catch (error) {
      console.error('加载卷轴失败:', error);
    }
  },

  loadGuild: async () => {
    try {
      const response = await guildAPI.getMyGuild();
      if (response.success) {
        set({ guild: response.data || null });
      }
    } catch (error) {
      console.error('加载公会失败:', error);
    }
  },

  loadAllGuilds: async () => {
    try {
      const response = await guildAPI.getAllGuilds();
      if (response.success) {
        set({ allGuilds: response.data || [] });
      }
    } catch (error) {
      console.error('加载公会列表失败:', error);
    }
  },

  loadTradeHistories: async () => {
    try {
      const response = await marketAPI.getTradeHistories(50);
      if (response.success) set({ tradeHistories: response.data || [] });
    } catch (error) {
      console.error('加载成交记录失败:', error);
    }
  },

  loadMyTrades: async () => {
    try {
      const response = await marketAPI.getMyTrades();
      if (response.success) set({ myTrades: response.data || [] });
    } catch (error) {
      console.error('加载我的交易失败:', error);
    }
  },

  loadPriceTrends: async () => {
    try {
      const response = await marketAPI.getPriceTrends();
      if (response.success) set({ priceTrends: response.data || [] });
    } catch (error) {
      console.error('加载价格走势失败:', error);
    }
  },

  loadGuildRanking: async (guildId: string) => {
    try {
      const response = await guildAPI.getRanking(guildId);
      if (response.success) set({ guildRanking: response.data || [] });
    } catch (error) {
      console.error('加载贡献排行失败:', error);
    }
  },

  loadWeeklyReport: async () => {
    try {
      const response = await reportAPI.getWeekly();
      if (response.success) {
        set({ weeklyReport: response.data || null });
      }
    } catch (error) {
      console.error('加载周报失败:', error);
    }
  },

  loadRankings: async (type: RankingType) => {
    try {
      const response = await reportAPI.getRankings(type);
      if (response.success) {
        set((state) => ({
          rankings: { ...state.rankings, [type]: response.data || [] }
        }));
      }
    } catch (error) {
      console.error('加载排行榜失败:', error);
    }
  },

  loadAnnouncements: async () => {
    try {
      const response = await reportAPI.getAnnouncements();
      if (response.success) {
        set({ announcements: response.data || [] });
      }
    } catch (error) {
      console.error('加载公告失败:', error);
    }
  },

  loadAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().loadSpies(),
      get().loadMissions(),
      get().loadExecutions(),
      get().loadMarket(),
      get().loadScrolls(),
      get().loadGuild(),
      get().loadAnnouncements()
    ]);
    set({ isLoading: false });
  },

  recruitSpy: async () => {
    try {
      const response = await spyAPI.recruit();
      if (response.success && response.data) {
        get().addNotification('success', response.message || '招募成功！');
        await get().loadSpies();
        await get().loadOrganizationData();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '招募失败');
    }
    return null;
  },

  upgradeSpySkill: async (spyId: string, skill: 'stealth' | 'disguise' | 'decryption') => {
    try {
      const response = await spyAPI.upgrade(spyId, skill);
      if (response.success && response.data) {
        get().addNotification('success', response.message || '升级成功！');
        await get().loadSpies();
        await get().loadOrganizationData();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '升级失败');
    }
    return null;
  },

  equipScroll: async (spyId: string, scrollId: string) => {
    try {
      const response = await spyAPI.equipScroll(spyId, scrollId);
      if (response.success && response.data) {
        get().addNotification('success', response.message || '装备成功！');
        await get().loadSpies();
        await get().loadScrolls();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '装备失败');
    }
    return null;
  },

  unequipScroll: async (spyId: string, scrollId: string) => {
    try {
      const response = await spyAPI.unequipScroll(spyId, scrollId);
      if (response.success && response.data) {
        get().addNotification('success', response.message || '卸下成功！');
        await get().loadSpies();
        await get().loadScrolls();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '卸下失败');
    }
    return null;
  },

  acceptMission: async (missionId: string, spyIds: string[]) => {
    try {
      const response = await missionAPI.accept(missionId, spyIds);
      if (response.success && response.data) {
        get().addNotification('success', response.message || '任务已开始！');
        await get().loadExecutions();
        await get().loadSpies();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '接受任务失败');
    }
    return null;
  },

  handleMissionAction: async (executionId: string, eventId: string, action: 'support' | 'destroy') => {
    try {
      const response = await missionAPI.handleAction(executionId, eventId, action);
      if (response.success) {
        get().addNotification('info', response.message || '操作已执行');
        await get().loadExecutions();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '操作失败');
    }
    return null;
  },

  buyListing: async (listingId: string) => {
    try {
      const response = await marketAPI.buy(listingId);
      if (response.success) {
        get().addNotification('success', response.message || '购买成功！');
        await get().loadMarket();
        await get().loadScrolls();
        await get().loadSpies();
        await get().loadOrganizationData();
        await get().loadAnnouncements();
        return true;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '购买失败');
    }
    return false;
  },

  createListing: async (type: 'intel_scroll' | 'spy_contract', itemId: string, price: number) => {
    try {
      const response = await marketAPI.createListing({ type, itemId, price });
      if (response.success && response.data) {
        get().addNotification('success', response.message || '商品已上架');
        await get().loadMarket();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '上架失败');
    }
    return null;
  },

  donateMaterial: async (buildingId: string, materialType: string, amount: number) => {
    try {
      const response = await guildAPI.donate(buildingId, { materialType, amount });
      if (response.success) {
        get().addNotification('success', response.message || '捐献成功！');
        await get().loadGuild();
        await get().loadOrganizationData();
        if (get().guild?.id) await get().loadGuildRanking(get().guild.id);
        return true;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '捐献失败');
    }
    return false;
  },

  upgradeBuilding: async (buildingId: string) => {
    try {
      const response = await guildAPI.upgrade(buildingId);
      if (response.success) {
        get().addNotification('success', response.message || '升级成功！');
        await get().loadGuild();
        await get().loadAnnouncements();
        return true;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '升级失败');
    }
    return false;
  },

  joinGuild: async (guildId: string) => {
    try {
      const response = await guildAPI.joinGuild(guildId);
      if (response.success && response.data) {
        get().addNotification('success', response.message || '加入公会成功！');
        await get().loadGuild();
        await get().loadAllGuilds();
        return response.data;
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '加入失败');
    }
    return null;
  },

  setLastMissionResult: (result: any) => set({ lastMissionResult: result }),
  clearLastMissionResult: () => set({ lastMissionResult: null }),

  createOrganization: async (name: string, codeName: string, baseLocation: string) => {
    try {
      const response = await organizationAPI.create({ name, codeName, baseLocation });
      if (response.success && response.data) {
        useAuthStore.getState().setOrganization(response.data);
        get().addNotification('success', '情报组织创建成功！');
        await get().loadAll();
      }
    } catch (error) {
      get().addNotification('error', error instanceof Error ? error.message : '创建失败');
      throw error;
    }
  },

  loadOrganizationData: async () => {
    try {
      const response = await organizationAPI.get();
      if (response.success && response.data) {
        useAuthStore.getState().setOrganization(response.data);
      }
    } catch (error) {
      console.error('加载组织数据失败:', error);
    }
  },

  addNotification: (type: string, message: string) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, timestamp: Date.now() }]
    }));
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  updateExecution: (execution: MissionExecution) => {
    set((state) => ({
      executions: state.executions.map(e => e.id === execution.id ? execution : e)
    }));
  },

  addAnnouncement: (announcement: Announcement) => {
    set((state) => ({
      announcements: [announcement, ...state.announcements].slice(0, 50)
    }));
  }
}));
