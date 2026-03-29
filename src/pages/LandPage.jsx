import { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  ArrowRight,
  Shield,
  Truck,
  Sparkles,
  BadgePercent,
  ChevronRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { getPublicProducts, requestQuote   } from '../lib/apiClient';
import { useCart } from '../context/cartContext';
import Loader from '../components/Loader';
import './styles/LandPage.css';

const STAR_PRODUCT_NAME = 'Brasero Fuego Eterno';
const FALLBACK_IMAGE = '/img/default-product.png';

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'ventas@fuegoeterno.com';
const CONTACT_PHONE =
  import.meta.env.VITE_CONTACT_PHONE || '+5493510000000';
const CONTACT_INSTAGRAM =
  import.meta.env.VITE_CONTACT_INSTAGRAM || 'https://instagram.com/fuegoeterno';

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isDiscountActive(product) {
  if (!product) return false;

  return (
    toNumber(product.discount) > 0 &&
    (!product.discountExpiration ||
      new Date(product.discountExpiration) > new Date())
  );
}

function getDisplayPrice(product) {
  if (!product) return 0;
  return toNumber(product.price);
}

function getOriginalPrice(product) {
  if (!product) return 0;
  return toNumber(product.originalPrice || product.price);
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function normalizeDate(date) {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ProductImage({ product, alt, className }) {
  const [src, setSrc] = useState(product?.imageUrl || FALLBACK_IMAGE);

  useEffect(() => {
    setSrc(product?.imageUrl || FALLBACK_IMAGE);
  }, [product?.imageUrl]);

  return (
    <img
      className={className}
      src={src}
      alt={alt || product?.name || 'Producto'}
      onError={() => {
        if (src !== FALLBACK_IMAGE) {
          setSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}


export default function LandPage() {
  const [products, setProducts] = useState([]);
  const [quoteForm, setQuoteForm] =useState({ email: '', productIds: [], quantity: 1 });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  const { addToCart } = useCart();

  
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError('');

        const prods = await getPublicProducts();

        if (!mounted) return;

        setProducts(Array.isArray(prods) ? prods.filter(Boolean) : []);
      } catch (error) {
        console.error('Error cargando productos en la land:', error);
        if (!mounted) return;
        setProductsError('No se pudieron cargar los productos.');
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((p) => p?.visible !== false);
  }, [products]);

  const starProduct = useMemo(() => {
    return (
      visibleProducts.find(
        (p) => p?.name?.trim().toLowerCase() === STAR_PRODUCT_NAME.toLowerCase()
      ) ||
      visibleProducts[0] ||
      null
    );
  }, [visibleProducts]);

  const discountedProducts = useMemo(() => {
    return visibleProducts
      .filter((p) => isDiscountActive(p))
      .sort((a, b) => toNumber(b.discount) - toNumber(a.discount));
  }, [visibleProducts]);

  const newestProducts = useMemo(() => {
    return [...visibleProducts]
      .sort((a, b) => {
        const da = normalizeDate(a?.createdAt || a?.created_at)?.getTime() || 0;
        const db = normalizeDate(b?.createdAt || b?.created_at)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 4);
  }, [visibleProducts]);

  const otherProducts = useMemo(() => {
    return visibleProducts
      .filter((p) => p?.id !== starProduct?.id)
      .slice(0, 8);
  }, [visibleProducts, starProduct]);

  const categoriesPreview = useMemo(() => {
    const raw = visibleProducts
      .map((p) => p?.category)
      .filter(Boolean);

    return [...new Set(raw)].slice(0, 6);
  }, [visibleProducts]);

  function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function goToProducts() {
    window.location.href = '/products';
  }

  function goToProduct(product) {
    if (!product?.id) return;
    window.location.href = `/products/${product.id}`;
  }
function handleQuoteChange(e) {
  const { name, value } = e.target;

  setQuoteForm((prev) => ({
    ...prev,
    [name]: name === 'quantity' ? Math.max(1, Number(value) || 1) : value,
  }));
}

function handleToggleQuoteProduct(productId) {
  const normalizedId = String(productId);

  setQuoteForm((prev) => {
    const exists = prev.productIds.includes(normalizedId);

    return {
      ...prev,
      productIds: exists
        ? prev.productIds.filter((id) => id !== normalizedId)
        : [...prev.productIds, normalizedId],
    };
  });
}
async function handleQuoteSubmit(e) {
  e.preventDefault();

  if (!quoteForm.email.trim()) return;
  if (quoteForm.productIds.length === 0) return;

  try {
    await requestQuote({
      email: quoteForm.email.trim(),
      productIds: quoteForm.productIds,
      quantity: Number(quoteForm.quantity),
    });

    setQuoteSent(true);

    setQuoteForm({
      email: '',
      productIds: [],
      quantity: 1,
    });
  } catch (error) {
    console.error('Error solicitando presupuesto:', error);
    alert(error.message || 'No se pudo enviar la solicitud');
  }
}
  if (loadingProducts) {
    return (
      <div className="land land--loading">
        <Loader />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="land">
        <section className="land-hero land-hero--loading">
          <div className="land-wrap">
            <p className="land-eyebrow">Error</p>
            <h1 className="land-title">No pudimos cargar los productos</h1>
            <p className="land-subtitle">{productsError}</p>
          </div>
        </section>
      </div>
    );
  }

  if (!starProduct) {
    return (
      <div className="land">
        <section className="land-hero land-hero--loading">
          <div className="land-wrap">
            <p className="land-eyebrow">Sin productos</p>
            <h1 className="land-title">Todavía no hay productos publicados</h1>
            <p className="land-subtitle">
              Publicá al menos un producto visible para renderizar la landing.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <main className="land">
      <section className="land-hero">
        <div className="land-hero__bg">
          <ProductImage product={starProduct} alt={starProduct.name} />
        </div>

        <div className="land-hero__overlay" />

        <div className="land-wrap land-hero__content">
          <div className="land-hero__copy">
            <p className="land-eyebrow">Braseros y productos de fuego</p>

            <h1 className="land-title">
              Braseros con presencia,
              <br />
              carácter y fuego real.
            </h1>

            <p className="land-subtitle">
              En Fuego Eterno diseñamos productos para transformar un espacio:
              braseros, piezas con carácter y una línea pensada para quienes quieren
              algo más que un objeto decorativo.
            </p>

            <div className="land-hero__cta">
              <button
                type="button"
                className="land-btn land-btn--primary"
                onClick={() => scrollToId('producto-estrella')}
              >
                Ver producto estrella
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="land-btn land-btn--secondary"
                onClick={goToProducts}
              >
                Ver catálogo
              </button>
            </div>

            <div className="land-hero__chips">
              <span>Diseño con identidad</span>
              <span>Fabricación propia</span>
              <span>Envíos a todo el país</span>
            </div>
          </div>
        </div>
      </section>

      <section className="land-trust">
        <div className="land-wrap land-trust__grid">
          <article className="land-trust__card">
            <div className="land-trust__icon">
              <Shield size={18} />
            </div>
            <h3>Calidad y presencia</h3>
            <p>Productos pensados para durar, verse bien y transmitir marca.</p>
          </article>

          <article className="land-trust__card">
            <div className="land-trust__icon">
              <Truck size={18} />
            </div>
            <h3>Envíos</h3>
            <p>Coordinamos entregas en Córdoba y envíos al resto del país.</p>
          </article>

          <article className="land-trust__card">
            <div className="land-trust__icon">
              <Sparkles size={18} />
            </div>
            <h3>Línea en crecimiento</h3>
            <p>No vendemos una sola cosa. Estamos armando una línea completa de productos.</p>
          </article>
        </div>
      </section>

      <section id="producto-estrella" className="land-featured">
        <div className="land-wrap land-featured__grid">
          <div className="land-featured__media">
            <ProductImage product={starProduct} alt={starProduct.name} />
          </div>

          <div className="land-featured__info">
            <p className="land-section-eyebrow">
              <Star size={14} />
              Producto estrella
            </p>

            <h2>{starProduct.name}</h2>

            <p className="land-featured__desc">
              {starProduct.description || 'Nuestro producto principal dentro de la línea actual.'}
            </p>

            <div className="land-featured__price">
              {isDiscountActive(starProduct) &&
              getOriginalPrice(starProduct) > getDisplayPrice(starProduct) ? (
                <>
                  <span className="land-price-old">
                    {formatPrice(getOriginalPrice(starProduct))}
                  </span>
                  <span className="land-price-current">
                    {formatPrice(getDisplayPrice(starProduct))}
                  </span>
                  <span className="land-discount-badge">
                    -{toNumber(starProduct.discount)}%
                  </span>
                </>
              ) : (
                <span className="land-price-current no-discount">
                  {formatPrice(getDisplayPrice(starProduct))}
                </span>
              )}
            </div>

            <ul className="land-featured__bullets">
              <li><CheckCircle2 size={16} /> Producto destacado de la marca</li>
              <li><CheckCircle2 size={16} /> Categoría: {starProduct.category || 'Sin categoría'}</li>
              <li><CheckCircle2 size={16} /> Stock: {starProduct.stock ?? 'No informado'}</li>
              <li><CheckCircle2 size={16} /> Peso: {starProduct.weight_grams ? `${starProduct.weight_grams} g` : 'No informado'}</li>
            </ul>

            <div className="land-featured__actions">
              <button
                type="button"
                className="land-btn land-btn--primary"
                onClick={() => addToCart(starProduct.id)}
              >
                Agregar al carrito
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="land-btn land-btn--secondary"
                onClick={() => scrollToId('presupuestar')}
              >
                Pedir presupuesto
              </button>
            </div>
          </div>
        </div>
      </section>

      {discountedProducts.length > 0 && (
        <section id="ofertas" className="land-showcase">
          <div className="land-wrap">
            <div className="land-section-head">
              <p className="land-section-eyebrow">
                <BadgePercent size={14} />
                #ofertas
              </p>
              <h2>Productos con descuento</h2>
              <p>Estos productos tienen descuento activo en este momento.</p>
            </div>

            <div className="land-grid-cards">
              {discountedProducts.slice(0, 4).map((product) => (
                <article
                  key={product.id}
                  className="land-product-card"
                  onClick={() => goToProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      goToProduct(product);
                    }
                  }}
                >
                  <div className="land-product-card__image">
                    <ProductImage product={product} alt={product.name} />
                    <span className="land-product-card__badge">
                      -{toNumber(product.discount)}%
                    </span>
                  </div>

                  <div className="land-product-card__body">
                    <p className="land-product-card__category">
                      {product.category || 'Producto'}
                    </p>

                    <h3>{product.name}</h3>

                    <div className="land-product-card__price">
                      {isDiscountActive(product) &&
                      getOriginalPrice(product) > getDisplayPrice(product) ? (
                        <>
                          <span className="land-price-old">
                            {formatPrice(getOriginalPrice(product))}
                          </span>
                          <span className="land-price-current">
                            {formatPrice(getDisplayPrice(product))}
                          </span>
                        </>
                      ) : (
                        <span className="land-price-current no-discount">
                          {formatPrice(getDisplayPrice(product))}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {newestProducts.length > 0 && (
        <section className="land-showcase land-showcase--alt">
          <div className="land-wrap">
            <div className="land-section-head">
              <p className="land-section-eyebrow">
                <Sparkles size={14} />
                #UltimosLanzamientos
              </p>
              <h2>Nuestros productos</h2>
              <p>Lo más reciente que ya está publicado dentro del catálogo.</p>
            </div>

            <div className="land-grid-cards">
              {newestProducts.map((product) => (
                <article
                  key={product.id}
                  className="land-product-card"
                  onClick={() => goToProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      goToProduct(product);
                    }
                  }}
                >
                  <div className="land-product-card__image">
                    <ProductImage product={product} alt={product.name} />
                  </div>

                  <div className="land-product-card__body">
                    <p className="land-product-card__category">
                      {product.category || 'Producto'}
                    </p>
                    <h3>{product.name}</h3>
                    <p className="land-price-current no-discount">
                      {formatPrice(getDisplayPrice(product))}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="catalogo" className="land-catalog">
        <div className="land-wrap">
          <div className="land-section-head">
            <p className="land-section-eyebrow">
              <Flame size={14} />
              #otrosProductos
            </p>
            <h2>Otros productos que tenemos</h2>
            <p>No vendemos una sola pieza. Esta es parte de la línea disponible actualmente.</p>
          </div>

          {categoriesPreview.length > 0 && (
            <div className="land-categories">
              {categoriesPreview.map((category) => (
                <span key={category} className="land-category-pill">
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="land-grid-cards">
            {otherProducts.length > 0 ? (
              otherProducts.map((product) => (
                <article
                  key={product.id}
                  className="land-product-card"
                  onClick={() => goToProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      goToProduct(product);
                    }
                  }}
                >
                  <div className="land-product-card__image">
                    <ProductImage product={product} alt={product.name} />
                  </div>

                  <div className="land-product-card__body">
                    <p className="land-product-card__category">
                      {product.category || 'Producto'}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="land-product-card__desc">
                      {product.description || 'Producto disponible en nuestro catálogo.'}
                    </p>

                    <p className="land-price-current no-discount">
                      {formatPrice(getDisplayPrice(product))}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="land-empty">
                Por ahora solo hay un producto visible en catálogo.
              </div>
            )}
          </div>
        </div>
      </section>
<section id="presupuestar" className="land-quote">
  <div className="land-wrap land-quote__box">
    <div className="land-quote__copy">
      <p className="land-section-eyebrow">
        <Flame size={14} />
        Presupuesto
      </p>

      <h2>Pedí tu presupuesto</h2>

      <p>
        Seleccioná uno o varios productos, definí una cantidad general y dejános
        tu correo. Te contactamos con precio, disponibilidad y propuesta.
      </p>

      <div className="land-contact">
        <div className="land-contact__item">
          <span className="land-contact__label">Correo</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="land-contact__value">
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="land-contact__item">
          <span className="land-contact__label">Teléfono</span>
          <a href={`tel:${CONTACT_PHONE}`} className="land-contact__value">
            {CONTACT_PHONE}
          </a>
        </div>

        <div className="land-contact__item">
          <span className="land-contact__label">Instagram</span>
          <a
            href={CONTACT_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="land-contact__value"
          >
            {CONTACT_INSTAGRAM.replace(/^https?:\/\/(www\.)?/i, '')}
          </a>
        </div>
      </div>
    </div>

    <div className="land-quote__form-wrap">
      {quoteSent ? (
        <div className="land-quote__success">
          <CheckCircle2 size={40} />
          <h3>Solicitud enviada</h3>
          <p>Te vamos a contactar a la brevedad.</p>

          <button
            type="button"
            className="land-btn land-btn--secondary"
            onClick={() => setQuoteSent(false)}
          >
            Pedir otro presupuesto
          </button>
        </div>
      ) : (
        <form className="land-quote__form" onSubmit={handleQuoteSubmit}>
          <div className="land-field">
            <label htmlFor="quote-email">Correo electrónico</label>
            <input
              id="quote-email"
              type="email"
              name="email"
              value={quoteForm.email}
              onChange={handleQuoteChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="land-field">
            <label>Productos de interés</label>

            <div className="land-product-picker">
              {visibleProducts.map((product) => {
                const selected = quoteForm.productIds.includes(String(product.id));

                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`land-product-pill ${selected ? 'is-selected' : ''}`}
                    onClick={() => handleToggleQuoteProduct(product.id)}
                  >
                    <span className="land-product-pill__check">
                      {selected ? '✓' : ''}
                    </span>
                    <span className="land-product-pill__text">
                      {product.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <small className="land-field__hint">
              Podés seleccionar uno o varios productos.
            </small>
          </div>

          <div className="land-field">
            <label htmlFor="quote-quantity">Cantidad general</label>
            <input
              id="quote-quantity"
              type="number"
              name="quantity"
              min="1"
              value={quoteForm.quantity}
              onChange={handleQuoteChange}
              required
            />

            <small className="land-field__hint">
              La misma cantidad se aplicará a todos los productos elegidos.
            </small>
          </div>

          {quoteForm.productIds.length > 0 && (
            <div className="land-quote__summary">
              <span className="land-quote__summary-label">Seleccionados:</span>
              <div className="land-quote__summary-tags">
                {visibleProducts
                  .filter((product) =>
                    quoteForm.productIds.includes(String(product.id))
                  )
                  .map((product) => (
                    <span key={product.id} className="land-quote__summary-tag">
                      {product.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <button type="submit" className="land-btn land-btn--primary">
            Solicitar presupuesto
          </button>
        </form>
      )}
    </div>
  </div>
</section>
    </main>
  );
}