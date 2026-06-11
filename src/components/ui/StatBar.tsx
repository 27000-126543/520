interface StatBarProps {
  value: number;
  max?: number;
  color?: 'gold' | 'purple' | 'green' | 'red' | 'blue';
  label?: string;
  showValue?: boolean;
}

export const StatBar = ({ value, max = 100, color = 'gold', label, showValue = true }: StatBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    gold: 'bg-gradient-to-r from-gold-600 to-gold-400',
    purple: 'bg-gradient-to-r from-arcane-600 to-arcane-400',
    green: 'bg-gradient-to-r from-green-600 to-green-400',
    red: 'bg-gradient-to-r from-blood-500 to-red-400',
    blue: 'bg-gradient-to-r from-mystic-500 to-mystic-400'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gold-300/80">{label}</span>
          {showValue && (
            <span className="text-gold-400 font-mono">{Math.round(value)}/{max}</span>
          )}
        </div>
      )}
      <div className="stat-bar">
        <div
          className={`stat-bar-fill ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
