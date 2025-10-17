import { AuthProvider } from '@/hooks/useAuth';
import { PluginBridgeProvider } from '@/hooks/usePluginBridge';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PluginBridgeProvider>
        <div className="p-6">{children}</div>
      </PluginBridgeProvider>
    </AuthProvider>
  );
}
