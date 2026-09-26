/**
 * PrepDash — "Scan or type a barcode" dialog used by the recipe editor.
 *
 * open({ onPick }) shows the dialog in #modal-root. The person can point the
 * camera at a barcode, pick a photo of one, or type the digits. The code is
 * looked up (ProductService) and onPick({ gtin, product, from, mode }) is
 * called with mode 'fill' (use the product's name and package size) or
 * 'link' (just attach the barcode).
 */
window.PrepDash = window.PrepDash || {};

PrepDash.BarcodePicker = (function () {
  const { esc } = PrepDash.util;
  const barcode = PrepDash.barcode;

  function open({ onPick, current = '' }) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" data-bc="close"></div>
      <div class="modal modal--small bc-modal" role="dialog" aria-modal="true" aria-labelledby="bc-title">
        <button class="icon-btn modal-x" data-bc="close" aria-label="Close">✕</button>
        <h2 id="bc-title">Add a barcode</h2>
        <p class="muted">Scan the package so everyone's recipes use the same product name and package size.</p>
        <div class="bc-camera" hidden><video muted playsinline></video><span class="bc-aim" aria-hidden="true"></span></div>
        <div class="bc-actions">
          <button type="button" class="btn btn-primary btn-small" data-bc="camera">📷 Scan with camera</button>
          <label class="btn btn-ghost btn-small">🖼 Photo of a barcode<input type="file" accept="image/*" data-bc-file hidden></label>
        </div>
        <form class="bc-type">
          <label class="field"><span class="field-label">Or type the numbers under the barcode</span>
            <input name="code" inputmode="numeric" autocomplete="off" maxlength="16" value="${esc(current)}" placeholder="e.g. 036000291452">
          </label>
          <button class="btn btn-ghost btn-small" type="submit">Look up</button>
        </form>
        <p class="field-hint bc-msg" role="status"></p>
        <div class="bc-result"></div>
      </div>`;
    document.body.classList.add('modal-open');
    const $ = sel => root.querySelector(sel);
    const msg = (text, warn = false) => { const el = $('.bc-msg'); if (el) { el.textContent = text; el.classList.toggle('warn', warn); } };
    let scan = null;

    function close() {
      if (scan) scan.stop();
      root.innerHTML = '';
      document.body.classList.remove('modal-open');
    }

    async function find(gtin) {
      if (scan) { scan.stop(); scan = null; }
      $('.bc-camera').hidden = true;
      $('.bc-type').code.value = gtin;
      msg(`Looking up ${gtin}…`);
      $('.bc-result').innerHTML = '';
      const { product, from, offline } = await PrepDash.ProductService.lookup(gtin);
      if (!root.contains($('.bc-result'))) return;
      if (product) {
        msg('');
        $('.bc-result').innerHTML = `
          <div class="bc-found">
            <b>${esc(product.name)}</b>
            <span class="muted small">${product.brand ? `${esc(product.brand)} · ` : ''}${product.size ? `${esc(product.label || `${product.size} ${product.unit}`)}` : 'Package size unknown'} · ${esc(product.group || '')}</span>
            <span class="muted small">From ${from === 'prepdash' ? 'PrepDash recipes' : 'Open Food Facts'} · ${esc(gtin)}</span>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-bc="fill">Use this name and package size</button>
          <button type="button" class="btn btn-ghost btn-block" data-bc="link">Keep my wording, just add the barcode</button>`;
      } else {
        msg(offline ? 'Couldn\'t reach the product database. You can still add the barcode.' : '');
        $('.bc-result').innerHTML = `
          <div class="bc-found">
            <b>New product: ${esc(gtin)}</b>
            <span class="muted small">It isn't in any database yet. Add the barcode, then type the name and package size. When you publish, they're saved so the next person who scans it gets them automatically.</span>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-bc="link">Add the barcode</button>`;
      }
      root.onclick = e => {
        const el = e.target.closest('[data-bc]');
        if (!el) return;
        if (el.dataset.bc === 'close') return close();
        if (el.dataset.bc === 'fill' || el.dataset.bc === 'link') {
          close();
          onPick({ gtin, product, from, mode: el.dataset.bc === 'fill' && product ? 'fill' : 'link' });
        }
        if (el.dataset.bc === 'camera') startCamera();
      };
    }

    async function startCamera() {
      $('.bc-camera').hidden = false;
      msg('Point the camera at the barcode…');
      scan = barcode.scanVideo($('.bc-camera video'));
      try {
        const gtin = await scan.result;
        if (gtin) find(gtin);
      } catch (err) {
        console.warn(err);
        $('.bc-camera').hidden = true;
        msg(err.name === 'NotAllowedError' ? 'Camera access was blocked. Pick a photo or type the number instead.' : err.message, true);
      }
    }

    root.onclick = e => {
      const el = e.target.closest('[data-bc]');
      if (!el) return;
      if (el.dataset.bc === 'close') close();
      if (el.dataset.bc === 'camera') startCamera();
    };
    root.querySelector('[data-bc-file]').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      msg('Reading the photo…');
      try {
        const gtin = await barcode.detectInFile(file);
        if (gtin) find(gtin); else msg('No barcode found in that photo. Try a closer, sharper shot, or type the number.', true);
      } catch (err) { msg(err.message, true); }
    });
    root.querySelector('.bc-type').addEventListener('submit', e => {
      e.preventDefault();
      const { gtin, error } = barcode.normalize(e.target.code.value);
      if (error) msg(error, true); else find(gtin);
    });
    const onKey = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    root.querySelector('.bc-type input').focus();
    return { close };
  }

  return { open };
})();
