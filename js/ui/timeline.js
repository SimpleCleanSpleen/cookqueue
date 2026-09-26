/**
 * PrepDash — Gantt timeline renderer.
 *
 * Renders a scheduler result as lanes:
 *   - one lane per cook (active, clickable bars → reassign cook)
 *   - "hands-off" lanes per appliance (passive bars)
 * Long idle stretches with no hands-on work (e.g. a 24 hr freeze) are
 * visually compressed with a break marker so short steps stay readable.
 */
window.PrepDash = window.PrepDash || {};

PrepDash.Timeline = (function () {
  const { esc, fmtClock, fmtMinutes } = PrepDash.util;
  const { APPLIANCES, COOKS } = PrepDash.config;
  const { cookAvatar } = PrepDash.ui;

  const GAP_THRESHOLD = 90; // minutes of hands-off time before compressing
  const GAP_VISUAL = 18;    // how many "visual minutes" a compressed gap takes

  /** Piecewise time → visual scale that squeezes long hands-off gaps. */
  function buildScale(result) {
    const busy = result.tasks.filter(t => t.active).map(t => [t.start, t.end]).sort((a, b) => a[0] - b[0]);
    const merged = [];
    busy.forEach(([s, e]) => {
      const last = merged[merged.length - 1];
      if (last && s <= last[1]) last[1] = Math.max(last[1], e); else merged.push([s, e]);
    });
    const gaps = [];
    let cursor = 0;
    merged.forEach(([s, e]) => { if (s > cursor) gaps.push([cursor, s]); cursor = Math.max(cursor, e); });
    if (result.makespan > cursor) gaps.push([cursor, result.makespan]);
    const breaks = gaps.filter(([s, e]) => e - s > GAP_THRESHOLD);

    const segs = [];
    let real = 0, vis = 0;
    breaks.forEach(([s, e]) => {
      segs.push({ r0: real, r1: s, v0: vis, v1: vis + (s - real) }); vis += s - real;
      segs.push({ r0: s, r1: e, v0: vis, v1: vis + GAP_VISUAL, compressed: true }); vis += GAP_VISUAL;
      real = e;
    });
    segs.push({ r0: real, r1: result.makespan, v0: vis, v1: vis + (result.makespan - real) });
    const total = segs[segs.length - 1].v1 || 1;

    const map = t => {
      const seg = segs.find(s => t >= s.r0 && t <= s.r1) || segs[segs.length - 1];
      const span = seg.r1 - seg.r0 || 1;
      return ((seg.v0 + ((t - seg.r0) / span) * (seg.v1 - seg.v0)) / total) * 100;
    };
    const inBreak = t => breaks.some(([s, e]) => t > s && t < e);
    return { map, breaks, total, inBreak };
  }

  function ticks(result, scale) {
    const step = scale.total <= 40 ? 5 : scale.total <= 100 ? 10 : 15;
    const out = [];
    for (let t = 0; t <= result.makespan; t += step) if (!scale.inBreak(t)) out.push(t);
    scale.breaks.forEach(([, e]) => { if (!out.includes(e)) out.push(e); });
    return out.sort((a, b) => a - b);
  }

  /** Greedy row packing for passive steps that overlap on the same appliance. */
  function passiveLanes(tasks) {
    const groups = {};
    tasks.filter(t => !t.active).forEach(t => {
      const key = t.appliance || 'rest';
      const rows = (groups[key] ||= []);
      let row = rows.find(r => r.every(o => o.end <= t.start || o.start >= t.end));
      if (!row) { row = []; rows.push(row); }
      row.push(t);
    });
    return Object.entries(groups).flatMap(([key, rows]) =>
      rows.map((row, i) => ({
        key,
        label: key === 'rest' ? 'Resting' : APPLIANCES[key]?.short || key,
        suffix: rows.length > 1 ? ` ${i + 1}` : '',
        tasks: row,
      })));
  }

  function bar(t, scale, cooks) {
    const left = scale.map(t.start);
    const width = Math.max(scale.map(t.end) - left, 0.8);
    const range = `${fmtClock(t.start)}–${fmtClock(t.end)}`;
    if (t.active) {
      const next = (t.cook + 1) % cooks;
      const tip = `${t.title} · ${fmtMinutes(t.duration)} · ${range}` +
        (cooks > 1 ? ` · click to hand to ${COOKS[next].name}` : '');
      return `<button type="button" class="bar bar--active ${t.pinned ? 'is-pinned' : ''}" style="left:${left}%;width:${width}%;--c:${COOKS[t.cook].color}"
        data-action="task-cycle" data-task="${esc(t.id)}" title="${esc(tip)}" ${cooks < 2 ? 'aria-disabled="true"' : ''}>
        <span class="bar-text">${t.pinned ? '📌 ' : ''}${esc(t.title)}</span></button>`;
    }
    return `<div class="bar bar--passive" style="left:${left}%;width:${width}%" data-task="${esc(t.id)}"
      title="${esc(`${t.title} (hands-off) · ${fmtMinutes(t.duration)} · ${range}`)}">
      <span class="bar-text">${esc(t.title)}</span></div>`;
  }

  function breakMarkers(scale) {
    return scale.breaks.map(([s, e]) => {
      const l = scale.map(s), w = scale.map(e) - l;
      return `<div class="gantt-break" style="left:${l}%;width:${w}%"></div>`;
    }).join('');
  }

  function render(result) {
    const scale = buildScale(result);
    const cookLanes = Array.from({ length: result.cooks }, (_, i) => ({
      i, tasks: result.tasks.filter(t => t.active && t.cook === i),
    }));
    const pLanes = passiveLanes(result.tasks);
    const breaks = breakMarkers(scale);

    const axis = ticks(result, scale).map(t =>
      `<span class="tick" style="left:${scale.map(t)}%">${fmtClock(t)}</span>`).join('') +
      scale.breaks.map(([s, e]) =>
        `<span class="tick tick--break" style="left:${(scale.map(s) + scale.map(e)) / 2}%">⏸ ${fmtMinutes(e - s)}</span>`).join('');

    return `
      <div class="gantt-scroll">
        <div class="gantt">
          <div class="gantt-row gantt-axis-row">
            <div class="lane-label"></div>
            <div class="gantt-axis">${axis}</div>
          </div>
          ${cookLanes.map(l => `
            <div class="gantt-row">
              <div class="lane-label">${cookAvatar(l.i)}<span>${COOKS[l.i].name}<small>${fmtMinutes(result.cookLoads[l.i])} busy</small></span></div>
              <div class="lane-track">${breaks}${l.tasks.map(t => bar(t, scale, result.cooks)).join('')}</div>
            </div>`).join('')}
          ${pLanes.length ? `<div class="gantt-divider"><span>Hands-off: the appliance does the work</span></div>` : ''}
          ${pLanes.map(l => `
            <div class="gantt-row gantt-row--passive">
              <div class="lane-label"><span class="appliance-dot" data-appliance="${esc(l.key)}"></span><span>${esc(l.label + l.suffix)}</span></div>
              <div class="lane-track">${breaks}${l.tasks.map(t => bar(t, scale, result.cooks)).join('')}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /** Readable, ordered instruction list that mirrors the chart. */
  function stepList(result) {
    return result.tasks.map((t, idx) => {
      const who = t.active
        ? `<div class="step-assign" role="group" aria-label="Assign cook">
            ${Array.from({ length: result.cooks }, (_, c) =>
              `<button type="button" class="assign-btn ${c === t.cook ? 'is-on' : ''}" style="--c:${COOKS[c].color}"
                data-action="task-assign" data-task="${esc(t.id)}" data-cook="${c}"
                aria-pressed="${c === t.cook}" title="Assign to ${COOKS[c].name}">${c + 1}</button>`).join('')}
          </div>`
        : `<span class="handsoff-chip">Hands-off${t.appliance ? ` · ${esc(APPLIANCES[t.appliance]?.short || t.appliance)}` : ''}</span>`;
      return `
        <li class="step ${t.active ? '' : 'step--passive'}" data-task="${esc(t.id)}" style="--c:${t.active ? COOKS[t.cook].color : 'var(--muted-2)'}">
          <span class="step-num">${idx + 1}</span>
          <div class="step-body">
            <div class="step-head">
              <span class="step-time">${fmtClock(t.start)}–${fmtClock(t.end)}</span>
              <h4>${esc(t.title)}</h4>
              <span class="step-dur">${fmtMinutes(t.duration)}</span>
            </div>
            <p>${esc(t.detail)}</p>
          </div>
          ${who}
        </li>`;
    }).join('');
  }

  return { render, stepList };
})();
