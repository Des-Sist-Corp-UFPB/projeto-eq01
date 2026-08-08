# Guia de Execução Local - NexusHub

Este documento explica de forma simples e direta como configurar e rodar o projeto **NexusHub** na sua máquina local.

Existem duas formas principais de rodar o projeto:
1. **Via Docker Compose** (Mais fácil, automático, já sobe o banco de dados PostgreSQL).
2. **Manualmente** (Para desenvolvimento ativo e debug local).

---

## Opção 1: Rodar via Docker Compose (Recomendado)

Esta opção não exige que você instale Java, Node.js ou PostgreSQL na sua máquina. O Docker cuidará de tudo.

### Pré-requisitos:
* [Docker](https://docs.docker.com/get-docker/) instalado.
* [Docker Compose](https://docs.docker.com/compose/install/) instalado.

### Passos:
1. Abra o terminal na raiz do projeto (`NEXUSHUB/`).
2. Execute o comando para subir toda a aplicação:
   ```bash
   docker compose -f docker-compose.local.yml up --build
   ```
3. A aplicação estará disponível em:
   * **Frontend Angular:** [http://localhost:4200](http://localhost:4200)
   * **Backend Spring Boot:** [http://localhost:8080](http://localhost:8080)

> [!TIP]
> Para rodar em segundo plano (background), adicione o parâmetro `-d` ao final do comando: `docker compose -f docker-compose.local.yml up --build -d`.

### Comandos úteis do Docker:
* **Parar os serviços:**
  ```bash
  docker compose -f docker-compose.local.yml down
  ```
* **Limpar dados do Banco de Dados (PostgreSQL):**
  ```bash
  docker compose -f docker-compose.local.yml down -v
  ```

---

## Opção 2: Rodar Manualmente (Para Desenvolvimento)

Recomendado para quando você estiver alterando códigos do backend ou frontend e quiser ver as mudanças em tempo real (Hot Reload).

### Pré-requisitos:
* **Linux/Ubuntu** (caso queira usar o script automatizado).
* **Sudo** permissões.

### Passo 1: Instalar dependências e preparar o Banco de Dados
Na raiz do projeto (`NEXUSHUB/`), temos o script `instalar.sh` que instala automaticamente o JDK 21, Maven, Node.js, NPM e configura o PostgreSQL.

Execute:
```bash
chmod +x instalar.sh
./instalar.sh
```
*O script pedirá a senha do sistema (sudo) e criará o banco de dados `nexushub` localmente no PostgreSQL com o usuário/senha `postgres`/`postgres`.*

---

### Passo 2: Executar o Backend Spring Boot
Com o PostgreSQL rodando localmente (configurado pelo script):

1. Vá para a pasta raiz (`NEXUSHUB/`):
2. Inicie o servidor Spring Boot:
   ```bash
   mvn spring-boot:run -pl controller
   ```
   *Se quiser rodar o backend com banco H2 em memória (sem precisar de PostgreSQL rodando), basta não ter o PostgreSQL configurado na porta 5432, ele fará o fallback automático.*

* O backend estará disponível em: [http://localhost:8080](http://localhost:8080)

---

### Passo 3: Executar o Frontend Angular
1. Abra um novo terminal e vá para a pasta do frontend:
   ```bash
   cd view
   ```
2. Instale as dependências (necessário apenas na primeira vez):
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
   *Ou caso prefira rodar especificando a porta explicitamente:*
   ```bash
   npm start -- --port 4200
   ```

* O frontend estará disponível em: [http://localhost:4200](http://localhost:4200)

---

## URLs Importantes
* **Frontend UI:** [http://localhost:4200](http://localhost:4200)
* **Backend API Docs / Base URL:** [http://localhost:8080](http://localhost:8080)
* **Console do Banco H2** (Se rodado sem PostgreSQL): [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  * *JDBC URL:* `jdbc:h2:mem:nexushub`
  * *User:* `sa`
  * *Password:* (deixe em branco)
