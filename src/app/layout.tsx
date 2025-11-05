import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { BusinessProvider } from "@/hooks/use-business";
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Stock Sherpa',
  description: 'An intelligent inventory management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <BusinessProvider>
            {children}
            <Toaster />
          </BusinessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
