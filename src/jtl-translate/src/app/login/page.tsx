'use client';

import { LoginForm } from '@/components';
import { AuthProvider } from '@/hooks/useAuth';
import { Card } from '@jtl/platform-ui-react';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <LoginForm></LoginForm>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}
