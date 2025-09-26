import { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, getWishlist } from '../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import './styles/FavouriteButton.css';

export default function FavouriteButton({ productId }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      try {
        const wishlist = await getWishlist(); // Debería devolver un array de productos o IDs
        const exists = wishlist.some((item) => {
          // Asegurate de que `item` tenga la propiedad `id` o `product_id`
          const id = item.product_id || item.id;
          return id === productId;
        });

        setIsFavorite(exists);
      } catch (err) {
        console.error('🛑 Error al obtener wishlist:', err);
      }
    };

    fetchWishlist();
  }, [user, productId]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) return;

    const previousState = isFavorite;
    const newState = !isFavorite;

    // 1. Cambio inmediato visual
    setIsFavorite(newState);

    try {
      if (previousState) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (err) {
      // 2. Si falló, revertimos el cambio
      setIsFavorite(previousState);
      console.error('🛑 Error al modificar favoritos:', err);
      alert('No se pudo actualizar tu lista de favoritos. Intenta de nuevo.');
    }
  };


  if (!user) return null;

  return (
    <button
      onClick={toggleFavorite}
      className={`wishlist-button ${isFavorite ? 'active' : ''}`}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  );
}
