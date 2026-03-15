import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Checkout.css';
import {
  getProfile,
  getCart,
  updateUserInfo,
  checkoutInit,
} from '../lib/apiClient';

const INITIAL_PROFILE = {
  phone: '',
  document_number: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'Argentina',
};

export default function Checkout() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState('whatsapp');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number(n || 0));

  const normalizedProfile = useMemo(
    () => ({
      phone: profile.phone.trim(),
      document_number: profile.document_number.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      postal_code: profile.postal_code.trim(),
      country: profile.country.trim(),
    }),
    [profile]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cart]
  );

  const canContinueUserInfo = useMemo(() => {
    const { phone, document_number, address, city, postal_code, country } =
      normalizedProfile;

    return [phone, document_number, address, city, postal_code, country].every(
      (v) => v.length > 0
    );
  }, [normalizedProfile]);

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [me, cartRows] = await Promise.all([getProfile(token), getCart()]);

        setProfile({
          phone: me?.phone ?? '',
          document_number: me?.document_number ?? '',
          address: me?.address ?? '',
          city: me?.city ?? '',
          postal_code: me?.postal_code ?? '',
          country: me?.country ?? 'Argentina',
        });

        setProfileSaved(
          Boolean(
            me?.phone &&
              me?.document_number &&
              me?.address &&
              me?.city &&
              me?.postal_code &&
              me?.country
          )
        );

        setCart(Array.isArray(cartRows) ? cartRows : []);
      } catch (e) {
        console.error('Checkout preload error', e);
        setError('No se pudo cargar la información del checkout.');
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [navigate]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setProfileSaved(false);
  };

  const handleSaveAndContinue = async () => {
    if (!canContinueUserInfo) {
      setError('Completá todos los datos obligatorios antes de continuar.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateUserInfo(normalizedProfile);
      setProfileSaved(true);
      setStep(2);
    } catch (e) {
      console.error('save profile', e);
      setError(e.message || 'No se pudo guardar tu información.');
    } finally {
      setSaving(false);
    }
  };

  const goPay = async () => {
    if (!cart.length) {
      setError('Tu carrito está vacío.');
      return;
    }

    if (!profileSaved) {
      setError('Guardá primero tu información personal antes de finalizar.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setError('');

    let newWin = null;

    try {
      newWin = window.open('', '_blank', 'noopener,noreferrer');

      const { pay_url, mp_init_point, orderId } = await checkoutInit(method);

      const url = method === 'mercadopago' ? mp_init_point : pay_url;

      if (url) {
        if (newWin) {
          newWin.opener = null;
          newWin.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      if (newWin) newWin.close();
      navigate(orderId ? `/orders/${orderId}` : '/profile');
    } catch (e) {
      console.error('checkout init error', e);
      if (newWin) newWin.close();
      setError(e.message || 'No se pudo iniciar el checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === 1) {
      setStep(1);
      return;
    }

    if (targetStep === 2 && canContinueUserInfo) {
      setStep(2);
      return;
    }

    if (targetStep === 3 && canContinueUserInfo && cart.length > 0) {
      setStep(3);
      return;
    }

    if (targetStep === 4 && canContinueUserInfo && cart.length > 0) {
      setStep(4);
    }
  };

  const stepTitles = [
    'Información Personal',
    'Confirmar Pedido',
    'Método de Pago',
    'Finalizar Compra',
  ];

  const finalTitle =
    method === 'mercadopago' ? 'Ir a Mercado Pago' : 'Ir a WhatsApp';

  const finalDescription =
    method === 'mercadopago'
      ? 'Generaremos tu orden y te redirigiremos a Mercado Pago para completar el pago.'
      : 'Generaremos tu orden y te redirigiremos a WhatsApp con el resumen completo de tu compra para finalizar el proceso.';

  const finalButtonIcon = method === 'mercadopago' ? '💳' : '💬';

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-section">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
            <span style={{ color: 'var(--color-light)', marginLeft: '1rem' }}>
              Cargando información...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>

      {error && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 90, 90, 0.35)',
            background: 'rgba(255, 90, 90, 0.08)',
            color: '#ffd5d5',
          }}
        >
          {error}
        </div>
      )}

      <div className="steps-nav">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`step-item ${step === n ? 'active' : ''} ${
              step > n ? 'completed' : ''
            }`}
            data-step={n}
            onClick={() => handleStepClick(n)}
          >
            <span>{stepTitles[n - 1]}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="checkout-section">
          <h2 className="section-title">📋 Información Personal</h2>

          <div className="form-grid">
            <div className="input-group">
              <input
                className="checkout-input"
                placeholder="Número de teléfono"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                className="checkout-input"
                placeholder="DNI / Documento de identidad"
                value={profile.document_number}
                onChange={(e) =>
                  handleProfileChange('document_number', e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <input
                className="checkout-input"
                placeholder="Dirección completa"
                value={profile.address}
                onChange={(e) => handleProfileChange('address', e.target.value)}
              />
            </div>

            <div className="form-grid two-cols">
              <div className="input-group">
                <input
                  className="checkout-input"
                  placeholder="Ciudad"
                  value={profile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                />
              </div>

              <div className="input-group">
                <input
                  className="checkout-input"
                  placeholder="Código Postal"
                  value={profile.postal_code}
                  onChange={(e) =>
                    handleProfileChange('postal_code', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <input
                className="checkout-input"
                placeholder="País"
                value={profile.country}
                onChange={(e) => handleProfileChange('country', e.target.value)}
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              className="checkout-btn btn-secondary"
              onClick={() => navigate('/cart')}
            >
              ← Volver al carrito
            </button>

            <button
              className="checkout-btn btn-primary"
              onClick={handleSaveAndContinue}
              disabled={saving || !canContinueUserInfo}
            >
              {saving ? 'Guardando…' : 'Guardar y Continuar'}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="checkout-section">
          <h2 className="section-title">✅ Confirmar Pedido</h2>

          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--color-muted)',
                fontSize: '1.2rem',
              }}
            >
              🛒 No hay productos en tu carrito
            </div>
          ) : (
            <div className="cart-summary">
              <div style={{ marginBottom: '1.5rem' }}>
                {cart.map((item) => (
                  <div key={item.id ?? item.product_id} className="cart-item">
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          color: 'var(--color-muted)',
                          marginTop: '0.25rem',
                        }}
                      >
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                    <div className="item-price">
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-row">
                <div className="total-label">Subtotal</div>
                <div className="total-amount">{formatPrice(subtotal)}</div>
              </div>
            </div>
          )}

          <div className="btn-group">
            <button
              className="checkout-btn btn-secondary"
              onClick={() => setStep(1)}
            >
              ← Atrás
            </button>
            <button
              className="checkout-btn btn-primary"
              onClick={() => setStep(3)}
              disabled={cart.length === 0}
            >
              Confirmar y Continuar
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="checkout-section">
          <h2 className="section-title">💳 Método de Pago</h2>

          <div className="payment-methods">
  <div className={`payment-option ${method === 'whatsapp' ? 'selected' : ''}`}>
    <input
      id="payment-whatsapp"
      type="radio"
      name="payment"
      value="whatsapp"
      checked={method === 'whatsapp'}
      onChange={() => setMethod('whatsapp')}
    />
    <label className="payment-label" htmlFor="payment-whatsapp">
      <span className="payment-icon">💬</span>
      <div>
        <strong>WhatsApp / Transferencia</strong>
        <div
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-muted)',
            marginTop: '0.25rem',
          }}
        >
          Confirmaremos tu pedido manualmente
        </div>
      </div>
    </label>
  </div>

  <div className={`payment-option ${method === 'mercadopago' ? 'selected' : ''}`}>
    <input
      id="payment-mercadopago"
      type="radio"
      name="payment"
      value="mercadopago"
      checked={method === 'mercadopago'}
      onChange={() => setMethod('mercadopago')}
    />
    <label className="payment-label" htmlFor="payment-mercadopago">
      <span className="payment-icon">🏦</span>
      <div>
        <strong>Mercado Pago</strong>
        <div
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-muted)',
            marginTop: '0.25rem',
          }}
        >
          Pago online con Checkout Pro
        </div>
      </div>
    </label>
  </div>
</div>


          <div className="btn-group">
            <button
              className="checkout-btn btn-secondary"
              onClick={() => setStep(2)}
            >
              ← Atrás
            </button>
            <button
              className="checkout-btn btn-primary"
              onClick={() => setStep(4)}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="checkout-section">
          <h2 className="section-title">🚀 Finalizar Compra</h2>

          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--color-light)',
              lineHeight: '1.6',
            }}
          >
            <div
              style={{
                fontSize: '1.2rem',
                marginBottom: '2rem',
                color: 'var(--color-info)',
              }}
            >
              🎉 ¡Estás a un paso de completar tu pedido!
            </div>

            <p style={{ marginBottom: '2rem' }}>{finalDescription}</p>

            <div
              style={{
                background: 'rgba(254, 137, 50, 0.1)',
                border: '1px solid var(--color-secondary)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ marginBottom: '0.5rem', opacity: 0.85 }}>
                Método seleccionado:{' '}
                <strong>
                  {method === 'mercadopago'
                    ? 'Mercado Pago'
                    : 'WhatsApp / Transferencia'}
                </strong>
              </div>

              <strong style={{ color: 'var(--color-secondary)' }}>
                Total a pagar: {formatPrice(subtotal)}
              </strong>
            </div>
          </div>

          <div className="btn-group">
            <button
              className="checkout-btn btn-secondary"
              onClick={() => setStep(3)}
              disabled={submitting}
            >
              ← Atrás
            </button>

            <button
              className="checkout-btn btn-primary"
              onClick={goPay}
              disabled={submitting}
            >
              <span style={{ marginRight: '0.5rem' }}>{finalButtonIcon}</span>
              {submitting ? 'Generando…' : finalTitle}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
