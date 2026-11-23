param(
    [Parameter(Mandatory)][string]$Carpeta,
    [Parameter(Mandatory)][string]$Base,
    [string]$Programa = "mysqldump.exe",
    [string]$Perfil = "imperio-respaldo"
)

$ErrorActionPreference = "Stop"
$directorio = New-Item -ItemType Directory -Path $Carpeta -Force
$fecha = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$archivo = Join-Path $directorio.FullName "imperio-$fecha.sql"
$pendiente = "$archivo.tmp"

try {
    & $Programa "--login-path=$Perfil" --single-transaction --no-tablespaces --set-gtid-purged=OFF "--result-file=$pendiente" -- $Base
    if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $pendiente) -or
        (Get-Item -LiteralPath $pendiente).Length -eq 0) {
        throw "MySQL no pudo terminar el respaldo."
    }
    Move-Item -LiteralPath $pendiente -Destination $archivo
    Write-Output $archivo
} finally {
    if (Test-Path -LiteralPath $pendiente) { Remove-Item -LiteralPath $pendiente }
}
