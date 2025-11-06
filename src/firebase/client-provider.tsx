'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider as CoreFirebaseProvider } from './provider';

// This component ensures that FirebaseProvider is only rendered on the client.
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <CoreFirebaseProvider>{children}</CoreFirebaseProvider>;
};

export const FirebaseClientProvider = FirebaseProvider;
