# Class Model

Este documento define o modelo de classes alvo do NEXUS HUB, pensado para Java, orientacao a objetos e evolucao arquitetural do backend.

Os nomes de classes, metodos e atributos devem ficar em ingles. As explicacoes e regras podem ficar em portugues.

## 1. Principios OO

O modelo de classes nao deve ser uma copia mecanica do banco.

Regras:

- Entidades representam identidade e ciclo de vida.
- Value Objects representam conceitos sem identidade propria.
- Agregados protegem invariantes importantes.
- Services coordenam casos de uso quando a regra nao pertence naturalmente a uma entidade.
- Repositories persistem agregados.
- DTOs continuam separados das entidades.
- Controllers nao conhecem detalhes internos do dominio.

## 2. Packages Alvo

Estrutura recomendada para uma refatoracao futura:

```text
br.ufpb.dsc.nexushub
├── identity
│   ├── domain
│   ├── application
│   └── infrastructure
├── people
│   ├── domain
│   ├── application
│   └── infrastructure
├── groups
│   ├── domain
│   ├── application
│   └── infrastructure
├── projects
│   ├── domain
│   ├── application
│   └── infrastructure
├── opportunities
│   ├── domain
│   ├── application
│   └── infrastructure
├── events
│   ├── domain
│   ├── application
│   └── infrastructure
├── gamification
│   ├── domain
│   ├── application
│   └── infrastructure
└── administration
    ├── domain
    ├── application
    └── infrastructure
```

No estado atual do projeto, esses pacotes ainda podem viver dentro dos modulos Maven `model` e `controller`. A separacao acima e o alvo conceitual.

## 3. Estereotipos

Use estes estereotipos:

- `Entity`: objeto com identidade persistente.
- `ValueObject`: objeto imutavel, sem identidade propria.
- `AggregateRoot`: entidade raiz de um agregado.
- `DomainService`: regra de dominio que envolve varias entidades.
- `ApplicationService`: orquestracao de caso de uso.
- `Repository`: porta de persistencia.
- `DTO`: contrato de entrada ou saida.

## 4. Identity

Responsabilidade:

- Conta de acesso.
- Papel/permissao.
- Autenticacao.
- Politica de senha.
- Auditoria basica por usuario autenticado.

Classes principais:

- `User`
- `Role`
- `Email`
- `PasswordHash`
- `AuthenticationService`
- `UserRepository`

```mermaid
classDiagram
    class User {
        +UUID id
        +Human human
        +Role role
        +Email email
        +PasswordHash passwordHash
        +EmailStatus emailStatus
        +LocalDateTime lastAccessAt
        +RecordStatus recordStatus
        +UUID updatedBy
        +LocalDateTime updatedAt
        +changeEmail(Email email, UUID actorId)
        +changePassword(PasswordHash hash, UUID actorId)
        +confirmEmail(UUID actorId)
        +deactivate(UUID actorId)
    }

    class Role {
        +UUID id
        +String name
        +RoleType type
        +RecordStatus recordStatus
    }

    class Email {
        +String value
        +normalize()
    }

    class PasswordHash {
        +String value
    }

    class UserRepository {
        <<Repository>>
        +findById(UUID id)
        +findByEmail(Email email)
        +save(User user)
    }

    class AuthenticationService {
        <<ApplicationService>>
        +register(RegisterUserCommand command)
        +login(LoginCommand command)
        +changePassword(ChangePasswordCommand command)
    }

    User --> Role
    User --> Email
    User --> PasswordHash
    AuthenticationService --> UserRepository
```

Decisao importante:

- `User` nao representa a pessoa. Ele representa a credencial/conta.
- A pessoa fica em `Human`.
- Na criacao inicial, `User.idupdatedby = User.id`.

## 5. People

Responsabilidade:

- Pessoa fisica base.
- Perfil academico.
- Interesses e habilidades.

Classes principais:

- `Human`
- `AcademicProfile`
- `Interest`
- `Skill`
- `HumanInterest`
- `HumanSkill`

```mermaid
classDiagram
    class Human {
        +UUID id
        +String name
        +LocalDate birthDate
        +Gender gender
        +RecordStatus recordStatus
        +UUID updatedBy
        +LocalDateTime updatedAt
        +rename(String name, UUID actorId)
        +deactivate(UUID actorId)
    }

    class AcademicProfile {
        +UUID id
        +Human human
        +String course
        +String bio
        +String institutionCode
        +ProfileVisibility visibility
        +RecordStatus recordStatus
        +updateBio(String bio, UUID actorId)
    }

    class Interest {
        +UUID id
        +String name
        +String description
    }

    class Skill {
        +UUID id
        +String name
        +SkillLevel level
    }

    class HumanInterest {
        +UUID id
        +Human human
        +Interest interest
        +RecordStatus recordStatus
    }

    class HumanSkill {
        +UUID id
        +Human human
        +Skill skill
        +RecordStatus recordStatus
    }

    Human "1" --> "0..1" AcademicProfile
    Human "1" --> "*" HumanInterest
    HumanInterest "*" --> "1" Interest
    Human "1" --> "*" HumanSkill
    HumanSkill "*" --> "1" Skill
```

Regra:

- Atributo multivalorado nao fica como lista textual dentro de `Human`.
- Interesses e habilidades usam tabelas/classes de relacao.

## 6. Groups

Responsabilidade:

- Grupos academicos.
- Membros de grupo.
- Administradores de grupo.
- Solicitacoes de entrada em grupos restritos.

Classes principais:

- `Group`
- `GroupHumanMember`
- `GroupJoinRequest`

```mermaid
classDiagram
    class Group {
        +UUID id
        +String name
        +String description
        +GroupType type
        +GroupStatus status
        +String colorCode
        +String logoUrl
        +RecordStatus recordStatus
        +UUID updatedBy
        +LocalDateTime updatedAt
        +addMember(Human human, boolean admin, UUID actorId)
        +removeMember(UUID humanId, UUID actorId)
        +promoteAdmin(UUID humanId, UUID actorId)
        +archive(UUID actorId)
    }

    class GroupHumanMember {
        +UUID id
        +Group group
        +Human human
        +boolean admin
        +MemberStatus status
        +LocalDate joinedAt
        +RecordStatus recordStatus
        +makeAdmin(UUID actorId)
        +removeAdmin(UUID actorId)
        +deactivate(UUID actorId)
    }

    class GroupJoinRequest {
        +UUID id
        +Group group
        +Human requester
        +Human evaluator
        +String motive
        +RequestStatus status
        +LocalDateTime requestedAt
        +LocalDateTime evaluatedAt
        +approve(Human evaluator)
        +reject(Human evaluator)
    }

    Group "1" --> "*" GroupHumanMember
    Human "1" --> "*" GroupHumanMember
    Group "1" --> "*" GroupJoinRequest
    Human "1" --> "*" GroupJoinRequest
```

Regra:

- A tabela/classe de relacao entre humano e grupo e `GroupHumanMember`.
- O campo `admin` pertence a essa relacao, nao a `Human` nem a `Group`.

## 7. Projects

Responsabilidade:

- Projetos academicos.
- Membros de projeto.
- Solicitacoes de entrada.
- Tags.
- Atividades ou entregas futuras.

Classes principais:

- `Project`
- `ProjectHumanMember`
- `ProjectJoinRequest`
- `Tag`
- `ProjectTag`
- `ProjectActivity`

```mermaid
classDiagram
    class Project {
        +UUID id
        +Group group
        +Human owner
        +String name
        +String resume
        +String goals
        +ProjectType type
        +ProjectStatus status
        +ProjectVisibility visibility
        +String coverUrl
        +RecordStatus recordStatus
        +UUID updatedBy
        +LocalDateTime updatedAt
        +publish(UUID actorId)
        +close(UUID actorId)
        +archive(UUID actorId)
        +requestJoin(Human human, String motive)
    }

    class ProjectHumanMember {
        +UUID id
        +Project project
        +Human human
        +ProjectRole role
        +MemberStatus status
        +LocalDate joinedAt
        +RecordStatus recordStatus
        +changeRole(ProjectRole role, UUID actorId)
        +deactivate(UUID actorId)
    }

    class ProjectJoinRequest {
        +UUID id
        +Project project
        +Human requester
        +Human evaluator
        +String motive
        +RequestStatus status
        +LocalDateTime requestedAt
        +LocalDateTime evaluatedAt
        +approve(Human evaluator)
        +reject(Human evaluator)
    }

    class Tag {
        +UUID id
        +String name
        +RecordStatus recordStatus
    }

    class ProjectTag {
        +UUID id
        +Project project
        +Tag tag
    }

    Project "0..1" --> "1" Group
    Project "1" --> "1" Human : owner
    Project "1" --> "*" ProjectHumanMember
    Human "1" --> "*" ProjectHumanMember
    Project "1" --> "*" ProjectJoinRequest
    Human "1" --> "*" ProjectJoinRequest
    Project "1" --> "*" ProjectTag
    ProjectTag "*" --> "1" Tag
```

Regras:

- Autor/responsavel do projeto e FK para `Human`.
- Membros do projeto ficam em `ProjectHumanMember`.
- Tags sao multivaloradas, logo usam `Tag` + `ProjectTag`.
- Solicitacao de entrada sempre aponta para projeto e humano por ID.

## 8. Opportunities

Responsabilidade:

- Oportunidades gerais.
- Vagas vinculadas a grupo/projeto.
- Candidaturas.

Classes principais:

- `Opportunity`
- `OpportunityApplication`

```mermaid
classDiagram
    class Opportunity {
        +UUID id
        +Group group
        +Project project
        +Human publisher
        +String name
        +String description
        +OpportunityType type
        +OpportunityStatus status
        +LocalDate deadline
        +String applyUrl
        +RecordStatus recordStatus
        +UUID updatedBy
        +LocalDateTime updatedAt
        +publish(UUID actorId)
        +close(UUID actorId)
    }

    class OpportunityApplication {
        +UUID id
        +Opportunity opportunity
        +Human candidate
        +ApplicationStatus status
        +LocalDateTime appliedAt
        +cancel(UUID actorId)
        +approve(UUID actorId)
        +reject(UUID actorId)
    }

    Opportunity "0..1" --> "1" Group
    Opportunity "0..1" --> "1" Project
    Opportunity "1" --> "1" Human : publisher
    Opportunity "1" --> "*" OpportunityApplication
    Human "1" --> "*" OpportunityApplication
```

## 9. Events

Responsabilidade:

- Eventos academicos.
- Inscricoes.
- Presenca.
- Certificados.

Classes principais:

- `Event`
- `EventRegistration`
- `EventAttendance`
- `Certificate`

```mermaid
classDiagram
    class Event {
        +UUID id
        +Group group
        +Project project
        +Human organizer
        +String name
        +String description
        +EventType type
        +EventStatus status
        +LocalDateTime startsAt
        +LocalDateTime endsAt
        +String location
        +String onlineUrl
    }

    class EventRegistration {
        +UUID id
        +Event event
        +Human participant
        +RegistrationStatus status
        +LocalDateTime registeredAt
    }

    class EventAttendance {
        +UUID id
        +Event event
        +Human participant
        +LocalDateTime confirmedAt
    }

    class Certificate {
        +UUID id
        +Event event
        +Human participant
        +String certificateUrl
        +LocalDate issuedAt
    }

    Event "1" --> "*" EventRegistration
    EventRegistration "*" --> "1" Human
    Event "1" --> "*" EventAttendance
    Event "1" --> "*" Certificate
```

## 10. Gamification

Responsabilidade:

- Pontuacao como extrato.
- Conquistas.
- Ranking.

Classes principais:

- `ScoreTransaction`
- `Achievement`
- `HumanAchievement`
- `RankingSnapshot`

```mermaid
classDiagram
    class ScoreTransaction {
        +UUID id
        +Human human
        +Integer points
        +ScoreReason reason
        +String sourceType
        +UUID sourceId
        +LocalDateTime occurredAt
    }

    class Achievement {
        +UUID id
        +String name
        +String description
        +AchievementType type
        +Integer requiredPoints
        +RecordStatus recordStatus
    }

    class HumanAchievement {
        +UUID id
        +Human human
        +Achievement achievement
        +LocalDateTime earnedAt
    }

    class RankingSnapshot {
        +UUID id
        +Human human
        +Integer position
        +Integer points
        +RankingScope scope
        +LocalDate referenceDate
    }

    Human "1" --> "*" ScoreTransaction
    Human "1" --> "*" HumanAchievement
    HumanAchievement "*" --> "1" Achievement
    Human "1" --> "*" RankingSnapshot
```

Regra:

- Pontuacao nao deve ser apenas um campo acumulado em `Human`.
- O correto e um extrato (`ScoreTransaction`) e, se necessario, visoes/materializacoes para ranking.

## 11. Administration

Responsabilidade:

- Auditoria detalhada opcional.
- Notificacoes.
- Moderacao.

Classes principais:

- `AuditLog`
- `Notification`
- `ModerationCase`

```mermaid
classDiagram
    class AuditLog {
        +UUID id
        +User actor
        +String entityName
        +UUID entityId
        +AuditAction action
        +LocalDateTime occurredAt
        +String metadata
    }

    class Notification {
        +UUID id
        +Human recipient
        +String title
        +String message
        +NotificationType type
        +NotificationStatus status
        +LocalDateTime createdAt
        +markAsRead()
    }

    class ModerationCase {
        +UUID id
        +Human reporter
        +Human reviewer
        +String targetType
        +UUID targetId
        +ModerationStatus status
        +String reason
        +approve()
        +reject()
    }
```

## 12. Enums Recomendados

```text
RecordStatus: ACTIVE, INACTIVE
EmailStatus: PENDING, CONFIRMED
Gender: MALE, FEMALE, OTHER, UNINFORMED
RoleType: STUDENT, PROFESSOR, COORDINATOR, ADMIN, SYSADMIN
GroupType: INSTITUTIONAL, COMMUNITY, EXTERNAL
GroupStatus: ACTIVE, ARCHIVED
ProjectType: RESEARCH, EXTENSION, TEACHING, INTERNAL, EXTERNAL
ProjectStatus: DRAFT, PUBLISHED, CLOSED, ARCHIVED
ProjectVisibility: PRIVATE, PUBLIC, PUBLIC_OPEN
MemberStatus: ACTIVE, INACTIVE, BLOCKED
RequestStatus: PENDING, APPROVED, REJECTED, CANCELED
OpportunityType: SCHOLARSHIP, INTERNSHIP, MONITORING, VOLUNTEERING, CALL
OpportunityStatus: OPEN, CLOSED, PAUSED, FILLED
ApplicationStatus: SUBMITTED, APPROVED, REJECTED, CANCELED
```

## 13. Agregados Recomendados

| Aggregate Root | Entidades internas | Repositorio |
| --- | --- | --- |
| `User` | `Role` por referencia | `UserRepository` |
| `Human` | `AcademicProfile`, interesses e habilidades por relacao | `HumanRepository` |
| `Group` | `GroupHumanMember`, `GroupJoinRequest` | `GroupRepository` |
| `Project` | `ProjectHumanMember`, `ProjectJoinRequest`, `ProjectTag` | `ProjectRepository` |
| `Opportunity` | `OpportunityApplication` | `OpportunityRepository` |
| `Event` | `EventRegistration`, `EventAttendance`, `Certificate` | `EventRepository` |
| `Achievement` | `HumanAchievement` por relacao | `AchievementRepository` |

## 14. Regras Arquiteturais

- `Human` e a base de pessoa.
- `User` e conta de acesso.
- Relacionamentos entre entidades usam ID/FK.
- Tabelas/classes associativas carregam atributos da relacao.
- Nenhuma entidade deve guardar nome de outra entidade como relacionamento.
- Campos multivalorados devem virar classes/tabelas proprias.
- Auditoria enxuta usa `idupdatedby` e `updatedAt`.
- Historico completo usa `AuditLog`, se necessario.

