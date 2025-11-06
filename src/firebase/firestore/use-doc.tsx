'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import type { WithId, Snapshot } from './types';

function useMemoizedDocRef<T>(docRef: DocumentReference<T> | null): DocumentReference<T> | null {
  const docRefJson = docRef ? docRef.path : null;

  return useMemo(() => {
    return docRef;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docRefJson]);
}

export function useDoc<T>(docRef: DocumentReference<T> | null): Snapshot<WithId<T>> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedDocRef = useMemoizedDocRef(docRef);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as WithId<T>);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading, error };
}
