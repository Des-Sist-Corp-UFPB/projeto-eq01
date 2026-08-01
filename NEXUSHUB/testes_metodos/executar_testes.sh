#!/bin/bash
echo "========================================================================="
echo "              SUÍTE DE TESTES DE MÉTODOS DO NEXUSHUB"
echo "========================================================================="
echo ""
echo "Executando a validação automatizada dos métodos e retornos do sistema..."
echo ""

cd ..
mvn test -Dtest=*MetodosTest

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================================================="
    echo "[SUCESSO] TODOS OS MÉTODOS TESTADOS RETORNARAM OS VALORES ESPERADOS!"
    echo "========================================================================="
else
    echo ""
    echo "========================================================================="
    echo "[ALERTA] FORAM ENCONTRADAS DIVERGÊNCIAS NOS RETORNOS DOS MÉTODOS."
    echo "========================================================================="
fi

cd testes_metodos
