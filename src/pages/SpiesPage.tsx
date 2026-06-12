import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { StatBar } from '../components/ui/StatBar';
import { SkillRadarChart } from '../components/game/SkillRadarChart';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import type { Spy } from '../../shared/types';
import {
  Users, UserPlus, Filter, X, Eye, UserCheck, Key, Heart,
  Zap, Shield, AlertCircle, CheckCircle, Clock, Target,
  ScrollText, Package, Plus, Trash2
} from 'lucide-react';
import type { IntelScroll } from '../../shared/types';

type FilterType = 'all' | 'idle' | 'mission';
type TabType = 'spies' | 'scrolls';

const scrollSlotsLimit: Record<string, number> = {
  legendary: 3,
  epic: 2,
  rare: 1,
  common: 1
};

const rarityColors = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-gold-500'
};

const rarityGlow = {
  common: '',
  rare: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  epic: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
  legendary: 'shadow-[0_0_25px_rgba(212,175,55,0.7)] animate-glow'
};

const rarityBg = {
  common: 'from-gray-900/50 to-gray-800/30',
  rare: 'from-blue-900/40 to-blue-800/20',
  epic: 'from-purple-900/40 to-purple-800/20',
  legendary: 'from-amber-900/40 to-amber-800/20'
};

const statusLabels = {
  idle: { label: '空闲', color: 'text-green-400 bg-green-500/20' },
  mission: { label: '任务中', color: 'text-blue-400 bg-blue-500/20' },
  training: { label: '训练中', color: 'text-yellow-400 bg-yellow-500/20' },
  injured: { label: '受伤', color: 'text-red-400 bg-red-500/20' }
};

export const SpiesPage = () => {
  const { organization, isAuthenticated } = useAuthStore();
  const {
    spies, scrolls, isLoading, loadSpies, loadScrolls, recruitSpy,
    upgradeSpySkill, equipScroll, unequipScroll, executions
  } = useGameStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedSpy, setSelectedSpy] = useState<Spy | null>(null);
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('spies');
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isUnequipping, setIsUnequipping] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSpies();
      loadScrolls();
    }
  }, [isAuthenticated]);

  const getEquippedScrolls = (spy: Spy): IntelScroll[] => {
    return scrolls.filter(s => spy.equippedScrolls.includes(s.id));
  };

  const getUnequippedScrolls = (): IntelScroll[] => {
    const allEquippedIds = new Set(spies.flatMap(s => s.equippedScrolls));
    return scrolls.filter(s => !allEquippedIds.has(s.id));
  };

  const getScrollsByRarity = (scrollList: IntelScroll[]): Record<string, IntelScroll[]> => {
    return {
      legendary: scrollList.filter(s => s.rarity === 'legendary'),
      epic: scrollList.filter(s => s.rarity === 'epic'),
      rare: scrollList.filter(s => s.rarity === 'rare'),
      common: scrollList.filter(s => s.rarity === 'common')
    };
  };

  const canEquipMore = (spy: Spy): boolean => {
    const limit = scrollSlotsLimit[spy.rarity];
    return spy.equippedScrolls.length < limit;
  };

  const calculateSuccessRate = (spy: Spy): number => {
    const totalSkills = spy.skills.stealth + spy.skills.disguise + spy.skills.decryption;
    const baseRate = Math.min(95, Math.max(20, totalSkills / 3 + 20));
    const equippedScrolls = getEquippedScrolls(spy);
    const scrollBonus = equippedScrolls.reduce((sum, s) => {
      return sum + (s.skillBonus.stealth || 0) + (s.skillBonus.disguise || 0) + (s.skillBonus.decryption || 0);
    }, 0);
    return Math.min(99, baseRate + scrollBonus * 0.5);
  };

  const handleRecruit = async () => {
    setIsRecruiting(true);
    try {
      await recruitSpy();
    } finally {
      setIsRecruiting(false);
    }
  };

  const handleUpgrade = async (spyId: string, skill: 'stealth' | 'disguise' | 'decryption') => {
    const result = await upgradeSpySkill(spyId, skill);
    if (result && selectedSpy?.id === spyId) {
      setSelectedSpy(result);
    }
  };

  const handleEquipScroll = async (spyId: string, scrollId: string) => {
    setIsEquipping(true);
    try {
      const result = await equipScroll(spyId, scrollId);
      if (result && selectedSpy?.id === spyId) {
        setSelectedSpy(result);
      }
      if (result && !canEquipMore(result)) {
        setShowEquipModal(false);
      }
    } finally {
      setIsEquipping(false);
    }
  };

  const handleUnequipScroll = async (spyId: string, scrollId: string) => {
    setIsUnequipping(scrollId);
    try {
      const result = await unequipScroll(spyId, scrollId);
      if (result && selectedSpy?.id === spyId) {
        setSelectedSpy(result);
      }
    } finally {
      setIsUnequipping(null);
    }
  };

  const filteredSpies = spies.filter(spy => {
    if (filter === 'all') return true;
    return spy.status === filter;
  });

  const idleSpies = spies.filter(s => s.status === 'idle');
  const missionSpies = spies.filter(s => s.status === 'mission');

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            间谍管理
          </h1>
          <p className="text-arcane-400">招募、训练和管理你的情报特工</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="arcane-card px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">{idleSpies.length} 空闲</span>
            </div>
            <div className="w-px h-4 bg-arcane-600" />
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-400">{missionSpies.length} 任务中</span>
            </div>
          </div>
          <ArcaneButton onClick={handleRecruit} loading={isRecruiting}>
            <UserPlus className="w-4 h-4 mr-2" />
            招募间谍
          </ArcaneButton>
        </div>
      </div>

      <div className="flex bg-arcane-800/50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('spies')}
          className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'spies'
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
              : 'text-arcane-400 hover:text-gold-400'
          }`}
        >
          <Users className="w-4 h-4" />
          间谍列表
        </button>
        <button
          onClick={() => setActiveTab('scrolls')}
          className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'scrolls'
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
              : 'text-arcane-400 hover:text-gold-400'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          卷轴库存
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'spies' ? (
          <motion.div
            key="spies-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-arcane-400" />
              <div className="flex bg-arcane-800/50 rounded-lg p-1">
                {(['all', 'idle', 'mission'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                        : 'text-arcane-400 hover:text-gold-400'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'idle' ? '空闲' : '任务中'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                {filteredSpies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence>
                      {filteredSpies.map((spy) => (
                        <motion.div
                          key={spy.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setSelectedSpy(spy)}
                        >
                          <ArcaneCard
                            className={`p-5 bg-gradient-to-br ${rarityBg[spy.rarity]} ${
                              selectedSpy?.id === spy.id ? 'ring-2 ring-gold-400' : ''
                            } ${rarityGlow[spy.rarity]}`}
                            hover
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, 0] }}
                                  transition={{ duration: 0.5 }}
                                  className={`w-14 h-14 rounded-full border-2 ${rarityColors[spy.rarity]} bg-arcane-800 flex items-center justify-center text-2xl`}
                                >
                                  <Users className="w-7 h-7 text-gold-400" />
                                </motion.div>
                                <div>
                                  <h3 className="font-display text-lg font-bold text-gold-400">{spy.codeName}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[spy.rarity]} ${
                                      spy.rarity === 'legendary' ? 'text-gold-400' :
                                      spy.rarity === 'epic' ? 'text-purple-400' :
                                      spy.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                    }`}>
                                      {spy.rarity === 'common' ? '普通' : spy.rarity === 'rare' ? '稀有' :
                                       spy.rarity === 'epic' ? '史诗' : '传说'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabels[spy.status].color}`}>
                                      {statusLabels[spy.status].label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-arcane-800/50 rounded-full">
                                <ScrollText className="w-3 h-3 text-gold-400" />
                                <span className="text-xs font-mono text-gold-400">
                                  {spy.equippedScrolls.length}/{scrollSlotsLimit[spy.rarity]}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-arcane-400" />
                                <span className="text-xs text-arcane-300 w-12">隐匿</span>
                                <div className="flex-1">
                                  <StatBar value={spy.skills.stealth} max={100} color="purple" showValue={false} />
                                </div>
                                <span className="text-xs font-mono text-arcane-400 w-8">{spy.skills.stealth}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-blue-300 w-12">伪装</span>
                                <div className="flex-1">
                                  <StatBar value={spy.skills.disguise} max={100} color="blue" showValue={false} />
                                </div>
                                <span className="text-xs font-mono text-blue-400 w-8">{spy.skills.disguise}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-300 w-12">破解</span>
                                <div className="flex-1">
                                  <StatBar value={spy.skills.decryption} max={100} color="green" showValue={false} />
                                </div>
                                <span className="text-xs font-mono text-green-400 w-8">{spy.skills.decryption}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-red-300 w-12">体力</span>
                                <div className="flex-1">
                                  <StatBar value={spy.stats.stamina} max={spy.stats.maxStamina} color="red" showValue={false} />
                                </div>
                                <span className="text-xs font-mono text-red-400 w-12">
                                  {spy.stats.stamina}/{spy.stats.maxStamina}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gold-400" />
                                <span className="text-xs text-gold-300 w-12">成功率</span>
                                <div className="flex-1">
                                  <StatBar value={calculateSuccessRate(spy)} max={100} color="gold" showValue={false} />
                                </div>
                                <span className="text-xs font-mono text-gold-400 w-12">
                                  {calculateSuccessRate(spy).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'stealth'); }}
                                disabled={spy.status !== 'idle'}
                                className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-arcane-300 rounded border border-arcane-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                升级隐匿
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'disguise'); }}
                                disabled={spy.status !== 'idle'}
                                className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-blue-300 rounded border border-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                升级伪装
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'decryption'); }}
                                disabled={spy.status !== 'idle'}
                                className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-green-300 rounded border border-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                升级破解
                              </button>
                            </div>
                          </ArcaneCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <ArcaneCard className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
                    <h3 className="text-xl font-bold text-gold-400 mb-2">暂无间谍</h3>
                    <p className="text-arcane-400 mb-6">点击上方按钮招募你的第一名间谍</p>
                    <ArcaneButton onClick={handleRecruit} loading={isRecruiting}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      立即招募
                    </ArcaneButton>
                  </ArcaneCard>
                )}
              </div>

              <div className="space-y-6">
                {selectedSpy ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedSpy.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ArcaneCard className={`p-6 bg-gradient-to-br ${rarityBg[selectedSpy.rarity]} ${rarityGlow[selectedSpy.rarity]}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-gold-400">间谍详情</h2>
                          <button
                            onClick={() => setSelectedSpy(null)}
                            className="p-1 hover:bg-arcane-700/50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-arcane-400" />
                          </button>
                        </div>

                        <div className="text-center mb-6">
                          <div className={`w-24 h-24 mx-auto rounded-full border-4 ${rarityColors[selectedSpy.rarity]} bg-arcane-800 flex items-center justify-center text-4xl mb-4`}>
                            <Users className="w-12 h-12 text-gold-400" />
                          </div>
                          <h3 className="font-display text-2xl font-bold text-gold-400">{selectedSpy.codeName}</h3>
                          <p className="text-arcane-400">{selectedSpy.name}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className={`text-xs px-3 py-1 rounded-full border ${rarityColors[selectedSpy.rarity]} ${
                              selectedSpy.rarity === 'legendary' ? 'text-gold-400' :
                              selectedSpy.rarity === 'epic' ? 'text-purple-400' :
                              selectedSpy.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {selectedSpy.rarity === 'common' ? '普通' : selectedSpy.rarity === 'rare' ? '稀有' :
                               selectedSpy.rarity === 'epic' ? '史诗' : '传说'}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full ${statusLabels[selectedSpy.status].color}`}>
                              {statusLabels[selectedSpy.status].label}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                              成功率 {calculateSuccessRate(selectedSpy).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-center mb-6">
                          <SkillRadarChart
                            data={[
                              { skill: '隐匿', value: selectedSpy.skills.stealth, fullMark: 100 },
                              { skill: '伪装', value: selectedSpy.skills.disguise, fullMark: 100 },
                              { skill: '破解', value: selectedSpy.skills.decryption, fullMark: 100 },
                              { skill: '体力', value: selectedSpy.stats.stamina, fullMark: selectedSpy.stats.maxStamina },
                              { skill: '隐匿值', value: selectedSpy.stats.concealment, fullMark: 100 },
                            ]}
                            size={220}
                            color={selectedSpy.rarity === 'legendary' ? '#d4af37' :
                                   selectedSpy.rarity === 'epic' ? '#a855f7' :
                                   selectedSpy.rarity === 'rare' ? '#3b82f6' : '#6b7280'}
                          />
                        </div>

                        <div className="space-y-4 mb-6">
                          <h4 className="font-medium text-gold-300 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gold-500" />
                            属性面板
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-arcane-300">生命值</span>
                              </div>
                              <span className="font-mono text-red-400">
                                {selectedSpy.stats.health}/{selectedSpy.stats.maxHealth}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-arcane-400" />
                                <span className="text-sm text-arcane-300">隐匿值</span>
                              </div>
                              <span className="font-mono text-arcane-400">{selectedSpy.stats.concealment}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-arcane-300">被发现风险</span>
                              </div>
                              <span className="font-mono text-yellow-400">{selectedSpy.stats.detectionRisk}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gold-400" />
                                <span className="text-sm text-arcane-300">任务成功率</span>
                              </div>
                              <span className="font-mono text-gold-400">{calculateSuccessRate(selectedSpy).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gold-300 flex items-center gap-2">
                              <ScrollText className="w-4 h-4 text-gold-500" />
                              已装备卷轴
                              <span className="text-xs text-arcane-400 font-mono">
                                ({selectedSpy.equippedScrolls.length}/{scrollSlotsLimit[selectedSpy.rarity]})
                              </span>
                            </h4>
                            <ArcaneButton
                              variant="secondary"
                              onClick={() => setShowEquipModal(true)}
                              disabled={selectedSpy.status !== 'idle' || !canEquipMore(selectedSpy)}
                              className="text-xs py-1.5 px-3"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              装备卷轴
                            </ArcaneButton>
                          </div>
                          {selectedSpy.status !== 'idle' && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              任务中的间谍无法装备/卸下卷轴
                            </p>
                          )}
                          {getEquippedScrolls(selectedSpy).length > 0 ? (
                            <div className="space-y-2">
                              <AnimatePresence>
                                {getEquippedScrolls(selectedSpy).map((scroll) => (
                                  <motion.div
                                    key={scroll.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className={`p-3 rounded-lg border ${rarityColors[scroll.rarity]} bg-gradient-to-r ${rarityBg[scroll.rarity]} ${rarityGlow[scroll.rarity]}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <ScrollText className={`w-4 h-4 ${
                                          scroll.rarity === 'legendary' ? 'text-gold-400' :
                                          scroll.rarity === 'epic' ? 'text-purple-400' :
                                          scroll.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                        }`} />
                                        <div>
                                          <p className={`text-sm font-medium ${
                                            scroll.rarity === 'legendary' ? 'text-gold-400' :
                                            scroll.rarity === 'epic' ? 'text-purple-400' :
                                            scroll.rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'
                                          }`}>{scroll.name}</p>
                                          <p className="text-xs text-arcane-400">
                                            {scroll.skillBonus.stealth && <span className="text-arcane-300">隐匿+{scroll.skillBonus.stealth} </span>}
                                            {scroll.skillBonus.disguise && <span className="text-blue-300">伪装+{scroll.skillBonus.disguise} </span>}
                                            {scroll.skillBonus.decryption && <span className="text-green-300">破解+{scroll.skillBonus.decryption}</span>}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleUnequipScroll(selectedSpy.id, scroll.id)}
                                        disabled={selectedSpy.status !== 'idle' || isUnequipping === scroll.id}
                                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="卸下卷轴"
                                      >
                                        {isUnequipping === scroll.id ? (
                                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                          </svg>
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <ArcaneCard className="p-4 text-center bg-arcane-800/30">
                              <ScrollText className="w-8 h-8 mx-auto mb-2 text-arcane-500 opacity-50" />
                              <p className="text-sm text-arcane-400">尚未装备任何卷轴</p>
                            </ArcaneCard>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gold-500/20">
                          <h4 className="font-medium text-gold-300 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold-500" />
                            加入时间
                          </h4>
                          <p className="text-sm text-arcane-400 font-mono">
                            {new Date(selectedSpy.createdAt).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                          <ArcaneButton
                            variant="secondary"
                            onClick={() => handleUpgrade(selectedSpy.id, 'stealth')}
                            disabled={selectedSpy.status !== 'idle'}
                            className="text-xs py-2"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            隐匿 +1
                          </ArcaneButton>
                          <ArcaneButton
                            variant="secondary"
                            onClick={() => handleUpgrade(selectedSpy.id, 'disguise')}
                            disabled={selectedSpy.status !== 'idle'}
                            className="text-xs py-2"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            伪装 +1
                          </ArcaneButton>
                          <ArcaneButton
                            variant="secondary"
                            onClick={() => handleUpgrade(selectedSpy.id, 'decryption')}
                            disabled={selectedSpy.status !== 'idle'}
                            className="text-xs py-2"
                          >
                            <Key className="w-3 h-3 mr-1" />
                            破解 +1
                          </ArcaneButton>
                        </div>
                      </ArcaneCard>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <ArcaneCard className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-arcane-500 opacity-50" />
                    <p className="text-arcane-400">点击左侧间谍卡片查看详情</p>
                  </ArcaneCard>
                )}

                <ArcaneCard className="p-6">
                  <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-gold-500" />
                    统计数据
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-arcane-400">总间谍数</span>
                      <span className="font-display text-2xl font-bold text-gold-400">{spies.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-arcane-400">传说级</span>
                      <span className="font-mono text-gold-400">{spies.filter(s => s.rarity === 'legendary').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-arcane-400">史诗级</span>
                      <span className="font-mono text-purple-400">{spies.filter(s => s.rarity === 'epic').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-arcane-400">稀有级</span>
                      <span className="font-mono text-blue-400">{spies.filter(s => s.rarity === 'rare').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-arcane-400">普通级</span>
                      <span className="font-mono text-gray-400">{spies.filter(s => s.rarity === 'common').length}</span>
                    </div>
                  </div>
                </ArcaneCard>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scrolls-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {scrolls.length > 0 ? (
              <div className="space-y-6">
                {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => {
                  const rarityScrolls = scrolls.filter(s => s.rarity === rarity);
                  if (rarityScrolls.length === 0) return null;
                  const equippedIds = new Set(spies.flatMap(s => s.equippedScrolls));
                  return (
                    <div key={rarity}>
                      <h3 className={`font-display text-lg font-bold mb-3 flex items-center gap-2 ${
                        rarity === 'legendary' ? 'text-gold-400' :
                        rarity === 'epic' ? 'text-purple-400' :
                        rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        <ScrollText className="w-5 h-5" />
                        {rarity === 'legendary' ? '传说级' : rarity === 'epic' ? '史诗级' :
                         rarity === 'rare' ? '稀有级' : '普通级'}
                        <span className="text-sm text-arcane-400 font-normal">({rarityScrolls.length})</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {rarityScrolls.map((scroll) => {
                          const isEquipped = equippedIds.has(scroll.id);
                          const equippedSpy = spies.find(s => s.equippedScrolls.includes(scroll.id));
                          return (
                            <motion.div
                              key={scroll.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02, y: -3 }}
                            >
                              <ArcaneCard
                                className={`p-4 bg-gradient-to-br ${rarityBg[rarity]} ${rarityGlow[rarity]} ${
                                  isEquipped ? 'opacity-60' : ''
                                }`}
                                hover={false}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <ScrollText className={`w-6 h-6 ${
                                      rarity === 'legendary' ? 'text-gold-400' :
                                      rarity === 'epic' ? 'text-purple-400' :
                                      rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                    }`} />
                                    <div>
                                      <h4 className={`font-medium ${
                                        rarity === 'legendary' ? 'text-gold-400' :
                                        rarity === 'epic' ? 'text-purple-400' :
                                        rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'
                                      }`}>{scroll.name}</h4>
                                      <p className="text-xs text-arcane-400">{scroll.description}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {scroll.skillBonus.stealth && (
                                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                                      隐匿 +{scroll.skillBonus.stealth}
                                    </span>
                                  )}
                                  {scroll.skillBonus.disguise && (
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                                      伪装 +{scroll.skillBonus.disguise}
                                    </span>
                                  )}
                                  {scroll.skillBonus.decryption && (
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                                      破解 +{scroll.skillBonus.decryption}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-arcane-600/30">
                                  {isEquipped && equippedSpy ? (
                                    <span className="text-xs text-arcane-400 flex items-center gap-1">
                                      <UserCheck className="w-3 h-3 text-blue-400" />
                                      已装备: {equippedSpy.codeName}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      库存中
                                    </span>
                                  )}
                                </div>
                              </ArcaneCard>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ArcaneCard className="p-12 text-center">
                <ScrollText className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
                <h3 className="text-xl font-bold text-gold-400 mb-2">暂无卷轴</h3>
                <p className="text-arcane-400">完成任务或在市场购买获得情报卷轴</p>
              </ArcaneCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEquipModal && selectedSpy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEquipModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="arcane-card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gold-500/20 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-gold-500" />
                    装备卷轴
                  </h2>
                  <p className="text-sm text-arcane-400 mt-1">
                    为 {selectedSpy.codeName} 选择卷轴
                    <span className="ml-2 font-mono text-gold-400">
                      ({selectedSpy.equippedScrolls.length}/{scrollSlotsLimit[selectedSpy.rarity]})
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowEquipModal(false)}
                  className="p-2 hover:bg-arcane-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-arcane-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {getUnequippedScrolls().length > 0 ? (
                  <div className="space-y-6">
                    {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => {
                      const byRarity = getScrollsByRarity(getUnequippedScrolls());
                      const rarityScrolls = byRarity[rarity];
                      if (rarityScrolls.length === 0) return null;
                      return (
                        <div key={rarity}>
                          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${
                            rarity === 'legendary' ? 'text-gold-400' :
                            rarity === 'epic' ? 'text-purple-400' :
                            rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            <ScrollText className="w-4 h-4" />
                            {rarity === 'legendary' ? '传说级' : rarity === 'epic' ? '史诗级' :
                             rarity === 'rare' ? '稀有级' : '普通级'}
                            <span className="text-xs text-arcane-400 font-normal">({rarityScrolls.length})</span>
                          </h3>
                          <div className="space-y-2">
                            {rarityScrolls.map((scroll) => (
                              <motion.div
                                key={scroll.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 5 }}
                                className={`p-4 rounded-lg border-2 ${rarityColors[rarity]} bg-gradient-to-r ${rarityBg[rarity]} ${rarityGlow[rarity]} cursor-pointer transition-all`}
                                onClick={() => handleEquipScroll(selectedSpy.id, scroll.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <ScrollText className={`w-5 h-5 ${
                                      rarity === 'legendary' ? 'text-gold-400' :
                                      rarity === 'epic' ? 'text-purple-400' :
                                      rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                    }`} />
                                    <div>
                                      <p className={`font-medium ${
                                        rarity === 'legendary' ? 'text-gold-400' :
                                        rarity === 'epic' ? 'text-purple-400' :
                                        rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'
                                      }`}>{scroll.name}</p>
                                      <p className="text-xs text-arcane-400">{scroll.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {scroll.skillBonus.stealth && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                          隐匿+{scroll.skillBonus.stealth}
                                        </span>
                                      )}
                                      {scroll.skillBonus.disguise && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                          伪装+{scroll.skillBonus.disguise}
                                        </span>
                                      )}
                                      {scroll.skillBonus.decryption && (
                                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                                          破解+{scroll.skillBonus.decryption}
                                        </span>
                                      )}
                                    </div>
                                    <Plus className={`w-5 h-5 ${
                                      rarity === 'legendary' ? 'text-gold-400' :
                                      rarity === 'epic' ? 'text-purple-400' :
                                      rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                    }`} />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
                    <h3 className="text-lg font-bold text-gold-400 mb-2">没有可装备的卷轴</h3>
                    <p className="text-arcane-400">所有卷轴都已装备或库存为空</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gold-500/20 flex justify-end gap-3">
                <ArcaneButton variant="secondary" onClick={() => setShowEquipModal(false)}>
                  关闭
                </ArcaneButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {filteredSpies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredSpies.map((spy) => (
                  <motion.div
                    key={spy.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedSpy(spy)}
                  >
                    <ArcaneCard
                      className={`p-5 bg-gradient-to-br ${rarityBg[spy.rarity]} ${
                        selectedSpy?.id === spy.id ? 'ring-2 ring-gold-400' : ''
                      } ${rarityGlow[spy.rarity]}`}
                      hover
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className={`w-14 h-14 rounded-full border-2 ${rarityColors[spy.rarity]} bg-arcane-800 flex items-center justify-center text-2xl`}
                          >
                            <Users className="w-7 h-7 text-gold-400" />
                          </motion.div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-gold-400">{spy.codeName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[spy.rarity]} ${
                                spy.rarity === 'legendary' ? 'text-gold-400' :
                                spy.rarity === 'epic' ? 'text-purple-400' :
                                spy.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                              }`}>
                                {spy.rarity === 'common' ? '普通' : spy.rarity === 'rare' ? '稀有' :
                                 spy.rarity === 'epic' ? '史诗' : '传说'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabels[spy.status].color}`}>
                                {statusLabels[spy.status].label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-arcane-400" />
                          <span className="text-xs text-arcane-300 w-12">隐匿</span>
                          <div className="flex-1">
                            <StatBar value={spy.skills.stealth} max={100} color="purple" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-arcane-400 w-8">{spy.skills.stealth}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-300 w-12">伪装</span>
                          <div className="flex-1">
                            <StatBar value={spy.skills.disguise} max={100} color="blue" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-blue-400 w-8">{spy.skills.disguise}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300 w-12">破解</span>
                          <div className="flex-1">
                            <StatBar value={spy.skills.decryption} max={100} color="green" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-green-400 w-8">{spy.skills.decryption}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-300 w-12">体力</span>
                          <div className="flex-1">
                            <StatBar value={spy.stats.stamina} max={spy.stats.maxStamina} color="red" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-red-400 w-12">
                            {spy.stats.stamina}/{spy.stats.maxStamina}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'stealth'); }}
                          disabled={spy.status !== 'idle'}
                          className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-arcane-300 rounded border border-arcane-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          升级隐匿
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'disguise'); }}
                          disabled={spy.status !== 'idle'}
                          className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-blue-300 rounded border border-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          升级伪装
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpgrade(spy.id, 'decryption'); }}
                          disabled={spy.status !== 'idle'}
                          className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-green-300 rounded border border-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          升级破解
                        </button>
                      </div>
                    </ArcaneCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <ArcaneCard className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
              <h3 className="text-xl font-bold text-gold-400 mb-2">暂无间谍</h3>
              <p className="text-arcane-400 mb-6">点击上方按钮招募你的第一名间谍</p>
              <ArcaneButton onClick={handleRecruit} loading={isRecruiting}>
                <UserPlus className="w-4 h-4 mr-2" />
                立即招募
              </ArcaneButton>
            </ArcaneCard>
          )}
        </div>

        <div className="space-y-6">
          {selectedSpy ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSpy.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ArcaneCard className={`p-6 bg-gradient-to-br ${rarityBg[selectedSpy.rarity]} ${rarityGlow[selectedSpy.rarity]}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-gold-400">间谍详情</h2>
                    <button
                      onClick={() => setSelectedSpy(null)}
                      className="p-1 hover:bg-arcane-700/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-arcane-400" />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 mx-auto rounded-full border-4 ${rarityColors[selectedSpy.rarity]} bg-arcane-800 flex items-center justify-center text-4xl mb-4`}>
                      <Users className="w-12 h-12 text-gold-400" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-gold-400">{selectedSpy.codeName}</h3>
                    <p className="text-arcane-400">{selectedSpy.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className={`text-xs px-3 py-1 rounded-full border ${rarityColors[selectedSpy.rarity]} ${
                        selectedSpy.rarity === 'legendary' ? 'text-gold-400' :
                        selectedSpy.rarity === 'epic' ? 'text-purple-400' :
                        selectedSpy.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {selectedSpy.rarity === 'common' ? '普通' : selectedSpy.rarity === 'rare' ? '稀有' :
                         selectedSpy.rarity === 'epic' ? '史诗' : '传说'}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${statusLabels[selectedSpy.status].color}`}>
                        {statusLabels[selectedSpy.status].label}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <SkillRadarChart
                      data={[
                        { skill: '隐匿', value: selectedSpy.skills.stealth, fullMark: 100 },
                        { skill: '伪装', value: selectedSpy.skills.disguise, fullMark: 100 },
                        { skill: '破解', value: selectedSpy.skills.decryption, fullMark: 100 },
                        { skill: '体力', value: selectedSpy.stats.stamina, fullMark: selectedSpy.stats.maxStamina },
                        { skill: '隐匿值', value: selectedSpy.stats.concealment, fullMark: 100 },
                      ]}
                      size={220}
                      color={selectedSpy.rarity === 'legendary' ? '#d4af37' :
                             selectedSpy.rarity === 'epic' ? '#a855f7' :
                             selectedSpy.rarity === 'rare' ? '#3b82f6' : '#6b7280'}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gold-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gold-500" />
                      属性面板
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-arcane-300">生命值</span>
                        </div>
                        <span className="font-mono text-red-400">
                          {selectedSpy.stats.health}/{selectedSpy.stats.maxHealth}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-arcane-400" />
                          <span className="text-sm text-arcane-300">隐匿值</span>
                        </div>
                        <span className="font-mono text-arcane-400">{selectedSpy.stats.concealment}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-arcane-300">被发现风险</span>
                        </div>
                        <span className="font-mono text-yellow-400">{selectedSpy.stats.detectionRisk}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gold-500/20">
                    <h4 className="font-medium text-gold-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-500" />
                      加入时间
                    </h4>
                    <p className="text-sm text-arcane-400 font-mono">
                      {new Date(selectedSpy.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <ArcaneButton
                      variant="secondary"
                      onClick={() => handleUpgrade(selectedSpy.id, 'stealth')}
                      disabled={selectedSpy.status !== 'idle'}
                      className="text-xs py-2"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      隐匿 +1
                    </ArcaneButton>
                    <ArcaneButton
                      variant="secondary"
                      onClick={() => handleUpgrade(selectedSpy.id, 'disguise')}
                      disabled={selectedSpy.status !== 'idle'}
                      className="text-xs py-2"
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      伪装 +1
                    </ArcaneButton>
                    <ArcaneButton
                      variant="secondary"
                      onClick={() => handleUpgrade(selectedSpy.id, 'decryption')}
                      disabled={selectedSpy.status !== 'idle'}
                      className="text-xs py-2"
                    >
                      <Key className="w-3 h-3 mr-1" />
                      破解 +1
                    </ArcaneButton>
                  </div>
                </ArcaneCard>
              </motion.div>
            </AnimatePresence>
          ) : (
            <ArcaneCard className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-arcane-500 opacity-50" />
              <p className="text-arcane-400">点击左侧间谍卡片查看详情</p>
            </ArcaneCard>
          )}

          <ArcaneCard className="p-6">
            <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-500" />
              统计数据
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-arcane-400">总间谍数</span>
                <span className="font-display text-2xl font-bold text-gold-400">{spies.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-arcane-400">传说级</span>
                <span className="font-mono text-gold-400">{spies.filter(s => s.rarity === 'legendary').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-arcane-400">史诗级</span>
                <span className="font-mono text-purple-400">{spies.filter(s => s.rarity === 'epic').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-arcane-400">稀有级</span>
                <span className="font-mono text-blue-400">{spies.filter(s => s.rarity === 'rare').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-arcane-400">普通级</span>
                <span className="font-mono text-gray-400">{spies.filter(s => s.rarity === 'common').length}</span>
              </div>
            </div>
          </ArcaneCard>
        </div>
      </div>
    </div>
  );
};
