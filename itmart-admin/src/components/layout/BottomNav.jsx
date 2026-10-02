import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Menu } from 'lucide-react';

// Tab bar at the bottom of the screen on phones — the pages an admin uses
// most on the go. Everything else is under "Menu".
export default function BottomNav({ onOpenMenu }) {
  const { t } = useTranslation();

  const tabs = [
    { to: '/', label: t('nav.home'), icon: LayoutDashboard, end: true },
    { to: '/orders', label: t('nav.orders'), icon: ShoppingBag },
    { to: '/products', label: t('nav.products'), icon: Package },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  const item = 'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium';

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-surface-border flex pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `${item} ${isActive ? 'text-accent-600' : 'text-ink-500'}`}
        >
          {({ isActive }) => (
            <>
              <span className={`px-4 py-1 rounded-full ${isActive ? 'bg-accent-100' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="truncate max-w-full">{label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button onClick={onOpenMenu} className={`${item} text-ink-500`}>
        <span className="px-4 py-1">
          <Menu size={20} />
        </span>
        {t('nav.menu')}
      </button>
    </nav>
  );
}
