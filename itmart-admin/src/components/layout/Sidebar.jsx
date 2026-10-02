import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ShoppingBag,
  Cpu,
  Image,
  Users,
  BarChart3,
  Truck,
  X,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen, onMobileClose, onOpenMobileApp }) {
  const { t } = useTranslation();
  const { admin } = useAuth();

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/products', label: t('nav.products'), icon: Package },
    { to: '/categories', label: t('nav.categories'), icon: FolderTree },
    { to: '/brands', label: t('nav.brands'), icon: Tags },
    { to: '/banners', label: t('nav.banners'), icon: Image },
    { to: '/delivery-zones', label: t('nav.deliveryZones'), icon: Truck },
    { to: '/orders', label: t('nav.orders'), icon: ShoppingBag },
    // Only Super Admins can manage other admin accounts
    ...(admin?.role === 'SUPER_ADMIN' ? [{ to: '/admins', label: t('nav.admins'), icon: Users }] : []),
  ];

  const navLinks = (onLinkClick) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-500 text-ink-950'
                : 'text-ink-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const mobileAppButton = (
    <button
      onClick={onOpenMobileApp}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white"
    >
      <Smartphone size={18} />
      {t('nav.mobileApp')}
    </button>
  );

  return (
    <>
      {/* Desktop sidebar — always visible from the lg breakpoint up */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-ink-900 text-ink-300 flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-accent-500 flex items-center justify-center text-ink-950">
            <Cpu size={18} strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">IT Mart</span>
        </div>
        {navLinks()}
        <div className="px-3 py-3 border-t border-white/10">
          {mobileAppButton}
          <p className="px-3 pt-2 text-xs text-ink-500">IT Mart Admin v1.1</p>
        </div>
      </aside>

      {/* Mobile drawer — opened via the hamburger button in Topbar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-ink-900 text-ink-300 flex flex-col">
            <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent-500 flex items-center justify-center text-ink-950">
                  <Cpu size={18} strokeWidth={2.5} />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">IT Mart</span>
              </div>
              <button onClick={onMobileClose} className="text-ink-300 hover:text-white p-1" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            {navLinks(onMobileClose)}
            <div className="px-3 py-3 border-t border-white/10 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {mobileAppButton}
              <p className="px-3 pt-2 text-xs text-ink-500">IT Mart Admin v1.1</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
