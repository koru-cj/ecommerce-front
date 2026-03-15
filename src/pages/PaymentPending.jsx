import { Link, useLocation } from 'react-router-dom';
import './styles/PaymentStatus.css';

export default function PaymentPending() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const paymentId = params.get('payment_id');
  const status = params.get('status');
  const merchantOrderId = params.get('merchant_order_id');
  const preferenceId = params.get('preference_id');

  return (
    <div className="payment-status-page">
      <div className="payment-status-card pending">
        <div className="payment-status-icon">⏳</div>
        <h1>Pago pendiente</h1>
        <p>
          Tu pago está pendiente de confirmación. Apenas Mercado Pago lo confirme,
          tu orden se actualizará automáticamente.
        </p>

        <div className="payment-status-meta">
          {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
          {status && <p><strong>Estado:</strong> {status}</p>}
          {merchantOrderId && <p><strong>Merchant Order:</strong> {merchantOrderId}</p>}
          {preferenceId && <p><strong>Preference ID:</strong> {preferenceId}</p>}
        </div>

        <div className="payment-status-actions">
          <Link to="/orders" className="payment-btn primary">
            Ver mis órdenes
          </Link>
          <Link to="/" className="payment-btn secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
