import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GrupoService, Grupo } from '../services/grupo.service';
import { ProjectService, Projeto } from '../services/project.service';

@Component({
  selector: 'app-grupos-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="groups-container animate-fade-in">
      <header class="groups-header">
        <span class="header-eyebrow">Ecossistema Nexus</span>
        <h2>Grupos e Núcleos Acadêmicos</h2>
        <p>Explore laboratórios de inovação, centros acadêmicos e núcleos de pesquisa científica da nossa comunidade.</p>
      </header>

      <div class="groups-grid" *ngIf="grupos().length > 0">
        <article class="group-card" *ngFor="let gp of grupos()">
          <!-- Group main info -->
          <div class="group-info">
            <span class="group-area">{{ gp.area || 'Pesquisa' }}</span>
            <h3 class="group-title">{{ gp.nome }}</h3>
            <p class="group-desc">{{ gp.descricao }}</p>
            
            <div class="group-coordinator">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="user-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>Responsável: <strong>{{ gp.responsavel || 'Coordenador Geral' }}</strong></span>
            </div>
          </div>

          <!-- Group linked projects -->
          <div class="group-projects">
            <h4 class="projects-title">Projetos Vinculados ({{ getLinkedProjects(gp.nome).length }})</h4>
            
            <div class="projects-list" *ngIf="getLinkedProjects(gp.nome).length > 0">
              <a 
                [routerLink]="['/projetos', proj.id]" 
                class="project-link-item" 
                *ngFor="let proj of getLinkedProjects(gp.nome)"
              >
                <div class="project-link-info">
                  <span class="project-link-name">{{ proj.nome }}</span>
                  <span class="project-link-summary">{{ proj.resumo }}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="chevron-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            </div>

            <div class="no-projects" *ngIf="getLinkedProjects(gp.nome).length === 0">
              <p>Nenhum projeto ativo associado a este grupo por enquanto.</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div class="empty-groups" *ngIf="grupos().length === 0">
        <h3>Nenhum grupo cadastrado</h3>
        <p>Aguarde a atualização de núcleo acadêmico do sistema ou tente novamente mais tarde.</p>
      </div>
    </div>
  `,
  styles: [`
    .groups-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .groups-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto;
    }
    .header-eyebrow {
      color: var(--color-primary);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      display: block;
    }
    .groups-header h2 {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .groups-header p {
      font-size: 14px;
      color: var(--color-muted);
      line-height: 1.5;
    }

    /* Groups list layout */
    .groups-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
    }
    .group-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 280px;
      transition: var(--transition);
    }
    .group-card:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-md);
    }

    /* Left side info */
    .group-info {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      border-right: 1px solid var(--color-border);
    }
    .group-area {
      background: #e0f2fe;
      color: var(--color-primary);
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .group-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.3px;
    }
    .group-desc {
      font-size: 13.5px;
      color: var(--color-muted);
      line-height: 1.6;
    }
    .group-coordinator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--color-muted);
      margin-top: auto;
      background: #f8fafc;
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px dashed var(--color-border);
    }
    .user-icon {
      width: 14px;
      height: 14px;
      color: var(--color-primary);
    }

    /* Right side projects listing */
    .group-projects {
      padding: 32px;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .projects-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
    }
    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 220px;
      overflow-y: auto;
    }
    .project-link-item {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-decoration: none;
      transition: var(--transition);
      gap: 16px;
    }
    .project-link-item:hover {
      border-color: var(--color-primary);
      transform: translateX(4px);
      box-shadow: 0 4px 8px rgba(31, 122, 224, 0.05);
    }
    .project-link-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex-grow: 1;
    }
    .project-link-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }
    .project-link-summary {
      font-size: 11px;
      color: var(--color-muted);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .chevron-icon {
      width: 14px;
      height: 14px;
      color: var(--color-muted);
      flex-shrink: 0;
      transition: var(--transition);
    }
    .project-link-item:hover .chevron-icon {
      color: var(--color-primary);
      transform: scale(1.1);
    }

    .no-projects {
      text-align: center;
      padding: 40px 0;
      font-size: 13px;
      color: var(--color-muted);
      font-style: italic;
    }
    .empty-groups {
      text-align: center;
      padding: 80px 24px;
    }
    .empty-groups h3 {
      font-size: 18px;
      margin-bottom: 4px;
    }
    .empty-groups p {
      font-size: 13.5px;
      color: var(--color-muted);
    }
  `]
})
export class GruposPageComponent implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly projectService = inject(ProjectService);

  // States
  protected readonly grupos = signal<Grupo[]>([]);
  protected readonly allProjects = signal<Projeto[]>([]);

  ngOnInit() {
    this.grupoService.listar().subscribe(gps => {
      this.grupos.set(gps);
    });

    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });
  }

  getLinkedProjects(grupoNome: string): BentoProject[] {
    return this.allProjects().filter(p => 
      p.grupoPertencente && p.grupoPertencente.trim().toLowerCase() === grupoNome.trim().toLowerCase()
    );
  }
}

// Interface auxiliar interna para tipagem dos links de projetos filtrados
interface BentoProject {
  id?: number;
  nome: string;
  resumo: string;
}
