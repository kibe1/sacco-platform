# Prompt 005 — Database Architecture & Design

You are acting as a senior PostgreSQL database architect designing a highly scalable multi-tenant SACCO platform.

Target stack:
- PostgreSQL
- Spring Boot microservices
- API-first architecture
- Event-driven integrations where necessary

The platform must support:
- Over 1 million members
- Multi-tenancy
- Financial transactions
- High concurrency
- Auditability
- Strong data integrity
- Reporting
- Configurable business rules

Generate a complete database architecture and design strategy.

The design must include:

1. Multi-tenant database strategy
2. Schema-per-service vs shared schema recommendations
3. Tenant isolation strategy
4. User and authentication schema
5. Member management schema
6. Savings schema
7. Loan schema
8. Wallet/accounting schema
9. Payment transaction schema
10. Audit logging schema
11. Notification schema
12. Reporting/analytics considerations
13. Configuration/settings schema
14. File/document storage metadata schema
15. Role and permissions schema

Also define:

- indexing strategy
- foreign key strategy
- partitioning strategy
- archival strategy
- soft delete strategy
- migration/versioning strategy
- transaction consistency strategy
- ACID considerations
- performance optimization strategy
- backup/recovery strategy

The design must prioritize:
- scalability
- maintainability
- financial integrity
- production readiness
- tenant safety
- reporting efficiency

Do not generate implementation code yet.

Focus on architecture, relationships, constraints, and database strategy.