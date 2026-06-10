import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro.page.html',
  styleUrl: './cadastro.page.css'
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


