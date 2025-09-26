import { useEffect, useState } from 'react';
import { getProfile, updateUserInfo } from '../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import Loader from '../components/Loader';
import './styles/Profile.css';

export default function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    document_number: '',
    street: '',
    number: '',
    apartment: '',
    city: '',
    postal_code: '',
    country: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!token) return;

    getProfile(token)
      .then(data => {
        const [street = '', number = '', apartment = ''] = (data.address || '').split(/\s(?=\d)|,\s?/);
        const safeData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          document_number: data.document_number || '',
          street,
          number,
          apartment,
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || ''
        };

        setProfile(safeData);
        setForm(safeData);
      })
      .catch(err => {
        console.error('❌ Error al obtener perfil:', err);
        setError('Error al obtener el perfil');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const errors = {};

    const address = `${form.street} ${form.number}${form.apartment ? ', ' + form.apartment : ''}`.trim();
    if (address.length > 60) {
      errors.address = 'La dirección es demasiado larga (máx 60 caracteres).';
    }

    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) {
      errors.phone = 'El número de teléfono no es válido.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const cleanedForm = {
        phone: form.phone.trim(),
        document_number: form.document_number.trim(),
        address,
        city: form.city.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
      };

      const updated = await updateUserInfo(cleanedForm);

      const merged = {
        ...form,
        ...updated,
        street: form.street,
        number: form.number,
        apartment: form.apartment,
        address: updated.address || address
      };

      setProfile(merged);
      setForm(merged);
      setMessage('Perfil actualizado con éxito ✅');
    } catch (err) {
      console.error('❌ Error al actualizar perfil:', err);
      setError('Error al actualizar el perfil');
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="profile-container">
      <h1>Mi Perfil</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="field-group">
          <label>Nombre</label>
          <input type="text" name="name" value={form.name} disabled />
        </div>

        <div className="field-group">
          <label>Email</label>
          <input type="email" name="email" value={form.email} disabled />
        </div>

        <div className="field-group">
          <label>Teléfono</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
          {validationErrors.phone && <p className="error-msg">{validationErrors.phone}</p>}
        </div>

        <div className="field-group">
          <label>Documento</label>
          <input type="text" name="document_number" value={form.document_number} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
        </div>

        <div className="field-group">
          <label>Calle</label>
          <input type="text" name="street" value={form.street} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
        </div>

        <div className="field-group">
          <label>Número</label>
          <input type="text" name="number" value={form.number} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''} />
        </div>

        <div className="field-group">
          <label>Departamento</label>
          <input type="text" name="apartment" value={form.apartment} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
          {validationErrors.address && <p className="error-msg">{validationErrors.address}</p>}
        </div>

        <div className="field-group">
          <label>Ciudad</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
        </div>

        <div className="field-group">
          <label>Código Postal</label>
          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
        </div>

        <div className="field-group">
          <label>País</label>
          <input type="text" name="country" value={form.country} onChange={handleChange} className={validationErrors.phone ? 'input-error' : form.phone ? 'input-valid' : ''}/>
        </div>

        <button className="btn" type="submit">Guardar Cambios</button>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}
