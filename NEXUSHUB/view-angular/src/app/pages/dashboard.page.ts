import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService, Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { CarouselComponent } from '../components/carousel';
import { NewProjectModalComponent } from '../components/new-project-modal';
import { ProjectCardComponent } from '../components/project-card';
import { GrupoService, Grupo } from '../services/grupo.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CarouselComponent, NewProjectModalComponent, ProjectCardComponent],
  template: `
    <div class="animate-fade-in">
      
      <!-- 1. TELA INICIAL PÚBLICA (LANDING PAGE - UNAUTH) -->
      <div *ngIf="!isLoggedIn()" class="landing-wrapper">
        <!-- Hero Central -->
        <section class="landing-hero animate-fade-in">
          <div class="landing-hero-content">
            <!-- Official SVG Logo in Landing Page -->
            <div class="landing-logo-container" style="margin-bottom: 24px;">
              <svg class="landing-logo-svg" viewBox="0 0 100 100" width="160" height="160" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block;">
                <circle cx="50" cy="50" r="14" fill="#3B6EF4" />
                <circle cx="50" cy="18" r="5.5" fill="#0B1D3A" />
                <circle cx="72.6" cy="27.4" r="5.5" fill="#0B1D3A" />
                <circle cx="82" cy="50" r="5.5" fill="#0B1D3A" />
                <circle cx="72.6" cy="72.6" r="5.5" fill="#0B1D3A" />
                <circle cx="50" cy="82" r="5.5" fill="#0B1D3A" />
                <circle cx="27.4" cy="72.6" r="5.5" fill="#0B1D3A" />
                <circle cx="18" cy="50" r="5.5" fill="#0B1D3A" />
                <circle cx="27.4" cy="27.4" r="5.5" fill="#0B1D3A" />
              </svg>
            </div>
            <span class="landing-badge">Conexão &amp; Reconhecimento Acadêmico</span>
            <h1>NEXUS<span>HUB</span></h1>
            <h2>O Ponto de Encontro da Vida Acadêmica na UFPB</h2>
            <p class="landing-lead">
              Centralize projetos de pesquisa, extensão, mural de oportunidades e monitorias em um único ecossistema digital. Conecte-se com alunos e professores, colabore ativamente e ganhe experiência (XP) e conquistas reconhecidas!
            </p>
            <div class="landing-ctas">
              <button class="btn btn-primary btn-lg" routerLink="/cadastro">Começar Minha Jornada</button>
              <button class="btn btn-secondary btn-lg" routerLink="/login">Entrar na Plataforma</button>
            </div>
          </div>
        </section>

        <!-- Propósito e Funcionalidades Principais -->
        <section class="landing-features">
          <div class="section-title-center">
            <h3>Por que usar o NexusHub?</h3>
            <p>Conectamos o ecossistema universitário de forma simples, transparente e gamificada.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon projects-icon">📁</div>
              <h4>Catálogo de Projetos</h4>
              <p>Explore as iniciativas de pesquisa, desenvolvimento e extensão da sua faculdade. Solicite entrada diretamente nas equipes ativas.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon opportunities-icon">📢</div>
              <h4>Mural de Oportunidades</h4>
              <p>Encontre vagas de bolsas de monitoria, estágios, eventos acadêmicos e projetos de extensão voluntários cadastrados no campus.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon gamification-icon">🏆</div>
              <h4>Reconhecimento &amp; Gamificação</h4>
              <p>Ganhe pontos de experiência (XP) por participação em projetos aprovados, conquiste distintivos (badges) e suba no ranking!</p>
            </div>
          </div>
        </section>

        <!-- Como Funciona -->
        <section class="landing-how-it-works">
          <div class="section-title-center">
            <h3>Como Funciona a Plataforma</h3>
            <p>Três passos simples para acelerar seu engajamento acadêmico.</p>
          </div>

          <div class="steps-flow">
            <div class="step-item">
              <span class="step-number">1</span>
              <h5>Crie seu Perfil Acadêmico</h5>
              <p>Cadastre-se com seu e-mail acadêmico, insira suas áreas de interesse e selecione seu cargo (estudante ou professor).</p>
            </div>
            <div class="step-arrow">➜</div>
            <div class="step-item">
              <span class="step-number">2</span>
              <h5>Participe ou Cadastre Projetos</h5>
              <p>Crie o perfil do seu projeto vinculado a um grupo do campus, ou envie uma solicitação para participar de um time existente.</p>
            </div>
            <div class="step-arrow">➜</div>
            <div class="step-item">
              <span class="step-number">3</span>
              <h5>Ganhe Pontos de Experiência</h5>
              <p>Ao realizar contribuições, participar de eventos e concluir atividades, você recebe pontos de XP e evolui seu nível acadêmico.</p>
            </div>
          </div>
        </section>

        <!-- Call to Action Final -->
        <section class="landing-cta-bottom">
          <div class="cta-bottom-card">
            <h3>Pronto para conectar sua trajetória acadêmica?</h3>
            <p>Junte-se a centenas de estudantes e professores da UFPB no NexusHub.</p>
            <button class="btn btn-primary btn-lg" routerLink="/cadastro">Criar Conta Gratuita</button>
          </div>
        </section>
      </div>

      <!-- 2. PAINEL AUTENTICADO (DASHBOARD - AUTH) -->
      <div *ngIf="isLoggedIn()">
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
              <p class="hero-eyebrow">Olá, {{ currentUser()?.nome }}! A vida acadêmica em movimento</p>
              <h2>Explore e divulgue iniciativas da sua universidade</h2>
              <p class="hero-desc">
                Participe de grupos de pesquisa, projetos de extensão, monitorias e desafios da comunidade. Transforme sua jornada acadêmica e ganhe reconhecimento!
              </p>
              
              <div class="project-actions-row">
                <div class="search-container">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="search-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Buscar projetos por nome, resumo, tags ou autor..." 
                    [ngModel]="searchQuery()" 
                    (ngModelChange)="searchQuery.set($event)"
                    class="search-input"
                  />
                </div>
                
                <button class="btn-create-proj" (click)="openCreateModal()" *ngIf="isLoggedIn()">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="plus-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Criar Novo Projeto
                </button>
              </div>
            </div>
          </section>

          <!-- Main Content Area -->
          <main class="main-content">
            <!-- Gamification Dashboard Widget (Bento Box style) -->
            <section class="gamification-widget animate-fade-in" style="margin-bottom: 40px;">
              <div class="gamification-grid">
                
                <!-- Box 1: XP Progress Bar -->
                <div class="bento-box xp-box">
                  <div class="bento-header">
                    <span class="bento-icon">⚡</span>
                    <h4>Progresso de Nível</h4>
                  </div>
                  <div class="bento-body">
                    <div class="level-badge">Nível 4</div>
                    <div class="xp-details">
                      <span class="xp-count">750 / 1000 XP</span>
                      <span class="xp-remaining">Faltam 250 XP para o Nível 5</span>
                    </div>
                    <div class="xp-progress-bar-container">
                      <div class="xp-progress-bar-fill" style="width: 75%;"></div>
                    </div>
                  </div>
                </div>

                <!-- Box 2: Weekly Missions -->
                <div class="bento-box missions-box">
                  <div class="bento-header">
                    <span class="bento-icon">🎯</span>
                    <h4>Missões da Semana</h4>
                  </div>
                  <div class="bento-body">
                    <div class="missions-counter">3 / 5</div>
                    <div class="missions-details">
                      <span class="missions-status">Você concluiu 3 missões nesta semana</span>
                    </div>
                    <div class="missions-progress-bar-container">
                      <div class="missions-progress-bar-fill" style="width: 60%;"></div>
                    </div>
                  </div>
                </div>

                <!-- Box 3: Weekly Ranking Position -->
                <div class="bento-box ranking-box">
                  <div class="bento-header">
                    <span class="bento-icon">🏆</span>
                    <h4>Ranking Geral Semanal</h4>
                  </div>
                  <div class="bento-body">
                    <div class="ranking-position">#4º</div>
                    <div class="ranking-details">
                      <span class="ranking-meta">Colocado na classificação semanal da UFPB</span>
                      <span class="ranking-trending">🔥 Subindo 2 posições esta semana</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <div class="carousels-dashboard">
              
              <!-- 1. Projetos que você Participa -->
              <section class="carousel-section">
                <div class="section-header">
                  <span class="section-tag journey">Sua Jornada</span>
                  <h2 class="section-title">Projetos que você Participa</h2>
                  <p class="section-subtitle">Olá <strong>{{ currentUser()?.nome }}</strong>, acompanhe os projetos em que você está participando ou colaborando.</p>
                </div>
                <app-carousel [items]="myProjects()"></app-carousel>
              </section>

              <!-- 2. Grupos que você Participa -->
              <section class="carousel-section">
                <div class="section-header">
                  <span class="section-tag colab">Seus Grupos</span>
                  <h2 class="section-title">Grupos que você Participa</h2>
                  <p class="section-subtitle">Laboratórios, núcleos e comunidades dos quais você faz parte.</p>
                </div>
                
                <div class="custom-group-carousel">
                  <div class="carousel-track">
                    <article class="group-bento-card" *ngFor="let gp of myGroups()" [routerLink]="['/grupos', gp.id]" style="cursor: pointer;">
                      <div class="card-cover">
                        <img [src]="(gp.logo && gp.logo.length > 20) ? gp.logo : fallbackCover" alt="Capa do grupo" />
                        <div class="card-badge">{{ gp.tipo || 'Aberto' }}</div>
                      </div>
                      <div class="card-content">
                        <div class="card-meta">
                          <span class="group-name">GRUPO {{ gp.area | uppercase }}</span>
                          <button class="like-button" [class.liked]="isGroupFavorited(gp.id)" (click)="toggleFavoriteGroup(gp, $event)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                          </button>
                        </div>
                        <h3 class="project-title">{{ gp.nome }}</h3>
                        <p class="project-summary">{{ gp.descricao }}</p>
                        <div class="tags-container">
                          <span class="tag-badge">#{{ gp.area }}</span>
                        </div>
                      </div>
                    </article>
                    <div class="empty-state-box" *ngIf="myGroups().length === 0">
                      <p>Você não participa de nenhum grupo ainda. Vá na aba Grupos e junte-se a uma equipe!</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 3. Projetos Favoritados -->
              <section class="carousel-section">
                <div class="section-header">
                  <span class="section-tag hot">Seus Favoritos</span>
                  <h2 class="section-title">Projetos Favoritados</h2>
                  <p class="section-subtitle">Projetos acadêmicos que você marcou com gostei para acompanhar de perto.</p>
                </div>
                <app-carousel [items]="favProjects()"></app-carousel>
              </section>

              <!-- 4. Grupos Favoritados -->
              <section class="carousel-section">
                <div class="section-header">
                  <span class="section-tag categories">Favoritos da Comunidade</span>
                  <h2 class="section-title">Grupos Favoritados</h2>
                  <p class="section-subtitle">Laboratórios, núcleos e comunidades que você favoritou.</p>
                </div>
                
                <div class="custom-group-carousel">
                  <div class="carousel-track">
                    <article class="group-bento-card" *ngFor="let gp of favGroups()" [routerLink]="['/grupos', gp.id]" style="cursor: pointer;">
                      <div class="card-cover">
                        <img [src]="(gp.logo && gp.logo.length > 20) ? gp.logo : fallbackCover" alt="Capa do grupo" />
                        <div class="card-badge">{{ gp.tipo || 'Aberto' }}</div>
                      </div>
                      <div class="card-content">
                        <div class="card-meta">
                          <span class="group-name">GRUPO {{ gp.area | uppercase }}</span>
                          <button class="like-button liked" (click)="toggleFavoriteGroup(gp, $event)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                          </button>
                        </div>
                        <h3 class="project-title">{{ gp.nome }}</h3>
                        <p class="project-summary">{{ gp.descricao }}</p>
                        <div class="tags-container">
                          <span class="tag-badge">#{{ gp.area }}</span>
                        </div>
                      </div>
                    </article>
                    <div class="empty-state-box" *ngIf="favGroups().length === 0">
                      <p>Você não favoritou nenhum grupo ainda. Vá na aba Grupos e curta seus favoritos!</p>
                    </div>
                  </div>
                </div>
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
      font-size: 16px;
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
    .project-actions-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .search-container {
      position: relative;
      flex-grow: 1;
      max-width: 500px;
      min-width: 280px;
    }
    .search-icon {
      width: 18px;
      height: 18px;
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted);
    }
    .search-input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-size: 14px;
      outline: none;
      transition: var(--transition);
      background: white;
    }
    .search-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.1);
    }
    .btn-create-proj {
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      padding: 12px 24px;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-create-proj:hover {
      background: #1765c2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(31, 122, 224, 0.2);
    }
    .plus-icon {
      width: 16px;
      height: 16px;
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

    /* Landing Page Styles */
    .landing-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 24px 80px;
      display: flex;
      flex-direction: column;
      gap: 56px;
    }
    .landing-logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }
    .landing-logo-svg {
      transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .landing-logo-svg:hover {
      transform: rotate(360deg) scale(1.1);
    }
    .landing-hero {
      background: radial-gradient(circle at 10% 20%, rgba(31, 122, 224, 0.08) 0%, rgba(19, 163, 124, 0.04) 90%), radial-gradient(circle at 90% 80%, rgba(245, 184, 46, 0.05) 0%, transparent 50%);
      border: 1px solid rgba(223, 230, 240, 0.7);
      border-radius: var(--border-radius-lg);
      padding: 80px 48px;
      text-align: center;
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: center;
    }
    .landing-hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    .landing-badge {
      display: inline-block;
      background: rgba(31, 122, 224, 0.08);
      color: var(--color-primary);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 12.5px;
      font-weight: 700;
      margin-bottom: 24px;
      border: 1px solid rgba(31, 122, 224, 0.15);
      letter-spacing: 0.2px;
    }
    .landing-hero h1 {
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -2px;
      line-height: 1.1;
      margin-bottom: 8px;
      color: var(--color-text);
    }
    .landing-hero h1 span {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }
    .landing-hero h2 {
      font-size: 24px;
      color: var(--color-text);
      opacity: 0.85;
      font-weight: 600;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
    }
    .landing-lead {
      font-size: 16px;
      color: var(--color-muted);
      margin-bottom: 40px;
      line-height: 1.7;
    }
    .landing-ctas {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-lg {
      padding: 14px 32px;
      font-size: 15px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }
    .landing-features {
      padding: 24px 0;
    }
    .section-title-center {
      text-align: center;
      margin-bottom: 48px;
    }
    .section-title-center h3 {
      font-size: 32px;
      letter-spacing: -0.8px;
      margin-bottom: 12px;
    }
    .section-title-center p {
      color: var(--color-muted);
      font-size: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
    }
    .feature-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: 40px 32px;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: rgba(31, 122, 224, 0.35);
    }
    .feature-icon {
      font-size: 30px;
      width: 64px;
      height: 64px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .projects-icon {
      background: rgba(31, 122, 224, 0.08);
      color: var(--color-primary);
    }
    .opportunities-icon {
      background: rgba(19, 163, 124, 0.08);
      color: var(--color-secondary);
    }
    .gamification-icon {
      background: rgba(245, 184, 46, 0.08);
      color: var(--color-accent);
    }
    .feature-card h4 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    .feature-card p {
      color: var(--color-muted);
      font-size: 14.5px;
      line-height: 1.6;
    }
    .landing-how-it-works {
      padding: 24px 0;
    }
    .steps-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 56px;
    }
    .step-item {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: 32px 24px;
      text-align: center;
      position: relative;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .step-item:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: rgba(19, 163, 124, 0.25);
    }
    .step-number {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: -54px auto 20px;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(31, 122, 224, 0.3);
    }
    .step-arrow {
      font-size: 28px;
      color: var(--color-primary);
      opacity: 0.4;
      flex-shrink: 0;
      user-select: none;
    }
    .step-item h5 {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    .step-item p {
      color: var(--color-muted);
      font-size: 14px;
      line-height: 1.6;
    }
    .landing-cta-bottom {
      padding: 24px 0 40px;
    }
    .cta-bottom-card {
      background: linear-gradient(135deg, rgba(31, 122, 224, 0.05) 0%, rgba(19, 163, 124, 0.05) 100%), radial-gradient(circle at top right, rgba(245, 184, 46, 0.05) 0%, transparent 60%);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: 64px 32px;
      text-align: center;
      box-shadow: var(--shadow-md);
    }
    .cta-bottom-card h3 {
      font-size: 32px;
      letter-spacing: -0.8px;
      margin-bottom: 16px;
    }
    .cta-bottom-card p {
      color: var(--color-muted);
      margin-bottom: 32px;
      font-size: 16px;
    }

    @media (max-width: 992px) {
      .steps-flow {
        flex-direction: column;
        gap: 40px;
      }
      .step-arrow {
        transform: rotate(90deg);
      }
    }

    @media (max-width: 576px) {
      .landing-hero {
        padding: 48px 24px;
      }
      .landing-hero h1 {
        font-size: 44px;
      }
      .landing-hero h2 {
        font-size: 18px;
      }
      .cta-bottom-card {
        padding: 40px 20px;
      }
      .cta-bottom-card h3 {
        font-size: 24px;
      }
    }

    /* Custom Group Carousels on Dashboard */
    .custom-group-carousel {
      width: 100%;
      margin: 16px 0 32px;
    }
    .custom-group-carousel .carousel-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding: 10px 4px;
      scrollbar-width: none;
    }
    .custom-group-carousel .carousel-track::-webkit-scrollbar {
      display: none;
    }
    .group-bento-card {
      flex: 0 0 300px;
      width: 300px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      height: 340px;
      box-shadow: var(--shadow-sm);
    }
    .group-bento-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }
    .group-bento-card .card-cover {
      position: relative;
      height: 120px;
      overflow: hidden;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    }
    .group-bento-card .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition);
    }
    .group-bento-card:hover .card-cover img {
      transform: scale(1.05);
    }
    .group-bento-card .card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(19, 32, 51, 0.75);
      backdrop-filter: blur(4px);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .group-bento-card .card-content {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .group-bento-card .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .group-bento-card .group-name {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-secondary);
      text-transform: uppercase;
    }
    .group-bento-card .like-button {
      background: #f1f5f9;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-muted);
      transition: var(--transition);
    }
    .group-bento-card .like-button:hover, .group-bento-card .like-button.liked {
      background: #fee2e2;
      color: #ef4444;
    }
    .group-bento-card .heart-icon {
      width: 14px;
      height: 14px;
    }
    .group-bento-card .project-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .group-bento-card .project-summary {
      font-size: 13px;
      color: var(--color-muted);
      margin-bottom: 12px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }
    .group-bento-card .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .group-bento-card .tag-badge {
      background: #f1f5f9;
      color: var(--color-muted);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .empty-state-box {
      padding: 30px;
      text-align: center;
      color: var(--color-muted);
      width: 100%;
      border: 1px dashed var(--color-border);
      border-radius: var(--border-radius);
      background: var(--color-surface);
      font-size: 14px;
    }
    
    /* Bento Gamification Widget Styles */
    .gamification-widget {
      width: 100%;
    }
    .gamification-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 992px) {
      .gamification-grid {
        grid-template-columns: 1fr;
      }
    }
    .bento-box {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 160px;
      position: relative;
      overflow: hidden;
    }
    .bento-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      opacity: 0.8;
    }
    .xp-box::before {
      background: linear-gradient(90deg, var(--color-primary), var(--color-journey));
    }
    .missions-box::before {
      background: linear-gradient(90deg, var(--color-secondary), #10b981);
    }
    .ranking-box::before {
      background: linear-gradient(90deg, var(--color-accent), var(--color-warning));
    }
    .bento-box:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: rgba(59, 110, 244, 0.25);
    }
    .bento-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .bento-icon {
      font-size: 20px;
    }
    .bento-header h4 {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .bento-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
      justify-content: center;
    }
    .level-badge {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-journey) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
    }
    .xp-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
    }
    .xp-count {
      color: var(--color-text);
    }
    .xp-remaining {
      color: var(--color-muted);
      font-size: 11px;
    }
    .xp-progress-bar-container {
      width: 100%;
      height: 8px;
      background: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }
    .xp-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-journey));
      border-radius: 4px;
      transition: width 0.8s ease-out;
    }
    .missions-counter {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-secondary);
      line-height: 1;
    }
    .missions-details {
      font-size: 13px;
      color: var(--color-muted);
      font-weight: 500;
    }
    .missions-progress-bar-container {
      width: 100%;
      height: 8px;
      background: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }
    .missions-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-secondary), #10b981);
      border-radius: 4px;
      transition: width 0.8s ease-out;
    }
    .ranking-position {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-accent);
      line-height: 1;
    }
    .ranking-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ranking-meta {
      font-size: 13px;
      color: var(--color-muted);
      font-weight: 500;
    }
    .ranking-trending {
      font-size: 11px;
      color: var(--color-secondary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class DashboardPageComponent {
  private readonly projectService = inject(ProjectService);
  private readonly grupoService = inject(GrupoService);
  private readonly authService = inject(AuthService);

  // Fallback cover image
  protected readonly fallbackCover = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500';

  // States
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly showCreateModal = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedTag = signal('Angular');

  // Lists
  protected readonly allProjects = signal<Projeto[]>([]);
  protected readonly allGroups = signal<Grupo[]>([]);
  protected readonly hotProjects = signal<Projeto[]>([]);
  protected readonly recentProjects = signal<Projeto[]>([]);
  protected readonly colabs = signal<Projeto[]>([]);
  protected readonly myProjects = signal<Projeto[]>([]);
  protected readonly tagProjects = signal<Projeto[]>([]);

  // Computed signals
  protected readonly myGroups = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    return this.allGroups().filter(g => {
      if (g.responsavel && g.responsavel.trim().toLowerCase() === user.nome.trim().toLowerCase()) {
        return true;
      }
      const cached = localStorage.getItem(`nexushub_group_members_${g.id}`);
      if (cached) {
        try {
          const members = JSON.parse(cached);
          return Array.isArray(members) && members.some((m: any) => m.nome && m.nome.trim().toLowerCase() === user.nome.trim().toLowerCase());
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  });

  protected readonly favProjects = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const favsStr = localStorage.getItem(`nexushub_fav_projects_${user.id}`);
    if (!favsStr) return [];
    try {
      const ids = JSON.parse(favsStr);
      if (!Array.isArray(ids)) return [];
      return this.allProjects().filter(p => p.id && ids.includes(p.id));
    } catch {
      return [];
    }
  });

  protected readonly favGroups = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const favsStr = localStorage.getItem(`nexushub_fav_groups_${user.id}`);
    if (!favsStr) return [];
    try {
      const ids = JSON.parse(favsStr);
      if (!Array.isArray(ids)) return [];
      return this.allGroups().filter(g => g.id && ids.includes(g.id));
    } catch {
      return [];
    }
  });

  // List of tags for carousel selection
  protected readonly tagsList = ['Angular', 'Spring Boot', 'Python', 'Flutter', 'Arduino', 'PostgreSQL'];

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });

    this.grupoService.listar().subscribe(gps => {
      this.allGroups.set(gps);
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

  isGroupFavorited(id?: number): boolean {
    if (!id) return false;
    const user = this.currentUser();
    if (!user) return false;
    const favsStr = localStorage.getItem(`nexushub_fav_groups_${user.id}`);
    if (favsStr) {
      try {
        const parsed = JSON.parse(favsStr);
        return Array.isArray(parsed) && parsed.includes(id);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  toggleFavoriteGroup(gp: Grupo, event: Event) {
    event.stopPropagation();
    if (!gp.id) return;
    const user = this.currentUser();
    if (!user) return;

    const favsKey = `nexushub_fav_groups_${user.id}`;
    const favsStr = localStorage.getItem(favsKey);
    let parsed = [];
    if (favsStr) {
      try {
        parsed = JSON.parse(favsStr);
      } catch (e) {}
    }
    if (!Array.isArray(parsed)) parsed = [];

    if (parsed.includes(gp.id)) {
      parsed = parsed.filter((id: number) => id !== gp.id);
    } else {
      parsed.push(gp.id);
    }
    localStorage.setItem(favsKey, JSON.stringify(parsed));
    
    // Refresh group list
    this.loadAllData();
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
