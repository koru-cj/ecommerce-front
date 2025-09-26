// src/pages/Checkout.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Checkout.css'
import { getProfile, getCart, updateUserInfo, checkoutInit } from '../lib/apiClient'; // ajusta el path si cambia



export default function Checkout() {
  const [step, setStep] = useState(1); // 1..4
  const [profile, setProfile] = useState({
    phone: '', document_number: '', address: '',
    city: '', postal_code: '', country: 'Argentina',
  });
  const [cart, setCart] = useState([]);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState('whatsapp'); // 'whatsapp' | 'mercadopago'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n || 0));

  const subtotal = cart.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);

  
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const [me, cartRows] = await Promise.all([
          getProfile(token),
          getCart(),
        ]);
        setProfile((p) => ({
          ...p,
          phone: me?.phone ?? '',
          document_number: me?.document_number ?? '',
          address: me?.address ?? '',
          city: me?.city ?? '',
          postal_code: me?.postal_code ?? '',
          country: me?.country ?? 'Argentina',
        }));
        setCart(cartRows || []);
      } catch (e) {
        console.error('Checkout preload error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canContinueUserInfo = () => {
    const { phone, document_number, address, city, postal_code, country } = profile;
    return [phone, document_number, address, city, postal_code, country].every(Boolean);
  };

  const saveUserInfo = async () => {
    setSaving(true);
    try {
      await updateUserInfo(profile);
      setStep(2);
    } catch (e) {
      console.error('save profile', e);
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

    const [submitting, setSubmitting] = useState(false);

const goPay = async () => {
  if (!cart.length) return alert('Tu carrito está vacío.');
  setSubmitting(true);

  // Pre-abrí la pestaña para que no la bloquee el popup-blocker
  const newWin = window.open('', '_blank');

  try {
    const { pay_url, mp_init_point, orderId } = await checkoutInit(method);
    const url = method === 'mercadopago' ? mp_init_point : pay_url;

    if (url) {
      if (newWin) {
        newWin.opener = null; // seguridad
        newWin.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // fallback: misma pestaña a detalle de orden
      navigate(orderId ? `/orders/${orderId}` : '/profile');
    }
  } catch (e) {
    if (newWin) newWin.close(); // limpiá la pestaña en caso de error
    alert(e.message || 'No se pudo iniciar el checkout');
  } finally {
    setSubmitting(false);
  }
};


  const stepTitles = [
    'Información Personal',
    'Confirmar Pedido',
    'Método de Pago',
    'Finalizar Compra'
  ];

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

      {/* Ultra Modern Steps Navigation */}
      <div className="steps-nav">
        {[1, 2, 3, 4].map(n => (
          <div 
            key={n}
            className={`step-item ${step === n ? 'active' : ''} ${step > n ? 'completed' : ''}`}
            data-step={n}
            onClick={() => {
              if (n < step || (n === 2 && canContinueUserInfo()) || n === 1) {
                setStep(n);
              }
            }}
          >
            <span>{stepTitles[n-1]}</span>
          </div>
        ))}
      </div>

      {/* Step 1: User Information */}
      {step === 1 && (
        <section className="checkout-section">
          <h2 className="section-title">📋 Información Personal</h2>
          
          <div className="form-grid">
            <div className="input-group">
              <input 
                className="checkout-input" 
                placeholder="Número de teléfono"
                value={profile.phone} 
                onChange={e => setProfile({...profile, phone: e.target.value})}
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                className="checkout-input" 
                placeholder="DNI / Documento de identidad"
                value={profile.document_number} 
                onChange={e => setProfile({...profile, document_number: e.target.value})}
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                className="checkout-input" 
                placeholder="Dirección completa"
                value={profile.address} 
                onChange={e => setProfile({...profile, address: e.target.value})}
                required
              />
            </div>
            
            <div className="form-grid two-cols">
              <div className="input-group">
                <input 
                  className="checkout-input" 
                  placeholder="Ciudad"
                  value={profile.city} 
                  onChange={e => setProfile({...profile, city: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <input 
                  className="checkout-input" 
                  placeholder="Código Postal"
                  value={profile.postal_code} 
                  onChange={e => setProfile({...profile, postal_code: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <input 
                className="checkout-input" 
                placeholder="País"
                value={profile.country} 
                onChange={e => setProfile({...profile, country: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="btn-group">
            <button 
              className="checkout-btn btn-primary" 
              onClick={() => setStep(2)} 
              disabled={!canContinueUserInfo()}
            >
              Continuar
            </button>
            <button 
              className="checkout-btn btn-secondary" 
              onClick={saveUserInfo} 
              disabled={saving}
            >
              {saving && <span className="loading-spinner"></span>}
              Guardar y Continuar
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Order Confirmation */}
      {step === 2 && (
        <section className="checkout-section">
          <h2 className="section-title">✅ Confirmar Pedido</h2>
          
          {cart.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: 'var(--color-muted)',
              fontSize: '1.2rem' 
            }}>
              🛒 No hay productos en tu carrito
            </div>
          ) : (
            <div className="cart-summary">
              <div style={{ marginBottom: '1.5rem' }}>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.9rem', 
                        color: 'var(--color-muted)',
                        marginTop: '0.25rem'
                      }}>
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
            <button className="checkout-btn btn-secondary" onClick={() => setStep(1)}>
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

      {/* Step 3: Payment Method */}
      {step === 3 && (
        <section className="checkout-section">
          <h2 className="section-title">💳 Método de Pago</h2>
          
          <div className="payment-methods">
            <div className={`payment-option ${method === 'whatsapp' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="payment" 
                value="whatsapp"
                checked={method === 'whatsapp'} 
                onChange={() => setMethod('whatsapp')}
              />
              <label className="payment-label">
                <span className="payment-icon">💬</span>
                <div>
                  <strong>WhatsApp / Transferencia</strong>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--color-muted)',
                    marginTop: '0.25rem' 
                  }}>
                    Confirmaremos tu pedido manualmente
                  </div>
                </div>
              </label>
            </div>
            
            <div className={`payment-option disabled ${method === 'mercadopago' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="payment" 
                value="mercadopago"
                disabled 
                onChange={() => setMethod('mercadopago')}
              />
              <label className="payment-label">
                <span className="payment-icon">🏦</span>
                <div>
                  <strong>MercadoPago</strong>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--color-muted)',
                    marginTop: '0.25rem' 
                  }}>
                    Próximamente disponible
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="btn-group">
            <button className="checkout-btn btn-secondary" onClick={() => setStep(2)}>
              ← Atrás
            </button>
            <button className="checkout-btn btn-primary" onClick={() => setStep(4)}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Final */}
      {step === 4 && (
        <section className="checkout-section">
          <h2 className="section-title">🚀 Finalizar Compra</h2>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: 'var(--color-light)',
            lineHeight: '1.6'
          }}>
            <div style={{ 
              fontSize: '1.2rem', 
              marginBottom: '2rem',
              color: 'var(--color-info)'
            }}>
              🎉 ¡Estás a un paso de completar tu pedido!
            </div>
            <p style={{ marginBottom: '2rem' }}>
              Generaremos tu orden y te redirigiremos a WhatsApp con el resumen completo 
              de tu compra para finalizar el proceso.
            </p>
            
            <div style={{
              background: 'rgba(254, 137, 50, 0.1)',
              border: '1px solid var(--color-secondary)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <strong style={{ color: 'var(--color-secondary)' }}>
                Total a pagar: {formatPrice(subtotal)}
              </strong>
            </div>
          </div>

          <div className="btn-group">
            <button className="checkout-btn btn-secondary" onClick={() => setStep(3)}>
              ← Atrás
            </button>
            <button className="checkout-btn btn-primary" onClick={goPay}  disabled={submitting}>
              <span style={{ marginRight: '0.5rem' }}>💬</span>
              {submitting ? 'Generando…' : 'Ir a WhatsApp'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}