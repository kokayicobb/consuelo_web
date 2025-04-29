// src/components/providers.tsx
"use client";

import { AuthProvider } from "@/lib/auth/auth-context";

import { Toaster } from "@/components/ui/toaster";
import { IntegrationsProvider } from "./Unified Commerce Dashboard/integrations/klayvio-integration";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <IntegrationsProvider>
        {children}
        <Toaster />
      </IntegrationsProvider>
    </AuthProvider>
  );
}

// Add to src/app/layout.tsx
// import { Providers } from '@/components/providers';
// ...
// return (
//   <html lang="en">
//     <body className={font.className}>
//       <Providers>
//         {children}
//       </Providers>
//     </body>
//   </html>
// );
