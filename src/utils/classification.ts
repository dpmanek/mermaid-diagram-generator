import type { ArchitectureNodeType } from "../types/architecture";

const rules: Array<{ type: ArchitectureNodeType; terms: string[] }> = [
  { type: "user", terms: ["user", "client", "admin", "business user", "customer", "operator"] },
  { type: "frontend", terms: ["react", "angular", "ui", "frontend", "front end", "portal", "web app", "spa"] },
  { type: "api", terms: ["api", "gateway", "rest", "endpoint", "graphql", "bff"] },
  { type: "service", terms: ["lambda", "service", "backend", "worker", "function", "processor", "orchestrator"] },
  { type: "database", terms: ["dynamodb", "mongodb", "sql", "postgres", "mysql", "database", "db", "state store"] },
  { type: "storage", terms: ["s3", "blob", "file", "document storage", "storage", "bucket", "lake"] },
  { type: "ai", terms: ["bedrock", "openai", "llm", "rag", "knowledge base", "vector", "embedding", "opensearch", "model", "agent"] },
  { type: "queue", terms: ["kafka", "sqs", "queue", "eventbridge", "event bus", "pubsub", "stream"] },
  { type: "security", terms: ["auth", "iam", "oauth", "sso", "security", "identity", "policy", "guardrail"] },
  { type: "external", terms: ["vendor", "external", "third party", "third-party", "partner", "saas"] }
];

function matchesTerm(label: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^[a-z0-9]+$/.test(term) && term.length <= 4) {
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(label);
  }
  return label.includes(term);
}

export function classifyNode(label: string): ArchitectureNodeType {
  const normalized = label.toLowerCase();
  return rules.find((rule) => rule.terms.some((term) => matchesTerm(normalized, term)))?.type ?? "unknown";
}

export function edgeTypeFromLabel(label?: string) {
  const normalized = (label ?? "").toLowerCase();
  if (["event", "async", "message", "publish", "subscribe"].some((term) => normalized.includes(term))) return "async";
  if (["data", "read", "write", "sync", "replicate"].some((term) => normalized.includes(term))) return "data";
  if (["control", "policy", "command"].some((term) => normalized.includes(term))) return "control";
  return "sync";
}

export const nodeTypeOptions: ArchitectureNodeType[] = [
  "user",
  "frontend",
  "api",
  "service",
  "database",
  "storage",
  "ai",
  "queue",
  "security",
  "external",
  "unknown"
];
