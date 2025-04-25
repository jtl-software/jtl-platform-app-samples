'use client';

import { LoginGuard } from '@/components';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const client = new QueryClient();

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <LoginGuard>{children}</LoginGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}
