# AGENTS

This file guides AI agents and assistants working on NEXUS HUB.

## Project Objective

NEXUS HUB is a gamified academic platform for centralizing university projects, groups, events, opportunities, and academic recognition.

The product connects students, professors, academic groups, research labs, extension projects, events, and opportunities in one digital environment.

## Architecture

The project follows an explicit MVC-oriented structure:

- `model`: domain and persistence module.
- `controller`: Spring Boot application and REST API module.
- `view`: Angular frontend.
- `docs`: product, architecture, data dictionary, and technical documentation.

## Backend Responsibilities

### `model`

Owns:

- JPA entities.
- DTOs.
- Spring Data repositories.
- Service interfaces.
- Service implementations.
- Business rules.
- Transaction boundaries.

### `controller`

Owns:

- Spring Boot bootstrap.
- REST controllers.
- Security configuration.
- API configuration.
- Flyway migrations.
- Development seed data.

Controllers must call services. Controllers must not implement business rules.

## Frontend Responsibilities

### `view`

Owns:

- Angular pages.
- Angular components.
- Angular services.
- Route configuration.
- Global styles.

Frontend screens and styles must be preserved unless the user explicitly asks for UI changes.

Frontend services call the backend API. Frontend code must not become the source of truth for domain relationships such as project membership, group membership, applications, or vacancies.

## Database Rules

- Flyway owns schema changes.
- Hibernate must validate schema only.
- Keep `spring.jpa.hibernate.ddl-auto=validate`.
- Table names must be in English.
- Column names must be in English.
- Table names use exactly one underscore: `prefix_entity`.
- Column names do not use underscores.
- Session and temporary token storage are infrastructure concerns, not domain tables.

## Naming Examples

Good table names:

- `sec_user`
- `usr_profile`
- `grp_hummember`
- `prj_project`
- `opp_apply`
- `evt_reg`
- `gam_score`
- `adm_audit`

Good column names:

- `iduser`
- `nmuser`
- `dsemail`
- `idproject`
- `strecord`
- `tscreated`

## Patterns

Use:

- Layered MVC.
- Repository Pattern through Spring Data.
- Service Layer Pattern.
- DTO Pattern.
- Constructor dependency injection.
- Flyway migration-first persistence.
- Lombok for new entities and simple Java models when it reduces boilerplate.

Avoid:

- Business rules in Angular components.
- Business rules in REST controllers.
- Repository calls from controllers.
- `ddl-auto: update`.
- Token/session tables in the domain model.
- `localStorage` as source of truth for domain data.
- Large physical table names.
- Column names with underscores.

## Documentation

Update documentation when changing:

- Architecture.
- Database schema.
- Naming conventions.
- Module responsibilities.
- API behavior.
- Security or session strategy.

Primary architecture references:

- `docs/ARCHITECTURE_PLAYBOOK.md`
- `docs/DATA_DICTIONARY_STANDARD.md`
- `docs/USE_CASES.md`
