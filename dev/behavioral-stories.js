// behavioral-stories.js — canonical, company-neutral interview story bank.
// Sections are driven by each story's `domains`:
//   data · infra · sre  (technical, domain-scoped)
//   general (Management) · screen (Narrative)  (universal — apply to every interview)
// Per-interview tailoring lives on its own git branch, not here.

const SIGNALS = {
  "driving-results": {
    "name": "Driving Results (Impact)",
    "description": "Delivering business value and measurable outcomes"
  },
  "handling-ambiguity": {
    "name": "Handling Ambiguity",
    "description": "Operating when requirements unclear, priorities shift"
  },
  "conflict-resolution": {
    "name": "Conflict Resolution",
    "description": "Navigating disagreements with peers, managers, cross-functional partners"
  },
  "growing-continuously": {
    "name": "Growing Continuously",
    "description": "Seeking feedback, learning from mistakes"
  },
  "communicating-effectively": {
    "name": "Communicating Effectively",
    "description": "Conveying complex ideas, tailoring message to audience"
  },
  "ownership": {
    "name": "Ownership",
    "description": "Taking full responsibility start to finish"
  },
  "leadership-influence": {
    "name": "Leadership & Influence",
    "description": "Aligning people around a vision, leading without authority"
  },
  "mentorship": {
    "name": "Mentorship",
    "description": "Investing in others, growing talent density"
  },
  "domain-expertise": {
    "name": "Domain Expertise",
    "description": "Deep knowledge of the company, industry, or technical domain"
  }
};

const CATEGORIES = {
  "execution-delivery": {
    "name": "Execution & Delivery",
    "questionTypes": [
      "tough-project",
      "deadlines",
      "blockers",
      "trade-offs",
      "high-stakes-call",
      "roadmap"
    ]
  },
  "technical-judgement": {
    "name": "Technical Judgement",
    "questionTypes": [
      "failure",
      "big-tech-decision",
      "scaling",
      "innovation"
    ]
  },
  "leadership-people": {
    "name": "Leadership & People",
    "questionTypes": [
      "conflict",
      "underperformance",
      "growing-team",
      "motivating-team",
      "good-em"
    ]
  },
  "impact-outcomes": {
    "name": "Impact & Outcomes",
    "questionTypes": [
      "culture-impact",
      "above-and-beyond",
      "results"
    ]
  },
  "frameworks-leadership": {
    "name": "Frameworks — Leadership & People",
    "questionTypes": [
      "fw-high-performing-team",
      "fw-management-style",
      "fw-scaling-org",
      "fw-stakeholder-management",
      "fw-strategy-to-delivery",
      "fw-operational-balance"
    ]
  },
  "frameworks-technical": {
    "name": "Frameworks — Technical & Execution",
    "questionTypes": [
      "fw-technical-excellence",
      "fw-handling-ambiguity",
      "fw-prioritization",
      "fw-engineering-culture",
      "fw-incident-management",
      "fw-decision-making"
    ]
  },
  "recruiter-screen": {
    "name": "Recruiter Screen",
    "questionTypes": [
      "screen-intro",
      "screen-why-role",
      "screen-why-leave",
      "screen-leadership-scope",
      "screen-sre-depth",
      "screen-questions-for-them",
      "screen-observability",
      "screen-aiops",
      "screen-streaming-pipelines",
      "screen-scaling-org",
      "screen-incident-response",
      "screen-cross-functional"
    ]
  },
  "behavioral-deep-dive": {
    "name": "Behavioral — Deep Dive",
    "questionTypes": [
      "ambiguity",
      "developing-people",
      "experimentation",
      "breaking-down-projects",
      "platform-design",
      "org-design",
      "hard-feedback",
      "hiring",
      "cross-org-conflict",
      "disagree-manager",
      "competing-priorities",
      "backlog-health",
      "operational-balance",
      "manager-playbook"
    ]
  }
};

const QUESTION_TYPES = {
  "tough-project": {
    "name": "Tough Projects",
    "category": "execution-delivery",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "deadlines": {
    "name": "Deadlines",
    "category": "execution-delivery",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "blockers": {
    "name": "Blockers",
    "category": "execution-delivery",
    "signals": [
      "ownership",
      "leadership-influence"
    ]
  },
  "trade-offs": {
    "name": "Trade-offs",
    "category": "execution-delivery",
    "signals": [
      "communicating-effectively",
      "driving-results"
    ]
  },
  "high-stakes-call": {
    "name": "High Stakes Technical Call",
    "category": "execution-delivery",
    "signals": [
      "ownership",
      "driving-results"
    ]
  },
  "roadmap": {
    "name": "Roadmap",
    "category": "execution-delivery",
    "signals": [
      "communicating-effectively",
      "driving-results"
    ]
  },
  "failure": {
    "name": "Failures",
    "category": "technical-judgement",
    "signals": [
      "growing-continuously"
    ]
  },
  "big-tech-decision": {
    "name": "Big Tech Decisions",
    "category": "technical-judgement",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "scaling": {
    "name": "Scaling",
    "category": "technical-judgement",
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  "innovation": {
    "name": "Innovations",
    "category": "technical-judgement",
    "signals": [
      "growing-continuously",
      "driving-results"
    ]
  },
  "conflict": {
    "name": "Conflict",
    "category": "leadership-people",
    "signals": [
      "conflict-resolution"
    ]
  },
  "underperformance": {
    "name": "Dealing Underperformance",
    "category": "leadership-people",
    "signals": [
      "mentorship",
      "ownership"
    ]
  },
  "growing-team": {
    "name": "Building / Growing Team",
    "category": "leadership-people",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  "motivating-team": {
    "name": "Motivating The Team",
    "category": "leadership-people",
    "signals": [
      "leadership-influence"
    ]
  },
  "good-em": {
    "name": "Good Engineering Manager",
    "category": "leadership-people",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  "culture-impact": {
    "name": "Culture Impact",
    "category": "impact-outcomes",
    "signals": [
      "leadership-influence"
    ]
  },
  "above-and-beyond": {
    "name": "Going Above and Beyond",
    "category": "impact-outcomes",
    "signals": [
      "ownership",
      "driving-results"
    ]
  },
  "results": {
    "name": "Results",
    "category": "impact-outcomes",
    "signals": [
      "driving-results"
    ]
  },
  "fw-high-performing-team": {
    "name": "High-Performing Teams",
    "category": "frameworks-leadership",
    "signals": [
      "leadership-influence",
      "mentorship"
    ],
    "isFramework": true
  },
  "fw-management-style": {
    "name": "Management Style",
    "category": "frameworks-leadership",
    "signals": [
      "leadership-influence",
      "mentorship"
    ],
    "isFramework": true
  },
  "fw-scaling-org": {
    "name": "Scaling Organizations",
    "category": "frameworks-leadership",
    "signals": [
      "leadership-influence",
      "driving-results"
    ],
    "isFramework": true
  },
  "fw-stakeholder-management": {
    "name": "Stakeholder Management",
    "category": "frameworks-leadership",
    "signals": [
      "communicating-effectively",
      "leadership-influence"
    ],
    "isFramework": true
  },
  "fw-strategy-to-delivery": {
    "name": "Strategy → Delivery",
    "category": "frameworks-leadership",
    "signals": [
      "leadership-influence",
      "driving-results"
    ],
    "isFramework": true
  },
  "fw-operational-balance": {
    "name": "Keeping the Lights On / Operational Balance",
    "category": "frameworks-leadership",
    "signals": [
      "driving-results",
      "ownership"
    ],
    "isFramework": true
  },
  "fw-technical-excellence": {
    "name": "Technical Excellence",
    "category": "frameworks-technical",
    "signals": [
      "driving-results",
      "ownership"
    ],
    "isFramework": true
  },
  "fw-handling-ambiguity": {
    "name": "Handling Ambiguity",
    "category": "frameworks-technical",
    "signals": [
      "handling-ambiguity",
      "ownership"
    ],
    "isFramework": true
  },
  "fw-prioritization": {
    "name": "Prioritization",
    "category": "frameworks-technical",
    "signals": [
      "driving-results",
      "communicating-effectively"
    ],
    "isFramework": true
  },
  "fw-engineering-culture": {
    "name": "Engineering Culture",
    "category": "frameworks-technical",
    "signals": [
      "leadership-influence",
      "growing-continuously"
    ],
    "isFramework": true
  },
  "fw-incident-management": {
    "name": "Incident Management",
    "category": "frameworks-technical",
    "signals": [
      "ownership",
      "leadership-influence"
    ],
    "isFramework": true
  },
  "fw-decision-making": {
    "name": "Technical Decision Making",
    "category": "frameworks-technical",
    "signals": [
      "driving-results",
      "communicating-effectively"
    ],
    "isFramework": true
  },
  "screen-intro": {
    "name": "Tell Me About Yourself",
    "category": "recruiter-screen",
    "signals": [
      "communicating-effectively",
      "driving-results"
    ]
  },
  "screen-why-role": {
    "name": "Why This Role / Company",
    "category": "recruiter-screen",
    "signals": [
      "domain-expertise",
      "driving-results"
    ]
  },
  "screen-why-leave": {
    "name": "Why Leaving Current Role",
    "category": "recruiter-screen",
    "signals": [
      "growing-continuously",
      "driving-results"
    ]
  },
  "screen-leadership-scope": {
    "name": "Leadership Scope & Scale",
    "category": "recruiter-screen",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  "screen-sre-depth": {
    "name": "SRE Experience & Expertise",
    "category": "recruiter-screen",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "screen-questions-for-them": {
    "name": "Questions to Ask Recruiter",
    "category": "recruiter-screen",
    "signals": [
      "communicating-effectively",
      "domain-expertise"
    ]
  },
  "screen-observability": {
    "name": "Observability Platform",
    "category": "recruiter-screen",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "screen-aiops": {
    "name": "AIOps / ML Engine",
    "category": "recruiter-screen",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "screen-streaming-pipelines": {
    "name": "Streaming Pipelines",
    "category": "recruiter-screen",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "screen-scaling-org": {
    "name": "Scaling the Org",
    "category": "recruiter-screen",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  "screen-incident-response": {
    "name": "Incident Response & Postmortems",
    "category": "recruiter-screen",
    "signals": [
      "ownership",
      "leadership-influence"
    ]
  },
  "screen-cross-functional": {
    "name": "Cross-Functional Partnership",
    "category": "recruiter-screen",
    "signals": [
      "communicating-effectively",
      "leadership-influence"
    ]
  },
  "ambiguity": {
    "name": "Navigating Ambiguity",
    "category": "behavioral-deep-dive",
    "signals": [
      "handling-ambiguity",
      "leadership-influence"
    ]
  },
  "developing-people": {
    "name": "Developing & Mentoring People",
    "category": "behavioral-deep-dive",
    "signals": [
      "mentorship",
      "leadership-influence"
    ]
  },
  "experimentation": {
    "name": "Experimentation / A-B / Rollouts",
    "category": "behavioral-deep-dive",
    "signals": [
      "driving-results",
      "growing-continuously"
    ]
  },
  "breaking-down-projects": {
    "name": "Breaking Down Complex Projects",
    "category": "behavioral-deep-dive",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "platform-design": {
    "name": "Designing a Data Platform (Hypothetical)",
    "category": "behavioral-deep-dive",
    "signals": [
      "driving-results",
      "handling-ambiguity"
    ]
  },
  "org-design": {
    "name": "Org Design / Team Structure",
    "category": "behavioral-deep-dive",
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  "hard-feedback": {
    "name": "Giving Hard Feedback",
    "category": "behavioral-deep-dive",
    "signals": [
      "mentorship",
      "communicating-effectively"
    ]
  },
  "hiring": {
    "name": "Hiring & Onboarding",
    "category": "behavioral-deep-dive",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  "cross-org-conflict": {
    "name": "Cross-Org / Cross-Team Conflict",
    "category": "behavioral-deep-dive",
    "signals": [
      "conflict-resolution",
      "leadership-influence"
    ]
  },
  "disagree-manager": {
    "name": "Disagreed With Your Manager",
    "category": "behavioral-deep-dive",
    "signals": [
      "conflict-resolution",
      "communicating-effectively"
    ]
  },
  "competing-priorities": {
    "name": "Competing / Conflicting Priorities",
    "category": "behavioral-deep-dive",
    "signals": [
      "conflict-resolution",
      "driving-results",
      "communicating-effectively"
    ]
  },
  "backlog-health": {
    "name": "Backlog Health / Roadmap Realism",
    "category": "behavioral-deep-dive",
    "signals": [
      "driving-results",
      "communicating-effectively"
    ]
  },
  "operational-balance": {
    "name": "Keeping the Lights On / KTLO (story)",
    "category": "behavioral-deep-dive",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  "manager-playbook": {
    "name": "Manager Operating Playbook",
    "category": "behavioral-deep-dive",
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  }
};

const STORIES = [
  {
    "id": "kafka-oom",
    "title": "Kafka OOM 3am Incident",
    "domains": [
      "infra",
      "data",
      "sre"
    ],
    "questionTypes": [
      "high-stakes-call",
      "tough-project",
      "above-and-beyond"
    ],
    "signals": [
      "ownership",
      "leadership-influence"
    ],
    "card": {
      "c": "Kafka cluster OOM at 3am — entire messaging infra down, dozens of services impacted, customer-facing with regulatory risk.",
      "a": [
        "Convened bridge call, split: one on root cause, one on remediation, I handled comms",
        "Doubled heap, restarted brokers sequentially, monitored ISR + consumer lag",
        "15-min leadership updates so they didn't disrupt engineers",
        "Led blameless post-mortem after stabilization"
      ],
      "r": "Service restored in 45 min. Drove systemic fixes: automated heap monitoring, self-healing scripts, clearer runbooks. Eventually migrated to MSK.",
      "l": "Built deep empathy for on-call engineers. Now prioritize automation and psychological safety during incidents."
    },
    "probes": {
      "was kafka on-prem or managed": "Self-managed on AWS EC2. MSK wasn't mature enough at the time. We owned clusters, configs, and ops.",
      "why didn't first responders fix it": "OOM across all brokers required deep JVM tuning and Kafka internals knowledge. My pre-prepared notes let me act quickly.",
      "how did you ensure no data loss": "Restarted brokers sequentially, checked ISR before/after each restart, monitored consumer lag and rebalance events.",
      "what did you change afterwards": "Automated heap sizing + scaling policies. Wrote formal runbooks. Advocated successfully for moving to MSK."
    }
  },
  {
    "id": "terraform-golden-path",
    "title": "Terraform Golden Path",
    "domains": [
      "infra",
      "sre"
    ],
    "questionTypes": [
      "big-tech-decision",
      "trade-offs",
      "innovation",
      "culture-impact"
    ],
    "signals": [
      "driving-results",
      "leadership-influence",
      "communicating-effectively"
    ],
    "card": {
      "c": "Devs frustrated — ticket queue for IAM, networking, CI/CD, K8s configs. Security felt like gatekeepers. Inconsistent standards, slow delivery, rising friction.",
      "a": [
        "Built Terraform modules — full solutions with least-privilege IAM, encryption, logging, cost tagging baked in",
        "Integrated OPA/Sentinel guardrails into CI/CD — shift-left from manual review",
        "CLI tool (svc init) — one command → compliant repo with pipeline in under an hour",
        "Drove adoption via office hours, examples, roadshows — 'guardrails, not gates'"
      ],
      "r": "85% adoption in 3 months. IAM/network incidents down 60%. Deploy time: weeks → hours. Near-zero audit findings.",
      "l": "Won trust by making the safe path the easiest path. RFC-based exceptions for edge cases."
    },
    "probes": {
      "how did you handle pushback": "Allowed RFC-based exceptions. Communicated empathetically — guardrails not gates.",
      "how did you measure adoption": "Adoption %, reduced exceptions, developer NPS/feedback.",
      "what about teams that didn't adopt": "Early adopters influenced templates, which gave them ownership. Roadshows captured pain points."
    }
  },
  {
    "id": "cloud-migration",
    "title": "Cloud Migration (Top-Down & Bottom-Up)",
    "domains": [
      "infra"
    ],
    "questionTypes": [
      "tough-project",
      "blockers",
      "trade-offs",
      "results"
    ],
    "signals": [
      "driving-results",
      "leadership-influence",
      "ownership"
    ],
    "card": {
      "c": "Large-scale cloud migration mandate. Execs wanted cost reduction + compliance. Engineers skeptical — feared bureaucracy and less autonomy.",
      "a": [
        "Top-down: partnered with CISO + directors on KPIs (% migrated, MTTR, compliance)",
        "Bottom-up: developer portal with Terraform templates, policy-as-code in CI/CD",
        "Bridged with team-level scorecards (compliance, cost, deploy time) — transparent, not punitive",
        "Roadshows + early adopter workshops for ownership"
      ],
      "r": "70% of targeted workloads migrated in 12 months. Zero high-severity audit findings. Deploy time: 2-3 weeks → under 1 day.",
      "l": "Cloud transformation is 50% technology, 50% culture. Top-down provides air cover, bottom-up makes it sustainable."
    },
    "probes": {
      "how did you convince execs": "Linked KPIs to business risk (audit penalties, infra spend) and opportunity (faster launches).",
      "what resistance from engineers": "Initial pushback — turned critics into co-creators of the templates.",
      "what would you do differently": "Invest earlier in change champions or embed platform engineers in product teams."
    }
  },
  {
    "id": "underperformer-pip",
    "title": "Managing Underperformer (PIP → Exit)",
    "domains": [
      "general"
    ],
    "questionTypes": [
      "underperformance"
    ],
    "signals": [
      "ownership",
      "leadership-influence"
    ],
    "card": {
      "c": "Engineer (Nate) consistently underperforming — missed deadlines, recurring code quality issues, failed to follow through on action items despite informal coaching. Affecting team morale.",
      "a": [
        "Designed SMART-goal PIP with HR: defects from 12→<5/sprint, complete stories for 3 consecutive sprints, pair programming 2x/week",
        "Weekly 1:1 coaching, code review feedback, bi-weekly HR check-ins",
        "Documented everything. Recognized incremental progress. Framed PIP as support, not punishment."
      ],
      "r": "After 90 days, metrics hadn't improved. Made difficult decision to terminate. Handled professionally — transparency, documentation, protecting team morale. Sprint velocity improved 20% in next cycle.",
      "l": "Culture of accountability AND fairness. Team saw that performance issues are addressed thoughtfully, with real opportunity but also clear consequences."
    },
    "probes": {}
  },
  {
    "id": "innovation-spikes",
    "title": "Encouraged Team Innovation",
    "domains": [
      "general"
    ],
    "questionTypes": [
      "innovation",
      "motivating-team",
      "culture-impact"
    ],
    "signals": [
      "growing-continuously",
      "leadership-influence"
    ],
    "card": {
      "c": "Deep into large modernization program at Citi. Everyone doing what was convenient — afraid to experiment or break something.",
      "a": [
        "Introduced biweekly 'innovation spikes' — alternating Fridays for prototyping",
        "Success measured by learning velocity, not perfection. Celebrated failed demos.",
        "Worked with product leadership to frame as strategic investments, not distractions"
      ],
      "r": "One spike → GraphQL prototype cutting REST calls by 50%. Another explored gRPC reducing latency. Evolved into formal API modernization initiative endorsed by architecture leadership.",
      "l": "Innovation needs structure and safety, not hackathons and slogans. Team shifted from 'easiest way' to 'best way.'"
    },
    "probes": {}
  },
  {
    "id": "cloud-agnostic",
    "title": "Cloud Agnostic Infrastructure",
    "domains": [
      "infra"
    ],
    "questionTypes": [
      "big-tech-decision",
      "trade-offs"
    ],
    "signals": [
      "driving-results",
      "handling-ambiguity"
    ],
    "card": {
      "c": "Citi partnered with GCP to expand footprint. Org heavily invested in AWS. Uncertainty — multiple teams had ongoing programs, AWS-native tooling, regulatory deadlines.",
      "a": [
        "Led initiative to define consistent deployment model across both clouds",
        "Terraform modules + policy-as-code to abstract provider differences",
        "Built first end-to-end reference implementation, validated with security + compliance",
        "Onboarded early adopters from 3 lines of business"
      ],
      "r": "Provisioning lead time reduced ~40%. Created reusable pattern adopted by other internal cloud teams. Positioned org to move workloads without vendor lock-in.",
      "l": "Absorb complexity so consuming teams don't have to."
    },
    "probes": {}
  },
  {
    "id": "measuring-productivity",
    "title": "How I Measure Engineering Productivity",
    "domains": [
      "general"
    ],
    "questionTypes": [
      "good-em",
      "results"
    ],
    "signals": [
      "driving-results",
      "communicating-effectively"
    ],
    "card": {
      "c": "Common interview question — 'how do you measure your team's productivity?'",
      "a": [
        "DORA metrics + business/operational metrics — not lines of code or hours",
        "Daily: sprint board blockers, CI/CD status, active incidents",
        "Weekly: lead time from commit to production, deployment frequency",
        "Monthly/quarterly: change failure rate, overall efficiency",
        "Track 'say/do ratio' — plan 50, deliver 20 = planning problem, not people problem"
      ],
      "r": "Goal isn't to make people work harder — it's to find where the system is blocked.",
      "l": "Measure the system, not the humans."
    },
    "probes": {}
  },
  {
    "id": "screen-current-scope",
    "title": "Leadership Scope & Scale (Current)",
    "domains": [
      "screen"
    ],
    "questionTypes": [
      "screen-leadership-scope"
    ],
    "signals": [
      "leadership-influence",
      "mentorship",
      "driving-results"
    ],
    "card": {
      "c": "Currently leading a 20-person global engineering organization at Citi — engineers and contractors across the US, Europe, and India. Cloud Technology Services.",
      "a": [
        "Hired, mentored, and coached across all levels — mid-level engineers to senior tech leads",
        "Built a tech-lead operating model to scale decision-making without adding management layers",
        "Established OKRs, DORA metrics, and say/do ratio as the operating framework",
        "Run bi-weekly tech lead forums, weekly 1:1s, quarterly career development planning",
        "Present roadmap progress and trade-offs to senior leadership (CTOEAC) regularly"
      ],
      "r": "Doubled team throughput. Earned company-wide leadership awards. One tech lead promoted to engineering manager. Model became blueprint adopted by two other organizations.",
      "l": "At this level, my impact isn't what I build — it's the system I create for others to deliver at scale."
    },
    "probes": {
      "how many direct reports": "Currently 20 in total — mix of direct reports and tech leads who manage sub-teams. In a prior role it was a team of 10.",
      "do you manage managers": "I manage tech leads who function as player-coaches — they own domains and have people responsibilities without formal manager titles. I've also managed the transition of a tech lead into a full engineering manager role.",
      "how do you handle remote teams": "Global org across US, Europe, India. Written culture for decisions, async design reviews, time-zone-aware meeting cadences. Tech lead forums bridge the gaps."
    }
  },
  {
    "id": "screen-sre-mastery",
    "title": "SRE Experience & Platform Build",
    "domains": [
      "sre"
    ],
    "questionTypes": [
      "screen-sre-depth"
    ],
    "signals": [
      "driving-results",
      "ownership",
      "domain-expertise"
    ],
    "card": {
      "c": "Spent three-plus years at Citi building SRE as a discipline from the ground up for a global cloud technology organization. Before that, ran infrastructure operations and on-call in an earlier role (Dublin).",
      "a": [
        "Architected observability platform — OpenTelemetry, Prometheus, Grafana — custom alerting correlated across hundreds of services",
        "Built AIOps engine — ML-powered text analytics ingesting 100k+ incidents monthly for predictive analysis and hotspot identification",
        "Drove automation and toil reduction — event pipelines processing 2B+ events daily for real-time metrics and alerting, reducing toil 25%",
        "Established incident response, blameless postmortems, and production readiness — core 'operational resilience'",
        "Experience across Linux, containers (Kubernetes), VMware environments, and ITSM workflows (ServiceNow)"
      ],
      "r": "Repeat incidents down 35%. Operational toil reduced 25%. Built the SRE culture — not just the tools. Automation, observability, and operational resilience are literally what I built at Citi.",
      "l": "SRE at enterprise scale is three things: technical depth, organizational alignment, and a culture where reliability is everyone's responsibility — not a team name."
    },
    "probes": {
      "what tools do you use": "OpenTelemetry for instrumentation, Prometheus for metrics, Grafana for visualization and alerting. Kafka and Flink for streaming data pipelines. ServiceNow for incident management. All on AWS with some multi-cloud (GCP).",
      "have you done chaos engineering": "We've built production readiness reviews and have automated remediation patterns. Chaos engineering is a natural next step — it's where I want to push the practice next.",
      "how do you measure sre success": "SLIs/SLOs for service reliability, MTTR and incident frequency for operational health, toil reduction percentage for automation maturity, and DORA metrics for delivery velocity."
    }
  },
  {
    "id": "screen-observability-platform",
    "title": "Observability Platform (OTel + Prometheus + Grafana)",
    "domains": [
      "sre"
    ],
    "questionTypes": [
      "screen-observability",
      "screen-sre-depth",
      "big-tech-decision",
      "innovation"
    ],
    "signals": [
      "driving-results",
      "ownership",
      "leadership-influence"
    ],
    "card": {
      "c": "Teams at Citi had fragmented monitoring — no correlation between metrics, logs, and traces across hundreds of cloud-native services. Alerts were noisy, root cause analysis was slow, and incident detection relied on tribal knowledge.",
      "a": [
        "Chose OpenTelemetry as the instrumentation standard — vendor-neutral, portable, future-proof",
        "Prometheus for metrics collection and Grafana for visualization, dashboards, and alerting",
        "Built a custom correlation layer — an alert on one service traces impact across all dependent services automatically",
        "Rolled out incrementally — onboarded teams in waves with office hours and working examples, not a big-bang mandate",
        "Partnered with security to integrate observability signals into incident detection workflows"
      ],
      "r": "Correlated alerting across hundreds of services. Accelerated incident detection and resolution. Became the standard observability stack for cloud-native services at Citi.",
      "l": "Chose open-source over commercial (Datadog/Splunk) for cost control, vendor independence, and full ownership at Citi's scale. Made the safe path the easy path — teams adopted because it was better, not because it was mandated."
    },
    "probes": {
      "why not datadog or splunk": "Enterprise scale — commercial licensing at Citi's volume would be significant. OTel gives portability and vendor independence. Prometheus + Grafana gave the team full ownership and customization without procurement cycles.",
      "how did you get teams to adopt": "Incremental rollout — started with high-incident services, showed the value, then expanded. Office hours, example dashboards, and clear docs. Guardrails not gates.",
      "what was the hardest part": "Correlation across services. A single alert in isolation is noise — the value comes from tracing causality chains. That required a shared data model and consistent instrumentation, which meant influencing dozens of teams.",
      "how does this relate to a mission-critical SRE role": "Mission-critical infrastructure needs exactly this — proactive monitoring, intelligent alerting, and correlated observability. Advancing observability and telemetry capability is core to any reliability-focused role."
    }
  },
  {
    "id": "screen-incident-response-citi",
    "title": "Incident Response & Blameless Postmortems",
    "domains": [
      "sre"
    ],
    "questionTypes": [
      "screen-incident-response",
      "high-stakes-call",
      "fw-incident-management"
    ],
    "signals": [
      "ownership",
      "leadership-influence",
      "driving-results"
    ],
    "card": {
      "c": "No structured incident response or postmortem practice across cloud technology services at Citi. Teams handled incidents ad hoc — inconsistent communication, repeated failures, no systemic learning.",
      "a": [
        "Defined clear incident roles — incident commander, comms lead, technical responder. No ambiguity during chaos",
        "15-minute leadership updates during incidents — keeps them informed without disrupting engineers",
        "Restore first, root-cause later — never debug while services are down",
        "Blameless postmortem within 48 hours — focus on systemic fixes, not who made the mistake",
        "Action items must prevent recurrence — monitoring, automation, runbooks. 'Be more careful' is never an action item"
      ],
      "r": "Eliminated repeat incidents across owned services. Improved production readiness. Reduced operational risk organization-wide.",
      "l": "Incident management isn't about firefighting — it's about building a system where the org learns from every failure. Owning incident-response frameworks and reducing MTTR is exactly what I built."
    },
    "probes": {
      "give me a specific incident example": "Kafka OOM at 3am — entire messaging infra down, dozens of services impacted. Convened bridge call, split team into root cause, remediation, and comms. Service restored in 45 minutes. Post-mortem drove automated heap monitoring, self-healing scripts, and eventually migration to MSK.",
      "how do you measure incident management": "MTTR, incident frequency, recurrence rate, and time to postmortem. Also qualitative — do engineers feel safe raising issues early? That's the culture metric.",
      "what about chaos engineering": "We built production readiness reviews and automated remediation patterns. Chaos engineering is the next evolution — it's where I want to push the practice next."
    }
  },
  {
    "id": "screen-cross-functional-citi",
    "title": "Cross-Functional Partnership & Executive Communication",
    "domains": [
      "general"
    ],
    "questionTypes": [
      "screen-cross-functional",
      "fw-stakeholder-management",
      "roadmap"
    ],
    "signals": [
      "communicating-effectively",
      "leadership-influence",
      "driving-results"
    ],
    "card": {
      "c": "SRE and observability priorities needed alignment with engineering, product, and security — each with different definitions of success. Required regular presentation of roadmap progress and trade-offs to senior leadership (CTOEAC).",
      "a": [
        "Stakeholder mapping (power/interest grid) — tailored cadence and detail level for each audience",
        "Translated tech to business impact: 'observability platform' becomes 'reducing MTTR by 40% and cutting incident escalations'",
        "No surprises rule — surface risks early with mitigation options, not just bad news",
        "Aligned observability priorities with each partner: security got faster incident detection, product got reliability SLAs, engineering got reduced toil",
        "Regular CTOEAC presentations — roadmap progress, trade-offs, and investment recommendations"
      ],
      "r": "Aligned three organizations around shared observability goals. Earned budget for platform investments. Leadership trusted the team to make autonomous technical decisions.",
      "l": "At Director level, the job is as much about influence and communication as it is about technology. Senior technical leadership requires partnering with Product, Architecture, Security, and Development — this is exactly the muscle I've been building."
    },
    "probes": {
      "what is ctoeac": "CTO Executive Advisory Committee — senior leadership forum where technology leaders present strategy, progress, and trade-offs. I presented our observability and SRE roadmap regularly.",
      "how do you handle competing priorities": "RICE scoring to quantify, cost-of-delay analysis to create urgency, and 'here's what we'd drop to fit this in' to make trade-offs visible. Never debate opinions — debate data.",
      "how do you manage up": "Tailor the message to the audience. Execs want business impact and risk. Peers want technical detail. Reports want context and direction. Same initiative, different lens."
    }
  },
  {
    "id": "tech-drift",
    "title": "DRIFT (Data Reference Inventory Fabric for Tech Services) — Trusted Source of Truth for the Tech Estate",
    "card": {
      "c": "20-second headline: Citi operates a large, complex tech estate that generates a massive volume of data every day — infra, security, incident, cost. That data drives critical decisions across security, compliance, finance, engineering, and executive leadership — it's operational accountability and audit evidence. Over time, teams built their own systems to move quickly for local needs, but that created duplication, operational overhead, and inconsistent views across the org — the same asset could have a different owner, risk, or cost depending on which system you asked. To overcome that, I led the build of DRIFT — Data Reference Inventory Fabric for Tech Services — a company-wide platform that created one trusted view of the estate, ~300 systems and ~2B records a day.",
      "a": [
        "My role was the **accountable engineering leader**: I owned strategy, stakeholder alignment, sequencing, the adoption model and the key tradeoff decisions — leading through technical leads and workstream owners",
        "I organized the work into **four workstreams**: data model & governance, ingestion & contextualization, workflows, and consumer migration",
        "Rather than onboard 300 systems big-bang, I drove a **phased rollout** — starting with high-value security workflows where trusted, timely data mattered most. Those teams became **reference adopters** who proved the model before broader migration",
        "To reduce resistance, we introduced **upstream data contracts** and ran DRIFT **in parallel** with existing sources, using mismatches to build confidence before cutover — but parallel running was explicitly temporary; as teams migrated, we retired legacy pipeline paths",
        "A key tradeoff I drove was **rejecting real-time everywhere**: many upstream sources were delayed anyway, so all-streaming would have added cost and operational tax with no better outcome. Real-time only where stale data created real risk; batch everywhere else"
      ],
      "r": "DRIFT became the **trusted source of truth** for the tech estate. For security-critical workflows, data latency dropped from **~4-6 hours to under a minute** — so an unauthorized access change is now caught and isolated **within a minute**, instead of being discovered the morning after a breach. The bigger organizational outcome: teams that used to produce conflicting answers now work from a **common set of definitions and a shared view** — conflicting records dropped by **more than 80%** — and leadership relies on one trusted source instead of reconciling multiple versions of reality.",
      "l": "The biggest lesson: **systems fail long before the technology fails**. I initially focused on latency because it was the **most visible problem** — but the real risk wasn't stale data, it was **inconsistent definitions, unclear ownership**, and a lack of trust between organizations. Leave those unresolved and a faster system just delivers inconsistent answers more quickly. That changed how I run large programs: I now spend more time up front **aligning stakeholders, defining ownership, and establishing governance** — once people agree how decisions are made and what 'good' looks like, the technical solution gets far easier to deliver and scale.",
      "signals": {
        "c": [
          "Citi operates a large, complex **tech estate** — generating a massive volume of data every day from **infra, security, incident, cost**",
          "That data drives **critical decisions** across **security, compliance, finance, eng, and exec leadership** — it's **operational accountability and audit evidence**",
          "Over time, teams built their own systems to **move quickly for local needs** — but that created **duplication, operational overhead, and inconsistent views** across the org",
          "Example: the **same asset** could have a different **owner, risk, or cost** depending on **which system you asked**",
          {
            "b": "To overcome that, **I led DRIFT** — a company-wide platform giving **one trusted view of the estate**",
            "sub": [
              "**D**ata **R**eference **I**nventory **F**abric for **T**ech Services",
              "**~300 systems · ~2B records / day**"
            ]
          }
        ],
        "a": [
          "**My role**: accountable eng leader — owned strategy, alignment, sequencing, tradeoffs; **led through tech leads + workstream owners**",
          {
            "b": "Organized into **four workstreams**:",
            "sub": [
              "Data model & governance",
              "Ingestion & contextualization",
              "Workflows",
              "Consumer migration"
            ]
          },
          {
            "b": "**Phased rollout, not big-bang** — security workflows first:",
            "sub": [
              "Those teams became **reference adopters** — proved the model",
              "Introduced **upstream data contracts**",
              "Ran **in parallel**, used mismatches to build trust → **retired legacy paths** (temporary by design)"
            ]
          },
          {
            "b": "**Key tradeoff — rejected real-time everywhere**:",
            "sub": [
              "Sources were delayed anyway → all-streaming = cost + tax, no gain",
              "Real-time only where **stale data = real risk**; batch elsewhere"
            ]
          }
        ],
        "r": [
          "Became the **trusted source of truth** for the tech estate",
          "Security workflows: latency **~4-6h → <1min** — unauthorized change caught **within a minute** (vs morning after a breach)",
          "Teams now share **common definitions + one view**; leadership relies on **one source**, not versions of reality",
          "**Conflicting records reduced >80%**"
        ],
        "l": [
          "**Systems fail long before the technology fails**",
          "Chased latency (visible); real risk was **inconsistent definitions, unclear ownership, lack of trust**",
          "Now I **front-load alignment, ownership, governance** → the tech gets easy to deliver & scale"
        ]
      }
    },
    "probes": {
      "what was the stack": "Kafka as the single front door for all ~300 sources, Flink for the real-time security-critical hot path (exactly-once, stateful dedup, late-event handling, in-flight policy checks via OPA), Iceberg as the shared table layer so the existing Spark/batch estate reads the same data without a forced migration.",
      "why not make it all real-time": "Cost and operational complexity for no business gain. Real-time earns its keep only where stale data creates risk — security workflows. For reporting, finance, and the long tail, batch is cheaper, simpler, and entirely sufficient. Maturity is matching the tool to the actual risk, not chasing real-time everywhere.",
      "what was the throughput": "~2B/day is roughly a 23,000 events/sec baseline — ~4.6 MB/s at 200 bytes/event, ~23 MB/s at 1KB, and spiky in practice, which is why naive micro-batching gave stair-step latency and brittle recovery on the hot path.",
      "how did you get 300 sources to agree on definitions": "Not a doc — a governance process. I aligned security/finance/compliance/engineering leaders on a common operating model first, made the canonical schema the contract, and used onboarding controls + data-quality gates so contributing safely was the path of least resistance.",
      "how did you avoid disrupting existing consumers": "Iceberg as the shared substrate — the new pipeline writes tables the existing batch/Spark consumers already read, so they kept working unchanged while the platform modernized underneath them.",
      "how does this scale to a larger org": "Same lifecycle and same hard part: ingestion → trusted model → consumption across hundreds of teams. At larger scale the core problem is identical — one trusted foundation that many orgs agree on and adopt without redesigning their world."
    },
    "domains": [
      "data"
    ],
    "questionTypes": [
      "tough-project",
      "big-tech-decision",
      "scaling",
      "results",
      "high-stakes-call",
      "breaking-down-projects",
      "screen-streaming-pipelines"
    ],
    "signals": [
      "driving-results",
      "ownership",
      "leadership-influence"
    ]
  },
  {
    "id": "tech-scout",
    "title": "SCOUT (Search, Classify, Orient Using Tagging) — ML Ops-Intelligence, POC to Funded (Ownership / Operating Model)",
    "card": {
      "c": "SCOUT — Search, Classify, Orient Using Tagging — an ML-powered operational-intelligence platform I drove from POC to a funded platform. Millions of operational records flowed through every month from ServiceNow and CAI workflows — incidents and changes, problems, and application context — but we couldn't answer basic reliability questions: what are our recurring failure patterns? which services are hotspots? The cost to the bank was real — engineering teams triaged the same failures repeatedly without recognizing them as systemic, and leadership made investment decisions on assumptions, not evidence. Every major incident review recycled the same unknowns, because the root cause was structural: the signal was buried in free text, with the same issue surfacing under different descriptions. The result was reactive firefighting, escalated risk, and wasted engineering cycles.",
      "a": [
        "**To prove there was signal worth chasing**, I ran a POC with one engineer on our innovation budget — a lightweight ML classifier on historical ITSM records surfaced recurring failure themes manual tagging had missed, consistently across independent samples. That gave us a defensible metric, not just a hypothesis",
        "**I built the business case on three numbers**, each answering a question we couldn't before: (1) how much effort we waste — the volume of duplicate triage on recurring incident classes; (2) whether changes cause incidents — the % of high-severity incidents linked to recent changes; (3) whether the model beats us — the gap between human and model classification consistency, where the model was significantly more consistent. Together: the waste was real, the cause addressable, the model worked",
        "**The timing helped, and I used it for build-vs-buy**: leadership was already evaluating AIOps vendors, and I could show that our own ITSM context was what drove the accuracy — hard for a vendor to replicate",
        "**Clean operating model — the reason it shipped**: Data Science owned model development, Product owned insight consumption, my team owned the platform, inference infra, and reliability — my DS background let me sharpen the framing (cluster similar incidents, don't predict unreliable categories) without taking modelling from them",
        "**Built it event-driven on AWS**: real-time ITSM ingestion, classification and similarity models, insights surfaced straight into operational dashboards"
      ],
      "r": "Three measurable outcomes: triage and classification time dropped 55%, as teams could identify recurring failure classes without manual investigation; recurring incidents fell 40%, because systemic patterns were now visible and fixable before the next occurrence; and reliability conversations became evidence-based — hotspot services, change-to-incident correlations, and failure themes were quantified, not debated.",
      "l": "The biggest lesson was the value of taking initiative — identifying a problem others had accepted as the status quo and acting on it before there was a mandate to do so. That same mindset is now driving the next evolution of the platform toward LLM capabilities — natural-language querying, incident summarization, and contextual reasoning — building on the foundation already in place.",
      "signals": {
        "c": [
          {
            "b": "Drove **SCOUT** (Search, Classify, Orient Using Tagging) — ML ops-intelligence on **millions of monthly operational records** from ServiceNow + CAI workflows",
            "sub": [
              "Incidents & changes",
              "Problems",
              "Application context"
            ]
          },
          {
            "b": "But we **couldn't answer basic reliability questions**:",
            "sub": [
              "What are our **recurring failure patterns**?",
              "Which services are **hotspots**?"
            ]
          },
          {
            "b": "The **cost to the bank was real**:",
            "sub": [
              "Engineering teams **triaged the same failures repeatedly** — not recognized as systemic",
              "Leadership made investment decisions on **assumptions, not evidence**"
            ]
          },
          "Every major incident review **recycled the same unknowns** — the root cause was **structural**: signal **buried in free text**, the same issue surfacing under different descriptions",
          "Net result: **reactive firefighting, escalated risk, and wasted engineering cycles**"
        ],
        "a": [
          "**De-risked**: 1-engineer POC on innovation budget — classifier surfaced themes manual tagging missed → **defensible metric, not a hypothesis**",
          {
            "b": "**Business case = three numbers** we couldn't answer before:",
            "sub": [
              "**Wasted effort**: duplicate triage on recurring incident classes",
              "**Change causation**: % of high-sev incidents linked to recent changes",
              "**Model > human**: model far more consistent than manual classification"
            ]
          },
          "**Build-vs-buy**: leadership evaluating **AIOps vendors** — our own **ITSM context drove accuracy**, hard to replicate",
          {
            "b": "**Operating model** — unified DS / Product / Eng:",
            "sub": [
              "**Data Science**: model development",
              "**Product**: insight consumption",
              "**My team**: platform, inference infra, reliability"
            ]
          },
          "Built **event-driven on AWS** — real-time ingestion, classification + similarity → **operational dashboards**"
        ],
        "r": [
          "Triage & classification time **down 55%** — recurring failure classes spotted without manual investigation",
          "Recurring incidents **down 40%** — systemic patterns now visible & fixable before the next one",
          "Reliability convos **evidence-based** — hotspots, change-to-incident correlations, themes **quantified, not debated**"
        ],
        "l": [
          "Biggest lesson: **value of taking initiative** — acting before there was a mandate",
          "Others accepted it as **status quo** — I didn't",
          "Same mindset → next: **LLM capabilities** (NL querying, incident summarization, contextual reasoning)"
        ]
      }
    },
    "probes": {
      "why classical ML and not LLMs or deep NLP": "Deliberate trade-off — cheap, fast, interpretable, and it fit the 110ms latency budget. The architecture is modular so the model is swappable; LLMs are what's next, but the leverage was the intelligence layer and the operating model, not the specific model.",
      "did you build the ML yourself": "Clean boundary: I owned the platform — data foundation, cloud architecture, constraints, framing; DS owned modelling. My DS background sharpened the problem definition; I didn't take modelling from them. That boundary is exactly why it shipped.",
      "does Lambda / serverless scale for this": "[VERIFY: know your real answer — serverless fit the spiky triage volume and cut MLOps burden; name where it would need revisiting (sustained high-throughput batch, concurrency limits) and what you'd do. Have concrete numbers.]",
      "how were the 55% and 40% measured": "[VERIFY: the real measurement method — e.g. triage time from a sample of incidents before/after, recurring-incident rate over a fixed window, precision on a held-out labelled set. an interviewer will probably ask; have the basis ready.]",
      "is this agentic automation": "Today it recommends and routes — human-in-the-loop. The natural evolution is agentic: propose remediation, execute low-risk actions with guardrails and an audit trail, expanding autonomy per action class as trust accrues. Genuinely curious where the team is on this."
    },
    "domains": [
      "data",
      "sre"
    ],
    "questionTypes": [
      "innovation",
      "big-tech-decision",
      "results",
      "screen-aiops"
    ],
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  {
    "id": "tech-experimentation",
    "title": "Experimentation Discipline — Canary & Progressive Rollouts (SCOUT)",
    "card": {
      "c": "SCOUT's classifications fed live incident workflows — a bad model version could misroute real incidents. So every model and pipeline release shipped as an experiment, not an event: canary first, progressive rollout gated on metrics.",
      "a": [
        "Every release went out as a **canary** — new version ran on a slice of live traffic alongside the incumbent [VERIFY: canary %, and shadow vs live-serving]",
        "Promotion gated on metrics, not vibes — precision/recall per category, the 110ms latency budget, downstream feedback signals [VERIFY: actual gate thresholds]",
        "**Progressive rollout** in stages — exposure expanded only when every gate held at the previous stage [VERIFY: stage sizes/duration]",
        "Guardrail regression meant rollback to the previous version [VERIFY: automated or manual call]",
        "Same discipline applied to pipeline and config changes, not just models"
      ],
      "r": "Precision climbed 68% → 89% across successive releases [VERIFY: zero high-severity rollout incidents?]. Engineers trusted the feed because it never degraded under them — trust in the data product was the real deliverable.",
      "l": "Experimentation is an operating discipline: hypothesis → controlled exposure → metric gates → promote or roll back. Consumer A/B swaps traffic slices for randomized users and gates for significance tests — the muscle is the same.",
      "signals": {
        "c": [
          "SCOUT classifications fed **live incident workflows** — bad version misroutes incidents",
          "**Why**: every release shipped as an **experiment, not an event**",
          "Canary first, **progressive rollout gated on metrics**"
        ],
        "a": [
          "Shipped every release as a **canary** on a live-traffic slice [VERIFY %]",
          "**Gated on metrics, not vibes** — precision/recall, 110ms, downstream signals [VERIFY thresholds]",
          "**Progressive rollout** by stages; guardrail regression → **rollback** [VERIFY stages]"
        ],
        "r": [
          "Precision **68% → 89%** across successive releases",
          "Feed **never degraded** — engineers trusted it",
          "**Trust in the data product** was the real deliverable"
        ],
        "l": [
          "Experimentation is an **operating discipline**: hypothesis → exposure → gates → promote/roll back",
          "Consumer **A/B is the same muscle** — slices for randomized users, gate on significance",
          "Platform-level experimentation is a **major draw**"
        ]
      }
    },
    "probes": {
      "have you run actual a/b tests": "Two honest layers: controlled-exposure rollouts with metric gates on SCOUT, and a literal 4-week A/B pilot — Flink vs Spark on the same production workload, with automatic rollback to Spark if any SLA breached. Part of the draw is doing experimentation at platform level, properly.",
      "what would you want in an experimentation platform": "Assignment and exposure logging you can trust, metrics computed on the same foundation as analytics so there's one source of truth, guardrail metrics with auto-halt, and self-serve analysis. The trustworthy pipeline underneath is the hard part — exactly a data-platform org's home turf.",
      "how did you size the canary": "[VERIFY: real sizing/duration rationale — enough traffic for category-level precision confidence. Have one concrete number ready; this is exactly where a peer EM probes.]"
    },
    "domains": [
      "data",
      "infra"
    ],
    "questionTypes": [
      "experimentation",
      "trade-offs"
    ],
    "signals": [
      "driving-results",
      "ownership",
      "growing-continuously"
    ]
  },
  {
    "id": "tech-breakdown",
    "title": "Breaking Down a Complex Project — .NET/TIBCO Migration",
    "card": {
      "c": "A common interview question — 'breaking a complex project into subtasks; what method do you use?' Frame: modernizing the bank's enterprise approval platform — aging .NET on TIBCO messaging, a global mandate to retire TIBCO, everything deeply interconnected, so a big-bang rewrite was off the table.",
      "a": [
        "First I **mapped the domain** — workshops to break it into core capabilities and their dependencies before writing any code",
        "Chose a **Strangler Fig** pattern — Solace as a bridge running old and new in parallel, so we migrated gradually instead of betting on a big-bang cutover",
        "Proved a **walking skeleton** first — one thin end-to-end flow before the hard cases; that's what caught the problem small: consumers coming online before their queues were provisioned, silently dropping messages — a nightmare to debug at full scale",
        "Built a **dependency matrix** off that catch — sequenced every integration so nothing went live until its upstream was ready",
        "**Sliced the work vertically** in Jira — each slice its own epic, owner, and pipeline, so teams shipped independently",
        "**Codified everything** — Terraform and Helm, every change a reviewed PR with an audit trail"
      ],
      "r": "First cloud flow live in 12 weeks, zero downtime. Incidents down 50%, approvals ~30% faster — and the breakdown became a reusable migration blueprint other teams picked up across the bank.",
      "l": "The method in one line: map the domain, prove a walking skeleton, slice vertically with clear ownership, sequence by dependencies, codify everything — so you fail small and early on a system you can't afford to break.",
      "signals": {
        "c": [
          "**Common interview question** — method for breaking a complex project into subtasks",
          "Modernized bank's approval platform — **aging .NET on TIBCO**, global retire mandate",
          "Deeply interconnected — **big-bang rewrite off the table**"
        ],
        "a": [
          "**Mapped the domain** first — workshops into capabilities + dependencies, before code",
          "Chose **Strangler Fig** — Solace bridge ran old + new in parallel, gradual migration",
          "Proved a **walking skeleton**; built dependency matrix; sliced **vertically** in Jira"
        ],
        "r": [
          "First cloud flow live in **12 weeks, zero downtime**",
          "Incidents **down 50%**, approvals **~30% faster**",
          "Breakdown became a **reusable migration blueprint** across the bank"
        ],
        "l": [
          "Method: **map domain, prove skeleton, slice vertically, sequence by deps**",
          "**Fail small and early** on a system you can't break",
          "Walking skeleton caught the killer bug **small, not at scale**"
        ]
      }
    },
    "probes": {
      "how did you measure success": "Three dimensions every time: business continuity (zero downtime), operational metrics (50% fewer incidents, 30% faster approvals), organizational leverage (other teams reused the blueprint).",
      "your role vs the team's": "I owned technical direction and delivery strategy — migration pattern, Jira structure, cutover sequencing, unblocking. Tech leads owned each vertical slice and implementation.",
      "how did you ensure no data loss": "Solace persistent queues with built-in durability, clear retention/expiry policies, dead-letter queue with replay for forensics. Guaranteed delivery and traceability, while keeping the broker a broker — not a database."
    },
    "domains": [
      "data",
      "infra"
    ],
    "questionTypes": [
      "breaking-down-projects",
      "tough-project",
      "deadlines",
      "trade-offs",
      "high-stakes-call"
    ],
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  {
    "id": "tech-impact",
    "title": "Measurable Business Impact — FinOps Projection Engine",
    "card": {
      "c": "A common prompt: 'a project where your work had measurable impact on the business — how did you evaluate its success?' Lead: modernization adoption (VMs → containers) was stalling because engineers treated infrastructure as free — no visibility into the financial trade-offs of their choices.",
      "a": [
        "Partnered with platform engineering to ingest full usage metrics, normalized against cloud rate cards and internal chargeback models",
        "Built a projection engine beyond simple reporting — variable substitution, so teams plug in their throughput and see a side-by-side P&L of 'as-is' vs 'shared cluster'",
        "Integrated it into the developer portal — instant, self-serve feedback loop, no finance degree required"
      ],
      "r": "Identified $12.5M in annualized savings opportunities in the first quarter. Culturally: cost became an engineering constraint we optimize for, like latency or availability.",
      "l": "Evaluation was explicit on two axes — financial (the $12.5M pipeline) and cultural (engineers using the dashboards for tuning without being asked). A data product succeeds when it answers the user's question, not when it ships.",
      "signals": {
        "c": [
          "**Common interview question** — work with measurable business impact + how I judged success",
          "Modernization (VMs→containers) **stalling** — engineers treated infra as free",
          "**Why**: no visibility into financial trade-offs of their choices"
        ],
        "a": [
          "Partnered platform eng — ingested usage **normalized vs rate cards + chargeback**",
          "Built a **projection engine**: side-by-side P&L 'as-is' vs 'shared cluster'",
          "Integrated into the **developer portal** — instant self-serve, no finance degree"
        ],
        "r": [
          "**$12.5M** annualized savings opportunities **in first quarter**",
          "Cost became an **engineering constraint** — like latency or availability",
          "Engineers tuned with the dashboards **without being asked**"
        ],
        "l": [
          "Evaluated on **two axes** — financial ($12.5M) and cultural (adoption)",
          "A data product wins when it **answers the user's question**, not when it ships",
          "Make the trade-off **visible** and behavior follows"
        ]
      }
    },
    "probes": {
      "how did you get to $12.5M — realized or projected?": "Before-vs-after spend on migrated workloads: previous utilization cost minus current cost after migration. For the teams that actually moved (VMs → containers), the delta was concrete and observable — clear numbers, not estimates. The projection engine then modeled the same 'as-is vs shared-cluster' P&L for workloads that hadn't moved yet, so the ~$12.5M is the annualized opportunity: realized savings on what moved, plus modeled savings on what could."
    },
    "domains": [
      "infra",
      "data"
    ],
    "questionTypes": [
      "results",
      "innovation",
      "roadmap"
    ],
    "signals": [
      "driving-results"
    ]
  },
  {
    "id": "tech-platform-design",
    "title": "Philosophy — Standing Up a Data Platform (90-Day Plan, Build vs Buy)",
    "card": {
      "c": "Prepared answer for 'how would you design/stand up a data platform' or build-vs-buy questions — framework, not a story.",
      "a": [
        "First 30 days, foundation: pragmatic MVP — managed warehouse (BigQuery/Snowflake), managed ingestion (Fivetran or a simple batch-API framework), dbt for transformation, lightweight orchestration (Airflow). Bias for speed-to-value via managed services",
        "Next 30, value: shift from plumbing to business impact — define the tracking plan with stakeholders, ship a core metrics mart answering revenue/activation/retention questions",
        "Final 30, scale + governance: SLAs for freshness and quality, RBAC, self-serve BI with a semantic layer, centralized catalog",
        "Build vs buy: **buy commodity** (ingestion, orchestration, observability — developer hours belong on business-specific problems), **build for competitive edge** only, always with total-cost-of-ownership and an exit strategy for vendor risk",
        "Tech debt: catalog and quantify against business impact, classify (interest-paying vs dormant vs risk-based), make it visible to stakeholders, and dedicate 15-20% of sprint capacity continuously"
      ],
      "r": "The thread through all of it: connect infrastructure investment to tangible analytics outcomes fast, then earn the right to go deeper.",
      "l": "At large, consumer scale most of this is already built — but the judgment (core vs context, speed vs governance sequencing) is what the question actually tests.",
      "signals": {
        "c": [
          "Prepared a **framework, not a story** — standing up a data platform / build-vs-buy",
          "**Why**: the question tests **judgment**, not the components",
          "Structured as a **90-day plan**: foundation → value → scale"
        ],
        "a": [
          "**First 30 — foundation**: managed MVP (BigQuery, Fivetran, dbt, Airflow), speed-to-value",
          "**Next 30 — value**: tracking plan + core **metrics mart** (revenue/activation/retention)",
          "**Final 30 — scale + governance**: SLAs, RBAC, semantic-layer self-serve BI, catalog"
        ],
        "r": [
          "**Buy commodity**, build only for competitive edge — with TCO + exit strategy",
          "Tech debt: **catalog, classify, 15-20% sprint capacity** continuously",
          "Connect infra to **analytics outcomes fast**, then earn the right to go deeper"
        ],
        "l": [
          "At large scale most is built — the **judgment** is what's tested",
          "**Core vs context**, speed vs governance **sequencing**",
          "**Deliver value first** to earn the right to go deeper"
        ]
      }
    },
    "probes": {},
    "domains": [
      "data"
    ],
    "questionTypes": [
      "platform-design",
      "big-tech-decision",
      "roadmap"
    ],
    "signals": [
      "driving-results",
      "handling-ambiguity"
    ]
  },
  {
    "id": "tech-ambiguity",
    "title": "Application Dependencies — Turning Ambiguity into Alignment",
    "card": {
      "c": "Led an ambiguous initiative born from a hard truth: when a critical system went down, the first 20 minutes weren't spent fixing it — they went to figuring out who was even affected. We had dependency data, but in a live incident it was almost useless because it couldn't tell a dead app from a fine one. An app on the payment gateway was dead when the gateway failed — everyone needed on the call. An app on a reporting API kept running when that failed — nobody noticed until someone needed a report. Both were recorded identically as 'dependencies,' so we couldn't separate blast radius from noise. Underneath it, every team meant something different by 'dependency' — and nobody owned what 'critical' actually meant.",
      "a": [
        "Ran workshops across infrastructure, application owners, and risk — each anchored on its own lens (infra saw hosting, app owners saw data flows, risk saw recovery chains). All legitimate, all different — which is exactly why nobody could agree on what mattered",
        "Reframed the question rather than crowning one definition: not 'what are your dependencies,' but 'what decision are you trying to make with this?' That collapsed the three views onto one shared question — what breaks, and how badly — which became the criticality model",
        "Made criticality rules-based, not opinion-based — it couldn't be self-declared, because every owner believes their thing is critical. It was computed against objective criteria (recovery-time requirements, whether it supported a critical business service) and classified into tiers: critical, recovery, partial, no-recovery",
        "Made criticality inherited — an app was critical if something genuinely critical depended on it, traced through the chain; that's the actual blast radius. Owners attested to their dependencies, but the classification was applied uniformly with a reason attached, so it was auditable, not a popularity contest",
        "Decomposed delivery into pods: the taxonomy/criticality model, the data layer, the impact-visualization, and the attestation workflow. (Engineering: PoC'd Neo4j but the ops overhead and thin in-house expertise didn't justify it — pivoted to a Java streaming API + JS graph viz on our existing stack, maintainable by the team we actually had)"
      ],
      "r": "Delivered a system that answered in real time: if this fails, here's the true blast radius and here's who needs to be on the call — critical path separated from noise. During incidents teams assessed real impact in minutes instead of guessing, the right people got on the bridge, and we stopped over-paging teams who weren't affected. Risk teams halved their audit prep because recovery chains were finally accurate. Adopted across 1,300+ critical applications, and it unblocked stalled migration planning as a second-order benefit.",
      "l": "The breakthrough in an ambiguous problem usually isn't building faster — it's reframing the question. Everyone was trying to 'map dependencies'; the real question was 'what breaks when this breaks, and who needs to act?' Anchor on the decision the data must serve and the model falls out — the rest is structured delivery. Alignment on the why comes before architecture.",
      "signals": {
        "c": [
          "**Led an ambiguous initiative** — incidents wasted 20 min finding who's affected",
          "**Why**: dependency data couldn't tell a **dead app from a fine one**",
          "Every team meant something different by 'dependency'; **nobody owned 'critical'**"
        ],
        "a": [
          "Ran **workshops** across infra/app-owners/risk — all legitimate, different lenses",
          "**Reframed the question**: not 'your dependencies' but 'what decision are you making?'",
          "Made criticality **rules-based + inherited** — computed, tiered, **auditable not popularity**"
        ],
        "r": [
          "Real-time **true blast radius** + who's on the call — critical path vs noise",
          "Risk teams **halved audit prep**; impact assessed in **minutes not guessing**",
          "Adopted across **1,300+ critical applications**; unblocked stalled migration"
        ],
        "l": [
          "Breakthrough in ambiguity is **reframing the question**, not building faster",
          "Anchor on **the decision the data must serve** — the model falls out",
          "**Alignment on the why** comes before architecture"
        ]
      }
    },
    "probes": {
      "how did you stop everyone declaring themselves critical": "Criticality wasn't self-declared — every owner believes their thing is critical. Owners attested to their dependencies, but the classification was computed against objective criteria (recovery-time requirements, whether it backed a critical business service) and applied uniformly with a reason attached. Auditable, not a popularity contest.",
      "what do you mean by inherited criticality": "An app inherits criticality from what depends on it, not just what it depends on. If something genuinely critical depends on you, you're critical — traced through the chain. That inheritance is exactly what turns a flat dependency list into true blast radius.",
      "why not neo4j": "The PoC revealed steep operational overhead and limited in-house graph expertise. I pivoted to Java + JS visualization on our existing stack — fast to deliver and maintainable by the team we actually had, rather than parking us on an unsupported island.",
      "how did you keep the data accurate over time": "An attestation workflow — app owners periodically validated or retired their dependencies, so the model stayed trustworthy instead of rotting after the first load.",
      "how does this map to a data platform role": "Same core move: the value isn't the graph, it's modeling the data to serve a real decision. Criticality classification is the metadata that turns raw dependency data into operational intelligence — the ingestion → meaning → consumption arc of a data platform.",
      "how is this different from the TIBCO breakdown story": "TIBCO was about decomposing a known migration into deliverable slices. This was about ambiguity — nobody agreed what the problem even was. The work was defining the question before any decomposition was possible."
    },
    "domains": [
      "data",
      "sre"
    ],
    "questionTypes": [
      "ambiguity",
      "breaking-down-projects",
      "tough-project",
      "blockers"
    ],
    "signals": [
      "handling-ambiguity",
      "leadership-influence",
      "communicating-effectively"
    ]
  },
  {
    "id": "tech-neo4j",
    "title": "Neo4j — The Wrong Tech Call I Owned & Reversed",
    "card": {
      "c": "Lead failure story — the wrong architectural call, owned publicly. Mapping the same complex web of application dependencies for risk and compliance, the problem **screamed 'graph database'** and my instinct said Neo4j was the perfect fit. I knew there was a learning curve — my engineers were strong in Java but new to Cypher, our SREs had never run Neo4j in prod — and I underestimated how steep it was. I bet graph-query power would offset the short-term learning tax, and convinced the team and stakeholders to go with it.",
      "a": [
        "**The failure surfaced at the pilot** — eight weeks into a Neo4j + Java build, we launched to a group of architects and it was a functional failure: brittle, inefficient Cypher, small changes taking days, and operationally no standard monitoring, no backups, no way to triage an out-of-memory event",
        "Missed the first attestation-dashboard deadline; flagged **red** on the quarterly roadmap, stakeholders at my desk asking why a 'simple dependency map' was taking months",
        "**Owned it plainly** — went to my director and stakeholders and said 'I made the wrong architectural call.' Humbling, but it reset trust instead of burning it defending the decision",
        "**Pivoted to a pragmatic stack** — a JavaScript visualization layer on our existing Java + Postgres, the tools the team and SREs could actually run and sustain"
      ],
      "r": "Velocity returned almost overnight — within two sprints we shipped a version that worked, scaled, and finally gave the compliance team the attestation dashboard they needed. Off red.",
      "l": "Moving fast is easy; moving fast in the **right direction** takes deep awareness of your team's capacity, not just a technology's potential. Since then I never adopt new tech without a capability and operational-readiness check — the right solution is the one the org can **sustain, not just admire**.",
      "signals": {
        "c": [
          "**Lead failure story** — wrong architectural call, owned publicly",
          "Problem **screamed 'graph database'** — instinct said **Neo4j** was perfect",
          "Knew Java team **new to Cypher**, SREs never ran it — **underestimated** the tax"
        ],
        "a": [
          "**Failure surfaced at pilot** — 8 weeks in: brittle Cypher, no monitoring/backups",
          "**Owned it plainly**: 'I made the wrong architectural call'",
          "**Pivoted** to JS viz on existing **Java + Postgres** — what the team could sustain"
        ],
        "r": [
          "Velocity returned **almost overnight** — working version **within two sprints**",
          "Gave compliance the **attestation dashboard** they needed",
          "Came **off red** on the quarterly roadmap"
        ],
        "l": [
          "Moving fast is easy; **moving fast in the right direction** is hard",
          "Never adopt new tech without a **capability + operational-readiness check**",
          "Right solution is one the org can **sustain, not just admire**"
        ]
      }
    },
    "probes": {
      "why was Neo4j wrong if a graph fit the problem": "The data model fit — the org didn't. Strong Java team but new to Cypher, SREs who'd never run it in prod, no monitoring or backup story. The graph's power didn't offset the operational and learning tax. Fit is about what the team can sustain, not just the data shape.",
      "wasn't Postgres a step back for graph traversal": "For our traversal depth, recursive CTEs on Postgres were enough — and 'enough on a stack we operate well' beat 'ideal on a stack we couldn't support.' If the depth had truly demanded a graph DB, the lesson would've been to invest in graph readiness first, not adopt one under deadline.",
      "how did you rebuild trust after going red": "By naming the call as mine, fast, and showing recovery in two sprints — not by relitigating the decision. Owning it plainly is what let stakeholders re-engage."
    },
    "domains": [
      "data"
    ],
    "questionTypes": [
      "failure",
      "big-tech-decision",
      "trade-offs"
    ],
    "signals": [
      "growing-continuously",
      "ownership"
    ]
  },
  {
    "id": "conf-kafka-solace",
    "title": "Kafka vs Solace — Earning Alignment in a Divided Room",
    "card": {
      "c": "Modernizing the approval platform off TIBCO, we had to pick a messaging backbone. I proposed Kafka (already hardened here, one less broker, skill reuse); the ARB pushed back hard — Solace was the sanctioned TIBCO replacement with built-in JMS semantics. Half the room with me, compliance and middleware leads against; I needed ~70% approval.",
      "a": [
        "Round 1 — data and diplomacy: side-by-side POC, same workflow on both, measuring latency, ordering, replay integrity, audit traceability. Kafka won on the data… and several members still resisted. One compliance architect: 'impressive, but it doesn't feel audit-safe.' The issue was no longer technical — it was **institutional trust**",
        "Round 2 — met them where their concern lived: mapped every Kafka event flow to **Citi's audit control IDs**, showing exactly how idempotent producers and compaction satisfied SOX/OCC evidence requirements. Turned 'is Kafka risky?' into 'how does Kafka meet our existing controls?'",
        "Invited a Distinguished Engineer (Citi Fellow) for an independent perspective — not to advocate; his presence shifted the room from positions to trade-offs",
        "Proposed a controlled-use model: specific config patterns, post-implementation compliance review per use case, a documented 6-month rollback path to Solace"
      ],
      "r": "Passed with 75%+ approval. First Kafka-based approval flow processed millions of messages monthly with zero data loss and full audit traceability; Kafka became a governed strategic alternative for transactional systems.",
      "l": "Alignment isn't winning consensus — it's earning trust. Translate your argument into the language others trust, invite respected voices to widen confidence, and the outcome feels co-owned, not won.",
      "signals": {
        "c": [
          "Led messaging-backbone pick off **TIBCO**; I proposed **Kafka**",
          "**Why**: ARB pushed back hard — Solace was sanctioned, audit-safe by default",
          "Split room — needed **~70% approval**, compliance/middleware against"
        ],
        "a": [
          "**Ran side-by-side POC** — latency, ordering, replay, audit; **Kafka won on data**",
          "Reframed to **institutional trust**: mapped flows to **Citi audit control IDs**, SOX/OCC",
          "**Invited a Distinguished Engineer** + proposed **6-month rollback** to Solace"
        ],
        "r": [
          "Passed with **75%+ approval**",
          "First Kafka approval flow: **millions of messages/month**, zero data loss",
          "Kafka became a **governed strategic alternative** for transactional systems"
        ],
        "l": [
          "**Alignment is earning trust**, not winning consensus",
          "Translate your case into the **language others trust**",
          "Invite respected voices → outcome feels **co-owned, not won**"
        ]
      }
    },
    "probes": {
      "wasn't the arb right about solace": "Partly — Solace is natively audit-safe and transactional, perfect for deterministic flows. Kafka offers more scalability and openness but needs added observability, RBAC layering, and control mapping to reach audit parity. The controlled-use model priced that in honestly."
    },
    "domains": [
      "data",
      "infra"
    ],
    "questionTypes": [
      "trade-offs",
      "big-tech-decision"
    ],
    "signals": [
      "conflict-resolution",
      "communicating-effectively",
      "leadership-influence"
    ]
  },
  {
    "id": "conf-pod4",
    "title": "Pod 4 — Principal Built a Competing Implementation",
    "card": {
      "c": "One pod was 80% through migrating our event infrastructure — a significant rewrite, done right: architecture review, agreed approach, structured execution. A principal engineer from another part of my org, who needed to integrate with their work, disagreed with the design. Instead of escalating when the disagreement didn't resolve, he wrote a **parallel implementation directly into the same codebase**. At merge time it blew up — two competing implementations, the team in-fighting, the migration deadline at risk. That's when I got pulled in.",
      "a": [
        "**Separated the people problem from the architecture problem** — they needed different interventions",
        "Architecture: brought both parties together and reviewed the trade-off honestly. The principal's design had genuine long-term advantages — **not good-enough-better, actually better** — but the pod's implementation was good, approved, and mostly complete for the migration objective. Replacing it then would optimize for design purity and create delivery risk",
        "People: **protected the pod's autonomy deliberately** — they'd followed every process correctly. Forcing them to abandon a properly-agreed decision for a late challenge would signal org-wide that agreed decisions aren't safe, and teams stop committing to anything",
        "Made the call: ship the pod's working implementation to hit the deadline, and **capture the principal's approach as a documented V2** with the trade-offs, to revise post-deployment. He agreed — 'good enough now, great later' was the right trade",
        "Direct conversation with the principal: challenging design decisions is welcome, especially from seniors — but building a competing implementation to force a decision is not, because it undermines team ownership and creates maintainability risk. Added a lightweight design-review checkpoint for cross-team dependencies so future disagreements surface at the whiteboard, not at merge time"
      ],
      "r": "Migration completed on schedule. The principal's concern wasn't dismissed — it was captured as a formal follow-up with documented trade-offs. The pod kept confidence that agreed decisions wouldn't be overturned late in delivery, and we avoided setting a precedent where parallel implementations become the way to resolve disagreement.",
      "l": "The difference between alignment and agreement: I didn't need everyone to love the decision, I needed everyone to commit to the path. My job wasn't to adjudicate the better design — it was to create the conditions for the team to move with clarity and without resentment. And influence is a skill, not a status: when a senior bypasses it, that's a coaching conversation, not just a process failure.",
      "signals": {
        "c": [
          "Pulled in **80% through** an event-infra migration rewrite",
          "**Why**: a principal disagreed, wrote a **parallel implementation** into the codebase",
          "At merge: two competing builds, **in-fighting, deadline at risk**"
        ],
        "a": [
          "**Separated** the people problem from the architecture problem",
          "Judged honestly: principal's design **better**, but pod's was **approved + complete**",
          "**Made the call**: ship pod's version; capture principal's as documented **V2**"
        ],
        "r": [
          "**Migration completed on schedule**",
          "Principal's concern **captured as formal V2**, not dismissed",
          "Pod kept confidence agreed decisions **won't be overturned late**"
        ],
        "l": [
          "**Alignment ≠ agreement** — needed commitment to the path, not love",
          "My job: **conditions to move with clarity**, not adjudicate best design",
          "**Influence is a skill, not a status** — bypassing it is a coaching conversation"
        ]
      }
    },
    "probes": {
      "was the principal actually right": "Yes — his approach was genuinely better, and I said so. I chose on merit plus pragmatism, not process loyalty: ship the agreed, working version to protect the timeline, and sequence his as a documented V2. Good-enough now, great later.",
      "did you keep the worse design just to hit the deadline": "I kept the working, approved design to hit the deadline — and committed his better one to a real follow-up with documented trade-offs, not a vague 'we'll get to it.' The pod's design wasn't wrong, it was sufficient and complete; his was the upgrade, properly sequenced.",
      "why not just let him win since he was right": "Because the cost wasn't the design — it was the precedent. Overturning a properly-agreed decision for a late parallel implementation tells every team that consensus is provisional and bypassing process works. That damage outlasts any single architecture choice."
    },
    "domains": [
      "infra",
      "general"
    ],
    "questionTypes": [
      "conflict"
    ],
    "signals": [
      "conflict-resolution",
      "leadership-influence"
    ]
  },
  {
    "id": "conf-greg",
    "title": "Backup — Aligning a Gatekeeping Peer (Greg)",
    "card": {
      "c": "Inherited a team with internal friction: a long-tenured peer acted as technical gatekeeper, blocking velocity with vague 'architectural misalignments.' Missed deadlines, leadership losing trust in the department.",
      "a": [
        "Consultative, not combative — initiated an 'Architecture Alignment' series and **invited the peer to lead** the ideal-state standards definition",
        "Translated jargon to business outcomes: 'DB access' became 'mitigating delivery risk for Q3 targets'",
        "Live RACI matrix — verbal 'no's became documented, visible to our director",
        "5-minute acknowledgment rule to kill the unresponsiveness narrative"
      ],
      "r": "Unblocked a database integration stalled for months. 20% velocity increase, director noted the 'reduction in team temperature,' and I reclaimed project intake ownership.",
      "l": "At senior level, transparency is the best antidote to politics — treat an obstructionist as a consultative partner and center on business value, and you move delivery without invoking authority.",
      "signals": {
        "c": [
          "Inherited friction; long-tenured peer was the **technical gatekeeper**",
          "**Why**: blocked velocity with vague 'architectural misalignments'",
          "**Missed deadlines**, leadership losing trust in the department"
        ],
        "a": [
          "**Consultative not combative** — Architecture Alignment series, **invited him to lead** standards",
          "Translated jargon to **business outcomes**: 'DB access' → 'Q3 delivery risk'",
          "**Live RACI matrix** made verbal no's visible; **5-min acknowledgment rule**"
        ],
        "r": [
          "**Unblocked a DB integration** stalled for months",
          "**20% velocity increase**; director noted 'reduced team temperature'",
          "Reclaimed **project intake ownership**"
        ],
        "l": [
          "**Transparency beats politics** at senior level",
          "Treat an obstructionist as a **consultative partner**",
          "Center on **business value** → move delivery without invoking authority"
        ]
      }
    },
    "probes": {},
    "domains": [
      "general"
    ],
    "questionTypes": [
      "blockers",
      "cross-org-conflict"
    ],
    "signals": [
      "conflict-resolution",
      "leadership-influence",
      "communicating-effectively"
    ]
  },
  {
    "id": "conf-sbom",
    "title": "SBOM — Engineering vs the CISO's Security Org (cross-org conflict)",
    "card": {
      "c": "Real friction between engineering and the CISO-led central security org. Developers were getting a flood of vulnerability alerts they couldn't action — mostly from base images and shared libraries they didn't own. Alert fatigue, wasted effort, broken trust, and despite the volume our actual risk posture wasn't improving. Security saw engineering ignoring vulns; engineering saw security as noise. A genuine cross-org standoff where both sides had a valid point.",
      "a": [
        "Reframed the relationship, not just the tooling — from 'send all alerts' to **'vulnerability intelligence as a service'**",
        "Aligned the stakeholders deliberately: partnered with the CISO, platform leads, and other EMs so it was a shared model, not engineering pushing back on security",
        "Built a **streaming graph ownership model**: consumed the raw SBOMs from the CISO's scanners off Kafka, enriched against the internal app catalog and container-registry metadata (base-image layers vs app layers), modelled CVE → Layer → App → Owner",
        "Automated routing on that graph: base-image vulns aggregated to the platform team, app-level vulns to the owning team — so every alert landed on someone who could actually fix it"
      ],
      "r": "92% reduction in unactionable alerts to app teams. MTTR for critical base-image vulns dropped from 45 days to 6. 99% automated ownership mapping, and the CISO got the first accurate dashboard of true risk posture — which is what rebuilt the trust between the two orgs.",
      "l": "A cross-org conflict is rarely resolved by winning the argument — it's resolved by changing the system so both sides get what they actually need. Security needed real risk reduction; engineering needed actionable work. The graph gave both, and the relationship followed.",
      "signals": {
        "c": [
          "Owned the standoff between **engineering and the CISO's security org**",
          "**Why**: devs drowning in **unactionable vuln alerts** from layers they didn't own",
          "Both sides valid — **alert fatigue, broken trust**, risk posture flat"
        ],
        "a": [
          "**Reframed** 'send all alerts' → **'vulnerability intelligence as a service'**",
          "Built a **streaming graph ownership model**: CVE → Layer → App → Owner off Kafka",
          "**Automated routing**: base-image vulns to platform, app vulns to owning team"
        ],
        "r": [
          "**92% reduction** in unactionable alerts to app teams",
          "Critical base-image **MTTR 45 days → 6**; **99% automated** ownership mapping",
          "CISO got first **accurate risk-posture dashboard** → rebuilt trust"
        ],
        "l": [
          "Cross-org conflict resolved by **changing the system**, not winning the argument",
          "Security needed **risk reduction**; engineering needed **actionable work**",
          "Give both what they need → **the relationship follows**"
        ]
      }
    },
    "probes": {
      "wasn't engineering just ignoring security": "No — they were drowning in alerts they couldn't act on, mostly from layers they didn't own. The problem wasn't will, it was routing. Once a vuln landed on the team that could fix it, action followed.",
      "why a graph model": "Because ownership is a chain — a CVE lives in a base-image layer, used by an app, owned by a team. A flat alert list can't express that. The graph let me trace any vuln to its true owner and route automatically instead of broadcasting to everyone.",
      "how did you win the CISO over": "Gave them something they never had — an accurate, real-time view of true risk posture instead of a raw alert count. Security's goal was always risk reduction; I made that measurable, so we were on the same side."
    },
    "domains": [
      "data"
    ],
    "questionTypes": [
      "cross-org-conflict",
      "trade-offs"
    ],
    "signals": [
      "conflict-resolution",
      "communicating-effectively",
      "driving-results"
    ]
  },
  {
    "id": "conf-supervisor",
    "title": "Disagreed With Your Manager — Pushing Back on a Risky Commitment (disagree-and-commit)",
    "card": {
      "c": "For 'a time you disagreed with your manager.' [VERIFY: confirm this maps to a real event, or give me the actual one to swap in.] The version here: under date pressure from above, my director wanted to pull part of the team onto a high-visibility analytics deliverable with a hard external date — before the streaming platform (DRIFT) was stable enough to run unattended. I believed it risked both that delivery and the reliability of a critical system. Real stakes, and the disagreement was up my own chain — so *how* I raised it mattered as much as *what* I was saying.",
      "a": [
        "Raised it **privately first** — in our 1:1, never in the room. Framed it as 'help me pressure-test this,' not 'this is wrong'; disagreeing up the chain has to protect the relationship, not score a point",
        "Brought **data, not opinion** — the incident trend plus a capacity model showing the team couldn't absorb the new scope without the platform slipping below its reliability bar. I quantified the risk instead of asserting it",
        "When we still didn't align, **escalated respectfully** — asked to walk leadership through the trade-off with the numbers, and proposed a **middle path** rather than a flat no: a phased commit with a minimum reliability allocation ring-fenced",
        "**Disagree-and-commit** — leadership weighed it and still chose the date for valid business reasons. I committed fully, delivered it, and used the guardrail I'd negotiated to protect the platform underneath"
      ],
      "r": "We hit the external date **and** held the reliability bar, because the ring-fenced allocation was in place — the risk I'd flagged was real but managed. My director later said the written trade-off was what made the decision defensible upward, and it strengthened the relationship rather than straining it.",
      "l": "Disagreeing with your manager is about channel and posture: raise it privately, make the case with data, propose a path instead of a veto — then once the call is made, commit completely and make it succeed. Being heard isn't the same as getting your way, and the job is to give leadership the best information, then own the outcome together.",
      "signals": {
        "c": [
          "Disagreed up my chain with my director [VERIFY real event]",
          "**Why**: he wanted the team pulled to analytics before **DRIFT** was stable",
          "Real stakes — **how** I raised it mattered as much as what"
        ],
        "a": [
          "**Raised it privately first** in our 1:1 — 'help me pressure-test this'",
          "Brought **data + a middle path** — incident trend, capacity model, ring-fenced reliability",
          "**Disagree-and-commit**: leadership chose the date; I committed fully and delivered"
        ],
        "r": [
          "**Hit the external date AND held the reliability bar**",
          "Ring-fenced allocation meant the **flagged risk was managed**",
          "Written trade-off **made the decision defensible upward**"
        ],
        "l": [
          "Disagreeing up is **channel and posture**: private, data, a path not a veto",
          "**Being heard ≠ getting your way** — then commit completely",
          "Give leadership the **best information**, then **own the outcome together**"
        ]
      }
    },
    "probes": {
      "what if you'd been overruled and it went badly": "I'd documented the risk and the guardrail, so we'd have caught a problem early — and I'd own my part in committing to the plan, not say 'I told you so.' Disagree-and-commit means you share the outcome, not just the warning.",
      "how do you disagree without undermining your manager": "Privately first, never in front of their leadership or my team. I frame it as improving the decision, not challenging authority — and once it's made, I represent it to my team as our plan, not 'their' plan I lost.",
      "what if your manager just said no in the 1:1": "Then I'd ask what would change their mind and whether the data moved it at all — and if the answer was a firm no for reasons I could live with, I commit. I escalate further only when the stakes are genuinely high and I've got new evidence, not just to relitigate."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "disagree-manager"
    ],
    "signals": [
      "conflict-resolution",
      "communicating-effectively"
    ]
  },
  {
    "id": "mgmt-org-design",
    "title": "Org Design — 3 Teams Around the Data Platform Value Stream",
    "card": {
      "c": "How I organize teams around a data platform — directly relevant to any large data-platform org. I split the org functionally around value streams so people aren't multitasking across competing priorities.",
      "a": [
        "**Data Ingestion** team — pipelines from sources: Kafka messaging, Flink stream processing, data validation (1 manager, 1 TL, 5 eng, QA; infra architect guiding pipeline scalability)",
        "**Data Services** team — make data useful and accessible: APIs/microservices, data modeling, warehousing, GraphQL (1 manager, 1 TL, 7 eng, QA; data architect shaping schema and serving strategy)",
        "**Platform** team — accelerate the others: core cloud infra, CI/CD, K8s, monitoring/observability (Prometheus, Grafana), developer tooling (1 manager, 1 TL, 5 eng, QA)",
        "Both architects align platform standards across the three; clear missions reduce overlap and raise execution speed"
      ],
      "r": "Clarity and focus per team, high autonomy around value streams, and a model that scales organically as the org grows.",
      "l": "Teams organized around value streams with unambiguous missions beat functional silos — ownership boundaries are the real productivity tool.",
      "signals": {
        "c": [
          "Organized the **data platform** org around **value streams** — a portable pattern",
          "**Why**: people stop multitasking across competing priorities",
          "**3 teams · ~17 engineers** — Ingestion, Data Services, Platform"
        ],
        "a": [
          "**Split Data Ingestion** — Kafka/Flink/validation (**1 mgr, 1 TL, 5 eng, QA**)",
          "**Stood up Data Services** — APIs, modeling, warehousing, GraphQL (**7 eng**)",
          "**Built a Platform team** to accelerate others — infra, CI/CD, K8s, observability"
        ],
        "r": [
          "**Clarity + focus** per team, **high autonomy** around streams",
          "Model **scales organically** as the org grows",
          "**Reduced overlap** → raised execution speed"
        ],
        "l": [
          "Value streams with **unambiguous missions** beat **functional silos**",
          "**Ownership boundaries** are the real productivity tool",
          "Prevent silos via shared architects + **interface contracts**"
        ]
      }
    },
    "probes": {
      "how do you prevent silos between the three": "Shared architects, the tech-lead forum for dependencies, and interface contracts between streams — ownership boundaries with defined hand-offs, not walls."
    },
    "domains": [
      "general",
      "data"
    ],
    "questionTypes": [
      "org-design",
      "growing-team",
      "good-em"
    ],
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  {
    "id": "mgmt-scaling",
    "title": "Scaling the Org Without Adding Managers (Tech-Lead Operating Model)",
    "card": {
      "c": "Org doubled within a year — engineers and contractors across US, Europe, India — and we weren't allowed to add formal managers. Delivery needed structure; hierarchy wasn't an option.",
      "a": [
        "Created a **Tech-Lead Operating Model** — 5 senior ICs as player-coaches, each owning a domain (data platform, cloud infra, ingestion, observability, developer tooling)",
        "Clear swimlanes — ownership boundaries and interfaces so contractors and ICs execute with minimal hand-offs",
        "Bi-weekly Tech Leads Forum — priorities, dependencies, resourcing; effectively a leadership team",
        "Weekly 1:1s coaching each lead on stakeholder management, estimation, conflict resolution — the soft skills managers usually carry",
        "Dashboards + shared OKRs for visibility without micromanagement"
      ],
      "r": "Delivery capacity 2x in under 6 months with zero new management overhead. Tech leads matured into servant leaders — one transitioned to a formal EM role. Contractor output improved because communication flowed through empowered leads. Model adopted as a blueprint by two other orgs.",
      "l": "Leadership isn't titles — it's creating a system where accountability, decision-making, and trust scale faster than hierarchy.",
      "signals": {
        "c": [
          "Org **doubled in a year** — US, Europe, India — no new managers allowed",
          "**Why**: delivery needed structure, hierarchy wasn't an option",
          "Engineers + contractors across **three regions**"
        ],
        "a": [
          "**Created a Tech-Lead Operating Model** — **5 senior ICs** as player-coaches",
          "**Set clear swimlanes** — ownership + interfaces, minimal hand-offs",
          "**Bi-weekly Tech Leads Forum** + weekly **1:1 coaching** on stakeholder/conflict skills"
        ],
        "r": [
          "**Delivery capacity 2x in <6 months**, zero new mgmt overhead",
          "Leads matured into servant leaders — **one became a formal EM**",
          "**Adopted as a blueprint** by two other orgs"
        ],
        "l": [
          "**Leadership isn't titles** — it's a system",
          "**Accountability + trust scale faster than hierarchy**",
          "Pick leads for **judgment + communication**, not just technical depth"
        ]
      }
    },
    "probes": {
      "how did you pick the leads": "Engineers already informally leading — formalized with domain ownership and decision rights. Picked for judgment and communication, not just technical depth.",
      "how do you run distributed teams": "Written culture for decisions, async design reviews, time-zone-aware cadences; the forum bridges the gaps. Set clear outcomes, let people own the how."
    },
    "domains": [
      "infra",
      "data",
      "general"
    ],
    "questionTypes": [
      "scaling",
      "growing-team",
      "good-em",
      "screen-scaling-org"
    ],
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "mgmt-underperformer",
    "title": "Underperformer — Coach Up",
    "card": {
      "c": "Mid-level engineer missing sprint goals, code failing QA, seemingly disengaged — affecting team morale and delivery reliability. Constraint: fix it without creating a culture of fear or micromanagement.",
      "a": [
        "Candid 1:1 — root cause was **low confidence + unclear expectations**, not capability",
        "Co-created a 60-day improvement plan with specific, measurable goals",
        "Paired him with a senior mentor for code review and design help",
        "Weekly check-ins for real-time feedback; celebrated small wins publicly to rebuild confidence"
      ],
      "r": "Defect rate dropped 35%, delivery reliability recovered within two sprints, and he later owned a core service redesign. Team's trust in coaching-based leadership reinforced.",
      "l": "Address the root cause, not the symptom. My filter is 'would I enthusiastically rehire this person?' — if yes, coach up; either way the plan is documented and fair.",
      "signals": {
        "c": [
          "**Coached up** a mid-level engineer missing sprint goals, failing QA",
          "**Why**: hurting **team morale + delivery reliability**",
          "**Constraint**: fix it without fear or micromanagement"
        ],
        "a": [
          "**Ran a candid 1:1** — root cause was **low confidence + unclear expectations**",
          "**Co-created a 60-day plan** with measurable goals",
          "**Paired** him with a senior mentor; weekly check-ins, celebrated small wins"
        ],
        "r": [
          "**Defect rate dropped 35%**, reliability recovered **within two sprints**",
          "He later **owned a core service redesign**",
          "Reinforced the team's **trust in coaching-based leadership**"
        ],
        "l": [
          "**Address the root cause, not the symptom**",
          "My filter: **'would I enthusiastically rehire this person?'**",
          "Either way the plan is **documented and fair** — hard ending ready (90-day PIP)"
        ]
      }
    },
    "probes": {
      "what if they hadn't improved": "I've had that ending: Nate — 90-day SMART-goal PIP with HR (defects 12 → <5/sprint, 3 consecutive complete sprints, 2x weekly pairing), weekly coaching, everything documented, PIP framed as support. At 90 days the data was clear; I made the call to exit, handled it transparently and respectfully. Sprint velocity rose ~20% the next cycle, and the team saw both real support and a real bar."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "underperformance"
    ],
    "signals": [
      "mentorship",
      "ownership"
    ]
  },
  {
    "id": "mgmt-engineer-dev",
    "title": "Developing an Engineer to Senior",
    "card": {
      "c": "A genuinely strong engineer came to me with a vague goal — 'I want to become senior.' He was still operating like an implementer: waiting for direction, escalating risks late, not influencing beyond his assigned work. The mentorship question isn't 'did you help someone' — it's whether you can make 'next level' concrete and create the conditions to practice it.",
      "a": [
        "Used our career framework to make 'senior' concrete — focused it on three behaviors: **ownership, communication, mentoring**",
        "When he struggled with ambiguity and escalated late, introduced a specific operating rhythm: **decision logs, written status updates, pre-reads** before stakeholder meetings",
        "Gave direct feedback right after meetings — especially on **framing trade-offs**, not just implementation detail"
      ],
      "r": "He became the go-to person for that area, led the work, mentored a new joiner, and started influencing design conversations beyond his own team. The broader win: the team got **less dependent on the same few senior people**.",
      "l": "People don't grow from feedback alone — they need a clear picture of the next-level behavior and a real but supported opportunity to practice it. Developing people isn't about one person's promotion; it's about increasing the leadership capacity of the whole team.",
      "signals": {
        "c": [
          "**Developed an engineer to senior** from a vague 'I want to become senior'",
          "**Why**: he still operated as an implementer — late escalations, no influence",
          "The test: make **'next level' concrete** + create room to practice"
        ],
        "a": [
          "**Used the career framework** to make senior concrete — ownership, communication, mentoring",
          "**Introduced an operating rhythm**: decision logs, written status, **pre-reads**",
          "**Gave direct feedback** right after meetings — especially **framing trade-offs**"
        ],
        "r": [
          "Became the **go-to person**, led the work, **mentored a new joiner**",
          "Started **influencing design** beyond his own team",
          "Team got **less dependent on the same few seniors** [VERIFY proxy]"
        ],
        "l": [
          "**Feedback alone doesn't grow people** — need a clear picture + supported practice",
          "**Diagnose the specific gap first**, then build practice around it",
          "Developing people = **growing the team's leadership capacity**"
        ]
      }
    },
    "probes": {
      "how do you adapt this to a different person": "It's individual by design. This engineer needed structure to handle ambiguity. Another might need the opposite — confidence to act and decide without over-checking. I diagnose the specific gap first, then build the practice around it, rather than running everyone through the same program.",
      "how did you measure 'reduced senior dependency'": "[VERIFY: a real proxy — e.g. escalations that used to route to senior ICs now resolved at his level, him owning a domain end-to-end, or review/on-call load redistributing off the top few people. Have one concrete signal ready — an interviewer will ask how you know it dropped.]",
      "what if he hadn't grown into it": "The career framework made the expectations concrete and observable, so it was a fair, documented basis either way — same discipline I'd apply to an underperformer, just aimed at growth rather than recovery."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "developing-people",
      "growing-team",
      "good-em"
    ],
    "signals": [
      "mentorship",
      "leadership-influence"
    ]
  },
  {
    "id": "mgmt-feedback",
    "title": "Hardest Feedback — Senior Engineer Skipping Review / Pod Lead Saying Yes",
    "card": {
      "c": "Two prepared examples for 'hardest feedback you've had to give.' Lead: a senior engineer merging unreviewed PRs to 'save time.' Second: Ankur, a pod lead, saying yes to everything product asked instead of owning the outcome.",
      "a": [
        "**SBI structure**, behavior not character: 'In the last 2 sprints, 3 merges skipped review, increasing risk' — situation, behavior, impact",
        "Listened to the real constraint (reviewer bandwidth) instead of lecturing",
        "Co-designed the fix — review SLA plus a backup-reviewer rotation, so the system absorbed the pressure that caused the shortcut",
        "With Ankur: direct — 'you're an active participant and a stakeholder, not a requirements taker. When requirements come for your pod, I expect you to sit down and push back on outcome, not just feasibility'"
      ],
      "r": "Review backlog cleared, incidents dropped, trust improved across peers. Ankur shifted from order-taker to owner of his pod's outcomes.",
      "l": "Hard feedback lands when it's specific, about behavior, and ends in a co-designed fix — direct and kind are not opposites.",
      "signals": {
        "c": [
          "**Gave the hardest feedback** — senior eng merging **unreviewed PRs** to 'save time'",
          "**Why**: skipping review **increases risk** across the team",
          "Second example: **Ankur**, a pod lead saying yes to everything"
        ],
        "a": [
          "**Used SBI** — behavior not character: **'3 merges skipped review in 2 sprints'**",
          "**Listened to the real constraint** (reviewer bandwidth), didn't lecture",
          "**Co-designed the fix** — review SLA + **backup-reviewer rotation**"
        ],
        "r": [
          "**Review backlog cleared**, **incidents dropped**, trust improved",
          "**Ankur shifted from order-taker to owner** of his pod's outcomes",
          "The **system absorbed the pressure** that caused the shortcut"
        ],
        "l": [
          "Hard feedback lands when **specific, about behavior**, ends in a **co-designed fix**",
          "**Direct and kind are not opposites**",
          "Fix the **system**, not just the person"
        ]
      }
    },
    "probes": {},
    "domains": [
      "general"
    ],
    "questionTypes": [
      "hard-feedback",
      "underperformance",
      "conflict"
    ],
    "signals": [
      "mentorship",
      "communicating-effectively"
    ]
  },
  {
    "id": "mgmt-hiring",
    "title": "Hiring & Onboarding",
    "card": {
      "c": "A common prompt: 'your process for hiring engineers — what qualities?' and 'how do you onboard and integrate people?' We needed to scale the data engineering team fast, but previous hiring had been inconsistent — skill and alignment gaps.",
      "a": [
        "Structured loop: system design for scale, coding for fundamentals, and a **values interview** with scenario-based questions on collaboration and ownership",
        "Trained interviewers on structured scoring rubrics to kill 'gut feel'; multi-interviewer panels each owning a dimension, calibration afterward to minimize bias",
        "Technical bar = problem-solving depth, not tool checklists — can they reason about scale, trade-offs, design? Culture = alignment with values (collaboration, accountability, openness), not 'being like us'",
        "Widened sourcing pools, balanced panels, assessed inclusivity in answers (how candidates collaborate in distributed teams)",
        "Sell the vision — top candidates are courted; I invest time on mission",
        "Onboarding: [VERIFY: your actual onboarding practice — buddy system? first-PR-in-week-one? 30/60/90 plans? The doc only has reference links here]"
      ],
      "r": "Built a 25+ engineer org both technically strong and diverse, with a 90%+ offer acceptance rate. The mix of perspectives directly improved design discussions and innovation velocity.",
      "l": "Hire people who raise the bar technically while strengthening team culture — and make the process structured enough that you'd reach the same decision twice.",
      "signals": {
        "c": [
          "Owned **hiring + onboarding** to scale data engineering fast",
          "**Why**: prior hiring **inconsistent** — skill & alignment gaps",
          "Scaling a **25+ engineer** org"
        ],
        "a": [
          "Built a **structured loop**: system design, coding, **scenario-based values interview**",
          "Trained interviewers on **scoring rubrics** to kill **gut feel**; calibration",
          "Bar = **problem-solving depth** not tools; **culture-add = values** not 'like us'"
        ],
        "r": [
          "Built a **25+ engineer** org — technically strong **and diverse**",
          "**90%+ offer acceptance** rate",
          "Mix of perspectives lifted **design discussions & innovation velocity**"
        ],
        "l": [
          "Hire people who **raise the bar** technically *and* culturally",
          "Make it **structured enough to reach the same decision twice**",
          "[VERIFY onboarding — buddy / first-PR / 30-60-90]"
        ]
      }
    },
    "probes": {
      "a hiring mistake you made": "[VERIFY: have one real example ready — the question is on their list. The misjudged-engineer story can flex here if framed as an assessment mistake caught early.]"
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "hiring",
      "growing-team"
    ],
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "mgmt-playbook",
    "title": "Manager Playbook — Operating Model (reference: hire → onboard → strategy → execution)",
    "card": {
      "c": "Reference card — how I run a team across the full lifecycle, not a single story. Four areas: recruitment & hiring, onboarding, strategic value, and execution & delivery. Glance and pull the 2-3 points that answer the actual question.",
      "a": [
        "**Recruitment & Hiring**: define clear roles & responsibilities; source through active sourcing + referrals; standardize interviews; scorecard evaluation; sell the vision; regular 1:1s",
        "**Onboarding**: hardware ready and good to go; welcome email + what-to-do; startup buddy assigned; invite to team cadences",
        "**Strategic Value**: translate business to tech (high-level OKRs to a clear tech vision/roadmap); strategic planning — partner closely with product, drive annual planning; develop your 'WHY' clearly; lead design reviews + architecture principles",
        "**Execution & Delivery**: project management (Agile); remove blockers; technical quality; SRE & operational excellence; communicate upward and sideways; drive innovation"
      ],
      "r": "A repeatable operating model — hire well, onboard fast, connect every team's work to strategy, and execute with quality and reliability.",
      "l": "It's a checklist to glance at, not a script to recite — name the 2-3 areas that fit the question and go deep on those.",
      "signals": {
        "c": [
          {
            "b": "**Recruitment & Hiring**",
            "sub": [
              "Define clear **roles & responsibilities**",
              "**Source** — active sourcing + **referrals**",
              "**Standardize interviews**",
              "**Scorecard** evaluation",
              "**Sell the vision**",
              "Regular **1:1s**"
            ]
          }
        ],
        "a": [
          {
            "b": "**Onboarding**",
            "sub": [
              "**Hardware ready** & good to go",
              "**Welcome email** + what-to-do",
              "**Startup buddy** assigned",
              "Invite to **team cadences**"
            ]
          }
        ],
        "r": [
          {
            "b": "**Strategic Value**",
            "sub": [
              "**Translate business to tech** — high-level OKRs to a clear tech **vision/roadmap**",
              "**Strategic planning** — partner with product, drive **annual planning**",
              "Develop your **'WHY'** clearly",
              "Lead **design reviews + architecture principles**"
            ]
          }
        ],
        "l": [
          {
            "b": "**Execution & Delivery**",
            "sub": [
              "**Project management** — Agile",
              "**Remove blockers**",
              "**Technical quality**",
              "**SRE & operational excellence**",
              "Communicate **upward and sideways**",
              "**Drive innovation**"
            ]
          }
        ]
      }
    },
    "probes": {
      "what's your management style": "A servant-leadership operating model: I set clear direction and the 'why', then remove blockers and protect quality. I hire for problem-solving depth and culture-add, onboard fast with a buddy and clear first steps, connect every team's work to strategy via OKRs, and run delivery on Agile with strong SRE/operational discipline."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "manager-playbook"
    ],
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  {
    "id": "mgmt-trust",
    "title": "Team Trust — Burned-Out Team & New-Team Integration (mini-stories)",
    "card": {
      "c": "Two short stories for morale/trust questions. (1) After a failed release, morale was low and engineers avoided speaking up. (2) Separately: took over a legacy platform team openly skeptical of new management.",
      "a": [
        "Burned-out team: retros focused on 'what we learned,' not 'who failed'; shared my own mistakes first; invited every member to speak; thanked early risk-callouts; instituted no-blame postmortems",
        "New team: intro 1:1s to understand frustrations, **fixed one persistent blocker in week one**, made workload visible with Kanban"
      ],
      "r": "Burned-out team: engagement scores rose within 2 sprints; proactive risk-flagging cut late issues ~30%. New team: two quick wins earned trust — team NPS went from -20 to +45 in one quarter.",
      "l": "Psychological safety is built through modeled vulnerability and visible follow-through, not slogans. 'Culture is what happens when you aren't in the room' — I build runbooks, golden paths, and safe-deploy patterns so high standards and safety persist when I'm on vacation.",
      "signals": {
        "c": [
          "Two trust stories: **burned-out team** post-failed-release + **skeptical legacy team**",
          "**Why**: low morale, engineers **avoided speaking up**",
          "New team **openly skeptical** of new management"
        ],
        "a": [
          "Ran **no-blame postmortems** — shared **my own mistakes first**",
          "**Thanked early risk-callouts**; invited every member to speak",
          "New team: **fixed one persistent blocker week one**, made work visible via Kanban"
        ],
        "r": [
          "Engagement rose in **2 sprints**; proactive risk-flagging **cut late issues ~30%**",
          "New team **NPS −20 → +45** in one quarter",
          "**Two quick wins** earned trust"
        ],
        "l": [
          "**Safety = modeled vulnerability + visible follow-through**, not slogans",
          "'**Culture is what happens when you aren't in the room**'",
          "Build **runbooks, golden paths, safe-deploy** so standards persist"
        ]
      }
    },
    "probes": {},
    "domains": [
      "general"
    ],
    "questionTypes": [
      "motivating-team",
      "culture-impact",
      "good-em"
    ],
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "mgmt-backlog",
    "title": "Competing Priorities — Urgent Request Mid-Migration (.NET/TIBCO → AWS/Solace)",
    "card": {
      "c": "During a major migration at Citi, my team was moving a critical approval-workflow platform off legacy .NET + TIBCO EMS to a cloud-native AWS + Solace architecture — a firm enterprise deadline because the legacy messaging was being retired globally, and the platform fed approval flows used by multiple downstream apps. Midway through, a product partner brought an urgent, business-critical request to change part of the approval workflow. Building it into the legacy stack would slow the migration, add functionality we'd later have to re-migrate, and raise cutover risk.",
      "a": [
        "I brought product, engineering leads, and the dependent application team together to **separate real urgency from perceived** — the actual business impact, deadline, affected users, workflow volume, and whether acceptable workarounds existed",
        "Rather than a binary 'stop the migration vs reject the request,' I **framed three options**: (1) build it in the legacy .NET/TIBCO stack — fastest local delivery, but more legacy debt; (2) pause the migration and rebuild the full capability on the new platform — cleaner, but misses the product timeline; (3) treat the request as a **migration slice** — implement it behind the new API façade and route only that affected workflow through the new AWS/Solace path while the rest of the migration continued",
        "I **recommended option 3** — it met the urgent business need while still moving us off legacy. I narrowed scope, documented what was explicitly out of scope, and **split the team**: a small squad on the urgent workflow slice, the rest on core migration (broker config, infra automation, message patterns, operational readiness)",
        "Added a **governance checkpoint before cutover** — audit logging, replay behavior, fallback handling, and runbooks all in place"
      ],
      "r": "We delivered the urgent product change without derailing the broader migration — and avoided adding new functionality to the legacy stack, instead using the request to prove out the new migration pattern. That first AWS-backed approval workflow shipped in ~12 weeks; it gave other teams confidence in the Strangler Fig approach, reduced the perceived risk of the migration, and created a repeatable pattern for moving additional approval flows — contributing over time to fewer incidents, improved latency, and a smoother path off the legacy TIBCO platform.",
      "l": "Competing priorities are rarely solved by simply saying yes or no. My role as an engineering leader is to make the tradeoffs visible, separate real urgency from perceived urgency, and create options that satisfy near-term business needs without compromising long-term architecture.",
      "signals": {
        "c": [
          "**Competing priorities mid-migration** at Citi: approval platform **.NET + TIBCO → AWS + Solace**",
          "**Firm deadline** — legacy messaging retired globally; platform feeds **multiple downstream apps**",
          "Mid-migration, a product partner brought an **urgent change** — building it in legacy = **more debt + cutover risk**"
        ],
        "a": [
          "**Separated real urgency from perceived** — got product / eng / dependent team in a room: impact, deadline, users, volume, workarounds?",
          {
            "b": "**Framed three options, not a binary**:",
            "sub": [
              "**1. Build in legacy .NET/TIBCO** — fastest, but more legacy debt",
              "**2. Pause & rebuild on the new platform** — cleaner, but misses the timeline",
              "**3. Treat it as a migration slice** — behind the new API façade, route only that workflow through **AWS/Solace**"
            ]
          },
          "**Recommended option 3** — met the need and moved off legacy; narrowed scope, documented out-of-scope, **split the team** (squad on the slice, rest on core migration)",
          "Added a **governance checkpoint before cutover** — audit logging, replay, fallback, runbooks"
        ],
        "r": [
          "Delivered the urgent change **without derailing the migration** — and **added nothing to the legacy stack**",
          "First AWS-backed approval workflow in **~12 weeks** — proved the **Strangler Fig** pattern, cut perceived migration risk",
          "Became a **repeatable pattern** → fewer incidents, better latency, smoother exit from legacy TIBCO"
        ],
        "l": [
          "**Competing priorities aren't solved by yes/no**",
          "My job: **make the tradeoffs visible**, separate **real vs perceived urgency**",
          "**Create options** that meet near-term needs **without compromising long-term architecture**"
        ]
      }
    },
    "probes": {
      "why option 3 and not just build it in legacy": "Option 1 was fastest, but every line added to .NET/TIBCO was something we'd have to re-migrate and re-test — more legacy debt and more cutover risk on a platform being globally retired. Option 3 met the same deadline AND advanced the migration, turning an interrupt into a proof point for the new pattern.",
      "how did you split the team without losing momentum": "A small squad ring-fenced on the urgent slice with explicit, documented scope; the rest stayed on core migration (broker config, infra automation, message patterns, operational readiness). Clear out-of-scope boundaries kept the slice from sprawling, and the pre-cutover governance checkpoint (audit logging, replay, fallback, runbooks) gated go-live so we never traded speed for risk."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "competing-priorities",
      "trade-offs",
      "conflict"
    ],
    "signals": [
      "conflict-resolution",
      "communicating-effectively",
      "driving-results"
    ]
  },
  {
    "id": "mgmt-backlog-health",
    "title": "Backlog Health & Roadmap Realism",
    "card": {
      "c": "Two-part prepared answer: the philosophy of keeping a roadmap honest, plus a story of re-prioritizing against a PM. Story: CAI portal modernization — roadmap prioritized backend migration + UI polish, but usage data showed search was the #1 cause of internal churn.",
      "a": [
        "Roadmap realism: start from a **capacity model** based on real velocity — never plan at 100%; bake in support, on-call, unplanned work. **De-risk early** — spikes or walking skeletons on anything uncertain, dependencies mapped before locking timelines. Treat the roadmap as a **living artifact** — re-forecast every two weeks; surface shifts early rather than deliver a surprise late",
        "The story: gathered evidence (tickets, NPS, analytics — search frustration = #1 churn cause), built a lightweight search-relevance POC ('showed, didn't tell')",
        "Acknowledged the PM's valid delivery concerns, reframed around the shared goal — customer retention, not internal milestones",
        "Compromised: re-sequenced — search earlier, minor UI milestone pushed one sprint; communicated the trade-off to leadership"
      ],
      "r": "Search success rate +40%, ease-of-use satisfaction jumped, leadership called it the most impactful roadmap adjustment that quarter.",
      "l": "Customer data guides the backlog; prioritization debates should be about evidence, not opinions. RICE + impact-effort when it's contested; 'here's what we'd drop' to make trade-offs visible.",
      "signals": {
        "c": [
          "Owned **roadmap realism** + a **re-prioritization vs PM** story",
          "**Why**: roadmap had backend/UI, but **search = #1 internal churn**",
          "**CAI portal** modernization"
        ],
        "a": [
          "**Capacity model** on real velocity — never plan **100%**; **re-forecast every 2 weeks**",
          "**Gathered evidence** (tickets, NPS, analytics); built a **search POC** — showed, didn't tell",
          "**Reframed** around the shared goal — retention; **re-sequenced** search earlier"
        ],
        "r": [
          "**Search success +40%**, ease-of-use satisfaction jumped",
          "Leadership called it the **most impactful roadmap adjustment** that quarter",
          "UI milestone slipped **one sprint** — trade-off communicated"
        ],
        "l": [
          "**Customer data guides the backlog** — evidence over opinions",
          "Use **RICE + impact-effort** when contested",
          "Show '**here's what we'd drop**' to make trade-offs visible"
        ]
      }
    },
    "probes": {
      "how do you measure team productivity": "DORA layered with business/operational metrics — never lines of code. Daily: blockers, CI/CD, incidents. Weekly: lead time, deploy frequency. Monthly: change failure rate. Plus say/do ratio — plan 50, deliver 20 is a planning problem, not a people problem. Goal: find where the system is blocked, not make people work harder."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "backlog-health",
      "roadmap"
    ],
    "signals": [
      "driving-results",
      "communicating-effectively"
    ]
  },
  {
    "id": "mgmt-ktlo",
    "title": "Keeping the Lights On — Reliability Allocation on a Drifting Pipeline",
    "card": {
      "c": "A pipeline my team owned, feeding critical downstream systems, had drifted into near-perpetual incidents — schema changes kept breaking jobs, the team was spending roughly half its time on data-freshness issues, and analysts had started building their own shadow copies because they'd lost trust. I had to stop the bleeding without telling leadership the roadmap was frozen.",
      "a": [
        "**Made the problem measurable first** — tracked interrupt load and categorized the incidents; the data showed ~70% traced to a handful of pipelines with insufficient data-quality checks and feeble upstream contracts",
        "**Carved out a fixed 30% reliability allocation** and pointed it at the highest-leverage fix — planned capacity, not leftovers",
        "**Kept stakeholders carried along** — every week, framed the cost of inaction: 'here's the trust and rework cost of not doing this'"
      ],
      "r": "Within a quarter, pipeline incidents dropped by more than half, we hit the freshness SLA consistently, and the shadow copies went away — trust came back.",
      "l": "Under-investing in KTLO doesn't just hurt reliability — it kills feature velocity, because neglected systems generate more incidents and more interruptions. So I frame reliability investment as something that defends throughput, not something that competes with it.",
      "signals": {
        "c": [
          "Owned a pipeline feeding **critical downstream systems** — drifted into **near-perpetual incidents**",
          "Schema changes kept breaking jobs; team spent **~half its time** on data-freshness issues",
          "Analysts built **shadow copies** — they'd lost trust"
        ],
        "a": [
          "**Made it measurable first** — tracked interrupt load, categorized incidents → **70% traced to a few pipelines** (weak data-quality checks, feeble upstream contracts)",
          "**Carved out a fixed 30% reliability allocation** → the highest-leverage fix (planned, not leftovers)",
          "**Carried stakeholders along** — weekly: **'here's the trust + rework cost of not doing this'**"
        ],
        "r": [
          "Pipeline incidents **down >50%** in a quarter",
          "Hit the **freshness SLA** consistently",
          "**Shadow copies went away** — trust came back"
        ],
        "l": [
          "Under-investing in KTLO **kills feature velocity too**, not just reliability",
          "I frame reliability as **defending throughput**, not competing with it"
        ]
      }
    },
    "probes": {
      "how did you decide on 30%": "Not a magic number — I sized it to the measured interrupt load. ~70% of incidents traced to a few pipelines, so 30% capacity aimed at those was enough to bend the curve without freezing the roadmap. The point was making it a planned, protected line item, not leftovers.",
      "how did you sell pausing features": "I never framed it as pausing features — I framed reliability as defending throughput. Every week of inaction had a quantified trust + rework cost (the shadow copies, the perpetual interrupts eating half the team). Stakeholders chose it once the cost of NOT doing it was visible."
    },
    "domains": [
      "general",
      "data"
    ],
    "questionTypes": [
      "operational-balance",
      "results"
    ],
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  {
    "id": "mgmt-velocity",
    "title": "High-Velocity Delivery & Stakeholder Communication (Chaotic Team → 35% Faster)",
    "card": {
      "c": "Stepped into my current group mid-project to find a chaotic environment. Communication with business partners was broken — they weren't getting updates and progress felt opaque. Internally the engineering team lacked clarity and direction. Things were basically stuck. Managing in a 'high-velocity environment' is the goal — this is how I CREATE velocity when I inherit chaos, rather than just inherit it.",
      "a": [
        "Stakeholder alignment: a stakeholder mapping pass — power/interest grid — so I knew how much detail each audience needed and could tailor cadence and depth; documented in a stakeholder register",
        "Internal clarity: introduced a RACI model, facilitating workshops with our team and partner functions to map every key deliverable to a clear Responsible and Accountable owner — eliminated duplicated work and ambiguity immediately",
        "Prioritization: RICE scoring + impact-effort matrices; the team decomposed features for accurate estimates and I facilitated trade-off discussions with product and design",
        "Engineering velocity: identified code review as the major bottleneck → Meta's 2-2-2 method (PRs ≤200 lines, ≤2 reviewers, 2-day turnaround), plus TDD + CI for fast feedback from our own system"
      ],
      "r": "Delivery cycle cut 35%. More importantly, re-established trust and confidence with business stakeholders; internal morale and execution speed rose. [VERIFY: the '~20% improved stakeholder communication' figure — you flagged this needs a real measurement basis. Pick one proxy you can defend: e.g. stakeholder pulse-survey score, drop in unplanned clarification meetings, or on-time update-delivery rate.]",
      "l": "Velocity comes from removing ambiguity, not adding pressure. Map the stakeholders, clarify ownership, attack the delivery bottleneck — then clear processes let talented people do their best work.",
      "signals": {
        "c": [
          "Stepped into a **chaotic group mid-project** — progress opaque, stuck",
          "**Why**: stakeholder comms broken, **team lacked clarity & direction**",
          "How I **create velocity** when inheriting chaos"
        ],
        "a": [
          "**Mapped stakeholders** — power/interest grid — tailored cadence & depth",
          "Introduced **RACI** — every deliverable a clear owner, killed duplicated work",
          "Attacked the **code-review bottleneck**: Meta **2-2-2** (≤200-line PRs, 2-day SLA) + TDD/CI"
        ],
        "r": [
          "**Delivery cycle cut 35%**",
          "**Re-established trust** with business stakeholders",
          "[VERIFY '~20% comms improvement' — needs defensible proxy]"
        ],
        "l": [
          "**Velocity from removing ambiguity**, not adding pressure",
          "**Map stakeholders, clarify ownership, attack the bottleneck**",
          "Clear process **lets talented people do their best work**"
        ]
      }
    },
    "probes": {
      "how did you measure the communication improvement": "[VERIFY — you flagged this. Strongest defensible proxies: a before/after stakeholder pulse survey, the drop in unplanned 'where are we?' clarification meetings, or the on-time rate of committed status updates. Have ONE concrete basis ready — a peer EM will ask how you know it was 20%.]",
      "what was the single biggest lever": "Two: the code-review bottleneck was the fastest unlock — 2-2-2 took reviews from a multi-day stall to a 2-day SLA. And RACI removed the ownership ambiguity that was quietly stalling every decision.",
      "how does this map to a high-velocity environment": "Managing in a high-velocity environment is the goal; this is the playbook for when you inherit the opposite: structure the communication, clarify ownership with RACI, and surgically remove the delivery bottleneck. Velocity is created, not assumed."
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "results",
      "good-em",
      "roadmap"
    ],
    "signals": [
      "communicating-effectively",
      "driving-results"
    ]
  },
  {
    "id": "mgmt-inclusive",
    "title": "Collaborative, Inclusive Teams + Innovation Culture",
    "card": {
      "c": "Globally distributed org — quieter engineers, often from underrepresented groups, struggled to be heard in design discussions. We were losing good ideas and inclusivity simultaneously. (The team I inherited was one giant team where a few seniors did all the deciding.)",
      "a": [
        "Rotating meeting leads — not just the loudest voices running discussions",
        "Design reviews include **written async input** — global members contribute on equal footing",
        "Partnered with HR: diverse interview panels, anonymized resume screening",
        "Mentorship pairings: junior engineers from underrepresented groups with senior ICs"
      ],
      "r": "+25% on 'I feel my opinions are valued.' Diverse hiring improved year over year, retention up, quieter engineers started driving key features. Org earned a 'safe, inclusive, high-performance' reputation.",
      "l": "Inclusion is meeting mechanics, not a program — change who speaks, who reviews, who gets coached, and culture follows.",
      "signals": {
        "c": [
          "**Globally distributed** org — quieter engineers struggled to be heard",
          "**Why**: **losing good ideas and inclusivity** at once",
          "Inherited **one giant team**, few seniors deciding everything"
        ],
        "a": [
          "**Rotated meeting leads** — not just the loudest voices",
          "Added **written async input** to design reviews — global equal footing",
          "Partnered HR: **diverse panels, anonymized screening**; mentorship pairings"
        ],
        "r": [
          "**+25% on 'my opinions are valued'**",
          "Diverse hiring up YoY, **retention up**, quieter engineers **driving key features**",
          "Earned a **'safe, inclusive, high-performance'** reputation"
        ],
        "l": [
          "**Inclusion is meeting mechanics, not a program**",
          "Change **who speaks, who reviews, who gets coached**",
          "**Culture follows** the mechanics"
        ]
      }
    },
    "probes": {
      "how do you foster innovation": "Biweekly 'innovation spikes' — alternating Fridays, success measured by learning velocity, failed demos celebrated, framed to product leadership as strategic investment. One spike became a GraphQL prototype cutting redundant REST calls 50%+; grew into a formal API modernization initiative. (Inspiration: a prior employer's 'Take Initiative' week.) The win was cultural: the team moved from 'what's the easiest way' to 'what's the best way.'"
    },
    "domains": [
      "general"
    ],
    "questionTypes": [
      "culture-impact",
      "growing-team",
      "good-em"
    ],
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "nar-pitch",
    "title": "Elevator Pitch — past / present / future",
    "card": {
      "c": "Framing: who you are → what you're working on now (the hot stuff) → end tied to what THIS team is looking for. Write the exact words and rehearse until the first minute is nailed — confidence is something you put on.",
      "a": [
        "Present: SVP / Engineering Group Manager at Citi, leading a 20-person global org (US, Europe, India) building data platforms and large-scale cloud modernization — systems processing high-volume event data across regions",
        "Hot stuff: DRIFT — 2B records/day from 300 sources, 6 hours → under a minute (Kafka/Flink/Iceberg); SCOUT — ML platform on that foundation, real-time inference in 110ms, recurring incidents down 40%",
        "Past: [INSERT: one sentence on a prior role — e.g. 'EM in Dublin, 10 engineers, infra' or 'blockchain L2 rollups lead']",
        "Personal thread: I enjoy mentoring and growing people — moved to management because I'm motivated by the outcome, and the way to maximize it is being a force multiplier for a team",
        "Close on them: '[COMPANY/TEAM]'s mission — [their stated mission] — is what I've spent the last four years building. That's why I'm here.'"
      ],
      "r": "Under 90 seconds. Sets DRIFT as the stage for the 'most impactful project' follow-up you want.",
      "l": "You have the floor — own it, don't shrink.",
      "signals": {
        "c": [
          "Arc: **who I am → what I'm building now → tie to this team**",
          "Lead with **present + hot stuff**, close on **the team's mission**",
          "**First minute nailed** — exact words, rehearsed, own the floor"
        ],
        "a": [
          "Present: **SVP / Eng Group Mgr at Citi**, **20-person** global org (US/EU/India)",
          "Hot stuff: **DRIFT** — 2B/day from 300 sources, 6h → **<1min**; **SCOUT** — 110ms, incidents **−40%**",
          "Thread: moved to mgmt to be a **force multiplier**; close — **their mission is what I've built**"
        ],
        "r": [
          "**Under 90 seconds** — tight and confident",
          "Sets up **DRIFT** as the 'most impactful project' follow-up",
          "[VERIFY: prior-role framing — one sentence]"
        ],
        "l": [
          "**You have the floor — own it, don't shrink**",
          "Confidence is **something you put on**",
          "Land the **close on them**, not just on me"
        ]
      }
    },
    "probes": {
      "why did you become a manager": "I'm technically grounded but motivated by the outcome of the work. I get real energy from helping people accomplish more together than they could alone — I realized acting as a force multiplier was how I'd influence outcomes most. Started as a tech-lead manager earlier in my career; as the teams delivered, scope kept growing, which confirmed the path.",
      "how hands-on are you": "Architecture, design reviews, problem framing — deep enough to lead an ARB debate or an ML design discussion. I don't take the keyboard from my engineers. [VERIFY: phrase to taste]"
    },
    "domains": [
      "screen"
    ],
    "questionTypes": [
      "screen-intro"
    ],
    "signals": [
      "communicating-effectively",
      "driving-results"
    ]
  },
  {
    "id": "nar-why-company",
    "title": "Why This Role / Company",
    "card": {
      "c": "Why [COMPANY], in two things — and it's where I can do both. Setup: I've spent the last few years building data platforms and some AI, but inside a bank — a regulated environment where my data serves control and compliance, a supporting function.",
      "a": [
        "**1. Here, data and AI ARE the product** — [COMPANY: how data/AI directly serves the core business and customers at scale]. I want to do this work where it's the core of the business, not a supporting function — owning the E2E data lifecycle, ingestion to consumption, exactly the shape of what I've built, at larger scale",
        "**2. I want to move fast and see the impact of what I build reach real customers quickly** — the tightest loop between data work and customer impact, versus the slower cadence of regulated finance",
        "Experimentation fits both: I've lived the rollout discipline on SCOUT and run a production A/B pilot, and I want to build the platform version",
        "And I bring regulated-finance rigor — governance, audit, resilience at 99.99% expectations — applied where iteration speed is higher",
        "[INSERT: one genuine personal hook for THIS company — a product/customer story. One real sentence beats three generic ones]"
      ],
      "r": "This team's own framing — 'data foundation that fuels scalable, near-real-time AI and analytics' — reads like a summary of my last four years.",
      "l": "I'm at my best building platforms other teams stand on — ideally at a scale bigger than where I've been.",
      "signals": {
        "c": [
          "**Why [COMPANY] — two things**, and it's where I do **both**",
          "Built **data platforms + AI** the last few years — but **inside a bank**, where data serves **control & compliance**"
        ],
        "a": [
          {
            "b": "**1. Here, data & AI ARE the product**",
            "sub": [
              "At a bank it's a **supporting function** (control, compliance)",
              "[COMPANY: data **directly serves customers at scale**]",
              "I want it at the **core**, not supporting it — own the **E2E data lifecycle** I've built"
            ]
          },
          {
            "b": "**2. Move fast — impact reaches real customers quickly**",
            "sub": [
              "Build & ship where it **reaches real customers fast** — the tightest impact loop",
              "Experimentation fits: I've run a **production A/B pilot**; want the platform version"
            ]
          },
          "I bring **regulated-finance rigor** — governance, resilience — applied where **iteration is faster**"
        ],
        "r": [
          "**Lets me do both** — data/AI at the core, at customer-facing speed",
          "Their framing reads like a **summary of my last four years**"
        ],
        "l": [
          "**At my best building platforms others stand on** — at a **scale bigger than mine**",
          "Close with **one genuine personal hook** — a real product / customer line"
        ]
      }
    },
    "probes": {
      "why leave fintech": "Following the work, not leaving a domain. The data-platform problems I love are bigger and faster-moving at consumer scale, and the impact loop is direct instead of internal.",
      "what do you know about the data org": "[INSERT: their data org's scope — ingestion through consumption, the foundation for near-real-time AI, analytics, and experimentation. Tie it to what you've built.]"
    },
    "domains": [
      "screen"
    ],
    "questionTypes": [
      "screen-why-role"
    ],
    "signals": [
      "domain-expertise",
      "driving-results"
    ]
  },
  {
    "id": "nar-why-leave",
    "title": "Why Leaving Citi",
    "card": {
      "c": "An excellent run — built the platforms, grew the team globally, delivered. After three-plus years the foundational work is done and the team is self-sufficient.",
      "a": [
        "DRIFT is the standard pattern, expanding across domains; the team manages long-lived streaming systems without me",
        "SCOUT is in production and owned by the team",
        "The next layer of leadership is developed — tech leads run independently; one became an EM",
        "I'm looking for the next foundation to build — at consumer scale, where the data directly drives product decisions"
      ],
      "r": "Pull, not push. Nothing at Citi is broken; the mission I signed up for is complete.",
      "l": "Knowing when your foundational work is done and the org thrives without you is itself a leadership skill.",
      "signals": {
        "c": [
          "**An excellent run** — built platforms, grew a global team, delivered",
          "After **3+ years** the **foundational work is done**",
          "**Pull, not push** — nothing is broken"
        ],
        "a": [
          "**DRIFT** is the standard pattern, expanding — team runs it **without me**",
          "**SCOUT** in production, **owned by the team**",
          "**Next leadership layer developed** — leads independent, **one became an EM**"
        ],
        "r": [
          "**Nothing at Citi is broken** — the mission I signed up for is complete",
          "Looking for the **next foundation to build**",
          "At **consumer scale**, where data **directly drives product**"
        ],
        "l": [
          "**Knowing when your foundational work is done** is a leadership skill",
          "The **org thrives without you** — by design",
          "Counter-offer answer: **mission move, not comp**"
        ]
      }
    },
    "probes": {
      "would you take a counter offer": "I've thought about it carefully. What I want — consumer-scale data platforms with experimentation at the core — doesn't exist at Citi. It's a mission move, not a comp negotiation."
    },
    "domains": [
      "screen"
    ],
    "questionTypes": [
      "screen-why-leave"
    ],
    "signals": [
      "growing-continuously",
      "driving-results"
    ]
  },
  {
    "id": "nar-questions",
    "title": "Questions to Ask the Interviewer",
    "card": {
      "c": "Tailor to the interviewer. If they're a peer (not the hiring manager), open a peer-to-peer working conversation. Always cover product direction and tech stack — both covered below.",
      "a": [
        "\"Where is the team today on agentic automation — are agents recommending or acting? How are you thinking about guardrails as autonomy expands?\" (great rapport-builder if it's the interviewer's area)",
        "\"What's the hardest scaling problem in the data foundation right now — ingestion, metrics computation for experimentation, or trust in the analysis layer?\"",
        "\"How does the team divide the E2E lifecycle — ingestion, processing, consumption — and where does this role's team sit relative to yours?\" (tech stack + product direction in one)",
        "\"From your seat as a peer, what would make the person in this role a great partner to your team?\"",
        "\"What separates the EMs who thrive here from the ones who struggle?\""
      ],
      "r": "Pick 2-3 by time and what's already covered. Lead with agentic automation if the technical conversation has gone well.",
      "l": "Peers remember candidates who made the interview feel like a good working session — ask his opinion and engage with the answer.",
      "signals": {
        "c": [
          "He's a **peer Sr. EM** with a hiring voice — **not the hiring manager**",
          "Open a **peer-to-peer working conversation**",
          "Must cover **product direction + tech stack**"
        ],
        "a": [
          "**Agentic automation**: agents **recommending or acting**? Guardrails as autonomy grows?",
          "**Hardest scaling problem** — ingestion, experimentation metrics, or trust in the analysis layer?",
          "How does the team **divide the E2E lifecycle**, and where does **this role sit**?"
        ],
        "r": [
          "**Pick 2-3** by time and what's already covered",
          "**Lead with agentic automation** if the technical talk went well",
          "Peer question: **\"what makes a great partner to your team?\"**"
        ],
        "l": [
          "**Make it feel like a good working session**",
          "**Ask his opinion** and engage with the answer",
          "**\"What separates EMs who thrive here?\"** — invites candor"
        ]
      }
    },
    "probes": {},
    "domains": [
      "screen"
    ],
    "questionTypes": [
      "screen-questions-for-them"
    ],
    "signals": [
      "communicating-effectively",
      "domain-expertise"
    ]
  }
];

const QUESTION_KEYWORDS = {
  "tough-project": [
    "hardest project",
    "most complex",
    "challenging project",
    "toughest",
    "most difficult project",
    "complex project",
    "big project"
  ],
  "deadlines": [
    "deadline",
    "tight timeline",
    "time pressure",
    "crunch",
    "behind schedule",
    "shipped on time"
  ],
  "blockers": [
    "blocked",
    "obstacle",
    "unblock",
    "stuck",
    "impediment",
    "bottleneck"
  ],
  "trade-offs": [
    "trade-off",
    "tradeoff",
    "competing priorities",
    "difficult decision",
    "had to choose",
    "weigh options"
  ],
  "high-stakes-call": [
    "high stakes",
    "production issue",
    "outage",
    "incident",
    "on-call",
    "critical situation",
    "pressure"
  ],
  "roadmap": [
    "roadmap",
    "prioritize",
    "planning",
    "what to build next",
    "sequencing"
  ],
  "failure": [
    "tell me about a failure",
    "biggest mistake",
    "something that didn't work",
    "learned the hard way",
    "setback",
    "went wrong",
    "a time you failed"
  ],
  "big-tech-decision": [
    "technical decision",
    "technology choice",
    "architecture decision",
    "why did you pick",
    "tech stack decision"
  ],
  "scaling": [
    "scaling challenge",
    "scaled the system",
    "team growth",
    "doubled the team",
    "expanded the team",
    "larger team"
  ],
  "innovation": [
    "innovate",
    "creative solution",
    "new approach",
    "improve process",
    "better way to",
    "ran an experiment"
  ],
  "conflict": [
    "conflict with",
    "disagree with",
    "pushback from",
    "tension between",
    "difficult stakeholder",
    "resistance from"
  ],
  "underperformance": [
    "underperform",
    "not meeting expectations",
    "low performer",
    "performance issue",
    "pip",
    "difficult conversation with report"
  ],
  "growing-team": [
    "build a team",
    "hiring for",
    "grew the team",
    "team structure",
    "org design",
    "onboarding"
  ],
  "motivating-team": [
    "motivate the team",
    "team morale",
    "team engagement",
    "inspire the team",
    "burned out team",
    "low energy"
  ],
  "good-em": [
    "what makes a good manager",
    "management style",
    "leadership philosophy",
    "how do you lead",
    "management approach"
  ],
  "culture-impact": [
    "team culture",
    "culture change",
    "psychological safety",
    "inclusion",
    "built a culture"
  ],
  "above-and-beyond": [
    "above and beyond",
    "extra mile",
    "took initiative",
    "beyond your role",
    "stepped up"
  ],
  "results": [
    "measurable outcome",
    "metrics you drove",
    "results you're proud of",
    "biggest achievement",
    "biggest accomplishment"
  ],
  "screen-intro": [
    "tell me about yourself",
    "walk me through your background",
    "introduce yourself",
    "about your experience",
    "your career journey",
    "walk me through your resume",
    "walk me through your cv",
    "tell us about yourself"
  ],
  "screen-why-role": [
    "why this company",
    "why this role",
    "what interests you about",
    "why this position",
    "why are you interested",
    "why come back",
    "why apply",
    "attracted to this role",
    "what drew you",
    "why do you want to work"
  ],
  "screen-why-leave": [
    "why leaving",
    "why are you looking",
    "why move",
    "why change",
    "what's prompting",
    "what brings you here",
    "why leave citi",
    "thinking of leaving"
  ],
  "screen-leadership-scope": [
    "team size",
    "how many people",
    "direct reports",
    "org structure",
    "who reports to you",
    "how big is your team",
    "scope of your role",
    "how many engineers"
  ],
  "screen-sre-depth": [
    "sre experience",
    "reliability engineering experience",
    "observability experience",
    "incident management experience",
    "platform engineering",
    "your sre background",
    "site reliability"
  ],
  "screen-questions-for-them": [
    "do you have any questions",
    "questions for us",
    "anything you want to ask",
    "what would you like to know"
  ],
  "screen-observability": [
    "observability",
    "monitoring",
    "alerting",
    "prometheus",
    "grafana",
    "opentelemetry",
    "dashboards",
    "metrics platform",
    "telemetry platform",
    "how do you monitor"
  ],
  "screen-aiops": [
    "aiops",
    "ml engine",
    "machine learning",
    "predictive",
    "incident prediction",
    "automated remediation",
    "text analytics",
    "servicenow analytics",
    "reduce incidents"
  ],
  "screen-streaming-pipelines": [
    "kafka",
    "flink",
    "streaming",
    "event pipeline",
    "real-time pipeline",
    "data pipeline",
    "event processing",
    "batch to streaming",
    "two billion"
  ],
  "screen-scaling-org": [
    "scaling the org",
    "growing the team",
    "built the team",
    "how did you scale",
    "team structure",
    "operating model",
    "tech lead model",
    "org design at citi"
  ],
  "screen-incident-response": [
    "incident response",
    "postmortem",
    "on-call",
    "production incident",
    "blameless",
    "mttr",
    "incident management",
    "how do you handle incidents",
    "outage response"
  ],
  "screen-cross-functional": [
    "cross-functional",
    "stakeholder",
    "executive communication",
    "working with product",
    "working with security",
    "ctoeac",
    "present to leadership",
    "roadmap presentation"
  ],
  "ambiguity": [
    "ambiguity",
    "ambiguous",
    "unclear requirements",
    "unclear direction",
    "vague",
    "ill-defined",
    "no clear definition",
    "navigate uncertainty",
    "figure out what",
    "undefined problem"
  ],
  "developing-people": [
    "develop",
    "mentor",
    "grow an engineer",
    "help someone grow",
    "coach",
    "promotion",
    "become senior",
    "career growth",
    "adapting your style",
    "different individuals",
    "grow your team members",
    "develop your reports"
  ],
  "experimentation": [
    "a/b test",
    "ab test",
    "canary",
    "experiment",
    "progressive rollout",
    "feature flag",
    "rollout strategy"
  ],
  "breaking-down-projects": [
    "break down",
    "breaking down",
    "subtasks",
    "decompose",
    "manageable pieces",
    "smaller pieces",
    "break things down"
  ],
  "platform-design": [
    "design the data platform",
    "build a data platform",
    "first 90 days",
    "from scratch",
    "first data engineering manager"
  ],
  "org-design": [
    "structure your team",
    "organize your team",
    "team structure",
    "org design",
    "reorganize",
    "how is your team organized"
  ],
  "hard-feedback": [
    "difficult feedback",
    "hard feedback",
    "hardest feedback",
    "tough conversation",
    "critical feedback"
  ],
  "hiring": [
    "hiring",
    "hire engineers",
    "interview process",
    "onboard",
    "onboarding",
    "qualities do you look for"
  ],
  "cross-org-conflict": [
    "cross-org",
    "cross org",
    "cross-team",
    "cross team",
    "another team",
    "another org",
    "different organization",
    "different team",
    "security org",
    "between two teams",
    "between teams",
    "org boundary",
    "other department",
    "central security",
    "two orgs"
  ],
  "competing-priorities": [
    "competing priorities",
    "conflicting priorities",
    "competing demands",
    "competing requirements",
    "conflicting requirements",
    "balance competing",
    "balance priorities",
    "manage competing",
    "urgent request",
    "two things at once",
    "trade off priorities"
  ],
  "backlog-health": [
    "healthy backlog",
    "prioritized backlog",
    "backlog health",
    "roadmap realism",
    "keep a roadmap",
    "roadmap honest",
    "manage the backlog",
    "re-prioritize",
    "reprioritize",
    "prioritize the roadmap",
    "healthy and prioritized",
    "keep your backlog"
  ],
  "operational-balance": [
    "keeping the lights on",
    "keep the lights on",
    "ktlo",
    "run the business",
    "operational load",
    "operational work",
    "tech debt",
    "reliability work",
    "interrupt load",
    "toil",
    "maintenance work"
  ],
  "manager-playbook": [
    "manager playbook",
    "management playbook",
    "operating model",
    "how do you run your team",
    "how do you run a team",
    "how do you operate as a manager",
    "what does a manager do",
    "your approach to managing",
    "responsibilities as a manager",
    "what do you do as a manager",
    "how you manage a team"
  ],
  "disagree-manager": [
    "disagreed with your manager",
    "disagree with your manager",
    "disagreed with your boss",
    "disagree with your boss",
    "push back on your manager",
    "your own manager",
    "your direct manager",
    "disagree with leadership",
    "manager was wrong",
    "disagreed with a decision",
    "boss made a decision"
  ]
};

const FRAMEWORKS = [
  {
    "id": "fw-high-performing-team",
    "questionType": "fw-high-performing-team",
    "definition": "A high-performing team delivers outsized impact through clarity, trust, and accountability — not heroics.",
    "pillars": [
      "Clear ownership and swimlanes — every engineer knows their domain and interfaces",
      "Psychological safety — people raise risks early, not after it's too late",
      "Metrics-driven delivery — DORA metrics, say/do ratio, not hours worked",
      "Coaching culture — 1:1s focused on growth, not status updates",
      "Aligned incentives — team OKRs over individual credit"
    ],
    "storyLink": "mgmt-scaling",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "fw-management-style",
    "questionType": "fw-management-style",
    "definition": "Context-driven leadership — high support for new or ambiguous situations, high autonomy for proven teams.",
    "pillars": [
      "Situational leadership — flex between coaching, directing, and delegating based on team maturity",
      "Default to trust — set clear outcomes, let people own the how",
      "Radical candor — care personally, challenge directly. Never defer hard conversations",
      "Data over gut — use sprint velocity, lead time, and feedback signals to calibrate",
      "Shield and empower — absorb organizational noise so the team can focus on delivery"
    ],
    "storyLink": "mgmt-underperformer",
    "signals": [
      "leadership-influence",
      "mentorship"
    ]
  },
  {
    "id": "fw-scaling-org",
    "questionType": "fw-scaling-org",
    "definition": "Scaling is about building systems that distribute decision-making, not about adding more people.",
    "pillars": [
      "Domain-aligned teams with clear ownership boundaries and minimal cross-team dependencies",
      "Tech Lead operating model — player-coaches who own delivery, not just architecture",
      "Lightweight governance — shared OKRs, bi-weekly forums, visible dashboards",
      "Hiring for slope, not intercept — potential and learning speed over current skill",
      "Written culture — decisions, context, and rationale documented so knowledge scales beyond meetings"
    ],
    "storyLink": "mgmt-scaling",
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  {
    "id": "fw-strategy-to-delivery",
    "questionType": "fw-strategy-to-delivery",
    "definition": "Translating strategy into delivery is about creating line-of-sight — every team sees how its work ladders to the outcome — not cascading targets downward.",
    "pillars": [
      "Start with the outcome and the WHY, not the task — what we're trying to achieve and why it matters",
      "Work backwards from the strategic metric to the operational drivers teams can actually move",
      "Make ownership and line-of-sight explicit — people buy into why targets matter, not the targets themselves",
      "Sequence by business value — deliver where it matters most first; those teams become reference adopters that build momentum",
      "Feedback loops, adapt fast — find root cause when it drifts and adjust the plan rather than letting problems grow",
      "Recognize results — recognition reinforces the behaviors that produced them"
    ],
    "storyLink": "tech-drift",
    "signals": [
      "leadership-influence",
      "driving-results"
    ]
  },
  {
    "id": "fw-operational-balance",
    "questionType": "fw-operational-balance",
    "definition": "Keeping the lights on isn't leftover work — it's a budgeted line item that defends feature velocity, not something that competes with it.",
    "pillars": [
      "Budget KTLO explicitly — a deliberate, planned slice of capacity for operational work, reliability, and tech debt (often 20-30%); the number isn't the point, planning it is",
      "Let data set the dial — SLOs and error budgets: burning the error budget is an objective signal to slow features and invest in reliability",
      "Make the tradeoff visible — frame it for stakeholders as a shared decision: 'if we don't address X, here's the incident / churn / security exposure'",
      "Protect against the death spiral — under-investing in KTLO kills feature velocity too (neglected systems generate more incidents, more interruptions), so reliability investment defends throughput, it doesn't compete with it"
    ],
    "storyLink": "mgmt-ktlo",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  {
    "id": "fw-stakeholder-management",
    "questionType": "fw-stakeholder-management",
    "definition": "Stakeholder management is about creating shared understanding, not managing expectations down.",
    "pillars": [
      "Power/interest mapping — tailor cadence and detail level to each stakeholder's needs",
      "Translate tech to business impact — 'database migration' becomes 'reducing outage risk by 60%'",
      "No surprises rule — surface risks early with mitigation options, not just bad news",
      "RACI on every deliverable — eliminate ambiguity about who decides vs. who's informed",
      "Build trust through small wins — deliver incrementally, show progress, earn credibility for bigger asks"
    ],
    "storyLink": "conf-greg",
    "signals": [
      "communicating-effectively",
      "leadership-influence"
    ]
  },
  {
    "id": "fw-technical-excellence",
    "questionType": "fw-technical-excellence",
    "definition": "Technical excellence means the safe path is the easy path — quality is a system property, not individual discipline.",
    "pillars": [
      "Golden paths and guardrails — opinionated defaults with escape hatches for edge cases",
      "Shift-left everything — policy-as-code in CI/CD, not manual review gates",
      "DORA metrics as compass — deploy frequency, lead time, change failure rate, MTTR",
      "Code review as teaching — PRs are learning opportunities, not gatekeeping",
      "Tech debt as first-class work — budget 20% capacity for platform health, not just features"
    ],
    "storyLink": "terraform-golden-path",
    "signals": [
      "driving-results",
      "ownership"
    ]
  },
  {
    "id": "fw-handling-ambiguity",
    "questionType": "fw-handling-ambiguity",
    "definition": "In ambiguity, alignment comes before architecture — define the 'why' before debating the 'how'.",
    "pillars": [
      "Start with stakeholder intent — 'what decision are you trying to make with this?'",
      "Decompose into knowns and unknowns — build on knowns, spike on unknowns",
      "Time-box exploration — 2-week spikes with clear exit criteria, not open-ended research",
      "Make reversible decisions fast — only slow down for one-way doors",
      "Communicate assumptions explicitly — document what you're betting on and revisit"
    ],
    "storyLink": "tech-ambiguity",
    "signals": [
      "handling-ambiguity",
      "ownership"
    ]
  },
  {
    "id": "fw-prioritization",
    "questionType": "fw-prioritization",
    "definition": "Prioritization is about saying no to good things so you can say yes to the right things.",
    "pillars": [
      "RICE scoring — Reach, Impact, Confidence, Effort. Quantify, don't debate opinions",
      "Cost of delay — what's the business impact of NOT doing this now?",
      "Sequence by dependencies — unblock others first, then parallelize",
      "Say no with data — 'here's what we'd drop to fit this in' makes the trade-off visible",
      "Re-prioritize regularly — weekly triage, not quarterly planning that goes stale"
    ],
    "storyLink": "mgmt-backlog",
    "signals": [
      "driving-results",
      "communicating-effectively"
    ]
  },
  {
    "id": "fw-engineering-culture",
    "questionType": "fw-engineering-culture",
    "definition": "Great engineering culture is where people do the right thing because the environment makes it natural, not because someone's watching.",
    "pillars": [
      "Psychological safety — people experiment, fail, and learn without blame",
      "Inclusive by design — rotating leads, async input, diverse panels",
      "Innovation time — structured spikes, not hackathons and slogans",
      "Blameless post-mortems — fix the system, not the person",
      "Celebrate learning velocity — reward growth and curiosity, not just output"
    ],
    "storyLink": "mgmt-inclusive",
    "signals": [
      "leadership-influence",
      "growing-continuously"
    ]
  },
  {
    "id": "fw-incident-management",
    "questionType": "fw-incident-management",
    "definition": "Incident management is about restoring service first, then learning — never blame.",
    "pillars": [
      "Clear roles on the bridge — incident commander, comms lead, technical responder",
      "Restore first, root-cause later — don't debug while customers are down",
      "Timed leadership updates — every 15 min so they don't disrupt the engineers",
      "Blameless post-mortem within 48 hours — focus on systemic fixes, not who made the mistake",
      "Action items that prevent recurrence — monitoring, automation, runbooks, not 'be more careful'"
    ],
    "storyLink": "kafka-oom",
    "signals": [
      "ownership",
      "leadership-influence"
    ]
  },
  {
    "id": "fw-decision-making",
    "questionType": "fw-decision-making",
    "definition": "Good technical decisions are evidence-based, time-bound, and reversible where possible.",
    "pillars": [
      "One-way vs two-way doors — only slow down for irreversible decisions",
      "Data-driven validation — POC or A/B pilot before committing, not opinion wars",
      "Include operators — the people who run it in production have veto power on operational complexity",
      "Document the decision and alternatives — future you needs to know WHY, not just WHAT",
      "Set exit criteria — define upfront what failure looks like and when to pivot"
    ],
    "storyLink": "conf-kafka-solace",
    "signals": [
      "driving-results",
      "communicating-effectively"
    ]
  }
];

const FRAMEWORK_KEYWORDS = {
  "fw-high-performing-team": [
    "high performing team",
    "great team",
    "what makes a team",
    "team effectiveness",
    "effective team",
    "define a team",
    "build a great team",
    "high performance"
  ],
  "fw-management-style": [
    "management style",
    "management philosophy",
    "how do you manage",
    "leadership style",
    "what kind of manager",
    "what kind of leader",
    "describe your style",
    "your approach to managing"
  ],
  "fw-scaling-org": [
    "scale an org",
    "scaling organization",
    "grow an organization",
    "org scaling",
    "scale engineering org",
    "growing the org",
    "org structure"
  ],
  "fw-stakeholder-management": [
    "manage stakeholders",
    "stakeholder management",
    "work with stakeholders",
    "manage up",
    "align stakeholders",
    "executive communication",
    "manage expectations"
  ],
  "fw-strategy-to-delivery": [
    "translate strategy",
    "strategy into delivery",
    "strategy into operational delivery",
    "strategy to execution",
    "strategy into execution",
    "operational delivery",
    "company strategy",
    "turn strategy into",
    "vision to execution",
    "execute the strategy"
  ],
  "fw-operational-balance": [
    "keeping the lights on",
    "keep the lights on",
    "keeping the light on",
    "lights on",
    "ktlo",
    "run the business",
    "business as usual",
    "operational vs",
    "operational work vs",
    "tech debt vs features",
    "reliability vs features",
    "maintenance vs new",
    "balance operational",
    "balance reliability",
    "balance keeping"
  ],
  "fw-technical-excellence": [
    "technical excellence",
    "engineering excellence",
    "good engineering",
    "quality engineering",
    "define excellence",
    "engineering standards",
    "what does good look like"
  ],
  "fw-handling-ambiguity": [
    "handle ambiguity",
    "deal with ambiguity",
    "approach to ambiguity",
    "navigate uncertainty",
    "unclear requirements",
    "when things are unclear",
    "ambiguous situation"
  ],
  "fw-prioritization": [
    "how do you prioritize",
    "prioritization framework",
    "decide what to work on",
    "competing priorities",
    "prioritize your work",
    "what do you work on first",
    "how to prioritize"
  ],
  "fw-engineering-culture": [
    "engineering culture",
    "team culture",
    "define culture",
    "build culture",
    "what does good culture",
    "healthy culture",
    "culture look like"
  ],
  "fw-incident-management": [
    "incident management",
    "approach to incidents",
    "handle incidents",
    "incident response",
    "on-call philosophy",
    "manage outages",
    "production incidents"
  ],
  "fw-decision-making": [
    "decision making",
    "make decisions",
    "approach to decisions",
    "decision framework",
    "how do you decide",
    "technical decisions",
    "making technical choices"
  ]
};

module.exports = { SIGNALS, CATEGORIES, QUESTION_TYPES, STORIES, QUESTION_KEYWORDS, FRAMEWORKS, FRAMEWORK_KEYWORDS };
