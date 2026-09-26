/**
 * PrepDash — nutrition helpers: calorie color scale + macro math.
 *
 * Each recipe category (main / dessert / snack) has its own calorie scale,
 * so a 350 kcal dessert and an 880 kcal main are colored relative to what's
 * normal for that kind of dish.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.nutrition = (function () {
  const { CALORIE_STOPS, RULES } = PrepDash.config;

  const lerp = (a, b, t) => a + (b - a) * t;

  /** Calorie rule for a category ({min, max, scale, label}); falls back to "main". */
  const rangeFor = category => RULES.calories[category] || RULES.calories.main;

  /** Interpolated background (+ readable foreground) for a kcal value. */
  function calorieColor(kcal, category = 'main') {
    const [lo, hi] = rangeFor(category).scale;
    const t = Math.min(1, Math.max(0, (kcal - lo) / (hi - lo)));
    let i = 0;
    while (i < CALORIE_STOPS.length - 2 && t > CALORIE_STOPS[i + 1][0]) i++;
    const [t0, c0] = CALORIE_STOPS[i];
    const [t1, c1] = CALORIE_STOPS[i + 1];
    const u = (t - t0) / (t1 - t0);
    const rgb = c0.map((v, idx) => Math.round(lerp(v, c1[idx], u)));
    // Relative luminance → choose dark or light text for contrast.
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return {
      bg: `rgb(${rgb.join(',')})`,
      fg: lum > 0.62 ? '#1b1b1b' : '#ffffff',
      pct: t * 100,
    };
  }

  /** CSS linear-gradient mirroring the calorie stops (for the scale bar). */
  function calorieGradient() {
    const stops = CALORIE_STOPS.map(([t, rgb]) => `rgb(${rgb.join(',')}) ${(t * 100).toFixed(1)}%`);
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }

  /** % of calories from each macro. */
  function macroSplit(n) {
    const p = n.protein * 4, c = n.carbs * 4, f = n.fat * 9;
    const total = p + c + f || 1;
    return { protein: (p / total) * 100, carbs: (c / total) * 100, fat: (f / total) * 100 };
  }

  const fatPct = n => ((n.fat * 9) / n.calories) * 100;

  return { calorieColor, calorieGradient, macroSplit, fatPct, rangeFor };
})();
