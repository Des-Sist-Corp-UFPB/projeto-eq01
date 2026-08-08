# Assistente de IA para criação de projetos

## 1. Objetivo

O NexusHub possui um copiloto de cadastro que transforma uma ideia curta em um rascunho estruturado de projeto acadêmico.

A IA sugere os seguintes campos:

- nome;
- resumo;
- objetivos;
- categoria;
- tipo;
- tags.

O resultado é apenas uma sugestão. Os campos permanecem editáveis e o projeto não é salvo automaticamente. O usuário deve revisar o conteúdo e concluir o fluxo normal de cadastro.

## 2. Fluxo funcional

1. Um usuário autenticado abre o modal **Cadastrar Novo Projeto**.
2. Na seção **Comece com a IA**, descreve sua ideia em até 1.200 caracteres.
3. O frontend envia a ideia para `POST /api/ai/project-draft`.
4. O backend valida a autenticação, o limite de uso e o tamanho da entrada.
5. O backend envia ao modelo somente a ideia informada e um prompt de sistema fixo.
6. A resposta JSON é validada, normalizada e sanitizada.
7. O frontend preenche o formulário para revisão do usuário.

## 3. Arquitetura

### Frontend

Arquivos principais:

- `view/src/app/shared/components/new-project-modal/new-project-modal.component.ts`
- `view/src/app/shared/components/new-project-modal/new-project-modal.component.html`
- `view/src/app/shared/components/new-project-modal/new-project-modal.component.css`
- `view/src/app/features/projects/services/project.service.ts`

O método `sugerirRascunho` chama a API e devolve um `ProjetoRascunhoIa`. Durante a geração, o botão fica desabilitado e a interface apresenta estado de carregamento e mensagens de erro.

### Backend

Arquivos principais:

- `controller/src/main/java/br/ufpb/dsc/nexushub/controller/ai/AiProjectRestController.java`
- `controller/src/main/java/br/ufpb/dsc/nexushub/controller/ai/ProjectDraftAiService.java`
- `controller/src/main/java/br/ufpb/dsc/nexushub/controller/ai/AiRateLimiter.java`
- `controller/src/main/java/br/ufpb/dsc/nexushub/controller/ai/ProjectDraftRequest.java`
- `controller/src/main/java/br/ufpb/dsc/nexushub/controller/ai/ProjectDraftResponse.java`

A integração usa o `RestClient` do Spring para consumir uma API compatível com OpenAI. Não foi adicionada uma dependência do Spring AI, reduzindo o número de dependências e mantendo a integração explícita.

## 4. Contrato da API

### Requisição

```http
POST /api/ai/project-draft
Content-Type: application/json
```

```json
{
  "idea": "Uma plataforma para conectar estudantes a projetos de extensão"
}
```

Regras:

- autenticação obrigatória;
- token CSRF obrigatório no fluxo web;
- `idea` obrigatória;
- tamanho máximo de 1.200 caracteres;
- limite de 5 solicitações por usuário a cada 10 minutos.

### Resposta

```json
{
  "nome": "Conecta Extensão",
  "resumo": "Plataforma que aproxima estudantes e projetos de extensão universitária.",
  "objetivos": "Centralizar oportunidades e facilitar a formação de equipes multidisciplinares.",
  "categoria": "Extensão",
  "tipo": "Extensao",
  "tags": "Extensão, Comunidade, Universidade"
}
```

## 5. Configuração

As configurações estão em `controller/src/main/resources/application.yml` e são preenchidas por variáveis de ambiente:

| Variável | Obrigatória | Valor padrão | Descrição |
|---|---:|---|---|
| `OPENAI_API_KEY` | Sim | vazio | Credencial usada somente pelo backend. |
| `OPENAI_BASE_URL` | Não | `https://llm.rodrigor.com/v1` | Endpoint compatível com a API OpenAI. |
| `OPENAI_MODEL` | Não | `gpt-4o-mini` | Modelo usado para gerar o rascunho. |

Exemplo no PowerShell:

```powershell
$env:OPENAI_API_KEY="chave-fornecida-fora-do-repositorio"
docker compose -f docker-compose.local.yml up -d --build
```

As variáveis também são encaminhadas ao backend por `docker-compose.yml` e `docker-compose.local.yml`.

> Nunca grave a chave em `application.yml`, no código-fonte, em documentação, em imagens Docker ou em arquivos versionados. Em produção, use o mecanismo de secrets do ambiente de deploy.

## 6. Segurança e prompt injection

As seguintes defesas foram aplicadas:

- o modelo não recebe acesso ao banco de dados, arquivos, ferramentas ou funções internas;
- a chave nunca é enviada ao Angular;
- o prompt de sistema é fixo e separado do conteúdo do usuário;
- a ideia é marcada como dado não confiável e serializada antes do envio;
- instruções contidas na ideia não são tratadas como comandos da aplicação;
- o modelo é instruído a retornar exclusivamente JSON;
- temperatura baixa (`0.2`) para reduzir variação;
- saída limitada a 700 tokens;
- todos os campos retornados são validados e têm tamanho máximo;
- HTML, caracteres de controle e conteúdo excedente são removidos;
- o tipo de projeto é restringido a uma lista permitida;
- tags são deduplicadas e limitadas a cinco;
- timeouts impedem que chamadas externas fiquem abertas indefinidamente;
- o usuário precisa revisar a sugestão antes de salvar;
- o frontend orienta a não informar dados pessoais ou confidenciais.

Nenhum sistema baseado em LLM é totalmente imune a prompt injection. Neste caso, o impacto é limitado por desenho: o modelo apenas produz texto validado para um rascunho e não possui capacidade de executar ações.

## 7. Tratamento de falhas

- Sem `OPENAI_API_KEY`: resposta `503 Service Unavailable`.
- Limite de uso excedido: resposta `429 Too Many Requests`.
- Falha ou timeout no provedor: resposta `502 Bad Gateway`.
- JSON inválido ou campos ausentes: resposta `502 Bad Gateway`.
- Entrada inválida: resposta `400 Bad Request`.

O limitador atual é mantido em memória. Portanto, seus contadores são reiniciados quando o backend reinicia e não são compartilhados entre múltiplas instâncias. Para escala horizontal, deve ser substituído por Redis ou outro armazenamento distribuído.

## 8. Privacidade

Somente o texto digitado no campo de ideia é enviado ao provedor de IA. Dados de perfil, e-mail, matrícula, grupos, credenciais e registros do banco não são incluídos na requisição.

O backend não registra a ideia nem a resposta em logs. Mudanças futuras devem preservar essa regra ou estabelecer política explícita de retenção e consentimento.

## 9. Evoluções recomendadas

- adicionar métricas de latência, erros e consumo sem registrar o conteúdo dos prompts;
- persistir o rate limit em Redis em ambientes com múltiplas réplicas;
- criar testes com um servidor HTTP simulado para respostas válidas, inválidas e timeouts;
- permitir que o administrador desative a funcionalidade por configuração;
- avaliar moderação de entrada e saída caso o recurso passe a aceitar conteúdo público mais amplo.
