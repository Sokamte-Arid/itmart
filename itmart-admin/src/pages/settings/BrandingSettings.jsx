import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Save, AlertTriangle, ShoppingCart, Search, RotateCcw } from 'lucide-react';
import * as settingsApi from '../../api/settings';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULTS = { primaryColor: '#FF6B35', darkColor: '#1E2436', backgroundColor: '#FFFFFF' };

// Ready-made pairs (main colour + dark colour) to start from
const PRESETS = [
  { name: 'IT Mart', primaryColor: '#FF6B35', darkColor: '#1E2436' },
  { name: 'Océan', primaryColor: '#0E7490', darkColor: '#0B2533' },
  { name: 'Forêt', primaryColor: '#16A34A', darkColor: '#14261C' },
  { name: 'Royal', primaryColor: '#4F46E5', darkColor: '#1E1B4B' },
  { name: 'Rubis', primaryColor: '#DC2626', darkColor: '#2A1215' },
  { name: 'Or', primaryColor: '#CA8A04', darkColor: '#231C0F' },
];

// Same shade maths as the storefront (lib/theme.js), for the preview
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (hex, target, amount) => {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * amount));
};

// WCAG contrast ratio between two colours (1 to 21)
const luminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

function ColorField({ label, hint, value, onChange }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-ink-800 mb-1">{label}</label>
      <p className="text-xs text-ink-500 mb-2">{hint}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-14 rounded-md border border-surface-border cursor-pointer shrink-0"
          aria-label={label}
        />
        <Input
          value={text}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.trim();
            setText(v);
            const withHash = v.startsWith('#') ? v : `#${v}`;
            if (HEX.test(withHash)) onChange(withHash.toUpperCase());
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function ImageSlot({ title, hint, url, onUpload, onRemove, busy, square, t }) {
  const inputRef = useRef(null);
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="text-xs text-ink-500 mb-3">{hint}</p>
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          <>
            {/* Preview on white and on the dark footer colour */}
            <div className={`flex items-center justify-center rounded-lg border border-surface-border bg-white ${square ? 'h-20 w-20' : 'h-20 px-4 min-w-40'}`}>
              <img src={`${API_ORIGIN}${url}`} alt="" className={square ? 'h-14 w-14 object-contain' : 'h-12 w-auto max-w-56 object-contain'} />
            </div>
            {square && (
              <div className="flex items-center gap-2 rounded-t-lg bg-surface border border-surface-border border-b-0 px-3 py-2 text-xs text-ink-700 self-end">
                <img src={`${API_ORIGIN}${url}`} alt="" className="h-4 w-4 object-contain" />
                IT Mart
              </div>
            )}
          </>
        ) : (
          <div className={`flex items-center justify-center rounded-lg border border-dashed border-surface-border text-xs text-ink-400 ${square ? 'h-20 w-20' : 'h-20 w-40'}`}>
            {t('branding.none')}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = '';
            }}
          />
          <Button type="button" variant="secondary" size="sm" icon={Upload} disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? t('common.loading') : url ? t('branding.replace') : t('branding.upload')}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" icon={Trash2} disabled={busy} onClick={onRemove}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrandingSettings() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [branding, setBranding] = useState(null);
  const [colors, setColors] = useState(DEFAULTS);
  const [busy, setBusy] = useState(''); // 'logo' | 'icon' | 'colors'
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  useEffect(() => {
    settingsApi
      .getBranding()
      .then((res) => {
        setBranding(res.data);
        setColors({
          primaryColor: res.data.primaryColor,
          darkColor: res.data.darkColor,
          backgroundColor: res.data.backgroundColor || '#FFFFFF',
        });
      })
      .catch(() => showToast(t('settings.loadError'), 'error'));
  }, [showToast, t]);

  if (!branding) return <p className="text-ink-500">{t('common.loading')}</p>;

  const upload = async (kind, file) => {
    if (file.size > 3 * 1024 * 1024) {
      showToast(t('branding.tooBig'), 'error');
      return;
    }
    setBusy(kind);
    try {
      const res = await settingsApi.uploadBrandingImage(kind, file);
      setBranding(res.data);
      showToast(t('branding.saved'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setBusy('');
    }
  };

  const save = async (payload, kind = 'colors') => {
    setBusy(kind);
    try {
      const res = await settingsApi.updateBranding({ ...payload, lang });
      setBranding(res.data);
      setColors({
          primaryColor: res.data.primaryColor,
          darkColor: res.data.darkColor,
          backgroundColor: res.data.backgroundColor || '#FFFFFF',
        });
      showToast(t('branding.saved'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setBusy('');
    }
  };

  const { primaryColor: p, darkColor: d, backgroundColor: bg } = colors;
  const dirty =
    p !== branding.primaryColor || d !== branding.darkColor || bg !== (branding.backgroundColor || '#FFFFFF');
  // The page text is dark: the background must stay light (same rule as the server)
  const bgTooDark = luminance(bg) < 0.7;
  // Quick background choices; the last one is a hint of the dark colour
  const backgroundChoices = [
    { key: 'white', hex: '#FFFFFF' },
    { key: 'cream', hex: '#FBF7F0' },
    { key: 'ivory', hex: '#FFFDF5' },
    { key: 'pearl', hex: '#F5F6F8' },
    { key: 'tint', hex: mix('#FFFFFF', d, 0.035).toUpperCase() },
  ];
  const buttonContrast = contrast(p, '#FFFFFF');
  const titleContrast = contrast(d, '#FFFFFF');
  const shade = {
    p50: mix(p, '#FFFFFF', 0.94),
    p600: mix(p, '#000000', 0.12),
    d950: mix(d, '#000000', 0.35),
    surface: mix(bg, d, 0.04),
    border: mix(bg, d, 0.13),
  };
  const logo = branding.logoUrl ? `${API_ORIGIN}${branding.logoUrl}` : null;

  return (
    <div className="max-w-5xl">
      <p className="text-sm text-ink-500 mb-5">{t('branding.intro')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">{t('branding.logoTitle')}</h2>
            <ImageSlot
              title={t('branding.logo')}
              hint={t('branding.logoHint')}
              url={branding.logoUrl}
              busy={busy === 'logo'}
              onUpload={(file) => upload('logo', file)}
              onRemove={() => save({ removeLogo: true }, 'logo')}
              t={t}
            />
            <ImageSlot
              title={t('branding.icon')}
              hint={t('branding.iconHint')}
              url={branding.iconUrl}
              busy={busy === 'icon'}
              onUpload={(file) => upload('icon', file)}
              onRemove={() => save({ removeIcon: true }, 'icon')}
              square
              t={t}
            />
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">{t('branding.colorsTitle')}</h2>
            <p className="text-xs font-medium text-ink-700 mb-2">{t('branding.presets')}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {PRESETS.map((preset) => {
                const active = preset.primaryColor === p && preset.darkColor === d;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setColors((c) => ({ ...c, primaryColor: preset.primaryColor, darkColor: preset.darkColor }))
                    }
                    className={`flex items-center gap-1.5 rounded-full border pl-1 pr-3 py-1 text-xs font-medium transition-colors ${
                      active ? 'border-accent-500 bg-accent-100 text-ink-900' : 'border-surface-border text-ink-700 hover:bg-surface'
                    }`}
                  >
                    <span className="flex">
                      <span className="h-5 w-5 rounded-full border-2 border-white" style={{ backgroundColor: preset.darkColor }} />
                      <span className="h-5 w-5 rounded-full border-2 border-white -ml-2" style={{ backgroundColor: preset.primaryColor }} />
                    </span>
                    {preset.name}
                  </button>
                );
              })}
            </div>

            <ColorField
              label={t('branding.primary')}
              hint={t('branding.primaryHint')}
              value={p}
              onChange={(v) => setColors((c) => ({ ...c, primaryColor: v }))}
            />
            <ColorField
              label={t('branding.dark')}
              hint={t('branding.darkHint')}
              value={d}
              onChange={(v) => setColors((c) => ({ ...c, darkColor: v }))}
            />
            <ColorField
              label={t('branding.background')}
              hint={t('branding.backgroundHint')}
              value={bg}
              onChange={(v) => setColors((c) => ({ ...c, backgroundColor: v }))}
            />
            <div className="flex flex-wrap gap-2 -mt-2 mb-4">
              {backgroundChoices.map((choice) => (
                <button
                  key={choice.key}
                  type="button"
                  onClick={() => setColors((c) => ({ ...c, backgroundColor: choice.hex }))}
                  className={`flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1 text-xs transition-colors ${
                    bg === choice.hex ? 'border-accent-500 bg-accent-100 text-ink-900' : 'border-surface-border text-ink-700 hover:bg-surface'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: choice.hex }} />
                  {t(`branding.bg.${choice.key}`)}
                </button>
              ))}
            </div>
            {bgTooDark && (
              <p className="flex items-start gap-2 text-xs text-danger-600 bg-danger-100 rounded-md px-3 py-2 mb-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {t('branding.backgroundTooDark')}
              </p>
            )}

            {buttonContrast < 2.6 && (
              <p className="flex items-start gap-2 text-xs text-warning-600 bg-warning-100 rounded-md px-3 py-2 mb-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {t('branding.lowContrastPrimary')}
              </p>
            )}
            {titleContrast < 4.5 && (
              <p className="flex items-start gap-2 text-xs text-warning-600 bg-warning-100 rounded-md px-3 py-2 mb-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {t('branding.lowContrastDark')}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                onClick={() => save({ primaryColor: p, darkColor: d, backgroundColor: bg })}
                disabled={!dirty || bgTooDark || busy === 'colors'}
                icon={Save}
              >
                {busy === 'colors' ? t('common.loading') : t('branding.saveColors')}
              </Button>
              {(p !== DEFAULTS.primaryColor || d !== DEFAULTS.darkColor || bg !== DEFAULTS.backgroundColor) && (
                <Button variant="ghost" icon={RotateCcw} onClick={() => setColors(DEFAULTS)}>
                  {t('branding.reset')}
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-500 mt-2">{t('settings.delayNote')}</p>
          </Card>
        </div>

        {/* Live preview of the shop with these colours */}
        <div className="lg:sticky lg:top-20 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">{t('branding.preview')}</p>
          <div
            className="rounded-xl border border-surface-border overflow-hidden shadow-sm text-[13px]"
            style={{ backgroundColor: bg }}
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b" style={{ borderColor: shade.border }}>
              {logo ? (
                <img src={logo} alt="" className="h-8 w-auto max-w-28 object-contain" />
              ) : (
                <span className="font-extrabold" style={{ color: d }}>IT Mart</span>
              )}
              <div
                className="flex-1 flex items-center gap-2 rounded-full border px-3 h-8 text-[#a6acc4]"
                style={{ backgroundColor: shade.surface, borderColor: shade.border }}
              >
                <Search size={13} /> {t('branding.previewSearch')}
              </div>
              <ShoppingCart size={18} style={{ color: d }} />
            </div>
            <div className="p-4">
              <div className="rounded-lg p-4 mb-4 text-white" style={{ backgroundColor: d }}>
                <p className="font-bold text-base mb-1">{t('branding.previewBanner')}</p>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: p }}>
                  {t('branding.previewShop')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-lg border overflow-hidden bg-white" style={{ borderColor: shade.border }}>
                    <div className="relative aspect-[4/3]" style={{ backgroundColor: shade.surface }}>
                      {i === 0 && (
                        <span className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: p }}>
                          -15%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-[#161b26] mb-1">{t('branding.previewProduct')}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold" style={{ color: shade.p600 }}>25 000 FCFA</span>
                        <span className="h-7 w-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: d }}>
                          <ShoppingCart size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-4 w-full rounded-full py-2.5 font-semibold text-white" style={{ backgroundColor: d }}>
                {t('branding.previewBuy')}
              </button>
              <p className="mt-3 rounded-md px-3 py-2 text-xs" style={{ backgroundColor: shade.p50, color: shade.p600 }}>
                {t('branding.previewNote')}
              </p>
            </div>
            <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: shade.d950 }}>
              {logo ? (
                <span className="inline-flex rounded-lg bg-white px-2 py-1">
                  <img src={logo} alt="" className="h-6 w-auto max-w-24 object-contain" />
                </span>
              ) : (
                <span className="font-extrabold text-white">IT Mart</span>
              )}
              <span className="text-white/60 text-xs">{t('branding.previewFooter')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
