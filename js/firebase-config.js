/**
 * CookQueue — Firebase settings (sign-in + community recipes).
 *
 * Set `config` to null to switch Firebase off: batch-file recipes only, with
 * no sign-in button.
 *
 * To turn it on, paste the "firebaseConfig" object from
 * Firebase console → Project settings → Your apps → Web app.
 * These values are NOT secrets. They only identify the project, and every
 * site that uses Firebase ships them to the browser. What protects the data
 * is firestore.rules (in the repo root), which must be published in the
 * Firebase console → Firestore Database → Rules.
 *
 * Local testing against the Firebase emulators (no real project needed):
 *   http://localhost:8000/?emulator
 */
window.CookQueue = window.CookQueue || {};

CookQueue.FIREBASE = {
  config: {
    apiKey: 'AIzaSyCnyRkMuJscX-tw689RyCnjZKB6SAjzY3M',
    authDomain: 'cookqueue.firebaseapp.com',
    projectId: 'cookqueue',
    storageBucket: 'cookqueue.firebasestorage.app',
    messagingSenderId: '803703469250',
    appId: '1:803703469250:web:8d5f6618876a562faff75b',
  },

  /** Firebase JS SDK version (loaded from gstatic.com only when enabled). */
  sdkVersion: '10.14.1',
};
