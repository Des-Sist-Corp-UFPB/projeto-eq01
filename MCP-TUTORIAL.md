# O que é um Servidor MCP? — Guia Introdutório

**Disciplina:** Desenvolvimento de Sistemas Corporativos
**Professor:** Rodrigo Rebouças
**Data:** 2026-07-01

---

## 1. O problema que o MCP resolve

Hoje, assistentes de IA (Claude, ChatGPT, Cursor, etc.) são muito bons em **conversar e raciocinar**, mas por padrão não sabem nada sobre os seus sistemas: não conseguem consultar o banco de dados da sua aplicação, criar um pedido, verificar um agendamento ou disparar uma notificação.

Antes do MCP, cada equipe que queria conectar um LLM a um sistema próprio tinha que:
- Escrever uma integração específica para cada combinação de LLM × sistema.
- Reinventar como descrever as "ações disponíveis" para o modelo.
- Lidar com autenticação, formatos de resposta e erros de forma ad-hoc.

O **Model Context Protocol (MCP)** é um protocolo aberto (criado pela Anthropic, hoje adotado por várias empresas) que padroniza **como um LLM se conecta a fontes de dados e ferramentas externas**. É como um "USB-C para IA": uma interface única que qualquer assistente compatível consegue falar, e qualquer sistema pode implementar uma vez só.

---

## 2. Conceitos básicos

Um servidor MCP expõe três tipos de capacidade:

### 2.1 Tools (ferramentas)
Funções que o modelo pode **chamar** para realizar uma ação ou obter um dado — o equivalente a uma chamada de API, mas descrita de um jeito que o LLM entende quando e como usar.

```
tool: agendar_consulta(paciente, especialidade, data)
descrição: "Agenda uma consulta médica para o paciente na especialidade e data informadas"
```

O modelo decide sozinho, durante a conversa, se e quando chamar essa tool — com base na descrição e no que o usuário pediu.

### 2.2 Resources (recursos)
Dados **somente leitura** que o servidor disponibiliza como contexto — por exemplo, um catálogo de produtos, um extrato financeiro, um schema de banco de dados. O modelo pode "ler" esses recursos para se informar antes de responder, sem que isso signifique uma ação.

### 2.3 Prompts
Modelos de prompt reutilizáveis que o servidor oferece — por exemplo, um prompt pré-formatado para "gerar relatório mensal" que já sabe quais dados buscar.

### 2.4 Arquitetura cliente-servidor
- **Servidor MCP**: a camada que você escreve, expondo tools/resources do seu sistema.
- **Cliente MCP**: embutido no assistente de IA (Claude Desktop, Cursor, etc.) — é quem descobre as tools disponíveis e decide chamá-las.
- **Transporte**: como cliente e servidor conversam — `stdio` (processo local, comum em uso pessoal) ou `HTTP/SSE` (servidor remoto, comum em produção).

```
┌─────────────┐        MCP         ┌──────────────────┐        ┌──────────────┐
│  Assistente  │ ◄───protocolo───► │  Servidor MCP     │ ───►  │  Sua API /   │
│  de IA       │                    │  (tools/resources)│        │  Banco/Serviço│
└─────────────┘                    └──────────────────┘        └──────────────┘
```

Importante: o servidor MCP **não reimplementa** a lógica de negócio — ele é uma casca fina que chama os *services*/*controllers* que já existem no seu sistema.

---

## 3. Por que isso importa (benefícios)

- **Reuso**: implementa a integração uma vez; qualquer cliente MCP compatível (hoje e no futuro) consegue usá-la, sem código extra.
- **Descoberta automática**: o modelo lê as descrições das tools e resources e decide sozinho quais usar — você não precisa "ensinar" o LLM com prompts gigantes explicando sua API.
- **Segurança e controle**: você decide exatamente quais operações ficam expostas (ex.: só leitura, ou leitura+escrita com autenticação), separado do resto do sistema.
- **Composabilidade**: um mesmo assistente pode falar com vários servidores MCP ao mesmo tempo (seu sistema + Google Drive + Slack, por exemplo) e combinar informações de todos numa única tarefa.
- **Auditabilidade**: como cada chamada de tool é um evento explícito, fica fácil registrar em log quem pediu o quê — encaixa bem com o requisito de log de auditoria da disciplina.

---

## 4. Aplicações práticas

| Cenário | Exemplo de tool MCP |
|---|---|
| E-commerce | `buscar_produto(query)`, `criar_pedido(itens)` |
| Agendamento | `horarios_disponiveis(data)`, `agendar(servico, horario)` |
| Financeiro | `lancar_gasto(valor, categoria)`, `consultar_saldo()` |
| Suporte/Help desk | `abrir_chamado(descricao)`, `status_chamado(id)` |
| Dados/BI | `executar_sql_seguro(query)`, `serie_temporal(indicador)` |

Em todos os casos, o padrão é o mesmo: pegar uma operação que seu sistema já faz (via API/service) e expô-la como tool, com uma descrição clara para o modelo.

---

## 5. Como isso se conecta com o projeto de vocês

Cada equipe já tem uma API funcional (Spring Boot, FastAPI, Express, etc.). Transformar parte dela num servidor MCP é, na prática:

1. Escolher 3–5 operações centrais do seu domínio (as mais "úteis para perguntar/pedir a um assistente").
2. Escrever uma tool para cada uma, chamando o service existente.
3. Descrever bem cada tool — a qualidade da descrição é o que faz o modelo escolher a ferramenta certa.
4. (Opcional) Expor 1–2 resources somente-leitura para dar contexto ao modelo sem custo de uma chamada de tool.

Vejam o arquivo `MCP-IDEIA.md` no repositório de cada equipe — ele já traz uma sugestão de servidor, tools e um esqueleto de código na stack de vocês (Java/Spring AI, Python/FastMCP ou Node/TypeScript).

---

## 6. Para ir além

- Especificação oficial: https://modelcontextprotocol.io
- SDKs oficiais: Python (`mcp`), TypeScript (`@modelcontextprotocol/sdk`), Java (Spring AI MCP Server)
- Testem localmente com o **Claude Desktop** ou o **MCP Inspector** (ferramenta oficial de debug de servidores MCP).

---

*Documento gerado para orientação geral da disciplina — complementa o `MCP-IDEIA.md` específico de cada equipe.*
