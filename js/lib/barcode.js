/**
 * CookQueue — barcode helpers (UPC / EAN, a.k.a. GTIN).
 *
 * Normalizes codes so the same product always gets the same key, and finds
 * barcodes in a camera stream or photo. Uses the browser's built-in
 * BarcodeDetector where it exists (Chrome on Android, macOS) and otherwise
 * loads a free open-source replacement (zxing-wasm, ~1 MB, from jsDelivr)
 * the first time someone scans.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.barcode = (function () {
  const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/dist/iife/ponyfill.js';
  const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

  /** GS1 check digit: the last digit of every UPC/EAN. */
  function checkDigitOk(code) {
    const digits = code.split('').map(Number);
    const check = digits.pop();
    const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === check;
  }

  /** 6-digit UPC-E body (with number system + check) → 12-digit UPC-A. */
  function upcEtoA(code) {
    const [ns, d1, d2, d3, d4, d5, d6, check] = code.split('');
    let body;
    if ('012'.includes(d6)) body = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
    else if (d6 === '3') body = `${d1}${d2}${d3}00000${d4}${d5}`;
    else if (d6 === '4') body = `${d1}${d2}${d3}${d4}00000${d5}`;
    else body = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
    return `${ns}${body}${check}`;
  }

  /**
   * Cleans up a typed or scanned code. Returns { gtin, error }.
   * UPC-A (12) and GTIN-14 with a leading 0 become 13 digits, so a UPC and
   * its EAN-13 form share one key. UPC-E (8, starting 0/1) is expanded.
   */
  function normalize(raw, format = '') {
    let code = String(raw || '').replace(/\D/g, '');
    if (!code) return { gtin: '', error: 'Type the numbers under the barcode.' };
    if (![8, 12, 13, 14].includes(code.length)) return { gtin: '', error: 'Barcodes have 8, 12 or 13 digits.' };
    if (code.length === 8 && (format === 'upc_e' || (/^[01]/.test(code) && !checkDigitOk(code)))) {
      const a = upcEtoA(code);
      if (checkDigitOk(a)) code = a;
    }
    if (!checkDigitOk(code)) return { gtin: '', error: 'That number doesn\'t look right. Check for a typo.' };
    if (code.length === 12) code = `0${code}`;
    if (code.length === 14 && code.startsWith('0')) code = code.slice(1);
    return { gtin: code, error: '' };
  }

  let detectorPromise = null;

  /** A BarcodeDetector for retail formats (native, or the polyfill). */
  function detector() {
    return detectorPromise ||= (async () => {
      const Native = window.BarcodeDetector;
      if (Native) {
        try {
          const supported = await Native.getSupportedFormats();
          if (FORMATS.some(f => supported.includes(f))) return new Native({ formats: FORMATS.filter(f => supported.includes(f)) });
        } catch { /* fall through to the polyfill */ }
      }
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = POLYFILL;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Could not load the barcode scanner. Type the number instead.'));
        document.head.appendChild(s);
      });
      return new window.BarcodeDetectionAPI.BarcodeDetector({ formats: FORMATS });
    })().catch(err => { detectorPromise = null; throw err; });
  }

  /** First valid retail barcode in an image/video/bitmap, or null. */
  async function detect(source) {
    const found = await (await detector()).detect(source);
    for (const b of found) {
      const { gtin } = normalize(b.rawValue, b.format);
      if (gtin) return gtin;
    }
    return null;
  }

  /** Finds a barcode in a photo the user picked. */
  async function detectInFile(file) {
    const bitmap = await createImageBitmap(file);
    try { return await detect(bitmap); } finally { bitmap.close && bitmap.close(); }
  }

  /**
   * Streams the back camera into `video` and resolves with the first barcode.
   * Stops the camera when a code is found, on stop(), or when the video is
   * removed from the page.
   * @returns {{ result: Promise<string|null>, stop: () => void }}
   */
  function scanVideo(video) {
    let stream = null, stopped = false, timer = null;
    const stop = () => {
      stopped = true;
      clearTimeout(timer);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    const result = (async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser can\'t use the camera here. Type the number or pick a photo.');
      const det = await detector();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (stopped) { stop(); return null; }
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      video.muted = true;
      await video.play();
      return new Promise((resolve, reject) => {
        const tick = async () => {
          if (stopped || !video.isConnected) { stop(); return resolve(null); }
          try {
            if (video.readyState >= 2) {
              for (const b of await det.detect(video)) {
                const { gtin } = normalize(b.rawValue, b.format);
                if (gtin) { stop(); return resolve(gtin); }
              }
            }
          } catch (err) { stop(); return reject(err); }
          timer = setTimeout(tick, 200);
        };
        tick();
      });
    })();
    result.catch(() => stop());
    return { result, stop };
  }

  return { normalize, checkDigitOk, detectInFile, scanVideo };
})();
