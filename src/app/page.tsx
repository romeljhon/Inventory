
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/hooks/use-business';
import { useUser } from '@/firebase';
import { LandingPage } from '@/components/landing/landing-page';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading: isUserLoading } = useUser();
  const { businesses, isLoading: isBusinessLoading, isNewUser } = useBusiness();
  const router = useRouter();

  const isLoading = isUserLoading || isBusinessLoading;

  useEffect(() => {
    if (!isLoading) {
      if (user && isNewUser) {
        router.push('/setup');
      } else if (user && businesses.length > 0) {
        router.push('/dashboard');
      }
    }
  }, [user, businesses, isLoading, isNewUser, router]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }
  
  if (user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Redirecting...</span>
      </div>
    );
  }

  return <LandingPage />;
}
