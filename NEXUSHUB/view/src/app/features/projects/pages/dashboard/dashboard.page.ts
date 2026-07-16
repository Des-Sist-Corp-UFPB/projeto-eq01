import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProjectService, Projeto } from '../../services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { NewProjectModalComponent } from '../../../../shared/components/new-project-modal/new-project-modal.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { apiUrl } from '../../../../core/config/api.config';
import { ToastService } from '../../../../core/services/toast.service';
import { GrupoService, Grupo } from '../../../groups/services/grupo.service';

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
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, NewProjectModalComponent, ProjectCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly grupoService = inject(GrupoService);

  // States
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly showCreateModal = signal(false);
  protected readonly searchQuery = signal('');

  // Social Feed States
  protected readonly feedPosts = signal<FeedPost[]>([]);
  protected readonly dragOverActive = signal(false);
  protected readonly feedFilter = signal<string>('ALL');
  protected readonly feedPage = signal(0);
  protected readonly feedLoadingMore = signal(false);
  protected readonly feedHasMore = signal(true);
  protected readonly filteredFeedPosts = computed(() => {
    const filter = this.feedFilter();
    const posts = this.feedPosts();
    if (filter === 'ALL') {
      return posts;
    }
    return posts.filter(p => p.postType === filter);
  });
  protected readonly newPostContent = signal('');
  protected readonly newPostImageUrl = signal('');
  protected readonly newPostType = signal('USER');
  protected readonly isCreatingPost = signal(false);
  protected readonly feedErrorMessage = signal('');
  protected readonly isInitialFeedLoading = signal(true);

  // Track comment input per post
  protected commentInputs: { [postId: string]: string } = {};

  // Project Lists (allProjects for search, myProjects for sidebar widget)
  protected readonly allProjects = signal<Projeto[]>([]);
  protected readonly myProjects = signal<Projeto[]>([]);

  // Campus Metrics
  protected readonly activeProjectsCount = computed(() => this.allProjects().filter(p => p.status === '2').length);
  protected readonly propostoCount = computed(() => this.allProjects().filter(p => p.status === '1').length);
  protected readonly ativoCount = computed(() => this.allProjects().filter(p => p.status === '2').length);
  protected readonly emEsperaCount = computed(() => this.allProjects().filter(p => p.status === '3').length);
  protected readonly concluidoCount = computed(() => this.allProjects().filter(p => p.status === '4').length);
  protected readonly canceladoCount = computed(() => this.allProjects().filter(p => p.status === '5').length);
  
  protected readonly recentlyUpdatedProjects = computed(() => {
    return [...this.allProjects()]
      .sort((a, b) => {
        const da = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
        const db = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);
  });

  protected readonly communitiesCount = signal(0);
  protected readonly openEditsCount = signal(4); // Mock value for editais
  protected readonly opportunitiesCount = signal(7); // Mock value for opportunities/vagas

  ngOnInit() {
    this.loadAllData();
    if (this.isLoggedIn()) {
      this.loadFeed();
    }
  }

  loadAllData() {
    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
    });

    this.grupoService.listar().subscribe((grupos: Grupo[]) => {
      this.communitiesCount.set(grupos.length);
    });

    // Se estiver logado, puxa os projetos do usuário para o widget da sidebar
    const user = this.currentUser();
    if (user) {
      this.projectService.listarPorUsuario(user.nome).subscribe(projs => {
        this.myProjects.set(projs);
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isLoggedIn()) return;
    const threshold = 200; // px before bottom
    const position = (window.innerHeight + window.scrollY);
    const height = document.documentElement.scrollHeight;
    if (position >= height - threshold) {
      this.loadMoreFeed();
    }
  }

  loadFeed() {
    if (!this.isLoggedIn()) return;
    this.isInitialFeedLoading.set(true);
    this.feedPage.set(0);
    this.feedHasMore.set(true);
    this.http.get<FeedPost[]>(apiUrl('/api/feed?page=0&size=5')).subscribe({
      next: (posts) => {
        this.feedPosts.set(posts);
        if (posts.length < 5) {
          this.feedHasMore.set(false);
        }
        this.isInitialFeedLoading.set(false);
      },
      error: (err) => {
        this.feedErrorMessage.set('Erro ao carregar postagens.');
        this.isInitialFeedLoading.set(false);
      }
    });
  }

  loadMoreFeed() {
    if (!this.isLoggedIn()) return;
    if (this.feedLoadingMore() || !this.feedHasMore()) return;

    this.feedLoadingMore.set(true);
    const nextPage = this.feedPage() + 1;
    this.http.get<FeedPost[]>(apiUrl(`/api/feed?page=${nextPage}&size=5`)).subscribe({
      next: (posts) => {
        if (posts.length > 0) {
          this.feedPosts.set([...this.feedPosts(), ...posts]);
          this.feedPage.set(nextPage);
        }
        if (posts.length < 5) {
          this.feedHasMore.set(false);
        }
        this.feedLoadingMore.set(false);
      },
      error: (err) => {
        this.feedLoadingMore.set(false);
        this.toastService.show('Erro ao carregar mais publicações.', 'error');
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
      this.toastService.show('Por favor, selecione apenas arquivos de imagem.', 'error');
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

  onCreatePost() {
    const content = this.newPostContent().trim();
    if (!content) return;

    this.isCreatingPost.set(true);
    this.feedErrorMessage.set('');

    const payload = {
      content: content,
      imageUrl: this.newPostImageUrl().trim() || undefined,
      postType: this.newPostType()
    };

    this.http.post(apiUrl('/api/feed'), payload).subscribe({
      next: () => {
        this.newPostContent.set('');
        this.newPostImageUrl.set('');
        this.newPostType.set('USER');
        this.isCreatingPost.set(false);
        this.loadFeed();
        this.toastService.show('Publicação criada com sucesso!', 'success');
      },
      error: (err) => {
        this.isCreatingPost.set(false);
        this.feedErrorMessage.set('Não foi possível publicar a postagem.');
        this.toastService.show('Não foi possível publicar a postagem.', 'error');
      }
    });
  }

  onToggleLike(post: FeedPost) {
    if (!this.isLoggedIn()) return;
    this.http.post<{ liked: boolean }>(apiUrl(`/api/feed/${post.id}/like`), {}).subscribe({
      next: (res) => {
        post.likedByCurrentUser = res.liked;
        post.likesCount += res.liked ? 1 : -1;
        this.toastService.show(res.liked ? 'Publicação curtida!' : 'Curtida removida.', 'info');
      },
      error: () => {
        this.toastService.show('Falha ao curtir publicação.', 'error');
      }
    });
  }

  onToggleCommentLike(post: FeedPost, comment: FeedComment) {
    if (!this.isLoggedIn()) return;
    this.http.post<{ liked: boolean }>(apiUrl(`/api/feed/comentarios/${comment.id}/like`), {}).subscribe({
      next: (res) => {
        comment.likedByCurrentUser = res.liked;
        comment.likesCount = res.liked ? (comment.likesCount || 0) + 1 : Math.max(0, (comment.likesCount || 0) - 1);
        this.toastService.show(res.liked ? 'Comentário curtido!' : 'Curtida removida.', 'info');
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
        const post = this.feedPosts().find(p => p.id === postId);
        if (post) {
          post.comments = [...post.comments, newComment];
        }
        this.toastService.show('Comentário publicado!', 'success');
      },
      error: () => {
        this.toastService.show('Falha ao comentar.', 'error');
      }
    });
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'há alguns segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }

  formatPostContent(content: string): string {
    if (!content) return '';
    const safeContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return safeContent.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onProjectSaved() {
    this.loadAllData();
  }

  getFilteredProjects(): Projeto[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.allProjects().filter(p => 
      p.nome.toLowerCase().includes(query) || 
      (p.resumo && p.resumo.toLowerCase().includes(query)) ||
      (p.tags && p.tags.toLowerCase().includes(query)) ||
      (p.autor && p.autor.toLowerCase().includes(query))
    );
  }

  protected getGroupGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
      'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', // Purple
      'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Orange
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
      'linear-gradient(135deg, #10b981 0%, #047857 100%)'  // Green
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  onReportPost(post: FeedPost) {
    const reasons = [
      'Conteúdo Inadequado / Ofensivo',
      'Spam / Propaganda não solicitada',
      'Falsa identidade / Fake',
      'Outro'
    ];
    let promptMsg = 'Por favor, digite o número correspondente ao motivo da denúncia:\n';
    reasons.forEach((r, idx) => {
      promptMsg += `${idx + 1}. ${r}\n`;
    });
    
    const choice = window.prompt(promptMsg);
    if (!choice) return;
    
    let reason = '';
    const choiceNum = parseInt(choice.trim(), 10);
    if (choiceNum >= 1 && choiceNum <= 3) {
      reason = reasons[choiceNum - 1];
    } else if (choiceNum === 4 || choice.toLowerCase() === 'outro') {
      const customReason = window.prompt('Por favor, digite o motivo da denúncia:');
      if (!customReason || !customReason.trim()) return;
      reason = 'Outro: ' + customReason.trim();
    } else {
      alert('Opção inválida.');
      return;
    }
    
    const payload = {
      targetType: 'POST',
      targetId: post.id,
      reason: reason
    };
    
    this.http.post(apiUrl('/api/moderacao/denunciar'), payload).subscribe({
      next: () => {
        this.toastService.show('Denúncia enviada ao administrador!', 'success');
      },
      error: () => {
        this.toastService.show('Não foi possível registrar a denúncia.', 'error');
      }
    });
  }
}
