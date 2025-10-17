'use client';

import { createPluginBridge, type PluginBridge } from '@jtl/platform-plugins-core';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type PluginBridgeContextType = {
  pluginBridge: PluginBridge | null;
  loading: boolean;
  error: string | null;
};

// Create context with default values
const PluginBridgeContext = createContext<PluginBridgeContextType>({
  pluginBridge: null,
  loading: true,
  error: null,
});

// Provider component to initialize and share the plugin bridge instance
export function PluginBridgeProvider({ children }: { children: React.ReactNode }) {
  const [pluginBridge, setPluginBridge] = useState<PluginBridge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the plugin bridge only once
  useEffect(() => {
    createPluginBridge()
      .then(bridge => setPluginBridge(bridge))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to connect to plugin bridge'))
      .finally(() => setLoading(false));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      pluginBridge,
      loading,
      error,
    }),
    [pluginBridge, loading, error],
  );

  return <PluginBridgeContext.Provider value={value}>{children}</PluginBridgeContext.Provider>;
}

// Hook to use the plugin bridge from anywhere in the app
export function usePluginBridge() {
  return useContext(PluginBridgeContext);
}
