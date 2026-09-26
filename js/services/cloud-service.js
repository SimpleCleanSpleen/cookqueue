/**
 * CookQueue — Cloud service (Firebase Auth + Firestore).
 *
 * Only this file talks to Firebase. It stays dormant (enabled = false) until
 * js/firebase-config.js has a config, so the site keeps working from file://
 * and on hosts without Firebase.
 *
 * Firestore layout (security rules: firestore.rules):
 *   users/{uid}          { username, usernameLower, updatedAt }
 *   usernames/{lower}    { uid }                     one doc per claimed name
 *   recipes/{recipeId}   recipe fields (README schema, no id/rating) +
 *                        { ownerUid, createdAt, updatedAt }
 *   products/{gtin}      shared barcode catalog: { name, brand, size, unit,
 *                        label, group, source, createdBy, updatedAt }
 *   failed_recipe_imports/{auto}  write-only debug log for Recipe Helper
 *                        (js/ui/recipe-helper.js): { ownerUid, createdAt,
 *                        rawInput, errors, context }. Nobody reads it from
 *                        the app; Jeremy checks it in the Firebase console.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.Cloud = (function () {
  const settings = CookQueue.FIREBASE || {};
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const emulator = local && new URLSearchParams(location.search).has('emulator');
  const config = emulator
    ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-cookqueue', appId: 'demo' }
    : settings.config;
  const enabled = !!config && /^https?:$/.test(location.protocol);

  const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
  const OWNER_FIELDS = ['ownerUid', 'createdAt', 'updatedAt'];

  let fb, auth, db;
  const session = { ready: false, user: null, profile: null };
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn(session));

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(s);
    });
  }

  /** Loads the SDK and signs back in a returning user. Resolves true when usable. */
  const ready = !enabled ? Promise.resolve(false) : (async () => {
    try {
      const base = `https://www.gstatic.com/firebasejs/${settings.sdkVersion || '10.14.1'}`;
      for (const f of ['firebase-app-compat', 'firebase-auth-compat', 'firebase-firestore-compat']) {
        await loadScript(`${base}/${f}.js`);
      }
      fb = window.firebase;
      fb.initializeApp(config);
      auth = fb.auth();
      db = fb.firestore();
      if (emulator) {
        auth.useEmulator('http://127.0.0.1:9099');
        db.useEmulator('127.0.0.1', 8085);
      }
      await new Promise(resolve => {
        let first = true;
        auth.onAuthStateChanged(async user => {
          session.user = user;
          session.profile = user ? await loadProfile(user.uid).catch(() => null) : null;
          session.ready = true;
          if (first) { first = false; resolve(); }
          emit();
        });
      });
      return true;
    } catch (err) {
      console.warn('[CookQueue] Firebase unavailable, showing batch recipes only:', err);
      session.ready = true;
      emit();
      return false;
    }
  })();

  /** Subscribe to sign-in changes. Called right away with the current state. */
  function onChange(fn) {
    listeners.add(fn);
    fn(session);
    return () => listeners.delete(fn);
  }

  async function loadProfile(uid) {
    const snap = await db.doc(`users/${uid}`).get();
    return snap.exists ? snap.data() : null;
  }

  async function signIn() {
    if (!await ready) throw new Error('Sign-in is not set up yet.');
    const provider = new fb.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await auth.signInWithPopup(provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
        await auth.signInWithRedirect(provider);
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        throw err;
      }
    }
  }

  async function signOut() {
    if (await ready) await auth.signOut();
  }

  function requireUser() {
    if (!session.user) throw new Error('Please sign in first.');
    return session.user;
  }

  function checkUsername(name) {
    if (!USERNAME_RE.test(name)) return '3–20 letters, numbers or underscores.';
    return '';
  }

  /** Claims (or renames to) a unique username, case-insensitively. */
  async function setUsername(name) {
    const user = requireUser();
    name = name.trim();
    const problem = checkUsername(name);
    if (problem) throw new Error(problem);
    const lower = name.toLowerCase();
    await db.runTransaction(async tx => {
      const nameRef = db.doc(`usernames/${lower}`);
      const userRef = db.doc(`users/${user.uid}`);
      const [nameSnap, userSnap] = await Promise.all([tx.get(nameRef), tx.get(userRef)]);
      if (nameSnap.exists && nameSnap.data().uid !== user.uid) throw new Error(`"${name}" is taken. Try another.`);
      const old = userSnap.exists ? userSnap.data().usernameLower : null;
      if (old && old !== lower) tx.delete(db.doc(`usernames/${old}`));
      if (!nameSnap.exists) tx.set(nameRef, { uid: user.uid });
      tx.set(userRef, { username: name, usernameLower: lower, updatedAt: fb.firestore.FieldValue.serverTimestamp() });
    });
    session.profile = await loadProfile(user.uid);
    emit();
  }

  const toMillis = ts => (ts && ts.toMillis ? ts.toMillis() : null);

  /** Firestore doc → app recipe (adds id, author and "new" rating placeholders). */
  function fromDoc(doc, names) {
    const d = doc.data();
    const recipe = { ...d, id: doc.id };
    OWNER_FIELDS.forEach(k => delete recipe[k]);
    return {
      ...recipe,
      rating: null,
      ratingCount: 0,
      community: {
        ownerUid: d.ownerUid,
        author: names[d.ownerUid] || 'unknown',
        createdAt: toMillis(d.createdAt),
        updatedAt: toMillis(d.updatedAt),
      },
    };
  }

  /** Every community recipe, newest first, with each owner's current username. */
  async function listRecipes() {
    if (!await ready) return [];
    const snap = await db.collection('recipes').orderBy('createdAt', 'desc').get();
    const owners = [...new Set(snap.docs.map(d => d.data().ownerUid))];
    const names = {};
    await Promise.all(owners.map(async uid => {
      const p = await db.doc(`users/${uid}`).get().catch(() => null);
      if (p && p.exists) names[uid] = p.data().username;
    }));
    return snap.docs.map(d => fromDoc(d, names));
  }

  /** App recipe → Firestore fields (drops id, ratings and app-only fields). */
  function toDoc(recipe) {
    const data = JSON.parse(JSON.stringify(recipe)); // drops undefined values
    ['id', 'rating', 'ratingCount', 'community', 'batch'].forEach(k => delete data[k]);
    return data;
  }

  const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/[\s_-]+/g, '-').slice(0, 60).replace(/^-|-$/g, '') || 'recipe';

  /** Creates a recipe owned by the signed-in user. Resolves to its new id. */
  async function createRecipe(recipe) {
    const user = requireUser();
    if (!session.profile) throw new Error('Pick a username first.');
    const id = `${slugify(recipe.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const now = fb.firestore.FieldValue.serverTimestamp();
    await db.doc(`recipes/${id}`).set({ ...toDoc(recipe), ownerUid: user.uid, createdAt: now, updatedAt: now });
    return id;
  }

  /** Replaces one of your recipes. The rules reject edits to anyone else's. */
  async function updateRecipe(id, recipe) {
    const user = requireUser();
    const ref = db.doc(`recipes/${id}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('That recipe no longer exists.');
    if (snap.data().ownerUid !== user.uid) throw new Error('You can only edit your own recipes.');
    await ref.set({
      ...toDoc(recipe),
      ownerUid: user.uid,
      createdAt: snap.data().createdAt,
      updatedAt: fb.firestore.FieldValue.serverTimestamp(),
    });
  }

  async function deleteRecipe(id) {
    requireUser();
    await db.doc(`recipes/${id}`).delete();
  }

  /* ---------------------------------------------------------- barcode catalog */

  /** A product from the shared catalog, or null. `gtin` is already normalized. */
  async function getProduct(gtin) {
    if (!await ready) return null;
    const snap = await db.doc(`products/${gtin}`).get();
    return snap.exists ? snap.data() : null;
  }

  /**
   * Adds a product to the shared catalog. Only adds: the first entry for a
   * barcode wins, so recipes stay consistent. Resolves false if it existed.
   */
  async function saveProduct(gtin, product) {
    const user = requireUser();
    const ref = db.doc(`products/${gtin}`);
    const snap = await ref.get();
    if (snap.exists) return false;
    await ref.set({
      name: product.name, brand: product.brand || '', size: product.size, unit: product.unit,
      label: product.label, group: product.group, source: product.source,
      createdBy: user.uid, updatedAt: fb.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  }

  const isMine = recipe => !!(session.user && recipe?.community?.ownerUid === session.user.uid);

  const MAX_LOGGED_INPUT_CHARS = 20000;

  /**
   * Write-only debug log for Recipe Helper: a JSON parse or rule-check
   * failure the person hit while importing AI-generated recipe JSON. Capped
   * and gated by firestore.rules; only readable from the Firebase console.
   * Never blocks the UI — a logging failure is swallowed.
   */
  async function logFailedImport({ rawInput, errors, context }) {
    if (!session.user) return; // Recipe Helper is only shown to signed-in users anyway
    try {
      await db.collection('failed_recipe_imports').add({
        ownerUid: session.user.uid,
        createdAt: fb.firestore.FieldValue.serverTimestamp(),
        rawInput: String(rawInput ?? '').slice(0, MAX_LOGGED_INPUT_CHARS),
        errors: (Array.isArray(errors) ? errors : [String(errors)]).slice(0, 20).map(e => String(e).slice(0, 300)),
        context: String(context || 'unknown').slice(0, 40),
      });
    } catch (err) {
      console.warn('[CookQueue] Could not log failed import:', err);
    }
  }

  return {
    enabled, emulator, ready, session, onChange, signIn, signOut,
    checkUsername, setUsername, listRecipes, createRecipe, updateRecipe, deleteRecipe, isMine,
    getProduct, saveProduct, logFailedImport,
  };
})();
