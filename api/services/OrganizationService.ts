import { v4 as uuidv4 } from 'uuid';
import { store } from '../data/store';
import type { Organization, CreateOrganizationRequest } from '../../shared/types';

export class OrganizationService {
  getOrganization(userId: string): Organization | null {
    const org = store.getOrganizationByOwner(userId);
    return org || null;
  }

  createOrganization(userId: string, request: CreateOrganizationRequest): Organization {
    const existing = store.getOrganizationByOwner(userId);
    if (existing) {
      throw new Error('您已经创建了一个情报组织');
    }

    const organization: Organization = {
      id: uuidv4(),
      ownerId: userId,
      name: request.name,
      codeName: request.codeName,
      baseLocation: request.baseLocation,
      reputation: 100,
      exposureRisk: 5,
      intelPoints: 3000,
      level: 1,
      createdAt: new Date()
    };

    return store.createOrganization(organization);
  }

  updateOrganization(orgId: string, updates: Partial<Organization>): Organization {
    const org = store.updateOrganization(orgId, updates);
    if (!org) {
      throw new Error('组织不存在');
    }
    return org;
  }

  addIntelPoints(orgId: string, amount: number): Organization {
    const org = store.getOrganization(orgId);
    if (!org) {
      throw new Error('组织不存在');
    }
    const newPoints = org.intelPoints + amount;
    const newLevel = Math.floor(newPoints / 2000) + 1;
    return store.updateOrganization(orgId, {
      intelPoints: newPoints,
      level: newLevel
    })!;
  }

  updateReputation(orgId: string, change: number): Organization {
    const org = store.getOrganization(orgId);
    if (!org) {
      throw new Error('组织不存在');
    }
    return store.updateOrganization(orgId, {
      reputation: Math.max(0, org.reputation + change)
    })!;
  }

  updateExposureRisk(orgId: string, change: number): Organization {
    const org = store.getOrganization(orgId);
    if (!org) {
      throw new Error('组织不存在');
    }
    return store.updateOrganization(orgId, {
      exposureRisk: Math.min(100, Math.max(0, org.exposureRisk + change))
    })!;
  }
}

export const organizationService = new OrganizationService();
