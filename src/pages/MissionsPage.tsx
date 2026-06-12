import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { StatBar } from '../components/ui/StatBar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import type { Mission, MissionExecution, MissionEvent, Spy } from '../../shared/types';
import {
  Target, Skull, FileSearch, Users, ShieldAlert, Clock, Coins, Swords,
  Filter, X, CheckCircle, AlertTriangle, Zap, Shield, Heart,
  Eye, MapPin, Play, ChevronRight, Hand, Trash2, Activity,
  Award, ScrollText
} from 'lucide-react';

type MissionTab = 'available' | 'active';
type TypeFilter = 'all' | 'assassinate' | 'steal' | 'infiltrate';
type DifficultyFilter = 'all' | '1' | '2' | '3' | '4' | '5';

const typeConfig = {
  assassinate: { icon: Skull, color: 'text-blood-500', bg: 'from-blood-900/30', label: '暗杀' },
  steal: { icon: Swords, color: 'text-gold-500', bg: 'from-gold-900/30', label: '窃取' },
  infiltrate: { icon: Users, color: 'text-blue-500', bg: 'from-blue-900/30', label: '渗透' }
};

const difficultyColors = {
  1: 'text-green-400',
  2: 'text-green-400',
  3: 'text-yellow-400',
  4: 'text-orange-400',
  5: 'text-blood-500'
};

const difficultyLabels = {
  1: '简单',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '极难'
};

const eventTypeLabels = {
  patrol: '巡逻队',
  betrayal: '背叛',
  discovery: '被发现',
  trap: '陷阱',
  opportunity: '机遇'
};

const rarityColors = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-gold-500 text-gold-400'
};

const rarityCn = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };

export const MissionsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    missions, executions, spies, isLoading, lastMissionResult,
    loadMissions, loadExecutions, loadSpies,
    acceptMission, handleMissionAction, clearLastMissionResult
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MissionTab>('available');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedSpies, setSelectedSpies] = useState<string[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<MissionExecution | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadMissions();
      loadExecutions();
      loadSpies();
    }
  }, [isAuthenticated]);

  const filteredMissions = missions.filter(mission => {
    const isInProgress = executions.some(e => e.missionId === mission.id && e.status === 'in_progress');
    if (isInProgress) return false;

    if (typeFilter !== 'all' && mission.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && mission.difficulty !== parseInt(difficultyFilter)) return false;
    return true;
  });

  const activeExecutions = executions.filter(e => e.status === 'in_progress');
  const idleSpies = spies.filter(s => s.status === 'idle');

  const calculateSuccessRate = (mission: Mission, spyIds: string[]) => {
    const baseRate = Math.max(20, 85 - mission.difficulty * 10);
    if (spyIds.length === 0) return baseRate;
    const selectedSpiesData = spies.filter(s => spyIds.includes(s.id));
    const avgSkills = selectedSpiesData.reduce((sum, s) => {
      return sum + (s.skills.stealth + s.skills.disguise + s.skills.decryption) / 3;
    }, 0) / selectedSpiesData.length;
    return Math.min(99, baseRate + avgSkills * 0.5);
  };

  const handleAcceptMission = async () => {
    if (!selectedMission || selectedSpies.length === 0) return;
    setIsAccepting(true);
    try {
      const result = await acceptMission(selectedMission.id, selectedSpies);
      if (result) {
        setSelectedMission(null);
        setSelectedSpies([]);
        setActiveTab('active');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const toggleSpySelection = (spyId: string) => {
    setSelectedSpies(prev =>
      prev.includes(spyId)
        ? prev.filter(id => id !== spyId)
        : [...prev, spyId]
    );
  };

  const handleEventAction = async (eventId: string, action: 'support' | 'destroy') => {
    if (!selectedExecution) return;
    await handleMissionAction(selectedExecution.id, eventId, action);
    await loadExecutions();
  };

  const getMissionById = (missionId: string) => missions.find(m => m.id === missionId);
  const getSpyById = (spyId: string) => spies.find(s => s.id === spyId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const MissionDetailModal = () => {
    if (!selectedMission) return null;
    const config = typeConfig[selectedMission.type];
    const Icon = config.icon;
    const successRate = calculateSuccessRate(selectedMission, selectedSpies);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => { setSelectedMission(null); setSelectedSpies([]); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <ArcaneCard className={`p-6 bg-gradient-to-br ${config.bg} to-arcane-900/90`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-arcane-800 border-2 border-current ${config.color} flex items-center justify-center`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-gold-400">{selectedMission.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-sm ${config.color}`}>{config.label}</span>
                    <span className={`text-sm ${difficultyColors[selectedMission.difficulty as keyof typeof difficultyColors]}`}>
                      {difficultyLabels[selectedMission.difficulty as keyof typeof difficultyLabels]}
                    </span>
                    <span className="text-arcane-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedMission.target?.location}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedMission(null); setSelectedSpies([]); }}
                className="p-2 hover:bg-arcane-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-arcane-400" />
              </button>
            </div>

            <p className="text-arcane-200 mb-6">{selectedMission.description}</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  任务要求
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                    <span className="text-arcane-300">基础成功率</span>
                    <span className="font-mono text-gold-400">{Math.max(20, 85 - selectedMission.difficulty * 10)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg">
                    <span className="text-arcane-300">时间限制</span>
                    <span className="font-mono text-blue-400">{selectedMission.timeLimit}秒</span>
                  </div>
                  <div className="p-3 bg-arcane-800/50 rounded-lg">
                    <span className="text-arcane-300 text-sm block mb-2">所需技能</span>
                    <div className="space-y-2">
                      {selectedMission.stealthRequired > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-arcane-400 text-xs w-12">隐匿</span>
                          <div className="flex-1">
                            <StatBar value={selectedMission.stealthRequired} max={100} color="purple" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-arcane-400">{selectedMission.stealthRequired}</span>
                        </div>
                      )}
                      {selectedMission.disguiseRequired > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-xs w-12">伪装</span>
                          <div className="flex-1">
                            <StatBar value={selectedMission.disguiseRequired} max={100} color="blue" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-blue-400">{selectedMission.disguiseRequired}</span>
                        </div>
                      )}
                      {selectedMission.decryptionRequired > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-xs w-12">破解</span>
                          <div className="flex-1">
                            <StatBar value={selectedMission.decryptionRequired} max={100} color="green" showValue={false} />
                          </div>
                          <span className="text-xs font-mono text-green-400">{selectedMission.decryptionRequired}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  任务奖励 & 惩罚
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 text-sm block mb-2">预计奖励</span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-gold-500" />
                          <span className="text-arcane-300">情报积分</span>
                        </div>
                        <span className="font-mono text-gold-400">+{selectedMission.rewards.intelPoints}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span className="text-arcane-300">声望</span>
                        </div>
                        <span className="font-mono text-purple-400">+{selectedMission.rewards.reputation}</span>
                      </div>
                      {selectedMission.rewards.scrolls.length > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ScrollText className="w-4 h-4 text-blue-500" />
                            <span className="text-arcane-300">情报卷轴</span>
                          </div>
                          <div className="flex gap-1">
                            {selectedMission.rewards.scrolls.map((rarity, idx) => (
                              <span
                                key={idx}
                                className={`text-xs font-medium px-1.5 py-0.5 rounded border ${rarityColors[rarity as keyof typeof rarityColors]}`}
                              >
                                {rarityCn[rarity as keyof typeof rarityCn]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 text-sm block mb-2">失败惩罚</span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-arcane-300">声望损失</span>
                        <span className="font-mono text-red-400">-{selectedMission.penalties.reputationLoss}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-arcane-300">暴露增加</span>
                        <span className="font-mono text-red-400">+{selectedMission.penalties.exposureIncrease}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gold-500/20">
              <h3 className="font-display text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                派遣间谍 ({selectedSpies.length}人已选择)
              </h3>

              <div className="flex items-center justify-between mb-4 p-3 bg-gold-500/10 rounded-lg border border-gold-500/30">
                <span className="text-gold-300">预计成功率</span>
                <span className={`font-display text-2xl font-bold ${
                  successRate >= 70 ? 'text-green-400' : successRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(successRate)}%
                </span>
              </div>

              {idleSpies.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                  {idleSpies.map(spy => (
                    <motion.div
                      key={spy.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => toggleSpySelection(spy.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSpies.includes(spy.id)
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-arcane-600/50 bg-arcane-800/30 hover:border-arcane-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-arcane-700 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gold-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gold-300 text-sm truncate">{spy.codeName}</p>
                          <p className="text-xs text-arcane-400">
                            综合: {Math.round((spy.skills.stealth + spy.skills.disguise + spy.skills.decryption) / 3)}
                          </p>
                        </div>
                        {selectedSpies.includes(spy.id) && (
                          <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-arcane-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>没有空闲的间谍</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <ArcaneButton
                  variant="secondary"
                  onClick={() => { setSelectedMission(null); setSelectedSpies([]); }}
                >
                  取消
                </ArcaneButton>
                <ArcaneButton
                  onClick={handleAcceptMission}
                  loading={isAccepting}
                  disabled={selectedSpies.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  开始任务
                </ArcaneButton>
              </div>
            </div>
          </ArcaneCard>
        </motion.div>
      </motion.div>
    );
  };

  const ExecutionDetailModal = () => {
    if (!selectedExecution) return null;
    const mission = getMissionById(selectedExecution.missionId);
    const executionSpies = selectedExecution.spyIds.map(id => getSpyById(id)).filter(Boolean) as Spy[];
    const unresolvedEvents = selectedExecution.events.filter(e => !e.resolved);
    const config = mission ? typeConfig[mission.type] : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedExecution(null)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <ArcaneCard className={`p-6 bg-gradient-to-br ${config?.bg || 'from-arcane-900'} to-arcane-900/90`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-gold-400">{mission?.title || '未知任务'}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm ${config?.color}`}>{config?.label}</span>
                  <span className="text-arcane-400 text-sm flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    执行中
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExecution(null)}
                className="p-2 hover:bg-arcane-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-arcane-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-arcane-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-arcane-300">任务进度</span>
                  <span className="font-mono text-gold-400">{Math.round(selectedExecution.progress)}%</span>
                </div>
                <StatBar value={selectedExecution.progress} max={100} color="gold" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-arcane-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-arcane-400" />
                    <span className="text-sm text-arcane-300">隐匿值</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-arcane-400">
                    {Math.round(selectedExecution.realtimeStats.concealment)}
                  </p>
                </div>
                <div className="p-4 bg-arcane-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-arcane-300">被发现风险</span>
                  </div>
                  <p className={`font-display text-2xl font-bold ${
                    selectedExecution.realtimeStats.detectionRisk > 70 ? 'text-red-400' :
                    selectedExecution.realtimeStats.detectionRisk > 40 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {Math.round(selectedExecution.realtimeStats.detectionRisk)}%
                  </p>
                </div>
                <div className="p-4 bg-arcane-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-arcane-300">体力</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-red-400">
                    {Math.round(selectedExecution.realtimeStats.stamina)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-arcane-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-arcane-300">当前成功率</span>
                    <span className={`font-mono ${
                      selectedExecution.currentSuccessRate >= 70 ? 'text-green-400' :
                      selectedExecution.currentSuccessRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(selectedExecution.currentSuccessRate)}%
                    </span>
                  </div>
                  <StatBar value={selectedExecution.currentSuccessRate} max={100} color={
                    selectedExecution.currentSuccessRate >= 70 ? 'green' :
                    selectedExecution.currentSuccessRate >= 40 ? 'gold' : 'red'
                  } showValue={false} />
                </div>
                <div className="p-4 bg-arcane-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-arcane-300">完美度</span>
                    <span className="font-mono text-gold-400">{Math.round(selectedExecution.perfection)}%</span>
                  </div>
                  <StatBar value={selectedExecution.perfection} max={100} color="purple" showValue={false} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-lg font-bold text-gold-400 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                执行间谍
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {executionSpies.map(spy => (
                  <div key={spy.id} className="p-3 bg-arcane-800/50 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-arcane-700 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gold-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gold-300 text-sm">{spy.codeName}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-arcane-400">隐匿 {spy.skills.stealth}</span>
                        <span className="text-blue-400">伪装 {spy.skills.disguise}</span>
                        <span className="text-green-400">破解 {spy.skills.decryption}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {unresolvedEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-gold-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
                  紧急事件！需要立即响应
                </h3>
                {unresolvedEvents.map((event: MissionEvent) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-yellow-400">
                            {eventTypeLabels[event.type as keyof typeof eventTypeLabels] || event.type}
                          </span>
                        </div>
                        <p className="text-arcane-200 text-sm">{event.description}</p>
                      </div>
                      <span className="text-xs text-arcane-400 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <ArcaneButton
                        variant="secondary"
                        onClick={() => handleEventAction(event.id, 'support')}
                        className="flex-1"
                      >
                        <Hand className="w-4 h-4 mr-2" />
                        援护
                      </ArcaneButton>
                      <ArcaneButton
                        variant="danger"
                        onClick={() => handleEventAction(event.id, 'destroy')}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        销毁证据
                      </ArcaneButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedExecution.events.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display text-lg font-bold text-gold-400 mb-3">事件日志</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedExecution.events.map((event: MissionEvent) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg text-sm ${
                        event.resolved ? 'bg-arcane-800/30' : 'bg-yellow-900/20 border border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          event.outcome === 'positive' ? 'bg-green-500/20 text-green-400' :
                          event.outcome === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-arcane-500/20 text-arcane-400'
                        }`}>
                          {eventTypeLabels[event.type as keyof typeof eventTypeLabels] || event.type}
                        </span>
                        {event.resolved && event.playerAction && (
                          <span className="text-xs text-arcane-400">
                            已{event.playerAction === 'support' ? '援护' : '销毁'}
                          </span>
                        )}
                        <span className="text-xs text-arcane-500 ml-auto font-mono">
                          {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-arcane-300 text-xs">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ArcaneCard>
        </motion.div>
      </motion.div>
    );
  };

  const MissionResultModal = () => {
    if (!lastMissionResult) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={() => clearLastMissionResult()}
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <ArcaneCard className={`p-8 ${
            lastMissionResult.success
              ? 'bg-gradient-to-br from-green-900/40 to-arcane-900/90 border-green-500/50'
              : 'bg-gradient-to-br from-red-900/40 to-arcane-900/90 border-red-500/50'
          }`}>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                lastMissionResult.success
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-red-500/20 border-2 border-red-500'
              }`}>
                {lastMissionResult.success ? (
                  <Award className="w-10 h-10 text-green-400" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                )}
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">
                <span className={lastMissionResult.success ? 'text-green-400' : 'text-red-400'}>
                  {lastMissionResult.success ? '任务完成！' : '任务失败...'}
                </span>
              </h2>
              <p className="text-gold-300 text-lg">{lastMissionResult.missionTitle}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-arcane-800/50 rounded-lg">
                <p className="text-sm text-arcane-400 mb-2">完美度</p>
                <p className="font-display text-3xl font-bold text-purple-400">
                  {lastMissionResult.perfection.toFixed(0)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-arcane-800/50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-gold-500" />
                    <span className="text-sm text-arcane-400">积分</span>
                  </div>
                  <p className={`font-mono text-2xl font-bold ${
                    lastMissionResult.intelPoints >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastMissionResult.intelPoints >= 0 ? '+' : ''}{lastMissionResult.intelPoints}
                  </p>
                </div>
                <div className="p-4 bg-arcane-800/50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-arcane-400">声望</span>
                  </div>
                  <p className={`font-mono text-2xl font-bold ${
                    lastMissionResult.reputation >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastMissionResult.reputation >= 0 ? '+' : ''}{lastMissionResult.reputation}
                  </p>
                </div>
              </div>

              {lastMissionResult.success && lastMissionResult.scrolls && lastMissionResult.scrolls.length > 0 && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300 mb-3 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" />
                    获得情报卷轴
                  </p>
                  <div className="space-y-2">
                    {lastMissionResult.scrolls.map((s: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center border ${rarityColors[s.rarity as keyof typeof rarityColors]}`}>
                            <ScrollText className={`w-4 h-4 ${rarityColors[s.rarity as keyof typeof rarityColors].split(' ')[1]}`} />
                          </div>
                          <span className="text-gold-300 font-medium">{s.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[s.rarity as keyof typeof rarityColors]}`}>
                          {rarityCn[s.rarity as keyof typeof rarityCn]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {!lastMissionResult.success && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-arcane-300">暴露风险增加</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-red-400">
                      +{lastMissionResult.exposureRisk}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <ArcaneButton
              className="w-full"
              variant={lastMissionResult.success ? 'primary' : 'secondary'}
              onClick={() => clearLastMissionResult()}
            >
              确认
            </ArcaneButton>
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
            任务大厅
          </h1>
          <p className="text-arcane-400">派遣间谍执行任务，获取情报积分和奖励</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="arcane-card px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-gold-400">{filteredMissions.length} 可用</span>
            </div>
            <div className="w-px h-4 bg-arcane-600" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-sm text-blue-400">{activeExecutions.length} 进行中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-arcane-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'available'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                : 'text-arcane-400 hover:text-gold-400'
            }`}
          >
            可用任务
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                : 'text-arcane-400 hover:text-gold-400'
            }`}
          >
            进行中 ({activeExecutions.length})
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-4 h-4 text-arcane-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 text-sm focus:outline-none focus:border-gold-500"
            >
              <option value="all">全部类型</option>
              <option value="assassinate">暗杀</option>
              <option value="steal">窃取</option>
              <option value="infiltrate">渗透</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
              className="px-3 py-2 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 text-sm focus:outline-none focus:border-gold-500"
            >
              <option value="all">全部难度</option>
              <option value="1">简单</option>
              <option value="2">简单</option>
              <option value="3">中等</option>
              <option value="4">困难</option>
              <option value="5">极难</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'available' ? (
        filteredMissions.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredMissions.map((mission) => {
              const config = typeConfig[mission.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={mission.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedMission(mission)}
                  className="cursor-pointer"
                >
                  <ArcaneCard className={`p-5 bg-gradient-to-br ${config.bg} to-arcane-900/50 h-full`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-arcane-800 border-2 border-current ${config.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-gold-400">{mission.title}</h3>
                          <p className="text-sm text-arcane-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {mission.target?.location}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${difficultyColors[mission.difficulty as keyof typeof difficultyColors]}`}>
                        {difficultyLabels[mission.difficulty as keyof typeof difficultyLabels]}
                      </span>
                    </div>

                    <p className="text-sm text-arcane-200 mb-4 line-clamp-2">{mission.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gold-500" />
                        <span className="text-xs text-arcane-300">成功率</span>
                        <span className="text-xs font-mono text-gold-400 ml-auto">{Math.max(20, 85 - mission.difficulty * 10)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-arcane-300">时间</span>
                        <span className="text-xs font-mono text-blue-400 ml-auto">{mission.timeLimit}s</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2 text-xs">
                        {mission.stealthRequired > 0 && (
                          <span className="text-arcane-400">隐匿 {mission.stealthRequired}</span>
                        )}
                        {mission.disguiseRequired > 0 && (
                          <span className="text-blue-400">伪装 {mission.disguiseRequired}</span>
                        )}
                        {mission.decryptionRequired > 0 && (
                          <span className="text-green-400">破解 {mission.decryptionRequired}</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gold-500/20 pt-3">
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-gold-500" />
                          <span className="text-sm font-mono text-gold-400">+{mission.rewards.intelPoints}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-mono text-purple-400">+{mission.rewards.reputation}</span>
                        </div>
                        {mission.rewards.scrolls.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <ScrollText className="w-4 h-4 text-blue-500" />
                            <div className="flex gap-1">
                              {mission.rewards.scrolls.map((rarity, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs font-medium px-1.5 py-0.5 rounded border ${rarityColors[rarity as keyof typeof rarityColors]}`}
                                >
                                  {rarityCn[rarity as keyof typeof rarityCn]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-arcane-400">预计奖励</span>
                        <div className="flex items-center gap-1 text-gold-400">
                          <span className="text-xs">查看详情</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </ArcaneCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <ArcaneCard className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
            <h3 className="text-xl font-bold text-gold-400 mb-2">暂无可接任务</h3>
            <p className="text-arcane-400">请稍后再来查看新的任务</p>
          </ArcaneCard>
        )
      ) : (
        activeExecutions.length > 0 ? (
          <div className="space-y-4">
            {activeExecutions.map((execution) => {
              const mission = getMissionById(execution.missionId);
              const config = mission ? typeConfig[mission.type] : null;
              const hasUnresolvedEvents = execution.events.some(e => !e.resolved);

              return (
                <motion.div
                  key={execution.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedExecution(execution)}
                  className="cursor-pointer"
                >
                  <ArcaneCard className={`p-5 bg-gradient-to-br ${config?.bg || 'from-arcane-900'} to-arcane-900/50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-xl bg-arcane-800 border-2 border-current ${config?.color || 'text-gold-500'} flex items-center justify-center relative`}>
                          {config?.icon && <config.icon className="w-7 h-7" />}
                          {hasUnresolvedEvents && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                              !
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-lg font-bold text-gold-400">
                              {mission?.title || '未知任务'}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              execution.currentSuccessRate >= 70 ? 'bg-green-500/20 text-green-400' :
                              execution.currentSuccessRate >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {Math.round(execution.currentSuccessRate)}% 成功率
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-arcane-300">
                              {config?.label} · {mission?.target?.location}
                            </span>
                            <span className="text-sm text-arcane-400">
                              {execution.spyIds.length} 名间谍
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-arcane-400">进度</span>
                          <span className="font-mono text-gold-400">{Math.round(execution.progress)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-arcane-400">完美度</span>
                          <span className="font-mono text-purple-400">{Math.round(execution.perfection)}%</span>
                        </div>
                      </div>
                      <div className="w-64">
                        <StatBar value={execution.progress} max={100} color="gold" />
                      </div>
                    </div>
                  </ArcaneCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <ArcaneCard className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
            <h3 className="text-xl font-bold text-gold-400 mb-2">暂无进行中的任务</h3>
            <p className="text-arcane-400 mb-6">去任务大厅选择任务开始执行吧</p>
            <ArcaneButton onClick={() => setActiveTab('available')}>
              <Target className="w-4 h-4 mr-2" />
              查看可用任务
            </ArcaneButton>
          </ArcaneCard>
        )
      )}

      <AnimatePresence>
        {selectedMission && <MissionDetailModal />}
        {selectedExecution && <ExecutionDetailModal />}
        {lastMissionResult && <MissionResultModal />}
      </AnimatePresence>
    </div>
  );
};
