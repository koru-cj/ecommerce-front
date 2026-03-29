import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getAdminUsers,
  getAdminProducts,
  updateUserRole,
  getAdminCategories,
  updateProduct,
  createProduct,
  deleteProduct
} from '../lib/apiClient';
import ProductEditModal from '../components/dashboard/ProductEditModal';
import ProductFormModal from '../components/dashboard/ProductFormModal';
import './styles/Dashboard.css';

import UserTable from '../components/dashboard/UserTable';
import ProductTable from '../components/dashboard/ProductTable';
import WishlistAnalytics from '../components/dashboard/WishlistAnalytics';
import Themes from '../components/dashboard/Themes';
import SettingPage from '../components/dashboard/SettingPage';
import Ventas from '../components/dashboard/Ventas';

export default function Dashboard() {
  const { user, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('usuarios');

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    getAdminUsers(token).then(setUsers);
    getAdminProducts(token).then(setProducts);
    getAdminCategories(token).then(setCategories);
  }, [token]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  if (user?.role !== 'admin') {
    return <p>No autorizado</p>;
  }

  async function handleRoleChange(id, role) {
    const updated = await updateUserRole(id, role, token);
    if (updated?.user) {
      setUsers(prev => prev.map(u => (u.id === id ? updated.user : u)));
    }
  }

  async function handleDeleteProduct(id) {
    await deleteProduct(id, token);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function handleUpdateProduct(id, updated) {
    await updateProduct(id, updated, token);
    const updatedList = await getAdminProducts(token);
    setProducts(updatedList);
    setEditingProductId(null);
    setEditingProduct(null);
  }

  function handleEdit(id, product) {
    setEditingProductId(id);
    setEditingProduct({ ...product });
  }

  function handleCancelEdit() {
    setEditingProductId(null);
    setEditingProduct(null);
  }

  function sanitizeInput(input) {
    return String(input || '')
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü\s]/gi, '')
      .trim();
  }

  const filteredProducts = products.filter(product => {
    const query = sanitizeInput(searchTerm);

    return (
      sanitizeInput(product.name || '').includes(query) ||
      sanitizeInput(product.description || '').includes(query) ||
      sanitizeInput(product.brand || '').includes(query) ||
      sanitizeInput(product.type || '').includes(query) ||
      sanitizeInput(product.unit || '').includes(query) ||
      sanitizeInput(product.sku || '').includes(query) ||
      sanitizeInput(product.category || '').includes(query) ||
      (Array.isArray(product.tags) &&
        product.tags.some(tag => sanitizeInput(tag).includes(query))) ||
      String(product.price || '').includes(query) ||
      String(product.stock || '').includes(query)
    );
  });

  const filteredUsers = users.filter(userItem => {
    const query = sanitizeInput(searchTerm);

    return (
      sanitizeInput(userItem.name || '').includes(query) ||
      sanitizeInput(userItem.email || '').includes(query) ||
      sanitizeInput(userItem.phone || '').includes(query) ||
      sanitizeInput(userItem.document_number || '').includes(query) ||
      sanitizeInput(userItem.address || '').includes(query) ||
      sanitizeInput(userItem.city || '').includes(query) ||
      sanitizeInput(userItem.country || '').includes(query) ||
      sanitizeInput(userItem.role || '').includes(query)
    );
  });

  const currentTitle =
    activeTab === 'ventas' ? 'Ventas' :
    activeTab === 'usuarios' ? 'Usuarios' :
    activeTab === 'productos' ? 'Productos' :
    activeTab === 'wishlist' ? 'Wishlist' :
    activeTab === 'themes' ? 'Themes' :
    activeTab === 'settings' ? 'Settings' :
    'Panel';

  const currentPlaceholder =
    activeTab === 'ventas'
      ? 'Buscar por pedido, cliente, email, canal o estado…'
      : activeTab === 'usuarios'
      ? 'Buscar por nombre, email, rol…'
      : 'Buscar producto, categoría, descripción…';

  return (
    <div className="dashboard-shell">
      <button
        type="button"
        className="dash-mobile-toggle"
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-expanded={sidebarOpen}
        aria-label="Abrir navegación del dashboard"
      >
        <span>☰</span>
        <span>Panel</span>
      </button>

      <aside className={`dash-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="dash-brand">
          <div className="brand-logo" aria-hidden="true">🔥</div>
          <div className="brand-text">
            <strong>Panel</strong>
            <small>Administración</small>
          </div>
        </div>

        <nav className="dash-nav" aria-label="Secciones del panel">
          <button
            className={`dash-link ${activeTab === 'ventas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ventas')}
          >
            <span className="icon" aria-hidden>🛒</span>
            <span className="txt">Ventas</span>
          </button>

          <button
            className={`dash-link ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            <span className="icon" aria-hidden>👤</span>
            <span className="txt">Usuarios</span>
          </button>

          <button
            className={`dash-link ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <span className="icon" aria-hidden>📦</span>
            <span className="txt">Productos</span>
          </button>

          <button
            className={`dash-link ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <span className="icon" aria-hidden>❤️</span>
            <span className="txt">Wishlist</span>
          </button>

          <button
            className={`dash-link ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            <span className="icon" aria-hidden>🎨</span>
            <span className="txt">Themes</span>
          </button>

          <button
            className={`dash-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="icon" aria-hidden>⚙️</span>
            <span className="txt">Settings</span>
          </button>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-header-copy">
            <p className="dash-kicker">Administración</p>
            <h1 className="dash-title">{currentTitle}</h1>
          </div>

          <div className="dash-header-tools">
            <input
              type="text"
              className="dash-search"
              placeholder={currentPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <section className="dash-content">
          {activeTab === 'ventas' && (
            <Ventas token={token} searchTerm={searchTerm} />
          )}

          {activeTab === 'usuarios' && (
            <UserTable users={filteredUsers} onRoleChange={handleRoleChange} />
          )}

          {activeTab === 'productos' && (
            <>
              <div className="dash-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  ➕ Nuevo Producto
                </button>
              </div>

              <ProductTable
                products={filteredProducts}
                categories={categories}
                editingProductId={editingProductId}
                editingProduct={editingProduct}
                onEdit={handleEdit}
                onCancelEdit={handleCancelEdit}
                onChangeEdit={setEditingProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />

              {editingProduct && (
                <ProductEditModal
                  product={editingProduct}
                  onClose={handleCancelEdit}
                  onSave={handleUpdateProduct}
                />
              )}

              <ProductFormModal
                show={showModal}
                onClose={() => setShowModal(false)}
                token={token}
                categories={categories}
                onProductCreated={(newProduct) => {
                  setProducts((prev) => [...prev, newProduct]);
                }}
              />
            </>
          )}

          {activeTab === 'wishlist' && <WishlistAnalytics />}
          {activeTab === 'themes' && <Themes />}
          {activeTab === 'settings' && <SettingPage />}
        </section>
      </main>
    </div>
  );
}