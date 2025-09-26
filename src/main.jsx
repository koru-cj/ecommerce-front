import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';       // ← asegúrate de que exista ESTE archivo
import { AuthProvider } from './auth/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>

      <App />
    </AuthProvider>
  </StrictMode>
);