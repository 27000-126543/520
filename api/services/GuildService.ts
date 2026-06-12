import { store } from '../data/store';
import type { Guild, Building, MaterialContribution, DonateMaterialRequest } from '../../shared/types';

export class GuildService {
  getAllGuilds(): Guild[] {
    return store.getAllGuilds();
  }

  getGuildByMember(orgId: string): Guild | null {
    return store.getGuildByMember(orgId) || null;
  }

  getGuild(guildId: string): Guild | null {
    return store.getGuild(guildId) || null;
  }

  joinGuild(guildId: string, orgId: string): Guild {
    const existing = store.getGuildByMember(orgId);
    if (existing) {
      throw new Error('您已加入其他公会，请先退出');
    }
    const guild = store.joinGuild(guildId, orgId);
    if (!guild) throw new Error('公会不存在');
    return guild;
  }

  leaveGuild(guildId: string, orgId: string): boolean {
    return store.leaveGuild(guildId, orgId);
  }

  getContributionRanking(guildId: string): Array<{ orgId: string; orgName: string; amount: number }> {
    return store.getGuildContributionRanking(guildId);
  }

  donateMaterial(
    orgId: string,
    buildingId: string,
    request: DonateMaterialRequest
  ): Building {
    const guild = store.getGuildByMember(orgId);
    if (!guild) throw new Error('您尚未加入任何公会');

    const building = guild.buildings.find(b => b.id === buildingId);
    if (!building) throw new Error('建筑不存在');

    const org = store.getOrganization(orgId);
    if (!org) throw new Error('组织不存在');

    const cost = request.amount * 10;
    if (org.intelPoints < cost) {
      throw new Error('情报点数不足，无法兑换材料');
    }

    store.updateOrganization(orgId, { intelPoints: org.intelPoints - cost });

    const success = store.donateMaterial(buildingId, request.materialType, request.amount, orgId);
    if (!success) throw new Error('捐献失败');

    building.currentMaterials[request.materialType] =
      (building.currentMaterials[request.materialType] || 0) + request.amount;

    return building;
  }

  upgradeBuilding(orgId: string, buildingId: string): Building {
    const guild = store.getGuildByMember(orgId);
    if (!guild) throw new Error('您尚未加入任何公会');

    const building = guild.buildings.find(b => b.id === buildingId);
    if (!building) throw new Error('建筑不存在');

    if (building.level >= building.maxLevel) {
      throw new Error('建筑已达到最高等级');
    }

    for (const mat of building.requiredMaterials) {
      if ((building.currentMaterials[mat.type] || 0) < mat.amount) {
        throw new Error(`材料 ${mat.type} 不足`);
      }
    }

    for (const mat of building.requiredMaterials) {
      building.currentMaterials[mat.type] -= mat.amount;
    }

    const success = store.upgradeBuilding(buildingId);
    if (!success) throw new Error('升级失败');

    const updatedBuilding = guild.buildings.find(b => b.id === buildingId)!;
    updatedBuilding.level = building.level;
    updatedBuilding.bonus = building.bonus;
    const nextLv = updatedBuilding.level;
    updatedBuilding.requiredMaterials = updatedBuilding.requiredMaterials.map(m => ({
      type: m.type,
      amount: Math.floor(m.amount * (1 + nextLv * 0.3))
    }));

    store.addAnnouncement({
      id: Date.now().toString(),
      type: 'achievement' as const,
      message: `【${guild.name}】的【${building.name}】升级到 ${updatedBuilding.level} 级！`,
      timestamp: new Date()
    });

    return updatedBuilding;
  }

  getContributions(buildingId: string): MaterialContribution[] {
    return [];
  }
}

export const guildService = new GuildService();
