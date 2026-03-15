import { Link, useLocation } from 'react-router-dom';
import './styles/PaymentStatus.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const paymentId = params.get('payment_id');
  const status = params.get('status');
  const merchantOrderId = params.get('merchant_order_id');
  const preferenceId = params.get('preference_id');

  return (
    <div className="payment-status-page">
      <div className="payment-status-card success">
        <div className="payment-status-icon">✅</div>
        <h1>Pago aprobado</h1>
        <p>
          Tu pago fue procesado correctamente. Estamos confirmando los detalles de tu orden.
        </p>

        <div className="payment-status-meta">
          {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
          {status && <p><strong>Estado:</strong> {status}</p>}
          {merchantOrderId && <p><strong>Merchant Order:</strong> {merchantOrderId}</p>}
          {preferenceId && <p><strong>Preference ID:</strong> {preferenceId}</p>}
        </div>

        <div className="payment-status-actions">
          <Link to="/profile" className="payment-btn primary">
            Ver mi cuenta
          </Link>
          <Link to="/orders" className="payment-btn secondary">
            Ver mis órdenes
          </Link>
        </div>
      </div>
    </div>
  );
}
