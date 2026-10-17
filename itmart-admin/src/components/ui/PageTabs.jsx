import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Tab bar under the page title, used by the pages that group several
// sections (Catalogue, Paramètres). Each tab is a real address, so the
// browser's back button and bookmarks work.
// tabs: [{ to, labelKey, icon, end? }] — end: only active on that exact address
export default function PageTabs({ tabs }) {
  const { t } = useTranslation();
  return (
    <div role="tablist" className="mb-5 flex gap-1 border-b border-surface-border">
      {tabs.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          role="tab"
          className={({ isActive }) =>
            // Phones: equal tabs, icon above the label; larger screens: one row
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
  );
}
