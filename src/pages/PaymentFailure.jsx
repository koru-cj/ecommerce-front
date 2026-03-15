import { Link, useLocation } from 'react-router-dom';
import './styles/PaymentStatus.css';

export default function PaymentFailure() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const paymentId = params.get('payment_id');
  const status = params.get('status');
  const merchantOrderId = params.get('merchant_order_id');
  const preferenceId = params.get('preference_id');

  return (
    <div className="payment-status-page">
      <div className="payment-status-card failure">
        <div className="payment-status-icon">❌</div>
        <h1>No se pudo completar el pago</h1>
        <p>
          El pago fue rechazado o no pudo procesarse. Podés volver a intentarlo
          desde el checkout.
        </p>

        <div className="payment-status-meta">
          {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
          {status && <p><strong>Estado:</strong> {status}</p>}
          {merchantOrderId && <p><strong>Merchant Order:</strong> {merchantOrderId}</p>}
          {preferenceId && <p><strong>Preference ID:</strong> {preferenceId}</p>}
        </div>

        <div className="payment-status-actions">
          <Link to="/checkout" className="payment-btn primary">
            Reintentar compra
          </Link>
          <Link to="/cart" className="payment-btn secondary">
            Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
