# Angular Standards For NEXUS HUB

## Feature Boundaries

Approved frontend feature modules:

- `auth`
- `people`
- `groups`
- `projects`
- `requests`
- `store`
- future: `opportunities`, `events`, `gamification`, `administration`

Create new features only when the use case has independent navigation, API ownership, or domain language.

## Folder Pattern

Avoid:

```text
pages/
  login.page.ts
  login.page.html
  login.page.css
```

Use:

```text
pages/
  login/
    login.page.ts
    login.page.html
    login.page.css
```

Avoid:

```text
shared/components/
  project-card.ts
  project-card.html
  project-card.css
```

Use:

```text
shared/components/project-card/
  project-card.component.ts
  project-card.component.html
  project-card.component.css
```

## Smart And Presentational Components

Use smart components sparingly:

- pages
- route-level feature containers
- components that explicitly orchestrate a feature workflow

Use presentational components for:

- cards
- empty states
- panels
- form sections
- dialogs
- lists
- toolbar controls

Presentational components should communicate with `@Input` and `@Output`.

## Store Feature Direction

Current store state:

```text
features/store/
  pages/loja/
  components/store-coming-soon-card/
```

Future store evolution:

```text
features/store/
  pages/store-home/
  components/store-item-card/
  components/store-wallet-summary/
  components/store-redemption-dialog/
  services/store.service.ts
  models/store.model.ts
```

Only add `store.service.ts` when there is a backend API or real application state.

## Lint Expectations

Use ESLint for:

- TypeScript quality.
- Angular component selectors.
- Angular template parsing.
- Component class suffix rules.
- No unused variables through TypeScript compiler/lint rules.

Recommended command:

```text
npm run lint
```

When local Node is unavailable, run inside a Node Docker container mounted to `view`.

## Build Expectations

Use:

```text
npm run build
```

or the project Docker build:

```text
docker compose -f docker-compose.local.yml build frontend
```
