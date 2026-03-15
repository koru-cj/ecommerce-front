// src/pages/Register.jsx
import { useState } from "react";
import { registerUser } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../pages/styles/Login.css"; // usa el mismo estilo

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const result = await registerUser({ name, email, password });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setError("Error inesperado. Intenta más tarde.");
    }
  }

  // 🔹 Registro / login con Google (misma ruta backend)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          window.location.replace("/"); // recarga total y limpia el history
        }, 100); 
      } else {
        setError(data.error || "Error al registrarte con Google");
      }
    } catch (err) {
      console.error("Error Google login:", err);
      setError("Error al autenticar con Google");
    }
  };

  const handleGoogleError = () => {
    setError("❌ Error al conectar con Google. Intenta de nuevo.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Crear cuenta</h1>
        <p className="login-subtitle">Registrate para comenzar</p>

        {successMessage ? (
          <div className="success-message">
            ✅ {successMessage}
            <br />
            Revisá tu correo y verificá tu cuenta antes de iniciar sesión.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              {error && <p className="error-message">{error}</p>}

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="login-button">
                Crear cuenta
              </button>
            </form>

            <div className="divider">
              <span>o</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                text="signup_with"
                theme="filled_black"
                width="300"
              />
            </div>

            <div className="forgot-password">
              ¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
