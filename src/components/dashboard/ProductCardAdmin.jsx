import React from 'react';

const ProductCardAdmin = ({
  product,
  onEdit,
  onDelete
}) => {
  const {
    id,
    name,
    description,
    image_url,
    original_price,
    price,
    discount_percentage,
    discount_expiration,
    brand,
    stock,
    unit,
    visible,
    tags,
    category,
    weight_grams
  } = product;
  const isDiscountActive = discount_percentage > 0 &&
    (!discount_expiration || new Date(discount_expiration) > new Date());

  return (
    <div className={`product-card-admin ${!visible ? 'hidden' : ''}`}>
      <div className="image-section">
        <img src={image_url || '/img/default-product.png'} alt={name} />
        {isDiscountActive && (
          <span className="discount-badge-admin">-{discount_percentage}%</span>
        )}
        {!visible && (
          <span className="visibility-badge">Oculto</span>
        )}
      </div>

      <div className="details-section">
        <h3 title={name}>{name}</h3>
        <p className="brand">{brand || 'Sin marca'}</p>
        <p className="description">{description || 'Sin descripción'}</p>

        <div className="price">
          {isDiscountActive ? (
            <>
              <span className="original-price">${original_price}</span>
              <span className="current-price">${price}</span>
            </>
          ) : (
            <span className="current-price">${original_price}</span>
          )}
        </div>

        <p className="info-line">
          Stock: <strong>{stock}</strong> | Unidad: {unit || 'n/a'} | Peso: {weight_grams || '-'} g
        </p>

        <p className="info-line">
          Categoría: {category || 'Sin categoría'}
        </p>

        {tags?.length > 0 && (
          <div className="tags">
            {tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {discount_expiration && (
          <p className="info-line small">Descuento hasta: {new Date(discount_expiration).toLocaleDateString()}</p>
        )}
      </div>

      <div className="actions">
        <button onClick={() => onEdit(id, product)}>✏️ Editar</button>
        <button onClick={() => onDelete(id)}>🗑️ Eliminar</button>
      </div>
    </div>
  );
};

export default ProductCardAdmin;
