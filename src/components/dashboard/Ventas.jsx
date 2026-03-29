import { useEffect, useMemo, useState } from 'react';
import {
  getAdminOrders,
  getAdminOrderDetail,
  approveAdminOrderPayment,
  markAdminOrderShipped,
  markAdminOrderDelivered,
} from '../../lib/apiClient';
import './styles/Ventas.css';

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

function sanitizeInput(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s@.-]/gi, '')
    .trim();
}

function paymentStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    refunded: 'Reintegrado',
    cancelled: 'Cancelado',
  };
  return map[status] || status || 'Sin estado';
}

function orderStatusLabel(status) {
  const map = {
    pending_payment: 'Pendiente de pago',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    manual_review: 'Revisión manual',
    payment_failed: 'Pago fallido',
    cancelled: 'Cancelado',
  };
  return map[status] || status || 'Sin estado';
}

function getAvailableActions(order) {
  if (!order) return [];

  const actions = [];

  if (
    order.channel === 'whatsapp' &&
    order.payment_status === 'pending' &&
    order.status === 'pending_payment'
  ) {
    actions.push('approve-payment');
  }

  if (order.payment_status === 'approved' && order.status === 'preparing') {
    actions.push('mark-shipped');
  }

  if (order.payment_status === 'approved' && order.status === 'shipped') {
    actions.push('mark-delivered');
  }

  return actions;
}

export default function Ventas({ token, searchTerm = '' }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadOrders() {
    try {
      setLoadingList(true);
      setError('');
      const data = await getAdminOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las ventas');
    } finally {
      setLoadingList(false);
    }
  }

  async function loadOrderDetail(orderId) {
    try {
      setLoadingDetail(true);
      setDetailError('');
      const data = await getAdminOrderDetail(orderId, token);
      setSelectedOrder(data);
    } catch (err) {
      setDetailError(err.message || 'No se pudo cargar el detalle');
      setSelectedOrder(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadOrders();
  }, [token]);

  useEffect(() => {
    if (!selectedOrderId || !token) {
      setSelectedOrder(null);
      return;
    }
    loadOrderDetail(selectedOrderId);
  }, [selectedOrderId, token]);

  const filteredOrders = useMemo(() => {
    const query = sanitizeInput(searchTerm);

    if (!query) return orders;

    return orders.filter((order) => {
      return (
        sanitizeInput(order.id).includes(query) ||
        sanitizeInput(order.user_name).includes(query) ||
        sanitizeInput(order.user_email).includes(query) ||
        sanitizeInput(order.user_phone).includes(query) ||
        sanitizeInput(order.status).includes(query) ||
        sanitizeInput(order.payment_status).includes(query) ||
        sanitizeInput(order.channel).includes(query) ||
        sanitizeInput(order.payment_method).includes(query) ||
        sanitizeInput(order.provider_status).includes(query) ||
        String(order.total || '').includes(query)
      );
    });
  }, [orders, searchTerm]);

  async function handleAction(type) {
    if (!selectedOrderId) return;

    try {
      setActionLoading(type);
      setSuccessMessage('');
      setDetailError('');

      if (type === 'approve-payment') {
        await approveAdminOrderPayment(selectedOrderId, token);
        setSuccessMessage('Pago aprobado manualmente.');
      }

      if (type === 'mark-shipped') {
        await markAdminOrderShipped(selectedOrderId, token);
        setSuccessMessage('Pedido marcado como enviado.');
      }

      if (type === 'mark-delivered') {
        await markAdminOrderDelivered(selectedOrderId, token);
        setSuccessMessage('Pedido marcado como entregado.');
      }

      await loadOrders();
      await loadOrderDetail(selectedOrderId);
    } catch (err) {
      setDetailError(err.message || 'No se pudo ejecutar la acción');
    } finally {
      setActionLoading('');
    }
  }

  const actions = getAvailableActions(selectedOrder);

  return (
    <div className="ventas-panel">
      <div className="ventas-grid">
        <section className="ventas-list-card">
          <div className="ventas-section-head">
            <div>
              <h2>Pedidos</h2>
              <p>Gestioná pagos manuales y estados logísticos.</p>
            </div>
          </div>

          {loadingList ? (
            <div className="ventas-state">Cargando ventas...</div>
          ) : error ? (
            <div className="ventas-state ventas-state--error">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="ventas-state">No hay pedidos para mostrar.</div>
          ) : (
            <>
              <div className="ventas-mobile-list">
                {filteredOrders.map((order) => {
                  const selected = selectedOrderId === order.id;

                  return (
                    <article
                      key={order.id}
                      className={`ventas-mobile-card ${selected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="ventas-mobile-card__top">
                        <div>
                          <p className="ventas-mobile-card__kicker">Pedido</p>
                          <h3>#{order.id}</h3>
                        </div>

                        <div className="ventas-mobile-card__badges">
                          <span className={`ventas-badge ventas-badge--payment ventas-badge--${order.payment_status || 'unknown'}`}>
                            {paymentStatusLabel(order.payment_status)}
                          </span>
                          <span className={`ventas-badge ventas-badge--order ventas-badge--${order.status || 'unknown'}`}>
                            {orderStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="ventas-mobile-card__body">
                        <div><span>Cliente</span><strong>{order.user_name || 'Sin nombre'}</strong></div>
                        <div><span>Email</span><strong>{order.user_email || '-'}</strong></div>
                        <div><span>Canal</span><strong>{order.channel || '-'}</strong></div>
                        <div><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
                        <div><span>Fecha</span><strong>{formatDate(order.created_at)}</strong></div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="ventas-table-wrap">
                <table className="ventas-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Canal</th>
                      <th>Pago</th>
                      <th>Pedido</th>
                      <th>Total</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const selected = selectedOrderId === order.id;

                      return (
                        <tr
                          key={order.id}
                          className={selected ? 'is-selected' : ''}
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <td>#{order.id}</td>
                          <td>
                            <div className="ventas-cell-stack">
                              <strong>{order.user_name || 'Sin nombre'}</strong>
                              <span>{order.user_email || '-'}</span>
                            </div>
                          </td>
                          <td>{order.channel || '-'}</td>
                          <td>
                            <span className={`ventas-badge ventas-badge--payment ventas-badge--${order.payment_status || 'unknown'}`}>
                              {paymentStatusLabel(order.payment_status)}
                            </span>
                          </td>
                          <td>
                            <span className={`ventas-badge ventas-badge--order ventas-badge--${order.status || 'unknown'}`}>
                              {orderStatusLabel(order.status)}
                            </span>
                          </td>
                          <td>{formatPrice(order.total)}</td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <aside className="ventas-detail-card">
          {!selectedOrderId ? (
            <div className="ventas-state">
              Seleccioná un pedido para ver el detalle.
            </div>
          ) : loadingDetail ? (
            <div className="ventas-state">Cargando detalle...</div>
          ) : detailError ? (
            <div className="ventas-state ventas-state--error">{detailError}</div>
          ) : !selectedOrder ? (
            <div className="ventas-state">No se encontró el detalle del pedido.</div>
          ) : (
            <>
              <div className="ventas-detail-head">
                <div>
                  <p className="ventas-detail-kicker">Pedido</p>
                  <h2>#{selectedOrder.id}</h2>
                  <p className="ventas-detail-date">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>

                <div className="ventas-detail-badges">
                  <span className={`ventas-badge ventas-badge--payment ventas-badge--${selectedOrder.payment_status || 'unknown'}`}>
                    {paymentStatusLabel(selectedOrder.payment_status)}
                  </span>
                  <span className={`ventas-badge ventas-badge--order ventas-badge--${selectedOrder.status || 'unknown'}`}>
                    {orderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="ventas-detail-section">
                <h3>Acciones disponibles</h3>

                {successMessage && (
                  <div className="ventas-inline-success">{successMessage}</div>
                )}

                {actions.length === 0 ? (
                  <p className="ventas-muted">
                    No hay acciones administrativas disponibles para este estado.
                  </p>
                ) : (
                  <div className="ventas-actions">
                    {actions.includes('approve-payment') && (
                      <button
                        className="btn-primary"
                        onClick={() => handleAction('approve-payment')}
                        disabled={actionLoading === 'approve-payment'}
                      >
                        {actionLoading === 'approve-payment'
                          ? 'Aprobando...'
                          : 'Aprobar pago manual'}
                      </button>
                    )}

                    {actions.includes('mark-shipped') && (
                      <button
                        className="btn-primary"
                        onClick={() => handleAction('mark-shipped')}
                        disabled={actionLoading === 'mark-shipped'}
                      >
                        {actionLoading === 'mark-shipped'
                          ? 'Marcando...'
                          : 'Marcar como enviado'}
                      </button>
                    )}

                    {actions.includes('mark-delivered') && (
                      <button
                        className="btn-primary"
                        onClick={() => handleAction('mark-delivered')}
                        disabled={actionLoading === 'mark-delivered'}
                      >
                        {actionLoading === 'mark-delivered'
                          ? 'Marcando...'
                          : 'Marcar como entregado'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="ventas-detail-grid">
                <div className="ventas-detail-section">
                  <h3>Resumen</h3>
                  <div className="ventas-kv">
                    <div><span>Cliente</span><strong>{selectedOrder.user_name || '-'}</strong></div>
                    <div><span>Email</span><strong>{selectedOrder.user_email || '-'}</strong></div>
                    <div><span>Teléfono</span><strong>{selectedOrder.user_phone || '-'}</strong></div>
                    <div><span>Canal</span><strong>{selectedOrder.channel || '-'}</strong></div>
                    <div><span>Moneda</span><strong>{selectedOrder.currency || 'ARS'}</strong></div>
                    <div><span>Total</span><strong>{formatPrice(selectedOrder.total)}</strong></div>
                  </div>
                </div>

                <div className="ventas-detail-section">
                  <h3>Pago</h3>
                  <div className="ventas-kv">
                    <div><span>Método</span><strong>{selectedOrder.payment?.method || '-'}</strong></div>
                    <div><span>Estado local</span><strong>{selectedOrder.payment?.status || '-'}</strong></div>
                    <div><span>Estado proveedor</span><strong>{selectedOrder.payment?.provider_status || '-'}</strong></div>
                    <div><span>Detalle proveedor</span><strong>{selectedOrder.payment?.provider_status_detail || '-'}</strong></div>
                    <div><span>Referencia</span><strong>{selectedOrder.payment?.provider_reference || '-'}</strong></div>
                    <div><span>ID proveedor</span><strong>{selectedOrder.payment?.provider_id || '-'}</strong></div>
                  </div>
                </div>
              </div>

              <div className="ventas-detail-section">
                <h3>Dirección de envío</h3>
                <div className="ventas-kv">
                  <div><span>Nombre</span><strong>{selectedOrder.shipping_address?.name || '-'}</strong></div>
                  <div><span>Teléfono</span><strong>{selectedOrder.shipping_address?.phone || '-'}</strong></div>
                  <div><span>Dirección</span><strong>{selectedOrder.shipping_address?.address || '-'}</strong></div>
                  <div><span>Ciudad</span><strong>{selectedOrder.shipping_address?.city || '-'}</strong></div>
                  <div><span>Código postal</span><strong>{selectedOrder.shipping_address?.postal_code || '-'}</strong></div>
                  <div><span>País</span><strong>{selectedOrder.shipping_address?.country || '-'}</strong></div>
                </div>
              </div>

              <div className="ventas-detail-section">
                <h3>Productos</h3>

                {!Array.isArray(selectedOrder.items) || selectedOrder.items.length === 0 ? (
                  <p className="ventas-muted">Este pedido no tiene productos cargados.</p>
                ) : (
                  <div className="ventas-items">
                    {selectedOrder.items.map((item, index) => {
                      const lineTotal =
                        Number(item.unit_price || 0) * Number(item.quantity || 0);

                      return (
                        <article key={`${item.product_id}-${index}`} className="ventas-item">
                          <div>
                            <strong>{item.name || `Producto #${item.product_id}`}</strong>
                            <p>ID: {item.product_id}</p>
                          </div>

                          <div className="ventas-item-meta">
                            <span>Cant: {item.quantity}</span>
                            <span>Unit: {formatPrice(item.unit_price)}</span>
                            <strong>{formatPrice(lineTotal)}</strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}