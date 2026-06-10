import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrupoService, Grupo } from '../../services/grupo.service';
import { ProjectService, Projeto } from '../../../projects/services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-grupos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './grupos.page.html',
  styleUrl: './grupos.page.css'
})
export class GruposPageComponent implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // Fallback cover image
  protected readonly fallbackCover = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500';

  // Search Query state
  protected readonly searchQuery = signal<string>('');

  // Show creation panel state
  protected readonly showCreateForm = signal<boolean>(false);

  // States for groups and projects
  protected readonly grupos = signal<Grupo[]>([]);
  protected readonly allProjects = signal<Projeto[]>([]);

  // Presets for Creation Visual Identity
  protected readonly colorPresets = [
    '#1e3a8a', // Dark Navy
    '#0f766e', // Teal
    '#4338ca', // Indigo
    '#b91c1c', // Crimson Red
    '#b45309', // Amber
    '#059669', // Emerald
    '#7c3aed', // Purple
    '#db2777'  // Pink/Rose
  ];

  // Form Model
  protected newGroup: Grupo = {
    nome: '',
    descricao: '',
    area: 'Institucional',
    tipo: 'Aberto',
    cor: '#1e3a8a',
    logo: ''
  };

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.grupoService.listar().subscribe(gps => {
      this.grupos.set(gps);
    });

    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update(val => !val);
  }

  // Handle Logo Upload and convert to Base64 DataURL
  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.newGroup.logo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Horizontal scroll utility for custom carousels
  scroll(element: HTMLDivElement, offset: number) {
    element.scrollBy({ left: offset, behavior: 'smooth' });
  }

  // Filter groups by query search
  getFilteredGroups(): Grupo[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.grupos();
    }
    return this.grupos().filter(gp => 
      gp.nome.toLowerCase().includes(query) || 
      gp.descricao.toLowerCase().includes(query)
    );
  }

  // Filter group categories
  getFilteredByCategory(category: string): Grupo[] {
    return this.getFilteredGroups().filter(gp => 
      gp.area && gp.area.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  getLinkedProjects(grupoNome: string): BentoProject[] {
    return this.allProjects().filter(p => 
      p.grupoPertencente && p.grupoPertencente.trim().toLowerCase() === grupoNome.trim().toLowerCase()
    );
  }

  onSubmit() {
    if (!this.newGroup.nome || !this.newGroup.descricao) return;

    const user = this.authService.currentUser();
    if (!user) {
      alert('Voce precisa estar logado para criar um grupo.');
      return;
    }

    const request: Grupo = {
      ...this.newGroup,
      responsavel: user.nome,
      criadorId: user.id
    };

    this.grupoService.criar(request).subscribe({
      next: () => {
        // Reset form and close
        this.newGroup = {
          nome: '',
          descricao: '',
          area: 'Institucional',
          tipo: 'Aberto',
          cor: '#1e3a8a',
          logo: '',
          responsavel: ''
        };
        this.showCreateForm.set(false);
        // Reload list
        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao cadastrar grupo', err);
        alert('Ocorreu um erro ao criar o grupo. Verifique se o backend estÃ¡ rodando!');
      }
    });
  }

  isGroupLeader(gp: Grupo): boolean {
    const user = this.authService.currentUser();
    if (!user || !gp || !gp.responsavel) return false;
    return gp.responsavel.trim().toLowerCase() === user.nome.trim().toLowerCase();
  }

  excluirGrupoLista(gp: Grupo) {
    if (!gp || !gp.id) return;
    if (confirm(`Tem certeza absoluta de que deseja excluir o grupo "${gp.nome}"? Todos os dados associados serÃ£o perdidos.`)) {
      this.grupoService.deletar(gp.id).subscribe({
        next: () => {
          localStorage.removeItem(`nexushub_group_members_${gp.id}`);
          localStorage.removeItem(`nexushub_group_vacancies_${gp.id}`);
          alert('Grupo excluÃ­do com sucesso!');
          this.carregarDados();
        },
        error: (err) => {
          console.error('Erro ao excluir grupo', err);
          alert('Falha ao excluir o grupo. Verifique se o backend estÃ¡ ativo!');
        }
      });
    }
  }
}

interface BentoProject {
  id?: string;
  nome: string;
  resumo: string;
  imagemCardUrl?: string;
}



