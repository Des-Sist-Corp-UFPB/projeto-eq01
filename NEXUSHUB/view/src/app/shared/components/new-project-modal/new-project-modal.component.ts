import { Component, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ProjectService, ProjetoRequest } from '../../../features/projects/services/project.service';
import { GrupoService, Grupo } from '../../../features/groups/services/grupo.service';

@Component({
  selector: 'app-new-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project-modal.component.html',
  styleUrl: './new-project-modal.component.css'
})
export class NewProjectModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly projectService = inject(ProjectService);
  private readonly grupoService = inject(GrupoService);
  private readonly authService = inject(AuthService);
  protected readonly currentStep = signal(1);
  protected readonly myGroups = signal<Grupo[]>([]);
  protected readonly hasNoGroups = signal(false);
  protected readonly generatingDraft = signal(false);
  protected readonly aiError = signal('');
  protected aiIdea = '';

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
    grupoPertencente: '',
    imagemCardUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    imagemLandingUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    xpDistribuido: 250 // XP padrão
  };

  ngOnInit() {
    this.loadUserGroups();
  }

  loadUserGroups() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.grupoService.listar().subscribe({
      next: (groups) => {
        const filtered = groups.filter(g => {
          if (g.responsavel && g.responsavel.trim().toLowerCase() === user.nome.trim().toLowerCase()) {
            return true;
          }
          const cached = localStorage.getItem(`nexushub_group_members_${g.id}`);
          if (cached) {
            try {
              const members = JSON.parse(cached);
              return Array.isArray(members) && members.some((m: { nome?: string }) => m.nome && m.nome.trim().toLowerCase() === user.nome.trim().toLowerCase());
            } catch {
              return false;
            }
          }
          return false;
        });

        this.myGroups.set(filtered);
        this.hasNoGroups.set(filtered.length === 0);

        if (filtered.length > 0) {
          this.formModel.grupoPertencente = filtered[0].nome;
        } else {
          this.formModel.grupoPertencente = '';
        }
      },
      error: (err) => {
        console.error('Erro ao carregar grupos para o modal', err);
      }
    });
  }

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

  generateDraft() {
    const idea = this.aiIdea.trim();
    if (idea.length < 10 || this.generatingDraft()) return;

    this.generatingDraft.set(true);
    this.aiError.set('');
    this.projectService.sugerirRascunho(idea).subscribe({
      next: (draft) => {
        this.formModel = { ...this.formModel, ...draft };
        this.generatingDraft.set(false);
      },
      error: (error) => {
        const message = error?.error?.message || error?.error?.detail;
        this.aiError.set(message || 'Nao foi possivel gerar a sugestao agora. Tente novamente.');
        this.generatingDraft.set(false);
      }
    });
  }

  isStepValid(): boolean {
    if (this.currentStep() === 1) {
      return this.formModel.nome.trim() !== '' && this.formModel.resumo.trim() !== '';
    }
    if (this.currentStep() === 2) {
      return !this.hasNoGroups() && !!this.formModel.grupoPertencente && !!this.formModel.visibilidade;
    }
    return true;
  }

  submitForm() {
    const user = this.authService.currentUser();
    if (!user) {
      console.error('Usuario nao autenticado para criar projeto.');
      return;
    }

    if (this.hasNoGroups()) {
      alert('Você precisa fazer parte de pelo menos um grupo para cadastrar o projeto.');
      return;
    }

    const selectedGroup = this.myGroups().find(g => g.nome === this.formModel.grupoPertencente);

    const request: ProjetoRequest = {
      ...this.formModel,
      grupoId: selectedGroup?.id,
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



