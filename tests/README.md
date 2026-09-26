# Firebase tests (dev only)

The site needs no Node. These tests are for Claude cloud sessions (or anyone
with Node 18+ and Java 11+), and never touch the real Firebase project: they
run against the local Firebase emulators with fake accounts.

```bash
cd tests
npm install
npm run emulators &                          # Auth on :9099, Firestore on :8085
(cd .. && python3 -m http.server 8000 &)     # the site
npm run test:rules                           # security rules: who can read/write what
npm run test:e2e                             # sign in → username → publish → edit → other user blocked → delete,
                                             # then a tampered Firestore doc must be hidden, not rendered
```

Screenshots land in `tests/screenshots/` (git-ignored).

To click through by hand with the emulators, open http://localhost:8000/?emulator.
Sign-in then uses the emulator's fake Google accounts.

Note: the e2e test signs in with the emulator's fake Google credential rather than
clicking through the Google popup, because the popup needs apis.google.com.
Test the real popup on the live site after setup.
