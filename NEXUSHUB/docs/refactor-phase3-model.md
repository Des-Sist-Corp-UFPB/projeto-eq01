# Refactor Phase 3 - Backend Domain Model

Relatorio da Fase 3 do plano de execucao.

Data da execucao: 2026-06-07.

## Phase Completed

Fase 3: estrutura modular do dominio Java no modulo `model`.

Esta fase criou o modelo alvo em ingles, organizado por dominios, com entidades JPA alinhadas a migration UUID da Fase 2.

## Changed Structure

Nova estrutura criada em `model/src/main/java/br/ufpb/dsc/nexushub/model`:

```text
model
├── shared
│   └── domain
├── identity
│   ├── domain
│   ├── repository
│   └── service
├── people
│   ├── domain
│   ├── repository
│   └── service
├── groups
│   ├── domain
│   ├── repository
│   └── service
├── projects
│   ├── domain
│   ├── repository
│   └── service
└── opportunities
    ├── domain
    ├── repository
    └── service
```

Os pacotes legados `entity`, `repository`, `service` e `dto` ainda existem para evitar quebrar controllers antes da Phase 4.

## Entities Created

### Shared

- `AuditableEntity`

### Identity

- `Role`
- `User`

### People

- `Human`
- `Interest`
- `HumanInterest`

### Groups

- `Group`
- `GroupHumanMember`

### Projects

- `Project`
- `ProjectHumanMember`
- `ProjectRequest`
- `Tag`
- `ProjectTag`

### Opportunities

- `Opportunity`
- `OpportunityApplication`

## Repositories Created

Todos os repositories novos usam `UUID` como tipo de identificador.

- `RoleRepository`
- `UserRepository`
- `HumanRepository`
- `InterestRepository`
- `HumanInterestRepository`
- `GroupRepository`
- `GroupHumanMemberRepository`
- `ProjectRepository`
- `ProjectHumanMemberRepository`
- `ProjectRequestRepository`
- `TagRepository`
- `ProjectTagRepository`
- `OpportunityRepository`
- `OpportunityApplicationRepository`

## Service Contracts Created

Interfaces criadas para orientar a Phase 4:

- `IdentityService`
- `HumanService`
- `GroupService`
- `ProjectService`
- `OpportunityService`

Essas interfaces definem os casos de uso principais sem colocar regra de negocio em controller.

## Standards Applied

- Classes novas em ingles.
- Pacotes por dominio.
- Tabelas alinhadas ao padrao `prefix_entity`.
- Colunas sem `_`.
- IDs com `UUID`.
- `GenerationType.UUID` nas entidades novas.
- Relacionamentos de negocio com JPA/FK:
  - `User -> Human`
  - `User -> Role`
  - `GroupHumanMember -> Group`
  - `GroupHumanMember -> Human`
  - `Project -> Group`
  - `Project -> Human owner`
  - `ProjectHumanMember -> Project`
  - `ProjectHumanMember -> Human`
  - `ProjectTag -> Project`
  - `ProjectTag -> Tag`
  - `Opportunity -> Group`
  - `Opportunity -> Project`
  - `Opportunity -> Human publisher`
  - `OpportunityApplication -> Opportunity`
  - `OpportunityApplication -> Human`
- Lombok usado com:
  - `@Getter`
  - `@NoArgsConstructor(access = AccessLevel.PROTECTED)`
  - `@EqualsAndHashCode(onlyExplicitlyIncluded = true)`
- `@Data` nao foi usado em entidades.

## Validation

Validacoes estaticas executadas no dominio novo:

```text
rg -n 'GenerationType\.IDENTITY|private Long|JpaRepository<.*Long>' model/src/main/java/.../identity .../shared
```

Resultado:

- Nenhuma ocorrencia encontrada.

Validacao de colunas:

```text
Select-String -Pattern '@Column\(name = ".*_.*"'
```

Resultado:

- Nenhuma coluna com `_` encontrada nas entidades novas.

Arquivos novos listados com `rg --files`.

## Build Status

Build Maven nao executado.

Motivo:

```text
mvn : O termo 'mvn' nao e reconhecido como nome de cmdlet, funcao, arquivo de script ou programa operavel.
```

Isto e uma limitacao do ambiente atual. A validacao de compilacao deve ser repetida quando o Maven estiver disponivel.

## Known Impact

O codigo novo ainda nao esta conectado aos controllers atuais.

Isso e intencional nesta fase porque:

- Os controllers ainda importam entidades legadas em portugues.
- `NexusHubApplication` ainda faz scan dos pacotes legados.
- `DataSeeder` ainda usa entidades antigas.
- DTOs antigos ainda usam `Long`.

Esses pontos pertencem a Phase 4.

## Next Step

Executar a Phase 4: modularizar backend controller/API, migrando controllers, services, DTOs e seed para os pacotes novos.

