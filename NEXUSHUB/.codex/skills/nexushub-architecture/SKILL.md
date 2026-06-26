---
name: nexushub-architecture
description: Project-specific architecture guidance for NEXUS HUB. Use when modifying backend modules, frontend Angular structure, database migrations, data dictionary naming, service/repository/entity patterns, or when planning refactors that must preserve existing screens and styles.
---

# NEXUS HUB Architecture

Use this skill when working inside the NEXUS HUB project.

## Core Rules

- Preserve existing Angular screens and styles unless the user explicitly asks for visual changes.
- Keep the frontend folder named `view`.
- Keep the backend split into `model` and `controller` until a deliberate module refactor is requested.
- Use Flyway migrations for database schema changes.
- Keep `spring.jpa.hibernate.ddl-auto=validate`.
- Do not create session/token tables in the domain model.
- Do not store domain relationships in frontend `localStorage`.

## Backend

- `controller` owns Spring Boot bootstrap, REST controllers, API configuration, security config, migrations, and seed setup.
- `model` owns entities, DTOs, repositories, service interfaces, service implementations, and transactions.
- Controllers call services.
- Services call repositories.
- Repositories persist entities.
- Business rules belong in services, not controllers or Angular components.
- Use constructor injection.
- Use Lombok for new entities and simple Java models when it reduces boilerplate.

## Frontend

- `view/src/app/pages` contains route-level screens.
- `view/src/app/components` contains reusable UI components.
- `view/src/app/services` contains API adapters and limited client state.
- Angular services must return typed Observables.
- Components should not become business-rule containers.

## Database Naming

- Tables use English names.
- Columns use English names.
- Documentation and business-rule descriptions may stay in Portuguese.
- Tables use exactly one underscore: `prefix_entity`.
- Columns do not use underscores.
- Approved table prefixes: `sec`, `usr`, `grp`, `prj`, `opp`, `evt`, `gam`, `adm`.
- Example tables: `sec_user`, `usr_profile`, `grp_hummember`, `prj_project`, `opp_apply`, `evt_reg`, `gam_score`, `adm_audit`.
- Example columns: `iduser`, `nmuser`, `dsemail`, `idproject`, `strecord`, `tscreated`.

## Patterns

- Use Layered MVC: View -> REST Controller -> Service -> Repository -> Entity -> Database.
- Use Repository Pattern through Spring Data.
- Use Service Layer Pattern for use cases.
- Use DTO Pattern for API payloads.
- Use Migration-First persistence with Flyway.
- Prefer soft delete for business records.

## Before Editing

1. Inspect the existing code path.
2. Identify whether the change is view, controller, service, repository, entity, or migration.
3. Keep changes scoped to the layer that owns the responsibility.
4. Update docs when the change affects architecture, data model, or project conventions.
