'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';

/**
 * Holds information about logged in user.
 */
export type User = {
  email: string;
};

/**
 * Holds information about the authentication state.
 */
type AuthState = {
  user: User | null;
  tenantId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

// Create context for sharing auth state between hooks
const AuthContext = createContext<AuthState | null>(null);

/**
 * Provider component that wraps the app and makes auth available to any
 * child component that calls the useAuth hooks.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();
      if (data?.authenticated && data?.user?.email) {
        setUser({ email: data.user.email });
        setTenantId(data.tenantId ?? null);
      } else {
        setUser(null);
        setTenantId(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Session fetching error:', err);
      setUser(null);
      setTenantId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: AuthState = { user, tenantId, loading, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Main hook to access authentication state
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for login functionality with its own loading and error states
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();

  const login = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error_description || 'Login failed');
      }

      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

/**
 * Hook for logout functionality with its own loading and error states
 */
export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error_description || 'Logout failed');
      }

      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
