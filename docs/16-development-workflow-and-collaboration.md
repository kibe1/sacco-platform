# Development Workflow and Collaboration

## 1. Purpose

This document defines how the SACCO platform team should collaborate during implementation. It is especially intended to help parallel workstreams move quickly without overwriting each other or creating incompatible frontend, backend, API, and database changes.

This document does not generate implementation code.

## 2. Collaboration Context

The implementation work is expected to be split across at least two major frontend/product workstreams:

| Workstream | Primary Owner | Scope |
| --- | --- | --- |
| Member/customer workstream | Member/customer lead | Member portal, PWA, mobile app journeys, USSD member flows |
| Admin/staff workstream | Admin/staff lead | Admin portal, staff workflows, setup, approvals, reports, accounting, audit |
| Shared backend/platform | Shared/team decision | APIs, services, database, gateway, integrations, deployment, shared contracts |

All workstreams must use the same repository strategy, API contracts, branch workflow, and documentation rules.

## 3. Repository Strategy

Recommended starting point: one shared GitHub repository for the platform during early implementation.

Benefits:

- Everyone sees changes through pull, push, and pull requests.
- Shared docs stay with the code.
- API contracts can be reviewed with frontend changes.
- Architecture drift is easier to catch.
- Early team velocity is simpler than managing multiple repositories.

The repository may later split into multiple repositories if deployment ownership, team size, or security boundaries require it.

## 4. Recommended Monorepo Layout

The final structure may evolve, but implementation should start with clear top-level ownership boundaries.

```text
sacco-platform/
  apps/
    admin-portal/
    member-portal/
    mobile-app/
  services/
    gateway-service/
    auth-service/
    tenant-service/
    user-service/
    member-service/
    savings-service/
    loan-service/
    wallet-service/
    accounting-service/
    payment-service/
    notification-service/
    report-service/
    ussd-service/
    audit-service/
    configuration-service/
  packages/
    api-contracts/
    shared-types/
    ui/
  infrastructure/
    docker/
    kubernetes/
    ci/
  docs/
```

Rules:

- Admin portal and member portal must not silently duplicate business rules.
- Shared UI components belong in a shared package only when both workstreams need them.
- Backend services must remain independently owned modules, not one large shared application layer.
- API contracts should be reviewed before frontend and backend work diverge.

## 5. Branching Strategy

Recommended branch model:

| Branch Type | Example | Purpose |
| --- | --- | --- |
| Main branch | `main` | Stable, reviewed, deployable baseline |
| Feature branch | `feature/member-dashboard` | New feature |
| Service branch | `feature/savings-service-foundation` | Backend service work |
| Fix branch | `fix/payment-callback-dedupe` | Bug fix |
| Docs branch | `docs/security-architecture` | Documentation-only update |
| Release branch | `release/mvp-0.1` | Stabilization before release if needed |

Branch rules:

- Do not commit directly to `main`.
- Keep branches small and focused.
- Pull from `main` frequently.
- Open pull requests early when API/database contracts are involved.
- Avoid mixing unrelated frontend, backend, database, and docs changes in one pull request.

## 6. Pull Request Rules

Every pull request should answer:

- What changed?
- Why was it needed?
- Which module/service/app is affected?
- Does it change an API contract?
- Does it change a database schema?
- Does it affect tenant isolation?
- Does it affect financial transaction behavior?
- What tests were run?
- Which documentation was updated?

Pull requests affecting shared contracts require review from both relevant sides:

- Frontend owner if API response/request changes.
- Backend owner if UI depends on new/changed domain behavior.
- Database/service owner if persistence or transaction handling changes.
- Security/platform owner for auth, tenant isolation, payment, audit, or deployment changes.

## 7. Commit Standards

Use clear commit messages that explain the intent.

Recommended examples:

```text
docs: add integration architecture
feat(member): add member dashboard shell
feat(auth): add login contract
fix(payment): prevent duplicate callback processing
test(savings): cover contribution idempotency
chore(ci): add backend test workflow
```

Avoid vague commits such as:

```text
updates
changes
final
work
```

## 8. Daily Sync Rules

At the start of each work session:

- Pull latest `main`.
- Check open pull requests.
- Confirm whether any shared API or database files changed.
- Announce the area being worked on if another person may touch it.

At the end of each work session:

- Push active branch.
- Open or update pull request if work is meaningful.
- Note blockers or contract changes.
- Update docs if architecture/API/database behavior changed.

## 9. Ownership Boundaries

| Area | Member/Customer Workstream | Admin/Staff Workstream | Shared Coordination |
| --- | --- | --- | --- |
| Member portal | Primary | Consult | API contracts, auth, branding |
| PWA behavior | Primary | Consult | Security/offline rules |
| Mobile app | Primary | Consult | Mobile APIs, auth, push |
| USSD member menus | Primary | Consult | USSD service, financial commands |
| Admin portal | Consult | Primary | Shared UI, permissions |
| Staff operations | Consult | Primary | Member/savings/loan APIs |
| Reports/accounting/audit UI | Consult | Primary | Report APIs, permissions |
| Backend services | Shared | Shared | Service ownership per module |
| API contracts | Shared | Shared | Must be reviewed together |
| Database schema | Shared | Shared | Service owner approves |

## 10. API Contract Collaboration

API contracts must be agreed before parallel frontend/backend implementation begins.

For any new feature:

1. Define the user journey.
2. Identify owning service.
3. Define endpoint path and method.
4. Define request DTO.
5. Define response DTO.
6. Define error cases.
7. Define permissions.
8. Define idempotency needs.
9. Define audit/event impact.
10. Document contract before implementation.

Frontend may mock agreed contracts while backend implementation is in progress, but mocks must not invent behavior outside the contract.

## 11. Database Change Collaboration

Database changes require special care.

Rules:

- Each service owns its schema.
- No service may write another service's tables.
- Financial tables require explicit review.
- Migrations must be backward-compatible where possible.
- Migration rollback/repair approach must be documented.
- Seed data must be tenant-safe and non-production.
- Schema changes affecting APIs must be reflected in DTOs and documentation.

## 12. Documentation Update Rules

Update documentation when changing:

- Architecture boundaries.
- API contracts.
- Database schemas.
- Service ownership.
- Financial workflows.
- Security behavior.
- Deployment behavior.
- Testing expectations.
- Operational procedures.

Documentation should be updated in the same pull request as the related change where practical.

## 13. Conflict Avoidance Rules

To avoid stepping on each other:

- Do not both edit the same broad file for unrelated work.
- Keep shared configuration changes small.
- Use pull requests for visibility.
- Communicate before changing shared contracts.
- Prefer additive API changes during active parallel development.
- Avoid renaming shared files while another branch depends on them unless agreed.
- Resolve conflicts by preserving both valid workstreams and rechecking tests.

## 14. Local Environment Rules

Each developer should have:

- Local `.env` files ignored by Git.
- Local test credentials only.
- Local seed data.
- Ability to run their target frontend app.
- Ability to run the gateway and required backend services.
- Access to shared API docs/contracts.

No developer should connect local development to production databases, production secrets, or live payment credentials.

## 15. Definition of Ready

A feature is ready for implementation when:

- User journey is understood.
- Owning module/service is identified.
- API contract is drafted.
- Data ownership is clear.
- Permissions are clear.
- Tenant isolation impact is known.
- Idempotency/audit needs are known.
- UI owner and backend owner agree on scope.

## 16. Definition of Done

A feature is done when:

- Code is implemented in the correct ownership boundary.
- Tests pass.
- API contract is documented.
- Tenant isolation is enforced.
- Security and permissions are checked.
- Financial behavior is idempotent where required.
- Audit/events are emitted where required.
- UI handles loading/error/empty states.
- Documentation is updated.
- Pull request is reviewed and merged.

## 17. Recommended Meeting Before Implementation

Before coding starts, the team should align on:

- Repository location and access.
- Branch strategy.
- First MVP milestone.
- Who owns each app/service.
- Initial API contract format.
- Local development setup.
- Pull request review expectations.
- What Ken has already built and how it maps into the target architecture.

## 18. Summary

The team should proceed with one shared repository, clear branch discipline, pull requests, documented API contracts, and explicit ownership boundaries. This will allow member/mobile/PWA/USSD work and admin/staff work to progress quickly without creating incompatible systems.
