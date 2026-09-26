// Security-rule tests. Run with the Firestore emulator up (see tests/README.md).
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import fs from 'fs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
const env = await initializeTestEnvironment({ projectId: 'demo-rules', firestore: { host: '127.0.0.1', port: 8085, rules: fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') } });
await env.clearFirestore();
const ts = () => firebase.firestore.FieldValue.serverTimestamp();
const A = env.authenticatedContext('alice').firestore();
const B = env.authenticatedContext('bob').firestore();
const anon = env.unauthenticatedContext().firestore();
let pass = 0, fail = 0;
async function t(name, p) { try { await p; pass++; console.log('ok  ', name); } catch (e) { fail++; console.log('FAIL', name, e.message); } }
const claim = (db, uid, name) => { const b = db.batch(); b.set(db.doc(`usernames/${name.toLowerCase()}`), { uid }); b.set(db.doc(`users/${uid}`), { username: name, usernameLower: name.toLowerCase(), updatedAt: ts() }); return b.commit(); };
const recipe = (owner, extra = {}) => ({ name: 'Test', category: 'main', ingredients: [], steps: [{ id: 's' }], image: { url: 'x', alt: '' }, ownerUid: owner, createdAt: ts(), updatedAt: ts(), ...extra });

await t('no username → cannot create recipe', assertFails(A.doc('recipes/test-aaaa').set(recipe('alice'))));
await t('alice claims Alice_1', assertSucceeds(claim(A, 'alice', 'Alice_1')));
await t('bob cannot claim alice_1 (case-insensitive)', assertFails(claim(B, 'bob', 'alice_1')));
await t('bob cannot write users doc pointing at alice name', assertFails(B.doc('users/bob').set({ username: 'Alice_1', usernameLower: 'alice_1', updatedAt: ts() })));
await t('bob claims bob', assertSucceeds(claim(B, 'bob', 'bob')));
await t('bad username rejected', assertFails(claim(B, 'bob', 'b!')));
await t('alice creates recipe', assertSucceeds(A.doc('recipes/test-aaaa').set(recipe('alice'))));
await t('alice cannot create recipe owned by bob', assertFails(A.doc('recipes/test-bbbb').set(recipe('bob'))));
await t('cannot write rating', assertFails(A.doc('recipes/test-cccc').set(recipe('alice', { rating: 5 }))));
await t('anon can read recipes', assertSucceeds(anon.doc('recipes/test-aaaa').get()));
await t('anon cannot create', assertFails(anon.doc('recipes/test-dddd').set(recipe('x'))));
const snap = await A.doc('recipes/test-aaaa').get();
const createdAt = snap.data().createdAt;
await t('alice edits own', assertSucceeds(A.doc('recipes/test-aaaa').set({ ...recipe('alice'), name: 'Edited', createdAt })));
await t('bob cannot edit alice recipe', assertFails(B.doc('recipes/test-aaaa').set({ ...recipe('bob'), createdAt })));
await t('bob cannot edit alice recipe keeping owner', assertFails(B.doc('recipes/test-aaaa').set({ ...recipe('alice'), createdAt })));
await t('bob cannot update fields', assertFails(B.doc('recipes/test-aaaa').update({ name: 'hacked' })));
await t('alice cannot transfer ownership', assertFails(A.doc('recipes/test-aaaa').set({ ...recipe('bob'), createdAt })));
await t('bob cannot delete alice recipe', assertFails(B.doc('recipes/test-aaaa').delete()));
await t('anon cannot delete', assertFails(anon.doc('recipes/test-aaaa').delete()));
await t('bob cannot delete alice username', assertFails(B.doc('usernames/alice_1').delete()));
// rename alice → Chef_A, releasing old
await t('alice renames', assertSucceeds((() => { const b = A.batch(); b.delete(A.doc('usernames/alice_1')); b.set(A.doc('usernames/chef_a'), { uid: 'alice' }); b.set(A.doc('users/alice'), { username: 'Chef_A', usernameLower: 'chef_a', updatedAt: ts() }); return b.commit(); })()));
await t('old name now free for bob', assertSucceeds((() => { const b = B.batch(); b.delete(B.doc('usernames/bob')); b.set(B.doc('usernames/alice_1'), { uid: 'bob' }); b.set(B.doc('users/bob'), { username: 'alice_1', usernameLower: 'alice_1', updatedAt: ts() }); return b.commit(); })()));
await t('alice deletes own recipe', assertSucceeds(A.doc('recipes/test-aaaa').delete()));
console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
