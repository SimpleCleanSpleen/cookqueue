/**
 * CookQueue — Smart Serving Scaler.
 *
 * An "optimal batch" is a serving count where every tracked (perishable,
 * packaged) ingredient is consumed in WHOLE packages: no half-used bag of
 * frozen broccoli or open can left in the fridge. Pantry staples are ignored.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.scaler = (function () {
  const EPS = 0.001;

  const isTracked = ing => !!ing.package && !ing.pantry;

  /** How much of an ingredient's package a batch uses. */
  function packageUsage(ing, servings) {
    const needed = ing.qtyPerServing * servings;
    if (!isTracked(ing)) return { needed, tracked: false };
    const units = needed / ing.package.size;
    const whole = Math.round(units);
    const isWhole = Math.abs(units - whole) < EPS;
    const toBuy = isWhole ? whole : Math.ceil(units);
    return {
      needed,
      tracked: true,
      units,                                   // e.g. 1.5 bags
      toBuy,                                   // packages to purchase
      leftover: isWhole ? 0 : toBuy - units,   // fraction of a package left open
      isOpen: !isWhole,
    };
  }

  function scaleIngredients(recipe, servings) {
    return recipe.ingredients.map(ing => ({ ...ing, usage: packageUsage(ing, servings) }));
  }

  function isOptimal(recipe, servings) {
    return recipe.ingredients.every(ing => !isTracked(ing) || !packageUsage(ing, servings).isOpen);
  }

  function openContainerCount(recipe, servings) {
    return recipe.ingredients.filter(ing => isTracked(ing) && packageUsage(ing, servings).isOpen).length;
  }

  /**
   * All zero-waste serving counts from 1…maxServings.
   * If none exist, fall back to the batches with the fewest open containers.
   */
  function optimalBatches(recipe) {
    const max = recipe.maxServings || 24;
    const all = Array.from({ length: max }, (_, i) => i + 1);
    const perfect = all.filter(n => isOptimal(recipe, n));
    if (perfect.length) return { perfect: true, sizes: perfect };
    const scored = all.map(n => ({ n, open: openContainerCount(recipe, n) }));
    const best = Math.min(...scored.map(s => s.open));
    return { perfect: false, sizes: scored.filter(s => s.open === best).map(s => s.n) };
  }

  /** Recommendation for the current serving count. */
  function recommend(recipe, servings) {
    const { perfect, sizes } = optimalBatches(recipe);
    const current = sizes.includes(servings);
    const next = sizes.find(n => n > servings) ?? null;
    const prev = [...sizes].reverse().find(n => n < servings) ?? null;
    const nearest = [next, prev].filter(n => n != null)
      .sort((a, b) => Math.abs(a - servings) - Math.abs(b - servings))[0] ?? null;
    const openItems = scaleIngredients(recipe, servings).filter(i => i.usage.tracked && i.usage.isOpen);
    return { perfect, sizes, current, next, prev, nearest, openItems };
  }

  /** Step duration at a given batch size (see `durationScaling` in the schema). */
  function scaleDuration(step, servings, baseServings) {
    const s = step.durationScaling ?? 0;
    const factor = (1 - s) + s * (servings / baseServings);
    return Math.max(1, Math.round(step.durationMin * factor));
  }

  return { packageUsage, scaleIngredients, isOptimal, optimalBatches, recommend, scaleDuration, isTracked };
})();
