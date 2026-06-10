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

O workflow faz login no GitHub Container Registry no servidor antes de executar `docker compose pull`, usando o token automatico do GitHub Actions. Por isso, o pacote nao precisa estar publico.

## Reset do banco de producao sem dados reais

Use este procedimento somente quando o banco de producao/homologacao nao tiver dados reais a preservar. Ele remove todas as tabelas do schema `public` e deixa o Flyway recriar o modelo atual a partir da migration `V1__init_schema.sql`.

### Pela pipeline

1. Abra `Actions -> Build & Deploy -> Run workflow`.
2. Marque `Apagar e recriar o schema public antes do deploy`.
3. Execute o workflow.

O passo `Resetar banco de producao`:

- envia `ops/reset-production-schema.sql` por SSH;
- executa o SQL no container `postgres`, banco `eq01`, usuario `eq01`;
- interrompe a pipeline se o reset falhar;
- reinicia explicitamente o container `eq01-nexushub-backend`;
- aguarda o health check `GET /ping`;
- exibe os ultimos logs do backend e falha a pipeline se a aplicacao nao subir.

O deploy da imagem acontece antes do reset. Assim, a pipeline nao apaga o banco se a publicacao da nova versao falhar.

O reset nao acontece em deploy automatico por `push`. Ele exige disparo manual com `reset_database` marcado.

### Execucao manual no servidor

1. Pare o backend antes do reset para evitar que a aplicacao tente validar o schema durante a limpeza.

```bash
docker compose stop backend
```

2. Conecte no PostgreSQL usado por `SPRING_DATASOURCE_URL` e execute o script operacional:

```bash
psql -U eq01 -d eq01 -f ops/reset-production-schema.sql
```

Se estiver executando dentro do container PostgreSQL, copie ou monte o arquivo antes, ou cole o conteudo de `ops/reset-production-schema.sql` no `psql`.

3. Suba o backend novamente.

```bash
docker compose pull backend
docker compose up -d backend
```

4. Valide que o Flyway recriou o schema e que o health check responde.

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

Resultado esperado:

```text
version: 1
description: init schema
success: true
```

```bash
curl http://localhost:8101/ping
```

Resultado esperado:

```json
{"status":"ok","service":"eq01","timestamp":"2026-06-03T14:32:10Z"}
```
