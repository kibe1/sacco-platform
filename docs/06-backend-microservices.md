# Backend Microservices Specification

## 1. Purpose

This document defines the backend microservices implementation specification for the SACCO platform. It translates the technical specification, architecture blueprint, API specification, database design, and domain-driven service boundaries into practical backend service planning guidance.

The backend platform shall use Spring Boot microservices, PostgreSQL, an API gateway, Keycloak or an equivalent OIDC/OAuth2 IAM provider, JWT-based authentication, Kafka where asynchronous communication is required, Docker, and Kubernetes-ready deployment patterns.

This document does not generate implementation code.

## 2. Backend Architecture Goals

- Preserve strict microservice boundaries.
- Keep each service independently deployable and independently testable.
- Enforce tenant isolation in every request, command, event, query, and audit record.
- Support more than 1 million members through horizontal scaling and database-aware design.
- Protect financial transaction integrity through local ACID transactions, idempotency, outbox/inbox, audit, and reconciliation.
- Avoid distributed transactions across services.
- Use synchronous APIs only for bounded request-response workflows.
- Use asynchronous events for audit, reporting, notifications, payment outcomes, and long-running workflows.
- Keep gateway, frontend, backend services, persistence, and infrastructure responsibilities separate.

## 3. Microservice Catalog

| Service | Primary Responsibility | Transaction Critical |
| --- | --- | --- |
| gateway-service | API routing, edge policy, tenant resolution, rate limiting | Yes, for platform access |
| auth-service | Authentication, sessions, MFA, token lifecycle | Yes |
| tenant-service | Tenant lifecycle, status, routing metadata | Yes |
| user-service | Users, roles, permissions, staff access scopes | Yes |
| member-service | Member profiles, KYC, lifecycle | Yes |
| savings-service | Savings products, accounts, contributions, withdrawals | Yes |
| loan-service | Loan products, applications, approvals, disbursements, repayments | Yes |
| wallet-service | Wallet accounts, balances, holds, transfers | Yes |
| accounting-service | Chart of accounts, journals, ledger postings, reconciliation | Yes |
| payment-service | Payment requests, provider callbacks, settlements | Yes |
| notification-service | Templates, dispatch, delivery status | Operationally important |
| report-service | Read models, reports, dashboards, exports | Supporting |
| ussd-service | USSD sessions, menus, channel orchestration | Yes for USSD channel |
| audit-service | Immutable audit storage and search | Compliance critical |
| configuration-service | Tenant rules, workflows, fees, limits, branding, feature flags | Yes |

## 4. Standard Service Structure

Each Spring Boot service should follow a clean, layered structure.

```text
service-name/
  api/
    controller/
    dto/
    mapper/
    error/
  application/
    command/
    query/
    service/
    workflow/
  domain/
    model/
    service/
    event/
    policy/
  persistence/
    entity/
    repository/
    migration/
    outbox/
    inbox/
  integration/
    client/
    adapter/
    provider/
  messaging/
    producer/
    consumer/
    handler/
  security/
    tenant/
    authorization/
  config/
  observability/
  test/
```

This is a recommended logical structure, not implementation code. Actual package names may differ, but the separation of API, application, domain, persistence, integration, messaging, security, and observability must remain.

## 5. Layer Responsibilities

| Layer | Responsibility | Must Not Do |
| --- | --- | --- |
| API controller | Accept requests, validate DTO shape, return responses | Own business rules or persistence logic |
| DTO layer | API request/response contracts | Leak persistence entities |
| Application service | Orchestrate use cases, transactions, idempotency, service calls | Own low-level transport details |
| Domain layer | Business rules, state transitions, domain events | Call external APIs directly |
| Persistence layer | Service-owned database access | Query another service database |
| Integration adapter | External provider/service integration | Leak provider payloads into domain model |
| Messaging layer | Publish/consume events | Mutate state without idempotency |
| Security/tenant layer | Auth context, permission checks, tenant guard | Trust client tenant blindly |
| Observability layer | Logs, metrics, traces, health | Log secrets or sensitive raw payloads |

## 6. Cross-Cutting Backend Requirements

Every service must support:

- Health, readiness, and liveness endpoints.
- Structured logging.
- Correlation ID propagation.
- Tenant context propagation.
- Consistent error responses.
- Service-owned database migrations.
- DTO/entity separation.
- Input validation.
- Authorization checks for protected operations.
- Idempotency for retryable commands.
- Outbox publishing for important events.
- Inbox/processed-event tracking for side-effecting consumers.
- Metrics for latency, throughput, error rate, retries, and queue lag.

## 7. Tenant Context Handling

Tenant context is mandatory for tenant-owned operations.

### 7.1 Tenant Context Sources

- Gateway-resolved tenant from domain/subdomain/header.
- Token tenant claim.
- USSD short code or provider routing metadata.
- Internal service call metadata.
- Partner API contract where approved.

### 7.2 Tenant Enforcement Rules

- Every service must validate tenant context independently.
- Services must not trust arbitrary client-supplied `tenant_id`.
- Tenant-owned queries must include tenant scope.
- Tenant ID must be included in commands, events, audit records, outbox records, cache keys, and logs.
- Cross-tenant access requires explicit platform-admin authorization and high-severity audit events.

## 8. Authentication and Authorization

### 8.1 Authentication

Authentication uses Keycloak as the preferred identity and access management provider, or an equivalent standards-compliant OIDC/OAuth2 IAM service. The auth-service owns the platform authentication facade and integration boundary and must support:

- Login
- Logout
- Access token issuance
- Refresh token rotation
- Session tracking
- MFA challenge and verification
- Credential lifecycle
- Device/session revocation
- Keycloak/OIDC realm, client, token, claim, and logout integration

Keycloak or the selected IAM provider should own credential verification, OIDC/OAuth2 flows, token signing keys, realm/client configuration, service account/client credentials, and standard IAM security policies. Domain services must not bypass this boundary or implement independent password stores unless explicitly approved.

### 8.2 Authorization

Authorization combines:

- Role-based access control
- Permission-based access control
- Tenant scope
- Branch or organizational scope
- Transaction limits
- Approval workflow rules
- Step-up authentication for sensitive actions

Backend services must enforce authorization even when the gateway or frontend also checks permissions.

## 9. API Implementation Standards

Backend APIs must align with `docs/08-api-specification.md`.

### 9.1 API Rules

- Use versioned routes.
- Use DTOs for request and response contracts.
- Use consistent error structures.
- Support pagination/filtering/sorting on high-volume lists.
- Require idempotency keys for financial commands.
- Propagate correlation IDs.
- Include tenant context after gateway validation.
- Avoid exposing internal entity structure.
- Document APIs through OpenAPI.

### 9.2 Request Categories

Services should distinguish:

- Queries: read-only operations.
- Commands: state-changing operations.
- Financial commands: state-changing financial operations requiring idempotency, audit, and transaction references.
- Administrative commands: configuration or access changes requiring elevated permission and audit.
- Webhook callbacks: provider-originated requests requiring signature validation and deduplication.

## 10. Persistence Standards

Persistence must align with `docs/07-database-design.md`.

### 10.1 Service-Owned Persistence

Each service owns:

- Schema/database objects
- Migrations
- Repositories
- Indexes
- Constraints
- Outbox table
- Inbox/processed-event table where needed
- Idempotency records

Services must not:

- Join across service schemas.
- Write another service's tables.
- Depend on another service's internal database structure.
- Use cross-service foreign keys.

### 10.2 Transaction Rules

Within a service, a transaction-critical command must atomically:

- Validate idempotency.
- Validate current state.
- Mutate domain state.
- Persist financial or status history records.
- Persist outbox events.
- Persist audit event request where needed.

Cross-service consistency must use events, sagas, retries, reconciliation, and repair workflows.

## 11. Idempotency Standards

Idempotency is required for:

- Payment initiation and callbacks
- Savings contributions
- Withdrawals
- Loan applications where duplicate submission is possible
- Loan approvals
- Loan disbursements
- Loan repayments
- Wallet holds, releases, debits, credits, transfers
- Accounting postings
- USSD transaction commands

### 11.1 Required Behavior

- Same idempotency key and same request payload returns original outcome.
- Same idempotency key and different payload is rejected and audited.
- Idempotency records are tenant-scoped.
- Idempotency status must distinguish processing, succeeded, failed, and expired where applicable.

## 12. Outbox and Inbox Standards

### 12.1 Outbox

Services must use outbox persistence when a domain state change must publish an event.

Outbox is required for:

- Financial domain events
- Payment outcome events
- Ledger posting events
- Audit events
- Notification-triggering events
- Reporting projection events

### 12.2 Inbox

Services consuming events that produce side effects must store processed event IDs.

Inbox tracking is required for:

- accounting-service
- savings-service
- loan-service
- wallet-service
- payment-service
- notification-service
- report-service
- audit-service

### 12.3 Retry and Dead Letter

Consumers must support:

- Retry with backoff
- Attempt counters
- Last failure reason
- Dead letter queue/topic
- Manual replay or repair process
- Alerting for repeated failures

## 13. Event Standards

Events must be owned by the aggregate-owning service.

### 13.1 Event Envelope

Every event should include:

- Event ID
- Event type
- Event version
- Tenant ID
- Correlation ID
- Causation ID
- Source service
- Aggregate type
- Aggregate ID
- Actor context where applicable
- Timestamp
- Payload

### 13.2 Event Naming

Events must represent completed facts:

- `MemberRegistered`
- `SavingsContributionPosted`
- `LoanApproved`
- `WalletTransferCompleted`
- `PaymentConfirmed`
- `LedgerEntryPosted`

Commands must not be named as events, and events must not be named as commands.

## 14. Saga and Workflow Standards

Orchestrated sagas should be used for high-risk financial workflows:

- Loan disbursement
- Withdrawal processing
- Wallet transfer
- Payment callback to financial posting
- Bulk disbursement
- High-value loan repayment

Saga state must include:

- Saga ID
- Tenant ID
- Correlation ID
- Business reference
- Current step
- Current status
- Attempt count
- Last error
- Compensation status
- Created/updated timestamps

Financial compensation must use explicit reversal or adjustment records. Completed financial facts must not be deleted.

## 15. Service Specifications

### 15.1 gateway-service

Responsibilities:

- External API routing
- Tenant resolution at the edge
- JWT validation or token introspection support
- Rate limiting
- Request size limits
- API version routing
- Correlation ID propagation
- Partner and webhook edge policy

Does not own:

- Domain business rules
- Business persistence
- Financial state

Key requirements:

- Stateless and horizontally scalable.
- Must not become a backend-for-frontend monolith.
- Must emit or forward security/audit signals for rejected requests where required.

### 15.2 auth-service

Responsibilities:

- Authentication
- Credential lifecycle
- Session state
- Refresh token rotation
- MFA challenges
- Login failure tracking
- Device/session revocation

Key APIs:

- Login/logout
- Token refresh
- MFA challenge/verification
- Password reset/change
- Session listing/revocation

Events:

- UserAuthenticated
- UserAuthenticationFailed
- UserLoggedOut
- TokenRefreshed
- SessionRevoked
- MfaChallengeCompleted

Key requirements:

- Strong consistency for IAM integration, session metadata, token lifecycle coordination, and login attempt tracking.
- No role ownership; roles belong to user-service.
- Must audit security-sensitive events.

### 15.3 tenant-service

Responsibilities:

- Tenant identity
- Tenant lifecycle and status
- Tenant domains/subdomains
- Tenant routing metadata
- Tenant isolation tier metadata

Key APIs:

- Resolve tenant
- Create tenant
- Activate/suspend/deactivate tenant
- Manage domains

Events:

- TenantCreated
- TenantActivated
- TenantSuspended
- TenantDomainConfigured

Key requirements:

- Tenant status must be strongly consistent.
- Tenant reads may be cached with event-driven invalidation.
- Tenant status changes require high-severity audit.

### 15.4 user-service

Responsibilities:

- Staff/admin user profiles
- Roles
- Permissions
- User-role assignments
- Branch/organizational access scope
- Access review metadata

Key APIs:

- User management
- Role management
- Permission listing
- Access profile retrieval

Events:

- UserCreated
- UserDisabled
- UserRoleChanged
- PermissionChanged

Key requirements:

- Does not own credentials.
- Authorization changes must invalidate caches.
- All access changes require audit.

### 15.5 member-service

Responsibilities:

- Member profile
- KYC data/status
- Member lifecycle
- Next of kin/beneficiaries
- Document metadata references
- Risk flags

Key APIs:

- Register member
- Update profile
- Submit/verify/reject KYC
- Change member status
- Retrieve member profile

Events:

- MemberRegistered
- MemberProfileUpdated
- MemberKycSubmitted
- MemberKycVerified
- MemberKycRejected
- MemberSuspended

Key requirements:

- Does not own savings, loan, or wallet balances.
- Member number uniqueness is tenant-scoped.
- KYC and status changes require audit.

### 15.6 savings-service

Responsibilities:

- Savings products
- Savings accounts
- Contributions
- Withdrawals
- Holds/restrictions
- Statements

Key APIs:

- Manage products
- Open account
- Retrieve account
- Post/initiate contribution
- Request/approve/reject withdrawal
- Retrieve transactions/statement

Events:

- SavingsAccountOpened
- SavingsContributionAccepted
- SavingsContributionPosted
- WithdrawalRequested
- WithdrawalApproved
- WithdrawalPosted
- SavingsHoldPlaced

Key requirements:

- Transaction-critical.
- Contributions and withdrawals require idempotency.
- Posted transactions must not be deleted.
- Accounting failures create accounting-pending state, not deletion.

### 15.7 loan-service

Responsibilities:

- Loan products
- Loan applications
- Eligibility evaluation records
- Approval workflow state
- Loan accounts
- Repayment schedules
- Disbursement state
- Repayment application
- Arrears and restructuring state

Key APIs:

- Manage loan products
- Submit application
- Approve/reject application
- Disburse loan
- Retrieve loan account/schedule
- Apply/initiate repayment

Events:

- LoanApplicationSubmitted
- LoanApproved
- LoanRejected
- LoanDisbursementRequested
- LoanDisbursed
- LoanRepaymentApplied
- LoanInArrears

Key requirements:

- Transaction-critical.
- Approvals, disbursements, and repayments require idempotency and audit.
- Approved loan changes require explicit cancellation, reversal, or restructuring workflows.

### 15.8 wallet-service

Responsibilities:

- Wallet accounts
- Wallet balances
- Holds/releases
- Debits/credits
- Internal transfers
- Wallet transaction reconciliation

Key APIs:

- Retrieve wallet
- Place/release hold
- Debit/credit wallet
- Transfer between wallets
- Retrieve transaction history

Events:

- WalletAccountCreated
- WalletHoldPlaced
- WalletHoldReleased
- WalletDebitCompleted
- WalletCreditCompleted
- WalletTransferCompleted
- WalletTransferFailed

Key requirements:

- Transaction-critical.
- Must prevent double-spend.
- Transfers inside wallet boundary must commit debit and credit atomically.
- Reversals must be explicit transactions.

### 15.9 accounting-service

Responsibilities:

- Chart of accounts
- Accounting mappings
- Journals
- Ledger entries
- Reversals
- Trial balance
- Accounting reconciliation
- Accounting periods

Key APIs:

- Manage chart of accounts
- Configure mappings
- Query journals/ledger
- Create controlled manual journals
- Reverse journals
- Retrieve trial balance/reconciliation

Events:

- LedgerEntryPosted
- LedgerPostingFailed
- LedgerEntryReversed
- AccountingPeriodClosed

Key requirements:

- Ledger entries are append-only.
- Journals must balance.
- Corrections require reversal/adjustment journals.
- Must consume financial events idempotently.

### 15.10 payment-service

Responsibilities:

- Payment requests
- Provider initiation records
- Provider callbacks
- Payment status
- Provider references
- Settlement tracking
- Payment reconciliation

Key APIs:

- Initiate collection
- Initiate approved payout
- Receive provider callback
- Retrieve payment status
- Search payments
- Resolve reconciliation item

Events:

- PaymentInitiated
- PaymentCallbackReceived
- PaymentConfirmed
- PaymentFailed
- PaymentReversed
- ProviderSettlementReceived

Key requirements:

- Provider callbacks must be durably captured quickly.
- Callbacks must be deduplicated and idempotent.
- Provider-specific payloads must not leak into other domains.

### 15.11 notification-service

Responsibilities:

- Notification templates
- Dispatch records
- Delivery statuses
- Provider attempts
- Push token registration
- Communication preferences where assigned

Key APIs:

- Manage templates
- Send notification request where synchronous request is approved
- Retrieve delivery status
- Register push token
- Manage preferences

Events:

- NotificationRequestedAccepted
- NotificationDispatched
- NotificationDelivered
- NotificationFailed

Key requirements:

- Notification failure must not roll back completed financial workflows.
- Provider integrations must be adapter-based.

### 15.12 report-service

Responsibilities:

- Reporting projections
- Dashboards
- Export jobs
- Report definitions
- Generated report metadata

Key APIs:

- Retrieve dashboards
- List report definitions
- Request export
- Retrieve export status
- Download authorized export

Events:

- ReportExportRequested
- ReportExportCompleted
- ReportExportFailed
- ReportAccessed

Key requirements:

- Eventually consistent by default.
- Must not query transactional service databases for heavy reports.
- Must expose projection freshness for financial reports.

### 15.13 ussd-service

Responsibilities:

- USSD sessions
- USSD menu flows
- USSD tenant routing
- USSD channel authentication
- USSD transaction orchestration
- USSD timeout handling

Key APIs:

- Telco/aggregator callback endpoint
- Session continuation endpoint where needed
- Admin menu management
- Session diagnostics

Events:

- UssdSessionStarted
- UssdSessionCompleted
- UssdSessionExpired
- UssdAuthenticationFailed
- UssdTransactionRequested
- UssdTransactionCompleted

Key requirements:

- Does not own financial state.
- Must call core APIs with idempotent transaction references.
- Must use short-lived session state and scale horizontally.

### 15.14 audit-service

Responsibilities:

- Immutable audit storage
- Audit search
- Audit exports
- Audit retention metadata

Key APIs:

- Search audit events
- Retrieve audit event detail
- Request audit export
- Download authorized audit export

Events:

- AuditEventStored
- AuditExportRequested
- AuditExportCompleted

Key requirements:

- Compliance critical.
- Must support high write volume.
- Audit records must be immutable or tamper-evident.

### 15.15 configuration-service

Responsibilities:

- Tenant business configuration
- Feature flags
- Workflow definitions
- Fees
- Transaction limits
- Branding
- USSD menu configuration
- Rule version metadata

Key APIs:

- Retrieve tenant app configuration
- Manage branding
- Manage feature flags
- Manage workflows
- Manage fees and limits

Events:

- TenantConfigurationInitialized
- TenantConfigurationChanged
- FeatureFlagChanged
- WorkflowDefinitionChanged
- FeeScheduleChanged
- TransactionLimitChanged
- BrandingChanged

Key requirements:

- Financially relevant rules must be versioned.
- Configuration changes require audit.
- Reads may be cached with event-driven invalidation.

## 16. Integration Patterns

### 16.1 External Provider Integration

Provider-specific logic must be isolated in integration-owning services:

- payment-service for payment providers.
- notification-service for SMS/email/push providers.
- member-service or dedicated adapters for KYC/credit providers where approved.

Domain services should consume normalized platform concepts, not raw provider payloads.

### 16.2 Service-to-Service Calls

Synchronous calls must:

- Be time-bound.
- Be shallow.
- Propagate tenant and correlation context.
- Use service identity where required.
- Avoid long dependency chains.

### 16.3 Event-Driven Calls

Event-driven processing is preferred for:

- Notifications
- Audit propagation
- Reporting projections
- Payment outcome propagation
- Accounting postings
- Long-running workflow steps

## 17. Security Standards

Backend services must:

- Authenticate protected APIs.
- Authorize sensitive operations server-side.
- Enforce tenant isolation.
- Validate inputs.
- Mask sensitive data in logs and errors.
- Use secure secret management.
- Protect service-to-service communication.
- Apply rate limits for public, auth, partner, and USSD-facing paths.
- Emit audit events for security-sensitive actions.

Sensitive data includes passwords, tokens, OTPs, PINs, identity documents, provider credentials, full identity numbers, and payment secrets.

## 18. Observability Standards

Every service must emit:

- Structured logs
- Request metrics
- Latency metrics
- Error metrics
- Domain counters
- Database connection pool metrics
- Event consumer lag where applicable
- Retry and dead letter metrics where applicable

Logs and traces must include:

- Service name
- Environment
- Tenant ID where applicable
- Correlation ID
- Request ID
- Operation
- Status
- Safe error details

## 19. Testing Strategy

### 19.1 Required Test Types

- Unit tests for domain rules.
- API tests for validation and authorization.
- Integration tests for persistence and transactions.
- Contract tests for APIs and events.
- Idempotency tests for financial commands.
- Tenant isolation tests.
- Outbox/inbox tests.
- Event consumer retry tests.
- Provider adapter tests.
- Security tests for sensitive flows.

### 19.2 Critical Workflow Tests

- Login and MFA
- Member registration and KYC
- Savings contribution
- Withdrawal approval/posting
- Loan application
- Loan approval
- Loan disbursement
- Loan repayment
- Wallet transfer
- Payment callback handling
- Ledger posting
- Audit propagation
- USSD transaction flow
- Report export

## 20. Deployment Readiness

Each service must define:

- Container image
- Environment variables
- Config maps
- Secret references
- Resource requests and limits
- Readiness probe
- Liveness probe
- Health endpoint
- Database migration strategy
- Logging/metrics/tracing configuration
- Horizontal scaling expectations

## 21. Recommended Implementation Sequence

The recommended first implementation slice is:

1. gateway-service
2. tenant-service
3. auth-service
4. user-service
5. member-service
6. configuration-service
7. member portal shell and admin portal alignment

The recommended second slice is:

1. savings-service
2. wallet-service
3. payment-service
4. notification-service
5. accounting-service foundation

The recommended third slice is:

1. loan-service
2. report-service
3. ussd-service
4. advanced reconciliation and audit exports

## 22. Backend Code Review Checklist

Before accepting backend code, verify:

- Correct owning service.
- No cross-service database access.
- DTO/entity separation preserved.
- Tenant isolation enforced.
- Authorization enforced.
- Financial commands are idempotent.
- Outbox/inbox added where required.
- Audit event emitted where required.
- Events are versioned and fact-based.
- Errors are standardized and safe.
- Tests cover critical behavior.
- API docs are updated.
- Database migrations are service-owned.
- No secrets or sensitive payloads are logged.
- Scalability impact is considered.

## 23. Summary

The backend microservice architecture is a service-owned, tenant-aware, financially safe, event-capable Spring Boot platform. Each service owns its domain model, API contracts, persistence boundary, events, and operational responsibilities. Cross-service workflows must use APIs, events, sagas, idempotency, outbox/inbox, audit, and reconciliation rather than shared databases or distributed transactions.

This document should guide backend scaffolding, implementation planning, code review, testing, and production readiness.
