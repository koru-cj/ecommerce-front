import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

export default function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const errs = {};
    if (!credentials.email) {
      errs.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errs.email = 'Formato de email inválido';
    }

    if (!credentials.password) {
      errs.password = 'La contraseña es obligatoria';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await loginUser(credentials);
      if (data?.token && data?.user) {
        login(data.token, data.user);
        onLogin?.(data.user);
        navigate('/dashboard');
      } else {
        setErrors({ general: 'Credenciales inválidas' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Error al iniciar sesión. Intenta más tarde.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={e =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          className={`form-input ${errors.email ? 'input-error' : ''}`}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Contraseña"
          value={credentials.password}
          onChange={e =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          className={`form-input ${errors.password ? 'input-error' : ''}`}
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      <button type="submit" className="login-button">
        Iniciar Sesión
      </button>
    </form>
  );
}
