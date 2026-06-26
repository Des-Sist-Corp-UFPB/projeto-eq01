# Project Structure

Este documento define a estrutura completa recomendada para o NEXUS HUB, seguindo a arquitetura, o modelo de classes, o dicionario de dados e as skills de IA do projeto.

Os nomes de pastas, pacotes, classes e artefatos tecnicos devem ficar em ingles. As explicacoes podem ficar em portugues.

## 1. Root Structure

```text
NEXUSHUB
├── .codex
│   └── skills
├── controller
├── docs
├── model
├── view
├── AGENTS.md
├── Dockerfile
├── docker-compose.yml
├── docker-compose.local.yml
├── instalar.sh
├── pom.xml
├── README.md
└── requisitos.txt
```

| Path | Responsibility |
| --- | --- |
| `.codex/skills` | Project-specific AI skills. |
| `controller` | Spring Boot application boundary and REST API. |
| `model` | Domain, persistence, DTOs, repositories, and services. |
| `view` | Angular frontend. |
| `docs` | Product, architecture, data model, class model, diagrams, and standards. |
| `AGENTS.md` | Operational guide for AI agents and assistants. |
| `Dockerfile` | Full application image build. |
| `docker-compose.local.yml` | Local PostgreSQL, backend, and frontend stack. |
| `pom.xml` | Parent Maven project. |

## 2. Backend Maven Structure

The backend keeps two Maven modules:

```text
NEXUSHUB
├── model
└── controller
```

Dependency direction:

```text
controller -> model
model -> no controller dependency
```

The `model` module must never depend on `controller`.

## 3. Model Module Target Structure

```text
model
└── src/main/java/br/ufpb/dsc/nexushub/model
    ├── identity
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── people
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── groups
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── projects
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── opportunities
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── events
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── gamification
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    ├── administration
    │   ├── domain
    │   ├── dto
    │   ├── repository
    │   └── service
    │       └── impl
    └── shared
        ├── domain
        ├── exception
        └── validation
```

| Folder | Responsibility |
| --- | --- |
| `domain` | Entities, value objects, enums, aggregate behavior. |
| `dto` | Request/response contracts. |
| `repository` | Spring Data repository interfaces. |
| `service` | Use-case service interfaces. |
| `service/impl` | Transactional service implementations. |
| `shared/domain` | Shared value objects and enums. |
| `shared/exception` | Domain/application exceptions. |
| `shared/validation` | Reusable validators. |

## 4. Module Mapping

| Product Module | Java Package | Main Classes |
| --- | --- | --- |
| Identity | `identity` | `User`, `Role`, `Email`, `PasswordHash` |
| People | `people` | `Human`, `AcademicProfile`, `Interest`, `Skill` |
| Groups | `groups` | `Group`, `GroupHumanMember`, `GroupJoinRequest` |
| Projects | `projects` | `Project`, `ProjectHumanMember`, `ProjectJoinRequest`, `Tag`, `ProjectTag` |
| Opportunities | `opportunities` | `Opportunity`, `OpportunityApplication` |
| Events | `events` | `Event`, `EventRegistration`, `EventAttendance`, `Certificate` |
| Gamification | `gamification` | `ScoreTransaction`, `Achievement`, `HumanAchievement`, `RankingSnapshot` |
| Administration | `administration` | `AuditLog`, `Notification`, `ModerationCase` |

## 5. Controller Module Target Structure

```text
controller
└── src
    └── main
        ├── java/br/ufpb/dsc/nexushub/controller
        │   ├── NexusHubApplication.java
        │   ├── api
        │   │   ├── identity
        │   │   ├── people
        │   │   ├── groups
        │   │   ├── projects
        │   │   ├── opportunities
        │   │   ├── events
        │   │   ├── gamification
        │   │   └── administration
        │   ├── config
        │   ├── exception
        │   └── seed
        └── resources
            ├── application.yml
            └── db/migration
```

| Folder | Responsibility |
| --- | --- |
| `api/<module>` | REST controllers grouped by product module. |
| `config` | Spring Security, CORS, OpenAPI, beans, framework configuration. |
| `exception` | Global exception handlers and HTTP error mapping. |
| `seed` | Development seed data only. |
| `resources/db/migration` | Flyway migrations. |

Controllers must call services. Controllers must not call repositories directly or implement business rules.

## 6. Frontend Structure

Current frontend folder:

```text
view
└── src/app
    ├── components
    ├── pages
    ├── services
    ├── app.config.ts
    ├── app.routes.ts
    ├── app.ts
    ├── app.html
    └── app.css
```

Target Angular structure:

```text
view
└── src/app
    ├── core
    │   ├── api
    │   ├── auth
    │   ├── config
    │   └── layout
    ├── shared
    │   ├── components
    │   ├── models
    │   └── utils
    ├── features
    │   ├── identity
    │   ├── people
    │   ├── groups
    │   ├── projects
    │   ├── opportunities
    │   ├── events
    │   ├── gamification
    │   └── administration
    ├── app.config.ts
    ├── app.routes.ts
    └── app.ts
```

Frontend migration rule:

- Do not move all current pages at once.
- Move one feature at a time.
- Preserve existing screens and styles.
- Replace `localStorage` domain state with backend APIs gradually.

## 7. Documentation Structure

```text
docs
├── ARCHITECTURE.md
├── ARCHITECTURE_PLAYBOOK.md
├── BRAND.md
├── CLASS_MODEL.md
├── DATA_DICTIONARY_STANDARD.md
├── PRODUCT.md
├── PROJECT_STRUCTURE.md
├── ROADMAP.md
├── USE_CASES.md
├── database-current.drawio
└── database-target-normalized.drawio
```

| File | Responsibility |
| --- | --- |
| `PRODUCT.md` | Product vision. |
| `USE_CASES.md` | Use cases and gaps. |
| `ARCHITECTURE_PLAYBOOK.md` | Detailed architecture rules. |
| `CLASS_MODEL.md` | Object-oriented Java class model. |
| `DATA_DICTIONARY_STANDARD.md` | Database naming and data dictionary standard. |
| `PROJECT_STRUCTURE.md` | Repository and package structure. |
| `database-target-normalized.drawio` | Target normalized data model. |

## 8. AI Skills Structure

```text
.codex
└── skills
    ├── nexushub-architecture
    ├── nexushub-class-model
    └── nexushub-project-structure
```

| Skill | Responsibility |
| --- | --- |
| `nexushub-architecture` | Layering, backend/frontend boundaries, database rules. |
| `nexushub-class-model` | Java OO class modeling and aggregates. |
| `nexushub-project-structure` | Where files, packages, controllers, services, pages, docs, and migrations belong. |

## 9. Dependency Direction

Allowed:

```text
view -> controller API -> model services -> repositories -> entities -> database
controller -> model
```

Forbidden:

```text
model -> controller
repository -> controller
entity -> controller
view -> database
controller -> Angular internals
```

## 10. Refactor Sequence

1. Stabilize project structure.
2. Keep `view` as the only frontend.
3. Create target packages inside `model`.
4. Move current entities module by module.
5. Introduce UUID IDs in the new model.
6. Replace loose textual relationships with IDs.
7. Move Angular pages into `features` gradually.
8. Replace `localStorage` domain state with backend APIs.
9. Add migrations per domain change.
10. Keep docs and AI skills updated.

## 11. Current To Target Mapping

| Current | Target |
| --- | --- |
| `model/entity/Usuario.java` | `model/identity/domain/User.java` |
| `model/entity/Grupo.java` | `model/groups/domain/Group.java` |
| `model/entity/Projeto.java` | `model/projects/domain/Project.java` |
| `model/entity/SolicitacaoEntrada.java` | `model/projects/domain/ProjectJoinRequest.java` |
| `model/entity/Oportunidade.java` | `model/opportunities/domain/Opportunity.java` |
| `controller/*RestController.java` | `controller/api/<module>/*Controller.java` |
| `view/src/app/pages` | `view/src/app/features/<module>/pages` |
| `view/src/app/services` | `view/src/app/features/<module>/services` or `core/api` |

## 12. Rule Of Thumb

If a file answers:

- "What is this thing?" put it in `domain`.
- "How do I execute this use case?" put it in `service`.
- "How do I persist this?" put it in `repository`.
- "How do I expose this over HTTP?" put it in `controller/api`.
- "How do I display this?" put it in `view`.
- "How do I document this decision?" put it in `docs`.
- "How should AI repeat this pattern?" put it in `.codex/skills`.

