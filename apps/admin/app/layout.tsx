import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belzo Admin Portal | Hyperlocal Operations Control',
  description: 'Enterprise operations, dark stores, and dispatch console for Belzo.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlcmsuYmVsem8uZGV2JA';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas-grouped">
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

