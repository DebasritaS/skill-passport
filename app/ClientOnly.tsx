"use client";

import { useEffect, useState } from "react";

/**
 * ClientOnly Component
 *
 * Prevents hydration mismatch errors in Next.js.
 *
 * Wallet adapters depend on browser-only APIs (like window).
 * Since Next.js pre-renders on the server,
 * this component ensures children render only after client mount.
 */
export default function ClientOnly({
  children,
}: {
  children: React.ReactNode;
}) {

  // Track whether component is mounted in browser
  const [mounted, setMounted] = useState(false);

  // Runs only on client after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering on server
  if (!mounted) return null;

  return <>{children}</>;
}