import { store } from '../data/store';
import type { Guild, Building, MaterialContribution, DonateMaterialRequest } from '../../shared/types';

export class GuildService {
  getGuildByMember(orgId: string): Guild | null {
    return store.getGuildByMember(orgId) || null;
  }

  getGuild(guildId: string): Guild | null {
    return store.getGuild(guildId) || null;
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

    const success = store.donateMaterial(buildingId, request.materialType, request.amount);
    if (!success) throw new Error('捐献失败');

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

    const canUpgrade = building.requiredMaterials.every(
      req => (building.currentMaterials[req.type] || 0) >= req.amount
    );

    if (!canUpgrade) {
      throw new Error('材料不足，无法升级');
    }

    const success = store.upgradeBuilding(buildingId);
    if (!success) throw new Error('升级失败');

    const updatedBuilding = guild.buildings.find(b => b.id === buildingId)!;

    store.addAnnouncement({
      id: Date.now().toString(),
      type: 'achievement',
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
