import { useEffect, useState } from 'react';
import OrderCard from './OrderCard';
import './Orders.css';

export default function OrdersList({ title, fetchOrders, emptyMessage }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await fetchOrders(page, limit);
        if (!active) return;
        setOrders(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'No se pudieron cargar los pedidos.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [fetchOrders, page, limit]);

  if (loading) {
    return (
      <section className="orders-page">
        <h1>{title}</h1>
        <p>Cargando pedidos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="orders-page">
        <h1>{title}</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <div className="orders-page__header">
        <h1>{title}</h1>
      </div>

      {orders.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="orders-page__pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>Página {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </section>
  );
}