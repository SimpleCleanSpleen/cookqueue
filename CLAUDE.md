# CookQueue: notes for Claude

A meal-prep recipe site that looks like a delivery app. You browse a menu of recipes, pick a batch size, add it to a Prep Plan (the cart), and get one combined shopping list. It's for the owner (Jeremy) and friends and family, and it must cost $0. The site is static HTML/CSS/vanilla JS with no build step, hosted on GitHub Pages from `main` (`https://cookqueue.fyi/`, custom domain bought at Porkbun; the old `simplecleanspleen.github.io/cookqueue/` still redirects). README.md has the architecture, recipe schema and Firestore schema, so read it when you need details.

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
- **Live:** menu browsing with search, filters and sort; the zero-waste batch scaler; the Gantt cooking timeline (1–3 cooks, appliance limits); macro badges; the Prep Plan with its shopping list (saved in `localStorage` under `cookqueue.plan.v1`); no in-app recipe generation (the old mock "Generate a recipe" modal was removed Sept 27 — CookQueue never makes recipes itself). 27 recipes ship with the site, all with photos: 2 starters in `js/data/mock-recipes.js` + 25 in `js/data/batch-01.js`. Mobile has no sideways scrolling at 360–430 px (quick-filter pills wrap).
- **Firebase is on (Sept 26).** `CookQueue.FIREBASE.config` in `js/firebase-config.js` has the `cookqueue` project's real config, and the owner published `firestore.rules` in the console. The live site now shows a Sign in button. This unlocks, on the free Spark plan:
  - Google sign-in with unique usernames (3–20 letters, numbers or `_`, case-insensitive, changeable). Recipes store only `ownerUid`, and the Google name and email are never shown.
  - Community recipes: the Add, Edit and My Recipes pages, which can also take pasted Gemini JSON.
  - Barcode scanning. Barcodes are GTINs, with UPC-A padded to 13 digits. Lookup checks the Firestore `products` catalog first, then Open Food Facts. An unknown barcode is added to the catalog on publish, and the first entry wins.
- **Ratings & reviews (Sept 27):** 1–5 stars + optional comment, one per user per recipe at `recipes/{id}/reviews/{uid}`, owners may rate their own. Loaded once per visit with a collection-group query (fine at friends-and-family scale; switch to stored averages if it ever gets to thousands). Placeholder `rating`/`ratingCount` in the data files are ignored.
- **Site recipes belong to jeremy5 (Sept 27):** everything in `js/data/*.js` is credited to `SITE_OWNER_USERNAME` (`js/config.js`). Signed in as jeremy5: Edit (photo too) creates a Firestore copy under the same id that replaces the file version; Delete writes `hidden_recipes/{id}`. `firestore.rules` hard-codes the username and the 27 site ids (`siteRecipeId()`); `tests/rules.test.mjs` fails if they drift from the data. These are the only non-user-submitted recipes the site will ever have, so don't add more `js/data` batches without asking. The owner must keep the username jeremy5: if he renamed, someone else could claim "jeremy5" and gain these powers.
- **Domain:** `cookqueue.fyi` (Porkbun). DNS, GitHub verification, Enforce HTTPS and Firebase authorized domains are all done (confirmed Sept 26).
- **Recipe batches:** Batch 01 (25 recipes from Gemini) is in `js/data/batch-01.js`; the 2 remaining starters are in `js/data/mock-recipes.js`. The owner deleted the other 3 starters (no photos) on Sept 27. Every shipped recipe has a real photo in `images/`.
- **Recipe Helper (Sept 26):** "Add a recipe" has two tabs. Both tabs are just a **Copy AI Prompt** button + chat links (`js/lib/prompt-builder.js`): the prompt makes the person's own free AI chat interview them one question at a time, convert units on the fly (metric or imperial, switching on request; final JSON always uses the site's units), check every rule, and output JSON. CookQueue never calls an AI itself. **One recipe**: paste into the editor's "Have it as JSON?" box. **Several at once**: paste back a JSON array (`js/ui/recipe-helper.js`) — recipes that pass validation publish immediately with a green check, recipes that fail land in a review queue with a red ✕, a "Copy Fix Prompt" button, and a "Edit manually" option that opens the normal editor inline. A "Copy Fix Prompt" button also appears on the normal rule-check panel any time it fails (single or edit mode), not just in the batch queue. Every recipe still goes through the same `RecipeEditor.normalize()` + `RecipeService.validate()` + `RecipeService.save()` pipeline as manual entry — no new trust boundary. Failed parses/validations are logged to the write-only `failed_recipe_imports` Firestore collection (`Cloud.logFailedImport()`) for debugging; nobody can read it from the app, only the owner via the Firebase console. Give that collection a TTL policy on `createdAt` in the console (`docs/firebase-setup.md`) if it grows large; optional, not required.

## Claude's queue (do each once the owner clears its blocker)
1. The Sept 27 rules (reviews, site ownership, hidden_recipes) must be pasted into the Firebase console by the owner; until then reviews and editing site recipes fail on the live site with permission errors. Confirm with the owner.
2. New recipes come from users through the site (Recipe Helper). If the owner ever does add a `js/data` batch, the ids must also go into `siteRecipeId()` in `firestore.rules`.

## Goals
- **Now:** Firebase and batch 01's photos are both live. Grow the menu through users submitting recipes, and watch how Recipe Helper gets used (check `failed_recipe_imports` occasionally for patterns worth fixing in the prompt or the rules).
- **Next:** whatever the owner asks for. Guests can browse everything; writing anything (recipes, reviews) needs sign-in plus a username, enforced in `firestore.rules`, not only the UI.
- **Later / undecided:** a guest "request a meal" QR code; Instacart shopping links (researched only: free dev key, ~30–40 day review, needs a free Cloudflare Worker); a Python script that uses the Gemini Batch API for images (~$0.45 per 25, so ask first; the owner currently makes images free in the Gemini app).
