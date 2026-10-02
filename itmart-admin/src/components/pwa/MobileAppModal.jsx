import { useTranslation } from 'react-i18next';
import { BellRing, BellOff, Download, CheckCircle2, Smartphone, Share, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useInstallApp, usePushNotifications, isIOS, isStandalone } from '../../pwa/pwa';

// "Mobile app" panel: install the admin on this device + turn notifications on/off.
export default function MobileAppModal({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { installed, canInstall, showIOSHint, install } = useInstallApp();
  const push = usePushNotifications();
  const secure = window.isSecureContext;

  // On iPhone, Web Push only works from the installed app (iOS 16.4+)
  const iosNeedsInstall = isIOS() && !isStandalone();

  const handleError = (err) => {
    const key = err?.message?.startsWith('pwa.errors.') ? err.message : null;
    showToast(key ? t(key) : err?.response?.data?.message || t('pwa.errors.generic'), 'error');
  };

  const enable = () =>
    push
      .enable(i18n.language)
      .then(() => showToast(t('pwa.enabled')))
      .catch(handleError);

  const disable = () =>
    push
      .disable()
      .then(() => showToast(t('pwa.disabled')))
      .catch(handleError);

  const test = () =>
    push
      .sendTest()
      .then(() => showToast(t('pwa.testSent')))
      .catch(handleError);

  return (
    <Modal open={open} onClose={onClose} title={t('pwa.title')}>
      <div className="space-y-5">
        <p className="text-sm text-ink-600">{t('pwa.intro')}</p>

        {!secure && (
          <div className="flex gap-2.5 rounded-lg bg-warning-100 text-warning-600 p-3 text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>{t('pwa.insecure')}</p>
          </div>
        )}

        {/* Install */}
        <section className="rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={17} className="text-ink-700" />
            <h4 className="font-semibold text-ink-900 text-sm">{t('pwa.installTitle')}</h4>
          </div>
          {installed ? (
            <p className="flex items-center gap-1.5 text-sm text-success-600">
              <CheckCircle2 size={16} /> {t('pwa.installed')}
            </p>
          ) : canInstall ? (
            <Button icon={Download} onClick={install} className="w-full sm:w-auto">
              {t('pwa.installButton')}
            </Button>
          ) : showIOSHint ? (
            <p className="flex gap-2 text-sm text-ink-600">
              <Share size={16} className="shrink-0 mt-0.5" /> {t('pwa.iosHint')}
            </p>
          ) : (
            <p className="text-sm text-ink-600">{t('pwa.installManual')}</p>
          )}
        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-surface-border p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {push.subscribed ? (
                <BellRing size={17} className="text-success-600" />
              ) : (
                <BellOff size={17} className="text-ink-500" />
              )}
              <h4 className="font-semibold text-ink-900 text-sm">{t('pwa.notifTitle')}</h4>
            </div>
            <span className={`text-xs font-medium ${push.subscribed ? 'text-success-600' : 'text-ink-500'}`}>
              {push.subscribed ? t('pwa.notifOn') : t('pwa.notifOff')}
            </span>
          </div>

          {iosNeedsInstall ? (
            <p className="text-sm text-ink-600">{t('pwa.iosInstallFirst')}</p>
          ) : !push.supported ? (
            <p className="text-sm text-ink-600">{t('pwa.errors.unsupported')}</p>
          ) : push.permission === 'denied' ? (
            <p className="text-sm text-danger-600">{t('pwa.notifBlocked')}</p>
          ) : push.subscribed ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={BellRing} onClick={test} disabled={push.busy}>
                {t('pwa.sendTest')}
              </Button>
              <Button variant="ghost" onClick={disable} disabled={push.busy} className="text-danger-600">
                {t('pwa.disable')}
              </Button>
            </div>
          ) : (
            <Button icon={BellRing} onClick={enable} disabled={push.busy} className="w-full sm:w-auto">
              {push.busy ? t('common.loading') : t('pwa.enable')}
            </Button>
          )}
        </section>
      </div>
    </Modal>
  );
}
