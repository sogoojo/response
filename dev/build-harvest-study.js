// Builds the standalone harvest study page from digest JSON files.
// - Reads every harvest/digests/*.json (one file per track).
// - Output: ../harvest-study.html (open directly in a browser; know/shaky
//   status and notes persist in localStorage; Export produces text to paste
//   back to Claude).
// - PDF links are relative, so the page must stay at the repo root.
//
// Re-run:  node dev/build-harvest-study.js
const fs = require("fs");
const path = require("path");

const DIGESTS_DIR = path.join(__dirname, "..", "harvest", "digests");
const OUT = path.join(__dirname, "..", "harvest-study.html");

const tracks = fs.readdirSync(DIGESTS_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(DIGESTS_DIR, f), "utf8")))
  .sort((a, b) => (a.order || 99) - (b.order || 99));

const DATA = tracks.map(t => ({
  track: t.track,
  description: t.description || "",
  digests: t.digests,
}));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Harvest Study</title>
<style>
  :root {
    --bg: #0f1115; --panel: #171a21; --panel2: #1e2230; --border: #2a2f3d;
    --text: #d7dce6; --dim: #8b93a7; --accent: #5b9dff; --know: #34c98e;
    --shaky: #f0a35e; --rule: #b88aff;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 24px 20px 80px; }
  header { position: sticky; top: 0; z-index: 10; background: rgba(15,17,21,.95);
    backdrop-filter: blur(6px); border-bottom: 1px solid var(--border); }
  .hwrap { max-width: 760px; margin: 0 auto; padding: 14px 20px; }
  h1 { font-size: 19px; margin: 0 0 10px; }
  h1 small { color: var(--dim); font-weight: 400; font-size: 13px; margin-left: 8px; }
  .bar { background: var(--panel2); border-radius: 6px; height: 8px; overflow: hidden; margin: 6px 0 10px; }
  .bar i { display: block; height: 100%; background: var(--know); transition: width .25s; }
  .meta-line { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--dim); }
  .tabs { display: flex; gap: 4px; margin-top: 10px; border-bottom: 1px solid var(--border); }
  .tabs button { background: none; color: var(--dim); border: none; border-bottom: 2px solid transparent;
    padding: 8px 16px; font-size: 14.5px; font-weight: 600; cursor: pointer; }
  .tabs button.active { color: var(--accent); border-bottom-color: var(--accent); }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .controls button { background: var(--panel2); color: var(--text); border: 1px solid var(--border);
    border-radius: 6px; padding: 5px 12px; font-size: 13px; cursor: pointer; }
  .controls button.active { border-color: var(--accent); color: var(--accent); }
  .controls button.util { margin-left: auto; }
  .group-title { margin: 34px 0 4px; font-size: 13px; text-transform: uppercase;
    letter-spacing: .08em; color: var(--dim); }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px 22px; margin: 16px 0; }
  .card.know { border-left: 3px solid var(--know); }
  .card.shaky { border-left: 3px solid var(--shaky); }
  .card-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .chip { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
    background: var(--panel2); color: var(--accent); white-space: nowrap; }
  .card h2 { font-size: 17px; margin: 0; flex: 1; min-width: 200px; }
  .tags { color: var(--dim); font-size: 12px; margin-top: 6px; }
  .tldr { color: #e3e8f2; margin: 14px 0 6px; font-size: 15px; }
  ul.points { margin: 14px 0; padding-left: 22px; }
  ul.points li { margin: 14px 0; font-size: 14.5px; color: #ccd3e0; line-height: 1.7; }
  ul.points li::marker { color: var(--accent); }
  .rule { border: 1px solid var(--rule); background: rgba(184,138,255,.07);
    border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14.5px;
    line-height: 1.65; color: #d9c4ff; }
  .rule b { color: var(--rule); }
  .nums { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0; }
  .num { background: var(--panel2); border-radius: 8px; padding: 8px 12px; font-size: 12.5px;
    line-height: 1.45; color: var(--dim); }
  .num b { color: var(--know); display: block; font-size: 14.5px; }
  .actions { display: flex; gap: 8px; align-items: center; margin-top: 14px; flex-wrap: wrap; }
  .actions button { border: 1px solid var(--border); background: var(--panel2); color: var(--text);
    border-radius: 6px; padding: 6px 14px; font-size: 13px; cursor: pointer; }
  .actions .b-know.on { background: var(--know); border-color: var(--know); color: #08130e; font-weight: 600; }
  .actions .b-shaky.on { background: var(--shaky); border-color: var(--shaky); color: #1c1206; font-weight: 600; }
  .actions a { margin-left: auto; color: var(--accent); font-size: 13px; text-decoration: none; }
  .actions a:hover { text-decoration: underline; }
  textarea.note { width: 100%; margin-top: 10px; background: var(--panel2); color: var(--text);
    border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; font-size: 13px;
    font-family: inherit; resize: vertical; min-height: 34px; }
  #numbersPanel { display: none; background: var(--panel); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px 20px; margin: 18px 0; }
  #numbersPanel.open { display: block; }
  #numbersPanel h3 { margin: 0 0 10px; font-size: 14px; }
  #numbersPanel .nrow { display: flex; gap: 10px; padding: 5px 0; font-size: 13px;
    border-bottom: 1px solid var(--border); }
  #numbersPanel .nrow:last-child { border-bottom: none; }
  #numbersPanel .nrow b { color: var(--know); min-width: 170px; }
  #numbersPanel .nrow .co { color: var(--accent); min-width: 90px; }
  #exportBox { display: none; position: fixed; inset: 8% 10%; background: var(--panel);
    border: 1px solid var(--border); border-radius: 10px; padding: 20px; z-index: 50;
    flex-direction: column; gap: 10px; }
  #exportBox.open { display: flex; }
  #exportBox textarea { flex: 1; background: var(--panel2); color: var(--text);
    border: 1px solid var(--border); border-radius: 6px; padding: 10px; font-size: 12px;
    font-family: ui-monospace, monospace; }
  .hidden { display: none !important; }
  strong { color: #ffffff; font-weight: 600; }
</style>
</head>
<body>
<header><div class="hwrap">
  <h1>Harvest Study <small id="trackLabel"></small></h1>
  <div class="bar"><i id="progressFill"></i></div>
  <div class="meta-line"><span id="progressText"></span><span id="shakyText"></span></div>
  <div class="tabs" id="tabs"></div>
  <div class="controls">
    <button data-filter="all" class="active">All</button>
    <button data-filter="shaky">Shaky only</button>
    <button data-filter="unreviewed">Unreviewed</button>
    <button class="util" id="numbersBtn">Quotable numbers</button>
    <button class="util" id="exportBtn" style="margin-left:0">Export</button>
  </div>
</div></header>
<div class="wrap">
  <div id="numbersPanel"></div>
  <div id="cards"></div>
</div>
<div id="exportBox">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <b>Export — paste this back to Claude</b>
    <span>
      <button id="copyBtn" style="margin-right:8px">Copy</button>
      <button id="closeExport">Close</button>
    </span>
  </div>
  <textarea id="exportText" readonly></textarea>
</div>
<script>
const DATA = ${JSON.stringify(DATA)};
const LS_KEY = "harvestStudy.v1";
let state = { status: {}, notes: {} };
try { state = Object.assign(state, JSON.parse(localStorage.getItem(LS_KEY) || "{}")); } catch (e) {}
const save = () => localStorage.setItem(LS_KEY, JSON.stringify(state));

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = s => esc(s).replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");

const all = DATA.flatMap(t => t.digests);
const trackOf = {};
for (const t of DATA) for (const d of t.digests) trackOf[d.id] = t.track;
document.getElementById("trackLabel").textContent = all.length + " topics";

let activeTab = (state.tab && DATA.some(t => t.track === state.tab)) ? state.tab : DATA[0].track;
const tabsEl = document.getElementById("tabs");
tabsEl.innerHTML = DATA.map(t =>
  '<button data-track="' + esc(t.track) + '">' + esc(t.track) + "</button>").join("");
tabsEl.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  activeTab = b.dataset.track; state.tab = activeTab; save(); refresh();
  window.scrollTo(0, 0);
});

const renderCard = d => \`
  <div class="card" id="card-\${d.id}" data-id="\${d.id}">
    <div class="card-head">
      <span class="chip">\${esc(d.company)}</span>
      <h2>\${esc(d.title)}</h2>
    </div>
    <div class="tags">\${d.tags.map(esc).join(" · ")}</div>
    <p class="tldr">\${md(d.tldr)}</p>
    <ul class="points">\${d.bullets.map(b => "<li>" + md(b) + "</li>").join("")}</ul>
    \${d.decisionRule ? '<div class="rule"><b>Say with conviction:</b> ' + md(d.decisionRule) + "</div>" : ""}
    <div class="nums">\${d.quotableNumbers.map(n =>
      '<div class="num"><b>' + esc(n.number) + "</b>" + esc(n.context) + "</div>").join("")}</div>
    <div class="actions">
      <button class="b-know">Know it</button>
      <button class="b-shaky">Shaky</button>
      <a href="\${encodeURI(d.pdfFile)}" target="_blank">Open PDF ↗</a>
    </div>
    <textarea class="note" placeholder="Your note — framings in your words, things to check in designs.js…"></textarea>
  </div>\`;

const cardsEl = document.getElementById("cards");
cardsEl.innerHTML = DATA.map(t => {
  const groups = [];
  for (const d of t.digests) {
    let g = groups.find(x => x.name === (d.group || "Topics"));
    if (!g) { g = { name: d.group || "Topics", items: [] }; groups.push(g); }
    g.items.push(d);
  }
  return groups.map(g =>
    '<div class="group-title">' + esc(g.name) + '</div>' +
    g.items.map(renderCard).join("")
  ).join("");
}).join("");

let filter = "all";
function refresh() {
  let known = 0, shaky = 0;
  for (const d of all) {
    const card = document.getElementById("card-" + d.id);
    const st = state.status[d.id];
    if (st === "know") known++; if (st === "shaky") shaky++;
    card.classList.toggle("know", st === "know");
    card.classList.toggle("shaky", st === "shaky");
    card.querySelector(".b-know").classList.toggle("on", st === "know");
    card.querySelector(".b-shaky").classList.toggle("on", st === "shaky");
    const inTab = trackOf[d.id] === activeTab;
    const show = inTab && (filter === "all" || (filter === "shaky" && st === "shaky") ||
      (filter === "unreviewed" && !st));
    card.classList.toggle("hidden", !show);
  }
  document.querySelectorAll(".group-title").forEach(t => {
    let el = t.nextElementSibling, any = false;
    while (el && el.classList.contains("card")) {
      if (!el.classList.contains("hidden")) any = true;
      el = el.nextElementSibling;
    }
    t.classList.toggle("hidden", !any);
  });
  tabsEl.querySelectorAll("button").forEach(b =>
    b.classList.toggle("active", b.dataset.track === activeTab));
  const cur = DATA.find(t => t.track === activeTab);
  const curKnown = cur.digests.filter(d => state.status[d.id] === "know").length;
  document.getElementById("progressFill").style.width = (curKnown / cur.digests.length * 100) + "%";
  document.getElementById("progressText").textContent = DATA.map(t => {
    const k = t.digests.filter(d => state.status[d.id] === "know").length;
    return t.track + ": " + k + "/" + t.digests.length;
  }).join("  ·  ");
  document.getElementById("shakyText").textContent = shaky ? shaky + " shaky" : "";
}

cardsEl.addEventListener("click", e => {
  const card = e.target.closest(".card"); if (!card) return;
  const id = card.dataset.id;
  if (e.target.classList.contains("b-know"))
    { state.status[id] = state.status[id] === "know" ? null : "know"; save(); refresh(); }
  if (e.target.classList.contains("b-shaky"))
    { state.status[id] = state.status[id] === "shaky" ? null : "shaky"; save(); refresh(); }
});
cardsEl.addEventListener("input", e => {
  if (!e.target.classList.contains("note")) return;
  state.notes[e.target.closest(".card").dataset.id] = e.target.value; save();
});
for (const d of all) {
  const n = state.notes[d.id];
  if (n) document.querySelector("#card-" + d.id + " .note").value = n;
}

document.querySelectorAll(".controls [data-filter]").forEach(b => b.addEventListener("click", () => {
  filter = b.dataset.filter;
  document.querySelectorAll(".controls [data-filter]").forEach(x => x.classList.toggle("active", x === b));
  refresh();
}));

const numbersPanel = document.getElementById("numbersPanel");
numbersPanel.innerHTML = "<h3>Quotable numbers — final-review flashcards</h3>" +
  all.flatMap(d => d.quotableNumbers.map(n =>
    '<div class="nrow"><b>' + esc(n.number) + '</b><span class="co">' + esc(d.company) + "</span><span>" +
    esc(n.context) + "</span></div>")).join("");
document.getElementById("numbersBtn").addEventListener("click", () => numbersPanel.classList.toggle("open"));

document.getElementById("exportBtn").addEventListener("click", () => {
  const lines = ["# Harvest study export", ""];
  for (const t of DATA) {
    lines.push("# " + t.track, "");
    for (const d of t.digests) {
      const st = state.status[d.id] || "unreviewed";
      const note = (state.notes[d.id] || "").trim();
      lines.push("## " + d.title + " [" + st + "]");
      if (note) lines.push("Note: " + note);
      lines.push("");
    }
  }
  document.getElementById("exportText").value = lines.join("\\n");
  document.getElementById("exportBox").classList.add("open");
});
document.getElementById("closeExport").addEventListener("click", () =>
  document.getElementById("exportBox").classList.remove("open"));
document.getElementById("copyBtn").addEventListener("click", () =>
  navigator.clipboard.writeText(document.getElementById("exportText").value));

refresh();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
console.log("Wrote " + OUT + " — " + DATA.reduce((n, t) => n + t.digests.length, 0) + " digests across " + DATA.length + " track(s)");
