/**
 * Builds the low-fidelity wireframes of one iteration.
 *
 *   node tools/lofi/build.mjs Output_A
 *
 * Reads   Output_X/lo-fi/spec.mjs   (editable source of the wireframes)
 * Writes  Output_X/lo-fi/screens/<id>.svg   one file per screen
 *         Output_X/lo-fi/flow.svg           navigation map between screens
 *         Output_X/lo-fi/index.html         board showing everything
 *
 * Wireframes are deliberately plain: gray boxes, labels, an "X" for images.
 * Interactive elements get a numbered badge; the right margin lists, for each
 * number, where the control leads (→) or an annotation.
 * Elements changed in this iteration have a red dashed outline.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { H, W } from './dsl.mjs';

const output = process.argv[2];
if (!output) {
  console.error('Usage: node tools/lofi/build.mjs <Output_A|Output_B|...>');
  process.exit(1);
}
const dir = join(resolve(output), 'lo-fi');
const spec = (await import(pathToFileURL(join(dir, 'spec.mjs')).href)).default;
mkdirSync(join(dir, 'screens'), { recursive: true });

const FRAME_X = 24;
const FRAME_Y = 64;
const MARGIN = 250; // annotation column
const INK = '#222';
const MID = '#777';
const FILL = '#e6e6e6';
const CHANGE = '#c0392b';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(str, max) {
  const words = String(str).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function label(x, y, str, { size = 14, bold = false, anchor = 'start', color = INK, max = 40 } = {}) {
  return wrap(str, max)
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * (size + 4)}" font-size="${size}" font-family="Arial, sans-serif" ${bold ? 'font-weight="bold"' : ''} text-anchor="${anchor}" fill="${color}">${esc(l)}</text>`,
    )
    .join('');
}

/** Renders one element; returns { svg, anchors } where anchors feed the margin arrows. */
function render(el, ox, oy, anchors) {
  const x = ox + (el.x ?? 0);
  const y = oy + (el.y ?? 0);
  const changedRect =
    el.changed && el.type !== 'nav'
      ? `<rect x="${x - 5}" y="${y - (el.type === 'text' ? 24 : 5)}" width="${(el.w ?? 200) + 10}" height="${(el.h ?? 28) + 10}" fill="none" stroke="${CHANGE}" stroke-width="2.5" stroke-dasharray="6 4" rx="8"/>`
      : '';
  let s = '';
  switch (el.type) {
    case 'box':
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="12" fill="${el.fill ?? FILL}" stroke="${INK}" stroke-width="1.5" ${el.dashed ? 'stroke-dasharray="5 4"' : ''}/>` + label(x + 12, y + 22, el.label, { max: Math.floor(el.w / 8), bold: true });
      if (el.lines) s += el.lines.map((l, i) => label(x + 12, y + 46 + i * 20, l, { max: Math.floor(el.w / 7.5) })).join('');
      break;
    case 'text':
      s = label(x, y, el.label, { size: el.size ?? 16, bold: el.bold, max: el.max ?? 34 });
      break;
    case 'btn':
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="10" fill="${el.primary ? '#bbb' : '#fff'}" stroke="${INK}" stroke-width="2"/>` + label(x + el.w / 2, y + el.h / 2 + 5, el.label, { anchor: 'middle', bold: true, size: 15, max: 40 });
      break;
    case 'input':
      s = label(x, y, el.label, { bold: true, size: 14 }) + `<rect x="${x}" y="${y + 8}" width="${el.w}" height="44" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
      el.h = 52;
      break;
    case 'img':
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" fill="#fff" stroke="${INK}" stroke-width="1.5"/><line x1="${x}" y1="${y}" x2="${x + el.w}" y2="${y + el.h}" stroke="${MID}"/><line x1="${x + el.w}" y1="${y}" x2="${x}" y2="${y + el.h}" stroke="${MID}"/>` + label(x + el.w / 2, y + el.h + 16, el.label, { anchor: 'middle', size: 12, color: MID });
      break;
    case 'chart': {
      const pts = Array.from({ length: 9 }, (_, i) => `${x + 10 + (i * (el.w - 20)) / 8},${y + el.h - 20 - ((i * 37) % (el.h - 40))}`).join(' ');
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.5"/><polyline points="${pts}" fill="none" stroke="${MID}" stroke-width="2"/>` + label(x + 10, y + 18, el.label, { size: 12, color: MID });
      break;
    }
    case 'hr':
      s = `<line x1="${x}" y1="${y}" x2="${x + el.w}" y2="${y}" stroke="${INK}" stroke-width="2.5"/>`;
      el.h = 2;
      break;
    case 'list':
      s = label(x, y, el.label, { bold: true, size: 16 });
      for (let i = 0; i < el.rows; i++) {
        const ry = y + 10 + i * (el.rowH + 8);
        s += `<rect x="${x}" y="${ry}" width="${el.w}" height="${el.rowH}" rx="8" fill="${FILL}" stroke="${INK}" stroke-width="1.2"/><rect x="${x + 12}" y="${ry + 12}" width="${el.w * 0.45}" height="10" fill="${MID}"/><rect x="${x + 12}" y="${ry + 30}" width="${el.w * 0.65}" height="8" fill="#aaa"/><text x="${x + el.w - 20}" y="${ry + 32}" font-size="18" font-family="Arial">›</text>`;
      }
      el.h = 10 + el.rows * (el.rowH + 8);
      break;
    case 'choice':
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="10" fill="#fff" stroke="${INK}" stroke-width="1.5"/><rect x="${x + 14}" y="${y + 16}" width="20" height="20" rx="${el.multi ? 4 : 10}" fill="${el.checked ? INK : '#fff'}" stroke="${INK}" stroke-width="2"/>` + label(x + 46, y + 31, el.label, { max: 34 });
      break;
    case 'msg':
      s = `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="8" fill="#fff" stroke="${INK}" stroke-width="2" stroke-dasharray="2 3"/>` + label(x + 12, y + 20, el.label, { size: 13, max: Math.floor(el.w / 7) });
      break;
    case 'nav': {
      const ny = oy + H - 72;
      const n = el.items.length;
      s = `<rect x="${ox}" y="${ny}" width="${W}" height="72" fill="#cfcfcf" stroke="${INK}" stroke-width="1.5"/>`;
      el.items.forEach((it, i) => {
        const cx = ox + (W / n) * (i + 0.5);
        s += `<rect x="${cx - 14}" y="${ny + 10}" width="28" height="24" fill="${it.label === el.active ? INK : '#fff'}" stroke="${INK}"/>` + label(cx, ny + 54, it.label, { anchor: 'middle', size: 13, bold: it.label === el.active });
      });
      anchors.push({ x: ox + W - 4, y: ny + 4, to: el.items.filter((it) => it.label !== el.active).map((it) => it.label).join(', '), nav: true });
      if (el.changed) s += `<rect x="${ox - 4}" y="${ny - 4}" width="${W + 8}" height="80" fill="none" stroke="${CHANGE}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      el.x = 0;
      el.y = H - 72;
      el.w = W;
      el.h = 72;
      break;
    }
    case 'dialog': {
      s = `<rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="#000" opacity="0.35"/>` + `<rect x="${x}" y="${y}" width="${el.w}" height="${el.h}" rx="14" fill="#fafafa" stroke="${INK}" stroke-width="2.5"/>` + label(x + 14, y + 28, el.label, { bold: true, size: 18 }) + `<text x="${x + el.w - 30}" y="${y + 30}" font-size="20" font-family="Arial">✕</text>`;
      for (const c of el.children) s += render(c, x, y, anchors);
      break;
    }
  }
  // Badge position: top-right corner of the element.
  // (Recomputed from el.x / el.y because the nav bar sets its position while rendering.)
  const bx = ox + (el.x ?? 0) + Math.min(el.w ?? 200, W - 10) - 4 - (el.type === 'nav' ? 28 : 0);
  const by = oy + (el.y ?? 0) - (el.type === 'text' || el.type === 'list' || el.type === 'input' ? 14 : -4);
  if (el.to) anchors.push({ x: bx, y: by, to: el.to });
  if (el.note) anchors.push({ x: bx - (el.to ? 26 : 0), y: by, note: el.note });
  return changedRect + s;
}

function screenSvg(screen, index) {
  const anchors = [];
  let body = '';
  // On pop-up screens only the pop-up is annotated; the dimmed page behind it is context.
  const hasDialog = screen.elements.some((e) => e.type === 'dialog');
  for (const el of screen.elements) body += render(el, FRAME_X, FRAME_Y, hasDialog && el.type !== 'dialog' ? [] : anchors);
  // Numbered badges on the elements + numbered list in the right margin.
  const mx = FRAME_X + W + 24;
  let ann = '';
  let my = FRAME_Y + 16;
  anchors.forEach((a, i) => {
    const n = i + 1;
    const isLink = !!a.to;
    ann += `<circle cx="${a.x}" cy="${a.y}" r="11" fill="${isLink ? INK : '#fff'}" stroke="${INK}" stroke-width="1.5"/><text x="${a.x}" y="${a.y + 4.5}" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle" fill="${isLink ? '#fff' : INK}">${n}</text>`;
    const str = isLink ? `${n}  → ${a.nav ? 'Nav bar: ' : ''}${a.to}` : `${n}  ${a.note}`;
    const lines = wrap(str, 30);
    ann += label(mx, my, str, { size: 13, bold: isLink, max: 30 });
    my += lines.length * 17 + 12;
  });
  const notes = (screen.notes ?? []).map((n, i) => label(FRAME_X, FRAME_Y + H + 40 + i * 40, `• ${n}`, { size: 14, max: 80 })).join('');
  const totalH = Math.max(FRAME_Y + H + 40 + (screen.notes?.length ?? 0) * 40 + 20, my + 20);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME_X + W + MARGIN}" height="${totalH}" viewBox="0 0 ${FRAME_X + W + MARGIN} ${totalH}" role="img" aria-label="${esc(`Low-fidelity wireframe: ${screen.name}`)}">
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${INK}"/></marker></defs>
<rect width="100%" height="100%" fill="#fff"/>
${label(FRAME_X, 34, `${screen.id} · ${screen.name}`, { size: 20, bold: true, max: 70 })}
${label(FRAME_X + W + 24, FRAME_Y - 6, 'Numbered controls', { size: 13, bold: true, color: MID })}
<rect x="${FRAME_X}" y="${FRAME_Y}" width="${W}" height="${H}" rx="28" fill="#fff" stroke="${INK}" stroke-width="3"/>
<g clip-path="none">${body}</g>
${ann}
${notes}
</svg>`;
}

function flowSvg(flow) {
  const bw = 180;
  const bh = 66;
  const w = Math.max(...flow.nodes.map((n) => n.x)) + bw + 40;
  const h = Math.max(...flow.nodes.map((n) => n.y)) + bh + 80;
  const pos = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
  const edge = (e) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const ax = a.x + bw / 2;
    const ay = a.y + bh / 2;
    const bx = b.x + bw / 2;
    const by = b.y + bh / 2;
    // Clip the line to the box borders.
    const clip = (cx, cy, dx, dy) => {
      const t = Math.min(Math.abs(bw / 2 / (dx || 1e-9)), Math.abs(bh / 2 / (dy || 1e-9)));
      return [cx + dx * t, cy + dy * t];
    };
    const [sx, sy] = clip(ax, ay, bx - ax, by - ay);
    const [tx, ty] = clip(bx, by, ax - bx, ay - by);
    const color = e.changed ? CHANGE : INK;
    const mid = e.label ? label((sx + tx) / 2 + 4, (sy + ty) / 2 - 4, e.label, { size: 12, color: e.changed ? CHANGE : MID, max: 22 }) : '';
    return `<line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="1.8" ${e.changed ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#arrow${e.changed ? 'c' : ''})" ${e.both ? `marker-start="url(#arrow${e.changed ? 'c' : ''})"` : ''}/>` + mid;
  };
  const node = (n) =>
    `<rect x="${n.x}" y="${n.y}" width="${bw}" height="${bh}" rx="10" fill="${n.changed ? '#fdecea' : '#fff'}" stroke="${n.changed ? CHANGE : INK}" stroke-width="${n.changed ? 2.5 : 1.8}" ${n.changed ? 'stroke-dasharray="6 4"' : ''}/>` +
    label(n.x + bw / 2, n.y + bh / 2 + 5 - (wrap(n.label, 21).length - 1) * 9, n.label, { anchor: 'middle', size: 14, bold: true, max: 21 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(flow.title)}">
<defs>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${INK}"/></marker>
<marker id="arrowc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${CHANGE}"/></marker>
</defs>
<rect width="100%" height="100%" fill="#fff"/>
${label(20, 32, flow.title, { size: 20, bold: true, max: 90 })}
${flow.edges.map(edge).join('')}
${flow.nodes.map(node).join('')}
${label(20, h - 20, flow.legend ?? 'Arrows show navigation; double arrows mean the user can go both ways.', { size: 13, color: MID, max: 140 })}
</svg>`;
}

for (const [i, s] of spec.screens.entries()) writeFileSync(join(dir, 'screens', `${s.id}.svg`), screenSvg(s, i));
writeFileSync(join(dir, 'flow.svg'), flowSvg(spec.flow));

const board = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.title)} – low-fidelity wireframes</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f4f4f4;color:#222}
h1{margin:0 0 8px}p{max-width:70ch}
.grid{display:flex;flex-wrap:wrap;gap:24px}
figure{margin:0;background:#fff;border:1px solid #ccc;padding:8px}
figure img{display:block;width:330px;height:auto}
figcaption{font-size:16px;margin-top:6px;max-width:330px}
.flow img{max-width:100%;height:auto;background:#fff;border:1px solid #ccc}
</style></head><body>
<h1>${esc(spec.title)}: low-fidelity wireframes</h1>
<p>${esc(spec.intro)}</p>
<h2>Navigation flow</h2>
<div class="flow"><img src="flow.svg" alt="${esc(spec.flow.title)}"></div>
<h2>Screens</h2>
<div class="grid">
${spec.screens.map((s) => `<figure><a href="screens/${s.id}.svg"><img src="screens/${s.id}.svg" alt="Wireframe ${esc(s.id)}: ${esc(s.name)}"></a><figcaption><strong>${esc(s.id)}</strong> ${esc(s.name)}</figcaption></figure>`).join('\n')}
</div>
</body></html>`;
writeFileSync(join(dir, 'index.html'), board);
console.log(`${output}: ${spec.screens.length} screens + flow.svg + index.html`);
