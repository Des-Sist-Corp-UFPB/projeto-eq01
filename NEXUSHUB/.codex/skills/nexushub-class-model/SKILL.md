---
name: nexushub-class-model
description: Project-specific object-oriented class modeling guidance for NEXUS HUB. Use when designing Java entities, aggregates, value objects, services, repositories, DTOs, enums, or class diagrams for the NEXUS HUB backend.
---

# NEXUS HUB Class Model

Use this skill when designing or refactoring Java classes for NEXUS HUB.

## Core Principles

- Do not copy the database mechanically into Java classes.
- Use entities for objects with identity and lifecycle.
- Use value objects for immutable concepts without identity.
- Use aggregate roots to protect invariants.
- Use application services for use-case orchestration.
- Use domain services only when the rule naturally spans multiple entities.
- Keep DTOs separate from entities.
- Keep controllers outside domain logic.

## Names

- Class names are in English.
- Attributes and methods are in English.
- Documentation may be in Portuguese.
- Prefer clear Java names over abbreviated database names.
- Example: database table `grp_hummember` maps conceptually to class `GroupHumanMember`.

## Main Concepts

- `Human` is the base person.
- `User` is the authentication account.
- `GroupHumanMember` is the relationship between `Group` and `Human`.
- `ProjectHumanMember` is the relationship between `Project` and `Human`.
- `ProjectJoinRequest` connects `Project`, requester `Human`, and optional evaluator `Human`.
- Multivalued attributes become classes and association classes, such as `Interest`, `HumanInterest`, `Tag`, and `ProjectTag`.

## Modules

Use these conceptual modules:

- `identity`: `User`, `Role`, `Email`, `PasswordHash`.
- `people`: `Human`, `AcademicProfile`, `Interest`, `Skill`.
- `groups`: `Group`, `GroupHumanMember`, `GroupJoinRequest`.
- `projects`: `Project`, `ProjectHumanMember`, `ProjectJoinRequest`, `Tag`, `ProjectTag`.
- `opportunities`: `Opportunity`, `OpportunityApplication`.
- `events`: `Event`, `EventRegistration`, `EventAttendance`, `Certificate`.
- `gamification`: `ScoreTransaction`, `Achievement`, `HumanAchievement`, `RankingSnapshot`.
- `administration`: `AuditLog`, `Notification`, `ModerationCase`.

## Aggregates

- `User` is an aggregate root for authentication data.
- `Human` is an aggregate root for personal and academic profile data.
- `Group` is an aggregate root for group membership and group join requests.
- `Project` is an aggregate root for project membership, tags, and project join requests.
- `Opportunity` is an aggregate root for applications.
- `Event` is an aggregate root for registrations, attendance, and certificates.

## Java Guidance

- Use UUID for identities.
- Use enums for statuses and types.
- Use Lombok for boilerplate only when it keeps invariants clear.
- Do not expose public setters for aggregate state changes.
- Prefer intent methods: `approve`, `reject`, `archive`, `publish`, `deactivate`.
- Keep constructors/factory methods responsible for valid initial state.
- Use `updatedBy` and `updatedAt` for lightweight audit state.
- Full audit history belongs to `AuditLog`, not every entity.

## Avoid

- `String authorName` as a relationship.
- `String groupName` as a relationship.
- `List<String> tags` as persistent domain state.
- Boolean ownership flags on `Human`.
- Business rules in Angular pages.
- Business rules in REST controllers.
- Anemic models when the invariant belongs naturally to an entity.

## Reference

Read `docs/CLASS_MODEL.md` before large class-modeling or refactoring tasks.
