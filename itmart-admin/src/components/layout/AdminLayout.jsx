import { useEffect, useState } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import MobileAppModal from '../pwa/MobileAppModal';

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const matches = useMatches();
  const location = useLocation();
  const online = useOnline();
  const current = matches[matches.length - 1];
  const { titleKey, subtitleKey } = current?.handle || {};
  const title = titleKey ? t(titleKey) : '';
  const subtitle = subtitleKey ? t(subtitleKey) : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAppOpen, setMobileAppOpen] = useState(false);

  // Close the mobile menu whenever the page changes
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const openMobileApp = () => {
    setMobileMenuOpen(false);
    setMobileAppOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-surface overflow-x-clip">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onOpenMobileApp={openMobileApp}
      />
      <div className="flex-1 min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          onOpenMobileApp={openMobileApp}
        />
        {!online && (
          <div className="flex items-center gap-2 bg-warning-100 text-warning-600 text-sm px-4 py-2">
            <WifiOff size={16} className="shrink-0" /> {t('pwa.offline')}
          </div>
        )}
        {/* Extra bottom padding on phones so content clears the tab bar */}
        <main className="p-4 sm:p-6 pb-28 lg:pb-6 max-w-7xl mx-auto">
          <Outlet context={{ openMobileApp }} />
        </main>
      </div>
      <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <MobileAppModal open={mobileAppOpen} onClose={() => setMobileAppOpen(false)} />
    </div>
  );
}
