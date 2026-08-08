# Refactor Phase 2 - Target Database Model

Relatorio da Fase 2 do plano de execucao.

Data da execucao: 2026-06-07.

## Phase Completed

Fase 2: modelo de banco alvo.

O objetivo desta fase foi substituir a migration de prototipo por uma migration alinhada ao modelo normalizado do NEXUS HUB.

## Changed Files

- `controller/src/main/resources/db/migration/V1__init_schema.sql`
- `docs/README.md`

## Database Decisions Applied

- Todas as PKs do modelo alvo usam UUID.
- A migration usa PostgreSQL com `pgcrypto` para `gen_random_uuid()`.
- O modelo inclui `usr_human` como pessoa fisica base.
- `sec_user` representa credencial/acesso, nao a pessoa completa.
- `sec_role` representa papel de acesso.
- Relacionamentos usam FKs por id.
- Campos soltos de relacionamento como `nmauthor`, `nmleader`, `nmuser`, `nmgroup` em tabelas erradas e `dstags` foram removidos da migration.
- Tags foram normalizadas em `prj_tag` e `prj_prjtag`.
- Membros de grupo foram normalizados em `grp_hummember`.
- Membros de projeto foram normalizados em `prj_hummember`.
- Candidaturas foram normalizadas em `opp_apply`.
- Solicitacoes de entrada em projeto usam `idproject`, `idhuman` e `idevaluator`.
- Auditoria foi aplicada com `strecord`, `idupdatedby` e `tsupdated`.
- FKs de bootstrap entre `usr_human`, `sec_user` e `sec_role` usam `DEFERRABLE INITIALLY DEFERRED` onde existe dependencia circular.

## Target Tables Created

- `sec_role`
- `usr_human`
- `sec_user`
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

## Validation

Validacoes estaticas executadas:

```text
rg -n "BIGINT|bigserial|serial|nmleader|nmauthor|dstags|sec_token|sec_reset" controller/src/main/resources/db/migration/V1__init_schema.sql
```

Resultado:

- Nenhuma ocorrencia encontrada.

Validacao de padrao fisico:

```text
tables=14
badTables=
badColumns=
```

Resultado:

- 14 tabelas no formato `prefix_entity`.
- Nenhuma tabela fora do padrao de um `_`.
- Nenhuma coluna com `_`.

## Known Impact

O backend Java atual ainda esta desalinhado com a migration alvo porque as entidades atuais usam:

- `Long`
- `GenerationType.IDENTITY`
- campos textuais para relacionamentos
- entidades em portugues
- repositories com ID `Long`

Esse desalinhamento e esperado neste ponto. A proxima fase deve refatorar o modulo `model` para UUID, entidades em ingles e relacoes JPA reais.

## Open Issues

- A migration ainda nao foi aplicada em PostgreSQL real nesta fase.
- O build Maven nao foi executado porque o modelo Java ainda precisa ser refatorado na Fase 3.
- `DataSeeder.java` precisa ser refeito para inserir dados por UUID e FKs reais.
- O diagrama `database-target-normalized.drawio` deve ser revisado contra a migration final depois da Fase 3.

## Next Step

Executar a Fase 3: refatorar o backend domain model no modulo `model`.

