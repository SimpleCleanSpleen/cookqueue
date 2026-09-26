/**
 * PrepDash — mock recipe data.
 *
 * This array is intentionally pure JSON (no functions, no computed values)
 * so it can be replaced 1:1 by the output of a recipe generator / API.
 * See README.md → "Recipe Schema" for field-by-field documentation.
 *
 * Recipes are grouped into "batches". Each batch file pushes one object onto
 * PrepDash.RECIPE_BATCHES, so AI-generated batches can be added as new files
 * (see batch-template.js) without editing this one.
 *
 * Conventions
 *  - All quantities are PER SERVING (`qtyPerServing`), in the same unit as `package.unit`.
 *  - `package: null` + `pantry: true` marks shelf-stable staples that are ignored
 *    by the zero-waste batch calculator (spices, oils, rice, etc.). They still
 *    count toward the 10-ingredient limit.
 *  - Step `durationMin` is measured at `baseServings`; `durationScaling` (0–1) is the
 *    fraction of that time that grows linearly with batch size.
 *  - Step `active: true` = hands-on work (occupies a cook). `false` = passive/hands-off.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.RECIPE_BATCHES = PrepDash.RECIPE_BATCHES || [];
PrepDash.RECIPE_BATCHES.push({
  name: 'Starter menu (hand-written mocks)',
  recipes: [
  /* ------------------------------------------------------------------ */
  {
    "id": "chipotle-lime-chicken-burrito-bowls",
    "schemaVersion": 2,
    "name": "Chipotle-Lime Chicken Burrito Bowls",
    "tagline": "Smoky shredded chicken, brown rice, black beans & sweet corn",
    "description": "Pressure-cooked chipotle chicken shredded in its own juices, served over brown rice with no-salt black beans, sweet corn, a quick onion-cilantro salsa and a tangy Greek-yogurt lime crema. All the flavor of a burrito bowl with zero added salt.",
    "category": "main",
    "cuisine": "mexican",
    "tags": ["mexican", "gluten free", "high protein", "no added salt"],
    "spiceLevel": 3,
    "rating": 4.8,
    "ratingCount": 1243,
    "baseServings": 6,
    "maxServings": 16,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "https://placehold.co/800x600/F4EBDD/5A4632/png?text=Chipotle-Lime+Chicken+Burrito+Bowl%5Cnon+a+paper+plate&font=poppins",
      "alt": "Chipotle-lime chicken burrito bowl served on a white paper plate"
    },
    "source": null,
    "nutritionPerServing": {
      "calories": 839, "protein": 82, "carbs": 112, "fat": 7, "fiber": 17, "sodium": 200
    },
    "appliances": ["instantPot", "stovetop", "microwave"],
    "ingredients": [
      { "id": "chicken", "name": "Boneless skinless chicken breast", "group": "Protein", "qtyPerServing": 8, "unit": "oz", "prep": "trimmed",
        "package": { "size": 32, "unit": "oz", "label": "2 lb family pack" } },
      { "id": "yogurt", "name": "Nonfat plain Greek yogurt", "group": "Dairy", "qtyPerServing": 4, "unit": "oz", "prep": "for the crema",
        "package": { "size": 32, "unit": "oz", "label": "32 oz tub" } },
      { "id": "black-beans", "name": "Black beans, no salt added", "group": "Canned", "qtyPerServing": 0.5, "unit": "can", "prep": "drained & rinsed",
        "package": { "size": 1, "unit": "can", "label": "15 oz can" } },
      { "id": "tomatoes-canned", "name": "Fire-roasted diced tomatoes, no salt added", "group": "Canned", "qtyPerServing": 0.25, "unit": "can", "prep": "undrained",
        "package": { "size": 1, "unit": "can", "label": "14.5 oz can" } },
      { "id": "corn", "name": "Frozen sweet corn", "group": "Frozen", "qtyPerServing": 4, "unit": "oz", "prep": "",
        "package": { "size": 16, "unit": "oz", "label": "16 oz bag" } },
      { "id": "red-onion", "name": "Red onions", "singular": "Red onion", "group": "Produce", "qtyPerServing": 0.25, "unit": "each", "prep": "finely diced",
        "package": { "size": 1, "unit": "each", "label": "onion" } },
      { "id": "cilantro", "name": "Cilantro", "group": "Produce", "qtyPerServing": 0.25, "unit": "bunch", "prep": "chopped",
        "package": { "size": 1, "unit": "bunch", "label": "bunch" } },
      { "id": "limes", "name": "Limes", "singular": "Lime", "group": "Produce", "qtyPerServing": 0.5, "unit": "each", "prep": "zested & juiced",
        "package": { "size": 1, "unit": "each", "label": "lime" } },
      { "id": "brown-rice", "name": "Long-grain brown rice", "group": "Pantry", "qtyPerServing": 0.333, "unit": "cup", "prep": "dry, rinsed", "package": null, "pantry": true },
      { "id": "chipotle", "name": "Chipotle chili powder (salt-free)", "group": "Pantry", "qtyPerServing": 0.75, "unit": "tsp", "prep": "divided", "package": null, "pantry": true }
    ],
    "steps": [
      { "id": "rice-start", "title": "Rinse & start the rice", "detail": "Rinse the brown rice, then bring it to a boil in a saucepan with 2¼ cups water per cup of rice.", "durationMin": 4, "durationScaling": 0.2, "active": true, "appliance": "stovetop", "dependsOn": [] },
      { "id": "rice-simmer", "title": "Simmer rice (covered)", "detail": "Reduce to low, cover and simmer 40 minutes. Don't lift the lid.", "durationMin": 40, "durationScaling": 0, "active": false, "appliance": "stovetop", "dependsOn": ["rice-start"] },
      { "id": "season-chicken", "title": "Season the chicken", "detail": "Mix ½ tsp chipotle powder per serving with the zest of all the limes. Rub all over the chicken.", "durationMin": 6, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "load-ip", "title": "Load the Instant Pot", "detail": "Add chicken, canned tomatoes and ½ cup water to the Instant Pot Duo Plus. Seal the valve and set Pressure Cook, High, 10 minutes.", "durationMin": 3, "durationScaling": 0.2, "active": true, "appliance": "instantPot", "dependsOn": ["season-chicken"] },
      { "id": "pressure-chicken", "title": "Pressure-cook chicken", "detail": "About 8 minutes to reach pressure, 10 minutes cooking, then 10 minutes natural release.", "durationMin": 28, "durationScaling": 0.15, "active": false, "appliance": "instantPot", "dependsOn": ["load-ip"] },
      { "id": "salsa", "title": "Chop onion-cilantro salsa", "detail": "Finely dice the red onion, chop the cilantro, then toss with the juice of half the limes.", "durationMin": 7, "durationScaling": 0.8, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "crema", "title": "Whisk the chipotle-lime crema", "detail": "Whisk the Greek yogurt with the rest of the lime juice and ¼ tsp chipotle powder per serving. Refrigerate.", "durationMin": 3, "durationScaling": 0.3, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "beans-prep", "title": "Rinse beans, add corn", "detail": "Drain and rinse the beans, then combine with the frozen corn in a covered microwave-safe bowl.", "durationMin": 3, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "beans-micro", "title": "Microwave beans & corn", "detail": "Panasonic Microwave, full power, stirring once halfway.", "durationMin": 7, "durationScaling": 0.5, "active": false, "appliance": "microwave", "dependsOn": ["beans-prep"] },
      { "id": "shred", "title": "Shred chicken in its juices", "detail": "Shred with two forks directly in the pot and stir so it soaks up the chipotle-tomato liquid.", "durationMin": 5, "durationScaling": 0.7, "active": true, "appliance": "instantPot", "dependsOn": ["pressure-chicken"] },
      { "id": "portion", "title": "Portion into Bentgos", "detail": "Rice first, then beans & corn, chicken and salsa. Put the crema in a small cup, or dollop it on just before eating.", "durationMin": 8, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["rice-simmer", "shred", "salsa", "crema", "beans-micro"] }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 3,
      "reheat": "Panasonic Microwave, full power, 2½–3 minutes. Stir halfway. Add the crema after reheating."
    },
    "notes": [
      "Chipotle powder is pure ground chile; check that your brand is salt-free.",
      "For 16 servings, split the chicken across two Instant Pot runs so it stays under the max-fill line."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    "id": "orange-ginger-air-fryer-chicken-broccoli",
    "schemaVersion": 2,
    "name": "Orange-Ginger Air Fryer Chicken & Broccoli",
    "tagline": "Crispy glazed chicken, jasmine rice & steamed broccoli",
    "description": "Cornstarch-dusted chicken air-fried until crisp without deep-frying, then tossed in a bright orange, ginger and garlic glaze sweetened with honey. Served over Instant Pot jasmine rice with steamed broccoli. A takeout favorite made low fat and low sodium.",
    "category": "main",
    "cuisine": "asian",
    "tags": ["asian", "dairy free", "high protein", "low sodium"],
    "spiceLevel": 2,
    "rating": 4.9,
    "ratingCount": 2087,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "https://placehold.co/800x600/F4EBDD/5A4632/png?text=Orange-Ginger+Chicken+%26+Broccoli%5Cnon+a+paper+plate&font=poppins",
      "alt": "Orange-ginger chicken and broccoli served on a white paper plate"
    },
    "source": null,
    "nutritionPerServing": {
      "calories": 753, "protein": 63, "carbs": 114, "fat": 5, "fiber": 7, "sodium": 340
    },
    "appliances": ["airFryer", "instantPot", "stovetop", "microwave"],
    "ingredients": [
      { "id": "chicken", "name": "Boneless skinless chicken breast", "group": "Protein", "qtyPerServing": 8, "unit": "oz", "prep": "cut in 1-inch cubes",
        "package": { "size": 32, "unit": "oz", "label": "2 lb family pack" } },
      { "id": "broccoli", "name": "Frozen broccoli florets", "group": "Frozen", "qtyPerServing": 6, "unit": "oz", "prep": "",
        "package": { "size": 16, "unit": "oz", "label": "16 oz bag" } },
      { "id": "oranges", "name": "Navel oranges", "singular": "Navel orange", "group": "Produce", "qtyPerServing": 0.5, "unit": "each", "prep": "zested & juiced",
        "package": { "size": 1, "unit": "each", "label": "orange" } },
      { "id": "jasmine-rice", "name": "Jasmine rice", "group": "Pantry", "qtyPerServing": 0.5, "unit": "cup", "prep": "dry, rinsed", "package": null, "pantry": true },
      { "id": "ginger", "name": "Fresh ginger", "group": "Pantry", "qtyPerServing": 2, "unit": "tsp", "prep": "grated", "package": null, "pantry": true },
      { "id": "garlic", "name": "Garlic cloves", "singular": "Garlic clove", "group": "Pantry", "qtyPerServing": 2, "unit": "each", "prep": "minced", "package": null, "pantry": true },
      { "id": "honey", "name": "Honey", "group": "Pantry", "qtyPerServing": 1, "unit": "tbsp", "prep": "", "package": null, "pantry": true },
      { "id": "coconut-aminos", "name": "Coconut aminos (low-sodium soy alternative)", "group": "Pantry", "qtyPerServing": 2, "unit": "tsp", "prep": "divided", "package": null, "pantry": true },
      { "id": "cornstarch", "name": "Cornstarch", "group": "Pantry", "qtyPerServing": 2, "unit": "tsp", "prep": "divided", "package": null, "pantry": true },
      { "id": "red-pepper", "name": "Crushed red pepper", "group": "Pantry", "qtyPerServing": 0.25, "unit": "tsp", "prep": "", "package": null, "pantry": true }
    ],
    "steps": [
      { "id": "rice-load", "title": "Rinse rice & load Instant Pot", "detail": "Rinse the jasmine rice until the water runs clear. Add it to the Instant Pot Duo Plus with an equal volume of water. Set Pressure Cook, High, 4 minutes.", "durationMin": 4, "durationScaling": 0.3, "active": true, "appliance": "instantPot", "dependsOn": [] },
      { "id": "rice-cook", "title": "Pressure-cook rice", "detail": "About 8 minutes to reach pressure, 4 minutes cooking, then 10 minutes natural release. Fluff with a fork.", "durationMin": 22, "durationScaling": 0.1, "active": false, "appliance": "instantPot", "dependsOn": ["rice-load"] },
      { "id": "cube-chicken", "title": "Cube the chicken", "detail": "Trim and cut into even 1-inch cubes so they crisp at the same rate.", "durationMin": 10, "durationScaling": 0.9, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "aromatics", "title": "Prep the aromatics", "detail": "Grate the ginger, mince the garlic, and zest and juice the oranges.", "durationMin": 6, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "coat", "title": "Coat the chicken", "detail": "Toss the chicken with 1 tsp cornstarch per serving, half the ginger and garlic, the crushed red pepper and 1 tsp coconut aminos per serving.", "durationMin": 4, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": ["cube-chicken", "aromatics"] },
      { "id": "air-fry", "title": "Air-fry chicken in batches", "detail": "Bella Pro Series 8 QT Air Fryer, 400°F, 12 minutes per batch in a single layer. Shake the basket at 6 minutes.", "durationMin": 24, "durationScaling": 0.9, "active": false, "appliance": "airFryer", "dependsOn": ["coat"] },
      { "id": "glaze", "title": "Simmer orange-ginger glaze", "detail": "In a skillet, simmer the orange juice, honey, the rest of the aminos, ginger and garlic. Stir in the rest of the cornstarch mixed with 1 tbsp water and cook until glossy.", "durationMin": 6, "durationScaling": 0.3, "active": true, "appliance": "stovetop", "dependsOn": ["aromatics"] },
      { "id": "veg-prep", "title": "Bag-to-bowl broccoli", "detail": "Tip the frozen broccoli into a large microwave-safe bowl with 2 tbsp water. Cover.", "durationMin": 2, "durationScaling": 0.3, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "veg-steam", "title": "Microwave-steam broccoli", "detail": "Panasonic Microwave, full power, stirring halfway, until bright green and tender-crisp.", "durationMin": 8, "durationScaling": 0.5, "active": false, "appliance": "microwave", "dependsOn": ["veg-prep"] },
      { "id": "toss", "title": "Toss chicken in glaze", "detail": "Add the crispy chicken to the skillet and toss off the heat until coated.", "durationMin": 3, "durationScaling": 0.5, "active": true, "appliance": "stovetop", "dependsOn": ["air-fry", "glaze"] },
      { "id": "portion", "title": "Portion into Bentgos", "detail": "Rice, broccoli and then chicken. Sprinkle with the orange zest. Let cool 10 minutes before lidding.", "durationMin": 8, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["rice-cook", "veg-steam", "toss"] }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Panasonic Microwave, full power, 2–2½ minutes. For extra crisp, reheat the chicken alone in the air fryer at 375°F for 3 minutes."
    },
    "notes": [
      "Coconut aminos has roughly 70% less sodium than regular soy sauce. For no added salt, leave it out and add an extra squeeze of orange.",
      "Don't crowd the air-fryer basket. A single layer is what makes the chicken crisp."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    "id": "harissa-lentil-chickpea-power-bowls",
    "schemaVersion": 2,
    "name": "Smoky Harissa-Spiced Lentil & Chickpea Bowls",
    "tagline": "Sheet-pan chickpeas & peppers, lemony lentils, dill tofu sauce",
    "description": "A plant-powered Mediterranean bowl. Crispy chickpeas and red peppers are roasted with a salt-free harissa-style spice mix, then served over lemony lentils with wilted spinach and a creamy lemon-dill sauce made from lite silken tofu. No blender needed.",
    "category": "main",
    "cuisine": "mediterranean",
    "tags": ["mediterranean", "vegan", "gluten free", "high fiber", "no added salt"],
    "spiceLevel": 2,
    "rating": 4.7,
    "ratingCount": 689,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "https://placehold.co/800x600/F4EBDD/5A4632/png?text=Harissa+Lentil+%26+Chickpea+Bowl%5Cnon+a+paper+plate&font=poppins",
      "alt": "Harissa-spiced lentil and chickpea bowl served on a white paper plate"
    },
    "source": null,
    "nutritionPerServing": {
      "calories": 674, "protein": 45, "carbs": 110, "fat": 6, "fiber": 29, "sodium": 100
    },
    "appliances": ["oven", "stovetop"],
    "ingredients": [
      { "id": "chickpeas", "name": "Chickpeas, no salt added", "group": "Canned", "qtyPerServing": 0.5, "unit": "can", "prep": "drained, rinsed & patted dry",
        "package": { "size": 1, "unit": "can", "label": "15 oz can" } },
      { "id": "silken-tofu", "name": "Lite firm silken tofu", "group": "Protein", "qtyPerServing": 0.25, "unit": "box", "prep": "for the sauce",
        "package": { "size": 1, "unit": "box", "label": "12.3 oz shelf-stable box" } },
      { "id": "spinach", "name": "Baby spinach", "group": "Produce", "qtyPerServing": 1.25, "unit": "oz", "prep": "",
        "package": { "size": 5, "unit": "oz", "label": "5 oz clamshell" } },
      { "id": "bell-peppers", "name": "Red bell peppers", "singular": "Red bell pepper", "group": "Produce", "qtyPerServing": 1, "unit": "each", "prep": "1-inch pieces",
        "package": { "size": 1, "unit": "each", "label": "pepper" } },
      { "id": "lemons", "name": "Lemons", "singular": "Lemon", "group": "Produce", "qtyPerServing": 0.5, "unit": "each", "prep": "zested & juiced",
        "package": { "size": 1, "unit": "each", "label": "lemon" } },
      { "id": "dill", "name": "Fresh dill", "group": "Produce", "qtyPerServing": 0.25, "unit": "bunch", "prep": "chopped",
        "package": { "size": 1, "unit": "bunch", "label": "bunch" } },
      { "id": "lentils", "name": "Dry green or brown lentils", "group": "Pantry", "qtyPerServing": 0.5, "unit": "cup", "prep": "rinsed", "package": null, "pantry": true },
      { "id": "paprika", "name": "Smoked paprika", "group": "Pantry", "qtyPerServing": 1, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "cumin", "name": "Ground cumin", "group": "Pantry", "qtyPerServing": 0.5, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "cayenne", "name": "Cayenne pepper", "group": "Pantry", "qtyPerServing": 0.125, "unit": "tsp", "prep": "", "package": null, "pantry": true }
    ],
    "steps": [
      { "id": "preheat", "title": "Preheat oven to 425°F", "detail": "Put racks in the upper and lower thirds of the oven.", "durationMin": 12, "durationScaling": 0, "active": false, "appliance": "oven", "dependsOn": [] },
      { "id": "lentils-start", "title": "Start the lentils", "detail": "Rinse the lentils and cover by 2 inches with water in a pot. Bring to a boil.", "durationMin": 3, "durationScaling": 0.2, "active": true, "appliance": "stovetop", "dependsOn": [] },
      { "id": "lentils-simmer", "title": "Simmer lentils", "detail": "Simmer uncovered until tender but not mushy, 20–25 minutes.", "durationMin": 22, "durationScaling": 0.1, "active": false, "appliance": "stovetop", "dependsOn": ["lentils-start"] },
      { "id": "chop", "title": "Cut the peppers", "detail": "Seed the red bell peppers and cut into 1-inch pieces.", "durationMin": 8, "durationScaling": 0.9, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "season-pans", "title": "Season the sheet pans", "detail": "Mix the paprika, cumin and cayenne. Toss with the chickpeas, peppers and a squeeze of lemon, then spread on 2 parchment-lined pans. No oil needed.", "durationMin": 5, "durationScaling": 0.6, "active": true, "appliance": null, "dependsOn": ["chop"] },
      { "id": "roast", "title": "Roast chickpeas & peppers", "detail": "Roast 25 minutes, swapping the pans between racks halfway through, until the chickpeas are crisp and the peppers are charred at the edges.", "durationMin": 25, "durationScaling": 0.2, "active": false, "appliance": "oven", "dependsOn": ["preheat", "season-pans"] },
      { "id": "sauce", "title": "Whisk lemon-dill tofu sauce", "detail": "Mash the silken tofu with a fork, then whisk vigorously with most of the lemon juice and half the dill until smooth.", "durationMin": 6, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "lentils-finish", "title": "Finish the lentils", "detail": "Drain, return to the pot and fold in the spinach until it wilts. Add the lemon zest and the rest of the dill.", "durationMin": 3, "durationScaling": 0.4, "active": true, "appliance": "stovetop", "dependsOn": ["lentils-simmer"] },
      { "id": "portion", "title": "Portion into Bentgos", "detail": "Lentils as the base, then roasted chickpeas and peppers. Put the sauce in a small cup or drizzle it on just before eating.", "durationMin": 8, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["roast", "sauce", "lentils-finish"] }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 3,
      "reheat": "Panasonic Microwave, full power, 2 minutes. Keep the tofu sauce cold and add it after reheating."
    },
    "notes": [
      "Lite silken tofu gives the sauce a creamy texture with about 1 g of fat per serving.",
      "Dry the chickpeas well so they roast crisp instead of steaming."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    "id": "turkey-veggie-egg-white-bites",
    "schemaVersion": 2,
    "name": "Turkey & Veggie Egg White Bites",
    "tagline": "Grab-and-go protein muffins, 2 per serving",
    "description": "Fluffy baked egg-white muffins packed with extra-lean ground turkey, red pepper, spinach and green onion, seasoned with smoked paprika instead of salt. Two bites make a 150-calorie snack with 28 g of protein, good cold or warmed.",
    "category": "snack",
    "cuisine": "american",
    "tags": ["gluten free", "dairy free", "high protein", "low carb", "no added salt"],
    "spiceLevel": 0,
    "rating": 4.6,
    "ratingCount": 512,
    "baseServings": 8,
    "maxServings": 16,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "https://placehold.co/800x600/F4EBDD/5A4632/png?text=Turkey+%26+Veggie+Egg+White+Bites%5Cnon+a+paper+plate&font=poppins",
      "alt": "Two turkey and veggie egg white bites on a white paper plate"
    },
    "source": null,
    "nutritionPerServing": {
      "calories": 150, "protein": 28, "carbs": 5, "fat": 2, "fiber": 1, "sodium": 240
    },
    "appliances": ["oven", "stovetop"],
    "ingredients": [
      { "id": "egg-whites", "name": "Liquid egg whites", "group": "Protein", "qtyPerServing": 4, "unit": "fl oz", "prep": "",
        "package": { "size": 32, "unit": "fl oz", "label": "32 fl oz carton" } },
      { "id": "turkey", "name": "99% lean ground turkey", "group": "Protein", "qtyPerServing": 2, "unit": "oz", "prep": "",
        "package": { "size": 16, "unit": "oz", "label": "1 lb pack" } },
      { "id": "spinach", "name": "Baby spinach", "group": "Produce", "qtyPerServing": 0.625, "unit": "oz", "prep": "chopped",
        "package": { "size": 5, "unit": "oz", "label": "5 oz clamshell" } },
      { "id": "bell-peppers", "name": "Red bell peppers", "singular": "Red bell pepper", "group": "Produce", "qtyPerServing": 0.25, "unit": "each", "prep": "finely diced",
        "package": { "size": 1, "unit": "each", "label": "pepper" } },
      { "id": "green-onions", "name": "Green onions", "group": "Produce", "qtyPerServing": 0.125, "unit": "bunch", "prep": "thinly sliced",
        "package": { "size": 1, "unit": "bunch", "label": "bunch" } },
      { "id": "paprika", "name": "Smoked paprika", "group": "Pantry", "qtyPerServing": 0.25, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "garlic-powder", "name": "Garlic powder (salt-free)", "group": "Pantry", "qtyPerServing": 0.25, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "black-pepper", "name": "Black pepper", "group": "Pantry", "qtyPerServing": 0.125, "unit": "tsp", "prep": "", "package": null, "pantry": true }
    ],
    "steps": [
      { "id": "preheat", "title": "Preheat oven to 350°F", "detail": "Set 2 silicone muffin cups per serving on a sheet pan. They release cleanly with no oil or spray.", "durationMin": 10, "durationScaling": 0, "active": false, "appliance": "oven", "dependsOn": [] },
      { "id": "brown-turkey", "title": "Brown the turkey", "detail": "In a nonstick skillet, brown the turkey with the garlic powder and paprika, breaking it into small crumbles. Let cool slightly.", "durationMin": 8, "durationScaling": 0.5, "active": true, "appliance": "stovetop", "dependsOn": [] },
      { "id": "chop", "title": "Chop the veggies", "detail": "Finely dice the red pepper, chop the spinach and slice the green onions.", "durationMin": 8, "durationScaling": 0.8, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "fill", "title": "Fill the muffin cups", "detail": "Divide the turkey and veggies between the cups (2 per serving). Pour the egg whites over them to ¾ full and add black pepper.", "durationMin": 5, "durationScaling": 0.8, "active": true, "appliance": null, "dependsOn": ["brown-turkey", "chop"] },
      { "id": "bake", "title": "Bake until set", "detail": "Bake 20–22 minutes, until puffed and the centers are set.", "durationMin": 22, "durationScaling": 0, "active": false, "appliance": "oven", "dependsOn": ["preheat", "fill"] },
      { "id": "cool", "title": "Cool on the pan", "detail": "Let cool 10 minutes. They'll deflate a little, which is normal.", "durationMin": 10, "durationScaling": 0, "active": false, "appliance": null, "dependsOn": ["bake"] },
      { "id": "pack", "title": "Pack into Bentgos", "detail": "Pop each bite out of its silicone cup and pack 2 per Bentgo.", "durationMin": 4, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["cool"] }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 2,
      "reheat": "Eat cold, or use the Panasonic Microwave at 50% power for 45–60 seconds."
    },
    "notes": [
      "Liquid egg whites have natural sodium (~190 mg per serving), which is why these come in at 240 mg without any added salt.",
      "No silicone cups? Use a nonstick muffin tin and let the bites cool fully before loosening them."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    "id": "mexican-hot-chocolate-protein-creami",
    "schemaVersion": 2,
    "name": "Mexican Hot Chocolate Protein Creami",
    "tagline": "Cinnamon-cocoa protein ice cream with a gentle cayenne kick",
    "description": "Thick, scoopable chocolate 'ice cream' from the Ninja Creami Deluxe with 40 g of protein per serving. Fat-free ultra-filtered milk, Greek yogurt and banana make a creamy base, and cinnamon with a pinch of cayenne gives it a Mexican hot chocolate flavor. Prep on Sunday, then spin a pint and share it whenever you want dessert.",
    "category": "dessert",
    "cuisine": "mexican",
    "tags": ["dessert", "mexican", "gluten free", "vegetarian", "high protein"],
    "spiceLevel": 1,
    "rating": 4.9,
    "ratingCount": 3150,
    "baseServings": 8,
    "maxServings": 16,
    "container": "Ninja Creami Deluxe 24 oz pint (2 servings)",
    "containerPlural": "Creami pints",
    "servingsPerContainer": 2,
    "image": {
      "url": "https://placehold.co/800x600/F4EBDD/5A4632/png?text=Mexican+Hot+Chocolate+Protein+Creami%5Cnon+a+paper+plate&font=poppins",
      "alt": "Mexican hot chocolate protein ice cream scooped onto a white paper plate"
    },
    "source": null,
    "nutritionPerServing": {
      "calories": 347, "protein": 40, "carbs": 40, "fat": 3, "fiber": 5, "sodium": 195
    },
    "appliances": ["creami"],
    "ingredients": [
      { "id": "uf-milk", "name": "Fat-free ultra-filtered milk (e.g. Fairlife)", "group": "Dairy", "qtyPerServing": 6.5, "unit": "fl oz", "prep": "cold",
        "package": { "size": 52, "unit": "fl oz", "label": "52 fl oz bottle" } },
      { "id": "yogurt", "name": "Nonfat plain Greek yogurt", "group": "Dairy", "qtyPerServing": 4, "unit": "oz", "prep": "",
        "package": { "size": 32, "unit": "oz", "label": "32 oz tub" } },
      { "id": "bananas", "name": "Ripe bananas", "singular": "Ripe banana", "group": "Produce", "qtyPerServing": 0.5, "unit": "each", "prep": "well mashed",
        "package": { "size": 1, "unit": "each", "label": "banana" } },
      { "id": "whey", "name": "Chocolate whey protein powder", "group": "Pantry", "qtyPerServing": 0.5, "unit": "scoop", "prep": "about 15 g", "package": null, "pantry": true },
      { "id": "peanut-powder", "name": "Powdered peanut butter (no salt added)", "group": "Pantry", "qtyPerServing": 1.5, "unit": "tbsp", "prep": "", "package": null, "pantry": true },
      { "id": "cocoa", "name": "Unsweetened cocoa powder", "group": "Pantry", "qtyPerServing": 1, "unit": "tbsp", "prep": "", "package": null, "pantry": true },
      { "id": "honey", "name": "Honey", "group": "Pantry", "qtyPerServing": 1.5, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "vanilla", "name": "Pure vanilla extract", "group": "Pantry", "qtyPerServing": 0.5, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "cinnamon", "name": "Ground cinnamon", "group": "Pantry", "qtyPerServing": 0.25, "unit": "tsp", "prep": "", "package": null, "pantry": true },
      { "id": "cayenne", "name": "Cayenne pepper", "group": "Pantry", "qtyPerServing": 0.03125, "unit": "tsp", "prep": "a pinch", "package": null, "pantry": true }
    ],
    "steps": [
      { "id": "mash", "title": "Mash the bananas", "detail": "In a large bowl, mash the bananas until almost liquid.", "durationMin": 4, "durationScaling": 0.8, "active": true, "appliance": null, "dependsOn": [] },
      { "id": "whisk", "title": "Whisk the base", "detail": "Whisk the yogurt, protein powder, peanut powder, cocoa, honey, vanilla, cinnamon and cayenne into a thick paste. Then slowly whisk in the milk. A few specks are fine because the Creami smooths them out.", "durationMin": 8, "durationScaling": 0.5, "active": true, "appliance": null, "dependsOn": ["mash"] },
      { "id": "fill", "title": "Fill & level the pints", "detail": "Divide the base between the Ninja Creami Deluxe pints (2 servings each), filling only to the MAX FILL line. Lid them and set them on a level shelf.", "durationMin": 4, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["whisk"] },
      { "id": "freeze", "title": "Freeze solid (24 hr)", "detail": "Freeze flat for a full 24 hours. A partly frozen center will spin icy.", "durationMin": 1440, "durationScaling": 0, "active": false, "appliance": "freezer", "dependsOn": ["fill"] },
      { "id": "spin", "title": "Spin each pint", "detail": "Ninja Creami Deluxe, LITE ICE CREAM program, about 3 minutes per pint. If it's crumbly, add 1 tbsp milk and press RE-SPIN.", "durationMin": 12, "durationScaling": 1, "active": true, "appliance": "creami", "dependsOn": ["freeze"] },
      { "id": "finish", "title": "Serve or re-freeze", "detail": "Split a pint between two bowls, or smooth the tops, lid and re-freeze. Re-frozen pints need a quick RE-SPIN before eating.", "durationMin": 3, "durationScaling": 1, "active": true, "appliance": null, "dependsOn": ["spin"] }
    ],
    "storage": {
      "fridgeDays": 0,
      "freezerMonths": 1,
      "reheat": "No reheating. Spin straight from the freezer. Let a re-frozen pint sit 5 minutes, then RE-SPIN."
    },
    "notes": [
      "Each Deluxe pint holds 2 servings, so a pint is dessert for two.",
      "The Ninja Creami is used only for desserts, per PrepDash appliance rules."
    ]
  }
]
});
