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

  function buildSingleRecipePrompt({ dishName, ingredientsOnHand, appliances }) {
    return `Hi! I'm using CookQueue, a meal-prep site with strict recipe rules. I need ONE recipe as JSON matching the exact shape below. Base it on a real published recipe if you can, and cite it honestly (or set "source": null if you're not sure of a URL).

What I have in mind: ${dishName || '(pick something that fits the rules)'}
Ingredients I already have on hand: ${ingredientsOnHand || '(none specified — your choice)'}
Appliances available to me: ${appliances && appliances.length ? appliances.join(', ') : '(any of the approved ones below)'}

${rulesBlock()}

OUTPUT FORMAT
Valid JSON only: double quotes, no comments, no trailing commas. One recipe object in this exact shape:
${SHAPE}

${FIELD_RULES}

Check the recipe against every hard rule above (especially the sodium math and the calorie math in rule 9) before giving it to me, and fix anything that fails. Reply with just the JSON object.`;
  }

  function buildBatchPrompt({ ramble }) {
    return `Hi! I'm using CookQueue, a meal-prep site with strict recipe rules. I'm going to describe several recipes messily below. Please ask me clarifying questions ONE AT A TIME — don't guess — until you have enough for EACH recipe to satisfy every hard rule below (especially the per-serving macros and the zero-waste package sizes). Once you're confident, reply with a JSON array containing one object per recipe, in the exact shape below.

My notes:
${ramble || '(nothing written yet)'}

${rulesBlock()}

OUTPUT FORMAT
Valid JSON only: double quotes, no comments, no trailing commas. A JSON array, one object per recipe, each in this exact shape:
${SHAPE}

${FIELD_RULES}

Check every recipe against every hard rule above (especially the sodium math and the calorie math in rule 9) before giving me the array, and fix anything that fails.`;
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
