Read these files carefully first:



- prompts/008-codex-development-governance.md

- docs/03-technical-specification.md

- docs/04-architecture-blueprint.md

- docs/05-frontend-ui-specification.md

- docs/07-database-design.md

- docs/11-domain-driven-service-boundaries.md



Then generate a comprehensive AI-assisted development governance document and save it to:



docs/12-codex-development-governance.md



Do not generate implementation code.



The document should define:

- how Codex is allowed to generate code

- architecture enforcement rules

- forbidden patterns

- frontend implementation constraints

- backend implementation constraints

- database constraints

- API standards

- DTO/entity separation rules

- transaction handling rules

- tenant isolation enforcement

- idempotency enforcement

- outbox/inbox enforcement

- audit logging requirements

- event-driven architecture rules

- testing expectations

- documentation expectations

- naming conventions

- service scaffolding rules

- code review standards

- Git/versioning expectations

- anti-coupling rules

- anti-monolith rules

- scalability enforcement

- security rules



The document should act as the governing implementation policy for all future AI-generated code.# Codex Development Governance

## 1. Purpose

This document defines the governing implementation policy for all future AI-assisted development on the SACCO platform. It applies to Codex-generated code, documentation, scaffolding, tests, migrations, configuration, and refactoring.

Codex must align all generated work with:

- `docs/03-technical-specification.md`
- `docs/04-architecture-blueprint.md`
- `docs/05-frontend-ui-specification.md`
- `docs/07-database-design.md`
- `docs/11-domain-driven-service-boundaries.md`

This document does not generate implementation code. It defines the rules Codex must follow before generating production code.

## 2. Governing Principles

- Preserve the approved microservice architecture.
- Never introduce a monolith or hidden shared domain layer.
- Respect service-owned data and source-of-truth boundaries.
- Enforce tenant isolation from the first line of implementation.
- Treat financial operations as idempotent, auditable, traceable, and recovery-aware.
- Keep API contracts reusable across web, mobile app, PWA, USSD, and partner channels.
- Use event-driven communication only where it improves durability, decoupling, resilience, or scale.
- Keep frontend logic separate from backend financial business rules.
- Generate maintainable, production-grade code only.
- Avoid placeholder, mock, or demo behavior unless explicitly requested for a non-production artifact.

## 3. Codex Authorization Rules

Before generating code, Codex must verify:

- Which service or frontend module owns the requested behavior.
- Which source-of-truth boundary applies.
- Whether the change touches financial state.
- Whether tenant isolation is required.
- Whether idempotency is required.
- Whether audit logging is required.
- Whether an event, outbox, inbox, or saga is required.
- Whether API, DTO, database, and test changes are needed together.
- Whether existing project patterns already define the correct structure.

If ownership is ambiguous, Codex must inspect the relevant docs and existing code before implementation. If ambiguity remains and a wrong choice could create coupling or financial risk, Codex must ask for clarification.

## 4. Forbidden Patterns

Codex must not generate:

- A monolithic backend application that combines multiple domain services.
- A shared database table written by multiple services.
- Direct database reads or writes across service boundaries.
- Cross-service foreign keys.
- Distributed database transactions across services.
- Business logic inside API gateway routing.
- Financial business rules implemented only in the frontend.
- Raw provider-specific payment logic inside savings, loan, wallet, or accounting services.
- Ledger entries that can be updated or deleted after posting.
- Financial records that are silently overwritten instead of reversed or adjusted.
- Non-idempotent payment callbacks or financial commands.
- Tenant-unscoped queries on tenant-owned data.
- Audit-optional sensitive operations.
- Broad shared libraries containing domain logic.
- Hardcoded tenant rules, fees, limits, products, workflows, or branding.
- Client-side-only authorization.
- Mock providers, fake balances, placeholder security, or demo shortcuts in production paths.
- Console logging of secrets, tokens, OTPs, PINs, passwords, provider credentials, or sensitive PII.

## 5. Architecture Enforcement Rules

### 5.1 Service Ownership

Codex must implement behavior in the owning service:

| Domain Fact | Owning Service |
| --- | --- |
| Tenant identity and status | tenant-service |
| IAM credentials, OIDC clients, token signing keys | Keycloak or selected OIDC/OAuth2 IAM provider |
| Platform session metadata, login attempts, auth integration records | auth-service |
| Users, roles, permissions | user-service |
| Member profile and KYC | member-service |
| Savings products, accounts, contributions, withdrawals | savings-service |
| Loan products, applications, approvals, accounts, schedules | loan-service |
| Wallet accounts, balances, holds, transfers | wallet-service |
| Chart of accounts, journals, ledger entries | accounting-service |
| Payment requests, callbacks, settlements | payment-service |
| Notifications, templates, delivery status | notification-service |
| Reports, exports, read models | report-service |
| USSD sessions and menus | ussd-service |
| Audit records | audit-service |
| Tenant rules, feature flags, workflows, fees, limits | configuration-service |

### 5.2 Anti-Coupling Rules

- Services may communicate through versioned APIs or events only.
- Services may store external IDs from other services but must not depend on another service's tables.
- Shared libraries may contain only technical cross-cutting utilities, not domain policy.
- Report projections may duplicate data but must never become a writable source of truth.

### 5.3 Anti-Monolith Rules

Codex must not:

- Add unrelated domain modules to one service for convenience.
- Create a "common business service" that owns multiple bounded contexts.
- Centralize all persistence in one shared schema.
- Add frontend screens that call multiple backend databases through a convenience endpoint.

## 6. Frontend Implementation Constraints

Codex-generated frontend work must follow `docs/05-frontend-ui-specification.md`.

### 6.1 Required Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query for server state
- Zustand for UI-only client state
- React Hook Form for forms
- Zod for validation
- lucide-react for icons where available

### 6.2 Frontend Rules

- Use route groups aligned with public, auth, app, admin, staff, member, settings, and reports concerns.
- Use shadcn/ui primitives as the base UI layer.
- Keep domain components outside base `components/ui`.
- Use tenant branding through semantic design tokens or CSS variables.
- Enforce route and component visibility by permissions, but never rely on frontend authorization alone.
- Use TanStack Query for API/server data.
- Do not store authoritative records, balances, payment status, or loan state in Zustand.
- Use Zustand only for UI state such as sidebar, theme, modals, local filters, and PWA prompt state.
- Use React Hook Form and Zod for client validation.
- Treat backend validation as authoritative.
- Provide loading, error, empty, pending, failed, and retry states.
- Do not finalize financial transactions offline in PWA flows.
- Ensure responsive behavior for desktop, tablet, and mobile.
- Preserve accessibility, keyboard navigation, visible focus states, and contrast in light and dark modes.

### 6.3 Frontend Security

Codex must not:

- Store passwords, OTPs, PINs, payment secrets, or provider credentials in frontend state.
- Log tokens or sensitive member data.
- Expose actions only hidden by UI without backend authorization.
- Cache sensitive financial data without explicit strategy.
- Generate unsafe HTML rendering without sanitization.

## 7. Backend Implementation Constraints

### 7.1 Service Structure

Each Spring Boot microservice must preserve clean separation between:

- API controllers
- Request and response DTOs
- Application services
- Domain services
- Domain models
- Persistence adapters
- Integration adapters
- Event producers and consumers
- Configuration and security concerns

Controllers must not contain business rules. Persistence entities must not be used as public API contracts.

### 7.2 Service Scaffolding Rules

When Codex scaffolds a service, it must include architecture placeholders or modules for:

- API layer
- Application/service layer
- Domain layer
- Persistence layer
- Event layer where needed
- Security/tenant context integration
- Configuration
- Health/readiness/liveness support
- Tests
- Documentation notes

Codex must not scaffold a service that owns multiple unrelated bounded contexts.

### 7.3 Backend Dependency Rules

- gateway-service routes and enforces edge policy; it does not implement domain workflows.
- Keycloak or an equivalent OIDC/OAuth2 IAM provider owns core identity-provider capabilities such as credential verification, token signing keys, realms/clients, and standard IAM flows.
- auth-service owns the platform authentication facade, IAM integration, platform session metadata, and auth event coordination; user-service owns application roles and permissions unless explicitly delegated by architecture.
- payment-service owns provider-specific payment integration.
- accounting-service owns ledger postings and chart of accounts.
- savings, loan, and wallet services own their own financial state.
- audit-service stores audit records; action-producing services emit audit facts.

## 8. Database Constraints

Codex-generated database work must follow `docs/07-database-design.md`.

### 8.1 Persistence Rules

- PostgreSQL is the primary transactional database.
- Each service owns its schema, database, migrations, indexes, constraints, outbox, inbox, and idempotency records.
- Tenant-owned tables must include `tenant_id` unless explicitly approved as platform-global.
- Cross-service foreign keys are forbidden.
- Cross-service joins are forbidden.
- Shared writable tables are forbidden.
- Reporting projections are read models, not sources of truth.

### 8.2 Financial Data Rules

- Ledger entries must be append-only.
- Posted financial transactions must not be deleted.
- Corrections require reversal, adjustment, cancellation, or supersession records.
- Soft delete must not be used for ledger entries, posted transactions, payment callbacks, wallet transactions, audit events, or reconciliation records.
- All financial records must include traceability metadata where applicable: tenant, actor, channel, correlation ID, causation ID, request ID, reference, status, and timestamps.

### 8.3 Migration Rules

- Each service owns its migrations.
- Migrations must be versioned, repeatable, and tested.
- Rolling deployments require backward-compatible migrations.
- Destructive schema changes require phased deprecation.
- Large table migrations must avoid long locks and must be observable.

## 9. API Standards

### 9.1 API Design Rules

- APIs must be exposed through the gateway.
- APIs must be tenant-aware.
- APIs must be versioned.
- APIs must use DTOs, not persistence entities.
- APIs must return consistent error structures.
- APIs must support pagination, sorting, and filtering for large lists.
- APIs must include idempotency support for financial commands.
- APIs must propagate correlation IDs.
- APIs must enforce authentication and authorization server-side.

### 9.2 API Segments

Codex must classify APIs by consumer:

- Admin APIs
- Staff APIs
- Member APIs
- USSD APIs
- Partner APIs
- Internal service APIs

Public or partner APIs require stricter rate limits, validation, authentication, and audit coverage.

### 9.3 Error Handling Standards

Errors must distinguish:

- Validation failure
- Authentication failure
- Authorization failure
- Tenant mismatch
- Business rule rejection
- Idempotency conflict
- Duplicate request
- Resource not found
- Provider failure
- Transaction pending/investigation
- Internal system failure

Sensitive internal details must not leak through API errors.

## 10. DTO and Entity Separation

Codex must enforce strict separation:

- API request DTOs are not persistence entities.
- API response DTOs are not persistence entities.
- Domain models should not be shaped by transport concerns.
- Persistence entities should not leak to controllers.
- External provider payloads must be normalized behind adapter DTOs.
- Event payloads must use explicit event schemas, not entity serialization.

DTOs must validate input shape and API contract semantics. Domain services enforce business rules.

## 11. Transaction Handling Rules

### 11.1 Local ACID Transactions

Within a service boundary, commands must use local ACID transactions for:

- Idempotency validation/recording
- Domain state mutation
- Financial record creation
- Outbox event persistence
- Local status history where applicable

### 11.2 Cross-Service Transactions

Codex must not generate distributed transactions across services. Cross-service workflows must use:

- Saga orchestration for high-risk financial workflows
- Event choreography for propagation workflows
- Explicit state transitions
- Compensation records
- Retry and repair queues

### 11.3 Financial Corrections

Financial compensation must not delete or mutate completed facts. Codex must model:

- Reversal records
- Adjustment records
- Failed/pending/investigation states
- Repair workflow state
- Reconciliation state

## 12. Tenant Isolation Enforcement

Tenant isolation is mandatory across:

- API requests
- JWT claims
- Service commands
- Database queries
- Cache keys
- Domain events
- Audit events
- Object storage metadata
- Logs and metrics
- Reporting filters

Codex must ensure:

- Tenant context is resolved by gateway and validated by services.
- Services do not trust arbitrary client-supplied tenant IDs.
- Tenant-owned queries include tenant scope.
- Tenant-scoped uniqueness is used for business identifiers.
- Cross-tenant admin workflows require explicit elevated authorization and high-severity audit events.

## 13. Idempotency Enforcement

Idempotency is required for:

- Payment initiation
- Payment callbacks
- Savings contributions
- Withdrawals
- Loan applications where duplicate submission is possible
- Loan approvals
- Loan disbursements
- Loan repayments
- Wallet holds, debits, credits, transfers
- Accounting postings
- USSD transaction commands

Idempotency records must be scoped by:

- Tenant ID
- Service
- Operation type
- Actor or client identity where applicable
- Business reference
- Idempotency key

Duplicate requests with the same key and same payload must return the original outcome. Same key with different payload must be rejected and audited.

## 14. Outbox and Inbox Enforcement

### 14.1 Outbox

Transaction-critical services must persist outbox events in the same transaction as domain state changes.

Outbox is required for:

- Financial domain events
- Payment status events
- Ledger posting events
- Audit events
- Notification-triggering business events
- Reporting projection events

### 14.2 Inbox

Consumers that produce side effects must store processed event IDs to prevent duplicate processing.

Inbox or processed-event tracking is required for:

- accounting-service
- savings-service
- loan-service
- wallet-service
- payment-service
- notification-service
- report-service
- audit-service

### 14.3 Dead Letter Handling

Codex must include a failed-event handling strategy for event consumers:

- Attempt count
- Last error
- Last attempted timestamp
- Tenant ID
- Event ID
- Event type and version
- Correlation ID
- Repair or replay path

## 15. Audit Logging Requirements

Every security-sensitive and business-critical operation must emit audit evidence.

Audit is required for:

- Login failures and security events
- User, role, and permission changes
- Tenant status and configuration changes
- Member KYC changes
- Savings contributions and withdrawals
- Loan application, approval, disbursement, repayment, restructuring, and write-off
- Wallet debits, credits, holds, releases, transfers, reversals
- Payment callbacks, confirmations, failures, reversals, settlements
- Accounting postings, reversals, period close
- Report exports and sensitive file access
- Cross-tenant administration

Audit events must include:

- Tenant ID
- Actor ID and actor type
- Service name
- Action
- Entity type and ID
- Channel
- Correlation ID
- Causation ID
- Request ID
- Result
- Timestamp
- Safe before/after summary where appropriate

Codex must not log secrets or sensitive raw payloads.

## 16. Event-Driven Architecture Rules

### 16.1 Event Rules

Events must:

- Represent completed facts, not requests.
- Be owned by the service that owns the aggregate.
- Be versioned.
- Include tenant ID.
- Include correlation and causation IDs.
- Include source service.
- Include aggregate type and ID.
- Use stable schemas.

### 16.2 Command vs Event

Codex must not name events like commands. Examples:

- Correct event: `PaymentConfirmed`
- Incorrect event: `ConfirmPayment`
- Correct command: `PostSavingsContribution`
- Incorrect command: `SavingsContributionPostedCommand`

### 16.3 Event Compatibility

- Additive event changes are preferred.
- Existing event field meanings must not change.
- Breaking event changes require a new version and migration plan.
- Consumers must tolerate unknown optional fields.

## 17. Financial Transaction Rules

Financial workflows must:

- Use unique transaction references.
- Preserve tenant scope.
- Validate idempotency.
- Capture actor, channel, correlation, and causation metadata.
- Record explicit lifecycle status.
- Publish events through outbox.
- Trigger audit events.
- Support reconciliation.
- Avoid silent failure.

Financial statuses should distinguish:

- Requested
- Pending
- Approved
- Posted
- Failed
- Rejected
- Reversed
- Expired
- Under investigation
- Accounting pending
- Reconciled

## 18. Security Rules

Codex-generated work must follow defense in depth:

- Authenticate every protected API.
- Authorize every sensitive operation server-side.
- Enforce least privilege.
- Validate all input.
- Avoid sensitive data in logs, errors, URLs, telemetry, or frontend state.
- Use secure token and session practices.
- Protect provider credentials through secret management.
- Apply rate limits to public, auth, partner, and USSD-facing paths.
- Mask sensitive member and financial data based on role.
- Avoid insecure defaults.
- Include security-relevant tests for sensitive workflows.

## 19. Scalability Enforcement

Codex must design for over 1 million members and high-volume transactions.

Required scalability practices:

- Server-side pagination for high-volume lists.
- Indexed tenant-scoped queries.
- Partitioning strategy for high-volume tables.
- Read models for reporting and dashboards.
- Async exports for heavy reports.
- Horizontally scalable stateless services.
- Bounded database connection pools.
- Kafka consumers designed for backpressure and replay.
- No frontend loading of unbounded datasets.
- No synchronous chains across many services for critical workflows.

## 20. Testing Expectations

Codex must add or recommend tests proportionate to risk.

### 20.1 Required Test Categories

- Unit tests for domain rules.
- API/controller tests for request validation and authorization.
- Integration tests for persistence and transactional behavior.
- Contract tests for APIs and events.
- Idempotency tests for financial commands.
- Tenant isolation tests.
- Authorization tests.
- Outbox/inbox tests for event workflows.
- Retry/failure tests for provider and event consumers.
- Frontend component and interaction tests where applicable.
- Accessibility tests for critical frontend workflows.

### 20.2 Critical Workflows Requiring Tests

- Login and MFA
- Member onboarding and KYC
- Savings contribution
- Withdrawal processing
- Loan application
- Loan approval
- Loan disbursement
- Loan repayment
- Wallet transfer
- Payment callback handling
- Accounting posting
- Audit propagation
- USSD transaction flow
- Report export

## 21. Documentation Expectations

Every major Codex-generated component should include or update documentation covering:

- Purpose
- Owning service or module
- Architecture notes
- Source-of-truth boundaries
- API endpoints or consumed events where applicable
- Data ownership and persistence notes
- Tenant isolation behavior
- Idempotency behavior for financial operations
- Audit behavior
- Failure and retry behavior
- Setup and deployment notes where applicable

Docs must be updated when generated code changes architecture, APIs, events, database schema, workflows, or operational behavior.

## 22. Naming Conventions

### 22.1 Services

Service names must use the established suffix:

- `auth-service`
- `tenant-service`
- `user-service`
- `member-service`
- `savings-service`
- `loan-service`
- `wallet-service`
- `accounting-service`
- `payment-service`
- `notification-service`
- `report-service`
- `ussd-service`
- `audit-service`
- `configuration-service`
- `gateway-service`

### 22.2 Backend Naming

- Use clear domain names.
- Avoid vague names such as `CommonService`, `UtilityManager`, or `DataHandler`.
- Commands should use imperative intent.
- Events should use past-tense completed facts.
- DTOs should be named by purpose and direction.
- Persistence entities should not be named as API responses.

### 22.3 Frontend Naming

- Components use PascalCase.
- Hooks use `use` prefix.
- Domain feature folders use lowercase domain names.
- UI primitives stay in `components/ui`.
- Domain components stay under feature or domain component folders.

### 22.4 Database Naming

- Use lowercase snake_case.
- Use service-owned schema names.
- Use tenant-scoped business uniqueness.
- Use intentional suffixes such as `_outbox`, `_inbox`, `_history`, `_projection`, and `_event`.

## 23. Code Review Standards

Codex-generated changes must be reviewed against this checklist:

- Correct owning service/module?
- No monolith drift?
- No cross-service database access?
- DTO/entity separation preserved?
- Tenant isolation enforced?
- Authorization enforced server-side?
- Financial operation idempotent?
- Outbox/inbox included where needed?
- Audit emitted where required?
- Event names and versions correct?
- Error handling safe and specific?
- Tests added or updated?
- Documentation updated?
- No secrets or sensitive data logged?
- Query/index implications considered?
- Frontend state boundaries respected?
- Accessibility and responsive states considered?
- Failure and retry paths explicit?

## 24. Git and Versioning Expectations

Codex must:

- Keep changes scoped to the requested task.
- Avoid unrelated refactors.
- Avoid reverting user changes.
- Preserve existing worktree changes unless explicitly asked to modify them.
- Use meaningful commit messages if asked to commit.
- Keep database migrations versioned and service-owned.
- Keep API and event versions explicit.
- Update changelog or documentation when behavior changes.
- Avoid destructive git operations unless explicitly requested.

## 25. Avoiding Architecture Drift

Codex must prevent drift by:

- Checking architecture docs before major implementation.
- Refusing or flagging requests that violate service boundaries.
- Updating docs when architecture intentionally changes.
- Keeping generated code consistent with existing patterns.
- Avoiding shortcuts that bypass gateway, auth, tenant, audit, or persistence rules.
- Creating explicit TODOs only when asked and never for critical security or financial behavior.
- Treating "temporary" production shortcuts as forbidden unless isolated from production paths.

## 26. AI-Generated Code Acceptance Criteria

AI-generated code is acceptable only if:

- It fits the approved architecture.
- It is production-oriented, not demo-oriented.
- It has clear ownership.
- It preserves tenant isolation.
- It preserves financial integrity.
- It has appropriate tests.
- It has relevant documentation.
- It does not introduce prohibited coupling.
- It handles errors and retries intentionally.
- It avoids sensitive data exposure.
- It can be reviewed by a human engineer without hidden assumptions.

## 27. Summary

Codex may accelerate implementation, but it must not weaken the architecture. All generated work must reinforce the SACCO platform's multi-tenant, API-first, microservice-based, financially safe, auditable, and scalable design.

This governance document is the implementation policy for future AI-assisted development. When a request conflicts with this policy, Codex must either adapt the solution to comply or explicitly raise the conflict before generating code.
