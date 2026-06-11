import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { StatBar } from '../components/ui/StatBar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import {
  Building2, MapPin, Star, Coins, ShieldAlert, ScrollText,
  Sparkles, ChevronUp, Eye, Users, Award, TrendingUp
} from 'lucide-react';

const locations = [
  { id: 'shadow_district', name: '暗影区', description: '隐秘的地下据点，暴露风险低' },
  { id: 'golden_market', name: '黄金市场', description: '繁华的商业区，情报交易活跃' },
  { id: 'ancient_ruins', name: '古老遗迹', description: '神秘的废墟，隐藏着古老秘密' },
  { id: 'mountain_fortress', name: '山间要塞', description: '易守难攻的高地据点' },
  { id: 'coastal_haven', name: '海岸避风港', description: '海上贸易的枢纽' },
];

export const OrganizationPage = () => {
  const { organization, isAuthenticated } = useAuthStore();
  const {
    scrolls, isLoading, createOrganization,
    loadScrolls, loadOrganizationData
  } = useGameStore();

  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && organization) {
      loadScrolls();
    }
  }, [isAuthenticated, organization]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !codeName || !baseLocation) return;

    setIsCreating(true);
    try {
      await createOrganization(name, codeName, baseLocation);
      await loadOrganizationData();
    } catch (error) {
      // 错误已在 store 中处理
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpgrade = () => {
    // 组织升级逻辑
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold"
            >
              <Building2 className="w-12 h-12 text-arcane-900" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold gold-text mb-2">
              创建你的情报组织
            </h1>
            <p className="text-arcane-400">在暗影网络中建立属于你的情报帝国</p>
          </div>

          <ArcaneCard className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm text-gold-300 mb-2 font-medium">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  组织名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  placeholder="如：暗夜之手"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gold-300 mb-2 font-medium">
                  <Eye className="w-4 h-4 inline mr-2" />
                  组织代号
                </label>
                <input
                  type="text"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full px-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  placeholder="如：SHADOW HAND"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gold-300 mb-3 font-medium">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  选择据点位置
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {locations.map((loc) => (
                    <motion.div
                      key={loc.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setBaseLocation(loc.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        baseLocation === loc.id
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-arcane-600/50 bg-arcane-800/30 hover:border-arcane-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          baseLocation === loc.id ? 'bg-gold-500/20' : 'bg-arcane-700/50'
                        }`}>
                          <MapPin className={`w-5 h-5 ${
                            baseLocation === loc.id ? 'text-gold-500' : 'text-arcane-400'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-medium ${
                            baseLocation === loc.id ? 'text-gold-400' : 'text-arcane-200'
                          }`}>
                            {loc.name}
                          </p>
                          <p className="text-xs text-arcane-400">{loc.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <ArcaneButton type="submit" loading={isCreating} className="w-full py-4">
                <Sparkles className="w-5 h-5 inline mr-2" />
                创建情报组织
              </ArcaneButton>
            </form>
          </ArcaneCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            我的组织
          </h1>
          <p className="text-arcane-400">管理你的情报帝国，提升组织实力</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-gold-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-gold-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">情报积分</p>
          <p className="font-display text-3xl font-bold text-gold-400">{organization.intelPoints}</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-purple-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">组织声望</p>
          <p className="font-display text-3xl font-bold text-purple-400">{organization.reputation}</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-red-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <Eye className={`w-5 h-5 ${organization.exposureRisk > 70 ? 'text-red-500 animate-pulse' : 'text-arcane-400'}`} />
          </div>
          <p className="text-arcane-400 text-sm mb-1">暴露等级</p>
          <p className={`font-display text-3xl font-bold ${
            organization.exposureRisk > 70 ? 'text-red-500' :
            organization.exposureRisk > 40 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {organization.exposureRisk}%
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-blue-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
            <ChevronUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">组织等级</p>
          <p className="font-display text-3xl font-bold text-blue-400">Lv.{organization.level}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <ArcaneCard className="p-6 bg-gradient-to-br from-arcane-900/80 to-arcane-950/80">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold">
                  <Building2 className="w-10 h-10 text-arcane-900" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-gold-400">{organization.name}</h2>
                  <p className="text-arcane-400 font-mono">代号: {organization.codeName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-gold-500" />
                    <span className="text-sm text-arcane-300">
                      {locations.find(l => l.id === organization.baseLocation)?.name || organization.baseLocation}
                    </span>
                  </div>
                </div>
              </div>
              <ArcaneButton onClick={handleUpgrade}>
                <ChevronUp className="w-4 h-4 mr-2" />
                升级组织
              </ArcaneButton>
            </div>

            <div className="space-y-4">
              <StatBar
                label="组织声望"
                value={organization.reputation}
                max={10000}
                color="purple"
              />
              <StatBar
                label="暴露风险"
                value={organization.exposureRisk}
                max={100}
                color={organization.exposureRisk > 70 ? 'red' : 'green'}
              />
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold-500/20">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-gold-400">{scrolls.length}</p>
                  <p className="text-xs text-arcane-400">情报卷轴</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-blue-400">
                    {new Date(organization.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="text-xs text-arcane-400">创建日期</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-green-400">
                    {organization.reputation >= 5000 ? 'S' : organization.reputation >= 2000 ? 'A' : organization.reputation >= 500 ? 'B' : 'C'}
                  </p>
                  <p className="text-xs text-arcane-400">评级</p>
                </div>
              </div>
            </div>
          </ArcaneCard>

          <ArcaneCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-purple-500" />
                组织情报卷轴
              </h2>
              <span className="text-sm text-arcane-400">共 {scrolls.length} 个</span>
            </div>

            {scrolls.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {scrolls.map((scroll) => (
                  <motion.div
                    key={scroll.id}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="arcane-card p-4 bg-gradient-to-br from-purple-900/20 to-arcane-900/50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <ScrollText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gold-300 text-sm">{scroll.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          scroll.rarity === 'legendary' ? 'bg-gold-500/20 text-gold-400' :
                          scroll.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                          scroll.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {scroll.rarity === 'common' ? '普通' : scroll.rarity === 'rare' ? '稀有' :
                           scroll.rarity === 'epic' ? '史诗' : '传说'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-arcane-400 mb-2">{scroll.effect}</p>
                    <div className="flex flex-wrap gap-1">
                      {scroll.bonus.stealth && (
                        <span className="text-xs bg-arcane-700/50 px-2 py-0.5 rounded text-arcane-300">
                          隐匿 +{scroll.bonus.stealth}
                        </span>
                      )}
                      {scroll.bonus.disguise && (
                        <span className="text-xs bg-blue-700/30 px-2 py-0.5 rounded text-blue-300">
                          伪装 +{scroll.bonus.disguise}
                        </span>
                      )}
                      {scroll.bonus.decryption && (
                        <span className="text-xs bg-green-700/30 px-2 py-0.5 rounded text-green-300">
                          破解 +{scroll.bonus.decryption}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-arcane-400">
                <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无敌报卷轴</p>
                <p className="text-sm mt-1">完成任务获取情报卷轴</p>
              </div>
            )}
          </ArcaneCard>
        </div>

        <div className="space-y-6">
          <ArcaneCard className="p-6 bg-gradient-to-br from-gold-900/20 to-transparent">
            <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <ChevronUp className="w-5 h-5 text-gold-500" />
              组织升级
            </h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-arcane-800/50 rounded-lg">
                <p className="text-arcane-400 text-sm mb-1">当前等级</p>
                <p className="font-display text-4xl font-bold text-gold-400">Lv.{organization.level}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-arcane-400">升级所需声望</span>
                  <span className="text-gold-400 font-mono">{organization.level * 1000}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-arcane-400">升级所需积分</span>
                  <span className="text-gold-400 font-mono">{organization.level * 500}</span>
                </div>
              </div>
              <StatBar
                label="升级进度"
                value={organization.reputation}
                max={organization.level * 1000}
                color="gold"
              />
              <ArcaneButton className="w-full" disabled={organization.reputation < organization.level * 1000}>
                <ChevronUp className="w-4 h-4 mr-2" />
                立即升级
              </ArcaneButton>
            </div>
          </ArcaneCard>

          <ArcaneCard className="p-6">
            <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              组织成员
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-arcane-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-arcane-900 font-bold">
                  首
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gold-300">领袖</p>
                  <p className="text-xs text-arcane-400">组织创建者</p>
                </div>
                <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded-full">
                  领袖
                </span>
              </div>
            </div>
          </ArcaneCard>
        </div>
      </div>
    </div>
  );
};
