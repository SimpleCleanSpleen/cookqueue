/**
 * PrepDash — recipe editor (the "Add recipe" / "Edit recipe" page).
 *
 * The form edits a recipe object in the README schema directly. Inputs carry
 * data-path ("ingredients.2.name") and data-kind (how to parse the value).
 * Every change re-runs RecipeService.validate(), so Save only lights up once
 * the recipe meets every PrepDash rule.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.RecipeEditor = (function () {
  const { esc, fmtNum, titleCase } = PrepDash.util;
  const { RULES, APPLIANCES } = PrepDash.config;

  const UNITS = ['oz', 'fl oz', 'cup', 'tbsp', 'tsp', 'can', 'box', 'bunch', 'each', 'scoop'];
  const GROUPS = ['Protein', 'Dairy', 'Canned', 'Frozen', 'Produce', 'Pantry'];
  const CUISINES = ['american', 'asian', 'indian', 'italian', 'mediterranean', 'mexican', 'middle eastern', 'other'];
  const TAGS = ['vegan', 'vegetarian', 'gluten free', 'dairy free', 'high protein', 'high fiber', 'low carb', 'no added salt', 'low sodium'];
  const CONTAINERS = [
    { container: 'Bentgo 1-compartment (black)', containerPlural: 'Bentgo boxes', servingsPerContainer: 1 },
    { container: 'Ninja Creami Deluxe 24 oz pint (2 servings)', containerPlural: 'Creami pints', servingsPerContainer: 2 },
  ];
  const SCALING = [[0, 'Same time for any batch'], [0.5, 'Takes a bit longer for big batches'], [1, 'Grows with batch size']];
  const MAX_PHOTO_CHARS = 350000; // ≈ 260 KB, keeps each Firestore doc well under its 1 MB limit

  let seq = 0;
  const newStepId = () => `step-${Date.now().toString(36)}-${++seq}`;

  function blankIngredient() {
    return { name: '', group: 'Produce', qtyPerServing: 1, unit: 'each', prep: '', package: { size: 1, unit: 'each', label: '' } };
  }

  function blankStep() {
    return { id: newStepId(), title: '', detail: '', durationMin: 5, durationScaling: 0.5, active: true, appliance: null, dependsOn: [] };
  }

  /** A new, empty recipe with sensible defaults. */
  function blank() {
    return {
      schemaVersion: 2, name: '', tagline: '', description: '', category: 'main', cuisine: 'american',
      tags: ['high protein'], spiceLevel: 0, baseServings: 4, maxServings: 12, ...CONTAINERS[0],
      image: { url: '', alt: '' }, source: null,
      nutritionPerServing: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
      appliances: [], ingredients: [blankIngredient()], steps: [blankStep()],
      storage: { fridgeDays: 4, freezerMonths: 2, reheat: '' }, notes: [],
    };
  }

  /** Makes an existing or imported recipe safe to edit (fills missing fields). */
  function normalize(r) {
    const base = blank();
    const m = { ...base, ...JSON.parse(JSON.stringify(r || {})) };
    m.nutritionPerServing = { ...base.nutritionPerServing, ...(m.nutritionPerServing || {}) };
    m.storage = { ...base.storage, ...(m.storage || {}) };
    m.image = { url: '', alt: '', ...(m.image || {}) };
    m.tags = Array.isArray(m.tags) ? m.tags.map(t => String(t).toLowerCase()) : [];
    m.notes = Array.isArray(m.notes) ? m.notes : [];
    m.ingredients = (Array.isArray(m.ingredients) ? m.ingredients : []).map(i => ({ ...blankIngredient(), ...i }));
    m.steps = (Array.isArray(m.steps) ? m.steps : []).map(s => ({ ...blankStep(), ...s, dependsOn: s.dependsOn || [] }));
    if (!m.ingredients.length) m.ingredients.push(blankIngredient());
    if (!m.steps.length) m.steps.push(blankStep());
    ['id', 'rating', 'ratingCount', 'community', 'batch'].forEach(k => delete m[k]);
    return m;
  }

  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

  /** Form model → recipe in the README schema (fills in the derived fields). */
  function toRecipe(m) {
    const r = JSON.parse(JSON.stringify(m));
    const taken = new Set();
    r.ingredients = r.ingredients.map(i => {
      let id = slug(i.name);
      while (taken.has(id)) id += '-2';
      taken.add(id);
      const out = { ...i, id };
      if (i.pantry) { out.package = null; out.pantry = true; } else {
        delete out.pantry;
        out.package = { ...(i.package || {}), unit: i.unit };
        if (!out.package.label) out.package.label = `${fmtNum(out.package.size)} ${i.unit}`;
      }
      if (!out.singular) delete out.singular;
      return out;
    });
    const toNum = v => (v === '' || v == null || isNaN(+v) ? 0 : +v);
    Object.keys(r.nutritionPerServing).forEach(k => { r.nutritionPerServing[k] = toNum(r.nutritionPerServing[k]); });
    ['baseServings', 'maxServings', 'spiceLevel'].forEach(k => { r[k] = toNum(r[k]); });
    r.storage.fridgeDays = toNum(r.storage.fridgeDays);
    r.storage.freezerMonths = toNum(r.storage.freezerMonths);
    r.ingredients.forEach(i => { i.qtyPerServing = toNum(i.qtyPerServing); if (i.package) i.package.size = toNum(i.package.size); });
    r.steps.forEach(s => { s.durationMin = toNum(s.durationMin); s.durationScaling = toNum(s.durationScaling); });
    const stepIds = new Set(r.steps.map(s => s.id));
    r.steps = r.steps.map(s => ({ ...s, dependsOn: (s.dependsOn || []).filter(d => stepIds.has(d)) }));
    r.appliances = [...new Set(r.steps.map(s => s.appliance).filter(a => a && !APPLIANCES[a]?.storage))];
    if (!r.tags.includes(r.cuisine) && r.cuisine !== 'other') r.tags.unshift(r.cuisine);
    r.tags = [...new Set(r.tags)];
    r.notes = r.notes.filter(n => n.trim());
    if (!r.image.url) r.image.url = PrepDash.util.placeholderImage(r.name || 'New recipe');
    r.image.alt = `${r.name} served on a white paper plate`;
    if (r.source && !r.source.name && !r.source.url) r.source = null;
    if (r.source && !r.source.author) delete r.source.author;
    delete r.imagePrompt;
    return r;
  }

  /* ---------------------------------------------------------- rendering */

  const opt = (value, label, current) =>
    `<option value="${esc(value)}" ${String(value) === String(current) ? 'selected' : ''}>${esc(label)}</option>`;

  function field(label, input, hint = '') {
    return `<label class="field"><span class="field-label">${label}</span>${input}${hint ? `<small class="field-hint">${hint}</small>` : ''}</label>`;
  }

  const text = (path, value, attrs = '') => `<input type="text" data-path="${path}" value="${esc(value ?? '')}" ${attrs}>`;
  const num = (path, value, attrs = '') => `<input type="number" inputmode="decimal" data-path="${path}" data-kind="num" value="${esc(value ?? '')}" ${attrs}>`;
  const area = (path, value, kind = '', attrs = '') => `<textarea data-path="${path}" ${kind ? `data-kind="${kind}"` : ''} ${attrs}>${esc(value ?? '')}</textarea>`;

  function basicsHTML(m) {
    const cal = RULES.calories[m.category];
    return `
      <h2>The basics</h2>
      ${field('Recipe name', text('name', m.name, 'maxlength="100" required placeholder="e.g. Lemon-Herb Chicken & Orzo"'))}
      ${field('Tagline', text('tagline', m.tagline, 'maxlength="90" placeholder="One line for the menu card"'))}
      ${field('Description', area('description', m.description, '', 'rows="3" maxlength="800" placeholder="What it is and why it\'s good"'))}
      <div class="field-grid">
        ${field('Meal type', `<select data-path="category" data-rerender>${Object.entries(RULES.calories).map(([k, c]) => opt(k, c.label, m.category)).join('')}</select>`,
          cal ? `${cal.min}–${fmtNum(cal.max)} kcal per serving` : '')}
        ${field('Cuisine', `<select data-path="cuisine">${CUISINES.map(c => opt(c, titleCase(c), m.cuisine)).join('')}</select>`)}
        ${field('Spice', `<select data-path="spiceLevel" data-kind="int">${[0, 1, 2, 3, 4, 5].map(n => opt(n, n ? '🌶️'.repeat(n) : 'Mild', m.spiceLevel)).join('')}</select>`)}
        ${field('Container', `<select data-path="container" data-kind="container">${CONTAINERS.map(c => opt(c.container, c.container, m.container)).join('')}</select>`)}
        ${field('Servings the steps are written for', num('baseServings', m.baseServings, 'min="1" max="24" step="1"'))}
        ${field('Most servings in one batch', num('maxServings', m.maxServings, 'min="1" max="48" step="1"'), 'Limited by pot and pan size')}
      </div>
      <fieldset class="tag-picks">
        <legend class="field-label">Tags</legend>
        ${TAGS.map(t => `<label class="check"><input type="checkbox" data-tag="${esc(t)}" ${m.tags.includes(t) ? 'checked' : ''}><span>${esc(titleCase(t))}</span></label>`).join('')}
      </fieldset>
      <div class="field-grid">
        ${field('Adapted from (optional)', `<input type="text" data-path="source.name" value="${esc(m.source?.name || '')}" placeholder="Site or cookbook name">`)}
        ${field('Link to the original (optional)', `<input type="url" data-path="source.url" value="${esc(m.source?.url || '')}" placeholder="https://…">`)}
      </div>`;
  }

  function photoHTML(m) {
    const has = m.image.url && !m.image.url.includes('placehold.co');
    return `
      <h2>Photo</h2>
      <p class="muted small">One photo of the finished dish, ideally on a white paper plate. It's shrunk automatically before saving.</p>
      <div class="photo-row">
        <div class="photo-preview">${has ? `<img src="${esc(m.image.url)}" alt="">` : '<span aria-hidden="true">📷</span>'}</div>
        <div class="photo-actions">
          <label class="btn btn-ghost btn-small">${has ? 'Replace photo' : 'Choose photo'}<input type="file" accept="image/*" data-photo hidden></label>
          ${has ? '<button type="button" class="btn btn-ghost btn-small" data-ed="photo-remove">Remove</button>' : ''}
          <small class="field-hint" id="photo-msg">${has ? '' : 'Optional. A placeholder is shown until you add one.'}</small>
        </div>
      </div>`;
  }

  function nutritionHTML(m) {
    const n = m.nutritionPerServing;
    const macroKcal = (+n.protein || 0) * 4 + (+n.carbs || 0) * 4 + (+n.fat || 0) * 9;
    return `
      <h2>Nutrition per serving</h2>
      <div class="field-grid field-grid--3">
        ${field('Calories', num('nutritionPerServing.calories', n.calories, 'min="0" step="1"'))}
        ${field('Protein (g)', num('nutritionPerServing.protein', n.protein, 'min="0" step="1"'))}
        ${field('Carbs (g)', num('nutritionPerServing.carbs', n.carbs, 'min="0" step="1"'))}
        ${field('Fat (g)', num('nutritionPerServing.fat', n.fat, 'min="0" step="1"'))}
        ${field('Fiber (g)', num('nutritionPerServing.fiber', n.fiber, 'min="0" step="1"'))}
        ${field('Sodium (mg)', num('nutritionPerServing.sodium', n.sodium, 'min="0" step="10"'), `Max ${RULES.maxSodiumMg} mg`)}
      </div>
      <p class="muted small" id="macro-sum">Protein, carbs and fat add up to <b>${fmtNum(macroKcal)} kcal</b>. That needs to be within 10% of the calories.</p>`;
  }

  function ingredientHTML(i, k, count) {
    const p = `ingredients.${k}`;
    return `
      <li class="ed-row">
        <div class="ed-row-head">
          <b>Ingredient ${k + 1}</b>
          <button type="button" class="icon-btn" data-ed="ing-remove" data-i="${k}" aria-label="Remove ingredient ${k + 1}" ${count <= 1 ? 'disabled' : ''}>✕</button>
        </div>
        <div class="field-grid field-grid--ing">
          ${field('Name', text(`${p}.name`, i.name, 'placeholder="e.g. Boneless skinless chicken breast"'))}
          ${field('Per serving', num(`${p}.qtyPerServing`, i.qtyPerServing, 'min="0" step="any"'))}
          ${field('Unit', `<select data-path="${p}.unit" data-rerender>${UNITS.map(u => opt(u, u, i.unit)).join('')}</select>`)}
          ${field('Aisle', `<select data-path="${p}.group">${GROUPS.map(g => opt(g, g, i.group)).join('')}</select>`)}
          ${field('Prep (optional)', text(`${p}.prep`, i.prep, 'placeholder="e.g. diced"'))}
        </div>
        <label class="inline-check"><input type="checkbox" data-path="${p}.pantry" data-kind="bool" data-rerender ${i.pantry ? 'checked' : ''}>
          Pantry staple (spices, oil, rice…). Not counted in the zero-waste math.</label>
        ${i.pantry ? '' : `
        <div class="field-grid field-grid--pkg">
          ${field(`Package size (${esc(i.unit)})`, num(`${p}.package.size`, i.package?.size, 'min="0" step="any"'), 'How much comes in one package')}
          ${field('Package name', text(`${p}.package.label`, i.package?.label, 'placeholder="e.g. 2 lb family pack"'))}
        </div>`}
      </li>`;
  }

  function ingredientsHTML(m) {
    const max = RULES.maxIngredients;
    return `
      <h2>Ingredients <small class="muted">${m.ingredients.length} of ${max}</small></h2>
      <p class="muted small">Amounts are <b>per serving</b>. Include spices and oil. They count toward the ${max}-ingredient limit.</p>
      <ol class="ed-list">${m.ingredients.map((i, k) => ingredientHTML(i, k, m.ingredients.length)).join('')}</ol>
      <button type="button" class="btn btn-ghost btn-small" data-ed="ing-add" ${m.ingredients.length >= max ? 'disabled' : ''}>+ Add ingredient</button>`;
  }

  function stepHTML(s, k, m) {
    const p = `steps.${k}`;
    const others = m.steps.filter(o => o.id !== s.id);
    return `
      <li class="ed-row">
        <div class="ed-row-head">
          <b>Step ${k + 1}</b>
          <span class="ed-row-tools">
            <button type="button" class="icon-btn" data-ed="step-up" data-i="${k}" aria-label="Move step ${k + 1} up" ${k === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="icon-btn" data-ed="step-remove" data-i="${k}" aria-label="Remove step ${k + 1}" ${m.steps.length <= 1 ? 'disabled' : ''}>✕</button>
          </span>
        </div>
        ${field('Short title', text(`${p}.title`, s.title, 'placeholder="e.g. Air-fry the chicken"'))}
        ${field('Instructions', area(`${p}.detail`, s.detail, '', 'rows="2"'))}
        <div class="field-grid field-grid--step">
          ${field('Minutes', num(`${p}.durationMin`, s.durationMin, 'min="0" step="1"'))}
          ${field('Appliance', `<select data-path="${p}.appliance" data-kind="nullable">${opt('', 'None (counter work)', s.appliance || '')}${Object.entries(APPLIANCES)
            .filter(([, a]) => !a.dessertOnly || m.category === 'dessert' || s.appliance === 'creami')
            .map(([key, a]) => opt(key, a.label, s.appliance || '')).join('')}</select>`)}
          ${field('Bigger batches', `<select data-path="${p}.durationScaling" data-kind="num">${SCALING.map(([v, l]) => opt(v, l, s.durationScaling)).join('')}${SCALING.some(([v]) => v === s.durationScaling) ? '' : opt(s.durationScaling, `Custom (${s.durationScaling})`, s.durationScaling)}</select>`)}
        </div>
        <label class="inline-check"><input type="checkbox" data-path="${p}.active" data-kind="bool" ${s.active ? 'checked' : ''}>
          Hands-on (someone has to be working). Leave unticked for simmering, baking or pressure cooking.</label>
        ${others.length ? `
        <div class="deps"><span class="field-label">Starts after</span>
          ${others.map(o => `<label class="check check--sm"><input type="checkbox" data-dep="${k}" value="${esc(o.id)}" ${s.dependsOn.includes(o.id) ? 'checked' : ''}><span>${m.steps.indexOf(o) + 1}. ${esc(o.title || 'Untitled step')}</span></label>`).join('')}
        </div>` : ''}
      </li>`;
  }

  function stepsHTML(m) {
    return `
      <h2>Steps</h2>
      <p class="muted small">Times are for the servings above. Mark what must finish first, and PrepDash builds the parallel timeline. Hands-on time must stay under ${RULES.maxActiveMinutes} minutes.</p>
      <ol class="ed-list">${m.steps.map((s, k) => stepHTML(s, k, m)).join('')}</ol>
      <button type="button" class="btn btn-ghost btn-small" data-ed="step-add">+ Add step</button>`;
  }

  function storageHTML(m) {
    return `
      <h2>Storage & tips</h2>
      <div class="field-grid">
        ${field('Days in the fridge', num('storage.fridgeDays', m.storage.fridgeDays, 'min="0" step="1"'))}
        ${field('Months in the freezer', num('storage.freezerMonths', m.storage.freezerMonths, 'min="0" step="1"'))}
      </div>
      ${field('How to reheat', area('storage.reheat', m.storage.reheat, '', 'rows="2" placeholder="e.g. Microwave 2 minutes, stirring halfway"'))}
      ${field('Tips (one per line, optional)', area('notes', m.notes.join('\n'), 'lines', 'rows="3"'))}`;
  }

  const SECTIONS = { basics: basicsHTML, photo: photoHTML, nutrition: nutritionHTML, ingredients: ingredientsHTML, steps: stepsHTML, storage: storageHTML };

  function formHTML(m) {
    return `
      <details class="panel ed-import">
        <summary>Have the recipe as JSON (e.g. from Gemini)? Paste it here</summary>
        <textarea id="ed-json" rows="6" placeholder='{ "name": "…", "ingredients": [ … ], … }'></textarea>
        <button type="button" class="btn btn-ghost btn-small" data-ed="import">Fill in the form</button>
        <small class="field-hint" id="ed-json-msg"></small>
      </details>
      ${Object.keys(SECTIONS).map(k => `<section class="panel ed-section" data-sec="${k}">${SECTIONS[k](m)}</section>`).join('')}`;
  }

  function checksHTML(m, { canSave, saving, isEdit }) {
    let result;
    try { result = PrepDash.RecipeService.validate(toRecipe(m)); } catch (err) {
      result = { ok: false, checks: [], errors: [`Incomplete recipe: ${err.message}`] };
    }
    const failedChecks = new Set(result.checks.filter(c => !c.ok).map(c => c.label));
    const extra = result.errors.filter(e => !result.checks.some(c => !c.ok && e === c.label));
    const show = [...result.checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✗'} ${esc(c.label)}</li>`),
      ...extra.filter(e => !failedChecks.has(e)).slice(0, 6).map(e => `<li class="bad">✗ ${esc(e)}</li>`)];
    return {
      ok: result.ok,
      html: `
        <h2>Rule check</h2>
        <p class="muted small">${result.ok ? 'Everything checks out.' : 'Save unlocks once every rule passes.'}</p>
        <ul class="ed-checks">${show.join('')}</ul>
        <button type="button" class="btn btn-primary btn-block" data-ed="save" ${result.ok && canSave && !saving ? '' : 'disabled'}>
          ${saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish recipe'}</button>
        ${canSave ? '' : '<p class="muted small">Sign in and pick a username to publish.</p>'}`,
    };
  }

  /* ---------------------------------------------------------- behavior */

  function setPath(obj, path, value) {
    const keys = path.split('.');
    let o = obj;
    keys.slice(0, -1).forEach((k, idx) => {
      if (o[k] == null) o[k] = /^\d+$/.test(keys[idx + 1]) ? [] : {};
      o = o[k];
    });
    o[keys[keys.length - 1]] = value;
  }

  function parse(el) {
    const kind = el.dataset.kind;
    if (kind === 'bool') return el.checked;
    if (kind === 'num') return el.value === '' ? '' : +el.value;
    if (kind === 'int') return parseInt(el.value, 10) || 0;
    if (kind === 'nullable') return el.value || null;
    if (kind === 'lines') return el.value.split('\n');
    return el.value;
  }

  /** Shrinks a photo to ≤ 1000 px and re-encodes it as a data: URL small enough for Firestore. */
  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let size = 1000, quality = 0.82, out = '';
        for (let tries = 0; tries < 8; tries++) {
          const scale = Math.min(1, size / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          out = c.toDataURL('image/webp', quality);
          if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', quality);
          if (out.length <= MAX_PHOTO_CHARS) return resolve(out);
          size *= 0.85; quality = Math.max(0.5, quality - 0.07);
        }
        reject(new Error('That photo is too large even after shrinking.'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file isn\'t an image this browser can read.')); };
      img.src = url;
    });
  }

  /**
   * Mounts the editor into `root`.
   * @param {{recipe?:object, isEdit?:boolean, canSave:()=>boolean, onSave:(recipe)=>Promise<void>, onDirty?:()=>void}} opts
   */
  function mount(root, opts) {
    const m = normalize(opts.recipe || blank());
    const $ = sel => root.querySelector(sel);
    let saving = false;

    root.querySelector('.editor-form').innerHTML = formHTML(m);

    const rerender = sec => { const el = $(`[data-sec="${sec}"]`); if (el) el.innerHTML = SECTIONS[sec](m); };
    function refreshChecks() {
      const { html } = checksHTML(m, { canSave: opts.canSave(), saving, isEdit: opts.isEdit });
      $('#editor-check').innerHTML = html;
    }
    const changed = () => { opts.onDirty && opts.onDirty(); refreshChecks(); };

    root.addEventListener('input', e => {
      const el = e.target;
      if (el.dataset.path && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
        setPath(m, el.dataset.path, parse(el));
        if (el.dataset.path.startsWith('source.')) {
          m.source = m.source || { name: '', url: '' };
        }
        if (el.dataset.path.startsWith('nutritionPerServing.')) {
          const n = m.nutritionPerServing;
          const k = (+n.protein || 0) * 4 + (+n.carbs || 0) * 4 + (+n.fat || 0) * 9;
          const sum = $('#macro-sum b');
          if (sum) sum.textContent = `${fmtNum(k)} kcal`;
        }
        if (/^steps\.\d+\.title$/.test(el.dataset.path)) {
          // Keep the "Starts after" labels in sync without stealing focus.
          const k = +el.dataset.path.split('.')[1];
          root.querySelectorAll(`[data-dep] + span`).forEach(span => {
            const input = span.previousElementSibling;
            if (input.value === m.steps[k].id) span.textContent = `${k + 1}. ${m.steps[k].title || 'Untitled step'}`;
          });
        }
        changed();
      }
    });

    root.addEventListener('change', async e => {
      const el = e.target;
      if (el.matches('[data-photo]')) {
        const file = el.files[0];
        if (!file) return;
        $('#photo-msg').textContent = 'Shrinking photo…';
        try {
          m.image.url = await shrinkPhoto(file);
          rerender('photo');
          changed();
        } catch (err) {
          $('#photo-msg').textContent = err.message;
        }
        return;
      }
      if (el.dataset.tag) {
        const t = el.dataset.tag;
        m.tags = el.checked ? [...new Set([...m.tags, t])] : m.tags.filter(x => x !== t);
        return changed();
      }
      if (el.dataset.dep) {
        const s = m.steps[+el.dataset.dep];
        s.dependsOn = el.checked ? [...new Set([...s.dependsOn, el.value])] : s.dependsOn.filter(d => d !== el.value);
        return changed();
      }
      if (!el.dataset.path || (el.type !== 'checkbox' && el.tagName !== 'SELECT')) return;
      if (el.dataset.kind === 'container') {
        Object.assign(m, CONTAINERS.find(c => c.container === el.value) || CONTAINERS[0]);
      } else {
        setPath(m, el.dataset.path, parse(el));
      }
      if (el.dataset.path === 'category') {
        m.steps.forEach(s => { if (s.appliance === 'creami' && m.category !== 'dessert') s.appliance = null; });
        if (m.category === 'dessert' && m.steps.some(s => s.appliance === 'creami')) Object.assign(m, CONTAINERS[1]);
        rerender('basics');
        rerender('steps');
      } else if (/^ingredients\.\d+\.(unit|pantry)$/.test(el.dataset.path)) {
        rerender('ingredients');
      }
      changed();
    });

    root.addEventListener('click', async e => {
      const el = e.target.closest('[data-ed]');
      if (!el) return;
      e.preventDefault();
      const k = +el.dataset.i;
      switch (el.dataset.ed) {
        case 'ing-add': m.ingredients.push(blankIngredient()); rerender('ingredients'); break;
        case 'ing-remove': m.ingredients.splice(k, 1); rerender('ingredients'); break;
        case 'step-add': m.steps.push(blankStep()); rerender('steps'); break;
        case 'step-remove': {
          const [gone] = m.steps.splice(k, 1);
          m.steps.forEach(s => { s.dependsOn = s.dependsOn.filter(d => d !== gone.id); });
          rerender('steps');
          break;
        }
        case 'step-up': [m.steps[k - 1], m.steps[k]] = [m.steps[k], m.steps[k - 1]]; rerender('steps'); break;
        case 'photo-remove': m.image.url = ''; rerender('photo'); break;
        case 'import': {
          const msg = $('#ed-json-msg');
          try {
            let data = JSON.parse($('#ed-json').value.trim().replace(/^```(json)?|```$/g, ''));
            if (Array.isArray(data)) data = data.flat()[0];
            if (!data || typeof data !== 'object') throw new Error('Expected one recipe object.');
            const keepPhoto = m.image.url;
            Object.keys(m).forEach(key => delete m[key]);
            Object.assign(m, normalize(data));
            if (keepPhoto && !keepPhoto.includes('placehold.co')) m.image.url = keepPhoto;
            else if (!/^(data:|https:)/.test(m.image.url) || m.image.url.includes('placehold.co')) m.image.url = '';
            Object.keys(SECTIONS).forEach(rerender);
            $('#ed-json-msg').textContent = '✓ Form filled in. Check it over below.';
          } catch (err) {
            msg.textContent = `Couldn't read that: ${err.message}`;
          }
          break;
        }
        case 'save': {
          saving = true;
          refreshChecks();
          try { await opts.onSave(toRecipe(m)); } finally { saving = false; if (root.isConnected) refreshChecks(); }
          return;
        }
        default: return;
      }
      changed();
    });

    refreshChecks();
    return { refresh: refreshChecks };
  }

  return { blank, normalize, toRecipe, mount };
})();
