// In-memory implementation of DataSource. Pure client, no network.
// State persists for the lifetime of the tab. Mirrors the shape a future
// Cloud (Postgres + RLS) implementation will expose.

import type { DataSource } from "./source";
import type {
  AuditRecord,
  DomainConfig,
  MissionLogEntry,
  MissionRun,
  PrototypeRecord,
  RoadmapRecord,
  SignalRecord,
} from "./types";
import { domainConfigs, seedRoadmap, seedSignals } from "./configs";

let counter = 1;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`;

export class MockDataSource implements DataSource {
  private signals: SignalRecord[] = [...seedSignals];
  private roadmap: RoadmapRecord[] = [...seedRoadmap];
  private log: MissionLogEntry[] = [];
  private audits: AuditRecord[] = [];
  private prototypes: PrototypeRecord[] = [];
  private runs: MissionRun[] = [];
  private listeners = new Set<(e: MissionLogEntry) => void>();

  async listDomains() {
    return Object.values(domainConfigs);
  }
  async getDomain(id: string) {
    return domainConfigs[id] ?? null;
  }
  async listSignals(domainId?: string) {
    return domainId ? this.signals.filter((s) => s.domainId === domainId) : this.signals;
  }
  async listRoadmap(domainId?: string) {
    return domainId ? this.roadmap.filter((r) => r.domainId === domainId) : this.roadmap;
  }
  async listMissionLog() {
    return [...this.log];
  }
  async listAudits() {
    return [...this.audits];
  }
  async listPrototypes(domainId?: string) {
    return domainId ? this.prototypes.filter((p) => p.domainId === domainId) : this.prototypes;
  }

  async appendMissionLog(entry: Omit<MissionLogEntry, "id" | "ts">) {
    const full: MissionLogEntry = {
      ...entry,
      id: uid("log"),
      ts: new Date().toISOString(),
    };
    this.log.push(full);
    this.listeners.forEach((cb) => cb(full));
    return full;
  }

  async reRankRoadmap(itemId: string, newPriority: number, reason: string) {
    const item = this.roadmap.find((r) => r.id === itemId);
    if (!item) throw new Error(`Roadmap item ${itemId} not found`);
    const prev = item.currentPriority;
    item.currentPriority = newPriority;
    item.delta = prev - newPriority;
    item.reason = reason;
    item.status = `Priority ${newPriority}`;
    return item;
  }

  async startMission(domainId: string, triggerSignalId?: string) {
    const run: MissionRun = {
      id: uid("run"),
      domainId,
      triggerSignalId,
      startedAt: new Date().toISOString(),
      status: "running",
    };
    this.runs.push(run);
    return run;
  }

  async completeMission(runId: string) {
    const run = this.runs.find((r) => r.id === runId);
    if (!run) throw new Error(`Mission ${runId} not found`);
    run.finishedAt = new Date().toISOString();
    run.status = "complete";
    return run;
  }

  subscribeMissionLog(cb: (entry: MissionLogEntry) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb) as unknown as void;
  }
}
