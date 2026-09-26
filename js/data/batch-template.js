/**
 * CookQueue — template for adding a batch of recipes (e.g. from Gemini).
 *
 * How to add a batch:
 *  1. Copy this file to js/data/batch-01.js (then batch-02.js, ...).
 *  2. Paste each of Gemini's replies (a JSON array of 5 recipes) where marked
 *     below, with a comma between replies. Nested arrays are fine.
 *     The app flattens them.
 *  3. Add a script tag for it in index.html, right after mock-recipes.js:
 *       <script src="js/data/batch-01.js"></script>
 *  4. Open the site. Recipes that break a CookQueue rule are hidden, a banner
 *     on the home page tells you how many, and the browser console
 *     (F12 → Console) lists each one with the exact rule it broke.
 *  5. Save images as images/<recipe-id>.webp (.png or .jpg also work). Until an image exists, the
 *     site shows a placeholder automatically.
 *
 * The prompt that produces this format lives in docs/gemini-recipe-prompt.md.
 * This file is a template and isn't loaded by index.html.
 */
window.CookQueue = window.CookQueue || {};
CookQueue.RECIPE_BATCHES = CookQueue.RECIPE_BATCHES || [];

CookQueue.RECIPE_BATCHES.push({
  name: 'Batch 01 (Gemini)',
  recipes: [
    // Reply 1: paste Gemini's [ ... ] array here, then add a comma
    // Reply 2: paste the next [ ... ] array here, then add a comma
    // ...and so on for replies 3–5
  ]
});
