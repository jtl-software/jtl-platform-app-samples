'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginForm from './LoginForm';
import { Card, Skeleton } from '@jtl/platform-ui-react';

/**
 * Shows the login page if the user is not authenticated
 */
export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton variant="card" />;
  if (user) return children;
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <LoginForm></LoginForm>
        </Card>
      </div>
    </div>
  );
}
