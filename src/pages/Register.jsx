// web/src/pages/Register.jsx

import RegisterForm from '../hooks/Register';
import './styles/Register.css'

export default function Register() {
  return (
        <div className="register-container">
      <div className="register-card">
        <div className="register-welcome">
          <h1 className="register-title">¡Únete a nosotros!</h1>
          <p className="register-subtitle">Crea tu cuenta y comienza a disfrutar</p>
          
          <div className="register-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Envío gratis</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Ofertas exclusivas</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
        
        <RegisterForm onRegister={user => console.log('Registrado:', user)} />
        
        <div className="login-link">
          <p>¿Ya tienes cuenta?</p>
          <a href="/login">Iniciar sesión</a>
        </div>
      </div>
    </div>
  );
}