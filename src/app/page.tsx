"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBusiness } from '@/hooks/use-business';

/**
 * The root page of the application.
 * This component redirects the user based on their authentication and business setup status.
 */
export default function Home() {
  const router = useRouter();
  const { businesses, isLoading, isUserLoading } = useBusiness();

  useEffect(() => {
    const isReady = !isLoading && !isUserLoading;
    if (isReady) {
      if (businesses.length > 1) {
        router.replace('/businesses');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [router, businesses, isLoading, isUserLoading]);

  // Display a loading spinner while checking auth and business status.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
