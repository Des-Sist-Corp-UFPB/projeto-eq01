import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.css'
})
export class OnboardingPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected nome = this.currentUser()?.nome || '';
  protected birthDateInput = '';
  protected showBirthday = true;
  protected course = '';
  protected period = '';
  protected lgpdConsent = false;

  onBirthDateInput(event: Event) {
    let value = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length >= 5) {
      this.birthDateInput = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      this.birthDateInput = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      this.birthDateInput = value;
    }
  }

  onSubmit() {
    const user = this.currentUser();
    if (!user) {
      this.errorMessage.set('Você precisa estar logado para completar o onboarding.');
      return;
    }

    if (!this.nome.trim() || this.birthDateInput.length !== 10 || !this.course.trim() || !this.period.trim() || !this.lgpdConsent) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios corretamente (incluindo a data no formato DD/MM/AAAA) e aceite os termos.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const parts = this.birthDateInput.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const payload = {
      nome: this.nome.trim(),
      birthDate: formattedDate, // expects yyyy-MM-dd
      showBirthday: this.showBirthday,
      course: this.course.trim(),
      period: this.period.trim(),
      username: user.username || this.nome.trim().toLowerCase().replace(/\s+/g, '.'),
      lgpdConsent: this.lgpdConsent
    };

    this.authService.completarOnboarding(user.id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao salvar dados de onboarding. Tente novamente.');
      }
    });
  }
}
