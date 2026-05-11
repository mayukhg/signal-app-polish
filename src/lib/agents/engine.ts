// Agent orchestration engine — ported from mayukhg/my-signals-app
// (mockMissionLogData + the playbackIndex useEffect chain in src/App.jsx).
//
// Pure TypeScript: no React. It drives a DataSource, emitting mission log
// entries on a metronome and triggering side-effects (roadmap re-rank).
// React layer subscribes via the use-mission hook.

import type { DataSource } from "@/lib/data/source";
import type { AgentName, MissionLogEntry } from "@/lib/data/types";

export interface PlaybackStep {
  delayMs: number;
  agent: AgentName;
  action: string;
  message: string;
  level: MissionLogEntry["level"];
  // Optional side-effect: re-rank a roadmap item
  reRank?: { itemId: string; newPriority: number };
}

// Faithful port of the source repo's mockMissionLogData (with timing deltas).
export const defaultPlaybook: PlaybackStep[] = [
  {
    delayMs: 0,
    agent: "Scout",
    action: "SIGNAL_DETECTED",
    level: "warn",
    message:
      "Detected surge in 'Spring4Shell-V2' exploit discussions on dark-web forums (intensity 9.2). Cross-referencing ABDM M3 Data Residency update.",
  },
  {
    delayMs: 1200,
    agent: "Strategist",
    action: "PRIORITY_SHIFT",
    level: "info",
    message:
      "Risk score 94/100. Overlap with ABDM Identity Vault schema. Re-ranking: 'ABDM Identity Vault' → Priority #1. Deprioritising 'Social Share UI'.",
    reRank: { itemId: "rm-3", newPriority: 5 },
  },
  {
    delayMs: 2400,
    agent: "Architect",
    action: "VIBE_CODING_INITIATED",
    level: "info",
    message:
      "Drafting FHIR-compliant mitigation script for ABDM Identity Vault. Zero-Trust decoupling + key rotation. PII isolation prioritised.",
  },
  {
    delayMs: 3800,
    agent: "Sentinel",
    action: "AUDIT_FAILED",
    level: "error",
    message:
      "Audit SEC-X99: FAIL. Reason: Architect used 'must' on line 42 — violates Will-Protocol. Insecure logging pattern detected.",
  },
  {
    delayMs: 5000,
    agent: "Architect",
    action: "SELF_CORRECTION",
    level: "info",
    message:
      "Replacing 'must' with 'will'. Hardening logging logic to Secure Vault output. Re-submitting for audit.",
  },
  {
    delayMs: 6200,
    agent: "Sentinel",
    action: "AUDIT_PASSED",
    level: "success",
    message:
      "Audit SEC-X99: PASS. Clinical faithfulness 100%. Security hardening verified. Ready for human approval.",
  },
];

export type EngineEvent =
  | { type: "agent-state"; agent: AgentName; state: "processing" | "idle" }
  | { type: "log"; entry: MissionLogEntry }
  | { type: "complete"; runId: string };

export class AgentEngine {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private aborted = false;

  constructor(
    private ds: DataSource,
    private emit: (e: EngineEvent) => void,
  ) {}

  async run(domainId: string, playbook: PlaybackStep[] = defaultPlaybook) {
    this.abort();
    this.aborted = false;
    const run = await this.ds.startMission(domainId);

    playbook.forEach((step, i) => {
      const t = setTimeout(async () => {
        if (this.aborted) return;
        // Pulse the active agent
        this.emit({ type: "agent-state", agent: step.agent, state: "processing" });
        const entry = await this.ds.appendMissionLog({
          agent: step.agent,
          action: step.action,
          message: step.message,
          level: step.level,
        });
        this.emit({ type: "log", entry });

        if (step.reRank) {
          await this.ds.reRankRoadmap(step.reRank.itemId, step.reRank.newPriority, step.action);
        }

        // Settle agent back to idle shortly after
        const settle = setTimeout(() => {
          if (this.aborted) return;
          this.emit({ type: "agent-state", agent: step.agent, state: "idle" });
        }, 700);
        this.timers.push(settle);

        if (i === playbook.length - 1) {
          await this.ds.completeMission(run.id);
          this.emit({ type: "complete", runId: run.id });
        }
      }, step.delayMs);
      this.timers.push(t);
    });

    return run;
  }

  abort() {
    this.aborted = true;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }
}
