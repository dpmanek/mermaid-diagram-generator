import type { ArchitectureNodeType } from "../types/architecture";

export const defaultIconByType: Record<ArchitectureNodeType, string> = {
  user: "Users",
  frontend: "MonitorSmartphone",
  api: "Network",
  service: "Cpu",
  database: "Database",
  storage: "HardDrive",
  ai: "BrainCircuit",
  queue: "ListTree",
  security: "ShieldCheck",
  external: "Globe2",
  unknown: "Box"
};

export const iconOptions = [
  "Box",
  "Users",
  "MonitorSmartphone",
  "Network",
  "Cpu",
  "Database",
  "HardDrive",
  "BrainCircuit",
  "ListTree",
  "ShieldCheck",
  "Globe2",
  "Cloud",
  "Server",
  "Workflow",
  "LockKeyhole",
  "FileText",
  "Cable",
  "Layers3"
];

export const colorOptions = [
  { name: "Slate", value: "#475569" },
  { name: "Blue", value: "#2563eb" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Emerald", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" }
];
