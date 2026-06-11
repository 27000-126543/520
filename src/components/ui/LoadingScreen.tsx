import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = '正在连接暗影网络...' }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-arcane-950 flex flex-col items-center justify-center z-50">
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="w-24 h-24 rounded-full border-4 border-gold-500/30 border-t-gold-500 flex items-center justify-center"
        >
          <Eye className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 w-24 h-24 rounded-full border-2 border-gold-500/20"
        />
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-gold-400 text-xl font-display tracking-wider"
      >
        {message}
      </motion.p>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 bg-gold-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
