import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellRing, X } from 'lucide-react';
import Button from '../ui/Button';
import { usePushNotifications } from '../../pwa/pwa';

const DISMISS_KEY = 'itmart_app_banner_dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

// Dashboard prompt to install the app / turn on notifications.
// Hidden once both are done, or once the admin taps "Not now".
export default function AppSetupBanner() {
  const { t } = useTranslation();
  const { openMobileApp } = useOutletContext() || {};
  const push = usePushNotifications();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || push.subscribed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="relative mb-5 rounded-xl bg-ink-900 text-white p-4 flex flex-wrap sm:flex-nowrap items-center gap-3">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-accent-500 text-ink-950 flex items-center justify-center">
        <BellRing size={20} />
      </div>
      <div className="min-w-0 flex-1 pr-7 sm:pr-0">
        <p className="font-semibold text-sm">{t('pwa.bannerTitle')}</p>
        <p className="text-xs text-ink-300">{t('pwa.bannerText')}</p>
      </div>
      <Button size="sm" onClick={openMobileApp} className="w-full sm:w-auto shrink-0">
        {t('pwa.bannerAction')}
      </Button>
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 sm:static p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-white/10"
        aria-label={t('pwa.dismiss')}
        title={t('pwa.dismiss')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
