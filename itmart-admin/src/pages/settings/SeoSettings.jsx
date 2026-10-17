import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Save } from 'lucide-react';
import * as settingsApi from '../../api/settings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Field, Input, Textarea } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';
import GooglePreview from '../../components/seo/GooglePreview';
import { SEO_TITLE, SEO_DESC, lengthTone, shopHost } from '../../components/seo/seoUtils';

const empty = { siteName: 'IT Mart', homeTitle: '', homeDescription: '', googleVerification: '' };
const toneText = { success: 'text-success-600', warning: 'text-warning-600', danger: 'text-danger-600' };

// Paramètres → Référencement: how the whole shop appears on Google.
// Each product and category also has its own "Référencement" section.
export default function SeoSettings() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [values, setValues] = useState(empty);
  const [saved, setSaved] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .getSeoSettings()
      .then((res) => {
        setValues({ ...empty, ...res.data });
        setSaved({ ...empty, ...res.data });
      })
      .catch(() => showToast(t('settings.loadError'), 'error'))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await settingsApi.updateSeoSettings({
        ...values,
        lang: i18n.language?.startsWith('en') ? 'en' : 'fr',
      });
      setValues({ ...empty, ...res.data });
      setSaved({ ...empty, ...res.data });
      showToast(t('settings.saved'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-ink-500">{t('common.loading')}</p>;

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const homeTitle = values.homeTitle.trim() || `${values.siteName || 'IT Mart'} — ${t('seo.defaultHomeTitle')}`;
  const titleTone = lengthTone(homeTitle.length, SEO_TITLE);
  const descTone = lengthTone(values.homeDescription.trim().length, SEO_DESC);

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-ink-500 mb-5">{t('seo.settingsIntro')}</p>

      <Card className="mb-4">
        <Field label={t('seo.siteName')} hint={t('seo.siteNameHint')}>
          <Input
            value={values.siteName}
            maxLength={40}
            onChange={(e) => setValues({ ...values, siteName: e.target.value })}
          />
        </Field>
        <Field
          label={t('seo.homeTitle')}
          hint={
            <span>
              {t('seo.homeTitleHint')}{' '}
              <span className={`font-medium ${toneText[titleTone]}`}>
                {homeTitle.length}/{SEO_TITLE.max}
              </span>
            </span>
          }
        >
          <Input
            value={values.homeTitle}
            maxLength={SEO_TITLE.hard}
            onChange={(e) => setValues({ ...values, homeTitle: e.target.value })}
            placeholder={t('seo.homeTitlePlaceholder')}
          />
        </Field>
        <Field
          label={t('seo.homeDescription')}
          hint={
            <span>
              {t('seo.homeDescriptionHint')}{' '}
              <span className={`font-medium ${toneText[descTone]}`}>
                {values.homeDescription.trim().length}/{SEO_DESC.max}
              </span>
            </span>
          }
        >
          <Textarea
            rows={3}
            value={values.homeDescription}
            maxLength={SEO_DESC.hard}
            onChange={(e) => setValues({ ...values, homeDescription: e.target.value })}
            placeholder={t('seo.homeDescriptionPlaceholder')}
          />
        </Field>
        <GooglePreview title={homeTitle} description={values.homeDescription} />
      </Card>

      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-ink-900 mb-1">{t('seo.searchConsole')}</h3>
        <p className="text-xs text-ink-500 mb-3">{t('seo.searchConsoleIntro')}</p>
        <Field label={t('seo.googleVerification')} hint={t('seo.googleVerificationHint')}>
          <Input
            value={values.googleVerification}
            onChange={(e) => setValues({ ...values, googleVerification: e.target.value })}
            placeholder='<meta name="google-site-verification" content="…" />'
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <p className="text-xs text-ink-500">
          {t('seo.sitemapHint')}{' '}
          <span className="font-mono text-ink-800 break-all">https://{shopHost()}/sitemap.xml</span>{' '}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-accent-600 hover:underline"
          >
            {t('settings.open')} <ExternalLink size={11} />
          </a>
        </p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !dirty} icon={Save}>
          {saving ? t('common.loading') : t('common.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
