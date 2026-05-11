// DataSource interface — the only seam between the UI and persistence.
//
// Driver is selected at boot via the VITE_DATA_DRIVER env var so the app
// stays platform-agnostic. Defaults to "memory" so a fresh `git clone` runs
// with zero configuration.
//
//   VITE_DATA_DRIVER=memory   (default) in-memory mock, resets on reload
//   VITE_DATA_DRIVER=local              localStorage, persists in browser
//   VITE_DATA_DRIVER=rest               REST API at VITE_API_BASE_URL
//
// Adding a driver = implement this interface in a new file and register it
// in the switch below. UI never imports a concrete driver directly.

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
import { LocalStorageDataSource } from "./local-source";
import { RestDataSource } from "./rest-source";

export interface DataSource {
  // Reads
  listDomains(): Promise<DomainConfig[]>;
  getDomain(id: string): Promise<DomainConfig | null>;
  listSignals(domainId?: string): Promise<SignalRecord[]>;
  listRoadmap(domainId?: string): Promise<RoadmapRecord[]>;
  listMissionLog(runId?: string): Promise<MissionLogEntry[]>;
  listAudits(): Promise<AuditRecord[]>;
  listPrototypes(domainId?: string): Promise<PrototypeRecord[]>;

  // Writes
  appendMissionLog(entry: Omit<MissionLogEntry, "id" | "ts">): Promise<MissionLogEntry>;
  reRankRoadmap(itemId: string, newPriority: number, reason: string): Promise<RoadmapRecord>;
  startMission(domainId: string, triggerSignalId?: string): Promise<MissionRun>;
  completeMission(runId: string): Promise<MissionRun>;

  // Reactive subscription for the mission log.
  subscribeMissionLog(cb: (entry: MissionLogEntry) => void): () => void;
}

export type DataDriver = "memory" | "local" | "rest";

function readEnv(name: string): string | undefined {
  // Vite inlines import.meta.env at build time; guard for SSR.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env as Record<string, string | undefined> | undefined;
    return env?.[name];
  } catch {
    return undefined;
  }
}

function pickDriver(): DataDriver {
  const v = (readEnv("VITE_DATA_DRIVER") ?? "memory").toLowerCase();
  if (v === "local" || v === "rest" || v === "memory") return v;
  console.warn(`[data] unknown VITE_DATA_DRIVER="${v}", falling back to "memory"`);
  return "memory";
}

let _instance: DataSource | null = null;
export function getDataSource(): DataSource {
  if (_instance) return _instance;
  const driver = pickDriver();
  switch (driver) {
    case "local":
      _instance = new LocalStorageDataSource();
      break;
    case "rest": {
      const base = readEnv("VITE_API_BASE_URL");
      if (!base) {
        console.warn('[data] VITE_DATA_DRIVER=rest but VITE_API_BASE_URL is not set; falling back to "memory"');
        _instance = new MockDataSource();
      } else {
        _instance = new RestDataSource(base);
      }
      break;
    }
    case "memory":
    default:
      _instance = new MockDataSource();
  }
  return _instance;
}
