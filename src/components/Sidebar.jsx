import React from 'react';

export default function Sidebar({
  searchQuery,
  onSearch,
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onlyInStock,
  onToggleInStock,
  onlyDiscounts,
  onToggleWithDiscounts,
  selectedVisibility,
  onVisibilityChange,
  brands = [],
  selectedBrand,
  onBrandSelect,
  onlyOrganic,
  onToggleOrganic,
  onlySenasa,
  onToggleSenasa,
  isBlocked
}) {
  return (
    <aside className="sidebar">
      <h3 style={{ marginTop: 0 }}>Filtros</h3>

      {/* Categorías */}
      <details className="acc" open>
        <summary>Categorías</summary>
        <ul className="category-list">
          <li
            className={!selectedCategory ? 'active' : ''}
            onClick={() => onSelectCategory?.(null)}
          >
            Todas
          </li>
          {categories.map((cat) => {
            const id = cat?.id ?? cat?.name ?? Math.random().toString(36);
            const name = cat?.name ?? 'Sin nombre';
            const active = selectedCategory === name;
            return (
              <li
                key={id}
                className={active ? 'active' : ''}
                onClick={() => onSelectCategory?.(name)}
              >
                {name}
              </li>
            );
          })}
        </ul>
      </details>

      {/* Rango de precio */}
      <details className="acc">
        <summary>Rango de precio</summary>
        <div className="price-range">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice ?? ''}
            onChange={(e) => onMinPriceChange?.(e.target.value)}
            disabled={isBlocked}
          />
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice ?? ''}
            onChange={(e) => onMaxPriceChange?.(e.target.value)}
            disabled={isBlocked}
          />
        </div>
        {isBlocked && (
          <div className="blocked-message" style={{ marginTop: 8 }}>
            🛑 Filtros bloqueados temporalmente por actividad excesiva.
          </div>
        )}
      </details>

      {/* Disponibilidad */}
      <details className="acc">
        <summary>Disponibilidad</summary>
        <div className="filter-block" style={{ marginBottom: 0 }}>
          <label>
            <input
              type="checkbox"
              checked={!!onlyInStock}
              onChange={onToggleInStock}
            />{' '}
            Solo con stock
          </label>
        </div>
        <div className="filter-block" style={{ marginBottom: 0 }}>
          <label>
            <input
              type="checkbox"
              checked={!!onlyDiscounts}
              onChange={onToggleWithDiscounts}
            />{' '}
            Solo con descuentos
          </label>
        </div>
      </details>


      {/* Marca (si hay marcas) */}
      {/* {brands.length > 0 && (
        <details className="acc">
          <summary>Marca</summary>
          <select
            value={selectedBrand ?? ''}
            onChange={(e) => onBrandSelect?.(e.target.value)}
            disabled={isBlocked}
          >
            <option value="">Todas</option>
            {brands.map((brand, i) => (
              <option key={`${brand}-${i}`} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </details>
      )} */}

      {/* Atributos extra */}
      {/* <details className="acc">
        <summary>Atributos</summary>
        <div className="filter-block" style={{ marginBottom: 0 }}>
          <label>
            <input
              type="checkbox"
              checked={!!onlyOrganic}
              onChange={onToggleOrganic}
              disabled={isBlocked}
            />{' '}
            Solo orgánicos
          </label>
        </div>
        <div className="filter-block" style={{ marginBottom: 0 }}>
          <label>
            <input
              type="checkbox"
              checked={!!onlySenasa}
              onChange={onToggleSenasa}
              disabled={isBlocked}
            />{' '}
            Solo productos con SENASA
          </label>
        </div>
      </details> */}
    </aside>
  );
}
