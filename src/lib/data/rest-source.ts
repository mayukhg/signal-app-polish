// REST-backed DataSource. Talks to a server you provide via VITE_API_BASE_URL.
// Expected endpoints (all JSON):
//   GET    {base}/domains
//   GET    {base}/domains/:id
//   GET    {base}/signals?domainId=
//   GET    {base}/roadmap?domainId=
//   GET    {base}/mission-log
//   GET    {base}/audits
//   GET    {base}/prototypes?domainId=
//   POST   {base}/mission-log         body: Omit<MissionLogEntry, "id"|"ts">
//   PATCH  {base}/roadmap/:id         body: { newPriority, reason }
//   POST   {base}/missions            body: { domainId, triggerSignalId? }
//   POST   {base}/missions/:id/complete
//   GET    {base}/mission-log/stream  (Server-Sent Events, optional)

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

export class RestDataSource implements DataSource {
  constructor(private base: string) {
    this.base = base.replace(/\/$/, "");
  }

  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
    return res.json() as Promise<T>;
  }

  listDomains() {
    return this.json<DomainConfig[]>("/domains");
  }
  getDomain(id: string) {
    return this.json<DomainConfig | null>(`/domains/${encodeURIComponent(id)}`);
  }
  listSignals(domainId?: string) {
    return this.json<SignalRecord[]>(`/signals${domainId ? `?domainId=${encodeURIComponent(domainId)}` : ""}`);
  }
  listRoadmap(domainId?: string) {
    return this.json<RoadmapRecord[]>(`/roadmap${domainId ? `?domainId=${encodeURIComponent(domainId)}` : ""}`);
  }
  listMissionLog() {
    return this.json<MissionLogEntry[]>("/mission-log");
  }
  listAudits() {
    return this.json<AuditRecord[]>("/audits");
  }
  listPrototypes(domainId?: string) {
    return this.json<PrototypeRecord[]>(`/prototypes${domainId ? `?domainId=${encodeURIComponent(domainId)}` : ""}`);
  }

  appendMissionLog(entry: Omit<MissionLogEntry, "id" | "ts">) {
    return this.json<MissionLogEntry>("/mission-log", { method: "POST", body: JSON.stringify(entry) });
  }
  reRankRoadmap(itemId: string, newPriority: number, reason: string) {
    return this.json<RoadmapRecord>(`/roadmap/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify({ newPriority, reason }),
    });
  }
  startMission(domainId: string, triggerSignalId?: string) {
    return this.json<MissionRun>("/missions", {
      method: "POST",
      body: JSON.stringify({ domainId, triggerSignalId }),
    });
  }
  completeMission(runId: string) {
    return this.json<MissionRun>(`/missions/${encodeURIComponent(runId)}/complete`, { method: "POST" });
  }

  subscribeMissionLog(cb: (entry: MissionLogEntry) => void) {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return () => {};
    }
    const es = new EventSource(`${this.base}/mission-log/stream`);
    es.onmessage = (ev) => {
      try {
        cb(JSON.parse(ev.data) as MissionLogEntry);
      } catch {
        /* ignore malformed */
      }
    };
    return () => es.close();
  }
}
