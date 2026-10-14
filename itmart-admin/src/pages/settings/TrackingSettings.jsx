import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ExternalLink, Wand2, Save } from 'lucide-react';
import * as settingsApi from '../../api/settings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

// The admin can paste either the ID itself or the whole code the tool gives
// them: the ID is picked out of it automatically. The server checks the
// final format again before saving.
const FIELDS = [
  {
    key: 'metaPixelId',
    tool: 'meta',
    url: 'https://business.facebook.com/events_manager2',
    placeholder: '1234567890123456',
    valid: /^\d{6,20}$/,
    extract: (text) =>
      text.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{6,20})['"]/)?.[1] ||
      text.match(/facebook\.com\/tr\?id=(\d{6,20})/)?.[1] ||
      text.match(/\b(\d{12,20})\b/)?.[1],
  },
  {
    key: 'gaMeasurementId',
    tool: 'ga',
    url: 'https://analytics.google.com/',
    placeholder: 'G-AB12CD34EF',
    valid: /^G-[A-Z0-9]{4,16}$/,
    extract: (text) => text.match(/\bG-[A-Za-z0-9]{4,16}\b/)?.[0]?.toUpperCase(),
  },
  {
    key: 'googleAdsId',
    tool: 'ads',
    url: 'https://ads.google.com/',
    placeholder: 'AW-123456789',
    valid: /^AW-\d{6,15}$/,
    extract: (text) => text.match(/\bAW-\d{6,15}\b/i)?.[0]?.toUpperCase(),
  },
  {
    key: 'googleAdsPurchaseLabel',
    tool: 'adsLabel',
    url: 'https://ads.google.com/',
    placeholder: 'AbCdEfGhIjK12',
    valid: /^[A-Za-z0-9_-]{4,40}$/,
    extract: (text) => text.match(/AW-\d{6,15}\/([A-Za-z0-9_-]{4,40})/)?.[1],
  },
  {
    key: 'clarityProjectId',
    tool: 'clarity',
    url: 'https://clarity.microsoft.com/',
    placeholder: 'k2x9abc1de',
    valid: /^[a-z0-9]{6,20}$/,
    extract: (text) =>
      text.match(/clarity\.ms\/tag\/([a-z0-9]{6,20})/)?.[1] ||
      text.match(/["']script["']\s*,\s*["']([a-z0-9]{6,20})["']/)?.[1],
  },
];

const empty = {
  metaPixelId: '',
  gaMeasurementId: '',
  googleAdsId: '',
  googleAdsPurchaseLabel: '',
  clarityProjectId: '',
  requireConsent: true,
};

export default function TrackingSettings() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [values, setValues] = useState(empty);
  const [saved, setSaved] = useState(empty);
  const [extracted, setExtracted] = useState({}); // field -> true when picked out of a pasted code
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .getTrackingSettings()
      .then((res) => {
        setValues({ ...empty, ...res.data });
        setSaved({ ...empty, ...res.data });
      })
      .catch(() => showToast(t('settings.loadError'), 'error'))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  const handleChange = (field, raw) => {
    const text = raw.trim();
    const next = { ...values, [field.key]: text };
    let picked = false;

    // A whole snippet (or anything that isn't just an ID) was pasted: pick the ID out
    if (text && !field.valid.test(text)) {
      const id = field.extract(text);
      if (id && field.valid.test(id)) {
        next[field.key] = id;
        picked = true;
      }
      // Google Ads snippet: it also holds the conversion label
      if (field.key === 'googleAdsId' || field.key === 'googleAdsPurchaseLabel') {
        const send = text.match(/\b(AW-\d{6,15})\/([A-Za-z0-9_-]{4,40})/i);
        if (send) {
          next.googleAdsId = send[1].toUpperCase();
          next.googleAdsPurchaseLabel = send[2];
          picked = true;
        }
      }
    }
    setValues(next);
    setExtracted((prev) => ({ ...prev, [field.key]: picked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await settingsApi.updateTrackingSettings({
        ...values,
        lang: i18n.language?.startsWith('en') ? 'en' : 'fr',
      });
      setValues({ ...empty, ...res.data });
      setSaved({ ...empty, ...res.data });
      setExtracted({});
      showToast(t('settings.saved'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-ink-500">{t('common.loading')}</p>;

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-ink-500 mb-5">{t('settings.trackingIntro')}</p>

      <Card className="mb-4">
        <div className="space-y-6">
          {FIELDS.map((field) => {
            const value = values[field.key];
            const invalid = value && !field.valid.test(value);
            const active = !!saved[field.key];
            return (
              <div key={field.key}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label htmlFor={field.key} className="text-sm font-semibold text-ink-900">
                    {t(`settings.${field.tool}.label`)}
                  </label>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      active ? 'text-success-600' : 'text-ink-400'
                    }`}
                  >
                    {active ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    {active ? t('settings.on') : t('settings.off')}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mb-2">{t(`settings.${field.tool}.purpose`)}</p>
                <Input
                  id={field.key}
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                />
                {extracted[field.key] && !invalid && (
                  <p className="mt-1 text-xs text-success-600 flex items-center gap-1">
                    <Wand2 size={12} /> {t('settings.extracted')}
                  </p>
                )}
                {invalid && <p className="mt-1 text-xs text-danger-600">{t(`settings.${field.tool}.invalid`)}</p>}
                <p className="mt-1.5 text-xs text-ink-500">
                  {t(`settings.${field.tool}.where`)}{' '}
                  <a
                    href={field.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-accent-600 hover:underline"
                  >
                    {t('settings.open')} <ExternalLink size={11} />
                  </a>
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.requireConsent}
            onChange={(e) => setValues({ ...values, requireConsent: e.target.checked })}
            className="mt-0.5 rounded border-surface-border text-accent-500 focus:ring-accent-500"
          />
          <span>
            <span className="block text-sm font-semibold text-ink-900">{t('settings.consentLabel')}</span>
            <span className="block text-xs text-ink-500 mt-0.5">{t('settings.consentHint')}</span>
          </span>
        </label>
        {!values.requireConsent && (
          <p className="mt-3 text-xs text-warning-600 bg-warning-100 rounded-md px-3 py-2">{t('settings.consentWarning')}</p>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !dirty} icon={Save}>
          {saving ? t('common.loading') : t('common.saveChanges')}
        </Button>
        <p className="text-xs text-ink-500">{t('settings.delayNote')}</p>
      </div>
    </div>
  );
}
