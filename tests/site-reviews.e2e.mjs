// End-to-end: the site owner (jeremy5) edits, re-photographs and deletes the
// recipes shipped in js/data, and two people rate + review a recipe.
// Runs against the Firebase emulators. See tests/README.md.
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
const OUT = new URL('./screenshots/', import.meta.url).pathname;
const FB = new URL('./node_modules/firebase/', import.meta.url).pathname;
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/gstatic\.com\/firebasejs\/[\d.]+\/(.+\.js)$/, route => {
  const f = route.request().url().match(/firebasejs\/[\d.]+\/(.+\.js)$/)[1];
  route.fulfill({ path: path.join(FB, f), contentType: 'application/javascript' });
});
await ctx.route(/placehold\.co|fonts\.(googleapis|gstatic)/, r => r.abort());
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/placehold|fonts|ERR_FAILED|taken/.test(m.text())) errors.push(m.text()); });
page.on('dialog', d => d.accept());

let pass = 0, fail = 0;
const check = (name, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', name); };
const go = async hash => { await page.goto('about:blank'); await page.goto(`http://localhost:8000/?emulator${hash}`); await page.waitForTimeout(1200); };
async function signIn(email, name) {
  await page.evaluate(async email => {
    const cred = firebase.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true, name: email.split('@')[0] }));
    await firebase.auth().signInWithCredential(cred);
  }, email);
  await page.waitForSelector('#username-form');
  await page.fill('#username-form input', name);
  await page.click('#username-form [type=submit]');
  await page.waitForSelector(`#account .account-btn.is-in >> text=@${name}`);
}
const cardCount = () => page.locator('.card-grid a.card').count();
const chip = () => page.locator('.recipe-title-row .rating').innerText();

await go('#/');
await page.waitForSelector('.card');
const startCards = await cardCount();
await signIn('jeremy@example.com', 'jeremy5');
await go('#/');
check(`site recipes credited to @jeremy5 (${startCards} cards)`, await page.locator('.card-author', { hasText: '@jeremy5' }).count() === startCards);

// ---- the owner edits a site recipe, photo included ----
await go('#/recipe/greek-chicken-sheet-pan');
check('owner sees Edit + Delete on a site recipe', await page.locator('.byline >> text=Edit').count() === 1 && await page.locator('[data-action="recipe-delete"]').count() === 1);
check('placeholder rating replaced by "New"', (await chip()).trim() === 'New');
await go('#/edit/greek-chicken-sheet-pan');
await page.waitForSelector('.editor-form [data-path="tagline"]');
await page.fill('.editor-form [data-path="tagline"]', 'Edited by the site owner');
await page.screenshot({ path: `${OUT}photo-source.png`, clip: { x: 0, y: 0, width: 400, height: 300 } });
await page.setInputFiles('[data-photo]', `${OUT}photo-source.png`);
await page.waitForSelector('.photo-preview img');
await page.click('[data-ed="save"]');
await page.waitForURL(/#\/recipe\/greek-chicken-sheet-pan$/);
await page.waitForTimeout(800);
check('edit saved: new tagline shown', (await page.locator('.tagline').innerText()) === 'Edited by the site owner');
check('edit saved: new photo is a data: URL', (await page.locator('.hero-img img').getAttribute('src')).startsWith('data:image/'));
await go('#/recipe/greek-chicken-sheet-pan');
check('Firestore copy replaces the file version after reload', (await page.locator('.tagline').innerText()) === 'Edited by the site owner');
await go('#/');
check('no duplicate card after the edit', await cardCount() === startCards);

// ---- reviews ----
await go('#/recipe/greek-chicken-sheet-pan');
await page.click('label[for="star-4"]');
await page.fill('#review-form textarea', 'Solid weeknight meal.');
await page.click('#review-form [type=submit]');
await page.waitForSelector('.review-list .review');
check('owner can rate own recipe: ★ 4.0 (1)', (await chip()).replace(/\s+/g, ' ').includes('4.0 (1)'));
await page.click('label[for="star-5"]');
await page.click('#review-form [type=submit]');
await page.waitForFunction(() => document.querySelector('.recipe-title-row .rating')?.textContent.includes('5.0'));
check('editing the review updates the rating to 5.0', true);
await page.screenshot({ path: `${OUT}reviews-owner.png`, fullPage: true });

// ---- the owner deletes a site recipe for good ----
await go('#/recipe/chickpea-shawarma-dip');
await page.click('[data-action="recipe-delete"]');
await page.waitForURL(/#\/mine$/);
await go('#/');
check('deleted site recipe is gone from the menu', await cardCount() === startCards - 1 && await page.locator('a[href="#/recipe/chickpea-shawarma-dip"]').count() === 0);

// ---- a friend ----
await page.click('#account .account-btn');
await page.click('[data-action="sign-out"]');
await page.waitForSelector('#account [data-action="sign-in"]');
await signIn('friend@example.com', 'friend_1');
await go('#/recipe/greek-chicken-sheet-pan');
check('friend does not see Edit/Delete on the owner\'s recipe', await page.locator('[data-action="recipe-delete"]').count() === 0);
await page.click('label[for="star-3"]');
await page.fill('#review-form textarea', 'A bit bland <b>for me</b>.');
await page.click('#review-form [type=submit]');
await page.waitForFunction(() => document.querySelectorAll('.review-list .review').length === 2);
check('two reviews average to ★ 4.0 (2)', (await chip()).replace(/\s+/g, ' ').includes('4.0 (2)'));
check('comment HTML is escaped, not rendered', await page.locator('.review p b').count() === 0 && (await page.locator('.review-list').innerText()).includes('<b>for me</b>'));
check('friend sees the owner review by @jeremy5', (await page.locator('.review-list').innerText()).includes('@jeremy5'));
await go('#/');
check('menu card shows the real rating', (await page.locator('a[href="#/recipe/greek-chicken-sheet-pan"] .rating').innerText()).includes('4.0'));
await page.screenshot({ path: `${OUT}reviews-friend.png`, fullPage: false });

check('no page errors', errors.length === 0);
if (errors.length) console.log(errors);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
