// app/layout.tsx
import { metadata } from './metadata'
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import ClientLayout from './clientLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Analytics from '@/components/Analytics'
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body> 
        
      <AuthProvider>
        <Providers>
        <Toaster /> 
          <ClientLayout>{children}</ClientLayout>
          <Analytics />
          <SpeedInsights />
        </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}

export { metadata }