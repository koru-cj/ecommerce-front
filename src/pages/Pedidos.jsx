import OrdersList from '../components/Orders/OrderList';
import { getMyOrders } from '../lib/apiClient';

export default function Pedidos() {
  return (
    <OrdersList
      title="Mis pedidos"
      fetchOrders={getMyOrders}
      emptyMessage="Todavía no tenés pedidos realizados."
    />
  );
}   