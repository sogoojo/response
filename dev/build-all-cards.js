// Contact sheet — renders ALL signal cards on one page exactly as the LIVE
// copilot shows them (same esc/mdBold/buildCarlHtml as public/behavioral.html),
// grouped by domain section, with [VERIFY]/[INSERT] flags highlighted.
//   Re-run:  node dev/build-all-cards.js   →   open dev/all-cards.html
const fs = require("fs");
const path = require("path");
const { STORIES } = require("./behavioral-stories");

const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// bold + highlight [VERIFY...]/[INSERT...] markers
const mdBold = s => esc(String(s))
  .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
  .replace(/\[((?:VERIFY|INSERT)[^\]]*)\]/g, '<span style="color:#ff7b7b;font-weight:600">[$1]</span>');

function buildCarlHtml(card, title) {
  // Refined cards carry a `signals` recall layout; plain cards fall back to CARL.
  const sig = card.signals || { c: [card.c], a: card.a || [], r: [card.r], l: [card.l] };
  const li = x => typeof x === "string" ? `<li style="margin-bottom:6px">${mdBold(x)}</li>` : `<li style="margin-bottom:6px">${mdBold(x.b)}<ul style="margin:4px 0 2px;padding-left:16px;list-style:circle">${(x.sub||[]).map(s => `<li style="margin-bottom:4px">${mdBold(s)}</li>`).join("")}</ul></li>`;
  const ul = arr => `<ul style="margin:0;padding-left:18px">${(arr||[]).filter(Boolean).map(li).join("")}</ul>`;
  const rows = [
    ["C", "#4fc3f7", sig.c || []],
    ["A", "#81c784", sig.a || []],
    ["R", "#ffb74d", sig.r || []],
    ["L", "#ce93d8", sig.l || []],
  ].map(([label, color, arr]) => `
      <span style="color:${color};font-weight:700;font-size:12px;padding-top:3px">${label}</span>
      <div style="color:#e8e6f0;font-weight:500">${ul(arr)}</div>`).join("");
  return `
  <div class="card">
      <div class="ct">${esc(title)}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:10px;font-size:13.5px;line-height:1.45">${rows}</div>
  </div>`;
}

// One section per domain — a story appears under every domain it carries (matches
// the live prep tabs). Order mirrors the front-end tab order.
const SECTIONS = [
  ["Data", "data"],
  ["Infrastructure", "infra"],
  ["SRE", "sre"],
  ["Management", "general"],
  ["Narrative", "screen"],
];

const sections = SECTIONS.map(([name, dom]) => {
  const inDom = STORIES.filter(s => (s.domains || []).includes(dom));
  const cards = inDom.map(s => buildCarlHtml(s.card, s.title)).join("");
  return `<h2>${esc(name)} <span class="n">${inDom.length}</span></h2><div class="grid">${cards}</div>`;
}).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Signal cards — all ${STORIES.length}</title>
<style>
  body{background:#0a0a0f;color:#e8e6f0;font-family:-apple-system,system-ui,sans-serif;margin:0;padding:24px 28px 80px}
  h1{font-size:16px;color:#e6a23c;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px}
  .sub{color:#8a87a0;font-size:12px;margin:0 0 24px}
  .sub b{color:#ff7b7b}
  h2{font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#cfcde0;margin:28px 0 12px;border-bottom:1px solid #23232e;padding-bottom:6px}
  h2 .n{color:#8a87a0;font-weight:400;margin-left:6px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:16px}
  .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px}
  .ct{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#e6a23c;margin-bottom:10px;font-weight:700;line-height:1.3}
  ul{list-style:disc}
</style></head><body>
  <h1>Signal cards — all ${STORIES.length}</h1>
  <p class="sub">Live-card render (C/A/R/L cues), grouped by section. <b>Red [VERIFY]/[INSERT]</b> = detail to fill per interview.</p>
  ${sections}
</body></html>`;

const out = path.join(__dirname, "all-cards.html");
fs.writeFileSync(out, html);
console.log("Wrote", out, "—", STORIES.length, "cards across", SECTIONS.length, "sections");
