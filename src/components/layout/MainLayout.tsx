import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingScreen } from '../ui/LoadingScreen';
import { NotificationToast } from '../ui/NotificationToast';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-arcane-950">
      <div className="magic-particles fixed inset-0 pointer-events-none opacity-30" />
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
      <NotificationToast />
    </div>
  );
};
