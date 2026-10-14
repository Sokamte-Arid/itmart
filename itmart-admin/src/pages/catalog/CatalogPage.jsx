import { Navigate, useParams } from 'react-router-dom';
import { Package, FolderTree, Tags } from 'lucide-react';
import PageTabs from '../../components/ui/PageTabs';
import ProductList from '../products/ProductList';
import CategoryList from '../categories/CategoryList';
import BrandList from '../brands/BrandList';

// "Catalogue": Produits / Catégories / Marques. Editing a product still
// opens its own page (/products/:id).
const TABS = [
  { key: 'products', labelKey: 'nav.products', icon: Package, Component: ProductList },
  { key: 'categories', labelKey: 'nav.categories', icon: FolderTree, Component: CategoryList },
  { key: 'brands', labelKey: 'nav.brands', icon: Tags, Component: BrandList },
];

export default function CatalogPage() {
  const { tab } = useParams();
  const current = TABS.find((x) => x.key === tab);
  if (!current) return <Navigate to="/catalog/products" replace />;
  const { Component } = current;

  return (
    <div>
      <PageTabs tabs={TABS.map(({ key, labelKey, icon }) => ({ to: `/catalog/${key}`, labelKey, icon }))} />
      <Component key={current.key} />
    </div>
  );
}
