// Tiny global store using React context for Domain + Mode
import { createContext, useContext } from "react";

export type Mode = "work" | "demo";
export type Domain = "health-tech" | "cybersecurity" | "custom";

export interface AppState {
  mode: Mode;
  setMode: (m: Mode) => void;
  domain: Domain;
  setDomain: (d: Domain) => void;
}

export const AppCtx = createContext<AppState | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};

export const domainLabels: Record<Domain, string> = {
  "health-tech": "Health-Tech",
  cybersecurity: "Cybersecurity",
  custom: "Custom JSON",
};
