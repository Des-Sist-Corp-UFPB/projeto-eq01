import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService, Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { SolicitacaoService, SolicitacaoEntrada } from '../services/solicitacao.service';

@Component({
  selector: 'app-projeto-detalhe-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="detail-container animate-fade-in" *ngIf="projeto()">
      <!-- Back navigation link -->
      <a routerLink="/" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Voltar para o Dashboard
      </a>

      <!-- Large Hero Header Card -->
      <header class="detail-hero">
        <img [src]="projeto()?.imagemLandingUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop'" alt="Capa" class="hero-cover" />
        <div class="hero-overlay">
          <div class="category-badge" *ngIf="projeto()?.tipo">{{ projeto()?.tipo }}</div>
          <h1 class="project-title">{{ projeto()?.nome }}</h1>
          <p class="project-tagline">{{ projeto()?.resumo }}</p>
        </div>
      </header>

      <!-- Main Columns Layout -->
      <div class="detail-grid">
        <!-- Left Column: Details -->
        <main class="detail-main">
          <section class="card-section">
            <h2 class="card-title">Objetivos do Projeto</h2>
            <p class="objective-text">
              {{ projeto()?.objetivos || 'Sem objetivos cadastrados para esta iniciativa acadêmica.' }}
            </p>
          </section>

          <section class="card-section">
            <h2 class="card-title">Tecnologias & Competências</h2>
            <div class="tags-row" *ngIf="projeto()?.tags">
              <span class="tag-badge" *ngFor="let tag of getTags()">#{{ tag.trim() }}</span>
            </div>
            <p class="tags-empty" *ngIf="!projeto()?.tags">Nenhuma tecnologia/competência mapeada ainda.</p>
          </section>

          <!-- 1. AUTHOR WORKSPACE: membership requests pending approval -->
          <section class="card-section admin-section" *ngIf="isOwner()">
            <div class="admin-header">
              <span class="admin-badge">Dono do Projeto</span>
              <h2 class="card-title">Solicitações de Entrada Acadêmica</h2>
              <p class="admin-subtitle">Avalie os estudantes que desejam colaborar no seu projeto.</p>
            </div>

            <div class="requests-list" *ngIf="solicitacoes().length > 0">
              <div class="request-card" *ngFor="let sol of solicitacoes()">
                <div class="request-meta">
                  <div class="applicant-info">
                    <span class="applicant-avatar">{{ sol.usuarioNome.charAt(0) }}</span>
                    <div>
                      <h4 class="applicant-name">{{ sol.usuarioNome }}</h4>
                      <p class="applicant-email">{{ sol.usuarioEmail }}</p>
                    </div>
                  </div>
                  <span class="status-badge" [class]="sol.status?.toLowerCase()">{{ sol.status }}</span>
                </div>
                
                <p class="applicant-motivation">
                  <strong>Motivação:</strong> "{{ sol.motivo }}"
                </p>

                <!-- Action buttons (only visible for pending) -->
                <div class="request-actions" *ngIf="sol.status === 'PENDENTE'">
                  <button class="btn btn-secondary btn-sm" (click)="responderSolicitacao(sol.id!, false)">
                    Recusar
                  </button>
                  <button class="btn btn-primary btn-sm" (click)="responderSolicitacao(sol.id!, true)">
                    Aprovar Candidato
                  </button>
                </div>
              </div>
            </div>

            <div class="no-requests" *ngIf="solicitacoes().length === 0">
              <p>Nenhuma solicitação de entrada cadastrada para este projeto por enquanto.</p>
            </div>
          </section>
        </main>

        <!-- Right Column: Sidebar -->
        <aside class="detail-sidebar">
          <!-- Information Card -->
          <section class="card-section">
            <h3 class="sidebar-title">Detalhes Acadêmicos</h3>
            
            <div class="sidebar-info-row">
              <span class="info-label">Coordenador/Autor</span>
              <span class="info-value"><strong>{{ projeto()?.autor || 'Anônimo' }}</strong></span>
            </div>

            <div class="sidebar-info-row" *ngIf="projeto()?.grupoPertencente">
              <span class="info-label">Grupo / Núcleo</span>
              <span class="info-value"><strong>{{ projeto()?.grupoPertencente }}</strong></span>
            </div>

            <div class="sidebar-info-row">
              <span class="info-label">Total de Membros</span>
              <span class="info-value"><strong>{{ projeto()?.quantidadeMembros || 1 }} participante(s)</strong></span>
            </div>

            <div class="sidebar-info-row" *ngIf="projeto()?.status">
              <span class="info-label">Status de Entrada</span>
              <span class="info-value">
                <span class="status-indicator" [class.aberto]="projeto()?.status === 'ABERTO'">
                  {{ projeto()?.status }}
                </span>
              </span>
            </div>
          </section>

          <!-- Gamification Highlight -->
          <section class="card-section gamification-card">
            <div class="xp-banner">
              <span class="xp-badge">+{{ projeto()?.xpDistribuido || 100 }} XP</span>
              <div>
                <h4 class="xp-title">Recompensa de Atividade</h4>
                <p class="xp-subtitle">Ganhe experiência na modalidade <strong>{{ projeto()?.tipo }}</strong> ao ingressar e realizar contribuições aprovadas.</p>
              </div>
            </div>
          </section>

          <!-- 2. STUDENT WORKSPACE: Request entrance -->
          <section class="card-section join-section" *ngIf="!isOwner() && projeto()?.status === 'ABERTO'">
            <h3 class="sidebar-title">Quer participar do time?</h3>
            
            <!-- Logged out prompt -->
            <div class="auth-prompt" *ngIf="!isLoggedIn()">
              <p>Você precisa estar logado na plataforma acadêmica para enviar uma solicitação de entrada.</p>
              <button class="btn btn-primary w-full" routerLink="/login">Fazer Login</button>
            </div>

            <!-- Logged in join request form -->
            <div *ngIf="isLoggedIn() && !solicitacaoSucesso()">
              <p class="join-desc">Envie uma justificativa ao coordenador explicando o porquê do seu interesse e suas habilidades.</p>
              
              <div class="alert alert-danger" *ngIf="joinError()">
                {{ joinError() }}
              </div>

              <form (ngSubmit)="enviarSolicitacao()">
                <div class="form-group">
                  <label for="motivo">Sua Justificativa</label>
                  <textarea 
                    id="motivo" 
                    name="motivo" 
                    [(ngModel)]="motivo" 
                    required 
                    rows="4" 
                    placeholder="Ex: Gostaria de participar pois tenho interesse em pesquisar sobre essa área e possuo conhecimentos prévios de Angular/Spring..."
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-full" [disabled]="!motivo.trim() || isSending()">
                  {{ isSending() ? 'Enviando...' : 'Enviar Solicitação de Entrada' }}
                </button>
              </form>
            </div>

            <!-- Join request success card -->
            <div class="success-prompt animate-fade-in" *ngIf="solicitacaoSucesso()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="success-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4>Solicitação Enviada!</h4>
              <p>Sua mensagem foi enviada ao autor. Você receberá uma notificação quando a solicitação for avaliada.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--color-primary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      transition: var(--transition);
      align-self: flex-start;
    }
    .back-link:hover {
      transform: translateX(-4px);
    }
    .arrow-icon {
      width: 16px;
      height: 16px;
    }
    
    /* Hero cover */
    .detail-hero {
      position: relative;
      height: 320px;
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    }
    .hero-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.85;
    }
    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.9) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    .category-badge {
      background: var(--color-secondary);
      color: white;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .project-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .project-tagline {
      font-size: 16px;
      opacity: 0.9;
      max-width: 800px;
    }

    /* Grid columns */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      align-items: start;
    }

    /* Card standard styling */
    .card-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }
    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }
    .objective-text {
      font-size: 14.5px;
      color: var(--color-muted);
      line-height: 1.7;
    }

    /* Tags badge */
    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag-badge {
      background: #f1f5f9;
      color: var(--color-muted);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .tags-empty {
      font-size: 13px;
      color: var(--color-muted);
      font-style: italic;
    }

    /* Sidebar cards */
    .sidebar-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 10px;
    }
    .sidebar-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px dashed #f1f5f9;
    }
    .sidebar-info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: var(--color-muted);
    }
    .info-value {
      color: var(--color-text);
      text-align: right;
    }
    .status-indicator {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      background: #fef3c7;
      color: #d97706;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .status-indicator.aberto {
      background: #d1fae5;
      color: var(--color-secondary);
    }

    /* Gamification Sidebar */
    .gamification-card {
      background: linear-gradient(135deg, rgba(31, 122, 224, 0.03) 0%, rgba(19, 163, 124, 0.03) 100%);
      border-color: rgba(31, 122, 224, 0.15);
    }
    .xp-banner {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .xp-badge {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
      font-weight: 900;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(31, 122, 224, 0.15);
      flex-shrink: 0;
    }
    .xp-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 4px;
    }
    .xp-subtitle {
      font-size: 12px;
      color: var(--color-muted);
      line-height: 1.4;
    }

    /* Join Sidebar form */
    .join-desc {
      font-size: 12.5px;
      color: var(--color-muted);
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 700;
    }
    textarea {
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 13px;
      width: 100%;
      outline: none;
      transition: var(--transition);
      resize: vertical;
    }
    textarea:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(31, 122, 224, 0.1);
    }
    .w-full {
      width: 100%;
      padding: 11px;
      font-size: 13px;
      border-radius: var(--border-radius-sm);
    }
    .auth-prompt {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .auth-prompt p {
      font-size: 12.5px;
      color: var(--color-muted);
      line-height: 1.5;
    }

    /* Success application prompt */
    .success-prompt {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 10px 0;
    }
    .success-icon {
      width: 44px;
      height: 44px;
      color: var(--color-secondary);
    }
    .success-prompt h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-text);
    }
    .success-prompt p {
      font-size: 12px;
      color: var(--color-muted);
      line-height: 1.5;
    }

    /* Owner Admin Section */
    .admin-section {
      border-color: rgba(168, 85, 247, 0.15);
      background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(168, 85, 247, 0.01) 100%);
    }
    .admin-header {
      margin-bottom: 20px;
    }
    .admin-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      color: #7c3aed;
      background: #f3e8ff;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .admin-subtitle {
      font-size: 13px;
      color: var(--color-muted);
    }
    
    /* Requests list */
    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .request-card {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      padding: 16px;
      background: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .request-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .applicant-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .applicant-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #7c3aed;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
    }
    .applicant-name {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--color-text);
    }
    .applicant-email {
      font-size: 11px;
      color: var(--color-muted);
    }
    .status-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .status-badge.pendente { background: #fee2e2; color: #ef4444; }
    .status-badge.aprovado { background: #d1fae5; color: var(--color-secondary); }
    .status-badge.rejeitado { background: #e2e8f0; color: #64748b; }
    
    .applicant-motivation {
      font-size: 13px;
      color: var(--color-text);
      line-height: 1.5;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      border-left: 3px solid #cbd5e1;
    }
    .request-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 11px;
      border-radius: 4px;
    }
    .no-requests {
      padding: 20px 0;
      text-align: center;
      font-size: 13.5px;
      color: var(--color-muted);
      font-style: italic;
    }
    .alert {
      padding: 10px 12px;
      font-size: 12px;
      border-radius: var(--border-radius-sm);
      margin-bottom: 12px;
      font-weight: 600;
    }
    .alert-danger {
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fca5a5;
    }
  `]
})
export class ProjetoDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  // Reative States
  protected readonly projeto = signal<Projeto | null>(null);
  protected readonly solicitacoes = signal<SolicitacaoEntrada[]>([]);
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());

  // Workspace signals
  protected readonly isOwner = computed(() => {
    const proj = this.projeto();
    const user = this.currentUser();
    if (!proj || !user) return false;
    return proj.autor === user.nome;
  });

  // Join form signals
  protected motivo = '';
  protected readonly isSending = signal(false);
  protected readonly joinError = signal('');
  protected readonly solicitacaoSucesso = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = parseInt(idStr, 10);
        this.loadProjectDetails(id);
      }
    });
  }

  loadProjectDetails(id: number) {
    this.projectService.obterPorId(id).subscribe({
      next: (proj) => {
        this.projeto.set(proj);
        // Se for o criador do projeto, busca as solicitações vinculadas
        if (this.isOwner()) {
          this.loadSolicitacoes(id);
        }
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  loadSolicitacoes(projetoId: number) {
    this.solicitacaoService.listarPorProjeto(projetoId).subscribe(sols => {
      this.solicitacoes.set(sols);
    });
  }

  enviarSolicitacao() {
    const proj = this.projeto();
    const user = this.currentUser();
    if (!proj || !user) return;

    this.isSending.set(true);
    this.joinError.set('');

    const requestPayload: SolicitacaoEntrada = {
      projetoId: proj.id!,
      usuarioEmail: user.email,
      usuarioNome: user.nome,
      motivo: this.motivo
    };

    this.solicitacaoService.criar(requestPayload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.solicitacaoSucesso.set(true);
        this.motivo = '';
      },
      error: (err) => {
        this.isSending.set(false);
        this.joinError.set(err.error?.message || 'Falha ao enviar a solicitação. Tente novamente.');
      }
    });
  }

  responderSolicitacao(solicitacaoId: number, aprovado: boolean) {
    this.solicitacaoService.responder(solicitacaoId, aprovado).subscribe({
      next: () => {
        const proj = this.projeto();
        if (proj && proj.id) {
          // Recarrega os dados do projeto para atualizar contador de membros e a lista de solicitações
          this.loadProjectDetails(proj.id);
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Ocorreu um erro ao processar a resposta.');
      }
    });
  }

  getTags(): string[] {
    const proj = this.projeto();
    if (!proj || !proj.tags) return [];
    return proj.tags.split(',');
  }
}
