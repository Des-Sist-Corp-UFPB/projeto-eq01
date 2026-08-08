# NEXUS HUB Architecture Playbook

This playbook defines how NEXUS HUB should be organized, evolved, and rebuilt when the current prototype is refactored. It is written for engineers and AI agents working on the project.

## 1. Current Inventory

### Backend

The backend currently has two Maven modules:

- `model`: domain entities, DTOs, repositories, service interfaces, and service implementations.
- `controller`: Spring Boot application, REST controllers, security configuration, seed data, and application resources.

Current backend domains:

- Users: registration, login, profile update, password update.
- Projects: project catalog, project creation, detail, hot/recent/collaboration filters.
- Groups: group catalog, group creation, detail, deletion.
- Opportunities: simple opportunity listing.
- Project requests: join request creation, listing by project, approval/rejection.

### Frontend

The frontend now lives in `view`.

Current frontend structure:

- `src/app/pages`: route-level screens.
- `src/app/components`: reusable visual components.
- `src/app/services`: API access and client-side state.
- `src/app/app.routes.ts`: route configuration.
- `src/styles.css`: global design tokens and styles.

The screens and styles must be preserved during architecture refactors unless the user explicitly asks for UI changes.

## 2. Target Product Modules

NEXUS HUB should be organized around these product modules:

| Module | Responsibility |
| --- | --- |
| Identity | Users, roles, authentication boundaries, password policy. |
| Profile | Academic profile, interests, skills, public academic identity. |
| Groups | Academic groups, group membership, group roles, group requests. |
| Projects | Academic projects, project membership, project tags, project requests. |
| Opportunities | Opportunities, vacancies, applications, deadlines. |
| Events | Academic events, registrations, attendance, certificates. |
| Gamification | Points, achievements, rankings, activity ledger. |
| Administration | Audit, moderation, reports, governance. |

## 3. Backend Responsibilities

### `controller` module

The `controller` Maven module is the application boundary.

It owns:

- Spring Boot bootstrap.
- REST controllers.
- Web/security configuration.
- API exception handling.
- OpenAPI configuration.
- Application resource files.
- Database migration files.
- Development seed configuration.

It must not own:

- Business rules.
- Persistence rules.
- Entity mutation rules.
- Domain calculations.

### REST Controllers

Controllers translate HTTP into application calls.

They should:

- Validate request DTOs.
- Call service interfaces.
- Return response DTOs.
- Translate HTTP status codes.
- Keep logs useful and concise.

They should not:

- Query repositories directly, except temporary prototype endpoints.
- Decide domain state transitions.
- Compare user names to determine ownership.
- Store session/domain state.

### `model` module

The `model` Maven module is the domain and persistence module.

It owns:

- JPA entities.
- DTOs.
- Repository interfaces.
- Service interfaces.
- Service implementations.
- Transaction boundaries.
- Domain-level validation.
- Mapping from entities to DTOs.

### Entities

Entities represent persistent domain state.

Rules:

- Use English physical table and column names.
- Keep Java class names stable until the full domain refactor.
- Use `@Table` and `@Column` explicitly.
- Use Lombok for new entities to reduce boilerplate.
- Do not put HTTP concerns inside entities.
- Do not expose entity objects directly from complex APIs in the future.

### Repositories

Repositories are persistence gateways.

Rules:

- Extend Spring Data repository interfaces.
- Keep query names explicit and domain-oriented.
- Do not encode business decisions in repositories.
- Prefer repository methods over filtering large datasets in memory.
- Use indexes for frequent query predicates.

### Services

Services are the business-use-case layer.

Rules:

- One service interface per meaningful use-case group.
- Implementations live in `service.impl`.
- Services own transaction boundaries with `@Transactional`.
- Services validate state transitions.
- Services coordinate repositories.
- Services return DTOs or domain results, not HTTP responses.

### DTOs

DTOs isolate API payloads from entities.

Rules:

- Request DTOs describe input.
- Response DTOs describe output.
- Do not expose password hashes, internal audit fields, or security internals.
- Use records for simple immutable DTOs.

### Migrations

Flyway is the schema authority.

Rules:

- Hibernate must not create or update schema automatically.
- `ddl-auto` must remain `validate`.
- Every schema change needs a migration.
- Migration files live in `controller/src/main/resources/db/migration`.
- Migration names follow `V<version>__<description>.sql`.

## 4. Frontend Responsibilities

The Angular frontend is the presentation boundary.

It owns:

- Routes and screens.
- UI composition.
- User interactions.
- Form state.
- API calls through services.
- Visual components.

It must not own:

- Business authorization.
- Final ownership checks.
- Persistent domain relationships.
- Group/project membership as local-only data.
- Security tokens beyond the chosen auth/session strategy.

### Pages

Pages are route-level containers.

Current pages:

- `dashboard.page.ts`
- `login.page.ts`
- `cadastro.page.ts`
- `esqueci-senha.page.ts`
- `perfil.page.ts`
- `projeto-detalhe.page.ts`
- `grupos.page.ts`
- `grupo-detalhe.page.ts`

Rules:

- Pages may coordinate services and local UI state.
- Pages may not implement backend-only business decisions.
- Pages should delegate reusable UI to components.

### Components

Components are reusable visual pieces.

Current components:

- `project-card.ts`
- `carousel.ts`
- `new-project-modal.ts`

Rules:

- Components receive data through inputs.
- Components emit user actions through outputs.
- Components should not call backend services unless they are container components.

### Services

Frontend services are API and client-state adapters.

Current services:

- `auth.service.ts`
- `project.service.ts`
- `grupo.service.ts`
- `solicitacao.service.ts`

Rules:

- Centralize API URLs.
- Return typed observables.
- Keep session handling isolated in auth service.
- Do not persist domain entities in `localStorage`.

## 5. Patterns To Use

### Layered MVC

Use explicit layers:

```text
View -> REST Controller -> Service -> Repository -> Entity -> Database
```

### Repository Pattern

Spring Data repositories are the persistence abstraction.

Use repositories for:

- Entity lookup.
- Query execution.
- Persistence.

Do not use repositories for:

- Authorization decisions.
- State transition policies.
- HTTP response handling.

### Service Layer Pattern

Services are the use-case layer.

Use services for:

- Registration.
- Login.
- Project creation.
- Join request creation.
- Request approval/rejection.
- Membership management.

### DTO Pattern

Use DTOs to separate external API contracts from JPA entities.

### Dependency Injection

Use constructor injection.

Never instantiate services or repositories manually.

### Migration-First Persistence

Flyway owns schema changes.

JPA validates mapping only.

### Soft Delete For Business Tables

Use `strecord` for business tables when deletion history matters.

Do not physically delete important domain records unless the entity is purely technical.

## 6. Patterns To Avoid

Avoid:

- Business rules in Angular components.
- Business rules in REST controllers.
- Repository calls from controllers.
- Entity relationships represented only by names or emails.
- Session/token tables in the domain model.
- `ddl-auto: update`.
- Large table names with multiple underscores.
- Column names with underscores.
- Client-side `localStorage` as source of truth for memberships, vacancies, or applications.

## 7. Immediate Refactor Priorities

1. Keep Angular as the only frontend in `view`.
2. Keep Flyway migrations as the source of schema truth.
3. Move group membership and vacancies from `localStorage` to backend APIs.
4. Replace textual relationships with foreign keys.
5. Introduce real roles and authorization.
6. Normalize project tags.
7. Model gamification as a point ledger, not as loose fields.

## 8. Rebuild Guidance

When recreating the backend architecture, do it module by module:

1. Identity.
2. Profile.
3. Groups.
4. Projects.
5. Opportunities.
6. Events.
7. Gamification.
8. Administration.

Do not rebuild everything at once. Preserve working screens and migrate one backend capability at a time.
