import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { Eye, User, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-arcane-950 via-arcane-900 to-shadow-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="magic-particles absolute inset-0 opacity-40" />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="w-[800px] h-[800px] rounded-full border border-gold-500/30"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold"
          >
            <Eye className="w-12 h-12 text-arcane-900" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold gold-text text-shadow-gold mb-2">
            暗影情报网络
          </h1>
          <p className="text-arcane-400 text-sm">SHADOW INTELLIGENCE NETWORK</p>
        </div>

        <ArcaneCard className="p-8" hover={false}>
          <div className="flex mb-6 bg-arcane-800/50 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                  : 'text-arcane-400 hover:text-gold-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                  : 'text-arcane-400 hover:text-gold-400'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gold-300 mb-2 font-medium">
                <User className="w-4 h-4 inline mr-2" />
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="请输入您的代号"
                required
              />
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-gold-300 mb-2 font-medium">
                  <Mail className="w-4 h-4 inline mr-2" />
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  placeholder="请输入魔法信箱"
                  required
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm text-gold-300 mb-2 font-medium">
                <Lock className="w-4 h-4 inline mr-2" />
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="请输入暗语"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blood-500/20 border border-blood-500/50 rounded-lg text-blood-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <ArcaneButton type="submit" loading={isLoading} className="w-full">
              <Sparkles className="w-5 h-5 inline mr-2" />
              {isLogin ? '进入暗影网络' : '创建情报官账户'}
            </ArcaneButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-arcane-500 text-xs">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gold-400 hover:text-gold-300 ml-1 underline underline-offset-2"
              >
                {isLogin ? '立即注册' : '返回登录'}
              </button>
            </p>
          </div>
        </ArcaneCard>

        <p className="text-center mt-6 text-arcane-600 text-xs">
          © 暗影纪元 1275 · 所有情报均已加密保护
        </p>
      </motion.div>
    </div>
  );
};
