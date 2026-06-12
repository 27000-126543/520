import { v4 as uuidv4 } from 'uuid';
import {
  mockUsers, mockOrganizations, mockSpies, mockMissions,
  mockMarketListings, mockScrolls, mockGuilds, mockRankings,
  mockWeeklyReport, mockAnnouncements, mockExecutions,
  generateRandomSpy, generateMissions
} from './mockData';
import type {
  User, Organization, Spy, Mission, MarketListing,
  IntelScroll, Guild, WeeklyReport, RankingEntry,
  Announcement, MissionExecution, MissionEvent, PlayerAction,
  TradeHistory, SpyRarity
} from '../../shared/types';

const DEFAULT_PRICES: Record<string, [number, number]> = {
  common: [500, 1000],
  rare: [1500, 3000],
  epic: [3000, 6000],
  legendary: [6000, 12000]
};

const scrollTemplates: Array<Omit<IntelScroll, 'id' | 'organizationId'>> = [
  { name: '隐匿术·基础', description: '小幅提升隐匿技能', rarity: 'common', skillBonus: { stealth: 5 }, createdAt: new Date() },
  { name: '千面术·基础', description: '小幅提升伪装技能', rarity: 'common', skillBonus: { disguise: 5 }, createdAt: new Date() },
  { name: '解密术·基础', description: '小幅提升破解技能', rarity: 'common', skillBonus: { decryption: 5 }, createdAt: new Date() },
  { name: '隐匿术·精通', description: '提升隐匿技能', rarity: 'rare', skillBonus: { stealth: 10 }, createdAt: new Date() },
  { name: '千面术·精通', description: '提升伪装技能', rarity: 'rare', skillBonus: { disguise: 10 }, createdAt: new Date() },
  { name: '解密术·精通', description: '提升破解技能', rarity: 'rare', skillBonus: { decryption: 10 }, createdAt: new Date() },
  { name: '隐匿术·暗影', description: '大幅提升隐匿技能', rarity: 'epic', skillBonus: { stealth: 18 }, createdAt: new Date() },
  { name: '千面术·幻化', description: '大幅提升伪装技能', rarity: 'epic', skillBonus: { disguise: 18 }, createdAt: new Date() },
  { name: '解密术·洞察', description: '大幅提升破解技能', rarity: 'epic', skillBonus: { decryption: 18 }, createdAt: new Date() },
  { name: '隐匿术·传奇', description: '传说级隐匿卷轴', rarity: 'legendary', skillBonus: { stealth: 30 }, createdAt: new Date() },
  { name: '千面术·易形', description: '传说级伪装卷轴', rarity: 'legendary', skillBonus: { disguise: 30 }, createdAt: new Date() },
  { name: '解密术·真谛', description: '传说级破解卷轴', rarity: 'legendary', skillBonus: { decryption: 30 }, createdAt: new Date() }
];

class DataStore {
  private users: User[] = [...mockUsers];
  private organizations: Organization[] = [...mockOrganizations];
  private spies: Spy[] = [...mockSpies];
  private missions: Mission[] = [...mockMissions];
  private listings: MarketListing[] = [...mockMarketListings];
  private scrolls: IntelScroll[] = [...mockScrolls];
  private guilds: Guild[] = [...mockGuilds];
  private rankings: Map<string, RankingEntry[]> = new Map();
  private weeklyReport: WeeklyReport = mockWeeklyReport;
  private announcements: Announcement[] = [...mockAnnouncements];
  private executions: MissionExecution[] = [...mockExecutions];
  private executionTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventCallbacks: Map<string, (event: MissionEvent) => void> = new Map();
  private tradeHistories: TradeHistory[] = [];

  constructor() {
    this.rankings.set('intel_points', mockRankings);
    this.rankings.set('perfection', mockRankings.map((e, i) => ({ ...e, value: 50 + Math.random() * 50 })));
    this.rankings.set('guild_contribution', mockRankings.map((e, i) => ({ ...e, value: 1000 + Math.random() * 10000 })));
    this.missions = generateMissions(12);
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  getOrganization(id: string): Organization | undefined {
    return this.organizations.find(o => o.id === id);
  }

  getOrganizationByOwner(ownerId: string): Organization | undefined {
    return this.organizations.find(o => o.ownerId === ownerId);
  }

  createOrganization(org: Organization): Organization {
    this.organizations.push(org);
    return org;
  }

  updateOrganization(id: string, updates: Partial<Organization>): Organization | undefined {
    const idx = this.organizations.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.organizations[idx] = { ...this.organizations[idx], ...updates };
      return this.organizations[idx];
    }
    return undefined;
  }

  getSpies(orgId: string): Spy[] {
    return this.spies.filter(s => s.organizationId === orgId);
  }

  getSpy(id: string): Spy | undefined {
    return this.spies.find(s => s.id === id);
  }

  recruitSpy(orgId: string): Spy {
    const spy = generateRandomSpy(orgId, 0.1);
    this.spies.push(spy);
    return spy;
  }

  updateSpy(id: string, updates: Partial<Spy>): Spy | undefined {
    const idx = this.spies.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.spies[idx] = { ...this.spies[idx], ...updates };
      return this.spies[idx];
    }
    return undefined;
  }

  getMissions(): Mission[] {
    return this.missions;
  }

  getMission(id: string): Mission | undefined {
    return this.missions.find(m => m.id === id);
  }

  refreshMissions(): Mission[] {
    this.missions = generateMissions(12);
    return this.missions;
  }

  getExecutions(orgId: string): MissionExecution[] {
    return this.executions.filter(e => e.organizationId === orgId);
  }

  getExecution(id: string): MissionExecution | undefined {
    return this.executions.find(e => e.id === id);
  }

  createExecution(execution: MissionExecution): MissionExecution {
    this.executions.push(execution);
    return execution;
  }

  updateExecution(id: string, updates: Partial<MissionExecution>): MissionExecution | undefined {
    const idx = this.executions.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.executions[idx] = { ...this.executions[idx], ...updates };
      return this.executions[idx];
    }
    return undefined;
  }

  addExecutionEvent(executionId: string, event: MissionEvent): MissionExecution | undefined {
    const execution = this.getExecution(executionId);
    if (execution) {
      execution.events.push(event);
      return execution;
    }
    return undefined;
  }

  setExecutionTimer(id: string, timer: NodeJS.Timeout): void {
    this.executionTimers.set(id, timer);
  }

  clearExecutionTimer(id: string): void {
    const timer = this.executionTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.executionTimers.delete(id);
    }
  }

  setEventCallback(executionId: string, callback: (event: MissionEvent) => void): void {
    this.eventCallbacks.set(executionId, callback);
  }

  clearEventCallback(executionId: string): void {
    this.eventCallbacks.delete(executionId);
  }

  triggerEvent(executionId: string, event: MissionEvent): void {
    const callback = this.eventCallbacks.get(executionId);
    if (callback) {
      callback(event);
    }
  }

  getListings(): MarketListing[] {
    return this.listings;
  }

  createListing(listing: MarketListing): MarketListing {
    this.listings.push(listing);
    this.addAnnouncement({
      id: Date.now().toString(),
      type: 'trade',
      message: `【${listing.sellerName}】上架了【${listing.itemName}】！`,
      timestamp: new Date()
    });
    return listing;
  }

  removeListing(id: string): boolean {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.listings.splice(idx, 1);
      return true;
    }
    return false;
  }

  addTradeHistory(history: TradeHistory): void {
    this.tradeHistories.push(history);
  }

  getPriceSuggestion(itemRarity: string): [number, number] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = this.tradeHistories.filter(
      t => t.itemRarity === itemRarity && t.timestamp.getTime() >= sevenDaysAgo
    );

    if (recent.length > 0) {
      const avg = recent.reduce((sum, t) => sum + t.price, 0) / recent.length;
      const variance = avg * 0.15;
      return [
        Math.max(100, Math.round(avg - variance)),
        Math.round(avg + variance)
      ];
    }

    const [min, max] = DEFAULT_PRICES[itemRarity] || DEFAULT_PRICES.common;
    return [min, max];
  }

  getScrolls(orgId: string): IntelScroll[] {
    return this.scrolls.filter(s => s.organizationId === orgId);
  }

  updateScrollOwner(scrollId: string, newOwnerId: string): boolean {
    const idx = this.scrolls.findIndex(s => s.id === scrollId);
    if (idx !== -1) {
      this.scrolls[idx] = { ...this.scrolls[idx], organizationId: newOwnerId };
      return true;
    }
    return false;
  }

  generateScrollForReward(orgId: string, rarity: SpyRarity = 'rare'): IntelScroll | null {
    const candidates = scrollTemplates.filter(s => s.rarity === rarity);
    if (candidates.length === 0) return null;
    const template = candidates[Math.floor(Math.random() * candidates.length)];
    const scroll: IntelScroll = {
      id: 'scroll-' + uuidv4(),
      organizationId: orgId,
      ...template
    };
    this.scrolls.push(scroll);
    return scroll;
  }

  distributeMissionRewards(orgId: string, missionRewards: { scrolls: string[] }, perfection: number): IntelScroll[] {
    const grantedScrolls: IntelScroll[] = [];
    
    let scrollCount = 0;
    if (perfection >= 90) scrollCount = 2 + Math.floor(Math.random() * 2);
    else if (perfection >= 70) scrollCount = 1 + Math.floor(Math.random() * 2);
    else if (perfection >= 50) scrollCount = Math.random() > 0.5 ? 1 : 0;
    else scrollCount = Math.random() > 0.7 ? 1 : 0;

    for (let i = 0; i < scrollCount; i++) {
      let rarity: SpyRarity = 'common';
      const roll = Math.random();
      if (roll < 0.05 && perfection >= 70) rarity = 'legendary';
      else if (roll < 0.20 && perfection >= 50) rarity = 'epic';
      else if (roll < 0.50) rarity = 'rare';

      const scroll = this.generateScrollForReward(orgId, rarity);
      if (scroll) grantedScrolls.push(scroll);
    }

    return grantedScrolls;
  }

  getGuild(id: string): Guild | undefined {
    return this.guilds.find(g => g.id === id);
  }

  getGuildByMember(orgId: string): Guild | undefined {
    return this.guilds.find(g => g.members.includes(orgId));
  }

  donateMaterial(buildingId: string, materialType: string, amount: number): boolean {
    for (const guild of this.guilds) {
      const building = guild.buildings.find(b => b.id === buildingId);
      if (building) {
        building.materials[materialType] = (building.materials[materialType] || 0) + amount;
        return true;
      }
    }
    return false;
  }

  upgradeBuilding(buildingId: string): boolean {
    for (const guild of this.guilds) {
      const building = guild.buildings.find(b => b.id === buildingId);
      if (building && building.level < 10) {
        building.level++;
        building.bonus += 5;
        return true;
      }
    }
    return false;
  }

  getRankings(type: string): RankingEntry[] {
    return this.rankings.get(type) || [];
  }

  getWeeklyReport(): WeeklyReport {
    return this.weeklyReport;
  }

  getAnnouncements(): Announcement[] {
    return this.announcements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
  }

  addAnnouncement(announcement: Announcement): void {
    this.announcements.unshift(announcement);
    if (this.announcements.length > 100) {
      this.announcements.pop();
    }
  }

  calculateSuccessRate(mission: Mission, spies: Spy[], guildBonus: number = 0): number {
    if (spies.length === 0) return 0;

    let totalSkill = 0;
    let requiredSkill = 0;

    const skills = ['stealth', 'disguise', 'decryption'] as const;
    const missionSkills: Record<string, number> = {
      stealth: mission.stealthRequired,
      disguise: mission.disguiseRequired,
      decryption: mission.decryptionRequired
    };
    for (const skill of skills) {
      const required = missionSkills[skill] || 0;
      if (required > 0) {
        requiredSkill += required;
        const maxSpySkill = Math.max(...spies.map(s => s.skills[skill]));
        const scrollBonus = spies.reduce((sum, spy) => {
          return sum + spy.equippedScrolls.reduce((sSum, scrollId) => {
            const scroll = this.scrolls.find(sc => sc.id === scrollId);
            return sSum + (scroll?.skillBonus?.[skill] || 0);
          }, 0);
        }, 0);
        totalSkill += Math.min(maxSpySkill + scrollBonus, required * 1.5);
      }
    }

    const skillRatio = requiredSkill > 0 ? totalSkill / requiredSkill : 1;
    const avgStamina = spies.reduce((sum, s) => sum + s.stats.stamina, 0) / spies.length / 100;
    const rarityBonus = spies.reduce((sum, s) => {
      const bonuses: Record<string, number> = { common: 0, rare: 0.05, epic: 0.1, legendary: 0.15 };
      return sum + (bonuses[s.rarity] || 0);
    }, 0) / spies.length;

    const baseSuccess = Math.max(30, 100 - mission.difficulty);
    const successRate = baseSuccess * skillRatio * avgStamina * (1 + rarityBonus) + guildBonus;
    return Math.min(95, Math.max(5, successRate));
  }
}

export const store = new DataStore();
