/**
 * CookQueue — Recipe service (data access layer).
 *
 * The UI talks ONLY to this service, never to the batch files or Firebase
 * directly. Recipes come from two places:
 *  - batch files (js/data/*.js pushing onto CookQueue.RECIPE_BATCHES)
 *  - community recipes in Firestore, via CookQueue.Cloud (when enabled)
 * Both go through the same validate() rules.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.RecipeService = (function () {
  const { RULES, APPLIANCES } = CookQueue.config;
  const { clone, delay, fmtNum } = CookQueue.util;
  const { fatPct } = CookQueue.nutrition;
  const { activeMinutes } = CookQueue.scheduler;

  const isNum = v => typeof v === 'number' && Number.isFinite(v);
  const isStr = v => typeof v === 'string';

  /**
   * Type checks for recipes from outside the repo (Firestore, AI output).
   * Anything rendered as a number must really be a number, so a hand-crafted
   * document can't smuggle HTML into the page.
   */
  function shapeErrors(r) {
    const e = [];
    if (!r || typeof r !== 'object') return ['Recipe is not an object'];
    if (r.id != null && !isStr(r.id)) e.push('"id" must be text');
    ['name', 'tagline', 'description', 'category', 'cuisine', 'container'].forEach(k => { if (!isStr(r[k])) e.push(`"${k}" must be text`); });
    if (!Array.isArray(r.tags) || !r.tags.every(isStr)) e.push('"tags" must be a list of text');
    if (!Number.isInteger(r.spiceLevel) || r.spiceLevel < 0 || r.spiceLevel > 5) e.push('"spiceLevel" must be 0–5');
    ['baseServings', 'maxServings'].forEach(k => { if (!Number.isInteger(r[k]) || r[k] < 1) e.push(`"${k}" must be a whole number ≥ 1`); });
    if (r.servingsPerContainer != null && !isNum(r.servingsPerContainer)) e.push('"servingsPerContainer" must be a number');
    if (r.rating != null && !isNum(r.rating)) e.push('"rating" must be a number');
    if (r.ratingCount != null && !isNum(r.ratingCount)) e.push('"ratingCount" must be a number');
    const n = r.nutritionPerServing || {};
    ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium'].forEach(k => { if (!isNum(n[k]) || n[k] < 0) e.push(`Nutrition "${k}" must be a number`); });
    if (!r.image || !isStr(r.image.url)) e.push('Recipe needs an image ({ url, alt })');
    if (!Array.isArray(r.ingredients) || !r.ingredients.length) e.push('Needs at least one ingredient');
    else r.ingredients.forEach((i, k) => {
      if (!isStr(i.name) || !i.name.trim() || !isStr(i.unit) || !isNum(i.qtyPerServing) || i.qtyPerServing <= 0) e.push(`Ingredient ${k + 1} needs a name, unit and amount`);
      if (i.package && (!isNum(i.package.size) || i.package.size <= 0 || !isStr(i.package.label))) e.push(`Ingredient ${k + 1} needs a package size`);
      if (i.barcode != null && !(isStr(i.barcode) && /^\d{8,14}$/.test(i.barcode))) e.push(`Ingredient ${k + 1} has an invalid barcode`);
    });
    if (!Array.isArray(r.steps) || !r.steps.length) e.push('Needs at least one step');
    else r.steps.forEach((s, k) => {
      if (!isStr(s.id) || !isStr(s.title) || !s.title.trim()) e.push(`Step ${k + 1} needs a title`);
      if (!isNum(s.durationMin) || s.durationMin < 0 || !isNum(s.durationScaling)) e.push(`Step ${k + 1} needs minutes`);
      if (s.detail != null && !isStr(s.detail)) e.push(`Step ${k + 1} instructions must be text`);
    });
    const st = r.storage || {};
    if (!isNum(st.fridgeDays) || !isNum(st.freezerMonths) || !isStr(st.reheat)) e.push('Storage needs fridge days, freezer months and reheating');
    if (r.notes != null && (!Array.isArray(r.notes) || !r.notes.every(isStr))) e.push('"notes" must be a list of text');
    return e;
  }

  /**
   * Validate a recipe against CookQueue's dietary, appliance and effort rules.
   * Run it on every recipe, and especially on AI-generated ones before display.
   * @returns {{ok:boolean, errors:string[], checks:Array<{label:string, ok:boolean}>}}
   */
  function validate(r) {
    const shape = shapeErrors(r);
    if (shape.length) return { ok: false, errors: shape, checks: [] };
    const errors = [];
    const n = r.nutritionPerServing || {};
    const checks = [];
    const check = (ok, label, error) => { checks.push({ ok, label }); if (!ok) errors.push(error || label); };

    const cal = RULES.calories[r.category];
    if (!cal) errors.push(`Unknown category "${r.category}" (expected ${Object.keys(RULES.calories).join(', ')})`);
    else check(n.calories >= cal.min && n.calories <= cal.max,
      `${cal.label}: ${cal.min}–${fmtNum(cal.max)} kcal`, `Calories ${n.calories} outside ${cal.min}–${cal.max} for a ${r.category}`);
    check(fatPct(n) <= RULES.maxFatPctOfCalories,
      `Low fat (${Math.round(fatPct(n))}% of kcal)`, `Fat is ${Math.round(fatPct(n))}% of calories`);
    check(n.sodium <= RULES.maxSodiumMg,
      `Low salt: ${n.sodium} mg sodium (max ${RULES.maxSodiumMg} mg ≈ ¼ tsp salt)`, `Sodium ${n.sodium} mg exceeds ${RULES.maxSodiumMg} mg (¼ tsp salt)`);
    check(r.ingredients.length <= RULES.maxIngredients,
      `${r.ingredients.length} of max ${RULES.maxIngredients} ingredients`, `${r.ingredients.length} ingredients exceeds the ${RULES.maxIngredients}-ingredient limit`);

    const active = activeMinutes(r);
    check(active <= RULES.maxActiveMinutes,
      `≤ ${RULES.maxActiveMinutes} min hands-on (${active} min)`, `Active time ${active} min exceeds cap`);

    const used = new Set([...(r.appliances || []), ...r.steps.map(s => s.appliance).filter(Boolean)]);
    const unknown = [...used].filter(a => !APPLIANCES[a]);
    const dessertViolations = [...used].filter(a => APPLIANCES[a]?.dessertOnly && r.category !== 'dessert');
    check(!unknown.length && !dessertViolations.length, 'Approved appliances only',
      unknown.length ? `Unapproved appliance(s): ${unknown.join(', ')}`
        : `${dessertViolations.map(a => APPLIANCES[a].label).join(', ')} is dessert-only`);

    // Structural integrity (not shown as a user-facing check)
    const ids = new Set(r.steps.map(s => s.id));
    r.steps.forEach(s => (s.dependsOn || []).forEach(d => {
      if (!ids.has(d)) errors.push(`Step "${s.id}" depends on missing step "${d}"`);
    }));
    r.ingredients.forEach(i => {
      if (i.package && i.package.unit !== i.unit) errors.push(`Ingredient "${i.id}" unit (${i.unit}) ≠ package unit (${i.package.unit})`);
    });
    if (!r.image?.url) errors.push('Recipe needs an image ({ url, alt })');
    if (r.source && (!r.source.name || !/^https?:\/\//.test(r.source.url || ''))) errors.push('source needs a name and an http(s) url');

    // AI-written numbers must add up: 4 kcal/g protein & carbs, 9 kcal/g fat (±10%).
    const macroKcal = n.protein * 4 + n.carbs * 4 + n.fat * 9;
    if (Math.abs(macroKcal - n.calories) > n.calories * 0.1) {
      errors.push(`Macros add up to ${Math.round(macroKcal)} kcal but calories say ${n.calories}`);
    }
    const stepIds = r.steps.map(s => s.id);
    if (new Set(stepIds).size !== stepIds.length) errors.push('Duplicate step ids');
    if (!errors.length) {
      try { CookQueue.scheduler.schedule(r, { servings: r.baseServings, cooks: 1 }); }
      catch (err) { errors.push(err.message); } // e.g. circular dependsOn
    }

    return { ok: errors.length === 0, errors, checks };
  }

  /** All recipes from every loaded batch file (see js/data/batch-template.js). */
  const allRecipes = () => (CookQueue.RECIPE_BATCHES || []).flatMap(b =>
    (b.recipes || []).flat().map(r => ({ ...r, batch: b.name })));

  /** Recipes hidden by the last list() call, with the reasons. */
  const rejected = [];

  /** Community recipes from the last list() call. */
  let community = [];

  async function loadCommunity() {
    const Cloud = CookQueue.Cloud;
    if (!Cloud || !Cloud.enabled) return [];
    try {
      return (await Cloud.listRecipes()).map(r => ({ ...r, batch: `Community (by ${r.community.author})` }));
    } catch (err) {
      console.warn('[CookQueue] Could not load community recipes:', err);
      return [];
    }
  }

  /**
   * Every recipe that passes validation. Recipes that fail (or reuse an
   * existing id) are hidden and recorded in `rejected`.
   */
  async function list() {
    community = await loadCommunity();
    rejected.length = 0;
    const seen = new Set();
    const ok = [];
    [...allRecipes(), ...community].forEach(r => {
      let errors;
      try {
        errors = seen.has(r.id) ? [`Duplicate id "${r.id}"`] : validate(r).errors;
      } catch (err) {
        errors = [`Malformed recipe: ${err.message}`];
      }
      if (errors.length) {
        rejected.push({ id: r.id, name: r.name, batch: r.batch, errors, recipe: clone(r) });
        console.warn(`[CookQueue] Hidden "${r.name || r.id}" (${r.batch}):`, errors);
      } else {
        seen.add(r.id);
        ok.push(clone(r));
      }
    });
    return ok;
  }

  async function get(id) {
    const r = [...allRecipes(), ...community].find(x => x.id === id);
    return r ? clone(r) : null;
  }

  /**
   * Saves a community recipe for the signed-in user: creates it, or replaces
   * `id` when editing. Refuses anything that breaks a rule. Resolves to the id.
   */
  async function save(recipe, id = null) {
    const check = validate(recipe);
    if (!check.ok) throw new Error(check.errors.join('; '));
    const savedId = id ? (await CookQueue.Cloud.updateRecipe(id, recipe), id) : await CookQueue.Cloud.createRecipe(recipe);
    CookQueue.ProductService.contribute(recipe); // shares new barcodes; never blocks the save
    return savedId;
  }

  async function remove(id) {
    await CookQueue.Cloud.deleteRecipe(id);
  }

  /**
   * MOCK generator: scores the existing recipes against the preferences and
   * returns the best match after a short "cooking" delay.
   * Swap this for your LLM / API call; it must resolve to ONE recipe object
   * in the documented schema. Run `validate()` on the result before showing it.
   *
   * @param {{mealType?:string, cuisine?:string, diet?:string[], maxSpice?:number,
   *          appliance?:string, maxActive?:number}} prefs
   */
  async function generate(prefs = {}) {
    await delay(1200);
    const pool = allRecipes().filter(r => { try { return validate(r).ok; } catch { return false; } });
    const scored = pool.map(r => {
      let score = Math.random() * 0.5; // light shuffle so "Surprise me" varies
      if (prefs.mealType && prefs.mealType !== 'any') score += r.category === prefs.mealType ? 5 : -10;
      if (prefs.cuisine && prefs.cuisine !== 'any') score += r.cuisine === prefs.cuisine ? 3 : -1;
      (prefs.diet || []).forEach(d => { score += r.tags.includes(d) ? 2 : -4; });
      if (prefs.maxSpice != null) score += r.spiceLevel <= prefs.maxSpice ? 1 : -3;
      if (prefs.appliance && prefs.appliance !== 'any') score += r.appliances.includes(prefs.appliance) ? 2 : -2;
      if (prefs.maxActive) score += activeMinutes(r) <= prefs.maxActive ? 1 : -2;
      return { r, score };
    }).sort((a, b) => b.score - a.score);
    const best = clone(scored[0].r);
    const exact = scored[0].score >= 0;
    return { recipe: best, exact };
  }

  return { list, get, save, remove, generate, validate, rejected };
})();
