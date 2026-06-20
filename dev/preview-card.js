// Renders an eBay story as the LIVE behavioral card (exact functions copied from
// public/behavioral.html: esc / carlClean / mdBold / carlBullets / actionShort /
// buildCarlHtml) so we can eyeball the bold density before rolling it out.
// Shows FLAT (bold stripped) vs BOLDED side by side.
//   Usage:  node dev/preview-card.js [storyId]   (default eb-tech-drift)
//   Output: dev/card-preview.html
const fs = require("fs");
const path = require("path");
const { EBAY_STORIES } = require("./ebay-stories");

const id = process.argv[2] || "eb-tech-drift";
const story = EBAY_STORIES.find(s => s.id === id);
if (!story) { console.error("No story:", id); process.exit(1); }

// ---- EXACT copies from behavioral.html ----
const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function carlClean(text) {
  let t = String(text).replace(/\[(?:VERIFY|INSERT)[^\]]*\]/gi, "").trim();
  t = t.replace(/^For ['"][^'"]*['"][.\s]*/i, "");
  t = t.replace(/^(?:eBay's own question|From the eBay list)[^.?]*[.?]['"]?\s*/i, "");
  t = t.replace(/^\d+-second headline\s*:\s*['"]?/i, "");
  t = t.replace(/^Lead(?:\s+\w+){0,2}\s+story\s*[—–-]\s*/i, "");
  t = t.replace(/^['"\s]*(?:Frame|Lead|Situation|The version here)\s*:\s*/i, "");
  return t.trim();
}
const mdBold = s => esc(String(s)).replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>');
function carlBullets(text, maxBullets) {
  const out = [];
  for (const s of carlClean(text).split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean)) {
    if (out.length >= maxBullets) break;
    if (s.split(/\s+/).length > 18) {
      for (const sub of s.split(/\s*—\s*|; /).map(x => x.trim()).filter(Boolean)) {
        if (out.length >= maxBullets) break;
        out.push(sub.replace(/[.,;:]+$/, ""));
      }
    } else out.push(s.replace(/[.,;:]+$/, ""));
  }
  return out;
}
function actionShort(a) {
  const t = carlClean(a);
  const first = (t.match(/^.*?[.!?](?=\s|$)/) || [t])[0].trim();
  return first.replace(/[.,;:]+$/, "");
}
function buildCarlHtml(card, title, useSignals) {
  const li = x => typeof x === "string" ? `<li style="margin-bottom:7px">${mdBold(x)}</li>` : `<li style="margin-bottom:7px">${mdBold(x.b)}<ul style="margin:4px 0 2px;padding-left:16px;list-style:circle">${(x.sub||[]).map(s => `<li style="margin-bottom:4px">${mdBold(s)}</li>`).join("")}</ul></li>`;
  const ul = arr => `<ul style="margin:0;padding-left:18px">${arr.map(li).join("")}</ul>`;
  const sig = useSignals ? (card.signals || {}) : {};
  const rows = [
    ["C", "#4fc3f7", sig.c || carlBullets(card.c, 3)],
    ["A", "#81c784", sig.a || card.a.map(actionShort)],
    ["R", "#ffb74d", sig.r || carlBullets(card.r, 3)],
    ["L", "#ce93d8", sig.l || carlBullets(card.l, 2)],
  ].map(([label, color, arr]) => `
      <span style="color:${color};font-weight:700;font-size:12px;padding-top:3px">${label}</span>
      <div style="color:#e8e6f0;font-weight:500">${ul(arr)}</div>`).join("");
  return `
  <div class="carl-refresher" style="margin-top:12px;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#e6a23c;margin-bottom:12px;font-weight:700">${esc(title)}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:12px;font-size:14px;line-height:1.5">${rows}</div>
  </div>`;
}
// ---- end copies ----

// FLAT = same card with ** stripped (what the other 27 look like today)
const strip = s => String(s).replace(/\*\*/g, "");
const flatCard = { c: strip(story.card.c), a: story.card.a.map(strip), r: strip(story.card.r), l: strip(story.card.l) };

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Card preview — ${esc(id)}</title>
<style>
  body{background:#0a0a0f;color:#e8e6f0;font-family:-apple-system,system-ui,sans-serif;margin:0;padding:24px}
  h1{font-size:15px;color:#e6a23c;letter-spacing:1px;text-transform:uppercase;margin:0 0 18px}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1100px}
  .col h2{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a87a0;margin:0 0 10px}
  .col.after h2{color:#81c784}
</style></head><body>
  <h1>Live behavioral card — ${esc(story.title)}</h1>
  <div class="cols">
    <div class="col before"><h2>Prose, condensed (the other 27 today)</h2>${buildCarlHtml(story.card, story.title, false)}</div>
    <div class="col after"><h2>Signals (new — DRIFT)</h2>${buildCarlHtml(story.card, story.title, true)}</div>
  </div>
</body></html>`;

const out = path.join(__dirname, "card-preview.html");
fs.writeFileSync(out, html);
console.log("Wrote", out);
