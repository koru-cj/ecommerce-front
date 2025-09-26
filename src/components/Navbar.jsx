// Navbar.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import WishlistModal from './WishlistModal';
import './styles/Navbar.css';
import { useSettings } from '../context/settingsContext';
import CartIcon from './CartIcon';

export default function Navbar({ user, handleLogout, cartItemsCount = 0, searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const { settings } = useSettings();

  return (
    <nav className="navbar">
      {/* Top bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="top-bar">
            <div className="top-left">
              <em>
                <span>{settings.slogan}</span>
                <span className="text-claro">
                  {' '}– {settings.info_extra || 'Envío gratis en compras superiores a $50.000'}
                </span>
              </em>
            </div>
            <div className="top-right">
              <Link to="/ayuda">Ayuda</Link>
              <Link to="/seguimiento">Seguir pedido</Link>
              {user?.role === 'admin' && <Link to="/dashboard">Dashboard</Link>}
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="navbar-main">
        <div className="container">
          <div className="navbar-content">
            {/* Logo */}
            <Link to="/" className="navbar-logo" aria-label="Inicio">
              <svg viewBox="0 0 40 40" className="logo-icon" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="currentColor" />
                <path d="M12 20l6 6 12-12" stroke="white" strokeWidth="2" fill="none" />
              </svg>
              <span>{settings.nombre_logo || 'TiendaPro'}</span>
            </Link>

            {/* Right side actions */}
            <div className="navbar-actions">
              {user && (
                <>
                  {/* Productos (Link con look de botón) */}
                  <Link to="/products" className="nav-btn" aria-label="Ver productos">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1.5 11.5a1 1 0 01-1 .5H7.5a1 1 0 01-1-.5L5 9z" />
                    </svg>
                    <span className="nav-label">Productos</span>
                  </Link>

                  {/* Favoritos (modal) */}
                  <button type="button" onClick={() => setShowWishlist(true)} className="nav-btn" aria-haspopup="dialog">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="nav-label">Favoritos</span>
                  </button>

                  <WishlistModal open={showWishlist} onClose={() => setShowWishlist(false)} />
                </>
              )}

              {/* Carrito (queda como lo tenés) */}
              {user ? <CartIcon /> : null}

              {/* User menu */}
              <div className="user-menu">
                {user ? (
                  <div className="user-dropdown">
                    <button className="user-button">
                      <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <span className="nav-label">{user.name || 'Usuario'}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 12l-4-4h8l-4 4z" fill="currentColor" />
                      </svg>
                    </button>
                    <div className="dropdown-menu" role="menu">
                      <Link to="/profile" className="dropdown-item">Mi Perfil</Link>
                      <Link to="/pedidos" className="dropdown-item">Mis Pedidos</Link>
                      <Link to="/config" className="dropdown-item">Configuración</Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item logout">Cerrar Sesión</button>
                    </div>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <Link to="/login" className="btn-secondary">Iniciar Sesión</Link>
                    <Link to="/register" className="btn-primary">Registrarse</Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="mobile-menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
                aria-expanded={isMenuOpen}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-actions">
              {user && (
                <button onClick={() => { setShowWishlist(true); setIsMenuOpen(false); }}>
                  Favoritos
                </button>
              )}

              <Link to="/carrito" onClick={() => setIsMenuOpen(false)}>Carrito</Link>
              {user ? (
                <>
                  <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>Mi Perfil</Link>
                  <Link to="/pedidos" onClick={() => setIsMenuOpen(false)}>Mis Pedidos</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}>Cerrar Sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
