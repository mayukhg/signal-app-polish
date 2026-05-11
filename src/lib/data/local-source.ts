// localStorage-backed DataSource. Same shape as MockDataSource but persists
// signals/roadmap/log/audits/prototypes/runs across page reloads. No network.

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

const KEY = "signals-app:v1";
let counter = 1;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${counter++}`;

interface Snapshot {
  signals: SignalRecord[];
  roadmap: RoadmapRecord[];
  log: MissionLogEntry[];
  audits: AuditRecord[];
  prototypes: PrototypeRecord[];
  runs: MissionRun[];
}

function load(): Snapshot {
  if (typeof window === "undefined") {
    return { signals: [...seedSignals], roadmap: [...seedRoadmap], log: [], audits: [], prototypes: [], runs: [] };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Snapshot;
  } catch {
    /* ignore */
  }
  return { signals: [...seedSignals], roadmap: [...seedRoadmap], log: [], audits: [], prototypes: [], runs: [] };
}

export class LocalStorageDataSource implements DataSource {
  private state: Snapshot = load();
  private listeners = new Set<(e: MissionLogEntry) => void>();

  private save() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch {
      /* quota; ignore */
    }
  }

  async listDomains() {
    return Object.values(domainConfigs);
  }
  async getDomain(id: string) {
    return domainConfigs[id] ?? null;
  }
  async listSignals(domainId?: string) {
    return domainId ? this.state.signals.filter((s) => s.domainId === domainId) : this.state.signals;
  }
  async listRoadmap(domainId?: string) {
    return domainId ? this.state.roadmap.filter((r) => r.domainId === domainId) : this.state.roadmap;
  }
  async listMissionLog() {
    return [...this.state.log];
  }
  async listAudits() {
    return [...this.state.audits];
  }
  async listPrototypes(domainId?: string) {
    return domainId ? this.state.prototypes.filter((p) => p.domainId === domainId) : this.state.prototypes;
  }

  async appendMissionLog(entry: Omit<MissionLogEntry, "id" | "ts">) {
    const full: MissionLogEntry = { ...entry, id: uid("log"), ts: new Date().toISOString() };
    this.state.log.push(full);
    this.save();
    this.listeners.forEach((cb) => cb(full));
    return full;
  }

  async reRankRoadmap(itemId: string, newPriority: number, reason: string) {
    const item = this.state.roadmap.find((r) => r.id === itemId);
    if (!item) throw new Error(`Roadmap item ${itemId} not found`);
    const prev = item.currentPriority;
    item.currentPriority = newPriority;
    item.delta = prev - newPriority;
    item.reason = reason;
    item.status = `Priority ${newPriority}`;
    this.save();
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
    this.state.runs.push(run);
    this.save();
    return run;
  }

  async completeMission(runId: string) {
    const run = this.state.runs.find((r) => r.id === runId);
    if (!run) throw new Error(`Mission ${runId} not found`);
    run.finishedAt = new Date().toISOString();
    run.status = "complete";
    this.save();
    return run;
  }

  subscribeMissionLog(cb: (entry: MissionLogEntry) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb) as unknown as void;
  }
}
