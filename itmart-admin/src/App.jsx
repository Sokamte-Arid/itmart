import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import CategoryList from './pages/categories/CategoryList';
import BrandList from './pages/brands/BrandList';
import OrderList from './pages/orders/OrderList';
import BannerList from './pages/banners/BannerList';
import AdminsList from './pages/admins/AdminsList';
import Analytics from './pages/analytics/Analytics';
import DeliveryZoneList from './pages/delivery-zones/DeliveryZoneList';

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
        path: 'products',
        element: <ProductList />,
        handle: { titleKey: 'products.title', subtitleKey: 'products.subtitle' },
      },
      {
        path: 'products/:id',
        element: <ProductForm />,
        handle: { titleKey: 'products.title' },
      },
      {
        path: 'categories',
        element: <CategoryList />,
        handle: { titleKey: 'categories.title', subtitleKey: 'categories.subtitle' },
      },
      {
        path: 'brands',
        element: <BrandList />,
        handle: { titleKey: 'brands.title', subtitleKey: 'brands.subtitle' },
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
        path: 'orders',
        element: <OrderList />,
        handle: { titleKey: 'orders.title', subtitleKey: 'orders.subtitle' },
      },
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
