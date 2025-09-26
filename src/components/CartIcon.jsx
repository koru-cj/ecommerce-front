import { useEffect, useState } from 'react';
import { useCart } from '../context/cartContext';
import { Link } from 'react-router-dom';

export default function CartIcon() {
  const { cart } = useCart();
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (cartItemsCount > 0) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 400); // igual que la duración de la animación
      return () => clearTimeout(timeout);
    }
  }, [cartItemsCount]);

  return (
    <Link to="/cart" className="nav-action cart-action">
      <div className="cart-icon-container">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19a1 1 0 102 0 1 1 0 00-2 0zm10 0a1 1 0 102 0 1 1 0 00-2 0z" />
        </svg>
        {cartItemsCount > 0 && (
          <span className={`cart-badge ${animate ? 'bounce' : ''}`}>
            {cartItemsCount}
          </span>
        )}
      </div>
      <span className="nav-label">Carrito</span>
    </Link>
  );
}
