'use client';

import { LoginForm } from '@/components';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { usePluginBridge } from '@/hooks/usePluginBridge';
import { CardContent, CardHeader, CardDescription, CardTitle, Button, Alert, Skeleton } from '@jtl/platform-ui-react';
import { useState, useEffect } from 'react';

/**
 * This page is displayed when a user initially installs the app in the JTL Hub.
 * Its purpose is to authenticate with our service using a simple email address
 * and to signal back to the JTL Hub that the app is ready to use.
 */
export default function SetupPage() {
  const { user, loading: isUserLoading } = useAuth();
  const { pluginBridge, loading: isPluginBridgeLoading } = usePluginBridge();
  const { logout, loading: isLogoutLoading } = useLogout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Initially get the session token from the plugin bridge
  useEffect(() => {
    if (!pluginBridge) return;
    pluginBridge
      ?.callMethod<string>('getSessionToken')
      .then(token => setSessionToken(token))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to get session token'));
  }, [pluginBridge]);

  /**
   * Register the tenant with our app by providing it with the session token
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    if (!sessionToken || !pluginBridge) {
      setIsSubmitting(false);
      return;
    }

    // Try to connect the tenant using our API. If successful, we will
    // notify the plugin bridge that the setup is completed
    try {
      const response = await fetch('/api/jtl/connect-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to connect tenant');
      }

      // Indicate that setup has completed
      await pluginBridge.callMethod('setupCompleted');
    } catch (error) {
      console.error('Error connecting tenant:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (isUserLoading || isPluginBridgeLoading) {
    return <Skeleton variant="card"></Skeleton>;
  }

  // User not logged in yet, let him login first
  if (!user) {
    return <LoginForm></LoginForm>;
  }

  // Confirm form
  return (
    <div className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle className="text-2xl">Connect to JTL Hub</CardTitle>
        <CardDescription>
          Please confirm to connect JTL Translate with JTL Hub.
          <br />
          You are logged in as {user.email}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={() => handleSubmit()} label="Connect with JTL Hub" disabled={isSubmitting || isLogoutLoading} loading={isSubmitting} />
        <Button
          onClick={() => logout()}
          label="Use a different Account"
          variant="ghost"
          disabled={isLogoutLoading || isSubmitting}
          loading={isLogoutLoading}
        />
        {error && <Alert closable={false} variant="destructive" title="Error" description={error} icon="AlertTriangle"></Alert>}
      </CardContent>
    </div>
  );
}
