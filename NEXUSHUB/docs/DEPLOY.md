# Deploy

O deploy do backend usa uma imagem Docker publicada no GitHub Container Registry e executada no servidor da disciplina. As informacoes do ambiente devem ficar em secrets do GitHub Actions, nunca versionadas no repositorio.

## Secrets do GitHub Actions

Configure os secrets em `Settings -> Secrets and variables -> Actions -> New repository secret`:

- `SSH_USERNAME`: usuario SSH do servidor.
- `SSH_DEPLOY_KEY`: chave privada SSH liberada para deploy.
- `DEPLOY_HOST`: host SSH do servidor.
- `APP_PORT`: porta local publicada no servidor.
- `SPRING_DATASOURCE_URL`: URL JDBC do PostgreSQL.
- `SPRING_DATASOURCE_USERNAME`: usuario do PostgreSQL.
- `DB_PASSWORD`: senha do usuario do banco PostgreSQL.

O workflow `.github/workflows/deploy.yml` cria/atualiza o `.env` no servidor durante o deploy usando esses secrets.

## Imagem no GHCR

O build publica a imagem com `GITHUB_TOKEN`. A chave SSH possui um comando forcado no servidor e recebe `actor:GITHUB_TOKEN`, usando esse token efemero somente para autenticar no GHCR e baixar a imagem.

## Reconstrucao controlada do banco

A chave SSH do servidor possui um comando forcado e aceita somente `actor:GITHUB_TOKEN`. Por isso, a pipeline nao pode executar comandos arbitrarios como `docker exec`, `docker restart` ou `curl`.

A reconstrucao do banco sem dados reais e executada pelo Flyway:

- `V1__init_schema.sql` define a estrutura inicial;
- `V2__rebuild_schema.sql` remove somente as tabelas da aplicacao;
- a tabela `flyway_schema_history` e preservada;
- a V2 recria a estrutura atual e e executada uma unica vez.

Depois do deploy, valide no log do container que a migration V2 foi aplicada e que a aplicacao iniciou.

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

Resultado esperado no banco atualizado:

```text
1 | 1 | init schema     | true
2 | 2 | rebuild schema  | true
```

O health check deve responder:

```json
{"status":"ok","service":"eq01","timestamp":"2026-06-03T14:32:10Z"}
```
