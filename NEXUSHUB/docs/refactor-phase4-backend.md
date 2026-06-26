# Refactor Phase 4 - Backend Application Modules

Relatorio da Fase 4 do plano de execucao.

Data da execucao: 2026-06-08.

## Phase Completed

Fase 4: migracao do backend para os modulos novos.

## Changed Areas

- Controllers REST foram mantidos nos endpoints atuais para preservar o contrato com o Angular.
- Controllers passaram a consumir apenas services dos modulos novos.
- `NexusHubApplication` passou a escanear somente entidades e repositories dos dominios novos.
- `DataSeeder` foi refeito usando `IdentityService`, `GroupService`, `ProjectService` e `OpportunityService`, sem acesso direto a repositories.
- Pacotes legados `entity`, `repository` e `service` foram removidos do filesystem.

## Current Backend Modules

- `identity`
- `people`
- `groups`
- `projects`
- `opportunities`
- `shared`
- `dto`

## Controllers Migrated

- `UsuarioRestController`
- `GrupoRestController`
- `ProjetoRestController`
- `SolicitacaoRestController`
- `OportunidadeRestController`

## Rules Applied

- Controllers nao acessam entidades legadas.
- Controllers nao usam repositories legados.
- Controllers nao injetam repositories e nao executam regra de negocio, persistencia, filtro de dominio ou resolucao de relacionamento.
- IDs de path e payload passam a usar `UUID`.
- Services novos concentram os casos de uso principais.
- `ProjectService` concentra filtro por autor/tag, ordenacao, criacao de projeto, normalizacao de tags e fluxo de solicitacao.
- `GroupService` concentra listagem, consulta, criacao e exclusao de grupos.
- `IdentityService` concentra cadastro, login, troca de senha, atualizacao de perfil e verificacao de existencia de usuarios.
- Seed inicial nao grava relacionamento por nome solto.
- Auditoria usa usuario real como `idupdatedby`.

## Validation

Busca estatica executada:

```text
rg -n "model\.entity|model\.repository|model\.service\b|GenerationType\.IDENTITY|private Long|PathVariable Long|JpaRepository<.*Long"
```

Resultado:

- Nenhuma ocorrencia funcional encontrada em `controller` e `model`.

Revisao adicional de separacao controller/service:

```text
rg -n "import .*repository|Repository|findBy|findAll|save\(|delete\(|filter\(|sorted\(|parseType|firstUser|resolve" controller/src/main/java/br/ufpb/dsc/nexushub/controller
```

Resultado:

- Nenhuma ocorrencia de repository ou regra de dominio em controllers REST.
- A unica ocorrencia restante e `EnableJpaRepositories` em `NexusHubApplication`, que pertence ao bootstrap Spring.

## Build Status

Build Maven nao executado com sucesso.

Motivo:

```text
Erro: Nao foi possivel localizar nem carregar a classe principal org.codehaus.plexus.classworlds.launcher.Launcher
```

O Maven local em `apache-maven-3.9.6` esta quebrado.

## Open Issues

- Validar compilacao assim que Maven estiver funcional.
- Rodar aplicacao com PostgreSQL local.
- Revisar se todos os endpoints devem ser renomeados futuramente para ingles ou se manterao nomes historicos em portugues como contrato publico.
