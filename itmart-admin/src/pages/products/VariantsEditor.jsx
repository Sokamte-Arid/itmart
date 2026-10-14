import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Wand2, X, Layers } from 'lucide-react';
import { API_ORIGIN } from '../../api/client';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';

// One row = one sellable version of the product (a colour and/or a size)
// with its own stock. Rows are plain objects:
// { key, id?, colorName, colorHex, size, sku, stock, imageId }
let keySeed = 0;
export const newVariantKey = () => `v${Date.now().toString(36)}${(keySeed++).toString(36)}`;

export const emptyVariant = (extra = {}) => ({
  key: newVariantKey(),
  colorName: '',
  colorHex: '#000000',
  size: '',
  sku: '',
  stock: '0',
  imageId: '',
  ...extra,
});

const sameColor = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function VariantsEditor({ variants, onChange, sizeLabel, onSizeLabelChange, images }) {
  const { t } = useTranslation();
  const [quickColors, setQuickColors] = useState([]); // [{ name, hex }]
  const [quickColorName, setQuickColorName] = useState('');
  const [quickColorHex, setQuickColorHex] = useState('#000000');
  const [quickSizes, setQuickSizes] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  const total = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const sizeWord = sizeLabel?.trim() || t('variants.sizeDefault');

  const update = (key, field, value) => {
    const row = variants.find((v) => v.key === key);
    onChange(
      variants.map((v) => {
        if (v.key === key) return { ...v, [field]: value };
        // The swatch colour and the photo belong to the colour: change them on
        // every row of that colour at once (Noir / 40, Noir / 41, Noir / 42...).
        if ((field === 'colorHex' || field === 'imageId') && row.colorName && sameColor(v.colorName, row.colorName)) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  const remove = (key) => onChange(variants.filter((v) => v.key !== key));

  const addRow = () => {
    // Pre-fill with the last row's colour, the usual next step is another size
    const last = variants[variants.length - 1];
    onChange([
      ...variants,
      emptyVariant(last ? { colorName: last.colorName, colorHex: last.colorHex, imageId: last.imageId } : {}),
    ]);
  };

  const addQuickColor = () => {
    const name = quickColorName.trim();
    if (!name || quickColors.some((c) => sameColor(c.name, name))) return;
    setQuickColors([...quickColors, { name, hex: quickColorHex }]);
    setQuickColorName('');
  };

  // Every colour × every size, skipping the combinations already in the list
  const generate = () => {
    const sizes = [...new Set(quickSizes.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean))];
    const colors = quickColors.length ? quickColors : [{ name: '', hex: '#000000' }];
    const sizeList = sizes.length ? sizes : [''];
    const exists = (c, s) =>
      variants.some((v) => sameColor(v.colorName, c) && v.size.trim().toLowerCase() === s.toLowerCase());

    const added = [];
    colors.forEach((c) =>
      sizeList.forEach((s) => {
        if (!c.name && !s) return;
        if (exists(c.name, s)) return;
        const sameColorRow = variants.find((v) => c.name && sameColor(v.colorName, c.name));
        added.push(emptyVariant({ colorName: c.name, colorHex: c.hex, size: s, imageId: sameColorRow?.imageId || '' }));
      })
    );
    if (added.length) onChange([...variants, ...added]);
    setQuickColors([]);
    setQuickSizes('');
    setQuickOpen(false);
  };

  const imageLabel = (img, index) => `${t('variants.photo')} ${index + 1}${img.isPrimary ? ' ★' : ''}`;

  return (
    <div>
      <p className="text-xs text-ink-500 mb-4">{t('variants.hint')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-2">
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-800 mb-1.5">{t('variants.sizeLabel')}</label>
          <Input
            value={sizeLabel}
            onChange={(e) => onSizeLabelChange(e.target.value)}
            placeholder={t('variants.sizeLabelPlaceholder')}
            maxLength={30}
          />
          <p className="mt-1 text-xs text-ink-500">{t('variants.sizeLabelHint')}</p>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="space-y-2 mb-3">
          {/* Column titles (wide screens) */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_4.5rem_minmax(0,1.5fr)_minmax(0,1fr)_2rem] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <span>{t('variants.color')}</span>
            <span>{sizeWord}</span>
            <span>{t('common.stock')}</span>
            <span>{t('variants.photo')}</span>
            <span>{t('variants.sku')}</span>
            <span />
          </div>

          {variants.map((v) => {
            const img = images.find((i) => i.id === v.imageId);
            return (
              <div
                key={v.key}
                className="grid grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_4.5rem_minmax(0,1.5fr)_minmax(0,1fr)_2rem] gap-2 items-center rounded-lg border border-surface-border md:border-0 p-2.5 md:p-0"
              >
                <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={v.colorHex || '#000000'}
                    onChange={(e) => update(v.key, 'colorHex', e.target.value)}
                    className="h-9 w-10 rounded-md border border-surface-border cursor-pointer shrink-0 disabled:opacity-30"
                    title={t('variants.swatch')}
                    disabled={!v.colorName.trim()}
                  />
                  <Input
                    value={v.colorName}
                    onChange={(e) => update(v.key, 'colorName', e.target.value)}
                    placeholder={t('variants.colorPlaceholder')}
                    maxLength={40}
                    aria-label={t('variants.color')}
                  />
                  {/* Phones: delete sits on the colour line */}
                  <button
                    type="button"
                    onClick={() => remove(v.key)}
                    className="md:hidden shrink-0 p-2 rounded-md text-ink-400 hover:text-danger-600 hover:bg-danger-100"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div>
                  <span className="md:hidden block text-[11px] font-medium text-ink-500 mb-0.5">{sizeWord}</span>
                  <Input
                    value={v.size}
                    onChange={(e) => update(v.key, 'size', e.target.value)}
                    placeholder={t('variants.sizePlaceholder')}
                    maxLength={30}
                    aria-label={sizeWord}
                  />
                </div>
                <div className="relative">
                  <span className="md:hidden block text-[11px] font-medium text-ink-500 mb-0.5">{t('common.stock')}</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => update(v.key, 'stock', e.target.value)}
                    aria-label={t('common.stock')}
                  />
                </div>
                <div className="col-span-1 flex items-center gap-1.5 min-w-0">
                  {img ? (
                    <img src={`${API_ORIGIN}${img.url}`} alt="" className="h-9 w-9 rounded-md object-cover border border-surface-border shrink-0" />
                  ) : (
                    <span className="h-9 w-9 rounded-md border border-dashed border-surface-border shrink-0" />
                  )}
                  <select
                    value={v.imageId || ''}
                    onChange={(e) => update(v.key, 'imageId', e.target.value)}
                    className="w-full min-w-0 rounded-lg border border-surface-border pl-2 pr-1 py-2 text-sm text-ink-900 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
                    disabled={images.length === 0}
                    aria-label={t('variants.photo')}
                  >
                    <option value="">{images.length ? '—' : t('variants.noPhotos')}</option>
                    {images.map((image, index) => (
                      <option key={image.id} value={image.id}>
                        {imageLabel(image, index)}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  value={v.sku}
                  onChange={(e) => update(v.key, 'sku', e.target.value)}
                  placeholder={`${t('variants.sku')} (${t('variants.skuPlaceholder').toLowerCase()})`}
                  maxLength={60}
                  aria-label={t('variants.sku')}
                />
                <button
                  type="button"
                  onClick={() => remove(v.key)}
                  className="hidden md:block justify-self-center p-2 rounded-md text-ink-400 hover:text-danger-600 hover:bg-danger-100"
                  title={t('common.delete')}
                  aria-label={t('common.delete')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {variants.length === 0 && !quickOpen && (
        <div className="rounded-lg border border-dashed border-surface-border p-4 mb-3 text-sm text-ink-500 flex items-center gap-3">
          <Layers size={18} className="text-ink-300 shrink-0" />
          {t('variants.none')}
        </div>
      )}

      {quickOpen && (
        <div className="rounded-lg bg-surface border border-surface-border p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-900">{t('variants.quickTitle')}</p>
            <button type="button" onClick={() => setQuickOpen(false)} className="p-1 text-ink-400 hover:text-ink-900" aria-label={t('common.cancel')}>
              <X size={16} />
            </button>
          </div>

          <label className="block text-xs font-medium text-ink-700 mb-1">{t('variants.quickColors')}</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={quickColorHex}
              onChange={(e) => setQuickColorHex(e.target.value)}
              className="h-9 w-10 rounded-md border border-surface-border cursor-pointer shrink-0"
              title={t('variants.swatch')}
            />
            <Input
              value={quickColorName}
              onChange={(e) => setQuickColorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addQuickColor();
                }
              }}
              placeholder={t('variants.colorPlaceholder')}
              maxLength={40}
            />
            <Button type="button" variant="secondary" onClick={addQuickColor} icon={Plus} className="shrink-0">
              <span className="hidden sm:inline">{t('variants.addColor')}</span>
            </Button>
          </div>
          {quickColors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickColors.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-surface-border pl-1.5 pr-1 py-0.5 text-xs">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  {c.name}
                  <button
                    type="button"
                    onClick={() => setQuickColors(quickColors.filter((x) => x !== c))}
                    className="p-0.5 text-ink-400 hover:text-danger-600"
                    aria-label={t('common.delete')}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <label className="block text-xs font-medium text-ink-700 mb-1 mt-3">
            {t('variants.quickSizes', { label: sizeWord })}
          </label>
          <Input value={quickSizes} onChange={(e) => setQuickSizes(e.target.value)} placeholder={t('variants.quickSizesPlaceholder')} />
          <p className="mt-1 text-xs text-ink-500 mb-3">{t('variants.quickHint')}</p>

          <Button type="button" onClick={generate} icon={Wand2} disabled={!quickColors.length && !quickSizes.trim()}>
            {t('variants.generate')}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addRow}>
          {t('variants.addOne')}
        </Button>
        {!quickOpen && (
          <Button type="button" variant="secondary" size="sm" icon={Wand2} onClick={() => setQuickOpen(true)}>
            {t('variants.quickAdd')}
          </Button>
        )}
        {variants.length > 0 && (
          <span className="ml-auto text-sm text-ink-700">
            {t('variants.total')}: <strong className="text-ink-900">{total}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
