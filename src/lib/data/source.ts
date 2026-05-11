// DataSource interface — the only seam between the UI and persistence.
// Today: backed by an in-memory mock (mock-source.ts).
// Tomorrow: enable Lovable Cloud and replace `getDataSource()` body with a
// supabase-backed implementation that satisfies the same interface. No UI
// component should ever import the mock module directly.

import type {
  AuditRecord,
  DomainConfig,
  MissionLogEntry,
  MissionRun,
  PrototypeRecord,
  RoadmapRecord,
  SignalRecord,
} from "./types";
import { MockDataSource } from "./mock-source";

export interface DataSource {
  // Reads
  listDomains(): Promise<DomainConfig[]>;
  getDomain(id: string): Promise<DomainConfig | null>;
  listSignals(domainId?: string): Promise<SignalRecord[]>;
  listRoadmap(domainId?: string): Promise<RoadmapRecord[]>;
  listMissionLog(runId?: string): Promise<MissionLogEntry[]>;
  listAudits(): Promise<AuditRecord[]>;
  listPrototypes(domainId?: string): Promise<PrototypeRecord[]>;

  // Writes (mutate in-memory today; will hit Postgres later)
  appendMissionLog(entry: Omit<MissionLogEntry, "id" | "ts">): Promise<MissionLogEntry>;
  reRankRoadmap(itemId: string, newPriority: number, reason: string): Promise<RoadmapRecord>;
  startMission(domainId: string, triggerSignalId?: string): Promise<MissionRun>;
  completeMission(runId: string): Promise<MissionRun>;

  // Reactive subscription for the mission log (used by the agent engine).
  // A Cloud-backed impl can wire this to supabase realtime.
  subscribeMissionLog(cb: (entry: MissionLogEntry) => void): () => void;
}

let _instance: DataSource | null = null;
export function getDataSource(): DataSource {
  if (_instance) return _instance;
  _instance = new MockDataSource();
  return _instance;
}
