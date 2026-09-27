// Barcode flow against the Firebase emulators: type a UPC (found on the mocked
// Open Food Facts), read an EAN-13 from a photo (unknown product, typed in by
// hand), scan one with a fake webcam, publish, then a second user gets the
// hand-typed product back from the shared CookQueue catalog. See tests/README.md.
import { chromium } from 'playwright-core';
import { execFileSync } from 'child_process';
import fs from 'fs';

const here = p => new URL(p, import.meta.url).pathname;
execFileSync('python3', [here('./make-barcodes.py')]);
const OUT = here('./screenshots/');
const NM = here('./node_modules/');
const BASE = 'http://localhost:8000/?emulator';

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${OUT}camera.y4m`],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['camera'] });
// Serve third-party scripts from node_modules (this sandbox can't reach the CDNs).
await ctx.route(/gstatic\.com\/firebasejs\/[\d.]+\/(.+\.js)$/, r => r.fulfill({ path: `${NM}firebase/${r.request().url().match(/firebasejs\/[\d.]+\/(.+\.js)$/)[1]}`, contentType: 'application/javascript' }));
await ctx.route(/cdn\.jsdelivr\.net\/npm\/barcode-detector@[\d.]+\/dist\/iife\/ponyfill\.js/, r => r.fulfill({ path: `${NM}barcode-detector/dist/iife/ponyfill.js`, contentType: 'application/javascript' }));
await ctx.route(/jsdelivr\.net\/npm\/zxing-wasm@[\d.]+\/dist\/reader\/zxing_reader\.wasm/, r => r.fulfill({ path: `${NM}zxing-wasm/dist/reader/zxing_reader.wasm`, contentType: 'application/wasm' }));
await ctx.route(/placehold\.co|fonts\./, r => r.abort());
// Mocked Open Food Facts: knows the chicken (UPC 036000291452), not the others.
const offCalls = [];
await ctx.route(/world\.openfoodfacts\.org\/api\/v2\/product\/(\d+)\.json/, r => {
  const code = r.request().url().match(/product\/(\d+)\.json/)[1];
  offCalls.push(code);
  if (code === '0036000291452') {
    return r.fulfill({ json: { status: 1, product: { product_name: 'Boneless Skinless Chicken Breasts', brands: 'Kirkwood', quantity: '2 lb', product_quantity: 907, product_quantity_unit: 'g', categories_tags: ['en:meats', 'en:poultry'] } } });
  }
  return r.fulfill({ status: 404, json: { status: 0 } });
});

const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const step = s => console.log('→', s);
let failed = 0;
const expect = (ok, what) => { console.log(ok ? '  ok  ' : '  FAIL', what); if (!ok) failed++; };

async function signIn(email, name) {
  await page.evaluate(async email => {
    await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })));
  }, email);
  await page.waitForSelector('#username-form');
  await page.fill('#username-form input', name);
  await page.click('#username-form [type=submit]');
  await page.waitForSelector(`#account >> text=@${name}`);
}
const nameOf = k => page.inputValue(`[data-path="ingredients.${k}.name"]`);

await page.goto(`${BASE}#/`);
await page.waitForSelector('#account [data-action="sign-in"]');
await signIn('jeremy@example.com', 'jeremy_cooks');
await page.goto(`${BASE}#/add`);
await page.waitForSelector('.editor-form .ed-section');
const json = await page.evaluate(() => { const r = structuredClone(CookQueue.RECIPE_BATCHES[0].recipes[0]); r.name = 'Barcode Test Chicken'; return JSON.stringify(r); });
await page.click('.ed-import summary');
await page.fill('#ed-json', json);
await page.click('[data-ed="import"]');

step('1. type a UPC for ingredient 1 (known to Open Food Facts)');
await page.click('[data-ed="barcode"][data-i="0"]');
await page.fill('.bc-type input', '0360 0029 1453'); // typo: wrong check digit
await page.click('.bc-type [type=submit]');
expect((await page.textContent('.bc-msg')).includes("doesn't look right"), 'bad check digit rejected');
await page.fill('.bc-type input', '036000291452');
await page.click('.bc-type [type=submit]');
await page.waitForSelector('[data-bc="fill"]');
await page.screenshot({ path: `${OUT}b1-found.png` });
await page.click('[data-bc="fill"]');
expect(await nameOf(0) === 'Boneless Skinless Chicken Breasts', 'name filled from Open Food Facts');
expect(await page.inputValue('[data-path="ingredients.0.package.size"]') === '32', 'package size 907 g → 32 oz');
expect((await page.textContent('.barcode-chip')).includes('0036000291452'), 'UPC stored as 13-digit GTIN');

step('2. photo of an unknown EAN-13 for ingredient 2');
await page.click('[data-ed="barcode"][data-i="1"]');
await page.setInputFiles('[data-bc-file]', `${OUT}photo.bmp`);
await page.waitForSelector('[data-bc="link"]', { timeout: 60000 });
expect((await page.textContent('.bc-found')).includes('4006381333931'), 'barcode read from photo (polyfill)');
await page.click('[data-bc="link"]');
await page.fill('[data-path="ingredients.1.name"]', 'Store-brand frozen broccoli florets');
expect((await page.locator('.barcode-chip').count()) === 2, 'second barcode linked');

step('3. fake webcam for ingredient 3');
await page.click('[data-ed="barcode"][data-i="2"]');
await page.click('[data-bc="camera"]');
await page.waitForSelector('.bc-found', { timeout: 60000 });
expect((await page.textContent('.bc-found')).includes('0036000291452'), 'barcode read from camera');
await page.click('.bc-modal .modal-x');
expect(await page.evaluate(() => !document.querySelector('.bc-camera')), 'dialog closed');

step('4. publish; barcodes shared to the catalog');
await page.click('[data-ed="save"]');
await page.waitForURL(/#\/recipe\//);
await page.waitForFunction(() => firebase.firestore().doc('products/4006381333931').get().then(s => s.exists), null, { polling: 500, timeout: 10000 }).catch(() => {});
const catalog = await page.evaluate(async () => {
  const out = {};
  for (const id of ['4006381333931', '0036000291452']) { const s = await firebase.firestore().doc(`products/${id}`).get(); out[id] = s.exists ? s.data() : null; }
  return out;
});
expect(catalog['4006381333931']?.name === 'Store-brand frozen broccoli florets' && catalog['4006381333931'].source === 'user', 'hand-typed product saved to catalog');
expect(catalog['0036000291452']?.source === 'openfoodfacts', 'Open Food Facts result cached in catalog');

step('5. a friend types the same unknown barcode');
await page.evaluate(() => firebase.auth().signOut());
await page.waitForSelector('#account [data-action="sign-in"]');
await signIn('friend@example.com', 'pal');
await page.goto(`${BASE}#/add`);
await page.waitForSelector('.editor-form .ed-section');
const callsBefore = offCalls.length;
await page.click('[data-ed="barcode"][data-i="0"]');
await page.fill('.bc-type input', '4006381333931');
await page.click('.bc-type [type=submit]');
await page.waitForSelector('[data-bc="fill"]');
expect((await page.textContent('.bc-found')).includes('From CookQueue recipes'), 'found in the CookQueue catalog');
expect(offCalls.length === callsBefore, 'no Open Food Facts call needed');
await page.click('[data-bc="fill"]');
expect(await nameOf(0) === 'Store-brand frozen broccoli florets', 'friend gets the same name');
await page.setViewportSize({ width: 390, height: 844 });
await page.click('[data-ed="barcode"][data-i="0"]');
await page.waitForTimeout(400); // let the dialog's pop-in animation finish
await page.screenshot({ path: `${OUT}b2-mobile-dialog.png` });

console.log(errors.length ? `page errors: ${errors.join(' | ')}` : 'no page errors');
console.log(failed ? `${failed} FAILED` : 'all passed');
await browser.close();
process.exit(failed || errors.length ? 1 : 0);
