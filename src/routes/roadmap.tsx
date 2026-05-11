import { createFileRoute } from "@tanstack/react-router";
import { roadmap } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, Pin, Undo2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap · Re-rank diff — Analyst" },
      {
        name: "description",
        content: "See exactly how Analyst re-ranked the roadmap and why. Pin, lock, or undo.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-orient" />
            Orient · Analyst
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Roadmap re-rank</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Triggered 4m ago by SIG-1042 (FDA draft) and SIG-1040 (auth incident).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo last re-rank
          </Button>
          <Button size="sm" className="h-8 bg-action text-action-foreground hover:bg-action/90">
            Approve & lock
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Items moved" value="6" />
        <Stat label="Net Δ rank" value="+8" tone="success" />
        <Stat label="Pinned (locked)" value="1" />
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/60">
        <div className="grid grid-cols-[60px_60px_1fr_120px_140px] items-center gap-3 border-b bg-muted/30 px-4 py-2 font-display text-[10px] uppercase tracking-wider text-muted-foreground">
          <div>Was</div>
          <div>Now</div>
          <div>Item</div>
          <div className="text-right">Δ</div>
          <div className="text-right">Action</div>
        </div>
        {roadmap.map((r) => {
          const Icon = r.delta > 0 ? ArrowUp : r.delta < 0 ? ArrowDown : Minus;
          const tone =
            r.delta > 0
              ? "text-success"
              : r.delta < 0
                ? "text-danger"
                : "text-muted-foreground";
          return (
            <div
              key={r.id}
              className="grid grid-cols-[60px_60px_1fr_120px_140px] items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-accent/30"
            >
              <span className="font-display text-sm text-muted-foreground line-through">
                #{r.prevRank}
              </span>
              <span className="font-display text-base font-semibold">#{r.newRank}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[10px] text-muted-foreground">{r.id}</span>
                  {r.pinned && (
                    <span className="flex items-center gap-1 rounded border border-action/40 bg-action/10 px-1.5 py-0.5 font-display text-[10px] uppercase tracking-wider text-action">
                      <Pin className="h-2.5 w-2.5" /> pinned
                    </span>
                  )}
                </div>
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.reason}</div>
              </div>
              <div className={cn("flex items-center justify-end gap-1 font-display text-sm", tone)}>
                <Icon className="h-3.5 w-3.5" />
                {r.delta > 0 ? `+${r.delta}` : r.delta}
              </div>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Pin className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <GitBranch className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <Card className="border-border/60 bg-card/60 p-4">
      <div className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
