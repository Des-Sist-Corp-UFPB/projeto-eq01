import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { apiUrl } from '../../../../core/config/api.config';
import { ToastService } from '../../../../core/services/toast.service';

export const COURSE_COMPETENCIES_MAP: Record<string, string[]> = {
  'Sistemas de Informação': [
    'Angular', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'SQL', 'Docker',
    'Gestão de TI', 'Engenharia de Requisitos', 'SCRUM', 'Arquitetura de Software',
    'DevOps', 'UI/UX Design', 'Modelagem de Dados', 'REST APIs', 'Git & GitHub'
  ],
  'Ciência da Computação': [
    'Python', 'C++', 'Java', 'Algoritmos & Estruturas de Dados', 'Inteligência Artificial',
    'Machine Learning', 'Compiladores', 'Sistemas Operacionais', 'Redes de Computadores',
    'Computação em Nuvem', 'Linux', 'Clean Code', 'Segurança da Informação'
  ],
  'Design': [
    'Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Design System', 'Typography',
    'Branding', 'Prototipagem', 'Adobe Illustrator', 'Adobe Photoshop', 'Design Thinking',
    'Motion Design', 'Visual Design'
  ],
  'Ecologia': [
    'Gestão Ambiental', 'Geoprocessamento (QGIS)', 'Licenciamento Ambiental',
    'Análise de Dados Ambientais', 'R / RStudio', 'Conservação da Biodiversidade',
    'Perícia Ambiental', 'Relatórios EIA/RIMA', 'Ecologia de Campo', 'Sustentabilidade'
  ],
  'Matemática': [
    'Cálculo Diferencial e Integral', 'Álgebra Linear', 'Estatística & Probabilidade',
    'Python para Matemática', 'LaTeX', 'Análise Numérica', 'Modelagem Matemática',
    'Ensino de Matemática', 'Geometria Analítica'
  ],
  'Antropologia': [
    'Etnografia', 'Pesquisa Qualitativa', 'Antropologia Visual', 'Patrimônio Cultural',
    'Direitos Humanos', 'Elaboração de Projetos Sociais', 'Análise de Discurso', 'Sociologia'
  ],
  'Secretariado Executivo Bilíngue': [
    'Gestão Documental', 'Inglês Fluente', 'Espanhol Avançado', 'Redação Empresarial',
    'Organização de Eventos Corporate', 'Assessoria Executiva', 'Comunicação Interpessoal',
    'Ferramentas Office / Workspace', 'Etiqueta Corporativa'
  ],
  'Pedagogia': [
    'Psicologia da Educação', 'Gestão Escolar', 'Elaboração de Planos de Aula',
    'Metodologias Ativas', 'Educação Inclusiva', 'Tecnologias Educacionais',
    'Letramento e Alfabetização', 'Didática'
  ],
  'Administração': [
    'Gestão Financeira', 'Planejamento Estratégico', 'Marketing Digital', 'Gestão de Pessoas',
    'Análise de Custos', 'Excel Avançado', 'Liderança', 'Empreendedorismo', 'BIM / Gestão de Processos'
  ],
  'Ciências Contábeis': [
    'Contabilidade Geral', 'DRE & Balanço Patrimonial', 'Planejamento Tributário',
    'Auditoria Contábil', 'Controladoria', 'Análise Financeira', 'Excel Avançado', 'HP 12C'
  ],
  'Letras - Língua Portuguesa': [
    'Revisão de Texto', 'Linguística Aplicada', 'Produção Textual', 'Literatura Brasileira',
    'Gramática Normativa', 'Análise Literária', 'Didática de Idiomas'
  ],
  'Letras - Inglês (EaD)': [
    'Inglês Fluente / Avançado', 'Tradução Inglês-Português', 'Linguística de Língua Inglesa',
    'Ensino de Línguas Estrangeiras', 'Produção Textual em Inglês'
  ],
  'Letras - Espanhol (EaD)': [
    'Espanhol Fluente / Avançado', 'Tradução Espanhol-Português', 'Literatura Hispânica',
    'Didática do Espanhol', 'Redação em Espanhol'
  ]
};

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
  protected readonly editTopicTab = signal<'pessoais' | 'academicos' | 'competencias' | 'historico' | 'contatos' | 'configuracoes'>('pessoais');
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
  protected editBirthDateInput = '';
  protected editGenderType = 1;
  protected editGenderOther = '';
  protected editShowBirthday = true;
  protected editCourse = '';
  protected editPeriod = '';
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

  getGenderName(genderType?: number, genderOther?: string): string {
    if (genderType === 1) return 'Masculino';
    if (genderType === 2) return 'Feminino';
    if (genderType === 3) return genderOther || 'Outro';
    return 'Não especificado';
  }

  getAcademicBadges(): { name: string; icon: string; color: string; description: string }[] {
    const user = this.profileUser();
    if (!user) return [];

    const badges = [];

    if (user.cargo === 'PROFESSOR') {
      badges.push({
        name: 'Docente & Pesquisador',
        icon: 'workspace_premium',
        color: '#7c3aed',
        description: 'Membro do corpo docente e orientador de projetos no Campus IV.'
      });
    } else {
      badges.push({
        name: 'Discente Ativo',
        icon: 'school',
        color: '#2563eb',
        description: 'Estudante matriculado e ativo no ecossistema acadêmico.'
      });
    }

    if (user.course) {
      if (user.course.includes('Sistemas') || user.course.includes('Computação')) {
        badges.push({
          name: 'Top Contribuidor Tech',
          icon: 'code_blocks',
          color: '#10b981',
          description: 'Reconhecimento por contribuição e proficiência em desenvolvimento e arquitetura.'
        });
      } else if (user.course.includes('Design')) {
        badges.push({
          name: 'Destaque em UI/UX',
          icon: 'palette',
          color: '#8b5cf6',
          description: 'Reconhecimento por excelência em design visual e experiência de usuário.'
        });
      } else {
        badges.push({
          name: 'Pesquisador Acadêmico',
          icon: 'science',
          color: '#059669',
          description: 'Engajamento em produção científica e grupos de estudo.'
        });
      }
    }

    if ((user.technologies && user.technologies.length >= 3) || user.bio) {
      badges.push({
        name: 'Perfil Verificado & Completo',
        icon: 'verified',
        color: '#f59e0b',
        description: 'Perfil acadêmico com informações completas e competências mapeadas.'
      });
    }

    return badges;
  }

  protected readonly usernameStatus = signal<'current' | 'checking' | 'available' | 'taken' | 'invalid'>('current');
  protected readonly isCompressingImage = signal<boolean>(false);
  private usernameCheckTimer: any = null;

  enableEditMode() {
    const user = this.profileUser();
    if (user) {
      this.editUsername = user.username || '';
      this.editNome = user.nome;
      this.editEmail = user.email;
      this.editSenha = '';
      this.editFotoUrl = user.fotoUrl || '';
      this.editBio = user.bio || '';
      this.usernameStatus.set('current');
      
      if (user.birthDate) {
        const parts = user.birthDate.split('-');
        if (parts.length === 3) {
          this.editBirthDateInput = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          this.editBirthDateInput = user.birthDate;
        }
      } else {
        this.editBirthDateInput = '';
      }

      this.editGenderType = user.genderType || 1;
      this.editGenderOther = user.genderOther || '';
      this.editShowBirthday = user.showBirthday !== false;
      this.editCourse = user.course || '';
      this.editPeriod = user.period || '';
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

  onUsernameInput(value: string) {
    const clean = value.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    this.editUsername = clean;

    if (this.usernameCheckTimer) {
      clearTimeout(this.usernameCheckTimer);
    }

    const currUser = this.currentUser();
    if (clean === currUser?.username?.toLowerCase()) {
      this.usernameStatus.set('current');
      return;
    }

    if (clean.length < 3) {
      this.usernameStatus.set('invalid');
      return;
    }

    this.usernameStatus.set('checking');
    this.usernameCheckTimer = setTimeout(() => {
      this.http.get<any>(apiUrl(`/api/usuarios/username/${clean}`)).subscribe({
        next: (userFound) => {
          if (userFound && userFound.id !== currUser?.id) {
            this.usernameStatus.set('taken');
          } else {
            this.usernameStatus.set('current');
          }
        },
        error: () => {
          this.usernameStatus.set('available');
        }
      });
    }, 350);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toastService.show('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).', 'error');
      return;
    }

    this.isCompressingImage.set(true);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Str = e.target.result;
      this.compressProfileImage(base64Str, 300, 300).then(compressedBase64 => {
        this.editFotoUrl = compressedBase64;
        this.isCompressingImage.set(false);
        this.toastService.show('Foto de perfil recortada e otimizada (300x300 px) com sucesso!', 'success');
      }).catch(() => {
        this.isCompressingImage.set(false);
        this.toastService.show('Falha ao processar a imagem selecionada.', 'error');
      });
    };
    reader.readAsDataURL(file);
  }

  private compressProfileImage(base64Str: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.width;
        const height = img.height;

        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxWidth, maxHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          reject('Canvas error');
        }
      };
      img.onerror = (err) => reject(err);
    });
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

  onEditBirthDateInput(event: Event) {
    let value = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length >= 5) {
      this.editBirthDateInput = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      this.editBirthDateInput = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      this.editBirthDateInput = value;
    }
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

  getSuggestedCompetenciesForCourse(): string[] {
    const course = this.editCourse;
    if (!course) return [];
    
    const mapKey = Object.keys(COURSE_COMPETENCIES_MAP).find(k => 
      k.toLowerCase() === course.toLowerCase() || course.toLowerCase().includes(k.toLowerCase())
    );

    const suggested = mapKey ? COURSE_COMPETENCIES_MAP[mapKey] : [];
    return suggested.filter(tech => !this.editTechnologies.includes(tech));
  }

  onSaveProfile() {
    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.editError.set('');

    if (this.usernameStatus() === 'taken') {
      this.toastService.show('O username escolhido já está em uso por outro usuário.', 'error');
      this.isSaving.set(false);
      return;
    }

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
      birthDate: undefined as string | undefined,
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

    if (this.editBirthDateInput.length === 10) {
      const parts = this.editBirthDateInput.split('/');
      payload.birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

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
