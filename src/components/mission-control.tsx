// Mission Control — visualises the agent engine. Drop-in widget.
// Wired through the DataSource layer (no direct mock imports).
import { useMission } from "@/hooks/use-mission";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Compass, GitFork, Zap, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentName, AgentState } from "@/lib/data/types";

const agents: { key: AgentName; label: string; icon: typeof Eye }[] = [
  { key: "Scout", label: "Scout", icon: Eye },
  { key: "Strategist", label: "Strategist", icon: Compass },
  { key: "Architect", label: "Architect", icon: GitFork },
  { key: "Sentinel", label: "Sentinel", icon: Zap },
];

const stateDot = (s: AgentState) =>
  s === "processing" ? "bg-action animate-pulse" : "bg-muted-foreground/40";

const levelColor = (lvl: string) =>
  lvl === "success"
    ? "text-success"
    : lvl === "error"
      ? "text-danger"
      : lvl === "warn"
        ? "text-warning"
        : "text-foreground";

export function MissionControl({ domainId = "health-tech" }: { domainId?: string }) {
  const { log, agentStates, isRunning, runMission, reset } = useMission();

  return (
    <Card className="border-border/60 bg-card/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Mission Control
          </div>
          <div className="text-sm">A2A orchestration · live mission log</div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => runMission(domainId)}
            disabled={isRunning}
            className="bg-action text-action-foreground hover:bg-action/90"
          >
            <Play className="mr-1 h-3.5 w-3.5" />
            {isRunning ? "Running…" : "Run mission"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} disabled={isRunning && log.length === 0}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {agents.map((a) => (
          <div key={a.key} className="rounded-md border bg-background/40 p-2">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", stateDot(agentStates[a.key]))} />
              <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-display text-[11px] uppercase tracking-wider">{a.label}</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {agentStates[a.key]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 max-h-64 overflow-y-auto rounded-md border bg-background/30 p-3 font-mono text-xs">
        {log.length === 0 ? (
          <div className="text-muted-foreground">
            No mission active. Press <span className="text-foreground">Run mission</span> to trigger
            Scout → Strategist → Architect → Sentinel.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {log.map((e) => (
              <li key={e.id} className="leading-snug">
                <span className="text-muted-foreground">
                  {new Date(e.ts).toLocaleTimeString()}{" "}
                </span>
                <span className={cn("font-semibold", levelColor(e.level))}>[{e.agent}]</span>{" "}
                <span className="text-muted-foreground">{e.action}</span> — {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
