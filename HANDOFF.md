# Handoff

_Last updated: 2026-06-21_

## Where I finished
Restructured the behavioral copilot from company-specific (eBay/Mastercard) into a
**company-neutral, domain-sectioned** bank. All work committed on `main`.

- `main` @ **`9a95d9e`** — neutral bank, current state.
- `ebay` branch @ **`6dcdf4b`** — full pre-refactor eBay-tailored copilot, preserved.
  Run it with `git checkout ebay`.

### What changed
- **One canonical bank:** `dev/behavioral-stories.js` (42 stories, JSON-formatted).
  The eBay-refined stories were folded in as the single neutral version; ids use
  neutral prefixes `tech-/conf-/mgmt-/nar-` (+ survivor ids like `kafka-oom`).
- **Sections (front-end tabs + `domains` tags):** Data · Infrastructure · SRE ·
  Management (`general`) · Narrative (`screen`) · All. Management + Narrative are
  universal; the three technical sections are domain-scoped.
- **`server.js`:** removed `INTERVIEW_PROFILE`/eBay-overlay + Mastercard merge;
  `INTERVIEW_DOMAIN` defaults to `all`; `DEFAULT_INTERVIEW_CONTEXT = null`.
- **Deleted from main** (preserved on `ebay`): `ebay-stories.js`,
  `tech-screen-stories.js`, `pillar-cards.js`, and the company build scripts/pages.
- **`dev/build-all-cards.js`** repointed to the bank → `dev/all-cards.html`
  contact sheet, grouped by section.
- **Employers:** Mastercard (previous) and Citi (current) are real work history and
  stay **named**. Only *target-interview* tailoring was neutralized (eBay/CDT, and
  "the Mastercard JD" job-posting lines → generic). `nar-why-company` /
  `nar-questions` are now `[COMPANY]`/interviewer templates.

## Workflow going forward
**Per-interview tailoring lives on a branch, not on main.** For the next interview:
1. `git checkout -b <company>` from `main`.
2. Set `INTERVIEW_DOMAIN=data|infra|sre` (in env) to scope the live matcher.
3. Fill the `[COMPANY]` / interviewer placeholders in `nar-why-company` &
   `nar-questions`, plus any `[INSERT]`/`[VERIFY]` markers in relevant cards.

## Open / next steps
- [ ] (Optional) Reflow `behavioral-stories.js` from JSON format back to the old
      hand-authored style with section comments — offered, not yet decided.
- [ ] Behavioral grafts: weave beats from ~10 Gergely PDFs (`harvest/GERGELY/`) into
      the neutral bank (carried over from the harvest-cards plan; read stories +
      propose mapping before editing).
- [ ] Author net-new **SRE** stories (this round only re-tagged existing ones:
      kafka-oom, terraform-golden-path, observability, incident-response, sre-mastery,
      app-deps/ambiguity, AIOps/scout).
- [ ] Resolve `[VERIFY]` metric-measurement notes (see the `ebay` branch context).

## Run
`node dev/server.js` → http://localhost:3000/behavioral.html (needs
`ANTHROPIC_API_KEY` + `GEMINI_API_KEY` in env for live classification).
