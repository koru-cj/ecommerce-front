const LABELS = {
  pending_payment: 'Pendiente de pago',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  manual_review: 'Revisión manual',
  payment_failed: 'Pago fallido',
  paid: 'Pagado',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`badge badge--order badge--${status || 'unknown'}`}>
      {LABELS[status] || status || 'Sin estado'}
    </span>
  );
}