import React, { useState, useEffect } from 'react';
import './styles/ProductEditModal.css';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({ ...product });

  useEffect(() => {
    setForm({ ...product });
  }, [product]);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value
    }));
  };

    const handleSubmit = (e) => {
    e.preventDefault();

    const parsedOriginal = parseFloat(form.original_price);
    const parsedPrice = parseFloat(form.price);
    const noDiscount = parsedOriginal === parsedPrice;

    const payload = {
    ...form,
    discount_percentage: undefined, // nunca se manda manual
    };

    if (
    parseFloat(payload.price) === parseFloat(payload.original_price)
    ) {
    payload.discount_expiration = null;
    } else if (!payload.discount_expiration) {
    payload.discount_expiration = null;
    }


    onSave(product.id, payload);
    };
        



  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Editar producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <label>
              Nombre:
              <input value={form.name || ''} onChange={e => handleChange('name', e.target.value)} />
            </label>
            <label>
              Descripción:
              <input value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
            </label>
            <label>
              Marca:
              <input value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} />
            </label>
            <label>
              Precio original:
              <input type="number" value={form.original_price || ''} onChange={e => handleChange('original_price', e.target.value)} />
            </label>
            <label>
              Precio con descuento:
              <input type="number" value={form.price || ''} onChange={e => handleChange('price', e.target.value)} />
            </label>
            <label>
                Fecha de vencimiento del descuento:
                <input
                    type="date"
                    value={form.discount_expiration ? form.discount_expiration.split('T')[0] : ''}
                    onChange={e => handleChange('discount_expiration', e.target.value)}
                    disabled={parseFloat(form.price) === parseFloat(form.original_price)}
                />
            </label>
            <label>
              Stock:
              <input type="number" value={form.stock || 0} onChange={e => handleChange('stock', e.target.value)} />
            </label>
            <label>
              Imagen URL:
              <input value={form.image_url || ''} onChange={e => handleChange('image_url', e.target.value)} />
            </label>
            <label>
              Unidad:
              <input value={form.unit || ''} onChange={e => handleChange('unit', e.target.value)} />
            </label>
            <label>
              Peso (gramos):
              <input type="number" value={form.weight_grams || ''} onChange={e => handleChange('weight_grams', e.target.value)} />
            </label>
            <label>
              Tags:
              <input value={form.tags?.join(', ') || ''} onChange={e => handleChange('tags', e.target.value)} />
            </label>
            <label>
              Visible:
              <input type="checkbox" checked={form.visible} onChange={e => handleChange('visible', e.target.checked)} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit">💾 Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
