import { Navigate, useParams } from 'react-router-dom';
import { Store, Palette, BarChart3 } from 'lucide-react';
import PageTabs from '../../components/ui/PageTabs';
import StoreSettings from './StoreSettings';
import BrandingSettings from './BrandingSettings';
import TrackingSettings from './TrackingSettings';

// "Paramètres": Boutique & contact / Identité visuelle / Suivi & publicité
const TABS = [
  { key: 'store', labelKey: 'nav.store', icon: Store, Component: StoreSettings },
  { key: 'branding', labelKey: 'nav.branding', icon: Palette, Component: BrandingSettings },
  { key: 'tracking', labelKey: 'settings.tabTracking', icon: BarChart3, Component: TrackingSettings },
];

export default function SettingsPage() {
  const { tab } = useParams();
  const current = TABS.find((x) => x.key === tab);
  if (!current) return <Navigate to="/settings/store" replace />;
  const { Component } = current;

  return (
    <div>
      <PageTabs tabs={TABS.map(({ key, labelKey, icon }) => ({ to: `/settings/${key}`, labelKey, icon }))} />
      {/* key: each tab starts fresh when you switch */}
      <Component key={current.key} />
    </div>
  );
}
