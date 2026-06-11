import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { SpiesPage } from './pages/SpiesPage';
import { MissionsPage } from './pages/MissionsPage';
import { MarketPage } from './pages/MarketPage';
import { GuildPage } from './pages/GuildPage';
import { ReportsPage } from './pages/ReportsPage';
import { RankingsPage } from './pages/RankingsPage';
import { useAuthStore } from './store/useAuthStore';
import { initSocket, disconnectSocket } from './lib/socket';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen bg-arcane-950 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full" />
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/spies" element={<SpiesPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/guild" element={<GuildPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
