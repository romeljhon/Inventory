"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * The root page of the application.
 * This component redirects the user to the main dashboard.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard immediately. 
    // The dashboard page will handle auth checks and further redirects.
    router.replace('/dashboard');
  }, [router]);

  // Display a loading spinner while the redirect is happening.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
