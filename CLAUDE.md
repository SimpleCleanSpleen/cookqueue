# CookQueue: notes for Claude

A meal-prep recipe site that looks like a delivery app. You browse a menu of recipes, pick a batch size, add it to a Prep Plan (the cart), and get one combined shopping list. It's for the owner (Jeremy) and friends and family, and it must cost $0. The site is static HTML/CSS/vanilla JS with no build step, hosted on GitHub Pages from `main` (`https://simplecleanspleen.github.io/cookqueue/`). README.md has the architecture, recipe schema and Firestore schema, so read it when you need details.

## Rules that must hold for every recipe
All of these are enforced in `js/config.js` (`RULES`) and `RecipeService.validate()`. Keep them in sync with `docs/gemini-recipe-prompt.md`:
- Calories per serving: main 600–1200, dessert 200–700, snack 100–400 (the badge colors use a separate scale for each category).
- Sodium ≤ 580 mg per serving. Fat ≤ 30% of kcal. High protein preferred.
- ≤ 10 ingredients, pantry staples included. Active work ≤ 45 min at base servings.
- Appliances: oven, stovetop, Instant Pot Duo Plus, Bella Pro Series 8 QT Air Fryer, Panasonic Microwave. Ninja Creami Deluxe for desserts only (1 pint = 2 servings, `servingsPerContainer: 2`). Freezer allowed as storage.
- One image per recipe (the dish on a white paper plate) at `images/<id>.webp|png|jpg`, with a placeholder fallback. Community recipes store a shrunk photo as a `data:` URL.
- A recipe that breaks a rule is hidden, not shown with warnings. A home-page banner names it and the console lists the reasons. Community recipes are validated both when they're saved and when they load.

## Working conventions
- The owner has no Node. Test with `python3 -m http.server 8000` (`file://` also works while Firebase is off). Write scripts in Python. Node is fine only for the dev tests in `tests/` (see `tests/README.md`, which runs against the Firebase emulators, `?emulator` in the URL).
- Scripts are ordered `<script>` tags sharing `window.CookQueue`: config → data → libs → services → UI → app. The UI reads data only through `RecipeService`, and only `js/services/cloud-service.js` talks to Firebase.
- Recipe batches are `js/data/*.js` files (copies of `batch-template.js`) that push onto `CookQueue.RECIPE_BATCHES`. Gemini writes them using `docs/gemini-recipe-prompt.md` and cites a real recipe in `source`. Spot-check those links, and never let Gemini invent barcodes.
- `firestore.rules` is the real security boundary. If you change it, update and run `tests/rules.test.mjs`, then tell the owner to paste the new rules into the Firebase console (there's no deploy key).
- Budget is $0: free tiers only. Ask before adding any server or paid service, and never use Firebase Hosting, Blaze, Cloud Storage or Functions without the owner's go-ahead.

## Git and merging
Work on a branch and open a PR. The owner lets Claude merge, with these conditions:
1. Before merging, save the current `main` as the branch `backup/before-<feature>` (GitHub MCP `create_branch`; cloud sessions can't push tags).
2. Merge with a regular merge commit. Never squash, rebase or force-push `main`.
3. To roll back, use GitHub's Revert button on the PR, or `git revert -m 1 <merge>`.

## Current state (Sept 26, 2026)
- **Live:** menu browsing with search, filters and sort; the zero-waste batch scaler; the Gantt cooking timeline (1–3 cooks, appliance limits); macro badges; the Prep Plan with its shopping list (saved in `localStorage` under `cookqueue.plan.v1`); a mock "Generate a recipe" modal that picks the best existing recipe. Only the 5 starter recipes in `js/data/mock-recipes.js` exist so far.
- **Built and tested but off:** Firebase stays off while `CookQueue.FIREBASE.config` in `js/firebase-config.js` is `null`. Once the owner turns it on, this unlocks the following on the free Spark plan in a separate project:
  - Google sign-in with unique usernames (3–20 letters, numbers or `_`, case-insensitive, changeable). Recipes store only `ownerUid`, and the Google name and email are never shown.
  - Community recipes: the Add, Edit and My Recipes pages, which can also take pasted Gemini JSON.
  - Barcode scanning. Barcodes are GTINs, with UPC-A padded to 13 digits. Lookup checks the Firestore `products` catalog first, then Open Food Facts. An unknown barcode is added to the catalog on publish, and the first entry wins.
- **Placeholder:** ratings and reviews (community recipes show "New").

## Goals
- **Now:** the owner is setting up Firebase (`docs/firebase-setup.md`) and will paste the web config (not a secret). Grow the menu with batches of 25 from Gemini.
- **Next:** real ratings and reviews for signed-in users.
- **Later / undecided:** a guest "request a meal" QR code; Instacart shopping links (researched only: free dev key, ~30–40 day review, needs a free Cloudflare Worker); a Python script that uses the Gemini Batch API for images (~$0.45 per 25, so ask first; the owner currently makes images free in the Gemini app).
