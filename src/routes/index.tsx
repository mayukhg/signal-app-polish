import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Stethoscope, Shield, FileJson, ArrowRight, Eye, Compass, GitFork, Zap } from "lucide-react";
import { useApp, type Domain } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signals — Choose your domain" },
      {
        name: "description",
        content:
          "Pick a strategic domain and operate Scout, Analyst, Architect and Sentinel through one OODA-loop command center.",
      },
    ],
  }),
  component: Onboarding,
});

const domains: {
  key: Domain;
  name: string;
  tagline: string;
  bullets: string[];
  icon: typeof Stethoscope;
}[] = [
  {
    key: "health-tech",
    name: "Health-Tech",
    tagline: "FDA, ONC, payer & EHR signals → SaMD-ready roadmap",
    bullets: ["FDA / ONC ingest", "Clinical faithfulness checks", "FHIR + EHR connectors"],
    icon: Stethoscope,
  },
  {
    key: "cybersecurity",
    name: "Cybersecurity",
    tagline: "CVEs, threat intel & posture drift → hardening backlog",
    bullets: ["NVD / CISA ingest", "Exploitability scoring", "Auto-PR remediation"],
    icon: Shield,
  },
  {
    key: "custom",
    name: "Custom JSON",
    tagline: "Bring your own signal taxonomy and agent prompts",
    bullets: ["Schema-first ingest", "Per-domain Sentinel rules", "BYO eval set"],
    icon: FileJson,
  },
];

function Onboarding() {
  const { setDomain } = useApp();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-action text-action-foreground">
              <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold tracking-tight">SIGNALS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Agentic Command Center
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            All four agents online
          </div>
        </header>

        <section className="mt-16 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 font-display text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-action" />
            One loop · Four agents · Zero noise
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Run strategy like an{" "}
            <span className="text-action">OODA loop</span>, not an inbox.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
            Scout watches the world. Analyst orients your roadmap. Architect decides what to
            prototype. Sentinel keeps every artifact safe to ship. Choose where to point them.
          </p>

          {/* OODA preview */}
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { label: "Observe", agent: "Scout", icon: Eye, color: "bg-observe" },
              { label: "Orient", agent: "Analyst", icon: Compass, color: "bg-orient" },
              { label: "Decide", agent: "Architect", icon: GitFork, color: "bg-decide" },
              { label: "Act", agent: "Sentinel", icon: Zap, color: "bg-act" },
            ].map((s) => (
              <div key={s.label} className="rounded-md border bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-display text-xs uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">{s.agent}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
              01 · Choose your domain
            </h2>
            <span className="text-xs text-muted-foreground">You can switch any time</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {domains.map((d) => (
              <Card
                key={d.key}
                className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/60 p-5 transition-all hover:border-action/60 hover:bg-card"
                onClick={() => setDomain(d.key)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <d.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                    sample loaded
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{d.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {d.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-action/70" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between">
                  <Link to="/signals" onClick={() => setDomain(d.key)}>
                    <Button size="sm" className="bg-action text-action-foreground hover:bg-action/90">
                      Enter
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <span className="text-[11px] text-muted-foreground">~30s to first signal</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-auto pt-12 text-xs text-muted-foreground">
          <span className="font-display tracking-wider">v0 · UI mock</span> — every page is fully
          interactive but uses local fixtures.
        </footer>
      </div>
    </div>
  );
}
