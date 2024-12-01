
// app/layout.tsx
import { metadata } from './metadata'
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import ClientLayout from './clientLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';


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
      </head>
      <body>
        
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
export { metadata }