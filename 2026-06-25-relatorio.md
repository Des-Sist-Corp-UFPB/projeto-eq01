# Relatório de Avaliação — EQ01 (DSC)

| | |
|---|---|
| **Data** | 2026-06-25 |
| **Repositório** | https://github.com/des-sist-corp-ufpb/projeto-eq01 |
| **Aplicação** | https://eq01.dsc.rodrigor.com |
| **Período de atividade** | 2026-06-10 → 2026-06-10 |
| **Total de commits** (sem merges) | 1 |
| **Integrantes** | Kassio De Lima Leite (@KassioL2L) |

---

## 1. Tecnologias

- Flyway (2 migrations)
- Spring Security
- Lombok

---

## 2. Análise Funcional

### Endpoints REST (19 mapeados)

| Método | Path | Arquivo |
|--------|------|---------|
| `DELETE` | `/api/grupos/{id}` | `GrupoRestController.java` |
| `GET` | `/api/grupos` | `GrupoRestController.java` |
| `GET` | `/api/grupos/{id}` | `GrupoRestController.java` |
| `POST` | `/api/grupos` | `GrupoRestController.java` |
| `GET` | `/ping` | `HealthRestController.java` |
| `GET` | `/api/oportunidades` | `OportunidadeRestController.java` |
| `GET` | `/api/projetos` | `ProjetoRestController.java` |
| `GET` | `/api/projetos/colabs` | `ProjetoRestController.java` |
| `GET` | `/api/projetos/quentes` | `ProjetoRestController.java` |
| `GET` | `/api/projetos/recentes` | `ProjetoRestController.java` |
| `GET` | `/api/projetos/{id}` | `ProjetoRestController.java` |
| `POST` | `/api/projetos` | `ProjetoRestController.java` |
| `GET` | `/api/solicitacoes/projeto/{projetoId}` | `SolicitacaoRestController.java` |
| `POST` | `/api/solicitacoes` | `SolicitacaoRestController.java` |
| `PUT` | `/api/solicitacoes/{id}/resposta` | `SolicitacaoRestController.java` |
| `POST` | `/api/usuarios/cadastro` | `UsuarioRestController.java` |
| `POST` | `/api/usuarios/esqueci-senha` | `UsuarioRestController.java` |
| `POST` | `/api/usuarios/login` | `UsuarioRestController.java` |
| `PUT` | `/api/usuarios/perfil/{id}` | `UsuarioRestController.java` |

### Entidades / Tabelas (43 encontradas)

- `grp_group`
- `grp_hummember`
- `opp_opp`
- `opp_apply`
- `prj_project`
- `prj_tag`
- `prj_hummember`
- `prj_request`
- `prj_prjtag`
- `sec_role`
- `sec_user`
- `usr_humint`
- `usr_interest`
- `usr_human`
- `NexusHubApplication`
- `sec_role (via V2__rebuild_schema.sql)`
- `usr_human (via V2__rebuild_schema.sql)`
- `sec_user (via V2__rebuild_schema.sql)`
- `usr_interest (via V2__rebuild_schema.sql)`
- `usr_humint (via V2__rebuild_schema.sql)`
- `grp_group (via V2__rebuild_schema.sql)`
- `grp_hummember (via V2__rebuild_schema.sql)`
- `prj_project (via V2__rebuild_schema.sql)`
- `prj_hummember (via V2__rebuild_schema.sql)`
- `prj_request (via V2__rebuild_schema.sql)`
- `prj_tag (via V2__rebuild_schema.sql)`
- `prj_prjtag (via V2__rebuild_schema.sql)`
- `opp_opp (via V2__rebuild_schema.sql)`
- `opp_apply (via V2__rebuild_schema.sql)`
- `sec_role (via V1__init_schema.sql)`
- `usr_human (via V1__init_schema.sql)`
- `sec_user (via V1__init_schema.sql)`
- `usr_interest (via V1__init_schema.sql)`
- `usr_humint (via V1__init_schema.sql)`
- `grp_group (via V1__init_schema.sql)`
- `grp_hummember (via V1__init_schema.sql)`
- `prj_project (via V1__init_schema.sql)`
- `prj_hummember (via V1__init_schema.sql)`
- `prj_request (via V1__init_schema.sql)`
- `prj_tag (via V1__init_schema.sql)`
- `prj_prjtag (via V1__init_schema.sql)`
- `opp_opp (via V1__init_schema.sql)`
- `opp_apply (via V1__init_schema.sql)`

### Migrations (2 arquivos)

- `V1__init_schema.sql`
- `V2__rebuild_schema.sql`

---

## 3. Análise Arquitetural

| Aspecto | Status | Observação |
|---------|--------|-----------|
| Arquitetura em camadas | ✅ | controller=✅  service=✅  repository=✅ |
| Testes automatizados | ❌ | 0 arquivo(s) de teste |
| Migrations versionadas | ✅ | 2 migration(s) |
| Logging | ❌ | não detectado |
| Autenticação / Segurança | ✅ | Spring Security / JWT / decorator detectado |
| DTOs / Separação de dados | ✅ | classes *DTO / *Request / *Response detectadas |
| Tratamento global de exceções | ✅ | @ControllerAdvice / @ExceptionHandler detectado |
| Documentação de API (OpenAPI) | ❌ | não detectado |
| Variáveis de ambiente | ✅ | .env / @Value / os.environ detectado |
| Dockerfile / docker-compose | ❌ | não encontrado |

---

## 4. Contribuição por Usuário

### Resumo

| Usuário | Commits | % commits | Linhas adicionadas | Linhas no código atual | % código atual |
|---------|---------|-----------|-------------------|----------------------|----------------|
| Kassio De Lima Leite (@KassioL2L) | 1 | 100% | 32.678 | 10.074 | 100% |

### Contribuição por Camada

| Camada | Total linhas | Kassio De Lima Leite (@KassioL2L) |
|--------|-------------|---------|
| Controller | 1.091 | 100% |
| Frontend | 5.390 | 100% |
| Repository | 281 | 100% |
| Service | 1.091 | 100% |
| Test | 23 | 100% |

---

## 5. Contribuição por Funcionalidade

Baseado em `git blame` nos arquivos de controller e service.

| Arquivo | Total linhas | Kassio De Lima Leite (@KassioL2L) |
|---------|-------------|---------|
| `V2__rebuild_schema.sql` | 288 | 100% |
| `V1__init_schema.sql` | 273 | 100% |
| `ProjectServiceImpl.java` | 268 | 100% |
| `GroupServiceImpl.java` | 150 | 100% |
| `IdentityServiceImpl.java` | 114 | 100% |
| `DataSeeder.java` | 104 | 100% |
| `auth.service.ts` | 94 | 100% |
| `project.service.ts` | 81 | 100% |
| `UsuarioRestController.java` | 72 | 100% |
| `OpportunityServiceImpl.java` | 70 | 100% |
| `ProjetoRestController.java` | 61 | 100% |
| `HumanServiceImpl.java` | 56 | 100% |
| `SolicitacaoRestController.java` | 55 | 100% |
| `GrupoRestController.java` | 54 | 100% |
| `OpportunityApplication.java` | 53 | 100% |
| `grupo.service.ts` | 40 | 100% |
| `ProjectService.java` | 38 | 100% |
| `solicitacao.service.ts` | 36 | 100% |
| `SecurityConfig.java` | 32 | 100% |
| `OportunidadeRestController.java` | 28 | 100% |
| `NexusHubApplication.java` | 28 | 100% |
| `CorsConfig.java` | 25 | 100% |
| `app.routes.ts` | 24 | 100% |
| `GroupService.java` | 24 | 100% |
| `ApiExceptionHandler.java` | 24 | 100% |
| `HealthRestController.java` | 23 | 100% |
| `IdentityService.java` | 22 | 100% |
| `OpportunityApplicationRepository.java` | 16 | 100% |
| `OpportunityService.java` | 15 | 100% |
| `HumanService.java` | 14 | 100% |

---

*Relatório gerado automaticamente em 2026-06-25.*
*Os dados de contribuição são baseados em `git log --numstat` (linhas adicionadas) e `git blame` (linhas no código atual), excluindo commits de merge.*