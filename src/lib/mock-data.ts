// Mock data shared across pages (UI-only demo)

export type Severity = "critical" | "high" | "medium" | "low";
export type Stage = "observe" | "orient" | "decide" | "act";

export interface Signal {
  id: string;
  title: string;
  source: string;
  agent: "Scout" | "Analyst" | "Architect" | "Sentinel";
  severity: Severity;
  freshness: string;
  weight: number;
  summary: string;
  artifacts?: string[];
}

export const signals: Signal[] = [
  {
    id: "SIG-1042",
    title: "FDA draft guidance: AI-enabled SaMD post-market monitoring",
    source: "FDA.gov",
    agent: "Scout",
    severity: "high",
    freshness: "12m ago",
    weight: 0.82,
    summary:
      "New draft requires continuous performance reporting for AI/ML SaMD. Affects 4 of our roadmap items.",
    artifacts: ["fda-2026-draft.pdf", "delta-vs-2024.md"],
  },
  {
    id: "SIG-1041",
    title: "Competitor Helix raises $48M Series B, doubles down on RPM",
    source: "TechCrunch",
    agent: "Scout",
    severity: "medium",
    freshness: "38m ago",
    weight: 0.51,
    summary: "Pricing pressure expected on remote-monitoring tier within 2 quarters.",
  },
  {
    id: "SIG-1040",
    title: "Spike in 401s on /v2/encounters from EHR partner sandbox",
    source: "Datadog",
    agent: "Scout",
    severity: "critical",
    freshness: "1h ago",
    weight: 0.94,
    summary: "Token rotation likely missed. Sentinel flagged auth scope mismatch.",
  },
  {
    id: "SIG-1039",
    title: "ONC interoperability rule §170.315(g)(10) clarification",
    source: "HealthIT.gov",
    agent: "Scout",
    severity: "medium",
    freshness: "3h ago",
    weight: 0.44,
    summary: "Bulk FHIR export SLAs tighten Q3. Architect drafted prototype.",
  },
  {
    id: "SIG-1038",
    title: "Open CVE in nginx 1.25 — affects 3 prototype envs",
    source: "NVD",
    agent: "Sentinel",
    severity: "high",
    freshness: "5h ago",
    weight: 0.71,
    summary: "Patch available. Auto-PR drafted.",
  },
];

export interface RoadmapItem {
  id: string;
  title: string;
  prevRank: number;
  newRank: number;
  delta: number;
  reason: string;
  pinned?: boolean;
}

export const roadmap: RoadmapItem[] = [
  { id: "RM-12", title: "Continuous SaMD performance dashboard", prevRank: 5, newRank: 1, delta: +4, reason: "FDA draft guidance SIG-1042" },
  { id: "RM-04", title: "Token rotation hardening for EHR connectors", prevRank: 8, newRank: 2, delta: +6, reason: "Auth incident SIG-1040" },
  { id: "RM-09", title: "Bulk FHIR export SLA tier", prevRank: 6, newRank: 3, delta: +3, reason: "ONC clarification SIG-1039", pinned: true },
  { id: "RM-01", title: "Patient-facing remote monitoring v2", prevRank: 1, newRank: 4, delta: -3, reason: "Competitor pricing pressure" },
  { id: "RM-07", title: "Clinician copilot — encounter summaries", prevRank: 3, newRank: 5, delta: -2, reason: "Capacity rebalanced" },
  { id: "RM-15", title: "Self-serve analytics for payer partners", prevRank: 9, newRank: 6, delta: +3, reason: "Pipeline pull-through" },
];

export interface SentinelCheck {
  category: "Security" | "Clinical Faithfulness" | "Doc Protocol";
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export const sentinelChecks: SentinelCheck[] = [
  { category: "Security", name: "Secrets in repo", status: "pass", detail: "0 findings" },
  { category: "Security", name: "Dependency CVEs", status: "warn", detail: "1 medium (nginx 1.25)" },
  { category: "Security", name: "AuthN/AuthZ scopes", status: "pass", detail: "Matches spec" },
  { category: "Clinical Faithfulness", name: "Source grounding", status: "pass", detail: "All claims cite UpToDate or NEJM" },
  { category: "Clinical Faithfulness", name: "Hallucination probe (n=200)", status: "warn", detail: "2.5% unsupported assertions" },
  { category: "Clinical Faithfulness", name: "Contraindication coverage", status: "pass", detail: "98.4%" },
  { category: "Doc Protocol", name: "ADR present", status: "pass", detail: "ADR-0014" },
  { category: "Doc Protocol", name: "Runbook attached", status: "fail", detail: "Missing rollback section" },
  { category: "Doc Protocol", name: "API changelog updated", status: "pass", detail: "Synced" },
];

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
}

export const auditTrail: AuditEvent[] = [
  { id: "A-9013", ts: "10:42:11", actor: "Architect", action: "drafted prototype", target: "Bulk FHIR export tier" },
  { id: "A-9012", ts: "10:38:02", actor: "Analyst", action: "re-ranked roadmap", target: "RM-12 → #1" },
  { id: "A-9011", ts: "10:36:50", actor: "Sentinel", action: "blocked merge", target: "PR #482 (missing runbook)" },
  { id: "A-9010", ts: "10:34:18", actor: "Scout", action: "ingested signal", target: "SIG-1042 FDA draft" },
  { id: "A-9009", ts: "10:21:00", actor: "operator@acme", action: "pinned", target: "RM-09" },
];
