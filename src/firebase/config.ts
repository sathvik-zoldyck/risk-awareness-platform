/**
 * Firebase web config, read from NEXT_PUBLIC_FIREBASE_* (see .env.example).
 *
 * Set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true to run against the local Auth
 * and Firestore emulators instead of a real project (`npm run dev:demo`
 * does this and loads demo data). In that mode no Firebase project is
 * needed and nothing leaves your machine.
 */

export const useFirebaseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

/** Project id the emulators run under. "demo-" ids never reach real Firebase. */
export const EMULATOR_PROJECT_ID = 'demo-risk-awareness';

const emulatorConfig = {
  apiKey: 'demo-key',
  authDomain: 'localhost',
  projectId: EMULATOR_PROJECT_ID,
  storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000',
};

export const firebaseConfig = useFirebaseEmulators
  ? emulatorConfig
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
