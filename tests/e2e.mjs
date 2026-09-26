// End-to-end test of sign-in, username, publish, edit, ownership and delete
// against the Firebase emulators. See tests/README.md.
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
const OUT = new URL('./screenshots/', import.meta.url).pathname;
const FB = new URL('./node_modules/firebase/', import.meta.url).pathname;
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/gstatic\.com\/firebasejs\/[\d.]+\/(.+\.js)$/, (route) => {
  const f = route.request().url().match(/firebasejs\/[\d.]+\/(.+\.js)$/)[1];
  route.fulfill({ path: path.join(FB, f), contentType: 'application/javascript' });
});
await ctx.route(/placehold\.co|fonts\.(googleapis|gstatic)/, r => r.abort());
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/placehold|fonts|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
page.on('dialog', d => d.accept());
const shot = n => page.screenshot({ path: `${OUT}${n}.png`, fullPage: false });
const step = s => console.log('→', s);

async function signIn(email) {
  await page.evaluate(async email => {
    const cred = firebase.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true, name: email.split('@')[0] }));
    await firebase.auth().signInWithCredential(cred);
  }, email);
}

await page.goto('http://localhost:8000/?emulator#/');
await page.waitForSelector('.card');
await page.waitForSelector('#account [data-action="sign-in"]');
step('home loaded with Sign in button; community category: ' + await page.locator('[data-id="community"]').count());
await shot('01-home-signed-out');

await signIn('jeremy@example.com');
await page.waitForSelector('#username-form');
step('username modal shown');
await shot('02-username');
await page.fill('#username-form input', 'jeremy_cooks');
await page.click('#username-form [type=submit]');
await page.waitForSelector('#account .account-btn.is-in >> text=@jeremy_cooks');
step('signed in as @jeremy_cooks');

await page.goto('http://localhost:8000/?emulator#/add');
await page.waitForSelector('.editor-form .ed-section');
const json = await page.evaluate(() => { const r = structuredClone(CookQueue.RECIPE_BATCHES[0].recipes[1]); r.name = 'Jeremy Test Chicken'; r.id = 'x'; return JSON.stringify(r); });
const saveBtn = page.locator('[data-ed="save"]');
step('save disabled on blank form: ' + await saveBtn.isDisabled());
await page.click('.ed-import summary');
await page.fill('#ed-json', json);
await page.click('[data-ed="import"]');
await page.setInputFiles('[data-photo]', `${OUT}01-home-signed-out.png`);
await page.waitForSelector('.photo-preview img');
step('photo attached; save enabled: ' + await saveBtn.isEnabled());
await shot('03-editor');
// break a rule via the form and see Save lock
await page.fill('[data-path="nutritionPerServing.sodium"]', '900');
step('sodium 900 → save disabled: ' + await saveBtn.isDisabled() + ' / ' + (await page.locator('.ed-checks .bad').first().textContent()).trim());
await page.fill('[data-path="nutritionPerServing.sodium"]', '340');
await saveBtn.click();
await page.waitForURL(/#\/recipe\//);
await page.waitForSelector('.byline');
const recipeUrl = page.url();
step('published → ' + recipeUrl.split('#')[1] + ' | ' + (await page.locator('.byline').innerText()).replace(/\s+/g, ' '));
await page.screenshot({ path: `${OUT}04-recipe-owner.png` });

await page.click('.byline >> text=Edit');
await page.waitForSelector('.editor-form .ed-section');
await page.fill('[data-path="name"]', 'Jeremy Test Chicken v2');
await page.click('[data-ed="save"]');
await page.waitForSelector('h1:has-text("Jeremy Test Chicken v2")');
step('edited name saved');

await page.goto('http://localhost:8000/?emulator#/');
await page.click('[data-id="community"]');
step('community cards: ' + await page.locator('.card').count() + ' | author: ' + await page.locator('.card-author').first().textContent());
await shot('05-home-community');

// sign out, sign in as friend
await page.click('[data-action="account-menu"]');
await shot('06-account-menu');
await page.click('.account-menu [data-action="sign-out"]');
await page.waitForSelector('#account [data-action="sign-in"]');
await signIn('friend@example.com');
await page.waitForSelector('#username-form');
await page.fill('#username-form input', 'JEREMY_COOKS');
await page.click('#username-form [type=submit]');
await page.waitForSelector('#un-msg.warn');
step('friend tried taken name: ' + await page.textContent('#un-msg'));
await page.fill('#username-form input', 'pal');
await page.click('#username-form [type=submit]');
await page.waitForSelector('#account >> text=@pal');
await page.goto(recipeUrl);
await page.waitForSelector('.byline');
step('friend sees edit buttons: ' + await page.locator('.byline .btn').count());
const id = recipeUrl.split('/').pop();
await page.goto(`http://localhost:8000/?emulator#/edit/${id}`);
await page.waitForSelector('.empty h3');
step('friend on edit page: ' + await page.textContent('.empty h3'));
// direct Firestore attack from friend's browser
const attack = await page.evaluate(async id => {
  const db = firebase.firestore();
  const out = [];
  try { await db.doc(`recipes/${id}`).update({ name: 'hacked' }); out.push('update OK?!'); } catch (e) { out.push('update ' + e.code); }
  try { await db.doc(`recipes/${id}`).delete(); out.push('delete OK?!'); } catch (e) { out.push('delete ' + e.code); }
  return out.join(', ');
}, id);
step('friend direct write attempts: ' + attack);

// back to jeremy, delete from My recipes
await page.goto('http://localhost:8000/?emulator#/mine');
await page.click('[data-action="account-menu"]');
await page.click('.account-menu [data-action="sign-out"]');
await page.waitForSelector('#account [data-action="sign-in"]');
await signIn('jeremy@example.com');
await page.waitForSelector('#account >> text=@jeremy_cooks');
await page.goto('http://localhost:8000/?emulator#/mine');
await page.waitForSelector('.mine-item');
await shot('07-mine');
await page.click('.mine-item [data-action="recipe-delete"]');
await page.waitForSelector('.mine .empty');
step('deleted; community cards now: ' + await page.evaluate(() => document.querySelectorAll('.mine-item').length));

// mobile screenshots
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:8000/?emulator#/add');
await page.waitForSelector('.editor-form .ed-section');
await shot('08-mobile-editor');
await page.goto('http://localhost:8000/?emulator#/');
await page.click('[data-id="all"]');
await page.waitForSelector('.card');
await shot('09-mobile-home');
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
