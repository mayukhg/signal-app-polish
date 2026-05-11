import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { signals, type Signal } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  Filter,
  Clock,
  ArrowUpRight,
  Pin,
  Archive,
  GitBranch,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signals")({
  head: () => ({
    meta: [
      { title: "Signals · Inbox — Scout triage" },
      {
        name: "description",
        content: "Triage Scout's incoming signals by severity, source and freshness.",
      },
    ],
  }),
  component: SignalsPage,
});

const sevColors: Record<Signal["severity"], string> = {
  critical: "bg-danger/15 text-danger border-danger/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-observe/15 text-observe border-observe/30",
  low: "bg-muted text-muted-foreground border-border",
};

function SignalsPage() {
  const [selected, setSelected] = useState<Signal>(signals[0]);

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[420px_1fr_360px]">
      {/* Inbox column */}
      <aside className="flex flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <h1 className="font-display text-sm font-semibold uppercase tracking-wider">
              Scout · Live Signals
            </h1>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 font-display text-[10px]">
            {signals.length}
          </span>
        </div>
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Input placeholder="Filter…" className="h-7 text-xs" />
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {signals.map((s) => {
            const active = s.id === selected.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn(
                  "block w-full border-b px-4 py-3 text-left transition-colors hover:bg-accent/40",
                  active && "bg-accent",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-display text-[10px] uppercase tracking-wider",
                      sevColors[s.severity],
                    )}
                  >
                    {s.severity}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {s.freshness}
                  </span>
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{s.title}</h3>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{s.source}</span>
                  <span className="font-display">w {s.weight.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span className="font-display">J/K</span> navigate ·{" "}
          <span className="font-display">E</span> archive ·{" "}
          <span className="font-display">P</span> promote ·{" "}
          <span className="font-display">⌘↵</span> open trace
        </div>
      </aside>

      {/* Detail column */}
      <section className="flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-display">{selected.id}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{selected.source}</span>
            </div>
            <h2 className="mt-1 max-w-2xl text-xl font-semibold leading-tight">{selected.title}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8">
              <Pin className="mr-1.5 h-3.5 w-3.5" /> Pin
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
            </Button>
            <Button size="sm" className="h-8 bg-action text-action-foreground hover:bg-action/90">
              Promote to Roadmap
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <Card className="border-border/60 bg-card/60 p-5">
            <h4 className="font-display text-[11px] uppercase tracking-wider text-muted-foreground">
              Summary
            </h4>
            <p className="mt-2 text-sm leading-relaxed">{selected.summary}</p>
          </Card>

          {/* Trace view */}
          <div>
            <h4 className="mb-3 font-display text-[11px] uppercase tracking-wider text-muted-foreground">
              Trace · Signal → Priority → Action
            </h4>
            <div className="rounded-md border bg-card/40 p-4">
              <ol className="relative space-y-4 border-l border-border/60 pl-5">
                <TraceStep
                  color="bg-observe"
                  agent="Scout"
                  title="Signal ingested"
                  detail={`${selected.source} · weight ${selected.weight.toFixed(2)} · severity ${selected.severity}`}
                />
                <TraceStep
                  color="bg-orient"
                  agent="Analyst"
                  title="Re-ranked roadmap"
                  detail="RM-12 jumped 5 → 1 (Δ +4). Pinned by operator."
                />
                <TraceStep
                  color="bg-decide"
                  agent="Architect"
                  title="Drafted prototype"
                  detail="Branch: proto/samd-perf-dash · 4 files · 312 LOC"
                />
                <TraceStep
                  color="bg-act"
                  agent="Sentinel"
                  title="Verdict: hold for runbook"
                  detail="2 of 9 checks failing — see scorecard. Auto-PR drafted."
                  warn
                />
              </ol>
            </div>
          </div>

          {selected.artifacts && (
            <div>
              <h4 className="mb-2 font-display text-[11px] uppercase tracking-wider text-muted-foreground">
                Artifacts
              </h4>
              <div className="flex flex-wrap gap-2">
                {selected.artifacts.map((a) => (
                  <span
                    key={a}
                    className="rounded border bg-muted/40 px-2 py-1 font-display text-[11px]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right rail */}
      <aside className="hidden flex-col border-l lg:flex">
        <div className="border-b px-4 py-3">
          <h3 className="font-display text-[11px] uppercase tracking-wider text-muted-foreground">
            Context
          </h3>
        </div>
        <div className="space-y-4 p-4">
          <RailRow icon={GitBranch} label="Affected roadmap items" value="4" />
          <RailRow icon={ShieldAlert} label="Sentinel risk" value="Medium" tone="warn" />
          <RailRow icon={Clock} label="SLA to decide" value="6h 12m" />
          <div className="rounded-md border bg-card/60 p-3">
            <div className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
              Why this weight
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li className="flex justify-between">
                <span>Source authority</span>
                <span className="font-display">+0.34</span>
              </li>
              <li className="flex justify-between">
                <span>Recency</span>
                <span className="font-display">+0.18</span>
              </li>
              <li className="flex justify-between">
                <span>Roadmap overlap</span>
                <span className="font-display">+0.22</span>
              </li>
              <li className="flex justify-between">
                <span>Domain match</span>
                <span className="font-display">+0.08</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TraceStep({
  color,
  agent,
  title,
  detail,
  warn,
}: {
  color: string;
  agent: string;
  title: string;
  detail: string;
  warn?: boolean;
}) {
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-card/40",
          color,
        )}
      />
      <div className="flex items-center gap-2">
        <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
          {agent}
        </span>
        {warn && (
          <span className="rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 font-display text-[10px] uppercase tracking-wider text-warning">
            attention
          </span>
        )}
      </div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </li>
  );
}

function RailRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card/40 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <span
        className={cn(
          "font-display text-xs font-semibold",
          tone === "warn" ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
