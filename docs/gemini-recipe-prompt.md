# Gemini recipe-batch prompt

Paste everything inside the fence into Gemini. Paste its JSON output into a copy
of `js/data/batch-template.js` (see the steps in that file). When the rules in
`js/config.js` change, update this prompt to match.

````text
Hi Gemini! I'm Claude, an AI assistant made by Anthropic, and I've been writing the code for PrepDash with Jeremy. PrepDash is a meal-prep website that looks like a food-delivery app. You browse a "menu," pick a batch size, and get zero-waste shopping lists and a parallel cooking timeline. You and I are on the same team now: you're writing the recipes and I'm building the site that displays them. The site checks every recipe automatically, so these rules are strict. A recipe that breaks one is hidden.

YOUR TASK
Create 25 meal-prep recipes. Base each one on a REAL recipe published on the web, then adapt it to the rules below (cut the salt, trim the fat, swap appliances, reduce the ingredient count). Credit the original in "source". Only cite pages you actually found and opened. If you can't confirm a URL, set "source": null. Don't guess.

Mix: 15 mains, 5 snacks, 5 desserts. Vary the cuisines (Mexican, Asian, Mediterranean, Indian, American, Italian, Middle Eastern, etc.) and include at least 4 vegan recipes. These ids already exist, so don't reuse them: chipotle-lime-chicken-burrito-bowls, orange-ginger-air-fryer-chicken-broccoli, harissa-lentil-chickpea-power-bowls, turkey-veggie-egg-white-bites, mexican-hot-chocolate-protein-creami.

HARD RULES (every recipe, per serving)
1. Calories by category: "main" 600–1200 kcal, "snack" 100–400 kcal, "dessert" 200–700 kcal.
2. Low salt: sodium ≤ 580 mg per serving (about ¼ tsp of salt). Count the natural sodium in the ingredients. Prefer no added salt. Use no-salt-added canned goods. No regular soy sauce, bouillon, or seasoning blends that contain salt. Coconut aminos is OK in small amounts.
3. Low fat: calories from fat (fat g × 9) ≤ 30% of total calories.
4. High protein preferred: mains ≥ 40 g protein, or ≥ 30% of calories from protein.
5. At most 10 ingredients in total, INCLUDING spices, oils, and pantry staples. Don't list water.
6. Active (hands-on) time ≤ 45 minutes at baseServings. Passive time (simmering, baking, pressure cooking, freezing) doesn't count.
7. Appliances: ONLY these keys: "oven", "stovetop", "instantPot" (Instant Pot Duo Plus), "airFryer" (Bella Pro Series 8 QT Air Fryer), "microwave" (Panasonic), "creami" (Ninja Creami Deluxe, DESSERTS ONLY), and "freezer" (storage only). No blender, food processor, grill, stand mixer, or separate slow cooker. Use the Instant Pot's slow-cook mode instead of a slow cooker.
8. Zero waste: every perishable ingredient gets a "package" with a real US grocery size (e.g. 16 oz bag frozen broccoli, 15 oz can, 32 oz tub, 1 bunch, 1 each). Choose qtyPerServing so that at least one batch size ≤ maxServings uses up WHOLE packages of every perishable ingredient. Make baseServings one of those batch sizes, and keep it ≤ 12. Example: 8 oz chicken per serving from a 32 oz pack plus 4 oz corn per serving from a 16 oz bag means 4 servings uses exactly 1 pack and 1 bag.
9. Numbers must add up: calories within 5% of (protein × 4 + carbs × 4 + fat × 9).
10. Meal-prep friendly: keeps at least 3 days in the fridge (desserts may be freezer-only).

OUTPUT FORMAT
Valid JSON only: double quotes, no comments, no trailing commas. Each recipe is one object in this shape:

{
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
  "imagePrompt": "see IMAGE PROMPTS below",
  "source": { "name": "Site or blog name", "url": "https://...", "author": "Author name or null" },
  "nutritionPerServing": { "calories": 720, "protein": 55, "carbs": 90, "fat": 12, "fiber": 10, "sodium": 310 },
  "appliances": ["instantPot", "stovetop"],
  "ingredients": [
    { "id": "chicken", "name": "Boneless skinless chicken breast", "group": "Protein",
      "qtyPerServing": 8, "unit": "oz", "prep": "trimmed",
      "package": { "size": 32, "unit": "oz", "label": "2 lb family pack" } },
    { "id": "limes", "name": "Limes", "singular": "Lime", "group": "Produce",
      "qtyPerServing": 0.5, "unit": "each", "prep": "juiced",
      "package": { "size": 1, "unit": "each", "label": "lime" } },
    { "id": "cumin", "name": "Ground cumin", "group": "Pantry",
      "qtyPerServing": 0.5, "unit": "tsp", "prep": "", "package": null, "pantry": true }
  ],
  "steps": [
    { "id": "season", "title": "Season the chicken", "detail": "Full instruction text.",
      "durationMin": 5, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
    { "id": "load", "title": "Load the Instant Pot", "detail": "…",
      "durationMin": 3, "durationScaling": 0.2, "active": true, "appliance": "instantPot", "dependsOn": ["season"] },
    { "id": "pressure", "title": "Pressure-cook", "detail": "…",
      "durationMin": 25, "durationScaling": 0.1, "active": false, "appliance": "instantPot", "dependsOn": ["load"] }
  ],
  "storage": { "fridgeDays": 4, "freezerMonths": 3, "reheat": "Reheating instructions using approved appliances." },
  "notes": ["Optional helpful tip."]
}

FIELD RULES
- category: "main" | "snack" | "dessert". spiceLevel: integer 0–5 (0 = mild).
- tags: lowercase. Use the cuisine plus any that apply: "vegan", "vegetarian", "gluten free", "dairy free", "high protein", "high fiber", "low carb", "no added salt", "low sodium", "dessert".
- rating (4.3–4.9) and ratingCount (50–3000) are PLACEHOLDERS for now. Real reviews come later.
- container: mains and snacks use "Bentgo 1-compartment (black)" / "Bentgo boxes" / servingsPerContainer 1. Creami desserts use "Ninja Creami Deluxe 24 oz pint (2 servings)" / "Creami pints" / servingsPerContainer 2.
- ingredients[].group: "Protein" | "Dairy" | "Canned" | "Frozen" | "Produce" | "Pantry".
- ingredients[].unit: "oz" | "fl oz" | "cup" | "tbsp" | "tsp" | "can" | "box" | "bunch" | "each" | "scoop". It MUST be the same unit as package.unit. For counted items (limes, peppers, cans) use unit "each", "can", or "bunch" with package size 1. Add "singular" for "each" items.
- Pantry staples (spices, oils, honey, dry rice/lentils/oats, protein powder) use "package": null and "pantry": true. They still count toward the 10-ingredient limit.
- Don't include a "barcode" field. Barcodes are added later by scanning real packages.
- qtyPerServing is PER SERVING, not per batch.
- steps: durationMin is measured at baseServings. durationScaling (0–1) is the share of that time that grows with batch size (chopping ≈ 0.8, portioning = 1, simmering/baking ≈ 0–0.2). "active": true means hands-on, false means hands-off. Split "load the appliance" (active) from "cook" (passive) so the timeline can run tasks in parallel. Make oven preheating its own passive "oven" step. dependsOn lists the step ids that must finish first. No circular dependencies. The last step is portioning into containers.
- appliances: every appliance used in the steps (freezer doesn't need listing).

IMAGE PROMPTS
Each recipe gets ONE photo: the finished dish served on a plain white paper plate. Write "imagePrompt" in this style: "Appetizing overhead food photo of [dish, with its key visible components] served on a plain white paper plate, on a light wood table, soft natural daylight, realistic, no text, no hands, 4:3." Use the same style for all 25 so the menu looks consistent.

HOW TO DELIVER
Send 5 recipes per reply. Each reply is ONE ```json code block containing a JSON array of 5 recipe objects. After the block, add a plain list of that reply's image prompts ("id: prompt"). Then stop and wait for me to say "next". Before each reply, check every recipe against all 10 hard rules and the math in rule 9, and fix anything that fails.
````
