# NEXUS HUB

NEXUS HUB e uma plataforma academica gamificada para centralizar projetos, grupos, eventos e oportunidades universitarias.

Esta estrutura segue MVC de forma explicita:

- `model`: modulo Java com entidades, DTOs, repositorios e regras de negocio.
- `controller`: modulo Spring Boot responsavel por expor a API REST.
- `view`: aplicacao Next.js responsavel pela interface do usuario.

## Estrutura

```text
NEXUSHUB
├── model
├── controller
└── view
```

## Backend Spring

O backend e dividido em dois modulos Maven:

- `model`: camada de dominio e acesso a dados.
- `controller`: aplicacao Spring Boot, controllers REST e configuracoes.

### Rodar localmente com Docker

Para subir a aplicacao completa com PostgreSQL, backend e frontend:

```bash
docker compose -f docker-compose.local.yml up --build
```

URLs locais:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`

Para parar os containers:

```bash
docker compose -f docker-compose.local.yml down
```

Para parar e apagar o volume local do PostgreSQL:

```bash
docker compose -f docker-compose.local.yml down -v
```

### Rodar localmente sem Docker

Requisitos:

- JDK 21.
- Maven 3.9+.

Sem variaveis de ambiente, o backend usa H2 em memoria. Assim nao e necessario subir Postgres localmente para desenvolvimento.

Para rodar:

```bash
mvn spring-boot:run -pl controller
```

URL local:

- `http://localhost:8080`

Quando for rodar com PostgreSQL, configure as variaveis `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_DATASOURCE_DRIVER_CLASS_NAME` e `SPRING_JPA_DATABASE_PLATFORM`.

Endpoints iniciais:

- `GET /api/projetos`
- `POST /api/projetos`
- `GET /api/grupos`
- `GET /api/oportunidades`

## Frontend Next

A interface fica em `view`.

Para rodar:

```bash
cd view
npm install
npm run dev
```

URL local:

- `http://localhost:3000`

## Proposta do produto

O NEXUS HUB conecta estudantes, professores, projetos, grupos e oportunidades em um unico ambiente digital. A ideia e reduzir a perda de informacoes espalhadas e transformar participacao academica em reconhecimento por meio de pontos, rankings, conquistas e perfis academicos.
