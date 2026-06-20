// Builds a standalone, self-contained interview-prep review page.
// - "Yours" = the 7 technical pillars (imported from pillar-cards.js — the SAME
//   single source the live copilot uses) + behavioral map + cross-cutting notes.
// - "Mine"  = the generated cards, pulled live from tech-screen-stories.js.
// Output: ../tech-screen-prep.html  (open directly in a browser; notes persist
// in localStorage; Export button produces text to paste back to Claude.)
//
// Re-run:  node dev/build-prep-page.js
const fs = require("fs");
const path = require("path");
const { TECH_SCREEN_STORIES } = require("./tech-screen-stories");
const { PILLARS } = require("./pillar-cards");

// ---------- YOURS ----------
// Pillars 1–7 come from pillar-cards.js (single source). Pillar 8 (behavioral
// map) and the cross-cutting notes are prep-page-only, so they live here.
const EXTRA_SECTIONS = [
  {
    pillar: "Pillar 8 — Behavioral: “Tell me about a time…”",
    note: "Different mode from the pillars above: these want a SPECIFIC story (what YOU did + the result), not a framework. Each prompt maps to a real CARL story you already have in the copilot — lead with the first, keep the backup in your pocket.",
    items: [
      { q: "▶ HOW TO HANDLE THESE (read first)",
        lead: "Behavioral = STAR/CARL: Context → Action (what YOU did) → Result → Learning.",
        bullets: [
          "Own it first person — '**I** decided / **I** drove', not 'we'.",
          "Land a measurable result — your real numbers (toil −25%, repeat incidents −35%, doubled throughput, 10→20 / 25→50).",
          "Add the leadership layer — what you changed for the team/org, not just the technical fix.",
          "Even a 'how do you…' is stronger as a story: 'Let me give you a concrete example…'.",
        ] },
      { q: "Tell me about a major incident you led / handled.",
        bullets: [
          "**Lead:** Kafka OOM 3am Incident — you coordinated as IC (not fixing), mitigated first, ran a blameless postmortem, drove the systemic fix.",
          "**Backup:** Incident Response & Blameless Postmortems (Citi).",
          "**Director layer:** what you changed across the team so it couldn't recur.",
        ] },
      { q: "Tell me about a time you influenced people you didn't manage.",
        bullets: [
          "**Lead:** Terraform Golden Path — adoption by paved road & self-service, not mandate.",
          "**Backup:** Governance Pushback on Streaming / Architecture Alignment (Greg).",
          "Maps directly to the JD's cross-team reliability influence.",
        ] },
      { q: "Tell me about a time you disagreed with a peer or a leader on a technical decision.",
        bullets: [
          "**Lead:** Kafka vs Solace (ARB Conflict).",
          "**Backup:** Flink vs Spark (ARB) / Pod 4 Alignment.",
          "Emphasise: data-driven argument, then disagree-and-commit.",
        ] },
      { q: "Tell me about a time you were wrong, or a decision that failed.",
        bullets: [
          "**Lead:** Neo4j Wrong Call — own it cleanly, no deflection; what you learned & changed.",
          "**Backup:** Misjudged Engineer (Wrong Assumption).",
          "Trust test: blameless leaders model owning their own mistakes first.",
        ] },
      { q: "Tell me about a time you managed underperformance.",
        bullets: [
          "**The hard call:** Managing Underperformer (PIP → Exit).",
          "**The turnaround:** Managing Underperformer (Coach Up).",
          "Pick to match what they're probing. Director layer: protected the bar while treating the person fairly.",
        ] },
      { q: "Tell me about a time you built or scaled a team.",
        bullets: [
          "**Lead:** Scaling Teams 25→50 (Managing Managers) — scaling through other leaders.",
          "**Backup:** Scaling the Global Engineering Org (10→20).",
          "Directly maps to the JD's 'build the European presence' ask.",
        ] },
      { q: "Tell me about your most impactful automation or efficiency win.",
        bullets: [
          "**Lead:** SCOUT — ML Reliability Platform (Led), or Terraform Golden Path.",
          "Tie to the numbers: toil −25%, repeat incidents −35%, 2B+ events/day.",
          "**Director layer:** you changed where the team spent its time, not just automated a task.",
        ] },
      { q: "Tell me about a time you balanced reliability against delivery / feature pressure.",
        bullets: [
          "**Lead:** Conflicting Requirements (PM Roadmap) — framed with error-budget thinking.",
          "**Backup:** Governance Pushback on Streaming.",
        ] },
      { q: "Tell me about a time you navigated significant ambiguity.",
        bullets: [
          "**Lead:** Application Dependencies (Ambiguity → Alignment).",
          "**Backup:** Cloud Agnostic Infrastructure.",
          "Show how you created clarity where there was none.",
        ] },
      { q: "Tell me about a time you communicated something complex to executives.",
        bullets: [
          "**Lead:** Cross-Functional Partnership & Executive Communication (Citi) — presenting to CTOEAC.",
          "**Backup:** Communication & Planning Structures.",
          "Exec framing: impact & decisions in business language, not stack traces.",
        ] },
      { q: "Tell me about a time you mentored or grew an engineer.",
        bullets: [
          "**Lead:** Misjudged Engineer, or Managing Underperformer (Coach Up).",
          "**Backup:** Inclusive Leadership & Diversity / Encouraged Team Innovation.",
        ] },
      { q: "Tell me about a complex migration or modernization you led.",
        bullets: [
          "**Lead:** Cloud Migration (Top-Down & Bottom-Up).",
          "**Backup:** DRIFT Modernization / .NET TIBCO EMS Migration.",
          "Good place to show the strangler-fig / incremental discipline from Pillar 2 Q7.",
        ] },
      { q: "Tell me about how you've fostered inclusion or built a diverse team.",
        bullets: [
          "**Lead:** Inclusive Leadership & Diversity.",
          "Maps to the JD's culture/team-building emphasis — and Sturrock's own growth-and-team background.",
        ] },
    ],
  },
  {
    pillar: "Cross-cutting prep notes",
    note: "Threads to weave through every answer, regardless of pillar.",
    items: [
      { q: "Tie everything to payments.", lead: "Zero-downtime, PCI DSS, seasonal peaks, and 'slow = failed at point of sale' are what make a generic SRE answer a Mastercard answer.", bullets: [] },
      { q: "Show the leadership layer on technical answers.", lead: "For every 'how does X work', add 'and here's how I'd drive it through a team / report it to execs.' That's the Director differentiator.", bullets: [] },
      { q: "Have 4–5 strong STAR stories ready that flex across pillars.", lead: "Your go-to set:", bullets: [
          "A major incident + postmortem.",
          "A high-impact automation.",
          "A resilience/DR improvement.",
          "A team you built or turned around.",
          "An exec-facing reliability trade-off.",
        ] },
      { q: "Know your tools honestly.", lead: "Name the real ones (Splunk/Dynatrace/Prometheus/Terraform/Ansible/K8s) and be ready to go a layer deeper than the buzzword — Seán's tech screen will test depth.", bullets: [] },
      { q: "Have questions for them.", lead: "Good ones to ask:", bullets: [
          "How the EU presence relates to the global team.",
          "Which SRE-maturity pillar they most want this hire to own first.",
          "The biggest current operational pain.",
          "What success looks like to them at 12 months.",
        ] },
    ],
  },
];
const YOURS = [...PILLARS, ...EXTRA_SECTIONS];

// ---------- MINE: pulled live from tech-screen-stories.js ----------
const MINE_GROUPS = [
  { group: "Mine — Bridge cards (cloud-native ↔ platform; unique angle, worth keeping)", match: id => id.startsWith("ts-bridge-") },
  { group: "Mine — Generated cards (overlap your pillars; candidates to cut)", match: id => !id.startsWith("ts-bridge-") },
];
const MINE = MINE_GROUPS.map(g => ({
  pillar: g.group,
  note: "AI-generated by Claude from your CV + the JD. Treat as a draft; [INSERT]/[VERIFY] = where I refused to fabricate.",
  items: TECH_SCREEN_STORIES.filter(s => g.match(s.id)).map(s => ({
    id: s.id,
    q: s.title,
    context: s.card.c,
    bullets: s.card.a,
    result: s.card.r,
    learning: s.card.l,
    probes: s.probes || {},
  })),
}));

// ---------- assemble + assign stable ids ----------
const sections = [];
YOURS.forEach((p, pi) => {
  sections.push({
    owner: "you",
    pillar: p.pillar,
    note: p.note,
    items: p.items.map((it, ii) => ({ ...it, id: `you-${pi + 1}-${ii + 1}` })),
  });
});
MINE.forEach(p => sections.push({ owner: "mine", pillar: p.pillar, note: p.note, items: p.items }));

const DATA = JSON.stringify(sections);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mastercard Tech Screen — Prep</title>
<style>
  :root{ --bg:#16141f; --panel:#1f1c2b; --panel2:#262234; --ink:#ece9f5; --muted:#9b97ad;
         --you:#46c98b; --mine:#c79bff; --accent:#e6a23c; --line:#332e44; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  header{position:sticky;top:0;z-index:10;background:rgba(22,20,31,.96);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:12px 20px}
  .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:880px;margin:0 auto}
  h1{font-size:16px;margin:0 12px 0 0;font-weight:700;letter-spacing:.2px}
  .sub{color:var(--muted);font-size:12px;width:100%;max-width:880px;margin:4px auto 0}
  button{background:var(--panel2);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer}
  button:hover{border-color:var(--accent)}
  button.on{background:var(--accent);color:#1a1622;border-color:var(--accent);font-weight:600}
  #search{flex:1;min-width:160px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:7px 12px;font-size:13px}
  main{max-width:880px;margin:0 auto;padding:24px 20px 120px}
  .pillar{margin:34px 0 14px}
  .pillar h2{font-size:19px;margin:0 0 4px}
  .pillar .pnote{color:var(--muted);font-size:13px;font-style:italic}
  .card{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--you);border-radius:12px;padding:16px 18px;margin:12px 0}
  .card.mine{border-left-color:var(--mine)}
  .q{display:flex;gap:10px;align-items:flex-start;cursor:pointer}
  .q .qt{font-size:16.5px;font-weight:600;margin:0}
  .badge{flex:none;font-size:10px;font-weight:700;letter-spacing:.5px;padding:3px 7px;border-radius:6px;text-transform:uppercase;margin-top:2px}
  .badge.you{background:rgba(70,201,139,.16);color:var(--you)}
  .badge.mine{background:rgba(199,155,255,.16);color:var(--mine)}
  .ans{margin-top:12px;display:none}
  .card.open .ans{display:block}
  .ans p{margin:0 0 8px}
  .ans p.lead{font-weight:600;color:#fff;font-size:16px;margin-bottom:8px}
  .ans ul{margin:6px 0 8px;padding-left:22px}
  .ans li{margin:5px 0}
  .lbl{color:var(--accent);font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin:10px 0 2px}
  .probe{font-size:14px;color:#cfc9dd;margin:3px 0;padding-left:12px;border-left:2px solid var(--line)}
  .probe b{color:var(--ink)}
  strong{color:#fff}
  code{background:#11101a;border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:13.5px}
  mark{background:rgba(230,162,60,.3);color:inherit;padding:0 2px;border-radius:3px}
  .toolrow{display:flex;gap:6px;align-items:center;margin-top:12px;flex-wrap:wrap}
  .verdict{font-size:12px;padding:4px 9px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
  .verdict.keep.sel{background:rgba(70,201,139,.2);color:var(--you);border-color:var(--you)}
  .verdict.rework.sel{background:rgba(230,162,60,.2);color:var(--accent);border-color:var(--accent)}
  .verdict.cut.sel{background:rgba(255,107,107,.2);color:#ff8a8a;border-color:#ff8a8a}
  textarea.note{width:100%;margin-top:10px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:9px 11px;font:14px/1.5 inherit;resize:vertical;min-height:38px}
  textarea.note:focus{outline:none;border-color:var(--accent)}
  .hidden{display:none!important}
  .savednote{font-size:11px;color:var(--you);margin-left:auto}
  dialog{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:12px;max-width:760px;width:90%;padding:18px}
  dialog textarea{width:100%;height:50vh;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:12px;font:13px/1.5 ui-monospace,Menlo,monospace}
  .count{color:var(--muted);font-size:12px}
</style>
</head>
<body>
<header>
  <div class="bar">
    <h1>Mastercard Tech Screen — Prep</h1>
    <button class="filt on" data-f="all">All</button>
    <button class="filt" data-f="you">Yours</button>
    <button class="filt" data-f="mine">Mine</button>
    <input id="search" placeholder="Search questions & answers…">
    <button id="revealAll">Reveal all</button>
    <button id="hideAll">Hide all</button>
    <button id="export">Export notes ⤓</button>
  </div>
  <div class="sub">Director, SRE · Interviewers: James Sturrock (VP, Distributed Platforms) &amp; Seán Magee (Dir, Software Eng) · <span class="count" id="count"></span> · Click a question to reveal the answer. Notes &amp; verdicts save automatically in this browser.</div>
</header>
<main id="main"></main>

<dialog id="exportDlg">
  <p style="margin-top:0">Copy this and paste it back to Claude — your verdicts + notes per card:</p>
  <textarea id="exportText" readonly></textarea>
  <div style="margin-top:10px;display:flex;gap:8px">
    <button id="copyExport">Copy to clipboard</button>
    <button onclick="document.getElementById('exportDlg').close()">Close</button>
  </div>
</dialog>

<script>
const DATA = ${DATA};
const LS = "mc-techscreen-prep-v1";
let store = JSON.parse(localStorage.getItem(LS) || "{}");
const save = () => localStorage.setItem(LS, JSON.stringify(store));
const rec = id => (store[id] = store[id] || {verdict:"", note:""});

const esc = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const fmt = s => esc(s)
  .replace(/\`([^\`]+)\`/g, "<code>$1</code>")
  .replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
const main = document.getElementById("main");

function render(){
  main.innerHTML = "";
  DATA.forEach(sec => {
    const sd = document.createElement("section");
    sd.className = "pillar";
    sd.dataset.owner = sec.owner;
    sd.innerHTML = '<h2>'+esc(sec.pillar)+'</h2><div class="pnote">'+esc(sec.note)+'</div>';
    sec.items.forEach(it => sd.appendChild(card(sec, it)));
    main.appendChild(sd);
  });
  applyFilter();
  updateCount();
}

function bulletsHtml(arr){ return (arr&&arr.length) ? '<ul>'+arr.map(b=>'<li>'+fmt(b)+'</li>').join("")+'</ul>' : ''; }
function defsHtml(obj){ const k=Object.keys(obj||{}); if(!k.length) return ''; return '<div class="lbl">Term check — own these cold (follow-up bait)</div>'+k.map(t=>'<div class="probe"><b>'+esc(t)+'</b> — '+fmt(obj[t])+'</div>').join(''); }

function card(sec, it){
  const d = rec(it.id);
  const el = document.createElement("article");
  el.className = "card " + (sec.owner==="mine"?"mine":"");
  el.dataset.owner = sec.owner;
  el.dataset.id = it.id;

  const badge = sec.owner==="mine" ? '<span class="badge mine">Mine</span>' : '<span class="badge you">Yours</span>';
  let ans = "";
  if(sec.owner==="you"){
    ans = (it.lead ? '<p class="lead">'+fmt(it.lead)+'</p>' : '') + bulletsHtml(it.bullets) + defsHtml(it.defs);
  } else {
    ans = '<p class="lead">'+fmt(it.context)+'</p>' + bulletsHtml(it.bullets)
        + '<div class="lbl">Result</div><p>'+fmt(it.result)+'</p>'
        + '<div class="lbl">Principle</div><p>'+fmt(it.learning)+'</p>';
    const pk = Object.keys(it.probes||{});
    if(pk.length){ ans += '<div class="lbl">If they probe…</div>' + pk.map(k=>'<div class="probe"><b>“'+esc(k)+'”</b> → '+fmt(it.probes[k])+'</div>').join(""); }
  }

  el.innerHTML =
    '<div class="q">'+badge+'<p class="qt">'+esc(it.q)+'</p></div>'+
    '<div class="ans">'+ans+
      '<div class="toolrow">'+
        '<button class="verdict keep'+(d.verdict==="keep"?" sel":"")+'" data-v="keep">👍 Keep</button>'+
        '<button class="verdict rework'+(d.verdict==="rework"?" sel":"")+'" data-v="rework">✏️ Rework</button>'+
        '<button class="verdict cut'+(d.verdict==="cut"?" sel":"")+'" data-v="cut">👎 Cut</button>'+
        '<span class="savednote" data-saved></span>'+
      '</div>'+
      '<textarea class="note" placeholder="Your thoughts on this answer…">'+esc(d.note)+'</textarea>'+
    '</div>';

  el.querySelector(".q").addEventListener("click", () => el.classList.toggle("open"));
  el.querySelectorAll(".verdict").forEach(b => b.addEventListener("click", e=>{
    e.stopPropagation();
    const v = b.dataset.v; const r = rec(it.id);
    r.verdict = r.verdict===v ? "" : v; save();
    el.querySelectorAll(".verdict").forEach(x=>x.classList.toggle("sel", x.dataset.v===r.verdict));
  }));
  const ta = el.querySelector(".note");
  const saved = el.querySelector("[data-saved]");
  ta.addEventListener("input", ()=>{ rec(it.id).note = ta.value; save(); saved.textContent="saved ✓"; setTimeout(()=>saved.textContent="",900); });
  return el;
}

// filters
let filter="all";
document.querySelectorAll(".filt").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".filt").forEach(x=>x.classList.remove("on"));
  b.classList.add("on"); filter=b.dataset.f; applyFilter(); updateCount();
}));
function applyFilter(){
  const term = (document.getElementById("search").value||"").toLowerCase();
  document.querySelectorAll(".pillar").forEach(sec=>{
    let shown=0;
    sec.querySelectorAll(".card").forEach(c=>{
      const okOwner = filter==="all" || c.dataset.owner===filter;
      const okTerm = !term || c.textContent.toLowerCase().includes(term);
      const show = okOwner && okTerm;
      c.classList.toggle("hidden", !show);
      if(show) shown++;
    });
    sec.classList.toggle("hidden", shown===0);
  });
}
document.getElementById("search").addEventListener("input", ()=>{applyFilter();updateCount();});
document.getElementById("revealAll").addEventListener("click", ()=>document.querySelectorAll(".card:not(.hidden)").forEach(c=>c.classList.add("open")));
document.getElementById("hideAll").addEventListener("click", ()=>document.querySelectorAll(".card").forEach(c=>c.classList.remove("open")));
function updateCount(){
  const vis=[...document.querySelectorAll(".card")].filter(c=>!c.classList.contains("hidden")).length;
  document.getElementById("count").textContent = vis+" questions shown";
}

// export
document.getElementById("export").addEventListener("click", ()=>{
  let out="MASTERCARD TECH SCREEN — MY NOTES & VERDICTS\\n\\n";
  DATA.forEach(sec=>{
    const lines=[];
    sec.items.forEach(it=>{
      const d=store[it.id]; if(!d || (!d.verdict && !(d.note||"").trim())) return;
      lines.push("  ["+(d.verdict||"—").toUpperCase()+"] "+it.q+(d.note?("\\n      note: "+d.note):""));
    });
    if(lines.length){ out += sec.pillar+"\\n"+lines.join("\\n")+"\\n\\n"; }
  });
  if(out.indexOf("[")<0) out += "(no verdicts or notes yet — tag cards Keep/Rework/Cut and add notes)";
  document.getElementById("exportText").value=out;
  document.getElementById("exportDlg").showModal();
});
document.getElementById("copyExport").addEventListener("click", ()=>{
  const t=document.getElementById("exportText"); t.select(); navigator.clipboard.writeText(t.value);
});

render();
</script>
</body>
</html>`;

const out = path.join(__dirname, "..", "tech-screen-prep.html");
fs.writeFileSync(out, html);
const total = sections.reduce((n, s) => n + s.items.length, 0);
console.log("Wrote", out);
console.log("Sections:", sections.length, "| total cards:", total,
  "| yours:", sections.filter(s=>s.owner==="you").reduce((n,s)=>n+s.items.length,0),
  "| mine:", sections.filter(s=>s.owner==="mine").reduce((n,s)=>n+s.items.length,0));
