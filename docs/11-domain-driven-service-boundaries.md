# Domain-Driven Service Boundaries

## 1. Purpose

This document defines the domain-driven service boundaries for the SACCO platform. It is intended to guide future backend implementation, API design, event design, database ownership, operational workflows, and financial transaction controls.

The platform is a multi-tenant, API-first SACCO system built with Spring Boot microservices, PostgreSQL, Kafka where asynchronous messaging is required, JWT authentication, and an API gateway. It must support web, mobile app, USSD, and PWA channels for more than 1 million members.

This document does not generate implementation code. It defines ownership, source-of-truth rules, inter-service communication patterns, domain events, saga patterns, idempotency, tenant isolation, audit propagation, and failure handling.

## 2. Boundary Principles

### 2.1 Core Rules

- Each service owns its domain model, business rules, persistence, APIs, and emitted domain events.
- No service may directly read or write another service's database objects.
- Cross-service access must happen through versioned APIs, domain events, or approved read models.
- Financial state changes must be idempotent, auditable, tenant-scoped, and traceable.
- Distributed transactions across services are not allowed.
- Cross-service workflows must use saga patterns, durable events, explicit states, and compensating actions.
- Shared libraries must not contain domain logic.
- Tenant context must be present in every request, command, event, audit record, cache key, and object storage reference.
- Every externally initiated financial request must include or derive an idempotency key.
- Every business operation must propagate correlation ID and causation ID.

### 2.2 Source-of-Truth Rule

Only one service may be the authoritative owner of a given business fact. Other services may keep replicated read models, projections, or cached references, but they must treat those copies as derived data.

Examples:

| Business Fact | Source of Truth |
| --- | --- |
| Tenant status and domains | tenant-service |
| User credentials and sessions | auth-service |
| User roles and permissions | user-service |
| Member profile and KYC status | member-service |
| Savings product and savings account state | savings-service |
| Loan product, loan application, loan account, schedule | loan-service |
| Wallet balance and wallet transaction lifecycle | wallet-service |
| Ledger postings and chart of accounts | accounting-service |
| External payment request and provider callback state | payment-service |
| Notification templates and delivery status | notification-service |
| Audit records | audit-service |
| Tenant business configuration | configuration-service |
| USSD session state | ussd-service |
| Reporting read models and exports | report-service |

### 2.3 Data Duplication Rule

Data duplication is allowed only when it is deliberate and classified as one of the following:

- Read model projection for reporting or dashboards.
- Cached reference data for performance.
- Snapshot captured for historical explanation of a transaction.
- Event payload data required for asynchronous processing.
- Search index or query-optimized view.

Duplicated data must not become a second writable source of truth.

## 3. Domain Map

### 3.1 Core Domains

Core domains are central to SACCO value creation and financial integrity:

- Savings
- Loans
- Wallet
- Accounting
- Payments
- Member management

These domains require strict consistency inside their own boundaries, high audit coverage, and strong idempotency controls.

### 3.2 Supporting Domains

Supporting domains enable platform operations:

- Tenant management
- User and access management
- Configuration
- Notifications
- Reporting
- USSD
- Audit

### 3.3 Generic Platform Domains

Generic platform domains provide technical capabilities:

- API gateway
- Authentication
- Observability
- Infrastructure and deployment services

## 4. Service Ownership Matrix

| Service | Owns | Does Not Own | Transaction Critical |
| --- | --- | --- | --- |
| gateway-service | Edge routing, API policy, request controls | Domain business rules, persistence of business entities | Yes, for availability and security |
| auth-service | Authentication, tokens, sessions, MFA | Business roles, member profile, tenant business rules | Yes |
| tenant-service | Tenant lifecycle and tenant identity | Tenant product rules, tenant users, transactions | Yes |
| user-service | Users, roles, permissions, staff access | Credentials, member profile, financial accounts | Yes |
| member-service | Member identity, KYC, lifecycle | Savings balances, loan balances, wallet balances | Yes |
| savings-service | Savings products, accounts, contributions, withdrawals | External payment provider state, ledger chart | Yes |
| loan-service | Loan products, applications, approvals, schedules | Payment callbacks, wallet ledger, accounting ledger | Yes |
| wallet-service | Wallet accounts, balances, holds, wallet transactions | External provider settlement, loan schedules | Yes |
| accounting-service | Chart of accounts, journals, ledger postings | Product workflows, payment initiation | Yes |
| payment-service | Provider requests, callbacks, settlement state | Member balances, savings rules, loan schedules | Yes |
| notification-service | Templates, dispatch, delivery tracking | Business decision to notify | No, but operationally important |
| report-service | Read models, reports, exports | Transactional source data | No |
| ussd-service | USSD sessions, menus, channel orchestration | Core financial state | Yes for USSD channel |
| audit-service | Immutable audit records | Business transaction ownership | Yes for compliance |
| configuration-service | Tenant rules, feature flags, workflows | Execution of domain-specific decisions | Yes |

## 5. Communication Model

### 5.1 Synchronous Calls

Synchronous APIs are appropriate when:

- A user-facing workflow needs immediate validation or response.
- A service needs authoritative data before accepting a command.
- The request is low-latency and bounded.
- The dependency is not in a long chain of service calls.

Synchronous calls must include:

- Tenant ID
- Correlation ID
- Request ID
- Actor context where applicable
- Authorization scope
- Timeout
- Clear error contract

Synchronous calls must not be used to create deeply nested workflows where one service waits on several downstream services to complete financial side effects.

### 5.2 Asynchronous Events

Asynchronous events are appropriate when:

- A completed business fact must be shared.
- A downstream service can process later.
- The operation is long-running or high-volume.
- Reporting, notifications, audit, or reconciliation need updates.
- A saga step can proceed after durable state has been recorded.

Events must include:

- Event ID
- Event type
- Event version
- Tenant ID
- Correlation ID
- Causation ID
- Source service
- Aggregate type and ID
- Occurred timestamp
- Actor context where applicable
- Payload

### 5.3 Command vs Event Distinction

A command requests work to be done. An event states that work has already happened.

Examples:

| Type | Example | Meaning |
| --- | --- | --- |
| Command | PostSavingsContribution | Request savings-service to post contribution |
| Event | SavingsContributionPosted | Contribution has been accepted and posted by savings-service |
| Command | CreateAccountingPosting | Request accounting-service to create journal entries |
| Event | LedgerEntryPosted | Accounting-service has posted ledger entries |

Events must not be named like commands. Consumers must not reinterpret events as requests to mutate the original aggregate.

## 6. Event Ownership

### 6.1 Ownership Rule

The service that owns the aggregate owns the event vocabulary for that aggregate.

Examples:

- member-service owns MemberRegistered and MemberKycVerified.
- savings-service owns SavingsContributionPosted and WithdrawalApproved.
- loan-service owns LoanApproved and LoanRepaymentApplied.
- wallet-service owns WalletTransferCompleted and WalletHoldPlaced.
- payment-service owns PaymentCallbackReceived and PaymentConfirmed.
- accounting-service owns LedgerEntryPosted.

### 6.2 Event Versioning

Events must be versioned. Event consumers must tolerate additive changes. Breaking changes require a new event version and a migration plan.

Event versioning rules:

- Never remove required fields from an existing event version.
- Never change the meaning of an existing field.
- Prefer additive optional fields for compatible changes.
- Use explicit new versions for semantic changes.
- Keep event schemas documented and discoverable.

### 6.3 Event Ordering

Ordering must be designed deliberately. Partition keys should be chosen by aggregate consistency requirements:

| Aggregate | Recommended Partition Key |
| --- | --- |
| Tenant | tenantId |
| Member | tenantId + memberId |
| Savings account | tenantId + savingsAccountId |
| Loan account | tenantId + loanAccountId |
| Wallet account | tenantId + walletAccountId |
| Payment request | tenantId + paymentRequestId |
| Ledger posting | tenantId + accountingTransactionId |

## 7. Saga Strategy

### 7.1 Saga Types

The platform shall use two saga patterns:

- Orchestrated sagas for high-risk financial workflows that require explicit state transitions.
- Choreographed sagas for lower-risk propagation workflows such as notifications, reporting projections, and audit capture.

### 7.2 Orchestrated Saga Candidates

Orchestrated sagas are recommended for:

- Loan disbursement
- Withdrawal processing
- Wallet transfer
- Payment callback to financial posting
- Bulk disbursement
- High-value loan repayment

The orchestrator may be the domain service that owns the primary business intent. For example, loan-service may orchestrate loan disbursement, while wallet-service may orchestrate wallet transfer.

### 7.3 Choreographed Saga Candidates

Choreographed sagas are recommended for:

- Member registration projections
- Notification dispatch
- Audit propagation
- Reporting updates
- Tenant configuration cache updates

### 7.4 Saga State Requirements

Every saga must record:

- Saga ID
- Tenant ID
- Correlation ID
- Business reference
- Current step
- Current state
- Attempts
- Last error
- Compensation status
- Created and updated timestamps
- Completion timestamp

### 7.5 Compensation Principles

Financial compensation must not delete or mutate completed ledger entries. It must post explicit reversing or adjusting transactions.

Compensation examples:

| Failed Workflow | Compensation |
| --- | --- |
| Loan disbursement posted but provider payout failed | Reverse wallet credit or mark disbursement pending reversal depending on actual money movement |
| Withdrawal reserved funds but payment failed | Release wallet or savings hold |
| Payment confirmed but loan repayment application failed | Keep payment as unapplied and queue repair workflow |
| Accounting posting failed after domain transaction | Mark transaction accounting-pending and retry posting |

## 8. Financial Transaction Integrity

### 8.1 Integrity Rules

- Every financial operation must have a unique transaction reference.
- Every financial operation must be tenant-scoped.
- Every externally retried request must be idempotent.
- Every balance-affecting operation must be recorded durably before downstream events are emitted.
- Ledger entries must be append-only.
- Corrections must use reversal or adjustment entries.
- Domain transaction state must distinguish pending, posted, failed, reversed, and reconciled states.
- Payment provider state must not be treated as final until validated and recorded.
- Reconciliation must detect and surface mismatches between payment, wallet, savings, loan, and accounting records.

### 8.2 Idempotency Ownership

Each transaction-critical service owns idempotency for the commands it accepts.

| Service | Idempotency Scope |
| --- | --- |
| payment-service | Provider callbacks, payment initiation, settlement records |
| wallet-service | Wallet postings, holds, releases, transfers |
| savings-service | Contributions, withdrawals, interest postings |
| loan-service | Applications, approvals, disbursements, repayments |
| accounting-service | Journal postings and reversal postings |
| ussd-service | USSD request/session commands sent to transaction services |

### 8.3 Atomicity Inside a Service

Within a service boundary, database state changes and outbox event records must be committed atomically. This supports reliable event publication without distributed transactions.

Recommended pattern:

- Validate command.
- Check idempotency key.
- Apply domain changes inside the service transaction.
- Persist outbox events inside the same transaction.
- Commit.
- Publish outbox events asynchronously.

## 9. Tenant Isolation

### 9.1 Tenant Context Requirements

Tenant ID must be included in:

- API requests after tenant resolution
- JWT claims where applicable
- Service-to-service calls
- Domain commands
- Domain events
- Audit events
- Logs and metrics labels
- Cache keys
- Object storage keys
- Report filters and exports

### 9.2 Tenant Validation

Each service must independently validate tenant context. Services must not blindly trust client-supplied tenant IDs. Tenant context should be resolved by the gateway and verified against token claims and service-level authorization.

### 9.3 Cross-Tenant Access

Cross-tenant operations are forbidden except for explicitly authorized platform administration workflows. Such workflows must produce high-severity audit events and require elevated authorization.

## 10. Audit Propagation

### 10.1 Audit Requirements

Every security-sensitive and business-critical action must produce audit evidence. Audit propagation shall use both synchronous request metadata and asynchronous audit events.

Audit records must capture:

- Tenant ID
- Actor ID and actor type
- Service name
- Action
- Entity type and entity ID
- Channel
- Correlation ID
- Causation ID
- Request ID
- Result
- Before and after summary where appropriate
- Timestamp

### 10.2 Audit Event Ownership

The service performing or rejecting the action is responsible for emitting the audit event. The audit-service is responsible for durable audit storage, not for inferring business actions after the fact.

### 10.3 Audit Failure Handling

Audit capture for critical operations should use a reliable outbox. If audit-service is unavailable, producing services must not lose audit events. Critical audit events should be retried until accepted or placed in an operational repair queue.

## 11. Retry, Idempotency, and Failure Handling

### 11.1 Retry Rules

Retries are allowed only for operations that are known to be idempotent or safely repeatable.

Retryable failures:

- Temporary network failures
- Provider timeout after no confirmed result
- Kafka publish failure from outbox
- Transient database connection issue
- Temporary downstream service unavailability

Non-retryable failures:

- Validation failure
- Authorization failure
- Tenant mismatch
- Insufficient funds after authoritative check
- Duplicate command with conflicting payload
- Business rule rejection

### 11.2 Idempotency Key Rules

Idempotency keys must be scoped by:

- Tenant ID
- Service name
- Operation type
- Actor or client identity where applicable
- Business reference

Duplicate commands with the same key and same payload should return the original outcome. Duplicate commands with the same key and different payload must be rejected and audited.

### 11.3 Dead Letter Handling

Event consumers must support dead letter topics or equivalent failed-message storage. Dead letter records must include enough context for operational repair:

- Event ID
- Event type and version
- Tenant ID
- Consumer service
- Failure reason
- Attempt count
- Last failure timestamp
- Correlation ID
- Payload reference or safe payload summary

### 11.4 Failure Visibility

All transaction-critical failures must be visible through operational dashboards. Silent failure is not acceptable for payment, wallet, savings, loan, accounting, audit, or USSD transaction flows.

## 12. Service Boundary Definitions

### 12.1 gateway-service

#### Owns

- API edge routing
- External API segmentation
- Tenant resolution at the edge
- Rate limiting and throttling
- Request size limits
- Correlation ID creation and propagation
- JWT verification where applicable
- API version routing
- External client access policies

#### Does Not Own

- Domain business rules
- User credentials
- Role definitions
- Financial transactions
- Tenant product configuration

#### Exposes APIs

- Public API gateway routes for web, PWA, mobile app, USSD gateway, and partners.
- Health and operational gateway endpoints.

#### Emits Events

- GatewayRequestAccepted where required for security analytics.
- GatewayRequestRejected for denied or throttled requests where audit policy requires.

#### Consumes Events

- TenantDomainConfigured for routing cache updates.
- TenantStatusChanged for access enforcement.

#### Dependencies

- auth-service for token introspection or key material where required.
- tenant-service for tenant routing metadata.
- configuration-service for edge feature flags where required.

#### Consistency and Scalability

The gateway is stateless and horizontally scalable. It is transaction-critical for availability, tenant isolation, and security, but it does not own business transactions.

### 12.2 auth-service

#### Owns

- Authentication policies
- Credentials
- Password lifecycle
- MFA challenges
- Token issuance
- Refresh token rotation
- Session state
- Login failure tracking
- Device/session revocation

#### Does Not Own

- User role definitions
- Tenant business rules
- Member profile
- Staff employment details
- Financial permissions beyond token claims derived from user-service

#### Exposes APIs

- Login
- Logout
- Token refresh
- MFA challenge and verification
- Session revocation
- Password reset and password change
- Service account token issuance where approved

#### Emits Events

- UserAuthenticated
- UserAuthenticationFailed
- UserLoggedOut
- TokenRefreshed
- SessionRevoked
- MfaChallengeIssued
- MfaChallengeCompleted
- CredentialChanged

#### Consumes Events

- UserCreated
- UserDisabled
- UserRoleChanged
- TenantSuspended
- TenantActivated

#### Dependencies

- user-service for user status, role, and permission context.
- tenant-service for tenant status.
- notification-service for OTP or security notifications.

#### Consistency and Scalability

Authentication requires strong consistency for credential and session state. It is horizontally scalable with shared secure session/token storage. It is transaction-critical.

### 12.3 tenant-service

#### Owns

- Tenant identity
- Tenant lifecycle
- Tenant status
- Tenant domains and subdomains
- Tenant subscription state where applicable
- Tenant isolation tier metadata
- Tenant routing metadata

#### Does Not Own

- Tenant business rules
- Tenant users
- Member records
- Financial products
- Branding assets beyond references to tenant-owned metadata

#### Exposes APIs

- Create tenant
- Activate, suspend, or deactivate tenant
- Resolve tenant by domain, subdomain, short code, or identifier
- Manage tenant routing metadata
- Retrieve tenant status

#### Emits Events

- TenantCreated
- TenantActivated
- TenantSuspended
- TenantDeactivated
- TenantDomainConfigured
- TenantIsolationTierChanged

#### Consumes Events

- TenantConfigurationInitialized
- TenantAdminCreated

#### Dependencies

- configuration-service for initial configuration setup.
- user-service for tenant administrator bootstrap coordination.

#### Consistency and Scalability

Tenant identity and status require strong consistency. Tenant reads are high-volume and should be cached carefully with invalidation through tenant events.

### 12.4 user-service

#### Owns

- User profile for staff and administrative users
- Role definitions
- Permission definitions
- User-role assignments
- Branch or organizational access scope
- Service account authorization metadata
- Access review metadata

#### Does Not Own

- Credentials or password hashes
- Authentication sessions
- Member financial profile
- Tenant lifecycle
- Financial transaction authorization outcomes after a domain service evaluates business rules

#### Exposes APIs

- Create and manage users
- Assign roles
- Manage permissions
- Retrieve access profile
- Disable or reactivate user
- Resolve authorization context for services

#### Emits Events

- UserCreated
- UserUpdated
- UserDisabled
- UserRoleChanged
- PermissionChanged
- UserBranchScopeChanged

#### Consumes Events

- TenantCreated
- TenantSuspended
- StaffMemberLinked where applicable

#### Dependencies

- tenant-service for tenant status validation.
- auth-service for credential lifecycle coordination.
- audit-service through audit event publication.

#### Consistency and Scalability

Authorization data requires strong consistency inside user-service. Read access profiles may be cached for short periods, with invalidation on role and permission events.

### 12.5 member-service

#### Owns

- Member identity
- Member profile
- KYC data and KYC status
- Member lifecycle
- Member branch assignment
- Next of kin and beneficiary information
- Member document metadata references
- Member risk flags

#### Does Not Own

- Savings account balances
- Loan account balances
- Wallet balances
- User login credentials
- External payment state
- Accounting ledger entries

#### Exposes APIs

- Register member
- Update member profile
- Submit KYC
- Verify or reject KYC
- Retrieve member profile
- Change member status
- Link member to tenant branch or group

#### Emits Events

- MemberRegistered
- MemberProfileUpdated
- MemberKycSubmitted
- MemberKycVerified
- MemberKycRejected
- MemberActivated
- MemberSuspended
- MemberClosed

#### Consumes Events

- TenantSuspended
- TenantActivated
- UserLinkedToMember where applicable
- DocumentUploaded where future file-service exists

#### Dependencies

- tenant-service for tenant validity.
- configuration-service for onboarding rules.
- notification-service through events for onboarding notifications.
- audit-service through audit events.

#### Consistency and Scalability

Member profile writes require strong consistency. Member reads are high-volume and should support indexed tenant/member lookups. Member-service is transaction-critical because other services depend on member eligibility and status.

### 12.6 savings-service

#### Owns

- Savings products
- Savings account lifecycle
- Savings contribution records
- Withdrawal requests and approvals
- Savings holds or restrictions
- Interest/dividend calculation records where applicable
- Savings account statements

#### Does Not Own

- External payment provider state
- Wallet provider settlement state
- Accounting ledger chart
- Loan schedules
- Member KYC facts

#### Exposes APIs

- Create and manage savings products
- Open savings account
- Retrieve savings account state
- Post savings contribution
- Request withdrawal
- Approve or reject withdrawal
- Apply savings hold or release
- Retrieve savings statement

#### Emits Events

- SavingsProductCreated
- SavingsAccountOpened
- SavingsContributionAccepted
- SavingsContributionPosted
- WithdrawalRequested
- WithdrawalApproved
- WithdrawalRejected
- WithdrawalPosted
- SavingsHoldPlaced
- SavingsHoldReleased

#### Consumes Events

- PaymentConfirmed
- PaymentFailed
- WalletDebitCompleted
- WalletCreditCompleted
- MemberSuspended
- MemberActivated
- LedgerEntryPosted
- TenantConfigurationChanged

#### Dependencies

- member-service for member status validation.
- configuration-service for savings rules, fees, and limits.
- wallet-service for wallet-backed movements where applicable.
- payment-service for external collection or payout references where applicable.
- accounting-service for accounting posting commands or events.

#### Consistency and Scalability

Savings-service is transaction-critical. Account state and contribution posting require strong consistency. Cross-service accounting and notification outcomes may be eventually consistent, but savings transaction state must explicitly track pending accounting or pending notification states.

### 12.7 loan-service

#### Owns

- Loan products
- Loan applications
- Eligibility decision records owned by loan domain
- Approval workflow state
- Loan accounts
- Repayment schedules
- Loan disbursement state
- Repayment application state
- Arrears, penalties, restructuring, and write-off state

#### Does Not Own

- Payment provider callbacks
- Wallet balances
- Accounting ledger entries
- Member profile source-of-truth
- Notification delivery state

#### Exposes APIs

- Create and manage loan products
- Submit loan application
- Evaluate loan eligibility
- Approve or reject loan application
- Disburse loan
- Retrieve loan account
- Apply repayment
- Restructure, write off, or close loan under controlled workflows

#### Emits Events

- LoanProductCreated
- LoanApplicationSubmitted
- LoanEligibilityEvaluated
- LoanApproved
- LoanRejected
- LoanDisbursementRequested
- LoanDisbursed
- LoanDisbursementFailed
- LoanRepaymentDue
- LoanRepaymentApplied
- LoanInArrears
- LoanClosed

#### Consumes Events

- MemberKycVerified
- MemberSuspended
- PaymentConfirmed
- PaymentFailed
- WalletCreditCompleted
- WalletDebitCompleted
- LedgerEntryPosted
- TenantConfigurationChanged

#### Dependencies

- member-service for member eligibility and status.
- configuration-service for loan rules, limits, fees, and workflows.
- wallet-service for disbursement or repayment movements where applicable.
- payment-service for external repayment or disbursement rails.
- accounting-service for loan accounting postings.

#### Consistency and Scalability

Loan-service is transaction-critical. Loan approval, disbursement, and repayment application require strong consistency inside loan-service. Provider settlement, notifications, reporting, and accounting confirmation may be eventually consistent with explicit states.

### 12.8 wallet-service

#### Owns

- Wallet accounts
- Wallet balances
- Holds and releases
- Wallet debit and credit transactions
- Internal transfers
- Wallet transaction status
- Wallet balance reconciliation records

#### Does Not Own

- External payment provider truth
- Savings product rules
- Loan product rules
- Accounting chart of accounts
- Member profile source-of-truth

#### Exposes APIs

- Create wallet account
- Retrieve wallet balance
- Place hold
- Release hold
- Debit wallet
- Credit wallet
- Transfer between wallets
- Retrieve wallet transaction history

#### Emits Events

- WalletAccountCreated
- WalletHoldPlaced
- WalletHoldReleased
- WalletDebitCompleted
- WalletDebitFailed
- WalletCreditCompleted
- WalletCreditFailed
- WalletTransferCompleted
- WalletTransferFailed

#### Consumes Events

- PaymentConfirmed
- PaymentFailed
- LoanDisbursementRequested
- WithdrawalApproved
- MemberSuspended
- LedgerEntryPosted

#### Dependencies

- member-service for member status where needed.
- configuration-service for wallet limits and controls.
- accounting-service for ledger posting.
- payment-service for external cash-in/cash-out correlation.

#### Consistency and Scalability

Wallet-service is transaction-critical and requires strong consistency for balance updates. Holds, debits, credits, and transfers must be idempotent and protected against concurrent double-spend.

### 12.9 accounting-service

#### Owns

- Chart of accounts
- Accounting mappings
- Journal entries
- Ledger postings
- Reversal entries
- Trial balance data
- Accounting reconciliation state
- Financial period status where applicable

#### Does Not Own

- Member profile
- Savings account business workflow
- Loan approval workflow
- Payment provider state
- Wallet authorization decisions

#### Exposes APIs

- Manage chart of accounts
- Configure accounting mappings
- Create journal posting
- Reverse journal posting
- Retrieve ledger entries
- Retrieve trial balance
- Retrieve reconciliation status

#### Emits Events

- AccountingMappingConfigured
- JournalPostingRequested
- LedgerEntryPosted
- LedgerPostingFailed
- LedgerEntryReversed
- AccountingPeriodClosed

#### Consumes Events

- SavingsContributionPosted
- WithdrawalPosted
- LoanDisbursed
- LoanRepaymentApplied
- WalletDebitCompleted
- WalletCreditCompleted
- PaymentConfirmed
- TenantConfigurationChanged

#### Dependencies

- configuration-service for product-to-ledger mappings where not directly owned in accounting.
- tenant-service for tenant status.
- Domain services for transaction references and source transaction details through events or APIs.

#### Consistency and Scalability

Accounting-service is transaction-critical. Ledger writes require strong consistency and append-only behavior. It must support high write volume and reliable replay from events where appropriate.

### 12.10 payment-service

#### Owns

- Payment requests
- Provider initiation records
- Provider callback records
- Provider transaction references
- Payment status
- Settlement tracking
- Provider reconciliation records
- Provider credential references

#### Does Not Own

- Savings balances
- Loan repayment schedules
- Wallet balances
- Accounting ledger entries
- Member profile source-of-truth

#### Exposes APIs

- Initiate payment collection
- Initiate payout where approved
- Receive provider callback
- Retrieve payment status
- Reconcile provider settlement
- Manage provider integration configuration references

#### Emits Events

- PaymentInitiated
- PaymentCallbackReceived
- PaymentConfirmed
- PaymentFailed
- PaymentReversed
- ProviderSettlementReceived
- ProviderReconciliationDiscrepancyFound

#### Consumes Events

- SavingsContributionAccepted
- WithdrawalApproved
- LoanDisbursementRequested
- LoanRepaymentDue
- WalletDebitCompleted where payout depends on wallet movement
- TenantConfigurationChanged

#### Dependencies

- configuration-service for provider routing, limits, and credentials references.
- tenant-service for tenant status.
- notification-service through events for payment status messages.
- Domain services through events or APIs for payment purpose validation.

#### Consistency and Scalability

Payment-service is transaction-critical. Provider callbacks must be durably captured quickly, deduplicated, validated, and then propagated. It must handle callback spikes and provider retry behavior.

### 12.11 notification-service

#### Owns

- Notification templates
- Notification dispatch records
- Delivery status
- Provider dispatch attempts
- User and member communication preferences where assigned to notification domain

#### Does Not Own

- Business decision to send a notification
- Financial transaction state
- Authentication credentials
- Tenant lifecycle

#### Exposes APIs

- Send notification request
- Manage templates
- Retrieve delivery status
- Register push token
- Manage notification preferences where applicable

#### Emits Events

- NotificationRequestedAccepted
- NotificationDispatched
- NotificationDelivered
- NotificationFailed
- NotificationTemplateChanged

#### Consumes Events

- MemberRegistered
- MemberKycVerified
- SavingsContributionPosted
- WithdrawalPosted
- LoanApproved
- LoanDisbursed
- LoanRepaymentApplied
- PaymentConfirmed
- PaymentFailed
- UserAuthenticationFailed
- TenantConfigurationChanged

#### Dependencies

- configuration-service for templates and provider routing.
- External SMS, email, and push providers.

#### Consistency and Scalability

Notification-service is not the source of truth for financial outcomes. It should be horizontally scalable and asynchronous-first. Failed notifications should not roll back completed financial transactions.

### 12.12 report-service

#### Owns

- Reporting read models
- Dashboard projections
- Export jobs
- Report definitions
- Generated report metadata
- Report access logs where needed

#### Does Not Own

- Transactional source data
- Financial posting truth
- Member source-of-truth
- Loan or savings decisions

#### Exposes APIs

- Retrieve dashboards
- Request report export
- Retrieve export status
- Download authorized report output
- Manage report definitions where applicable

#### Emits Events

- ReportExportRequested
- ReportExportCompleted
- ReportExportFailed
- ReportAccessed

#### Consumes Events

- MemberRegistered
- SavingsContributionPosted
- WithdrawalPosted
- LoanApproved
- LoanDisbursed
- LoanRepaymentApplied
- WalletDebitCompleted
- WalletCreditCompleted
- PaymentConfirmed
- LedgerEntryPosted
- TenantConfigurationChanged

#### Dependencies

- Object storage for generated files.
- Event streams for projections.
- Tenant and user context for access checks.

#### Consistency and Scalability

Report-service is eventually consistent by default. Financial reports must disclose cutoff, posting date, transaction date, and projection freshness.

### 12.13 ussd-service

#### Owns

- USSD session state
- USSD menu flows
- USSD tenant routing by short code or gateway metadata
- USSD channel authentication flow
- USSD request orchestration
- USSD-specific rate limits and session timeouts

#### Does Not Own

- Member source-of-truth
- Savings balances
- Loan balances
- Wallet balances
- Payment provider state
- Accounting ledger entries

#### Exposes APIs

- Telco USSD callback endpoint
- USSD session continuation endpoint
- USSD menu management where tenant-configurable
- USSD health and provider integration endpoints

#### Emits Events

- UssdSessionStarted
- UssdSessionCompleted
- UssdSessionExpired
- UssdAuthenticationFailed
- UssdTransactionRequested
- UssdTransactionCompleted
- UssdTransactionFailed

#### Consumes Events

- TenantConfigurationChanged
- PaymentConfirmed
- PaymentFailed
- SavingsContributionPosted
- LoanRepaymentApplied
- WalletTransferCompleted

#### Dependencies

- tenant-service for short-code tenant resolution.
- configuration-service for menu and transaction limits.
- auth-service or member-service for USSD identity validation depending on chosen auth model.
- savings-service, loan-service, wallet-service, and payment-service for transaction commands.

#### Consistency and Scalability

USSD-service must be horizontally scalable and optimized for short response times. It should avoid owning financial outcomes and must display only confirmed or clearly pending states.

### 12.14 audit-service

#### Owns

- Immutable audit records
- Audit storage
- Audit search APIs
- Audit retention metadata
- Security and business action trail

#### Does Not Own

- Business transaction state
- User authorization decisions
- Financial corrections
- Event interpretation beyond storing audit facts

#### Exposes APIs

- Retrieve audit events
- Search audit trail
- Export audit records under controlled authorization
- Receive audit event submissions where synchronous submission is required

#### Emits Events

- AuditEventStored
- AuditExportRequested
- AuditExportCompleted

#### Consumes Events

- Audit events from all transaction-critical and security-sensitive services.
- GatewayRequestRejected
- UserAuthenticationFailed
- UserRoleChanged
- TenantSuspended
- Financial transaction events where audit policy requires.

#### Dependencies

- Object storage for exports.
- Tenant and user context for access control.

#### Consistency and Scalability

Audit-service is compliance-critical. It should use append-only or tamper-evident storage patterns and scale for high write volume. Producing services must use outbox-backed audit publication.

### 12.15 configuration-service

#### Owns

- Tenant business configuration
- Feature flags
- Product configuration metadata where shared
- Fee schedules
- Transaction limits
- Workflow definitions
- Notification template configuration references
- USSD menu configuration
- Branding configuration
- Rule version metadata

#### Does Not Own

- Execution of domain-specific rules after a domain service accepts a command
- Transaction outcomes
- Ledger entries
- Member profile

#### Exposes APIs

- Retrieve tenant configuration
- Manage feature flags
- Manage workflow definitions
- Manage fee and limit configuration
- Manage branding configuration
- Retrieve active rule versions

#### Emits Events

- TenantConfigurationInitialized
- TenantConfigurationChanged
- FeatureFlagChanged
- WorkflowDefinitionChanged
- FeeScheduleChanged
- TransactionLimitChanged
- BrandingChanged

#### Consumes Events

- TenantCreated
- TenantActivated
- TenantSuspended

#### Dependencies

- tenant-service for tenant status.
- audit-service through audit events.

#### Consistency and Scalability

Configuration changes require strong consistency and auditability. Reads are high-volume and should be cached with event-driven invalidation. Financially relevant configuration must be versioned.

## 13. Cross-Service Dependency Rules

### 13.1 Allowed Dependency Directions

Allowed synchronous dependencies should be shallow and business-justified:

| Caller | Allowed Callees |
| --- | --- |
| gateway-service | auth-service, tenant-service, routed backend services |
| auth-service | user-service, tenant-service, notification-service |
| user-service | tenant-service |
| member-service | tenant-service, configuration-service |
| savings-service | member-service, configuration-service, wallet-service, payment-service, accounting-service |
| loan-service | member-service, configuration-service, wallet-service, payment-service, accounting-service |
| wallet-service | member-service, configuration-service, accounting-service |
| payment-service | configuration-service, tenant-service |
| accounting-service | configuration-service, tenant-service |
| ussd-service | tenant-service, configuration-service, auth-service, member-service, savings-service, loan-service, wallet-service, payment-service |
| notification-service | configuration-service, external providers |
| report-service | none for transactional reads by default; use projections |
| audit-service | none for business decisions |

### 13.2 Dependency Restrictions

- report-service must not call transaction services for large reports.
- notification-service must not call financial services to infer transaction results.
- accounting-service must not mutate source domain transactions.
- payment-service must not post savings, loan, or wallet balances directly.
- gateway-service must not contain domain workflow logic.
- configuration-service must not execute financial transactions.

## 14. Workflow Specifications

### 14.1 Member Registration

#### Source of Truth

- member-service owns member registration and lifecycle.
- user-service owns user access if a member login account is created.
- auth-service owns credentials and sessions.

#### Synchronous Steps

1. Client submits registration through gateway.
2. gateway-service resolves tenant and validates token or public registration policy.
3. member-service validates tenant, onboarding configuration, uniqueness, and required KYC fields.
4. member-service creates member record in pending or active state based on tenant rules.

#### Asynchronous Steps

- member-service emits MemberRegistered.
- audit-service stores audit event.
- notification-service sends onboarding notification.
- report-service updates member projection.
- user-service and auth-service may create access identity if configured.

#### Failure and Compensation

If notification fails, registration remains valid and notification is retried. If user account creation fails, member remains registered with access-pending state. Duplicate registration attempts are resolved by member-service idempotency and unique member identifiers.

### 14.2 Savings Contribution

#### Source of Truth

- payment-service owns external collection status.
- savings-service owns savings contribution posting.
- accounting-service owns ledger posting.

#### Synchronous Steps

1. Client or USSD requests contribution.
2. savings-service validates member status, savings account, rules, limits, and idempotency key.
3. payment-service initiates collection or records expected payment depending on channel.
4. Client receives pending payment state.

#### Asynchronous Steps

- payment-service emits PaymentConfirmed after validated provider callback.
- savings-service consumes PaymentConfirmed and posts contribution.
- savings-service emits SavingsContributionPosted.
- accounting-service posts ledger entries and emits LedgerEntryPosted.
- notification-service sends receipt.
- report-service updates projections.
- audit-service stores business action events.

#### Failure and Compensation

If payment fails, payment-service emits PaymentFailed and savings-service marks contribution failed or expired. If accounting posting fails after savings posting, savings-service marks accounting-pending and retries ledger posting. No posted contribution may be deleted; corrections require reversals.

### 14.3 Withdrawal Processing

#### Source of Truth

- savings-service owns withdrawal approval and savings account impact.
- wallet-service owns wallet hold/debit where wallet is used.
- payment-service owns external payout state.
- accounting-service owns ledger postings.

#### Synchronous Steps

1. Client submits withdrawal request.
2. savings-service validates eligibility, limits, balance, status, and approval requirements.
3. savings-service records WithdrawalRequested.
4. If approval is required, workflow waits for authorized approver.
5. On approval, savings-service requests hold or debit through wallet-service where applicable.

#### Asynchronous Steps

- savings-service emits WithdrawalApproved.
- wallet-service emits WalletDebitCompleted or WalletDebitFailed.
- payment-service initiates payout and emits PaymentConfirmed or PaymentFailed.
- savings-service emits WithdrawalPosted after confirmed money movement rules are satisfied.
- accounting-service posts ledger entries.
- notification-service sends status updates.

#### Failure and Compensation

If hold succeeds but payout fails, wallet-service releases hold or reverses debit according to the exact movement state. If external provider reports ambiguous status, payment-service moves payment to investigation state and reconciliation decides final handling. Duplicate withdrawal approvals must be rejected or return original state.

### 14.4 Loan Application

#### Source of Truth

- loan-service owns loan application state.
- member-service owns member and KYC facts.
- configuration-service owns active loan rules and workflow versions.

#### Synchronous Steps

1. Client submits loan application.
2. loan-service validates member status, KYC status, loan product, tenant rules, and idempotency.
3. loan-service records application and initial workflow state.

#### Asynchronous Steps

- loan-service emits LoanApplicationSubmitted.
- audit-service records submission.
- notification-service notifies applicant or staff.
- report-service updates application projections.

#### Failure and Compensation

Invalid applications are rejected synchronously with clear business reason. If downstream notification or reporting fails, application state remains authoritative in loan-service.

### 14.5 Loan Approval

#### Source of Truth

- loan-service owns approval decision and loan account creation.
- user-service owns approver authorization context.
- configuration-service owns workflow rules and thresholds.

#### Synchronous Steps

1. Authorized staff submits approval action.
2. loan-service validates approver permissions, segregation of duties, workflow step, limits, and rule version.
3. loan-service records approval, rejection, or next pending step.
4. If final approval is reached, loan-service creates loan account and schedule.

#### Asynchronous Steps

- loan-service emits LoanApproved or LoanRejected.
- audit-service records decision.
- notification-service sends result.
- report-service updates loan portfolio projections.

#### Failure and Compensation

Approval decisions are not deleted. Incorrect approval requires an explicit reversal, cancellation, or administrative correction workflow based on loan state. If notification fails, approval remains valid.

### 14.6 Loan Disbursement

#### Source of Truth

- loan-service owns disbursement intent and loan disbursement state.
- wallet-service owns wallet credit where internal wallet is used.
- payment-service owns external payout state where external disbursement is used.
- accounting-service owns ledger postings.

#### Synchronous Steps

1. Authorized user requests disbursement.
2. loan-service validates approved loan state, disbursement rules, idempotency, and tenant limits.
3. loan-service records LoanDisbursementRequested.
4. loan-service starts orchestrated saga.

#### Asynchronous Steps

- loan-service emits LoanDisbursementRequested.
- wallet-service credits member wallet or payment-service initiates payout.
- wallet-service emits WalletCreditCompleted or payment-service emits PaymentConfirmed.
- loan-service marks loan disbursed after required money movement confirmation.
- accounting-service posts loan disbursement ledger entries.
- notification-service sends disbursement confirmation.
- report-service updates portfolio.

#### Failure and Compensation

If money movement fails before funds leave the platform, loan-service marks disbursement failed and allows retry. If money movement succeeds but accounting fails, loan remains disbursed with accounting-pending state and ledger posting retries. If a provider later reverses payout, payment-service emits PaymentReversed and loan-service starts a controlled reversal workflow.

### 14.7 Loan Repayment

#### Source of Truth

- payment-service owns external repayment confirmation.
- loan-service owns repayment application to loan schedule.
- accounting-service owns ledger posting.

#### Synchronous Steps

1. Client initiates repayment from web, mobile, PWA, USSD, or partner channel.
2. loan-service validates loan account and repayment intent or payment-service validates collection request.
3. payment-service initiates or awaits payment.

#### Asynchronous Steps

- payment-service emits PaymentConfirmed.
- loan-service consumes PaymentConfirmed and applies repayment to loan schedule.
- loan-service emits LoanRepaymentApplied.
- accounting-service posts ledger entries.
- notification-service sends receipt.
- report-service updates loan portfolio.

#### Failure and Compensation

If payment is confirmed but loan-service cannot apply it, payment remains unapplied and enters repair queue. Funds must not disappear into a failed workflow. Duplicate provider callbacks must return original payment result and not reapply repayment.

### 14.8 Wallet Transfer

#### Source of Truth

- wallet-service owns wallet transfer state and balances.
- accounting-service owns ledger posting.

#### Synchronous Steps

1. Client submits transfer request.
2. wallet-service validates sender, receiver, tenant, limits, balance, holds, and idempotency.
3. wallet-service atomically debits sender and credits receiver within wallet boundary if both wallets are owned by wallet-service.

#### Asynchronous Steps

- wallet-service emits WalletTransferCompleted.
- accounting-service posts ledger entries.
- notification-service sends transfer notifications.
- report-service updates projections.

#### Failure and Compensation

If debit and credit are inside one wallet-service transaction, they must commit or fail together. If accounting fails later, transfer remains completed with accounting-pending state. Reversal requires an explicit wallet reversal transaction, not deletion.

### 14.9 Payment Callback Handling

#### Source of Truth

- payment-service owns callback validation and provider state.
- Receiving domain service owns business application of confirmed payment.

#### Synchronous Steps

1. Provider sends callback to gateway/payment endpoint.
2. gateway-service applies edge controls.
3. payment-service validates signature, tenant/provider mapping, timestamp, duplicate status, and schema.
4. payment-service durably stores callback and responds quickly to provider.

#### Asynchronous Steps

- payment-service emits PaymentCallbackReceived.
- payment-service resolves final state and emits PaymentConfirmed, PaymentFailed, or PaymentReversed.
- Domain service consumes payment event and applies business effect.
- accounting-service, notification-service, report-service, and audit-service process downstream events.

#### Failure and Compensation

Duplicate callbacks are idempotently acknowledged. Ambiguous callbacks move to pending-investigation state. Provider retries must not duplicate domain postings. If downstream domain application fails, payment-service keeps confirmed payment record and repair workflow applies it later.

### 14.10 Notification Dispatch

#### Source of Truth

- notification-service owns dispatch and delivery state.
- Domain service owns the business fact being communicated.

#### Synchronous Steps

Notification dispatch should generally not block financial workflows. Direct synchronous notification APIs may be used for OTP or immediate security workflows.

#### Asynchronous Steps

- Domain event is emitted.
- notification-service resolves template, preferences, channel, and provider.
- notification-service sends message and records delivery status.
- notification-service emits NotificationDelivered or NotificationFailed.

#### Failure and Compensation

Failed notifications retry according to channel policy. Financial transactions are not rolled back due to notification failure. Security notifications may escalate if repeated delivery attempts fail.

### 14.11 USSD Transaction Flow

#### Source of Truth

- ussd-service owns session state.
- Target financial service owns transaction state.

#### Synchronous Steps

1. Telco gateway calls ussd-service.
2. ussd-service resolves tenant and session.
3. ussd-service authenticates member through configured PIN or OTP flow.
4. ussd-service calls target domain API for balance inquiry or transaction request.
5. ussd-service returns short response within telco timeout constraints.

#### Asynchronous Steps

- ussd-service emits UssdTransactionRequested.
- Target service emits financial domain events.
- ussd-service consumes completion events where needed for session messaging.
- notification-service may send confirmation SMS.
- audit-service records channel action.

#### Failure and Compensation

If a USSD session times out after submitting a transaction, the transaction service remains authoritative. The member may receive SMS confirmation or query status later. USSD retries must carry idempotency keys derived from session and transaction reference.

### 14.12 Audit Event Propagation

#### Source of Truth

- Producing service owns the action fact.
- audit-service owns immutable audit storage.

#### Synchronous Steps

For extremely sensitive actions, a service may synchronously validate that audit pipeline is available before allowing the action, based on policy.

#### Asynchronous Steps

- Producing service persists audit event in outbox within its local transaction.
- Outbox publisher emits audit event.
- audit-service stores audit record.
- audit-service emits AuditEventStored where needed.

#### Failure and Compensation

Audit event publication retries until stored. If audit events are dead-lettered, operations team must repair them. Critical financial operations must include operational alerts for audit backlog or audit storage failure.

## 15. Anti-Corruption Rules

### 15.1 External Provider Anti-Corruption

Provider-specific concepts must be isolated inside integration-owning services, especially payment-service and notification-service. Domain services should receive normalized platform concepts such as PaymentConfirmed rather than raw provider payloads.

### 15.2 Cross-Domain Anti-Corruption

Services must not import another domain's internal model. They may depend on:

- Public API contracts
- Public event schemas
- Stable reference identifiers
- Explicit snapshots included in event payloads

### 15.3 Legacy System Anti-Corruption

During migration, legacy integration should be wrapped behind adapters. Legacy data structures must not leak into new service domain models.

## 16. Reporting and Projection Boundaries

Report-service may maintain projections from multiple services, but those projections are read-only. If a report reveals an inconsistency, the correction must happen in the owning source service through an authorized workflow.

Projection rules:

- Projections must track event version and last processed offset.
- Projection freshness must be visible for financial reports.
- Rebuilds must be possible from retained events or controlled source exports.
- Report-service must not become a hidden integration layer between transaction services.

## 17. Operational Controls

### 17.1 Reconciliation Controls

Reconciliation must compare:

- payment-service provider records
- wallet-service wallet transactions
- savings-service contribution and withdrawal records
- loan-service repayment and disbursement records
- accounting-service ledger entries

Discrepancies must have owner, severity, age, tenant, and resolution status.

### 17.2 Repair Workflows

Repair workflows must be explicit, authorized, and audited. Examples:

- Reprocess failed event.
- Apply unapplied payment.
- Retry accounting posting.
- Reverse incorrect wallet transaction.
- Reconcile provider settlement mismatch.
- Rebuild reporting projection.

### 17.3 Observability Requirements

Every transaction-critical workflow must expose:

- Success count
- Failure count
- Pending count
- Retry count
- Dead letter count
- Average processing latency
- p95 processing latency
- Tenant-level breakdown where useful
- Correlation ID searchability

## 18. Implementation Readiness Checklist

Before backend implementation, each service must define:

- Owned aggregates
- Owned database schema or database
- Public APIs
- Accepted commands
- Emitted events
- Consumed events
- Idempotency keys and uniqueness rules
- Tenant isolation rules
- Authorization rules
- Audit events
- Failure states
- Retry policy
- Dead letter handling
- Reconciliation participation
- Performance and scaling assumptions

## 19. Summary

The SACCO platform service boundaries are organized around business capabilities and source-of-truth ownership. Transaction-critical services own their local state and use events, sagas, idempotency, and reconciliation to coordinate across service boundaries without distributed transactions.

This model protects financial integrity, tenant isolation, auditability, and scalability while keeping services independently deployable and understandable. It should be used as a primary guide for future backend implementation, API contract design, event schema design, database planning, DevOps readiness, and production operations.
