// ============================================================================
// tech-screen-stories.js  —  Mastercard "Hiring Team Tech Screen" prep
// ----------------------------------------------------------------------------
// ADDITIVE MODULE. This file is merged into behavioral-stories.js at the bottom
// of that file (a single require + append block). It does NOT modify any
// existing story, question type, keyword, or category — it only adds new ones.
// To remove all of this cleanly:  delete the merge block in behavioral-stories.js
// and delete this file.  Nothing else is touched.
//
// Interviewers (identified 2026-06-02):
//   - James Sturrock — VP, Distributed Platforms (ex-Nutanix Dir Systems Eng).
//     Infra/virtualization-native: VMware, storage, hypervisor, capacity, fleet.
//   - Seán Magee — Director, Software Engineering. Likely peer / architecture lens.
//
// HONESTY NOTE: cards grounded in the candidate's real background — Citi SVP
// (20-person global SRE org: OpenTelemetry/Prometheus/Grafana, AIOps on 100k+
// incidents/mo, Kafka/Flink 2B+ events/day, ServiceNow, AWS/GCP, Terraform) and
// Mastercard Dublin 2019–2022 (Kubernetes in prod, on-call, CI/CD, DevOps).
// VMware / bare-metal / storage is the genuine GAP. Those cards use transferable
// reasoning + honest bridges, with [INSERT ...] slots for real anecdotes.
// Personalize and VERIFY before the screen — do not over-claim hands-on VMware.
// ============================================================================

// New question types (merged into QUESTION_TYPES). All under the "tech-screen" category.
const TECH_SCREEN_QUESTION_TYPES = {
  // 1. Distributed Platforms / infra-layer depth (James's lens)
  "ts-platform-failure":     { name: "Host / Hypervisor Failure (end-to-end)", category: "tech-screen", signals: ["domain-expertise", "ownership"] },
  "ts-stateful-stateless":   { name: "Stateful vs Stateless Reliability",      category: "tech-screen", signals: ["domain-expertise", "ownership"] },
  "ts-capacity-patching":    { name: "Capacity & Patching at Fleet Scale",     category: "tech-screen", signals: ["domain-expertise", "driving-results"] },
  "ts-platform-observability":{ name: "Platform-Layer Observability",          category: "tech-screen", signals: ["domain-expertise", "driving-results"] },
  "ts-cloud-vs-onprem":      { name: "Cloud vs On-Prem / Hybrid SRE",          category: "tech-screen", signals: ["domain-expertise", "leadership-influence"] },
  // 2. Reliability fundamentals (both)
  "ts-slo-error-budget":     { name: "SLOs & Error Budgets (payments)",        category: "tech-screen", signals: ["domain-expertise", "driving-results"] },
  "ts-incident-command":     { name: "Incident Command — Sev1 to Postmortem",  category: "tech-screen", signals: ["ownership", "leadership-influence"] },
  "ts-mttr-toil":            { name: "MTTR Plateau & Toil Reduction",          category: "tech-screen", signals: ["driving-results", "ownership"] },
  // 3. Live failure scenario
  "ts-live-degradation":     { name: "Live Scenario — First 15 Minutes",       category: "tech-screen", signals: ["ownership", "communicating-effectively"] },
  "ts-cascading-failure":    { name: "Live Scenario — Cascading Failure",      category: "tech-screen", signals: ["ownership", "domain-expertise"] },
  // 4. Architecture / scale judgment (Seán's lens)
  "ts-alerting-design":      { name: "Alerting Design / Alert Fatigue",        category: "tech-screen", signals: ["domain-expertise", "driving-results"] },
  "ts-cross-region":         { name: "Cross-Region Resilience (active/active)",category: "tech-screen", signals: ["domain-expertise", "leadership-influence"] },
  "ts-safe-deploys":         { name: "Safe Deploys at Scale",                  category: "tech-screen", signals: ["domain-expertise", "driving-results"] },
  // 5. Leadership-technical (Director-specific)
  "ts-raise-bar":            { name: "Raise the Bar Without Authority",        category: "tech-screen", signals: ["leadership-influence", "communicating-effectively"] },
  "ts-feature-vs-reliability":{ name: "Features vs Reliability (error budgets)",category: "tech-screen", signals: ["leadership-influence", "ownership"] },
  "ts-sre-culture":          { name: "SRE Culture vs SRE Team",                category: "tech-screen", signals: ["leadership-influence", "mentorship"] },

  // ===== CLOUD-NATIVE <-> PLATFORM BRIDGE =====
  // Each maps a proven CV strength onto the Distributed-Platforms substrate
  // (Linux/Windows/VMware/storage) and the JD pillar it satisfies.
  "ts-bridge-observability": { name: "Bridge: Observability — Cloud-Native to Platform", category: "tech-screen-bridge", signals: ["domain-expertise", "driving-results"] },
  "ts-bridge-aiops":         { name: "Bridge: AIOps/RCA & Automated Remediation",        category: "tech-screen-bridge", signals: ["domain-expertise", "driving-results"] },
  "ts-bridge-automation":    { name: "Bridge: Automation & Toil on the Fleet",           category: "tech-screen-bridge", signals: ["domain-expertise", "driving-results"] },
  "ts-bridge-resilience":    { name: "Bridge: Operational Resilience & Chaos",           category: "tech-screen-bridge", signals: ["ownership", "leadership-influence"] },
  "ts-bridge-hybrid":        { name: "Bridge: Multi-Cloud to Hybrid/On-Prem IaC",        category: "tech-screen-bridge", signals: ["domain-expertise", "leadership-influence"] },
  "ts-bridge-european":      { name: "Bridge: European Presence & Leadership",           category: "tech-screen-bridge", signals: ["leadership-influence", "domain-expertise"] },
};

// New categories (merged into CATEGORIES) — derived from each question type's
// `category` field so ordering/additions can't desync the grouping.
const TECH_SCREEN_CATEGORY_NAMES = {
  "tech-screen": "Tech Screen (Sturrock / Magee)",
  "tech-screen-bridge": "Cloud-Native ↔ Platform Bridge",
};
const TECH_SCREEN_CATEGORY = {};
for (const [qt, def] of Object.entries(TECH_SCREEN_QUESTION_TYPES)) {
  const cat = def.category;
  if (!TECH_SCREEN_CATEGORY[cat]) {
    TECH_SCREEN_CATEGORY[cat] = { name: TECH_SCREEN_CATEGORY_NAMES[cat] || cat, questionTypes: [] };
  }
  TECH_SCREEN_CATEGORY[cat].questionTypes.push(qt);
}

// New stories (appended to STORIES). domains: ["tech-screen"] → own UI tab.
const TECH_SCREEN_STORIES = [
  // ===================== 1. DISTRIBUTED PLATFORMS DEPTH =====================
  {
    id: "ts-platform-failure",
    title: "VMware/Host Failure — Detect, Contain, Prevent",
    domains: ["tech-screen"],
    questionTypes: ["ts-platform-failure"],
    signals: ["domain-expertise", "ownership"],
    card: {
      c: "A single host failure should be a non-event the platform absorbs. SRE's job is the same incident lifecycle I ran at Citi — detect, contain blast radius, prevent recurrence — applied at the hypervisor/hardware layer.",
      a: [
        "Detect from infra signals, not just app health: hardware health (IPMI/iLO), hypervisor metrics, datastore latency — a dead host should page before customers feel it.",
        "Automatic containment: vSphere HA restarts VMs on surviving hosts; DRS rebalances; admission control reserves N+1 failover capacity so the cluster can actually absorb the loss; anti-affinity keeps replicas off the same host/chassis.",
        "Blast radius first: which workloads were on that host, were any single-instance (the real risk), and is shared storage/network implicated?",
        "Stateful caveat: stateless VMs restart cleanly; databases/quorum services need quorum-aware failover, not just a VM restart — that's where data-integrity risk lives.",
        "Prevent recurrence: blameless postmortem, RCA on firmware/hardware, confirm headroom held, feed into capacity model + proactive hardware lifecycle (retire aging hosts before they fail).",
      ],
      r: "Common failure becomes boring (handled by HA + headroom); SRE attention goes to the uncommon edge — single-instance workloads, stateful failover, capacity exhaustion.",
      l: "Platform reliability is designed in (HA, admission control, anti-affinity, headroom), not reacted to.",
    },
    probes: {
      "what if it's storage not compute": "More dangerous — a datastore/SAN path failure hits many VMs at once, not one host. There I lean on multipathing, redundant fabrics, and storage-latency SLOs over compute HA.",
      "have you run vSphere HA yourself": "Honest bridge: at Mastercard I operated this pattern in Kubernetes — the scheduler reschedules pods off a failed node with PodDisruptionBudgets and anti-affinity, admission control == resource reservations. Principles map 1:1; I'd ramp on vSphere/Nutanix specifics fast. [INSERT real K8s node-failure example].",
      "single point of failure you've missed": "[INSERT real example — e.g. a single-instance dependency discovered during an incident, what you changed].",
    },
  },
  {
    id: "ts-stateful-stateless",
    title: "Stateful vs Stateless Reliability",
    domains: ["tech-screen"],
    questionTypes: ["ts-stateful-stateless"],
    signals: ["domain-expertise", "ownership"],
    card: {
      c: "The reliability model splits hard on state. Stateless is a capacity-and-routing problem; stateful is a data-integrity-and-consensus problem — and you can't auto-heal your way out of the latter.",
      a: [
        "Stateless: horizontal redundancy, health-checked load balancing, fast restart/reschedule. Failure = remove the bad instance, add another. Cheap to make reliable.",
        "Stateful: replication + quorum (Raft/Paxos-style), leader election, careful failover that protects consistency. The risk is split-brain and data loss, not downtime.",
        "Recovery objectives drive design: define RPO (data-loss tolerance) and RTO (downtime tolerance) per data store — payments balances are near-zero RPO.",
        "Backups are not DR: test restores, measure restore time, guard against logical corruption replicating to standbys (delayed replicas / PITR).",
        "Storage underneath matters: IOPS/latency SLOs, redundant paths, and knowing whether 'durable' means replicated-in-cluster or truly off-box.",
      ],
      r: "Right-sized effort: don't gold-plate stateless; obsess over consensus, RPO/RTO, and tested restores for stateful.",
      l: "Most catastrophic incidents are stateful — protect data and consistency first, availability second.",
    },
    probes: {
      "example of stateful reliability work": "At Citi the AIOps + event pipeline (Kafka/Flink, 2B+ events/day) forced exactly-once / replay thinking and durable offsets. [INSERT a DB or stateful failover example you owned].",
      "how do you prevent split-brain": "Quorum-based writes, fencing/STONITH for the old leader, and never letting a minority partition accept writes.",
    },
  },
  {
    id: "ts-capacity-patching",
    title: "Capacity & Patching Across a Mixed Fleet (No Downtime)",
    domains: ["tech-screen"],
    questionTypes: ["ts-capacity-patching"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "Patching a large Linux + Windows + VMware fleet without downtime is a rolling-drain problem plus a capacity-headroom problem. Both must be automated and observable, or it becomes pure toil and risk.",
      a: [
        "Always keep N+1 (or N+2) headroom so you can drain a host/node and let the cluster absorb its load — capacity planning and patching are the same problem.",
        "Rolling, automated waves: drain (vMotion / cordon+drain), patch, validate health, re-add, then next wave. Never the whole fleet at once.",
        "Risk controls: maintenance windows tied to error budget, automated rollback/snapshot before patch, canary the patch on a small cohort first.",
        "Lifecycle as a program, not events: track firmware/OS/hypervisor versions as fleet inventory; retire aging hardware proactively; measure patch latency (how long a critical CVE takes to reach 100%).",
        "Treat it as toil to be engineered away: at Citi I drove toil down 25% by automating exactly this class of repetitive, risky operational work.",
      ],
      r: "Patching becomes a routine, low-drama, measurable pipeline — security SLAs met without surprise outages.",
      l: "Capacity headroom is what buys you the ability to operate safely; without it, every patch is a gamble.",
    },
    probes: {
      "how do you handle a zero-day CVE": "Break-glass accelerated wave with tighter monitoring; the normal pipeline already exists, you just compress the cadence and raise scrutiny.",
      "Windows vs Linux differences": "Windows leans on reboot/patch-Tuesday cadence and WSUS/SCCM-style tooling; Linux on live-patching/config mgmt. Same drain-validate-readd shape, different tooling. [VERIFY your hands-on depth here before claiming].",
    },
  },
  {
    id: "ts-platform-observability",
    title: "Observability for the Platform Layer (not just apps)",
    domains: ["tech-screen"],
    questionTypes: ["ts-platform-observability"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "I built the app/service observability platform at Citi (OpenTelemetry, Prometheus, Grafana). The platform layer needs the same rigor pushed down a level — hypervisor, storage IO, network fabric — because app symptoms are often platform causes.",
      a: [
        "Instrument the layer beneath the app: host/hypervisor metrics, datastore latency & queue depth, NIC/fabric errors, noisy-neighbor signals — not just CPU/mem.",
        "Correlate up the stack: when app latency spikes, can you immediately see if it's a storage-latency or host-contention root cause? That correlation is what cuts MTTR.",
        "Three pillars at the platform layer: metrics (Prometheus), logs (centralized), traces where they reach into infra calls; tie all to SLOs.",
        "Alert on symptoms + leading indicators: datastore latency creeping, capacity headroom shrinking, failure-domain imbalance — catch it before it pages.",
        "At Citi the AIOps engine ingested 100k+ ServiceNow incident & change records/month for predictive analysis and hotspot detection — same idea applies to platform telemetry to find chronic weak hosts.",
      ],
      r: "Faster RCA because the platform isn't a black box under the app; chronic platform issues surface as trends, not 3am pages.",
      l: "You can't run reliable platforms you can't see — observability has to reach below the abstraction the app teams care about.",
    },
    probes: {
      "what's your stack": "OpenTelemetry for instrumentation, Prometheus for metrics, Grafana for viz/alerting, centralized logging, ServiceNow for ITSM. For platform layer I'd extend the same pipeline to hypervisor/storage exporters.",
      "biggest observability gap you fixed": "[INSERT real example — e.g. correlating an alert storm down to one root cause, or killing a class of false pages].",
    },
  },
  {
    id: "ts-cloud-vs-onprem",
    title: "Cloud vs On-Prem / Hybrid — When You Can't Auto-Scale Out",
    domains: ["tech-screen"],
    questionTypes: ["ts-cloud-vs-onprem"],
    signals: ["domain-expertise", "leadership-influence"],
    card: {
      c: "In cloud, elasticity papers over a lot — you scale out of trouble. On-prem/hybrid (Mastercard's reality), capacity is finite and lead-times are weeks, so the discipline shifts to headroom, forecasting, and efficiency.",
      a: [
        "Capacity is a planning discipline, not a slider: forecast demand, hold deliberate headroom, manage procurement lead-time — you can't conjure a host at 2am.",
        "Efficiency matters more: noisy-neighbor isolation, right-sizing, reclaiming stranded capacity — wasted capacity on-prem is real money and real risk.",
        "Failure handling leans on N+1 design and graceful degradation (load shedding, prioritizing payment-critical traffic) rather than spin-up-more.",
        "Hybrid is the pragmatic answer: keep latency-/compliance-sensitive payment workloads on owned infra, burst/elastic and analytics to cloud — I've run AWS+GCP at Citi alongside on-prem-style constraints.",
        "Same SRE primitives (SLOs, error budgets, automation, observability) — the levers you pull under pressure differ.",
      ],
      r: "Reliability without elasticity comes from foresight (capacity model) and graceful degradation, not reactive scaling.",
      l: "Cloud teaches you to scale out of problems; on-prem teaches you to design them out — payments needs the latter discipline.",
    },
    probes: {
      "how do you decide what goes where": "Latency, data residency/compliance, cost-at-steady-state, and failure isolation. Payment-critical + regulated → owned infra; elastic/bursty/analytics → cloud.",
      "graceful degradation example": "Load-shed non-critical traffic, serve degraded-but-correct, protect the payment path. [INSERT real example if you have one].",
    },
  },

  // ===================== 2. RELIABILITY FUNDAMENTALS =====================
  {
    id: "ts-slo-error-budget",
    title: "SLOs & Error Budgets for a Payments System",
    domains: ["tech-screen"],
    questionTypes: ["ts-slo-error-budget"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "SLOs start from the user journey, not the server. For payments the SLI is usually successful transaction processing within a latency bound — and the error budget has to reflect that downtime literally equals money and trust.",
      a: [
        "Define SLIs from the customer's success: % of transactions authorized correctly within X ms, measured at the right boundary.",
        "Set SLO targets per criticality tier — the auth path might be 99.99%+, a reporting dashboard far lower. Don't gold-plate everything to the same number.",
        "Error budget = 1 − SLO; it's the shared currency between reliability and feature velocity (burn it slow = ship faster; burn it fast = freeze and stabilize).",
        "Payments nuance: some failures aren't fungible — a correctness/settlement error is categorically worse than a brief latency blip; weight the budget accordingly.",
        "Operationalize: SLO-based alerting (burn-rate alerts), exec-visible dashboards, and budget policy agreed with product up front.",
      ],
      r: "Reliability becomes an explicit, negotiated target instead of an argument — and on-call pages on budget burn, not noise.",
      l: "An SLO without an agreed error-budget policy is just a number; the policy is what changes behavior.",
    },
    probes: {
      "100% uptime?": "Never the goal — 100% is the wrong target (infinitely expensive, and you can't ship). The right target is what the business needs, with budget for everything else.",
      "how do you pick the number": "Start from current performance + customer expectation + cost of the next nine; iterate. Don't set a target you can't measure or won't enforce.",
    },
  },
  {
    id: "ts-incident-command",
    title: "Incident Command — Sev1 from Page to Postmortem",
    domains: ["tech-screen"],
    questionTypes: ["ts-incident-command"],
    signals: ["ownership", "leadership-influence"],
    card: {
      c: "A Sev1 is a coordination problem as much as a technical one. The model I run separates roles so the smartest engineer can debug while someone else runs the incident — I established this discipline at Citi.",
      a: [
        "Clear roles: Incident Commander (coordinates, decides), Comms lead (stakeholders/status), Ops/SMEs (hands on keyboard). IC is not the best debugger — IC keeps order.",
        "Stabilize before diagnose: mitigate customer impact first (rollback, failover, shed load), find root cause second.",
        "Single source of truth: one bridge/channel, timestamped timeline, regular status cadence so leadership isn't pulling responders off the problem.",
        "Severity drives response: Sev1 = all-hands + exec comms + customer impact; lower sevs = lighter process. Defined entry/exit criteria.",
        "Blameless postmortem within days: timeline, contributing factors (plural, systemic), and action items with owners — tracked to closure, not filed and forgotten.",
      ],
      r: "At Citi this drove repeat incidents down 35% — because postmortems produced real systemic fixes, not blame.",
      l: "Blameless is a performance choice, not a kindness: people surface the truth fast only when it's safe to.",
    },
    probes: {
      "what makes a good IC": "Calm, decisive, communicates, and resists the urge to dive into the keyboard — their job is tempo and decisions.",
      "an incident you commanded": "[INSERT real Sev1 — your role, the mitigate-first call you made, the systemic fix that came out].",
    },
  },
  {
    id: "ts-mttr-toil",
    title: "MTTR Plateau & Systematic Toil Reduction",
    domains: ["tech-screen"],
    questionTypes: ["ts-mttr-toil"],
    signals: ["driving-results", "ownership"],
    card: {
      c: "When MTTR plateaus I decompose it — detect, diagnose, mitigate, resolve — and attack the dominant segment with data. Most plateaus live in detect (alert quality) or diagnose (observability gaps).",
      a: [
        "Break MTTR into stages and measure each: time-to-detect, time-to-engage, time-to-diagnose, time-to-mitigate. Optimize the biggest bar, not the loudest complaint.",
        "Detect plateau → better SLO-based alerting and correlation (cut noise so the real page is fast and trusted).",
        "Diagnose plateau → observability + runbooks + known-error DB; AIOps to point at probable cause (Citi: 100k+ ServiceNow incident & change records/mo mined for hotspots).",
        "Mitigate plateau → pre-built safe actions: one-click rollback, automated failover, load-shed switches.",
        "Toil: measure it (% of time on repetitive manual ops), set a budget, and automate the top items — drove toil down 25% at Citi and fed those hours back into engineering.",
      ],
      r: "Quantified, repeatable improvement instead of heroics — and on-call load that trends down, not up.",
      l: "You improve what you decompose and measure; 'MTTR is too high' is not actionable until you know which stage owns it.",
    },
    probes: {
      "how do you measure toil": "Track operational hours per engineer on repetitive, automatable, no-enduring-value work; if it's growing with scale, that's the alarm.",
      "automation that backfired": "[INSERT example — automation that hid a problem or caused one, and the guardrail you added].",
    },
  },

  // ===================== 3. LIVE FAILURE SCENARIOS =====================
  {
    id: "ts-live-degradation",
    title: "Live Scenario — Service Degrading, First 15 Minutes",
    domains: ["tech-screen"],
    questionTypes: ["ts-live-degradation"],
    signals: ["ownership", "communicating-effectively"],
    card: {
      c: "Scenario: latency up, error rate climbing, no recent deploy. My first move is to assess impact and stabilize — not to chase root cause while customers bleed.",
      a: [
        "Minute 0–2: declare an incident, assign IC, open the bridge. Quantify blast radius — what % of traffic, which customers, is the payment path affected?",
        "Minute 2–5: check the obvious change vectors even with 'no deploy' — config/flag changes, dependency health, traffic spike, certificate/credential expiry, capacity/saturation.",
        "Minute 5–10: mitigate first. If a dependency is the cause → fail over / circuit-break / shed load. If saturation → add capacity or shed. Buy stability before deep RCA.",
        "Throughout: comms cadence to stakeholders so leadership stays out of the responders' way.",
        "Only once stable: structured RCA, then blameless postmortem.",
      ],
      r: "Customer impact contained quickly; root cause done calmly afterward instead of under fire.",
      l: "Stabilize first, diagnose second — the patient before the puzzle.",
    },
    probes: {
      "'no deploy' — where do you look": "Config/feature flags, dependency degradation, traffic/seasonality, expiring certs/secrets, slow resource exhaustion (memory/disk/connections). 'Nothing changed' is rarely true.",
      "when do you roll back vs investigate": "If a recent change correlates, roll back immediately — rolling back a wrong suspect is cheap; debugging in prod under load is expensive.",
    },
  },
  {
    id: "ts-cascading-failure",
    title: "Live Scenario — Cascading Failure, Stop the Bleed vs Root Cause",
    domains: ["tech-screen"],
    questionTypes: ["ts-cascading-failure"],
    signals: ["ownership", "domain-expertise"],
    card: {
      c: "Cascading failure means the failure is propagating faster than you can diagnose it — so containment beats curiosity. Stop the spread, then find patient zero.",
      a: [
        "Contain the blast radius first: shed load, enable circuit breakers, fail open/closed deliberately, isolate the failing component so it stops dragging healthy ones down.",
        "Common cause: retry storms and thundering herds amplifying a small fault — kill the amplification (backpressure, rate limits, jittered backoff) before chasing origin.",
        "Protect the critical path: prioritize payment-authorization traffic; degrade or drop non-critical work to preserve the core.",
        "Then find patient zero: work backward through dependency/latency graphs to the originating component.",
        "Design fixes for recurrence: bulkheads, timeouts/backpressure everywhere, load shedding by priority, and capacity headroom so one failure doesn't tip the system.",
      ],
      r: "The cascade is halted by isolation, the core stays up via prioritization, and the systemic fix prevents the next one.",
      l: "In a cascade, isolation buys time and time buys diagnosis — containment is the first act, not the last.",
    },
    probes: {
      "circuit breaker vs rate limit": "Breaker stops calling a failing dependency (protect yourself); rate limit caps what you accept (protect the dependency/yourself from overload). Often both.",
      "retry storm fix": "Bounded retries with jittered exponential backoff + budget; idempotency so retries are safe; backpressure so callers slow down.",
    },
  },

  // ===================== 4. ARCHITECTURE / SCALE (Seán's lens) =====================
  {
    id: "ts-alerting-design",
    title: "Alerting for Hundreds of Services Without Drowning On-Call",
    domains: ["tech-screen"],
    questionTypes: ["ts-alerting-design"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "The failure mode at scale is alert fatigue — pages that don't need a human destroy trust and burn people out. I built correlated, SLO-based alerting at Citi specifically to fight this.",
      a: [
        "Alert on symptoms, not causes: page on SLO/burn-rate (users are hurting), not on every CPU spike. One user-facing symptom > fifty cause-metrics.",
        "Every page must be actionable, urgent, and human-needed — if it's none of those, it's a dashboard or a ticket, not a page.",
        "Correlate and deduplicate: group related alerts into one incident so a 200-service brownout pages once, not 200 times (this is core to what I built).",
        "Tiered routing: page for SLO-threatening; ticket/Slack for degraded-but-in-budget; auto-remediate the known-and-safe.",
        "Close the loop: review noisy/false pages regularly and delete or fix them — alert hygiene is an ongoing SRE practice, with on-call load as the KPI.",
      ],
      r: "On-call gets fewer, higher-signal pages; trust in alerting goes up; MTTR down because the page that fires actually matters.",
      l: "Good alerting is mostly about what you DON'T page on — every non-actionable page is a tax on the next real one.",
    },
    probes: {
      "symptom vs cause example": "Page on 'auth success rate < SLO' (symptom). Don't page on 'host X CPU 90%' (cause) unless it breaches a symptom — let it be a dashboard signal.",
      "how do you measure alert quality": "Pages per on-call shift, % actionable, % auto-resolved, alert-to-incident ratio. Drive non-actionable toward zero.",
    },
  },
  {
    id: "ts-cross-region",
    title: "Cross-Region Resilience — Active/Active vs Active/Passive (Payments)",
    domains: ["tech-screen"],
    questionTypes: ["ts-cross-region"],
    signals: ["domain-expertise", "leadership-influence"],
    card: {
      c: "The active/active vs active/passive call is really a data-consistency-vs-availability trade-off. For payments, correctness usually wins, which constrains how active/active you can really be.",
      a: [
        "Active/passive: simpler, clean consistency, but you pay RTO on failover and the standby is idle cost — and untested failover is a myth, so you must drill it.",
        "Active/active: better availability and no idle capacity, but you must solve cross-region data consistency — latency-bound synchronous replication or conflict resolution.",
        "Payments reality: financial correctness is non-negotiable, so fully active/active writes on shared balances is hard — often active/active at the edge/read layer, with care (sharding by region, single-writer per key) for the consistency-critical core.",
        "Define RTO/RPO per data class and design to those; don't apply one answer to the whole system.",
        "Whatever you choose: regular, automated failover testing (game days) — capacity reserved in the surviving region, and DNS/traffic steering rehearsed.",
      ],
      r: "A deliberate, tested posture matched to each data class — not a slide that says 'multi-region' but has never failed over.",
      l: "Multi-region you haven't failed over to is decoration; the design choice is meaningless without the drill.",
    },
    probes: {
      "CAP in one line": "Under partition you choose consistency or availability; payments balances pick consistency, so design the topology around that.",
      "how do you test it": "Scheduled regional failover game days, with success criteria (RTO/RPO met, no data loss) and findings fed back like any incident.",
    },
  },
  {
    id: "ts-safe-deploys",
    title: "Safe Deploys at Scale",
    domains: ["tech-screen"],
    questionTypes: ["ts-safe-deploys"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "Most incidents trace to a change, so deploy safety is one of the highest-leverage reliability investments. The goal: make the blast radius of any one deploy small and the rollback fast.",
      a: [
        "Progressive rollout: canary → small % → region → fleet, with automated health gates between stages (SLO/error-rate checks, not human eyeballing).",
        "Automated rollback on regression: if canary breaches thresholds, roll back without waiting for a human — fast, boring, expected.",
        "Decouple deploy from release: feature flags so you ship code dark and turn behavior on gradually/reversibly.",
        "Make rollback always possible: backward-compatible schema changes, expand/contract migrations, no destructive irreversible steps in a single deploy.",
        "Tie it to error budget: budget healthy → deploy freely; budget burning → slow down or freeze. DORA metrics (change-fail rate, lead time) to track health.",
      ],
      r: "High deploy velocity AND low change-failure rate — the two stop being in tension when rollout is progressive and reversible.",
      l: "Speed and safety aren't opposites; small, reversible, gated changes give you both.",
    },
    probes: {
      "schema migration safely": "Expand/contract: add new (backward-compatible), migrate, switch reads, then remove old — never a destructive change coupled to a deploy.",
      "canary metrics": "Compare canary vs baseline on error rate, latency, and key business signal (auth success); auto-abort on divergence.",
    },
  },

  // ===================== 5. LEADERSHIP-TECHNICAL (Director) =====================
  {
    id: "ts-raise-bar",
    title: "Raising the Reliability Bar Without Direct Authority",
    domains: ["tech-screen"],
    questionTypes: ["ts-raise-bar"],
    signals: ["leadership-influence", "communicating-effectively"],
    card: {
      c: "At Director level, most reliability work happens in teams that don't report to me — so influence, shared metrics, and making the right thing the easy thing matter more than mandates.",
      a: [
        "Shared language of SLOs/error budgets: make reliability an objective, visible number owned jointly with product, not an SRE opinion.",
        "Make the paved road the easy road: golden paths, templates, self-service tooling, production-readiness reviews — adoption by ergonomics, not edict.",
        "Lead with data and outcomes: show incident trends, toil, DORA; let evidence drive the conversation (I ran on say/do ratio and DORA at Citi).",
        "Embed and partner: SREs working alongside dev teams, blameless postmortems that build trust, wins shared not blame assigned.",
        "Escalate via incentives, not authority: align leadership on reliability as a goal so it's funded and prioritized org-wide.",
      ],
      r: "Reliability becomes everyone's metric — at Citi I drove a tech-lead operating model that scaled good practice without adding management layers; it was adopted by two other orgs.",
      l: "Authority makes people comply; influence and good tooling make them want to — only the second one scales.",
    },
    probes: {
      "a team that resisted": "[INSERT real example — how you turned a skeptical team using data/a shared win rather than mandate].",
      "mandate vs influence": "Mandate for non-negotiables (security, payment-correctness gates); influence + paved road for everything else.",
    },
  },
  {
    id: "ts-feature-vs-reliability",
    title: "Features vs Reliability — Resolving It With Error Budgets",
    domains: ["tech-screen"],
    questionTypes: ["ts-feature-vs-reliability"],
    signals: ["leadership-influence", "ownership"],
    card: {
      c: "I don't resolve feature-vs-reliability by arguing — I resolve it with an agreed error-budget policy, so the data makes the call instead of the loudest voice.",
      a: [
        "Error budget as the contract: budget healthy → ship features fast, reliability isn't blocking. Budget burning → reliability work takes priority by prior agreement.",
        "Agree the policy up front with product/leadership, when it's calm — not mid-incident when it's emotional.",
        "Reframe reliability as a feature: it protects revenue and trust; in payments an outage is a product failure, so it's not 'reliability vs product', it's product quality.",
        "Make trade-offs explicit and visible: dashboards both sides trust, so the conversation is about a shared number.",
        "Invest to dissolve the tension: automation, safe deploys, and paved roads let teams ship fast AND reliably — the best answer is making it not a zero-sum choice.",
      ],
      r: "Decisions get made on data with product as a partner, not in a tug-of-war — and trust survives the next incident.",
      l: "The error budget turns a political fight into an agreed rule; set the rule before you need it.",
    },
    probes: {
      "product overrules you": "Agree the budget policy with their leadership in advance so it's a shared commitment, not my veto; if budget's blown, the freeze is the policy, not my opinion.",
      "real trade-off you made": "At Citi I balanced reliability investment against roadmap pressure using DORA + budget data. [INSERT the specific call].",
    },
  },
  {
    id: "ts-sre-culture",
    title: "Building SRE Culture vs Just an SRE Team",
    domains: ["tech-screen"],
    questionTypes: ["ts-sre-culture"],
    signals: ["leadership-influence", "mentorship"],
    card: {
      c: "My core SRE thesis: reliability is everyone's responsibility, not a team name. A team that 'owns reliability' lets everyone else off the hook — culture is when dev teams own their production outcomes.",
      a: [
        "Shared ownership: dev teams own their SLOs and are in the on-call/postmortem loop — SRE provides the platform, practices, and expertise, not a catch-all pager.",
        "Blameless culture as the foundation: psychological safety is what makes people surface problems early; I built deep empathy for on-call and prioritize it.",
        "Enable, don't gatekeep: self-service tooling, golden paths, production-readiness reviews so teams can do the right thing themselves.",
        "Make reliability visible and valued: celebrate prevented incidents and toil reduction, not just firefighting heroics — reward the boring success.",
        "Grow the discipline: I built SRE ground-up at Citi (20-person global org) and a tech-lead operating model that spread practice across teams; culture scales through people, not headcount.",
      ],
      r: "Reliability outcomes that don't depend on one heroic team — repeat incidents down 35%, toil down 25%, and practices other orgs adopted.",
      l: "If reliability lives only in the SRE team, it doesn't scale; the win is when every team treats production as their own.",
    },
    probes: {
      "SRE vs DevOps": "DevOps is the culture (dev+ops shared ownership); SRE is a concrete implementation with SLOs, error budgets, and toil budgets. Complementary, not competing.",
      "you vs heroics culture": "[INSERT example — shifting a team from 3am-hero rewards to prevention/automation rewards].",
    },
  },

  // ============== CLOUD-NATIVE <-> PLATFORM BRIDGE CARDS ==============
  // Open with the proven CV achievement, extend it to the platform substrate,
  // land on the JD pillar. Honest about where VMware/storage depth is a ramp.
  {
    id: "ts-bridge-observability",
    title: "Bridge — Observability: Cloud-Native → Platform Substrate",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-observability"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "My observability platform at Citi instrumented 100s of cloud-native services on OpenTelemetry/Prometheus/Grafana. The same discipline extends straight down to the Distributed Platforms substrate — the JD's 'advance observability and telemetry' pillar doesn't care whether the signal comes from a container or an ESXi host.",
      a: [
        "Proven: OTel/Prometheus/Grafana with custom alerting, correlating signals across 100s of cloud-native services to accelerate incident detection and resolution (this is my CV headline).",
        "Extend a layer down: same pipeline ingests hypervisor metrics, datastore latency/queue depth, SAN multipath health, NIC/fabric errors, Linux/Windows host telemetry — so platform causes surface, not just app symptoms.",
        "Cross-layer correlation: when a payment service slows, instantly see whether the root cause is storage latency or a saturated host — that correlation is what I already built, just pointed at the platform.",
        "Architecture is identical: exporters → time-series store → correlation → SLO/burn-rate alerting; I'd add vSphere/storage/node exporters, not rebuild anything.",
        "JD pillar fit: this IS 'advancing observability and telemetry capabilities across mission-critical infrastructure.'",
      ],
      r: "Faster RCA across the whole stack; the platform stops being a black box sitting under the app.",
      l: "Observability is a discipline, not a substrate — you instrument whatever sits beneath the abstraction your customers feel, pod or hypervisor.",
    },
    probes: {
      "have you instrumented VMware/storage": "Honest: my hands-on depth is cloud-native. But it's the same pattern — vSphere/node/storage exporters into the Prometheus/Grafana stack I built. I'd ramp on the specific exporters fast. [INSERT a cross-layer RCA example from your platform].",
      "what would you add first": "Datastore latency and host-saturation signals correlated to service SLOs — the highest-leverage platform-cause-to-app-symptom link.",
    },
  },
  {
    id: "ts-bridge-aiops",
    title: "Bridge — AIOps/RCA & Automated Remediation on the Platform",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-aiops"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "I built an ML text-analytics engine that ingested 100k+ ServiceNow incident & change records a month for predictive analysis — cutting repeat incidents 35%. That same engine, pointed at platform incident/change data, delivers exactly what the JD asks for: automated remediation and improved RCA.",
      a: [
        "Proven: AIOps engine on 100k+ ServiceNow incident & change records/mo → predictive analysis, hotspot identification, repeat incidents −35% (CV).",
        "Platform application: mine infra incident/change history for chronic weak hosts, firmware/patch-correlated failures, and change-induced platform outages → predictive maintenance before hardware bites.",
        "Automated remediation: pair predictions with safe auto-actions — drain a degrading host, fail over a storage path, roll back a risky platform change — which is the JD's explicit ask.",
        "Same data world: my source was ServiceNow incident & change — Mastercard's platform incidents live in the same ITSM workflows I already know.",
        "JD pillar fit: directly satisfies 'automated remediation and improved RCA.'",
      ],
      r: "Platform ops shift from reactive to predictive — fewer repeat platform incidents, RCA pointed at probable cause automatically.",
      l: "AIOps is substrate-agnostic: it learns from incident/change data whether the failing thing is a microservice or a disk array.",
    },
    probes: {
      "how would it predict hardware failure": "Correlate historical incident/change records with host/firmware/age attributes to flag the hosts statistically likely to fail next — then drain proactively.",
      "real predictive win you had": "[INSERT — e.g. a hotspot the engine surfaced that prevented a repeat incident].",
    },
  },
  {
    id: "ts-bridge-automation",
    title: "Bridge — Automation & Toil Reduction on a Mixed Fleet",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-automation"],
    signals: ["domain-expertise", "driving-results"],
    card: {
      c: "I drove SRE maturity with automation as the core pillar — high-throughput event pipelines on Kafka/Flink (2B+ events/day) and a 25% toil reduction. The platform's single biggest toil source is fleet patching and lifecycle, which is exactly the automation pillar the JD wants owned.",
      a: [
        "Proven: automation as a core pillar; built high-throughput pipelines (Kafka/Flink, 2B+ events/day); reduced toil 25% (CV).",
        "Platform's toil hotspots: rolling patching across Linux/Windows/VMware, firmware/OS lifecycle, config-drift remediation, capacity provisioning — the most repetitive, riskiest manual work in the estate.",
        "Approach: codify it (IaC + config management), automate drain→patch→validate→re-add waves with N+1 headroom, and track patch latency + toil % as KPIs — 'without taking downtime' = rolling automation + headroom.",
        "JD pillar fit: directly the 'automation' pillar; the same toil-elimination playbook I ran at Citi, retargeted at the fleet.",
      ],
      r: "Patching/lifecycle becomes a measured pipeline instead of heroics; toil trends down as the fleet grows.",
      l: "The automation pillar is about turning the platform's repetitive risk into code — I've done it for cloud ops; the targets change, the method doesn't.",
    },
    probes: {
      "what tooling for fleet automation": "Config management (Ansible-style) + IaC for provisioning, orchestrated rolling waves. I've codified cloud infra as code; same principle via vSphere/bare-metal providers. [VERIFY your hands-on depth before claiming specifics].",
      "biggest toil you killed": "[INSERT — the repetitive operation you automated at Citi that drove the 25%].",
    },
  },
  {
    id: "ts-bridge-resilience",
    title: "Bridge — Operational Resilience & Chaos on the Platform",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-resilience"],
    signals: ["ownership", "leadership-influence"],
    card: {
      c: "I established on-call, incident response, blameless postmortems, and production readiness across owned services — that IS the JD's 'operational resilience' pillar. Applied to the platform, it covers host/storage/network outages, plus the chaos engineering the JD emphasizes.",
      a: [
        "Proven: established on-call/incident response/postmortems and production readiness, reducing operational risk and eliminating repeat incidents (CV).",
        "Platform application: incident command for platform-layer outages (host failure, datastore loss, fabric partition); production-readiness reviews for platform changes; SLOs for the platform services apps depend on.",
        "Chaos engineering (JD emphasis): the natural next step on top of production-readiness + automated remediation — inject host/storage/network failures to prove HA and failover actually work.",
        "European angle: incidents don't wait for US hours — I'd stand up follow-the-sun incident command from Dublin, which I've run across a US/Europe/India org.",
        "JD pillar fit: 'operational resilience' + incident frameworks + MTTR reduction.",
      ],
      r: "Resilience becomes a built-in, drilled property of the platform — not an assumption that surfaces only during an outage.",
      l: "The incident lifecycle is identical whether the thing down is a service or a storage array — the practice transfers cleanly to the platform layer.",
    },
    probes: {
      "how would you start chaos engineering here": "Begin in non-prod with controlled host/storage failure injection against known HA assumptions, graduate to game-days in prod once readiness reviews and auto-remediation are solid.",
      "a resilience mechanism you built": "[INSERT — the incident/postmortem mechanism from the CV and a repeat incident it eliminated].",
    },
  },
  {
    id: "ts-bridge-hybrid",
    title: "Bridge — Multi-Cloud Strategist → Hybrid/On-Prem IaC",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-hybrid"],
    signals: ["domain-expertise", "leadership-influence"],
    card: {
      c: "My CV leads with multi-cloud roadmaps and infrastructure as code. Mastercard's Distributed Platforms is hybrid/on-prem-heavy — and the bridge is treating the physical/virtual estate as code and bringing cloud-grade discipline to owned infra, with honesty about where I ramp.",
      a: [
        "Proven: architected multi-cloud roadmaps, codified infrastructure as code (CV).",
        "IaC isn't cloud-only: the vSphere/bare-metal estate can be codified via Terraform providers + config management, with GitOps for platform config — the same operating model I apply to cloud.",
        "Capacity mindset shift (which I name openly): on-prem can't auto-scale, so the discipline moves to forecasting + deliberate headroom + efficiency rather than reactive scale-out — I can reason about that trade-off directly.",
        "Honest edge: my hands-on is cloud-native; VMware/storage specifics are a ramp — but the IaC, automation, and observability disciplines are precisely what the platform team needs, and that's where I'm strong.",
        "JD pillar fit: ties the 'automation' pillar to the Distributed Platforms substrate.",
      ],
      r: "Cloud-grade rigor — IaC, automation, observability, SLOs — brought to the owned estate that may not have had that operating model yet.",
      l: "The value I bring isn't VMware trivia; it's the SRE operating model the platform estate has been missing — and operating models transfer.",
    },
    probes: {
      "do you know the vSphere Terraform provider": "Honest: I've codified cloud infra heavily; I'd apply the same IaC discipline via the vSphere/bare-metal providers and config management. Approach is proven, the specific provider is a fast ramp. [VERIFY].",
      "cloud habits that DON'T transfer": "The reflex to scale out of trouble — on-prem you must design headroom in advance. Naming that shows I get the difference.",
    },
  },
  {
    id: "ts-bridge-european",
    title: "Bridge — European Operational Presence & Leadership",
    domains: ["tech-screen"],
    questionTypes: ["ts-bridge-european"],
    signals: ["leadership-influence", "domain-expertise"],
    card: {
      c: "The role centers on building the European SRE operational presence from Dublin. I've led a 20-person global org across US, Europe, and India, doubled its throughput — and I'm a boomerang who already knows Mastercard Dublin. This is the part of the role I've effectively already done.",
      a: [
        "Proven: led and scaled a 20-person global engineering org (US/Europe/India); doubled team throughput; earned company-wide leadership awards (CV).",
        "Direct map: 'owning the European operational presence' — I've run the European side of a global org and the follow-the-sun handoffs that make 24x7 reliability work.",
        "Boomerang advantage: I know Mastercard Dublin's culture, the tech hub, and the compliance/operational rigor of payments infrastructure (2019–2022).",
        "Director-level stakeholder muscle: partnered with Engineering, Product, and Security and presented roadmap/trade-offs to senior leadership (CTOEAC) — exactly the altitude this role and Seán Magee will probe.",
        "JD fit: the leadership + European-presence framing the role is built around.",
      ],
      r: "I can stand up or scale the Dublin SRE presence with organizational and domain credibility from day one.",
      l: "The European-presence ask isn't a stretch for me — it's the thing I've literally been doing at global scale.",
    },
    probes: {
      "how do you run follow-the-sun reliably": "Written-first decisions, async design/postmortem reviews, time-zone-aware on-call handoffs, and a shared incident-command model so Europe can own its hours without waiting on the US.",
      "why come back to Mastercard": "Deliberate return — bring enterprise SRE maturity I built at Citi back to a payments domain and a Dublin team I already know.",
    },
  },
];

// New detection keywords (merged into QUESTION_KEYWORDS). Keyed by question type.
const TECH_SCREEN_KEYWORDS = {
  "ts-platform-failure":      ["host failure", "host fails", "hypervisor", "esxi", "vmware", "vm restart", "ha cluster", "vsphere", "node failure", "physical server", "hardware failure", "blast radius"],
  "ts-stateful-stateless":    ["stateful", "stateless", "stateful infrastructure", "storage reliability", "database reliability", "rpo", "rto", "split brain", "quorum", "replication", "data integrity"],
  "ts-capacity-patching":     ["capacity planning", "patching", "patch management", "lifecycle management", "fleet", "without downtime", "rolling update", "drain", "maintenance window", "headroom", "upgrade fleet"],
  "ts-platform-observability":["platform observability", "observability strategy", "hypervisor metrics", "storage io", "infrastructure observability", "platform layer", "monitor infrastructure", "below the app"],
  "ts-cloud-vs-onprem":       ["cloud vs on-prem", "on-prem", "on premise", "hybrid", "bare metal", "can't auto-scale", "cant scale out", "data center", "owned infrastructure", "elasticity"],
  "ts-slo-error-budget":      ["slo", "sli", "error budget", "set slos", "reliability target", "downtime is money", "nines", "99.99", "service level objective"],
  "ts-incident-command":      ["incident command", "incident commander", "sev1", "sev 1", "page to postmortem", "incident process", "war room", "incident roles", "command model"],
  "ts-mttr-toil":             ["mttr", "mttr plateau", "time to recovery", "toil", "reduce toil", "measure toil", "operational burden", "automate toil"],
  "ts-live-degradation":      ["first 15 minutes", "service degrading", "latency up", "error rate climbing", "no recent deploy", "walk me through", "what would you do first", "degraded service"],
  "ts-cascading-failure":     ["cascading failure", "cascade", "stop the bleed", "retry storm", "thundering herd", "circuit breaker", "load shedding", "backpressure", "failure propagating"],
  "ts-alerting-design":       ["alerting", "alert fatigue", "design alerting", "on-call drowning", "noisy alerts", "alert noise", "too many pages", "page fatigue", "actionable alerts"],
  "ts-cross-region":          ["cross-region", "multi-region", "active-active", "active/active", "active-passive", "active/passive", "regional failover", "dr", "disaster recovery", "geo redundancy", "cap theorem"],
  "ts-safe-deploys":          ["safe deploy", "deploy at scale", "canary", "progressive rollout", "automated rollback", "feature flag", "blue green", "change management", "deployment strategy", "rollout"],
  "ts-raise-bar":             ["raise the bar", "without authority", "influence other teams", "teams that don't report", "cross-team reliability", "lead without authority", "drive adoption", "reliability standards"],
  "ts-feature-vs-reliability":["features vs reliability", "feature velocity", "ship features", "reliability work", "balance reliability", "product wants", "prioritize reliability", "feature pressure"],
  "ts-sre-culture":           ["sre culture", "culture vs team", "build sre culture", "reliability is everyone", "shared ownership", "sre vs devops", "blameless culture", "embed sre"],
  // Bridge cards — fire on questions probing the cloud-native/platform seam.
  "ts-bridge-observability":  ["observability for platform", "telemetry capabilities", "monitor the platform", "observability across infrastructure", "instrument the infrastructure", "advance observability", "extend observability"],
  "ts-bridge-aiops":          ["aiops on infrastructure", "automated remediation", "improve rca", "predictive maintenance", "predict hardware failure", "ml for incidents", "auto remediation", "self-healing"],
  "ts-bridge-automation":     ["automate the fleet", "automation pillar", "infrastructure automation", "reduce toil on platform", "automate patching", "fleet automation", "automate operations"],
  "ts-bridge-resilience":     ["operational resilience", "production readiness", "resilience pillar", "chaos engineering", "game day", "resilience of the platform", "platform resilience"],
  "ts-bridge-hybrid":         ["multi-cloud to on-prem", "infrastructure as code", "iac for platform", "hybrid estate", "terraform vsphere", "codify infrastructure", "gitops", "cloud experience apply"],
  "ts-bridge-european":       ["european presence", "build the team in europe", "operational presence", "follow the sun", "dublin team", "lead in europe", "global team", "scale the org"],
};

module.exports = {
  TECH_SCREEN_QUESTION_TYPES,
  TECH_SCREEN_CATEGORY,
  TECH_SCREEN_STORIES,
  TECH_SCREEN_KEYWORDS,
};
