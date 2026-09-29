import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Tag, CornerDownRight } from 'lucide-react';
import * as categoriesApi from '../../api/categories';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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
  const renderCategoryRow = (cat, depth = 0) => (
    <div key={cat.id}>
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={depth > 0 ? { paddingLeft: `${20 + depth * 28}px` } : undefined}
      >
        {depth > 0 && <CornerDownRight size={14} className="text-ink-300 shrink-0" />}
        {cat.image ? (
          <img
            src={`${API_ORIGIN}${cat.image}`}
            alt=""
            className="h-10 w-10 rounded-lg object-cover border border-surface-border"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
            <Tag size={16} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink-900 truncate">
            {cat.nameEn} <span className="text-ink-500 font-normal">/ {cat.nameFr}</span>
          </p>
          <p className="text-xs text-ink-500">{cat.attributes?.length || 0} {t('categories.attributes').toLowerCase()}</p>
        </div>
        <button
          onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
          className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1 px-2 py-1"
        >
          {t('categories.attributes')}
          {expanded === cat.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <Button
          size="sm"
          variant="ghost"
          icon={Pencil}
          onClick={() => {
            setEditing(cat);
            setFormOpen(true);
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          icon={Trash2}
          className="text-danger-600 hover:bg-danger-100/50"
          onClick={() => setDeleteTarget(cat)}
        />
      </div>

      {expanded === cat.id && (
        <div
          className="bg-surface px-5 py-4 border-t border-surface-border"
          style={depth > 0 ? { paddingLeft: `${20 + depth * 28}px` } : undefined}
        >
          <div className="flex flex-wrap gap-2 mb-3">
            {cat.attributes?.map((attr) => (
              <Badge key={attr.id} tone="neutral" className="pr-1">
                <span className="mr-2">
                  {attr.nameEn} {attr.unit ? `(${attr.unit})` : ''}
                </span>
                <button
                  onClick={() => setDeleteAttrTarget(attr)}
                  className="hover:text-danger-600"
                  aria-label="Remove attribute"
                >
                  <Trash2 size={12} />
                </button>
              </Badge>
            ))}
            {(!cat.attributes || cat.attributes.length === 0) && (
              <p className="text-sm text-ink-500">{t('common.noResults')}</p>
            )}
          </div>
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
      <div className="flex items-center justify-between mb-5">
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