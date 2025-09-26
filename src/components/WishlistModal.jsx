import { useEffect, useState, useMemo } from 'react';
import { getWishlist, removeFromWishlist } from '../lib/apiClient';
import { useCart } from '../context/cartContext';
import './styles/WishlistModal.css';

export default function WishlistModal({ open, onClose }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [pending, setPending] = useState(new Set()); // ids en acción

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

  const isEmpty = useMemo(() => wishlist.length === 0, [wishlist]);

  const handleAdd = async (product) => {
    // optimista: lo quitamos ya; si algo falla, lo devolvemos
    const id = product.id;
    setPending(prev => new Set(prev).add(id));
    setWishlist(prev => prev.filter(p => p.id !== id));

    try {
      await addToCart(id);                // o addToCart(product) si tu contexto lo requiere
      await removeFromWishlist(id);
      // nada más: ya lo sacamos optimistamente
    } catch (e) {
      console.error('Error al agregar o eliminar de wishlist', e);
      // rollback
      setWishlist(prev => [product, ...prev]);
      alert('No se pudo agregar al carrito. Intenta de nuevo.');
    } finally {
      setPending(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRemove = async (product) => {
    const id = product.id;
    setPending(prev => new Set(prev).add(id));
    // optimista
    setWishlist(prev => prev.filter(p => p.id !== id));
    try {
      await removeFromWishlist(id);
    } catch (e) {
      console.error('Error al eliminar de wishlist', e);
      // rollback
      setWishlist(prev => [product, ...prev]);
      alert('No se pudo eliminar. Intenta de nuevo.');
    } finally {
      setPending(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Wishlist">
      <div className="wishlist-modal">
        <header className="wishlist-header">
          <h2 className="wishlist-title">Mis favoritos</h2>
          <button className="wishlist-close-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        {isEmpty ? (
          <div className="wishlist-empty">
            <p>No tenés productos en favoritos.</p>
            <button className="btn btn-outline" onClick={onClose}>Ir a comprar</button>
          </div>
        ) : (
          <ul className="wishlist-list">
            {wishlist.map(product => {
              const disabled = pending.has(product.id);
              return (
                <li key={product.id} className="wishlist-item">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="wishlist-image"
                    loading="lazy"
                  />
                  <div className="wishlist-info">
                    <span className="wishlist-name">{product.name}</span>
                    {product.short_description && (
                      <span className="wishlist-desc">{product.short_description}</span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAdd(product)}
                      disabled={disabled}
                      aria-busy={disabled}
                    >
                      {/* ícono carrito */}
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A1.99 1.99 0 0 0 10 20h10v-2H10.42l.93-1.68h6.85a2 2 0 0 0 1.79-1.11l3-6A1 1 0 0 0 22 7H6.21l-.94-2H2V3h3a1 1 0 0 1 .92.62L7 6h13v2H7.42l2.55 5h7.21l-1.5 3H10" />
                      </svg>
                      <span>Agregar</span>
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={() => handleRemove(product)}
                      disabled={disabled}
                      aria-busy={disabled}
                    >
                      {/* ícono trash */}
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-1 6h2v9H8V9zm6 0h2v9h-2V9z" />
                      </svg>
                      <span>Eliminar</span>
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
