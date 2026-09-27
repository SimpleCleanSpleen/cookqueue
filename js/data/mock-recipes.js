/**
 * CookQueue — mock recipe data.
 *
 * This array is intentionally pure JSON (no functions, no computed values)
 * so it can be replaced 1:1 by the output of a recipe generator / API.
 * See README.md → "Recipe Schema" for field-by-field documentation.
 *
 * Recipes are grouped into "batches". Each batch file pushes one object onto
 * CookQueue.RECIPE_BATCHES, so AI-generated batches can be added as new files
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
window.CookQueue = window.CookQueue || {};

CookQueue.RECIPE_BATCHES = CookQueue.RECIPE_BATCHES || [];
CookQueue.RECIPE_BATCHES.push({
  name: 'Starter menu (hand-written mocks)',
  recipes: [
{
  "id": "orange-ginger-air-fryer-chicken-broccoli",
  "schemaVersion": 2,
  "name": "Orange-Ginger Air Fryer Chicken & Broccoli",
  "tagline": "Crispy glazed chicken, jasmine rice & steamed broccoli",
  "description": "Cornstarch-dusted chicken air-fried until crisp without deep-frying, then tossed in a bright orange, ginger and garlic glaze sweetened with honey. Served over Instant Pot jasmine rice with steamed broccoli. A takeout favorite made low fat and low sodium.",
  "category": "main",
  "cuisine": "asian",
  "tags": [
    "asian",
    "dairy free",
    "high protein",
    "low sodium"
  ],
  "spiceLevel": 2,
  "rating": 4.9,
  "ratingCount": 2087,
  "baseServings": 4,
  "maxServings": 12,
  "container": "Bentgo 1-compartment (black)",
  "containerPlural": "Bentgo boxes",
  "servingsPerContainer": 1,
  "image": {
    "url": "images/orange-ginger-chicken-broccoli.webp",
    "alt": "Orange-ginger chicken and broccoli served on a white paper plate"
  },
  "source": null,
  "nutritionPerServing": {
    "calories": 753,
    "protein": 63,
    "carbs": 114,
    "fat": 5,
    "fiber": 7,
    "sodium": 340
  },
  "appliances": [
    "airFryer",
    "instantPot",
    "stovetop",
    "microwave"
  ],
  "ingredients": [
    {
      "id": "chicken",
      "name": "Boneless skinless chicken breast",
      "group": "Protein",
      "qtyPerServing": 8,
      "unit": "oz",
      "prep": "cut in 1-inch cubes",
      "package": {
        "size": 32,
        "unit": "oz",
        "label": "2 lb family pack"
      }
    },
    {
      "id": "broccoli",
      "name": "Frozen broccoli florets",
      "group": "Frozen",
      "qtyPerServing": 6,
      "unit": "oz",
      "prep": "",
      "package": {
        "size": 16,
        "unit": "oz",
        "label": "16 oz bag"
      }
    },
    {
      "id": "oranges",
      "name": "Navel oranges",
      "singular": "Navel orange",
      "group": "Produce",
      "qtyPerServing": 0.5,
      "unit": "each",
      "prep": "zested & juiced",
      "package": {
        "size": 1,
        "unit": "each",
        "label": "orange"
      }
    },
    {
      "id": "jasmine-rice",
      "name": "Jasmine rice",
      "group": "Pantry",
      "qtyPerServing": 0.5,
      "unit": "cup",
      "prep": "dry, rinsed",
      "package": null,
      "pantry": true
    },
    {
      "id": "ginger",
      "name": "Fresh ginger",
      "group": "Pantry",
      "qtyPerServing": 2,
      "unit": "tsp",
      "prep": "grated",
      "package": null,
      "pantry": true
    },
    {
      "id": "garlic",
      "name": "Garlic cloves",
      "singular": "Garlic clove",
      "group": "Pantry",
      "qtyPerServing": 2,
      "unit": "each",
      "prep": "minced",
      "package": null,
      "pantry": true
    },
    {
      "id": "honey",
      "name": "Honey",
      "group": "Pantry",
      "qtyPerServing": 1,
      "unit": "tbsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "coconut-aminos",
      "name": "Coconut aminos (low-sodium soy alternative)",
      "group": "Pantry",
      "qtyPerServing": 2,
      "unit": "tsp",
      "prep": "divided",
      "package": null,
      "pantry": true
    },
    {
      "id": "cornstarch",
      "name": "Cornstarch",
      "group": "Pantry",
      "qtyPerServing": 2,
      "unit": "tsp",
      "prep": "divided",
      "package": null,
      "pantry": true
    },
    {
      "id": "red-pepper",
      "name": "Crushed red pepper",
      "group": "Pantry",
      "qtyPerServing": 0.25,
      "unit": "tsp",
      "prep": "",
      "package": null,
      "pantry": true
    }
  ],
  "steps": [
    {
      "id": "rice-load",
      "title": "Rinse rice & load Instant Pot",
      "detail": "Rinse the jasmine rice until the water runs clear. Add it to the Instant Pot Duo Plus with an equal volume of water. Set Pressure Cook, High, 4 minutes.",
      "durationMin": 4,
      "durationScaling": 0.3,
      "active": true,
      "appliance": "instantPot",
      "dependsOn": []
    },
    {
      "id": "rice-cook",
      "title": "Pressure-cook rice",
      "detail": "About 8 minutes to reach pressure, 4 minutes cooking, then 10 minutes natural release. Fluff with a fork.",
      "durationMin": 22,
      "durationScaling": 0.1,
      "active": false,
      "appliance": "instantPot",
      "dependsOn": [
        "rice-load"
      ]
    },
    {
      "id": "cube-chicken",
      "title": "Cube the chicken",
      "detail": "Trim and cut into even 1-inch cubes so they crisp at the same rate.",
      "durationMin": 10,
      "durationScaling": 0.9,
      "active": true,
      "appliance": null,
      "dependsOn": []
    },
    {
      "id": "aromatics",
      "title": "Prep the aromatics",
      "detail": "Grate the ginger, mince the garlic, and zest and juice the oranges.",
      "durationMin": 6,
      "durationScaling": 0.5,
      "active": true,
      "appliance": null,
      "dependsOn": []
    },
    {
      "id": "coat",
      "title": "Coat the chicken",
      "detail": "Toss the chicken with 1 tsp cornstarch per serving, half the ginger and garlic, the crushed red pepper and 1 tsp coconut aminos per serving.",
      "durationMin": 4,
      "durationScaling": 0.5,
      "active": true,
      "appliance": null,
      "dependsOn": [
        "cube-chicken",
        "aromatics"
      ]
    },
    {
      "id": "air-fry",
      "title": "Air-fry chicken in batches",
      "detail": "Bella Pro Series 8 QT Air Fryer, 400°F, 12 minutes per batch in a single layer. Shake the basket at 6 minutes.",
      "durationMin": 24,
      "durationScaling": 0.9,
      "active": false,
      "appliance": "airFryer",
      "dependsOn": [
        "coat"
      ]
    },
    {
      "id": "glaze",
      "title": "Simmer orange-ginger glaze",
      "detail": "In a skillet, simmer the orange juice, honey, the rest of the aminos, ginger and garlic. Stir in the rest of the cornstarch mixed with 1 tbsp water and cook until glossy.",
      "durationMin": 6,
      "durationScaling": 0.3,
      "active": true,
      "appliance": "stovetop",
      "dependsOn": [
        "aromatics"
      ]
    },
    {
      "id": "veg-prep",
      "title": "Bag-to-bowl broccoli",
      "detail": "Tip the frozen broccoli into a large microwave-safe bowl with 2 tbsp water. Cover.",
      "durationMin": 2,
      "durationScaling": 0.3,
      "active": true,
      "appliance": null,
      "dependsOn": []
    },
    {
      "id": "veg-steam",
      "title": "Microwave-steam broccoli",
      "detail": "Panasonic Microwave, full power, stirring halfway, until bright green and tender-crisp.",
      "durationMin": 8,
      "durationScaling": 0.5,
      "active": false,
      "appliance": "microwave",
      "dependsOn": [
        "veg-prep"
      ]
    },
    {
      "id": "toss",
      "title": "Toss chicken in glaze",
      "detail": "Add the crispy chicken to the skillet and toss off the heat until coated.",
      "durationMin": 3,
      "durationScaling": 0.5,
      "active": true,
      "appliance": "stovetop",
      "dependsOn": [
        "air-fry",
        "glaze"
      ]
    },
    {
      "id": "portion",
      "title": "Portion into Bentgos",
      "detail": "Rice, broccoli and then chicken. Sprinkle with the orange zest. Let cool 10 minutes before lidding.",
      "durationMin": 8,
      "durationScaling": 1,
      "active": true,
      "appliance": null,
      "dependsOn": [
        "rice-cook",
        "veg-steam",
        "toss"
      ]
    }
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
{
  "id": "mexican-hot-chocolate-protein-creami",
  "schemaVersion": 2,
  "name": "Mexican Hot Chocolate Protein Creami",
  "tagline": "Cinnamon-cocoa protein ice cream with a gentle cayenne kick",
  "description": "Thick, scoopable chocolate 'ice cream' from the Ninja Creami Deluxe with 40 g of protein per serving. Fat-free ultra-filtered milk, Greek yogurt and banana make a creamy base, and cinnamon with a pinch of cayenne gives it a Mexican hot chocolate flavor. Prep on Sunday, then spin a pint and share it whenever you want dessert.",
  "category": "dessert",
  "cuisine": "mexican",
  "tags": [
    "dessert",
    "mexican",
    "gluten free",
    "vegetarian",
    "high protein"
  ],
  "spiceLevel": 1,
  "rating": 4.9,
  "ratingCount": 3150,
  "baseServings": 8,
  "maxServings": 16,
  "container": "Ninja Creami Deluxe 24 oz pint (2 servings)",
  "containerPlural": "Creami pints",
  "servingsPerContainer": 2,
  "image": {
    "url": "images/mexican-hot-chocolate-protein-creami.webp",
    "alt": "Mexican hot chocolate protein ice cream scooped onto a white paper plate"
  },
  "source": null,
  "nutritionPerServing": {
    "calories": 347,
    "protein": 40,
    "carbs": 40,
    "fat": 3,
    "fiber": 5,
    "sodium": 195
  },
  "appliances": [
    "creami"
  ],
  "ingredients": [
    {
      "id": "uf-milk",
      "name": "Fat-free ultra-filtered milk (e.g. Fairlife)",
      "group": "Dairy",
      "qtyPerServing": 6.5,
      "unit": "fl oz",
      "prep": "cold",
      "package": {
        "size": 52,
        "unit": "fl oz",
        "label": "52 fl oz bottle"
      }
    },
    {
      "id": "yogurt",
      "name": "Nonfat plain Greek yogurt",
      "group": "Dairy",
      "qtyPerServing": 4,
      "unit": "oz",
      "prep": "",
      "package": {
        "size": 32,
        "unit": "oz",
        "label": "32 oz tub"
      }
    },
    {
      "id": "bananas",
      "name": "Ripe bananas",
      "singular": "Ripe banana",
      "group": "Produce",
      "qtyPerServing": 0.5,
      "unit": "each",
      "prep": "well mashed",
      "package": {
        "size": 1,
        "unit": "each",
        "label": "banana"
      }
    },
    {
      "id": "whey",
      "name": "Chocolate whey protein powder",
      "group": "Pantry",
      "qtyPerServing": 0.5,
      "unit": "scoop",
      "prep": "about 15 g",
      "package": null,
      "pantry": true
    },
    {
      "id": "peanut-powder",
      "name": "Powdered peanut butter (no salt added)",
      "group": "Pantry",
      "qtyPerServing": 1.5,
      "unit": "tbsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "cocoa",
      "name": "Unsweetened cocoa powder",
      "group": "Pantry",
      "qtyPerServing": 1,
      "unit": "tbsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "honey",
      "name": "Honey",
      "group": "Pantry",
      "qtyPerServing": 1.5,
      "unit": "tsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "vanilla",
      "name": "Pure vanilla extract",
      "group": "Pantry",
      "qtyPerServing": 0.5,
      "unit": "tsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "cinnamon",
      "name": "Ground cinnamon",
      "group": "Pantry",
      "qtyPerServing": 0.25,
      "unit": "tsp",
      "prep": "",
      "package": null,
      "pantry": true
    },
    {
      "id": "cayenne",
      "name": "Cayenne pepper",
      "group": "Pantry",
      "qtyPerServing": 0.03125,
      "unit": "tsp",
      "prep": "a pinch",
      "package": null,
      "pantry": true
    }
  ],
  "steps": [
    {
      "id": "mash",
      "title": "Mash the bananas",
      "detail": "In a large bowl, mash the bananas until almost liquid.",
      "durationMin": 4,
      "durationScaling": 0.8,
      "active": true,
      "appliance": null,
      "dependsOn": []
    },
    {
      "id": "whisk",
      "title": "Whisk the base",
      "detail": "Whisk the yogurt, protein powder, peanut powder, cocoa, honey, vanilla, cinnamon and cayenne into a thick paste. Then slowly whisk in the milk. A few specks are fine because the Creami smooths them out.",
      "durationMin": 8,
      "durationScaling": 0.5,
      "active": true,
      "appliance": null,
      "dependsOn": [
        "mash"
      ]
    },
    {
      "id": "fill",
      "title": "Fill & level the pints",
      "detail": "Divide the base between the Ninja Creami Deluxe pints (2 servings each), filling only to the MAX FILL line. Lid them and set them on a level shelf.",
      "durationMin": 4,
      "durationScaling": 1,
      "active": true,
      "appliance": null,
      "dependsOn": [
        "whisk"
      ]
    },
    {
      "id": "freeze",
      "title": "Freeze solid (24 hr)",
      "detail": "Freeze flat for a full 24 hours. A partly frozen center will spin icy.",
      "durationMin": 1440,
      "durationScaling": 0,
      "active": false,
      "appliance": "freezer",
      "dependsOn": [
        "fill"
      ]
    },
    {
      "id": "spin",
      "title": "Spin each pint",
      "detail": "Ninja Creami Deluxe, LITE ICE CREAM program, about 3 minutes per pint. If it's crumbly, add 1 tbsp milk and press RE-SPIN.",
      "durationMin": 12,
      "durationScaling": 1,
      "active": true,
      "appliance": "creami",
      "dependsOn": [
        "freeze"
      ]
    },
    {
      "id": "finish",
      "title": "Serve or re-freeze",
      "detail": "Split a pint between two bowls, or smooth the tops, lid and re-freeze. Re-frozen pints need a quick RE-SPIN before eating.",
      "durationMin": 3,
      "durationScaling": 1,
      "active": true,
      "appliance": null,
      "dependsOn": [
        "spin"
      ]
    }
  ],
  "storage": {
    "fridgeDays": 0,
    "freezerMonths": 1,
    "reheat": "No reheating. Spin straight from the freezer. Let a re-frozen pint sit 5 minutes, then RE-SPIN."
  },
  "notes": [
    "Each Deluxe pint holds 2 servings, so a pint is dessert for two.",
    "The Ninja Creami is used only for desserts, per CookQueue appliance rules."
  ]
}
]
});
