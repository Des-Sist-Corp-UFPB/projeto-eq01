# Logs com OpenTelemetry (Loki)

> Documento complementar da disciplina **DSC** — UFPB.
> Leia antes o guia principal [`opentelemetry.md`](opentelemetry.md); aqui aprofundamos **só o sinal de logs**.

Traces mostram *por onde* o pedido passou; métricas mostram *quanto/quantos*; **logs** mostram *o que exatamente aconteceu* em cada ponto — a mensagem textual que o seu código registrou. Este guia explica como fazer os logs da sua aplicação chegarem ao **Loki** (o agregador de logs da stack) e, principalmente, como **correlacioná-los com os traces**.

---

## 1. O que é um agregador de logs?

Tradicionalmente, "ver os logs" significa dar `docker logs` ou abrir um arquivo `.log` no servidor. Isso não escala: com vários serviços, réplicas e contêineres efêmeros, o log fica espalhado e some quando o contêiner morre.

Um **agregador de logs** centraliza os logs de todos os serviços num único lugar, indexado e pesquisável. Na nossa stack esse papel é do **Loki** (o "L" do LGTM), da Grafana. O Loki:

- recebe os logs pela mesma via OTLP dos outros sinais (não precisa de outra porta/endpoint);
- indexa por **labels** (ex.: `service_name`), não pelo conteúdo inteiro — por isso é leve e barato;
- é consultado no Grafana com a linguagem **LogQL**, parecida com a do Prometheus.

> **Retenção na turma:** os logs ficam **48h** no servidor central. Não é arquivo permanente — é para observar o comportamento recente da aplicação.

---

## 2. O ponto que mais confunde: log ≠ trace automático

A auto-instrumentação (o agente/registro do OTel) captura **traces e métricas** praticamente de graça. Mas os **logs da sua aplicação** (aquele `logger.info("pedido criado")`) **não** vão sozinhos para o OTLP só por ligar o agente — eles continuam indo para o console/arquivo como sempre.

Para os logs subirem ao Loki via OpenTelemetry, é preciso **conectar o seu framework de log ao OTel** através de um *appender* / *handler* / *bridge*. É isso que este documento ensina, por linguagem.

O caminho é sempre:

```
logger.info(...) ─> appender/handler OTel ─> OTLP ─> Collector ─> Loki ─> Grafana
```

---

## 3. Como enviar os logs — por linguagem

> Pré-requisito: as variáveis do guia principal já configuradas, incluindo
> `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS` (token) e
> `OTEL_LOGS_EXPORTER=otlp`.

### 🟧 Java (Logback / Log4j2)

O **agente Java** já traz a instrumentação de logs: ele intercepta o **Logback** e o **Log4j2** e envia automaticamente para o OTLP — **sem código**. Basta garantir que está habilitado (é o padrão):

```bash
# habilitado por padrão; deixe explícito se quiser:
-Dotel.instrumentation.logback-appender.enabled=true
# (para Log4j2: otel.instrumentation.log4j-appender.enabled=true)
```

Além disso, o agente injeta automaticamente `trace_id` e `span_id` no **MDC**, então cada linha de log já sai correlacionada ao trace. Para incluir esses campos também no seu log de console, adicione ao padrão do Logback:

```xml
<pattern>%d{HH:mm:ss} %-5level [trace_id=%X{trace_id} span_id=%X{span_id}] %logger - %msg%n</pattern>
```

Resumo Java: com o agente ligado, **normalmente não precisa fazer nada** além de já usar Logback/Log4j2. Gere um `logger.info(...)` e ele aparece no Loki.

### 🟦 Python (logging padrão)

A instrumentação de logs do Python **não** vem ligada por padrão. Habilite com uma variável de ambiente ao rodar via `opentelemetry-instrument`:

```bash
OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
OTEL_PYTHON_LOG_CORRELATION=true        # injeta trace_id/span_id nas linhas de log
```

Isso anexa um `LoggingHandler` do OTel ao logger raiz, e todo `logging.info(...)` passa a ir também para o OTLP. Se preferir o controle no código:

```python
import logging
from opentelemetry.sdk._logs import LoggingHandler

logging.getLogger().addHandler(LoggingHandler())
logging.getLogger().setLevel(logging.INFO)

logging.info("pedido criado", extra={"pedido_id": 42})
```

### 🟩 Node.js / TypeScript

No Node o envio de logs via OTLP ainda é mais manual. O caminho recomendado é usar seu logger habitual (**pino**, **winston** ou **bunyan**) com a instrumentação correspondente — que injeta `trace_id`/`span_id` — e ligar o *bridge* de logs do SDK. Instale:

```bash
npm install @opentelemetry/api-logs @opentelemetry/sdk-logs @opentelemetry/exporter-logs-otlp-http
```

E, no bootstrap da aplicação (antes de criar o logger):

```typescript
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { logs } from '@opentelemetry/api-logs';

const provider = new LoggerProvider();
provider.addLogRecordProcessor(
  new BatchLogRecordProcessor(new OTLPLogExporter()) // usa OTEL_EXPORTER_OTLP_* do ambiente
);
logs.setGlobalLoggerProvider(provider);
```

As instrumentações de `pino`/`winston` do `@opentelemetry/auto-instrumentations-node` cuidam de correlacionar cada log com o trace ativo.

---

## 4. Ver os logs no Grafana

1. Abra <https://otel.dsc.rodrigor.com> → **Explore**.
2. Selecione a fonte **Loki**.
3. Consulte com **LogQL**, filtrando pela sua equipe:

```logql
{service_name="dsc-eqNN"}
```

Refine à vontade:

```logql
{service_name="dsc-eqNN"} |= "erro"           # linhas que contêm "erro"
{service_name="dsc-eqNN"} | json               # parseia logs em JSON
{service_name="dsc-eqNN"} |= "pedido" | line_format "{{.body}}"
```

**Correlação log ↔ trace:** clicando numa linha de log que tenha `trace_id`, o Grafana oferece um botão para pular direto para o trace correspondente no **Tempo**. Esse é o ganho central de ter os dois no mesmo lugar.

---

## 5. Boas práticas (e o que **não** fazer)

- **Logue de forma estruturada.** Prefira mensagens com campos (`pedido_id=42`) a texto solto — fica muito mais fácil filtrar no LogQL.
- **Use os níveis certos.** `INFO` para eventos de negócio, `WARN`/`ERROR` para problemas, `DEBUG` só quando investigando. Evite `INFO` dentro de laços quentes.
- **Nunca logue segredos.** Senhas, tokens (inclusive o token da turma!), dados pessoais sensíveis — nada disso pode ir para o log.
- **Cuidado com volume.** Log em excesso enche o Loki e polui a busca (e a retenção é curta de propósito). Se você logar cada iteração de um loop, vai se afogar no próprio ruído.
- **Deixe a correlação ligada.** Log sem `trace_id` perde metade do valor: você vê *o quê* mas não consegue amarrar ao *quando/onde* do trace.

---

## 6. Exercícios / Entregáveis (logs)

No relatório da equipe, com prints do Grafana (Explore → Loki):

1. **Log no Loki** — mostre uma linha de log real da sua aplicação aparecendo no Loki, filtrada por `service_name`.
2. **Log estruturado** — registre um evento de negócio com pelo menos um campo estruturado (ex.: `pedido_id`) e mostre-o filtrado/parseado no LogQL.
3. **Correlação log ↔ trace** — mostre uma linha de log com `trace_id` e o pulo dela para o trace correspondente no Tempo.
4. **Log de erro** — provoque um erro tratado, registre-o com `logger.error(...)` (incluindo a exceção) e localize-o no Loki.

---

## Para aprofundar

- Loki / LogQL: <https://grafana.com/docs/loki/latest/query/>
- OTel Logs (visão geral): <https://opentelemetry.io/docs/concepts/signals/logs/>
- Instrumentação de logs por linguagem: <https://opentelemetry.io/docs/languages/>

---

*Complemento ao guia principal de OpenTelemetry — disciplina DSC, UFPB.*
