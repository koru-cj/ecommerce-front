// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser } from "../lib/apiClient";
import "../pages/styles/Login.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const result = await loginUser({ email, password });
      if (result.error) {
        setError(result.error);
      } else {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        setTimeout(() => {
          window.location.replace("/"); // recarga total y limpia el history
        }, 100);    
      }
    } catch (err) {
      console.error(err);
      setError("Error inesperado al iniciar sesión");
    }
  }

  // 🔹 Login con Google
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
        setError(data.error || "Error al iniciar sesión con Google");
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
        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Accede a tu cuenta</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message">{error}</p>}

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
            Iniciar sesión
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
            text="continue_with"
            theme="filled_black"
            width="300"
          />
        </div>

        <div className="forgot-password">
          ¿No tenés cuenta? <a href="/register">Registrate</a>
        </div>
      </div>
    </div>
  );
}
