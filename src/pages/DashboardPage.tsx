import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { StatBar } from '../components/ui/StatBar';
import { SpyCard } from '../components/game/SpyCard';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Target, Coins, Award, AlertTriangle,
  Eye, Clock, Shield, Activity, Zap, Crown
} from 'lucide-react';

export const DashboardPage = () => {
  const { organization, isAuthenticated } = useAuthStore();
  const {
    spies, missions, executions, announcements, scrolls,
    isLoading, loadAll
  } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !organization) {
      navigate('/organization');
    }
  }, [isAuthenticated, organization, navigate]);

  if (isLoading || !organization) {
    return <LoadingScreen />;
  }

  const activeExecutions = executions.filter(e => e.status === 'in_progress');
  const completedMissions = executions.filter(e => e.status === 'completed').length;
  const avgPerfection = executions.length > 0
    ? Math.round(executions.reduce((sum, e) => sum + (e.perfection || 0), 0) / executions.length)
    : 0;
  const topSpies = [...spies].sort((a, b) => {
    const aTotal = a.skills.stealth + a.skills.disguise + a.skills.decryption;
    const bTotal = b.skills.stealth + b.skills.disguise + b.skills.decryption;
    return bTotal - aTotal;
  }).slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 5);
  const availableMissions = missions.filter(m =>
    !executions.some(e => e.missionId === m.id && e.status === 'in_progress')
  ).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            情报总览
          </h1>
          <p className="text-arcane-400">欢迎回来，情报官。暗影网络正在等待您的指令。</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="arcane-card px-4 py-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500" />
            <span className="text-sm text-gold-400 font-mono">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          className="arcane-card p-5 bg-gradient-to-br from-gold-900/20 to-transparent"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-gold-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">情报积分</p>
          <p className="font-display text-3xl font-bold text-gold-400">{organization.intelPoints}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="arcane-card p-5 bg-gradient-to-br from-purple-900/20 to-transparent"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <Shield className="w-5 h-5 text-arcane-400" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">组织声望</p>
          <p className="font-display text-3xl font-bold text-purple-400">{organization.reputation}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="arcane-card p-5 bg-gradient-to-br from-blue-900/20 to-transparent"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">间谍数量</p>
          <p className="font-display text-3xl font-bold text-blue-400">{spies.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="arcane-card p-5 bg-gradient-to-br from-green-900/20 to-transparent"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">完成任务</p>
          <p className="font-display text-3xl font-bold text-green-400">{completedMissions}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {activeExecutions.length > 0 && (
            <ArcaneCard className="p-6 bg-gradient-to-br from-blood-900/20 to-arcane-900/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blood-500 animate-pulse" />
                  进行中的任务 ({activeExecutions.length})
                </h2>
                <button
                  onClick={() => navigate('/missions')}
                  className="text-sm text-gold-400 hover:text-gold-300"
                >
                  查看全部 →
                </button>
              </div>
              <div className="space-y-4">
                {activeExecutions.map((exec) => {
                  const mission = missions.find(m => m.id === exec.missionId);
                  return (
                    <motion.div
                      key={exec.id}
                      className="bg-arcane-800/50 rounded-lg p-4 border border-gold-500/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blood-500/20 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blood-500 animate-pulse" />
                          </div>
                          <div>
                            <p className="font-medium text-gold-300">{mission?.title || '未知任务'}</p>
                            <p className="text-xs text-arcane-400">成功率: {Math.round(exec.currentSuccessRate)}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-arcane-400">完美度</p>
                          <p className="font-mono text-gold-400">{Math.round(exec.perfection)}%</p>
                        </div>
                      </div>
                      <StatBar
                        value={exec.progress}
                        color="red"
                        label="任务进度"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </ArcaneCard>
          )}

          <ArcaneCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold-500" />
                精英间谍
              </h2>
              <button
                onClick={() => navigate('/spies')}
                className="text-sm text-gold-400 hover:text-gold-300"
              >
                管理间谍 →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {topSpies.map((spy, index) => (
                <div key={spy.id} className="relative">
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-arcane-900 font-bold text-sm shadow-gold">
                        1
                      </div>
                    </div>
                  )}
                  <SpyCard spy={spy} onClick={() => navigate('/spies')} />
                </div>
              ))}
              {topSpies.length === 0 && (
                <div className="col-span-3 text-center py-8 text-arcane-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>还没有间谍，快去招募吧！</p>
                </div>
              )}
            </div>
          </ArcaneCard>

          <ArcaneCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-gold-400 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                可用任务
              </h2>
              <button
                onClick={() => navigate('/missions')}
                className="text-sm text-gold-400 hover:text-gold-300"
              >
                任务大厅 →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {availableMissions.slice(0, 3).map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => navigate('/missions')}
                  className="cursor-pointer"
                >
                  <div className="arcane-card p-4 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      {mission.type === 'assassination' && <AlertTriangle className="w-4 h-4 text-blood-500" />}
                      {mission.type === 'theft' && <Eye className="w-4 h-4 text-blue-500" />}
                      {mission.type === 'infiltration' && <Users className="w-4 h-4 text-green-500" />}
                      <span className="text-sm font-medium text-gold-400">{mission.title}</span>
                    </div>
                    <p className="text-xs text-arcane-400 line-clamp-2 mb-2">{mission.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gold-500">{mission.rewards.intelPoints}积分</span>
                      <span className="text-arcane-400">{mission.timeLimit}秒</span>
                    </div>
                  </div>
                </div>
              ))}
              {availableMissions.length === 0 && (
                <div className="col-span-3 text-center py-8 text-arcane-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无可接任务</p>
                </div>
              )}
            </div>
          </ArcaneCard>
        </div>

        <div className="space-y-6">
          <ArcaneCard className="p-6">
            <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              组织状态
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-arcane-400">暴露风险</span>
                  <span className={`font-mono ${organization.exposureRisk > 70 ? 'text-red-500' : organization.exposureRisk > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {organization.exposureRisk}%
                  </span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${organization.exposureRisk > 70 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
                    style={{ width: `${organization.exposureRisk}%` }}
                  />
                </div>
              </div>
              <StatBar
                label="任务完美度"
                value={avgPerfection}
                color="gold"
              />
              <div className="pt-4 border-t border-gold-500/20">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display font-bold text-gold-400">{spies.filter(s => s.status === 'idle').length}</p>
                    <p className="text-xs text-arcane-400">空闲间谍</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-blue-400">{scrolls.length}</p>
                    <p className="text-xs text-arcane-400">情报卷轴</p>
                  </div>
                </div>
              </div>
            </div>
          </ArcaneCard>

          <ArcaneCard className="p-6">
            <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-500" />
              全服公告
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scroll-container pr-2">
              {recentAnnouncements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-arcane-800/50 rounded-lg border-l-2 border-gold-500"
                >
                  <p className="text-sm text-arcane-200">{announcement.message}</p>
                  <p className="text-xs text-arcane-500 mt-1 font-mono">
                    {new Date(announcement.timestamp).toLocaleTimeString('zh-CN')}
                  </p>
                </motion.div>
              ))}
              {recentAnnouncements.length === 0 && (
                <p className="text-center text-arcane-500 py-4">暂无公告</p>
              )}
            </div>
          </ArcaneCard>

          {avgPerfection > 0 && (
            <ArcaneCard className="p-6 bg-gradient-to-br from-gold-900/20 to-transparent">
              <h2 className="font-display text-xl font-bold text-gold-400 mb-2">本周表现</h2>
              <div className="relative h-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(212, 175, 55, 0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#goldGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${avgPerfection * 2.51} 251`}
                    />
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-gold-400">{avgPerfection}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-arcane-400 mt-2">平均完美度</p>
            </ArcaneCard>
          )}
        </div>
      </div>
    </div>
  );
};
