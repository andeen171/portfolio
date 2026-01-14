import { SpeedInsights } from '@vercel/speed-insights/next';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  );
}
