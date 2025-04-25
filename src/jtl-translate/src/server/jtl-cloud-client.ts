import { importJWK, JWK, jwtVerify } from "jose";

/**
 * Shape of the oauth2 token response
 */
type JtlAuthResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
} | {
  error: string;
  error_description: string;
} | void;

/**
 * Authentication token details
 */
type AuthToken = {
  token: string;
  expiresAt: number;
}

/**
 * Options for fetching data from the API
 */
export type FetchOptions = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH';
  query?: Record<string, string | number>;
  data?: Record<string, string | number | boolean>;
  authToken?: string;
  tenantId?: string;
}

/**
 * An error that is thrown when authentication fails
 */
export class AuthenticationError extends Error {};


/**
 * Provides authentication and interaction with the Cloud ERP
 */
class JtlCloudClient {


  /**
   * Caches the auth token request in memory so we do not have to request it again and again.
   */
  private authTokenPromise: Promise<AuthToken> | null = null;

  /**
   * Fetches data from the API
   */
  async fetch<ResponseType>(opts: FetchOptions): Promise<ResponseType> {

    // Get the tenant id
    const tenantId = opts.tenantId;

    // Get the auth token
    const token = opts.authToken || (await this.getAuthToken()).token;

    // Build the url, including the query parameters
    const url = new URL(opts.path.startsWith('/') ? `${process.env.JTL_API_BASE_URL}${opts.path}` : opts.path);
    if (opts?.query) {
      for (const [key, value] of Object.entries(opts.query)) {
        url.searchParams.set(key, `${value}`);
      }
    }

    // Send the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {})
      ,
    };
    const res = await fetch(url.toString(), {
      method: opts?.method ?? 'GET',
      headers: headers,
      body: typeof opts?.data !== 'undefined' ? JSON.stringify(opts.data) : undefined,
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`JTL Wawi request failed:`);
      console.error(`Response: ${JSON.stringify(data, null, 2)}`);
      console.error(`Options: ${JSON.stringify(opts, null, 2)}`)
      console.error(`Headers: ${JSON.stringify(headers, null, 2)}`);
      throw new Error(`JTL Wawi request failed with status code ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;

  }

  /**
   * Authenticates to the JTL Cloud using oauth2 and provides the authentication token.
   * This token can be used to query the Cloud ERP API
   */
  async getAuthToken(): Promise<AuthToken> {

    // Provide existing token, but only if the promise did not produce an error
    // and if the token is not yet expired
    if (this.authTokenPromise) {
      const token = await this.authTokenPromise.catch(() => null);
      if (token && token.expiresAt - 30000 > Date.now()) {
        return token;
      }
    }

    // Create a promise that resolves once we have received the new token
    // note that we cache the promise and not the token to avoid race conditions
    this.authTokenPromise = (async () => {

      // Get authentication config from environment
      const authUrl = process.env.JTL_AUTH_BASE_URL;
      const clientId = process.env.JTL_AUTH_CLIENT_ID;
      const clientSecret = process.env.JTL_AUTH_CLIENT_SECRET;

      // Make sure authentication configuration exists
      if (!authUrl || !clientId || !clientSecret) {
        console.warn('Invalid JTL Cloud authentication configuration. Please check JTL_AUTH_* env variables');
        throw new AuthenticationError('Authentication Failed');
      }

      // Request the auth token
      const res = await fetch(`${authUrl}/oauth2/token`, {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`
        },
        signal: AbortSignal.timeout(10000)
      }).catch((err) => {
        throw new AuthenticationError(`Authentication Failed: ${err?.message || err || 'Unknown error'}`);
      });
      const data = await res.json() as JtlAuthResponse;

      // Authentication failure
      if (!res.ok || !data || 'access_token' in data === false) {
        throw new AuthenticationError(`Authentication Failed: ${data && 'error' in data ? data.error : 'Unknown Reason'}`)
      }

      // Extract the token and resolve it
      const token: AuthToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      };
      return token;

    })();

    return this.authTokenPromise;

  }

  /**
   * Verifies the session token and extract the JTL Tenant ID and User ID from it
   */
  async getTenantInfo(sessionToken: string) {

    try {

      // Fetch public keys
      const jwks = await this.fetch<{ keys: JWK[] }>({
        path: '/account/.well-known/jwks.json'
      });

      // Extract the payload from the session token
      const key = jwks?.keys?.[0];
      if (!key) throw new Error('Failed to acquire JWKS public keys');
      const publicKey = await importJWK(key, 'EdDSA');
      const { payload } = await jwtVerify(sessionToken, publicKey);
      if (!payload?.tenantId || !payload?.userId) throw new Error('Invalid payload');
      return {
        tenantId: payload.tenantId as string,
        userId: payload.userId as string
      };

    } catch (err) {

      // Log the actual error and then rethrow with a more general one
      console.warn(`Failed to validate session token:`, err);
      throw new Error('Failed to validate session token');

    }

  }

  /**
   * Gets information about the wawi
   */
  async info() {
    return this.fetch<{
      Version: string;
      Timestamp: string;
      Tenant: string;
      Type: string
    }>({
      path: '/erp/info'
    });
  }

}

const client = new JtlCloudClient();

/**
 * Provides a JTL Cloud Client that can be used to interact with the Wawi Cloud API
 */
export const getClient = () => client;
