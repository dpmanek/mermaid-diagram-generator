export type SampleDiagram = {
  id: string;
  name: string;
  description: string;
  mermaid: string;
};

export const samples: SampleDiagram[] = [
  {
    id: "ai-rag",
    name: "AI RAG Application",
    description: "Client-facing RAG workflow with managed AI services.",
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
  }
];
