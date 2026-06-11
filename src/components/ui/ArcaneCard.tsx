import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ArcaneCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const ArcaneCard = ({ children, className = '', hover = true, glow = false, onClick }: ArcaneCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.3 }}
      className={`arcane-card ${glow ? 'animate-glow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
