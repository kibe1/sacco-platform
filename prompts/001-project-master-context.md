# SACCO Platform — Master Project Context

## Project Objective

Build a modern enterprise SACCO platform using a decoupled microservice architecture.

The platform must support:
- Multi-tenancy
- Over 1 million members
- Web platform
- Mobile App
- USSD
- PWA capabilities
- Configurable branding and workflows
- Containerized deployment
- API-first architecture

---

# Technology Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod

## Backend
- Spring Boot microservices
- API Gateway
- JWT Authentication
- Kafka/Event-driven communication where necessary

## Database
- PostgreSQL
- Schema/service-based design
- Strong indexing
- Referential integrity
- Optimized queries

## Infrastructure
- Docker
- Docker Compose
- Kubernetes-ready architecture

---

# Architectural Principles

1. Never create a monolith.
2. Services must be decoupled.
3. APIs must be reusable.
4. Avoid hardcoded business logic.
5. Everything configurable via admin portal where possible.
6. Multi-tenancy must be supported from the beginning.
7. UI must be mobile responsive.
8. Maintain clean separation between:
   - frontend
   - backend
   - database
   - infrastructure
9. Avoid tight coupling between services.
10. Maintain clean documentation throughout the project.

---

# Initial Core Services

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

---

# Frontend Principles

1. Use modern enterprise dashboard patterns.
2. Use shadcn/ui components.
3. Support dark mode.
4. Use reusable components.
5. Support tenant branding:
   - logo
   - colors
   - menus
   - themes
6. Optimize for:
   - desktop
   - tablet
   - mobile

---

# Coding Standards

1. Use TypeScript strictly.
2. Avoid duplicated logic.
3. Use clean architecture principles.
4. Use DTOs and service layers.
5. Use environment variables properly.
6. Add comments for important business logic.
7. Prioritize maintainability and scalability.

---

# AI Development Rules

1. Generate production-grade code only.
2. Avoid placeholder/demo logic unless specified.
3. Avoid fake/mock implementations unless explicitly requested.
4. Generate modular reusable code.
5. Keep architecture scalable.
6. Explain important architectural decisions.
7. Maintain documentation alongside code generation.

---

# Documentation Requirements

Every major generated component should include:
- purpose
- architecture notes
- dependencies
- API endpoints
- setup instructions
- deployment notes

---

# Current Phase

Current phase is:
- architecture planning
- frontend research
- technical specifications
- database planning
- API design

Do NOT generate the full system yet.