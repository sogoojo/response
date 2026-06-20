// Builds a print-ready prep document (light theme, fully expanded) for PDF export.
// Source of truth for the pillars: pillar-cards.js. Hypotheticals + behavioral map
// authored here. Output: ../mastercard-tech-screen-prep.html  (then Print → Save as PDF,
// or the companion convert step produces the .pdf directly).
//
// Re-run:  node dev/build-prep-pdf.js
const fs = require("fs");
const path = require("path");
const { PILLARS } = require("./pillar-cards");

const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = s => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

// ---------- Full model answers for the two big openers ----------
const HYPOTHETICALS = [
  {
    q: "Tell me about yourself.",
    why: "First impression + frame for the whole screen. ~60–75 seconds. Present → past (the boomerang) → why this role. End on the bridge to Mastercard.",
    answer: [
      "I'm a site-reliability and platform-engineering leader. Today I run a 20-person global SRE organisation at Citi, spanning the US, Europe and India — and I built that function essentially from the ground up.",
      "Three things define the last few years there. First, observability: I architected our platform on OpenTelemetry, Prometheus and Grafana, correlating signals across hundreds of cloud-native services. Second, AIOps: I built an ML engine that ingests over 100,000 ServiceNow incident and change records a month for predictive analysis and hotspot detection — that cut repeat incidents by 35%. Third, automation: high-throughput event pipelines on Kafka and Flink, 2 billion-plus events a day, which took 25% of the toil off the team. Alongside the platform I doubled the team's throughput and built the leadership layer underneath me.",
      "What's most relevant here is that this is a return. From 2019 to 2022 I was at Mastercard in Dublin as a tech lead and engineering manager — Kubernetes in production, on-call, CI/CD. So I know the environment, the compliance rigour, and how critical payments infrastructure really operates.",
      "That's why this role pulls me: Director of SRE on Distributed Platforms is exactly where my enterprise SRE experience, my European operational leadership, and my Mastercard knowledge converge. I want to bring the SRE maturity I built at Citi back to a domain — and a team — I already care about.",
    ],
    coaching: [
      "Lead with the role you do now, not your title history.",
      "Land at least one number early (the −35% or the 20-person org) — it signals scale fast.",
      "The boomerang is an asset — name it as continuity and domain knowledge, not as 'going backwards'.",
      "Close on why THIS role, so you hand the interviewer the obvious next question.",
    ],
  },
  {
    q: "Tell me about your most difficult project.",
    why: "They want scope, your specific role, real difficulty (usually organisational, not just technical), and the outcome. Use CARL and make the difficulty honest.",
    answer: [
      "**Context.** At Citi, reliability was largely reactive — teams firefighting, no shared observability, repeat incidents piling up — across a global cloud organisation spanning the US, Europe and India. I set out to build an SRE discipline and platform from scratch. The hardest part was never purely technical; it was doing it across independent teams that didn't yet share practices.",
      "**Action.** I architected the observability platform — OpenTelemetry, Prometheus, Grafana — and then made the riskier bet: an AIOps engine doing ML text-analytics over 100,000-plus ServiceNow incident and change records a month, to predict hotspots and accelerate root-cause analysis. Three real difficulties: getting messy, inconsistent incident data into a usable shape; winning trust from teams wary of 'yet another platform'; and delivering value fast enough to keep executive funding. I drove adoption with a paved-road approach — self-service, guardrails not gates — and presented progress and trade-offs to senior leadership, including the CTO/EAC, on a regular cadence.",
      "**Result.** Repeat incidents down 35%, toil down 25% through the automation and event-pipeline work (Kafka/Flink, 2 billion-plus events a day). The platform became the org's reliability backbone, and the operating model was adopted by other teams.",
      "**Learning.** The technical build was solvable. The real difficulty — and the real leadership — was organisational: getting autonomous global teams to adopt a shared discipline. I learned to drive reliability through influence and evidence, not authority. That's the muscle I'd bring to standing up the European SRE presence here.",
    ],
    coaching: [
      "Frame the difficulty as organisational (cross-team adoption), not just 'the tech was hard' — that's the Director signal.",
      "Keep the metrics (−35%, −25%, 2B/day) — they make it real.",
      "End by bridging to THIS role (the European-presence build).",
      "Backup difficult-project stories if they want a different flavour: Cloud Migration (top-down & bottom-up), DRIFT Modernization, or the Kafka OOM 3am incident (if they want an incident-flavoured one).",
    ],
  },
];

// ---------- Behavioral map (which real story to tell) ----------
const BEHAVIORAL_MAP = {
  title: "Behavioral — “Tell me about a time…” → which story to tell",
  note: "These want a SPECIFIC story (what YOU did + the result). Lead with the first; keep the backup ready. Own it first-person, land a number, add the leadership layer.",
  items: [
    ["A major incident you led / handled", "Kafka OOM 3am Incident", "Incident Response & Blameless Postmortems (Citi)"],
    ["Influenced people you didn't manage", "Terraform Golden Path", "Governance Pushback / Architecture Alignment (Greg)"],
    ["Disagreed with a peer or leader (technical)", "Kafka vs Solace (ARB Conflict)", "Flink vs Spark (ARB) / Pod 4 Alignment"],
    ["You were wrong / a decision failed", "Neo4j Wrong Call", "Misjudged Engineer"],
    ["Managed underperformance", "Underperformer (PIP → Exit) — hard call", "Underperformer (Coach Up) — turnaround"],
    ["Built or scaled a team", "Scaling Teams 25→50 (Managing Managers)", "Scaling the Global Org 10→20"],
    ["Most impactful automation / efficiency win", "SCOUT — ML Reliability Platform", "Terraform Golden Path"],
    ["Balanced reliability vs delivery pressure", "Conflicting Requirements (PM Roadmap)", "Governance Pushback on Streaming"],
    ["Navigated significant ambiguity", "Application Dependencies (Ambiguity → Alignment)", "Cloud Agnostic Infrastructure"],
    ["Communicated something complex to execs", "Cross-Functional Partnership & Exec Comms (Citi)", "Communication & Planning Structures"],
    ["Mentored or grew an engineer", "Misjudged Engineer / Coach Up", "Inclusive Leadership & Diversity"],
    ["A complex migration / modernization", "Cloud Migration (Top-Down & Bottom-Up)", "DRIFT Modernization / TIBCO EMS"],
    ["Fostered inclusion / built a diverse team", "Inclusive Leadership & Diversity", "—"],
  ],
};

const CROSS_CUTTING = {
  title: "Cross-cutting threads (weave through every answer)",
  items: [
    ["Tie everything to payments", "Zero-downtime, PCI DSS, seasonal peaks, 'slow = failed at point of sale' — this is what makes a generic SRE answer a Mastercard answer."],
    ["Show the leadership layer", "For every 'how does X work', add 'and here's how I'd drive it through a team / report it to execs.' The Director differentiator."],
    ["Know your tools honestly", "Name the real ones (Splunk/Dynatrace/Prometheus/Terraform/Ansible/K8s); be ready to go a layer deeper than the buzzword."],
    ["Have questions for them", "EU presence vs the global team · which SRE pillar to own first · biggest current operational pain · what success looks like at 12 months."],
  ],
};

// ---------- render ----------
function qaBlock(q, lead, bullets, defs) {
  let h = `<div class="qa"><div class="q">${esc(q)}</div>`;
  if (lead) h += `<p class="lead">${fmt(lead)}</p>`;
  if (bullets && bullets.length) h += `<ul>${bullets.map(b => `<li>${fmt(b)}</li>`).join("")}</ul>`;
  const dk = Object.keys(defs || {});
  if (dk.length) {
    h += `<div class="defs"><div class="defs-h">Term check — own these cold</div>`
      + dk.map(t => `<div class="def"><b>${esc(t)}</b> — ${fmt(defs[t])}</div>`).join("") + `</div>`;
  }
  return h + `</div>`;
}

let body = "";

// Hypotheticals
body += `<h2 class="sec">Opening set-pieces (full model answers)</h2>`;
HYPOTHETICALS.forEach(h => {
  body += `<div class="qa keep-together"><div class="q big">${esc(h.q)}</div>`;
  body += `<p class="why"><b>Why &amp; how:</b> ${esc(h.why)}</p>`;
  body += `<div class="model">` + h.answer.map(p => `<p>${fmt(p)}</p>`).join("") + `</div>`;
  body += `<div class="defs"><div class="defs-h">Delivery notes</div>` + h.coaching.map(c => `<div class="def">${fmt(c)}</div>`).join("") + `</div>`;
  body += `</div>`;
});

// Pillars
PILLARS.forEach(p => {
  body += `<h2 class="sec">${esc(p.pillar)}</h2>`;
  body += `<p class="pnote">${esc(p.note)}</p>`;
  p.items.forEach(it => { body += qaBlock(it.q, it.lead, it.bullets, it.defs); });
});

// Behavioral map
body += `<h2 class="sec">${esc(BEHAVIORAL_MAP.title)}</h2>`;
body += `<p class="pnote">${esc(BEHAVIORAL_MAP.note)}</p>`;
body += `<table class="map"><thead><tr><th>If they ask about…</th><th>Lead with</th><th>Backup</th></tr></thead><tbody>`;
BEHAVIORAL_MAP.items.forEach(([k, a, b]) => { body += `<tr><td>${esc(k)}</td><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`; });
body += `</tbody></table>`;

// Cross-cutting
body += `<h2 class="sec">${esc(CROSS_CUTTING.title)}</h2>`;
CROSS_CUTTING.items.forEach(([k, v]) => { body += `<div class="qa"><div class="q">${esc(k)}</div><p class="lead">${fmt(v)}</p></div>`; });

const totalQ = HYPOTHETICALS.length + PILLARS.reduce((n, p) => n + p.items.length, 0);

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Mastercard Tech Screen — Prep</title>
<style>
  @page { margin: 16mm 15mm; }
  * { box-sizing: border-box; }
  body { font: 11.5pt/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:#1c2030; margin:0; }
  .cover { text-align:center; padding:40px 0 8px; border-bottom:3px solid #cf1f2e; margin-bottom:18px; }
  .cover h1 { font-size:22pt; margin:0 0 6px; color:#0f1320; }
  .cover .role { font-size:13pt; color:#cf1f2e; font-weight:600; }
  .cover .meta { font-size:10pt; color:#5b6072; margin-top:8px; }
  h2.sec { font-size:14pt; color:#0f1320; border-bottom:2px solid #e3a008; padding-bottom:4px; margin:22px 0 6px; page-break-after:avoid; }
  .pnote { font-size:9.5pt; color:#6b7186; font-style:italic; margin:0 0 8px; }
  .qa { margin:0 0 12px; padding:10px 12px; border:1px solid #e6e8ef; border-left:3px solid #cf1f2e; border-radius:6px; page-break-inside:avoid; background:#fbfbfd; }
  .qa .q { font-weight:700; font-size:11.5pt; color:#0f1320; margin-bottom:4px; }
  .qa .q.big { font-size:13pt; color:#cf1f2e; }
  .qa .why { font-size:9.5pt; color:#6b7186; margin:2px 0 8px; }
  .qa p.lead { font-weight:600; margin:2px 0 6px; }
  .qa ul { margin:4px 0 6px; padding-left:20px; }
  .qa li { margin:2px 0; }
  .model p { margin:0 0 8px; }
  .defs { margin-top:8px; background:#f4f1ff; border:1px solid #e6e0fb; border-radius:5px; padding:7px 10px; }
  .defs-h { font-size:8.5pt; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:#7a5af0; margin-bottom:4px; }
  .def { font-size:9.5pt; margin:2px 0; }
  .keep-together { page-break-inside:avoid; }
  code { background:#eef0f5; border:1px solid #dfe2ea; border-radius:3px; padding:0 3px; font-size:10pt; }
  strong { color:#0f1320; }
  table.map { width:100%; border-collapse:collapse; font-size:9.5pt; page-break-inside:auto; }
  table.map th, table.map td { border:1px solid #e6e8ef; padding:5px 7px; text-align:left; vertical-align:top; }
  table.map th { background:#0f1320; color:#fff; font-size:9pt; }
  table.map tr { page-break-inside:avoid; }
  .foot { margin-top:24px; padding-top:8px; border-top:1px solid #e6e8ef; font-size:8.5pt; color:#9097aa; text-align:center; }
</style></head>
<body>
  <div class="cover">
    <h1>Mastercard &mdash; Hiring Team Tech Screen</h1>
    <div class="role">Director, Site Reliability Engineering &middot; Distributed Platforms</div>
    <div class="meta">Interviewers: James Sturrock (VP, Distributed Platforms) &amp; Se&aacute;n Magee (Director, Software Engineering) &middot; ${totalQ} answers + behavioral map</div>
  </div>
  ${body}
  <div class="foot">Prep document &middot; pillars sourced from pillar-cards.js &middot; [INSERT]/[VERIFY] markers = personalize before the screen.</div>
</body></html>`;

const out = path.join(__dirname, "..", "mastercard-tech-screen-prep.html");
fs.writeFileSync(out, html);
console.log("Wrote", out);
console.log("Hypotheticals:", HYPOTHETICALS.length, "| pillar Q&As:", PILLARS.reduce((n, p) => n + p.items.length, 0), "| total set-pieces:", totalQ);
