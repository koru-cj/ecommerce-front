const LABELS = {
  pending: 'Pago pendiente',
  paid: 'Pago aprobado',
  failed: 'Pago fallido',
  refunded: 'Reintegrado',
  chargeback: 'Chargeback',
};

export default function PaymentStatusBadge({ status }) {
  return (
    <span className={`badge badge--payment badge--${status || 'unknown'}`}>
      {LABELS[status] || status || 'Sin estado'}
    </span>
  );
}