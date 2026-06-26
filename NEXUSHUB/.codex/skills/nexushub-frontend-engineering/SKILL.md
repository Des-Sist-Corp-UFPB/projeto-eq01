---
name: nexushub-frontend-engineering
description: Frontend architecture skill for NEXUS HUB Angular work. Use when creating, moving, reviewing, or refactoring frontend pages, components, services, routes, styles, lint rules, tests, or feature modules in view. Enforces project-specific Angular folder structure, component boundaries, file naming, page/component separation, API service placement, style ownership, lint/build validation, and UI preservation.
---

# NEXUS HUB Frontend Engineering

Use this skill before changing `view`.

## First Principles

- Preserve existing visual behavior unless the user explicitly asks for UI changes.
- Treat `view/src/app/features/<feature>` as the ownership boundary for product UI.
- Keep pages thin: route state, feature composition, and simple screen orchestration only.
- Move reusable UI into components.
- Move backend communication into feature services or `core` services.
- Do not put large templates or styles inline in `.ts`.
- Do not leave page files loose directly under `pages`.
- Do not leave component files loose directly under `components`.
- Validate with lint and build after structural work.

## Required Structure

Use this structure for each feature:

```text
view/src/app/features/<feature>/
  pages/
    <page-name>/
      <page-name>.page.ts
      <page-name>.page.html
      <page-name>.page.css
  components/
    <component-name>/
      <component-name>.component.ts
      <component-name>.component.html
      <component-name>.component.css
  services/
    <feature-name>.service.ts
  models/
    <feature-name>.model.ts
```

Use `models` only when the feature has enough interfaces/types to justify separation. Keep small DTOs in the service until they start spreading.

Use this structure for shared UI:

```text
view/src/app/shared/components/<component-name>/
  <component-name>.component.ts
  <component-name>.component.html
  <component-name>.component.css
```

Use this structure for application services:

```text
view/src/app/core/<concern>/
  <concern>.service.ts
```

## Naming Rules

- Page class: `<Name>PageComponent`.
- Page selector: `app-<name>-page`.
- Page files: `<name>.page.ts`, `<name>.page.html`, `<name>.page.css`.
- Component class: `<Name>Component`.
- Component selector: `app-<name>`.
- Component files: `<name>.component.ts`, `<name>.component.html`, `<name>.component.css`.
- Service class: `<Name>Service`.
- Service file: `<name>.service.ts`.
- Use kebab-case for folder and file names.
- Use standalone Angular components.

## Page Responsibilities

Pages may:

- Read route parameters.
- Compose feature components.
- Hold screen-level signals.
- Call feature services for page data.
- Handle navigation.

Pages must not:

- Contain large reusable markup.
- Own repeated cards, panels, dialogs, upload controls, or complex form sections.
- Hard-code domain relationships that belong to backend/model.
- Directly duplicate API access logic.

## Component Responsibilities

Components may:

- Render reusable UI.
- Receive data through `@Input`.
- Emit user intent through `@Output`.
- Own local presentation state.

Components must not:

- Know route structure unless they are navigation components.
- Call backend APIs unless explicitly designed as smart feature components.
- Persist domain data in `localStorage`.

## Service Responsibilities

Feature services call backend APIs for one feature module.

`core` services own cross-cutting concerns:

- auth/session
- http interceptors
- app configuration
- global user state

## Styling Rules

- Component CSS owns component layout and visual details.
- Global `styles.css` owns tokens, resets, utility classes, and app-wide primitives.
- Do not place feature-specific CSS in global styles.
- Do not add decorative one-off styling that cannot be owned by a component.
- Keep text inside buttons/cards responsive and non-overlapping.

## Validation

Before finishing frontend work:

1. Run lint.
2. Run Angular production build.
3. If UI changed, verify the affected route in browser or through local HTTP checks.
4. Report any validation that could not be run.

If lint is missing, add ESLint configuration before calling the work complete.

## References

Read `references/angular-standards.md` when:

- reorganizing frontend folders,
- creating a new feature,
- splitting pages into components,
- configuring lint,
- reviewing frontend architecture.
