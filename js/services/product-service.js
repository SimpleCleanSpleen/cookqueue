/**
 * CookQueue — product lookup by barcode.
 *
 * lookup() checks CookQueue's own shared catalog (Firestore products/{gtin})
 * first, then Open Food Facts (free, open data, no key). contribute() adds
 * the barcoded ingredients of a saved recipe to the shared catalog, so the
 * next person who scans the same product gets the same name and size, even
 * when Open Food Facts has never heard of it.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.ProductService = (function () {
  const OFF = 'https://world.openfoodfacts.org/api/v2/product/';
  const OFF_FIELDS = 'product_name,product_name_en,generic_name,brands,quantity,product_quantity,product_quantity_unit,categories_tags';
  const G_PER_OZ = 28.3495, ML_PER_FLOZ = 29.5735;

  /** 32.03 → 32, 14.99 → 15, 5.29 → 5.3 */
  function tidy(n) {
    const whole = Math.round(n);
    return Math.abs(n - whole) <= 0.15 ? whole : Math.round(n * 10) / 10;
  }

  /** Aisle guess from Open Food Facts categories. */
  function guessGroup(tags = []) {
    const has = re => tags.some(t => re.test(t));
    if (has(/frozen/)) return 'Frozen';
    if (has(/canned|tinned/)) return 'Canned';
    if (has(/dairies|dairy|yogurts|cheeses|milks/)) return 'Dairy';
    if (has(/meats|poultry|chicken|beef|pork|turkey|fishes|seafood|tofu|eggs/)) return 'Protein';
    if (has(/fresh-vegetables|fresh-fruits|salads/)) return 'Produce';
    return 'Pantry';
  }

  /** Open Food Facts product → CookQueue product, or null if it lacks a name or size. */
  function fromOFF(p) {
    const name = (p.product_name_en || p.product_name || p.generic_name || '').trim();
    const qty = +p.product_quantity;
    const unit = String(p.product_quantity_unit || 'g').toLowerCase();
    if (!name) return null;
    let size = null, ourUnit = null;
    if (qty > 0 && unit === 'g') { size = tidy(qty / G_PER_OZ); ourUnit = 'oz'; }
    if (qty > 0 && unit === 'ml') { size = tidy(qty / ML_PER_FLOZ); ourUnit = 'fl oz'; }
    return {
      name: name.slice(0, 120),
      brand: String(p.brands || '').split(',')[0].trim().slice(0, 60),
      size, unit: ourUnit,
      label: size ? `${size} ${ourUnit}${p.quantity ? ` (${String(p.quantity).slice(0, 40)})` : ''}` : String(p.quantity || '').slice(0, 60),
      group: guessGroup(p.categories_tags),
      source: 'openfoodfacts',
    };
  }

  async function fromOpenFoodFacts(gtin) {
    const res = await fetch(`${OFF}${gtin}.json?fields=${OFF_FIELDS}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);
    const data = await res.json();
    return data.status === 1 && data.product ? fromOFF(data.product) : null;
  }

  /**
   * Finds a product by normalized barcode.
   * Resolves to { product, from: 'cookqueue' | 'openfoodfacts' } or { product: null }.
   */
  async function lookup(gtin) {
    const Cloud = CookQueue.Cloud;
    if (Cloud?.enabled) {
      const mine = await Cloud.getProduct(gtin).catch(() => null);
      if (mine) return { product: mine, from: 'cookqueue' };
    }
    try {
      const off = await fromOpenFoodFacts(gtin);
      if (off) {
        if (off.size && Cloud?.enabled && Cloud.session.user && Cloud.session.profile) {
          Cloud.saveProduct(gtin, off).catch(() => {}); // cache for the next person
        }
        return { product: off, from: 'openfoodfacts' };
      }
    } catch (err) {
      console.warn('[CookQueue] Open Food Facts lookup failed:', err);
      return { product: null, offline: true };
    }
    return { product: null };
  }

  /**
   * Shares the barcoded ingredients of a just-saved recipe with the catalog.
   * Best effort: a failure here never blocks saving the recipe.
   */
  async function contribute(recipe) {
    const Cloud = CookQueue.Cloud;
    if (!Cloud?.enabled || !Cloud.session.user) return;
    const items = recipe.ingredients.filter(i => i.barcode && i.package && i.package.size > 0);
    await Promise.all(items.map(i => Cloud.saveProduct(i.barcode, {
      name: i.name, size: i.package.size, unit: i.package.unit,
      label: i.package.label, group: i.group, source: 'user',
    }).catch(err => console.warn(`[CookQueue] Could not share barcode ${i.barcode}:`, err))));
  }

  return { lookup, contribute, fromOFF };
})();
