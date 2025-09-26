// src/components/Cart.jsx
import { useCart } from '../context/cartContext';
import { useNavigate } from 'react-router-dom'
import './styles/Cart.css';

export default function Cart() {
  const { cart, loading, updateCart, removeFromCart, clearCart, errors } = useCart();
  const navigate = useNavigate();
  if (loading) return <div className="cart">Cargando carrito...</div>;

  if (cart.length === 0)
    return (
      <div className="cart">
        <h2>Tu carrito está vacío</h2>
      </div>
    );

  // 👉 NUEVO: subtotal (precio * cantidad)
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleBuy = () => {
    navigate('/checkout');

  }
  return (
    <div className="cart">
      <h2>Mi Carrito</h2>

      {/* 👉 NUEVO: layout 2 columnas (lista + resumen) */}
      <div className="cart-layout">
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image_url} alt={item.name} className="cart-img" />

              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>Precio: ${item.price}</p>
                <p>Total: ${item.price * item.quantity}</p>
              </div>

              <div className="cart-qty-controls">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateCart(item.id, item.quantity - 1)
                      : removeFromCart(item.id)
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCart(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>

              <button
                className="cart-btn remove"
                onClick={() => removeFromCart(item.id)}
              >
                🗑
              </button>
              {errors[item.id] && <span className="cart-error">{errors[item.id]}</span>}
            </li>
          ))}
        </ul>

        {/* 👉 NUEVO: Resumen */}
        <aside className="cart-summary" aria-label="Resumen de compra">
          <h3>Resumen</h3>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString('es-AR')}</span>
          </div>

          <div className="cart-summary-note">
            El envío se calcula en el checkout.
          </div>

          <button to="/checkout" className="cart-checkout-btn" onClick={handleBuy}>
           <span>Finalizar Compra</span>
         </button>

          <button className="cart-clear-btn" onClick={clearCart}>
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  );
}
