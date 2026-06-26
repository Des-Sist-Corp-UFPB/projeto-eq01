import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.css'
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
      this.editSenha = '';
      this.isEditMode.set(true);
      this.editError.set('');
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  onSaveProfile() {
    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.editError.set('');

    const payload = {
      nome: this.editNome,
      email: this.editEmail,
      cargo: this.editCargo,
      senha: this.editSenha || undefined // Envia apenas se alterada
    };

    this.authService.atualizarPerfil(user.id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.editError.set(err.error?.message || 'Falha ao atualizar perfil. Verifique os dados inseridos.');
      }
    });
  }
}


