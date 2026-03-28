import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-AR');
}

export default function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-card__top">
        <div>
          <h3>Pedido #{order.id}</h3>
          <p>{formatDate(order.created_at)}</p>
        </div>

        <div className="order-card__badges">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="order-card__body">
        <p><strong>Total:</strong> {formatPrice(order.total)}</p>
        <p><strong>Canal:</strong> {order.channel}</p>
        <p><strong>Ítems:</strong> {order.items_count}</p>
      </div>

      <div className="order-card__footer">
        <Link to={`/pedidos/${order.id}`}>Ver detalle</Link>
      </div>
    </article>
  );
}