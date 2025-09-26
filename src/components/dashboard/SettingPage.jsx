import { useEffect, useState } from 'react';
import { getPublicSettings, updateSettings } from '../../lib/apiClient';
import './styles/SettingPage.css'

export default function SettingPage() {
  const [form, setForm] = useState({
    nombre_logo: '',
    url_logo: '',
    slogan: '',
    info_extra: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    getPublicSettings()
      .then(data => setForm(data))
      .catch(err => setErrorMsg('Error al cargar configuración'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre_logo.trim()) return 'El nombre del logo es obligatorio';
    if (!form.url_logo.trim()) return 'La URL del logo es obligatoria';
    if (!form.url_logo.startsWith('http') && !form.url_logo.startsWith('/')) return 'La URL del logo debe ser válida';
    if (form.slogan.length > 100) return 'El slogan no puede tener más de 100 caracteres';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSettings(form, token);
      setSuccessMsg('✅ Configuración actualizada correctamente');
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div className="settings-editor">
      <h2>Configuración General</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nombre del logo:
          <input
            type="text"
            name="nombre_logo"
            value={form.nombre_logo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          URL del logo:
          <input
            type="text"
            name="url_logo"
            value={form.url_logo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Slogan:
          <input
            type="text"
            name="slogan"
            value={form.slogan}
            onChange={handleChange}
          />
        </label>

        <label>
          Info extra:
          <textarea
            name="info_extra"
            value={form.info_extra}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      {successMsg && <p className="success-msg">{successMsg}</p>}
    </div>
  );
}
