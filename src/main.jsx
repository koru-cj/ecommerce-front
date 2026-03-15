import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { AuthProvider } from "./auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 👇 leemos el CLIENT ID desde el archivo .env del frontend
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  </GoogleOAuthProvider>
);
