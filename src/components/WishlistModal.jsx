import { useEffect, useState, useMemo } from 'react';
import { getWishlist, removeFromWishlist } from '../lib/apiClient';
import { useCart } from '../context/cartContext';
import './styles/WishlistModal.css';

/* ── Helpers ──────────────────────────────────────────────── */
const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function StockChip({ stock }) {
  if (stock === null || stock === undefined) return null;
  if (stock === 0)  return <span className="wishlist-stock wishlist-stock--out">Sin stock</span>;
  if (stock <= 5)   return <span className="wishlist-stock wishlist-stock--low">Últimas {stock}</span>;
  return              <span className="wishlist-stock wishlist-stock--ok">En stock</span>;
}

/* ── Componente ───────────────────────────────────────────── */
export default function WishlistModal({ open, onClose }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [pending, setPending] = useState(new Set());

  useEffect(() => {
    let ignore = false;
    if (open) {
      (async () => {
        try {
          const data = await getWishlist();
          if (!ignore) setWishlist(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('No se pudo cargar la wishlist', e);
          if (!ignore) setWishlist([]);
        }
      })();
    }
    return () => { ignore = true; };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const isEmpty = useMemo(() => wishlist.length === 0, [wishlist]);

  const handleAdd = async (product) => {
    if (product.stock === 0) return;
    const id = product.id;
    setPending(prev => new Set(prev).add(id));
    setWishlist(prev => prev.filter(p => p.id !== id));
    try {
      await addToCart(id);
      await removeFromWishlist(id);
    } catch (e) {
      console.error('Error al agregar o eliminar de wishlist', e);
      setWishlist(prev => [product, ...prev]);
      alert('No se pudo agregar al carrito. Intenta de nuevo.');
    } finally {
      setPending(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleRemove = async (product) => {
    const id = product.id;
    setPending(prev => new Set(prev).add(id));
    setWishlist(prev => prev.filter(p => p.id !== id));
    try {
      await removeFromWishlist(id);
    } catch (e) {
      console.error('Error al eliminar de wishlist', e);
      setWishlist(prev => [product, ...prev]);
      alert('No se pudo eliminar. Intenta de nuevo.');
    } finally {
      setPending(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  if (!open) return null;

  return (
    /* Overlay — click fuera cierra */
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      {/* Drawer — detiene propagación */}
      <div
        className="wishlist-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Mis favoritos"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <header className="wishlist-header">
          <h2 className="wishlist-title">
            Mis favoritos
            {wishlist.length > 0 && (
              <span className="wishlist-badge">{wishlist.length}</span>
            )}
          </h2>
          <button className="wishlist-close-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        {/* ── Cuerpo ── */}
        {isEmpty ? (
          <div className="wishlist-empty">
            {/* Ícono corazón vacío */}
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
              style={{ opacity: .22, color: 'var(--text-muted)' }}
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318
                a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>No tenés productos guardados.</p>
            <button className="btn btn-outline" onClick={onClose}>Ir a comprar</button>
          </div>
        ) : (
          <ul className="wishlist-list">
            {wishlist.map(product => {
              const disabled   = pending.has(product.id);
              const outOfStock = product.stock === 0;

              // Descuento válido solo si discount_expiration existe y no expiró
              const now            = new Date();
              const expiration     = product.discount_expiration ? new Date(product.discount_expiration) : null;
              const discountActive = expiration === null || expiration > now;

              const originalPrice   = product.original_price ?? null;
              const discountedPrice = product.price ?? null;

              // Si el descuento está activo mostramos ambos; si no, solo original_price
              const displayPrice  = discountActive ? discountedPrice : originalPrice;
              const hasDiscount   = discountActive && originalPrice != null && discountedPrice != null && originalPrice > discountedPrice;

              return (
                <li key={product.id} className="wishlist-item">
                  {/* Imagen */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="wishlist-image"
                    loading="lazy"
                  />

                  {/* Info + meta */}
                  <div className="wishlist-info">
                    <span className="wishlist-name">{product.name}</span>
                    {product.short_description && (
                      <span className="wishlist-desc">{product.short_description}</span>
                    )}
                  </div>

                  <div className="wishlist-meta">
                    {/* Precio final */}
                    {displayPrice != null && (
                      <span className="wishlist-price">
                        {formatPrice(displayPrice)}
                        {product.unit && (
                          <span className="wishlist-unit"> / {product.unit}</span>
                        )}
                      </span>
                    )}
                    {/* Precio tachado — solo si hay descuento real */}
                    {hasDiscount && (
                      <span className="wishlist-price-original">{formatPrice(originalPrice)}</span>
                    )}

                    {/* Stock */}
                    <StockChip stock={product.stock} />
                  </div>

                  {/* Acciones */}
                  <div className="wishlist-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAdd(product)}
                      disabled={disabled || outOfStock}
                      aria-busy={disabled}
                      title={outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M16 10a4 4 0 01-8 0" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Agregar</span>
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={() => handleRemove(product)}
                      disabled={disabled}
                      aria-busy={disabled}
                      aria-label="Eliminar de favoritos"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                      <span>Quitar</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}