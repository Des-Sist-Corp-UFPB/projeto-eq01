# Proposta de Melhorias de Performance - NEXUS HUB

Este documento reúne sugestões práticas e detalhadas de otimização de performance para o ecossistema NEXUS HUB, visando melhorar o tempo de carregamento inicial, a responsividade da interface (Core Web Vitals como LCP e INP) e a eficiência das consultas ao banco de dados no backend.

---

## 1. Frontend (Angular)

### 1.1. Lazy Loading de Imagens (Melhoria de LCP)
**Problema**: A aplicação renderiza cards de projetos e grupos contendo imagens externas de alta resolução. Sem o carregamento preguiçoso, o navegador tenta baixar todas as imagens da lista imediatamente, atrasando a renderização do conteúdo principal (LCP).

**Solução**: Adicionar o atributo `loading="lazy"` nas tags `<img>` dos cards que não estão visíveis na dobra inicial da página.
```html
<!-- Em project-card.component.html -->
<div class="card-cover">
  <img [src]="projeto.imagemCardUrl || fallbackUrl" loading="lazy" alt="Capa do projeto" />
</div>
```

---

### 1.2. Detecção de Mudanças Otimizada (`OnPush`)
**Problema**: O Angular por padrão utiliza a estratégia de detecção de mudanças `Default`, o que significa que qualquer evento em qualquer parte da aplicação faz com que o Angular verifique novamente toda a árvore de componentes.

**Solução**: Configurar componentes de apresentação sem estado interno complexo (como `ProjectCardComponent`) para usar a estratégia `ChangeDetectionStrategy.OnPush`.
```typescript
// Em project-card.component.ts
import { Component, Input, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Otimização aqui
})
export class ProjectCardComponent implements OnInit { ... }
```

---

### 1.3. Ignorar Renderização Fora da Tela com CSS (`content-visibility`)
**Problema**: Em listas longas (como na aba de Grupos ou Projetos), o navegador gasta recursos renderizando o layout e pintando elementos que estão muito abaixo da tela (fora do viewport).

**Solução**: Utilizar a propriedade CSS moderna `content-visibility: auto` nos elementos de card para que o navegador só processe sua renderização quando eles se aproximarem da tela.
```css
/* Em project-card.component.css ou grupos.page.css */
.project-card {
  content-visibility: auto;
  contain-intrinsic-size: 320px; /* Altura estimada do card */
}
```

---

## 2. Backend (Spring Boot / Hibernate)

### 2.1. Otimização de Relacionamentos (`FetchType.LAZY`)
**Problema**: Por padrão, no JPA/Hibernate, anotações de associação única como `@OneToOne` e `@ManyToOne` utilizam `FetchType.EAGER`. Isso faz com que toda vez que um `User` for carregado, o Hibernate execute selects adicionais ou joins automáticos para trazer os dados de `Human` e `Role`, mesmo que esses dados não sejam necessários para a lógica do momento.

**Solução**: Alterar os mapeamentos no modelo de dados para carregamento preguiçoso (`LAZY`) e utilizar Entity Graphs ou Queries customizadas apenas onde o carregamento antecipado for indispensável.
```java
// Em User.java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "idhuman", nullable = false)
private Human human;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "idrole", nullable = false)
private Role role;
```

---

### 2.2. Paginação em Listagens de Dados
**Problema**: O endpoint `/api/projetos` e `/api/grupos` atualmente retorna todos os registros do banco de dados de uma só vez (`findAll()`). Com o crescimento do volume de dados, isso causará lentidão na rede e consumo excessivo de memória JVM.

**Solução**: Alterar os repositórios e endpoints para aceitar parâmetros de paginação (`Pageable`) do Spring Data JPA.
```java
// Em ProjectService.java e ProjectServiceImpl.java
Page<Project> listProjects(Pageable pageable);

// No Controller
@GetMapping
public ResponseEntity<Page<ProjetoResponse>> listar(Pageable pageable) {
    return ResponseEntity.ok(projectService.listProjects(pageable).map(ProjetoResponse::from));
}
```

---

### 2.3. Cache de Respostas Estáticas (`@Cacheable`)
**Problema**: Certos dados mudam raramente (como listas de tags de projetos ou categorias de grupos), mas são consultados em quase toda navegação.

**Solução**: Adicionar o Spring Cache para armazenar esses resultados em memória e evitar consultas recorrentes ao banco de dados PostgreSQL.
```java
// Em GroupServiceImpl.java
@Override
@Cacheable("activeGroups")
public List<Group> listActiveGroups() {
    return groupRepository.findAllActive();
}
```
Para habilitar, basta adicionar `@EnableCaching` na classe principal `NexusHubApplication.java`.
