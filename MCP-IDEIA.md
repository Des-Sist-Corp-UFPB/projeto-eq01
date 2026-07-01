# Ideia de Servidor MCP — EQ01

**Domínio:** Governança de dados / LGPD (consentimento, solicitações de titular, auditoria)  
**Data:** 2026-07-01

## O que é

Um **servidor MCP (Model Context Protocol)** expõe as operações do seu sistema como *tools* e *resources* que qualquer assistente de IA (Claude Desktop, Cursor, etc.) pode chamar com segurança. Na prática, é uma camada fina sobre a **API que vocês já têm** — cada tool chama um endpoint/service existente. Assim o projeto deixa de ser só uma tela e passa a ser operável por um agente de IA.

## Servidor proposto: `lgpd-mcp`

### Tools sugeridas

- `listar_solicitacoes_pendentes()` — solicitações de titular em aberto
- `abrir_solicitacao_titular(tipo, userId)` — registra pedido de acesso/eliminação
- `exportar_dados_pessoais(userId)` — exporta os dados do titular
- `registrar_consentimento(userId, finalidade)` — grava consentimento

### Resources (somente leitura)

- trilha de auditoria (AuditLog) como resource somente-leitura

### Exemplos de uso com um LLM

- "Quais solicitações de titular estão pendentes há mais de 15 dias?"
- "Exporte os dados pessoais do usuário 42 conforme a LGPD."

## Esqueleto para começar (Java / Spring AI)

```java
// pom.xml: org.springframework.ai:spring-ai-starter-mcp-server-webmvc
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

@Service
public class LgpdTools {

    private final SeuService seuService;   // injete seus services/repositories

    public LgpdTools(SeuService seuService) { this.seuService = seuService; }

    @Tool(description = "solicitações de titular em aberto")
    public Object listar_solicitacoes_pendentes(/* params */) {
        return seuService.suaOperacaoExistente();   // reaproveite sua lógica
    }
}
```
> Registre as tools com um `MethodToolCallbackProvider` (bean) apontando para esta classe.

## Boas práticas

- **Segurança:** cada tool que altera dados deve exigir autenticação e registrar no **log de auditoria** (o mesmo do requisito da disciplina).
- **Escopo mínimo:** exponha só o necessário; separe tools de leitura das de escrita.
- **Reaproveite:** as tools devem chamar seus *services*/*controllers* existentes, não reimplementar regra de negócio.

## Referências
- Documentação MCP: https://modelcontextprotocol.io
- SDKs: Python (`mcp`), TypeScript (`@modelcontextprotocol/sdk`), Java (Spring AI MCP Server).

*Sugestão gerada em 2026-07-01 para orientar a integração de LLMs ao projeto.*