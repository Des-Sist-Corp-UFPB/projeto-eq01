import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrupoService, Grupo } from '../services/grupo.service';
import { ProjectService, Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-grupos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="groups-container animate-fade-in">
      <!-- Header -->
      <header class="groups-header">
        <span class="header-eyebrow">Ecossistema Nexus</span>
        <h2>Grupos e Núcleos Acadêmicos</h2>
        <p>Explore laboratórios de inovação, centros acadêmicos, núcleos de pesquisa e comunidades de alunos da nossa comunidade.</p>
        
        <!-- Search and Action Bar -->
        <div class="action-bar">
          <div class="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="search-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar grupos por nome ou descrição..." 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              class="search-input"
            />
          </div>
          <button class="btn-create-group" (click)="toggleCreateForm()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="plus-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {{ showCreateForm() ? 'Fechar Cadastro' : 'Criar Novo Grupo' }}
          </button>
        </div>
      </header>

      <!-- Create Group Panel (Form + Preview) -->
      <div class="create-panel-wrapper" *ngIf="showCreateForm()">
        <div class="create-panel">
          <!-- Left: Form -->
          <div class="form-section">
            <h3>Identidade do Grupo</h3>
            <form (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="nome">Nome do Grupo *</label>
                <input type="text" id="nome" name="nome" [(ngModel)]="newGroup.nome" required placeholder="Ex: Núcleo de Design Computacional" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="categoria">Categoria</label>
                  <select id="categoria" name="area" [(ngModel)]="newGroup.area">
                    <option value="Institucional">Institucional (Pesquisa, Extensão, Laboratórios)</option>
                    <option value="Comunidade">Comunidade (Estudantes, Diretórios, Ligas)</option>
                    <option value="Externo">Externo (Parceiros, Mercado, Ex-alunos)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="tipo">Tipo de Grupo</label>
                  <select id="tipo" name="tipo" [(ngModel)]="newGroup.tipo">
                    <option value="Aberto">Aberto (Livre entrada)</option>
                    <option value="Restrito">Restrito (Apenas convidados/aprovados)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="descricao">Descrição do Grupo *</label>
                <textarea id="descricao" name="descricao" [(ngModel)]="newGroup.descricao" required rows="3" placeholder="Descreva os objetivos do grupo..."></textarea>
              </div>

              <!-- Visual Identity: Image Upload -->
              <div class="form-group">
                <label>Imagem de Capa (Foto da Galeria)</label>
                <div class="image-upload-area">
                  <input 
                    type="file" 
                    id="logoUpload" 
                    (change)="onLogoUpload($event)" 
                    accept="image/*"
                    class="file-input-hidden"
                  />
                  <label for="logoUpload" class="file-upload-trigger">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="upload-icon-small">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 3.375 0 11-.75 0 .375 3.375 0 01.75 0z" />
                    </svg>
                    <span>Selecionar foto local...</span>
                  </label>
                </div>
                
                <div class="url-input-fallback">
                  <label for="logoUrl">Ou cole uma URL de imagem direta:</label>
                  <input 
                    type="text" 
                    id="logoUrl" 
                    name="logo" 
                    [(ngModel)]="newGroup.logo" 
                    placeholder="Ex: https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <!-- Visual Identity: Colors -->
              <div class="form-group">
                <label>Cor Temática do Grupo</label>
                <div class="color-presets">
                  <button 
                    type="button" 
                    *ngFor="let color of colorPresets" 
                    [style.background]="color" 
                    class="color-dot" 
                    [class.active]="newGroup.cor === color"
                    (click)="newGroup.cor = color"
                  ></button>
                </div>
              </div>

              <button type="submit" class="btn-submit" [disabled]="!newGroup.nome || !newGroup.descricao">Salvar e Publicar Grupo</button>
            </form>
          </div>

          <!-- Right: Live Preview -->
          <div class="preview-section">
            <h3>Pré-visualização do Card</h3>
            <div class="preview-card-container">
              <!-- Rendered Card following project-card formatting exactly -->
              <article class="project-card max-w-card">
                <div class="card-cover">
                  <img [src]="newGroup.logo || fallbackCover" alt="Capa do grupo" />
                  <div class="card-badge">
                    {{ newGroup.tipo || 'Aberto' }}
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="card-meta">
                    <span class="group-name">GRUPO {{ (newGroup.area || 'Institucional') | uppercase }}</span>
                    <button class="like-button" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                      <span class="likes-count">0</span>
                    </button>
                  </div>

                  <h3 class="project-title">{{ newGroup.nome || 'Nome do Grupo Acadêmico' }}</h3>
                  <p class="project-summary">{{ newGroup.descricao || 'Descreva a identidade e regras do grupo.' }}</p>
                  
                  <div class="tags-container">
                    <span class="tag-badge">#{{ newGroup.area }}</span>
                    <span class="tag-badge">#{{ newGroup.tipo }}</span>
                  </div>

                  <div class="card-footer">
                    <div class="author-info">
                      <span class="avatar">V</span>
                      <span class="author-name">Por <strong>Você (Coord.)</strong></span>
                    </div>
                    
                    <div class="members-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="users-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                      </svg>
                      <span>0 Proj.</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories & Carousels -->
      <div class="categories-list" *ngIf="!showCreateForm() || searchQuery()">
        <!-- 1. Institutional -->
        <section class="category-section" *ngIf="getFilteredByCategory('Institucional').length > 0">
          <div class="section-title">
            <span class="section-emoji">🏫</span>
            <h3>Grupos Institucionais</h3>
            <span class="count-badge">{{ getFilteredByCategory('Institucional').length }}</span>
          </div>
          
          <div class="carousel-container">
            <button class="carousel-nav-btn prev" (click)="scroll(instTrack, -350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div class="carousel-track" #instTrack>
              <article class="project-card" *ngFor="let gp of getFilteredByCategory('Institucional')" [routerLink]="['/grupos', gp.id]">
                <div class="card-cover">
                  <img [src]="(gp.logo && gp.logo.length > 20) ? gp.logo : fallbackCover" alt="Capa do grupo" />
                  <div class="card-badge">
                    {{ gp.tipo || 'Aberto' }}
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="card-meta">
                    <span class="group-name">GRUPO {{ gp.area | uppercase }}</span>
                    <div class="card-actions-wrapper" (click)="$event.stopPropagation()">
                      <button 
                        *ngIf="isGroupLeader(gp)" 
                        class="btn-delete-group-icon" 
                        title="Excluir grupo"
                        (click)="excluirGrupoLista(gp)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="trash-icon-small">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      <button class="like-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span class="likes-count">12</span>
                      </button>
                    </div>
                  </div>

                  <h3 class="project-title">{{ gp.nome }}</h3>
                  <p class="project-summary">{{ gp.descricao }}</p>
                  
                  <div class="tags-container">
                    <span class="tag-badge">#{{ gp.area }}</span>
                    <span class="tag-badge">#{{ gp.tipo || 'Aberto' }}</span>
                  </div>

                  <div class="card-footer">
                    <div class="author-info">
                      <span class="avatar" [style.background-color]="gp.cor || '#1e3a8a'">{{ gp.responsavel ? gp.responsavel.charAt(0) : 'C' }}</span>
                      <span class="author-name">Por <strong>{{ gp.responsavel || 'Coordenador' }}</strong></span>
                    </div>
                    
                    <div class="members-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="users-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                      </svg>
                      <span>{{ getLinkedProjects(gp.nome).length }} Proj.</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <button class="carousel-nav-btn next" (click)="scroll(instTrack, 350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </section>

        <!-- 2. Community -->
        <section class="category-section" *ngIf="getFilteredByCategory('Comunidade').length > 0">
          <div class="section-title">
            <span class="section-emoji">👥</span>
            <h3>Grupos da Comunidade</h3>
            <span class="count-badge">{{ getFilteredByCategory('Comunidade').length }}</span>
          </div>
          
          <div class="carousel-container">
            <button class="carousel-nav-btn prev" (click)="scroll(comTrack, -350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div class="carousel-track" #comTrack>
              <article class="project-card" *ngFor="let gp of getFilteredByCategory('Comunidade')" [routerLink]="['/grupos', gp.id]">
                <div class="card-cover">
                  <img [src]="(gp.logo && gp.logo.length > 20) ? gp.logo : fallbackCover" alt="Capa do grupo" />
                  <div class="card-badge">
                    {{ gp.tipo || 'Aberto' }}
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="card-meta">
                    <span class="group-name">GRUPO {{ gp.area | uppercase }}</span>
                    <div class="card-actions-wrapper" (click)="$event.stopPropagation()">
                      <button 
                        *ngIf="isGroupLeader(gp)" 
                        class="btn-delete-group-icon" 
                        title="Excluir grupo"
                        (click)="excluirGrupoLista(gp)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="trash-icon-small">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      <button class="like-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span class="likes-count">6</span>
                      </button>
                    </div>
                  </div>

                  <h3 class="project-title">{{ gp.nome }}</h3>
                  <p class="project-summary">{{ gp.descricao }}</p>
                  
                  <div class="tags-container">
                    <span class="tag-badge">#{{ gp.area }}</span>
                    <span class="tag-badge">#{{ gp.tipo || 'Aberto' }}</span>
                  </div>

                  <div class="card-footer">
                    <div class="author-info">
                      <span class="avatar" [style.background-color]="gp.cor || '#4338ca'">{{ gp.responsavel ? gp.responsavel.charAt(0) : 'C' }}</span>
                      <span class="author-name">Por <strong>{{ gp.responsavel || 'Coordenador' }}</strong></span>
                    </div>
                    
                    <div class="members-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="users-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                      </svg>
                      <span>{{ getLinkedProjects(gp.nome).length }} Proj.</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <button class="carousel-nav-btn next" (click)="scroll(comTrack, 350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </section>

        <!-- 3. External -->
        <section class="category-section" *ngIf="getFilteredByCategory('Externo').length > 0">
          <div class="section-title">
            <span class="section-emoji">🏢</span>
            <h3>Grupos Externos</h3>
            <span class="count-badge">{{ getFilteredByCategory('Externo').length }}</span>
          </div>
          
          <div class="carousel-container">
            <button class="carousel-nav-btn prev" (click)="scroll(extTrack, -350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div class="carousel-track" #extTrack>
              <article class="project-card" *ngFor="let gp of getFilteredByCategory('Externo')" [routerLink]="['/grupos', gp.id]">
                <div class="card-cover">
                  <img [src]="(gp.logo && gp.logo.length > 20) ? gp.logo : fallbackCover" alt="Capa do grupo" />
                  <div class="card-badge">
                    {{ gp.tipo || 'Aberto' }}
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="card-meta">
                    <span class="group-name">GRUPO {{ gp.area | uppercase }}</span>
                    <div class="card-actions-wrapper" (click)="$event.stopPropagation()">
                      <button 
                        *ngIf="isGroupLeader(gp)" 
                        class="btn-delete-group-icon" 
                        title="Excluir grupo"
                        (click)="excluirGrupoLista(gp)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="trash-icon-small">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      <button class="like-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span class="likes-count">3</span>
                      </button>
                    </div>
                  </div>

                  <h3 class="project-title">{{ gp.nome }}</h3>
                  <p class="project-summary">{{ gp.descricao }}</p>
                  
                  <div class="tags-container">
                    <span class="tag-badge">#{{ gp.area }}</span>
                    <span class="tag-badge">#{{ gp.tipo || 'Aberto' }}</span>
                  </div>

                  <div class="card-footer">
                    <div class="author-info">
                      <span class="avatar" [style.background-color]="gp.cor || '#b45309'">{{ gp.responsavel ? gp.responsavel.charAt(0) : 'C' }}</span>
                      <span class="author-name">Por <strong>{{ gp.responsavel || 'Coordenador' }}</strong></span>
                    </div>
                    
                    <div class="members-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="users-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                      </svg>
                      <span>{{ getLinkedProjects(gp.nome).length }} Proj.</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <button class="carousel-nav-btn next" (click)="scroll(extTrack, 350)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </section>
      </div>

      <!-- Empty State -->
      <div class="empty-groups" *ngIf="grupos().length === 0">
        <h3>Nenhum grupo cadastrado</h3>
        <p>Use o botão "Criar Novo Grupo" para iniciar a rede de núcleos acadêmicos do ecossistema!</p>
      </div>
      
      <!-- No Search Results -->
      <div class="empty-groups" *ngIf="grupos().length > 0 && getFilteredGroups().length === 0">
        <h3>Nenhum grupo encontrado</h3>
        <p>Tente alterar sua busca ou filtre por termos diferentes.</p>
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
      gap: 40px;
    }
    
    /* Header & Action Bar */
    .groups-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 24px;
    }
    .header-eyebrow {
      color: var(--color-primary);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .groups-header h2 {
      font-size: 32px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.8px;
    }
    .groups-header p {
      font-size: 15px;
      color: var(--color-muted);
      line-height: 1.5;
      max-width: 800px;
    }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-top: 16px;
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
      padding: 11px 16px 11px 42px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-size: 13.5px;
      outline: none;
      transition: var(--transition);
      background: white;
    }
    .search-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.1);
    }
    
    .btn-create-group {
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      padding: 11px 20px;
      font-weight: 700;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-create-group:hover {
      background: #1765c2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(31, 122, 224, 0.2);
    }
    .plus-icon {
      width: 16px;
      height: 16px;
    }

    /* Create Panel */
    .create-panel-wrapper {
      background: #f8fafc;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 32px;
      box-shadow: var(--shadow-sm);
    }
    .create-panel {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
    }
    @media (max-width: 900px) {
      .create-panel {
        grid-template-columns: 1fr;
      }
    }
    .form-section h3, .preview-section h3 {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 20px;
      color: var(--color-text);
      letter-spacing: -0.3px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group label {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--color-text);
    }
    .form-group input, .form-group select, .form-group textarea {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 13.5px;
      outline: none;
      background: white;
      transition: var(--transition);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--color-primary);
    }
    
    /* File Upload Area */
    .image-upload-area {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .file-input-hidden {
      display: none;
    }
    .file-upload-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
      cursor: pointer;
      transition: var(--transition);
    }
    .file-upload-trigger:hover {
      border-color: var(--color-primary);
      background: #eff6ff;
    }
    .upload-icon-small {
      width: 16px;
      height: 16px;
      color: var(--color-muted);
    }
    .url-input-fallback {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .url-input-fallback label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--color-muted);
    }

    /* Preset Pickers */
    .color-presets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .color-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      outline: 1px solid var(--color-border);
      cursor: pointer;
      transition: var(--transition);
    }
    .color-dot.active {
      transform: scale(1.2);
      outline-color: var(--color-primary);
      outline-width: 2px;
    }

    .btn-submit {
      background: #10b981;
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      padding: 12px 24px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      width: 100%;
      margin-top: 12px;
    }
    .btn-submit:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
    }
    .btn-submit:disabled {
      background: var(--color-border);
      color: var(--color-muted);
      cursor: not-allowed;
    }

    /* Live Preview Section */
    .preview-card-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      min-height: 280px;
      background: white;
      border: 1px dashed var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 24px;
    }
    .max-w-card {
      width: 100%;
      max-width: 320px;
    }

    /* Carousels Styling */
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }
    .category-section {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-emoji {
      font-size: 22px;
    }
    .section-title h3 {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.4px;
    }
    .count-badge {
      background: #e2e8f0;
      color: var(--color-muted);
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 20px;
    }

    /* Carousel Slider */
    .carousel-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    .carousel-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 10px 4px;
      width: 100%;
      scroll-snap-type: x mandatory;
    }
    .carousel-track::-webkit-scrollbar {
      height: 6px;
    }
    .carousel-track::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .carousel-nav-btn {
      position: absolute;
      z-index: 10;
      background: white;
      border: 1px solid var(--color-border);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .carousel-nav-btn:hover {
      background: #f8fafc;
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
    }
    .carousel-nav-btn.prev {
      left: -18px;
    }
    .carousel-nav-btn.next {
      right: -18px;
    }
    .carousel-nav-btn svg {
      width: 16px;
      height: 16px;
      color: var(--color-text);
    }

    /* Redesigned Card following screenshot format EXACTLY */
    .project-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      flex: 0 0 280px;
      scroll-snap-align: start;
      max-width: 280px;
      box-sizing: border-box;
    }
    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }
    .card-cover {
      position: relative;
      height: 160px;
      overflow: hidden;
      background: linear-gradient(135deg, #1f7ae0 0%, #13a37c 100%);
    }
    .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition);
    }
    .project-card:hover .card-cover img {
      transform: scale(1.05);
    }
    .card-badge {
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
      letter-spacing: 0.5px;
    }
    .card-content {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .group-name {
      font-size: 10px;
      font-weight: 800;
      color: #10b981; /* Green color match */
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .like-button {
      background: #f1f5f9;
      border: none;
      border-radius: 20px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: var(--color-muted);
      transition: var(--transition);
    }
    .heart-icon {
      width: 12px;
      height: 12px;
      color: #ef4444;
    }
    .likes-count {
      font-size: 10px;
      font-weight: 700;
    }
    .project-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .project-summary {
      font-size: 13px;
      color: var(--color-muted);
      margin: 0 0 12px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
      min-height: 38px;
    }
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }
    .tag-badge {
      background: #f1f5f9;
      color: var(--color-muted);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
      margin-top: auto;
    }
    .author-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
    }
    .author-name {
      font-size: 11px;
      color: var(--color-muted);
    }
    .author-name strong {
      color: var(--color-text);
    }
    .members-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-muted);
    }
    .users-icon {
      width: 14px;
      height: 14px;
    }
    .empty-groups {
      text-align: center;
      padding: 60px 24px;
      border: 1px dashed var(--color-border);
      border-radius: var(--border-radius-md);
      background: #f8fafc;
    }
    .empty-groups h3 {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .empty-groups p {
      font-size: 13px;
      color: var(--color-muted);
    }
    
    /* Delete Group Button styles */
    .card-actions-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-delete-group-icon {
      background: #fee2e2;
      color: #ef4444;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-delete-group-icon:hover {
      background: #fca5a5;
      color: #dc2626;
      transform: scale(1.1);
    }
    .trash-icon-small {
      width: 14px;
      height: 14px;
    }
  `]
})
export class GruposPageComponent implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // Fallback cover image
  protected readonly fallbackCover = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500';

  // Search Query state
  protected readonly searchQuery = signal<string>('');

  // Show creation panel state
  protected readonly showCreateForm = signal<boolean>(false);

  // States for groups and projects
  protected readonly grupos = signal<Grupo[]>([]);
  protected readonly allProjects = signal<Projeto[]>([]);

  // Presets for Creation Visual Identity
  protected readonly colorPresets = [
    '#1e3a8a', // Dark Navy
    '#0f766e', // Teal
    '#4338ca', // Indigo
    '#b91c1c', // Crimson Red
    '#b45309', // Amber
    '#059669', // Emerald
    '#7c3aed', // Purple
    '#db2777'  // Pink/Rose
  ];

  // Form Model
  protected newGroup: Grupo = {
    nome: '',
    descricao: '',
    area: 'Institucional',
    tipo: 'Aberto',
    cor: '#1e3a8a',
    logo: '', // Holds Base64 string or URL
    responsavel: 'John Wesley' // Default coordinator for new creations
  };

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.grupoService.listar().subscribe(gps => {
      this.grupos.set(gps);
    });

    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update(val => !val);
  }

  // Handle Logo Upload and convert to Base64 DataURL
  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.newGroup.logo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Horizontal scroll utility for custom carousels
  scroll(element: HTMLDivElement, offset: number) {
    element.scrollBy({ left: offset, behavior: 'smooth' });
  }

  // Filter groups by query search
  getFilteredGroups(): Grupo[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.grupos();
    }
    return this.grupos().filter(gp => 
      gp.nome.toLowerCase().includes(query) || 
      gp.descricao.toLowerCase().includes(query)
    );
  }

  // Filter group categories
  getFilteredByCategory(category: string): Grupo[] {
    return this.getFilteredGroups().filter(gp => 
      gp.area && gp.area.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  getLinkedProjects(grupoNome: string): BentoProject[] {
    return this.allProjects().filter(p => 
      p.grupoPertencente && p.grupoPertencente.trim().toLowerCase() === grupoNome.trim().toLowerCase()
    );
  }

  onSubmit() {
    if (!this.newGroup.nome || !this.newGroup.descricao) return;

    this.newGroup.responsavel = this.authService.currentUser()?.nome || 'John Wesley';

    this.grupoService.criar(this.newGroup).subscribe({
      next: (created) => {
        // Reset form and close
        this.newGroup = {
          nome: '',
          descricao: '',
          area: 'Institucional',
          tipo: 'Aberto',
          cor: '#1e3a8a',
          logo: '',
          responsavel: 'John Wesley'
        };
        this.showCreateForm.set(false);
        // Reload list
        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao cadastrar grupo', err);
        alert('Ocorreu um erro ao criar o grupo. Verifique se o backend está rodando!');
      }
    });
  }

  isGroupLeader(gp: Grupo): boolean {
    const user = this.authService.currentUser();
    if (!user || !gp || !gp.responsavel) return false;
    return gp.responsavel.trim().toLowerCase() === user.nome.trim().toLowerCase();
  }

  excluirGrupoLista(gp: Grupo) {
    if (!gp || !gp.id) return;
    if (confirm(`Tem certeza absoluta de que deseja excluir o grupo "${gp.nome}"? Todos os dados associados serão perdidos.`)) {
      this.grupoService.deletar(gp.id).subscribe({
        next: () => {
          localStorage.removeItem(`nexushub_group_members_${gp.id}`);
          localStorage.removeItem(`nexushub_group_vacancies_${gp.id}`);
          alert('Grupo excluído com sucesso!');
          this.carregarDados();
        },
        error: (err) => {
          console.error('Erro ao excluir grupo', err);
          alert('Falha ao excluir o grupo. Verifique se o backend está ativo!');
        }
      });
    }
  }
}

interface BentoProject {
  id?: number;
  nome: string;
  resumo: string;
  imagemCardUrl?: string;
}
