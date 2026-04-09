import { useCallback, useState } from 'react';
import ISetupPageProps from './ISetupPageProps';
import { Button } from '@jtl-software/platform-ui-react';
import { apiUrl } from '../../common/constants';

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

const SetupPage: React.FC<ISetupPageProps> = ({ appBridge }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  const handleSetupCompleted = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const sessionToken = await appBridge.method.call('getSessionToken');

      // Decode JWT client-side to show tenantSlug immediately (no verification needed here)
      const jwtPayload = decodeJwtPayload(sessionToken as string);
      const slug = (jwtPayload.tenantSlug as string) ?? null;
      setTenantSlug(slug);

      const response = await fetch(`${apiUrl}/connect-tenant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const tenantInfo = {
          tenantId: data.tenantId as string,
          jtlTenantId: data.jtlTenantId as string,
          tenantSlug: (data.tenantSlug ?? slug ?? '') as string,
        };
        localStorage.setItem('tenantId', tenantInfo.tenantId);
        localStorage.setItem('jtlTenantId', tenantInfo.jtlTenantId);
        localStorage.setItem('tenantSlug', tenantInfo.tenantSlug);

        // Notify other windows/iframes (e.g. ERP dialog) via BroadcastChannel
        const channel = new BroadcastChannel('tenant-info');
        channel.postMessage(tenantInfo);
        channel.close();

        await appBridge.method.call('setupCompleted');
      } else {
        console.error('Setup failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('An error occurred during setup:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appBridge]);

  if (isLoading) {
    return (
      <div>
        <h1>Loading…</h1>
        {tenantSlug && <p>Tenant: <strong>{tenantSlug}</strong></p>}
        <p>Please wait while we are setting up your app</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Setup</h1>
      <p>Here could a login flow be performed and finally you can ask for confirmation to connect</p>
      {tenantSlug && (
        <p>Tenant: <strong>{tenantSlug}</strong></p>
      )}
      <Button onClick={handleSetupCompleted} label="Setup App" />
    </div>
  );
};

export default SetupPage;
