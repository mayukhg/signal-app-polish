import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useApp, domainLabels } from "@/lib/app-store";

export const Route = createFileRoute("/config")({
  head: () => ({
    meta: [
      { title: "Config · Agents & domain" },
      { name: "description", content: "Tune Scout, Analyst, Architect and Sentinel for your domain." },
    ],
  }),
  component: ConfigPage,
});

const agents = [
  { name: "Scout", role: "Observe", desc: "Ingests signals from configured sources." },
  { name: "Analyst", role: "Orient", desc: "Re-ranks roadmap based on signal weights." },
  { name: "Architect", role: "Decide", desc: "Drafts prototypes for promoted items." },
  { name: "Sentinel", role: "Act", desc: "Gates artifacts on security, faithfulness, protocol." },
];

function ConfigPage() {
  const { domain } = useApp();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Config</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active domain:{" "}
          <span className="rounded border bg-card px-1.5 py-0.5 font-display text-xs">
            {domainLabels[domain]}
          </span>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          Agents
        </h2>
        {agents.map((a) => (
          <Card key={a.name} className="flex items-center justify-between border-border/60 bg-card/60 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
                  {a.role}
                </span>
                <span className="font-semibold">{a.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={a.name} className="text-xs text-muted-foreground">
                Enabled
              </Label>
              <Switch id={a.name} defaultChecked />
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          Workspace
        </h2>
        <Card className="space-y-3 border-border/60 bg-card/60 p-4">
          <Row label="Auto-promote signals above weight" value="0.85" />
          <Row label="Sentinel block on" value="any failing security check" />
          <Row label="Daily digest" value="08:00 in your timezone" />
        </Card>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-xs">{value}</span>
    </div>
  );
}
