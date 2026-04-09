import { useCallback, useEffect, useState } from 'react';
import IErpPageProps from './IErpPageProps';
import { apiUrl } from '../../common/constants';
import JsonViewer from '../../common/JsonViewer';

interface TenantInfo {
  tenantId: string;
  jtlTenantId: string;
  tenantSlug: string | null;
}

function loadFromStorage(): TenantInfo | null {
  const tenantId = localStorage.getItem('tenantId');
  if (!tenantId) return null;
  return {
    tenantId,
    jtlTenantId: localStorage.getItem('jtlTenantId') ?? '',
    tenantSlug: localStorage.getItem('tenantSlug'),
  };
}

const ErpPage: React.FC<IErpPageProps> = ({ appBridge }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [erpInfo, setErpInfo] = useState<unknown>(null);
  const [erpError, setErpError] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(loadFromStorage);
  const [tenantError, setTenantError] = useState<string | null>(null);

  const view = new URLSearchParams(window.location.search).get('view');

  // Fetch tenant info from backend on mount (localStorage is isolated in setup iframe)
  useEffect(() => {
    if (tenantInfo) return; // already loaded from localStorage
    (async () => {
      try {
        const response = await fetch(`${apiUrl}/current-tenant`);
        if (response.ok) {
          setTenantInfo(await response.json());
        } else {
          setTenantError('Setup noch nicht durchgeführt – bitte zuerst die App einrichten.');
        }
      } catch (err) {
        setTenantError(`Backend nicht erreichbar: ${String(err)}`);
      }
    })();
  }, [tenantInfo]);

  // Also receive via BroadcastChannel if setup runs while ERP is open
  useEffect(() => {
    const channel = new BroadcastChannel('tenant-info');
    channel.onmessage = (e: MessageEvent<TenantInfo>) => setTenantInfo(e.data);
    return () => channel.close();
  }, []);

  const handleRequestTimestampPress = useCallback(async (): Promise<void> => {
    if (!appBridge) return;
    try {
      setIsRequesting(true);
      appBridge.method.expose('getCurrentTime', () => new Date());
      const t = await appBridge.method.call<Date>('getCurrentTime');
      setTime(`${typeof t} ${t.toUTCString()}`);
    } finally {
      setIsRequesting(false);
    }
  }, [appBridge]);

  // Note: appBridge uses window.parent.postMessage and only works in iframe contexts.
  // The ERP page opens as a popup (_blank), so appBridge will always be undefined here.
  // All ERP functionality works without the bridge via localStorage + direct fetch calls.

  const handleFetchErpInfo = useCallback(async (): Promise<void> => {
    if (!tenantInfo) return;
    try {
      setErpError(null);
      setErpInfo(null);
      setIsRequesting(true);
      const response = await fetch(`${apiUrl}/erp-info/${tenantInfo.tenantId}/v2/info`);
      const text = await response.text();
      if (response.ok) {
        try {
          setErpInfo(JSON.parse(text));
        } catch {
          setErpInfo(text);
        }
      } else {
        setErpError(`Fehler: ${response.status} – ${text}`);
      }
    } catch (error) {
      setErpError(String(error));
    } finally {
      setIsRequesting(false);
    }
  }, [tenantInfo]);

  return (
    <div>
      <h1>{`ERP ${view ?? ''}`}</h1>

      <section style={{ marginBottom: '1rem', textAlign: 'left' }}>
        <h2>Tenant Info</h2>
        {tenantError && <p style={{ color: 'red' }}>{tenantError}</p>}
        {tenantInfo ? (
          <table>
            <tbody>
              <tr>
                <td><strong>Tenant Slug</strong></td>
                <td>{tenantInfo.tenantSlug || '–'}</td>
              </tr>
              <tr>
                <td><strong>Tenant ID (lokal)</strong></td>
                <td>{tenantInfo.tenantId}</td>
              </tr>
              <tr>
                <td><strong>JTL Tenant ID</strong></td>
                <td>{tenantInfo.jtlTenantId}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'orange' }}>Setup noch nicht durchgeführt – bitte zuerst die App einrichten.</p>
        )}
      </section>

      {appBridge && (
        <section style={{ marginBottom: '1rem' }}>
          <button onClick={handleRequestTimestampPress} disabled={isRequesting}>
            Request time now
          </button>
          {time && <p>{time}</p>}
        </section>
      )}

      <hr />

      <section>
        <h2>ERP Info (v2/info)</h2>
        <button onClick={handleFetchErpInfo} disabled={isRequesting || !tenantInfo}>
          {isRequesting ? 'Lädt…' : 'Fetch ERP Info'}
        </button>
        {!tenantInfo && <p style={{ color: 'grey', fontSize: '0.85em' }}>Erst Setup abschließen</p>}
        {erpError && <p style={{ color: 'red' }}>{erpError}</p>}
        {erpInfo && <JsonViewer data={erpInfo} />}
      </section>
    </div>
  );
};

export default ErpPage;
