// Builds the eBay CDT interview-prep review page (replaces tech-screen-prep.html).
// - "Plan"  = strategy cards defined inline below (how to play the interview).
// - "Story" = CARL cards pulled live from ebay-stories.js.
// Notes persist in localStorage; Export produces text to paste back to Claude.
// The old Mastercard generator (build-prep-page.js + tech-screen-stories.js) is
// untouched — re-run it if you ever need that page back.
//
// Re-run:  node dev/build-ebay-prep.js
const fs = require("fs");
const path = require("path");
const { EBAY_STORIES } = require("./ebay-stories");

// ---------- PLAN: strategy sections ----------
const PLAN_SECTIONS = [
  {
    pillar: "Read first — how to play this interview",
    note: "eBay Sr. Software Engineering Manager, Cloud Data Technologies (CDT). Stated focus: management experience & technical project experience.",
    items: [
      { q: "▶ The interviewer — a peer, not the hiring manager",
        lead: "Sr. EM, Cloud Data Technology, 13 years at eBay, came up IC → Quality Engineer → Staff → EM. Strong voice in who gets hired.",
        bullets: [
          "He's evaluating **'would I want this person as my peer?'** — collaboration signals and technical depth behind management claims. Peers smell hand-waving fastest.",
          "His QA roots: respect for quality and depth — expect 'go one layer deeper' probes. Know your numbers cold.",
          "His world (from his own headline): **enterprise data foundation for near-real-time AI/analytics, experimentation & A/B testing, agentic automation, resilient platforms, 99.99% uptime, buyer retention**.",
          "Make it a working session: ask his opinions, engage with his answers, balance 'I' (decisions) with 'we' (credit).",
        ] },
      { q: "▶ Question coverage map (from your own prep notes)",
        lead: "Probability-scored + the eBay-specific list. Every one maps to a card below.",
        bullets: [
          "**Conflict — 100%, WILL come out** → Flink A/B (lead), Kafka vs Solace, Pod 4, Greg, Governance.",
          "**Project you're most proud of — 100%** → DRIFT (20-second headline ready).",
          "**Underperformer — 80%** → Coach Up, with the PIP→exit ending in your pocket.",
          "**Failed project — 70%** → Neo4j Wrong Call.",
          "**Disagree with supervisor — 50%** → ⚠️ GAP card, needs your story.",
          "eBay list: breaking down complex projects → TIBCO; measurable business impact → FinOps; hiring/onboarding → Hiring card; motivate a struggling member → Coach Up; competing priorities → Backlog; hardest technical problem / most complex system → DRIFT.",
        ] },
      { q: "▶ Conflict-story rules (your coach notes — reread before going in)",
        lead: "STAR/CAR with ~60% of airtime on Action. Result must show you got the outcome without damaging the relationship, plus a learning.",
        bullets: [
          "Pick **high-stakes, organizational** conflict where you were deeply involved and right — but never a story where the other side was obviously stupid (it imbalances you).",
          "Show empathy for the other side's position; aim for win-win; don't vilify — stay rational.",
          "Show the **systemic fix** so the same conflict has a path next time (design-review gate, controlled-use model, validation framework).",
          "Don't bring: grievances, missed promotions, trivial disagreements, emotional stories with no logic.",
          "Architectural choices come with a PoC; prioritization comes with data.",
        ] },
      { q: "▶ Numbers — say them consistently",
        lead: "A peer EM will notice drift between answers. One set of truth:",
        bullets: [
          "DRIFT: **2B records/day, 300 sources, 300 teams onboarded, 6h → <1min, 99.9% uptime, 40% fewer nodes**. Throughput math: ~23,000 events/sec baseline; ~4.6 MB/s at 200B/event, ~23 MB/s at 1KB.",
          "SCOUT: **triage −55%, recurring incidents −36%, precision 68% → 89%, 110ms latency budget**.",
          "Org: **20-person global org (US/Europe/India)**; TIBCO: first AWS flow in 12 weeks, zero downtime, incidents −50%, approval latency −30%.",
          "FinOps: **$12.5M annualized** identified in Q1. Golden Path: 85% adoption in 3 months, misconfig incidents −60%.",
        ] },
    ],
  },
  {
    pillar: "Term check — experimentation & platform vocabulary",
    note: "His headline says experimentation, A/B testing, agentic automation. Own these cold — follow-up bait.",
    items: [
      { q: "Deployment-experiment spectrum", lead: "Be precise about which is which:", bullets: [],
        defs: {
          "canary release": "New version serves a small slice of real traffic alongside the incumbent; promote on healthy metrics. Tests the *deployment*, randomization not required.",
          "progressive rollout": "Staged exposure expansion (1% → 5% → 25% → 100%) with metric gates at each stage and rollback on guardrail regression.",
          "blue/green": "Two full environments, instant cutover and instant rollback — availability play, not a learning play.",
          "feature flag": "Runtime toggle decoupling deploy from release; the substrate that makes canaries, rollouts, and A/B targeting cheap.",
          "shadow / dark launch": "New path processes real traffic but its output isn't served — validates correctness and capacity with zero user risk.",
          "A/B test": "Randomized controlled experiment: users split into control/treatment, success + guardrail metrics compared for statistical significance. Tests the *product hypothesis*.",
        } },
      { q: "Experimentation platform anatomy", lead: "What CDT likely builds toward — and your informed-outsider view:", bullets: [],
        defs: {
          "assignment service": "Deterministic, consistent bucketing of users into variants; handles exclusion groups and layered concurrent experiments.",
          "exposure logging": "Recording who actually saw which variant when — the #1 source of broken experiments; must flow through the same trustworthy pipeline as analytics.",
          "metrics pipeline": "Computes experiment metrics from the event stream — same foundation as analytics or you get two sources of truth. (This is the CDT connection.)",
          "guardrail metrics": "Health metrics (latency, errors, revenue) that auto-halt or page regardless of the success metric.",
          "statistical significance / power": "Enough sample to distinguish signal from noise; underpowered tests produce confident-looking lies. Know the concept, don't lecture.",
          "agentic automation": "Systems that act, not just recommend — guardrails, audit trails, autonomy expanded per action class as trust accrues. Your SCOUT evolution story + his passion.",
        } },
    ],
  },
];

// ---------- STORY groups: pulled live from ebay-stories.js ----------
const STORY_GROUPS = [
  { group: "Technical project experience", note: "The spine. DRIFT is the stage-setter — your pitch ends on it deliberately.", match: id => id.startsWith("eb-tech-") },
  { group: "Conflict & peer collaboration — 100%, will come out", note: "His natural probing ground as a peer. Flink A/B doubles as your experimentation credential.", match: id => id.startsWith("eb-conf-") },
  { group: "Management experience", note: "The other stated focus. JD language baked in: tailored mentorship, inclusive teams, healthy backlog, high-velocity.", match: id => id.startsWith("eb-mgmt-") },
  { group: "Narratives — pitch, why, questions", note: "Past/present/future framing. Two [INSERT]s are yours: the Mastercard line and the personal eBay hook.", match: id => id.startsWith("eb-nar-") },
];
const STORIES = STORY_GROUPS.map(g => ({
  pillar: g.group,
  note: g.note + " [VERIFY]/[INSERT] = details only you can supply — fill via notes below.",
  items: EBAY_STORIES.filter(s => g.match(s.id)).map(s => ({
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
PLAN_SECTIONS.forEach((p, pi) => {
  sections.push({
    owner: "you",
    pillar: p.pillar,
    note: p.note,
    items: p.items.map((it, ii) => ({ ...it, id: `plan-${pi + 1}-${ii + 1}` })),
  });
});
STORIES.forEach(p => sections.push({ owner: "mine", pillar: p.pillar, note: p.note, items: p.items }));

const DATA = JSON.stringify(sections);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>eBay CDT Screen — Prep</title>
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
  .verify{background:rgba(255,107,107,.18);color:#ff9d9d;border-radius:4px;padding:0 4px;font-weight:600}
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
    <h1>eBay CDT Screen — Prep</h1>
    <button class="filt on" data-f="all">All</button>
    <button class="filt" data-f="you">Plan</button>
    <button class="filt" data-f="mine">Stories</button>
    <input id="search" placeholder="Search questions & answers…">
    <button id="revealAll">Reveal all</button>
    <button id="hideAll">Hide all</button>
    <button id="export">Export notes ⤓</button>
  </div>
  <div class="sub">Sr. Software Engineering Manager · Cloud Data Technologies · Interviewer: peer Sr. EM (13y eBay, QA→Staff→EM) · Focus: management + technical project experience · <span class="count" id="count"></span> · Click a question to reveal. Notes &amp; verdicts save in this browser.</div>
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
const LS = "ebay-cdt-prep-v1";
let store = JSON.parse(localStorage.getItem(LS) || "{}");
const save = () => localStorage.setItem(LS, JSON.stringify(store));
const rec = id => (store[id] = store[id] || {verdict:"", note:""});

const esc = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const fmt = s => esc(s)
  .replace(/\`([^\`]+)\`/g, "<code>$1</code>")
  .replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>")
  .replace(/\\[(VERIFY|INSERT)([^\\]]*)\\]/g, '<span class="verify">[$1$2]</span>');
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

  const badge = sec.owner==="mine" ? '<span class="badge mine">Story</span>' : '<span class="badge you">Plan</span>';
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
      '<textarea class="note" placeholder="Your notes — fill [VERIFY]/[INSERT] details here…">'+esc(d.note)+'</textarea>'+
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
  document.getElementById("count").textContent = vis+" cards shown";
}

// export
document.getElementById("export").addEventListener("click", ()=>{
  let out="EBAY CDT SCREEN — MY NOTES & VERDICTS\\n\\n";
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
  "| plan:", sections.filter(s=>s.owner==="you").reduce((n,s)=>n+s.items.length,0),
  "| stories:", sections.filter(s=>s.owner==="mine").reduce((n,s)=>n+s.items.length,0));
