import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type {
  User, Organization, Spy, Mission, MarketListing,
  IntelScroll, Guild, Building, WeeklyReport, RankingEntry,
  Announcement, MissionExecution, TradeHistory
} from '../../shared/types';

const PASSWORD_HASH_DEMO: string = bcrypt.hashSync ? bcrypt.hashSync('password', 10) : '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'ShadowMaster',
    email: 'shadow@intel.com',
    passwordHash: PASSWORD_HASH_DEMO,
    createdAt: new Date('2026-01-15')
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    ownerId: 'user-1',
    name: '暗夜议会',
    codeName: 'CROW',
    baseLocation: '幽暗城',
    reputation: 1250,
    exposureRisk: 15,
    intelPoints: 8500,
    level: 5,
    createdAt: new Date('2026-01-20')
  }
];

const spyNames = [
  { name: '艾琳·暗影', code: 'Viper' },
  { name: '马库斯·迷雾', code: 'Phantom' },
  { name: '莉拉·暗夜', code: 'Raven' },
  { name: '凯恩·沉默', code: 'Silent' },
  { name: '米拉·幻影', code: 'Mirage' }
];

const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];

export const generateRandomSpy = (orgId: string, rarityBoost = 0): Spy => {
  const spy = spyNames[Math.floor(Math.random() * spyNames.length)];
  const rarityRoll = Math.random() + rarityBoost;
  const rarity = rarityRoll > 0.95 ? 'legendary' : rarityRoll > 0.8 ? 'epic' : rarityRoll > 0.5 ? 'rare' : 'common';
  const baseStat = rarity === 'legendary' ? 70 : rarity === 'epic' ? 55 : rarity === 'rare' ? 40 : 25;
  
  return {
    id: uuidv4(),
    name: spy.name,
    codeName: spy.code + '-' + Math.floor(Math.random() * 999),
    organizationId: orgId,
    skills: {
      stealth: baseStat + Math.floor(Math.random() * 20),
      disguise: baseStat + Math.floor(Math.random() * 20),
      decryption: baseStat + Math.floor(Math.random() * 20)
    },
    stats: {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      concealment: 80,
      detectionRisk: 10
    },
    rarity,
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date()
  };
};

export const mockSpies: Spy[] = [
  {
    id: 'spy-1',
    name: '艾琳·暗影',
    codeName: 'Viper-001',
    organizationId: 'org-1',
    skills: { stealth: 85, disguise: 72, decryption: 65 },
    stats: { health: 100, maxHealth: 100, stamina: 95, maxStamina: 100, concealment: 85, detectionRisk: 8 },
    rarity: 'legendary',
    status: 'idle',
    equippedScrolls: ['scroll-1'],
    createdAt: new Date('2026-02-01')
  },
  {
    id: 'spy-2',
    name: '马库斯·迷雾',
    codeName: 'Phantom-014',
    organizationId: 'org-1',
    skills: { stealth: 72, disguise: 80, decryption: 70 },
    stats: { health: 100, maxHealth: 100, stamina: 88, maxStamina: 100, concealment: 78, detectionRisk: 12 },
    rarity: 'epic',
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date('2026-02-05')
  },
  {
    id: 'spy-3',
    name: '莉拉·暗夜',
    codeName: 'Raven-003',
    organizationId: 'org-1',
    skills: { stealth: 75, disguise: 70, decryption: 78 },
    stats: { health: 90, maxHealth: 100, stamina: 92, maxStamina: 100, concealment: 80, detectionRisk: 10 },
    rarity: 'epic',
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date('2026-02-10')
  },
  {
    id: 'spy-4',
    name: '凯恩·沉默',
    codeName: 'Silent-077',
    organizationId: 'org-1',
    skills: { stealth: 60, disguise: 58, decryption: 65 },
    stats: { health: 100, maxHealth: 100, stamina: 85, maxStamina: 100, concealment: 70, detectionRisk: 18 },
    rarity: 'rare',
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date('2026-02-15')
  }
];

const scrollTemplates = [
  { name: '王室密信', desc: '截获的王室内部通讯', skill: 'stealth' },
  { name: '商队交易记录', desc: '地下商会的隐秘账目', skill: 'decryption' },
  { name: '城防图', desc: '城堡的布防详图', skill: 'stealth' },
  { name: '魔法咒语残卷', desc: '失落的魔法公式', skill: 'decryption' },
  { name: '贵族宴会邀请函', desc: '可作为身份掩护的凭证', skill: 'disguise' },
  { name: '敌军情报简报', desc: '敌军动向的详细记录', skill: 'stealth' },
  { name: '易容秘方', desc: '改变容貌的药剂配方', skill: 'disguise' },
  { name: '密语手册', desc: '古老的暗号系统', skill: 'decryption' },
  { name: '地下交通图', desc: '城市隐秘通道的全图', skill: 'stealth' },
  { name: '伪造文书套装', desc: '逼真的身份文件', skill: 'disguise' },
  { name: '金库布局图', desc: '银行保险库的平面图', skill: 'stealth' },
  { name: '亡灵契约', desc: '召唤亡灵仆人的契约', skill: 'decryption' }
];

export const mockScrolls: IntelScroll[] = [
  {
    id: 'scroll-1',
    name: '王室密信',
    description: '截获的王室内部通讯',
    rarity: 'legendary',
    skillBonus: { stealth: 15 },
    organizationId: 'org-1',
    createdAt: new Date('2026-03-01')
  },
  {
    id: 'scroll-2',
    name: '魔法咒语残卷',
    description: '失落的魔法公式片段',
    rarity: 'epic',
    skillBonus: { decryption: 12 },
    organizationId: 'org-1',
    createdAt: new Date('2026-03-05')
  },
  {
    id: 'scroll-3',
    name: '易容秘方',
    description: '改变容貌的魔法药剂配方',
    rarity: 'rare',
    skillBonus: { disguise: 8 },
    organizationId: 'org-1',
    createdAt: new Date('2026-03-08')
  },
  {
    id: 'scroll-4',
    name: '城防图',
    description: '城堡守卫部署图',
    rarity: 'rare',
    skillBonus: { stealth: 6 },
    organizationId: 'org-1',
    createdAt: new Date('2026-03-10')
  },
  {
    id: 'scroll-5',
    name: '密语手册',
    description: '地下世界通用暗号手册',
    rarity: 'common',
    skillBonus: { decryption: 4 },
    organizationId: 'org-1',
    createdAt: new Date('2026-03-12')
  }
];

export const mockMissions: Mission[] = [
  {
    id: 'mission-1',
    title: '潜入贵族宅邸',
    description: '潜入贵族私人宅邸，窃取他与敌军秘密通信的证据。',
    type: 'steal',
    target: null,
    difficulty: 60,
    requiredSpies: 1,
    maxSpies: 3,
    timeLimit: 120,
    stealthRequired: 50,
    disguiseRequired: 30,
    decryptionRequired: 20,
    rewards: {
      intelPoints: 1500,
      reputation: 50,
      scrolls: ['rare', 'uncommon']
    },
    penalties: {
      reputationLoss: 20,
      exposureIncrease: 15
    }
  },
  {
    id: 'mission-2',
    title: '暗杀毒贩头目',
    description: '处理掉那个与敌对组织勾结的黑市毒贩，不留痕迹。',
    type: 'assassinate',
    target: { name: '毒贩·毒蛇', location: '黑巷' },
    difficulty: 80,
    requiredSpies: 2,
    maxSpies: 4,
    timeLimit: 180,
    stealthRequired: 70,
    disguiseRequired: 50,
    decryptionRequired: 0,
    rewards: {
      intelPoints: 3000,
      reputation: 100,
      scrolls: ['epic', 'rare']
    },
    penalties: {
      reputationLoss: 40,
      exposureIncrease: 25
    }
  },
  {
    id: 'mission-3',
    title: '渗透魔法师公会',
    description: '伪装成学徒，渗透进魔法师公会，学习他们的秘密仪式。',
    type: 'infiltrate',
    target: null,
    difficulty: 70,
    requiredSpies: 2,
    maxSpies: 3,
    timeLimit: 240,
    stealthRequired: 40,
    disguiseRequired: 75,
    decryptionRequired: 60,
    rewards: {
      intelPoints: 2500,
      reputation: 80,
      scrolls: ['epic']
    },
    penalties: {
      reputationLoss: 30,
      exposureIncrease: 20
    }
  },
  {
    id: 'mission-4',
    title: '守卫巡逻线侦察',
    description: '收集边境守卫的巡逻规律，为后续行动做准备。',
    type: 'steal',
    target: null,
    difficulty: 30,
    requiredSpies: 1,
    maxSpies: 2,
    timeLimit: 60,
    stealthRequired: 20,
    disguiseRequired: 10,
    decryptionRequired: 10,
    rewards: {
      intelPoints: 500,
      reputation: 15,
      scrolls: ['common']
    },
    penalties: {
      reputationLoss: 10,
      exposureIncrease: 5
    }
  },
  {
    id: 'mission-5',
    title: '破解加密账本',
    description: '破解敌方财务官的加密账本，找出他们的资金流向。',
    type: 'infiltrate',
    target: null,
    difficulty: 50,
    requiredSpies: 1,
    maxSpies: 2,
    timeLimit: 100,
    stealthRequired: 30,
    disguiseRequired: 20,
    decryptionRequired: 60,
    rewards: {
      intelPoints: 1200,
      reputation: 35,
      scrolls: ['rare', 'common']
    },
    penalties: {
      reputationLoss: 15,
      exposureIncrease: 10
    }
  }
];

export const mockMarketListings: MarketListing[] = [
  {
    id: 'listing-1',
    sellerId: 'org-1',
    sellerName: '暗夜议会',
    type: 'intel_scroll',
    itemId: 'scroll-3',
    itemName: '易容秘方',
    itemRarity: 'rare',
    price: 1200,
    suggestedPriceRange: [1000, 1500],
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 86400000)
  }
];

export const mockGuilds: Guild[] = [
  {
    id: 'guild-1',
    name: '暗影联盟',
    description: '由多个情报组织组成的地下联盟，共同对抗王国的压迫',
    members: ['org-1'],
    buildings: [
      {
        id: 'building-1',
        type: 'intelStation',
        name: '联合情报站',
        level: 2,
        bonus: 5,
        materials: { documents: 50, gold: 30, gems: 10 }
      },
      {
        id: 'building-2',
        type: 'communicationTower',
        name: '加密通讯塔',
        level: 1,
        bonus: 3,
        materials: { documents: 30, gold: 50, gems: 5 }
      }
    ],
    createdAt: new Date('2026-03-01')
  }
];

export const mockWeeklyReport: WeeklyReport = {
  id: 'report-1',
  periodStart: new Date(Date.now() - 7 * 24 * 3600000),
  periodEnd: new Date(),
  totalMissions: 47,
  successfulMissions: 38,
  failedMissions: 9,
  successRate: 80.85,
  totalIntelPoints: 125000,
  regionActivity: [
    { region: '幽暗城', missions: 18, successRate: 88.9 },
    { region: '边境要塞', missions: 15, successRate: 73.3 },
    { region: '王都', missions: 14, successRate: 78.6 }
  ],
  priceTrends: [
    { rarity: 'common', prices: [180, 200, 190, 210, 205, 220, 230], average: 205 },
    { rarity: 'rare', prices: [900, 950, 1000, 980, 1100, 1050, 1120], average: 1014 },
    { rarity: 'epic', prices: [3000, 3200, 3100, 3400, 3300, 3500, 3600], average: 3300 }
  ],
  topPerformingSpies: [
    { spyId: 'spy-1', spyName: '艾琳·暗影', missionsCompleted: 12, successRate: 92 }
  ],
  riskAssessment: '低风险：当前暴露率稳定在15%，建议继续执行中高难度任务以获取更多收益。'
};

export const mockRankings: RankingEntry[] = [
  { rank: 1, name: '暗夜议会', value: 85000, category: 'intel' },
  { rank: 2, name: '密语者', value: 72000, category: 'intel' },
  { rank: 3, name: '暗影步', value: 65400, category: 'intel' },
  { rank: 4, name: '黑玫瑰', value: 58000, category: 'intel' },
  { rank: 5, name: '猎鹰', value: 51200, category: 'intel' }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    type: 'system',
    message: '【系统】暗影联盟情报网络正式上线，愿黑暗中的交易顺利！',
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: 'ann-2',
    type: 'achievement',
    message: '【暗夜议会】完成传说级任务「王室密信」，完美度 95%！',
    timestamp: new Date(Date.now() - 43200000)
  }
];

export const mockExecutions: MissionExecution[] = [];

export const mockTradeHistories: TradeHistory[] = [];

const missionTypes = ['steal', 'assassinate', 'infiltrate'] as const;
const missionTitles = [
  { title: '潜入贵族宅邸', type: 'steal' as const },
  { title: '暗杀毒贩头目', type: 'assassinate' as const },
  { title: '渗透魔法师公会', type: 'infiltrate' as const },
  { title: '守卫巡逻线侦察', type: 'steal' as const },
  { title: '破解加密账本', type: 'infiltrate' as const },
  { title: '截获信使密信', type: 'steal' as const },
  { title: '策反敌方将领', type: 'infiltrate' as const },
  { title: '暗杀腐败官员', type: 'assassinate' as const },
  { title: '盗宝密室', type: 'steal' as const },
  { title: '窃取军事部署图', type: 'steal' as const },
  { title: '混入王宫舞会', type: 'infiltrate' as const },
  { title: '清除叛徒', type: 'assassinate' as const }
];

export function generateMissions(count: number): Mission[] {
  const result: Mission[] = [];
  const templates = mockMissions;
  for (let i = 0; i < count; i++) {
    const tpl = templates[i % templates.length];
    const diffMult = 0.7 + Math.random() * 0.6;
    const diff = Math.floor(tpl.difficulty * diffMult);
    result.push({
      ...tpl,
      id: uuidv4(),
      title: i < templates.length ? tpl.title : missionTitles[i % missionTitles.length].title,
      type: i < templates.length ? tpl.type : missionTitles[i % missionTitles.length].type,
      difficulty: diff,
      timeLimit: Math.max(30, Math.floor(tpl.timeLimit * (0.8 + Math.random() * 0.4))),
      rewards: {
        intelPoints: Math.floor(tpl.rewards.intelPoints * (0.8 + Math.random() * 0.4)),
        reputation: Math.floor(tpl.rewards.reputation * (0.8 + Math.random() * 0.4)),
        scrolls: tpl.rewards.scrolls
      }
    });
  }
  return result;
}
