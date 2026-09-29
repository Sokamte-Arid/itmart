import { Outlet, useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const { t } = useTranslation();
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const { titleKey, subtitleKey } = current?.handle || {};
  const title = titleKey ? t(titleKey) : '';
  const subtitle = subtitleKey ? t(subtitleKey) : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
