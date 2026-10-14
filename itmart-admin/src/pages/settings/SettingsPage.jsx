import { NavLink, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store, Palette, BarChart3 } from 'lucide-react';
import StoreSettings from './StoreSettings';
import BrandingSettings from './BrandingSettings';
import TrackingSettings from './TrackingSettings';

// One "Paramètres" page with three tabs at the top; each tab has its own
// address (/settings/store, /settings/branding, /settings/tracking) so the
// browser's back button and bookmarks work.
const TABS = [
  { key: 'store', labelKey: 'nav.store', icon: Store, Component: StoreSettings },
  { key: 'branding', labelKey: 'nav.branding', icon: Palette, Component: BrandingSettings },
  { key: 'tracking', labelKey: 'settings.tabTracking', icon: BarChart3, Component: TrackingSettings },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { tab } = useParams();
  const current = TABS.find((x) => x.key === tab);
  if (!current) return <Navigate to="/settings/store" replace />;
  const { Component } = current;

  return (
    <div>
      <div
        role="tablist"
        className="mb-5 flex gap-1 border-b border-surface-border"
      >
        {TABS.map(({ key, labelKey, icon: Icon }) => (
          <NavLink
            key={key}
            to={`/settings/${key}`}
            role="tab"
            aria-selected={key === current.key}
            className={({ isActive }) =>
              // Phones: three equal tabs, icon above the label; larger screens: one row
              `flex flex-1 sm:flex-none flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-w-0 px-1.5 sm:px-3.5 py-2 sm:py-2.5 -mb-px border-b-2 text-[11px] leading-tight text-center sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'border-accent-500 text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-900 hover:border-surface-border'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>

      {/* key: each tab starts fresh when you switch */}
      <Component key={current.key} />
    </div>
  );
}
