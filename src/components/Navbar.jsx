// Navbar.jsx
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import WishlistModal from './WishlistModal';
import './styles/Navbar.css';
import { useSettings } from '../context/settingsContext';
import CartIcon from './CartIcon';
import FeMark from './Icons/FeMark';

export default function Navbar({ user, handleLogout, cartItemsCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const closeMenu = () => setIsMenuOpen(false);

  // Scroll suave a sección si ya estamos en "/" o navegar primero
  const handleAnchorClick = (e, hash) => {
    e.preventDefault();
    closeMenu();
    if (isHome) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navegar a "/" y después hacer scroll cuando cargue
      window.location.href = `/${hash}`;
    }
  };

  return (
    <nav className="navbar">

      {/* ── TOP BAR ── */}
      <div className="navbar-top">
        <div className="navbar-top__inner">
          <p className="navbar-top__promo">
            <em>
              <span className="navbar-top__brand">{settings.slogan}</span>
              <span className="navbar-top__info">
                {' '}–{' '}{settings.info_extra || 'Envío gratis en compras superiores a $50.000'}
              </span>
            </em>
          </p>
          <div className="navbar-top__links">
            <Link to="/ayuda">Ayuda</Link>
            <Link to="/seguimiento">Seguir pedido</Link>
            {user?.role === 'admin' && <Link to="/dashboard">Dashboard</Link>}
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <div className="navbar-main">
        <div className="navbar-main__inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Inicio">
            <FeMark />
          </Link>

          {/* Nav links — centro */}
          <div className="navbar-nav">
            <NavLink
              to="/products"
              className={({ isActive }) => `navbar-nav__link${isActive ? ' is-active' : ''}`}
            >
              Productos
            </NavLink>
            <NavLink
              to="/novedades"
              className={({ isActive }) => `navbar-nav__link${isActive ? ' is-active' : ''}`}
            >
              Novedades
            </NavLink>
            <NavLink
              to="/nosotros"
              className={({ isActive }) => `navbar-nav__link${isActive ? ' is-active' : ''}`}
            >
              Sobre nosotros
            </NavLink>
          </div>

          {/* Acciones — derecha */}
          <div className="navbar-actions">

            {/* Favoritos — solo si hay sesión */}
            {user && (
              <>
                <button
                  type="button"
                  className="navbar-action-btn"
                  onClick={() => setShowWishlist(true)}
                  aria-haspopup="dialog"
                  aria-label="Ver favoritos"
                >
                  <svg className="navbar-action-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="navbar-action-btn__label">Favoritos</span>
                </button>
                <WishlistModal open={showWishlist} onClose={() => setShowWishlist(false)} />
              </>
            )}

            {/* Carrito */}
            {user && <CartIcon />}

            {/* Divisor */}
            <div className="navbar-divider" aria-hidden="true" />

            {/* Usuario / Auth */}
            {user ? (
              <div className="navbar-user">
                <button className="navbar-user__btn" aria-haspopup="true">
                  {user.google_id && user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="navbar-user__avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="navbar-user__avatar">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                  <span className="navbar-user__name">{user.name || 'Usuario'}</span>
                  <svg className="navbar-user__chevron" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </button>

                <div className="navbar-dropdown" role="menu">
                  <Link to="/profile" className="navbar-dropdown__item" role="menuitem">Mi Perfil</Link>
                  <Link to="/pedidos" className="navbar-dropdown__item" role="menuitem">Mis Pedidos</Link>
                  <Link to="/config" className="navbar-dropdown__item" role="menuitem">Configuración</Link>
                  <div className="navbar-dropdown__divider" />
                  <button onClick={handleLogout} className="navbar-dropdown__item navbar-dropdown__item--danger" role="menuitem">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="navbar-auth__secondary">Iniciar sesión</Link>
                <Link to="/register" className="navbar-auth__primary">Registrarse</Link>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              className="navbar-hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
              aria-expanded={isMenuOpen}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" aria-hidden="true">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── SUBNAV — solo en "/" ── */}
      {isHome && (
        <div className="navbar-sub">
          <div className="navbar-sub__inner">
            <div className="navbar-sub__cats">
              <a
                href="#ofertas"
                className="navbar-sub__link navbar-sub__link--hot"
                onClick={(e) => handleAnchorClick(e, '#ofertas')}
              >
                Ofertas
              </a>
              <a
                href="#producto-estrella"
                className="navbar-sub__link"
                onClick={(e) => handleAnchorClick(e, '#producto-estrella')}
              >
                Brasero Fuego Eterno
              </a>
              <a
                href="#UltimosLanzamientos"
                className="navbar-sub__link"
                onClick={(e) => handleAnchorClick(e, '#UltimosLanzamientos')}
              >
                Lanzamientos
              </a>
              <a
                href="#presupuestar"
                className="navbar-sub__link"
                onClick={(e) => handleAnchorClick(e, '#presupuestar')}
              >
                Presupuestar
              </a>
            </div>
            <p className="navbar-sub__promo">
              <span className="navbar-sub__dot" aria-hidden="true" />
              Envío gratis en compras mayores a $50.000
            </p>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {isMenuOpen && (
        <div className="navbar-mobile-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
      <div className={`navbar-mobile${isMenuOpen ? ' is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="navbar-mobile__header">
          <Link to="/" className="navbar-logo" onClick={closeMenu} aria-label="Inicio">
            <FeMark />
          </Link>
          <button className="navbar-hamburger" onClick={closeMenu} aria-label="Cerrar menú">
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="navbar-mobile__nav">
          <NavLink to="/products"  className="navbar-mobile__link" onClick={closeMenu}>Productos</NavLink>
          <NavLink to="/novedades" className="navbar-mobile__link" onClick={closeMenu}>Novedades</NavLink>
          <NavLink to="/nosotros"  className="navbar-mobile__link" onClick={closeMenu}>Sobre nosotros</NavLink>

          {/* Anclas de home — solo si estamos en "/" */}
          {isHome && (
            <>
              <div className="navbar-mobile__divider" />
              <a href="#ofertas"      className="navbar-mobile__link navbar-mobile__link--hot" onClick={(e) => handleAnchorClick(e, '#ofertas')}>Ofertas</a>
              <a href="#brasero"      className="navbar-mobile__link" onClick={(e) => handleAnchorClick(e, '#brasero')}>Brasero</a>
              <a href="#presupuestar" className="navbar-mobile__link" onClick={(e) => handleAnchorClick(e, '#presupuestar')}>Presupuestar</a>
            </>
          )}
        </nav>

        <div className="navbar-mobile__actions">
          {user ? (
            <>
              {user && (
                <button className="navbar-mobile__action-btn" onClick={() => { setShowWishlist(true); closeMenu(); }}>
                  Favoritos
                </button>
              )}
              <Link to="/carrito"  className="navbar-mobile__action-btn" onClick={closeMenu}>Carrito</Link>
              <Link to="/profile"  className="navbar-mobile__action-btn" onClick={closeMenu}>Mi Perfil</Link>
              <Link to="/pedidos"  className="navbar-mobile__action-btn" onClick={closeMenu}>Mis Pedidos</Link>
              <button className="navbar-mobile__action-btn navbar-mobile__action-btn--danger" onClick={() => { handleLogout(); closeMenu(); }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar-mobile__action-btn" onClick={closeMenu}>Iniciar sesión</Link>
              <Link to="/register" className="navbar-mobile__action-btn navbar-mobile__action-btn--primary" onClick={closeMenu}>Registrarse</Link>
            </>
          )}
        </div>
      </div>

    </nav>
  );
}