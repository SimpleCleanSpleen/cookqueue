/**
 * PrepDash — Firebase settings (sign-in + community recipes).
 *
 * Leave `config` as null and the site works exactly as before: batch-file
 * recipes only, with no sign-in button.
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
window.PrepDash = window.PrepDash || {};

PrepDash.FIREBASE = {
  config: null,
  // config: {
  //   apiKey: '…',
  //   authDomain: 'your-project.firebaseapp.com',
  //   projectId: 'your-project',
  //   storageBucket: 'your-project.appspot.com',
  //   messagingSenderId: '…',
  //   appId: '…',
  // },

  /** Firebase JS SDK version (loaded from gstatic.com only when enabled). */
  sdkVersion: '10.14.1',
};
