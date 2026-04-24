'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    // This must be wrapped in a try-catch to handle build-time scenarios
    try {
      return initializeFirebase();
    } catch (error) {
      // Firebase initialization failed - this is expected during builds
      // Return null to signal that Firebase is not available
      console.log('Firebase not available at this time');
      return null;
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // If Firebase failed to initialize, still render children (they may not need Firebase)
  if (!firebaseServices) {
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