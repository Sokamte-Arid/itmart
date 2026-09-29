import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Star, Trash2, ImageOff } from 'lucide-react';
import * as productsApi from '../../api/products';
import * as categoriesApi from '../../api/categories';
import * as brandsApi from '../../api/brands';
import RelatedProductsPicker from './RelatedProductsPicker';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

const emptyForm = {
  sku: '',
  categoryId: '',
  brandId: '',
  groupName: '',
  nameEn: '',
  nameFr: '',
  descriptionEn: '',
  descriptionFr: '',
  price: '',
  costPrice: '',
  discountPrice: '',
  stock: '0',
  isBestSeller: false,
  isActive: true,
};

export default function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  // Each entry is either a plain string value (TEXT/NUMBER/SELECT/BOOLEAN
  // attributes) or { value, hexValue } for COLOR attributes.
  const [attributeValues, setAttributeValues] = useState({});
  const [images, setImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState(isEdit ? id : null);
  const [uploading, setUploading] = useState(false);

  // Categories arrive as top-level records with nested `children` — flatten
  // so a product can be matched to (and assigned into) a subcategory too,
  // not just a top-level category.
  const allCategoriesFlat = categories.flatMap((c) => [c, ...(c.children || [])]);
  const selectedCategory = allCategoriesFlat.find((c) => c.id === form.categoryId);

  // The price the customer actually pays: the promotional price when one is
  // set, otherwise the normal price. Margin must be calculated from this,
  // not always from the normal price, or it would be wrong for any product
  // currently on sale.
  const effectivePrice = form.discountPrice ? Number(form.discountPrice) : Number(form.price);

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.data));
    brandsApi.getBrands().then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productsApi.getProductById(id).then((res) => {
      const p = res.data;
      setForm({
        sku: p.sku,
        categoryId: p.categoryId,
        brandId: p.brandId || '',
        groupName: p.group?.nameEn || '',
        nameEn: p.nameEn,
        nameFr: p.nameFr,
        descriptionEn: p.descriptionEn || '',
        descriptionFr: p.descriptionFr || '',
        price: String(p.price),
        discountPrice: p.discountPrice ? String(p.discountPrice) : '',
        costPrice: p.costPrice ? String(p.costPrice) : '',
        stock: String(p.stock),
        isBestSeller: p.isBestSeller,
        isActive: p.isActive,
      });
      const attrMap = {};
      p.attributeValues.forEach((av) => {
        if (av.attribute?.type === 'COLOR') {
          attrMap[av.attributeId] = { value: av.value, hexValue: av.hexValue || '#000000' };
        } else {
          attrMap[av.attributeId] = av.value;
        }
      });
      setAttributeValues(attrMap);
      setImages(p.images || []);
      productsApi.getRelatedProducts(id).then((res) => setRelatedProducts(res.data));
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        stock: Number(form.stock),
        brandId: form.brandId || null,
      };

      let savedId = productId;
      if (isEdit) {
        await productsApi.updateProduct(id, payload);
      } else {
        const res = await productsApi.createProduct(payload);
        savedId = res.data.id;
        setProductId(savedId);
      }

      // Save attribute values (specs) if the category has filterable attributes.
      // COLOR attributes are stored as { value, hexValue } objects locally —
      // everything else stays a plain string.
      const attrPayload = Object.entries(attributeValues)
        .filter(([, v]) => {
          if (v && typeof v === 'object') return v.value !== '' && v.value !== undefined;
          return v !== '' && v !== undefined;
        })
        .map(([attributeId, v]) => {
          if (v && typeof v === 'object') {
            return { attributeId, value: v.value, hexValue: v.hexValue || null };
          }
          return { attributeId, value: v };
        });
      if (selectedCategory?.attributes?.length) {
        await productsApi.setProductAttributes(savedId, attrPayload);
      }

      await productsApi.setRelatedProducts(
        savedId,
        relatedProducts.map((p) => p.id)
      );

      showToast(t('common.saveChanges') + ' ✓');
      if (!isEdit) {
        navigate(`/products/${savedId}`, { replace: true });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!productId) {
      showToast('Save the product first before adding images.', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await productsApi.uploadProductImages(productId, files);
      setImages((prev) => [...prev, ...res.data]);
      showToast(t('products.uploadImages') + ' ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await productsApi.deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await productsApi.setPrimaryImage(imageId);
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  if (loading) {
    return <p className="text-ink-500">{t('common.loading')}</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={15} /> {t('common.back')}
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">{t('products.title')}</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label={t('common.nameEn')} required>
                <Input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </Field>
              <Field label={t('common.nameFr')} required>
                <Input required value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label={t('common.descriptionEn')}>
                <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
              </Field>
              <Field label={t('common.descriptionFr')}>
                <Textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} />
              </Field>
            </div>
          </Card>

          {selectedCategory?.attributes?.length > 0 && (
            <Card>
              <h2 className="font-semibold text-ink-900 mb-4">{t('products.specifications')}</h2>
              <div className="grid grid-cols-2 gap-x-4">
                {selectedCategory.attributes.map((attr) => {
                  if (attr.type === 'COLOR') {
                    const current = attributeValues[attr.id] || { value: '', hexValue: '#000000' };
                    return (
                      <Field key={attr.id} label={attr.nameEn} hint="Pick the swatch color and give it a name (e.g. Orange).">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={current.hexValue || '#000000'}
                            onChange={(e) =>
                              setAttributeValues((prev) => ({
                                ...prev,
                                [attr.id]: { ...current, hexValue: e.target.value },
                              }))
                            }
                            className="h-10 w-12 rounded-md border border-surface-border cursor-pointer shrink-0"
                            title="Color swatch"
                          />
                          <Input
                            value={current.value || ''}
                            onChange={(e) =>
                              setAttributeValues((prev) => ({
                                ...prev,
                                [attr.id]: { ...current, value: e.target.value },
                              }))
                            }
                            placeholder="e.g. Orange"
                          />
                        </div>
                      </Field>
                    );
                  }
                  return (
                    <Field key={attr.id} label={`${attr.nameEn}${attr.unit ? ` (${attr.unit})` : ''}`}>
                      <Input
                        value={attributeValues[attr.id] || ''}
                        onChange={(e) =>
                          setAttributeValues((prev) => ({ ...prev, [attr.id]: e.target.value }))
                        }
                      />
                    </Field>
                  );
                })}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">{t('common.images')}</h2>
            {!productId && (
              <p className="text-sm text-ink-500 mb-3">Save the product first, then add images.</p>
            )}
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={`${API_ORIGIN}${img.url}`}
                    alt=""
                    className={`h-24 w-24 object-cover rounded-lg border-2 ${
                      img.isPrimary ? 'border-accent-500' : 'border-surface-border'
                    }`}
                  />
                  <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="p-1.5 bg-white rounded-md hover:bg-accent-100"
                      title={t('products.setPrimary')}
                    >
                      <Star size={14} className={img.isPrimary ? 'fill-accent-500 text-accent-500' : 'text-ink-700'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 bg-white rounded-md hover:bg-danger-100"
                      title={t('common.delete')}
                    >
                      <Trash2 size={14} className="text-danger-600" />
                    </button>
                  </div>
                  {img.isPrimary && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-ink-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {t('products.primaryImage')}
                    </span>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="h-24 w-24 rounded-lg bg-surface border border-dashed border-surface-border flex items-center justify-center text-ink-300">
                  <ImageOff size={20} />
                </div>
              )}
            </div>
            <label
              className={`flex items-center justify-center gap-2 border-2 border-dashed border-surface-border rounded-lg py-4 text-sm text-ink-500 cursor-pointer hover:border-accent-500 hover:text-accent-600 transition-colors ${
                !productId ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload size={16} />
              {uploading ? t('common.loading') : t('products.dragImages')}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!productId} />
            </label>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900 mb-1">{t('products.relatedProducts')}</h2>
            <p className="text-xs text-ink-500 mb-4">{t('products.relatedProductsHint')}</p>
            <RelatedProductsPicker
              productId={productId}
              selected={relatedProducts}
              onChange={setRelatedProducts}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">Pricing & inventory</h2>
            <Field label={t('common.sku')} hint={!isEdit ? t('products.skuHint') : undefined}>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={isEdit} placeholder={!isEdit ? t('products.skuPlaceholder') : ''} />
            </Field>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label={t('common.price')} required>
                <Input
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Field>
              <Field label={t('common.discountPrice')} hint={t('products.discountPriceHint')}>
                <Input
                  type="number"
                  min="0"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                />
              </Field>
            </div>
            <Field label={t('common.costPrice')} hint={t('products.costPriceHint')}>
              <Input
                type="number"
                min="0"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              />
            </Field>
            {!!effectivePrice && form.costPrice && (
              <p className="text-xs text-ink-500 -mt-2 mb-4">
                {t('products.margin')}:{' '}
                <span className="font-medium text-ink-800">
                  {(effectivePrice - Number(form.costPrice)).toLocaleString('fr-FR')} FCFA (
                  {Math.round(((effectivePrice - Number(form.costPrice)) / effectivePrice) * 100)}%)
                </span>
                {form.discountPrice && (
                  <span className="text-ink-400"> — {t('products.marginBasedOnDiscount')}</span>
                )}
              </p>
            )}
            <Field label={t('common.stock')} required>
              <Input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="isBestSeller"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="rounded border-surface-border text-accent-500 focus:ring-accent-500"
              />
              <label htmlFor="isBestSeller" className="text-sm text-ink-800">
                {t('products.bestSeller')}
              </label>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-surface-border text-accent-500 focus:ring-accent-500"
              />
              <label htmlFor="isActive" className="text-sm text-ink-800">
                {t('products.active')}
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900 mb-4">Organization</h2>
            <Field label={t('common.category')} required>
              <Select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <Fragment key={c.id}>
                    <option value={c.id}>{c.nameEn}</option>
                    {c.children?.length > 0 && (
                      <optgroup label={c.nameEn}>
                        {c.children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.nameEn}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Fragment>
                ))}
              </Select>
            </Field>
            <Field label={t('common.brand')}>
              <Select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={t('products.variantOf')}
              hint="Type the same model name on multiple products (e.g. different RAM/storage, or different colors) to group them as variants."
            >
              <Input
                value={form.groupName}
                onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                placeholder="e.g. HP EliteBook 840"
              />
            </Field>
          </Card>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? t('common.loading') : t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}