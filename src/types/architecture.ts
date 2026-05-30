export type ArchitectureNodeType =
  | "user"
  | "frontend"
  | "api"
  | "service"
  | "database"
  | "storage"
  | "ai"
  | "queue"
  | "security"
  | "external"
  | "unknown";

export type ArchitectureEdgeType = "sync" | "async" | "data" | "control" | "unknown";

export type ArchitectureGroupType = "layer" | "boundary" | "cloud" | "domain";

export type LayoutDirection = "LR" | "TD" | "TB";

export type ArchitectureNode = {
  id: string;
  label: string;
  rawLabel?: string;
  type: ArchitectureNodeType;
  groupId?: string;
  icon?: string;
  technology?: string;
  description?: string;
  color?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
};

export type ArchitectureEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: ArchitectureEdgeType;
};

export type ArchitectureGroup = {
  id: string;
  label: string;
  type?: ArchitectureGroupType;
  color?: string;
  nodeIds: string[];
  zIndex?: number;
};

export type ArchitectureModel = {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  groups: ArchitectureGroup[];
};

export type ThemeId =
  | "executive-blue"
  | "minimal-white"
  | "dark-enterprise"
  | "cloud-architecture"
  | "boardroom-presentation";

export type ArchitectureTheme = {
  id: ThemeId;
  name: string;
  canvas: string;
  panel: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  edge: string;
  groupFill: string;
  groupBorder: string;
  nodeFill: string;
  nodeBorder: string;
  badgeFill: string;
  badgeText: string;
  shadow: string;
};

export type ArchitectureProject = {
  title?: string;
  description?: string;
  originalMermaid: string;
  model: ArchitectureModel;
  theme: ThemeId;
  layoutDirection: LayoutDirection;
  updatedAt: string;
  polishSuggestions?: string[];
};

export type ParseResult = {
  direction: LayoutDirection;
  nodes: Array<{
    id: string;
    label: string;
    rawLabel?: string;
    groupId?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    operator?: string;
  }>;
  groups: ArchitectureGroup[];
};
