# Arquitetura do Sistema

## Visão Geral

```
Browser
  │
  ▼
Controller (Spring MVC)
  │  Recebe requests HTTP, valida DTOs, delega ao Service
  ▼
Service (@Transactional)
  │  Lógica de negócio, orquestra operações
  ▼
Repository (Spring Data JPA)
  │  Abstração do banco, queries automáticas
  ▼
PostgreSQL
```

## Padrão HTMX: Server-Side Rendering Reativo

Em vez de uma SPA (React/Vue), usamos **HTMX**: o servidor retorna fragmentos HTML que o HTMX injeta na página sem reload completo.

```
Browser                         Servidor
  │                               │
  │  GET /produtos/novo           │
  │──────────────────────────────►│
  │                               │  Retorna apenas o fragmento HTML do form
  │◄──────────────────────────────│  (não a página inteira)
  │                               │
  │  HTMX injeta o fragment       │
  │  no elemento alvo (#modal)    │
```

**Vantagens para este projeto**:
- Sem JavaScript customizado
- Templates no servidor (Thymeleaf) com acesso direto ao contexto Spring
- Fácil de entender e depurar

## Flyway: Gerenciamento de Schema

```
V1__criar_tabela_produto.sql  ← aplicado na 1ª inicialização
V2__adicionar_campo_xxx.sql   ← aplicado quando adicionado (NÃO editar V1!)
```

**Regra de ouro**: Nunca edite uma migration já aplicada. Crie sempre uma nova.

## Camadas

### Controller
- Recebe requisição HTTP
- Valida DTO com `@Valid`
- Chama Service
- Retorna template Thymeleaf (página completa ou fragment)
- NÃO contém lógica de negócio

### Service
- Anotado com `@Service` e `@Transactional`
- Contém toda a lógica de negócio
- Lança exceções de domínio (`ProdutoNaoEncontradoException`)
- Usa Repository para persistência

### Repository
- Interface que estende `JpaRepository`
- Queries derivadas do nome do método (Spring Data)
- Para queries complexas: `@Query` com JPQL

### Domain (Entidade)
- Classe JPA mapeada para tabela do banco
- NÃO deve conter lógica de negócio complexa
- `@PrePersist`/`@PreUpdate` para auditorias automáticas
