import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-esqueci-senha-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './esqueci-senha.page.html',
  styleUrl: './esqueci-senha.page.css'
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
        this.successMessage.set('Sua senha foi redefinida com sucesso! VocÃª jÃ¡ pode efetuar login com sua nova credencial.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Falha ao redefinir senha. Confirme se o e-mail estÃ¡ correto.');
      }
    });
  }
}


