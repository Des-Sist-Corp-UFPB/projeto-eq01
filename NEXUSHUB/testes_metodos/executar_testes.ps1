$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Resolve-Path (Join-Path $ScriptDir "..\..")
$NexusDir = Resolve-Path (Join-Path $ScriptDir "..")
$MavenCmd = Join-Path $ProjectDir "apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "              SUÍTE DE TESTES DE MÉTODOS DO NEXUSHUB" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Executando a validação automatizada dos métodos e retornos do sistema..." -ForegroundColor Yellow
Write-Host ""

Push-Location $NexusDir

if (Test-Path $MavenCmd) {
    & $MavenCmd test -pl model -Dtest=*MetodosTest
} else {
    mvn test -pl model -Dtest=*MetodosTest
}

$ExitCode = $LASTEXITCODE
Pop-Location

if ($ExitCode -eq 0) {
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Green
    Write-Host "[SUCESSO] TODOS OS MÉTODOS TESTADOS RETORNARAM OS VALORES ESPERADOS!" -ForegroundColor Green
    Write-Host "=========================================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Red
    Write-Host "[ALERTA] FORAM ENCONTRADAS DIVERGÊNCIAS NOS RETORNOS DOS MÉTODOS." -ForegroundColor Red
    Write-Host "=========================================================================" -ForegroundColor Red
}
