import { store } from '../data/store';
import type { Spy } from '../../shared/types';

const RECRUIT_COST = 500;
const UPGRADE_COST = 300;

export class SpyService {
  getSpies(orgId: string): Spy[] {
    return store.getSpies(orgId);
  }

  getSpy(id: string): Spy | null {
    return store.getSpy(id) || null;
  }

  recruitSpy(orgId: string): Spy {
    const org = store.getOrganization(orgId);
    if (!org) {
      throw new Error('组织不存在');
    }
    if (org.intelPoints < RECRUIT_COST) {
      throw new Error('情报点数不足');
    }

    store.updateOrganization(orgId, { intelPoints: org.intelPoints - RECRUIT_COST });
    return store.recruitSpy(orgId);
  }

  upgradeSkill(orgId: string, spyId: string, skill: 'stealth' | 'disguise' | 'decryption'): Spy {
    const org = store.getOrganization(orgId);
    if (!org) {
      throw new Error('组织不存在');
    }
    if (org.intelPoints < UPGRADE_COST) {
      throw new Error('情报点数不足');
    }

    const spy = store.getSpy(spyId);
    if (!spy || spy.organizationId !== orgId) {
      throw new Error('间谍不存在');
    }
    if (spy.skills[skill] >= 100) {
      throw new Error('该技能已达到满级');
    }

    store.updateOrganization(orgId, { intelPoints: org.intelPoints - UPGRADE_COST });

    const newSkills = { ...spy.skills };
    newSkills[skill] = Math.min(100, newSkills[skill] + 5);

    return store.updateSpy(spyId, { skills: newSkills })!;
  }

  setSpyStatus(spyId: string, status: Spy['status']): Spy | null {
    return store.updateSpy(spyId, { status });
  }

  updateSpyStats(spyId: string, stats: Partial<Spy['stats']>): Spy | null {
    const spy = store.getSpy(spyId);
    if (!spy) return null;

    const newStats = { ...spy.stats, ...stats };
    newStats.health = Math.max(0, Math.min(newStats.maxHealth, newStats.health));
    newStats.stamina = Math.max(0, Math.min(newStats.maxStamina, newStats.stamina));
    newStats.concealment = Math.max(0, Math.min(100, newStats.concealment));
    newStats.detectionRisk = Math.max(0, Math.min(100, newStats.detectionRisk));

    return store.updateSpy(spyId, { stats: newStats });
  }
}

export const spyService = new SpyService();
