import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { CarouselComponent } from '../components/carousel';
import { NewProjectModalComponent } from '../components/new-project-modal';
import { ProjectCardComponent } from '../components/project-card';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent, NewProjectModalComponent, ProjectCardComponent],
  template: `
    <div class="animate-fade-in">
      <!-- Search Mode results -->
      <div class="main-content" *ngIf="searchQuery().trim() !== ''">
        <section class="search-results-section">
          <div class="section-header">
            <h2 class="section-title">Resultados da Busca ({{ getFilteredProjects().length }})</h2>
            <button class="clear-search-btn" (click)="searchQuery.set('')">Limpar Busca</button>
          </div>
          
          <div class="projects-grid" *ngIf="getFilteredProjects().length > 0">
            <div class="grid-item" *ngFor="let proj of getFilteredProjects()">
              <app-project-card [projeto]="proj"></app-project-card>
            </div>
          </div>
          
          <div class="no-results" *ngIf="getFilteredProjects().length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Nenhum projeto encontrado</h3>
            <p>Tente buscar por termos diferentes, tags ou nomes de integrantes.</p>
          </div>
        </section>
      </div>

      <!-- Dashboard Mode with Hero and Carousels -->
      <div *ngIf="searchQuery().trim() === ''">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <p class="hero-eyebrow">A vida acadêmica em movimento</p>
            <h2>Explore e divulgue iniciativas da sua universidade</h2>
            <p class="hero-desc">
              Participe de grupos de pesquisa, projetos de extensão, monitorias e desafios da comunidade. Transforme sua jornada acadêmica e ganhe reconhecimento!
            </p>
          </div>
        </section>

        <!-- Main Content Area -->
        <main class="main-content">
          <div class="carousels-dashboard">
            
            <!-- 1. Participando (Visible only when logged in) -->
            <section class="carousel-section" *ngIf="isLoggedIn()">
              <div class="section-header">
                <span class="section-tag journey">Sua Jornada</span>
                <h2 class="section-title">Projetos que você Participa</h2>
                <p class="section-subtitle">Olá <strong>{{ currentUser()?.nome }}</strong>, acompanhe seus projetos cadastrados.</p>
              </div>
              <app-carousel [items]="myProjects()"></app-carousel>
            </section>

            <!-- 2. Mais Quentes (Rank XP) -->
            <section class="carousel-section">
              <div class="section-header">
                <span class="section-tag hot">Em Destaque</span>
                <h2 class="section-title">Projetos Mais Quentes</h2>
                <p class="section-subtitle">Iniciativas com maior engajamento acadêmico e maior distribuição de XP.</p>
              </div>
              <app-carousel [items]="hotProjects()"></app-carousel>
            </section>

            <!-- 3. Recém Lançados -->
            <section class="carousel-section">
              <div class="section-header">
                <span class="section-tag recent">Novidades</span>
                <h2 class="section-title">Recém Lançados</h2>
                <p class="section-subtitle">Veja o que acabou de surgir no campus e seja um dos primeiros a apoiar.</p>
              </div>
              <app-carousel [items]="recentProjects()"></app-carousel>
            </section>

            <!-- 4. Colabs -->
            <section class="carousel-section">
              <div class="section-header">
                <span class="section-tag colab">Oportunidades</span>
                <h2 class="section-title">Colaborações em Aberto (Colabs)</h2>
                <p class="section-subtitle">Grupos de pesquisa e extensão ativamente recrutando novos talentos universitários.</p>
              </div>
              <app-carousel [items]="colabs()"></app-carousel>
            </section>

            <!-- 5. Filtro & Carrossel por Tags -->
            <section class="carousel-section tags-carousel-section">
              <div class="section-header">
                <span class="section-tag categories">Interesses</span>
                <h2 class="section-title">Explorar por Áreas de Interesse (Tags)</h2>
                <p class="section-subtitle">Escolha uma tag para navegar por projetos específicos dessa tecnologia ou disciplina.</p>
              </div>

              <!-- Custom tag chips row -->
              <div class="tags-chips-row">
                <button 
                  class="tag-chip" 
                  *ngFor="let tag of tagsList" 
                  [class.active]="selectedTag() === tag"
                  (click)="loadTagProjects(tag)"
                >
                  #{{ tag }}
                </button>
              </div>

              <app-carousel [items]="tagProjects()"></app-carousel>
            </section>

          </div>
        </main>
      </div>

      <!-- Modal Component Integration -->
      <app-new-project-modal 
        *ngIf="showCreateModal()" 
        (onClose)="closeCreateModal()"
        (onSaved)="onProjectSaved()"
      ></app-new-project-modal>
    </div>
  `,
  styles: [`
    .main-content {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .hero-section {
      background: radial-gradient(circle at 80% 20%, rgba(31, 122, 224, 0.05) 0%, rgba(19, 163, 124, 0.02) 100%);
      border-bottom: 1px solid var(--color-border);
      padding: 56px 0;
    }
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .hero-eyebrow {
      color: var(--color-primary);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .hero-section h2 {
      font-size: 32px;
      color: var(--color-text);
      max-width: 700px;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }
    .hero-desc {
      font-size: 15px;
      color: var(--color-muted);
      max-width: 650px;
      line-height: 1.6;
    }
    .section-header {
      margin-bottom: 20px;
    }
    .section-tag {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .section-tag.journey { background: #f3e8ff; color: var(--color-journey); }
    .section-tag.hot { background: #fee2e2; color: var(--color-warning); }
    .section-tag.recent { background: #e0f2fe; color: var(--color-primary); }
    .section-tag.colab { background: #d1fae5; color: var(--color-secondary); }
    .section-tag.categories { background: #fef3c7; color: #d97706; }
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .section-subtitle {
      font-size: 13.5px;
      color: var(--color-muted);
    }
    .tags-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 16px 0 8px;
    }
    .tag-chip {
      background: white;
      border: 1px solid var(--color-border);
      color: var(--color-muted);
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }
    .tag-chip:hover {
      border-color: #cbd5e1;
      color: var(--color-text);
      background: #f8fafc;
    }
    .tag-chip.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: 0 4px 10px rgba(31, 122, 224, 0.15);
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .grid-item { width: 100%; }
    .clear-search-btn {
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .clear-search-btn:hover { text-decoration: underline; }
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
    }
    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--color-muted);
      margin-bottom: 12px;
    }
    .no-results h3 {
      font-size: 18px;
      color: var(--color-text);
      margin-bottom: 4px;
    }
    .no-results p { font-size: 13.5px; color: var(--color-muted); }
  `]
})
export class DashboardPageComponent {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // States
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly showCreateModal = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedTag = signal('Angular');

  // Project Lists
  protected readonly allProjects = signal<Projeto[]>([]);
  protected readonly hotProjects = signal<Projeto[]>([]);
  protected readonly recentProjects = signal<Projeto[]>([]);
  protected readonly colabs = signal<Projeto[]>([]);
  protected readonly myProjects = signal<Projeto[]>([]);
  protected readonly tagProjects = signal<Projeto[]>([]);

  // List of tags for carousel selection
  protected readonly tagsList = ['Angular', 'Spring Boot', 'Python', 'Flutter', 'Arduino', 'PostgreSQL'];

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });

    this.projectService.listarQuentes().subscribe(projs => {
      this.hotProjects.set(projs);
    });

    this.projectService.listarRecentes().subscribe(projs => {
      this.recentProjects.set(projs);
    });

    this.projectService.listarColabs().subscribe(projs => {
      this.colabs.set(projs);
    });

    // Se estiver logado, puxa os projetos criados/participados
    const user = this.currentUser();
    if (user) {
      this.projectService.listarPorUsuario(user.nome).subscribe(projs => {
        this.myProjects.set(projs);
      });
    }

    this.loadTagProjects(this.selectedTag());
  }

  loadTagProjects(tag: string) {
    this.selectedTag.set(tag);
    this.projectService.listarPorTag(tag).subscribe(projs => {
      this.tagProjects.set(projs);
    });
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onProjectSaved() {
    this.loadAllData();
  }

  getFilteredProjects(): Projeto[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.allProjects().filter(p => 
      p.nome.toLowerCase().includes(query) || 
      (p.resumo && p.resumo.toLowerCase().includes(query)) ||
      (p.tags && p.tags.toLowerCase().includes(query)) ||
      (p.autor && p.autor.toLowerCase().includes(query))
    );
  }
}
