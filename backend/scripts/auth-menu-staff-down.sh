#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.auth-menu-staff}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] Env file not found: $ENV_FILE" >&2
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.auth-menu-staff.yml down
