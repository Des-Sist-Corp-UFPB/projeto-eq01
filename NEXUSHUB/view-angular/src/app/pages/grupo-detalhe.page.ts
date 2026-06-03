import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrupoService, Grupo } from '../services/grupo.service';
import { ProjectService, Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { ProjectCardComponent } from '../components/project-card';

export interface Membro {
  nome: string;
  papel: string;
  fotoUrl: string;
}

export interface Vaga {
  id: string;
  cargo: string;
  tipo: string;
  requisitos: string;
  candidatos: string[]; // List of member names who applied
  projetoNome?: string;
}

@Component({
  selector: 'app-grupo-detalhe-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProjectCardComponent],
  template: `
    <div class="groups-detail-container animate-fade-in" *ngIf="grupo()">
      
      <!-- Cover Banner -->
      <div class="detail-banner" [style.background]="(grupo()?.logo && (grupo()?.logo || '').length > 20) ? 'none' : 'linear-gradient(135deg, ' + (grupo()?.cor || '#1e3a8a') + ' 0%, #13a37c 100%)'">
        <img [src]="(grupo()?.logo && (grupo()?.logo || '').length > 20) ? grupo()?.logo : fallbackCover" alt="Banner do grupo" />
        
        <div class="banner-overlay">
          <div class="banner-content">
            <span class="category-badge" [style.background-color]="grupo()?.cor || '#1e3a8a'">
              {{ grupo()?.area || 'Pesquisa' }}
            </span>
            <h1 class="group-banner-title">{{ grupo()?.nome }}</h1>
            <p class="group-banner-subtitle">Coordenado por {{ grupo()?.responsavel }}</p>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="detail-grid">
        
        <!-- Main Column (Left) -->
        <div class="main-info-column">
          
          <!-- About Section -->
          <div class="section-block">
            <div class="section-header-row">
              <h3>Sobre o Grupo</h3>
              <span class="privacy-pill" [class.private]="grupo()?.tipo === 'Restrito'">
                <svg *ngIf="grupo()?.tipo === 'Restrito'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="lock-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                {{ grupo()?.tipo || 'Aberto' }}
              </span>
            </div>
            <p class="description-text">{{ grupo()?.descricao }}</p>
          </div>

          <!-- Stats Dashboard -->
          <div class="stats-dashboard">
            <div class="stat-card">
              <span class="stat-num" [style.color]="grupo()?.cor || '#1e3a8a'">{{ members().length }}</span>
              <span class="stat-label">Membros</span>
            </div>
            <div class="stat-card">
              <span class="stat-num" [style.color]="grupo()?.cor || '#1e3a8a'">{{ groupProjects().length }}</span>
              <span class="stat-label">Projetos Ativos</span>
            </div>
            <div class="stat-card">
              <span class="stat-num" [style.color]="grupo()?.cor || '#1e3a8a'">{{ vagas().length }}</span>
              <span class="stat-label">Vagas Abertas</span>
            </div>
          </div>

          <!-- Join / Leave CTA -->
          <div class="action-card-box">
            <div class="action-info" *ngIf="!isCoordinator()">
              <h4>Gostou do nosso grupo de estudos e pesquisa?</h4>
              <p *ngIf="!isJoinedUser()">Faça parte e colabore em projetos de alto impacto acadêmico e tecnológico.</p>
              <p *ngIf="isJoinedUser()">Você já é um membro deste grupo! Participe dos projetos ou candidate-se a vagas.</p>
            </div>
            <div class="action-info" *ngIf="isCoordinator()">
              <h4>Painel do Coordenador Geral</h4>
              <p>Você gerencia este grupo acadêmico. Pode cadastrar novas oportunidades e visualizar candidatos.</p>
            </div>
            
            <div class="action-button-area">
              <ng-container *ngIf="currentUser(); else loginPrompt">
                <button 
                  *ngIf="!isCoordinator() && !isJoinedUser()"
                  class="action-cta-btn" 
                  [style.background]="grupo()?.cor || '#1e3a8a'"
                  (click)="joinGroup()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="btn-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5L12 14.25L5 7.5" /></svg>
                  Participar do Grupo
                </button>
                
                <button 
                  *ngIf="!isCoordinator() && isJoinedUser()"
                  class="action-cta-btn leave" 
                  (click)="leaveGroup()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="btn-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                  Sair do Grupo
                </button>

                <div *ngIf="isCoordinator()" class="coordinator-actions-wrapper">
                  <div class="coordinator-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="badge-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                    Você coordena este grupo
                  </div>
                  <button 
                    class="action-cta-btn delete-group-btn" 
                    (click)="excluirGrupo()"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="btn-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    Excluir Grupo
                  </button>
                </div>
              </ng-container>
              <ng-template #loginPrompt>
                <button class="action-cta-btn disabled" disabled>
                  Faça login para participar
                </button>
              </ng-template>
            </div>
          </div>

          <!-- Projects Section -->
          <div class="section-block">
            <h3>Projetos do Grupo ({{ groupProjects().length }})</h3>
            <div class="projects-grid" *ngIf="groupProjects().length > 0">
              <div class="proj-card-wrapper" *ngFor="let proj of groupProjects()">
                <app-project-card [projeto]="proj"></app-project-card>
              </div>
            </div>
            <div class="empty-state-box" *ngIf="groupProjects().length === 0">
              <div class="empty-icon">📁</div>
              <p class="empty-list-text">Nenhum projeto ativo associado a este grupo ainda.</p>
            </div>
          </div>

          <!-- Opportunities / Vacancies Wall -->
          <div class="section-block">
            <div class="section-header-row">
              <h3>Mural de Vagas e Oportunidades</h3>
              <button 
                *ngIf="isProjectCreator()" 
                class="btn-toggle-vaga"
                [style.border-color]="grupo()?.cor || '#1e3a8a'"
                [style.color]="grupo()?.cor || '#1e3a8a'"
                (click)="showAddVagaForm.set(!showAddVagaForm())"
              >
                {{ showAddVagaForm() ? 'Fechar Form' : 'Adicionar Vaga' }}
              </button>
            </div>

            <!-- Create Vacancy Form (Project Creators only) -->
            <div class="create-vaga-form animate-scale-up" *ngIf="isProjectCreator() && showAddVagaForm()">
              <h4>Nova Oportunidade no Grupo</h4>
              <div class="form-row">
                <div class="form-group-item">
                  <label for="vaga-cargo">Cargo / Função *</label>
                  <input type="text" id="vaga-cargo" placeholder="Ex: Desenvolvedor Front-end Angular" [(ngModel)]="novaVagaCargo" />
                </div>
                <div class="form-group-item">
                  <label for="vaga-tipo">Tipo de Contrato</label>
                  <select id="vaga-tipo" [(ngModel)]="novaVagaTipo">
                    <option value="Bolsista">Bolsista</option>
                    <option value="Voluntário">Voluntário</option>
                    <option value="Estagiário">Estagiário</option>
                    <option value="CLT">CLT / CLT Flex</option>
                  </select>
                </div>
              </div>
              <div class="form-row" style="margin-top: 10px;">
                <div class="form-group-item" style="width: 100%;">
                  <label for="vaga-projeto">Projeto Associado *</label>
                  <select id="vaga-projeto" [(ngModel)]="novaVagaProjeto">
                    <option value="">-- Selecione um projeto seu --</option>
                    <option *ngFor="let p of myProjectsInGroup()" [value]="p.nome">{{ p.nome }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group-item" style="margin-top: 10px;">
                <label for="vaga-req">Requisitos e Descrição *</label>
                <textarea id="vaga-req" rows="3" placeholder="Requisitos da vaga, benefícios e prazos..." [(ngModel)]="novaVagaRequisitos"></textarea>
              </div>
              <button class="btn-submit-vaga" [style.background]="grupo()?.cor || '#1e3a8a'" (click)="adicionarVaga()">
                Publicar Oportunidade
              </button>
            </div>

            <!-- Vacancies List -->
            <div class="vagas-list-container" *ngIf="vagas().length > 0">
              <div class="vaga-card" *ngFor="let vaga of vagas()">
                <div class="vaga-header">
                  <div class="vaga-title-row">
                    <h5>{{ vaga.cargo }}</h5>
                    <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
                      <span class="vaga-type-pill">{{ vaga.tipo }}</span>
                      <span class="vaga-proj-badge" *ngIf="vaga.projetoNome" [style.border-color]="grupo()?.cor || '#1e3a8a'" [style.color]="grupo()?.cor || '#1e3a8a'">
                        📁 Projeto: {{ vaga.projetoNome }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Candidate Button -->
                  <div class="vaga-action-side" *ngIf="currentUser() && !isVagaOwner(vaga)">
                    <button 
                      class="btn-candidate" 
                      [class.applied]="hasApplied(vaga)" 
                      (click)="toggleCandidatura(vaga.id)"
                    >
                      {{ hasApplied(vaga) ? 'Candidatado ✓' : 'Candidatar-se' }}
                    </button>
                  </div>
                </div>
                
                <p class="vaga-requirements-desc">{{ vaga.requisitos }}</p>

                <!-- Project Owner-only Applicant View -->
                <div class="vaga-candidates-coordinator" *ngIf="isVagaOwner(vaga)">
                  <div class="candidates-header-row">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="cand-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                    <span>Candidatos Inscritos ({{ vaga.candidatos.length }})</span>
                  </div>
                  <div class="candidates-names-list" *ngIf="vaga.candidatos.length > 0">
                    <span class="cand-name-pill" *ngFor="let cand of vaga.candidatos">{{ cand }}</span>
                  </div>
                  <p class="no-cand-text" *ngIf="vaga.candidatos.length === 0">Nenhum candidato inscrito ainda.</p>
                </div>
              </div>
            </div>

            <div class="empty-state-box" *ngIf="vagas().length === 0">
              <div class="empty-icon">📢</div>
              <p class="empty-list-text">Não há vagas abertas neste grupo no momento.</p>
            </div>
          </div>

        </div>

        <!-- Sidebar Column (Right) -->
        <aside class="sidebar-column">
          <h3>Membros do Grupo ({{ members().length }})</h3>
          
          <div class="members-list-container">
            <!-- Members Loop -->
            <div 
              class="sidebar-user" 
              *ngFor="let mb of members()"
              [class.coordinator]="isMembroCoordenador(mb.nome)"
            >
              <div class="avatar-wrapper">
                <img [src]="isMembroCoordenador(mb.nome) && grupo()?.logo && (grupo()?.logo || '').length > 20 ? grupo()?.logo : mb.fotoUrl" alt="Foto do Membro" class="avatar-photo" />
                <span class="crown-badge" *ngIf="isMembroCoordenador(mb.nome)">👑</span>
              </div>
              
              <div class="user-text-info">
                <span class="u-name">{{ mb.nome }}</span>
                <span class="u-role">{{ mb.papel }}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  `,
  styles: [`
    .groups-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    /* Cover Banner */
    .detail-banner {
      position: relative;
      height: 320px;
      width: 100%;
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .detail-banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%);
      display: flex;
      align-items: flex-end;
      padding: 32px;
    }
    .banner-content {
      color: white;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 20px 24px;
      border-radius: var(--border-radius-md);
      border: 1px solid rgba(255, 255, 255, 0.15);
      max-width: 600px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .category-badge {
      align-self: flex-start;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .group-banner-title {
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .group-banner-subtitle {
      font-size: 15px;
      margin: 0;
      opacity: 0.9;
    }

    /* Layout Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: 1.35fr 0.65fr;
      gap: 40px;
    }
    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    .main-info-column {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-top: 1px solid var(--color-border);
      padding-top: 24px;
    }
    .section-block:first-of-type {
      border-top: none;
      padding-top: 0;
    }
    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .section-block h3 {
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
      letter-spacing: -0.3px;
    }
    .privacy-pill {
      font-size: 11px;
      font-weight: 700;
      color: #10b981;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .privacy-pill.private {
      color: #ef4444;
      background: #fef2f2;
    }
    .lock-icon {
      width: 12px;
      height: 12px;
    }
    .description-text {
      font-size: 15px;
      color: var(--color-muted);
      line-height: 1.6;
      margin: 0;
    }

    /* Stats Dashboard */
    .stats-dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      padding: 24px;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-border);
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
    }
    .stat-num {
      font-size: 28px;
      font-weight: 800;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Action Box */
    .action-card-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      background: #f1f5f9;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 24px;
    }
    @media (max-width: 600px) {
      .action-card-box {
        flex-direction: column;
        align-items: stretch;
      }
    }
    .action-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .action-info h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
    }
    .action-info p {
      font-size: 13px;
      color: var(--color-muted);
      margin: 0;
    }
    .action-button-area {
      flex-shrink: 0;
    }
    .action-cta-btn {
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      padding: 12px 24px;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: var(--transition);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .action-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15);
      filter: brightness(1.1);
    }
    .action-cta-btn.leave {
      background: #ef4444;
    }
    .action-cta-btn.disabled {
      background: #cbd5e1;
      color: #94a3b8;
      cursor: not-allowed;
      box-shadow: none;
    }
    .btn-icon {
      width: 16px;
      height: 16px;
    }
    .coordinator-badge {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-size: 12.5px;
      padding: 10px 16px;
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #bae6fd;
    }
    .coordinator-actions-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .delete-group-btn {
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fca5a5;
      justify-content: center;
    }
    .delete-group-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
    .badge-icon {
      width: 18px;
      height: 18px;
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 600px) {
      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
    .proj-card-wrapper {
      height: 100%;
    }

    /* Vacancies Wall */
    .btn-toggle-vaga {
      background: white;
      border: 1px solid;
      border-radius: var(--border-radius-sm);
      padding: 6px 14px;
      font-weight: 700;
      font-size: 12.5px;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-toggle-vaga:hover {
      background: #f8fafc;
      transform: translateY(-1px);
    }

    /* Add Vacancy Form */
    .create-vaga-form {
      background: #f8fafc;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 8px;
    }
    .create-vaga-form h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
    }
    .form-group-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group-item label {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text);
    }
    .form-group-item input, .form-group-item select, .form-group-item textarea {
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 13px;
      outline: none;
      background: white;
      transition: var(--transition);
    }
    .form-group-item input:focus, .form-group-item select:focus, .form-group-item textarea:focus {
      border-color: var(--color-primary);
    }
    .btn-submit-vaga {
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      padding: 11px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-submit-vaga:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    /* Vacancies List */
    .vagas-list-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .vaga-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      transition: var(--transition);
    }
    .vaga-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: #cbd5e1;
    }
    .vaga-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .vaga-title-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .vaga-title-row h5 {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }
    .vaga-type-pill {
      align-self: flex-start;
      background: #fef3c7;
      color: #d97706;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vaga-proj-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid;
      background: rgba(255, 255, 255, 0.7);
    }
    .vaga-requirements-desc {
      font-size: 13.5px;
      color: var(--color-muted);
      line-height: 1.5;
      margin: 0;
    }
    .btn-candidate {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-candidate:hover {
      background: #dbeafe;
      border-color: #3b82f6;
    }
    .btn-candidate.applied {
      background: #ecfdf5;
      color: #059669;
      border-color: #a7f3d0;
    }
    .btn-candidate.applied:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
      content: 'Cancelar';
    }

    /* Candidates Coordinator View */
    .vaga-candidates-coordinator {
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .candidates-header-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-muted);
    }
    .cand-icon {
      width: 14px;
      height: 14px;
    }
    .candidates-names-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cand-name-pill {
      background: #f1f5f9;
      color: var(--color-text);
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
    }
    .no-cand-text {
      font-size: 11px;
      color: var(--color-muted);
      font-style: italic;
      margin: 0;
    }

    /* Empty State Box */
    .empty-state-box {
      background: #f8fafc;
      border: 1px dashed var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 32px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .empty-icon {
      font-size: 24px;
    }
    .empty-list-text {
      font-size: 13.5px;
      color: var(--color-muted);
      margin: 0;
    }

    /* Sidebar Members column styling */
    .sidebar-column {
      background: #f8fafc;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-self: flex-start;
      width: 100%;
      box-sizing: border-box;
    }
    .sidebar-column h3 {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 12px;
    }
    .members-list-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px;
      border-radius: var(--border-radius-sm);
      transition: var(--transition);
    }
    .sidebar-user:hover {
      background: white;
    }
    .sidebar-user.coordinator {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 10px;
    }
    .avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }
    .avatar-photo {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
      box-shadow: var(--shadow-sm);
    }
    .sidebar-user.coordinator .avatar-photo {
      border-color: #22c55e;
      width: 46px;
      height: 46px;
    }
    .crown-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      font-size: 12px;
      background: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
    .user-text-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .user-text-info .u-name {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--color-text);
    }
    .user-text-info .u-role {
      font-size: 10.5px;
      color: var(--color-muted);
    }
  `]
})
export class GrupoDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly grupoService = inject(GrupoService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Fallback cover image
  protected readonly fallbackCover = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200';

  // Signals
  protected readonly grupo = signal<Grupo | null>(null);
  protected readonly groupProjects = signal<Projeto[]>([]);
  
  // Custom interactive state signals
  protected readonly members = signal<Membro[]>([]);
  protected readonly vagas = signal<Vaga[]>([]);
  
  // Add vacancy form inputs
  protected readonly showAddVagaForm = signal<boolean>(false);
  protected novaVagaCargo = '';
  protected novaVagaTipo = 'Bolsista';
  protected novaVagaRequisitos = '';
  protected novaVagaProjeto = '';

  // Logged in user session
  protected readonly currentUser = this.authService.currentUser;

  protected readonly myProjectsInGroup = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.groupProjects().filter(p => p.autor && p.autor.trim().toLowerCase() === user.nome.trim().toLowerCase());
  });

  // Mock list of member candidates default avatars
  private readonly mockAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.grupoService.obterPorId(id).subscribe({
        next: (gp) => {
          this.grupo.set(gp);
          this.loadProjects(gp.nome);
          this.loadMembersAndVagas(id, gp.responsavel);
        },
        error: (err) => {
          console.error('Erro ao buscar grupo por ID. Usando dados Mock para testes.', err);
          // Fallback mock group for instant preview & testing
          const mockGp: Grupo = {
            id: id,
            nome: `Grupo Acadêmico Mock ${id}`,
            descricao: 'Este é um grupo de estudos e projetos criado localmente. Aqui, alunos e pesquisadores colaboram no desenvolvimento de soluções de software e artigos científicos aplicados.',
            area: 'Institucional',
            responsavel: 'Gabriel Costa',
            tipo: 'Aberto',
            cor: '#1f7ae0',
            logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'
          };
          this.grupo.set(mockGp);
          this.loadProjects(mockGp.nome);
          this.loadMembersAndVagas(id, mockGp.responsavel);
        }
      });
    }
  }

  loadProjects(grupoNome: string) {
    this.projectService.listar().subscribe(projs => {
      const filtered = projs.filter(p => 
        p.grupoPertencente && p.grupoPertencente.trim().toLowerCase() === grupoNome.trim().toLowerCase()
      );
      this.groupProjects.set(filtered);
    });
  }

  loadMembersAndVagas(grupoId: number, responsavel?: string) {
    // 1. Members
    const cachedMembers = localStorage.getItem(`nexushub_group_members_${grupoId}`);
    let parsedMembers: Membro[] = cachedMembers ? JSON.parse(cachedMembers) : [];
    
    if (responsavel) {
      const coordIndex = parsedMembers.findIndex(m => m.papel === 'Coordenador Geral');
      if (coordIndex > -1) {
        if (parsedMembers[coordIndex].nome !== responsavel) {
          parsedMembers[coordIndex].nome = responsavel;
          localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(parsedMembers));
        }
      } else if (cachedMembers) {
        parsedMembers.unshift({
          nome: responsavel,
          papel: 'Coordenador Geral',
          fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        });
        localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(parsedMembers));
      }
    }

    if (parsedMembers.length > 0) {
      this.members.set(parsedMembers);
    } else {
      // Default members list
      const defaultMembers: Membro[] = [];
      if (responsavel) {
        defaultMembers.push({
          nome: responsavel,
          papel: 'Coordenador Geral',
          fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        });
      }
      
      // Default mocks
      defaultMembers.push(
        { nome: 'Ana Costa', papel: 'Pesquisadora Auxiliar', fotoUrl: this.mockAvatars[0] },
        { nome: 'Bruno Lima', papel: 'Desenvolvedor Angular', fotoUrl: this.mockAvatars[1] },
        { nome: 'Carla Dias', papel: 'Designer UI/UX', fotoUrl: this.mockAvatars[2] }
      );
      
      localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(defaultMembers));
      this.members.set(defaultMembers);
    }

    // 2. Vacancies (Vagas)
    const cachedVagas = localStorage.getItem(`nexushub_group_vacancies_${grupoId}`);
    if (cachedVagas) {
      this.vagas.set(JSON.parse(cachedVagas));
    } else {
      const defaultVagas: Vaga[] = [
        {
          id: `vaga_${grupoId}_1`,
          cargo: 'Desenvolvedor Frontend Angular',
          tipo: 'Bolsista',
          requisitos: 'Experiência prévia com desenvolvimento Web (HTML/CSS), TypeScript e interesse em aprender Angular + RxJS.',
          candidatos: ['Carla Dias'],
          projetoNome: grupoId === 1 ? 'Mapa de Projetos Academicos' : undefined
        },
        {
          id: `vaga_${grupoId}_2`,
          cargo: 'Pesquisador em Machine Learning',
          tipo: 'Voluntário',
          requisitos: 'Conhecimentos intermediários de Python, bibliotecas como NumPy/Pandas e lógica de modelagem de dados.',
          candidatos: [],
          projetoNome: grupoId === 1 ? 'Plataforma de IA para Diagnostico' : (grupoId === 6 ? 'Phoebus' : undefined)
        }
      ];
      localStorage.setItem(`nexushub_group_vacancies_${grupoId}`, JSON.stringify(defaultVagas));
      this.vagas.set(defaultVagas);
    }
  }

  isCoordinator(): boolean {
    const user = this.currentUser();
    const gp = this.grupo();
    if (!user || !gp) return false;
    return gp.responsavel ? user.nome.trim().toLowerCase() === gp.responsavel.trim().toLowerCase() : false;
  }

  isMembroCoordenador(membroNome: string): boolean {
    const gp = this.grupo();
    if (!gp || !gp.responsavel) return false;
    return membroNome.trim().toLowerCase() === gp.responsavel.trim().toLowerCase();
  }

  isJoinedUser(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return this.members().some(m => m.nome.trim().toLowerCase() === user.nome.trim().toLowerCase());
  }

  joinGroup() {
    const user = this.currentUser();
    if (!user) return;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || this.isJoinedUser()) return;

    const novoMembro: Membro = {
      nome: user.nome,
      papel: 'Membro Colaborador',
      fotoUrl: this.mockAvatars[Math.floor(Math.random() * this.mockAvatars.length)]
    };

    this.members.update(list => {
      const updated = [...list, novoMembro];
      localStorage.setItem(`nexushub_group_members_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  leaveGroup() {
    const user = this.currentUser();
    if (!user) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    if (this.isMembroCoordenador(user.nome)) {
      alert('O Coordenador Geral não pode sair do grupo.');
      return;
    }

    this.members.update(list => {
      const updated = list.filter(m => m.nome.trim().toLowerCase() !== user.nome.trim().toLowerCase());
      localStorage.setItem(`nexushub_group_members_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  isProjectCreator(): boolean {
    return this.myProjectsInGroup().length > 0;
  }

  isVagaOwner(vaga: Vaga): boolean {
    const user = this.currentUser();
    if (!user || !vaga.projetoNome) return false;
    const proj = this.groupProjects().find(p => p.nome.trim().toLowerCase() === vaga.projetoNome?.trim().toLowerCase());
    return proj ? proj.autor?.trim().toLowerCase() === user.nome.trim().toLowerCase() : false;
  }

  adicionarVaga() {
    if (!this.novaVagaCargo.trim() || !this.novaVagaRequisitos.trim() || !this.novaVagaProjeto) {
      alert('Por favor, preencha o cargo, os requisitos e selecione o projeto associado.');
      return;
    }
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    const nova: Vaga = {
      id: `vaga_${id}_${Date.now()}`,
      cargo: this.novaVagaCargo,
      tipo: this.novaVagaTipo,
      requisitos: this.novaVagaRequisitos,
      candidatos: [],
      projetoNome: this.novaVagaProjeto
    };

    this.vagas.update(list => {
      const updated = [...list, nova];
      localStorage.setItem(`nexushub_group_vacancies_${id}`, JSON.stringify(updated));
      return updated;
    });

    // Reset form
    this.novaVagaCargo = '';
    this.novaVagaRequisitos = '';
    this.novaVagaProjeto = '';
    this.showAddVagaForm.set(false);
  }

  hasApplied(vaga: Vaga): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return vaga.candidatos.includes(user.nome);
  }

  toggleCandidatura(vagaId: string) {
    const user = this.currentUser();
    if (!user) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.vagas.update(list => {
      const updated = list.map(v => {
        if (v.id === vagaId) {
          const jaCandidato = v.candidatos.includes(user.nome);
          const novosCandidatos = jaCandidato 
            ? v.candidatos.filter(c => c !== user.nome)
            : [...v.candidatos, user.nome];
          return { ...v, candidatos: novosCandidatos };
        }
        return v;
      });
      localStorage.setItem(`nexushub_group_vacancies_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  excluirGrupo() {
    const gp = this.grupo();
    if (!gp || !gp.id) return;
    
    if (confirm(`Tem certeza absoluta de que deseja excluir o grupo "${gp.nome}" permanentemente? Todos os dados associados serão perdidos.`)) {
      this.grupoService.deletar(gp.id).subscribe({
        next: () => {
          localStorage.removeItem(`nexushub_group_members_${gp.id}`);
          localStorage.removeItem(`nexushub_group_vacancies_${gp.id}`);
          alert('Grupo excluído com sucesso!');
          this.router.navigate(['/grupos']);
        },
        error: (err) => {
          console.error('Erro ao excluir grupo', err);
          alert('Falha ao excluir o grupo. Verifique se o backend está ativo!');
        }
      });
    }
  }
}
