/**
 * CookQueue — Recipe Helper (add-a-recipe assist).
 *
 * Never calls an AI itself — it only builds a copy-paste prompt (see
 * js/lib/prompt-builder.js) for a free external chat, and imports whatever
 * JSON comes back through the exact same RecipeEditor.normalize() +
 * RecipeService.validate() + RecipeService.save() pipeline used everywhere
 * else. Two tabs on the "Add a recipe" page:
 *   - Single: a few quick questions + prompt, sitting above the editor's
 *     existing "Have it as JSON?" box.
 *   - Batch: paste a JSON array; recipes that pass validation are published
 *     immediately, recipes that fail land in a review queue (copy-a-fix-
 *     prompt, or edit manually in the normal editor).
 */
window.CookQueue = window.CookQueue || {};

CookQueue.RecipeHelper = (function () {
  const { esc, copyText } = CookQueue.util;
  const { APPLIANCES } = CookQueue.config;
  const PB = CookQueue.PromptBuilder;
  const Editor = CookQueue.RecipeEditor;
  const Service = CookQueue.RecipeService;
  const Cloud = CookQueue.Cloud;

  const CHAT_LINKS = [
    { label: 'ChatGPT', url: 'https://chat.openai.com/' },
    { label: 'Gemini', url: 'https://gemini.google.com/app' },
    { label: 'Claude', url: 'https://claude.ai/new' },
  ];
  const chatLinksHTML = () =>
    CHAT_LINKS.map(c => `<a class="btn btn-ghost btn-small" href="${c.url}" target="_blank" rel="noopener">Open ${c.label} ↗</a>`).join('');

  const fallbackHTML = id => `<div class="helper-fallback" id="${id}" hidden>
    <small class="field-hint">Your browser blocked auto-copy — select and copy this by hand:</small>
    <textarea rows="4" readonly></textarea>
  </div>`;

  /** Copies text; on failure, reveals `#fallbackId`'s textarea with the text selected. */
  async function copyOrFallback(text, btn, fallbackId, root) {
    const ok = await copyText(text);
    const fallback = root.querySelector(`#${fallbackId}`);
    if (ok) {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { if (btn.isConnected) btn.textContent = original; }, 1800);
      if (fallback) fallback.hidden = true;
    } else if (fallback) {
      fallback.hidden = false;
      const ta = fallback.querySelector('textarea');
      ta.value = text;
      ta.focus();
      ta.select();
    }
  }

  /* ---------------------------------------------------------- single-recipe helper panel */

  function singleHelperHTML() {
    const appliances = Object.entries(APPLIANCES).filter(([, a]) => !a.storage);
    return `
      <details class="panel ed-helper" open>
        <summary>✨ Not sure where to start? Answer 3 quick questions</summary>
        <p class="muted small">This builds a prompt for a free AI chat that already knows CookQueue's rules. Paste its reply into "Have it as JSON?" below.</p>
        <label class="field"><span class="field-label">Dish name or idea</span>
          <input type="text" data-helper="dish" placeholder="e.g. lemony chicken orzo soup"></label>
        <label class="field"><span class="field-label">Ingredients you already have (optional)</span>
          <input type="text" data-helper="have" placeholder="e.g. chicken thighs, orzo, spinach"></label>
        <fieldset class="tag-picks">
          <legend class="field-label">Appliances available (optional)</legend>
          ${appliances.map(([k, a]) => `<label class="check check--sm"><input type="checkbox" data-helper-app="${k}"><span>${esc(a.short)}</span></label>`).join('')}
        </fieldset>
        <div class="helper-actions">
          <button type="button" class="btn btn-primary btn-small" data-helper="copy-single">📋 Copy AI Prompt</button>
          ${chatLinksHTML()}
        </div>
        ${fallbackHTML('helper-fallback-single')}
      </details>`;
  }

  /** Inserts the single-recipe helper panel right before the editor's "Have it as JSON?" box. */
  function attachSingleHelper(root) {
    const importPanel = root.querySelector('.ed-import');
    if (!importPanel || root.querySelector('.ed-helper')) return;
    importPanel.insertAdjacentHTML('beforebegin', singleHelperHTML());
    const panel = importPanel.previousElementSibling;
    panel.querySelector('[data-helper="copy-single"]').addEventListener('click', async e => {
      const dishName = panel.querySelector('[data-helper="dish"]').value.trim();
      const ingredientsOnHand = panel.querySelector('[data-helper="have"]').value.trim();
      const appliances = [...panel.querySelectorAll('[data-helper-app]:checked')].map(el => APPLIANCES[el.dataset.helperApp].short);
      const prompt = PB.buildSingleRecipePrompt({ dishName, ingredientsOnHand, appliances });
      await copyOrFallback(prompt, e.currentTarget, 'helper-fallback-single', panel);
      importPanel.open = true;
    });
  }

  /* ---------------------------------------------------------- batch helper + review queue */

  function stripFences(text) {
    return text.trim().replace(/^```(json)?|```$/g, '');
  }

  function recipeLabel(raw) {
    return (raw && typeof raw === 'object' && typeof raw.name === 'string' && raw.name.trim()) || '(untitled recipe)';
  }

  function queueItemHTML(item, i) {
    if (item.status === 'published') {
      return `<li class="queue-item queue-item--ok" data-i="${i}">
        <span class="queue-badge queue-badge--ok" aria-hidden="true">✓</span>
        <div class="queue-body"><b>${esc(recipeLabel(item.raw))}</b><span class="muted small">Published</span></div>
        <a class="btn btn-ghost btn-small" href="#/recipe/${esc(item.id)}">View</a>
      </li>`;
    }
    if (item.status === 'publishing') {
      return `<li class="queue-item" data-i="${i}">
        <span class="queue-badge queue-badge--pending" aria-hidden="true">…</span>
        <div class="queue-body"><b>${esc(recipeLabel(item.raw))}</b><span class="muted small">Publishing…</span></div>
      </li>`;
    }
    // 'failed'
    const errors = item.errors || [];
    return `<li class="queue-item queue-item--fail" data-i="${i}">
      <span class="queue-badge queue-badge--fail" aria-hidden="true">✕</span>
      <div class="queue-body">
        <b>${esc(recipeLabel(item.raw))}</b>
        <ul class="ed-checks">${errors.slice(0, 4).map(e => `<li class="bad">✗ ${esc(e)}</li>`).join('')}</ul>
        <div class="helper-actions">
          <button type="button" class="btn btn-primary btn-small" data-batch="copy-fix" data-i="${i}">🤖 Copy Fix Prompt</button>
          <button type="button" class="btn btn-ghost btn-small" data-batch="edit" data-i="${i}">✏️ Edit manually</button>
        </div>
        ${fallbackHTML(`helper-fallback-fix-${i}`)}
        <div class="batch-manual-editor" data-manual="${i}" hidden></div>
      </div>
    </li>`;
  }

  function batchHelperHTML() {
    return `
      <div class="batch-helper">
        <div class="panel">
          <h2>📋 Describe several recipes</h2>
          <p class="muted small">Ramble about a few recipes — cuisines, proteins, whatever you've got. The AI will ask follow-up questions until it has enough to satisfy the site's rules for each one.</p>
          <textarea id="batch-ramble" rows="6" placeholder="e.g. I want a Thai peanut chicken bowl, a vegan chili, and something with salmon…"></textarea>
          <div class="helper-actions">
            <button type="button" class="btn btn-primary btn-small" data-batch="copy-prompt">📋 Copy AI Prompt</button>
            ${chatLinksHTML()}
          </div>
          ${fallbackHTML('helper-fallback-batch')}
        </div>
        <div class="panel">
          <h2>Paste the results</h2>
          <p class="muted small">Paste the JSON array the AI gives you back. Recipes that pass are published right away; anything that fails lands below so you can fix it.</p>
          <textarea id="batch-json" rows="8" placeholder="[ { &quot;name&quot;: &quot;…&quot;, … }, … ]"></textarea>
          <button type="button" class="btn btn-primary" data-batch="process">Process recipes</button>
          <small class="field-hint" id="batch-parse-msg"></small>
        </div>
        <div id="batch-summary"></div>
        <ul id="batch-queue" class="queue-list"></ul>
      </div>`;
  }

  /**
   * Mounts batch mode into `root`. `opts` is the same shape app.js passes to
   * the editor ({canSave, onDirty}); batch mode calls RecipeService.save()
   * directly rather than opts.onSave, so a successful publish stays on this
   * page (in the queue) instead of navigating to the new recipe.
   */
  function mountBatch(root, opts) {
    root.innerHTML = batchHelperHTML();
    const $ = sel => root.querySelector(sel);
    let queue = []; // { raw, normalized, status: 'pending'|'failed'|'publishing'|'published', errors, id }
    const openEdit = new Set(); // indices with their inline "edit manually" editor open
    const editorApis = new Map(); // index -> mounted RecipeEditor api, for refresh()

    function updateSummary() {
      const published = queue.filter(q => q.status === 'published').length;
      const failed = queue.filter(q => q.status === 'failed').length;
      $('#batch-summary').innerHTML = queue.length
        ? `<p class="muted small">${published} of ${queue.length} published${failed ? `, ${failed} need${failed > 1 ? '' : 's'} a fix` : ''}.</p>` : '';
      opts.setDirty?.(queue.some(q => q.status === 'failed'));
    }

    /**
     * Redraws one queue item in place. Never touches an item whose inline
     * editor is currently open — a concurrent publish elsewhere in the queue
     * must not blow away someone's in-progress fix.
     */
    function updateItem(i) {
      if (openEdit.has(i)) { updateSummary(); return; }
      const html = queueItemHTML(queue[i], i);
      const existing = $(`#batch-queue li[data-i="${i}"]`);
      if (existing) existing.outerHTML = html;
      else $('#batch-queue').insertAdjacentHTML('beforeend', html);
      updateSummary();
    }

    async function publish(i) {
      queue[i].status = 'publishing';
      updateItem(i);
      try {
        queue[i].id = await Service.save(queue[i].normalized);
        queue[i].status = 'published';
      } catch (err) {
        queue[i].status = 'failed';
        queue[i].errors = [err.message || 'Could not publish.'];
      }
      updateItem(i);
    }

    async function processBatch() {
      const raw = $('#batch-json').value;
      const msg = $('#batch-parse-msg');
      let data;
      try {
        data = JSON.parse(stripFences(raw));
      } catch (err) {
        msg.textContent = `Couldn't read that: ${err.message}`;
        Cloud?.logFailedImport?.({ rawInput: raw, errors: [err.message], context: 'batch-parse' });
        return;
      }
      const list = (Array.isArray(data) ? data : [data]).filter(x => x && typeof x === 'object');
      if (!list.length) { msg.textContent = 'Expected a JSON array of recipe objects.'; return; }
      msg.textContent = '';
      if (!opts.canSave()) { msg.textContent = 'Sign in and pick a username to publish.'; return; }

      const startIndex = queue.length;
      const newItems = list.map(item => {
        let normalized, result;
        try {
          normalized = Editor.normalize(item);
          result = Service.validate(normalized);
        } catch (err) {
          result = { ok: false, errors: [`Malformed recipe: ${err.message}`] };
        }
        if (!result.ok) Cloud?.logFailedImport?.({ rawInput: JSON.stringify(item), errors: result.errors, context: 'batch-item' });
        return { raw: item, normalized, status: result.ok ? 'pending' : 'failed', errors: result.ok ? [] : result.errors };
      });
      queue = queue.concat(newItems);
      newItems.forEach((_, k) => updateItem(startIndex + k));
      for (let k = 0; k < newItems.length; k++) if (newItems[k].status === 'pending') await publish(startIndex + k);
    }

    root.addEventListener('click', async e => {
      if (e.target.matches('[data-batch="copy-prompt"]')) {
        const prompt = PB.buildBatchPrompt({ ramble: $('#batch-ramble').value.trim() });
        await copyOrFallback(prompt, e.target, 'helper-fallback-batch', root);
        return;
      }
      if (e.target.matches('[data-batch="process"]')) { processBatch(); return; }

      const fixBtn = e.target.closest('[data-batch="copy-fix"]');
      if (fixBtn) {
        const item = queue[+fixBtn.dataset.i];
        const prompt = PB.buildFixPrompt({ recipe: item.raw, errors: item.errors });
        await copyOrFallback(prompt, fixBtn, `helper-fallback-fix-${fixBtn.dataset.i}`, root);
        return;
      }

      const editBtn = e.target.closest('[data-batch="edit"]');
      if (editBtn) {
        const i = +editBtn.dataset.i;
        const item = queue[i];
        const holder = root.querySelector(`[data-manual="${i}"]`);
        if (!holder) return; // item was redrawn (e.g. published elsewhere) since this button rendered
        if (holder.hidden) {
          openEdit.add(i);
          holder.hidden = false;
          holder.innerHTML = `<div class="editor-layout"><form class="editor-form" novalidate></form><aside class="editor-side"><div class="panel" id="editor-check"></div></aside></div>`;
          editorApis.set(i, Editor.mount(holder, {
            recipe: item.raw, isEdit: false,
            canSave: opts.canSave,
            onDirty: opts.onDirty,
            onSave: async r => {
              try {
                item.id = await Service.save(r);
                item.status = 'published';
                openEdit.delete(i);
                editorApis.delete(i);
                updateItem(i);
                opts.toast?.(`🎉 Published <b>${esc(r.name)}</b>`);
              } catch (err) {
                console.error(err);
                opts.toast?.(`⚠ ${esc(err.message || 'Something went wrong.')}`);
              }
            },
          }));
        } else {
          openEdit.delete(i);
          editorApis.delete(i);
          holder.hidden = true;
          holder.innerHTML = '';
        }
        return;
      }
    });

    updateSummary();
    return { refresh: () => editorApis.forEach(api => api.refresh()) };
  }

  /* ---------------------------------------------------------- top-level mount */

  function tabsHTML(active) {
    return `<div class="mode-tabs" role="tablist">
      <button type="button" class="mode-tab ${active === 'single' ? 'is-active' : ''}" data-mode="single" role="tab" aria-selected="${active === 'single'}">📝 One recipe</button>
      <button type="button" class="mode-tab ${active === 'batch' ? 'is-active' : ''}" data-mode="batch" role="tab" aria-selected="${active === 'batch'}">📋 Several at once</button>
    </div>`;
  }

  /**
   * Mounts the whole "Add a recipe" page into `root`: mode tabs, then either
   * the normal single-recipe editor (with the Helper panel attached) or
   * batch mode. `opts` = { canSave, onDirty, onSave } as recipe-editor.js
   * expects for a new (non-edit) recipe.
   */
  function mountAddPage(root, opts) {
    let mode = 'single';
    let api = { refresh: () => {} };

    function renderSingle(body) {
      body.innerHTML = `<div class="editor-layout"><form class="editor-form" novalidate></form><aside class="editor-side"><div class="panel" id="editor-check"></div></aside></div>`;
      api = Editor.mount(body, { recipe: null, isEdit: false, canSave: opts.canSave, onDirty: opts.onDirty, onSave: opts.onSave });
      attachSingleHelper(body);
    }

    function render() {
      root.innerHTML = `${tabsHTML(mode)}<div id="add-body"></div>`;
      const body = root.querySelector('#add-body');
      if (mode === 'single') renderSingle(body);
      else api = mountBatch(body, { canSave: opts.canSave, onDirty: opts.onDirty, setDirty: opts.setDirty, toast: opts.toast });
    }

    root.addEventListener('click', e => {
      const tab = e.target.closest('[data-mode]');
      if (!tab || tab.dataset.mode === mode) return;
      mode = tab.dataset.mode;
      render();
    });

    render();
    return { refresh: () => api.refresh() };
  }

  return { mountAddPage };
})();
