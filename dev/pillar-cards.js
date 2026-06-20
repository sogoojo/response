// ============================================================================
// pillar-cards.js — SINGLE SOURCE for the 49 tech-screen pillar Q&As.
// ----------------------------------------------------------------------------
// Two consumers read from here:
//   1. The LIVE COPILOT — behavioral-stories.js merges PILLAR_* so the
//      classifier can match a live question and surface the right card.
//   2. The PREP PAGE — build-prep-page.js imports PILLARS for the "Yours"
//      pillar sections (lead + bullets + glossary).
// Edit the answer content ONCE here; both stay in sync. Additive & isolated —
// delete the merge block in behavioral-stories.js + this file to fully revert.
// ============================================================================

const PILLARS = [
  {
    pillar: "Pillar 1 — Core Infrastructure & Platform Engineering",
    note: "Linux · Windows · VMware · Storage. The hands-on foundation. Most likely probed by Seán; Sturrock's Nutanix/VMware background means he may go deep on virtualization and storage too.",
    items: [
      { q: "A Linux host shows very high load average but low CPU utilisation. How do you diagnose it?",
        lead: "High load + low CPU = processes blocked on I/O or uninterruptible sleep, not CPU contention.",
        bullets: [
          "Confirm the pattern: **uptime**, **vmstat 1** — watch the **b** (blocked) and **wa** (I/O wait) columns.",
          "Find culprits: **top/htop** for processes in **D state**.",
          "Check disk: **iostat -x 1** for latency & **%util**; **iotop** to attribute the I/O.",
          "Disk clean? Check network-storage stalls (**nfsiostat**, **dmesg** timeouts) and lock contention.",
          "Discipline: move symptom → subsystem methodically, and capture it so the next person doesn't re-derive it.",
        ],
        defs: {
          "Load average": "Run-queue length over 1/5/15 min — counts running AND uninterruptible (I/O-blocked) processes, which is why it spikes while CPU sits idle.",
          "D state": "Uninterruptible sleep — a process stuck waiting on I/O (disk or network storage); can't even be killed. A pile of D-state procs points at the storage path.",
          "%util (iostat)": "Percent of time the disk was busy servicing I/O; near 100% = the device is saturated.",
        } },
      { q: "How do you patch a large, mixed Linux/Windows estate without causing outages?",
        lead: "Three principles: never patch blind, never all at once, always have a rollback.",
        bullets: [
          "Accurate inventory + dependency map.",
          "Stage through dev/test/canary before production.",
          "Roll out in **waves by failure domain** — never both sides of an HA pair in one window.",
          "Tooling: Linux → config mgmt (Ansible/Satellite); Windows → WSUS/SCCM, windows tied to the change calendar.",
          "Tie to health checks + automated rollback triggers.",
          "Report **patch compliance as a KPI** — in PCI, patch latency is an audit & security exposure.",
        ],
        defs: {
          "WSUS / SCCM": "Microsoft's Windows patch-distribution tooling (Windows Server Update Services / System Center Config Manager) — how you stage and push Windows patches at fleet scale.",
          "Failure domain": "A boundary within which a single fault is contained (a host, rack, AZ, HA pair) — you patch across them, never all of one at once.",
        } },
      { q: "Describe operating VMware at scale. What failure modes do you watch for?",
        lead: "The failures that bite at scale are the contention you can't see at the VM layer.",
        bullets: [
          "CPU: **%RDY** and co-stop → noisy-neighbour CPU contention.",
          "Memory: balloon/swap counters → overcommit gone wrong.",
          "Storage: datastore latency (**GAVG/KAVG**).",
          "Cluster: HA admission-control headroom, DRS imbalance, vMotion network saturation.",
          "Discipline: capacity governance — SLOs on contention metrics, not just 'is the VM up'.",
        ],
        defs: {
          "%RDY (CPU ready)": "% of time a VM was ready to run but waiting for a physical CPU — the headline signal of CPU contention/overcommit. High %RDY = host oversubscribed.",
          "Co-stop": "Time a multi-vCPU VM stalled because not all its vCPUs could be scheduled at once — contention symptom for 'wide' VMs.",
          "Ballooning / swap": "ESXi reclaiming memory from a VM under host memory pressure (balloon driver); if it worsens it escalates to swapping = a performance cliff.",
          "GAVG": "Guest Average storage latency — the total round-trip latency the VM sees (= KAVG + DAVG). This is the number that maps to app pain.",
          "KAVG": "Kernel Average — time I/O spent queued in the ESXi kernel. High KAVG = host-side queueing problem, not the array.",
          "DAVG": "Device Average — latency at the storage device/array itself. High DAVG = the SAN/array is the bottleneck.",
          "Admission control": "vSphere HA policy reserving spare capacity so a failed host's VMs can actually restart; misconfigured = HA has nowhere to put them.",
          "DRS / vMotion": "DRS auto-balances VMs across hosts; vMotion live-migrates a running VM with no downtime. DRS imbalance = load not spreading; saturated vMotion net = slow migrations/maintenance.",
        } },
      { q: "How do you troubleshoot a storage performance problem — latency, IOPS, throughput?",
        lead: "First separate the three — latency, IOPS, throughput have different causes.",
        bullets: [
          "Latency: trace the stack app → OS queue depth → HBA/fabric → array; is it **KAVG** (kernel/queue) vs **DAVG** (device)?",
          "IOPS ceiling: spindle/SSD or controller limit, or queue-depth misconfig.",
          "Throughput ceiling: fabric/link saturation.",
          "Silent killers: failing disk degrading a RAID group, noisy neighbour on shared backend, unbounded snapshot chain.",
          "Goal: attribute latency to a layer before touching anything.",
        ],
        defs: {
          "KAVG vs DAVG": "KAVG = latency queued in the host/kernel (queueing problem); DAVG = latency at the array (device problem). Splitting them tells you where to look.",
          "HBA": "Host Bus Adapter — the card linking a server to the storage fabric (SAN); a bottleneck/failure point between host and array.",
          "Queue depth": "How many outstanding I/Os a device/path accepts at once; too low = artificial latency, too high = you overwhelm the array.",
          "RAID group": "A set of disks grouped for redundancy/performance; one failing disk can degrade the whole group's performance.",
        } },
      { q: "How do you run a team that has to be competent across both Windows and Linux?",
        lead: "Avoid two siloed sub-teams throwing incidents over the wall.",
        bullets: [
          "Shared on-call competence on the common concepts: capacity, patching, monitoring, incident response.",
          "Named deep specialists per platform for the genuinely OS-specific work.",
          "Build breadth: cross-training, runbooks with no tribal knowledge, pairing during incidents.",
          "Director job: map team skills to the estate's actual risk — if 70% of the critical path is Linux, on-call reflects that.",
        ] },
      { q: "A VMware host fails hard. Walk me through what happens — and what you'd have engineered so it's a non-event.",
        lead: "With HA configured right, VMs restart on surviving hosts automatically — IF admission control reserved capacity (the bit people get wrong).",
        bullets: [
          "Engineer the non-event before failure: **N+1/N+2 headroom**.",
          "**Anti-affinity** so HA pairs / clustered nodes never share a host.",
          "Truly critical services survive node loss at the **app layer**, not just infra.",
          "Post-failure: automated detection, a clean signal (not 200 alerts), a runbook.",
          "Then a blameless review: why wasn't it already a non-event?",
        ],
        defs: {
          "Anti-affinity rule": "A placement rule forcing specified VMs onto different hosts, so one host failure can't take out both halves of an HA pair / clustered app.",
          "N+1 / N+2": "Enough spare capacity that the cluster survives 1 (or 2) host failures with the survivors absorbing the load.",
          "vSphere HA": "High Availability — automatically restarts a failed host's VMs on surviving hosts; only works if admission control reserved the capacity.",
        } },
      { q: "How do you approach capacity and resource contention in a virtualised environment?",
        lead: "Capacity is a forecasting problem, not a reactive one.",
        bullets: [
          "Track per-cluster trends: CPU ready, memory, storage growth, IOPS.",
          "Forecast against the business growth curve — payments peaks like **Black Friday**.",
          "Thresholds trigger procurement before contention shows up in latency SLOs.",
          "Treat contention as an SLI: CPU ready time & storage latency are **leading indicators** — alert on them.",
        ] },
    ],
  },
  {
    pillar: "Pillar 2 — Container & Orchestration Platforms",
    note: "Kubernetes · Pivotal Cloud Foundry. Treated as its own competency in the JD. Expect \"have you actually run this in prod\" depth.",
    items: [
      { q: "Compare Kubernetes and Cloud Foundry — when would you choose each?",
        lead: "CF = opinionated PaaS (velocity, less flexibility); K8s = flexible orchestrator (power, more surface to own).",
        bullets: [
          "CF: **cf push**, platform handles routing/scaling/build — great for twelve-factor apps.",
          "K8s: fine control, operators, specialised workloads — but hands you a lot of rope.",
          "Enterprise reality: both coexist — PCF/Tanzu for the stable internal-app fleet, K8s where teams need control.",
          "Choose by the team's **operational maturity**.",
        ] },
      { q: "How do you operate a production Kubernetes cluster reliably? What actually breaks?",
        lead: "Plan for the things that actually break.",
        bullets: [
          "**etcd health** — back up & monitor; lose quorum, lose the cluster.",
          "Resource exhaustion → cascading pod evictions.",
          "**CoreDNS** — surprisingly common outage source at scale.",
          "Certificate expiry; bad rollouts.",
          "Controls: etcd/control-plane as first-class SLIs, requests/limits + quotas, **PodDisruptionBudgets**, rehearsed upgrades.",
          "Mindset: the cluster is cattle too — don't pet-nurse nodes.",
        ],
        defs: {
          "etcd": "Kubernetes' distributed key-value store holding ALL cluster state; quorum-based — lose quorum and the cluster's brain is gone. Back it up.",
          "Quorum": "The majority of nodes a consensus system needs to agree; below it, it stops accepting writes to protect consistency.",
          "CoreDNS": "The cluster's internal DNS; if it degrades, service-to-service name resolution fails cluster-wide — a classic silent outage.",
          "PodDisruptionBudget (PDB)": "A rule capping how many pods of a service can be voluntarily taken down at once, so a drain can't push you below a safe minimum.",
        } },
      { q: "How do you handle stateful workloads on Kubernetes?",
        lead: "Carefully, and only when the benefit is real.",
        bullets: [
          "StatefulSets + robust **CSI** storage for stable identity & persistent volumes; anti-affinity so replicas don't co-locate.",
          "Critical DBs: often more conservative — dedicated infra or managed services, not 'everything on K8s' dogma.",
          "Payments: **data durability beats architectural purity**.",
          "Ask: recovery story? failover behaviour? tested under load?",
        ],
        defs: {
          "StatefulSet": "A K8s workload type giving pods stable identities + persistent storage — for stateful apps (vs Deployments for stateless).",
          "CSI": "Container Storage Interface — the standard plugin layer connecting K8s to real storage backends for persistent volumes.",
        } },
      { q: "How do you do zero-downtime cluster upgrades?",
        lead: "Control plane first, then nodes via rolling drain.",
        bullets: [
          "Per node: cordon → drain (respect **PDBs**) → upgrade → uncordon → verify → next.",
          "Prereqs: PDBs so draining can't drop below minimum; accurate readiness/liveness probes; apps tolerate rescheduling.",
          "Rehearse in non-prod, do it in waves, tested rollback.",
          "Validate **API deprecations** first — the silent breakage between minor versions.",
        ],
        defs: {
          "Cordon / drain": "Cordon marks a node unschedulable; drain evicts its pods (respecting PDBs) so you can safely upgrade/patch it.",
          "Readiness / liveness probes": "Health checks K8s uses — readiness gates traffic until a pod is ready; liveness restarts a hung pod. Inaccurate ones break safe rollouts.",
          "API deprecation": "An API version removed in a newer K8s release; manifests using it silently break on upgrade unless migrated first.",
        } },
      { q: "How do you handle resource limits, requests, and noisy neighbours?",
        lead: "Requests & limits stop one workload starving others.",
        bullets: [
          "Enforce via admission controls / quotas — nothing deploys without them.",
          "Set from **real observed usage**, not guesses; use QoS classes (guaranteed for critical).",
          "Namespace quotas stop one team eating the cluster.",
          "Monitor **throttling & OOMKills** as signals the limits are wrong; feed back.",
          "Unbounded workloads = #1 cause of self-inflicted cluster incidents.",
        ],
        defs: {
          "Requests vs limits": "Request = guaranteed reserved resource (used for scheduling); limit = hard cap. Gap between them is where contention/overcommit lives.",
          "QoS class": "K8s priority tier (Guaranteed / Burstable / BestEffort) derived from requests vs limits; decides what gets evicted first under pressure.",
          "OOMKill": "Kernel killing a container that exceeded its memory limit (Out Of Memory) — a signal the limit is wrong or there's a leak.",
        } },
      { q: "How do you secure a container platform in a PCI environment?",
        lead: "Defence in depth — and segmentation is doing real compliance work, not theatre.",
        bullets: [
          "Image provenance: signed, scanned in CI, trusted registries only.",
          "Least privilege: no privileged containers, drop capabilities, non-root, read-only root FS.",
          "**Network policies** to isolate the cardholder-data environment.",
          "Secrets done properly (Vault/sealed-secrets — never in env vars/images); tight RBAC.",
          "Runtime detection + audit trail. PCI DSS cares about segmentation & change control.",
        ] },
      { q: "How would you migrate a legacy VM-based workload onto containers?",
        lead: "Don't lift-and-shift blindly — migrate for operational benefit, not its own sake.",
        bullets: [
          "Assess fit: stateless twelve-factor apps = good; chatty stateful monoliths often aren't.",
          "**Strangler-fig** incrementally: containerise, run in parallel, shift traffic gradually behind an LB.",
          "Validate against SLOs at each step; keep rollback available.",
          "Be explicit on the goal (density, velocity, resilience) — and kill a migration that isn't earning it.",
        ] },
    ],
  },
  {
    pillar: "Pillar 3 — Automation & Toil Reduction",
    note: "One of the three SRE-maturity pillars Mastercard explicitly names. Strong chance you're asked to \"own\" one of these — have a point of view.",
    items: [
      { q: "How do you define and measure toil?",
        lead: "Toil = manual, repetitive, automatable work that scales linearly and has no enduring value.",
        bullets: [
          "Measure: team tracks operational time as toil-vs-project (even rough self-reporting reveals the pattern).",
          "Manage a **toil ceiling** (~50%, the Google SRE budget).",
          "Rising toil = leading indicator of burnout + an under-engineered service.",
        ] },
      { q: "Tell me about the most impactful automation you've driven.",
        lead: "(Use a real story — structure it like this.)",
        bullets: [
          "Problem: a recurring manual process [cert rotation / failover drills / onboarding] costing ~[X hrs/week] + [Y] human-error incidents.",
          "Action: scoped it, built the automation, rolled out with safeguards + a dry-run mode.",
          "Result: [hours reclaimed], [incidents eliminated], team redirected to [higher-value work].",
          "Director landing: I changed **where the team spent its time** and made it measurable.",
        ] },
      { q: "How do you prioritise what to automate?",
        lead: "Frequency × time-cost × error-risk.",
        bullets: [
          "First: high-frequency, error-prone, critical-path tasks — buys hours and reliability.",
          "Avoid automating rare one-offs (build cost > saving).",
          "Don't automate a broken process — you just make the mess faster; simplify/eliminate first.",
        ] },
      { q: "How do you build a culture of automation in an ops team?",
        lead: "Make it visible and rewarded.",
        bullets: [
          "Track toil openly; give engineers protected time for automation.",
          "Celebrate **toil eliminated** as much as incidents resolved.",
          "Make 'we automated this away' a normal postmortem outcome.",
          "Shift from valuing heroics → valuing the person who made the 3am fix unnecessary.",
        ] },
      { q: "Where do you draw the line — what shouldn't be automated?",
        lead: "Anything where the blast radius of the automation failing exceeds the toil it saves — until you trust it.",
        bullets: [
          "Gate irreversible/high-stakes actions (mass deletes, prod failovers) behind human approval first; earn trust incrementally.",
          "Judgement under ambiguity isn't toil — it's engineering.",
          "Avoid runaway automation that confidently does the wrong thing at scale.",
        ] },
      { q: "How do you handle automation that itself fails or runs away?",
        lead: "Automation is software — give it the same reliability engineering.",
        bullets: [
          "Guardrails: dry-run/plan modes, rate limits, circuit breakers on destructive actions.",
          "Observability + alerting when it behaves unexpectedly; a clear owner.",
          "A **kill switch**.",
          "Treat a bad automation run as an incident with a postmortem.",
        ] },
      { q: "What's your approach to Infrastructure as Code?",
        lead: "Everything reproducible and version-controlled.",
        bullets: [
          "Terraform for provisioning, config mgmt (Ansible) for state — all in Git, peer-reviewed, pipelined.",
          "Wins: **auditability** (huge for PCI), repeatability, DR (rebuild from code).",
          "Discipline: no out-of-band changes (config drift); proper state management.",
          "Sells to risk-averse stakeholders: change becomes faster and safer at once.",
        ] },
    ],
  },
  {
    pillar: "Pillar 4 — Observability & Monitoring",
    note: "Second named SRE pillar. The JD's wider org references Splunk and Dynatrace — worth name-checking real tools you know.",
    items: [
      { q: "What's the difference between monitoring and observability, and why does it matter operationally?",
        lead: "Monitoring answers known questions; observability lets you ask new ones after the fact.",
        bullets: [
          "Monitoring: are the things I predicted might break, broken?",
          "Observability: debug failures you didn't anticipate — rich, high-cardinality metrics/logs/traces.",
          "Why it matters: your worst incidents are the unforeseen ones; threshold dashboards won't help there.",
          "Need to slice by customer, region, version, endpoint on the fly.",
        ] },
      { q: "What do you instrument first on a new service?",
        lead: "The four golden signals: latency, traffic, errors, saturation.",
        bullets: [
          "Most diagnostic value per unit of effort; map directly to user-facing health.",
          "Add the business signal — for payments: **transaction success rate + auth latency**.",
          "That's the number you want on the wall during an incident.",
        ],
        defs: {
          "Golden signals": "Latency, traffic, errors, saturation — Google SRE's four highest-value signals; cover these before anything fancier.",
          "Saturation": "How 'full' the most constrained resource is (CPU, memory, IO, connections) — the leading indicator of imminent trouble.",
        } },
      { q: "How do you reduce alert fatigue?",
        lead: "Alert on symptoms, not causes — and only on what's urgent AND actionable.",
        bullets: [
          "Every alert needs human action — else it's a dashboard, not an alert.",
          "Audit existing alerts ruthlessly; kill noisy non-actionable ones.",
          "Move to **SLO/error-budget-based** alerting, not every transient blip.",
          "Track **alert-to-incident ratio** as a health metric.",
        ] },
      { q: "How do you design dashboards that are actually useful during an incident?",
        lead: "Top-down: 'is it broken and where' in one view; drill down below.",
        bullets: [
          "Top = user-perspective health (golden signals / SLOs).",
          "A Sev1 is not the time to hunt across forty panels.",
          "One 'is it broken' view per critical service; keep deep-dives separate.",
          "Test: can a new on-call engineer orient in **30 seconds**?",
        ] },
      { q: "What's your hands-on experience with observability tooling?",
        lead: "(Tailor to truth — name real tools, then go a layer deeper than the buzzword.)",
        bullets: [
          "Worked with [Splunk / Dynatrace / Prometheus+Grafana / ELK] for [metrics/logs/APM].",
          "Specifics: [built SLO dashboards / set up distributed tracing / cut log costs by X].",
          "Mastercard references **Splunk & Dynatrace** — if you have either, lead with it.",
          "Prometheus/Grafana/OTel? Frame as transferable — same concepts across tools.",
        ] },
      { q: "How do you know whether your observability is good?",
        lead: "Proxy metric: MTTD + time-to-diagnosis during real incidents.",
        bullets: [
          "Can engineers find root cause fast without SSHing into boxes?",
          "Caught by monitoring vs reported by customers — you want the former.",
          "Do postmortems keep hitting 'we had no visibility into X'? Each one = a gap to close.",
        ] },
      { q: "SLO-based alerting vs static thresholds — what's your view?",
        lead: "Static thresholds (CPU > 80%) = noise that doesn't map to user pain.",
        bullets: [
          "A box at 85% CPU serving fine is not an incident.",
          "**SLO/error-budget** alerting fires when you're burning the budget users actually feel.",
          "**Burn-rate** alerts separate 'fix now' from 'look this week'.",
          "Keep a few hard infra alerts (disk full, etcd quorum) as safety nets.",
        ] },
    ],
  },
  {
    pillar: "Pillar 5 — Operational Resilience & Reliability Engineering",
    note: "Third named SRE pillar. Payments context means zero-downtime expectations. Likely where Sturrock pushes on strategy.",
    items: [
      { q: "How do you define SLOs and SLIs for a payments platform?",
        lead: "Start from the user's experience and work back.",
        bullets: [
          "SLIs that matter: **auth success rate, end-to-end transaction latency, auth-path availability**.",
          "Core auth path: very high (four/five nines), tight latency — **slow = failed at the point of sale**.",
          "Discipline: a small number of SLOs that genuinely represent user happiness, not measuring everything.",
        ],
        defs: {
          "SLI vs SLO": "SLI = the measured number (e.g. % successful auths); SLO = the target you commit to (e.g. 99.99%). SLA = the contractual promise to customers, usually looser than the SLO.",
          "Nines": "Shorthand for availability: 99.9% (three nines) ≈ 8.8 hrs/yr down; 99.99% (four) ≈ 52 min; 99.999% (five) ≈ 5 min.",
          "Error budget": "1 − SLO — the allowed unreliability; you 'spend' it on velocity and freeze when it's gone.",
        } },
      { q: "How do you use error budgets — especially in conversations with execs and product?",
        lead: "The error budget turns reliability from an argument into a number.",
        bullets: [
          "Inside budget → spend it on velocity, take measured risk.",
          "Burned → reliability work takes priority, by prior agreement.",
          "Depoliticises the trade-off with product/execs — nobody's negotiating feelings.",
          "Frame: 'here's our budget, here's our burn rate, here's what it means for the release plan.'",
        ] },
      { q: "How do you approach DR, RTO and RPO?",
        lead: "RTO/RPO are business decisions — force the business to make them explicit (they drive cost).",
        bullets: [
          "Payments answer is usually 'almost no data loss' + 'almost no downtime'.",
          "→ active-active or hot standby across sites, not cold backups.",
          "Non-negotiable: **test it** — an untested DR plan is a hope, not a plan.",
          "Regular realistic failover drills; measure actual RTO/RPO vs target; close the gaps.",
        ],
        defs: {
          "RTO": "Recovery Time Objective — how long you can be down before it's unacceptable (drives how hot your standby must be).",
          "RPO": "Recovery Point Objective — how much data you can afford to lose, measured in time (drives replication frequency). Payments ≈ near-zero.",
          "Active-active vs hot standby": "Active-active = both sites serve live traffic (no failover gap, hard consistency); hot standby = a ready replica you cut over to (simple, but pay RTO on the switch).",
        } },
      { q: "Tell me about a major outage and what you changed afterwards.",
        lead: "(Real example, blameless framing — the value is the follow-through.)",
        bullets: [
          "Cause: [contributing factors — rarely a single root cause].",
          "Response: [how you restored service + the MTTR].",
          "Follow-through: postmortem surfaced [systemic issues]; you drove [automation / monitoring gap / process fix].",
          "Result: [prevented recurrence / cut similar-incident MTTR by X].",
          "Senior signal: what you **changed** and made stick across the team — not how heroically you fixed it.",
        ] },
      { q: "What's your view on chaos engineering and failure injection?",
        lead: "Strongly in favour, done responsibly — you don't know it's resilient until you break it on purpose.",
        bullets: [
          "Start small & controlled: game days in non-prod.",
          "Then carefully into prod with a **blast-radius limit + abort switch**.",
          "Inject the failures you claim to survive: node loss, AZ loss, dependency latency.",
          "Surfaces the gap between the architecture diagram and reality.",
          "Payments: controls matter, but rehearse failure before it rehearses you.",
        ] },
      { q: "How do you balance reliability against feature velocity?",
        lead: "Exactly what error budgets exist to manage — explicit and data-driven, not a turf war.",
        bullets: [
          "Inside budget → velocity wins; budget exhausted → reliability wins, by prior agreement.",
          "Director job: hold that line with product/exec stakeholders.",
          "And reduce the tension structurally — better automation/observability = faster and safer.",
        ] },
      { q: "What's your approach to capacity planning?",
        lead: "Forecast-driven, tied to the business.",
        bullets: [
          "Model demand vs growth + known peaks (payments spikes are predictable and severe).",
          "Headroom above forecast peak; automate scaling where possible, hard limits visible.",
          "Treat capacity as a **leading SLI** — saturation trending up triggers action before it's an incident.",
        ] },
    ],
  },
  {
    pillar: "Pillar 6 — Incident Management & ITSM",
    note: "Half engineering, half process. The JD explicitly makes you in-region incident commander and ITSM-metric owner.",
    items: [
      { q: "Walk me through how you command a Sev1.",
        lead: "Establish command early — the IC coordinates, doesn't fix.",
        bullets: [
          "Bridge/channel up; assign roles: IC, ops lead, comms lead, scribe.",
          "Responders fix while the IC runs the process.",
          "**Mitigate first** (restore service) ahead of root cause.",
          "Communicate on a cadence so nobody's chasing updates.",
          "Stable → clean handoff + schedule the postmortem.",
          "An IC who's also debugging loses both threads.",
        ] },
      { q: "How do you run change management to ITSM/ITIL standards without it becoming bureaucracy?",
        lead: "Risk-tier it.",
        bullets: [
          "Standard, low-risk changes → pre-approved/automated paths (where IaC + CI/CD earn their keep).",
          "Only genuinely risky changes → full CAB scrutiny.",
          "Failure mode: treating everything high-risk → slows all, pushes people to dangerous out-of-band changes.",
          "Enables speed for the 90%, protects the risky 10%; in PCI the audit trail is mandatory — make it automatic.",
        ],
        defs: {
          "CAB": "Change Advisory Board — the group that reviews/approves risky changes in ITIL change management; reserve it for the genuinely risky 10%.",
          "Standard change": "A pre-approved, low-risk, well-understood change that skips full CAB — automate these.",
          "ITIL": "The IT service-management framework Mastercard's ITSM processes follow (incident/change/problem management).",
        } },
      { q: "How do you run a blameless postmortem?",
        lead: "Assume everyone acted reasonably with the info they had — interrogate the system, not the person.",
        bullets: [
          "Factual timeline; contributing factors (plural — never one root cause).",
          "Concrete actions with owners and dates.",
          "Lead by modelling it — own your own contributing call openly.",
          "Output that matters: actions actually ship — track **action-item completion**, else it's theatre.",
        ] },
      { q: "What operational KPIs do you track and report?",
        lead: "Pick the few that drive behaviour — a 50-metric dashboard drives nothing.",
        bullets: [
          "Reliability: SLO attainment, error-budget burn.",
          "Incident health: MTTD, MTTR, volume by severity, **repeat-incident rate**.",
          "Process: change success rate / change-related incidents, postmortem-action completion.",
          "Efficiency: toil %, automation coverage.",
          "Report to execs in business terms ('auth availability X vs target Y, here's the trend and driver').",
        ] },
      { q: "MTTR and MTTD — how do you actually drive them down?",
        lead: "MTTD via detection; MTTR by decomposing the timeline and attacking the biggest segment.",
        bullets: [
          "MTTD: better observability + SLO alerting; catch by monitoring, not customer report.",
          "MTTR = detect + engage + diagnose + mitigate — attack the **biggest segment**.",
          "Often the win is faster diagnosis (observability) or faster engagement (clear on-call, runbooks, access).",
          "Pre-built runbooks + rehearsed responses cut the diagnosis segment dramatically.",
        ] },
      { q: "How do you handle a major incident across a global team and timezones?",
        lead: "Follow-the-sun handoffs with disciplined context transfer.",
        bullets: [
          "Incoming region gets a clean state-of-play, not a cold start.",
          "Single source of truth (the incident channel/doc) so anyone joining can orient.",
          "Clear ownership always — the IC role is always held; handoff is explicit.",
          "As EU in-region owner: own European hours + a crisp cross-region handoff protocol.",
        ] },
      { q: "Incident management vs problem management — how do you treat the distinction?",
        lead: "Incident = restore service now; problem = eliminate the cause so it can't recur.",
        bullets: [
          "Trap: living permanently in incident mode, firefighting the same fire weekly.",
          "Protect time for problem management explicitly.",
          "Recurring incidents feed a **problem backlog** with feature-level priority.",
          "A problem fixed = a whole class of future incidents (and toil) gone — the shift to genuine SRE.",
        ] },
    ],
  },
  {
    pillar: "Pillar 7 — Leadership & Executive Communication",
    note: "Not a \"technical\" pillar, but at Director level it's woven through every answer. Sturrock (VP) is most likely to probe this — his background is team-building and growth.",
    items: [
      { q: "How do you build an SRE team / operational presence from scratch in a new region?",
        lead: "Start with the mission and the interfaces, not headcount.",
        bullets: [
          "Clarify what the EU presence owns globally vs regionally, and how it hands off with other regions.",
          "Hire for technical credibility and the right mindset (curiosity, ownership, no blame).",
          "Establish basics early: on-call, runbooks, SLOs, incident process — rails from day one.",
          "Over-invest in relationships with the global team + product/dev — a new regional team lives or dies on trust.",
        ] },
      { q: "How do you instil an SRE mindset in a traditional ops team?",
        lead: "Carefully and respectfully — they have deep knowledge; shift where they spend it.",
        bullets: [
          "Reframe success: 'heroically fixed it' → 'engineered it so it can't happen'.",
          "Protected time for engineering work, so it's not always firefighting.",
          "Make toil + SLOs visible; celebrate automation & prevention.",
          "Culture change → gradual, led by example. Fastest converter: show the hated 3am page engineered away.",
        ] },
      { q: "How do you communicate a major incident to executives?",
        lead: "Lead with impact and what they need to decide.",
        bullets: [
          "What's affected, customer/business impact, what we're doing, ETA / next update time.",
          "Business language, not stack traces — they field their own stakeholders.",
          "Predictable cadence so nobody's anxiously chasing.",
          "Separate 'what we know' from 'what we're still investigating'. Confidence without spin.",
        ] },
      { q: "How do you handle a strong technical performer who's a problem for the team culture?",
        lead: "Address it directly and early — brilliance earns no exemption.",
        bullets: [
          "SRE depends on trust & blamelessness; behaviour matters.",
          "Candid, specific conversation on the behaviour + its impact; clear expectations; support to change.",
          "If it persists, the team's health outweighs any individual's output.",
          "A toxic high performer's net contribution is often negative once you count who they drive out.",
        ] },
      { q: "How do you influence product/dev teams to prioritise reliability?",
        lead: "Shared incentives and shared data, not mandates.",
        bullets: [
          "Error budgets = a common language — reliability becomes an agreed number, not SRE nagging.",
          "Embed reliability into the dev lifecycle (production-readiness reviews, reliability by design).",
          "Make the cost of unreliability visible — incident time, customer impact, reputational risk.",
          "When product sees reliability as enabling velocity, it stops being adversarial.",
        ] },
      { q: "How do you mentor and develop engineers?",
        lead: "Stretch assignments with support; coach the thinking, don't hand answers.",
        bullets: [
          "Own a pillar, lead an incident, drive a postmortem — with regular feedback + real autonomy.",
          "Develop the SRE mindset deliberately: rotating IC duty, blameless analysis, systems thinking.",
          "Developing people is how you scale yourself — and the role explicitly asks for it.",
        ] },
      { q: "How would you measure your own success in this role at 6 and 12 months?",
        lead: "6 months: operational & trusted. 12 months: measurable improvement.",
        bullets: [
          "6mo: on-call established, in-region incident command working, key relationships built, owning a pillar with momentum.",
          "12mo: reduced toil, improved SLO attainment, lower MTTR, stronger posture in your pillar.",
          "A team that's grown in both capability and SRE mindset.",
          "Ultimately: the operation more resilient and more engineering-led than when you arrived.",
        ] },
    ],
  },
];

// ---------- derive live-copilot artifacts from the single source ----------
const PILLAR_CATEGORY_KEY = "tech-screen-pillars";
const STOP = new Set("the a an and or of to in for on with how do you your what when why is are at it that this not but as be can also into onto over under across without within during very large mixed both run runs running team teams describe tell me about would have has had will they them then there here which who whom while each per most some any all out off down up".split(/\s+/));
function deriveKeywords(q, bullets) {
  const text = (q + " " + (bullets || []).slice(0, 2).join(" ")).toLowerCase();
  const words = text.replace(/[^a-z0-9%/+\- ]/g, " ").split(/\s+/).filter(w => w.length > 3 && !STOP.has(w));
  return [...new Set(words)].slice(0, 14);
}

const PILLAR_STORIES = [];
const PILLAR_QUESTION_TYPES = {};
const PILLAR_KEYWORDS = {};
PILLARS.forEach((p, pi) => {
  p.items.forEach((it, ii) => {
    const id = `tsp${pi + 1}q${ii + 1}`;
    PILLAR_QUESTION_TYPES[id] = {
      name: it.q.length > 70 ? it.q.slice(0, 67) + "…" : it.q,
      category: PILLAR_CATEGORY_KEY,
      signals: ["domain-expertise"],
    };
    PILLAR_STORIES.push({
      id,
      title: it.q,
      domains: ["tech-screen"],
      questionTypes: [id],
      signals: ["domain-expertise"],
      card: { c: it.lead || (it.bullets && it.bullets[0]) || "", a: it.bullets || [], r: "", l: "" },
      probes: it.defs || {},
    });
    PILLAR_KEYWORDS[id] = deriveKeywords(it.q, it.bullets);
  });
});
const PILLAR_CATEGORY = {
  [PILLAR_CATEGORY_KEY]: { name: "Tech Screen — Pillar Q&A (Yours)", questionTypes: Object.keys(PILLAR_QUESTION_TYPES) },
};

module.exports = { PILLARS, PILLAR_STORIES, PILLAR_QUESTION_TYPES, PILLAR_KEYWORDS, PILLAR_CATEGORY };
