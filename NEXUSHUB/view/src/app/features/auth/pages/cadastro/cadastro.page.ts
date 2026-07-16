import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

declare var google: any;

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro.page.html',
  styleUrl: './cadastro.page.css'
})
export class CadastroPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected nome = '';
  protected email = '';
  protected cargo = 'ESTUDANTE';
  protected senha = '';
  protected confirmarSenha = '';
  protected lgpdConsent = false;

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

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
        console.log('[Cadastro Component] Login Google bem-sucedido:', user.email);
        if (!user.onboardingCompleted) {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('[Cadastro Component] Erro de autenticação Google:', err);
        this.errorMessage.set(err.error?.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    });
  }

  onSubmit() {
    if (!this.lgpdConsent) {
      this.errorMessage.set('Você deve aceitar a Política de Privacidade e os Termos de Uso.');
      return;
    }
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


