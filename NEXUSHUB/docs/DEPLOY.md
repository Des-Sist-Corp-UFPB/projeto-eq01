# Deploy

O deploy do backend usa uma imagem Docker publicada no GitHub Container Registry e executada no servidor da disciplina. As informacoes do ambiente devem ficar em secrets/variables do GitHub Actions, nunca versionadas no repositorio.

## Secrets do GitHub Actions

Configure os secrets em `Settings -> Secrets and variables -> Actions -> New repository secret`:

- `SSH_USERNAME`: usuario SSH do servidor.
- `SSH_DEPLOY_KEY`: chave privada SSH liberada para deploy.
- `DB_PASSWORD`: senha do usuario do banco PostgreSQL.

## Variables do GitHub Actions

Configure em `Settings -> Secrets and variables -> Actions -> Variables`:

- `DEPLOY_HOST`: host SSH do servidor.
- `APP_PORT`: porta local publicada no servidor.
- `SPRING_DATASOURCE_URL`: URL JDBC do PostgreSQL.
- `SPRING_DATASOURCE_USERNAME`: usuario do PostgreSQL.

O workflow `.github/workflows/deploy.yml` cria/atualiza o `.env` no servidor durante o deploy usando esses valores.

## Imagem publica

Depois do primeiro push da imagem, torne o pacote publico no GitHub Container Registry para que o servidor consiga fazer `docker compose pull` sem login no GHCR.
