import { AppBridge } from '@jtl-software/cloud-apps-core';
import './App.css';
import { ErpPage, PanePage, SetupPage, WelcomePage } from './pages';
import { useEffect } from 'react';

type AppMode = 'setup' | 'erp' | 'pane';

const App: React.FC<{ appBridge: AppBridge | null }> = ({ appBridge }) => {
  const mode: AppMode = location.pathname.substring(1) as AppMode;

  useEffect((): void => {
    if (appBridge) {
      console.log('[HelloWorldApp] bridge created!');
    }
  }, [appBridge]);

  if (!appBridge) {
    return <WelcomePage />;
  }

  switch (mode) {
    case 'setup':
      return <SetupPage appBridge={appBridge} />;
    case 'erp':
      return <ErpPage appBridge={appBridge} />;
    case 'pane':
      return <PanePage appBridge={appBridge} />;
    default:
      return <WelcomePage />;
  }
};

export default App;
