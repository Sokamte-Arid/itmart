import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, MessageCircle, Share2, Bell, FileText, ExternalLink } from 'lucide-react';
import * as settingsApi from '../../api/settings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Field, Input, Textarea } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

// Sections of the page and their fields: [name, input type, extra props]
const SECTIONS = [
  {
    key: 'contact',
    icon: MessageCircle,
    fields: [
      ['whatsappNumber', 'tel', { placeholder: '237690000000', inputMode: 'numeric' }],
      ['contactPhone', 'tel', { placeholder: '+237 690 00 00 00' }],
      ['contactEmail', 'email', { placeholder: 'contact@…' }],
    ],
  },
  {
    key: 'social',
    icon: Share2,
    fields: [
      ['facebookUrl', 'url', { placeholder: 'https://www.facebook.com/…' }],
      ['instagramUrl', 'url', { placeholder: 'https://www.instagram.com/…' }],
      ['tiktokUrl', 'url', { placeholder: 'https://www.tiktok.com/@…' }],
    ],
  },
  {
    key: 'notifications',
    icon: Bell,
    fields: [
      ['notificationEmail', 'email', { placeholder: 'vous@gmail.com' }],
      ['lowStockThreshold', 'number', { min: 0, max: 10000, step: 1 }],
    ],
  },
  {
    key: 'invoices',
    icon: FileText,
    fields: [
      ['companyName', 'text', {}],
      ['companyAddress', 'text', {}],
      ['companyCity', 'text', { placeholder: 'Douala' }],
      ['companyNiu', 'text', {}],
      ['companyRccm', 'text', {}],
      ['vatRate', 'number', { min: 0, max: 100, step: 0.01 }],
      ['proformaValidityDays', 'number', { min: 1, max: 365, step: 1 }],
      ['invoiceFooter', 'textarea', { maxLength: 300 }],
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields.map(([name]) => name));

const toForm = (saved = {}) => Object.fromEntries(ALL_FIELDS.map((f) => [f, saved[f] === undefined || saved[f] === null ? '' : String(saved[f])]));

export default function StoreSettings() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [savedForm, setSavedForm] = useState(null);
  const [defaults, setDefaults] = useState({});
  const [badFields, setBadFields] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .getStoreSettings()
      .then((res) => {
        setForm(toForm(res.data.saved));
        setSavedForm(toForm(res.data.saved));
        setDefaults(res.data.defaults || {});
      })
      .catch(() => showToast(t('settings.loadError'), 'error'));
  }, [showToast, t]);

  if (!form) return <p className="text-ink-500">{t('common.loading')}</p>;

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const waDigits = form.whatsappNumber.replace(/[\s+().-]/g, '');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setBadFields([]);
    try {
      const res = await settingsApi.updateStoreSettings({
        ...form,
        lang: i18n.language?.startsWith('en') ? 'en' : 'fr',
      });
      setForm(toForm(res.data.saved));
      setSavedForm(toForm(res.data.saved));
      showToast(t('store.saved'));
    } catch (err) {
      setBadFields(Array.isArray(err.response?.data?.details) ? err.response.data.details : []);
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // When a field is empty, the old .env value (if any) is still used: show it
  const hintFor = (name) => {
    const own = t(`store.fields.${name}.hint`, { defaultValue: '' });
    const d = defaults[name];
    const fallback = form[name] === '' && d !== undefined && d !== '' && d !== null ? t('store.currentDefault', { value: d }) : '';
    return [own, fallback].filter(Boolean).join(' ');
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl">
      <p className="text-sm text-ink-500 mb-5">{t('store.intro')}</p>

      <div className="space-y-4 sm:space-y-6">
        {SECTIONS.map(({ key, icon: Icon, fields }) => (
          <Card key={key}>
            <h2 className="font-semibold text-ink-900 mb-1 flex items-center gap-2">
              <Icon size={17} className="text-accent-600" /> {t(`store.sections.${key}`)}
            </h2>
            <p className="text-xs text-ink-500 mb-4">{t(`store.sections.${key}Hint`)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {fields.map(([name, type, props]) => {
                const common = {
                  id: name,
                  value: form[name],
                  onChange: (e) => setForm({ ...form, [name]: e.target.value }),
                  ...props,
                };
                return (
                  <div key={name} className={type === 'textarea' || name === 'whatsappNumber' ? 'sm:col-span-2' : ''}>
                    <Field
                      label={t(`store.fields.${name}.label`)}
                      hint={hintFor(name)}
                      error={badFields.includes(name) ? t(`store.fields.${name}.error`, { defaultValue: t('store.invalid') }) : undefined}
                    >
                      {type === 'textarea' ? <Textarea rows={2} {...common} /> : <Input type={type} {...common} />}
                    </Field>
                    {/* Check the number by opening a chat with it */}
                    {name === 'whatsappNumber' && /^\d{8,15}$/.test(waDigits) && (
                      <a
                        href={`https://wa.me/${waDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-mt-2 mb-4 inline-flex items-center gap-1 text-xs text-accent-600 hover:underline"
                      >
                        {t('store.testWhatsapp')} <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="h-16 sm:hidden" aria-hidden="true" />
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-white/95 backdrop-blur border border-surface-border p-3 shadow-sm">
        <Button type="submit" disabled={saving || !dirty} icon={Save}>
          {saving ? t('common.loading') : t('common.saveChanges')}
        </Button>
        <p className="text-xs text-ink-500">{t('settings.delayNote')}</p>
      </div>
    </form>
  );
}
