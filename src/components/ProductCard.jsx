import React, { useState } from 'react';
import FavouriteButton from './FavouriteButton';
import { useCart } from '../context/cartContext'; 


const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

    const isDiscountActive = product.discount > 0 &&
    (!product.discountExpiration || new Date(product.discountExpiration) > new Date());


  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
    }).format(price);
  };


  
  return (
    <div 
    className="product-card"
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
      <FavouriteButton productId={product.id} />
      <div className="product-image-container">
        {!imageLoaded && (
          <div className="image-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Badge de descuento si existe */}
        
        {isDiscountActive && (
          <span className="discount-badge-admin">-{product.discount}%</span>
        )}
        
        {/* Badge de stock bajo */}
        {product.stock && product.stock <= 5 && (
          <div className="stock-badge">
            ¡Últimas {product.stock} unidades!
          </div>
        )}
      </div>
      
      <div className="info">
        <h2 title={product.name}>{product.name}</h2>
        
        {/* Rating si existe */}
        {product.rating && (
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">({product.reviewCount || 0})</span>
          </div>
        )}
        
        <div className="price-section">
          {isDiscountActive && product.originalPrice && product.originalPrice > product.price ? (
            <>
              <span className="original-price">${product.originalPrice}</span>
              <p className="current-price">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="current-price noDiscount">{formatPrice(product.price)}</p>
          )}
        </div>
          <button className="add-to-cart-btn" onClick={() => addToCart(product.id)}>Agregar</button>
{/* 

        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button> */}
      </div>
    </div>
  );
};

export default ProductCard;