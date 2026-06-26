#!/bin/bash
set -e

echo "========================================================================"
echo "                 NEXUS HUB - INSTALADOR DE PRÉ-REQUISITOS"
echo "========================================================================"
echo "Este script irá atualizar o sistema e instalar automaticamente:"
echo "  1. JDK 21 (Java)"
echo "  2. Apache Maven"
echo "  3. Node.js & npm"
echo "  4. PostgreSQL (e criará o banco 'nexushub' com senha 'postgres')"
echo ""
echo "Será necessário digitar sua senha de administrador (sudo) abaixo."
echo "========================================================================"
echo ""

# 1. Instalar pacotes de sistema
sudo apt update
sudo apt install -y openjdk-21-jdk maven nodejs npm postgresql postgresql-contrib

# 2. Iniciar o serviço do PostgreSQL caso não esteja rodando
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo ""
echo "------------------------------------------------------------------------"
echo "CONFIGURANDO BANCO DE DADOS POSTGRESQL..."
echo "------------------------------------------------------------------------"

# 3. Configurar senha do usuário postgres para 'postgres' e criar o banco de dados 'nexushub'
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
# Verifica se o banco já existe antes de criar
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'nexushub'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE nexushub;"

echo ""
echo "========================================================================"
echo "          REQUISITOS E BANCO DE DADOS INSTALADOS COM SUCESSO!"
echo "========================================================================"
echo "Para executar o backend, abra uma nova janela de terminal e rode:"
echo "  $ cd NEXUSHUB && mvn spring-boot:run -pl controller"
echo ""
echo "Para executar o frontend Angular, abra outra janela de terminal e rode:"
echo "  $ cd NEXUSHUB/view && npm run start"
echo "========================================================================"
