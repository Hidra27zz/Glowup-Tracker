import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlowUp Tracker',
  description: 'LifeOS and Personal Development Tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GlowUp Tracker',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="glass-nav">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              GlowUp Tracker
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', fontWeight: 500, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '4px' }}>
              <a href="/">Dashboard</a>
              <a href="/health">Health</a>
              <a href="/nutrition">Nutrition</a>
              <a href="/career">Career</a>
              <a href="/mental">Mental</a>
              <a href="/finance">Finance</a>
              <a href="/crm">CRM</a>
              <a href="/tasks">Tasks</a>
              <a href="/memory">Memory</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
