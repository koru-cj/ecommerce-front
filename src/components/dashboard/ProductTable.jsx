import React from 'react';
import ProductCardAdmin from './ProductCardAdmin';
import './styles/ProductTable.css'; // podés dejar o limpiar esto si ya no usás tabla

export default function ProductTable({
  products,
  categories,
  editingProductId,
  editingProduct,
  onEdit,
  onCancelEdit,
  onChangeEdit,
  onUpdateProduct,
  onDeleteProduct
}) {
  return (
    <div className="product-card-grid">
      {products.filter(Boolean).map(product => (
        <ProductCardAdmin
          key={product.id}
          product={{
            ...product,
            category: categories.find(c => c.id === product.category_id)?.name
          }}
          onEdit={onEdit}
          onDelete={onDeleteProduct}
        />
      ))}
    </div>
  );
}
