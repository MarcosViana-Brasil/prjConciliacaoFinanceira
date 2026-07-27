param(
  [switch]$RemoveVolumes
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

Write-Step "Verificando Docker"
docker version | Out-Null
docker compose version | Out-Null

$downArguments = @("compose", "down", "--remove-orphans")

if ($RemoveVolumes) {
  Write-Host "Os volumes e os dados locais da stack tambem serao removidos." -ForegroundColor Yellow
  $downArguments += "--volumes"
}

Write-Step "Encerrando a stack"
& docker @downArguments

if ($LASTEXITCODE -ne 0) {
  throw "Nao foi possivel encerrar a stack (codigo de saida: $LASTEXITCODE)."
}

Write-Step "Stack encerrada"

if (-not $RemoveVolumes) {
  Write-Host "Os volumes e os dados locais foram preservados."
}
