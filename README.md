# SACCO Platform

Modern multi-tenant SACCO platform for admin/staff operations, member self-service, PWA, mobile app, USSD, and partner integrations.

## Workspace Layout

```text
apps/
  admin-portal/
  member-portal/
  mobile-app/
packages/
  api-contracts/
  shared-types/
  ui/
services/
  gateway-service/
  auth-service/
  tenant-service/
  user-service/
  member-service/
  ussd-service/
infrastructure/
  docker/
  kubernetes/
database/
  migrations/
docs/
prompts/
```

## First Implementation Slice

- Keycloak/OIDC identity foundation
- API gateway foundation
- Auth-service facade foundation
- Tenant-service foundation
- User/RBAC foundation
- Member-service foundation
- USSD channel adapter foundation
- Admin and member portal shells

## Local Platform Services

The root `docker-compose.yml` starts the local infrastructure baseline:

- PostgreSQL
- Redis
- Kafka
- Keycloak

Application services and frontend apps will be added to local orchestration as they become runnable.
