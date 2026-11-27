/* ==========================================================================
   CLAT MOCK-1 — On-screen pen: highlight / underline / erase  (js/annotate.js)
   Annotations are stored per passage as:  { p: paragraphIndex, s: start, e: end, t: 'h'|'u', c: colour }
   The same renderer is used on screen AND in the downloadable paper.
   ========================================================================== */

export const HL = { yellow: '#fde047', green: '#86efac', pink: '#f9a8d4', blue: '#93c5fd' };
export const UL = { yellow: '#ca8a04', green: '#15803d', pink: '#be185d', blue: '#1d4ed8' };
export const PEN_COLORS = Object.keys(HL);

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderParagraph(text, anns = []) {
  const len = text.length;
  const pts = new Set([0, len]);
  anns.forEach((a) => { pts.add(Math.max(0, Math.min(len, a.s))); pts.add(Math.max(0, Math.min(len, a.e))); });
  const arr = [...pts].sort((x, y) => x - y);

  let out = '';
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i], b = arr[i + 1];
    if (a === b) continue;
    const seg = text.slice(a, b);
    const active = anns.filter((x) => x.s <= a && x.e >= b);
    if (!active.length) { out += esc(seg); continue; }

    const h = [...active].reverse().find((x) => x.t === 'h');
    const u = [...active].reverse().find((x) => x.t === 'u');
    let style = '';
    if (h) style += `background:${HL[h.c] || HL.yellow};`;
    if (u) style += `text-decoration:underline;text-decoration-color:${UL[u.c] || UL.blue};text-decoration-thickness:2px;text-underline-offset:3px;`;
    out += `<span class="ann" data-a="${a}" data-b="${b}" style="${style}">${esc(seg)}</span>`;
  }
  return out;
}

function offsetIn(pEl, node, off) {
  const r = document.createRange();
  r.selectNodeContents(pEl);
  r.setEnd(node, off);
  return r.toString().length;
}

/**
 * api = {
 *   getPen():  { mode: 'off'|'highlight'|'underline'|'erase', color },
 *   getAnns(passageId): array,
 *   setAnns(passageId, array),
 *   onChange()
 * }
 */
export function attachPen(root, api) {
  if (!root) return;

  root.addEventListener('mouseup', () => {
    const pen = api.getPen();
    if (pen.mode !== 'highlight' && pen.mode !== 'underline') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);

    const added = {};
    root.querySelectorAll('.passage-text').forEach((pt) => {
      const pid = pt.dataset.passage;
      pt.querySelectorAll('p[data-p]').forEach((pEl) => {
        if (!range.intersectsNode(pEl)) return;
        const total = pEl.textContent.length;
        let s = 0, e = total;
        if (pEl.contains(range.startContainer)) s = offsetIn(pEl, range.startContainer, range.startOffset);
        if (pEl.contains(range.endContainer)) e = offsetIn(pEl, range.endContainer, range.endOffset);
        if (e - s < 1) return;
        (added[pid] = added[pid] || []).push({
          p: Number(pEl.dataset.p), s, e, t: pen.mode === 'highlight' ? 'h' : 'u', c: pen.color
        });
      });
    });

    const ids = Object.keys(added);
    if (!ids.length) return;
    ids.forEach((pid) => api.setAnns(pid, [...api.getAnns(pid), ...added[pid]]));
    sel.removeAllRanges();
    api.onChange();
  });

  root.addEventListener('click', (e) => {
    if (api.getPen().mode !== 'erase') return;
    const span = e.target.closest?.('.ann');
    if (!span) return;
    const pEl = span.closest('p[data-p]');
    const pt = span.closest('.passage-text');
    if (!pEl || !pt) return;
    const a = Number(span.dataset.a), b = Number(span.dataset.b), pi = Number(pEl.dataset.p);
    const pid = pt.dataset.passage;
    api.setAnns(pid, api.getAnns(pid).filter((x) => !(x.p === pi && x.s < b && x.e > a)));
    api.onChange();
  });
}