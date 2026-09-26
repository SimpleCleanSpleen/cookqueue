# CookQueue (Meal Prep Generator)

**▶ Live site: https://cookqueue.fyi/**

## Core Concept
A delivery-app-style UI for generating optimized, zero-waste meal prep recipes tailored to strict dietary needs.

You browse a "menu," open a recipe the way you'd open a restaurant page, pick your batch size in an order-style panel, and add it to your **Prep Plan** (the cart). CookQueue then gives you a combined shopping list for the week.

## Unique Features
- **Optimal Batch Scaler:** Eliminates ingredient waste by calculating perfect serving multiples.
- **Dynamic Gantt Timeline:** Replaces standard instructions with a parallel workflow timeline adjustable by the number of cooks.
- **Dynamic Calorie/Macro Badges:** Visual color-shifting UI based on nutritional density.

### Menu (mock data)
| Recipe | Category | kcal | Protein | Hands-on | Zero-waste batches |
|---|---|---|---|---|---|
| Chipotle-Lime Chicken Burrito Bowls | main | 839 | 82 g | 39 min | 8, 16 |
| Orange-Ginger Air Fryer Chicken & Broccoli | main | 753 | 63 g | 43 min | 8 |
| Smoky Harissa-Spiced Lentil & Chickpea Bowls (vegan) | main | 674 | 45 g | 33 min | 4, 8, 12 |
| Turkey & Veggie Egg White Bites | snack | 150 | 28 g | 25 min | 8, 16 |
| Mexican Hot Chocolate Protein Creami | dessert | 347 | 40 g | 31 min | 8, 16 (2 servings per pint) |

### Community recipes (sign in with Google)
Once Firebase is switched on (see [docs/firebase-setup.md](docs/firebase-setup.md)), anyone can sign in with Google, pick a username and publish their own recipes:
- **➕ Add your recipe:** a form for every part of a recipe (ingredients, packages, steps and what each step waits on), with an optional photo and a box to paste Gemini JSON. A live **rule check** has to be all green before **Publish** works. Whenever that check fails, a **🤖 Copy Fix Prompt** button copies the errors plus your recipe's JSON so you can hand it to any AI chat for a fix.
- **Recipe Helper:** two tabs on the Add page for going from an idea to valid JSON without writing it by hand. **One recipe** asks 3 quick questions and builds a copy-paste prompt for a free AI chat (ChatGPT, Gemini, Claude — CookQueue never calls one itself). **Several at once** takes a messy ramble about a few recipes, builds a prompt asking the AI to interview you until it has enough, then lets you paste back a JSON array: recipes that pass publish immediately, recipes that fail land in a review queue you can fix with another AI round-trip or by editing manually.
- **Shared by @username** on each community recipe. Only the owner sees ✏️ Edit and 🗑 Delete, and the Firestore security rules enforce that on the server as well.
- **My recipes** (account menu, top right) lists everything you've shared, including any that are hidden because they break a rule.
- A **Community** category on the home page. Community recipes show "New" until real ratings arrive.

- **Barcodes:** each ingredient can have a UPC/EAN. Scan it with the phone camera, pick a photo of it, or type the digits. CookQueue checks its own shared catalog (Firestore `products`), then [Open Food Facts](https://world.openfoodfacts.org) (free, open data), and fills in the product name, aisle and package size in oz / fl oz. Barcodes nobody has seen before are saved to the catalog when you publish, so the next person who scans them gets the same name and size. Browsers without a built-in barcode reader (iPhone Safari, Firefox) load a free open-source one (zxing-wasm) the first time someone scans.

Until Firebase is configured, none of this appears and the site works exactly as before.

### Also included
- **Rule validator:** Every recipe is checked against the dietary, appliance and effort rules. The recipe page shows "✓ Meets all CookQueue rules" with the full checklist.
- **Prep Plan (cart):** Add several recipes and get one combined shopping list, with packages summed across recipes and open containers flagged. It's saved in `localStorage`.
- **Generator modal:** A "✨ Generate a recipe" form (meal type, cuisine, diet, spice, appliance, max hands-on time). It currently picks the best mock match. This is where AI generation plugs in.
- **Store-front browsing:** Category rail, quick filters, sort and search (by name, tag or ingredient).
- **Responsive:** Works from phones to desktop. On narrow screens the time and nutrition badges move above the images but stay in opposite corners.

---

## Running it

It's a static site: no build step and no dependencies.

```bash
# Option 1: just open it
xdg-open index.html            # or double-click index.html

# Option 2: serve locally (closer to how it'll run when hosted)
python3 -m http.server 8080    # then visit http://localhost:8080
```

**Hosting:** Upload the folder as-is to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel, S3). Routing uses the URL hash (`#/recipe/<id>`), so no server rewrite rules are needed and recipe links can be shared directly.

---

## Project structure

```
index.html                    Entry point: top bar, <main id="app">, drawer, modal root, script tags
css/styles.css                All styling (design tokens in :root, responsive rules at the bottom)
js/
  config.js                   Business rules, approved appliances, color scales, categories
  firebase-config.js          Firebase web config (null = sign-in and community recipes switched off)
  data/mock-recipes.js        Starter menu (5 hand-written recipes) as a "batch"
  data/batch-template.js      Copy this to add a batch of recipes (e.g. from Gemini)
images/                       Recipe photos, named <recipe-id>.webp
docs/gemini-recipe-prompt.md  The prompt that makes Gemini write recipes in CookQueue format
docs/firebase-setup.md        Step-by-step: create the Firebase project, turn on Google sign-in, publish rules
firestore.rules               Firestore security rules (who can read/write what); paste into the console
firebase.json                 Emulator ports for local testing
tests/                        Dev-only Node tests: security rules + end-to-end, against the Firebase emulators
  lib/utils.js                Formatting (fractions, units, minutes), escaping
  lib/nutrition.js            Calorie → color interpolation, macro math
  lib/scaler.js               Optimal-batch / zero-waste calculator
  lib/scheduler.js            Parallel-workflow scheduler (critical-path list scheduling)
  lib/barcode.js              UPC/EAN normalizing + camera/photo scanning (native BarcodeDetector or zxing-wasm)
  services/cloud-service.js   Firebase Auth + Firestore (sign-in, usernames, community recipe CRUD, barcode catalog)
  services/product-service.js Barcode → product lookup (CookQueue catalog, then Open Food Facts)
  services/recipe-service.js  Data access layer: list(), get(), save(), remove(), generate(), validate()
  ui/components.js            Presentational HTML builders (cards, badges, chips)
  ui/timeline.js              Gantt renderer + step list
  ui/barcode-picker.js        "Add a barcode" dialog (camera, photo, or typed digits)
  ui/recipe-editor.js         Add / edit recipe form with live rule check
  app.js                      Router, state, page rendering, event handling
```

Scripts are plain, ordered `<script>` tags that share a `window.CookQueue` namespace, so the app also works when opened from `file://`. ES modules would need a server. Load order: config → data → libs → service → UI → app. The Firebase SDK is loaded from gstatic.com by `cloud-service.js` only when a config is set, and sign-in needs `http(s)://` (use `python3 -m http.server`, not `file://`).

### Data flow

```
RecipeService.list()/get()/generate()   ← the ONLY place that knows where recipes come from
          │
          ▼
app.js state ──► scaler.recommend()      → Your batch panel + ingredient package meters
          │ ──► scheduler.schedule()     → Gantt, step list, Active/Total time badge
          │ ──► nutrition.calorieColor() → calorie badge, card pills
          ▼
ui/components.js + ui/timeline.js → HTML strings → #app
```

---

## The rules (enforced by `RecipeService.validate`)

All limits are in `js/config.js → RULES`, so you can change them in one place.

| Rule | Value | Notes |
|---|---|---|
| Calories per serving: **main** | 600 – 1,200 kcal | Color scale: green at 500 → dark red at 1,200 |
| Calories per serving: **dessert** | 200 – 700 kcal | Color scale: 200 → 700 |
| Calories per serving: **snack** | 100 – 400 kcal | Color scale: 100 → 400 |
| Low fat | ≤ 30% of calories from fat | |
| Low salt | ≤ **580 mg** sodium per serving | ¼ tsp table salt ≈ 581 mg sodium (1 tsp ≈ 2,325 mg, USDA), rounded to the nearest 10 mg. Mock recipes are 100–340 mg |
| Ingredient limit | ≤ **10** per recipe | Pantry staples count toward the limit, even though they're ignored by the zero-waste math |
| High protein | ≥ 40 g, or ≥ 30% of calories from protein | The percentage option keeps it fair for snacks and desserts |
| Active work time | ≤ 45 min at base servings | Passive time (simmering, pressure cooking, freezing) doesn't count |
| Appliances | Oven, Stovetop, Instant Pot Duo Plus, Bella Pro Series 8 QT Air Fryer, Panasonic Microwave | The freezer is allowed as storage |
| Ninja Creami Deluxe | **Desserts only** | Flagged as `dessertOnly` and validated |

Failures are logged to the console (`[CookQueue] "<name>" fails validation`) and shown on the recipe page.

---

## Feature details

### Calorie & macro badges
- `nutrition.calorieColor(kcal, category)` interpolates between the color stops in `config.CALORIE_STOPS` across that category's `scale` (`config.RULES.calories`). For mains that's **green at 500 kcal → yellow → orange → red → dark red at 1,200 kcal**. Desserts (200 → 700) and snacks (100 → 400) are colored against their own range. Text switches between dark and light based on luminance so it stays readable.
- On page load the number counts up from 500, and the background color moves along the scale with it (skipped when the user prefers reduced motion).
- A small gradient bar under the number shows where the recipe sits on the scale.
- Macros each have one fixed color (`config.MACRO_COLORS`): **Protein #2F6BFF**, **Carbs #FF9F0A**, **Fat #E6007E**.
- Layout: nutrition sits in the **top-right**. Active Work Time and Total Time sit in the **top-left**.

### Optimal Batch Scaler (`lib/scaler.js`)
- Each packaged, perishable ingredient states its use **per serving** and its **package size** in the same unit. For example, 6 oz of broccoli per serving from a 16 oz bag.
- For a serving count *n*, the ingredient uses `n × qtyPerServing / package.size` packages. An **optimal batch** is any *n* (1…`maxServings`) where that number is a whole number for **every** tracked ingredient, so no containers are left open.
  - Orange-Ginger Chicken: broccoli 6/16 = 3/8 bag per serving → only multiples of **8** use whole bags.
- Pantry staples (`pantry: true`, `package: null`) such as spices, oils, rice and dry lentils are excluded because they keep.
- If a recipe has no perfect batch, the scaler falls back to the sizes with the **fewest** open containers.
- The UI shows a +/− stepper, optimal-batch chips, a warning listing which containers would be left open, and a one-click "Switch to N servings" to the nearest optimal size. Each ingredient row has a package meter (filled cells = packages used).

### Parallel Gantt timeline (`lib/scheduler.js`, `ui/timeline.js`)
- Each step declares `durationMin`, `active` (hands-on) vs. passive, an optional `appliance`, and `dependsOn`.
- **Scheduling:** critical-path list scheduling with gap filling.
  1. Rank steps by the longest remaining path to the end of the recipe.
  2. Place the highest-ranked ready step at the earliest time when its dependencies are done, a **cook** is free (active steps only), and a unit of its **appliance** is free.
- Appliance capacity (`config.APPLIANCES[*].capacity`) models real limits: 4 burners, 2 oven racks, 1 Instant Pot, 1 air fryer basket, and so on.
- **Cooks (1–3):** active tasks go to whichever cook can start soonest. **Clicking a bar** hands the task to the next cook, and the numbered buttons in the step list assign it directly. Manually assigned tasks show 📌. "↺ Auto-assign" clears manual assignments.
- **Totals:** the estimated total (makespan), hands-on minutes, time saved vs. one cook, and each cook's workload are recalculated on every change. They also feed the top-left **Total Time** badge.
- **Batch scaling:** `durationScaling` (0–1) is the share of a step's time that grows with batch size. Chopping scales and simmering doesn't. If a larger batch pushes hands-on time past 45 minutes, a warning suggests adding a cook.
- **Long waits** with no hands-on work (such as the Creami's 24-hour freeze) are compressed on the chart and marked `⏸ 24 hr`, so short steps stay readable.
- Hovering a bar highlights its step in the list below, and the reverse.

---

## Recipe schema

Recipes are **pure JSON**: no functions and no computed fields. A generator only has to produce this shape.

```jsonc
{
  "id": "kebab-case-unique-id",
  "schemaVersion": 1,
  "name": "Orange-Ginger Air Fryer Chicken & Broccoli",
  "tagline": "Short one-liner for cards",
  "description": "Paragraph for the recipe page",
  "category": "main" | "dessert" | "snack",  // picks the calorie range; Creami only allowed for "dessert"
  "cuisine": "asian",
  "tags": ["asian", "dairy free", "high protein"],   // lowercase; drives chips + categories
  "spiceLevel": 0-5,                          // 0 = mild, rendered as 🌶️ ×5 scale
  "rating": 4.9, "ratingCount": 2087,
  "baseServings": 4,                          // servings that step durations are written for
  "maxServings": 12,                          // scaler upper bound (appliance capacity)
  "container": "Bentgo 1-compartment (black)",
  "containerPlural": "Bentgo boxes",          // label for the batch-totals count
  "servingsPerContainer": 1,                  // e.g. 2 for a Creami pint shared by two
  "image": { "url": "images/<id>.webp", "alt": "…served on a white paper plate" },  // one photo per recipe
  "imagePrompt": "Prompt used to generate the photo (optional)",
  "source": { "name": "Site name", "url": "https://…", "author": "…" },  // or null. Shown as "Adapted from…"
  "nutritionPerServing": { "calories": 897, "protein": 73, "carbs": 122, "fat": 13, "fiber": 11, "sodium": 350 },
  "appliances": ["airFryer", "instantPot", "stovetop", "microwave"],   // keys of config.APPLIANCES
  "ingredients": [
    {
      "id": "broccoli",
      "name": "Frozen broccoli florets",
      "singular": "…",                        // optional, for unit "each" when qty ≤ 1
      "group": "Protein|Dairy|Canned|Frozen|Produce|Pantry",
      "qtyPerServing": 6, "unit": "oz",       // oz, fl oz, cup, tbsp, tsp, can, box, bunch, each, scoop
      "prep": "thawed",
      "package": { "size": 16, "unit": "oz", "label": "16 oz bag" },  // unit MUST equal ingredient unit
      "barcode": "0071430010100"              // optional UPC/EAN (8 or 13 digits, UPC-A padded to 13)
    },
    { "id": "rice", "name": "Jasmine rice", "group": "Pantry", "qtyPerServing": 0.5, "unit": "cup",
      "prep": "", "package": null, "pantry": true }                 // ignored by zero-waste math
  ],
  "steps": [
    {
      "id": "air-fry",
      "title": "Air-fry chicken in batches",
      "detail": "Full instruction text…",
      "durationMin": 24,                      // at baseServings
      "durationScaling": 0.9,                 // 0 = fixed time, 1 = fully proportional to servings
      "active": false,                        // false = hands-off (doesn't occupy a cook)
      "appliance": "airFryer",                // or null
      "dependsOn": ["coat"]                   // step ids that must finish first
    }
  ],
  "storage": { "fridgeDays": 4, "freezerMonths": 2, "reheat": "…" },
  "notes": ["…"]
}
```

**Images:** each recipe has one photo of the dish on a white paper plate, saved as `images/<id>.webp` (`.png`, `.jpg` and `.jpeg` are tried too, so no conversion is needed). If the file is missing or fails to load, the site automatically shows a placehold.co placeholder with the recipe name (`util.placeholderImage`).

**Validation extras for AI-written data:** macros must add up to the calories (±10%), step ids must be unique with no circular `dependsOn`, recipe ids must be unique across all batches, and `source` (if present) needs a name and an http(s) URL. Recipes that fail any check are hidden, listed in a banner on the home page, and logged to the console.

---

## Plugging in live (on-demand) recipe generation

> Optional. The cheapest plan (see **Hosting & cost plan**) generates recipes ahead of time, so GitHub Pages never needs a server. Live generation needs a small backend to hold the API key, such as a Cloudflare Worker (free tier) or a Firebase Cloud Function (needs the pay-as-you-go Blaze plan, but its free quota covers hobby use).

1. Edit **only** `js/services/recipe-service.js`:
   ```js
   async function generate(prefs) {
     const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify(prefs) });
     const recipe = await res.json();
     return { recipe, exact: true };
   }
   ```
2. Have your backend (e.g. an LLM prompt) return the schema above. Include the rules table in the prompt, and consider using JSON-schema / structured output.
3. The app already runs `RecipeService.validate()` on generated recipes and refuses to show one that fails.
4. Keep API keys **on the server**. Never call a model provider directly from this front end.

`list()` and `get()` can move to an API or database the same way.

---

## Adding recipes

**Now: AI batches (Gemini).**
1. Paste `docs/gemini-recipe-prompt.md` into Gemini. It replies with 5 recipes at a time plus image prompts. Say "next" until you have all 25.
2. Copy `js/data/batch-template.js` to `js/data/batch-01.js`, paste each reply where marked, and add its `<script>` tag in `index.html` (there's a commented example).
3. Open the site. Any recipe that breaks a rule is hidden and listed in a banner on the home page.
4. Generate the images from the prompts and save them as `images/<recipe-id>.webp`.

**People add recipes themselves (Firebase).** Signed-in users publish through the **➕ Add your recipe** form, which runs the same `RecipeService.validate()` before saving. `RecipeService.list()` reads the batch files plus the Firestore `recipes` collection, and hides any recipe that fails the rules.

Firestore layout (rules in `firestore.rules`):

| Collection | Doc id | Fields | Who can write |
|---|---|---|---|
| `users` | Firebase uid | `username`, `usernameLower`, `updatedAt` | that user |
| `usernames` | lower-case username | `uid` | the user claiming it (keeps names unique) |
| `recipes` | `<slug>-<5 random chars>` | the recipe schema above (no `id`/`rating`) + `ownerUid`, `createdAt`, `updatedAt` | owner only; owner can't be changed |
| `products` | normalized barcode (GTIN) | `name`, `brand`, `size`, `unit`, `label`, `group`, `source` (`openfoodfacts`/`user`), `createdBy`, `updatedAt` | anyone with a username adds; first entry wins; only its creator can correct it; never deleted |
| `failed_recipe_imports` | auto | `ownerUid`, `createdAt`, `rawInput` (capped), `errors`, `context` | write-only debug log for Recipe Helper; anyone with a username adds one for themselves; nobody can read, edit or delete it from the app |

The author's username is looked up from `users/{ownerUid}` when recipes load, so renaming updates every recipe. Photos are shrunk in the browser (≤ 1000 px, about 260 KB max) and stored in `image.url` as a `data:` URL, because Cloud Storage needs the paid Blaze plan.

## Hosting options (free tiers)

| Option | Free limits | Good for | Watch out for |
|---|---|---|---|
| **Firebase Hosting (recommended)**, as a second site in your game's project or its own project | 10 GB stored, 360 MB/day transfer, custom domains + SSL, multiple sites per project | Everything in one console: hosting + Auth + Firestore for logins, reviews and user-added recipes | Cloud Storage (user photo uploads) and Cloud Functions need the pay-as-you-go **Blaze** plan. A shared project also shares daily quotas and the database with the game |
| **GitHub Pages** | 1 GB site, ~100 GB/month bandwidth | Simplest static hosting; deploys on `git push` | Free only for public repos. Still needs Firebase (or similar) for logins and a database |
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/month | Heaviest traffic for free | Another account to manage; still needs a database for user content |

Firebase Spark plan database/auth limits: Firestore 1 GiB stored, 50K reads / 20K writes per day; Auth 50K monthly active users. That's plenty for two people plus guests.

**Images:** keep recipe photos in the `images/` folder, where they're deployed with the site for free. Hosting uploaded photos from other users is the only part that needs Blaze. Blaze has a free quota and costs nothing at this scale, but it requires a card on file (set a budget alert).

## Customizing

| Want to change… | Edit |
|---|---|
| Diet limits, max active time | `config.RULES` |
| Approved appliances / capacities | `config.APPLIANCES` |
| Calorie color scale | `config.CALORIE_STOPS` |
| Macro or cook colors | `config.MACRO_COLORS`, `config.COOKS` |
| Home categories | `config.CATEGORIES` |
| Quick filters / sorts | `QUICK_FILTERS`, `SORTS` in `app.js` |
| Brand color, fonts, radii | CSS variables in `:root` of `styles.css` |

## Roadmap ideas
- Ratings & reviews for signed-in users (placeholders for now)
- Guest mode: a QR code that opens a "request a meal" page, with requests saved to Firestore for the host to approve
- Real food photography or AI-generated images
- Split appliance runs automatically when a batch exceeds capacity (e.g. two Instant Pot loads)
- "Cook mode": a live playhead on the timeline with per-cook timers
- User accounts to sync the Prep Plan across devices; export the shopping list to grocery apps
- Micronutrient data and allergen tags
