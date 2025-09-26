import { useEffect, useState } from 'react';
import { getActiveTheme } from '../../lib/apiClient';
import Loader from '../Loader';

function applyThemeVariables(variables) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
}

export default function ThemeLoader({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getActiveTheme()
      .then(applyThemeVariables)
      .catch(err => console.error('❌ Error al aplicar theme:', err))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <Loader />;

  return <>{children}</>;
}
