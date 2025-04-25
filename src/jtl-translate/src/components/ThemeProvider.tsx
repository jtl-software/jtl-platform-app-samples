"use client";

import { useState, useEffect } from "react";
import { IThemeProviderProps, ThemeProvider as PlatformThemeProvider } from "@jtl/platform-ui-react";

/**
 * A wrapper for the theme provider that only uses it when rendered on the client
 */
export default function ThemeProvider(props: IThemeProviderProps) {
  const { children, ...rest } = props;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return <PlatformThemeProvider {...rest}>{children}</PlatformThemeProvider>;
}
