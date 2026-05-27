import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper animate-fade-in">
      <div class="auth-card">
        <header class="auth-header">
          <span class="logo-badge">N</span>
          <h2>Crie sua conta acadêmica</h2>
          <p>Faça parte da rede acadêmica e divulgue seus projetos</p>
        </header>

        <div class="alert alert-danger" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </div>

        <div class="alert alert-success" *ngIf="successMessage()">
          {{ successMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" #cadForm="ngForm" *ngIf="!successMessage()">
          <div class="form-group">
            <label for="nome">Nome Completo</label>
            <input 
              type="text" 
              id="nome" 
              name="nome" 
              [(ngModel)]="nome" 
              required 
              placeholder="Ex: Rodrigo Silva" 
              #nomeInput="ngModel"
            />
            <span class="error-msg" *ngIf="nomeInput.invalid && nomeInput.touched">O nome é obrigatório.</span>
          </div>

          <div class="form-group">
            <label for="email">E-mail Acadêmico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              email
              placeholder="Ex: rodrigo@nexushub.com" 
              #emailInput="ngModel"
            />
            <span class="error-msg" *ngIf="emailInput.invalid && emailInput.touched">Insira um e-mail válido.</span>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label for="cargo">Cargo Acadêmico</label>
              <select id="cargo" name="cargo" [(ngModel)]="cargo" required>
                <option value="ESTUDANTE">Estudante</option>
                <option value="PROFESSOR">Professor / Orientador</option>
                <option value="ADMINISTRATIVO">Técnico Administrativo</option>
              </select>
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="senha">Senha</label>
            <input 
              type="password" 
              id="senha" 
              name="senha" 
              [(ngModel)]="senha" 
              required 
              minlength="6"
              placeholder="Crie uma senha de acesso (mínimo 6 dígitos)" 
              #senhaInput="ngModel"
            />
            <span class="error-msg" *ngIf="senhaInput.invalid && senhaInput.touched">A senha deve ter pelo menos 6 caracteres.</span>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmarSenha">Confirmar Senha *</label>
            <input 
              type="password" 
              id="confirmarSenha" 
              name="confirmarSenha" 
              [(ngModel)]="confirmarSenha" 
              required 
              placeholder="Digite a senha novamente" 
              #confirmInput="ngModel"
            />
            <span class="error-msg" *ngIf="confirmarSenha !== senha && confirmInput.touched">As senhas não coincidem.</span>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="cadForm.invalid || senha !== confirmarSenha || isLoading()">
            {{ isLoading() ? 'Cadastrando...' : 'Registrar Conta' }}
          </button>
        </form>

        <div class="success-actions animate-fade-in" *ngIf="successMessage()">
          <button class="btn btn-primary w-full" routerLink="/login">Ir para o Login</button>
        </div>

        <footer class="auth-footer" *ngIf="!successMessage()">
          <p>Já possui cadastro? <a routerLink="/login">Faça o login aqui</a></p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      min-height: 75vh;
    }
    .auth-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 36px;
      width: 100%;
      max-width: 460px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 24px;
      margin-bottom: 12px;
      box-shadow: var(--shadow-sm);
    }
    .auth-header h2 {
      font-size: 20px;
      margin-bottom: 4px;
    }
    .auth-header p {
      font-size: 13px;
      color: var(--color-muted);
    }
    .form-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-group.col {
      flex: 1;
    }
    label {
      font-size: 13px;
      font-weight: 700;
    }
    input, select {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 14px;
      width: 100%;
      outline: none;
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
    .w-full {
      width: 100%;
      padding: 12px;
      border-radius: var(--border-radius-sm);
      font-size: 14px;
      margin-top: 10px;
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
    .alert-success {
      background: #d1fae5;
      color: var(--color-secondary);
      border: 1px solid #86efac;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      border-top: 1px solid var(--color-border);
      padding-top: 18px;
      font-size: 13px;
      color: var(--color-muted);
    }
    .auth-footer a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 700;
    }
    .auth-footer a:hover { text-decoration: underline; }
    .success-actions {
      margin-top: 16px;
    }
  `]
})
export class CadastroPageComponent {
  private readonly authService = inject(AuthService);

  protected nome = '';
  protected email = '';
  protected cargo = 'ESTUDANTE';
  protected senha = '';
  protected confirmarSenha = '';

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  onSubmit() {
    if (this.senha !== this.confirmarSenha) {
      console.warn('[Cadastro Component] Tentativa de submissão falhou: As senhas digitadas não coincidem.');
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    console.log('[Cadastro Component] Submetendo formulário para:', this.email);

    const payload = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      cargo: this.cargo
    };

    this.authService.cadastrar(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        console.log('[Cadastro Component] Cadastro efetuado com sucesso para:', res.email);
        this.successMessage.set('Sua conta acadêmica foi criada com sucesso! Faça login para começar.');
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('[Cadastro Component] Erro de cadastro recebido do backend:', err);
        this.errorMessage.set(err.error?.message || 'Falha ao registrar conta. Verifique os dados inseridos.');
      }
    });
  }
}
