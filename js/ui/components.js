/**
 * CookQueue — presentational components (pure functions → HTML strings).
 */
window.CookQueue = window.CookQueue || {};

CookQueue.ui = (function () {
  const { esc, fmtMinutes, fmtNum, titleCase, imgAttrs } = CookQueue.util;
  const { calorieColor, calorieGradient, rangeFor } = CookQueue.nutrition;
  const { APPLIANCES, MACRO_COLORS, COOKS, RULES } = CookQueue.config;

  const TAG_ICONS = {
    'mexican': '🌮', 'asian': '🥢', 'mediterranean': '🫒', 'vegan': '🌱', 'vegetarian': '🥕',
    'gluten free': '🌾', 'dairy free': '🥛', 'high protein': '💪', 'dessert': '🍨',
    'no added salt': '🧂', 'low sodium': '🧂', 'high fiber': '🌿',
  };

  function spiceMeter(level, { compact = false } = {}) {
    if (!level) return compact ? '' : '<span class="tag tag--mild">Mild</span>';
    const peppers = Array.from({ length: 5 }, (_, i) =>
      `<span class="pepper ${i < level ? 'is-on' : ''}" aria-hidden="true">🌶️</span>`).join('');
    return `<span class="tag tag--spicy" title="Spicy: ${level} of 5 peppers" aria-label="Spicy, ${level} out of 5">
      ${compact ? '' : '<span class="tag-label">Spicy</span>'}<span class="peppers">${peppers}</span></span>`;
  }

  function tagChips(tags) {
    return tags.map(t => `<span class="tag">${TAG_ICONS[t] ? `<span aria-hidden="true">${TAG_ICONS[t]}</span>` : ''}${esc(titleCase(t))}</span>`).join('');
  }

  function applianceChips(keys) {
    return keys.map(k => APPLIANCES[k]
      ? `<span class="appliance-chip" data-appliance="${k}">${esc(APPLIANCES[k].label)}</span>` : '').join('');
  }

  function kcalPill(kcal, category) {
    const c = calorieColor(kcal, category);
    return `<span class="kcal-pill" style="background:${c.bg};color:${c.fg}">${fmtNum(kcal)} kcal</span>`;
  }

  /** Top-right hero badge: color-shifting calories + colored macros. */
  function nutritionBadge(n, category) {
    const c = calorieColor(n.calories, category);
    const range = rangeFor(category);
    const macro = (key, label, val) =>
      `<li class="macro" style="--macro:${MACRO_COLORS[key]}"><span class="macro-dot"></span><b>${val}g</b> ${label}</li>`;
    return `
      <div class="nutri-card">
        <div class="kcal-badge" style="background:${c.bg};color:${c.fg}">
          <span class="kcal-num" data-countup="${n.calories}">${fmtNum(n.calories)}</span>
          <span class="kcal-unit">kcal<br>per serving</span>
        </div>
        <div class="kcal-scale" style="background:${calorieGradient()}" title="${esc(range.label)} calorie scale: ${fmtNum(range.scale[0])} (green) to ${fmtNum(range.scale[1])} (dark red)">
          <span class="kcal-marker" style="left:${c.pct}%"></span>
        </div>
        <ul class="macro-list">
          ${macro('protein', 'Protein', n.protein)}
          ${macro('carbs', 'Carbs', n.carbs)}
          ${macro('fat', 'Fat', n.fat)}
        </ul>
      </div>`;
  }

  /** Top-left hero badge: Active Work Time + Total Time. */
  function timeBadge({ active, total, cooks, maxCookLoad }) {
    const over = active > RULES.maxActiveMinutes;
    const perCook = cooks > 1 ? `${fmtMinutes(maxCookLoad)} max per cook` : 'hands-on';
    return `
      <div class="time-card">
        <div class="time-stat">
          <span class="time-label">Active Work Time</span>
          <span class="time-value ${over && cooks === 1 ? 'is-over' : ''}">${fmtMinutes(active)}</span>
          <span class="time-sub">${perCook}</span>
        </div>
        <div class="time-divider"></div>
        <div class="time-stat">
          <span class="time-label">Total Time</span>
          <span class="time-value">${fmtMinutes(total)}</span>
          <span class="time-sub">with ${cooks} cook${cooks > 1 ? 's' : ''}</span>
        </div>
      </div>`;
  }

  function cookAvatar(i, size = '') {
    const c = COOKS[i];
    return `<span class="avatar ${size}" style="--c:${c.color}" title="${c.name}">${i + 1}</span>`;
  }

  /** Star rating, or a "New" chip for community recipes that have no ratings yet. */
  function rating(r, large = false) {
    if (!r.ratingCount) return `<span class="rating rating--new ${large ? 'rating--lg' : ''}">New</span>`;
    return large
      ? `<span class="rating rating--lg">★ ${r.rating.toFixed(1)} <small>(${fmtNum(r.ratingCount)})</small></span>`
      : `<span class="rating">★ ${r.rating.toFixed(1)}</span>`;
  }

  /** Store-front recipe card. `meta` = { active, total } precomputed. */
  function recipeCard(r, meta) {
    const n = r.nutritionPerServing;
    return `
      <a class="card" href="#/recipe/${esc(r.id)}">
        <div class="card-media">
          <img ${imgAttrs(r)} loading="lazy">
          <span class="card-chip">⏱ ${fmtMinutes(meta.active)} active</span>
          ${kcalPill(n.calories, r.category)}
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">${esc(r.name)}</h3>
            ${rating(r)}
          </div>
          <p class="card-meta">${esc(titleCase(r.cuisine))} · ${fmtMinutes(meta.total)} total · <b style="color:${MACRO_COLORS.protein}">${n.protein}g protein</b></p>
          ${r.community ? `<p class="card-author">by @${esc(r.community.author)}</p>` : ''}
          <div class="tag-row">${spiceMeter(r.spiceLevel, { compact: true })}${tagChips(r.tags.slice(0, 3))}</div>
        </div>
      </a>`;
  }

  function skeletonCards(count = 4) {
    return Array.from({ length: count }, () => `
      <div class="card card--skeleton"><div class="card-media shimmer"></div>
      <div class="card-body"><div class="line shimmer"></div><div class="line short shimmer"></div></div></div>`).join('');
  }

  return { spiceMeter, tagChips, applianceChips, kcalPill, nutritionBadge, timeBadge, cookAvatar, rating, recipeCard, skeletonCards };
})();
