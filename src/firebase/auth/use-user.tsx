'use client';
import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userProfile: UserProfile | null = useMemo(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }, [user]);

  useEffect(() => {
    if (!auth) {
      setLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setUser(user);
          const db = getFirestore(auth.app);
          const userDocRef = doc(db, 'users', user.uid);
          const userProfileData = {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              lastLogin: serverTimestamp()
          };

          setDoc(userDocRef, userProfileData, { merge: true }).catch(async (serverError) => {
            console.error("Error saving user profile:", serverError);
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: userProfileData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, userProfile, loading, error };
}
