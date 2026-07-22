import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

declare var google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected senha = '';
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit() {
    this.initGoogleBtn();
  }

  private initGoogleBtn() {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '412019413615-ee1rcn0tq3vc14e6fs8vurjirdr1i69t.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });
      
      const btn = document.getElementById('google-btn');
      if (btn) {
        google.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          width: 368
        });
      }
    } else {
      setTimeout(() => this.initGoogleBtn(), 150);
    }
  }

  private handleGoogleCredentialResponse(response: any) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.loginComGoogle(response.credential).subscribe({
      next: (user) => {
        console.log('[Login Component] Login Google bem-sucedido:', user.email);
        if (!user.onboardingCompleted) {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('[Login Component] Erro de autenticação Google:', err);
        this.errorMessage.set(err.error?.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    });
  }

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


