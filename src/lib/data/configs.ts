// Seed configs ported from mayukhg/my-signals-app/src/config.json
// One per domain. Swap-in friendly: a Lovable Cloud `domain_configs` table
// would return rows of this exact shape.
import type { DomainConfig, SignalRecord, RoadmapRecord } from "./types";

export const domainConfigs: Record<string, DomainConfig> = {
  "health-tech": {
    id: "health-tech",
    industry: "Health-Tech / Cybersecurity",
    compliance_standards: ["ABDM M2/M3", "OWASP Top 10", "HIPAA"],
    judge_rubrics: [
      "Clinical Accuracy",
      "ABDM Terminology",
      "Will-Protocol Adherence",
      "Security Hardening",
    ],
  },
  cybersecurity: {
    id: "cybersecurity",
    industry: "Enterprise Cybersecurity",
    compliance_standards: ["OWASP Top 10", "NIST 800-53", "ISO 27001"],
    judge_rubrics: [
      "Exploitability Analysis",
      "Patch Safety",
      "Will-Protocol Adherence",
      "Security Hardening",
    ],
  },
};

// Initial signal seeds, normalised from source config.json + extended
export const seedSignals: SignalRecord[] = [
  {
    id: "sig-1",
    domainId: "health-tech",
    type: "Regulatory",
    label: "ABDM M3 Data Residency Update",
    source: "Gov Gazette",
    intensity: 9,
    severity: "critical",
    freshness: "12m ago",
    agent: "Scout",
    summary:
      "New residency clause mandates in-country PII isolation for Identity Vault tenants.",
  },
  {
    id: "sig-2",
    domainId: "health-tech",
    type: "Competitive",
    label: "Competitor 'X' App Performance Dip",
    source: "Social Sentiment",
    intensity: 7,
    severity: "high",
    freshness: "38m ago",
    agent: "Scout",
    summary: "Net-new churn signal in remote-monitoring tier; 14d window.",
  },
  {
    id: "sig-3",
    domainId: "cybersecurity",
    type: "Threat",
    label: "Spring4Shell-V2 chatter spike on dark-web forums",
    source: "Dark-Web Telemetry",
    intensity: 9,
    severity: "critical",
    freshness: "5m ago",
    agent: "Scout",
    summary: "Cross-references ABDM Identity Vault schema. Likely 24h vuln window.",
  },
];

export const seedRoadmap: RoadmapRecord[] = [
  {
    id: "rm-1",
    domainId: "health-tech",
    feature: "ABDM Identity Vault (Zero-Trust)",
    status: "Priority 1",
    logic: "PII/Clinical Decoupling",
    basePriority: 1,
    currentPriority: 1,
    delta: 0,
  },
  {
    id: "rm-2",
    domainId: "health-tech",
    feature: "Sentinel Audit API",
    status: "Priority 2",
    logic: "Dual-Model Gemini Validation",
    basePriority: 2,
    currentPriority: 2,
    delta: 0,
  },
  {
    id: "rm-3",
    domainId: "health-tech",
    feature: "Social Share UI",
    status: "Priority 3",
    logic: "Growth experiment",
    basePriority: 3,
    currentPriority: 3,
    delta: 0,
  },
];
