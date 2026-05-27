import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper animate-fade-in">
      <div class="auth-card">
        <header class="auth-header">
          <span class="logo-badge">N</span>
          <h2>Acesse sua conta</h2>
          <p>Conecte-se ao ecossistema acadêmico Nexus</p>
        </header>

        <div class="alert alert-danger" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
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

          <div class="form-group">
            <div class="label-row">
              <label for="senha">Senha</label>
              <a routerLink="/esqueci-senha" class="forgot-link">Esqueceu a senha?</a>
            </div>
            
            <!-- Password Input with Visibility Toggle -->
            <div class="password-input-wrapper">
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                id="senha" 
                name="senha" 
                [(ngModel)]="senha" 
                required 
                minlength="6"
                placeholder="Digite sua senha de acesso" 
                #senhaInput="ngModel"
              />
              <button type="button" class="toggle-password-btn" (click)="showPassword.set(!showPassword())" aria-label="Visualizar senha">
                <!-- Eye icon when hidden, eye-slash when visible -->
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="eye-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="eye-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            
            <span class="error-msg" *ngIf="senhaInput.invalid && senhaInput.touched">A senha deve ter pelo menos 6 caracteres.</span>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid || isLoading()">
            {{ isLoading() ? 'Carregando...' : 'Entrar na Plataforma' }}
          </button>
        </form>

        <footer class="auth-footer">
          <p>Não tem cadastro? <a routerLink="/cadastro">Crie sua conta agora</a></p>
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
    }
    .form-group {
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    label {
      font-size: 13px;
      font-weight: 700;
    }
    .forgot-link {
      font-size: 12px;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }
    .forgot-link:hover { text-decoration: underline; }
    
    /* Password wrapper */
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-input-wrapper input {
      padding-right: 44px;
    }
    .toggle-password-btn {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--color-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: var(--transition);
    }
    .toggle-password-btn:hover {
      color: var(--color-primary);
    }
    .eye-icon {
      width: 18px;
      height: 18px;
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
  `]
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected senha = '';
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    console.log('[Login Component] Iniciando tentativa de login para o email:', this.email);

    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: (res) => {
        console.log('[Login Component] Login bem-sucedido para:', res.email, 'ID:', res.id);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('[Login Component] Erro de autenticação recebido do backend:', err);
        this.errorMessage.set(err.error?.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    });
  }
}
