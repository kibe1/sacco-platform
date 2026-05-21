# Prompt 007 — Domain Service Boundaries & Domain-Driven Architecture

You are acting as a principal enterprise architect and domain-driven design specialist designing a modern multi-tenant SACCO platform.

The platform architecture uses:
- Spring Boot microservices
- PostgreSQL
- Kafka/event-driven communication
- API Gateway
- JWT authentication
- Next.js frontend

The platform must support:
- Over 1 million members
- Multi-tenancy
- Financial transaction integrity
- High scalability
- Web
- Mobile App
- USSD
- PWA

Generate a detailed domain-driven architecture document that defines the exact responsibilities, ownership boundaries, and interaction patterns between all backend services.

The document must clearly define:

1. Service ownership boundaries
2. Domain ownership rules
3. Source-of-truth ownership per service
4. Inter-service dependencies
5. Synchronous communication boundaries
6. Asynchronous/event-driven communication boundaries
7. Domain event ownership
8. Transaction orchestration strategy
9. Saga pattern recommendations
10. Compensating transaction strategy
11. Financial transaction integrity rules
12. Service isolation rules
13. Cross-service anti-corruption rules
14. Shared data avoidance strategy
15. Event versioning strategy
16. Tenant-aware service communication
17. Audit propagation strategy
18. Correlation ID propagation
19. Failure handling strategy
20. Retry and idempotency strategy

The document must deeply define the responsibilities for:

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
- gateway-service

For each service define:
- what it owns
- what it does NOT own
- which events it emits
- which events it consumes
- which APIs it exposes
- which services can call it
- which services it depends on
- whether it is transaction-critical
- scalability characteristics
- consistency requirements

Also define detailed workflows for:

1. Member registration
2. Savings contribution
3. Withdrawal processing
4. Loan application
5. Loan approval
6. Loan disbursement
7. Loan repayment
8. Wallet transfer
9. Payment callback handling
10. Notification dispatch
11. USSD transaction flow
12. Audit event propagation

For each workflow define:
- synchronous steps
- asynchronous steps
- event emissions
- rollback/compensation strategy
- source of truth
- failure recovery behavior

Do NOT generate implementation code.

Focus on:
- clean architecture
- financial integrity
- scalability
- enterprise-grade service boundaries
- production readiness
- maintainability
- auditability
- tenant isolation