import type { Metadata, Viewport } from 'next';
import './globals.css';
import TopNav from '@/components/TopNav';
import DraggablePlayer from '@/components/DraggablePlayer';
import GlobalTimerPopup from '@/components/GlobalTimerPopup';

export const metadata: Metadata = {
  title: 'GlowUp OS — Life & Personal Growth Tracker',
  description: 'Hệ điều hành quản lý mục tiêu SMART, lịch trình, dinh dưỡng và sự nghiệp',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GlowUp OS',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TopNav />
        <main className="main-content">
          {children}
        </main>
        {/* Floating Mini Square Timer across all tabs */}
        <GlobalTimerPopup />
        {/* Persistent Draggable Music Player across all tabs */}
        <DraggablePlayer />
      </body>
    </html>
  );
}
