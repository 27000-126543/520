import { v4 as uuidv4 } from 'uuid';
import type {
  User, Organization, Spy, Mission, MarketListing,
  IntelScroll, Guild, Building, WeeklyReport, RankingEntry,
  Announcement, MissionExecution, TradeHistory
} from '../../shared/types';

const PASSWORD = 'password';

const hashPassword = async (pw: string): Promise<string> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(pw, 10);
};

const preHashSync = (pw: string): string => {
  try {
    const bcrypt = require('bcrypt');
    return bcrypt.hashSync(pw, 10);
  } catch {
    return '$2b$10$DemoHashForPasswordOnlyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  }
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'ShadowMaster',
    email: 'shadow@intel.com',
    passwordHash: preHashSync(PASSWORD),
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
    codeName: 'Phantom-047',
    organizationId: 'org-1',
    skills: { stealth: 70, disguise: 88, decryption: 55 },
    stats: { health: 90, maxHealth: 100, stamina: 80, maxStamina: 100, concealment: 78, detectionRisk: 12 },
    rarity: 'epic',
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date('2026-02-10')
  },
  {
    id: 'spy-3',
    name: '莉拉·暗夜',
    codeName: 'Raven-023',
    organizationId: 'org-1',
    skills: { stealth: 60, disguise: 55, decryption: 82 },
    stats: { health: 100, maxHealth: 100, stamina: 100, maxStamina: 100, concealment: 72, detectionRisk: 15 },
    rarity: 'epic',
    status: 'idle',
    equippedScrolls: [],
    createdAt: new Date('2026-02-15')
  },
  {
    id: 'spy-4',
    name: '凯恩·沉默',
    codeName: 'Silent-089',
    organizationId: 'org-1',
    skills: { stealth: 50, disguise: 45, decryption: 40 },
    stats: { health: 100, maxHealth: 100, stamina: 85, maxStamina: 100, concealment: 65, detectionRisk: 20 },
    rarity: 'rare',
    status: 'training',
    equippedScrolls: [],
    createdAt: new Date('2026-03-01')
  }
];

const missionTemplates = [
  {
    type: 'assassination' as const,
    titles: ['暗杀：黑暗法师', '暗杀：腐败领主', '暗杀：叛国骑士'],
    locations: ['暗影要塞', '金色议会', '边境城堡'],
    difficulties: [3, 5, 7]
  },
  {
    type: 'theft' as const,
    titles: ['窃取：龙血配方', '窃取：皇家密函', '窃取：魔法核心'],
    locations: ['魔法学院', '皇家宝库', '炼金工坊'],
    difficulties: [4, 6, 8]
  },
  {
    type: 'infiltration' as const,
    titles: ['渗透：敌方情报网', '渗透：秘密结社', '渗透：地下城'],
    locations: ['地下黑市', '盗贼公会', '远古遗迹'],
    difficulties: [5, 7, 9]
  }
];

export const generateMissions = (count = 10): Mission[] => {
  const missions: Mission[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
    const difficulty = template.difficulties[Math.floor(Math.random() * template.difficulties.length)];
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const location = template.locations[Math.floor(Math.random() * template.locations.length)];
    
    const reqStealth = Math.random() > 0.3 ? 20 + difficulty * 5 : undefined;
    const reqDisguise = Math.random() > 0.3 ? 20 + difficulty * 5 : undefined;
    const reqDecryption = template.type === 'theft' || Math.random() > 0.5 ? 20 + difficulty * 5 : undefined;
    
    missions.push({
      id: uuidv4(),
      type: template.type,
      title: title + ' #' + (i + 1),
      description: `目标位于${location}，需要出色的间谍技巧才能完成。任务难度：${difficulty}/10`,
      difficulty,
      targetLocation: location,
      requiredSkills: {
        ...(reqStealth && { stealth: reqStealth }),
        ...(reqDisguise && { disguise: reqDisguise }),
        ...(reqDecryption && { decryption: reqDecryption })
      },
      baseSuccessRate: Math.max(20, 90 - difficulty * 7),
      rewards: {
        intelPoints: difficulty * 100 + Math.floor(Math.random() * 200),
        reputation: difficulty * 10 + Math.floor(Math.random() * 20),
        scrolls: Math.random() > 0.7 ? ['scroll-' + Math.floor(Math.random() * 100)] : []
      },
      penalties: {
        reputationLoss: difficulty * 15,
        exposureIncrease: difficulty * 3
      },
      timeLimit: 30 + difficulty * 10
    });
  }
  
  return missions;
};

export const mockMissions: Mission[] = generateMissions(12);

export const mockScrolls: IntelScroll[] = [
  {
    id: 'scroll-1',
    ownerId: 'org-1',
    name: '隐匿术·暗影',
    rarity: 'epic',
    effect: '大幅提升隐匿技能，使间谍更难被发现',
    type: 'stealth',
    bonus: { stealth: 15 }
  },
  {
    id: 'scroll-2',
    ownerId: 'org-1',
    name: '千面术·精通',
    rarity: 'rare',
    effect: '提升伪装技能，增强间谍渗透能力',
    type: 'disguise',
    bonus: { disguise: 10 }
  },
  {
    id: 'scroll-3',
    ownerId: 'org-1',
    name: '解密术·洞察',
    rarity: 'epic',
    effect: '大幅提升破解技能，加速情报解密',
    type: 'decryption',
    bonus: { decryption: 12 }
  }
];

export const mockMarketListings: MarketListing[] = [
  {
    id: 'listing-1',
    sellerId: 'org-2',
    sellerName: '鹰眼情报社',
    type: 'intel_scroll',
    itemId: 'scroll-101',
    itemName: '隐匿术·传奇',
    itemRarity: 'legendary',
    price: 5000,
    suggestedPriceRange: [4500, 6000],
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 86400000)
  },
  {
    id: 'listing-2',
    sellerId: 'org-3',
    sellerName: '夜枭密探',
    type: 'intel_scroll',
    itemId: 'scroll-102',
    itemName: '千面术·精通',
    itemRarity: 'epic',
    price: 2500,
    suggestedPriceRange: [2000, 3000],
    createdAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() + 72000000)
  },
  {
    id: 'listing-3',
    sellerId: 'org-4',
    sellerName: '黑鸦事务所',
    type: 'spy_contract',
    itemId: 'spy-999',
    itemName: '精英间谍·暗影',
    itemRarity: 'epic',
    price: 8000,
    suggestedPriceRange: [7000, 9500],
    createdAt: new Date(Date.now() - 1800000),
    expiresAt: new Date(Date.now() + 108000000)
  }
];

export const mockGuild: Guild = {
  id: 'guild-1',
  name: '暗影联盟',
  leaderId: 'org-1',
  memberIds: ['org-1', 'org-2', 'org-3', 'org-4', 'org-5'],
  level: 3,
  buildings: [
    {
      id: 'building-1',
      guildId: 'guild-1',
      type: 'intelStation',
      name: '联合情报站',
      level: 3,
      maxLevel: 10,
      effect: '提升全体成员任务成功率 15%',
      bonus: 15,
      requiredMaterials: [
        { type: '魔法水晶', amount: 100 },
        { type: '暗影精华', amount: 50 },
        { type: '远古符文', amount: 20 }
      ],
      currentMaterials: { '魔法水晶': 75, '暗影精华': 30, '远古符文': 12 }
    },
    {
      id: 'building-2',
      guildId: 'guild-1',
      type: 'commTower',
      name: '加密通讯塔',
      level: 2,
      maxLevel: 10,
      effect: '提升情报获取效率 10%',
      bonus: 10,
      requiredMaterials: [
        { type: '魔法水晶', amount: 80 },
        { type: '雷霆核心', amount: 40 },
        { type: '远古符文', amount: 15 }
      ],
      currentMaterials: { '魔法水晶': 80, '雷霆核心': 25, '远古符文': 8 }
    }
  ],
  totalContribution: 15600,
  createdAt: new Date('2026-03-01')
};

export const mockRanking: RankingEntry[] = [
  { rank: 1, playerId: 'org-10', playerName: '龙息情报网', value: 125000, change: 0 },
  { rank: 2, playerId: 'org-1', playerName: '暗夜议会', value: 98500, change: 1 },
  { rank: 3, playerId: 'org-11', playerName: '幽灵之手', value: 87200, change: -1 },
  { rank: 4, playerId: 'org-2', playerName: '鹰眼情报社', value: 76800, change: 2 },
  { rank: 5, playerId: 'org-12', playerName: '血色蔷薇', value: 65400, change: -1 },
  { rank: 6, playerId: 'org-3', playerName: '夜枭密探', value: 58900, change: 0 },
  { rank: 7, playerId: 'org-13', playerName: '虚空行者', value: 51200, change: 3 },
  { rank: 8, playerId: 'org-4', playerName: '黑鸦事务所', value: 45600, change: -2 },
  { rank: 9, playerId: 'org-14', playerName: '月影暗杀团', value: 38900, change: 1 },
  { rank: 10, playerId: 'org-15', playerName: '深渊之眼', value: 32100, change: 0 }
];

const regions = ['幽暗城', '金色议会', '边境城堡', '魔法学院', '皇家宝库', '地下黑市', '远古遗迹', '盗贼公会'];

export const generateWeeklyReport = (): WeeklyReport => {
  const regionHeatmap = regions.map(region => ({
    region,
    missionCount: 50 + Math.floor(Math.random() * 200),
    successRate: 40 + Math.floor(Math.random() * 40)
  }));
  
  const successRateTrend = Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    rate: 55 + Math.floor(Math.random() * 25)
  }));
  
  const priceTrend = [
    { type: 'legendary', averagePrice: 8000 + Math.floor(Math.random() * 3000), volume: 10 + Math.floor(Math.random() * 20) },
    { type: 'epic', averagePrice: 3000 + Math.floor(Math.random() * 1500), volume: 30 + Math.floor(Math.random() * 50) },
    { type: 'rare', averagePrice: 1000 + Math.floor(Math.random() * 500), volume: 80 + Math.floor(Math.random() * 100) }
  ];
  
  return {
    id: uuidv4(),
    weekStart: new Date(Date.now() - 7 * 86400000),
    weekEnd: new Date(),
    regionHeatmap,
    successRateTrend,
    priceTrend,
    topOrganizations: mockRanking.slice(0, 5),
    totalMissions: 5000 + Math.floor(Math.random() * 3000),
    totalVolume: 500000 + Math.floor(Math.random() * 500000)
  };
};

export const mockWeeklyReport = generateWeeklyReport();

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    type: 'trade',
    message: '【鹰眼情报社】以 5,500 积分出售了【隐匿术·传奇】！',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 'ann-2',
    type: 'achievement',
    message: '恭喜【暗夜议会】完成传奇任务【暗杀：黑暗法师】，完美度 98%！',
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 'ann-3',
    type: 'system',
    message: '系统公告：本周情报产业报告已生成，请前往查看。',
    timestamp: new Date(Date.now() - 3600000)
  }
];

export const mockExecutions: MissionExecution[] = [];
