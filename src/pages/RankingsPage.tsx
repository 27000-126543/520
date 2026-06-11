import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import type { RankingType } from '../../shared/types';
import {
  Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus,
  Coins, Target, Users, Star
} from 'lucide-react';

const rankingTabs: { type: RankingType; label: string; icon: typeof Coins }[] = [
  { type: 'intel_points', label: '情报总值', icon: Coins },
  { type: 'perfection', label: '任务完美度', icon: Target },
  { type: 'guild_contribution', label: '公会贡献', icon: Users },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="w-6 h-6 flex items-center justify-center text-arcane-400 font-bold">{rank}</span>;
};

const getRankBg = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser) return 'bg-gradient-to-r from-gold-900/40 to-purple-900/40 border-gold-500/50';
  if (rank === 1) return 'bg-gradient-to-r from-yellow-900/30 to-transparent border-yellow-500/30';
  if (rank === 2) return 'bg-gradient-to-r from-gray-700/30 to-transparent border-gray-500/30';
  if (rank === 3) return 'bg-gradient-to-r from-amber-900/30 to-transparent border-amber-600/30';
  return 'bg-arcane-800/30 border-arcane-700/30';
};

const formatValue = (value: number, type: RankingType) => {
  if (type === 'perfection') return `${value.toFixed(1)}%`;
  if (type === 'guild_contribution') return Math.round(value).toLocaleString();
  return Math.round(value).toLocaleString();
};

export const RankingsPage = () => {
  const { user, organization } = useAuthStore();
  const { rankings, isLoading, loadRankings } = useGameStore();
  const [activeTab, setActiveTab] = useState<RankingType>('intel_points');

  useEffect(() => {
    loadRankings(activeTab);
  }, [activeTab]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const currentRankings = rankings[activeTab] || [];
  const currentUserEntry = currentRankings.find(r => r.playerId === user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            全服排行榜
          </h1>
          <p className="text-arcane-400">暗影世界的强者角逐，谁将登上巅峰？</p>
        </div>
        <div className="arcane-card px-4 py-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-500" />
          <span className="text-sm text-gold-400 font-mono">
            共 {currentRankings.length} 名参赛者
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {rankingTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <ArcaneButton
              key={tab.type}
              variant={activeTab === tab.type ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.type)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </ArcaneButton>
          );
        })}
      </div>

      {currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 border-gold-500/50 bg-gradient-to-r from-gold-900/30 via-purple-900/20 to-arcane-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-purple-600 flex items-center justify-center shadow-gold">
                <Star className="w-8 h-8 text-arcane-900" />
              </div>
              <div>
                <p className="text-sm text-arcane-400 mb-1">我的排名</p>
                <p className="font-display text-2xl font-bold text-gold-400">
                  第 {currentUserEntry.rank} 名
                </p>
                <p className="text-sm text-arcane-300">
                  {organization?.name || currentUserEntry.playerName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-arcane-400 mb-1">
                {activeTab === 'intel_points' && '情报总值'}
                {activeTab === 'perfection' && '任务完美度'}
                {activeTab === 'guild_contribution' && '公会贡献'}
              </p>
              <p className="font-display text-3xl font-bold text-gold-400">
                {formatValue(currentUserEntry.value, activeTab)}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                {currentUserEntry.change > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+{currentUserEntry.change}</span>
                  </>
                ) : currentUserEntry.change < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-blood-500" />
                    <span className="text-sm text-blood-500">{currentUserEntry.change}</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 text-arcane-400" />
                    <span className="text-sm text-arcane-400">持平</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <ArcaneCard className="overflow-hidden">
        <div className="p-4 border-b border-gold-500/20">
          <div className="grid grid-cols-12 gap-4 text-sm text-arcane-400 font-medium">
            <div className="col-span-1">排名</div>
            <div className="col-span-5">组织</div>
            <div className="col-span-3 text-right">
              {activeTab === 'intel_points' && '情报总值'}
              {activeTab === 'perfection' && '任务完美度'}
              {activeTab === 'guild_contribution' && '公会贡献'}
            </div>
            <div className="col-span-3 text-right">排名变化</div>
          </div>
        </div>

        <div className="divide-y divide-arcane-700/30 max-h-[600px] overflow-y-auto scroll-container">
          <AnimatePresence>
            {currentRankings.map((entry, index) => {
              const isCurrentUser = entry.playerId === user?.id;
              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-12 gap-4 p-4 items-center border-l-2 transition-all hover:bg-arcane-700/20 ${getRankBg(entry.rank, isCurrentUser)}`}
                >
                  <div className="col-span-1 flex items-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      entry.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                      'bg-arcane-700'
                    }`}>
                      <span className="font-bold text-arcane-900 text-sm">
                        {entry.playerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? 'text-gold-400' : 'text-arcane-200'}`}>
                        {entry.playerName}
                        {isCurrentUser && <span className="ml-2 text-xs text-gold-500">(我)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`font-display text-xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-amber-500' :
                      'text-arcane-200'
                    }`}>
                      {formatValue(entry.value, activeTab)}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1">
                    {entry.change > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">+{entry.change}</span>
                      </>
                    ) : entry.change < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-blood-500" />
                        <span className="text-sm text-blood-500 font-medium">{entry.change}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 text-arcane-400" />
                        <span className="text-sm text-arcane-400">持平</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentRankings.length === 0 && (
            <div className="text-center py-16 text-arcane-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">暂无排行数据</p>
              <p className="text-sm">排行榜将在每日凌晨更新</p>
            </div>
          )}
        </div>
      </ArcaneCard>

      <div className="grid grid-cols-3 gap-4">
        <ArcaneCard className="p-5 bg-gradient-to-br from-yellow-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-arcane-400">榜首奖励</p>
              <p className="font-display text-lg font-bold text-yellow-400">传说情报卷轴</p>
            </div>
          </div>
        </ArcaneCard>

        <ArcaneCard className="p-5 bg-gradient-to-br from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-arcane-400">上榜奖励</p>
              <p className="font-display text-lg font-bold text-purple-400">前100名有奖</p>
            </div>
          </div>
        </ArcaneCard>

        <ArcaneCard className="p-5 bg-gradient-to-br from-gold-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-sm text-arcane-400">更新时间</p>
              <p className="font-display text-lg font-bold text-gold-400">每日 00:00</p>
            </div>
          </div>
        </ArcaneCard>
      </div>
    </div>
  );
};
