// Domain types for the Signals Command Center.
// These mirror the entities the source repo (mayukhg/my-signals-app) modeled
// in its config.json + mockMissionLogData, normalised so a real backend
// (Lovable Cloud / Postgres) can drop in without UI changes.

export type AgentName = "Scout" | "Analyst" | "Strategist" | "Architect" | "Sentinel" | "System";
export type AgentState = "idle" | "processing" | "done" | "error";
export type Severity = "critical" | "high" | "medium" | "low";

export interface DomainConfig {
  id: string;
  industry: string;
  compliance_standards: string[];
  judge_rubrics: string[];
}

export interface SignalRecord {
  id: string;
  domainId: string;
  type: string;          // Regulatory | Competitive | Threat | ...
  label: string;
  source: string;
  intensity: number;     // 0..10  (mirrors source repo)
  severity: Severity;    // derived for UI
  freshness: string;
  summary?: string;
  agent: AgentName;
  weight?: number;
  artifacts?: string[];
}

export interface RoadmapRecord {
  id: string;
  domainId: string;
  feature: string;
  status: string;
  logic: string;
  basePriority: number;
  currentPriority: number;
  delta: number;
  reason?: string;
  pinned?: boolean;
}

export interface MissionLogEntry {
  id: string;
  ts: string;            // ISO timestamp
  agent: AgentName;
  action: string;        // SIGNAL_DETECTED | PRIORITY_SHIFT | ...
  message: string;
  level: "info" | "warn" | "success" | "error";
}

export interface AuditRecord {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  status?: "pass" | "warn" | "fail";
  detail?: string;
}

export interface PrototypeRecord {
  id: string;
  domainId: string;
  title: string;
  language: string;
  body: string;
  rubricScores: Record<string, number>; // rubric -> 0..100
  status: "drafting" | "auditing" | "approved" | "blocked";
  createdAt: string;
}

export interface MissionRun {
  id: string;
  domainId: string;
  startedAt: string;
  finishedAt?: string;
  triggerSignalId?: string;
  status: "running" | "complete" | "aborted";
}
