# Padrao do Dicionario de Dados

Este documento define o padrao de modelagem e dicionario de dados do NEXUS HUB.

A documentacao, comentarios, descricoes e regras de negocio devem ficar em portugues. Apenas nomes fisicos de tabelas, colunas, constraints e indices devem ficar em ingles.

## 1. Decisao de Nomenclatura

Para o NEXUS HUB, o melhor padrao fisico e:

- Tabelas em ingles.
- Colunas em ingles.
- Descricoes e regras em portugues.
- Tabelas com apenas um separador `_`, no formato `prefixo_entidade`.
- Colunas sem `_`, usando prefixo semantico curto + nome em ingles.
- Nomes curtos, mas nao cripticos.
- Nada de nomes longos como `usr_academic_profile` ou `gam_point_transaction`.
- Tabelas associativas devem indicar as duas entidades relacionadas no nome.

Exemplos corretos:

- `sec_user`
- `usr_profile`
- `prj_hummember`
- `grp_hummember`
- `opp_apply`
- `gam_score`

Exemplos que devem ser evitados:

- `usr_academic_profile`: nome longo e com mais de um `_`.
- `prj_project_member`: nome longo e com mais de um `_`.
- `id_user`: coluna com `_`.
- `created_at`: coluna com `_`.
- `project_participation_request`: nome grande demais para uso fisico.

## 2. Racional Tecnico

Como administrador de dados, eu recomendo este padrao porque o NEXUS HUB tem um dominio modular, mas nao gigantesco. O banco precisa deixar claro o modulo de cada tabela sem criar nomes excessivamente longos.

O padrao `prefixo_entidade` resolve bem isso:

- O prefixo identifica o modulo.
- A entidade identifica a responsabilidade da tabela.
- Existe apenas um `_`.
- O nome continua curto para SQL, indices, FKs, logs e documentacao.

Para colunas, o uso de `_` nao e necessario. Prefixos como `id`, `nm`, `ds`, `dt`, `dh`, `ts`, `st`, `tp`, `qt`, `nr` e `fl` ja separam semanticamente o campo.

Exemplo:

```text
Tabela: prj_project
Colunas: idproject, nmproject, dsresume, idgroup, idowner, stproject, tsupdated
```

Esse padrao e mais proximo de dicionarios fisicos tradicionais, como o modelo de referencia analisado, mas mantendo os nomes em ingles.

## 3. Modulos do Sistema

Antes de nomear tabelas, o NEXUS HUB deve ser entendido nestes modulos:

| Modulo | Responsabilidade | Prefixo |
| --- | --- | --- |
| Seguranca | Login, usuario, senha, papeis e tokens | `sec` |
| Usuario | Perfil academico, interesses e dados publicos | `usr` |
| Grupo | Grupos academicos, membros e solicitacoes | `grp` |
| Projeto | Projetos, membros, tags e solicitacoes | `prj` |
| Oportunidade | Oportunidades, vagas e candidaturas | `opp` |
| Evento | Eventos, inscricoes, presenca e certificados | `evt` |
| Gamificacao | Pontos, conquistas e rankings | `gam` |
| Administracao | Auditoria, moderacao e notificacoes administrativas | `adm` |

## 4. Classes de Dominio Esperadas

Estas sao as classes conceituais que devem orientar a arquitetura e a modelagem.

### Seguranca

- `User`
- `Role`

### Usuario

- `Profile`
- `Interest`
- `Skill`
- `ProfileInterest`
- `ProfileSkill`

### Grupo

- `Group`
- `GroupMember`
- `GroupRequest`
- `GroupRole`

### Projeto

- `Project`
- `ProjectMember`
- `ProjectRequest`
- `ProjectTag`
- `Tag`
- `ProjectActivity`

### Oportunidade

- `Opportunity`
- `Application`
- `Vacancy`

### Evento

- `Event`
- `Registration`
- `Attendance`
- `Certificate`

### Gamificacao

- `Score`
- `Achievement`
- `UserAchievement`
- `Ranking`

### Administracao

- `AuditLog`
- `Notification`
- `Moderation`

## 5. Prefixos de Tabelas

Use apenas estes prefixos:

| Prefixo | Modulo | Exemplo |
| --- | --- | --- |
| `sec` | Seguranca | `sec_user` |
| `usr` | Usuario/perfil | `usr_profile` |
| `grp` | Grupos | `grp_group` |
| `prj` | Projetos | `prj_project` |
| `opp` | Oportunidades | `opp_apply` |
| `evt` | Eventos | `evt_event` |
| `gam` | Gamificacao | `gam_score` |
| `adm` | Administracao | `adm_audit` |

Regra obrigatoria:

```text
prefixo_entidade
```

Cada tabela deve ter somente um `_`.

## 6. Prefixos de Colunas

Colunas nao devem usar `_`.

Use prefixos curtos no inicio do nome:

| Prefixo | Uso | Exemplo |
| --- | --- | --- |
| `id` | Identificador ou FK | `iduser`, `idproject` |
| `nm` | Nome ou titulo | `nmuser`, `nmproject` |
| `ds` | Descricao ou texto | `dsemail`, `dsresume` |
| `dt` | Data | `dtstart`, `dtbirth` |
| `dh` | Data e hora | `dhlastaccess` |
| `ts` | Timestamp tecnico | `tsupdated` |
| `st` | Status | `strecord`, `stproject` |
| `tp` | Tipo ou categoria | `tprole`, `tpproject` |
| `qt` | Quantidade | `qtmembers` |
| `nr` | Numero | `nrscore` |
| `cd` | Codigo de negocio | `cdinvite` |
| `fl` | Booleano/flag | `flpublic` |
| `url` | Link ou midia | `urlcover` |

Exemplos corretos:

- `iduser`
- `nmuser`
- `dsemail`
- `dspasshash`
- `tprole`
- `strecord`
- `idupdatedby`
- `tsupdated`

Exemplos incorretos:

- `id_user`
- `password_hash`
- `created_at`
- `updated_by`

## 7. Auditoria

Todas as tabelas principais devem conter os campos abaixo:

| Coluna | Tipo | Tam | Nulo | Chave | Descricao |
| --- | --- | --- | --- | --- | --- |
| `strecord` | INT | - | Nao | - | Status logico do registro. 0 = inativo, 1 = ativo. |
| `idupdatedby` | UUID | - | Nao | FK | Usuario autenticado responsavel pela ultima operacao no registro. |
| `tsupdated` | TIMESTAMP | - | Nao | - | Timestamp da ultima operacao no registro. |

Relacionamentos de auditoria:

- `idupdatedby` -> `sec_user.iduser`

Observacao:

- `idupdatedby` e `tsupdated` representam a ultima operacao feita no registro, seja criacao, alteracao, inativacao ou reativacao.
- Para exclusao logica, atualize `strecord`, `idupdatedby` e `tsupdated`.
- Para guardar historico completo de cada alteracao individual, use uma tabela tecnica de auditoria como `adm_audit`, se o projeto realmente precisar.

### Criacao da propria conta

Quando um usuario cria a propria conta pela primeira vez:

- O backend deve gerar o UUID do novo usuario antes de gravar.
- O registro em `sec_user` deve nascer com `idupdatedby = iduser`.
- O registro em `usr_human` tambem deve nascer com `idupdatedby = sec_user.iduser`.
- Assim, o proprio usuario fica registrado como responsavel pela criacao dos seus dados iniciais.

Nao criar uma tabela separada apenas para "usuario atualizador". A tabela de referencia para auditoria e `sec_user`.

Observacao tecnica:

- Como `sec_user` depende de `usr_human` e `usr_human.idupdatedby` aponta para `sec_user`, existe uma dependencia circular no cadastro inicial.
- Em PostgreSQL, a solucao ideal e usar UUID gerado pela aplicacao e FK `DEFERRABLE INITIALLY DEFERRED` para validar a relacao ao final da transacao.
- Se o banco ou ambiente de desenvolvimento nao suportar FK deferrable, o cadastro inicial deve ser tratado como caso de bootstrap transacional no backend.

## 8. Tabelas Recomendadas

Esta e a proposta enxuta de tabelas fisicas para o primeiro modelo do NEXUS HUB.

### Seguranca

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `User` | `sec_user` | Usuario autenticavel do sistema. |
| `Role` | `sec_role` | Papel/permissao de acesso. |

Observacao de arquitetura:

- Tokens de recuperacao de senha nao entram no dicionario de dominio como tabela obrigatoria.
- Sessoes, refresh tokens e tokens temporarios devem ser tratados na camada de seguranca/infraestrutura.
- Se futuramente o projeto usar Spring Session JDBC, a tabela tecnica de sessao deve seguir o padrao da propria biblioteca, fora do modelo de dominio do NEXUS HUB.
- Se futuramente o projeto usar Redis, cache ou sessao em memoria, nao ha tabela fisica no banco relacional.

### Usuario

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Human` | `usr_human` | Pessoa fisica base do sistema. |
| `Profile` | `usr_profile` | Perfil academico publico do usuario. |
| `Interest` | `usr_interest` | Areas de interesse. |
| `Skill` | `usr_skill` | Habilidades do usuario. |
| `ProfileInterest` | `usr_profint` | Relacao entre perfil e interesse. |
| `ProfileSkill` | `usr_profskill` | Relacao entre perfil e habilidade. |

### Grupo

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Group` | `grp_group` | Grupo academico, laboratorio, comunidade ou parceiro. |
| `GroupMember` | `grp_hummember` | Relacao entre humano e grupo. |
| `GroupRequest` | `grp_request` | Solicitacoes de entrada em grupo restrito. |
| `GroupRole` | `grp_role` | Papel do membro no grupo. |

### Projeto

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Project` | `prj_project` | Projeto academico. |
| `ProjectMember` | `prj_hummember` | Relacao entre humano e projeto. |
| `ProjectRequest` | `prj_request` | Solicitacoes de entrada em projeto. |
| `Tag` | `prj_tag` | Tags reutilizaveis em projetos. |
| `ProjectTag` | `prj_prjtag` | Relacao entre projeto e tag. |
| `ProjectActivity` | `prj_activity` | Atividades, marcos ou entregas do projeto. |

### Oportunidade

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Opportunity` | `opp_opp` | Oportunidade geral, chamada, bolsa ou estagio. |
| `Vacancy` | `opp_vacancy` | Vaga associada a grupo ou projeto. |
| `Application` | `opp_apply` | Candidatura do usuario a oportunidade ou vaga. |

### Evento

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Event` | `evt_event` | Evento academico. |
| `Registration` | `evt_reg` | Inscricao em evento. |
| `Attendance` | `evt_attend` | Presenca confirmada no evento. |
| `Certificate` | `evt_cert` | Certificado emitido ou vinculado. |

### Gamificacao

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `Score` | `gam_score` | Extrato de pontos do usuario. |
| `Achievement` | `gam_badge` | Conquista ou badge disponivel. |
| `UserAchievement` | `gam_usrbadge` | Badge recebido por usuario. |
| `Ranking` | `gam_rank` | Snapshot ou posicao de ranking. |

### Administracao

| Classe | Tabela | Observacao |
| --- | --- | --- |
| `AuditLog` | `adm_audit` | Auditoria de acoes sensiveis. |
| `Notification` | `adm_notice` | Notificacoes internas. |
| `Moderation` | `adm_moder` | Analise de conteudo ou denuncia. |

## 9. Avaliacao de Nomes

### Melhor escolha para o contexto

Eu manteria nomes de tabela com prefixo de tres letras e entidade curta.

Exemplos ideais:

- `sec_user`
- `usr_profile`
- `grp_group`
- `grp_hummember`
- `prj_project`
- `prj_hummember`
- `opp_apply`
- `evt_reg`
- `gam_score`
- `adm_audit`

Esse padrao e equilibrado: tecnico, curto, modular e bom para documentacao.

### O que eu evitaria

Eu evitaria o padrao totalmente sem prefixo:

- `user`
- `project`
- `member`
- `request`

Motivo: nomes como `member` e `request` ficam ambiguos. Um membro pode ser de grupo ou projeto; uma solicitacao pode ser de grupo, projeto ou oportunidade.

Tambem evitaria nomes longos demais:

- `project_membership`
- `academic_profile_interest`
- `opportunity_application`

Motivo: ficam bons em codigo orientado a objeto, mas pesados para banco fisico, indices e FKs.

## 10. Padrao para Sessao e Tokens

Sessao, refresh token e token temporario nao devem ser tratados como entidades de negocio do NEXUS HUB.

Padrao recomendado para o projeto:

- Login e sessao ficam na camada de backend.
- O identificador de sessao deve ser mantido pelo mecanismo de seguranca adotado.
- O cliente nao deve guardar credenciais sensiveis em `localStorage` ou `sessionStorage`.
- A sessao deve usar cookie seguro com configuracoes adequadas quando a arquitetura permitir.
- O banco relacional do dominio nao deve ter tabela propria para refresh token no MVP.
- Recuperacao de senha deve ser implementada como fluxo de seguranca da aplicacao, nao como relacionamento de dominio.

Opcoes aceitaveis por fase:

| Fase | Estrategia | Tabela no dominio |
| --- | --- | --- |
| MVP academico | Sessao HTTP/Spring Security em backend | Nao |
| MVP com JWT simples | Access token curto, sem refresh persistido | Nao |
| Producao com sessao distribuida | Spring Session com Redis | Nao |
| Producao com Spring Session JDBC | Tabelas tecnicas da biblioteca | Fora do dicionario de dominio |
| Producao com refresh token | Repositorio tecnico de tokens | Fora do dicionario de dominio, documentado em seguranca |

Decisao para o NEXUS HUB:

- Nao criar `sec_token`.
- Nao criar `sec_reset` no modelo inicial de banco.
- Manter apenas `sec_user` e `sec_role` no modulo de seguranca do dicionario de dominio.
- Se a recuperacao de senha for implementada depois, documentar o armazenamento escolhido em uma secao tecnica de seguranca, separada das tabelas de negocio.

## 11. Padrao para Constraints e Indices

Constraints e indices podem usar `_`, porque precisam ser legiveis e amarrar tabela + coluna.

Padrao:

```text
pk_<table>
fk_<table>_<ref>
uk_<table>_<column>
ix_<table>_<column>
```

Exemplos:

- `pk_sec_user`
- `uk_sec_user_dsemail`
- `fk_prj_project_secuser`
- `ix_prj_hummember_idhuman`

## 12. Padrao de Documentacao de Tabelas

Cada tabela deve seguir o formato:

```text
1.1 SEC_USER

Tabela principal para controle de usuarios autenticaveis do sistema.

Coluna | Tipo | Tam | Nulo | Chave | Descricao
...

Relacionamentos:
- idupdatedby -> sec_user.iduser

Regras de Negocio:
- O e-mail deve ser unico.
- A senha deve ser armazenada como hash seguro.
```

## 13. Exemplo de Tabela

### SEC_USER

Tabela principal para controle de usuarios autenticaveis do sistema.

| Coluna | Tipo | Tam | Nulo | Chave | Descricao |
| --- | --- | --- | --- | --- | --- |
| `iduser` | UUID | - | Nao | PK | Identificador unico do usuario. |
| `nmuser` | VARCHAR | 255 | Nao | - | Nome completo do usuario. |
| `dsemail` | VARCHAR | 255 | Nao | UQ | E-mail usado para autenticacao. |
| `dspasshash` | VARCHAR | 255 | Nao | - | Hash seguro da senha do usuario. |
| `idrole` | UUID | - | Nao | FK | Papel de acesso do usuario. |
| `stemail` | INT | - | Nao | - | Status de confirmacao do e-mail. |
| `dhlastaccess` | DATETIME | - | Sim | - | Data e hora do ultimo acesso bem-sucedido. |
| `strecord` | INT | - | Nao | - | Status logico do registro. |
| `idupdatedby` | UUID | - | Nao | FK | Usuario responsavel pela ultima atualizacao. |
| `tsupdated` | TIMESTAMP | - | Nao | - | Timestamp da ultima atualizacao. |

Relacionamentos:

- `idrole` -> `sec_role.idrole`
- `idupdatedby` -> `sec_user.iduser`

Regras de Negocio:

- O e-mail deve ser unico.
- A senha deve ser armazenada usando algoritmo seguro de hash.
- Apenas usuarios ativos podem autenticar.
- O papel do usuario define as permissoes dentro da plataforma.

## 14. Padrao de Integridade Referencial

Padrao recomendado:

- Usar `SOFT DELETE` para tabelas de negocio.
- Usar `RESTRICT` para usuarios, projetos, grupos, eventos e oportunidades com historico.
- Usar `CASCADE` apenas para filhos tecnicos sem valor historico, como tokens temporarios.
- Usar `SET NULL` apenas em referencias opcionais, como usuario atualizador removido/desativado.

## 15. Validacoes de Dominio

Exemplos iniciais:

```text
strecord: 0 = inativo, 1 = ativo
stproject: 1 = rascunho, 2 = publicado, 3 = fechado, 4 = arquivado
strequest: 1 = pendente, 2 = aprovado, 3 = rejeitado, 4 = cancelado
tprole: 1 = estudante, 2 = professor, 3 = coordenador, 4 = administrador, 5 = sysadmin
tpgroup: 1 = institucional, 2 = comunidade, 3 = externo
tpopp: 1 = bolsa, 2 = estagio, 3 = monitoria, 4 = voluntariado, 5 = chamada
```

## 16. Conclusao

O padrao recomendado para o NEXUS HUB e modular, curto e fisico:

- Tabelas: `prefixo_entidade`.
- Colunas: sem `_`, com prefixos semanticos.
- Modulos: `sec`, `usr`, `grp`, `prj`, `opp`, `evt`, `gam`, `adm`.
- Documentacao em portugues.
- Nomes fisicos em ingles.

Essa escolha preserva clareza tecnica sem criar nomes longos demais para consultas, chaves estrangeiras, indices e manutencao futura.
