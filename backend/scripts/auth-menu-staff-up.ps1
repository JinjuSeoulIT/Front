param(
  [string]$EnvFile = ".env.auth-menu-staff"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "[ERROR] Env file not found: $EnvFile" -ForegroundColor Red
  Write-Host "Create it first from auth-menu-staff.env.example" -ForegroundColor Yellow
  exit 1
}

docker compose --env-file $EnvFile -f docker-compose.auth-menu-staff.yml up -d --build
docker compose --env-file $EnvFile -f docker-compose.auth-menu-staff.yml ps

Write-Host ""
Write-Host "Gateway health check:" -ForegroundColor Cyan
docker compose --env-file $EnvFile -f docker-compose.auth-menu-staff.yml exec -T frontend-gateway sh -lc "wget -qO- http://127.0.0.1:5555/healthz || true"
