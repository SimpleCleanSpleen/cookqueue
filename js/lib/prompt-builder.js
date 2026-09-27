/**
 * CookQueue — Recipe Helper prompt builder.
 *
 * Pure functions, no DOM, no Firebase. Builds copy-paste prompts for an
 * external free AI chat (ChatGPT, Gemini, Claude — never called from here;
 * see js/ui/recipe-helper.js). The numeric rules and appliance list are read
 * live from CookQueue.config so a prompt can never drift out of sync with
 * what RecipeService.validate() actually enforces. The JSON shape itself is
 * a template kept in sync by hand with docs/gemini-recipe-prompt.md's
 * OUTPUT FORMAT section — update both together.
 */
window.CookQueue = window.CookQueue || {};

CookQueue.PromptBuilder = (function () {
  const { RULES, APPLIANCES } = CookQueue.config;

  const applianceList = () => Object.entries(APPLIANCES)
    .filter(([, a]) => !a.storage)
    .map(([key, a]) => `"${key}" (${a.label}${a.dessertOnly ? ', desserts only' : ''})`)
    .join(', ');

  function rulesBlock() {
    const c = RULES.calories;
    return `HARD RULES (every recipe, per serving)
1. Calories by category: "main" ${c.main.min}–${c.main.max} kcal, "snack" ${c.snack.min}–${c.snack.max} kcal, "dessert" ${c.dessert.min}–${c.dessert.max} kcal.
2. Low salt: sodium ≤ ${RULES.maxSodiumMg} mg per serving. Count natural sodium too. Prefer no added salt; use no-salt-added canned goods. No soy sauce (even low-sodium) or bouillon — use coconut aminos instead. Show your real math, don't round down.
3. Low fat: calories from fat (fat g × 9) ≤ ${RULES.maxFatPctOfCalories}% of total calories.
4. High protein preferred: mains ≥ ${RULES.minProteinPreferred} g protein, or ≥ 30% of calories from protein.
5. At most ${RULES.maxIngredients} ingredients total, including spices, oils and pantry staples. Don't list water.
6. Active (hands-on) time ≤ ${RULES.maxActiveMinutes} minutes at baseServings. Passive time (baking, simmering, pressure cooking, freezing) doesn't count.
7. Appliances — ONLY these keys: ${applianceList()}, and "freezer" (storage only). No blender, food processor, grill, stand mixer or separate slow cooker.
8. Zero waste: every perishable ingredient gets a "package" with a real US grocery size. Pick qtyPerServing so some batch size ≤ maxServings uses up WHOLE packages of every perishable ingredient, and make baseServings one of those sizes (≤ 12).
9. Numbers must add up: calories within 5% of (protein × 4 + carbs × 4 + fat × 9).
10. Meal-prep friendly: keeps ≥ 3 days in the fridge (desserts may be freezer-only).`;
  }

  const SHAPE = `{
  "id": "kebab-case-unique-id",
  "schemaVersion": 2,
  "name": "Recipe Name",
  "tagline": "Short one-line hook, under 70 characters",
  "description": "2–3 sentences on what it is and why it's good.",
  "category": "main",
  "cuisine": "mexican",
  "tags": ["mexican", "gluten free", "high protein"],
  "spiceLevel": 2,
  "rating": 4.6,
  "ratingCount": 420,
  "baseServings": 4,
  "maxServings": 12,
  "container": "Bentgo 1-compartment (black)",
  "containerPlural": "Bentgo boxes",
  "servingsPerContainer": 1,
  "image": { "url": "images/kebab-case-unique-id.webp", "alt": "Recipe Name served on a white paper plate" },
  "source": { "name": "Site or blog name", "url": "https://...", "author": "Author name or null" },
  "nutritionPerServing": { "calories": 720, "protein": 55, "carbs": 90, "fat": 12, "fiber": 10, "sodium": 310 },
  "appliances": ["instantPot", "stovetop"],
  "ingredients": [
    { "id": "chicken", "name": "Boneless skinless chicken breast", "group": "Protein",
      "qtyPerServing": 8, "unit": "oz", "prep": "trimmed",
      "package": { "size": 32, "unit": "oz", "label": "2 lb family pack" } },
    { "id": "cumin", "name": "Ground cumin", "group": "Pantry",
      "qtyPerServing": 0.5, "unit": "tsp", "prep": "", "package": null, "pantry": true }
  ],
  "steps": [
    { "id": "season", "title": "Season the chicken", "detail": "Full instruction text.",
      "durationMin": 5, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
    { "id": "cook", "title": "Cook it through", "detail": "…",
      "durationMin": 20, "durationScaling": 0.1, "active": false, "appliance": "stovetop", "dependsOn": ["season"] },
    { "id": "portion", "title": "Portion into containers", "detail": "…",
      "durationMin": 5, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["cook"] }
  ],
  "storage": { "fridgeDays": 4, "freezerMonths": 2, "reheat": "Reheating instructions using approved appliances." },
  "notes": ["Optional helpful tip."]
}`;

  const FIELD_RULES = `FIELD RULES
- category: "main" | "snack" | "dessert". spiceLevel: integer 0–5.
- ingredients[].group: "Protein" | "Dairy" | "Canned" | "Frozen" | "Produce" | "Pantry".
- ingredients[].unit: "oz" | "fl oz" | "cup" | "tbsp" | "tsp" | "can" | "box" | "bunch" | "each" | "scoop" — must match package.unit. Give "each"/"can"/"bunch" items a "singular" field.
- Pantry staples (spices, oils, dry goods) use "package": null and "pantry": true.
- Don't include a "barcode" field.
- steps: durationMin is at baseServings. durationScaling (0–1) is the share of that time that grows with batch size. "active": true = hands-on. The last step is portioning into containers. No circular dependsOn.
- Don't invent a source URL you didn't actually find — set "source": null instead.`;

  const UNITS_BLOCK = `UNITS — CONVERT AS WE GO
- I may give amounts in any system: grams, kilograms, ml, liters, pounds, ounces, cups, spoons, or loose amounts like "a handful" or "2 chicken breasts". Accept whatever I use.
- If I ask to switch systems (e.g. "show me that in metric" or "switch to imperial"), switch how you talk to me for the rest of the chat, and show the converted amounts.
- Whenever you convert something, show it briefly so I can check it, e.g. "200 g chicken ≈ 7 oz".
- Loose amounts: pin them down with a typical weight and tell me what you assumed (e.g. "1 medium chicken breast ≈ 8 oz").
- The FINAL JSON must only use these units: "oz", "fl oz", "cup", "tbsp", "tsp", "can", "box", "bunch", "each", "scoop". Convert everything into them for the JSON, no matter which system we chatted in (weights → "oz", liquids → "fl oz"/"cup"/"tbsp"/"tsp").`;

  const INTERVIEW_BLOCK = `HOW TO TALK TO ME
- Interview me step by step. Ask ONE short question at a time and wait for my answer before the next one. Don't dump a long form on me.
- Roughly in this order: the dish and what kind it is (main, snack or dessert) → how many servings → ingredients and amounts → which appliances I'll use → the steps and roughly how long each takes → anything you still need for nutrition.
- Suggest sensible defaults when I'm unsure, and fill in nutrition yourself from the ingredients (tell me your estimate).
- If something I want breaks a rule below (too much salt, too many ingredients, an appliance that isn't allowed…), tell me right away and suggest a fix.
- Before writing the JSON, show me a short plain-English summary (servings, ingredients with amounts, per-serving calories/protein/fat/sodium) and ask me to confirm.`;

  function buildSingleRecipePrompt() {
    return `Hi! I'm adding a recipe to CookQueue, a meal-prep site with strict recipe rules. Help me turn my recipe into JSON I can paste into the site.

${INTERVIEW_BLOCK}

${UNITS_BLOCK}

${rulesBlock()}

OUTPUT FORMAT
When I confirm the summary, reply with ONLY the final JSON (no commentary) in a single code block: valid JSON, double quotes, no comments, no trailing commas. One recipe object in this exact shape:
${SHAPE}

${FIELD_RULES}

Check the recipe against every hard rule above (especially the sodium math and the calorie math in rule 9) before giving me the JSON, and fix anything that fails.

Start now by asking me your first question.`;
  }

  function buildBatchPrompt() {
    return `Hi! I'm adding several recipes to CookQueue, a meal-prep site with strict recipe rules. Help me turn them into JSON I can paste into the site.

${INTERVIEW_BLOCK}
- First ask how many recipes I want to add and their names, then go through them ONE recipe at a time, finishing each one before starting the next.

${UNITS_BLOCK}

${rulesBlock()}

OUTPUT FORMAT
When I've confirmed every recipe, reply with ONLY the final JSON (no commentary) in a single code block: valid JSON, double quotes, no comments, no trailing commas. A JSON array with one object per recipe, each in this exact shape:
${SHAPE}

${FIELD_RULES}

Check every recipe against every hard rule above (especially the sodium math and the calorie math in rule 9) before giving me the array, and fix anything that fails.

Start now by asking me your first question.`;
  }

  function buildFixPrompt({ recipe, errors }) {
    return `This recipe JSON was rejected by CookQueue's rule checker. Please fix it and reply with the corrected JSON object only (same shape, don't add commentary).

ERRORS:
${(errors || []).map(e => `- ${e}`).join('\n') || '(no details given)'}

THE RECIPE:
${JSON.stringify(recipe, null, 2)}

${rulesBlock()}

EXPECTED SHAPE (for reference)
${SHAPE}

${FIELD_RULES}`;
  }

  return { buildSingleRecipePrompt, buildBatchPrompt, buildFixPrompt };
})();
