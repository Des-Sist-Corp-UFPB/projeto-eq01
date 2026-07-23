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

  // Handle Logo Upload and convert to Base64 DataURL (with Canvas compression)
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
            this.newGroup.logo = canvas.toDataURL('image/jpeg', 0.7);
          }
        };
        img.src = e.target?.result as string;
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
        console.error('Erro ao cadastrar grupo:', err);
        if (err.error) {
          console.error('Detalhes do erro do backend:', err.error);
        }
        alert('Ocorreu um erro ao criar o grupo. Verifique o console para mais detalhes.');
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
    if (confirm(`Tem certeza absoluta de que deseja excluir o grupo "${gp.nome}"? Todos os dados associados serão perdidos.`)) {
      this.grupoService.deletar(gp.id).subscribe({
        next: () => {
          localStorage.removeItem(`nexushub_group_members_${gp.id}`);
          localStorage.removeItem(`nexushub_group_vacancies_${gp.id}`);
          alert('Grupo excluído com sucesso!');
          this.carregarDados();
        },
        error: (err) => {
          console.error('Erro ao excluir grupo', err);
          alert('Falha ao excluir o grupo. Verifique se o backend está ativo!');
        }
      });
    }
  }

  isGroupFavorited(id?: string): boolean {
    if (!id) return false;
    const user = this.authService.currentUser();
    if (!user) return false;
    const favsStr = localStorage.getItem(`nexushub_fav_groups_${user.id}`);
    if (favsStr) {
      try {
        const parsed = JSON.parse(favsStr);
        return Array.isArray(parsed) && parsed.includes(id);
      } catch {
        return false;
      }
    }
    return false;
  }

  toggleFavoriteGroup(gp: Grupo, event: Event) {
    event.stopPropagation();
    if (!gp.id) return;
    const user = this.authService.currentUser();
    if (!user) {
      alert('Você precisa estar logado para favoritar um grupo!');
      return;
    }

    const favsKey = `nexushub_fav_groups_${user.id}`;
    const favsStr = localStorage.getItem(favsKey);
    let parsed: string[] = [];
    if (favsStr) {
      try {
        const decoded = JSON.parse(favsStr);
        if (Array.isArray(decoded)) {
          parsed = decoded;
        }
      } catch {
        parsed = [];
      }
    }
    if (!Array.isArray(parsed)) parsed = [];

    if (parsed.includes(gp.id)) {
      parsed = parsed.filter((id: string) => id !== gp.id);
    } else {
      parsed.push(gp.id);
    }
    localStorage.setItem(favsKey, JSON.stringify(parsed));
  }

  getGroupLikesCount(gp: Grupo): number {
    if (!gp.id) return 0;
    let hash = 0;
    for (let i = 0; i < gp.id.length; i++) {
      hash += gp.id.charCodeAt(i);
    }
    const baseLikes = (hash % 10) + 4;
    return this.isGroupFavorited(gp.id) ? baseLikes + 1 : baseLikes;
  }
}

interface BentoProject {
  id?: string;
  nome: string;
  resumo: string;
  imagemCardUrl?: string;
}



