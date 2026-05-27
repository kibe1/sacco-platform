# SACCO Platform Technical Specification

## 1. Document Control

### 1.1 Purpose

This document defines the enterprise technical specification for a modern SACCO platform rebuilt from a tightly coupled legacy system into an API-first, cloud-ready, microservice-based architecture.

The specification is intended for:

- Enterprise architecture planning
- Developer onboarding
- Future implementation guidance
- Infrastructure and DevOps planning
- Security, compliance, and operational review
- Investor and technical due diligence

This document does not define implementation code. It establishes the architectural direction, service responsibilities, integration patterns, deployment approach, and production-readiness requirements required to support web, mobile app, USSD, and PWA channels at national scale.

### 1.2 Target Platform Summary

The platform shall provide configurable SACCO operations across multiple tenants and support more than 1 million members. It shall be modular, secure, auditable, scalable, and capable of integrating with payment providers, mobile money rails, SMS gateways, email gateways, accounting systems, credit scoring providers, and regulatory reporting systems.

### 1.3 Core Technology Stack

| Layer | Target Technology |
| --- | --- |
| Web and PWA | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| State and Data Fetching | Zustand, TanStack Query |
| Forms and Validation | React Hook Form, Zod |
| Backend Services | Spring Boot microservices |
| API Edge | API Gateway |
| Identity and access management | Keycloak preferred, or equivalent OIDC/OAuth2 IAM provider |
| Authentication | JWT-based authentication with refresh tokens and MFA support |
| Database | PostgreSQL |
| Messaging | Kafka where asynchronous event-driven behavior is required |
| Runtime Packaging | Docker |
| Local Orchestration | Docker Compose |
| Production Orchestration | Kubernetes-ready architecture |

### 1.4 Primary Architectural Goals

- Support over 1 million SACCO members with predictable performance.
- Support multiple tenants from the start without retrofitting tenancy later.
- Provide reusable APIs for web, PWA, mobile app, USSD, and third-party integrations.
- Keep business capabilities decoupled through microservice boundaries.
- Make tenant branding, workflows, fees, approvals, products, and business rules configurable.
- Provide strong financial-system security, auditability, and traceability.
- Support high availability, disaster recovery, observability, and operational control.
- Enable independent deployment and scaling of services.

### 1.5 Non-Goals

The following are outside the scope of this technical specification:

- UI mockups and final visual design.
- Database DDL implementation scripts.
- Service source code.
- Provider-specific integration code.
- Exact cloud vendor selection.
- Final production sizing and cost model.

## 2. System Overview

### 2.1 Business Context

The SACCO platform manages the digital operations of savings and credit cooperative organizations. It must support member onboarding, savings contributions, withdrawals, loans, wallets, payments, accounting, reports, notifications, audit trails, tenant configuration, branch operations, and administration.

The system must allow different SACCO tenants to operate independently while sharing a common platform foundation. Each tenant may configure branding, products, workflows, fees, roles, approval rules, communication templates, and operational policies.

### 2.2 Supported Channels

The system shall support the following channels:

| Channel | Description |
| --- | --- |
| Web | Full-featured administrative, staff, and member portal built with Next.js |
| Mobile App | Native or cross-platform consumer-facing mobile application using the platform APIs |
| PWA | Installable web experience with responsive layout, offline-aware behavior, and push-notification readiness |
| USSD | Low-bandwidth transactional channel for feature-phone access |
| Third-Party APIs | Partner, payment, reporting, and integration endpoints exposed through controlled API contracts |

### 2.3 High-Level Capabilities

- Tenant onboarding and configuration
- User, role, permission, and access management
- Member registration, KYC, lifecycle, and profile management
- Savings account and product management
- Loan product, application, approval, disbursement, repayment, and arrears management
- Wallet and ledger-backed transaction processing
- Payment gateway and mobile money integration
- Accounting entries, journals, reconciliation, and financial reporting
- Notifications through SMS, email, push, and in-app channels
- USSD menu, session, and transaction workflows
- Audit logging and operational traceability
- Reporting, dashboards, and data export
- Configurable business rules and approval workflows

## 3. Architecture Overview

### 3.1 Architectural Style

The platform shall use a decoupled microservice architecture with an API-first design. Services shall own their domain logic and data. Communication shall use synchronous APIs for request-response workflows and asynchronous events for long-running, cross-service, or high-volume processes.

The architecture shall avoid a monolithic application and shall keep clear separation between:

- Frontend applications
- API gateway and edge controls
- Backend microservices
- Domain databases and schemas
- Messaging infrastructure
- Observability infrastructure
- Deployment and runtime infrastructure

### 3.2 Logical Architecture

At a logical level, the platform shall contain:

- Client channels: web, PWA, mobile app, USSD, and third-party systems.
- Edge layer: API gateway, routing, rate limiting, TLS termination, request validation, and token verification.
- Identity layer: authentication, authorization, session, and MFA services.
- Domain services: member, savings, loans, wallet, accounting, payments, notifications, reports, audit, configuration, and tenant services.
- Integration layer: payment providers, SMS providers, email providers, push notification services, credit bureaus, and regulatory systems.
- Data layer: PostgreSQL-backed service data stores, object storage, cache, and reporting data stores.
- Event backbone: Kafka for durable asynchronous communication.
- Platform layer: Kubernetes, CI/CD, secrets, monitoring, logging, tracing, and backup systems.

### 3.3 Core Design Principles

- Services must be independently deployable.
- Services must expose clear contracts and avoid leaking internal database structures.
- Each service must own its domain data and business rules.
- Shared libraries must be minimal and limited to cross-cutting concerns such as tracing, error formats, authentication helpers, and common API conventions.
- Cross-service calls must be explicit and observable.
- Tenant boundaries must be enforced at API, service, and data layers.
- Financial transactions must be idempotent, auditable, and traceable.
- Configuration must be externalized and tenant-aware.
- Sensitive operations must require authorization checks, audit records, and operational safeguards.

### 3.4 Service Boundary Strategy

Service boundaries shall follow business capabilities rather than technical layers. Each service shall encapsulate:

- Domain rules
- Domain APIs
- Domain data model
- Validation rules
- Event publication and consumption
- Audit participation
- Operational metrics

Services shall not directly query another service's database. Data duplication for read models, reports, search, or channel-specific views shall be achieved through published events or controlled APIs.

## 4. Frontend Architecture

### 4.1 Frontend Applications

The primary web platform shall be built with Next.js and TypeScript. It shall support administrative users, SACCO staff, and members through role-aware layouts and permission-controlled navigation.

The frontend architecture shall support:

- Server-rendered and client-rendered pages where appropriate.
- Responsive layouts for desktop, tablet, and mobile.
- PWA capabilities for installability and resilient usage.
- Tenant-aware branding and theming.
- API-driven configuration of menus, features, and workflows.
- Strict typing and schema validation.
- Reusable enterprise UI components.

### 4.2 Application Shell

The web platform shall use an application shell that provides:

- Tenant logo and name
- Role-aware navigation
- Global search where permitted
- Notification center
- User profile and session controls
- Language and accessibility settings where required
- Theme mode support
- Tenant-specific color and layout configuration

The application shell shall be loaded after tenant and user context are resolved.

### 4.3 State Management

Frontend state shall be separated into:

- Server state: API data managed with TanStack Query.
- Client state: UI state, session-adjacent state, and preferences managed with Zustand.
- Form state: data entry workflows managed with React Hook Form and validated with Zod.

The frontend shall avoid duplicating backend business rules. Client validation shall improve user experience, while backend services remain the source of truth.

### 4.4 PWA Requirements

The PWA layer shall support:

- Installable manifest
- Responsive mobile-first experience
- Service worker strategy for selected static assets
- Graceful offline and poor-network states
- Background sync readiness for future supported workflows
- Push notification readiness where provider and device support exist

Financial transactions shall not be finalized offline unless a future formally approved offline transaction protocol is designed. Offline behavior shall be limited to safe read-only caching, draft capture, and clear sync status indicators.

### 4.5 Mobile App Integration

The mobile app shall consume the same API platform through the API gateway. Mobile-specific needs may be handled through:

- Versioned public APIs
- Mobile BFF endpoints where aggregation is necessary
- Device registration APIs
- Push notification token management
- Biometric unlock integration at the app layer
- Secure refresh token handling

The backend shall not assume that the mobile app is trusted. All authorization and validation must occur server-side.

### 4.6 Frontend Security

Frontend security requirements include:

- Secure token storage strategy based on channel risk.
- Protection against cross-site scripting.
- CSRF protections where cookie-based auth is used.
- Permission-based route and component rendering.
- Session timeout and idle timeout handling.
- Sensitive data masking based on role and context.
- Strict Content Security Policy for production.
- Dependency scanning and frontend supply-chain controls.

## 5. Backend Microservices Architecture

### 5.1 Service Catalog

The initial platform shall include the following core services:

| Service | Primary Responsibility |
| --- | --- |
| gateway-service | API routing, edge policies, request controls, external API entry point |
| auth-service | Platform authentication facade, Keycloak/OIDC integration, token/session coordination, MFA orchestration |
| tenant-service | Tenant lifecycle, tenant metadata, subscription state, tenant isolation configuration |
| user-service | Users, staff accounts, roles, permissions, access profiles |
| member-service | Member onboarding, KYC, member profiles, lifecycle events |
| savings-service | Savings products, member savings accounts, contributions, withdrawals |
| loan-service | Loan products, applications, approvals, disbursements, repayment schedules |
| wallet-service | Wallet accounts, balances, holds, internal transfers, transaction orchestration |
| accounting-service | Ledger, journals, chart of accounts, postings, reconciliation support |
| payment-service | External payment provider integration, callbacks, settlement tracking |
| notification-service | SMS, email, push, in-app messages, templates, delivery status |
| report-service | Operational reports, exports, dashboards, data marts/read models |
| ussd-service | USSD sessions, menus, transaction flows, telco gateway integration |
| audit-service | Immutable audit events, access logs, business action traceability |
| configuration-service | Tenant-specific rules, workflows, products, fees, limits, templates |

### 5.2 Service Design Requirements

Each backend service shall:

- Be implemented as an independent Spring Boot application.
- Own its business logic and persistence boundaries.
- Provide versioned REST APIs where synchronous access is required.
- Publish and consume Kafka events where asynchronous workflows are appropriate.
- Include health, readiness, and liveness endpoints.
- Produce structured logs with correlation identifiers.
- Emit metrics for latency, throughput, error rates, and domain counters.
- Enforce tenant context and authorization checks.
- Support idempotency for externally triggered financial operations.
- Use DTOs and service layers to separate API contracts from internal models.

### 5.3 Clean Architecture Expectations

Services shall separate:

- API controllers
- Request and response DTOs
- Application services
- Domain services
- Domain models
- Persistence adapters
- Integration adapters
- Event producers and consumers
- Configuration and security concerns

The system shall avoid embedding business rules directly in controllers, database triggers, or UI components unless the rule is purely presentational.

### 5.4 Synchronous Communication

Synchronous service APIs shall be used for:

- User-facing read operations
- Immediate validation checks
- Session-driven workflows
- Low-latency commands that need immediate response
- Aggregated views where read models are not yet available

Synchronous calls must use timeouts, retries with care, and circuit breakers. Services must not form deep chains of synchronous dependencies for critical user flows.

### 5.5 Asynchronous Communication

Asynchronous events shall be used for:

- Audit event capture
- Notification dispatch
- Reporting projections
- Payment status updates
- Accounting postings after business transactions
- Long-running workflows
- Cross-service state propagation
- High-volume transaction processing

Events must be versioned, durable, and traceable. Consumers must be idempotent.

## 6. API Gateway Strategy

### 6.1 Gateway Responsibilities

The API gateway shall act as the controlled entry point for all external clients. It shall provide:

- TLS termination
- Routing to backend services
- JWT validation
- Tenant resolution
- Rate limiting and throttling
- Request size limits
- Basic request validation
- API version routing
- Correlation ID propagation
- IP allowlisting for sensitive partner APIs
- Edge-level access policies
- API usage metrics

### 6.2 API Segmentation

APIs shall be segmented by audience:

| API Segment | Consumers |
| --- | --- |
| Admin APIs | Platform operators and tenant administrators |
| Staff APIs | SACCO employees and branch staff |
| Member APIs | Members using web, PWA, or mobile app |
| USSD APIs | USSD gateway and USSD service internals |
| Partner APIs | Payment providers, integration partners, regulatory systems |
| Internal APIs | Service-to-service communication inside the platform boundary |

### 6.3 Versioning Strategy

APIs shall use explicit versioning. Breaking changes must be introduced through new API versions, while old versions remain available during a controlled deprecation period.

Versioning shall account for:

- Web frontend releases
- Mobile app backward compatibility
- Partner integration stability
- USSD flow compatibility

### 6.4 API Contract Standards

API contracts shall define:

- Resource naming conventions
- Request and response schemas
- Error response format
- Pagination and sorting conventions
- Filtering conventions
- Idempotency key behavior
- Authentication requirements
- Authorization requirements
- Rate limits
- Audit requirements

## 7. Authentication and Authorization

### 7.1 Authentication Model

The platform shall use Keycloak as the preferred identity and access management provider, or an equivalent standards-compliant OIDC/OAuth2 IAM service if the final infrastructure decision changes. Authentication shall use short-lived JWT access tokens with controlled refresh token rotation.

The auth-service shall act as the platform authentication facade and IAM integration boundary. It must not become a place for unrelated domain authorization or member business logic. It shall be responsible for:

- Login
- Logout
- Token issuance
- Token refresh
- Password lifecycle
- MFA orchestration
- Session tracking
- Credential lockout policies
- Device/session revocation
- Keycloak/OIDC realm, client, claim, and token validation integration

Keycloak or the selected IAM provider shall own core identity-provider responsibilities such as credential verification, OIDC/OAuth2 flows, token signing keys, realm/client configuration, identity federation where required, and standard IAM security policies. Platform services shall consume validated identity, tenant, role, permission, and session context through the gateway and auth-service boundary.

### 7.2 Identity Types

The platform shall support multiple identity types:

- Platform administrator
- Tenant administrator
- SACCO staff user
- Branch staff user
- Member
- USSD member session
- Service account
- Partner integration client

Each identity type shall have clear authentication methods and authorization scopes.

### 7.3 Authorization Model

Authorization shall combine:

- Role-based access control for broad operational privileges
- Permission-based access control for fine-grained operations
- Tenant-based isolation
- Branch or organizational-unit scoping where required
- Transaction limits and approval thresholds
- Context-aware controls for sensitive operations

Examples of sensitive operations include loan approval, loan disbursement, withdrawal approval, member profile changes, KYC verification, user role assignment, fee configuration, and accounting adjustments.

### 7.4 MFA and Step-Up Authentication

The system shall support MFA for:

- Administrators
- Staff users with financial permissions
- High-value member transactions
- New device login
- Sensitive configuration changes

Step-up authentication may be required for actions that exceed configured risk thresholds.

### 7.5 Service-to-Service Authentication

Internal services shall authenticate with service credentials or workload identity patterns. Service-to-service calls must not rely solely on network location. Internal APIs shall validate service identity and authorization scopes.

Where Keycloak is used, service accounts or client credentials may be used for approved internal service integrations. Internal service authentication must still preserve tenant context, correlation IDs, and audit context for tenant-owned or sensitive workflows.

## 8. Multi-Tenancy Architecture

### 8.1 Tenancy Model

The platform shall be multi-tenant from inception. Each tenant represents a SACCO or institution using the platform.

The tenancy architecture shall support:

- Tenant-level data isolation
- Tenant-specific configuration
- Tenant-specific branding
- Tenant-specific workflows
- Tenant-specific roles and permissions
- Tenant-specific feature enablement
- Tenant-specific rate limits and quotas

### 8.2 Tenant Resolution

Tenant context may be resolved through:

- Subdomain
- Custom domain
- Request header from trusted gateway
- Auth token claim
- USSD short code or menu mapping
- Mobile app selected tenant context

The gateway and backend services shall propagate a trusted tenant identifier throughout the request lifecycle.

### 8.3 Data Isolation Options

The recommended initial model is PostgreSQL service-owned schemas or tables with strict `tenant_id` partitioning and indexes, combined with service-level enforcement. For higher isolation tenants, the architecture should allow evolution toward schema-per-tenant or database-per-tenant where justified by scale, regulation, or commercial tier.

| Model | Use Case | Considerations |
| --- | --- | --- |
| Shared database with tenant partitioning | Default multi-tenant scale model | Efficient operations, requires strict enforcement |
| Schema per tenant | Higher isolation or operational separation | More migration complexity |
| Database per tenant | Regulated or large enterprise tenants | Higher cost and operational overhead |

### 8.4 Tenant Configuration

Tenant configuration shall include:

- Branding: logo, colors, theme, menu labels
- Feature flags
- Product definitions
- Savings rules
- Loan products and eligibility rules
- Fees and charges
- Approval workflows
- Transaction limits
- Notification templates
- USSD menus
- Branches and organizational units
- Accounting mappings

Configuration changes must be audited and versioned where they affect financial behavior.

### 8.5 Tenant Isolation Controls

Tenant isolation must be enforced through:

- Gateway tenant resolution
- Auth token tenant claims
- Service-level tenant validation
- Database query tenant constraints
- Tenant-scoped cache keys
- Tenant-scoped object storage paths
- Tenant-aware event payloads and topics or partition keys
- Tenant-aware observability labels

## 9. Database Architecture

### 9.1 Database Strategy

PostgreSQL shall be the primary relational database platform. The system shall use service-owned databases or service-owned schemas depending on deployment maturity and operational model.

Financial domains must prioritize consistency, integrity, and auditability. Database design shall use:

- Strong primary and foreign keys within service boundaries
- Explicit tenant keys
- Appropriate unique constraints
- Indexed query paths
- Transactional writes for financial state changes
- Optimistic locking where concurrent updates are expected
- Append-only ledger patterns for financial records

### 9.2 Service Data Ownership

Each microservice shall own its database objects. Services shall not directly access another service's tables. Shared reporting data shall be built through replicated read models or event-driven projections.

### 9.3 Core Data Domains

| Domain | Key Data Areas |
| --- | --- |
| Tenant | Tenant profile, domains, status, subscription, feature flags |
| User | Users, roles, permissions, branches, staff assignments |
| Member | Member profile, KYC, next of kin, documents, member status |
| Savings | Savings products, accounts, contributions, withdrawals, interest |
| Loans | Loan products, applications, approvals, schedules, arrears |
| Wallet | Wallet accounts, balances, holds, internal transactions |
| Accounting | Chart of accounts, ledger entries, journals, reconciliation |
| Payments | Payment requests, callbacks, provider references, settlements |
| Notifications | Templates, dispatch logs, delivery statuses |
| Audit | User actions, system actions, security events, data changes |
| Configuration | Business rules, workflow definitions, fee schedules |

### 9.4 Indexing and Query Performance

Tables expected to grow significantly shall include indexes for:

- Tenant identifier
- Member identifier
- Account identifier
- Transaction reference
- External payment reference
- Status fields used in queues or operational dashboards
- Created and updated timestamps
- Branch or organizational unit where used in filtering

Composite indexes shall match real query patterns. Index design must balance read performance against write throughput.

### 9.5 Partitioning

Large transaction tables shall be designed for future partitioning by:

- Tenant
- Date range
- Transaction type
- Service domain

Partitioning candidates include ledger entries, wallet transactions, payment callbacks, audit logs, notification logs, and USSD sessions.

### 9.6 Data Consistency

The platform shall use strong consistency inside a service boundary and eventual consistency across services where asynchronous events are used. Cross-service distributed transactions shall be avoided. Business workflows requiring multiple services shall use saga-style orchestration or choreography with compensating actions.

### 9.7 Ledger and Financial Integrity

Financial records shall follow ledger principles:

- Ledger entries must be append-only.
- Corrections must be posted as reversing or adjustment entries.
- Balances should be derived from immutable transaction history or maintained through controlled transactional updates with reconciliation.
- Every financial transaction must have a unique reference.
- Every transaction must be traceable to actor, tenant, source channel, request, and timestamp.
- Idempotency must prevent duplicate postings from retries or provider callbacks.

### 9.8 Data Retention

Data retention policies shall be configurable by data category and regulatory requirement. Audit, financial, KYC, and transaction records typically require long retention periods. Operational logs may use shorter retention with archival to lower-cost storage.

## 10. Messaging and Event-Driven Architecture

### 10.1 Event Backbone

Kafka shall be used where asynchronous, durable, scalable messaging is required. Kafka is not mandatory for every service interaction. It shall be used where it improves reliability, decoupling, throughput, or operational resilience.

### 10.2 Event Categories

| Event Category | Examples |
| --- | --- |
| Domain Events | MemberRegistered, SavingsContributionPosted, LoanApproved |
| Integration Events | PaymentCallbackReceived, ProviderSettlementCompleted |
| Audit Events | UserRoleChanged, LoanDisbursementApproved |
| Notification Events | NotificationRequested, NotificationDelivered |
| Reporting Events | LedgerEntryPosted, MemberStatusChanged |
| Security Events | LoginFailed, MFAChallengeCompleted |

### 10.3 Event Requirements

Events shall include:

- Event ID
- Event type
- Event version
- Tenant ID
- Correlation ID
- Causation ID where applicable
- Actor identity where applicable
- Source service
- Event timestamp
- Payload

Events must be schema-versioned and backward-compatible where possible.

### 10.4 Idempotency and Ordering

Consumers must handle duplicate events safely. Ordering shall be guaranteed only where designed through topic partition keys, such as tenant ID, member ID, account ID, or transaction ID.

### 10.5 Dead Letter Handling

Kafka consumers shall support:

- Retry policies
- Dead letter topics
- Poison message handling
- Alerting on repeated failures
- Manual replay tooling for authorized operators

## 11. File Storage Strategy

### 11.1 Storage Requirements

The platform shall store files such as:

- Member KYC documents
- Profile photos
- Loan attachments
- Signed forms
- Generated statements
- Reports and exports
- Tenant branding assets

### 11.2 Storage Architecture

File binaries shall not be stored directly in relational database tables except for small controlled metadata. The recommended architecture is object storage with database metadata records.

Metadata shall include:

- Tenant ID
- Owner entity type and ID
- File category
- MIME type
- Size
- Hash/checksum
- Storage key
- Upload actor
- Upload timestamp
- Retention category
- Access policy

### 11.3 Security Controls

File access must use:

- Tenant-scoped paths
- Authorization checks before issuing file access
- Time-limited signed URLs where applicable
- Malware scanning for uploaded documents
- File type validation
- Size limits
- Encryption at rest
- Audit logging for sensitive file access

## 12. Reporting Architecture

### 12.1 Reporting Objectives

Reporting must support operational, financial, compliance, and management reporting without degrading transactional workloads.

### 12.2 Reporting Strategy

The report-service shall provide:

- Standard operational reports
- Financial reports
- Member reports
- Loan portfolio reports
- Savings performance reports
- Payment reconciliation reports
- Tenant administration reports
- Export capabilities
- Dashboard data APIs

### 12.3 Read Models

High-volume or complex reports shall use read-optimized models populated through events or scheduled ETL processes. Transactional services must not be burdened by heavy analytical queries.

### 12.4 Export Handling

Long-running exports shall be asynchronous:

- User requests export.
- Report job is queued.
- Report-service processes the job.
- Generated file is stored in object storage.
- User receives notification when ready.
- Access is audited.

### 12.5 Data Accuracy

Financial reports must clearly define:

- Posting date versus transaction date
- Tenant timezone handling
- Reversal and adjustment treatment
- Pending versus posted states
- Cutoff and reconciliation logic

## 13. Audit and Logging Architecture

### 13.1 Audit Requirements

The platform shall maintain immutable audit records for security-sensitive and business-critical operations. Audit records shall answer:

- Who performed the action?
- What action was performed?
- Which tenant was affected?
- Which entity was affected?
- When did it occur?
- From which channel, IP, device, or service?
- What changed?
- Was the action successful or denied?

### 13.2 Audit Event Sources

Audit events shall be produced by:

- API gateway
- Auth-service
- User-service
- Member-service
- Savings-service
- Loan-service
- Wallet-service
- Accounting-service
- Payment-service
- Configuration-service
- USSD-service
- Administrative tools

### 13.3 Logging Standards

All services shall produce structured logs containing:

- Timestamp
- Log level
- Service name
- Environment
- Tenant ID where available
- Correlation ID
- Request ID
- User or service identity where safe to log
- Operation name
- Error details where applicable

Sensitive data such as passwords, tokens, PINs, OTPs, full identity numbers, and payment secrets must never be logged.

### 13.4 Audit Storage

Audit logs should be immutable or tamper-evident. They may be stored in a dedicated audit database and streamed to centralized log storage. Retention must align with financial and regulatory requirements.

## 14. Notification Architecture

### 14.1 Notification Channels

The notification-service shall support:

- SMS
- Email
- Push notifications
- In-app notifications
- USSD response messaging where appropriate

### 14.2 Notification Flow

Typical notification flow:

1. Domain service publishes notification request event or calls notification API.
2. Notification-service resolves tenant templates and preferences.
3. Notification-service applies channel rules and user preferences.
4. Notification-service dispatches through configured provider.
5. Delivery status is captured and stored.
6. Failures are retried or escalated based on policy.

### 14.3 Templates

Templates shall be tenant-configurable and versioned. Template variables must be validated to prevent missing or unsafe content. Sensitive information must be masked unless explicitly allowed.

### 14.4 Provider Abstraction

The notification-service shall abstract provider integrations to allow different tenants or environments to use different SMS, email, or push providers.

## 15. Payment Integration Architecture

### 15.1 Payment-Service Responsibilities

The payment-service shall manage external payment interactions, including:

- Payment initiation
- Provider request tracking
- Callback processing
- Payment status reconciliation
- Provider reference mapping
- Settlement tracking
- Error handling and retry logic
- Provider-specific credential management

### 15.2 Supported Payment Patterns

The architecture shall support:

- Mobile money deposits
- Mobile money withdrawals
- Loan repayments
- Savings contributions
- Wallet top-ups
- Bulk disbursements
- Provider callbacks
- Manual reconciliation
- Settlement file processing

### 15.3 Idempotency

Payment workflows must be idempotent. The payment-service shall reject or safely return the existing state for duplicate requests with the same idempotency key, provider reference, or transaction reference.

### 15.4 Callback Security

Provider callbacks shall be secured through:

- Signature validation where supported
- IP allowlisting where practical
- Shared secret or mTLS where available
- Replay protection
- Timestamp validation
- Strict schema validation
- Dedicated callback endpoints
- Audit logging

### 15.5 Reconciliation

Payment reconciliation shall compare:

- Internal payment records
- Provider callback records
- Settlement reports
- Accounting entries
- Wallet or savings postings

Discrepancies must be visible through operational dashboards and require controlled resolution workflows.

## 16. USSD Architecture

### 16.1 USSD-Service Responsibilities

The ussd-service shall handle:

- Telco gateway integration
- USSD session lifecycle
- Menu rendering
- Tenant resolution from short code or routing metadata
- Member identification
- PIN or OTP validation flows
- Transaction flow orchestration
- Timeout handling
- Localization readiness
- Audit and trace logging

### 16.2 USSD Design Constraints

USSD flows must account for:

- Short session durations
- Limited screen size
- Low bandwidth
- No persistent client storage
- Numeric input
- Telco retry behavior
- Session interruptions
- High concurrency during peak periods

### 16.3 USSD Security

USSD security shall include:

- PIN-based authentication or OTP-based verification where appropriate
- Rate limits on failed attempts
- Session timeout controls
- Transaction limits
- Masked balances where required
- Step-up confirmation for sensitive transactions
- Audit logging for all financial requests

### 16.4 USSD Scalability

USSD workloads can spike heavily. The ussd-service must be horizontally scalable, stateless where possible, and backed by a fast session store. Session data should be short-lived and tenant-scoped.

## 17. Backend Domain Considerations

### 17.1 Member Management

Member management shall support:

- Member onboarding
- KYC capture and verification
- Member status lifecycle
- Branch assignment
- Group or employer association where applicable
- Beneficiaries or next of kin
- Document management
- Member risk indicators

### 17.2 Savings

Savings capabilities shall support:

- Multiple savings products per tenant
- Product-level rules
- Contributions
- Withdrawals
- Interest or dividend-related configuration where required
- Account statements
- Holds and restrictions
- Approval workflows for withdrawals

### 17.3 Loans

Loan capabilities shall support:

- Loan product configuration
- Eligibility checks
- Application capture
- Guarantor workflows where applicable
- Approval workflows
- Disbursement
- Repayment schedule generation
- Penalties and arrears handling
- Restructuring and write-off workflows where required
- Portfolio reporting

### 17.4 Wallet

The wallet-service shall provide a controlled transaction layer for member balances and digital movements. It must support:

- Wallet account creation
- Balance tracking
- Holds and releases
- Internal transfers
- Transaction references
- Idempotent posting
- Reconciliation with payments and accounting

### 17.5 Accounting

The accounting-service shall provide:

- Chart of accounts
- Journal entries
- Double-entry ledger patterns
- Product-to-ledger mappings
- Posting rules
- Reversals and adjustments
- Trial balance support
- Reconciliation support
- Financial export support

Accounting behavior must be highly controlled, auditable, and aligned with tenant configuration.

## 18. Deployment Architecture

### 18.1 Runtime Model

All services shall be containerized using Docker. Local development may use Docker Compose. Production deployment shall be Kubernetes-ready.

### 18.2 Environments

The platform shall support:

- Local development
- Shared development
- Testing/QA
- Staging
- Production
- Disaster recovery environment

Each environment shall have isolated configuration, secrets, databases, and external integration credentials.

### 18.3 Kubernetes Readiness

Production services shall define:

- Container images
- Resource requests and limits
- Health checks
- Readiness probes
- Liveness probes
- ConfigMaps
- Secrets
- Horizontal pod autoscaling policies
- Network policies
- Ingress or gateway configuration
- Pod disruption budgets for critical services

### 18.4 Configuration Management

Configuration shall be externalized through environment variables, mounted configuration, or a configuration service. Secrets must never be committed to source control.

### 18.5 Deployment Topology

The recommended production topology includes:

- Public ingress or load balancer
- API gateway
- Backend service namespace
- Data namespace
- Observability namespace
- Messaging namespace
- Secrets management integration
- Private networking for databases and internal services

## 19. DevOps and CI/CD

### 19.1 CI/CD Objectives

The CI/CD system shall provide repeatable, auditable, and automated delivery from source control to runtime environments.

### 19.2 Pipeline Requirements

Pipelines shall include:

- Source checkout
- Dependency installation
- Static analysis
- Type checking
- Unit tests
- Integration tests where applicable
- Security scanning
- Container image build
- Container image scan
- Artifact publishing
- Environment-specific deployment
- Smoke tests
- Rollback support

### 19.3 Release Strategy

The platform should support:

- Independent service releases
- Versioned API contracts
- Blue-green or rolling deployments
- Canary deployments for high-risk services
- Database migration gating
- Feature flags for controlled rollout

### 19.4 Infrastructure as Code

Infrastructure should be provisioned and managed through infrastructure as code. The exact tooling may be selected later, but the architecture shall support repeatable provisioning for networks, clusters, databases, object storage, queues, secrets, monitoring, and backups.

### 19.5 Database Migrations

Database migrations must be:

- Versioned
- Reviewed
- Tested in lower environments
- Backward-compatible where required by rolling deployments
- Reversible or accompanied by a rollback plan
- Monitored during production execution

## 20. Security Considerations

### 20.1 Security Principles

The platform shall apply defense in depth:

- Secure by default
- Least privilege access
- Tenant isolation
- Strong authentication
- Explicit authorization
- Encryption in transit and at rest
- Secure auditability
- Operational monitoring
- Secure software supply chain

### 20.2 Data Protection

Sensitive data includes:

- Passwords and credential secrets
- OTPs and PINs
- Identity documents
- Member KYC data
- Account balances
- Transaction history
- Payment provider credentials
- Authentication tokens
- Administrative actions

Sensitive data shall be encrypted at rest where appropriate and always protected in transit.

### 20.3 Transport Security

All external traffic shall use TLS. Internal service traffic should use TLS or be protected through secure service mesh or network policies, depending on deployment maturity.

### 20.4 Secrets Management

Secrets shall be stored in a dedicated secret management system or Kubernetes secrets integrated with encryption and access controls. Secrets must be rotated and scoped per service and environment.

### 20.5 API Security

APIs shall enforce:

- Authentication
- Authorization
- Input validation
- Rate limiting
- Request size limits
- Idempotency for financial operations
- Audit logging
- Secure error responses
- Protection against injection attacks
- Protection against enumeration where applicable

### 20.6 Compliance Readiness

The architecture shall support future compliance activities, including:

- Audit evidence
- Access review
- Data retention policies
- Data export and subject access workflows where required
- Security incident investigation
- Financial transaction traceability
- Segregation of duties

## 21. Scalability Strategy

### 21.1 Scale Target

The system must support over 1 million members. The architecture shall allow scaling beyond the first million through horizontal service scaling, optimized database design, asynchronous processing, caching, partitioning, and independent service deployment.

### 21.2 Horizontal Scaling

Stateless services shall scale horizontally behind the API gateway or internal service routing. Services expected to scale independently include:

- gateway-service
- auth-service
- member-service
- savings-service
- loan-service
- wallet-service
- payment-service
- notification-service
- report-service
- ussd-service

### 21.3 Database Scaling

Database scaling techniques shall include:

- Strong indexing
- Connection pooling
- Read replicas for read-heavy workloads
- Partitioning for large tables
- Archival of historical data
- Query optimization
- Reporting read models
- Tenant-aware sharding as a future option

### 21.4 Caching

Caching may be used for:

- Tenant configuration
- Feature flags
- Menu structures
- Public reference data
- Rate limiting counters
- USSD sessions
- Short-lived authorization metadata

Financial balances and transaction states must be cached only with strict consistency controls and clear invalidation rules.

### 21.5 Performance Targets

Initial non-functional performance targets should include:

| Area | Target |
| --- | --- |
| Common API reads | p95 under 500 ms under expected load |
| Common API writes | p95 under 1000 ms under expected load |
| USSD menu response | p95 under 2 seconds, excluding telco delays |
| Authentication | p95 under 700 ms under expected load |
| Payment callback acknowledgement | Fast acknowledgement after validation and durable capture |
| Long-running reports | Asynchronous processing |

Final values should be validated through load testing and revised per business criticality.

### 21.6 Load Testing

The platform shall include load testing plans for:

- Login bursts
- Member dashboard reads
- USSD peak sessions
- Payment callback spikes
- Savings contribution posting
- Loan repayment posting
- Notification fan-out
- Report generation

## 22. Disaster Recovery and Business Continuity

### 22.1 Availability Objectives

Availability objectives shall be defined per service tier:

| Tier | Examples | Requirement |
| --- | --- | --- |
| Critical | Gateway, auth, wallet, payments, savings, loans, accounting | High availability and monitored failover |
| Important | Member, user, tenant, configuration, notification | High availability with controlled degradation |
| Supporting | Reports, exports, analytics | Can use asynchronous recovery |

### 22.2 Backup Strategy

Backups shall include:

- PostgreSQL backups
- Point-in-time recovery where supported
- Object storage backup or replication
- Configuration backups
- Secrets recovery process
- Kafka topic retention and replay planning

Backups must be encrypted, access-controlled, and regularly tested.

### 22.3 Recovery Targets

Recovery Time Objective and Recovery Point Objective shall be defined by business stakeholders. Proposed initial planning targets:

| System Area | Proposed RTO | Proposed RPO |
| --- | --- | --- |
| Authentication and gateway | Less than 1 hour | Less than 15 minutes |
| Financial transaction services | Less than 1 hour | Near-zero to 15 minutes |
| Reporting | Less than 8 hours | 24 hours acceptable for derived reports |
| Notifications | Less than 4 hours | Replay from durable events where possible |

### 22.4 Degraded Mode

The architecture should support controlled degraded operation. For example:

- Reports may be temporarily unavailable without blocking transactions.
- Notification dispatch may queue while provider integration is unavailable.
- Payment callbacks may be durably captured before downstream posting.
- USSD may display maintenance messaging for affected workflows.

## 23. Monitoring and Observability

### 23.1 Observability Goals

Observability shall enable teams to understand system health, diagnose incidents, trace transactions, monitor business metrics, and detect security anomalies.

### 23.2 Metrics

Services shall expose:

- Request rate
- Error rate
- Latency
- Saturation
- JVM and container metrics
- Database connection pool metrics
- Kafka producer and consumer metrics
- Queue lag
- Payment provider latency and failure rates
- Notification delivery rates
- USSD session counts and failure rates
- Business transaction counts

### 23.3 Distributed Tracing

Every request shall carry a correlation ID. Distributed traces should follow requests across gateway, services, Kafka producers, Kafka consumers, and external integrations where possible.

### 23.4 Logging

Centralized logs shall support filtering by:

- Tenant ID
- Service name
- Correlation ID
- User ID where safe
- Request path
- Error type
- Transaction reference
- Provider reference

### 23.5 Alerting

Alerts shall be configured for:

- Service downtime
- Elevated error rates
- Latency degradation
- Payment callback failures
- Kafka consumer lag
- Database saturation
- Authentication attack indicators
- Failed backup jobs
- Abnormal transaction patterns
- Disk, CPU, memory, and network saturation

### 23.6 Dashboards

Operational dashboards shall include:

- Platform health overview
- Service-level health
- Tenant activity
- API traffic
- USSD traffic
- Payment status
- Notification delivery
- Database health
- Kafka health
- Business transaction volumes

## 24. Configuration and Business Rules

### 24.1 Configuration-Service Role

The configuration-service shall centralize tenant-specific business configuration while allowing domain services to enforce rules in their own bounded contexts.

Configuration areas include:

- Product definitions
- Loan rules
- Savings rules
- Fees
- Limits
- Approval workflows
- Notification templates
- USSD menu configuration
- Branding
- Feature flags
- Accounting mappings

### 24.2 Rule Versioning

Financial and workflow-affecting rules must be versioned. Historical transactions must remain explainable under the rule version active at the time of the transaction.

### 24.3 Approval Workflows

Approval workflows shall support:

- Multi-step approvals
- Role-based approvers
- Amount thresholds
- Branch scoping
- Segregation of duties
- Escalation rules
- Rejection reasons
- Audit trail

## 25. Integration Architecture

### 25.1 Integration Principles

External integrations shall be abstracted through dedicated services or adapters. Business services should not embed provider-specific logic directly.

### 25.2 Integration Types

The architecture shall support:

- Mobile money providers
- SMS gateways
- Email providers
- Push notification providers
- Credit bureaus
- Identity verification providers
- Accounting exports
- Regulatory reporting systems
- Bank payment rails
- Partner APIs

### 25.3 Resilience

External integration calls shall use:

- Timeouts
- Retries with backoff
- Circuit breakers
- Idempotency
- Provider status tracking
- Fallback queues where appropriate
- Operational dashboards

## 26. Data Governance

### 26.1 Data Classification

Data shall be classified into:

- Public
- Internal
- Confidential
- Restricted
- Financially sensitive
- Personally identifiable information

Controls shall be applied based on classification.

### 26.2 Data Quality

The system shall enforce validation at API and domain levels. Critical records shall have completeness, uniqueness, and consistency rules.

### 26.3 Data Lineage

Financial and compliance data must preserve lineage from originating request through domain transaction, accounting entry, report, and audit event.

## 27. Testing Strategy

### 27.1 Testing Layers

The implementation phase shall include:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests for critical workflows
- Security tests
- Performance tests
- Migration tests
- Disaster recovery drills

### 27.2 Critical Workflow Tests

Critical workflows include:

- Login and MFA
- Member onboarding
- Savings contribution
- Withdrawal approval
- Loan application
- Loan approval
- Loan disbursement
- Loan repayment
- Payment callback processing
- Accounting posting
- USSD balance inquiry
- USSD payment flow
- Notification dispatch
- Audit event capture

### 27.3 Contract Testing

Contract testing is required between:

- Frontend and gateway APIs
- Mobile app and gateway APIs
- Gateway and backend services
- Payment providers and payment-service
- USSD gateway and ussd-service
- Event producers and consumers

## 28. Deployment and Operational Readiness Checklist

Before production launch, the platform must verify:

- Tenant isolation tested across all major APIs.
- Authentication and authorization tested for all roles.
- Critical financial workflows covered by tests.
- Load testing completed for expected launch volume and growth forecasts.
- Backups configured and restore tested.
- Observability dashboards configured.
- Alerts configured and routed.
- Payment reconciliation workflows tested.
- Security scanning completed.
- Secrets stored securely.
- API documentation published.
- Runbooks prepared.
- Incident response process defined.
- Data retention policy approved.
- Disaster recovery procedure tested.

## 29. Key Architectural Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Tenant data leakage | Severe security and trust failure | Enforce tenant context at gateway, service, database, cache, storage, and audit layers |
| Duplicate financial postings | Financial loss and reconciliation issues | Idempotency keys, unique transaction references, ledger controls, reconciliation |
| Reporting load affecting transactions | Slow or failed core operations | Use read models, asynchronous exports, replicas, and data marts |
| Provider callback retries causing duplicates | Incorrect balances | Idempotent callback processing and provider reference uniqueness |
| Microservice sprawl | Operational complexity | Clear service boundaries, shared standards, platform automation |
| Configuration mistakes | Incorrect business behavior | Versioned config, approvals, audit, staging validation |
| Poor observability | Slow incident response | Structured logs, metrics, traces, dashboards, alerts |
| Mobile backward incompatibility | Broken app releases | API versioning and compatibility windows |
| USSD peak overload | Failed member access | Horizontal scaling, short-lived session store, rate limits, load testing |

## 30. Future Architecture Considerations

The platform should be designed to allow future enhancements such as:

- Advanced credit scoring
- AI-assisted support and anomaly detection
- Data warehouse integration
- Tenant-specific custom domains
- White-label mobile applications
- Multi-region active-active deployment
- Open banking integrations
- Advanced workflow designer
- Embedded analytics
- Regulatory automation

## 31. Conclusion

This technical specification establishes a scalable, secure, multi-tenant, API-first SACCO platform architecture capable of supporting web, mobile app, PWA, and USSD channels for over 1 million members.

The recommended approach emphasizes decoupled Spring Boot microservices, PostgreSQL-backed domain persistence, Kafka-driven asynchronous workflows where necessary, strict tenant isolation, financial-grade security, operational observability, and Kubernetes-ready deployment. This foundation is suitable for enterprise architecture planning, future implementation, infrastructure sizing, developer onboarding, and technical review.
