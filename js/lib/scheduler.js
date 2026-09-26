/**
 * CookQueue — Parallel workflow scheduler (powers the Gantt timeline).
 *
 * Model
 *  - Each step has a duration, dependencies, and optionally an appliance.
 *  - ACTIVE steps need a cook; PASSIVE steps only occupy their appliance.
 *  - Appliances have a capacity (e.g. 4 burners, 2 oven racks, 1 Instant Pot).
 *
 * Algorithm: critical-path list scheduling with gap filling.
 *  1. Rank every step by the longest path from it to the end of the recipe.
 *  2. Repeatedly take the highest-ranked "ready" step (all deps placed).
 *  3. Place it at the earliest time where its deps are done AND a cook
 *     (if active) AND an appliance unit (if any) are all free, and fill
 *     idle gaps when it fits.
 *  4. Active steps go to whichever cook can start soonest, unless the user
 *     has pinned the step to a specific cook (`overrides`).
 */
window.CookQueue = window.CookQueue || {};

CookQueue.scheduler = (function () {
  const { APPLIANCES } = CookQueue.config;
  const { scaleDuration } = CookQueue.scaler;

  /** Earliest start ≥ t where [start, start+dur) doesn't overlap sorted intervals. */
  function fit(intervals, t, dur) {
    let start = t;
    for (const [s, e] of intervals) {
      if (e <= start) continue;
      if (s >= start + dur) break;
      start = e;
    }
    return start;
  }

  function insert(intervals, s, e) {
    intervals.push([s, e]);
    intervals.sort((a, b) => a[0] - b[0]);
  }

  function earliestUnit(units, t, dur) {
    let best = { start: Infinity, unit: -1 };
    units.forEach((iv, i) => {
      const s = fit(iv, t, dur);
      if (s < best.start) best = { start: s, unit: i };
    });
    return best;
  }

  /**
   * @param {object} recipe
   * @param {{servings:number, cooks:number, overrides?:Object<string,number>}} opts
   * @returns {{tasks:Array, makespan:number, activeTotal:number, cookLoads:number[], cooks:number}}
   */
  function schedule(recipe, { servings, cooks, overrides = {} }) {
    const tasks = recipe.steps.map((s, index) => ({
      ...s, index, duration: scaleDuration(s, servings, recipe.baseServings),
    }));
    const byId = Object.fromEntries(tasks.map(t => [t.id, t]));

    // 1. Critical-path rank
    const succ = Object.fromEntries(tasks.map(t => [t.id, []]));
    tasks.forEach(t => (t.dependsOn || []).forEach(d => succ[d] && succ[d].push(t.id)));
    const rank = {};
    const getRank = id => rank[id] ?? (rank[id] = byId[id].duration + Math.max(0, ...succ[id].map(getRank)));
    tasks.forEach(t => getRank(t.id));

    // Resources
    const cookIv = Array.from({ length: cooks }, () => []);
    const cookLoads = Array(cooks).fill(0);
    const applianceUnits = {};
    const unitsFor = key => {
      if (!key) return null;
      const cap = APPLIANCES[key]?.capacity ?? 1;
      if (!Number.isFinite(cap)) return null; // unlimited (freezer)
      return (applianceUnits[key] ||= Array.from({ length: cap }, () => []));
    };

    const done = {};
    const placed = [];

    while (placed.length < tasks.length) {
      const ready = tasks.filter(t => !done[t.id] && (t.dependsOn || []).every(d => done[d]));
      if (!ready.length) throw new Error(`Circular step dependencies in "${recipe.name}"`);
      ready.sort((a, b) => rank[b.id] - rank[a.id] || a.index - b.index);
      const t = ready[0];

      const est = Math.max(0, ...(t.dependsOn || []).map(d => done[d].end));
      const units = unitsFor(t.appliance);

      // Find a start time where both the cook and an appliance unit are free.
      const place = cook => {
        let s = est, unit = -1;
        for (let guard = 0; guard < 100; guard++) {
          let s2 = cook == null ? s : fit(cookIv[cook], s, t.duration);
          if (units) { const r = earliestUnit(units, s2, t.duration); s2 = r.start; unit = r.unit; }
          if (s2 === s) break;
          s = s2;
        }
        return { start: s, unit };
      };

      let slot, cook = null, pinned = false;
      if (t.active) {
        const forced = overrides[t.id];
        pinned = forced != null && forced < cooks;
        const candidates = pinned ? [forced] : [...Array(cooks).keys()];
        for (const c of candidates) {
          const p = place(c);
          if (!slot || p.start < slot.start || (p.start === slot.start && cookLoads[c] < cookLoads[cook])) {
            slot = p; cook = c;
          }
        }
        insert(cookIv[cook], slot.start, slot.start + t.duration);
        cookLoads[cook] += t.duration;
      } else {
        slot = place(null);
      }
      if (units && slot.unit >= 0) insert(units[slot.unit], slot.start, slot.start + t.duration);

      const rec = { ...t, start: slot.start, end: slot.start + t.duration, cook, unit: slot.unit, pinned };
      done[t.id] = rec;
      placed.push(rec);
    }

    placed.sort((a, b) => a.start - b.start || a.index - b.index);
    return {
      tasks: placed,
      makespan: Math.max(0, ...placed.map(t => t.end)),
      activeTotal: placed.filter(t => t.active).reduce((sum, t) => sum + t.duration, 0),
      cookLoads,
      cooks,
    };
  }

  /** Hands-on minutes at a given batch size (no scheduling needed). */
  function activeMinutes(recipe, servings = recipe.baseServings) {
    return recipe.steps.filter(s => s.active)
      .reduce((sum, s) => sum + scaleDuration(s, servings, recipe.baseServings), 0);
  }

  return { schedule, activeMinutes };
})();
