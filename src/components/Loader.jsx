// src/components/Loader.jsx
import './styles/Loader.css';
import { useSettings } from '../context/settingsContext';

export default function Loader() {
  
  const { settings } = useSettings();
  return (
    <div className="loader-wrapper">
      <div className="loader-logo">{settings.nombre_logo || 'Fuego-Eterno'}</div>
      <div className="loader-ring"></div>
    </div>
  );
}
