import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createAppBridge, AppBridge } from '@jtl-software/cloud-apps-core';

const root = createRoot(document.getElementById('root')!);

function render(appBridge?: AppBridge) {
  root.render(
    <StrictMode>
      <App appBridge={appBridge} />
    </StrictMode>,
  );
}

// Show something immediately while the bridge connects
render(undefined);

createAppBridge()
  .then(appBridge => render(appBridge))
  .catch(err => {
    console.warn('AppBridge not available (running outside JTL Platform?):', err);
    // Keep rendering without bridge — ERP info calls still work
  });
