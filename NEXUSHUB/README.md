# NEXUS HUB

NEXUS HUB e uma plataforma academica gamificada para centralizar projetos, grupos, eventos e oportunidades universitarias.

Esta estrutura segue MVC de forma explicita:

- `model`: modulo Java com entidades, DTOs, repositorios e regras de negocio.
- `controller`: modulo Spring Boot responsavel por expor a API REST.
- `view-angular`: aplicacao Angular responsavel pela interface do usuario.

## Estrutura

```text
NEXUSHUB
├── model
├── controller
└── view-angular
```

## Backend Spring

O backend e dividido em dois modulos Maven:

- `model`: camada de dominio e acesso a dados.
- `controller`: aplicacao Spring Boot, controllers REST e configuracoes.

Para rodar:

```bash
mvn spring-boot:run -pl controller
```

Endpoints iniciais:

- `GET /api/projetos`
- `POST /api/projetos`
- `GET /api/grupos`
- `GET /api/oportunidades`

## Frontend Angular

A interface fica em `view-angular`.

Para rodar:

```bash
cd view-angular
npm install
npm run start
```

URL local:

- `http://localhost:4200`

## Proposta do produto

O NEXUS HUB conecta estudantes, professores, projetos, grupos e oportunidades em um unico ambiente digital. A ideia e reduzir a perda de informacoes espalhadas e transformar participacao academica em reconhecimento por meio de pontos, rankings, conquistas e perfis academicos.
