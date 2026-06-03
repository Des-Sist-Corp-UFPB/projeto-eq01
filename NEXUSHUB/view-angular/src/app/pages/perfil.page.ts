import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UsuarioResponse } from '../services/auth.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-wrapper animate-fade-in">
      
      <!-- UNAUTHENTICATED STATE -->
      <div class="unauth-container" *ngIf="!isLoggedIn()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lock-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h3>Acesso restrito</h3>
        <p>Você precisa estar autenticado na plataforma para visualizar seu perfil acadêmico e suas métricas.</p>
        <div class="actions">
          <button class="btn btn-primary" routerLink="/login">Ir para Login</button>
          <button class="btn btn-secondary" routerLink="/">Voltar ao Início</button>
        </div>
      </div>

      <!-- AUTHENTICATED STATE -->
      <div class="profile-card" *ngIf="isLoggedIn() && currentUser()">
        
        <!-- View Profile Mode -->
        <div *ngIf="!isEditMode()">
          <header class="profile-header">
            <div class="avatar-large" *ngIf="currentUser()?.fotoUrl; else largeInitials" style="overflow: hidden;">
              <img [src]="currentUser()?.fotoUrl" alt="Foto do usuário" class="profile-avatar-img" />
            </div>
            <ng-template #largeInitials>
              <div class="avatar-large">{{ getInitials() }}</div>
            </ng-template>
            <div class="header-info">
              <h2>{{ currentUser()?.nome }}</h2>
              <span class="user-email">{{ currentUser()?.email }}</span>
              <span class="badge" [class.student]="currentUser()?.cargo === 'ESTUDANTE'" [class.teacher]="currentUser()?.cargo === 'PROFESSOR'">
                {{ currentUser()?.cargo === 'ESTUDANTE' ? 'Estudante' : 'Professor' }}
              </span>
            </div>
            <button class="btn btn-secondary edit-btn" (click)="enableEditMode()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="edit-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Editar Perfil
            </button>
          </header>

          <!-- Metrics Panel -->
          <section class="metrics-section">
            <h3 class="section-title">Resumo de Métricas Acadêmicas</h3>
            
            <div class="metrics-grid">
              
              <!-- Metric 1: XP / Pontos -->
              <div class="metric-card xp">
                <div class="metric-visual">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="xp-icon">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="metric-data">
                  <span class="value">850 XP</span>
                  <span class="label">Nível 4 (Jornada)</span>
                </div>
              </div>

              <!-- Metric 2: Projetos Ativos -->
              <div class="metric-card projects">
                <div class="metric-visual">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="proj-icon">
                    <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10.159a1.5 1.5 0 011.061.44l3.9 3.9a1.5 1.5 0 01.44 1.06V18a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm3-1.5H6a1.5 1.5 0 00-1.5 1.5v12A1.5 1.5 0 006 19.5h12a1.5 1.5 0 001.5-1.5V9h-3.75A1.5 1.5 0 0114.25 7.5V3.75H6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="metric-data">
                  <span class="value">3 Ativos</span>
                  <span class="label">Projetos no Campus</span>
                </div>
              </div>

              <!-- Metric 3: Grupo -->
              <div class="metric-card group">
                <div class="metric-visual">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="group-icon">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.658 18.98a5.002 5.002 0 019.236-5.969 5.002 5.002 0 019.236 5.969 1.2 1.2 0 01-2.064-1.233 2.602 2.602 0 00-4.344-2.806 2.602 2.602 0 00-4.344 2.806 1.2 1.2 0 01-2.064 1.233z" />
                  </svg>
                </div>
                <div class="metric-data">
                  <span class="value">Ideias Lab</span>
                  <span class="label">Grupo Principal</span>
                </div>
              </div>

            </div>
          </section>

          <!-- Back to Dashboard -->
          <footer class="profile-footer">
            <button class="btn btn-primary" routerLink="/">Voltar para Projetos</button>
          </footer>
        </div>

        <!-- Edit Profile Mode -->
        <div *ngIf="isEditMode()">
          <header class="profile-header-edit">
            <h2>Editar Informações Pessoais</h2>
            <p>Mantenha seus dados acadêmicos sempre atualizados.</p>
          </header>

          <div class="alert alert-danger" *ngIf="editError()">
            {{ editError() }}
          </div>

          <form (ngSubmit)="onSaveProfile()" #editForm="ngForm">
            <!-- Profile Photo Upload / Edit -->
            <div class="form-group photo-edit-group">
              <label>Foto de Perfil</label>
              <div class="photo-edit-layout">
                <div class="avatar-large" style="overflow: hidden; width: 64px; height: 64px;">
                  <img [src]="editFotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
                </div>
                <div class="photo-controls">
                  <input type="file" id="profilePhotoUpload" (change)="onPhotoUpload($event)" accept="image/*" class="file-input-hidden" />
                  <label for="profilePhotoUpload" class="file-upload-trigger">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="upload-icon-small">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 3.375 0 11-.75 0 .375 3.375 0 01.75 0z" />
                    </svg>
                    <span>Carregar Foto...</span>
                  </label>
                  <button type="button" class="btn btn-secondary btn-remove-photo" *ngIf="editFotoUrl" (click)="editFotoUrl = ''">Remover</button>
                </div>
              </div>
              <div class="url-input-fallback" style="margin-top: 10px;">
                <label for="edit-photo-url">Ou insira uma URL direta de imagem:</label>
                <input type="text" id="edit-photo-url" name="fotoUrl" [(ngModel)]="editFotoUrl" placeholder="Ex: https://images.unsplash.com/photo-..." />
              </div>
            </div>

            <div class="form-group" style="margin-top: 15px;">
              <label for="edit-nome">Nome Completo *</label>
              <input type="text" id="edit-nome" name="nome" [(ngModel)]="editNome" required placeholder="Seu nome completo" #nomeInput="ngModel" />
              <span class="error-msg" *ngIf="nomeInput.invalid && nomeInput.touched">O nome é obrigatório.</span>
            </div>

            <div class="form-group">
              <label for="edit-email">E-mail Acadêmico *</label>
              <input type="email" id="edit-email" name="email" [(ngModel)]="editEmail" required email placeholder="Seu e-mail acadêmico" #emailInput="ngModel" />
              <span class="error-msg" *ngIf="emailInput.invalid && emailInput.touched">Insira um e-mail válido.</span>
            </div>

            <div class="form-group">
              <label for="edit-cargo">Cargo Acadêmico</label>
              <select id="edit-cargo" name="cargo" [(ngModel)]="editCargo">
                <option value="ESTUDANTE">Estudante</option>
                <option value="PROFESSOR">Professor / Orientador</option>
                <option value="ADMINISTRATIVO">Técnico Administrativo</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-senha">Nova Senha (deixe em branco para manter a atual)</label>
              <input type="password" id="edit-senha" name="senha" [(ngModel)]="editSenha" placeholder="Digite uma nova senha (mínimo 6 dígitos)" minlength="6" #senhaInput="ngModel" />
              <span class="error-msg" *ngIf="senhaInput.invalid && senhaInput.touched">A senha deve ter pelo menos 6 caracteres.</span>
            </div>

            <div class="edit-actions">
              <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || isSaving()">
                {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                Cancelar
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Current Password Confirmation Pop-up Modal -->
      <div class="password-modal-backdrop animate-fade-in" *ngIf="showConfirmPasswordModal()">
        <div class="password-modal animate-scale-up">
          <header class="modal-header">
            <h3>Confirmar Senha Atual</h3>
            <button type="button" class="close-btn" (click)="showConfirmPasswordModal.set(false)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="close-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          <div class="modal-body">
            <p>Para prosseguir com a alteração da sua senha, por favor confirme sua <strong>senha atual</strong>:</p>
            <div class="form-group" style="margin-top: 15px;">
              <input type="password" [(ngModel)]="senhaConfirmacao" placeholder="Digite sua senha atual" required />
            </div>
            <div class="alert alert-danger" style="margin-top: 10px; padding: 8px 12px; font-size: 12px;" *ngIf="confirmError()">
              {{ confirmError() }}
            </div>
          </div>
          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showConfirmPasswordModal.set(false)">Cancelar</button>
            <button type="button" class="btn btn-primary" [disabled]="!senhaConfirmacao || isSaving()" (click)="submitWithPassword()">
              {{ isSaving() ? 'Salvando...' : 'Confirmar e Salvar' }}
            </button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 24px;
      display: flex;
      justify-content: center;
      min-height: 75vh;
    }
    
    .unauth-container {
      text-align: center;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: 48px;
      max-width: 500px;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .lock-icon {
      width: 48px;
      height: 48px;
      color: var(--color-muted);
    }

    .unauth-container h3 {
      font-size: 20px;
      color: var(--color-text);
    }

    .unauth-container p {
      font-size: 13.5px;
      color: var(--color-muted);
    }

    .unauth-container .actions {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    /* Profile Card */
    .profile-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 36px;
      width: 100%;
      max-width: 800px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 24px;
      margin-bottom: 24px;
      position: relative;
    }

    .avatar-large {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-journey) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-grow: 1;
    }

    .header-info h2 {
      font-size: 22px;
      color: var(--color-text);
    }

    .user-email {
      font-size: 13.5px;
      color: var(--color-muted);
    }

    .badge {
      align-self: flex-start;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .badge.student {
      background: #e0f2fe;
      color: var(--color-primary);
    }

    .badge.teacher {
      background: #d1fae5;
      color: var(--color-secondary);
    }

    .edit-btn {
      align-self: center;
      font-size: 13px;
    }

    .edit-icon {
      width: 16px;
      height: 16px;
    }

    /* Metrics */
    .metrics-section {
      margin-bottom: 24px;
    }

    .metrics-section .section-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 14px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    @media (max-width: 640px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
      .edit-btn {
        align-self: center;
        margin-top: 10px;
      }
    }

    .metric-card {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      background: #f8fafc;
      transition: var(--transition);
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .metric-visual {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-card.xp .metric-visual { background: #fef3c7; color: var(--color-accent); }
    .metric-card.projects .metric-visual { background: #e0f2fe; color: var(--color-primary); }
    .metric-card.group .metric-visual { background: #d1fae5; color: var(--color-secondary); }

    .xp-icon, .proj-icon, .group-icon {
      width: 20px;
      height: 20px;
    }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-data .value {
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text);
      line-height: 1.25;
    }

    .metric-data .label {
      font-size: 11px;
      color: var(--color-muted);
      font-weight: 600;
    }

    .profile-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 24px;
      display: flex;
      justify-content: flex-end;
    }

    /* Edit Profile form */
    .profile-header-edit {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    .profile-header-edit h2 {
      font-size: 20px;
    }

    .profile-header-edit p {
      font-size: 13px;
      color: var(--color-muted);
    }

    .form-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }

    input, select {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 14px;
      outline: none;
      width: 100%;
      transition: var(--transition);
      background: white;
    }

    input:focus, select:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(31, 122, 224, 0.1);
    }

    .error-msg {
      font-size: 11px;
      color: var(--color-danger);
      font-weight: 600;
    }

    .edit-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      border-top: 1px solid var(--color-border);
      margin-top: 24px;
      padding-top: 18px;
    }

    .alert {
      padding: 12px;
      border-radius: var(--border-radius-sm);
      font-size: 13px;
      margin-bottom: 18px;
      font-weight: 600;
    }

    .alert-danger {
      background: #fee2e2;
      color: var(--color-danger);
      border: 1px solid #fca5a5;
    }

    .profile-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    /* Photo edit styles */
    .photo-edit-group {
      border: 1px dashed var(--color-border);
      padding: 16px;
      border-radius: var(--border-radius-md);
      background: #f8fafc;
    }

    .photo-edit-layout {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }

    .photo-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .file-input-hidden {
      display: none;
    }

    .file-upload-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
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

    .btn-remove-photo {
      padding: 8px 16px;
      font-size: 13px;
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fca5a5;
    }

    .btn-remove-photo:hover {
      background: #ef4444;
      color: white;
    }

    .url-input-fallback {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .url-input-fallback label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--color-muted);
    }

    /* Password Confirm Modal */
    .password-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(19, 32, 51, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 20px;
    }

    .password-modal {
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      width: 100%;
      max-width: 450px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      box-sizing: border-box;
    }

    .password-modal .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .password-modal .modal-header h3 {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
      color: var(--color-text);
    }

    .password-modal .close-btn {
      background: transparent;
      border: none;
      color: var(--color-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-modal .close-btn:hover {
      background: #f1f5f9;
      color: var(--color-danger);
    }

    .password-modal .close-icon {
      width: 18px;
      height: 18px;
    }

    .password-modal .modal-body {
      padding: 20px;
    }

    .password-modal .modal-body p {
      font-size: 13.5px;
      color: var(--color-muted);
      margin: 0;
      line-height: 1.5;
    }

    .password-modal .modal-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background: #f8fafc;
    }
  `]
})
export class PerfilPageComponent {
  private readonly authService = inject(AuthService);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());

  protected readonly isEditMode = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly editError = signal('');

  protected editNome = '';
  protected editEmail = '';
  protected editCargo = 'ESTUDANTE';
  protected editSenha = '';
  protected editFotoUrl = '';

  // Confirmation Modal states
  protected readonly showConfirmPasswordModal = signal(false);
  protected senhaConfirmacao = '';
  protected readonly confirmError = signal('');

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const names = user.nome.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return user.nome.charAt(0).toUpperCase();
  }

  enableEditMode() {
    const user = this.currentUser();
    if (user) {
      this.editNome = user.nome;
      this.editEmail = user.email;
      this.editCargo = user.cargo;
      this.editFotoUrl = user.fotoUrl || '';
      this.editSenha = '';
      this.senhaConfirmacao = '';
      this.isEditMode.set(true);
      this.editError.set('');
      this.showConfirmPasswordModal.set(false);
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.editFotoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSaveProfile() {
    // Se a senha foi preenchida para alteração, abre o popup de confirmação de senha
    if (this.editSenha.trim().length >= 6) {
      this.senhaConfirmacao = '';
      this.confirmError.set('');
      this.showConfirmPasswordModal.set(true);
      return;
    }
    this.executeSaveProfile();
  }

  submitWithPassword() {
    if (!this.senhaConfirmacao) return;
    this.confirmError.set('');
    this.executeSaveProfile(this.senhaConfirmacao);
  }

  private executeSaveProfile(senhaAtual?: string) {
    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.editError.set('');

    const payload = {
      nome: this.editNome,
      email: this.editEmail,
      cargo: this.editCargo,
      senha: this.editSenha || undefined, // Envia apenas se alterada
      fotoUrl: this.editFotoUrl || undefined,
      senhaAtual: senhaAtual || undefined
    };

    this.authService.atualizarPerfil(user.id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.showConfirmPasswordModal.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        const errMsg = err.error?.message || 'Falha ao atualizar perfil. Verifique os dados inseridos.';
        if (senhaAtual) {
          this.confirmError.set(errMsg);
        } else {
          this.editError.set(errMsg);
        }
      }
    });
  }
}
