"use client";

import { useSyncExternalStore } from "react";

/**
 * ClientOnly — renders children only after client hydration.
 * Use this to wrap any content that relies on browser-only APIs
 * (Date, window, localStorage, etc.) to prevent SSR hydration mismatches.
 *
 * @example
 * <ClientOnly>
 *   <p>© {new Date().getFullYear()} MyApp</p>
 * </ClientOnly>
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return mounted ? <>{children}</> : <>{fallback}</>;
}
