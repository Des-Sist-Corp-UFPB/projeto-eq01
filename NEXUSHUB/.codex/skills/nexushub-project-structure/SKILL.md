---
name: nexushub-project-structure
description: Project-specific repository and package structure guidance for NEXUS HUB. Use when deciding where files belong, creating backend packages, frontend folders, docs, migrations, AI skills, or planning refactors that reorganize the project.
---

# NEXUS HUB Project Structure

Use this skill when organizing files or planning structural refactors in NEXUS HUB.

## Root

Keep this root structure:

- `model`: domain, DTOs, repositories, services.
- `controller`: Spring Boot app, REST API, config, migrations.
- `view`: Angular frontend.
- `docs`: documentation, diagrams, standards.
- `.codex/skills`: project-specific AI skills.

## Backend Direction

- `controller` depends on `model`.
- `model` never depends on `controller`.
- Controllers call services.
- Services call repositories.
- Repositories persist entities.

## Model Module

Target package pattern:

```text
model/<module>/domain
model/<module>/dto
model/<module>/repository
model/<module>/service
model/<module>/service/impl
```

Approved modules:

- `identity`
- `people`
- `groups`
- `projects`
- `opportunities`
- `events`
- `gamification`
- `administration`
- `shared`

## Controller Module

Target package pattern:

```text
controller/api/<module>
controller/config
controller/exception
controller/seed
controller/src/main/resources/db/migration
```

REST controllers belong in `controller/api/<module>`.

Flyway migrations belong in `controller/src/main/resources/db/migration`.

## Frontend

Current folder is `view`.

Target Angular structure:

```text
view/src/app/core
view/src/app/shared
view/src/app/features/<module>
```

For frontend implementation details, use `.codex/skills/nexushub-frontend-engineering/SKILL.md`.

Angular pages must live in page-specific folders:

```text
view/src/app/features/<module>/pages/<page-name>/<page-name>.page.ts
view/src/app/features/<module>/pages/<page-name>/<page-name>.page.html
view/src/app/features/<module>/pages/<page-name>/<page-name>.page.css
```

Angular components must live in component-specific folders:

```text
view/src/app/features/<module>/components/<component-name>/<component-name>.component.ts
view/src/app/shared/components/<component-name>/<component-name>.component.ts
```

Do not change visual screens/styles unless explicitly requested.

Move Angular pages gradually, one feature at a time.

## Docs

Use:

- `docs/PROJECT_STRUCTURE.md` for repository structure.
- `docs/ARCHITECTURE_PLAYBOOK.md` for architecture rules.
- `docs/CLASS_MODEL.md` for OO model.
- `docs/DATA_DICTIONARY_STANDARD.md` for database naming.
- `.drawio` files for diagrams.

## Decision Rule

- Domain behavior goes in `model/<module>/domain`.
- Use-case orchestration goes in `model/<module>/service`.
- Persistence goes in `model/<module>/repository`.
- HTTP exposure goes in `controller/api/<module>`.
- UI goes in `view/src/app`.
- Project memory for AI goes in `.codex/skills`.
