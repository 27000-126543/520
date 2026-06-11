import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { StatBar } from '../components/ui/StatBar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import type { Building } from '../../shared/types';
import {
  Castle, Users, Star, ChevronUp, Package, TrendingUp,
  Radio, Eye, Crown, Shield, Zap, X, Plus, Minus,
  Clock, Award, Building2, Coins, CheckCircle
} from 'lucide-react';

const buildingConfig = {
  intelStation: {
    icon: Eye,
    color: 'text-purple-400',
    bg: 'from-purple-900/30',
    border: 'border-purple-500',
    label: '情报站',
    description: '提升所有任务的基础成功率'
  },
  commTower: {
    icon: Radio,
    color: 'text-blue-400',
    bg: 'from-blue-900/30',
    border: 'border-blue-500',
    label: '通讯塔',
    description: '降低任务中的被发现风险'
  }
};

const materialTypes = [
  { id: 'magic_crystal', name: '魔法水晶', icon: '💎', color: 'text-purple-400' },
  { id: 'shadow_essence', name: '暗影精华', icon: '🌑', color: 'text-arcane-400' },
  { id: 'gold_ore', name: '黄金矿石', icon: '🥇', color: 'text-gold-400' },
  { id: 'ancient_rune', name: '古老符文', icon: '📜', color: 'text-blue-400' }
];

export const GuildPage = () => {
  const { organization, user, isAuthenticated } = useAuthStore();
  const {
    guild, isLoading, loadGuild, donateMaterial, upgradeBuilding
  } = useGameStore();

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [donateMaterialType, setDonateMaterialType] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState<number>(1);
  const [isDonating, setIsDonating] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadGuild();
    }
  }, [isAuthenticated]);

  const handleDonate = async () => {
    if (!selectedBuilding || !donateMaterialType || donateAmount <= 0) return;
    setIsDonating(true);
    try {
      await donateMaterial(selectedBuilding.id, donateMaterialType, donateAmount);
      setDonateAmount(1);
      setDonateMaterialType('');
      await loadGuild();
    } finally {
      setIsDonating(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedBuilding) return;
    setIsUpgrading(true);
    try {
      await upgradeBuilding(selectedBuilding.id);
      await loadGuild();
      setSelectedBuilding(null);
    } finally {
      setIsUpgrading(false);
    }
  };

  const canUpgrade = (building: Building) => {
    if (building.level >= building.maxLevel) return false;
    return building.requiredMaterials.every(mat =>
      (building.currentMaterials[mat.type] || 0) >= mat.amount
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!guild) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArcaneCard className="p-12 text-center max-w-lg">
          <Castle className="w-20 h-20 mx-auto mb-4 text-arcane-500 opacity-50" />
          <h2 className="font-display text-2xl font-bold text-gold-400 mb-2">
            暂未加入公会
          </h2>
          <p className="text-arcane-400 mb-6">
            加入公会可以参与联合建筑建设，获得强大的集体加成
          </p>
          <ArcaneButton>
            <Users className="w-4 h-4 mr-2" />
            查找公会
          </ArcaneButton>
        </ArcaneCard>
      </div>
    );
  }

  const isLeader = user?.id === guild.leaderId;

  const BuildingDetailModal = () => {
    if (!selectedBuilding) return null;
    const config = buildingConfig[selectedBuilding.type];
    const Icon = config.icon;
    const upgradeReady = canUpgrade(selectedBuilding);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedBuilding(null)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <ArcaneCard className={`p-6 bg-gradient-to-br ${config.bg} to-arcane-900/90`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-arcane-800 border-2 ${config.border} flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 ${config.color}`} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-gold-400">
                    {config.label}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-gold-500" />
                    <span className="text-gold-400 font-mono">
                      Lv.{selectedBuilding.level} / {selectedBuilding.maxLevel}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-2 hover:bg-arcane-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-arcane-400" />
              </button>
            </div>

            <p className="text-arcane-300 mb-6">{config.description}</p>

            <div className="p-4 bg-gold-500/10 rounded-lg border border-gold-500/30 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gold-300">当前加成</span>
                <span className={`font-display text-xl font-bold ${config.color}`}>
                  +{selectedBuilding.bonus}%
                </span>
              </div>
              <p className="text-sm text-arcane-400 mt-1">{selectedBuilding.effect}</p>
            </div>

            {selectedBuilding.level < selectedBuilding.maxLevel && (
              <>
                <div className="mb-6">
                  <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    升级所需材料
                  </h3>
                  <div className="space-y-3">
                    {selectedBuilding.requiredMaterials.map((mat, index) => {
                      const current = selectedBuilding.currentMaterials[mat.type] || 0;
                      const isComplete = current >= mat.amount;
                      const materialInfo = materialTypes.find(m => m.id === mat.type);

                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-arcane-800/50 rounded-lg">
                          <span className="text-2xl">{materialInfo?.icon || '📦'}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${materialInfo?.color || 'text-arcane-300'}`}>
                                {materialInfo?.name || mat.type}
                              </span>
                              <span className={`font-mono text-sm ${isComplete ? 'text-green-400' : 'text-arcane-400'}`}>
                                {current} / {mat.amount}
                              </span>
                            </div>
                            <StatBar
                              value={current}
                              max={mat.amount}
                              color={isComplete ? 'green' : 'gold'}
                              showValue={false}
                            />
                          </div>
                          {isComplete && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    捐献材料
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {materialTypes.map((mat) => (
                      <motion.div
                        key={mat.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setDonateMaterialType(mat.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          donateMaterialType === mat.id
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-arcane-600/50 bg-arcane-800/30 hover:border-arcane-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{mat.icon}</span>
                          <span className={`text-sm ${mat.color}`}>{mat.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {donateMaterialType && (
                    <div className="flex items-center gap-4 p-4 bg-arcane-800/50 rounded-lg">
                      <span className="text-sm text-arcane-300">数量</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setDonateAmount(Math.max(1, donateAmount - 1))}
                          className="w-8 h-8 rounded-lg bg-arcane-700 flex items-center justify-center hover:bg-arcane-600 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-arcane-300" />
                        </button>
                        <span className="w-12 text-center font-mono text-xl text-gold-400">
                          {donateAmount}
                        </span>
                        <button
                          onClick={() => setDonateAmount(donateAmount + 1)}
                          className="w-8 h-8 rounded-lg bg-arcane-700 flex items-center justify-center hover:bg-arcane-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-arcane-300" />
                        </button>
                      </div>
                      <ArcaneButton
                        onClick={handleDonate}
                        loading={isDonating}
                        disabled={donateAmount <= 0}
                        className="ml-auto"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        捐献
                      </ArcaneButton>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gold-500/20">
                  <ArcaneButton
                    variant="secondary"
                    onClick={() => setSelectedBuilding(null)}
                  >
                    关闭
                  </ArcaneButton>
                  <ArcaneButton
                    onClick={handleUpgrade}
                    loading={isUpgrading}
                    disabled={!upgradeReady}
                    variant={upgradeReady ? 'primary' : 'secondary'}
                  >
                    <ChevronUp className="w-4 h-4 mr-2" />
                    {upgradeReady ? '升级建筑' : '材料不足'}
                  </ArcaneButton>
                </div>
              </>
            )}

            {selectedBuilding.level >= selectedBuilding.maxLevel && (
              <div className="text-center p-8 bg-gold-500/10 rounded-lg border border-gold-500/30">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gold-500" />
                <p className="font-display text-xl font-bold text-gold-400">
                  已达最高等级
                </p>
              </div>
            )}
          </ArcaneCard>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            公会联盟
          </h1>
          <p className="text-arcane-400">与其他组织合作，共建强大的情报联盟</p>
        </div>
      </div>

      <ArcaneCard className="p-6 bg-gradient-to-br from-arcane-900/80 to-arcane-950/80">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold">
              <Castle className="w-12 h-12 text-arcane-900" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-gold-400 mb-1">
                {guild.name}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-500" />
                  <span className="text-gold-400 font-mono">Lv.{guild.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-400 font-mono">{guild.memberIds.length} 成员</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-400 font-mono">总贡献 {guild.totalContribution}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-arcane-400 mb-1">创建时间</p>
            <p className="font-mono text-gold-400">
              {new Date(guild.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </ArcaneCard>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            联合建筑
          </h2>

          {guild.buildings.map((building: Building) => {
            const config = buildingConfig[building.type];
            const Icon = config.icon;
            const upgradeReady = canUpgrade(building);

            return (
              <motion.div
                key={building.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedBuilding(building)}
                className="cursor-pointer"
              >
                <ArcaneCard className={`p-5 bg-gradient-to-br ${config.bg} to-arcane-900/50`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-arcane-800 border-2 ${config.border} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-gold-400">
                          {config.label}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-arcane-400 text-sm">等级</span>
                          <span className="text-gold-400 font-mono font-bold">
                            Lv.{building.level}
                          </span>
                          <span className="text-arcane-500">/</span>
                          <span className="text-arcane-400 font-mono">{building.maxLevel}</span>
                        </div>
                      </div>
                    </div>
                    {building.level < building.maxLevel && (
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        upgradeReady
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {upgradeReady ? '可升级' : '收集中'}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-arcane-300 mb-4">{config.description}</p>

                  <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg mb-4">
                    <span className="text-arcane-300">当前加成</span>
                    <span className={`font-display text-xl font-bold ${config.color}`}>
                      +{building.bonus}%
                    </span>
                  </div>

                  {building.level < building.maxLevel && (
                    <div className="space-y-2">
                      <p className="text-xs text-arcane-400">升级材料进度</p>
                      <div className="grid grid-cols-4 gap-2">
                        {building.requiredMaterials.map((mat, index) => {
                          const current = building.currentMaterials[mat.type] || 0;
                          const isComplete = current >= mat.amount;
                          const materialInfo = materialTypes.find(m => m.id === mat.type);

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-xs"
                              title={`${materialInfo?.name || mat.type}: ${current}/${mat.amount}`}
                            >
                              <span>{materialInfo?.icon || '📦'}</span>
                              <span className={isComplete ? 'text-green-400' : 'text-arcane-400'}>
                                {current}/{mat.amount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gold-500/20 flex justify-between items-center">
                    <span className="text-sm text-arcane-400">点击查看详情并捐献</span>
                    <ChevronUp className="w-5 h-5 text-gold-500" />
                  </div>
                </ArcaneCard>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            公会成员 ({guild.memberIds.length})
          </h2>

          <ArcaneCard className="p-6">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {guild.memberIds.map((memberId, index) => (
                <motion.div
                  key={memberId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg ${
                    index === 0 ? 'bg-gold-500/10 border border-gold-500/30' : 'bg-arcane-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index === 0
                        ? 'bg-gradient-to-br from-gold-500 to-gold-700'
                        : 'bg-arcane-700'
                    }`}>
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-arcane-900" />
                      ) : (
                        <Users className="w-6 h-6 text-arcane-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${
                          index === 0 ? 'text-gold-400' : 'text-arcane-200'
                        }`}>
                          成员 {index + 1}
                        </p>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400">
                            领袖
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-arcane-400 font-mono">{memberId.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gold-400">
                        <Coins className="w-3 h-3" />
                        <span className="font-mono text-sm">
                          {Math.floor(Math.random() * 10000) + 1000}
                        </span>
                      </div>
                      <p className="text-xs text-arcane-500">贡献</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ArcaneCard>

          <ArcaneCard className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent">
            <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              公会加成总览
            </h3>
            <div className="space-y-4">
              {guild.buildings.map((building: Building) => {
                const config = buildingConfig[building.type];
                return (
                  <div key={building.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-arcane-300">{config.description}</span>
                    </div>
                    <span className={`font-mono font-bold ${config.color}`}>
                      +{building.bonus}%
                    </span>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-gold-500/20 flex items-center justify-between">
                <span className="text-gold-300 font-medium">总加成</span>
                <span className="font-display text-xl font-bold text-gold-400">
                  +{guild.buildings.reduce((sum, b) => sum + b.bonus, 0)}%
                </span>
              </div>
            </div>
          </ArcaneCard>
        </div>
      </div>

      <AnimatePresence>
        {selectedBuilding && <BuildingDetailModal />}
      </AnimatePresence>
    </div>
  );
};
