"use client"

import { CardContent, CardHeader, CardDescription, CardTitle, Label, Input, Button, Alert } from "@jtl/platform-ui-react";
import { useState } from "react";
import { useAuth, useLogin, useLogout } from "@/hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const { user, loading: userLoading } = useAuth();
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const { logout, loading: logoutLoading } = useLogout();

  // Handles form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
  };

  // Show loading state while checking session
  if (userLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <CardHeader>
          <CardTitle>JTL Translate</CardTitle>
          <CardDescription>
            Checking authentication status...
          </CardDescription>
        </CardHeader>
        <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Already logged in, show logged in message with logout button
  if (user) {
    return (
      <div className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Logged In</CardTitle>
          <CardDescription>
            You are logged in as {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => logout()} 
            label="Logout" 
            disabled={logoutLoading}
            loading={logoutLoading}
            variant="secondary"
          />
        </CardContent>
      </div>
    );
  }

  // Not logged in, show login form
  return (
    <div className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle>Login to JTL Translate</CardTitle>
        <CardDescription>
          Provide your email address to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email} 
                onValueChange={setEmail}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Button 
                type="submit" 
                label="Login" 
                disabled={loginLoading} 
                loading={loginLoading}
              />
              <div className="text-center text-sm">
                No registration required. Just enter your email.
              </div>
            </div>
            {loginError && (
              <Alert 
                closable={false} 
                variant="destructive" 
                title="Error" 
                description={loginError} 
                icon="AlertTriangle"
              />
            )}
          </div>
        </form>
      </CardContent>
    </div>
  );
}