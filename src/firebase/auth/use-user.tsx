'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const lastKnownProfile = useRef<UserProfile | null>(null);

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
          const currentProfile = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          };
          
          // Only update Firestore if profile info has changed
          if (JSON.stringify(currentProfile) !== JSON.stringify(lastKnownProfile.current)) {
            const db = getFirestore(auth.app);
            const userDocRef = doc(db, 'users', user.uid);
            const userProfileData = {
                ...currentProfile,
                lastLogin: serverTimestamp()
            };

            setDoc(userDocRef, userProfileData, { merge: true }).catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'update',
                  requestResourceData: userProfileData,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
            lastKnownProfile.current = currentProfile;
          }
        } else {
          setUser(null);
          lastKnownProfile.current = null;
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, userProfile, loading, error };
}
