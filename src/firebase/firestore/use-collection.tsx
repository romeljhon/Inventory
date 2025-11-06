'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import type { WithId, Snapshot } from './types';

function useMemoizedQuery<T>(query: Query<T> | null): Query<T> | null {
  const queryJson = query ? JSON.stringify({
    path: query.path,
    // You might need to serialize other query parameters (where, orderBy, etc.) if you use them
  }) : null;

  return useMemo(() => {
    return query;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryJson]);
}

export function useCollection<T>(query: Query<T> | null): Snapshot<WithId<T>[]> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useMemoizedQuery(query);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as WithId<T>)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error('Error fetching collection:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
