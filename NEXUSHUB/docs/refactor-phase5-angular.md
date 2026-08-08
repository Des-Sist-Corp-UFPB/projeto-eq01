# Refactor Phase 5 - Angular Structure

Relatorio da Fase 5 do plano de execucao.

Data da execucao: 2026-06-08.

## Phase Completed

Fase 5: modularizacao fisica do Angular preservando telas e estilos.

## Changed Structure

Estrutura atual em `view/src/app`:

```text
app
├── core
│   └── auth
├── features
│   ├── auth
│   ├── groups
│   ├── people
│   ├── projects
│   └── requests
└── shared
    └── components
```

## Files Moved

- Auth service para `core/auth`.
- Paginas de login, cadastro e esqueci senha para `features/auth/pages`.
- Pagina de perfil para `features/people/pages`.
- Paginas de projetos para `features/projects/pages`.
- Service de projetos para `features/projects/services`.
- Paginas de grupos para `features/groups/pages`.
- Service de grupos para `features/groups/services`.
- Service de solicitacoes para `features/requests/services`.
- Componentes compartilhados para `shared/components`.

## Contract Adjustments

- IDs no frontend foram alterados de `number` para `string`, pois o backend agora usa UUID.
- Rotas visuais foram preservadas.
- Templates e estilos foram preservados.
- Nao foi recriado frontend Next.
- Nao existe mais `view-angular`; a pasta oficial e `view`.

## Validation

Busca estatica executada:

```text
rg -n "id\?: number|id: number|projetoId: number|view-angular|view-next|localhost:3000"
```

Resultado:

- Nenhuma ocorrencia funcional encontrada em `view/src/app`.

## Build Status

Build Angular nao executado.

Motivos:

- `npm` nao esta disponivel no PATH.
- `view/node_modules` nao existe no workspace.

## Open Issues

- Rodar `npm install` e build Angular quando o ambiente Node/npm estiver disponivel.
- Avaliar futuramente se os nomes internos de models Angular devem migrar de portugues para ingles.

