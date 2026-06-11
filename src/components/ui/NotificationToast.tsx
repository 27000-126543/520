import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: 'from-green-600 to-green-500 border-green-400',
  error: 'from-blood-500 to-red-500 border-red-400',
  warning: 'from-amber-600 to-amber-500 border-amber-400',
  info: 'from-mystic-500 to-blue-500 border-blue-400'
};

export const NotificationToast = () => {
  const { notifications, removeNotification } = useGameStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type as keyof typeof iconMap] || Info;
          const colors = colorMap[notification.type as keyof typeof colorMap] || colorMap.info;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${colors} border shadow-lg min-w-[300px]`}
            >
              <Icon className="w-5 h-5 text-white flex-shrink-0" />
              <p className="flex-1 text-white font-medium">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
