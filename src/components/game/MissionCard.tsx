import { motion } from 'framer-motion';
import type { Mission } from '../../../shared/types';
import { ArcaneCard } from '../ui/ArcaneCard';
import { StatBar } from '../ui/StatBar';
import { Target, Skull, FileSearch, Users, ShieldAlert, Clock, Coins, ScrollText } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
  disabled?: boolean;
}

const typeConfig = {
  assassination: { icon: Skull, color: 'text-red-500', bg: 'from-red-900/30', label: '暗杀' },
  theft: { icon: FileSearch, color: 'text-blue-400', bg: 'from-blue-900/30', label: '窃取' },
  infiltration: { icon: Users, color: 'text-green-400', bg: 'from-green-900/30', label: '渗透' }
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return 'text-green-400';
  if (difficulty <= 4) return 'text-yellow-400';
  if (difficulty <= 6) return 'text-orange-400';
  return 'text-red-500';
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 2) return '简单';
  if (difficulty <= 4) return '中等';
  if (difficulty <= 6) return '困难';
  return '极难';
};

export const MissionCard = ({ mission, onClick, disabled }: MissionCardProps) => {
  const config = typeConfig[mission.type];
  const Icon = config.icon;
  const avgSkill = Math.round((
    (mission.requiredSkills.stealth || 0) + 
    (mission.requiredSkills.disguise || 0) + 
    (mission.requiredSkills.decryption || 0)
  ) / 3);

  return (
    <ArcaneCard
      className={`p-5 bg-gradient-to-br ${config.bg} to-arcane-900/50 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      hover={!disabled}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`w-12 h-12 rounded-full bg-arcane-800 border-2 border-current ${config.color} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="font-display text-lg font-bold text-gold-400">{mission.title}</h3>
            <p className="text-sm text-arcane-300">{mission.targetLocation}</p>
          </div>
        </div>
        <span className={`text-sm font-bold ${getDifficultyColor(mission.difficulty)}`}>
          {getDifficultyLabel(mission.difficulty)}
        </span>
      </div>

      <p className="text-sm text-arcane-200 mb-4 line-clamp-2">{mission.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gold-500" />
          <span className="text-xs text-arcane-300">基础成功率</span>
          <span className="text-xs font-mono text-gold-400 ml-auto">{mission.baseSuccessRate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-arcane-300">时间限制</span>
          <span className="text-xs font-mono text-blue-400 ml-auto">{mission.timeLimit}s</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />
          <span className="text-xs text-arcane-300">难度等级</span>
          <span className="text-xs font-mono text-green-400 ml-auto">Lv.{mission.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span className="text-xs text-arcane-300">暴露惩罚</span>
          <span className="text-xs font-mono text-red-500 ml-auto">+{mission.penalties.exposureIncrease}%</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <StatBar
          label="所需技能"
          value={avgSkill}
          color="gold"
          showValue={false}
        />
        <div className="flex gap-2 text-xs">
          <span className="text-arcane-400">隐匿 {mission.requiredSkills.stealth || 0}</span>
          <span className="text-blue-400">伪装 {mission.requiredSkills.disguise || 0}</span>
          <span className="text-green-400">破解 {mission.requiredSkills.decryption || 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gold-500/20 pt-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-gold-500" />
          <span className="text-gold-400 font-bold">{mission.rewards.intelPoints} 积分</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-arcane-400 block">情报卷轴</span>
          <span className="text-sm font-mono text-arcane-300 flex items-center gap-1">
            <ScrollText className="w-3 h-3" />
            {mission.rewards.scrolls.length} 个
          </span>
        </div>
      </div>
    </ArcaneCard>
  );
};
