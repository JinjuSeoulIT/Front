# Auth/Menu/Staff compose

This compose file runs only the backend pieces needed for login, menu, and staff summary endpoints.

## Services

- `auth-service`
  - Handles `/api/auth/**`
  - Also serves `/api/admin/accounts/**` and `/api/admin/permissions/**`
- `menu-service`
  - Handles `/api/menus` and `/api/admin/menus`
- `staff-service`
  - Handles read-only staff endpoints in this repo:
    - `/api/staff`
    - `/api/staff/departments`
    - `/api/staff/locations`
- `redis`
  - Session/cache dependency for auth
- `frontend-gateway`
  - Public entrypoint for frontend developers
  - Proxies `/api/auth/**`, `/api/menus`, `/api/admin/menus`, `/api/staff/**`
  - Proxies `/` to the developer's local frontend through `host.docker.internal:3001`

## Important limitation

The staff server in this repo is not a full CRUD service.
It currently exposes summary/read-only routes only.

That means:
- `/api/staff/list` is mapped to `/api/staff` by the gateway for frontend compatibility
- update/create/delete/search-style staff endpoints are not implemented here

## Server-first run (recommended)

1. Copy env template:

```bash
cp auth-menu-staff.env.example .env.auth-menu-staff
```

2. Edit secrets and DB credentials in `.env.auth-menu-staff`

3. Start stack:

```bash
docker compose --env-file .env.auth-menu-staff -f docker-compose.auth-menu-staff.yml up -d --build
```

4. Check status:

```bash
docker compose --env-file .env.auth-menu-staff -f docker-compose.auth-menu-staff.yml ps
curl http://localhost:5555/healthz
```

## PowerShell helpers (Windows / pwsh)

```powershell
./scripts/auth-menu-staff-up.ps1
./scripts/auth-menu-staff-logs.ps1
./scripts/auth-menu-staff-down.ps1
```

## Bash helpers (Linux)

```bash
bash ./scripts/auth-menu-staff-up.sh
bash ./scripts/auth-menu-staff-logs.sh
bash ./scripts/auth-menu-staff-down.sh
```

## Legacy run

```bash
docker compose -f docker-compose.auth-menu-staff.yml up --build
```

## Default ports

- Gateway: `5555`
- Redis: `6379`

The backend containers are internal-only by default. Frontend developers should open:

```text
http://localhost:5555
```

or

```text
http://<host-ip>:5555
```

## External dependencies

This compose file still expects Oracle outside Docker by default:

- `SPRING_DATASOURCE_URL=jdbc:log4jdbc:oracle:thin:@//192.168.1.67:1521/XE`

Override it with environment variables if needed.

## Useful overrides

- `FRONTEND_UPSTREAM`
  - default: `host.docker.internal:3001`
- `GATEWAY_HOST_PORT`
  - default: `5555`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_REDIS_PASSWORD`
