const LABELS = {
  pending: 'Pago pendiente',
  approved: 'Pago aprobado',
  rejected: 'Pago rechazado',
  refunded: 'Reintegrado',
  cancelled: 'Pago cancelado',
};

export default function PaymentStatusBadge({ status }) {
  return (
    <span className={`badge badge--payment badge--${status || 'unknown'}`}>
      {LABELS[status] || status || 'Sin estado'}
    </span>
  );
}