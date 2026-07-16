import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProjectService, Projeto } from '../../services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SolicitacaoService, SolicitacaoEntrada } from '../../../requests/services/solicitacao.service';
import { ToastService } from '../../../../core/services/toast.service';
import { apiUrl } from '../../../../core/config/api.config';

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
  selector: 'app-projeto-detalhe-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './projeto-detalhe.page.html',
  styleUrl: './projeto-detalhe.page.css'
})
export class ProjetoDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  // Reative States
  protected readonly projeto = signal<Projeto | null>(null);
  protected readonly solicitacoes = signal<SolicitacaoEntrada[]>([]);
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());

  // Workspace signals
  protected readonly isOwner = computed(() => {
    const proj = this.projeto();
    const user = this.currentUser();
    if (!proj || !user) return false;
    return proj.autor === user.nome;
  });

  // Join form signals
  protected motivo = '';
  protected readonly isSending = signal(false);
  protected readonly joinError = signal('');
  protected readonly solicitacaoSucesso = signal(false);

  // Tab State
  protected readonly activeTab = signal<'info' | 'feed'>('info');

  // Project Feed Signals
  protected readonly projectFeedPosts = signal<FeedPost[]>([]);
  protected readonly isFeedLoading = signal<boolean>(false);
  protected readonly newPostContent = signal<string>('');
  protected readonly newPostImageUrl = signal<string>('');
  protected readonly isCreatingPost = signal<boolean>(false);
  protected readonly dragOverActive = signal<boolean>(false);
  protected commentInputs: { [postId: string]: string } = {};

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.loadProjectDetails(idStr);
      }
    });
  }

  loadProjectDetails(id: string) {
    this.projectService.obterPorId(id).subscribe({
      next: (proj) => {
        this.projeto.set(proj);
        // Se for o criador do projeto, busca as solicitações vinculadas
        if (this.isOwner()) {
          this.loadSolicitacoes(id);
        }
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  loadSolicitacoes(projetoId: string) {
    this.solicitacaoService.listarPorProjeto(projetoId).subscribe(sols => {
      this.solicitacoes.set(sols);
    });
  }

  enviarSolicitacao() {
    const proj = this.projeto();
    const user = this.currentUser();
    if (!proj || !user) return;

    this.isSending.set(true);
    this.joinError.set('');

    const requestPayload: SolicitacaoEntrada = {
      projetoId: proj.id!,
      usuarioId: user.id,
      usuarioEmail: user.email,
      usuarioNome: user.nome,
      motivo: this.motivo
    };

    this.solicitacaoService.criar(requestPayload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.solicitacaoSucesso.set(true);
        this.motivo = '';
      },
      error: (err) => {
        this.isSending.set(false);
        this.joinError.set(err.error?.message || 'Falha ao enviar a solicitação. Tente novamente.');
      }
    });
  }

  responderSolicitacao(solicitacaoId: string, aprovado: boolean) {
    this.solicitacaoService.responder(solicitacaoId, aprovado).subscribe({
      next: () => {
        const proj = this.projeto();
        if (proj && proj.id) {
          // Recarrega os dados do projeto para atualizar contador de membros e a lista de solicitações
          this.loadProjectDetails(proj.id);
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Ocorreu um erro ao processar a resposta.');
      }
    });
  }

  getTags(): string[] {
    const proj = this.projeto();
    if (!proj || !proj.tags) return [];
    return proj.tags.split(',');
  }

  setTab(tab: 'info' | 'feed') {
    this.activeTab.set(tab);
    if (tab === 'feed') {
      this.loadProjectFeed();
    }
  }

  loadProjectFeed() {
    const proj = this.projeto();
    if (!proj || !proj.id) return;

    this.isFeedLoading.set(true);
    this.http.get<FeedPost[]>(apiUrl(`/api/feed/projeto/${proj.id}?page=0&size=20`)).subscribe({
      next: (posts) => {
        this.projectFeedPosts.set(posts);
        this.isFeedLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar feed do projeto', err);
        this.isFeedLoading.set(false);
        this.toastService.show('Erro ao carregar o feed do projeto.', 'error');
      }
    });
  }

  onCreateProjectPost() {
    const content = this.newPostContent().trim();
    if (!content) return;

    const proj = this.projeto();
    if (!proj || !proj.id) return;

    this.isCreatingPost.set(true);

    const payload = {
      content: content,
      imageUrl: this.newPostImageUrl().trim() || undefined,
      postType: 'PROJECT',
      projectId: proj.id
    };

    this.http.post(apiUrl('/api/feed'), payload).subscribe({
      next: () => {
        this.newPostContent.set('');
        this.newPostImageUrl.set('');
        this.isCreatingPost.set(false);
        this.loadProjectFeed();
        this.toastService.show('Publicação criada no projeto!', 'success');
      },
      error: (err) => {
        this.isCreatingPost.set(false);
        this.toastService.show('Não foi possível publicar no projeto.', 'error');
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
        const posts = this.projectFeedPosts().map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, newComment]
            };
          }
          return p;
        });
        this.projectFeedPosts.set(posts);
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


