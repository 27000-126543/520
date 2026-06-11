export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  codeName: string;
  baseLocation: string;
  reputation: number;
  exposureRisk: number;
  intelPoints: number;
  level: number;
  createdAt: Date;
}

export type SpyRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SpyStatus = 'idle' | 'mission' | 'training' | 'injured';

export interface Spy {
  id: string;
  name: string;
  codeName: string;
  organizationId: string;
  skills: {
    stealth: number;
    disguise: number;
    decryption: number;
  };
  stats: {
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    concealment: number;
    detectionRisk: number;
  };
  rarity: SpyRarity;
  status: SpyStatus;
  equippedScrolls: string[];
  createdAt: Date;
}

export type MissionType = 'assassination' | 'theft' | 'infiltration';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  difficulty: number;
  targetLocation: string;
  requiredSkills: {
    stealth?: number;
    disguise?: number;
    decryption?: number;
  };
  baseSuccessRate: number;
  rewards: {
    intelPoints: number;
    reputation: number;
    scrolls: string[];
  };
  penalties: {
    reputationLoss: number;
    exposureIncrease: number;
  };
  timeLimit: number;
}

export type MissionStatus = 'in_progress' | 'completed' | 'failed';
export type EventType = 'patrol' | 'betrayal' | 'discovery' | 'trap' | 'opportunity';
export type EventOutcome = 'positive' | 'negative' | 'neutral';
export type PlayerAction = 'support' | 'destroy' | 'none';

export interface MissionEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  description: string;
  resolved: boolean;
  playerAction?: PlayerAction;
  outcome: EventOutcome;
}

export interface MissionExecution {
  id: string;
  missionId: string;
  organizationId: string;
  spyIds: string[];
  startTime: Date;
  endTime: Date | null;
  progress: number;
  currentSuccessRate: number;
  status: MissionStatus;
  perfection: number;
  events: MissionEvent[];
  realtimeStats: {
    concealment: number;
    detectionRisk: number;
    stamina: number;
  };
}

export type ListingType = 'intel_scroll' | 'spy_contract';

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  type: ListingType;
  itemId: string;
  itemName: string;
  itemRarity: string;
  price: number;
  suggestedPriceRange: [number, number];
  createdAt: Date;
  expiresAt: Date;
}

export interface IntelScroll {
  id: string;
  ownerId: string;
  name: string;
  rarity: SpyRarity;
  effect: string;
  type: string;
  bonus: {
    stealth?: number;
    disguise?: number;
    decryption?: number;
  };
}

export interface Building {
  id: string;
  guildId: string;
  type: 'intelStation' | 'commTower';
  name: string;
  level: number;
  maxLevel: number;
  effect: string;
  bonus: number;
  requiredMaterials: {
    type: string;
    amount: number;
  }[];
  currentMaterials: Record<string, number>;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  level: number;
  buildings: Building[];
  totalContribution: number;
  createdAt: Date;
}

export interface MaterialContribution {
  id: string;
  buildingId: string;
  organizationId: string;
  materialType: string;
  amount: number;
  timestamp: Date;
}

export interface RankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  value: number;
  change: number;
}

export type RankingType = 'intel_points' | 'perfection' | 'guild_contribution';

export interface WeeklyReport {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  regionHeatmap: {
    region: string;
    missionCount: number;
    successRate: number;
  }[];
  successRateTrend: {
    date: string;
    rate: number;
  }[];
  priceTrend: {
    type: string;
    averagePrice: number;
    volume: number;
  }[];
  topOrganizations: RankingEntry[];
  totalMissions: number;
  totalVolume: number;
}

export interface Announcement {
  id: string;
  type: 'trade' | 'achievement' | 'system';
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  organization: Organization | null;
}

export interface CreateOrganizationRequest {
  name: string;
  codeName: string;
  baseLocation: string;
}

export interface RecruitSpyRequest {
  name: string;
  codeName: string;
}

export interface UpgradeSpyRequest {
  skill: 'stealth' | 'disguise' | 'decryption';
}

export interface AcceptMissionRequest {
  spyIds: string[];
}

export interface MissionActionRequest {
  action: 'support' | 'destroy';
}

export interface CreateListingRequest {
  type: ListingType;
  itemId: string;
  price: number;
}

export interface DonateMaterialRequest {
  materialType: string;
  amount: number;
}
