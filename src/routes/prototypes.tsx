import { createFileRoute } from "@tanstack/react-router";
import { sentinelChecks } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, X, FileCode2, GitBranch, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prototypes")({
  head: () => ({
    meta: [
      { title: "Prototypes · Sentinel scorecard" },
      {
        name: "description",
        content: "Architect's drafts gated by Sentinel's security, clinical and protocol checks.",
      },
    ],
  }),
  component: PrototypesPage,
});

const proto = {
  id: "PR-482",
  title: "SaMD continuous performance dashboard",
  branch: "proto/samd-perf-dash",
  files: 4,
  loc: 312,
  driver: "SIG-1042 (FDA draft guidance)",
};

function PrototypesPage() {
  const grouped = {
    Security: sentinelChecks.filter((c) => c.category === "Security"),
    "Clinical Faithfulness": sentinelChecks.filter((c) => c.category === "Clinical Faithfulness"),
    "Doc Protocol": sentinelChecks.filter((c) => c.category === "Doc Protocol"),
  };
  const fail = sentinelChecks.filter((c) => c.status === "fail").length;
  const warn = sentinelChecks.filter((c) => c.status === "warn").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-decide" />
            Decide · Architect → Sentinel verdict
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{proto.title}</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-display">{proto.id}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" /> {proto.branch}
            </span>
            <span>·</span>
            <span>
              <FileCode2 className="mr-1 inline h-3 w-3" />
              {proto.files} files · {proto.loc} LOC
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Play className="mr-1.5 h-3.5 w-3.5" /> Re-run checks
          </Button>
          <Button
            size="sm"
            className="h-8 bg-action text-action-foreground hover:bg-action/90"
            disabled={fail > 0}
          >
            {fail > 0 ? `Blocked · ${fail} failing` : "Ship to staging"}
          </Button>
        </div>
      </header>

      <Card className="border-border/60 bg-card/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
              Sentinel verdict
            </div>
            <div className="mt-1 text-lg font-semibold">
              {fail > 0 ? (
                <span className="text-warning">Hold — {fail} failing, {warn} warnings</span>
              ) : (
                <span className="text-success">Clear to ship</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Driven by {proto.driver}. Trust scaffolding evaluated against domain ruleset.
            </p>
          </div>
          <ScoreRing pass={sentinelChecks.length - fail - warn} total={sentinelChecks.length} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(grouped).map(([cat, items]) => (
          <Card key={cat} className="border-border/60 bg-card/60 p-4">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">
              {cat}
            </h3>
            <ul className="mt-3 space-y-2">
              {items.map((c) => (
                <li key={c.name} className="flex items-start gap-2.5">
                  <StatusIcon status={c.status} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass")
    return (
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-success">
        <Check className="h-2.5 w-2.5" />
      </span>
    );
  if (status === "warn")
    return (
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning/20 text-warning">
        <AlertTriangle className="h-2.5 w-2.5" />
      </span>
    );
  return (
    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger/20 text-danger">
      <X className="h-2.5 w-2.5" />
    </span>
  );
}

function ScoreRing({ pass, total }: { pass: number; total: number }) {
  const pct = Math.round((pass / total) * 100);
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-muted/40" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          className={cn(pct === 100 ? "text-success" : pct >= 70 ? "text-warning" : "text-danger")}
          strokeWidth="3"
          strokeDasharray={`${pct} 100`}
          pathLength={100}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-semibold">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">{pass}/{total}</span>
      </div>
    </div>
  );
}
