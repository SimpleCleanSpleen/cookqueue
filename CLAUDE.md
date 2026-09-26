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

## Roadmap
- Now: grow the menu with Gemini-written batches of 25 (placeholder ratings for now).
- Later: move to Firebase (Auth + Firestore) so friends and family can submit recipes, rate and review. A guest "request a meal" QR code may come after that. Don't deploy to Firebase until the owner says so.
