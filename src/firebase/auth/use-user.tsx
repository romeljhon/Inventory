'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setUser(user);
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          };
          setUserProfile(profile);

          // Save/update user profile to Firestore
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
          setUserProfile(null);
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
