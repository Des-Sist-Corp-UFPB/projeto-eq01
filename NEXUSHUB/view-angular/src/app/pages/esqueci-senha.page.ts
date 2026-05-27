import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-esqueci-senha-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper animate-fade-in">
      <div class="auth-card">
        <header class="auth-header">
          <span class="logo-badge">N</span>
          <h2>Esqueceu sua senha?</h2>
          <p>Digite seu e-mail cadastrado e insira sua nova senha de acesso</p>
        </header>

        <div class="alert alert-danger" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </div>

        <div class="alert alert-success" *ngIf="successMessage()">
          {{ successMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" *ngIf="!successMessage()">
          <div class="form-group">
            <label for="email">E-mail Acadêmico Cadastrado</label>
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

          <div class="form-group">
            <label for="novaSenha">Nova Senha</label>
            <input 
              type="password" 
              id="novaSenha" 
              name="novaSenha" 
              [(ngModel)]="novaSenha" 
              required 
              minlength="6"
              placeholder="Digite a nova senha (mínimo 6 dígitos)" 
              #senhaInput="ngModel"
            />
            <span class="error-msg" *ngIf="senhaInput.invalid && senhaInput.touched">A senha deve ter pelo menos 6 caracteres.</span>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="forgotForm.invalid || isLoading()">
            {{ isLoading() ? 'Redefinindo...' : 'Atualizar Senha' }}
          </button>
        </form>

        <div class="success-actions animate-fade-in" *ngIf="successMessage()">
          <button class="btn btn-primary w-full" routerLink="/login">Fazer Login agora</button>
        </div>

        <footer class="auth-footer" *ngIf="!successMessage()">
          <a routerLink="/login" class="back-link">Voltar para o login</a>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      min-height: 70vh;
    }
    .auth-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 36px;
      width: 100%;
      max-width: 440px;
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
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 13px;
      font-weight: 700;
    }
    input {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 14px;
      width: 100%;
      outline: none;
      transition: var(--transition);
    }
    input:focus {
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
    }
    .back-link {
      color: var(--color-muted);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }
    .back-link:hover {
      color: var(--color-primary);
    }
    .success-actions {
      margin-top: 16px;
    }
  `]
})
export class EsqueciSenhaPageComponent {
  private readonly authService = inject(AuthService);

  protected email = '';
  protected novaSenha = '';

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      email: this.email,
      novaSenha: this.novaSenha
    };

    this.authService.redefinirSenha(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Sua senha foi redefinida com sucesso! Você já pode efetuar login com sua nova credencial.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Falha ao redefinir senha. Confirme se o e-mail está correto.');
      }
    });
  }
}
