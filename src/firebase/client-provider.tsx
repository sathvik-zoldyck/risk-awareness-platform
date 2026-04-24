'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const services = initializeFirebase();
      setFirebaseServices(services);
    } catch (e) {
      // Firebase initialization failed, likely during build time
      // This is expected and will be retried when the page loads in the browser
      console.log('Firebase initialization deferred to runtime');
      setError(e instanceof Error ? e : new Error('Unknown error'));
    }
  }, []);

  // During server-side rendering or build time when Firebase isn't available
  // Still render children but without Firebase context
  if (error || !firebaseServices) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}