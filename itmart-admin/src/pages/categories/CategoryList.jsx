import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Tag, CornerDownRight, ArrowUp, ArrowDown } from 'lucide-react';
import * as categoriesApi from '../../api/categories';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CategoryFormModal from './CategoryFormModal';
import AttributeFormModal from './AttributeFormModal';
import { useToast } from '../../components/ui/Toast';

export default function CategoryList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attrFormOpen, setAttrFormOpen] = useState(false);
  const [attrCategoryId, setAttrCategoryId] = useState(null);
  const [deleteAttrTarget, setDeleteAttrTarget] = useState(null);

  const load = () => {
    setLoading(true);
    categoriesApi
      .getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await categoriesApi.deleteCategory(deleteTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  // Moves a characteristic up (-1) or down (+1) and saves the new order.
  // The list updates instantly; it's reloaded from the server if saving fails.
  const moveAttribute = async (cat, index, direction) => {
    const attrs = [...(cat.attributes || [])];
    const target = index + direction;
    if (target < 0 || target >= attrs.length) return;
    [attrs[index], attrs[target]] = [attrs[target], attrs[index]];

    const withNewOrder = (list) =>
      list.map((c) =>
        c.id === cat.id
          ? { ...c, attributes: attrs }
          : { ...c, children: c.children ? withNewOrder(c.children) : c.children }
      );
    setCategories((prev) => withNewOrder(prev));

    try {
      await categoriesApi.reorderAttributes(cat.id, attrs.map((a) => a.id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
      load();
    }
  };

  const handleDeleteAttribute = async () => {
    try {
      await categoriesApi.deleteAttribute(deleteAttrTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteAttrTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  // Shared row renderer for both top-level categories and their subcategories.
  // `depth` just controls the left indent + icon so subcategories are visually nested.
  const indent = (depth) =>
    depth > 0 ? { paddingLeft: `calc(var(--row-pad) + ${depth} * var(--row-indent))` } : undefined;

  const renderCategoryRow = (cat, depth = 0) => (
    <div key={cat.id}>
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 [--row-pad:0.75rem] sm:[--row-pad:1.25rem] [--row-indent:1rem] sm:[--row-indent:1.75rem]"
        style={indent(depth)}
      >
        {depth > 0 && <CornerDownRight size={14} className="text-ink-300 shrink-0" />}
        {cat.image ? (
          <img
            src={`${API_ORIGIN}${cat.image}`}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-cover border border-surface-border"
          />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
            <Tag size={16} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink-900 leading-snug line-clamp-2 sm:truncate break-words">
            {cat.nameEn} <span className="text-ink-500 font-normal">/ {cat.nameFr}</span>
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            {cat.attributes?.length || 0} {t('categories.attributes').toLowerCase()}
          </p>
        </div>
        <button
          onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
          className={`shrink-0 text-sm flex items-center gap-1 rounded-lg p-2 sm:px-2 sm:py-1 ${
            expanded === cat.id ? 'text-ink-900 bg-surface' : 'text-ink-500 hover:text-ink-900'
          }`}
          aria-expanded={expanded === cat.id}
          aria-label={t('categories.attributes')}
          title={t('categories.attributes')}
        >
          <span className="hidden sm:inline">{t('categories.attributes')}</span>
          {expanded === cat.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <Button
          size="sm"
          variant="ghost"
          icon={Pencil}
          className="shrink-0 px-2 sm:px-3"
          aria-label={t('common.edit')}
          onClick={() => {
            setEditing(cat);
            setFormOpen(true);
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          icon={Trash2}
          className="shrink-0 px-2 sm:px-3 text-danger-600 hover:bg-danger-100/50"
          aria-label={t('common.delete')}
          onClick={() => setDeleteTarget(cat)}
        />
      </div>

      {expanded === cat.id && (
        <div
          className="bg-surface px-3 sm:px-5 py-4 border-t border-surface-border [--row-pad:0.75rem] sm:[--row-pad:1.25rem] [--row-indent:1rem] sm:[--row-indent:1.75rem]"
          style={indent(depth)}
        >
          {cat.attributes?.length > 0 && (
            <p className="text-xs text-ink-500 mb-2">{t('categories.orderHint')}</p>
          )}
          <ol className="mb-3 bg-white rounded-lg border border-surface-border divide-y divide-surface-border max-w-xl">
            {cat.attributes?.map((attr, index) => (
              <li key={attr.id} className="flex items-center gap-2 pl-3 pr-1 py-1.5 text-sm">
                <span className="w-5 shrink-0 text-xs text-ink-500 font-mono-data">{index + 1}</span>
                <span className="flex-1 min-w-0 truncate text-ink-800">
                  {attr.nameFr || attr.nameEn}
                  {attr.unit ? <span className="text-ink-500"> ({attr.unit})</span> : null}
                </span>
                <button
                  onClick={() => moveAttribute(cat, index, -1)}
                  disabled={index === 0}
                  className="p-1.5 rounded-md text-ink-500 hover:bg-surface hover:text-ink-900 disabled:opacity-25 disabled:hover:bg-transparent"
                  aria-label={t('categories.moveUp')}
                  title={t('categories.moveUp')}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => moveAttribute(cat, index, 1)}
                  disabled={index === cat.attributes.length - 1}
                  className="p-1.5 rounded-md text-ink-500 hover:bg-surface hover:text-ink-900 disabled:opacity-25 disabled:hover:bg-transparent"
                  aria-label={t('categories.moveDown')}
                  title={t('categories.moveDown')}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  onClick={() => setDeleteAttrTarget(attr)}
                  className="p-1.5 rounded-md text-ink-500 hover:bg-danger-100/50 hover:text-danger-600"
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {(!cat.attributes || cat.attributes.length === 0) && (
              <li className="px-3 py-2 text-sm text-ink-500">{t('common.noResults')}</li>
            )}
          </ol>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => {
              setAttrCategoryId(cat.id);
              setAttrFormOpen(true);
            }}
          >
            {t('categories.addAttribute')}
          </Button>
        </div>
      )}

      {/* Render this category's own subcategories, recursively, right under it */}
      {cat.children?.map((child) => renderCategoryRow(child, depth + 1))}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div />
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('categories.addCategory')}
        </Button>
      </div>

      <Card padded={false}>
        <div className="divide-y divide-surface-border">
          {categories.map((cat) => renderCategoryRow(cat, 0))}
          {!loading && categories.length === 0 && (
            <p className="px-5 py-10 text-center text-ink-500">{t('common.noResults')}</p>
          )}
        </div>
      </Card>

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        categories={categories}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <AttributeFormModal
        open={attrFormOpen}
        onClose={() => setAttrFormOpen(false)}
        categoryId={attrCategoryId}
        onSaved={() => {
          setAttrFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        body={t('common.confirmDeleteBody')}
      />
      <ConfirmDialog
        open={!!deleteAttrTarget}
        onClose={() => setDeleteAttrTarget(null)}
        onConfirm={handleDeleteAttribute}
        body={t('common.confirmDeleteBody')}
      />
    </div>
  );
}