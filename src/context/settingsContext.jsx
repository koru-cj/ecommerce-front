import { createContext, useContext, useEffect, useState } from 'react';
import { getPublicSettings } from '../lib/apiClient';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
    useEffect(() => {
    getPublicSettings()
        .then((data) => {
        setSettings(data); 
        })
        .catch((err) => console.error('❌ Error al cargar settings públicos:', err));
    }, []);


  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
