
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { BusinessProvider } from "@/hooks/use-business";
import { FirebaseProvider } from '@/firebase/provider';
import { TourProvider } from '@/components/tour/tour-provider';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'An intelligent inventory management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider>
          <BusinessProvider>
            <Suspense fallback={null}>
              <TourProvider>
                {children}
              </TourProvider>
            </Suspense>
            <Toaster />
          </BusinessProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
