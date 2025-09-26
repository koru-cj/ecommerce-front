// web/src/pages/Login.jsx
import LoginForm from '../hooks/Login';
import './styles/Login.css';

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Accede a tu cuenta</p>
        <LoginForm onLogin={user => console.log('Sesión iniciada', user.name)} />
        <div className="forgot-password">
          ¿No Tenés cuenta? <a href="/Register">Registrate</a>
        </div>
      </div>
    </div>
  );
}
