param(
  [string]$EnvFile = ".env.auth-menu-staff"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "[ERROR] Env file not found: $EnvFile" -ForegroundColor Red
  exit 1
}

docker compose --env-file $EnvFile -f docker-compose.auth-menu-staff.yml down
