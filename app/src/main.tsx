import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import './i18n';
import App from './App';
import { SessionProvider } from './context/SessionContext';

// Bundle the Khmer webfont so the script renders consistently on every device.
import '@fontsource/noto-sans-khmer/400.css';
import '@fontsource/noto-sans-khmer/700.css';

/* Ionic core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/text-alignment.css';
import './theme/variables.css';

setupIonicReact({ mode: 'md' });

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>,
);

// Register the PWA service worker in production builds only (avoids dev HMR conflicts).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is best-effort */ });
  });
}
