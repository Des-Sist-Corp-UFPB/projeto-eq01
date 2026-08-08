# Teste de Carga e Performance (k6)

Este diretório traz um teste de carga pronto para você medir a performance do
seu projeto usando o [k6](https://k6.io) — uma ferramenta leve em que os
cenários são escritos em JavaScript.

> ⚠️ **Rode SEMPRE contra o seu ambiente LOCAL** (o projeto rodando na sua
> máquina via `docker-compose`). **Não** aponte o teste para
> `https://eqNN.dsc.rodrigor.com`: o servidor e o **PostgreSQL são
> compartilhados** com todas as equipes (DSC e APS) e uma carga pesada
> derrubaria os projetos dos colegas.

---

## 1. Pré-requisitos

Suba o seu projeto localmente primeiro:

```bash
docker compose up -d
```
Anote a **porta** em que a aplicação ficou exposta (ex.: `8080`, `8000`, `3000`).

Depois, tenha o k6 disponível — escolha **uma** opção:

**Opção A — instalar o k6:**
```bash
# Linux (Debian/Ubuntu)
sudo gpg -k && sudo apt-get install -y k6   # veja k6.io/docs se necessário
# macOS
brew install k6
# Windows
choco install k6
```

**Opção B — usar via Docker (sem instalar nada):**
```bash
# Linux
docker run --rm -i --network host grafana/k6 run - < loadtest/carga.js
# macOS / Windows (use host.docker.internal como host no BASE_URL)
docker run --rm -i -e BASE_URL=http://host.docker.internal:8080 \
  grafana/k6 run - < loadtest/carga.js
```

---

## 2. Executando o teste

```bash
# Ajuste a porta para a do SEU projeto
k6 run -e BASE_URL=http://localhost:8080 loadtest/carga.js
```

Parâmetros que você pode passar na linha de comando:

| Variável | O que faz | Exemplo |
|----------|-----------|---------|
| `BASE_URL` | URL local do seu projeto | `-e BASE_URL=http://localhost:8000` |
| `VUS`      | Nº de usuários virtuais simultâneos | `-e VUS=20` |

Exemplo com mais carga:
```bash
k6 run -e BASE_URL=http://localhost:8080 -e VUS=30 loadtest/carga.js
```

---

## 3. Como ler o resultado

No fim da execução, o k6 mostra um resumo. Os campos mais importantes:

- **`http_req_duration`** — tempo de resposta. Olhe o **`p(95)`** (95% das
  requisições foram mais rápidas que esse valor).
- **`http_req_failed`** — percentual de requisições que falharam.
- **`http_reqs`** — total de requisições e a taxa por segundo (**RPS**).
- **`checks`** — percentual de verificações que passaram (ex.: "status 200").

No topo, cada **threshold** (meta) aparece com `✓` (passou) ou `✗` (falhou).
As metas já configuradas em `carga.js` são:

- `http_req_failed` < **1%**
- `http_req_duration` **p(95) < 500 ms**

Se algum threshold falhar, o k6 encerra com código de saída diferente de zero —
útil para saber objetivamente se o projeto aguenta a carga.

---

## 4. Personalizando (recomendado)

O teste padrão só exercita o `/ping`. Para um teste realista, edite
`loadtest/carga.js` e:

1. **Teste as rotas de verdade** do seu sistema (listagens, buscas, criação de
   registros) — não apenas o healthcheck.
2. **Fluxo autenticado:** há um exemplo comentado no `carga.js` mostrando como
   fazer login, capturar o token JWT e chamar uma rota protegida. Descomente e
   adapte aos nomes de campos do seu projeto.
3. **Ajuste as metas** (`thresholds`) ao que faz sentido para o seu sistema.
4. **Cenários de escrita (POST/PUT):** use um usuário/base de teste para não
   sujar dados reais.

---

## 5. O que entregar

Para a avaliação de performance, gere um resumo e **commite** junto ao projeto:

```bash
k6 run --summary-export=loadtest/resultado.json \
  -e BASE_URL=http://localhost:8080 loadtest/carga.js
```

No README principal do projeto, descreva brevemente:
- Quais rotas foram testadas e com quantos usuários virtuais;
- O `p(95)` e a taxa de erro obtidos;
- Gargalos identificados e o que foi (ou seria) feito para melhorar.
