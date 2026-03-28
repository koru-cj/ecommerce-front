import OrdersList from '../components/orders/OrderList';
import { getTrackingOrders } from '../lib/apiClient';

export default function Seguimiento() {
  return (
    <OrdersList
      title="Seguimiento de pedidos"
      fetchOrders={getTrackingOrders}
      emptyMessage="No tenés pedidos pendientes de pago o entrega."
    />
  );
}