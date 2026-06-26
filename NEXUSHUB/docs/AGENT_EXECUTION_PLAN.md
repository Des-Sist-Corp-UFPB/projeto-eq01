# Agent Execution Plan

Este documento define o plano de execucao para agentes de IA que vao refatorar o NEXUS HUB seguindo a arquitetura, o modelo de classes, o dicionario de dados e a estrutura oficial do projeto.

O objetivo e reduzir decisao improvisada. O agente deve executar em fases, validar cada entrega e manter as decisoes tecnicas alinhadas aos documentos oficiais.

## 1. Operating Rules

Antes de qualquer alteracao, o agente deve ler:

- `docs/ARCHITECTURE_PLAYBOOK.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/CLASS_MODEL.md`
- `docs/DATA_DICTIONARY_STANDARD.md`
- `docs/USE_CASES.md`
- `AGENTS.md`

Regras obrigatorias:

- Nao alterar telas, estilos ou fluxo visual sem pedido explicito.
- Manter somente o frontend Angular em `view`.
- Nao recriar frontend Next.
- Nao criar tabela para refresh token, password reset ou sessao.
- Nao usar `BIGINT` no modelo alvo.
- Usar UUID para identificadores.
- Relacionamentos devem usar FK por id.
- Nao usar atributos soltos como nome de usuario, nome de grupo ou autor em texto quando existir entidade relacionada.
- Tabelas devem ter exatamente um `_`, no formato `prefix_entity`.
- Colunas nao devem ter `_`.
- Tabelas relacionais devem carregar os nomes das entidades relacionadas.
- Audit field padrao: `strecord`, `idupdatedby`, `tsupdated`.
- Comentarios e documentacao podem ficar em portugues.
- Nomes tecnicos, pacotes, classes, tabelas, colunas, DTOs e metodos devem ficar em ingles.

## 2. Execution Order

O agente deve executar nesta ordem:

1. Inventory
2. Target database model
3. Backend domain model
4. Backend application modules
5. Angular structure
6. Integration
7. Validation
8. Documentation closure

Nenhuma fase deve avancar se a fase anterior deixou decisao estrutural pendente.

## 3. Phase 1 - Inventory

Objetivo: entender o estado atual antes de mover ou refatorar codigo.

Actions:

- Mapear estrutura atual de `controller`, `model` e `view`.
- Listar entidades JPA existentes.
- Listar repositories, services e controllers existentes.
- Listar rotas Angular existentes.
- Listar telas Angular existentes.
- Identificar dependencias de nomes antigos, como `view-angular`, `view-next` e tabelas antigas.
- Identificar dados soltos que deveriam virar relacionamento por id.

Expected output:

- Documento curto em `docs/refactor-inventory.md` ou secao equivalente no log da tarefa.
- Lista de arquivos que serao alterados.
- Lista de riscos antes da refatoracao.

Acceptance criteria:

- O agente sabe quais telas existem.
- O agente sabe quais entidades existem.
- O agente sabe quais endpoints existem.
- O agente sabe quais nomes antigos precisam desaparecer.

## 4. Phase 2 - Target Database Model

Objetivo: materializar o modelo relacional alvo antes de refatorar Java.

Actions:

- Revisar `docs/DATA_DICTIONARY_STANDARD.md`.
- Revisar `docs/database-target-normalized.drawio`.
- Criar ou ajustar migration alvo com UUID.
- Criar FKs reais entre entidades.
- Transformar atributos multivalorados em tabelas relacionais.
- Criar tabelas associativas com nomes que indiquem as entidades relacionadas.
- Aplicar audit fields nas tabelas principais.
- Garantir que `sec_user.idupdatedby` permita o proprio usuario no cadastro inicial.

Target tables:

- `usr_human`
- `sec_user`
- `sec_role`
- `usr_interest`
- `usr_humint`
- `grp_group`
- `grp_hummember`
- `prj_project`
- `prj_hummember`
- `prj_request`
- `prj_tag`
- `prj_prjtag`
- `opp_opp`
- `opp_apply`

Expected output:

- Migration SQL alvo em `controller/src/main/resources/db/migration`.
- Diagrama atualizado em `docs/database-target-normalized.drawio`, se necessario.
- Dicionario de dados atualizado, se alguma decisao mudar.

Acceptance criteria:

- Todas as PKs sao UUID.
- Todas as relacoes usam FK.
- Nao existe relacionamento por nome solto.
- Nao existe coluna com `_`.
- Nao existe tabela fora do padrao `prefix_entity`.
- Tabelas associativas incluem os nomes das entidades relacionadas.

## 5. Phase 3 - Backend Domain Model

Objetivo: criar o modelo Java orientado a objetos alinhado ao banco e aos casos de uso.

Actions:

- Reorganizar o modulo `model` por dominios.
- Criar entidades JPA por modulo.
- Usar Lombok de forma conservadora.
- Criar value objects quando reduzirem erro de dominio.
- Criar enums para estados e tipos.
- Criar repositories por agregado.
- Criar services e interfaces de dominio.
- Evitar regra de negocio dentro de controller.

Target domains:

- `identity`
- `people`
- `groups`
- `projects`
- `opportunities`
- `events`
- `gamification`
- `administration`
- `shared`

Lombok standard:

- Usar `@Getter`.
- Usar `@NoArgsConstructor(access = AccessLevel.PROTECTED)` em entidades JPA.
- Usar `@EqualsAndHashCode(onlyExplicitlyIncluded = true)`.
- Evitar `@Data` em entidades.
- Evitar setters publicos amplos.

Expected output:

- Entidades organizadas em `model/src/main/java/...`.
- Repositories por modulo.
- Services de dominio definidos.
- DTOs compartilhados quando fizer sentido.

Acceptance criteria:

- Entidades refletem o modelo de classes.
- Entidades refletem o dicionario de dados.
- Nao ha dependencia do `model` para o `controller`.
- Nao ha controller chamando repository diretamente.

## 6. Phase 4 - Backend Application Modules

Objetivo: organizar a camada de API e aplicacao no `controller`.

Actions:

- Reorganizar controllers por modulo.
- Criar DTOs de request e response.
- Criar mappers entre DTO e dominio.
- Criar tratamento global de erro.
- Criar validacoes com Bean Validation.
- Ajustar seguranca.
- Ajustar CORS.
- Ajustar OpenAPI/Swagger, se disponivel.

Module structure:

```text
controller
└── src/main/java/.../controller
    ├── identity
    ├── people
    ├── groups
    ├── projects
    ├── opportunities
    ├── events
    ├── gamification
    ├── administration
    └── shared
```

Expected output:

- Controllers finos.
- Services contendo regra de negocio.
- DTOs claros.
- Erros padronizados.

Acceptance criteria:

- Controller nao contem regra de negocio complexa.
- Controller nao acessa repository diretamente.
- Request/response nao expoem entidade JPA sem controle.
- Endpoints seguem os casos de uso.

## 7. Phase 5 - Angular Structure

Objetivo: modularizar o Angular sem mudar as telas e os estilos.

Actions:

- Manter o frontend somente em `view`.
- Reorganizar codigo em `core`, `shared` e `features`.
- Criar services Angular por dominio.
- Criar models TypeScript alinhados aos DTOs do backend.
- Preservar HTML, CSS, layout, identidade visual e fluxo atual.
- Remover qualquer referencia residual a `view-angular`, `view-next` ou Next.

Target structure:

```text
view
└── src/app
    ├── core
    ├── shared
    └── features
        ├── auth
        ├── people
        ├── groups
        ├── projects
        ├── opportunities
        ├── events
        ├── gamification
        └── administration
```

Expected output:

- Angular organizado por feature.
- Services separados por dominio.
- Rotas preservadas ou redirecionadas de forma controlada.
- Estilos preservados.

Acceptance criteria:

- A aplicacao abre na mesma experiencia visual.
- Telas existentes continuam disponiveis.
- Nao existe Next.
- Nao existe pasta `view-angular`.
- Nao existe referencia a porta antiga do Next.

## 8. Phase 6 - Integration

Objetivo: validar fluxo real entre Angular, backend e banco.

Core flows:

- Criar conta.
- Login.
- Criar ou completar perfil humano.
- Criar grupo.
- Entrar em grupo.
- Definir administrador de grupo.
- Criar projeto.
- Solicitar entrada em projeto.
- Aprovar ou rejeitar solicitacao.
- Candidatar-se a oportunidade.

Expected output:

- Fluxos principais funcionando ponta a ponta.
- Ajustes de DTOs e endpoints documentados.

Acceptance criteria:

- Frontend consome backend sem dados mockados nos fluxos principais.
- Backend persiste dados com FKs corretas.
- Auditoria `idupdatedby` e `tsupdated` sao preenchidas.
- Relacoes many-to-many usam tabelas associativas.

## 9. Phase 7 - Validation

Objetivo: garantir que a refatoracao nao ficou apenas estruturalmente bonita, mas funcional.

Actions:

- Rodar build Maven.
- Rodar testes backend.
- Rodar build Angular.
- Rodar testes Angular, se existirem.
- Rodar busca por nomes proibidos.
- Validar migrations.
- Validar que nao ha uso indevido de `BIGINT` no modelo alvo.
- Validar que tabelas e colunas seguem naming standard.

Suggested checks:

```text
rg -n "view-angular|view-next|Next|localhost:3000" .
rg -n "BIGINT|bigserial|serial" controller/src/main/resources/db/migration
rg -n "sec_token|sec_reset" .
```

Acceptance criteria:

- Build backend passa.
- Build Angular passa.
- Migrations aplicam em banco limpo.
- Busca por nomes antigos nao retorna ocorrencias relevantes.
- Documentacao continua coerente com codigo.

## 10. Phase 8 - Documentation Closure

Objetivo: fechar a tarefa deixando rastreabilidade.

Actions:

- Atualizar `docs/DATA_DICTIONARY_STANDARD.md` se o banco mudar.
- Atualizar `docs/CLASS_MODEL.md` se classes mudarem.
- Atualizar `docs/PROJECT_STRUCTURE.md` se a estrutura mudar.
- Atualizar `docs/USE_CASES.md` se fluxos mudarem.
- Atualizar `AGENTS.md` se regra operacional mudar.

Expected output:

- Documentacao refletindo o estado final.
- Lista de arquivos alterados.
- Lista de validacoes executadas.
- Lista de pendencias reais, se existirem.

Acceptance criteria:

- Nao ha decisao importante apenas na conversa.
- Todo padrao novo esta documentado.
- O proximo agente consegue continuar sem reconstruir contexto do zero.

## 11. Stop Conditions

O agente deve parar e pedir revisao humana se encontrar:

- Conflito entre documento de arquitetura e codigo existente.
- Tabela ou classe necessaria que nao exista no modelo aprovado.
- Mudanca que possa alterar tela ou estilo.
- Necessidade de apagar dados reais.
- Necessidade de substituir fluxo de autenticacao.
- Dependencia externa nova nao prevista.
- Divergencia entre dicionario de dados e modelo de classes.

## 12. Final Agent Report

Ao finalizar uma fase, o agente deve responder com:

- Fase executada.
- Arquivos alterados.
- Decisoes tomadas.
- Validacoes executadas.
- Pendencias.
- Proxima fase recomendada.

Formato recomendado:

```text
Phase completed:
Changed files:
Validation:
Open issues:
Next step:
```

