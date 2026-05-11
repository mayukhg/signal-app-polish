import { createFileRoute } from "@tanstack/react-router";
import { auditTrail } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Search } from "lucide-react";

export const Route = createFileRoute("/audits")({
  head: () => ({
    meta: [
      { title: "Audits · Sentinel trail" },
      { name: "description", content: "Append-only audit log of every agent and operator action." },
    ],
  }),
  component: AuditsPage,
});

function AuditsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <div className="flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-act" />
          Act · Sentinel
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Audit trail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every agent action, every operator override. Append-only, signed, exportable.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter by agent, action, target…" className="h-8 pl-8 text-xs" />
        </div>
        <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
          last 24h · {auditTrail.length} events
        </span>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/60">
        <div className="grid grid-cols-[80px_120px_1fr_80px] items-center gap-3 border-b bg-muted/30 px-4 py-2 font-display text-[10px] uppercase tracking-wider text-muted-foreground">
          <div>Time</div>
          <div>Actor</div>
          <div>Action · Target</div>
          <div className="text-right">ID</div>
        </div>
        {auditTrail.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[80px_120px_1fr_80px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 hover:bg-accent/30"
          >
            <span className="font-display text-xs text-muted-foreground">{e.ts}</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{e.actor}</span>
            </span>
            <span className="text-muted-foreground">
              <span className="text-foreground">{e.action}</span> · {e.target}
            </span>
            <span className="text-right font-display text-[11px] text-muted-foreground">{e.id}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
