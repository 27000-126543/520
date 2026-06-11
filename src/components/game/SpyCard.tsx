import { motion } from 'framer-motion';
import type { Spy } from '../../../shared/types';
import { ArcaneCard } from '../ui/ArcaneCard';
import { StatBar } from '../ui/StatBar';
import { Eye, UserCheck, Key, Heart, Star, Zap, User } from 'lucide-react';

interface SpyCardProps {
  spy: Spy;
  onClick?: () => void;
  selected?: boolean;
  showActions?: boolean;
  onUpgrade?: (skill: 'stealth' | 'disguise' | 'decryption') => void;
}

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
  idle: { text: '空闲', color: 'text-green-400' },
  mission: { text: '任务中', color: 'text-blue-400' },
  training: { text: '训练中', color: 'text-yellow-400' },
  injured: { text: '受伤', color: 'text-red-400' }
};

export const SpyCard = ({ spy, onClick, selected, showActions, onUpgrade }: SpyCardProps) => {
  const totalSkills = spy.skills.stealth + spy.skills.disguise + spy.skills.decryption;
  const successBonus = Math.round(totalSkills / 3);

  return (
    <ArcaneCard
      className={`p-5 ${selected ? 'ring-2 ring-gold-400 shadow-gold' : ''} ${rarityGlow[spy.rarity]} bg-gradient-to-br ${rarityBg[spy.rarity]}`}
      onClick={onClick}
      hover={!!onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className={`w-14 h-14 rounded-full border-2 ${rarityColors[spy.rarity]} bg-arcane-800 flex items-center justify-center`}
          >
            <User className="w-7 h-7 text-gold-400" />
          </motion.div>
          <div>
            <h3 className="font-display text-lg font-bold text-gold-400">{spy.codeName}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[spy.rarity]} ${spy.rarity === 'legendary' ? 'text-gold-400' : spy.rarity === 'epic' ? 'text-purple-400' : spy.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'}`}>
                {spy.rarity === 'common' ? '普通' : spy.rarity === 'rare' ? '稀有' : spy.rarity === 'epic' ? '史诗' : '传说'}
              </span>
              <span className={`text-xs ${statusLabels[spy.status].color}`}>
                {statusLabels[spy.status].text}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-gold-500" />
          <span className="text-gold-400 font-bold">+{totalSkills}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-arcane-400" />
          <span className="text-sm text-arcane-300 w-16">隐匿</span>
          <div className="flex-1">
            <StatBar value={spy.skills.stealth} max={100} color="purple" showValue={false} />
          </div>
          <span className="text-sm font-mono text-arcane-400 w-8">{spy.skills.stealth}</span>
        </div>

        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300 w-16">伪装</span>
          <div className="flex-1">
            <StatBar value={spy.skills.disguise} max={100} color="blue" showValue={false} />
          </div>
          <span className="text-sm font-mono text-blue-400 w-8">{spy.skills.disguise}</span>
        </div>

        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-300 w-16">破解</span>
          <div className="flex-1">
            <StatBar value={spy.skills.decryption} max={100} color="green" showValue={false} />
          </div>
          <span className="text-sm font-mono text-green-400 w-8">{spy.skills.decryption}</span>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300 w-16">体力</span>
          <div className="flex-1">
            <StatBar value={spy.stats.stamina} max={spy.stats.maxStamina} color="red" showValue={false} />
          </div>
          <span className="text-sm font-mono text-red-400 w-8">{spy.stats.stamina}/{spy.stats.maxStamina}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gold-500/20 pt-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold-500" />
          <span className="text-sm text-gold-400/80">成功率加成</span>
        </div>
        <span className="text-gold-400 font-bold">+{successBonus}%</span>
      </div>

      {showActions && onUpgrade && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUpgrade('stealth'); }}
            className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-arcane-300 rounded border border-arcane-500/30 transition-colors"
          >
            升级隐匿
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpgrade('disguise'); }}
            className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-blue-300 rounded border border-blue-500/30 transition-colors"
          >
            升级伪装
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpgrade('decryption'); }}
            className="px-2 py-1.5 text-xs bg-arcane-700/50 hover:bg-arcane-600/50 text-green-300 rounded border border-green-500/30 transition-colors"
          >
            升级破解
          </button>
        </div>
      )}
    </ArcaneCard>
  );
};
