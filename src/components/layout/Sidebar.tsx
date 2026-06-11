import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard, Building2, Users, Target, ShoppingBag,
  Castle, FileBarChart, Trophy, LogOut, Eye, Bell, User
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '情报总览', icon: LayoutDashboard },
  { path: '/organization', label: '我的组织', icon: Building2 },
  { path: '/spies', label: '间谍管理', icon: Users },
  { path: '/missions', label: '任务大厅', icon: Target },
  { path: '/market', label: '情报市场', icon: ShoppingBag },
  { path: '/guild', label: '公会联盟', icon: Castle },
  { path: '/reports', label: '产业报告', icon: FileBarChart },
  { path: '/rankings', label: '全服排行', icon: Trophy },
];

export const Sidebar = () => {
  const { user, organization, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-64 bg-arcane-950/95 backdrop-blur-xl border-r border-gold-500/20 flex flex-col z-40"
    >
      <div className="p-6 border-b border-gold-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center animate-pulse-slow">
            <Eye className="w-7 h-7 text-arcane-900" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold gold-text">暗影网络</h1>
            <p className="text-xs text-arcane-400">SHADOW NETWORK</p>
          </div>
        </div>
      </div>

      {organization && (
        <div className="p-4 border-b border-gold-500/20">
          <div className="arcane-card p-3">
            <p className="text-xs text-arcane-400 mb-1">组织代号</p>
            <p className="font-display text-gold-400 font-bold">{organization.codeName}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-arcane-400">声望</span>
              <span className="text-sm text-gold-500 font-mono">{organization.reputation}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-arcane-400">积分</span>
              <span className="text-sm text-gold-500 font-mono">{organization.intelPoints}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scroll-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-400 border-l-2 border-gold-500'
                    : 'text-arcane-300 hover:bg-arcane-800/50 hover:text-gold-300'
                }`
              }
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gold-500/20">
        <div className="flex items-center gap-3 mb-4 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arcane-500 to-arcane-700 flex items-center justify-center">
            <User className="w-5 h-5 text-gold-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gold-300 truncate">{user?.username}</p>
            <p className="text-xs text-arcane-400">情报官</p>
          </div>
          <button className="relative p-2 text-arcane-400 hover:text-gold-400 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blood-500 rounded-full animate-pulse" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-arcane-400 hover:text-blood-400 hover:bg-blood-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>登出暗影网络</span>
        </button>
      </div>
    </motion.aside>
  );
};
