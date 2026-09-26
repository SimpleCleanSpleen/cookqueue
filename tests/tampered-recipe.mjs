// A signed-in user writes a booby-trapped recipe straight to Firestore (skipping
// the form). It must be hidden by validate(), never rendered. See tests/README.md.
import { chromium } from 'playwright-core';
import path from 'path';
const FB = new URL('./node_modules/firebase/', import.meta.url).pathname;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
const ctx = await b.newContext();
await ctx.route(/gstatic\.com\/firebasejs\/[\d.]+\/(.+\.js)$/, r => r.fulfill({ path: path.join(FB, r.request().url().match(/firebasejs\/[\d.]+\/(.+\.js)$/)[1]), contentType: 'application/javascript' }));
await ctx.route(/placehold\.co|fonts\./, r => r.abort());
const p = await ctx.newPage();
let pwned = false; await p.exposeFunction('pwn', () => { pwned = true; });
await p.goto('http://localhost:8000/?emulator#/');
await p.waitForSelector('.card');
console.log('mock recipes valid:', await p.evaluate(() => CookQueue.RECIPE_BATCHES[0].recipes.map(r => CookQueue.RecipeService.validate(r).ok).join(',')));
// attacker writes a doc directly, bypassing the form
await p.evaluate(async () => {
  await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: 'evil', email: 'e@x.com', email_verified: true })));
  await CookQueue.Cloud.setUsername('evil');
  const r = structuredClone(CookQueue.RECIPE_BATCHES[0].recipes[1]);
  delete r.id; delete r.rating; delete r.ratingCount;
  r.nutritionPerServing.protein = '<img src=x onerror=pwn()>';
  r.storage.fridgeDays = '<img src=x onerror=pwn()>';
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  await firebase.firestore().doc('recipes/evil-recipe').set({ ...r, ownerUid: firebase.auth().currentUser.uid, createdAt: ts, updatedAt: ts });
});
await p.reload(); await p.waitForSelector('.card'); await p.waitForTimeout(800);
console.log('cards:', await p.locator('.card').count(), '| banner:', (await p.locator('.notice').innerText().catch(() => 'none')).slice(0, 120));
await p.goto('http://localhost:8000/?emulator#/recipe/evil-recipe'); await p.waitForTimeout(800);
console.log('pwned:', pwned);
await b.close();
process.exit(pwned ? 1 : 0);
