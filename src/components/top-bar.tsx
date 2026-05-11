import { useApp, domainLabels } from "@/lib/app-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Eye, Compass, GitFork, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { key: "observe", label: "Observe", agent: "Scout", icon: Eye, color: "bg-observe" },
  { key: "orient", label: "Orient", agent: "Analyst", icon: Compass, color: "bg-orient" },
  { key: "decide", label: "Decide", agent: "Architect", icon: GitFork, color: "bg-decide" },
  { key: "act", label: "Act", agent: "Sentinel", icon: Zap, color: "bg-act" },
] as const;

export function TopBar({ activeStage = "observe" }: { activeStage?: string }) {
  const { mode, setMode, domain, setDomain } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur">
      <SidebarTrigger />

      {/* Domain pill */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 font-display text-xs">
            <span className="h-2 w-2 rounded-full bg-success" />
            {domainLabels[domain]}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setDomain("health-tech")}>Health-Tech</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDomain("cybersecurity")}>Cybersecurity</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDomain("custom")}>Custom JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* OODA rail */}
      <div className="hidden items-center gap-1 rounded-md border bg-card/60 p-1 md:flex">
        {stages.map((s, i) => {
          const isActive = s.key === activeStage;
          return (
            <div key={s.key} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
                  isActive ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                <s.icon className="h-3 w-3" />
                <span className="font-display tracking-tight">{s.label}</span>
                <span className="text-[10px] opacity-60">·{s.agent}</span>
              </div>
              {i < stages.length - 1 && (
                <span className="px-0.5 text-[10px] text-muted-foreground">›</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search signals, ADRs, prototypes…  ⌘K"
          className="h-8 w-72 pl-8 font-display text-xs"
        />
      </div>

      {/* Work / Demo toggle */}
      <div className="flex items-center rounded-md border bg-card p-0.5">
        {(["work", "demo"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded px-2.5 py-1 font-display text-[11px] uppercase tracking-wider transition-colors",
              mode === m
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </header>
  );
}
