/**
 * PrepDash — Recipe service (data access layer).
 *
 * The UI talks ONLY to this service, never to PrepDash.MOCK_RECIPES directly.
 * To go live, replace the bodies of `list`, `get` and `generate` with API
 * calls (e.g. `fetch('/api/recipes')`). Keep the same async signatures and
 * the same recipe schema, and the rest of the app keeps working.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.RecipeService = (function () {
  const { RULES, APPLIANCES } = PrepDash.config;
  const { clone, delay, fmtNum } = PrepDash.util;
  const { fatPct } = PrepDash.nutrition;
  const { activeMinutes } = PrepDash.scheduler;

  /**
   * Validate a recipe against PrepDash's dietary, appliance and effort rules.
   * Run it on every recipe, and especially on AI-generated ones before display.
   * @returns {{ok:boolean, errors:string[], checks:Array<{label:string, ok:boolean}>}}
   */
  function validate(r) {
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
      try { PrepDash.scheduler.schedule(r, { servings: r.baseServings, cooks: 1 }); }
      catch (err) { errors.push(err.message); } // e.g. circular dependsOn
    }

    return { ok: errors.length === 0, errors, checks };
  }

  /** All recipes from every loaded batch file (see js/data/batch-template.js). */
  const allRecipes = () => (PrepDash.RECIPE_BATCHES || []).flatMap(b =>
    (b.recipes || []).flat().map(r => ({ ...r, batch: b.name })));

  /** Recipes hidden by the last list() call, with the reasons. */
  const rejected = [];

  /**
   * Every recipe that passes validation. Recipes that fail (or reuse an
   * existing id) are hidden and recorded in `rejected`.
   */
  async function list() {
    rejected.length = 0;
    const seen = new Set();
    const ok = [];
    allRecipes().forEach(r => {
      let errors;
      try {
        errors = seen.has(r.id) ? [`Duplicate id "${r.id}"`] : validate(r).errors;
      } catch (err) {
        errors = [`Malformed recipe: ${err.message}`];
      }
      if (errors.length) {
        rejected.push({ id: r.id, name: r.name, batch: r.batch, errors });
        console.warn(`[PrepDash] Hidden "${r.name || r.id}" (${r.batch}):`, errors);
      } else {
        seen.add(r.id);
        ok.push(clone(r));
      }
    });
    return ok;
  }

  async function get(id) {
    const r = allRecipes().find(x => x.id === id);
    return r ? clone(r) : null;
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

  return { list, get, generate, validate, rejected };
})();
