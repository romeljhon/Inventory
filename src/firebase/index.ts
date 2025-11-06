import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Re-exporting hooks and providers
export { FirebaseProvider, FirebaseClientProvider } from './client-provider';
export { useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase(): { app: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (typeof window === 'undefined') {
    // On the server, we need to create a new instance for each request.
    // However, for this simple client-side app, we can just return dummy/uninitialized services.
    // A more robust SSR app would handle initialization differently.
    const tempApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return {
      app: tempApp,
      auth: getAuth(tempApp),
      firestore: getFirestore(tempApp),
    };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } else {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
  }

  return { app, auth, firestore };
}

export { initializeFirebase };
