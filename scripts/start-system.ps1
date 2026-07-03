param(
  [switch]$SkipSeed,
  [switch]$NoBuild,
  [switch]$RecreateConflictingContainers
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $rootDir

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Read-EnvValue {
  param(
    [string]$Path,
    [string]$Name,
    [string]$DefaultValue
  )

  if (-not (Test-Path $Path)) {
    return $DefaultValue
  }

  $line = Get-Content $Path | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1

  if (-not $line) {
    return $DefaultValue
  }

  $value = ($line -split "=", 2)[1].Trim()
  if (-not $value) {
    return $DefaultValue
  }

  return $value
}

function Wait-Http {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  throw "Timeout aguardando $Url"
}

function Wait-ContainerHealthy {
  param(
    [string]$ContainerName,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    $status = docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $ContainerName 2>$null

    if ($status -eq "healthy" -or $status -eq "running") {
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "Timeout aguardando container $ContainerName ficar saudavel"
}

function Resolve-ContainerNameConflicts {
  param(
    [string]$ComposeProjectName
  )

  $containerNames = @(
    "fip-core-postgres",
    "fip-core-pgadmin",
    "fip-core-backend",
    "fip-core-frontend"
  )

  foreach ($containerName in $containerNames) {
    $containerId = docker ps -a --filter "name=^/$containerName$" --format "{{.ID}}" 2>$null

    if (-not $containerId) {
      continue
    }

    $projectLabel = docker inspect --format "{{ index .Config.Labels `"com.docker.compose.project`" }}" $containerName 2>$null

    if ($projectLabel -eq $ComposeProjectName) {
      continue
    }

    if ($RecreateConflictingContainers) {
      Write-Host "Removendo container conflitante: $containerName" -ForegroundColor Yellow
      docker rm -f $containerName | Out-Null
      continue
    }

    throw @"
Ja existe um container chamado '$containerName' que nao pertence ao Compose project '$ComposeProjectName'.

Para recriar esses containers automaticamente, rode:
.\scripts\start-system.ps1 -RecreateConflictingContainers

Ou remova manualmente o container conflitante:
docker rm -f $containerName
"@
  }
}

Write-Step "Verificando Docker"
docker version | Out-Null
docker compose version | Out-Null

if (-not (Test-Path ".env")) {
  Write-Step "Criando .env a partir de .env.example"
  Copy-Item ".env.example" ".env"
}

$backendPort = Read-EnvValue -Path ".env" -Name "BACKEND_PORT" -DefaultValue "3101"
$frontendPort = Read-EnvValue -Path ".env" -Name "FRONTEND_PORT" -DefaultValue "3100"
$pgadminPort = Read-EnvValue -Path ".env" -Name "PGADMIN_PORT" -DefaultValue "5050"
$composeProjectName = Read-EnvValue -Path ".env" -Name "COMPOSE_PROJECT_NAME" -DefaultValue "fip-core-mvp"

Write-Step "Verificando conflitos de containers"
Resolve-ContainerNameConflicts -ComposeProjectName $composeProjectName

$buildFlag = @()
if (-not $NoBuild) {
  $buildFlag = @("--build")
}

Write-Step "Subindo Postgres e PgAdmin"
docker compose up -d @buildFlag postgres pgadmin
Wait-ContainerHealthy -ContainerName "fip-core-postgres"

Write-Step "Aplicando migrations Prisma"
docker compose run --rm backend sh -c "npm install && npm run prisma:generate && npx prisma migrate deploy"

if (-not $SkipSeed) {
  Write-Step "Executando seed inicial"
  docker compose run --rm backend npm run prisma:seed
}

Write-Step "Subindo backend e frontend"
docker compose up -d @buildFlag backend frontend

Write-Step "Aguardando backend"
Wait-Http -Url "http://localhost:$backendPort/health"

Write-Step "Sistema disponivel"
Write-Host "Frontend: http://localhost:$frontendPort"
Write-Host "Backend health: http://localhost:$backendPort/health"
Write-Host "PgAdmin: http://localhost:$pgadminPort"
Write-Host ""
Write-Host "Logs em tempo real:"
Write-Host "docker compose logs -f backend frontend"
