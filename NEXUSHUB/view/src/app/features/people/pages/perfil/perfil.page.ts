import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { apiUrl } from '../../../../core/config/api.config';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.css'
})
export class PerfilPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());

  protected readonly profileUser = signal<any | null>(null);
  protected readonly isOwnProfile = computed(() => {
    const prof = this.profileUser();
    const curr = this.currentUser();
    return !prof || (curr && prof.id === curr.id);
  });

  protected readonly activeTab = signal<'perfil' | 'recados' | 'feeds' | 'depoimentos'>('perfil');
  protected readonly followStatus = signal<{ following: boolean, followersCount: number, followingCount: number }>({ following: false, followersCount: 0, followingCount: 0 });
  protected readonly notificationsList = signal<any[]>([]);
  protected shareOnFeed = false;

  // Testimonials
  protected readonly testimonials = signal<any[]>([]);
  protected readonly pendingTestimonials = signal<any[]>([]);
  protected readonly testimonialInput = signal('');
  protected readonly isSendingTestimonial = signal(false);
  protected readonly testimonialError = signal('');

  // Posts
  protected readonly userPosts = signal<any[]>([]);
  protected readonly isLoadingPosts = signal(false);
  protected commentInputs: { [postId: string]: string } = {};

  protected readonly isEditMode = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly editError = signal('');

  protected editUsername = '';
  protected editNome = '';
  protected editEmail = '';
  protected editSenha = '';
  protected editFotoUrl = '';
  protected editBio = '';
  protected editBirthDate = '';
  protected editGenderType = 1;
  protected editGenderOther = '';
  protected editShowBirthday = true;
  protected editCourse = '';
  protected editPeriod = 1;
  protected editMatricula = '';
  protected editIngressPeriod = '';
  protected editConclusionPeriod = '';
  protected editWhatsapp = '';
  protected editGithubUrl = '';
  protected editInstagramUrl = '';
  protected editLinkedinUrl = '';
  protected editWebsiteUrl = '';
  protected editNotifRecommendations = true;
  protected editNotifApplications = true;
  protected editNotifAnnouncements = true;
  protected editNotifEdicts = true;
  protected editNotifAdmin = true;
  protected editExperience = '';
  protected editEducation = '';
  protected editCertification = '';

  protected editTechnologies: string[] = [];
  protected newTechInput = '';
  protected allTechnologiesSuggestions: string[] = [];

  ngOnInit() {
    this.loadTechnologies();
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      this.loadProfile(username);
    });
  }

  loadProfile(username?: string | null) {
    if (username) {
      this.http.get<any>(apiUrl(`/api/usuarios/username/${username}`)).subscribe({
        next: (user) => {
          this.profileUser.set(user);
          this.loadTestimonialsAndPosts(user);
          this.loadFollowStatus(user.username);
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
    } else {
      const user = this.currentUser();
      if (user) {
        this.profileUser.set(user);
        this.loadTestimonialsAndPosts(user);
        this.loadFollowStatus(user.username);
        this.loadNotifications();
      } else {
        // Wait for session initialization
        setTimeout(() => this.loadProfile(), 200);
      }
    }
  }

  loadFollowStatus(username?: string | null) {
    if (!username) return;
    this.http.get<any>(apiUrl(`/api/usuarios/perfil/${username}/seguir-status`)).subscribe({
      next: (status) => this.followStatus.set(status),
      error: () => {}
    });
  }

  onToggleFollow() {
    const user = this.profileUser();
    if (!user) return;
    this.http.post<any>(apiUrl(`/api/usuarios/perfil/${user.username}/seguir`), {}).subscribe({
      next: (status) => {
        this.followStatus.set(status);
        this.toastService.show(status.following ? 'Você agora está seguindo este perfil!' : 'Você deixou de seguir este perfil.', 'success');
      },
      error: (err) => {
        this.toastService.show(err.error?.message || 'Erro ao realizar ação.', 'error');
      }
    });
  }

  loadNotifications() {
    if (!this.isOwnProfile()) return;
    this.http.get<any[]>(apiUrl('/api/usuarios/notificacoes')).subscribe({
      next: (list) => this.notificationsList.set(list),
      error: () => {}
    });
  }

  onMarkNotificationRead(notif: any) {
    this.http.post(apiUrl(`/api/usuarios/notificacoes/${notif.id}/ler`), {}).subscribe({
      next: () => {
        notif.read = true;
        this.loadNotifications();
      },
      error: () => {}
    });
  }

  onReportProfile() {
    const user = this.profileUser();
    if (!user) return;

    const reasons = [
      'Conteúdo Inadequado / Ofensivo',
      'Spam / Propaganda não solicitada',
      'Falsa identidade / Fake',
      'Outro'
    ];
    let promptMsg = 'Por favor, digite o número correspondente ao motivo da denúncia do perfil:\n';
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
      const customReason = window.prompt('Por favor, digite o motivo da denúncia do perfil:');
      if (!customReason || !customReason.trim()) return;
      reason = 'Outro: ' + customReason.trim();
    } else {
      alert('Opção inválida.');
      return;
    }

    const payload = {
      targetType: 'USER',
      targetId: user.id,
      reason: reason
    };

    this.http.post(apiUrl('/api/moderacao/denunciar'), payload).subscribe({
      next: () => {
        this.toastService.show('Perfil denunciado com sucesso. A denúncia foi enviada ao administrador!', 'success');
      },
      error: () => {
        this.toastService.show('Não foi possível registrar a denúncia do perfil.', 'error');
      }
    });
  }

  onReportPost(post: any) {
    const reasons = [
      'Conteúdo Inadequado / Ofensivo',
      'Spam / Propaganda não solicitada',
      'Falsa identidade / Fake',
      'Outro'
    ];
    let promptMsg = 'Por favor, digite o número correspondente ao motivo da denúncia da publicação:\n';
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
      const customReason = window.prompt('Por favor, digite o motivo da denúncia da publicação:');
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
        this.toastService.show('Publicação denunciada. A denúncia foi enviada ao administrador!', 'success');
      },
      error: () => {
        this.toastService.show('Não foi possível registrar a denúncia da publicação.', 'error');
      }
    });
  }

  loadTestimonialsAndPosts(user: any) {
    // Load User Posts
    this.isLoadingPosts.set(true);
    this.http.get<any[]>(apiUrl(`/api/usuarios/username/${user.username}/posts`)).subscribe({
      next: (posts) => {
        this.userPosts.set(posts);
        this.isLoadingPosts.set(false);
      },
      error: () => this.isLoadingPosts.set(false)
    });

    // Load Accepted Testimonials
    this.http.get<any[]>(apiUrl(`/api/usuarios/perfil/${user.username}/depoimentos`)).subscribe({
      next: (list) => this.testimonials.set(list),
      error: () => {}
    });

    // Load Pending Testimonials if own profile
    if (this.isOwnProfile()) {
      this.http.get<any[]>(apiUrl('/api/usuarios/perfil/depoimentos/pendentes')).subscribe({
        next: (list) => this.pendingTestimonials.set(list),
        error: () => {}
      });
    } else {
      this.pendingTestimonials.set([]);
    }
  }

  loadTechnologies() {
    this.http.get<string[]>(apiUrl('/api/usuarios/tecnologias')).subscribe({
      next: (techs) => {
        this.allTechnologiesSuggestions = techs;
      },
      error: () => {}
    });
  }

  getInitials(): string {
    const user = this.profileUser();
    if (!user) return 'U';
    const names = user.nome.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return user.nome.charAt(0).toUpperCase();
  }

  formatBirthdate(dateStr?: string): string {
    if (!dateStr) return 'Não informada';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const user = this.profileUser();
      if (user && !user.showBirthday) {
        return `${parts[2]}/${parts[1]}`;
      }
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  getGenderName(type?: number, other?: string): string {
    if (type === 1) return 'Masculino';
    if (type === 2) return 'Feminino';
    if (type === 3) return other || 'Outro';
    return 'Não especificado';
  }

  enableEditMode() {
    const user = this.profileUser();
    if (user) {
      this.editUsername = user.username || '';
      this.editNome = user.nome;
      this.editEmail = user.email;
      this.editSenha = '';
      this.editFotoUrl = user.fotoUrl || '';
      this.editBio = user.bio || '';
      this.editBirthDate = user.birthDate || '';
      this.editGenderType = user.genderType || 1;
      this.editGenderOther = user.genderOther || '';
      this.editShowBirthday = user.showBirthday !== false;
      this.editCourse = user.course || '';
      this.editPeriod = user.period || 1;
      this.editMatricula = user.matricula || '';
      this.editIngressPeriod = user.ingressPeriod || '';
      this.editConclusionPeriod = user.conclusionPeriod || '';
      this.editWhatsapp = user.whatsapp || '';
      this.editGithubUrl = user.githubUrl || '';
      this.editInstagramUrl = user.instagramUrl || '';
      this.editLinkedinUrl = user.linkedinUrl || '';
      this.editWebsiteUrl = user.websiteUrl || '';
      this.editNotifRecommendations = user.notifRecommendations !== false;
      this.editNotifApplications = user.notifApplications !== false;
      this.editNotifAnnouncements = user.notifAnnouncements !== false;
      this.editNotifEdicts = user.notifEdicts !== false;
      this.editNotifAdmin = user.notifAdmin !== false;
      this.editExperience = user.experience || '';
      this.editEducation = user.education || '';
      this.editCertification = user.certification || '';
      this.editTechnologies = [...(user.technologies || [])];
      this.isEditMode.set(true);
      this.editError.set('');
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  formatWhatsapp(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    this.editWhatsapp = value;
  }

  addTechnology(techName: string) {
    const clean = techName.trim();
    if (clean && !this.editTechnologies.includes(clean)) {
      this.editTechnologies.push(clean);
    }
    this.newTechInput = '';
  }

  removeTechnology(techName: string) {
    this.editTechnologies = this.editTechnologies.filter(t => t !== techName);
  }

  getFilteredSuggestions(): string[] {
    const term = this.newTechInput.trim().toLowerCase();
    if (!term) return [];
    return this.allTechnologiesSuggestions.filter(t => 
      t.toLowerCase().includes(term) && !this.editTechnologies.includes(t)
    );
  }

  onSaveProfile() {
    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.editError.set('');

    const periodPattern = /^\d{4}\.[12]$/;
    if (this.editIngressPeriod && !periodPattern.test(this.editIngressPeriod)) {
      this.toastService.show('O período de ingresso deve estar no formato YYYY.Semestre (ex: 2024.1)', 'error');
      this.isSaving.set(false);
      return;
    }
    if (this.editConclusionPeriod && !periodPattern.test(this.editConclusionPeriod)) {
      this.toastService.show('O período de conclusão deve estar no formato YYYY.Semestre (ex: 2026.2)', 'error');
      this.isSaving.set(false);
      return;
    }

    const payload = {
      username: this.editUsername,
      nome: this.editNome,
      email: this.editEmail,
      senha: this.editSenha || undefined,
      fotoUrl: this.editFotoUrl || undefined,
      bio: this.editBio,
      birthDate: this.editBirthDate || undefined,
      genderType: this.editGenderType,
      genderOther: this.editGenderOther,
      showBirthday: this.editShowBirthday,
      course: this.editCourse,
      period: this.editPeriod,
      matricula: this.editMatricula,
      ingressPeriod: this.editIngressPeriod,
      conclusionPeriod: this.editConclusionPeriod,
      whatsapp: this.editWhatsapp,
      githubUrl: this.editGithubUrl,
      instagramUrl: this.editInstagramUrl,
      linkedinUrl: this.editLinkedinUrl,
      websiteUrl: this.editWebsiteUrl,
      notifRecommendations: this.editNotifRecommendations,
      notifApplications: this.editNotifApplications,
      notifAnnouncements: this.editNotifAnnouncements,
      notifEdicts: this.editNotifEdicts,
      notifAdmin: this.editNotifAdmin,
      experience: this.editExperience,
      education: this.editEducation,
      certification: this.editCertification,
      technologies: this.editTechnologies
    };

    this.http.put<any>(apiUrl(`/api/usuarios/perfil/${user.id}?shareOnFeed=${this.shareOnFeed}`), payload).subscribe({
      next: (updatedUser) => {
        this.authService.currentUser.set(updatedUser);
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.profileUser.set(updatedUser);
        this.loadTechnologies();
        this.toastService.show('Perfil atualizado com sucesso!', 'success');
      },
      error: (err) => {
        this.isSaving.set(false);
        const errMsg = err.error?.message || 'Falha ao atualizar perfil. Verifique os dados inseridos.';
        this.editError.set(errMsg);
        this.toastService.show(errMsg, 'error');
      }
    });
  }

  // Recommendation actions
  onSendTestimonial() {
    const text = this.testimonialInput().trim();
    if (!text) return;

    this.isSendingTestimonial.set(true);
    this.testimonialError.set('');
    this.http.post(apiUrl(`/api/usuarios/perfil/${this.profileUser().username}/depoimentos`), { content: text }).subscribe({
      next: () => {
        this.testimonialInput.set('');
        this.isSendingTestimonial.set(false);
        this.toastService.show('Depoimento enviado para aprovação!', 'success');
      },
      error: (err) => {
        this.isSendingTestimonial.set(false);
        const errMsg = err.error?.message || 'Falha ao enviar depoimento.';
        this.testimonialError.set(errMsg);
        this.toastService.show(errMsg, 'error');
      }
    });
  }

  onAcceptTestimonial(t: any) {
    this.http.put(apiUrl(`/api/usuarios/perfil/depoimentos/${t.id}/aceitar`), {}).subscribe({
      next: (acceptedT) => {
        this.pendingTestimonials.set(this.pendingTestimonials().filter(x => x.id !== t.id));
        this.testimonials.set([acceptedT, ...this.testimonials()]);
        this.toastService.show('Depoimento aprovado e publicado!', 'success');
      },
      error: (err) => {
        this.toastService.show('Falha ao aceitar depoimento.', 'error');
      }
    });
  }

  onDeleteTestimonial(t: any) {
    if (!confirm('Deseja realmente remover este depoimento?')) return;
    this.http.delete(apiUrl(`/api/usuarios/perfil/depoimentos/${t.id}`)).subscribe({
      next: () => {
        this.pendingTestimonials.set(this.pendingTestimonials().filter(x => x.id !== t.id));
        this.testimonials.set(this.testimonials().filter(x => x.id !== t.id));
        this.toastService.show('Depoimento removido.', 'info');
      },
      error: (err) => {
        this.toastService.show('Falha ao remover depoimento.', 'error');
      }
    });
  }

  // Post Actions
  onToggleLike(post: any) {
    if (!this.isLoggedIn()) return;
    this.http.post<{ liked: boolean }>(apiUrl(`/api/feed/${post.id}/like`), {}).subscribe({
      next: (res) => {
        post.likedByCurrentUser = res.liked;
        post.likesCount += res.liked ? 1 : -1;
      },
      error: () => {}
    });
  }

  onAddComment(postId: string) {
    const commentText = (this.commentInputs[postId] || '').trim();
    if (!commentText) return;

    this.http.post<any>(apiUrl(`/api/feed/${postId}/comentarios`), { content: commentText }).subscribe({
      next: (newComment) => {
        this.commentInputs[postId] = '';
        const post = this.userPosts().find(p => p.id === postId);
        if (post) {
          post.comments = [...post.comments, newComment];
        }
      },
      error: () => {}
    });
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    return `Há ${diffDays} d`;
  }

  /** Calcula % de completude do perfil baseado nos campos preenchidos */
  getProfileCompleteness(): number {
    const checks = [
      !!this.editNome?.trim(),
      !!this.editUsername?.trim(),
      !!this.editEmail?.trim(),
      !!this.editFotoUrl?.trim(),
      !!this.editBio?.trim(),
      !!this.editCourse?.trim(),
      !!this.editPeriod,
      !!this.editMatricula?.trim(),
      !!this.editIngressPeriod?.trim(),
      this.editTechnologies.length > 0,
      !!this.editGithubUrl?.trim() || !!this.editLinkedinUrl?.trim() || !!this.editWhatsapp?.trim(),
      !!this.editExperience?.trim(),
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }

  /** Dica de completude */
  getCompletenessTip(): string {
    if (!this.editBio?.trim()) return '💡 Adicione uma bio para se apresentar.';
    if (!this.editFotoUrl?.trim()) return '📷 Adicione uma foto de perfil.';
    if (this.editTechnologies.length === 0) return '🔧 Adicione suas tecnologias favoritas.';
    if (!this.editExperience?.trim()) return '📄 Descreva suas experiências profissionais.';
    if (!this.editGithubUrl?.trim() && !this.editLinkedinUrl?.trim()) return '🔗 Adicione um link do GitHub ou LinkedIn.';
    if (!this.editMatricula?.trim()) return '🎓 Informe sua matrícula acadêmica.';
    return '✅ Perfil quase completo!';
  }
}
