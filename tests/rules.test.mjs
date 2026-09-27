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
const product = (uid, extra = {}) => ({ name: 'Greek yogurt', brand: 'Fage', size: 32, unit: 'oz', label: '32 oz tub', group: 'Dairy', source: 'user', createdBy: uid, updatedAt: ts(), ...extra });
await t('anon cannot add product', assertFails(anon.doc('products/0036000291452').set(product('x'))));
await t('alice adds product', assertSucceeds(A.doc('products/0036000291452').set(product('alice'))));
await t('anon can read product', assertSucceeds(anon.doc('products/0036000291452').get()));
await t('bob cannot overwrite alice product', assertFails(B.doc('products/0036000291452').set(product('bob'))));
await t('bob cannot update alice product', assertFails(B.doc('products/0036000291452').update({ name: 'x' })));
await t('alice corrects own product', assertSucceeds(A.doc('products/0036000291452').set(product('alice', { size: 35.3 }))));
await t('nobody deletes products', assertFails(A.doc('products/0036000291452').delete()));
await t('bad barcode id rejected', assertFails(A.doc('products/abc123').set(product('alice'))));
await t('bad unit rejected', assertFails(A.doc('products/12345670').set(product('alice', { unit: 'lbs' }))));
await t('extra fields rejected', assertFails(A.doc('products/12345670').set(product('alice', { price: 3 }))));
await t('cannot spoof createdBy', assertFails(A.doc('products/12345670').set(product('bob'))));

const failedImport = (owner, extra = {}) => ({ ownerUid: owner, createdAt: ts(), rawInput: '{bad json', errors: ['Unexpected token b'], context: 'single', ...extra });
await t('anon cannot log a failed import', assertFails(anon.collection('failed_recipe_imports').add(failedImport('x'))));
await t('signed-in-no-username cannot log a failed import', assertFails(env.authenticatedContext('carol').firestore().collection('failed_recipe_imports').add(failedImport('carol'))));
await t('alice logs a failed import', assertSucceeds(A.collection('failed_recipe_imports').add(failedImport('alice'))));
await t('alice cannot spoof ownerUid on a failed import', assertFails(A.collection('failed_recipe_imports').add(failedImport('bob'))));
await t('oversized rawInput rejected', assertFails(A.collection('failed_recipe_imports').add(failedImport('alice', { rawInput: 'x'.repeat(20001) }))));
await t('too many errors rejected', assertFails(A.collection('failed_recipe_imports').add(failedImport('alice', { errors: Array(21).fill('x') }))));
await t('extra field rejected on failed import', assertFails(A.collection('failed_recipe_imports').add(failedImport('alice', { extra: 'nope' }))));
const failedImportDoc = await A.collection('failed_recipe_imports').add(failedImport('alice'));
await t('nobody can read a failed import', assertFails(A.doc(`failed_recipe_imports/${failedImportDoc.id}`).get()));
await t('nobody can update a failed import', assertFails(A.doc(`failed_recipe_imports/${failedImportDoc.id}`).update({ context: 'batch' })));
await t('nobody can delete a failed import', assertFails(A.doc(`failed_recipe_imports/${failedImportDoc.id}`).delete()));


// ---- reviews ----
const review = (extra = {}) => ({ stars: 5, comment: 'Great!', createdAt: ts(), updatedAt: ts(), ...extra });
const Rv = db => db.doc('recipes/some-recipe/reviews/alice');
await t('alice reviews a recipe', assertSucceeds(Rv(A).set(review())));
await t('anon can read a review', assertSucceeds(anon.doc('recipes/some-recipe/reviews/alice').get()));
await t('anon can list every review (collection group)', assertSucceeds(anon.collectionGroup('reviews').get()));
await t('bob cannot write alice review', assertFails(B.doc('recipes/some-recipe/reviews/alice').set(review())));
await t('bob cannot delete alice review', assertFails(B.doc('recipes/some-recipe/reviews/alice').delete()));
await t('0 stars rejected', assertFails(B.doc('recipes/some-recipe/reviews/bob').set(review({ stars: 0 }))));
await t('6 stars rejected', assertFails(B.doc('recipes/some-recipe/reviews/bob').set(review({ stars: 6 }))));
await t('4.5 stars rejected', assertFails(B.doc('recipes/some-recipe/reviews/bob').set(review({ stars: 4.5 }))));
await t('comment over 1000 chars rejected', assertFails(B.doc('recipes/some-recipe/reviews/bob').set(review({ comment: 'x'.repeat(1001) }))));
await t('extra review field rejected', assertFails(B.doc('recipes/some-recipe/reviews/bob').set(review({ helpful: 3 }))));
await t('anon cannot review', assertFails(anon.doc('recipes/some-recipe/reviews/x').set(review())));
await t('no-username user cannot review', assertFails(env.authenticatedContext('dave').firestore().doc('recipes/some-recipe/reviews/dave').set(review())));
const firstReview = (await Rv(A).get()).data();
await t('alice edits own review', assertSucceeds(Rv(A).set({ stars: 3, comment: 'Changed my mind', createdAt: firstReview.createdAt, updatedAt: ts() })));
await t('alice cannot reset createdAt', assertFails(Rv(A).set(review({ stars: 4 }))));
await t('owner can review own recipe', assertSucceeds(A.doc('recipes/test-own/reviews/alice').set(review())));
await t('alice deletes own review', assertSucceeds(Rv(A).delete()));

// ---- site recipes (js/data), owned by the site owner ----
const J = env.authenticatedContext('jer').firestore();
await t('jer claims jeremy5', assertSucceeds(claim(J, 'jer', 'jeremy5')));
await t('site owner creates the copy of a site recipe', assertSucceeds(J.doc('recipes/greek-chicken-sheet-pan').set(recipe('jer'))));
await t('someone else cannot claim a site recipe id', assertFails(A.doc('recipes/korean-turkey-rice-bowls').set(recipe('alice'))));
await t('site owner can still post normal recipes', assertSucceeds(J.doc('recipes/jer-test-abcde').set(recipe('jer'))));
await t('anon can read hidden_recipes', assertSucceeds(anon.collection('hidden_recipes').get()));
await t('alice cannot hide a site recipe', assertFails(A.doc('hidden_recipes/korean-turkey-rice-bowls').set({ hiddenAt: ts() })));
await t('site owner cannot hide a non-site id', assertFails(J.doc('hidden_recipes/jer-test-abcde').set({ hiddenAt: ts() })));
await t('site owner deletes copy + hides a site recipe in one batch', assertSucceeds((() => { const b = J.batch(); b.delete(J.doc('recipes/greek-chicken-sheet-pan')); b.set(J.doc('hidden_recipes/greek-chicken-sheet-pan'), { hiddenAt: ts() }); return b.commit(); })()));
await t('extra field on hidden_recipes rejected', assertFails(J.doc('hidden_recipes/chickpea-shawarma-dip').set({ hiddenAt: ts(), why: 'x' })));

// ---- the rules' hard-coded lists match the site ----
const rulesText = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const listed = [...rulesText.match(/function siteRecipeId\(id\) \{[\s\S]*?\]/)[0].matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1]).sort();
const ctx = { window: {} }; ctx.window.CookQueue = ctx.window; ctx.CookQueue = ctx.window;
const vm = await import('vm'); vm.createContext(ctx);
const dataFiles = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '').match(/js\/data\/[\w-]+\.js/g);
for (const f of ['js/config.js', ...dataFiles]) vm.runInContext(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), ctx);
const shipped = ctx.window.RECIPE_BATCHES.flatMap(b => b.recipes).map(r => r.id).sort();
await t(`rules list the same ${shipped.length} site recipe ids as js/data`, JSON.stringify(listed) === JSON.stringify(shipped) ? Promise.resolve() : Promise.reject(new Error(`rules: ${listed.length}, data: ${shipped.length}`)));
await t('rules site owner matches config', rulesText.includes(`usernames/${ctx.window.config.SITE_OWNER_USERNAME.toLowerCase()})`) ? Promise.resolve() : Promise.reject(new Error('mismatch')));

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
