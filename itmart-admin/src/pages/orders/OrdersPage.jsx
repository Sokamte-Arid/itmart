import { Navigate, useParams } from 'react-router-dom';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import PageTabs from '../../components/ui/PageTabs';
import OrderList from './OrderList';
import AbandonedCarts from './AbandonedCarts';

// "Commandes": the orders, and the carts customers left at checkout.
// /orders keeps working as before (links from notifications: /orders?open=…).
export default function OrdersPage() {
  const { tab } = useParams();
  if (tab && tab !== 'abandoned') return <Navigate to="/orders" replace />;

  return (
    <div>
      <PageTabs
        tabs={[
          { to: '/orders', labelKey: 'orders.tabOrders', icon: ShoppingBag, end: true },
          { to: '/orders/abandoned', labelKey: 'abandoned.tab', icon: ShoppingCart },
        ]}
      />
      {tab === 'abandoned' ? <AbandonedCarts /> : <OrderList />}
    </div>
  );
}
