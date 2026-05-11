import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDataSource } from "@/lib/data/source";
import { AgentEngine, type EngineEvent } from "@/lib/agents/engine";
import type { AgentName, AgentState, MissionLogEntry } from "@/lib/data/types";

export interface UseMissionResult {
  log: MissionLogEntry[];
  agentStates: Record<AgentName, AgentState>;
  isRunning: boolean;
  runMission: (domainId: string) => void;
  reset: () => void;
}

const initialAgents = (): Record<AgentName, AgentState> => ({
  Scout: "idle",
  Analyst: "idle",
  Strategist: "idle",
  Architect: "idle",
  Sentinel: "idle",
  System: "idle",
});

export function useMission(): UseMissionResult {
  const ds = useMemo(() => getDataSource(), []);
  const [log, setLog] = useState<MissionLogEntry[]>([]);
  const [agentStates, setAgentStates] = useState<Record<AgentName, AgentState>>(initialAgents);
  const [isRunning, setIsRunning] = useState(false);
  const engineRef = useRef<AgentEngine | null>(null);

  useEffect(() => {
    const handler = (e: EngineEvent) => {
      if (e.type === "log") setLog((prev) => [...prev, e.entry]);
      else if (e.type === "agent-state")
        setAgentStates((prev) => ({ ...prev, [e.agent]: e.state }));
      else if (e.type === "complete") setIsRunning(false);
    };
    engineRef.current = new AgentEngine(ds, handler);
    return () => engineRef.current?.abort();
  }, [ds]);

  const runMission = useCallback(
    (domainId: string) => {
      if (!engineRef.current) return;
      setLog([]);
      setAgentStates(initialAgents());
      setIsRunning(true);
      void engineRef.current.run(domainId);
    },
    [],
  );

  const reset = useCallback(() => {
    engineRef.current?.abort();
    setLog([]);
    setAgentStates(initialAgents());
    setIsRunning(false);
  }, []);

  return { log, agentStates, isRunning, runMission, reset };
}
