import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ProjectService, ProjetoRequest } from '../../../features/projects/services/project.service';

@Component({
  selector: 'app-new-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project-modal.component.html',
  styleUrl: './new-project-modal.component.css'
})
export class NewProjectModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  protected readonly currentStep = signal(1);

  protected readonly presetCovers = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500'
  ];

  protected formModel: ProjetoRequest = {
    nome: '',
    resumo: '',
    objetivos: '',
    categoria: '',
    tipo: 'Desenvolvimento',
    tags: '',
    visibilidade: 'PUBLICO_ABERTO',
    grupoPertencente: 'Laboratorio de Inovacao e Ideias',
    imagemCardUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    imagemLandingUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    xpDistribuido: 250 // XP padrão
  };

  close() {
    this.closed.emit();
  }

  nextStep() {
    if (this.currentStep() < 3 && this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  selectPreset(url: string) {
    this.formModel.imagemCardUrl = url;
    this.formModel.imagemLandingUrl = url;
  }

  isStepValid(): boolean {
    if (this.currentStep() === 1) {
      return this.formModel.nome.trim() !== '' && this.formModel.resumo.trim() !== '';
    }
    if (this.currentStep() === 2) {
      return !!this.formModel.grupoPertencente && !!this.formModel.visibilidade;
    }
    return true;
  }

  submitForm() {
    const user = this.authService.currentUser();
    if (!user) {
      console.error('Usuario nao autenticado para criar projeto.');
      return;
    }

    const request: ProjetoRequest = {
      ...this.formModel,
      autorId: user.id,
      autor: user.nome
    };

    this.projectService.criar(request).subscribe({
      next: () => {
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        console.error('Erro ao salvar projeto', err);
      }
    });
  }
}



