@echo off
echo =========================================================================
echo               SUITE DE TESTES DE METODOS DO NEXUSHUB
echo =========================================================================
echo.
echo Executando a validacao automatizada dos metodos e retornos do sistema...
echo.

pushd "%~dp0\.."

if exist "..\apache-maven-3.9.6\bin\mvn.cmd" (
    call "..\apache-maven-3.9.6\bin\mvn.cmd" test -pl model -Dtest=*MetodosTest
) else (
    call mvn test -pl model -Dtest=*MetodosTest
)

popd
pause
