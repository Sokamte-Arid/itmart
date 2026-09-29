import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LogOut, ChevronDown, Globe, KeyRound, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { t, i18n } = useTranslation();
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('itmart_admin_lang', lng);
  };

  const initials = admin?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between gap-2 px-3 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg hover:bg-surface text-ink-700"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-ink-900 leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="flex items-center rounded-lg border border-surface-border overflow-hidden text-sm">
          <button
            onClick={() => switchLang('fr')}
            className={`px-2 sm:px-2.5 py-1.5 flex items-center gap-1 ${
              i18n.language === 'fr' ? 'bg-accent-500 text-ink-950 font-semibold' : 'text-ink-500 hover:bg-surface'
            }`}
          >
            <Globe size={13} /> FR
          </button>
          <button
            onClick={() => switchLang('en')}
            className={`px-2 sm:px-2.5 py-1.5 flex items-center gap-1 border-l border-surface-border ${
              i18n.language === 'en' ? 'bg-accent-500 text-ink-950 font-semibold' : 'text-ink-500 hover:bg-surface'
            }`}
          >
            <Globe size={13} /> EN
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-lg hover:bg-surface"
          >
            <div className="h-8 w-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials || 'AD'}
            </div>
            <span className="text-sm font-medium text-ink-800 max-w-[120px] truncate hidden sm:inline">
              {admin?.name}
            </span>
            <ChevronDown size={14} className="text-ink-500 hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-surface-border rounded-lg shadow-lg z-20 py-1">
                <div className="px-3 py-2 border-b border-surface-border">
                  <p className="text-sm font-medium text-ink-900 truncate">{admin?.name}</p>
                  <p className="text-xs text-ink-500 truncate">{admin?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface"
                >
                  <KeyRound size={15} />
                  {t('account.changePassword')}
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-100/50"
                >
                  <LogOut size={15} />
                  {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </header>
  );
}
