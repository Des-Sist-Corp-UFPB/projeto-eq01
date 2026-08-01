import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { GrupoService, Grupo } from '../../../features/groups/services/grupo.service';

@Component({
  selector: 'app-new-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-group-modal.component.html',
  styleUrl: './new-group-modal.component.css'
})
export class NewGroupModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly grupoService = inject(GrupoService);
  private readonly authService = inject(AuthService);
  
  protected readonly currentStep = signal(1);
  protected readonly generatingDraft = signal(false);
  protected readonly aiError = signal('');
  protected aiIdea = '';

  protected readonly colorPresets = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316'  // orange
  ];

  protected formModel: Grupo = {
    nome: '',
    descricao: '',
    area: 'Institucional',
    tipo: 'Aberto',
    logo: '',
    cor: '#3b82f6'
  };

  close() {
    this.closed.emit();
  }

  nextStep() {
    if (this.currentStep() < 2 && this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  generateDraft() {
    const idea = this.aiIdea.trim();
    if (idea.length < 10 || this.generatingDraft()) return;

    this.generatingDraft.set(true);
    this.aiError.set('');
    this.grupoService.sugerirRascunho(idea).subscribe({
      next: (draft) => {
        this.formModel = { ...this.formModel, ...draft };
        this.generatingDraft.set(false);
      },
      error: (error) => {
        const message = error?.error?.message || error?.error?.detail;
        this.aiError.set(message || 'Não foi possível gerar a sugestão agora. Tente novamente.');
        this.generatingDraft.set(false);
      }
    });
  }

  isStepValid(): boolean {
    if (this.currentStep() === 1) {
      return this.formModel.nome.trim() !== '' && this.formModel.descricao.trim() !== '';
    }
    return true;
  }

  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 300;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            this.formModel.logo = canvas.toDataURL('image/jpeg', 0.7);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submitForm() {
    const user = this.authService.currentUser();
    if (!user) {
      console.error('Usuário não autenticado para criar grupo.');
      return;
    }

    this.formModel.criadorId = user.id;

    this.grupoService.criar(this.formModel).subscribe({
      next: () => {
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        console.error('Erro ao salvar grupo', err);
      }
    });
  }
}
