import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GrupoService, Grupo } from '../../services/grupo.service';
import { ProjectService, Projeto } from '../../../projects/services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { apiUrl } from '../../../../core/config/api.config';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';

export interface Membro {
  nome: string;
  papel: string;
  fotoUrl: string;
}

export interface Vaga {
  id: string;
  cargo: string;
  tipo: string;
  requisitos: string;
  candidatos: string[]; // List of member names who applied
}

export interface FeedComment {
  id: string;
  content: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorUsername?: string;
  timestamp: string;
  likesCount?: number;
  likedByCurrentUser?: boolean;
}

export interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorUsername?: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  timestamp: string;
  comments: FeedComment[];
  postType?: string;
}

@Component({
  selector: 'app-grupo-detalhe-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProjectCardComponent],
  templateUrl: './grupo-detalhe.page.html',
  styleUrl: './grupo-detalhe.page.css'
})
export class GrupoDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly grupoService = inject(GrupoService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  // Fallback cover image
  protected readonly fallbackCover = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200';

  // Signals
  protected readonly grupo = signal<Grupo | null>(null);
  protected readonly groupProjects = signal<Projeto[]>([]);
  
  // Custom interactive state signals
  protected readonly members = signal<Membro[]>([]);
  protected readonly vagas = signal<Vaga[]>([]);
  
  // Add vacancy form inputs
  protected readonly showAddVagaForm = signal<boolean>(false);
  protected novaVagaCargo = '';
  protected novaVagaTipo = 'Bolsista';
  protected novaVagaRequisitos = '';

  // Tab State
  protected readonly activeTab = signal<'forum' | 'mural' | 'links' | 'membros_tab'>('forum');

  // Group Feed Signals
  protected readonly groupFeedPosts = signal<FeedPost[]>([]);
  protected readonly isFeedLoading = signal<boolean>(false);
  protected readonly newPostContent = signal<string>('');
  protected readonly newPostImageUrl = signal<string>('');
  protected readonly isCreatingPost = signal<boolean>(false);
  protected readonly dragOverActive = signal<boolean>(false);
  protected commentInputs: { [postId: string]: string } = {};

  // Logged in user session
  protected readonly currentUser = this.authService.currentUser;

  // Mock list of member candidates default avatars
  private readonly mockAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.grupoService.obterPorId(id).subscribe({
        next: (gp) => {
          this.grupo.set(gp);
          this.loadProjects(gp.nome);
          this.loadMembersAndVagas(id, gp.responsavel);
        },
        error: (err) => {
          console.error('Erro ao buscar grupo por ID. Usando dados Mock para testes.', err);
          // Fallback mock group for instant preview & testing
          const mockGp: Grupo = {
            id: id,
            nome: `Grupo Acadêmico Mock ${id}`,
            descricao: 'Este é um grupo de estudos e projetos criado localmente. Aqui, alunos e pesquisadores colaboram no desenvolvimento de soluções de software e artigos científicos aplicados.',
            area: 'Institucional',
            responsavel: 'Gabriel Costa',
            tipo: 'Aberto',
            cor: '#1f7ae0',
            logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'
          };
          this.grupo.set(mockGp);
          this.loadProjects(mockGp.nome);
          this.loadMembersAndVagas(id, mockGp.responsavel);
        }
      });
    }
  }

  loadProjects(grupoNome: string) {
    this.projectService.listar().subscribe(projs => {
      const filtered = projs.filter(p => 
        p.grupoPertencente && p.grupoPertencente.trim().toLowerCase() === grupoNome.trim().toLowerCase()
      );
      this.groupProjects.set(filtered);
    });
  }

  loadMembersAndVagas(grupoId: string, responsavel?: string) {
    // 1. Members
    const cachedMembers = localStorage.getItem(`nexushub_group_members_${grupoId}`);
    const parsedMembers: Membro[] = cachedMembers ? JSON.parse(cachedMembers) : [];
    
    if (responsavel) {
      const coordIndex = parsedMembers.findIndex(m => m.papel === 'Coordenador Geral');
      if (coordIndex > -1) {
        if (parsedMembers[coordIndex].nome !== responsavel) {
          parsedMembers[coordIndex].nome = responsavel;
          localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(parsedMembers));
        }
      } else if (cachedMembers) {
        parsedMembers.unshift({
          nome: responsavel,
          papel: 'Coordenador Geral',
          fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        });
        localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(parsedMembers));
      }
    }

    if (parsedMembers.length > 0) {
      this.members.set(parsedMembers);
    } else {
      // Default members list (only the coordinator responsible, no mocks)
      const defaultMembers: Membro[] = [];
      if (responsavel) {
        defaultMembers.push({
          nome: responsavel,
          papel: 'Coordenador Geral',
          fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        });
      }
      
      localStorage.setItem(`nexushub_group_members_${grupoId}`, JSON.stringify(defaultMembers));
      this.members.set(defaultMembers);
    }

    // 2. Vacancies (Vagas)
    const cachedVagas = localStorage.getItem(`nexushub_group_vacancies_${grupoId}`);
    if (cachedVagas) {
      this.vagas.set(JSON.parse(cachedVagas));
    } else {
      // Empty list for newly created groups
      const defaultVagas: Vaga[] = [];
      localStorage.setItem(`nexushub_group_vacancies_${grupoId}`, JSON.stringify(defaultVagas));
      this.vagas.set(defaultVagas);
    }
  }

  setTab(tab: 'forum' | 'mural' | 'links' | 'membros_tab') {
    this.activeTab.set(tab);
    if (tab === 'mural') {
      this.loadGroupFeed();
    }
  }

  loadGroupFeed() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isFeedLoading.set(true);
    this.http.get<FeedPost[]>(apiUrl(`/api/feed/grupo/${id}?page=0&size=20`)).subscribe({
      next: (posts) => {
        this.groupFeedPosts.set(posts);
        this.isFeedLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar feed do grupo', err);
        this.isFeedLoading.set(false);
        this.toastService.show('Erro ao carregar o feed do grupo.', 'error');
      }
    });
  }

  isCoordinator(): boolean {
    const user = this.currentUser();
    const gp = this.grupo();
    if (!user || !gp) return false;
    return gp.responsavel ? user.nome.trim().toLowerCase() === gp.responsavel.trim().toLowerCase() : false;
  }

  isMembroCoordenador(membroNome: string): boolean {
    const gp = this.grupo();
    if (!gp || !gp.responsavel) return false;
    return membroNome.trim().toLowerCase() === gp.responsavel.trim().toLowerCase();
  }

  isJoinedUser(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return this.members().some(m => m.nome.trim().toLowerCase() === user.nome.trim().toLowerCase());
  }

  joinGroup() {
    const user = this.currentUser();
    if (!user) return;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || this.isJoinedUser()) return;

    const novoMembro: Membro = {
      nome: user.nome,
      papel: 'Membro Colaborador',
      fotoUrl: this.mockAvatars[Math.floor(Math.random() * this.mockAvatars.length)]
    };

    this.members.update(list => {
      const updated = [...list, novoMembro];
      localStorage.setItem(`nexushub_group_members_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  leaveGroup() {
    const user = this.currentUser();
    if (!user) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    if (this.isMembroCoordenador(user.nome)) {
      alert('O Coordenador Geral não pode sair do grupo.');
      return;
    }

    this.members.update(list => {
      const updated = list.filter(m => m.nome.trim().toLowerCase() !== user.nome.trim().toLowerCase());
      localStorage.setItem(`nexushub_group_members_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  adicionarVaga() {
    if (!this.novaVagaCargo.trim() || !this.novaVagaRequisitos.trim()) {
      alert('Por favor, preencha o cargo e os requisitos da vaga.');
      return;
    }
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const nova: Vaga = {
      id: `vaga_${id}_${Date.now()}`,
      cargo: this.novaVagaCargo,
      tipo: this.novaVagaTipo,
      requisitos: this.novaVagaRequisitos,
      candidatos: []
    };

    this.vagas.update(list => {
      const updated = [...list, nova];
      localStorage.setItem(`nexushub_group_vacancies_${id}`, JSON.stringify(updated));
      return updated;
    });

    // Reset form
    this.novaVagaCargo = '';
    this.novaVagaRequisitos = '';
    this.showAddVagaForm.set(false);
  }

  hasApplied(vaga: Vaga): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return vaga.candidatos.includes(user.nome);
  }

  toggleCandidatura(vagaId: string) {
    const user = this.currentUser();
    if (!user) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.vagas.update(list => {
      const updated = list.map(v => {
        if (v.id === vagaId) {
          const jaCandidato = v.candidatos.includes(user.nome);
          const novosCandidatos = jaCandidato 
            ? v.candidatos.filter(c => c !== user.nome)
            : [...v.candidatos, user.nome];
          return { ...v, candidatos: novosCandidatos };
        }
        return v;
      });
      localStorage.setItem(`nexushub_group_vacancies_${id}`, JSON.stringify(updated));
      return updated;
    });
  }

  excluirGrupo() {
    const gp = this.grupo();
    if (!gp || !gp.id) return;
    
    if (confirm(`Tem certeza absoluta de que deseja excluir o grupo "${gp.nome}" permanentemente? Todos os dados associados serão perdidos.`)) {
      this.grupoService.deletar(gp.id).subscribe({
        next: () => {
          localStorage.removeItem(`nexushub_group_members_${gp.id}`);
          localStorage.removeItem(`nexushub_group_vacancies_${gp.id}`);
          alert('Grupo excluído com sucesso!');
          this.router.navigate(['/grupos']);
        },
        error: (err) => {
          console.error('Erro ao excluir grupo', err);
          alert('Falha ao excluir o grupo. Verifique se o backend está ativo!');
        }
      });
    }
  }

  // --- Group Feed Post Actions ---

  onCreateGroupPost() {
    const content = this.newPostContent().trim();
    if (!content) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isCreatingPost.set(true);

    const payload = {
      content: content,
      imageUrl: this.newPostImageUrl().trim() || undefined,
      postType: 'COMMUNITY',
      groupId: id
    };

    this.http.post(apiUrl('/api/feed'), payload).subscribe({
      next: () => {
        this.newPostContent.set('');
        this.newPostImageUrl.set('');
        this.isCreatingPost.set(false);
        this.loadGroupFeed();
        this.toastService.show('Publicação criada no grupo!', 'success');
      },
      error: (err) => {
        this.isCreatingPost.set(false);
        this.toastService.show('Não foi possível publicar no grupo.', 'error');
      }
    });
  }

  onToggleLike(post: FeedPost) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Faça login para curtir.', 'error');
      return;
    }
    this.http.post<{ liked: boolean }>(apiUrl(`/api/feed/${post.id}/like`), {}).subscribe({
      next: (res) => {
        post.likedByCurrentUser = res.liked;
        post.likesCount += res.liked ? 1 : -1;
      },
      error: () => {
        this.toastService.show('Falha ao curtir publicação.', 'error');
      }
    });
  }

  onToggleCommentLike(post: FeedPost, comment: FeedComment) {
    if (!this.authService.isLoggedIn()) return;
    this.http.post<{ liked: boolean }>(apiUrl(`/api/feed/comentarios/${comment.id}/like`), {}).subscribe({
      next: (res) => {
        comment.likedByCurrentUser = res.liked;
        comment.likesCount = res.liked ? (comment.likesCount || 0) + 1 : Math.max(0, (comment.likesCount || 0) - 1);
      },
      error: () => {
        this.toastService.show('Falha ao curtir comentário.', 'error');
      }
    });
  }

  onAddComment(postId: string) {
    const commentText = (this.commentInputs[postId] || '').trim();
    if (!commentText) return;

    const payload = {
      content: commentText
    };

    this.http.post<FeedComment>(apiUrl(`/api/feed/${postId}/comentarios`), payload).subscribe({
      next: (newComment) => {
        this.commentInputs[postId] = '';
        const posts = this.groupFeedPosts().map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, newComment]
            };
          }
          return p;
        });
        this.groupFeedPosts.set(posts);
        this.toastService.show('Comentário adicionado!', 'success');
      },
      error: () => {
        this.toastService.show('Falha ao adicionar comentário.', 'error');
      }
    });
  }

  triggerFileSelect(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onFileDropped(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.toastService.show('Selecione apenas arquivos de imagem.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 600;
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
          this.newPostImageUrl.set(canvas.toDataURL('image/jpeg', 0.8));
          this.toastService.show('Imagem anexada!', 'success');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}
