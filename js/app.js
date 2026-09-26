/**
 * PrepDash — application controller.
 * Hash router (#/ and #/recipe/:id), state, rendering and event delegation.
 */
(function () {
  const P = window.PrepDash;
  const { esc, fmtMinutes, fmtNum, fmtQty, fmtAmount, titleCase, imgAttrs } = P.util;
  const { calorieColor, rangeFor } = P.nutrition;
  const { CATEGORIES, APPLIANCES, COOKS, RULES, STORAGE_KEY, MACRO_COLORS } = P.config;
  const { scaleIngredients, recommend, isTracked } = P.scaler;
  const { schedule, activeMinutes } = P.scheduler;
  const ui = P.ui;
  const Timeline = P.Timeline;
  const Service = P.RecipeService;

  const $app = document.getElementById('app');
  const $ = (sel, root = document) => root.querySelector(sel);

  const QUICK_FILTERS = [
    { id: 'active40',   label: '≤ 40 min active', test: (r, m) => m.active <= 40 },
    { id: 'under800',   label: 'Under 800 kcal',  test: r => r.nutritionPerServing.calories < 800 },
    { id: 'protein70',  label: '70g+ protein',    test: r => r.nutritionPerServing.protein >= 70 },
    { id: 'instantPot', label: 'Instant Pot',     test: r => r.appliances.includes('instantPot') },
    { id: 'airFryer',   label: 'Air Fryer',       test: r => r.appliances.includes('airFryer') },
    { id: 'oven',       label: 'Oven',            test: r => r.appliances.includes('oven') },
    { id: 'creami',     label: 'Creami',          test: r => r.appliances.includes('creami') },
  ];

  const SORTS = {
    recommended: (a, b) => b.rating * Math.log(b.ratingCount) - a.rating * Math.log(a.ratingCount),
    protein:     (a, b) => b.nutritionPerServing.protein - a.nutritionPerServing.protein,
    active:      (a, b) => meta(a).active - meta(b).active,
    calories:    (a, b) => a.nutritionPerServing.calories - b.nutritionPerServing.calories,
  };

  const state = {
    recipes: [],
    loading: true,
    filters: { category: 'all', quick: new Set(), search: '', sort: 'recommended' },
    views: {},          // recipeId → { servings, cooks, overrides }
    plan: loadPlan(),   // [{ recipeId, servings }]
    current: null,      // recipe currently open
  };

  /* ---------------------------------------------------------- helpers */

  const metaCache = {};
  function meta(r) {
    return (metaCache[r.id] ||= {
      active: activeMinutes(r),
      total: schedule(r, { servings: r.baseServings, cooks: 1 }).makespan,
    });
  }

  function viewState(r) {
    return (state.views[r.id] ||= { servings: r.baseServings, cooks: 1, overrides: {} });
  }

  const byId = id => state.recipes.find(r => r.id === id);

  /** High protein = ≥ 40 g, or ≥ 30% of calories from protein (fair to snacks & desserts). */
  const isHighProtein = n => n.protein >= RULES.minProteinPreferred || P.nutrition.macroSplit(n).protein >= 30;

  function loadPlan() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  }
  function savePlan() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plan)); } catch { /* private mode */ }
    updatePlanCount();
  }

  function toast(msg) {
    const el = $('#toast');
    el.innerHTML = msg;
    el.classList.add('is-on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- router */

  function route() {
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/recipe\/([\w-]+)/);
    closeDrawer();
    if (m) {
      const r = byId(m[1]);
      if (r) return renderRecipe(r);
    }
    state.current = null;
    renderHome();
  }

  /* ---------------------------------------------------------- home */

  function filteredRecipes() {
    const f = state.filters;
    const cat = CATEGORIES.find(c => c.id === f.category) || CATEGORIES[0];
    const q = f.search.trim().toLowerCase();
    return state.recipes
      .filter(cat.match)
      .filter(r => [...f.quick].every(id => QUICK_FILTERS.find(x => x.id === id).test(r, meta(r))))
      .filter(r => !q || [r.name, r.tagline, r.cuisine, ...r.tags, ...r.ingredients.map(i => i.name)]
        .join(' ').toLowerCase().includes(q))
      .sort(SORTS[f.sort]);
  }

  function renderHome() {
    document.title = 'PrepDash: Meal Prep, Delivered to Your Kitchen';
    const f = state.filters;
    const list = state.loading ? [] : filteredRecipes();
    $app.innerHTML = `
      <section class="promo">
        <div class="promo-copy">
          <span class="promo-kicker">Zero-waste meal prep</span>
          <h1>Your week of meals, <span>no delivery fee.</span></h1>
          <p>Browse high-protein, low-salt, low-fat recipes. Every batch size is tuned so no half-used containers are left in your fridge.</p>
          <div class="promo-actions">
            <button class="btn btn-primary" data-action="open-generator">✨ Generate a recipe</button>
            <button class="btn btn-ghost" data-action="scroll-menu">Browse menu</button>
          </div>
        </div>
        <div class="promo-art" aria-hidden="true">
          <div class="promo-bento"><span>🍗</span><span>🍚</span><span>🥦</span></div>
          <div class="promo-stat"><b>≤ 45 min</b><small>hands-on, every recipe</small></div>
          <div class="promo-stat promo-stat--2"><b>0</b><small>open containers left</small></div>
        </div>
      </section>

      <nav class="category-rail" aria-label="Categories">
        ${CATEGORIES.map(c => `
          <button class="category ${f.category === c.id ? 'is-on' : ''}" data-action="category" data-id="${c.id}" aria-pressed="${f.category === c.id}">
            <span class="category-icon" aria-hidden="true">${c.emoji}</span>
            <span>${esc(c.label)}</span>
          </button>`).join('')}
      </nav>

      <div class="filter-row">
        <div class="filter-pills">
          ${QUICK_FILTERS.map(q => `
            <button class="pill ${f.quick.has(q.id) ? 'is-on' : ''}" data-action="quick" data-id="${q.id}" aria-pressed="${f.quick.has(q.id)}">${esc(q.label)}</button>`).join('')}
        </div>
        <label class="sort">
          <span>Sort</span>
          <select data-action="sort">
            <option value="recommended" ${f.sort === 'recommended' ? 'selected' : ''}>Recommended</option>
            <option value="protein" ${f.sort === 'protein' ? 'selected' : ''}>Most protein</option>
            <option value="active" ${f.sort === 'active' ? 'selected' : ''}>Least hands-on time</option>
            <option value="calories" ${f.sort === 'calories' ? 'selected' : ''}>Fewest calories</option>
          </select>
        </label>
      </div>

      ${Service.rejected.length ? `
      <div class="notice" role="status">
        ⚠ ${Service.rejected.length} recipe${Service.rejected.length > 1 ? 's are' : ' is'} hidden because ${Service.rejected.length > 1 ? 'they break' : 'it breaks'} PrepDash rules:
        ${Service.rejected.slice(0, 5).map(x => `<b>${esc(x.name || x.id)}</b> (${esc(x.errors[0])})`).join('; ')}${Service.rejected.length > 5 ? '…' : ''}.
        Open the browser console (F12) for the full list.
      </div>` : ''}

      <section id="recipes" class="section">
        <div class="section-head">
          <h2>${f.category === 'all' ? 'All recipes' : esc(CATEGORIES.find(c => c.id === f.category).label)}</h2>
          <span class="muted">${state.loading ? '' : `${list.length} recipe${list.length === 1 ? '' : 's'}`}</span>
        </div>
        <div class="card-grid">
          ${state.loading ? ui.skeletonCards() :
            list.length ? list.map(r => ui.recipeCard(r, meta(r))).join('') : `
            <div class="empty">
              <span aria-hidden="true">🥡</span>
              <h3>Nothing on the menu matches that</h3>
              <p>Clear a filter, or have PrepDash generate something new.</p>
              <button class="btn btn-primary" data-action="clear-filters">Clear filters</button>
            </div>`}
        </div>
      </section>`;
  }

  /* ---------------------------------------------------------- recipe page */

  function renderRecipe(r) {
    state.current = r;
    document.title = `${r.name} · PrepDash`;
    const v = viewState(r);
    const validation = Service.validate(r);

    $app.innerHTML = `
      <article class="recipe-page">
        <a class="back-link" href="#/">← All recipes</a>

        <section class="hero">
          <figure class="hero-img">
            <img ${imgAttrs(r)}>
          </figure>
          <div class="hero-corner hero-corner--left" id="time-badge"></div>
          <div class="hero-corner hero-corner--right">${ui.nutritionBadge(r.nutritionPerServing, r.category)}</div>
        </section>

        <header class="recipe-head">
          <div class="recipe-title-row">
            <h1>${esc(r.name)}</h1>
            <span class="rating rating--lg">★ ${r.rating.toFixed(1)} <small>(${fmtNum(r.ratingCount)})</small></span>
          </div>
          <p class="tagline">${esc(r.tagline)}</p>
          <div class="tag-row">${ui.spiceMeter(r.spiceLevel)}${ui.tagChips(r.tags)}</div>
          <p class="description">${esc(r.description)}</p>
          ${r.source ? `<p class="source">Adapted from <a href="${esc(r.source.url)}" target="_blank" rel="noopener">${esc(r.source.name)}</a>${r.source.author ? ` by ${esc(r.source.author)}` : ''}, reworked to fit PrepDash rules.</p>` : ''}
          <div class="appliance-row"><span class="muted">Uses:</span>${ui.applianceChips(r.appliances)}</div>
          <details class="rules ${validation.ok ? 'is-ok' : 'is-bad'}">
            <summary>${validation.ok ? '✓ Meets all PrepDash rules' : '⚠ Rule check failed'}</summary>
            <ul>${validation.checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✗'} ${esc(c.label)}</li>`).join('')}
              <li class="ok">✓ ${fmtNum(r.nutritionPerServing.fiber)}g fiber · ${isHighProtein(r.nutritionPerServing) ? 'high protein' : 'moderate protein'}</li>
            </ul>
          </details>
        </header>

        <div class="recipe-layout">
          <div class="recipe-main">
            <section class="panel" id="ingredients-panel"></section>

            <section class="panel" id="timeline-panel">
              <div class="panel-head">
                <div>
                  <h2>Prep Timeline</h2>
                  <p class="muted">Steps that can overlap run side by side. Click a task bar to hand it to another cook.</p>
                </div>
                <div class="timeline-controls">
                  <div class="segmented" role="group" aria-label="Number of cooks">
                    ${[1, 2, 3].map(n => `<button data-action="cooks" data-n="${n}" class="${v.cooks === n ? 'is-on' : ''}" aria-pressed="${v.cooks === n}">${'👤'.repeat(n)}<span>${n} cook${n > 1 ? 's' : ''}</span></button>`).join('')}
                  </div>
                  <button class="btn btn-small btn-ghost" data-action="timeline-reset" id="reset-btn">↺ Auto-assign</button>
                </div>
              </div>
              <div id="timeline-stats" class="timeline-stats"></div>
              <div id="gantt"></div>
              <div class="gantt-legend">
                <span><i class="lg lg-active"></i>Hands-on</span>
                <span><i class="lg lg-passive"></i>Hands-off</span>
                <span><i class="lg lg-break"></i>Compressed wait</span>
                <span>📌 Manually assigned</span>
              </div>
              <h3 class="subhead">Step-by-step</h3>
              <ol class="step-list" id="step-list"></ol>
            </section>

            <section class="panel">
              <h2>Storage & reheating</h2>
              <div class="storage-grid">
                <div><b>${r.storage.fridgeDays ? `${r.storage.fridgeDays} days` : 'Freezer only'}</b><span>Fridge</span></div>
                <div><b>${r.storage.freezerMonths} mo</b><span>Freezer</span></div>
                <div><b>${esc(r.container)}</b><span>Container</span></div>
              </div>
              <p>${esc(r.storage.reheat)}</p>
              ${r.notes?.length ? `<ul class="notes">${r.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
            </section>
          </div>

          <aside class="recipe-side">
            <div class="panel order-panel" id="scaler-panel"></div>
          </aside>
        </div>
      </article>`;

    updateRecipe();
    countUpCalories();
    window.scrollTo(0, 0);
  }

  /** Re-render only the parts that depend on servings / cooks / assignments. */
  function updateRecipe() {
    const r = state.current;
    if (!r) return;
    const v = viewState(r);
    const result = schedule(r, v);
    const solo = schedule(r, { servings: v.servings, cooks: 1 });

    $('#time-badge').innerHTML = ui.timeBadge({
      active: result.activeTotal, total: result.makespan, cooks: v.cooks,
      maxCookLoad: Math.max(...result.cookLoads),
    });
    $('#ingredients-panel').innerHTML = ingredientsHTML(r, v.servings);
    $('#scaler-panel').innerHTML = scalerHTML(r, v.servings);
    $('#gantt').innerHTML = Timeline.render(result);
    $('#step-list').innerHTML = Timeline.stepList(result);

    const saved = solo.makespan - result.makespan;
    const over = result.activeTotal > RULES.maxActiveMinutes;
    $('#timeline-stats').innerHTML = `
      <div class="stat"><span>Estimated total</span><b>${fmtMinutes(result.makespan)}</b></div>
      <div class="stat"><span>Hands-on work</span><b>${fmtMinutes(result.activeTotal)}</b></div>
      <div class="stat ${saved > 0 ? 'stat--good' : ''}"><span>Saved vs. 1 cook</span><b>${saved > 0 ? `−${fmtMinutes(saved)}` : '—'}</b></div>
      <div class="stat stat--loads"><span>Workload</span>
        <div class="loads">${result.cookLoads.map((l, i) => `
          <div class="load" title="${COOKS[i].name}: ${fmtMinutes(l)}">
            <i style="width:${(l / Math.max(1, result.activeTotal)) * 100}%;background:${COOKS[i].color}"></i>
          </div>`).join('')}</div>
      </div>
      ${over ? `<p class="warn-line">⚠ At ${v.servings} servings the hands-on work is over the ${RULES.maxActiveMinutes}-minute cap. ${v.cooks === 1 ? 'Add a cook to split the work.' : `The busiest cook has ${fmtMinutes(Math.max(...result.cookLoads))} of work.`}</p>` : ''}`;

    const reset = $('#reset-btn');
    if (reset) reset.disabled = !Object.keys(v.overrides).length;
    document.querySelectorAll('[data-action="cooks"]').forEach(b => {
      const on = +b.dataset.n === v.cooks;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
  }

  const GROUP_ORDER = ['Protein', 'Dairy', 'Canned', 'Frozen', 'Produce', 'Pantry'];

  function ingredientName(ing, qty) {
    return ing.unit === 'each' && qty <= 1 && ing.singular ? ing.singular : ing.name;
  }

  function packageMeter(u) {
    const count = Math.min(u.toBuy, 8);
    const cells = Array.from({ length: count }, (_, i) => {
      const fill = Math.min(1, Math.max(0, u.units - i));
      return `<i style="--fill:${fill * 100}%"></i>`;
    }).join('');
    return `<span class="pkg-meter" aria-hidden="true">${cells}${u.toBuy > 8 ? '<em>…</em>' : ''}</span>`;
  }

  function ingredientsHTML(r, servings) {
    const items = scaleIngredients(r, servings);
    const groups = GROUP_ORDER.map(g => [g, items.filter(i => i.group === g)])
      .concat([['Other', items.filter(i => !GROUP_ORDER.includes(i.group))]])
      .filter(([, list]) => list.length);

    const row = ing => {
      const u = ing.usage;
      const amt = ing.unit === 'each' ? fmtQty(u.needed) : fmtAmount(u.needed, ing.unit);
      let pkg = '';
      if (u.tracked) {
        pkg = u.isOpen
          ? `<span class="ing-pkg is-open" title="${fmtQty(u.leftover)} of a ${esc(ing.package.label)} would be left open">
              ${packageMeter(u)}Buy ${u.toBuy} × ${esc(ing.package.label)} · <b>${fmtQty(u.leftover)} left open</b></span>`
          : `<span class="ing-pkg is-ok">${packageMeter(u)}${u.toBuy} × ${esc(ing.package.label)} ✓</span>`;
      }
      return `
        <li class="ing ${ing.pantry ? 'ing--pantry' : ''}">
          <span class="ing-amt">${amt}</span>
          <span class="ing-name">${esc(ingredientName(ing, u.needed))}${ing.prep ? `<small>${esc(ing.prep)}</small>` : ''}</span>
          ${pkg}
        </li>`;
    };

    return `
      <div class="panel-head">
        <div><h2>Ingredients</h2><p class="muted">For ${servings} serving${servings > 1 ? 's' : ''} · amounts update with your batch size</p></div>
      </div>
      ${groups.map(([g, list]) => `
        <h3 class="ing-group">${g === 'Pantry' ? 'Pantry staples <small>(shelf-stable, not counted toward waste)</small>' : esc(g)}</h3>
        <ul class="ing-list">${list.map(row).join('')}</ul>`).join('')}`;
  }

  function scalerHTML(r, servings) {
    const rec = recommend(r, servings);
    const n = r.nutritionPerServing;
    const tracked = scaleIngredients(r, servings).filter(i => i.usage.tracked);
    const inPlan = state.plan.find(p => p.recipeId === r.id);
    const containers = Math.ceil(servings / (r.servingsPerContainer || 1));

    const status = rec.current
      ? `<div class="batch-status is-ok"><b>✓ Zero-waste batch</b><span>Every container is used up. Nothing half-open in the fridge.</span></div>`
      : `<div class="batch-status is-warn"><b>⚠ ${rec.openItems.length} open container${rec.openItems.length > 1 ? 's' : ''} at ${servings} servings</b>
          <span>${rec.openItems.slice(0, 3).map(i => esc(i.name.split(',')[0])).join(', ')}${rec.openItems.length > 3 ? '…' : ''}</span>
          ${rec.nearest != null ? `<button class="btn btn-small btn-primary" data-action="servings-set" data-value="${rec.nearest}">
            Switch to ${rec.nearest} servings (${rec.nearest > servings ? '+' : '−'}${Math.abs(rec.nearest - servings)})</button>` : ''}
        </div>`;

    return `
      <h2>Your batch</h2>
      <div class="stepper" role="group" aria-label="Servings">
        <button data-action="servings-dec" aria-label="Remove a serving" ${servings <= 1 ? 'disabled' : ''}>−</button>
        <div class="stepper-value"><b>${servings}</b><span>serving${servings > 1 ? 's' : ''}</span></div>
        <button data-action="servings-inc" aria-label="Add a serving" ${servings >= r.maxServings ? 'disabled' : ''}>+</button>
      </div>

      <div class="optimal">
        <span class="optimal-label">${rec.perfect ? 'Optimal batches' : 'Least-waste batches'}</span>
        <div class="optimal-chips">
          ${rec.sizes.map(s => `<button class="chip ${s === servings ? 'is-on' : ''}" data-action="servings-set" data-value="${s}">${s} servings</button>`).join('')}
        </div>
      </div>
      ${status}

      <div class="batch-totals">
        <div><b>${containers}</b><span>${esc(r.containerPlural || 'Bentgo boxes')}</span></div>
        <div><b>${fmtNum(n.calories * servings)}</b><span>total kcal</span></div>
        <div><b style="color:${MACRO_COLORS.protein}">${fmtNum(n.protein * servings)}g</b><span>total protein</span></div>
      </div>

      <h3 class="subhead">Shopping list</h3>
      <ul class="shop-list">
        ${tracked.map(i => `<li class="${i.usage.isOpen ? 'is-open' : ''}"><span>${i.usage.toBuy} ×</span> ${esc(i.package.label)} <small>${esc(i.name)}</small></li>`).join('')}
      </ul>
      <p class="muted small">+ ${r.ingredients.filter(i => !isTracked(i)).length} pantry staples</p>

      <button class="btn btn-primary btn-block btn-order" data-action="plan-add">
        <span>${inPlan ? 'Update Prep Plan' : 'Add to Prep Plan'}</span><span>${servings} serving${servings > 1 ? 's' : ''}</span>
      </button>`;
  }

  function countUpCalories() {
    const el = $('.kcal-num[data-countup]');
    if (!el) return;
    const target = +el.dataset.countup;
    const badge = el.closest('.kcal-badge');
    const marker = $('.kcal-marker');
    if (reduceMotion) return;
    const category = state.current?.category;
    const from = rangeFor(category).scale[0], dur = 900, t0 = performance.now();
    const frame = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const k = from + (target - from) * eased;
      const c = calorieColor(k, category);
      el.textContent = fmtNum(k);
      badge.style.background = c.bg;
      badge.style.color = c.fg;
      if (marker) marker.style.left = `${c.pct}%`;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------- prep plan drawer */

  function updatePlanCount() {
    const count = state.plan.reduce((s, p) => s + p.servings, 0);
    const badge = $('#plan-count');
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  function aggregateShopping() {
    const map = new Map();
    const pantry = new Set();
    state.plan.forEach(p => {
      const r = byId(p.recipeId);
      if (!r) return;
      r.ingredients.forEach(ing => {
        if (!isTracked(ing)) { pantry.add(ing.name); return; }
        const key = `${ing.name}|${ing.package.label}`;
        const e = map.get(key) || { name: ing.name, label: ing.package.label, units: 0 };
        e.units += (ing.qtyPerServing * p.servings) / ing.package.size;
        map.set(key, e);
      });
    });
    const items = [...map.values()].map(e => {
      const whole = Math.round(e.units);
      const isOpen = Math.abs(e.units - whole) > 0.001;
      return { ...e, toBuy: isOpen ? Math.ceil(e.units) : whole, isOpen };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return { items, pantry: [...pantry].sort() };
  }

  function renderDrawer() {
    const body = $('#plan-body');
    if (!state.plan.length) {
      body.innerHTML = `<div class="empty empty--drawer"><span aria-hidden="true">🛒</span><h3>Your prep plan is empty</h3>
        <p>Add recipes to build one combined, zero-waste shopping list.</p></div>`;
      return;
    }
    const { items, pantry } = aggregateShopping();
    const kcal = state.plan.reduce((s, p) => s + (byId(p.recipeId)?.nutritionPerServing.calories || 0) * p.servings, 0);
    const open = items.filter(i => i.isOpen).length;
    body.innerHTML = `
      <ul class="plan-items">
        ${state.plan.map(p => {
          const r = byId(p.recipeId);
          if (!r) return '';
          return `<li class="plan-item">
            <img ${imgAttrs(r)}>
            <div><a href="#/recipe/${esc(r.id)}">${esc(r.name)}</a>
              <span class="muted small">${p.servings} servings · ${P.scaler.isOptimal(r, p.servings) ? '<span class="ok">zero-waste ✓</span>' : '<span class="warn">has open containers</span>'}</span></div>
            <button class="icon-btn" data-action="plan-remove" data-id="${esc(r.id)}" aria-label="Remove ${esc(r.name)}">✕</button>
          </li>`;
        }).join('')}
      </ul>
      <div class="plan-summary">
        <div><b>${state.plan.reduce((s, p) => s + p.servings, 0)}</b><span>meals</span></div>
        <div><b>${fmtNum(kcal)}</b><span>total kcal</span></div>
        <div><b class="${open ? 'warn' : 'ok'}">${open}</b><span>open containers</span></div>
      </div>
      <h3 class="subhead">Combined shopping list</h3>
      <ul class="shop-list">
        ${items.map(i => `<li class="${i.isOpen ? 'is-open' : ''}"><span>${i.toBuy} ×</span> ${esc(i.label)} <small>${esc(i.name)}</small></li>`).join('')}
      </ul>
      <h3 class="subhead">Pantry check</h3>
      <p class="muted small">${pantry.map(esc).join(' · ')}</p>
      <button class="btn btn-ghost btn-block" data-action="plan-clear">Clear plan</button>`;
  }

  function openDrawer() {
    renderDrawer();
    document.body.classList.add('drawer-open');
    $('#plan-drawer').setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    $('#plan-drawer').setAttribute('aria-hidden', 'true');
  }

  /* ---------------------------------------------------------- generator modal */

  function openGenerator() {
    const root = $('#modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" data-action="modal-close"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="gen-title">
        <button class="icon-btn modal-x" data-action="modal-close" aria-label="Close">✕</button>
        <form id="gen-form">
          <h2 id="gen-title">✨ Generate a recipe</h2>
          <p class="muted">Every result meets your rules: ${Object.values(RULES.calories).map(c => `${c.label.toLowerCase()}s ${c.min}–${fmtNum(c.max)} kcal`).join(', ')}; ≤ ¼ tsp salt, low fat, ≤ ${RULES.maxIngredients} ingredients, ≤ ${RULES.maxActiveMinutes} min hands-on and approved appliances only.</p>
          <div class="form-grid">
            <label>Meal type
              <select name="mealType"><option value="main">Main meal</option><option value="snack">Snack</option><option value="dessert">Dessert</option><option value="any">Surprise me</option></select>
            </label>
            <label>Cuisine
              <select name="cuisine"><option value="any">Any</option><option value="mexican">Mexican</option><option value="asian">Asian</option><option value="mediterranean">Mediterranean</option></select>
            </label>
            <label>Appliance
              <select name="appliance"><option value="any">Any approved</option>
                ${Object.entries(APPLIANCES).filter(([, a]) => !a.storage).map(([k, a]) => `<option value="${k}">${esc(a.label)}${a.dessertOnly ? ' (desserts)' : ''}</option>`).join('')}
              </select>
            </label>
            <label>Max hands-on
              <select name="maxActive"><option value="45">45 min</option><option value="40">40 min</option><option value="35">35 min</option><option value="30">30 min</option></select>
            </label>
          </div>
          <fieldset class="diet">
            <legend>Dietary</legend>
            ${['vegan', 'vegetarian', 'gluten free', 'dairy free'].map(d => `<label class="check"><input type="checkbox" name="diet" value="${d}"><span>${titleCase(d)}</span></label>`).join('')}
          </fieldset>
          <label class="range">Max spice <output id="spice-out">🌶️🌶️🌶️</output>
            <input type="range" name="maxSpice" min="0" max="5" value="3">
          </label>
          <button class="btn btn-primary btn-block" type="submit">Generate recipe</button>
        </form>
        <div class="gen-loading" hidden>
          <div class="pan" aria-hidden="true">🍳</div>
          <p id="gen-msg">Balancing macros…</p>
        </div>
      </div>`;
    document.body.classList.add('modal-open');
    const form = $('#gen-form');
    form.maxSpice.addEventListener('input', e => {
      $('#spice-out').textContent = +e.target.value ? '🌶️'.repeat(+e.target.value) : 'Mild';
    });
    form.addEventListener('submit', onGenerate);
    form.mealType.focus();
  }

  function closeModal() {
    $('#modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
  }

  async function onGenerate(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prefs = {
      mealType: fd.get('mealType'), cuisine: fd.get('cuisine'), appliance: fd.get('appliance'),
      maxActive: +fd.get('maxActive'), maxSpice: +fd.get('maxSpice'), diet: fd.getAll('diet'),
    };
    e.target.hidden = true;
    const loading = $('.gen-loading');
    loading.hidden = false;
    const msgs = ['Balancing macros…', 'Finding the zero-waste batch…', 'Scheduling parallel steps…'];
    let i = 0;
    const tick = setInterval(() => { $('#gen-msg').textContent = msgs[++i % msgs.length]; }, 420);
    try {
      const { recipe, exact } = await Service.generate(prefs);
      const check = Service.validate(recipe);
      if (!check.ok) throw new Error(check.errors.join('; '));
      if (!byId(recipe.id)) state.recipes.push(recipe);
      closeModal();
      location.hash = `#/recipe/${recipe.id}`;
      toast(exact ? `✨ Generated <b>${esc(recipe.name)}</b>` : `Closest match on the menu: <b>${esc(recipe.name)}</b>`);
    } catch (err) {
      console.error(err);
      closeModal();
      toast('⚠ Could not generate a recipe. Please try again.');
    } finally {
      clearInterval(tick);
    }
  }

  /* ---------------------------------------------------------- events */

  function setServings(n) {
    const r = state.current;
    const v = viewState(r);
    v.servings = Math.min(r.maxServings, Math.max(1, n));
    updateRecipe();
  }

  const actions = {
    'category':       el => { state.filters.category = el.dataset.id; renderHome(); },
    'quick':          el => { const s = state.filters.quick; s.has(el.dataset.id) ? s.delete(el.dataset.id) : s.add(el.dataset.id); renderHome(); },
    'clear-filters':  () => { state.filters = { category: 'all', quick: new Set(), search: '', sort: state.filters.sort }; $('#search').value = ''; renderHome(); },
    'open-generator': openGenerator,
    'scroll-menu':    () => $('#recipes').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }),
    'modal-close':    closeModal,
    'servings-dec':   () => setServings(viewState(state.current).servings - 1),
    'servings-inc':   () => setServings(viewState(state.current).servings + 1),
    'servings-set':   el => setServings(+el.dataset.value),
    'cooks':          el => {
      const v = viewState(state.current);
      v.cooks = +el.dataset.n;
      Object.keys(v.overrides).forEach(k => { if (v.overrides[k] >= v.cooks) delete v.overrides[k]; });
      updateRecipe();
    },
    'task-cycle':     el => {
      const v = viewState(state.current);
      if (v.cooks < 2) { toast('Add a second cook to hand off tasks 👥'); return; }
      const task = schedule(state.current, v).tasks.find(t => t.id === el.dataset.task);
      v.overrides[task.id] = (task.cook + 1) % v.cooks;
      updateRecipe();
    },
    'task-assign':    el => {
      const v = viewState(state.current);
      v.overrides[el.dataset.task] = +el.dataset.cook;
      updateRecipe();
    },
    'timeline-reset': () => { viewState(state.current).overrides = {}; updateRecipe(); },
    'plan-add':       () => {
      const r = state.current, servings = viewState(r).servings;
      const existing = state.plan.find(p => p.recipeId === r.id);
      if (existing) existing.servings = servings; else state.plan.push({ recipeId: r.id, servings });
      savePlan();
      updateRecipe();
      toast(`🛒 ${existing ? 'Updated' : 'Added'} <b>${esc(r.name)}</b>: ${servings} servings`);
    },
    'plan-remove':    el => { state.plan = state.plan.filter(p => p.recipeId !== el.dataset.id); savePlan(); renderDrawer(); if (state.current) updateRecipe(); },
    'plan-clear':     () => { state.plan = []; savePlan(); renderDrawer(); if (state.current) updateRecipe(); },
    'plan-open':      openDrawer,
    'plan-close':     closeDrawer,
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.tagName === 'SELECT') return;
    const fn = actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el); }
  });

  document.addEventListener('change', e => {
    if (e.target.matches('select[data-action="sort"]')) { state.filters.sort = e.target.value; renderHome(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
  });

  // Highlight a task in both the chart and the step list on hover.
  $app.addEventListener('mouseover', e => {
    const el = e.target.closest('#timeline-panel [data-task]');
    document.querySelectorAll('#timeline-panel .is-hot').forEach(n => n.classList.remove('is-hot'));
    if (el) document.querySelectorAll(`#timeline-panel [data-task="${CSS.escape(el.dataset.task)}"]`).forEach(n => n.classList.add('is-hot'));
  });

  $('#search').addEventListener('input', e => {
    state.filters.search = e.target.value;
    if (state.current) { location.hash = '#/'; return; }
    renderHome();
  });

  window.addEventListener('hashchange', route);

  /* ---------------------------------------------------------- boot */

  (async function init() {
    updatePlanCount();
    renderHome(); // skeleton
    state.recipes = await Service.list();
    state.loading = false;
    state.plan = state.plan.filter(p => byId(p.recipeId));
    updatePlanCount();
    route();
  })();
})();
