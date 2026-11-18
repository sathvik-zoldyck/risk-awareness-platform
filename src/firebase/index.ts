'use client';

import { firebaseConfig, useFirebaseEmulators } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Check if config has required values before attempting to initialize with config
      const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
      
      if (!hasRequiredConfig) {
        // During build time, environment variables may not be available
        // This is normal and expected - Firebase will be initialized on the client side
        console.log('Firebase config not available - will initialize on client side');
        // Return a stub that prevents further errors
        throw new Error('Firebase not available - defer to client');
      }
      
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      try {
        firebaseApp = initializeApp(firebaseConfig);
      } catch (initError) {
        // If initialization fails with config too, it's likely a build-time issue
        // The client will handle this properly
        throw new Error('Firebase initialization deferred to client');
      }
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

// Each SDK instance may only be connected to an emulator once.
const connectedToEmulators = new WeakSet<Auth | Firestore>();

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  if (useFirebaseEmulators) {
    if (!connectedToEmulators.has(auth)) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectedToEmulators.add(auth);
    }
    if (!connectedToEmulators.has(firestore)) {
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      connectedToEmulators.add(firestore);
    }
  }
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
