'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from './ui/use-toast';


// This is a global listener for Firebase permission errors.
// It will display a toast notification when a permission error is emitted.
// In a real production app, you might want to log these errors to a service
// like Sentry or Google Cloud Logging.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Caught a Firestore Permission Error:', error);
      
      // We'll throw the error to make it visible in the Next.js development overlay.
      // This is extremely helpful for debugging security rules.
      if (process.env.NODE_ENV === 'development') {
         // A little hack to get the dev overlay to show the error
         setTimeout(() => {
            throw error;
         }, 0)
      } else {
         toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You do not have permission to perform this action.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
