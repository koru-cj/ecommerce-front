import { useState } from 'react';
import { registerUser } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterForm({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const errs = {};

    if (!name.trim()) {
      errs.name = 'El nombre es obligatorio';
    } else if (name.trim().length < 2) {
      errs.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email) {
      errs.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Correo inválido';
    }

    if (!password) {
      errs.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errs.password = 'Debe tener al menos 6 caracteres';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await registerUser({ name, email, password });
      if (result.token && result.user) {
        login(result.token, result.user);
        onRegister?.(result.user);
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Error al registrarse' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Error inesperado. Intenta más tarde.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`form-input ${errors.name ? 'input-error' : ''}`}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`form-input ${errors.email ? 'input-error' : ''}`}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`form-input ${errors.password ? 'input-error' : ''}`}
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      <button type="submit" className="register-button">
        Crear cuenta
      </button>
    </form>
  );
}
