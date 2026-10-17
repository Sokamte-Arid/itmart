import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/products/ProductForm';
import CatalogPage from './pages/catalog/CatalogPage';
import OrdersPage from './pages/orders/OrdersPage';
import BannerList from './pages/banners/BannerList';
import AdminsList from './pages/admins/AdminsList';
import Analytics from './pages/analytics/Analytics';
import DeliveryZoneList from './pages/delivery-zones/DeliveryZoneList';
import SettingsPage from './pages/settings/SettingsPage';

// Route "handle" carries translation KEYS, not translated strings — the
// router is created once (module scope), so AdminLayout/Topbar translate
// these at render time via useTranslation, which also makes the page
// title update live when the language is switched.
const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { titleKey: 'dashboard.title', subtitleKey: 'dashboard.subtitle' },
      },
      {
        path: 'analytics',
        element: <Analytics />,
        handle: { titleKey: 'nav.analytics', subtitleKey: 'analytics.subtitle' },
      },
      {
        // Produits / Catégories / Marques, as tabs
        path: 'catalog/:tab?',
        element: <CatalogPage />,
        handle: { titleKey: 'nav.catalog', subtitleKey: 'catalog.subtitle' },
      },
      // Old addresses (the product edit page stays at /products/:id)
      { path: 'products', element: <Navigate to="/catalog/products" replace /> },
      { path: 'categories', element: <Navigate to="/catalog/categories" replace /> },
      { path: 'brands', element: <Navigate to="/catalog/brands" replace /> },
      {
        path: 'products/:id',
        element: <ProductForm />,
        handle: { titleKey: 'products.title' },
      },
      {
        path: 'banners',
        element: <BannerList />,
        handle: { titleKey: 'nav.banners', subtitleKey: 'banners.subtitle' },
      },
      {
        path: 'delivery-zones',
        element: <DeliveryZoneList />,
        handle: { titleKey: 'nav.deliveryZones', subtitleKey: 'deliveryZones.subtitle' },
      },
      {
        // Commandes / Paniers abandonnés, as tabs
        path: 'orders/:tab?',
        element: <OrdersPage />,
        handle: { titleKey: 'orders.title', subtitleKey: 'orders.subtitle' },
      },
      {
        // Boutique & contact / Identité visuelle / Suivi & publicité, as tabs
        path: 'settings/:tab?',
        element: <SettingsPage />,
        handle: { titleKey: 'nav.settings', subtitleKey: 'settings.hubSubtitle' },
      },
      // Old addresses of the three pages
      { path: 'store', element: <Navigate to="/settings/store" replace /> },
      { path: 'branding', element: <Navigate to="/settings/branding" replace /> },
      {
        path: 'admins',
        element: <AdminsList />,
        handle: { titleKey: 'nav.admins', subtitleKey: 'admins.subtitle' },
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
