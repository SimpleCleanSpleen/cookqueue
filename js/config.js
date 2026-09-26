/**
 * PrepDash — global configuration & rule set.
 *
 * Everything that encodes a *business rule* (dietary limits, approved
 * appliances, color scales) lives here so the UI and the validator read
 * from a single source of truth.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.config = {
  /** Hard constraints every recipe (mock or generated) must satisfy. */
  RULES: {
    /**
     * kcal per serving, by recipe `category`. `scale` is the range the calorie
     * badge's color runs across (green at scale[0] → dark red at scale[1]).
     */
    calories: {
      main:    { min: 600, max: 1200, scale: [500, 1200], label: 'Main' },
      dessert: { min: 200, max: 700,  scale: [200, 700],  label: 'Dessert' },
      snack:   { min: 100, max: 400,  scale: [100, 400],  label: 'Snack' },
    },
    maxFatPctOfCalories: 30,             // "low fat"
    // "Low salt" = at most ¼ tsp of table salt per serving.
    // 1 tsp salt ≈ 2,325 mg sodium (USDA) → ¼ tsp ≈ 581 mg → rounded to 580 mg.
    maxSodiumMg: 580,
    maxIngredients: 10,                  // per recipe, pantry staples included
    minProteinPreferred: 40,             // grams; "high protein" status (mains)
    maxActiveMinutes: 45,                // hands-on work at base servings
  },

  /**
   * Approved appliances. `capacity` = how many steps can use it at once
   * (burners, oven racks) and is used by the timeline scheduler.
   * `storage: true` marks non-cooking equipment (freezer) that is always allowed.
   */
  APPLIANCES: {
    oven:       { label: 'Oven',                           short: 'Oven',        capacity: 2 },
    stovetop:   { label: 'Stovetop',                       short: 'Stovetop',    capacity: 4 },
    instantPot: { label: 'Instant Pot Duo Plus',           short: 'Instant Pot', capacity: 1 },
    airFryer:   { label: 'Bella Pro Series 8 QT Air Fryer', short: 'Air Fryer',  capacity: 1 },
    microwave:  { label: 'Panasonic Microwave',            short: 'Microwave',   capacity: 1 },
    creami:     { label: 'Ninja Creami Deluxe',            short: 'Creami',      capacity: 1, dessertOnly: true },
    freezer:    { label: 'Freezer',                        short: 'Freezer',     capacity: Infinity, storage: true },
  },

  /**
   * Calorie badge color stops as positions (0–1) along a category's scale.
   * For mains (500→1200) these land at 500, 700, 850, 1000, 1100, 1200 kcal.
   */
  CALORIE_STOPS: [
    [0,     [31, 170, 89]],   // green
    [0.286, [140, 196, 64]],
    [0.5,   [242, 193, 46]],  // yellow
    [0.714, [242, 113, 28]],  // orange
    [0.857, [214, 40, 40]],   // red
    [1,     [122, 12, 12]],   // dark red
  ],

  /** One vibrant, unique color per macro. */
  MACRO_COLORS: {
    protein: '#2F6BFF',
    carbs:   '#FF9F0A',
    fat:     '#E6007E',
  },

  /** Cook colors for the Gantt timeline (max 3 cooks). */
  COOKS: [
    { name: 'Cook 1', color: '#00A3A3' },
    { name: 'Cook 2', color: '#7B5CFF' },
    { name: 'Cook 3', color: '#FF6B2C' },
  ],

  /** Home-screen category rail. `match` receives a recipe. */
  CATEGORIES: [
    { id: 'all',           label: 'All',          emoji: '🍽️', match: () => true },
    { id: 'community',     label: 'Community',    emoji: '👥', match: r => !!r.community },
    { id: 'mexican',       label: 'Mexican',      emoji: '🌮', match: r => r.tags.includes('mexican') },
    { id: 'asian',         label: 'Asian',        emoji: '🥢', match: r => r.tags.includes('asian') },
    { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒', match: r => r.tags.includes('mediterranean') },
    { id: 'vegan',         label: 'Vegan',        emoji: '🌱', match: r => r.tags.includes('vegan') },
    { id: 'gluten-free',   label: 'Gluten Free',  emoji: '🌾', match: r => r.tags.includes('gluten free') },
    { id: 'high-protein',  label: 'High Protein', emoji: '💪', match: r => r.tags.includes('high protein') },
    { id: 'spicy',         label: 'Spicy',        emoji: '🌶️', match: r => r.spiceLevel >= 2 },
    { id: 'snack',         label: 'Snacks',       emoji: '🥚', match: r => r.category === 'snack' },
    { id: 'dessert',       label: 'Dessert',      emoji: '🍨', match: r => r.category === 'dessert' },
  ],

  STORAGE_KEY: 'prepdash.plan.v1',
};
