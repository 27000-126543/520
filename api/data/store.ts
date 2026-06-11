import {
  mockUsers, mockOrganizations, mockSpies, mockMissions,
  mockMarketListings, mockScrolls, mockGuild, mockRanking,
  mockWeeklyReport, mockAnnouncements, mockExecutions,
  generateRandomSpy, generateMissions
} from './mockData';
import type {
  User, Organization, Spy, Mission, MarketListing,
  IntelScroll, Guild, WeeklyReport, RankingEntry,
  Announcement, MissionExecution, MissionEvent, PlayerAction
} from '../../shared/types';

class DataStore {
  private users: User[] = [...mockUsers];
  private organizations: Organization[] = [...mockOrganizations];
  private spies: Spy[] = [...mockSpies];
  private missions: Mission[] = [...mockMissions];
  private listings: MarketListing[] = [...mockMarketListings];
  private scrolls: IntelScroll[] = [...mockScrolls];
  private guilds: Guild[] = [mockGuild];
  private rankings: Map<string, RankingEntry[]> = new Map();
  private weeklyReport: WeeklyReport = mockWeeklyReport;
  private announcements: Announcement[] = [...mockAnnouncements];
  private executions: MissionExecution[] = [...mockExecutions];
  private executionTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventCallbacks: Map<string, (event: MissionEvent) => void> = new Map();

  constructor() {
    this.rankings.set('intel_points', mockRanking);
    this.rankings.set('perfection', mockRanking.map((e, i) => ({ ...e, value: 50 + Math.random() * 50 })));
    this.rankings.set('guild_contribution', mockRanking.map((e, i) => ({ ...e, value: 1000 + Math.random() * 10000 })));
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

  getPriceSuggestion(itemRarity: string): [number, number] {
    const basePrices: Record<string, [number, number]> = {
      common: [500, 1000],
      rare: [1500, 3000],
      epic: [3000, 6000],
      legendary: [6000, 12000]
    };
    const [min, max] = basePrices[itemRarity] || [500, 1000];
    const variance = Math.floor(Math.random() * 500) - 250;
    return [min + variance, max + variance];
  }

  getScrolls(orgId: string): IntelScroll[] {
    return this.scrolls.filter(s => s.ownerId === orgId);
  }

  updateScrollOwner(scrollId: string, newOwnerId: string): boolean {
    const idx = this.scrolls.findIndex(s => s.id === scrollId);
    if (idx !== -1) {
      this.scrolls[idx] = { ...this.scrolls[idx], ownerId: newOwnerId };
      return true;
    }
    return false;
  }

  getGuild(id: string): Guild | undefined {
    return this.guilds.find(g => g.id === id);
  }

  getGuildByMember(orgId: string): Guild | undefined {
    return this.guilds.find(g => g.memberIds.includes(orgId));
  }

  donateMaterial(buildingId: string, materialType: string, amount: number): boolean {
    for (const guild of this.guilds) {
      const building = guild.buildings.find(b => b.id === buildingId);
      if (building) {
        building.currentMaterials[materialType] = (building.currentMaterials[materialType] || 0) + amount;
        guild.totalContribution += amount;
        return true;
      }
    }
    return false;
  }

  upgradeBuilding(buildingId: string): boolean {
    for (const guild of this.guilds) {
      const building = guild.buildings.find(b => b.id === buildingId);
      if (building && building.level < building.maxLevel) {
        const canUpgrade = building.requiredMaterials.every(
          req => (building.currentMaterials[req.type] || 0) >= req.amount
        );
        if (canUpgrade) {
          building.requiredMaterials.forEach(req => {
            building.currentMaterials[req.type] -= req.amount;
          });
          building.level++;
          building.bonus += 5;
          building.requiredMaterials = building.requiredMaterials.map(req => ({
            ...req,
            amount: Math.floor(req.amount * 1.5)
          }));
          return true;
        }
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
    for (const skill of skills) {
      const required = mission.requiredSkills[skill] || 0;
      if (required > 0) {
        requiredSkill += required;
        const maxSpySkill = Math.max(...spies.map(s => s.skills[skill]));
        const scrollBonus = spies.reduce((sum, spy) => {
          return sum + spy.equippedScrolls.reduce((sSum, scrollId) => {
            const scroll = this.scrolls.find(sc => sc.id === scrollId);
            return sSum + (scroll?.bonus[skill] || 0);
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

    const successRate = mission.baseSuccessRate * skillRatio * avgStamina * (1 + rarityBonus) + guildBonus;
    return Math.min(95, Math.max(5, successRate));
  }
}

export const store = new DataStore();
