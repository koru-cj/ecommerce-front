import { useEffect, useState } from "react";
import { getProfile, updateUserInfo, resendVerificationEmail } from "../lib/apiClient";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";
import "./styles/Profile.css";

export default function Profile() {
  const { token, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    document_number: "",
    street: "",
    number: "",
    apartment: "",
    city: "",
    postal_code: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [verifyMsg, setVerifyMsg] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!token) return;

    getProfile(token)
      .then((data) => {
        const [street = "", number = "", apartment = ""] = (data.address || "").split(/\s(?=\d)|,\s?/);
        const safeData = {
          ...data,
          street,
          number,
          apartment,
        };
        setProfile(safeData);
        setForm(safeData);
      })
      .catch((err) => {
        console.error("❌ Error al obtener perfil:", err);
        setError("Error al obtener el perfil");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const errors = {};
    const address = `${form.street} ${form.number}${form.apartment ? ", " + form.apartment : ""}`.trim();

    if (address.length > 60) errors.address = "La dirección es demasiado larga (máx 60 caracteres).";
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) errors.phone = "El número de teléfono no es válido.";

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
      const merged = { ...form, ...updated, address: updated.address || address };

      setProfile(merged);
      setForm(merged);
      setMessage("Perfil actualizado con éxito ✅");
    } catch (err) {
      console.error("❌ Error al actualizar perfil:", err);
      setError("Error al actualizar el perfil");
    }
  };

  const handleResendVerification = async () => {
    setVerificando(true);
    setVerifyMsg(null);
    const result = await resendVerificationEmail(profile.email);
    if (result.error) setVerifyMsg(`⚠️ ${result.error}`);
    else setVerifyMsg(`✅ ${result.message}`);
    setVerificando(false);
  };

  const handleSyncGoogle = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al sincronizar");

      setProfile((prev) => ({
        ...prev,
        name: data.user.name,
        avatar_url: data.user.avatar_url,
        verificado: data.user.verificado,
      }));

      setMessage("✅ Datos sincronizados con Google");
    } catch (err) {
      console.error("💥 Error sincronizando con Google:", err);
      setError("Error al sincronizar con Google");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="profile-container">
      <h1>Mi Perfil</h1>

      {/* HEADER DEL PERFIL */}
      <div className="profile-header">
        {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="profile-avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--color-primary)",
                marginBottom: "1rem",
              }}
            />
          ) : (
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "var(--color-bg-soft)",
                border: "2px dashed var(--color-border-soft)",
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "var(--color-muted)",
              }}
            >
              👤
            </div>
            

          )}
          


        <div>
           <h2>{profile?.name || "Usuario"}</h2>
            <p style={{ color: "var(--color-muted)", marginBottom: "0.5rem" }}>
              {profile?.email}
            </p>

            {profile?.verificado ? (
              <p style={{ color: "var(--color-success)", fontSize: "0.9rem" }}>✅ Correo verificado</p>
            ) : (
              <p style={{ color: "var(--color-warning)", fontSize: "0.9rem" }}>⚠️ Correo sin verificar</p>
            )}

          {profile?.google_id && (
            <>
              <p className="google-linked">
                🔗 Conectado con Google — datos sincronizados automáticamente
              </p>
              
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  try {
                    setVerificando(true);
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-sync`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    const data = await res.json();
                    if (res.ok) {
                      updateUser(data.user); // ✅ Guarda avatar_url y demás en localStorage
                      setProfile(data.user);
                      setVerifyMsg("✅ Perfil sincronizado con Google");
                    } else {
                      setVerifyMsg(`⚠️ ${data.error || "Error al sincronizar"}`);
                    }
                  } catch (err) {
                    console.error("💥 Error al sincronizar:", err);
                    setVerifyMsg("Error al sincronizar con Google");
                  } finally {
                    setVerificando(false);
                  }
                }}
                disabled={verificando}
              >
                {verificando ? "Sincronizando..." : "🔄 Sincronizar con Google"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* FORMULARIO */}
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
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={validationErrors.phone ? "input-error" : form.phone ? "input-valid" : ""}
          />
          {validationErrors.phone && <p className="error-msg">{validationErrors.phone}</p>}
        </div>

        <div className="field-group">
          <label>Documento</label>
          <input type="text" name="document_number" value={form.document_number} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>Dirección</label>
          <input type="text" name="street" value={form.street} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>Número</label>
          <input type="text" name="number" value={form.number} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>Departamento</label>
          <input type="text" name="apartment" value={form.apartment} onChange={handleChange} />
          {validationErrors.address && <p className="error-msg">{validationErrors.address}</p>}
        </div>

        <div className="field-group">
          <label>Ciudad</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>Código Postal</label>
          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label>País</label>
          <input type="text" name="country" value={form.country} onChange={handleChange} />
        </div>

        <button className="btn" type="submit">
          Guardar Cambios
        </button>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </form>

      {/* BLOQUE DE VERIFICACIÓN SOLO SI NO TIENE GOOGLE */}
      {!profile?.verificado && !profile?.google_id && (
        <div className="verify-block">
          <p style={{ fontSize: "0.9rem", color: "#666" }}>⚠️ Tu correo aún no está verificado.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResendVerification}
            disabled={verificando}
            style={{ marginTop: "6px" }}
          >
            {verificando ? "Enviando..." : "Reenviar verificación"}
          </button>

          {verifyMsg && (
            <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>{verifyMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
