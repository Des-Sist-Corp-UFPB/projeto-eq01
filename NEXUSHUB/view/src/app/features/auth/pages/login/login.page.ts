import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
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
        console.error('[Login Component] Erro de autenticaÃ§Ã£o recebido do backend:', err);
        this.errorMessage.set(err.error?.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    });
  }
}


