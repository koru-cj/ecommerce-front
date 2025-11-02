import { useEffect, useState } from "react";
import { resendVerificationEmail } from "../lib/apiClient";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);
  async function handleResend() {
    if (!email) {
        setResendMessage("Por favor, ingresá tu correo.");
        return;
    }

    setResending(true);
    setResendMessage("");

    const result = await resendVerificationEmail(email);

    if (result.error) setResendMessage(`⚠️ ${result.error}`);
    else setResendMessage(`✅ ${result.message}`);

    setResending(false);
    }



  return (
    <div className="verify-container">
      {status === "loading" && <p>Verificando tu cuenta...</p>}

      {status === "success" && (
        <>
          <h2>✅ ¡Cuenta verificada con éxito!</h2>
          <p>Ahora podés iniciar sesión con tu correo y contraseña.</p>
          <a href="/login" className="btn-primary">
            Iniciar sesión
          </a>
        </>
      )}

      {status === "error" && (
        <>
          <h2>⚠️ Token inválido o expirado</h2>
          <p>Podés solicitar un nuevo enlace de verificación ingresando tu correo:</p>

          <div style={{ marginTop: "1rem" }}>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn-secondary"
              style={{ marginLeft: "8px" }}
            >
              {resending ? "Enviando..." : "Reenviar enlace"}
            </button>
          </div>

          {resendMessage && (
            <p style={{ marginTop: "0.5rem" }}>{resendMessage}</p>
          )}

          <p style={{ marginTop: "1.5rem" }}>
            <a href="/register" className="link">
              Volver al registro
            </a>
          </p>
        </>
      )}
    </div>
  );

}
