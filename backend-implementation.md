# Backend Implementation Guide

This document describes the **backend architecture** of the Signals Command
Center app and gives anyone who clones the repo a complete reference for:

1. How the app talks to a backend (the `DataSource` seam).
2. The drivers that ship in the box (`memory`, `local`, `rest`).
3. The exact REST contract a custom backend must implement.
4. The lifecycle scripts (`start`/`stop` for sh + bat).
5. Configuration via `.env`.
6. How to add a new driver (Supabase, Firebase, SQLite, …).
7. A reference Node + SQLite server you can copy as a starting point.

The guiding principle: **the UI never knows or cares where data lives.** All
persistence flows through one TypeScript interface. Swap the driver, swap the
backend — no UI changes.

---

## 1. Architecture overview

```text
 ┌──────────────────────────────────────────────────────┐
 │                    React UI (routes/*)               │
 │  signals · roadmap · prototypes · audits · config    │
 └──────────────────────┬───────────────────────────────┘
                        │ uses
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │           hooks (use-mission, app-store)             │
 │           AgentEngine (lib/agents/engine.ts)         │
 └──────────────────────┬───────────────────────────────┘
                        │ calls getDataSource()
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │       DataSource interface (lib/data/source.ts)      │
 │   listDomains · listSignals · listRoadmap · …        │
 │   appendMissionLog · reRankRoadmap · subscribe…      │
 └──────┬─────────────────┬─────────────────┬───────────┘
        │ memory          │ local           │ rest
        ▼                 ▼                 ▼
 ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐
 │ MockData      │ │ LocalStorage  │ │ Rest               │
 │ Source        │ │ DataSource    │ │ DataSource         │
 │ (RAM)         │ │ (browser KV)  │ │ (HTTP + SSE)       │
 └───────────────┘ └───────────────┘ └─────────┬──────────┘
                                               │
                                               ▼
                                    ┌────────────────────────┐
                                    │ Your server of choice  │
                                    │ Node, Go, Rust, Python │
                                    │ Supabase, Firebase, …  │
                                    └────────────────────────┘
```

Driver selection happens **once at boot** in `getDataSource()` based on
`VITE_DATA_DRIVER`. The instance is cached for the lifetime of the tab.

---

## 2. The `DataSource` interface

File: `src/lib/data/source.ts`

```ts
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

  // Reactive
  subscribeMissionLog(cb: (entry: MissionLogEntry) => void): () => void;
}
```

All entity shapes live in `src/lib/data/types.ts` and are the **single source
of truth** for both client and server.

---

## 3. Built-in drivers

| Driver   | Env value                 | Persistence       | Network | Best for                          |
|----------|---------------------------|-------------------|---------|-----------------------------------|
| memory   | `VITE_DATA_DRIVER=memory` | RAM (per tab)     | none    | Demos, tests, first run (default) |
| local    | `VITE_DATA_DRIVER=local`  | `localStorage`    | none    | Solo use, offline, kiosks         |
| rest     | `VITE_DATA_DRIVER=rest`   | Whatever you host | HTTP+SSE| Multi-user, real backend          |

All three implement the same interface. The UI cannot tell them apart.

### 3.1 `MockDataSource` (`memory`)
Pure in-memory state seeded from `lib/data/configs.ts`. Resets on reload.
Used as the **fallback** if `rest` is selected but `VITE_API_BASE_URL` is missing.

### 3.2 `LocalStorageDataSource` (`local`)
Same shape, but every mutation is mirrored to `window.localStorage` under
the key `signals-app:v1`. SSR-safe (returns seed snapshot when `window` is
undefined).

### 3.3 `RestDataSource` (`rest`)
Thin `fetch`/`EventSource` wrapper. Base URL comes from `VITE_API_BASE_URL`.
Trailing slash is stripped automatically.

---

## 4. REST contract (for custom backends)

Implement these endpoints and the `rest` driver will work unmodified.
All bodies are JSON; all timestamps are ISO 8601 strings.

### 4.1 Reads

| Method | Path                                     | Returns                       |
|--------|------------------------------------------|-------------------------------|
| GET    | `/domains`                               | `DomainConfig[]`              |
| GET    | `/domains/:id`                           | `DomainConfig \| null`        |
| GET    | `/signals?domainId=`                     | `SignalRecord[]`              |
| GET    | `/roadmap?domainId=`                     | `RoadmapRecord[]`             |
| GET    | `/mission-log`                           | `MissionLogEntry[]`           |
| GET    | `/audits`                                | `AuditRecord[]`               |
| GET    | `/prototypes?domainId=`                  | `PrototypeRecord[]`           |

`domainId` is optional; when omitted, return all rows.

### 4.2 Writes

| Method | Path                              | Body                                                | Returns            |
|--------|-----------------------------------|-----------------------------------------------------|--------------------|
| POST   | `/mission-log`                    | `Omit<MissionLogEntry,"id"\|"ts">`                  | `MissionLogEntry`  |
| PATCH  | `/roadmap/:id`                    | `{ newPriority: number, reason: string }`           | `RoadmapRecord`    |
| POST   | `/missions`                       | `{ domainId: string, triggerSignalId?: string }`    | `MissionRun`       |
| POST   | `/missions/:id/complete`          | _(empty)_                                           | `MissionRun`       |

The server is responsible for assigning `id` and `ts` on creation, and for
computing `delta` and `status` on `reRankRoadmap` (`delta = prev - new`,
`status = "Priority N"`).

### 4.3 Realtime — `GET /mission-log/stream`

Server-Sent Events stream. Each `message` is a JSON-encoded `MissionLogEntry`.

```http
GET /mission-log/stream
Accept: text/event-stream
```

```text
data: {"id":"log-1","ts":"2026-05-11T10:00:00Z","agent":"Scout",...}

data: {"id":"log-2","ts":"2026-05-11T10:00:01Z","agent":"Sentinel",...}
```

If you cannot host SSE, the client falls back gracefully — `subscribeMissionLog`
becomes a no-op and the UI still polls via `listMissionLog()`.

### 4.4 Status codes & errors

- `2xx` → success, JSON body as documented.
- `4xx`/`5xx` → the client throws `Error("<status> <statusText> on <path>")`.
  Return a JSON error object if you want better UX (`{ error: "..." }`); the
  current client surfaces only the status line, but custom drivers can extend
  this.

### 4.5 CORS

If your API is on a different origin than the Vite dev server (`localhost:8080`
by default), enable CORS:

```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: content-type
```

---

## 5. Entity reference

Defined in `src/lib/data/types.ts`. Reproduced here for backend implementers.

```ts
type AgentName = "Scout"|"Analyst"|"Strategist"|"Architect"|"Sentinel"|"System";
type Severity  = "critical"|"high"|"medium"|"low";

DomainConfig    { id, industry, compliance_standards[], judge_rubrics[] }
SignalRecord    { id, domainId, type, label, source, intensity (0-10),
                  severity, freshness, summary?, agent, weight?, artifacts? }
RoadmapRecord   { id, domainId, feature, status, logic,
                  basePriority, currentPriority, delta, reason?, pinned? }
MissionLogEntry { id, ts, agent, action, message,
                  level: "info"|"warn"|"success"|"error" }
AuditRecord     { id, ts, actor, action, target,
                  status?: "pass"|"warn"|"fail", detail? }
PrototypeRecord { id, domainId, title, language, body,
                  rubricScores: Record<string, number>,
                  status: "drafting"|"auditing"|"approved"|"blocked",
                  createdAt }
MissionRun      { id, domainId, startedAt, finishedAt?,
                  triggerSignalId?, status: "running"|"complete"|"aborted" }
```

### Suggested SQL schema

```sql
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  industry TEXT NOT NULL,
  compliance_standards JSONB NOT NULL DEFAULT '[]',
  judge_rubrics JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  source TEXT NOT NULL,
  intensity NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  freshness TEXT NOT NULL,
  summary TEXT,
  agent TEXT NOT NULL,
  weight NUMERIC,
  artifacts JSONB
);

CREATE TABLE roadmap (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  status TEXT NOT NULL,
  logic TEXT NOT NULL,
  base_priority INT NOT NULL,
  current_priority INT NOT NULL,
  delta INT NOT NULL DEFAULT 0,
  reason TEXT,
  pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE mission_runs (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  trigger_signal_id TEXT,
  status TEXT NOT NULL
);

CREATE TABLE mission_log (
  id TEXT PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  run_id TEXT REFERENCES mission_runs(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT NOT NULL
);

CREATE TABLE audits (
  id TEXT PRIMARY KEY, ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL,
  status TEXT, detail TEXT
);

CREATE TABLE prototypes (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL,
  title TEXT NOT NULL, language TEXT NOT NULL, body TEXT NOT NULL,
  rubric_scores JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Configuration

File: `.env` (gitignored). Copy from `.env.example`:

```dotenv
# memory | local | rest
VITE_DATA_DRIVER=memory

# Required only when VITE_DATA_DRIVER=rest
VITE_API_BASE_URL=http://localhost:4000
```

Vite inlines `VITE_*` vars at build time. **Never** put secrets here — they
will end up in the client bundle. Server secrets belong in your backend's
own environment.

---

## 7. Lifecycle scripts

Located in `scripts/`. They wrap `npm install` + `npm run dev` + PID
tracking so non-Node users can run the app with one command.

| Script              | Platform        | Purpose                              |
|---------------------|-----------------|--------------------------------------|
| `scripts/start.sh`  | macOS / Linux   | Check Node ≥ 20 → install → dev      |
| `scripts/start.bat` | Windows         | Same, in cmd.exe                     |
| `scripts/stop.sh`   | macOS / Linux   | Kill PID stored in `.run/dev.pid`    |
| `scripts/stop.bat`  | Windows         | Same, in cmd.exe                     |

Behaviour:

1. Verify Node ≥ 20 (`node -v`); if missing, print install link and exit 1.
2. Seed `.env` from `.env.example` if absent.
3. Run `npm install` if `node_modules/` is missing.
4. Launch `npm run dev` in the background, store PID at `.run/dev.pid`.
5. `stop.*` reads that PID and terminates the process tree.

The `.run/` directory is gitignored.

---

## 8. Adding a new driver

1. Create `src/lib/data/<name>-source.ts` exporting a class that implements
   `DataSource`.
2. Register it in the `switch` inside `getDataSource()` in
   `src/lib/data/source.ts`.
3. Add the new value to the `DataDriver` union type.
4. Document the env vars it needs in `.env.example`.

### Example: Supabase driver skeleton

```ts
// src/lib/data/supabase-source.ts
import { createClient } from "@supabase/supabase-js";
import type { DataSource } from "./source";

export class SupabaseDataSource implements DataSource {
  private sb;
  constructor(url: string, anonKey: string) {
    this.sb = createClient(url, anonKey);
  }
  async listSignals(domainId?: string) {
    const q = this.sb.from("signals").select("*");
    const { data, error } = domainId ? await q.eq("domain_id", domainId) : await q;
    if (error) throw error;
    return data ?? [];
  }
  // …implement remaining methods…
  subscribeMissionLog(cb: (e: any) => void) {
    const ch = this.sb.channel("mission_log")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mission_log" },
          (p) => cb(p.new as any))
      .subscribe();
    return () => { this.sb.removeChannel(ch); };
  }
}
```

Then wire it up:

```ts
// source.ts
case "supabase":
  _instance = new SupabaseDataSource(
    readEnv("VITE_SUPABASE_URL")!, readEnv("VITE_SUPABASE_ANON_KEY")!);
  break;
```

---

## 9. Reference REST backend (Node + better-sqlite3)

A 100-line example you can drop into `examples/server-node-sqlite/` to test
the `rest` driver locally.

```js
// examples/server-node-sqlite/server.mjs
import http from "node:http";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

const db = new Database("signals.db");
db.exec(`CREATE TABLE IF NOT EXISTS mission_log (
  id TEXT PRIMARY KEY, ts TEXT, agent TEXT, action TEXT, message TEXT, level TEXT)`);

const sseClients = new Set();

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(body == null ? "" : JSON.stringify(body));
}

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);

  if (req.url === "/mission-log/stream") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "access-control-allow-origin": "*",
    });
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  if (req.method === "GET" && req.url === "/mission-log") {
    return send(res, 200, db.prepare("SELECT * FROM mission_log ORDER BY ts").all());
  }

  if (req.method === "POST" && req.url === "/mission-log") {
    let body = ""; for await (const c of req) body += c;
    const entry = { id: `log-${randomUUID()}`, ts: new Date().toISOString(), ...JSON.parse(body) };
    db.prepare(`INSERT INTO mission_log VALUES (@id,@ts,@agent,@action,@message,@level)`).run(entry);
    sseClients.forEach((c) => c.write(`data: ${JSON.stringify(entry)}\n\n`));
    return send(res, 200, entry);
  }

  // …add /signals, /roadmap, /missions, etc. following the same pattern…

  send(res, 404, { error: "not found" });
}).listen(4000, () => console.log("REST backend on :4000"));
```

Run it:
```bash
cd examples/server-node-sqlite
npm i better-sqlite3
node server.mjs
```
Then in the app's `.env`:
```dotenv
VITE_DATA_DRIVER=rest
VITE_API_BASE_URL=http://localhost:4000
```

---

## 10. Testing strategy

- **Unit**: instantiate `MockDataSource` directly in Vitest; assert state
  transitions on `appendMissionLog` and `reRankRoadmap`.
- **Contract**: keep one shared test suite in `src/lib/data/__tests__/contract.test.ts`
  that runs the same assertions against every driver. Pass any new driver
  through it before shipping.
- **Engine**: `AgentEngine` is pure and accepts an injected `DataSource` —
  feed it a mock and assert the emitted events match `defaultPlaybook`.

---

## 11. Security notes

- The publishable Vite env vars ship to the browser. Anything secret
  (service-role keys, write tokens) must live on the **server side** of
  whatever backend you connect via the `rest` driver.
- The `rest` driver sends no auth headers by default. If your API needs
  auth, extend `RestDataSource` to attach a token (cookie, bearer, etc.) —
  this is the only place that needs to change.
- `localStorage` is not encrypted; do not use the `local` driver for
  sensitive data on shared machines.

---

## 12. FAQ

**Q: Can I run two drivers at once?**
No — `getDataSource()` caches a single instance per tab by design. If you need
hybrid behaviour (e.g., REST for reads, local for offline writes), build a
**composite driver** that wraps two others and dispatches per-method.

**Q: Where do agent playbooks live?**
`src/lib/agents/engine.ts` exports `defaultPlaybook`. The engine is backend-
agnostic; it only calls `DataSource` methods.

**Q: How do I migrate from `local` to `rest` without losing data?**
Export `localStorage["signals-app:v1"]`, POST each record to your REST
backend, then flip `VITE_DATA_DRIVER`.
