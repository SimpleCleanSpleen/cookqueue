# PrepDash: notes for Claude

Delivery-app-style meal-prep recipe site. Static HTML/CSS/vanilla JS with no build step, hosted on GitHub Pages. README.md has the architecture, recipe schema and plans. Read it first.

## Rules that must hold for every recipe
All of these are enforced in `js/config.js` (`RULES`) and `RecipeService.validate()`. Keep them in sync with `docs/gemini-recipe-prompt.md`:
- Calories per serving: main 600–1200, dessert 200–700, snack 100–400 (the badge color scale is per category).
- Sodium ≤ 580 mg per serving (¼ tsp salt). Fat ≤ 30% of kcal. High protein preferred.
- ≤ 10 ingredients per recipe, pantry staples included.
- Active work ≤ 45 min at base servings.
- Appliances: oven, stovetop, Instant Pot Duo Plus, Bella Pro Series 8 QT Air Fryer, Panasonic Microwave. Ninja Creami Deluxe for desserts only. Freezer allowed as storage.
- One image per recipe (the dish on a white paper plate) at `images/<id>.webp|png|jpg`, with a placeholder fallback.

## Working conventions
- No Node on the owner's machine. Test with `python3 -m http.server 8000`. Scripts should be Python.
- Recipes load from batch files (`js/data/*.js` pushing onto `PrepDash.RECIPE_BATCHES`). The UI reads data only through `RecipeService`.
- Cost matters: prefer free tiers. Don't add servers or paid services without asking.

## Decisions so far (from the original build session, Sept 2026)
- **Hosting:** GitHub Pages from `main` (public repo, free). Every merge to `main` updates https://simplecleanspleen.github.io/prepdash/ within a minute or two. Work on a branch and open a PR. The owner merges.
- **Firebase later, not now:** a separate Firebase project (not the owner's game project) using Auth + Firestore on the free Spark plan. Cloud Storage and Cloud Functions need the Blaze plan, so keep recipe images in `images/` in the repo.
- **Recipe data:** Gemini writes batches of 25 (5 per reply) using `docs/gemini-recipe-prompt.md`, and each batch is pasted into a copy of `js/data/batch-template.js`. Gemini is asked to adapt real web recipes and cite them in `source`. Spot-check those links, because they may be invented.
- **Images:** one per recipe (the dish on a white paper plate, which was chosen over the Bentgo shot). The owner generates them free in the Gemini app. The Gemini *API* has no free tier for images; its Batch API costs about $0.42–0.49 per 25. A script to automate that is an open offer.
- **Ratings/reviews:** placeholders for now. Real ones arrive with Firebase logins.
- **Dessert servings:** a Ninja Creami Deluxe pint = 2 servings (`servingsPerContainer: 2`).
- **Validation:** recipes that break a rule are hidden (not shown with warnings). A banner on the home page names them, and the console lists the reasons.

## Open ideas the owner hasn't decided on yet
- Python script to call the Gemini Batch API for images.
- Moving recipes to `data/recipes.json`, which needs `fetch()` and therefore a local server for testing.
- An "Add recipe" form backed by Firestore, when Firebase arrives.

## Roadmap
- Now: grow the menu with Gemini-written batches of 25 (placeholder ratings for now).
- Later: move to Firebase (Auth + Firestore) so friends and family can submit recipes, rate and review. A guest "request a meal" QR code may come after that. Don't deploy to Firebase until the owner says so.
