import React, { useState } from 'react';
import './styles/ProductFormModal.css';
import { createProduct } from '../../lib/apiClient';

const initialState = {
  name: '',
  description: '',
  original_price: '',
  price: '',
  discount_expiration: '',
  stock: 0,
  category_id: '',
  image_url: '',
  brand: '',
  tags: '',
  unit: '',
  visible: true,
  weight_grams: '',
  dimensions: '',
  organic: false,
  senasa: false,
  rendimiento: '',
};

const ProductFormModal = ({ show, onClose, categories, token, onProductCreated }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, original_price, price, stock } = form;
    if (!name.trim() || isNaN(original_price)) {
      return setError('Nombre y precio original son obligatorios y válidos');
    }
    if (price && isNaN(price)) return setError('El precio debe ser numérico');
    if (stock < 0) return setError('El stock no puede ser negativo');
    if (!form.category_id) return setError('Debe seleccionar una categoría');

    const data = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      image_url: form.image_url?.trim() || '',
      brand: form.brand?.trim() || '',
      unit: form.unit?.trim() || '',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      visible: !!form.visible,
      organic: !!form.organic,
      senasa: !!form.senasa,
      category_id: parseInt(form.category_id, 10),
      original_price: parseFloat(form.original_price),
      price: form.price ? parseFloat(form.price) : parseFloat(form.original_price),
      stock: parseInt(form.stock, 10),
      rendimiento: form.rendimiento ? parseFloat(form.rendimiento) : null,
      weight_grams: form.weight_grams ? parseInt(form.weight_grams, 10) : null,
      dimensions: form.dimensions?.trim() || '',
      discount_expiration: form.discount_expiration
        ? new Date(form.discount_expiration).toISOString()
        : null,
    };

    try {
      console.log('✅ Enviando producto:', data);
      const created = await createProduct(data, token);
      console.log('🟢 Respuesta backend:', created);

      if (created.product) {
        onProductCreated(created.product);
        setForm(initialState);
        onClose();
      } else {
        setError('No se pudo crear el producto');
      }
    } catch (err) {
      console.error('🛑 Error al crear producto:', err);
      setError('Error inesperado al crear producto');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2>Crear nuevo producto</h2>
        {error && <div className="error">{error}</div>}
        <form className="product-create-form" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" />
          <input name="original_price" value={form.original_price} onChange={handleChange} placeholder="Precio original" type="number" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Precio con descuento (opcional)" type="number" />
          <input name="discount_expiration" value={form.discount_expiration} onChange={handleChange} type="date" />
          <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" />
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL de imagen" />
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Marca" />
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Etiquetas (separadas por coma)" />
          <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unidad" />
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Seleccionar categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input name="weight_grams" value={form.weight_grams} onChange={handleChange} placeholder="Peso (g)" type="number" />
          <input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="Dimensiones" />
          <input name="rendimiento" value={form.rendimiento} onChange={handleChange} placeholder="Rendimiento" type="number" />
          <label><input type="checkbox" name="organic" checked={form.organic} onChange={handleChange} /> Orgánico</label>
          <label><input type="checkbox" name="senasa" checked={form.senasa} onChange={handleChange} /> SENASA</label>
          <label><input type="checkbox" name="visible" checked={form.visible} onChange={handleChange} /> Visible</label>
          <button type="submit">Crear producto</button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
