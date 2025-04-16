'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // To avoid hydration mismatch, only render the children when mounted on client
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </NextThemesProvider>
  );
}
