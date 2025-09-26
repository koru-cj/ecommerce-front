import { useEffect, useState } from 'react';
import { getWishlistAnalytics } from '../../lib/apiClient';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import Loader from '../Loader'; // ← asegurate de tener este componente
import './styles/WishlistAnalytics.css';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f43f5e'];

export default function WishlistAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlistAnalytics()
      .then((data) => {
        const parsed = data.map(item => ({
          ...item,
          wishlist_count: Number(item.wishlist_count),
        }));
        setData(parsed);
      })
      .catch(err => {
        console.error('❌ Error al cargar analytics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;

  if (data.length === 0) {
    return <p className="wishlist-empty">Aún no hay productos en ninguna wishlist.</p>;
  }

  return (
    <div className="wishlist-analytics">
      <h2>Distribución de productos en Wishlists</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="wishlist_count"
            nameKey="product_name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
