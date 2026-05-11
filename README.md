# Signals — Agentic Strategic Command Center

> Run product strategy like an **OODA loop**, not an inbox.
> Four AI agents — Scout · Strategist · Architect · Sentinel — observe the
> market, re-rank your roadmap, draft prototypes, and audit them against
> domain rubrics. One loop, four agents, zero noise.

![Stack](https://img.shields.io/badge/TanStack_Start-v1-0B7285)
![React](https://img.shields.io/badge/React-19-149ECA)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![Status](https://img.shields.io/badge/backend-cloud--ready_seam-7C3AED)

---

## Objective

Product and consulting teams operate inside a **Lag Gap**: regulatory
shifts, competitor moves, and threat intel happen faster than internal
research cycles can document them. The result is **Data Blindness**,
reactive decisions, and feature waste.

**Signals** closes that gap. It is a domain-agnostic console that:

1. **Observes** external signals (regulatory, competitive, threat intel) in
   real time.
2. **Orients** your roadmap by autonomously re-ranking features against
   high-intensity signals.
3. **Decides** what to build by drafting technical prototypes through a
   "vibe-to-code" agent.
4. **Acts** with confidence by auditing every artefact against
   domain-specific rubrics (HIPAA, OWASP, ABDM, ISO 27001, …).

The same UI works for Health-Tech, Cybersecurity, or any custom domain — the
business logic is metadata, not code.

---

## How it works

### The four agents

| Agent | Role (OODA) | What it does |
|---|---|---|
| **Scout** | Observe | Ingests external signals, scores intensity 0–10, surfaces vuln windows. |
| **Strategist** | Orient | Re-ranks the roadmap when high-intensity signals overlap with planned features. |
| **Architect** | Decide | Drafts compliant prototypes (FHIR scripts, security patches, API schemas). |
| **Sentinel** | Act / Audit | Scores Architect output against domain rubrics; blocks unsafe ships. |

### A typical mission

```
Scout: SIGNAL_DETECTED       ABDM M3 residency update + Spring4Shell-V2 chatter (intensity 9.2)
Strategist: PRIORITY_SHIFT    Risk 94/100 → "ABDM Identity Vault" elevated to Priority #1
Architect: VIBE_CODING        Drafts FHIR-compliant mitigation script
Sentinel: AUDIT_FAILED        Will-Protocol violation on line 42 ("must" → "will")
Architect: SELF_CORRECTION    Re-submits with Secure Vault logging
Sentinel: AUDIT_PASSED        Clinical faithfulness 100%, security verified — ready for human review
```

Press **Run mission** in `/signals` to watch this play out live: agent
status dots pulse, the mission log streams in, and `/roadmap` re-ranks in
real time.

### Pages

| Route | Purpose |
|---|---|
| `/` | Pick a domain (Health-Tech / Cybersecurity / Custom) |
| `/signals` | Scout's inbox + signal detail + **Mission Control** widget |
| `/roadmap` | Strategist's re-ranked features with delta indicators |
| `/prototypes` | Architect's drafted artefacts |
| `/audits` | Sentinel's pass / warn / fail rubric checks + audit trail |
| `/config` | Domain config — rubrics, compliance standards |

---

## Architecture at a glance

```
React UI ──► useMission hook ──► AgentEngine ──► DataSource (interface)
                                                    │
                                  ┌─────────────────┴─────────────────┐
                              MockDataSource                  SupabaseDataSource
                              (today, in-memory)               (tomorrow, Postgres)
```

The UI never touches storage directly. Every read and write goes through a
single typed `DataSource` interface (`src/lib/data/source.ts`). Today it
returns an in-memory mock; enabling Lovable Cloud swaps in a Postgres-
backed implementation **without touching a single component**.

Full details: see [`architecture.md`](./architecture.md) and
[`workflow.md`](./workflow.md).

---

## Tech stack

- **TanStack Start v1** (React 19, file-based routing, server functions)
- **Vite 7**, edge-deployable (Cloudflare Workers)
- **Tailwind v4** with OKLCH semantic design tokens (`src/styles.css`)
- **shadcn/ui** primitives
- **Lovable Cloud-ready** data layer (drop-in Supabase swap)

---

## Project layout

```
src/
├── routes/                       # File-based routes
│   ├── __root.tsx                # Shell (html/head/body)
│   ├── index.tsx                 # Domain picker
│   ├── signals.tsx               # Scout inbox + Mission Control
│   ├── roadmap.tsx
│   ├── prototypes.tsx
│   ├── audits.tsx
│   └── config.tsx
├── components/
│   ├── mission-control.tsx       # Agent visualiser
│   ├── app-sidebar.tsx
│   └── ui/                       # shadcn primitives
├── hooks/
│   └── use-mission.ts            # Subscribes to AgentEngine events
├── lib/
│   ├── agents/engine.ts          # Pure-TS orchestration engine
│   ├── data/
│   │   ├── types.ts              # Domain entities (the contract)
│   │   ├── source.ts             # DataSource interface + factory
│   │   ├── mock-source.ts        # In-memory implementation
│   │   └── configs.ts            # Seed domain configs / signals / roadmap
│   └── app-store.ts              # Domain + mode context
└── styles.css                    # OKLCH design tokens
```

---

## Local development

```bash
bun install
bun dev
```

Then open http://localhost:5173. No backend setup required — the mock data
source is in-process.

---

## Roadmap

- [x] Mock-backed UI for all five surfaces
- [x] Agent orchestration engine ported from `mayukhg/my-signals-app`
- [x] Cloud-ready `DataSource` seam
- [ ] Enable Lovable Cloud → swap in `SupabaseDataSource`
- [ ] Realtime mission log via `supabase.channel(...)`
- [ ] Public webhook (`/api/public/scout-webhook`) for real Scout ingest
- [ ] Multi-tenant: per-workspace domain configs with RLS

---

## Documentation

- [`architecture.md`](./architecture.md) — frontend, data layer, engine, cloud-swap path
- [`workflow.md`](./workflow.md) — end-to-end flow, agent state machine, demo loop
