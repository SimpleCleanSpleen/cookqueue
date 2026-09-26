/**
 * PrepDash — small, dependency-free helpers (formatting, escaping).
 */
window.PrepDash = window.PrepDash || {};

PrepDash.util = (function () {
  const FRACTIONS = [
    [0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
    [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, ''],
  ];

  const PLURAL_UNITS = { can: 'cans', bunch: 'bunches', box: 'boxes', scoop: 'scoops', cup: 'cups' };

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 1.5 → "1½", 0.333 → "⅓", 2.37 → "2.4" */
  function fmtQty(q) {
    if (q <= 0) return '0';
    let whole = Math.floor(q + 1e-9);
    const frac = q - whole;
    let best = FRACTIONS[0];
    for (const f of FRACTIONS) if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
    if (Math.abs(best[0] - frac) > 0.04) return (Math.round(q * 10) / 10).toString();
    if (best[0] === 1) { whole += 1; best = FRACTIONS[0]; }
    return `${whole || (best[1] ? '' : '0')}${best[1]}`;
  }

  /**
   * Returns a human amount for a quantity + unit, promoting small units:
   * tsp → tbsp → cup, and oz ≥ 16 → lb.
   */
  function fmtAmount(qty, unit) {
    if (unit === 'tsp' && qty >= 3) { qty /= 3; unit = 'tbsp'; }
    if (unit === 'tbsp' && qty >= 4) { qty /= 16; unit = 'cup'; }
    if (unit === 'oz' && qty >= 16) {
      const lb = qty / 16;
      return `${fmtQty(lb)} lb`;
    }
    if (unit === 'each') return fmtQty(qty);
    const u = qty > 1 + 1e-9 && PLURAL_UNITS[unit] ? PLURAL_UNITS[unit] : unit;
    return `${fmtQty(qty)} ${u}`;
  }

  /** 95 → "1 hr 35 min" */
  function fmtMinutes(m) {
    m = Math.round(m);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} hr ${r} min` : `${h} hr`;
  }

  /** 95 → "1:35" (timeline axis clock) */
  function fmtClock(m) {
    m = Math.round(m);
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  }

  const fmtNum = n => Math.round(n).toLocaleString('en-US');

  const clone = obj => JSON.parse(JSON.stringify(obj));

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const titleCase = s => s.replace(/\b\w/g, c => c.toUpperCase());

  /** Placeholder photo shown until a recipe's real image exists. */
  function placeholderImage(name) {
    const text = encodeURIComponent(`${name}\\non a paper plate`).replace(/%20/g, '+').replace(/'/g, '%27');
    return `https://placehold.co/800x600/F4EBDD/5A4632/png?text=${text}&font=poppins`;
  }

  /**
   * <img> attributes with automatic fallbacks: images/<id>.webp → .png → .jpg
   * → .jpeg → placeholder. Photos can be saved in whatever format the image
   * generator produced.
   */
  function imgAttrs(recipe) {
    const url = recipe.image?.url;
    const chain = url && url.startsWith('images/')
      ? ['png', 'jpg', 'jpeg'].map(ext => url.replace(/\.\w+$/, `.${ext}`)).filter(u => u !== url)
      : [];
    chain.push(placeholderImage(recipe.name));
    return `src="${esc(url || chain[chain.length - 1])}" alt="${esc(recipe.image?.alt || recipe.name)}"
      data-fallbacks="${esc(JSON.stringify(chain))}" onerror="PrepDash.util.nextImage(this)"`;
  }

  /** onerror handler: try the next fallback URL. */
  function nextImage(img) {
    const list = JSON.parse(img.dataset.fallbacks || '[]');
    const next = list.shift();
    img.dataset.fallbacks = JSON.stringify(list);
    if (next) img.src = next; else img.onerror = null;
  }

  return { esc, fmtQty, fmtAmount, fmtMinutes, fmtClock, fmtNum, clone, delay, titleCase, placeholderImage, imgAttrs, nextImage };
})();
