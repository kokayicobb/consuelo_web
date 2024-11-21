
// app/layout.tsx
import { metadata } from './metadata'
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import ClientLayout from './clientLayout';



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
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Please enable JavaScript to use this application.
          </div>
        </noscript>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
export { metadata }