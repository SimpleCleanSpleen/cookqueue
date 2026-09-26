# CookQueue: notes for Claude

Delivery-app-style meal-prep recipe site. Static HTML/CSS/vanilla JS with no build step, hosted on GitHub Pages. README.md has the architecture, recipe schema and plans. Read it first.

## Rules that must hold for every recipe
All of these are enforced in `js/config.js` (`RULES`) and `RecipeService.validate()`. Keep them in sync with `docs/gemini-recipe-prompt.md`:
- Calories per serving: main 600–1200, dessert 200–700, snack 100–400 (the badge color scale is per category).
- Sodium ≤ 580 mg per serving (¼ tsp salt). Fat ≤ 30% of kcal. High protein preferred.
- ≤ 10 ingredients per recipe, pantry staples included.
- Active work ≤ 45 min at base servings.
- Appliances: oven, stovetop, Instant Pot Duo Plus, Bella Pro Series 8 QT Air Fryer, Panasonic Microwave. Ninja Creami Deluxe for desserts only. Freezer allowed as storage.
- One image per recipe (the dish on a white paper plate) at `images/<id>.webp|png|jpg`, with a placeholder fallback. Community recipes store a shrunk photo as a `data:` URL instead.
- Community recipes (Firestore) go through the same `RecipeService.validate()` before saving and when loading.

## Working conventions
- No Node on the owner's machine. Test with `python3 -m http.server 8000`. Scripts should be Python.
- Recipes load from batch files (`js/data/*.js` pushing onto `CookQueue.RECIPE_BATCHES`) plus Firestore community recipes. The UI reads data only through `RecipeService`. Only `js/services/cloud-service.js` talks to Firebase.
- Firebase is switched off while `CookQueue.FIREBASE.config` in `js/firebase-config.js` is null. Test with the emulators (`tests/README.md`, `?emulator` in the URL). Node is fine for these dev-only tests in cloud sessions; the owner never needs it.
- `firestore.rules` is the real security boundary. If you change it, update `tests/rules.test.mjs`, run it, and tell the owner to re-publish the rules in the Firebase console (they paste it; there's no deploy key).
- Cost matters: prefer free tiers. Don't add servers or paid services without asking.

## Decisions so far (from the original build session, Sept 2026)
- **Renamed PrepDash → CookQueue (Sept 26, 2026):** the app, the GitHub repo, and everything in it. Code, docs and UI text all say CookQueue now. **The GitHub repo itself is still named `prepdash`** — only the owner can rename it (Settings → repository name → `cookqueue`), and the live site stays at `.../prepdash/` until they do. Once renamed, GitHub auto-redirects the old URL for a while, but update any saved links, and re-check the Firebase Authorized domains list (`docs/firebase-setup.md`) if Firebase is set up by then, since the domain doesn't change (`simplecleanspleen.github.io`) but the path does. `localStorage`'s key also changed (`prepdash.plan.v1` → `cookqueue.plan.v1`), so anyone who used the old site loses their saved Prep Plan — acceptable for a friends-and-family site this early.
- **Hosting:** GitHub Pages from `main` (public repo, free). Every merge to `main` updates the live site within a minute or two. Work on a branch and open a PR.
- **Merging (Sept 26, 2026):** the owner allows Claude to merge PRs, as long as earlier versions stay restorable. Use a regular merge commit (never squash, rebase or force-push `main`), and before each merge save the current `main` as a branch `backup/before-<feature>` (GitHub MCP `create_branch`; cloud sessions can't push tags) as a rollback point. Rolling back = GitHub's "Revert" button on the PR, or `git revert -m 1 <merge>`.
- **Firebase (started Sept 26, 2026):** a separate Firebase project (not the owner's game project) using Auth (Google sign-in) + Firestore on the free Spark plan. No billing account, so it can't cost money. Cloud Storage and Cloud Functions need Blaze, so batch-recipe images stay in `images/` and community photos go inside the Firestore doc. The owner does the console steps in `docs/firebase-setup.md` and pastes the web config (not a secret) and the rules.
- **Recipe data:** Gemini writes batches of 25 (5 per reply) using `docs/gemini-recipe-prompt.md`, and each batch is pasted into a copy of `js/data/batch-template.js`. Gemini is asked to adapt real web recipes and cite them in `source`. Spot-check those links, because they may be invented.
- **Images:** one per recipe (the dish on a white paper plate, which was chosen over the Bentgo shot). The owner generates them free in the Gemini app. The Gemini *API* has no free tier for images; its Batch API costs about $0.42–0.49 per 25. A script to automate that is an open offer.
- **Ratings/reviews:** placeholders for batch recipes. Community recipes show "New". Real reviews come later.
- **Usernames:** unique, case-insensitive, 3–20 letters/numbers/underscores, changeable. Recipes store `ownerUid` only, and the name is looked up at load time. Google name/email is never shown publicly.
- **Barcodes (Sept 26, 2026):** ingredients may carry a `barcode` (normalized GTIN: UPC-A padded to 13 digits). Lookup order: Firestore `products` catalog, then Open Food Facts (free, CORS OK, no key). Unknown barcodes are added to the catalog on publish, first entry wins. Gemini must not invent barcodes.
- **Instacart:** discussed only. No-commission links are possible through the Instacart Developer Platform (needs a free dev key, a ~30–40 day production review, and a free server such as a Cloudflare Worker to hide the key; line items can carry UPCs). Nothing built yet.
- **Budget:** the owner wants to spend $0. Only free tiers, and tell them if anything would cost money. Claude can't see their Claude usage or credit balance.
- **Dessert servings:** a Ninja Creami Deluxe pint = 2 servings (`servingsPerContainer: 2`).
- **Validation:** recipes that break a rule are hidden (not shown with warnings). A banner on the home page names them, and the console lists the reasons.

## Open ideas the owner hasn't decided on yet
- Python script to call the Gemini Batch API for images.
- Moving recipes to `data/recipes.json`, which needs `fetch()` and therefore a local server for testing.
- A service-account key so Claude can publish Firestore rules itself (offered, not wanted yet).

## Roadmap
- Now: switch on Firebase (owner is creating the project), then friends and family can submit recipes. Keep growing the menu with Gemini batches.
- Next: ratings and reviews for signed-in users. A guest "request a meal" QR code may come after that. Don't use Firebase Hosting or paid features unless the owner says so.
