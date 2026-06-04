import type { MermaidDiagramType } from "../types/architecture";

export type SampleDiagram = {
  id: string;
  name: string;
  description: string;
  diagramType: MermaidDiagramType;
  mermaid: string;
};

export const samples: SampleDiagram[] = [
  {
    id: "ai-rag",
    name: "AI RAG Application",
    description: "Client-facing RAG workflow with managed AI services.",
    diagramType: "flowchart",
    mermaid: `flowchart LR
  User[Business User] --> UI[React Frontend]
  UI --> API[API Gateway]
  API --> Lambda[Lambda Services]
  Lambda --> S3[S3 Document Storage]
  Lambda --> KB[Knowledge Base]
  KB --> OpenSearch[OpenSearch Vector Store]
  Lambda --> DynamoDB[DynamoDB State Store]

  subgraph AI Layer
    KB
    Bedrock[Amazon Bedrock]
    OpenSearch
  end

  subgraph Data Layer
    S3
    DynamoDB
  end

  Lambda --> Bedrock`
  },
  {
    id: "enterprise-web",
    name: "Enterprise Web Application",
    description: "Secure customer portal with API and data tier.",
    diagramType: "flowchart",
    mermaid: `flowchart TD
  Customer[Customer] --> CDN[Cloud CDN]
  CDN --> Web[Angular Portal]
  Web --> WAF[Web Application Firewall]
  WAF --> Gateway[REST API Gateway]
  Gateway --> Auth[OAuth Identity Provider]
  Gateway --> Orders[Order Service]
  Gateway --> Billing[Billing Service]
  Orders --> Postgres[Postgres Database]
  Billing --> Payments[External Payment Vendor]
  Orders --> Cache[Redis Cache]
  Orders --> Audit[Audit Event Queue]

  subgraph Application Services
    Orders
    Billing
    Cache
  end

  subgraph Security Boundary
    WAF
    Auth
  end`
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline",
    description: "Batch and streaming analytics architecture.",
    diagramType: "flowchart",
    mermaid: `flowchart LR
  Sources[External Data Sources] --> Ingest[Ingestion API]
  Apps[Operational Apps] --> Stream[EventBridge Stream]
  Ingest --> Raw[S3 Raw Zone]
  Stream --> Raw
  Raw --> ETL[Glue ETL Jobs]
  ETL --> Curated[S3 Curated Zone]
  Curated --> Warehouse[Snowflake Data Warehouse]
  Warehouse --> BI[Executive BI Dashboards]
  Curated --> FeatureStore[Feature Store]
  FeatureStore --> ML[ML Training Pipeline]
  ML --> Registry[Model Registry]

  subgraph Lakehouse
    Raw
    ETL
    Curated
    Warehouse
  end

  subgraph ML Layer
    FeatureStore
    ML
    Registry
  end`
  },
  {
    id: "product-mindmap",
    name: "Product Mind Map",
    description: "Feature planning hierarchy mapped onto an editable canvas.",
    diagramType: "mindmap",
    mermaid: `mindmap
  root((ArchForge Roadmap))
    Mermaid modules
      Mind maps
      Sequence diagrams
      Class diagrams
      ER diagrams
    Canvas editing
      Drag nodes
      Rename relationships
      Export assets
    Quality
      Validation
      Layout checks
      Browser QA`
  },
  {
    id: "checkout-sequence",
    name: "Checkout Sequence",
    description: "Participants and messages imported from a sequence diagram.",
    diagramType: "sequence",
    mermaid: `sequenceDiagram
  actor Customer
  participant UI as Web Portal
  participant API as Checkout API
  participant Pay as Payment Provider
  participant DB as Orders Database
  Customer->>UI: Submit cart
  UI->>API: Create checkout session
  API->>Pay: Authorize payment
  Pay-->>API: Authorization result
  API->>DB: Save order
  API-->>UI: Confirmation
  UI-->>Customer: Receipt`
  },
  {
    id: "domain-class",
    name: "Domain Class Model",
    description: "Classes and relationships from a Mermaid class diagram.",
    diagramType: "class",
    mermaid: `classDiagram
  Customer --> Order : places
  Order *-- LineItem : contains
  Order --> Payment : paid by
  Product --> LineItem : selected as
  class Customer
  class Order
  class LineItem
  class Payment
  class Product`
  },
  {
    id: "order-state",
    name: "Order State Machine",
    description: "States and transitions imported from a state diagram.",
    diagramType: "state",
    mermaid: `stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted: submit
  Submitted --> Paid: payment authorized
  Submitted --> Cancelled: cancel
  Paid --> Fulfilled: ship
  Fulfilled --> [*]
  Cancelled --> [*]`
  },
  {
    id: "commerce-er",
    name: "Commerce ER Model",
    description: "Entities and relationships from an ER diagram.",
    diagramType: "er",
    mermaid: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : appears_in
  ORDER ||--o| PAYMENT : paid_by
  CUSTOMER {
    string id
    string email
  }
  ORDER {
    string id
    date created_at
  }
  LINE_ITEM {
    string sku
    int quantity
  }`
  }
];
