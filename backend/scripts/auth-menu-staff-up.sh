#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.auth-menu-staff}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] Env file not found: $ENV_FILE" >&2
  echo "Create it first from auth-menu-staff.env.example" >&2
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.auth-menu-staff.yml up -d --build
docker compose --env-file "$ENV_FILE" -f docker-compose.auth-menu-staff.yml ps

echo ""
echo "Gateway health check:"
docker compose --env-file "$ENV_FILE" -f docker-compose.auth-menu-staff.yml exec -T frontend-gateway sh -lc "wget -qO- http://127.0.0.1:5555/healthz || true"
