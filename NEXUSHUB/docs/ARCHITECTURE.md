# Arquitetura

## Modelo geral

O NEXUS HUB segue MVC com separacao explicita entre `model`, `view` e `controller`.

```text
NEXUSHUB
├── model
├── controller
├── view
└── docs
```

## Model

Modulo Java responsavel pelo dominio da aplicacao.

Contem:

- Entidades JPA.
- DTOs.
- Repositorios.
- Interfaces e implementacoes de servico.
- Regras de negocio.

## Controller

Modulo Spring Boot responsavel pela API.

Contem:

- Classe principal da aplicacao.
- Controllers REST.
- Configuracoes.
- Seeds de desenvolvimento.

O controller depende do modulo `model`.

## View

Aplicacao Angular responsavel pela interface.

Contem:

- Rotas e paginas em `src/app`.
- Componentes, paginas e servicos Angular.
- Estilos globais e configuracoes da aplicacao.

O diretorio oficial do frontend e `view`.

## Comunicacao

A view consome a API REST exposta pelo controller.

Fluxo esperado:

```text
Usuario -> View Angular -> Controller Spring REST -> Model -> Banco de dados
```

## Banco inicial

O projeto usa Flyway para versionamento de schema. O Hibernate deve validar o schema, nao cria-lo automaticamente.

Em desenvolvimento local, o projeto pode usar H2 em memoria para execucao rapida. Em ambiente real, a recomendacao e PostgreSQL.
