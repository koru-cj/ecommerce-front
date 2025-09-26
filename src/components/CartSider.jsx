import { useCart } from '../context/cartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import './styles/CartSider.css';
import { Link } from 'react-router-dom';

export default function CartSidebar({ isOpen, onClose }) {
  const {
    cart,
    updateCart,
    removeFromCart,
    errors,
  } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

 
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCart(itemId, newQuantity);
    }
  };


  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div 
        className={`cart-sidebar ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-labelledby="cart-title"
        aria-modal="true"
      >
        {/* Header */}
        <header className="cart-header">
          <div className="cart-title-container">
            <ShoppingBag size={20} className="cart-icon" />
            <h2 id="cart-title" className="cart-title">
              Carrito {totalItems > 0 && <span className="item-count">({totalItems})</span>}
            </h2>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} className="empty-icon" />
              <p className="empty-message">Tu carrito está vacío</p>
              <p className="empty-subtitle">Agregá productos para comenzar tu compra</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="cart-items-container">
                <ul className="cart-items" role="list">
                  {cart.map((item) => (
                    <li key={item.id} className="cart-item" role="listitem">
                      <div className="item-image-container">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="cart-img"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-unit-price">{formatPrice(item.price)} c/u</p>
                        
                        {/* Quantity Controls */}
                        <div className="quantity-section">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="quantity-display" aria-label={`Cantidad: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              aria-label={`Aumentar cantidad de ${item.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <button 
                            className="delete-btn" 
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Eliminar ${item.name} del carrito`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="item-total-price">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        
                        {errors[item.id] && (
                          <div className="error-message" role="alert">
                            {errors[item.id]}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span className="summary-amount">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="installments-info">
                  <span className="installments-text">
                    3 cuotas sin interés de {formatPrice(Math.floor(subtotal / 3))}
                  </span>
                </div>

                <button className="checkout-btn" type="button"  onClick={() => {onClose?.(); window.location.assign('/checkout');}} >
                  <span>Finalizar Compra</span>
                  <span className="checkout-amount">{formatPrice(subtotal)}</span>
                </button>
                
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}