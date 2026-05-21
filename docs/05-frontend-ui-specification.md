# Frontend UI Specification

## 1. Purpose

This document defines the enterprise frontend UI specification for the SACCO platform. It translates the platform architecture, technical specification, and domain-driven service boundaries into frontend implementation guidance for a Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, and Zod application.

The specification is intended to guide future frontend implementation for:

- Tenant-aware admin portal
- SACCO staff portal
- Member web portal
- Progressive Web App experience
- Responsive desktop, tablet, and mobile usage
- API-driven, role-aware, secure financial workflows

This document does not generate implementation code.

## 2. Frontend Objectives

- Provide a modern enterprise dashboard experience for SACCO operations.
- Support configurable tenant branding, menus, themes, and workflows.
- Enforce role-aware and permission-aware navigation.
- Support high-volume operational workflows such as member onboarding, savings, loans, wallet, accounting, reports, and settings.
- Keep frontend logic cleanly separated from backend domain ownership.
- Use reusable components and consistent design tokens.
- Provide accessible, responsive, and PWA-ready user experiences.
- Treat backend services as the source of truth for financial rules and transaction outcomes.
- Surface loading, empty, pending, failed, retry, and reconciliation states clearly.

## 3. Technology Stack

| Concern | Technology |
| --- | --- |
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component system | shadcn/ui |
| Server state | TanStack Query |
| Client UI state | Zustand |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | lucide-react |
| API access | Gateway-backed HTTP APIs |
| PWA | Web manifest, service worker strategy, responsive app shell |

## 4. Application Architecture

The frontend shall be organized as a modular Next.js application with route groups for public, authenticated, admin, staff, member, and settings areas.

```text
frontend/
  app/
    (public)/
    (auth)/
    (app)/
      admin/
      staff/
      member/
      settings/
      reports/
    api-boundary/
  components/
    ui/
    layout/
    navigation/
    data-display/
    forms/
    feedback/
    charts/
    tenant/
    workflow/
  features/
    auth/
    tenants/
    users/
    members/
    savings/
    loans/
    wallet/
    accounting/
    payments/
    reports/
    notifications/
    ussd/
    configuration/
    audit/
  lib/
    api/
    auth/
    tenant/
    query/
    validation/
    formatting/
    permissions/
    constants/
  stores/
  styles/
  types/
  config/
```

This is a recommended structure, not implementation code. Actual folder names may be adjusted during implementation if the team adopts a different Next.js convention, but the separation of route, component, feature, API, state, and utility concerns should remain.

## 5. Recommended Folder Responsibilities

| Folder | Responsibility |
| --- | --- |
| `app/` | Next.js routes, layouts, route groups, loading states, error boundaries |
| `components/ui/` | shadcn/ui generated primitives and locally wrapped base UI primitives |
| `components/layout/` | App shell, sidebar, topbar, page header, responsive containers |
| `components/navigation/` | Role-aware menus, breadcrumbs, tabs, mobile navigation |
| `components/data-display/` | Tables, status badges, metric cards, timelines, detail lists |
| `components/forms/` | Shared form fields, field groups, form sections, validation summaries |
| `components/feedback/` | Loading states, skeletons, empty states, alerts, toasts, error panels |
| `components/tenant/` | Tenant logo, brand loader, theme applier, tenant switcher where allowed |
| `components/workflow/` | Approval steps, transaction status, audit timeline, process indicators |
| `features/` | Domain feature modules grouped by business capability |
| `lib/api/` | API client, request interceptors, response normalization, error mapping |
| `lib/auth/` | Session helpers, token refresh coordination, auth guards |
| `lib/tenant/` | Tenant resolution helpers, branding mappers, tenant context utilities |
| `lib/query/` | Query key factories, mutation conventions, cache invalidation helpers |
| `lib/validation/` | Shared Zod schemas and form validation helpers |
| `lib/permissions/` | Permission checks and navigation visibility helpers |
| `stores/` | Zustand stores for UI-only state |
| `styles/` | Global styles, Tailwind layer extensions, theme variables |
| `types/` | Shared frontend DTO and view model types |
| `config/` | Build-time frontend configuration and constants |

## 6. Layout Hierarchy

The application shall use layered layouts that resolve tenant, auth, navigation, and page concerns progressively.

```text
RootLayout
  PublicLayout
    Landing/Auth/Recovery pages
  AuthenticatedLayout
    TenantProvider
    SessionProvider
    PermissionProvider
    AppShell
      Sidebar
      Topbar
      NotificationCenter
      PageContainer
        ModuleLayout
          PageHeader
          PageToolbar
          ContentRegion
```

### 6.1 Root Layout

The root layout shall handle:

- Global metadata
- Global styles
- Theme initialization
- Query provider
- Toast/notification host
- Error boundary root
- PWA manifest references

### 6.2 Authenticated Layout

The authenticated layout shall handle:

- Session validation
- Tenant context loading
- Permission context loading
- Tenant branding application
- App shell rendering
- Navigation filtering
- Idle timeout behavior

### 6.3 Module Layout

Each major domain module should have a module layout for:

- Module-level tabs
- Module-specific actions
- Search and filters
- Bulk action toolbars
- Contextual help where approved
- Consistent detail page structure

## 7. Route Grouping Strategy

Routes shall be grouped by access model and business capability.

| Route Group | Purpose |
| --- | --- |
| `(public)` | Tenant landing, public information, invitation acceptance where applicable |
| `(auth)` | Login, MFA, password reset, session recovery |
| `(app)/admin` | Platform administrator and tenant administrator operations |
| `(app)/staff` | SACCO staff operations |
| `(app)/member` | Member self-service web portal |
| `(app)/settings` | Tenant settings, configuration, branding, workflows |
| `(app)/reports` | Dashboards, reports, exports |

### 7.1 Suggested Page Modules

| Module | Representative Pages |
| --- | --- |
| Dashboard | Overview, activity, approvals, alerts, KPIs |
| Tenants | Tenant list, tenant profile, domains, status, subscription, isolation tier |
| Users and Roles | Users, roles, permissions, branch scopes, access reviews |
| Members | Member list, profile, KYC, documents, status, notes, audit timeline |
| Savings | Products, accounts, contributions, withdrawals, holds, statements |
| Loans | Products, applications, approvals, disbursements, repayments, arrears |
| Wallet | Wallet accounts, transfers, holds, transaction history, reconciliation |
| Accounting | Chart of accounts, journals, ledger, trial balance, reconciliation |
| Payments | Payment requests, callbacks, provider references, settlements, exceptions |
| Reports | Operational reports, financial reports, exports, dashboards |
| Notifications | Templates, dispatch logs, delivery status, provider settings |
| USSD | Menus, short codes, sessions, transaction limits, channel settings |
| Configuration | Feature flags, workflows, fees, limits, branding, product rules |
| Audit | Audit search, event detail, security events, export |

## 8. Dashboard Layout Strategy

The dashboard shall be dense, operational, and optimized for repeated use. It should avoid marketing-style hero layouts. The first screen should expose actionable operational state.

### 8.1 Dashboard Regions

- Topbar with tenant context, global search, notifications, and user menu.
- Sidebar with role-filtered primary navigation.
- Page header with title, status, and primary actions.
- KPI strip for financial and operational metrics.
- Work queues for approvals, pending exceptions, and failed transactions.
- Activity feed for recent transactions and audit-relevant events.
- Alert panels for reconciliation issues, provider failures, and system notices.

### 8.2 Responsive Behavior

| Viewport | Behavior |
| --- | --- |
| Desktop | Persistent sidebar, multi-column dashboard, dense tables |
| Tablet | Collapsible sidebar, two-column cards, horizontally scrollable tables where needed |
| Mobile | Bottom or drawer navigation, single-column content, compact actions, card-style summaries |

## 9. shadcn/ui Usage Strategy

shadcn/ui shall provide the base component primitives. Components should be wrapped into platform-specific components only where doing so adds consistent behavior, tenant-aware styling, permission logic, or accessibility improvements.

### 9.1 Recommended shadcn/ui Components

| UI Need | Component Direction |
| --- | --- |
| Buttons and actions | Button, DropdownMenu, Tooltip |
| Forms | Form, Input, Select, Checkbox, RadioGroup, Switch, Textarea |
| Layout surfaces | Card only for repeated items, dialogs, and framed tools |
| Navigation | Tabs, Breadcrumb, DropdownMenu, Sheet |
| Data display | Table, Badge, Avatar, Separator |
| Feedback | Alert, Toast/Sonner, Skeleton, Progress |
| Overlays | Dialog, AlertDialog, Popover, Command |
| Advanced input | Calendar, Date Picker patterns, Combobox patterns |

### 9.2 Component Extension Rules

- Keep shadcn/ui primitives close to their generated shape.
- Build domain components outside `components/ui`.
- Do not embed API calls in base UI primitives.
- Use lucide icons for icon buttons and navigation.
- Provide tooltips for icon-only controls.
- Ensure disabled, loading, destructive, and pending states are consistent.

## 10. Tailwind Design System

The design system shall be token-driven and tenant-aware.

### 10.1 Token Categories

- Color: background, foreground, primary, secondary, accent, muted, destructive, warning, success, border, ring.
- Typography: font family, weight, size scale, line height.
- Spacing: page gutters, section spacing, component gaps.
- Radius: consistent enterprise UI radius, generally 8px or less for cards unless overridden.
- Elevation: restrained shadows for overlays and navigation, not decorative cards.
- Status colors: pending, approved, posted, failed, reversed, reconciled, suspended.

### 10.2 Color Strategy

Tenant colors should map to semantic CSS variables rather than hardcoded Tailwind classes. The UI must remain readable if a tenant chooses low-contrast colors; fallback contrast rules are required.

### 10.3 Status Design

Financial and workflow statuses must be visually consistent:

| Status | UI Treatment |
| --- | --- |
| Pending | Muted badge, progress indicator where active |
| Approved | Positive badge, approval metadata visible |
| Posted | Success badge, transaction reference visible |
| Failed | Destructive badge, retry/repair action where authorized |
| Reversed | Warning or neutral badge, reversal reference visible |
| Reconciled | Success/verified indicator |
| Suspended | Warning badge and restricted action state |

## 11. Tenant Branding Strategy

Tenant branding must be loaded from backend configuration and applied after tenant resolution.

### 11.1 Branding Inputs

- Tenant name
- Logo
- Primary color
- Secondary/accent color
- Theme preference
- Menu labels
- Enabled modules
- Feature flags
- Custom domain or subdomain

### 11.2 Branding Application

The frontend shall:

- Resolve tenant from domain, subdomain, selected tenant context, or authenticated claims.
- Load tenant branding before rendering authenticated shell where possible.
- Apply branding through CSS variables.
- Preserve accessibility contrast.
- Show safe fallback branding if tenant assets fail to load.
- Avoid allowing tenant branding to override security or status semantics.

## 12. Role-Based Navigation

Navigation must be derived from authenticated identity, tenant configuration, enabled features, and user permissions.

### 12.1 Navigation Inputs

- Tenant ID
- User identity
- Role assignments
- Permission list
- Branch or organizational scope
- Enabled tenant modules
- Feature flags
- Channel constraints

### 12.2 Navigation Rules

- Hide pages the user cannot access.
- Also protect routes server-side or at route guard level; hidden navigation alone is insufficient.
- Show disabled states only when helpful to explain unavailable pending setup.
- Display approvals, exceptions, and alerts according to role.
- Keep member portal navigation simpler than staff/admin navigation.

### 12.3 Primary Navigation Groups

- Dashboard
- Members
- Savings
- Loans
- Wallet
- Accounting
- Payments
- Reports
- Notifications
- USSD
- Configuration
- Users and Roles
- Audit
- Tenant Administration

## 13. Reusable Component Strategy

The component architecture shall distinguish base UI primitives, composition components, and domain components.

### 13.1 Component Types

| Type | Examples | Rules |
| --- | --- | --- |
| Base UI | Button, Input, Dialog, Table | No domain logic or API calls |
| Layout | AppShell, Sidebar, PageHeader, PageToolbar | May use auth/tenant context |
| Data display | StatusBadge, MoneyValue, DateTimeValue, AuditTimeline | Pure formatting and display logic |
| Forms | FormSection, CurrencyField, PhoneField, DocumentUploadField | Integrated with form strategy, not domain persistence |
| Domain | MemberSummaryCard, LoanApplicationStepper, SavingsAccountPanel | May encode presentation-specific domain concepts |
| Workflow | ApprovalStepper, TransactionStatusPanel, RetryBanner | Shows process state and allowed actions |

### 13.2 Naming Conventions

- Components: PascalCase, descriptive names.
- Hooks: `use` prefix and domain-aware names.
- Query keys: domain-first naming.
- DTO/view types: suffix with `Dto`, `View`, or `FormValues` depending on purpose.
- Avoid vague component names such as `CommonCard` or `DataComponent`.

## 14. Forms Strategy

Forms shall use React Hook Form for form state and Zod for validation schemas. Backend validation remains authoritative.

### 14.1 Form Principles

- Use Zod schemas for client-side validation and type inference.
- Keep schemas close to feature modules unless broadly reused.
- Use multi-step forms for complex workflows such as KYC, loan applications, product setup, and workflow configuration.
- Autosave drafts only for safe non-financial setup workflows.
- Clearly show validation errors at field and form summary levels.
- Prevent duplicate submissions through disabled states and idempotency-aware mutations.
- Show pending backend processing states for financial transactions.

### 14.2 Critical Forms

| Form | Requirements |
| --- | --- |
| Login | Tenant-aware, MFA-ready, locked account messaging |
| Member registration | KYC sections, document metadata, duplicate checks, status display |
| Loan application | Product selection, eligibility feedback, guarantor/attachment readiness |
| Loan approval | Approval summary, limits, comments, step-up auth where required |
| Savings withdrawal | Balance context, fees, approval state, confirmation |
| Wallet transfer | Recipient validation, amount, limits, confirmation, idempotency |
| Tenant configuration | Versioned changes, audit summary, preview |
| Workflow builder | Step definitions, roles, thresholds, validation summary |

## 15. Table and Data-Grid Strategy

Operational screens shall use table/data-grid patterns optimized for scanning, filtering, and action.

### 15.1 Table Requirements

- Server-side pagination for large datasets.
- Server-side filtering and sorting for high-volume resources.
- Column visibility controls for power users where useful.
- Persistent filters per user where appropriate.
- Row-level actions based on permissions.
- Bulk actions only where domain services support safe bulk operations.
- Export actions must use report-service asynchronous exports for heavy datasets.
- Empty, loading, error, and no-results states must be distinct.

### 15.2 High-Volume Tables

High-volume tables include:

- Members
- Savings accounts
- Savings transactions
- Loan applications
- Loan accounts
- Loan repayments
- Wallet transactions
- Payment callbacks
- Ledger entries
- Audit records
- Notification logs
- USSD sessions

### 15.3 Row Status and Actions

Rows should expose:

- Primary identifier
- Tenant/branch context where relevant
- Status badge
- Last updated timestamp
- Responsible actor where applicable
- Available next action
- Audit/detail link

## 16. API Integration Strategy

The frontend shall communicate through the API gateway only. It must not call backend services directly.

### 16.1 API Client Responsibilities

- Attach auth token where required.
- Include tenant context where required by gateway contract.
- Propagate or receive correlation IDs.
- Normalize error responses.
- Handle token refresh coordination.
- Apply timeout behavior and request cancellation where supported.
- Map backend DTOs into UI view models where needed.

### 16.2 Error Categories

| Error Type | UI Behavior |
| --- | --- |
| Validation | Field errors and form summary |
| Authentication | Redirect to login or refresh session |
| Authorization | Access denied page or disabled action |
| Tenant mismatch | Block action, show safe support message |
| Business rule rejection | Explain rule outcome in workflow context |
| Idempotency conflict | Show previous result or conflict warning |
| Network failure | Retry affordance for safe reads, pending state for accepted commands |
| Provider/pending state | Show pending/investigation state, not generic failure |

## 17. TanStack Query Strategy

TanStack Query shall own server state.

### 17.1 Query Responsibilities

- Fetch and cache API data.
- Refetch on focus only where safe and useful.
- Provide loading, error, stale, and refetch states.
- Invalidate affected queries after mutations.
- Separate list queries, detail queries, and reference queries.
- Avoid storing server state in Zustand.

### 17.2 Query Key Design

Query keys should include:

- Domain
- Tenant ID
- Resource type
- Resource ID where applicable
- Filters and pagination where applicable

Examples as naming guidance:

- tenant profile
- current user access profile
- member list by filters
- member detail by member ID
- loan application detail
- wallet transaction list
- audit search results

### 17.3 Mutation Strategy

Mutations must:

- Be idempotency-aware for financial operations.
- Disable duplicate submit actions while pending.
- Show accepted, pending, posted, failed, or retryable outcomes.
- Invalidate related list/detail queries.
- Avoid optimistic updates for authoritative financial balances unless explicitly approved.

## 18. Zustand Usage Boundaries

Zustand shall be used for client UI state only. It must not become a shadow backend cache.

### 18.1 Appropriate Zustand State

- Sidebar collapsed state
- Theme preference
- Temporary table column visibility
- Command palette state
- Draft UI filters where not persisted server-side
- Modal and drawer orchestration
- Local onboarding progress for non-submitted forms
- PWA install prompt state

### 18.2 Avoid in Zustand

- Member records
- Financial balances
- Loan status
- Savings account state
- Wallet transaction state
- Payment status
- Authoritative permissions beyond current session context
- Report results

## 19. Authentication UI Flows

### 19.1 Login Flow

1. Resolve tenant context from host or selected tenant.
2. Display tenant-aware login branding.
3. Submit credentials to auth flow through gateway.
4. If MFA is required, move to MFA challenge screen.
5. On success, load user access profile and tenant configuration.
6. Route user to role-appropriate dashboard.

### 19.2 MFA Flow

- Support OTP or configured MFA provider.
- Show resend and timeout states.
- Rate-limit visible attempts.
- Avoid revealing whether a user exists.
- Audit failed MFA attempts through backend events.

### 19.3 Session Flow

- Refresh tokens according to backend policy.
- Show idle timeout warning before ending session.
- Clear sensitive local state on logout.
- Handle revoked sessions gracefully.
- Redirect to login on expired authentication.

## 20. Admin Portal Screens

### 20.1 Platform Admin

- Tenant registry
- Tenant profile and status
- Tenant domain/subdomain management
- Tenant isolation tier view
- Tenant feature enablement
- Platform user management
- Global audit and system health access where authorized

### 20.2 Tenant Admin

- Tenant dashboard
- Branch and organization setup
- Users, roles, and permissions
- Branding and theme settings
- Product configuration
- Workflow configuration
- Fees and limits
- Notification templates
- USSD menus
- Payment provider settings
- Report access configuration
- Audit search

### 20.3 Staff Operations

- Member onboarding queue
- KYC review
- Savings account operations
- Loan application review
- Approval work queue
- Payment exceptions
- Reconciliation queues
- Member support view

## 21. Member Portal Screens

The member portal should be simpler than the staff/admin portal and optimized for self-service.

### 21.1 Member Home

- Account summary
- Savings balances
- Loan summary
- Wallet summary
- Pending actions
- Recent transactions
- Notifications

### 21.2 Member Capabilities

- View profile and KYC status
- Submit or update allowed KYC information
- View savings accounts and statements
- Initiate savings contributions where enabled
- Request withdrawals where enabled
- Apply for loans
- View loan status and repayment schedule
- Make repayments
- View wallet transactions
- Manage notification preferences

### 21.3 Member Safety

- Mask sensitive identifiers.
- Require confirmation for financial actions.
- Use step-up authentication for high-risk actions.
- Clearly distinguish pending, posted, failed, and reversed transactions.

## 22. Mobile and PWA Behavior

### 22.1 Responsive PWA Requirements

- Installable manifest.
- Mobile-first navigation patterns.
- Safe static asset caching.
- Offline messaging and degraded-state screens.
- Clear pending state for submitted financial workflows.
- Push-notification readiness.
- Touch-friendly controls and adequate hit targets.

### 22.2 Offline and Poor Network Rules

- Do not finalize financial transactions offline.
- Allow safe read-only cached data with freshness indicators.
- Allow draft capture for non-financial forms where approved.
- Queueing financial commands on the client is not allowed without a formally approved offline protocol.
- Show retry options only for safe idempotent operations.

## 23. Accessibility

The platform shall target WCAG-aligned accessible interaction.

### 23.1 Accessibility Requirements

- Keyboard-accessible navigation and actions.
- Visible focus states.
- Semantic landmarks and headings.
- Screen-reader labels for icon buttons.
- Proper form labels and error relationships.
- Sufficient color contrast, including tenant-branded themes.
- Status indicators must not rely on color alone.
- Dialogs, menus, popovers, and sheets must manage focus correctly.
- Tables must preserve readable header and row relationships.

## 24. Dark Mode

Dark mode shall be supported as a first-class theme.

### 24.1 Theme Sources

- Tenant default preference
- User preference
- System preference where allowed

### 24.2 Dark Mode Rules

- All semantic tokens must have light and dark values.
- Status badges must remain readable in both modes.
- Charts must use accessible palettes in both modes.
- Tenant colors must be adjusted or constrained to preserve contrast.
- Financial warning and destructive states must remain visually distinct.

## 25. Loading, Error, Empty, and Pending States

### 25.1 Loading States

- Use skeletons for page and table loading.
- Use button-level loading indicators for submitted actions.
- Avoid full-screen blocking loaders except during auth or initial app bootstrap.

### 25.2 Empty States

Empty states must explain the absence of data and provide the next allowed action where appropriate.

Examples:

- No members found after filters.
- No pending loan approvals.
- No payment exceptions.
- No reports generated yet.

### 25.3 Error States

Error states must distinguish:

- Failed to load
- Access denied
- Validation failed
- Business rule rejected
- Transaction pending investigation
- Provider unavailable
- Session expired

### 25.4 Financial Pending States

Financial workflows often complete asynchronously. The UI must show clear states:

- Request accepted
- Awaiting payment
- Awaiting approval
- Processing
- Posted
- Failed
- Reversed
- Under reconciliation

## 26. Frontend Security Considerations

### 26.1 Security Requirements

- Treat all clients as untrusted.
- Never enforce business rules only in the frontend.
- Do not store passwords, OTPs, PINs, or payment secrets.
- Mask sensitive personal and financial data based on role.
- Use secure token storage strategy aligned with backend auth design.
- Clear sensitive state on logout or session expiry.
- Avoid logging sensitive data to the browser console.
- Protect against XSS through safe rendering and strict content policies.
- Use CSRF protection if cookie-based auth is adopted.
- Validate file uploads before submission while relying on backend validation as authoritative.

### 26.2 Permission Handling

Frontend permission checks improve usability but do not replace backend authorization. Every mutation and sensitive read must be authorized by the backend.

## 27. Module-Level UI Requirements

### 27.1 Members

- Member directory with filters, status, branch, and KYC indicators.
- Member profile with tabs for overview, KYC, documents, savings, loans, wallet, notes, audit.
- KYC workflow with review status and rejection reasons.
- Status transitions must require confirmation and audit-friendly comments.

### 27.2 Savings

- Savings products list and configuration screens.
- Savings account detail with balance, holds, contributions, withdrawals, statements.
- Contribution and withdrawal flows with fees, limits, and status.
- Withdrawal approval work queue where configured.

### 27.3 Loans

- Loan product configuration.
- Loan application list and detail.
- Eligibility and approval workflow views.
- Disbursement status panel.
- Repayment schedule and repayment history.
- Arrears and exception views.

### 27.4 Wallet

- Wallet summary and transaction history.
- Transfer flow with recipient verification.
- Holds and releases visibility.
- Reconciliation status where applicable.

### 27.5 Accounting

- Chart of accounts.
- Journal entries and ledger views.
- Trial balance.
- Product-to-ledger mappings.
- Reconciliation views.
- Period close indicators where applicable.

### 27.6 Payments

- Payment request list.
- Provider callback list.
- Payment detail with provider reference, correlation ID, domain application state.
- Settlement and reconciliation exception queues.

### 27.7 Reports

- Dashboard reports.
- Operational reports.
- Financial reports.
- Export job status.
- Download access with audit trail.

### 27.8 Configuration

- Tenant branding.
- Menus and feature flags.
- Fees and limits.
- Approval workflows.
- Product rules.
- Notification templates.
- USSD menus.

### 27.9 Audit

- Audit search.
- Audit detail.
- Actor, action, entity, tenant, channel, correlation ID, and timestamp filters.
- Export workflow where authorized.

## 28. API-to-UI State Mapping

| Backend Concept | UI Treatment |
| --- | --- |
| TenantSuspended | Block authenticated tenant operations and show support/admin guidance |
| MemberKycPending | Show KYC banner and restrict configured actions |
| PaymentConfirmed | Show confirmed status, then wait for domain application if needed |
| PaymentFailed | Show failed payment state with retry if allowed |
| SavingsContributionPosted | Update account activity and contribution status |
| WithdrawalApproved | Show payout or posting progress |
| LoanApproved | Show approved loan and next disbursement action |
| LoanDisbursed | Show active loan, repayment schedule, and receipt |
| WalletTransferCompleted | Show posted transfer and transaction reference |
| LedgerPostingFailed | Show accounting-pending or exception state to authorized staff |
| NotificationFailed | Show delivery issue only where operationally relevant |

## 29. Performance and Scalability

### 29.1 Frontend Performance Goals

- Keep initial authenticated shell fast and progressively load module data.
- Use route-level splitting through Next.js.
- Avoid loading all module permissions, reports, or lists at startup.
- Use server-side pagination and filtering for high-volume tables.
- Cache reference data with clear invalidation.
- Avoid unnecessary refetch loops on financial status screens.
- Use skeletons and partial rendering for perceived performance.

### 29.2 Large Dataset Handling

- Always query paginated member, transaction, audit, ledger, and report lists.
- Prefer backend search/filter APIs for large datasets.
- Avoid client-side filtering over large API responses.
- Use asynchronous report exports instead of large browser downloads.

## 30. Observability and Supportability

The frontend should support production diagnostics without exposing sensitive data.

### 30.1 Frontend Telemetry

Track safe operational signals:

- Route load failures
- API error categories
- Auth/session expiration frequency
- PWA install events where useful
- Client-side validation failure patterns
- User workflow abandonment for complex forms
- Feature flag exposure where approved

### 30.2 Correlation and Support

When backend responses include correlation IDs or transaction references, the UI should expose them in detail pages and support panels where appropriate. This helps support teams trace issues across gateway, services, audit logs, and payment providers.

## 31. Frontend Implementation Readiness Checklist

Before implementation, the team should define:

- Route groups and module ownership.
- Tenant branding contract.
- Navigation and permission contract.
- API error response contract.
- Query key conventions.
- Mutation and idempotency conventions.
- Form schema ownership.
- Table filter and pagination conventions.
- Loading, error, empty, and pending state components.
- Accessibility acceptance criteria.
- Dark mode token set.
- PWA caching policy.
- Token storage and refresh strategy.
- Frontend observability policy.

## 32. Summary

The SACCO frontend shall be a tenant-aware, role-aware, enterprise dashboard application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, and Zod. It must provide efficient operational workflows for administrators, staff, and members while respecting backend source-of-truth boundaries and financial-system security requirements.

This specification should guide future frontend implementation so the application remains scalable, accessible, maintainable, secure, responsive, and aligned with the platform's microservice and multi-tenant architecture.
