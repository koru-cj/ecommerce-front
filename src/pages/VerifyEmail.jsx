import { useEffect, useState } from "react";
import { resendVerificationEmail } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
import "./styles/VerifyEmail.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const navigate = useNavigate();

  // ⏳ Verificar token
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setStatus("success");

          // ⏱️ Iniciar cuenta regresiva de 5s para redirigir a login
          let counter = 5;
          const interval = setInterval(() => {
            counter--;
            setRedirectCountdown(counter);
            if (counter === 0) {
              clearInterval(interval);
              navigate("/login");
            }
          }, 1000);
        } else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [navigate]);

  // 🔁 Reenviar verificación
  async function handleResend() {
    if (!email) {
      setResendMessage("⚠️ Ingresá tu correo.");
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
      <div className={`verify-card fade-in`}>
        {status === "loading" && (
          <p className="verify-status">⏳ Verificando tu cuenta...</p>
        )}

        {status === "success" && (
          <>
            <h2 className="verify-title">✅ ¡Cuenta verificada con éxito!</h2>
            <p className="verify-subtitle">
              Serás redirigido automáticamente al inicio de sesión
              <br /> en {redirectCountdown} segundos...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="verify-button"
            >
              Ir al login ahora
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="verify-title">⚠️ Token inválido o expirado</h2>
            <p className="verify-subtitle">
              Podés solicitar un nuevo enlace de verificación ingresando tu
              correo:
            </p>

            <div className="verify-form">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="verify-input"
              />
              <button
                onClick={handleResend}
                disabled={resending}
                className="verify-button"
              >
                {resending ? "Enviando..." : "Reenviar enlace"}
              </button>
            </div>

            {resendMessage && (
              <p
                className={`verify-message ${
                  resendMessage.startsWith("✅") ? "success" : "error"
                }`}
              >
                {resendMessage}
              </p>
            )}

            <div className="verify-links">
              <a href="/register">Volver al registro</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
