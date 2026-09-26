/**
 * CookQueue — Batch 01 (Gemini).
 *
 * 25 recipes from Gemini: 15 mains, 5 snacks, 5 desserts, spanning American,
 * Mexican, Indian, Chinese, Cajun, Greek, Italian, Korean, Mediterranean,
 * Thai, Caribbean and Middle Eastern cuisines, with 7 vegan recipes.
 * See docs/gemini-recipe-prompt.md for the prompt that produced this batch.
 */
window.CookQueue = window.CookQueue || {};
CookQueue.RECIPE_BATCHES = CookQueue.RECIPE_BATCHES || [];

CookQueue.RECIPE_BATCHES.push({
  name: 'Batch 01 (Gemini)',
  recipes: [
  {
    "id": "buffalo-chicken-mac-and-cheese",
    "schemaVersion": 2,
    "name": "High-Protein Buffalo Chicken Mac",
    "tagline": "Creamy, spicy comfort food loaded with protein.",
    "description": "This adapted buffalo mac uses cottage cheese and chickpea pasta for massive protein gains. It entirely skips butter and cream while maintaining a rich texture.",
    "category": "main",
    "cuisine": "american",
    "tags": [
      "american",
      "high protein",
      "high fiber"
    ],
    "spiceLevel": 3,
    "rating": 4.8,
    "ratingCount": 1250,
    "baseServings": 8,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/buffalo-chicken-mac-and-cheese.webp",
      "alt": "Buffalo chicken mac and cheese served on a white paper plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Mason Fit",
      "url": "https://masonfit.com/buffalo-chicken-mac-and-cheese/",
      "author": "Mason Woodruff"
    },
    "nutritionPerServing": {
      "calories": 602,
      "protein": 58,
      "carbs": 52,
      "fat": 18,
      "fiber": 9,
      "sodium": 540
    },
    "appliances": [
      "stovetop",
      "oven"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken breast",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "diced",
        "package": {
          "size": 48,
          "unit": "oz",
          "label": "3 lb pack"
        }
      },
      {
        "id": "pasta",
        "name": "Chickpea elbow pasta",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "cottage-cheese",
        "name": "Low-fat 2% cottage cheese",
        "group": "Dairy",
        "qtyPerServing": 3,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "24 oz tub"
        }
      },
      {
        "id": "cheddar",
        "name": "Shredded reduced-fat cheddar",
        "group": "Dairy",
        "qtyPerServing": 1,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 8,
          "unit": "oz",
          "label": "8 oz bag"
        }
      },
      {
        "id": "buffalo-sauce",
        "name": "Buffalo sauce (low sodium)",
        "group": "Pantry",
        "qtyPerServing": 1.5,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "garlic-powder",
        "name": "Garlic powder",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "boil",
        "title": "Cook pasta",
        "detail": "Boil pasta on stovetop until al dente.",
        "durationMin": 10,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "chicken",
        "title": "Cook chicken",
        "detail": "Saut\u00e9 diced chicken in a hot skillet until browned.",
        "durationMin": 10,
        "durationScaling": 0.5,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Make sauce",
        "detail": "Stir cottage cheese, cheddar, and buffalo sauce over low heat until melted.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "chicken"
        ]
      },
      {
        "id": "bake",
        "title": "Bake",
        "detail": "Combine pasta and sauce, then bake to crisp the edges.",
        "durationMin": 15,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": [
          "boil",
          "sauce"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide into containers.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "bake"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes, stirring halfway."
    },
    "notes": [
      "Stir vigorously to melt the cottage cheese curds smoothly."
    ]
  },
  {
    "id": "turkey-chorizo-taco-skillet",
    "schemaVersion": 2,
    "name": "Turkey Chorizo Taco Skillet",
    "tagline": "A high-protein, zero-waste Mexican staple.",
    "description": "Ground turkey and spicy chorizo combine with black beans for a macro-friendly skillet. Ready in minutes and packed with flavor.",
    "category": "main",
    "cuisine": "mexican",
    "tags": [
      "mexican",
      "high protein",
      "high fiber",
      "gluten free"
    ],
    "spiceLevel": 2,
    "rating": 4.7,
    "ratingCount": 890,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/turkey-chorizo-taco-skillet.webp",
      "alt": "Turkey chorizo taco skillet on a white paper plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Fit Men Cook",
      "url": "https://fitmencook.com/recipes/mexican-taco-skillet/",
      "author": "Kevin Curry"
    },
    "nutritionPerServing": {
      "calories": 622,
      "protein": 50,
      "carbs": 65,
      "fat": 18,
      "fiber": 12,
      "sodium": 550
    },
    "appliances": [
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "turkey",
        "name": "Lean ground turkey 93/7",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "raw",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "chorizo",
        "name": "Turkey chorizo",
        "group": "Protein",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "casing removed",
        "package": {
          "size": 8,
          "unit": "oz",
          "label": "8 oz pack"
        }
      },
      {
        "id": "beans",
        "name": "No-salt-added black beans",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "tomatoes",
        "name": "No-salt-added diced tomatoes",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "undrained",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "14.5 oz can"
        }
      },
      {
        "id": "cheese",
        "name": "Reduced-fat Mexican blend cheese",
        "group": "Dairy",
        "qtyPerServing": 1,
        "unit": "oz",
        "prep": "shredded",
        "package": {
          "size": 4,
          "unit": "oz",
          "label": "4 oz bag"
        }
      },
      {
        "id": "rice",
        "name": "Brown rice",
        "group": "Pantry",
        "qtyPerServing": 0.4,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "seasoning",
        "name": "Salt-free taco seasoning",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "cook-rice",
        "title": "Cook rice",
        "detail": "Simmer brown rice on the stovetop until tender.",
        "durationMin": 30,
        "durationScaling": 0.1,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "brown-meat",
        "title": "Brown meat",
        "detail": "Saut\u00e9 ground turkey and chorizo until fully cooked.",
        "durationMin": 10,
        "durationScaling": 0.5,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "simmer",
        "title": "Simmer skillet",
        "detail": "Stir in beans, tomatoes, and seasoning. Simmer to thicken.",
        "durationMin": 10,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "brown-meat"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve skillet mixture over rice and top with cheese.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "cook-rice",
          "simmer"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 3,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Adding a squeeze of fresh lime boosts flavor without salt."
    ]
  },
  {
    "id": "lightened-up-butter-chicken",
    "schemaVersion": 2,
    "name": "Healthy Butter Chicken",
    "tagline": "Rich Indian flavors without the heavy cream.",
    "description": "This adapted classic uses yogurt and light coconut milk to create a velvety sauce. It keeps fats low and protein high.",
    "category": "main",
    "cuisine": "indian",
    "tags": [
      "indian",
      "high protein",
      "gluten free"
    ],
    "spiceLevel": 1,
    "rating": 4.9,
    "ratingCount": 2100,
    "baseServings": 6,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/lightened-up-butter-chicken.webp",
      "alt": "Healthy butter chicken over rice on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.skinnytaste.com/lightened-up-butter-chicken/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 623,
      "protein": 55,
      "carbs": 58,
      "fat": 19,
      "fiber": 4,
      "sodium": 520
    },
    "appliances": [
      "stovetop",
      "instantPot"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken breast",
        "group": "Protein",
        "qtyPerServing": 8,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 48,
          "unit": "oz",
          "label": "3 lb pack"
        }
      },
      {
        "id": "yogurt",
        "name": "Non-fat plain Greek yogurt",
        "group": "Dairy",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz tub"
        }
      },
      {
        "id": "tomato",
        "name": "No-salt-added tomato puree",
        "group": "Canned",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "24 oz jar"
        }
      },
      {
        "id": "coconut",
        "name": "Light coconut milk",
        "group": "Canned",
        "qtyPerServing": 2.25,
        "unit": "fl oz",
        "prep": "shaken",
        "package": {
          "size": 13.5,
          "unit": "fl oz",
          "label": "13.5 oz can"
        }
      },
      {
        "id": "rice",
        "name": "Basmati rice",
        "group": "Pantry",
        "qtyPerServing": 0.4,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "masala",
        "name": "Garam masala (salt-free)",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "cook-rice",
        "title": "Cook rice",
        "detail": "Pressure cook rice in the Instant Pot.",
        "durationMin": 15,
        "durationScaling": 0,
        "active": false,
        "appliance": "instantPot",
        "dependsOn": []
      },
      {
        "id": "sear",
        "title": "Sear chicken",
        "detail": "Brown the cubed chicken on the stovetop.",
        "durationMin": 8,
        "durationScaling": 0.5,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Make sauce",
        "detail": "Whisk in tomato puree, coconut milk, yogurt, and spices.",
        "durationMin": 10,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "sear"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve the butter chicken over the basmati rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "cook-rice",
          "sauce"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2.5 minutes."
    },
    "notes": [
      "Temper the yogurt with warm sauce before adding to prevent curdling."
    ]
  },
  {
    "id": "air-fryer-general-tsos-chicken",
    "schemaVersion": 2,
    "name": "Air Fryer General Tso's",
    "tagline": "Crispy, sweet, and spicy takeout made healthy.",
    "description": "Air frying the chicken keeps the fat low while maintaining a deep-fried crunch. The sauce relies on coconut aminos and pineapple juice.",
    "category": "main",
    "cuisine": "chinese",
    "tags": [
      "chinese",
      "high protein",
      "dairy free"
    ],
    "spiceLevel": 3,
    "rating": 4.6,
    "ratingCount": 650,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/air-fryer-general-tsos-chicken.webp",
      "alt": "General Tso's chicken with broccoli on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Fit Men Cook",
      "url": "https://fitmencook.com/recipes/air-fryer-general-tsos-chicken/",
      "author": "Kevin Curry"
    },
    "nutritionPerServing": {
      "calories": 616,
      "protein": 56,
      "carbs": 62,
      "fat": 16,
      "fiber": 5,
      "sodium": 550
    },
    "appliances": [
      "airFryer",
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken breast",
        "group": "Protein",
        "qtyPerServing": 8,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 32,
          "unit": "oz",
          "label": "2 lb pack"
        }
      },
      {
        "id": "broccoli",
        "name": "Frozen broccoli florets",
        "group": "Frozen",
        "qtyPerServing": 3,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz bag"
        }
      },
      {
        "id": "aminos",
        "name": "Coconut aminos",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "cornstarch",
        "name": "Cornstarch",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "juice",
        "name": "Unsweetened pineapple juice",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
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
        "id": "rice",
        "name": "White rice",
        "group": "Pantry",
        "qtyPerServing": 0.4,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Boil rice on the stovetop until fluffy.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "fry",
        "title": "Air fry chicken",
        "detail": "Toss chicken in cornstarch and air fry until crispy.",
        "durationMin": 15,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Make sauce",
        "detail": "Simmer aminos, juice, and honey until thick. Toss with chicken.",
        "durationMin": 5,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "fry"
        ]
      },
      {
        "id": "steam",
        "title": "Steam broccoli",
        "detail": "Steam broccoli in the microwave or stovetop.",
        "durationMin": 5,
        "durationScaling": 0,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide rice, chicken, and broccoli.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "sauce",
          "steam"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Air fry in batches if scaling up to prevent steaming."
    ]
  },
  {
    "id": "louisiana-red-beans-and-rice",
    "schemaVersion": 2,
    "name": "Louisiana Turkey Red Beans",
    "tagline": "A Cajun classic modernized for strict macros.",
    "description": "Slow-cooked flavor in a fraction of the time. Turkey sausage keeps the fat down while delivering massive savory notes.",
    "category": "main",
    "cuisine": "cajun",
    "tags": [
      "cajun",
      "high protein",
      "dairy free",
      "high fiber"
    ],
    "spiceLevel": 2,
    "rating": 4.5,
    "ratingCount": 410,
    "baseServings": 6,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/louisiana-red-beans-and-rice.webp",
      "alt": "Red beans and rice with turkey sausage on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "EatingWell",
      "url": "https://www.eatingwell.com/recipe/250268/red-beans-rice/",
      "author": null
    },
    "nutritionPerServing": {
      "calories": 638,
      "protein": 46,
      "carbs": 82,
      "fat": 14,
      "fiber": 15,
      "sodium": 570
    },
    "appliances": [
      "instantPot",
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "sausage",
        "name": "Low-sodium turkey sausage",
        "group": "Protein",
        "qtyPerServing": 3.5,
        "unit": "oz",
        "prep": "sliced",
        "package": {
          "size": 21,
          "unit": "oz",
          "label": "21 oz pack"
        }
      },
      {
        "id": "beans",
        "name": "No-salt-added red kidney beans",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 1,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "pepper",
        "name": "Green bell pepper",
        "singular": "pepper",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "pepper"
        }
      },
      {
        "id": "onion",
        "name": "Yellow onion",
        "singular": "onion",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "onion"
        }
      },
      {
        "id": "celery",
        "name": "Celery stalks",
        "singular": "stalk",
        "group": "Produce",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "stalk"
        }
      },
      {
        "id": "rice",
        "name": "Brown rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "cajun",
        "name": "Salt-free Cajun seasoning",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "saute",
        "title": "Saut\u00e9 trinity",
        "detail": "Saut\u00e9 peppers, onions, celery, and sausage in the Instant Pot.",
        "durationMin": 8,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "instantPot",
        "dependsOn": []
      },
      {
        "id": "pressure",
        "title": "Pressure cook",
        "detail": "Add beans and spices. Pressure cook to meld flavors.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "instantPot",
        "dependsOn": [
          "saute"
        ]
      },
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Cook brown rice separately on the stovetop.",
        "durationMin": 35,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve the thick bean stew over the brown rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "pressure",
          "rice"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 3,
      "reheat": "Microwave 2-3 minutes, add water if too thick."
    },
    "notes": [
      "Mash a few beans at the end to naturally thicken the stew."
    ]
  },
  {
    "id": "greek-chicken-sheet-pan",
    "schemaVersion": 2,
    "name": "Greek Chicken Sheet Pan",
    "tagline": "Roasted Mediterranean flavors on one pan.",
    "description": "A totally hands-off roasted chicken meal with potatoes and carrots. Brightened with fresh lemon and a touch of feta cheese.",
    "category": "main",
    "cuisine": "greek",
    "tags": [
      "greek",
      "high protein",
      "gluten free",
      "mediterranean"
    ],
    "spiceLevel": 0,
    "rating": 4.6,
    "ratingCount": 510,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/greek-chicken-sheet-pan.webp",
      "alt": "Greek chicken, potatoes, and carrots on a white paper plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Faith Middleton",
      "url": "https://foodschmooze.org/recipe/skinnytaste-greek-chicken-sheet-pan-dinner/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 600,
      "protein": 45,
      "carbs": 60,
      "fat": 20,
      "fiber": 8,
      "sodium": 400
    },
    "appliances": [
      "oven"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken thighs",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "trimmed",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "potatoes",
        "name": "Baby red potatoes",
        "group": "Produce",
        "qtyPerServing": 8,
        "unit": "oz",
        "prep": "halved",
        "package": {
          "size": 32,
          "unit": "oz",
          "label": "2 lb bag"
        }
      },
      {
        "id": "carrots",
        "name": "Heirloom carrots",
        "group": "Produce",
        "qtyPerServing": 3,
        "unit": "oz",
        "prep": "trimmed",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz bag"
        }
      },
      {
        "id": "lemon",
        "name": "Lemon",
        "singular": "lemon",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "sliced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "lemon"
        }
      },
      {
        "id": "feta",
        "name": "Feta cheese",
        "group": "Dairy",
        "qtyPerServing": 0.5,
        "unit": "oz",
        "prep": "crumbled",
        "package": {
          "size": 2,
          "unit": "oz",
          "label": "2 oz tub"
        }
      },
      {
        "id": "olive-oil",
        "name": "Olive oil",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "oregano",
        "name": "Dried oregano",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "preheat",
        "title": "Preheat",
        "detail": "Preheat oven to 450F.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": []
      },
      {
        "id": "toss",
        "title": "Season",
        "detail": "Toss chicken and veggies with oil, lemon, and oregano.",
        "durationMin": 5,
        "durationScaling": 0.3,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "roast",
        "title": "Roast",
        "detail": "Roast on a sheet pan until chicken is fully cooked.",
        "durationMin": 30,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": [
          "preheat",
          "toss"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide into boxes and top with feta.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "roast"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 1,
      "reheat": "Oven at 350F for 10 minutes or microwave for 2 minutes."
    },
    "notes": [
      "Keep the lemon slices in the box during storage for extra citrus flavor."
    ]
  },
  {
    "id": "turkey-bolognese-spaghetti-squash",
    "schemaVersion": 2,
    "name": "Turkey Bolognese Spaghetti Squash",
    "tagline": "Italian comfort pasta swap packed with protein.",
    "description": "Lean ground turkey slow-simmered in a rich tomato sauce over roasted spaghetti squash and lentil pasta. A massive volume meal.",
    "category": "main",
    "cuisine": "italian",
    "tags": [
      "italian",
      "high protein",
      "high fiber",
      "dairy free"
    ],
    "spiceLevel": 0,
    "rating": 4.4,
    "ratingCount": 320,
    "baseServings": 4,
    "maxServings": 8,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/turkey-bolognese-spaghetti-squash.webp",
      "alt": "Turkey bolognese over spaghetti squash on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "The Kitcheneer",
      "url": "https://www.thekitcheneer.com/2014/10/07/spaghetti-squashta-turkey-bolognese-skinnytaste-cookbook-giveaway/",
      "author": null
    },
    "nutritionPerServing": {
      "calories": 635,
      "protein": 55,
      "carbs": 70,
      "fat": 15,
      "fiber": 14,
      "sodium": 300
    },
    "appliances": [
      "stovetop",
      "oven"
    ],
    "ingredients": [
      {
        "id": "turkey",
        "name": "Lean ground turkey 93/7",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "raw",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "squash",
        "name": "Spaghetti squash",
        "singular": "squash",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "halved",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "squash"
        }
      },
      {
        "id": "tomatoes",
        "name": "No-salt-added crushed tomatoes",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "onion",
        "name": "Yellow onion",
        "singular": "onion",
        "group": "Produce",
        "qtyPerServing": 0.25,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "onion"
        }
      },
      {
        "id": "carrot",
        "name": "Carrot",
        "singular": "carrot",
        "group": "Produce",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "carrot"
        }
      },
      {
        "id": "lentil-pasta",
        "name": "Red lentil pasta",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "italian-seasoning",
        "name": "Salt-free Italian seasoning",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "roast",
        "title": "Roast squash",
        "detail": "Roast squash halves face down at 400F until tender.",
        "durationMin": 40,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Simmer bolognese",
        "detail": "Brown turkey with vegetables, add tomatoes, and simmer.",
        "durationMin": 25,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "pasta",
        "title": "Cook pasta",
        "detail": "Boil lentil pasta until al dente.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Scrape squash strands into boxes, mix with pasta and top with sauce.",
        "durationMin": 8,
        "durationScaling": 0.8,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "roast",
          "sauce",
          "pasta"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 3 minutes."
    },
    "notes": [
      "Mixing the squash with lentil pasta provides a perfect texture and carb balance."
    ]
  },
  {
    "id": "korean-turkey-rice-bowls",
    "schemaVersion": 2,
    "name": "Korean Turkey Rice Bowls",
    "tagline": "Sweet, spicy, and ready in minutes.",
    "description": "A lean adaptation of Korean beef bowls utilizing ground turkey and coconut aminos to slash fat and sodium.",
    "category": "main",
    "cuisine": "korean",
    "tags": [
      "korean",
      "dairy free",
      "high protein"
    ],
    "spiceLevel": 3,
    "rating": 4.8,
    "ratingCount": 1150,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/korean-turkey-rice-bowls.webp",
      "alt": "Korean turkey rice bowl on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.facebook.com/GinasSkinnytaste/videos/skinnytaste-korean-beef-rice-bowls/506864117452976/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 630,
      "protein": 42,
      "carbs": 75,
      "fat": 18,
      "fiber": 4,
      "sodium": 450
    },
    "appliances": [
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "turkey",
        "name": "Lean ground turkey 93/7",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "raw",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "cucumber",
        "name": "Cucumber",
        "singular": "cucumber",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "sliced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "cucumber"
        }
      },
      {
        "id": "aminos",
        "name": "Coconut aminos",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "gochujang",
        "name": "Gochujang paste",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "rice",
        "name": "White rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "sesame-oil",
        "name": "Sesame oil",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "sesame-seeds",
        "name": "Sesame seeds",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Boil rice until tender.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "brown",
        "title": "Brown turkey",
        "detail": "Cook ground turkey completely.",
        "durationMin": 8,
        "durationScaling": 0.4,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Glaze meat",
        "detail": "Add aminos, gochujang, and sesame oil to the meat.",
        "durationMin": 3,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "brown"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve turkey over rice, garnished with cucumber and seeds.",
        "durationMin": 4,
        "durationScaling": 0.8,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "sauce"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Remove cucumbers, microwave 2 minutes."
    },
    "notes": [
      "Keep the cucumber slices on the side so they stay crisp."
    ]
  },
  {
    "id": "mediterranean-turkey-meatballs",
    "schemaVersion": 2,
    "name": "Mediterranean Turkey Meatballs",
    "tagline": "Herb-packed meatballs over couscous.",
    "description": "Ground turkey mixed with fresh zucchini for moisture, served with a refreshing cucumber salad and tzatziki.",
    "category": "main",
    "cuisine": "mediterranean",
    "tags": [
      "mediterranean",
      "high protein"
    ],
    "spiceLevel": 0,
    "rating": 4.7,
    "ratingCount": 420,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/mediterranean-turkey-meatballs.webp",
      "alt": "Mediterranean turkey meatballs over couscous on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.facebook.com/GinasSkinnytaste/videos/mediterranean-meatballs-made-with-flavorful-ground-turkey-meatballs-served-over-/1031916228587967/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 602,
      "protein": 42,
      "carbs": 68,
      "fat": 18,
      "fiber": 6,
      "sodium": 480
    },
    "appliances": [
      "airFryer",
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "turkey",
        "name": "Lean ground turkey 93/7",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "raw",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "zucchini",
        "name": "Zucchini",
        "singular": "zucchini",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "grated",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "zucchini"
        }
      },
      {
        "id": "cucumber",
        "name": "Cucumber",
        "singular": "cucumber",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "cucumber"
        }
      },
      {
        "id": "tomatoes",
        "name": "Cherry tomatoes",
        "group": "Produce",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "halved",
        "package": {
          "size": 16,
          "unit": "oz",
          "label": "16 oz pack"
        }
      },
      {
        "id": "feta",
        "name": "Feta cheese",
        "group": "Dairy",
        "qtyPerServing": 0.5,
        "unit": "oz",
        "prep": "crumbled",
        "package": {
          "size": 2,
          "unit": "oz",
          "label": "2 oz tub"
        }
      },
      {
        "id": "couscous",
        "name": "Israeli couscous",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "tzatziki",
        "name": "Tzatziki sauce",
        "group": "Dairy",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": {
          "size": 16,
          "unit": "tbsp",
          "label": "8 oz tub"
        }
      }
    ],
    "steps": [
      {
        "id": "mix",
        "title": "Form meatballs",
        "detail": "Mix grated zucchini into turkey and form balls.",
        "durationMin": 10,
        "durationScaling": 0.8,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "fry",
        "title": "Air fry",
        "detail": "Air fry meatballs until cooked through.",
        "durationMin": 12,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": [
          "mix"
        ]
      },
      {
        "id": "couscous",
        "title": "Boil couscous",
        "detail": "Simmer couscous on the stovetop.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve meatballs over couscous with salad and tzatziki.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "fry",
          "couscous"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Remove tzatziki and salad, microwave 2 minutes."
    },
    "notes": [
      "Squeeze excess water from the grated zucchini before mixing into the turkey."
    ]
  },
  {
    "id": "thai-peanut-chicken-stir-fry",
    "schemaVersion": 2,
    "name": "Thai Peanut Chicken Bowls",
    "tagline": "A rich, nutty stir-fry loaded with veggies.",
    "description": "Utilizes powdered peanut butter to create a low-fat, high-protein Thai-inspired peanut sauce.",
    "category": "main",
    "cuisine": "thai",
    "tags": [
      "thai",
      "high protein",
      "dairy free"
    ],
    "spiceLevel": 2,
    "rating": 4.5,
    "ratingCount": 210,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/thai-peanut-chicken-stir-fry.webp",
      "alt": "Thai peanut chicken stir fry on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": null,
    "nutritionPerServing": {
      "calories": 615,
      "protein": 45,
      "carbs": 75,
      "fat": 15,
      "fiber": 8,
      "sodium": 400
    },
    "appliances": [
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken breast",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "sliced",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "pepper",
        "name": "Red bell pepper",
        "singular": "pepper",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "sliced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "pepper"
        }
      },
      {
        "id": "broccoli",
        "name": "Broccoli florets",
        "group": "Produce",
        "qtyPerServing": 3,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz bag"
        }
      },
      {
        "id": "lime",
        "name": "Lime",
        "singular": "lime",
        "group": "Produce",
        "qtyPerServing": 0.25,
        "unit": "each",
        "prep": "juiced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "lime"
        }
      },
      {
        "id": "pb2",
        "name": "Powdered peanut butter",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "aminos",
        "name": "Coconut aminos",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "rice",
        "name": "Jasmine rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Boil rice until fluffy.",
        "durationMin": 15,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "saute",
        "title": "Stir fry",
        "detail": "Saut\u00e9 chicken, peppers, and broccoli.",
        "durationMin": 10,
        "durationScaling": 0.4,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Peanut sauce",
        "detail": "Whisk PB2, aminos, and lime juice with water. Toss with chicken.",
        "durationMin": 5,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "saute"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve over rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "sauce"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Hydrate the peanut powder with warm water before adding to the pan."
    ]
  },
  {
    "id": "caribbean-jerk-chicken-bowls",
    "schemaVersion": 2,
    "name": "Caribbean Jerk Chicken Bowls",
    "tagline": "Sweet and spicy island flavors.",
    "description": "Tender jerk chicken served with coconut rice, black beans, and sweet pineapple chunks.",
    "category": "main",
    "cuisine": "caribbean",
    "tags": [
      "caribbean",
      "high protein",
      "dairy free",
      "gluten free"
    ],
    "spiceLevel": 4,
    "rating": 4.6,
    "ratingCount": 115,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/caribbean-jerk-chicken-bowls.webp",
      "alt": "Jerk chicken bowl with pineapple on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": null,
    "nutritionPerServing": {
      "calories": 644,
      "protein": 45,
      "carbs": 80,
      "fat": 16,
      "fiber": 10,
      "sodium": 450
    },
    "appliances": [
      "stovetop",
      "oven"
    ],
    "ingredients": [
      {
        "id": "chicken",
        "name": "Boneless skinless chicken breast",
        "group": "Protein",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 24,
          "unit": "oz",
          "label": "1.5 lb pack"
        }
      },
      {
        "id": "beans",
        "name": "No-salt-added black beans",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "pineapple",
        "name": "Pineapple chunks",
        "group": "Produce",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 16,
          "unit": "oz",
          "label": "16 oz pack"
        }
      },
      {
        "id": "coconut-milk",
        "name": "Light coconut milk",
        "group": "Canned",
        "qtyPerServing": 2,
        "unit": "fl oz",
        "prep": "shaken",
        "package": {
          "size": 8,
          "unit": "fl oz",
          "label": "8 oz carton"
        }
      },
      {
        "id": "rice",
        "name": "White rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "jerk",
        "name": "Salt-free jerk seasoning",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Coconut rice",
        "detail": "Boil rice using coconut milk and water.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "bake",
        "title": "Bake chicken",
        "detail": "Toss chicken in jerk seasoning and bake at 400F.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide rice, chicken, beans, and pineapple.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "bake"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Keep pineapple separate if you prefer it cold."
    ]
  },
  {
    "id": "cajun-vegan-red-beans-rice",
    "schemaVersion": 2,
    "name": "Cajun Vegan Red Beans",
    "tagline": "Plant-based southern comfort with a protein kick.",
    "description": "We utilized textured vegetable protein (TVP) to drastically raise the protein content of this classic vegan dish without adding fat.",
    "category": "main",
    "cuisine": "cajun",
    "tags": [
      "cajun",
      "vegan",
      "vegetarian",
      "dairy free",
      "high fiber",
      "high protein"
    ],
    "spiceLevel": 2,
    "rating": 4.8,
    "ratingCount": 620,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/cajun-vegan-red-beans-rice.webp",
      "alt": "Vegan red beans and rice on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://minimalistbaker.com/easy-vegan-red-beans-and-rice/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 602,
      "protein": 45,
      "carbs": 83,
      "fat": 10,
      "fiber": 18,
      "sodium": 480
    },
    "appliances": [
      "instantPot",
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "beans",
        "name": "No-salt-added kidney beans",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 1,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "tvp",
        "name": "Textured vegetable protein",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "oz",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "pepper",
        "name": "Green bell pepper",
        "singular": "pepper",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "pepper"
        }
      },
      {
        "id": "onion",
        "name": "Yellow onion",
        "singular": "onion",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "onion"
        }
      },
      {
        "id": "celery",
        "name": "Celery stalks",
        "singular": "stalk",
        "group": "Produce",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "stalk"
        }
      },
      {
        "id": "rice",
        "name": "Brown rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "cajun",
        "name": "Salt-free Cajun seasoning",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "saute",
        "title": "Saut\u00e9 aromatics",
        "detail": "Saut\u00e9 veggies in the Instant Pot.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "instantPot",
        "dependsOn": []
      },
      {
        "id": "pressure",
        "title": "Pressure cook",
        "detail": "Add beans, TVP, spices, and water. Pressure cook.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "instantPot",
        "dependsOn": [
          "saute"
        ]
      },
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Simmer brown rice separately.",
        "durationMin": 35,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve the bean and TVP mixture over rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "pressure",
          "rice"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 3,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "The TVP perfectly absorbs the Cajun spices and mimics ground meat."
    ]
  },
  {
    "id": "vegan-creamy-butter-chickpeas",
    "schemaVersion": 2,
    "name": "Vegan Butter Chickpeas",
    "tagline": "A rich, creamy Indian curry without the dairy.",
    "description": "Tofu blocks and chickpeas simmer in a coconut and tomato sauce. It completely satisfies the craving for butter chicken.",
    "category": "main",
    "cuisine": "indian",
    "tags": [
      "indian",
      "vegan",
      "vegetarian",
      "dairy free",
      "high fiber"
    ],
    "spiceLevel": 1,
    "rating": 4.9,
    "ratingCount": 1400,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/vegan-creamy-butter-chickpeas.webp",
      "alt": "Vegan butter chickpeas on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://minimalistbaker.com/easy-1-pot-chickpea-tikka-masala/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 604,
      "protein": 46,
      "carbs": 78,
      "fat": 12,
      "fiber": 14,
      "sodium": 490
    },
    "appliances": [
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "chickpeas",
        "name": "No-salt-added chickpeas",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 1,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "tofu",
        "name": "Extra firm tofu",
        "group": "Protein",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 16,
          "unit": "oz",
          "label": "16 oz block"
        }
      },
      {
        "id": "tomato",
        "name": "No-salt-added tomato puree",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "coconut",
        "name": "Light coconut milk",
        "group": "Canned",
        "qtyPerServing": 3.375,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 13.5,
          "unit": "fl oz",
          "label": "13.5 oz can"
        }
      },
      {
        "id": "rice",
        "name": "Basmati rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "masala",
        "name": "Garam masala",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Boil rice until fluffy.",
        "durationMin": 15,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "simmer",
        "title": "Simmer curry",
        "detail": "Combine chickpeas, tofu, tomato, coconut milk, and spices. Simmer to thicken.",
        "durationMin": 20,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve the curry over basmati rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "simmer"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Press the tofu beforehand so it absorbs the curry flavors."
    ]
  },
  {
    "id": "vegan-buffalo-tofu-mac",
    "schemaVersion": 2,
    "name": "Vegan Buffalo Tofu Mac",
    "tagline": "Plant-based mac and cheese packed with protein.",
    "description": "By using pea protein powder to thicken the buffalo sauce, this vegan mac delivers exceptional protein without cashew-heavy fats.",
    "category": "main",
    "cuisine": "american",
    "tags": [
      "american",
      "vegan",
      "vegetarian",
      "dairy free",
      "high protein"
    ],
    "spiceLevel": 3,
    "rating": 4.5,
    "ratingCount": 420,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/vegan-buffalo-tofu-mac.webp",
      "alt": "Vegan buffalo tofu mac and cheese on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://minimalistbaker.com/best-vegan-mac-n-cheese/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 618,
      "protein": 48,
      "carbs": 75,
      "fat": 14,
      "fiber": 9,
      "sodium": 540
    },
    "appliances": [
      "stovetop",
      "airFryer"
    ],
    "ingredients": [
      {
        "id": "tofu",
        "name": "Extra firm tofu",
        "group": "Protein",
        "qtyPerServing": 7,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 28,
          "unit": "oz",
          "label": "28 oz pack"
        }
      },
      {
        "id": "pasta",
        "name": "Macaroni pasta",
        "group": "Pantry",
        "qtyPerServing": 2.5,
        "unit": "oz",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "yeast",
        "name": "Nutritional yeast",
        "group": "Pantry",
        "qtyPerServing": 3,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "protein",
        "name": "Pea protein powder (unflavored, ~15 g per scoop)",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "buffalo",
        "name": "Buffalo sauce (low sodium)",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "almond-milk",
        "name": "Unsweetened almond milk",
        "group": "Dairy",
        "qtyPerServing": 2,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 8,
          "unit": "fl oz",
          "label": "8 oz carton"
        }
      }
    ],
    "steps": [
      {
        "id": "boil",
        "title": "Cook pasta",
        "detail": "Boil pasta on stovetop.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "fry",
        "title": "Crisp tofu",
        "detail": "Air fry the tofu cubes until golden.",
        "durationMin": 12,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Make sauce",
        "detail": "Whisk almond milk, protein, yeast, and buffalo sauce over low heat until thick.",
        "durationMin": 5,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Combine pasta, tofu, and sauce.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "boil",
          "fry",
          "sauce"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 1,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "The pea protein naturally thickens the sauce perfectly."
    ]
  },
  {
    "id": "vegan-general-tsos-tofu",
    "schemaVersion": 2,
    "name": "Vegan General Tso's Tofu",
    "tagline": "Crispy tofu and edamame in a sticky glaze.",
    "description": "Edamame drives up the protein content to meet macro rules, while the tofu provides the classic takeout texture.",
    "category": "main",
    "cuisine": "chinese",
    "tags": [
      "chinese",
      "vegan",
      "vegetarian",
      "dairy free",
      "high protein"
    ],
    "spiceLevel": 2,
    "rating": 4.7,
    "ratingCount": 540,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/vegan-general-tsos-tofu.webp",
      "alt": "General Tso's tofu on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://minimalistbaker.com/crispy-peanut-tofu-cauliflower-rice/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 608,
      "protein": 45,
      "carbs": 80,
      "fat": 12,
      "fiber": 9,
      "sodium": 520
    },
    "appliances": [
      "airFryer",
      "stovetop"
    ],
    "ingredients": [
      {
        "id": "tofu",
        "name": "Extra firm tofu",
        "group": "Protein",
        "qtyPerServing": 7,
        "unit": "oz",
        "prep": "cubed",
        "package": {
          "size": 28,
          "unit": "oz",
          "label": "28 oz pack"
        }
      },
      {
        "id": "edamame",
        "name": "Shelled edamame",
        "group": "Frozen",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 8,
          "unit": "oz",
          "label": "8 oz bag"
        }
      },
      {
        "id": "broccoli",
        "name": "Broccoli florets",
        "group": "Frozen",
        "qtyPerServing": 3,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz bag"
        }
      },
      {
        "id": "aminos",
        "name": "Coconut aminos",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "cornstarch",
        "name": "Cornstarch",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "rice",
        "name": "White rice",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "rice",
        "title": "Cook rice",
        "detail": "Boil rice.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "fry",
        "title": "Air fry tofu",
        "detail": "Toss tofu in cornstarch and air fry until crispy.",
        "durationMin": 15,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": []
      },
      {
        "id": "sauce",
        "title": "Make sauce",
        "detail": "Simmer aminos with water until thick. Toss with tofu, edamame, and broccoli.",
        "durationMin": 8,
        "durationScaling": 0.1,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": [
          "fry"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve tofu and veg over rice.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "rice",
          "sauce"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 2,
      "reheat": "Microwave 2 minutes."
    },
    "notes": [
      "Tofu stays crispier if you store the sauce separately."
    ]
  },
  {
    "id": "spicy-buffalo-chickpeas",
    "schemaVersion": 2,
    "name": "Air Fryer Buffalo Chickpeas",
    "tagline": "Crunchy, spicy snack loaded with fiber.",
    "description": "These air-fried chickpeas are the perfect crunchy snack. Buffalo sauce gives them a tangy kick.",
    "category": "snack",
    "cuisine": "american",
    "tags": [
      "american",
      "vegan",
      "vegetarian",
      "dairy free",
      "high fiber"
    ],
    "spiceLevel": 2,
    "rating": 4.5,
    "ratingCount": 180,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/spicy-buffalo-chickpeas.webp",
      "alt": "Buffalo chickpeas on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.skinnytaste.com/spicy-roasted-chickpeas/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 204,
      "protein": 10,
      "carbs": 32,
      "fat": 4,
      "fiber": 9,
      "sodium": 380
    },
    "appliances": [
      "airFryer"
    ],
    "ingredients": [
      {
        "id": "chickpeas",
        "name": "No-salt-added chickpeas",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 1,
        "unit": "can",
        "prep": "rinsed and dried",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "buffalo",
        "name": "Buffalo sauce (low sodium)",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "olive-oil",
        "name": "Olive oil",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "garlic",
        "name": "Garlic powder",
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
        "id": "toss",
        "title": "Toss",
        "detail": "Toss dry chickpeas with oil, buffalo sauce, and garlic powder.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "fry",
        "title": "Air fry",
        "detail": "Air fry at 390F until super crispy.",
        "durationMin": 15,
        "durationScaling": 0,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": [
          "toss"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Cool completely before sealing in boxes.",
        "durationMin": 2,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "fry"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 0,
      "reheat": "Eat cold or room temp."
    },
    "notes": [
      "Drying the chickpeas thoroughly is the secret to maximum crunch."
    ]
  },
  {
    "id": "chickpea-shawarma-dip",
    "schemaVersion": 2,
    "name": "Chickpea Shawarma Dip",
    "tagline": "A protein-rich Middle Eastern spread.",
    "description": "Mashed chickpeas blended with tahini and warming spices. Perfect for dipping with fresh pita.",
    "category": "snack",
    "cuisine": "middle eastern",
    "tags": [
      "middle eastern",
      "vegan",
      "vegetarian",
      "dairy free"
    ],
    "spiceLevel": 1,
    "rating": 4.8,
    "ratingCount": 330,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/chickpea-shawarma-dip.webp",
      "alt": "Chickpea dip with pita on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://heartfultable.com/vegan-chickpea-recipes/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 280,
      "protein": 12,
      "carbs": 40,
      "fat": 8,
      "fiber": 8,
      "sodium": 300
    },
    "appliances": [],
    "ingredients": [
      {
        "id": "chickpeas",
        "name": "No-salt-added chickpeas",
        "singular": "can",
        "group": "Canned",
        "qtyPerServing": 0.5,
        "unit": "can",
        "prep": "rinsed",
        "package": {
          "size": 1,
          "unit": "can",
          "label": "15 oz can"
        }
      },
      {
        "id": "lemon",
        "name": "Lemon",
        "singular": "lemon",
        "group": "Produce",
        "qtyPerServing": 0.25,
        "unit": "each",
        "prep": "juiced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "lemon"
        }
      },
      {
        "id": "tahini",
        "name": "Tahini",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "cumin",
        "name": "Ground cumin",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "garlic",
        "name": "Garlic powder",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "pita",
        "name": "Whole wheat pita",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "sliced",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "mash",
        "title": "Mash",
        "detail": "Mash chickpeas with a fork until chunky but spreadable.",
        "durationMin": 5,
        "durationScaling": 0.8,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "mix",
        "title": "Mix",
        "detail": "Stir in tahini, lemon juice, and spices.",
        "durationMin": 3,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "mash"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide dip and serve with pita slices.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "mix"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 0,
      "reheat": "Eat cold."
    },
    "notes": [
      "Leave a few chickpeas whole for texture."
    ]
  },
  {
    "id": "spinach-turkey-egg-muffins",
    "schemaVersion": 2,
    "name": "Turkey Bacon Egg Muffins",
    "tagline": "A grab-and-go savory protein hit.",
    "description": "Liquid egg whites baked in muffin tins with spinach and turkey bacon. Extremely low fat and high protein.",
    "category": "snack",
    "cuisine": "american",
    "tags": [
      "american",
      "high protein",
      "gluten free"
    ],
    "spiceLevel": 0,
    "rating": 4.6,
    "ratingCount": 920,
    "baseServings": 6,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/spinach-turkey-egg-muffins.webp",
      "alt": "Egg white muffins on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.skinnytaste.com/loaded-baked-egg-muffins/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 186,
      "protein": 25,
      "carbs": 8,
      "fat": 6,
      "fiber": 1,
      "sodium": 410
    },
    "appliances": [
      "oven"
    ],
    "ingredients": [
      {
        "id": "eggs",
        "name": "Liquid egg whites",
        "group": "Dairy",
        "qtyPerServing": 4,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 24,
          "unit": "fl oz",
          "label": "24 oz carton"
        }
      },
      {
        "id": "bacon",
        "name": "Low-sodium turkey bacon slices",
        "singular": "slice",
        "group": "Protein",
        "qtyPerServing": 1.5,
        "unit": "each",
        "prep": "chopped",
        "package": {
          "size": 9,
          "unit": "each",
          "label": "9 slices"
        }
      },
      {
        "id": "spinach",
        "name": "Fresh baby spinach",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "chopped",
        "package": {
          "size": 3,
          "unit": "cup",
          "label": "3 cups bag"
        }
      },
      {
        "id": "cheddar",
        "name": "Reduced-fat cheddar",
        "group": "Dairy",
        "qtyPerServing": 0.5,
        "unit": "oz",
        "prep": "shredded",
        "package": {
          "size": 3,
          "unit": "oz",
          "label": "3 oz bag"
        }
      }
    ],
    "steps": [
      {
        "id": "preheat",
        "title": "Preheat",
        "detail": "Preheat oven to 350F.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": []
      },
      {
        "id": "mix",
        "title": "Mix",
        "detail": "Whisk egg whites, bacon, spinach, and cheese.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "bake",
        "title": "Bake",
        "detail": "Pour into silicone muffin cups and bake until set.",
        "durationMin": 20,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": [
          "preheat",
          "mix"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Cool and divide into boxes.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "bake"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 4,
      "freezerMonths": 1,
      "reheat": "Microwave 45 seconds."
    },
    "notes": [
      "Silicone liners are highly recommended to prevent sticking."
    ]
  },
  {
    "id": "turkey-chorizo-quesadilla",
    "schemaVersion": 2,
    "name": "Chorizo Mini Quesadilla",
    "tagline": "A melty, spicy mid-day pick-me-up.",
    "description": "Crispy air-fried quesadillas loaded with turkey chorizo. Portion controlled and macro-friendly.",
    "category": "snack",
    "cuisine": "mexican",
    "tags": [
      "mexican",
      "high protein"
    ],
    "spiceLevel": 2,
    "rating": 4.7,
    "ratingCount": 550,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/turkey-chorizo-quesadilla.webp",
      "alt": "Mini chorizo quesadilla on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Fit Men Cook",
      "url": "https://fitmencook.com/recipes/healthy-quesadilla-prep/",
      "author": "Kevin Curry"
    },
    "nutritionPerServing": {
      "calories": 272,
      "protein": 24,
      "carbs": 26,
      "fat": 8,
      "fiber": 4,
      "sodium": 490
    },
    "appliances": [
      "stovetop",
      "airFryer"
    ],
    "ingredients": [
      {
        "id": "tortilla",
        "name": "Low-carb wheat tortilla",
        "singular": "tortilla",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "",
        "package": {
          "size": 4,
          "unit": "each",
          "label": "4 tortillas"
        }
      },
      {
        "id": "chorizo",
        "name": "Turkey chorizo",
        "group": "Protein",
        "qtyPerServing": 2,
        "unit": "oz",
        "prep": "casing removed",
        "package": {
          "size": 8,
          "unit": "oz",
          "label": "8 oz pack"
        }
      },
      {
        "id": "mozz",
        "name": "Part-skim mozzarella",
        "group": "Dairy",
        "qtyPerServing": 1,
        "unit": "oz",
        "prep": "shredded",
        "package": {
          "size": 4,
          "unit": "oz",
          "label": "4 oz bag"
        }
      },
      {
        "id": "salsa",
        "name": "Salsa (low sodium)",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "brown",
        "title": "Cook chorizo",
        "detail": "Saut\u00e9 chorizo on stovetop until done.",
        "durationMin": 6,
        "durationScaling": 0.2,
        "active": true,
        "appliance": "stovetop",
        "dependsOn": []
      },
      {
        "id": "assemble",
        "title": "Assemble",
        "detail": "Fill tortilla with chorizo and cheese, fold in half.",
        "durationMin": 3,
        "durationScaling": 0.8,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "brown"
        ]
      },
      {
        "id": "fry",
        "title": "Air fry",
        "detail": "Air fry until cheese melts and tortilla crisps.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": [
          "assemble"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve with salsa.",
        "durationMin": 2,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "fry"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 3,
      "freezerMonths": 1,
      "reheat": "Air fry 3 minutes to recrisp."
    },
    "notes": [
      "You can freeze these wrapped in foil."
    ]
  },
  {
    "id": "crispy-pita-chips-guacamole",
    "schemaVersion": 2,
    "name": "Pita Chips & Guacamole",
    "tagline": "Homemade crunch with a healthy fat dip.",
    "description": "Air-fried pita chips offer a massive calorie save over deep-fried tortillas. Paired with fresh avocado guacamole.",
    "category": "snack",
    "cuisine": "mexican",
    "tags": [
      "mexican",
      "vegetarian"
    ],
    "spiceLevel": 1,
    "rating": 4.8,
    "ratingCount": 610,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/crispy-pita-chips-guacamole.webp",
      "alt": "Pita chips with guacamole on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.skinnytaste.com/homemade-pita-chips/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 237,
      "protein": 10,
      "carbs": 38,
      "fat": 5,
      "fiber": 6,
      "sodium": 320
    },
    "appliances": [
      "airFryer"
    ],
    "ingredients": [
      {
        "id": "pita",
        "name": "Whole wheat pita",
        "singular": "pita",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "each",
        "prep": "cut in triangles",
        "package": {
          "size": 4,
          "unit": "each",
          "label": "4 pack"
        }
      },
      {
        "id": "avo",
        "name": "Fresh avocado",
        "singular": "avocado",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "mashed",
        "package": {
          "size": 2,
          "unit": "each",
          "label": "2 avocados"
        }
      },
      {
        "id": "yogurt",
        "name": "Non-fat plain Greek yogurt",
        "group": "Dairy",
        "qtyPerServing": 1,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 4,
          "unit": "oz",
          "label": "4 oz tub"
        }
      },
      {
        "id": "lime",
        "name": "Lime",
        "singular": "lime",
        "group": "Produce",
        "qtyPerServing": 0.25,
        "unit": "each",
        "prep": "juiced",
        "package": {
          "size": 1,
          "unit": "each",
          "label": "lime"
        }
      }
    ],
    "steps": [
      {
        "id": "fry",
        "title": "Air fry chips",
        "detail": "Air fry pita triangles until crispy.",
        "durationMin": 8,
        "durationScaling": 0.2,
        "active": false,
        "appliance": "airFryer",
        "dependsOn": []
      },
      {
        "id": "guac",
        "title": "Make guac",
        "detail": "Mash avocado and mix with yogurt and lime juice.",
        "durationMin": 5,
        "durationScaling": 0.4,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Divide chips and guac into boxes.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "fry",
          "guac"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 3,
      "freezerMonths": 0,
      "reheat": "Eat cold."
    },
    "notes": [
      "The yogurt stretches the avocado while adding protein and keeping fat under 30%."
    ]
  },
  {
    "id": "chocolate-peanut-butter-creami",
    "schemaVersion": 2,
    "name": "Chocolate PB Protein Ice Cream",
    "tagline": "A decadent dessert with zero guilt.",
    "description": "Utilizing the Ninja Creami, this ice cream hits massive protein numbers while using zero heavy cream. PB2 keeps the peanut butter flavor strong.",
    "category": "dessert",
    "cuisine": "american",
    "tags": [
      "american",
      "dessert",
      "high protein",
      "gluten free"
    ],
    "spiceLevel": 0,
    "rating": 4.9,
    "ratingCount": 1850,
    "baseServings": 2,
    "maxServings": 8,
    "container": "Ninja Creami Deluxe 24 oz pint (2 servings)",
    "containerPlural": "Creami pints",
    "servingsPerContainer": 2,
    "image": {
      "url": "images/chocolate-peanut-butter-creami.webp",
      "alt": "Scoop of chocolate peanut butter ice cream on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Mason Fit",
      "url": "https://masonfit.com/ninja-creami-chocolate-protein-ice-cream/",
      "author": "Mason Woodruff"
    },
    "nutritionPerServing": {
      "calories": 279,
      "protein": 32,
      "carbs": 22,
      "fat": 7,
      "fiber": 4,
      "sodium": 280
    },
    "appliances": [
      "creami"
    ],
    "ingredients": [
      {
        "id": "protein",
        "name": "Chocolate whey protein",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "almond-milk",
        "name": "Unsweetened almond milk",
        "group": "Dairy",
        "qtyPerServing": 8,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 16,
          "unit": "fl oz",
          "label": "16 oz carton"
        }
      },
      {
        "id": "pb2",
        "name": "Powdered peanut butter",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "cocoa",
        "name": "Cocoa powder",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      }
    ],
    "steps": [
      {
        "id": "mix",
        "title": "Whisk",
        "detail": "Whisk protein, PB2, cocoa, and milk until smooth.",
        "durationMin": 3,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "freeze",
        "title": "Freeze",
        "detail": "Freeze pint for 24 hours.",
        "durationMin": 0,
        "durationScaling": 0,
        "active": false,
        "appliance": null,
        "dependsOn": [
          "mix"
        ]
      },
      {
        "id": "spin",
        "title": "Spin",
        "detail": "Run through the Creami on Lite Ice Cream mode.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": "creami",
        "dependsOn": [
          "freeze"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve immediately from the pint.",
        "durationMin": 1,
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
      "freezerMonths": 3,
      "reheat": "Respin in Creami if frozen solid."
    },
    "notes": [
      "Adding a pinch of xanthan gum (pantry) improves texture."
    ]
  },
  {
    "id": "strawberry-cheesecake-creami",
    "schemaVersion": 2,
    "name": "Strawberry Cheesecake Creami",
    "tagline": "Tart, creamy, and packed with casein.",
    "description": "Cottage cheese acts as a brilliant base for this cheesecake-flavored frozen treat. The strawberries add natural sweetness and tartness.",
    "category": "dessert",
    "cuisine": "american",
    "tags": [
      "american",
      "dessert",
      "high protein",
      "gluten free"
    ],
    "spiceLevel": 0,
    "rating": 4.8,
    "ratingCount": 1120,
    "baseServings": 2,
    "maxServings": 8,
    "container": "Ninja Creami Deluxe 24 oz pint (2 servings)",
    "containerPlural": "Creami pints",
    "servingsPerContainer": 2,
    "image": {
      "url": "images/strawberry-cheesecake-creami.webp",
      "alt": "Strawberry cheesecake ice cream on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Mason Fit",
      "url": "https://masonfit.com/cottage-cheese-ninja-creami-ice-cream/",
      "author": "Mason Woodruff"
    },
    "nutritionPerServing": {
      "calories": 253,
      "protein": 28,
      "carbs": 24,
      "fat": 5,
      "fiber": 2,
      "sodium": 340
    },
    "appliances": [
      "creami"
    ],
    "ingredients": [
      {
        "id": "cottage",
        "name": "Low-fat cottage cheese",
        "group": "Dairy",
        "qtyPerServing": 6,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "oz",
          "label": "12 oz tub"
        }
      },
      {
        "id": "strawberries",
        "name": "Frozen strawberries",
        "group": "Frozen",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 8,
          "unit": "oz",
          "label": "8 oz bag"
        }
      },
      {
        "id": "protein",
        "name": "Vanilla whey protein",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "almond-milk",
        "name": "Unsweetened almond milk",
        "group": "Dairy",
        "qtyPerServing": 4,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 8,
          "unit": "fl oz",
          "label": "8 oz carton"
        }
      }
    ],
    "steps": [
      {
        "id": "mix",
        "title": "Mash and mix",
        "detail": "Mash strawberries and whisk with other ingredients.",
        "durationMin": 5,
        "durationScaling": 0.3,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "freeze",
        "title": "Freeze",
        "detail": "Freeze pint for 24 hours.",
        "durationMin": 0,
        "durationScaling": 0,
        "active": false,
        "appliance": null,
        "dependsOn": [
          "mix"
        ]
      },
      {
        "id": "spin",
        "title": "Spin",
        "detail": "Run through the Creami.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": "creami",
        "dependsOn": [
          "freeze"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Serve cold.",
        "durationMin": 1,
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
      "freezerMonths": 3,
      "reheat": "Respin before eating."
    },
    "notes": [
      "The cottage cheese curds will be entirely obliterated by the Creami blade."
    ]
  },
  {
    "id": "chocolate-fudge-mug-cake",
    "schemaVersion": 2,
    "name": "Chocolate Fudge Mug Cake",
    "tagline": "Warm, gooey cake in under 2 minutes.",
    "description": "Applesauce replaces baking oils in this rapid microwave cake, ensuring a moist crumb without the excess lipids.",
    "category": "dessert",
    "cuisine": "american",
    "tags": [
      "american",
      "dessert",
      "high protein"
    ],
    "spiceLevel": 0,
    "rating": 4.5,
    "ratingCount": 780,
    "baseServings": 1,
    "maxServings": 4,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/chocolate-fudge-mug-cake.webp",
      "alt": "Chocolate mug cake on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Fit Men Cook",
      "url": "https://fitmencook.com/recipes/protein-mug-cake/",
      "author": "Kevin Curry"
    },
    "nutritionPerServing": {
      "calories": 286,
      "protein": 30,
      "carbs": 28,
      "fat": 6,
      "fiber": 4,
      "sodium": 310
    },
    "appliances": [
      "microwave"
    ],
    "ingredients": [
      {
        "id": "protein",
        "name": "Chocolate whey-casein blend",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "cocoa",
        "name": "Cocoa powder",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "oats",
        "name": "Oat flour",
        "group": "Pantry",
        "qtyPerServing": 2,
        "unit": "tbsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "applesauce",
        "name": "Unsweetened applesauce",
        "group": "Canned",
        "qtyPerServing": 4,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 4,
          "unit": "oz",
          "label": "4 oz cup"
        }
      },
      {
        "id": "almond-milk",
        "name": "Unsweetened almond milk",
        "group": "Dairy",
        "qtyPerServing": 2,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 2,
          "unit": "fl oz",
          "label": "2 oz carton"
        }
      }
    ],
    "steps": [
      {
        "id": "mix",
        "title": "Mix batter",
        "detail": "Stir all ingredients in a microwave-safe mug.",
        "durationMin": 2,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "cook",
        "title": "Microwave",
        "detail": "Microwave on high for 60-90 seconds.",
        "durationMin": 2,
        "durationScaling": 1,
        "active": true,
        "appliance": "microwave",
        "dependsOn": [
          "mix"
        ]
      },
      {
        "id": "portion",
        "title": "Serve",
        "detail": "Invert onto plate or serve in mug.",
        "durationMin": 1,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "cook"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 3,
      "freezerMonths": 0,
      "reheat": "Microwave 15 seconds."
    },
    "notes": [
      "Do not overcook or the whey protein will become rubbery."
    ]
  },
  {
    "id": "mixed-berry-sorbet-creami",
    "schemaVersion": 2,
    "name": "Vegan Berry Protein Sorbet",
    "tagline": "A refreshing dairy-free frozen treat.",
    "description": "Coconut water and mixed berries form an icy, refreshing sorbet. Plant protein adds staying power to this dessert.",
    "category": "dessert",
    "cuisine": "american",
    "tags": [
      "american",
      "dessert",
      "vegan",
      "dairy free",
      "high protein"
    ],
    "spiceLevel": 0,
    "rating": 4.6,
    "ratingCount": 420,
    "baseServings": 2,
    "maxServings": 8,
    "container": "Ninja Creami Deluxe 24 oz pint (2 servings)",
    "containerPlural": "Creami pints",
    "servingsPerContainer": 2,
    "image": {
      "url": "images/mixed-berry-sorbet-creami.webp",
      "alt": "Scoop of berry sorbet on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Minimalist Baker",
      "url": "https://minimalistbaker.com/easy-berry-sorbet/",
      "author": "Dana Shultz"
    },
    "nutritionPerServing": {
      "calories": 226,
      "protein": 20,
      "carbs": 32,
      "fat": 2,
      "fiber": 6,
      "sodium": 210
    },
    "appliances": [
      "creami"
    ],
    "ingredients": [
      {
        "id": "berries",
        "name": "Frozen mixed berries",
        "group": "Frozen",
        "qtyPerServing": 5,
        "unit": "oz",
        "prep": "",
        "package": {
          "size": 10,
          "unit": "oz",
          "label": "10 oz bag"
        }
      },
      {
        "id": "protein",
        "name": "Vanilla plant protein powder",
        "group": "Pantry",
        "qtyPerServing": 1,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "coconut-water",
        "name": "Coconut water",
        "group": "Pantry",
        "qtyPerServing": 6,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 12,
          "unit": "fl oz",
          "label": "12 oz carton"
        }
      }
    ],
    "steps": [
      {
        "id": "mix",
        "title": "Mix",
        "detail": "Combine berries, protein, and coconut water.",
        "durationMin": 2,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "freeze",
        "title": "Freeze",
        "detail": "Freeze pint for 24 hours.",
        "durationMin": 0,
        "durationScaling": 0,
        "active": false,
        "appliance": null,
        "dependsOn": [
          "mix"
        ]
      },
      {
        "id": "spin",
        "title": "Spin",
        "detail": "Process in Creami on Sorbet mode.",
        "durationMin": 3,
        "durationScaling": 1,
        "active": true,
        "appliance": "creami",
        "dependsOn": [
          "freeze"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Scoop and serve.",
        "durationMin": 1,
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
      "freezerMonths": 3,
      "reheat": "Respin if fully frozen."
    },
    "notes": [
      "Run under hot water for 30 seconds before spinning if frozen too hard."
    ]
  },
  {
    "id": "cinnamon-apple-baked-oats",
    "schemaVersion": 2,
    "name": "Cinnamon Apple Baked Oats",
    "tagline": "Like a warm apple pie for meal prep.",
    "description": "Baked oatmeal portioned out for the week. Protein powder is baked right into the oats to make this dessert perfectly balanced.",
    "category": "dessert",
    "cuisine": "american",
    "tags": [
      "american",
      "dessert",
      "high fiber"
    ],
    "spiceLevel": 0,
    "rating": 4.8,
    "ratingCount": 2100,
    "baseServings": 4,
    "maxServings": 12,
    "container": "Bentgo 1-compartment (black)",
    "containerPlural": "Bentgo boxes",
    "servingsPerContainer": 1,
    "image": {
      "url": "images/cinnamon-apple-baked-oats.webp",
      "alt": "Baked apple oats on a white plate"
    },
    "imagePrompt": "see IMAGE PROMPTS below",
    "source": {
      "name": "Skinnytaste",
      "url": "https://www.skinnytaste.com/cinnamon-apple-baked-oatmeal/",
      "author": "Gina Homolka"
    },
    "nutritionPerServing": {
      "calories": 308,
      "protein": 22,
      "carbs": 46,
      "fat": 4,
      "fiber": 6,
      "sodium": 240
    },
    "appliances": [
      "oven"
    ],
    "ingredients": [
      {
        "id": "oats",
        "name": "Rolled oats",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "cup",
        "prep": "dry",
        "package": null,
        "pantry": true
      },
      {
        "id": "protein",
        "name": "Vanilla whey protein powder",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "scoop",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "apple",
        "name": "Honeycrisp apple",
        "singular": "apple",
        "group": "Produce",
        "qtyPerServing": 0.5,
        "unit": "each",
        "prep": "diced",
        "package": {
          "size": 2,
          "unit": "each",
          "label": "2 apples"
        }
      },
      {
        "id": "cinnamon",
        "name": "Ground cinnamon",
        "group": "Pantry",
        "qtyPerServing": 0.5,
        "unit": "tsp",
        "prep": "",
        "package": null,
        "pantry": true
      },
      {
        "id": "almond-milk",
        "name": "Unsweetened almond milk",
        "group": "Dairy",
        "qtyPerServing": 4,
        "unit": "fl oz",
        "prep": "",
        "package": {
          "size": 16,
          "unit": "fl oz",
          "label": "16 oz carton"
        }
      }
    ],
    "steps": [
      {
        "id": "preheat",
        "title": "Preheat",
        "detail": "Preheat oven to 375F.",
        "durationMin": 10,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": []
      },
      {
        "id": "mix",
        "title": "Mix",
        "detail": "Mix all ingredients in a large bowl.",
        "durationMin": 5,
        "durationScaling": 0.2,
        "active": true,
        "appliance": null,
        "dependsOn": []
      },
      {
        "id": "bake",
        "title": "Bake",
        "detail": "Pour into a baking dish and bake until set.",
        "durationMin": 25,
        "durationScaling": 0,
        "active": false,
        "appliance": "oven",
        "dependsOn": [
          "preheat",
          "mix"
        ]
      },
      {
        "id": "portion",
        "title": "Portion",
        "detail": "Slice and place into boxes.",
        "durationMin": 5,
        "durationScaling": 1,
        "active": true,
        "appliance": null,
        "dependsOn": [
          "bake"
        ]
      }
    ],
    "storage": {
      "fridgeDays": 5,
      "freezerMonths": 2,
      "reheat": "Microwave 1 minute."
    },
    "notes": [
      "Toss the apples in a little extra cinnamon before mixing into the batter."
    ]
  }
]
});
