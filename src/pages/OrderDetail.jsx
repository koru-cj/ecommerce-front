import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getOrderDetail } from '../lib/apiClient';
import './styles/OrdersDetail.css';

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

function OrderStatusBadge({ status }) {
  const labels = {
    pending_payment: 'Pendiente de pago',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    manual_review: 'Revisión manual',
    payment_failed: 'Pago fallido',
    paid: 'Pagado',
  };

  return (
    <span className={`badge badge--order badge--${status || 'unknown'}`}>
      {labels[status] || status || 'Sin estado'}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const labels = {
    pending: 'Pago pendiente',
    approved: 'Pago aprobado',
    rejected: 'Pago rechazado',
    refunded: 'Reintegrado',
    cancelled: 'Pago cancelado',
  };

  return (
    <span className={`badge badge--payment badge--${status || 'unknown'}`}>
      {labels[status] || status || 'Sin estado'}
    </span>
  );
}


function getOrderProgressInfo(order) {
  const orderStatus = order?.status;
  const paymentStatus = order?.payment_status;

  if (paymentStatus === 'pending' && orderStatus === 'pending_payment') {
    return {
      title: 'Esperando confirmación del pago',
      description:
        'Tu pedido fue creado, pero el pago todavía no fue acreditado. Hasta que eso ocurra, el pedido no entra en preparación.',
      paymentLabel: 'Pendiente',
      orderLabel: 'Esperando pago',
      shippingLabel: 'Aún no iniciado',
      tone: 'warning',
    };
  }

  if (paymentStatus === 'approved' && orderStatus === 'preparing') {
    return {
      title: 'Pago confirmado, pedido en preparación',
      description:
        'El pago ya fue aprobado. Ahora el pedido está siendo preparado y todavía no fue despachado.',
      paymentLabel: 'Aprobado',
      orderLabel: 'Preparando',
      shippingLabel: 'Pendiente de despacho',
      tone: 'info',
    };
  }

  if (paymentStatus === 'approved' && orderStatus === 'shipped') {
    return {
      title: 'Pedido enviado',
      description:
        'El pago está confirmado y el pedido ya fue despachado. En esta etapa debería estar en camino.',
      paymentLabel: 'Aprobado',
      orderLabel: 'Enviado',
      shippingLabel: 'En camino',
      tone: 'info',
    };
  }

  if (paymentStatus === 'approved' && orderStatus === 'delivered') {
    return {
      title: 'Pedido entregado',
      description:
        'El pago fue aprobado y el pedido ya figura como entregado.',
      paymentLabel: 'Aprobado',
      orderLabel: 'Entregado',
      shippingLabel: 'Finalizado',
      tone: 'success',
    };
  }

  if (paymentStatus === 'rejected' || orderStatus === 'payment_failed') {
    return {
      title: 'El pago no se completó',
      description:
        'La orden existe, pero el pago fue rechazado o falló. El pedido no avanzó a preparación ni a envío.',
      paymentLabel: 'Rechazado',
      orderLabel: 'No procesado',
      shippingLabel: 'No iniciado',
      tone: 'danger',
    };
  }

  if (paymentStatus === 'cancelled' && orderStatus === 'payment_failed') {
    return {
      title: 'El pago fue cancelado',
      description:
        'La orden existe, pero el pago fue cancelado antes de completarse. El pedido no avanzó a preparación ni a envío.',
      paymentLabel: 'Cancelado',
      orderLabel: 'No procesado',
      shippingLabel: 'No iniciado',
      tone: 'danger',
    };
  }

  if (orderStatus === 'manual_review') {
    return {
      title: 'Pedido en revisión manual',
      description:
        'La orden necesita intervención manual. Puede ser por stock, validación del pago o alguna inconsistencia operativa.',
      paymentLabel:
        paymentStatus === 'approved'
          ? 'Aprobado'
          : paymentStatus === 'pending'
          ? 'Pendiente'
          : paymentStatus === 'cancelled'
          ? 'Cancelado'
          : paymentStatus || 'En revisión',
      orderLabel: 'Revisión manual',
      shippingLabel: 'Pausado',
      tone: 'warning',
    };
  }

  if (paymentStatus === 'refunded') {
    return {
      title: 'Pago reintegrado',
      description:
        'El pago fue reintegrado y la orden quedó cancelada o cerrada administrativamente.',
      paymentLabel: 'Reintegrado',
      orderLabel: 'Cancelado',
      shippingLabel: 'Sin envío',
      tone: 'muted',
    };
  }

  if (orderStatus === 'cancelled') {
    return {
      title: 'Pedido cancelado',
      description:
        'La orden fue cancelada y ya no seguirá avanzando en el circuito de preparación o entrega.',
      paymentLabel:
        paymentStatus === 'refunded'
          ? 'Reintegrado'
          : paymentStatus === 'cancelled'
          ? 'Cancelado'
          : paymentStatus || '-',
      orderLabel: 'Cancelado',
      shippingLabel: 'Sin envío',
      tone: 'muted',
    };
  }

  return {
    title: 'Estado del pedido',
    description:
      'Este pedido tiene un estado registrado, pero todavía no está clasificado con una explicación más específica.',
    paymentLabel: paymentStatus || '-',
    orderLabel: orderStatus || '-',
    shippingLabel: '-',
    tone: 'default',
  };
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError('');

        const data = await getOrderDetail(id);

        if (!active) return;
        setOrder(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'No se pudo cargar el detalle del pedido.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="order-detail-page container">
        <div className="order-detail__state">
          <p>Cargando detalle del pedido...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="order-detail-page container">
        <div className="order-detail__topbar">
          <button onClick={() => navigate(-1)} className="order-detail__back">
            ← Volver
          </button>
        </div>

        <div className="order-detail__state order-detail__state--error">
          <p>{error}</p>
          <Link to="/pedidos" className="order-detail__action">
            Ir a mis pedidos
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-detail-page container">
        <div className="order-detail__topbar">
          <button onClick={() => navigate(-1)} className="order-detail__back">
            ← Volver
          </button>
        </div>

        <div className="order-detail__state">
          <p>No se encontró la orden.</p>
        </div>
      </section>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const payment = order.payment || {};
  const shippingAddress = order.shipping_address || {};
  const billingInfo = order.billing_info || {};
  const progressInfo = getOrderProgressInfo(order);

  return (
    <section className="order-detail-page container">
      <div className="order-detail__topbar">
        <button onClick={() => navigate(-1)} className="order-detail__back">
          ← Volver
        </button>

        <div className="order-detail__links">
          <Link to="/pedidos">Mis pedidos</Link>
          <Link to="/seguimiento">Seguimiento</Link>
        </div>
      </div>

      <header className="order-detail__header">
        <div>
          <p className="order-detail__eyebrow">Pedido</p>
          <h1>#{order.id}</h1>
          <p className="order-detail__date">
            Creado: {formatDate(order.created_at)}
          </p>
          <p className="order-detail__date">
            Actualizado: {formatDate(order.updated_at)}
          </p>
        </div>

        <div className="order-detail__badges">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </header>

      <section className={`order-progress order-progress--${progressInfo.tone}`}>
        <div className="order-progress__main">
            <p className="order-progress__eyebrow">Estado actual</p>
            <h2>{progressInfo.title}</h2>
            <p>{progressInfo.description}</p>
        </div>

        <div className="order-progress__grid">
            <div className="order-progress__item">
            <span>Pago</span>
            <strong>{progressInfo.paymentLabel}</strong>
            </div>
            <div className="order-progress__item">
            <span>Pedido</span>
            <strong>{progressInfo.orderLabel}</strong>
            </div>
            <div className="order-progress__item">
            <span>Envío</span>
            <strong>{progressInfo.shippingLabel}</strong>
            </div>
        </div>
        </section>
        
      <div className="order-detail__grid">
        <section className="order-detail__card">
          <h2>Resumen</h2>
          <div className="order-detail__rows">
            <div><span>Canal</span><strong>{order.channel || '-'}</strong></div>
            <div><span>Moneda</span><strong>{order.currency || 'ARS'}</strong></div>
            <div><span>Subtotal</span><strong>{formatPrice(order.subtotal)}</strong></div>
            <div><span>Descuento</span><strong>{formatPrice(order.discount)}</strong></div>
            <div><span>Envío</span><strong>{formatPrice(order.shipping_cost)}</strong></div>
            <div><span>Impuestos</span><strong>{formatPrice(order.tax)}</strong></div>
            <div className="order-detail__total">
              <span>Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
        </section>

        <section className="order-detail__card">
          <h2>Pago</h2>
          <div className="order-detail__rows">
            <div><span>Método</span><strong>{payment.method || '-'}</strong></div>
            <div><span>Estado local</span><strong>{payment.status || '-'}</strong></div>
            <div><span>Estado proveedor</span><strong>{payment.provider_status || '-'}</strong></div>
            <div><span>Detalle proveedor</span><strong>{payment.provider_status_detail || '-'}</strong></div>
            <div><span>Referencia proveedor</span><strong>{payment.provider_reference || '-'}</strong></div>
            <div><span>ID proveedor</span><strong>{payment.provider_id || '-'}</strong></div>
            <div><span>Monto</span><strong>{formatPrice(payment.amount)}</strong></div>
          </div>
        </section>

        <section className="order-detail__card">
          <h2>Dirección de envío</h2>
          <div className="order-detail__rows">
            <div><span>Nombre</span><strong>{shippingAddress.name || '-'}</strong></div>
            <div><span>Teléfono</span><strong>{shippingAddress.phone || '-'}</strong></div>
            <div><span>Dirección</span><strong>{shippingAddress.address || '-'}</strong></div>
            <div><span>Ciudad</span><strong>{shippingAddress.city || '-'}</strong></div>
            <div><span>Código postal</span><strong>{shippingAddress.postal_code || '-'}</strong></div>
            <div><span>País</span><strong>{shippingAddress.country || '-'}</strong></div>
          </div>
        </section>

        <section className="order-detail__card">
          <h2>Facturación</h2>
          <div className="order-detail__rows">
            <div><span>Nombre</span><strong>{billingInfo.name || '-'}</strong></div>
            <div><span>Email</span><strong>{billingInfo.email || '-'}</strong></div>
            <div><span>Documento</span><strong>{billingInfo.document_number || '-'}</strong></div>
          </div>
        </section>
      </div>

      <section className="order-detail__card order-detail__items">
        <h2>Productos</h2>

        {items.length === 0 ? (
          <p>No hay ítems cargados en esta orden.</p>
        ) : (
          <div className="order-detail__items-list">
            {items.map((item, index) => {
              const lineTotal = Number(item.unit_price || 0) * Number(item.quantity || 0);

              return (
                <article
                  key={`${item.product_id}-${index}`}
                  className="order-detail__item"
                >
                  <div className="order-detail__item-main">
                    <h3>{item.name || `Producto #${item.product_id}`}</h3>
                    <p>ID producto: {item.product_id}</p>
                  </div>

                  <div className="order-detail__item-meta">
                    <span>Cantidad: {item.quantity}</span>
                    <span>Unitario: {formatPrice(item.unit_price)}</span>
                    <strong>{formatPrice(lineTotal)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}