# Prompt 007 — Domain-Driven Service Boundaries

You are acting as a senior domain architect, backend architect, and financial systems designer for a modern multi-tenant SACCO platform.

Read and align with these documents first:

- prompts/001-project-master-context.md
- docs/03-technical-specification.md
- docs/04-architecture-blueprint.md
- docs/06-backend-microservices.md
- docs/07-database-design.md
- docs/08-api-specification.md

Generate a comprehensive domain-driven service boundaries document.

Save the output to:

- docs/11-domain-driven-service-boundaries.md

Do not generate implementation code.

## Platform Context

The SACCO platform must support:

- Multi-tenancy
- Keycloak or equivalent OIDC/OAuth2 identity and access management
- Over 1 million members
- Web platform
- Member PWA
- Mobile app
- USSD channel adapter
- Admin/staff portal
- Third-party integrations
- Financial transaction integrity
- High availability and scalability
- PostgreSQL-backed transactional persistence
- Event-driven communication where appropriate
- Docker and Kubernetes-ready deployment

## Required Focus Areas

The document must define:

1. Service ownership boundaries
2. Source-of-truth boundaries
3. Bounded contexts
4. Inter-service communication rules
5. Synchronous API communication rules
6. Asynchronous event communication rules
7. Domain event ownership
8. Event naming and payload principles
9. Saga patterns for cross-service workflows
10. Financial transaction integrity rules
11. Retry and idempotency rules
12. Outbox/inbox pattern requirements
13. Tenant isolation propagation
14. Audit context propagation
15. Failure handling rules
16. Compensation and reversal patterns
17. Reconciliation requirements
18. Reporting/read-model boundaries
19. Anti-coupling rules
20. Anti-monolith rules

## Required Service Coverage

Cover boundaries for these services:

- gateway-service
- auth-service
- tenant-service
- user-service
- member-service
- savings-service
- loan-service
- wallet-service
- accounting-service
- payment-service
- notification-service
- report-service
- ussd-service
- audit-service
- configuration-service

For each service, define:

- Business responsibility
- Source-of-truth data
- Owned commands
- Owned queries
- Published domain events
- Consumed domain events
- Synchronous dependencies
- Asynchronous dependencies
- Database ownership
- Tenant isolation requirements
- Audit requirements
- Failure handling expectations
- Explicit non-responsibilities

## Financial Workflow Requirements

Include detailed service-boundary guidance for:

- Member registration
- KYC verification
- Savings contribution
- Savings withdrawal
- Loan application
- Loan approval
- Loan disbursement
- Loan repayment
- Wallet top-up
- Wallet transfer
- Payment callback handling
- Provider settlement reconciliation
- Accounting ledger posting
- Transaction reversal
- USSD-initiated financial transactions

## Required Architecture Rules

The document must enforce:

- No service may directly write another service's database tables.
- No frontend channel may own authoritative business rules.
- USSD must be treated as a channel adapter, not a duplicate backend.
- Payment provider callbacks must be normalized by payment-service.
- Accounting must own ledger records but not mutate source domain workflows.
- Reporting must use projections/read models and must not become a source of truth.
- Financial commands must be idempotent.
- Cross-service financial workflows must avoid distributed transactions.
- Cross-service workflows must use sagas, outbox/inbox, retries, compensation, and reconciliation.
- Tenant context must propagate through APIs, events, logs, audit records, cache keys, and persistence.
- Audit context must propagate through every sensitive or financial workflow.

## Output Quality

Make the document:

- Enterprise-grade
- Highly detailed
- Practical for backend implementation
- Suitable for developer onboarding
- Suitable for architecture review
- Suitable for investor/technical review
- Aligned with the approved technical specification, architecture blueprint, API specification, and database design

Use proper markdown sections, tables, and Mermaid diagrams where useful.
