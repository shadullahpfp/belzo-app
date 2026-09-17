import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belzo Admin Portal | Hyperlocal Operations Control',
  description: 'Enterprise operations, dark stores, and dispatch console for Belzo.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas-grouped">{children}</body>
    </html>
  );
}
