import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpportunityService, OportunidadeResponse, OportunidadeCadastroRequest, PerguntaRequest, CandidaturaRequest, RespostaCandidaturaRequest, OportunidadeDashboardResponse } from '../../services/opportunity.service';
import { ProjectService, Projeto } from '../../../projects/services/project.service';
import { GrupoService, Grupo } from '../../../groups/services/grupo.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-oportunidades-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oportunidades.page.html',
  styleUrl: './oportunidades.page.css'
})
export class OportunidadesPageComponent implements OnInit {
  private readonly opportunityService = inject(OpportunityService);
  private readonly projectService = inject(ProjectService);
  private readonly grupoService = inject(GrupoService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected activeTab = signal<'explorar' | 'dashboard'>('explorar');
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  // Exploration Feed
  protected opportunities = signal<OportunidadeResponse[]>([]);
  protected filterSearch = signal('');
  protected filterTag = signal<number | 'Todos'>('Todos');
  protected filterPaid = signal<'Todos' | 'Bolsa' | 'Voluntaria'>('Todos');
  protected loadingOpportunities = signal(false);

  // Computed Filtered Feed
  protected filteredOpportunities = computed(() => {
    return this.opportunities().filter(o => {
      const matchesSearch = o.titulo.toLowerCase().includes(this.filterSearch().toLowerCase()) ||
                            o.descricao.toLowerCase().includes(this.filterSearch().toLowerCase());
      
      const matchesTag = this.filterTag() === 'Todos' || o.tagType === this.filterTag();
      
      const matchesPaid = this.filterPaid() === 'Todos' ||
                          (this.filterPaid() === 'Bolsa' && o.pago) ||
                          (this.filterPaid() === 'Voluntaria' && !o.pago);
      
      return matchesSearch && matchesTag && matchesPaid;
    });
  });

  // Modal Details & Apply
  protected selectedOpp = signal<OportunidadeResponse | null>(null);
  protected showDetailsModal = signal(false);
  protected applying = signal(false);

  // Application answers
  protected applyMessage = '';
  protected applyPhone = '';
  protected applyAnswers = signal<{ [key: string]: string }>({});

  // Report Modal
  protected showReportModal = signal(false);
  protected reportReason = '';
  protected reportingOppId: string | null = null;

  // Opportunity Creation
  protected showCreateModal = signal(false);
  protected projectsList = signal<Projeto[]>([]);
  protected groupsList = signal<Grupo[]>([]);
  protected editingOppId = signal<string | null>(null);

  protected oppFormTitle = '';
  protected oppFormDescription = '';
  protected oppFormType = 1;
  protected oppFormTagType = 2; // Default: VAGA_INTERNA
  protected oppFormPaid = false;
  protected oppFormRemuneration = '';
  protected oppFormUseForm = false;
  protected oppFormContactPhone = '';
  protected oppFormDeadlineInput = '';
  protected oppFormApplyUrl = '';
  protected oppFormProjectId = '';
  protected oppFormGroupId = '';

  // Dynamic Questions wizard
  protected oppFormQuestions = signal<PerguntaRequest[]>([]);
  protected newQuestionLabel = '';
  protected newQuestionType = 1;
  protected newQuestionRequired = false;
  protected newQuestionOptionsInput = '';

  // Dashboard Data
  protected dashboardData = signal<OportunidadeDashboardResponse[]>([]);
  protected loadingDashboard = signal(false);

  // Computed Statistics for Dashboard
  protected totalPositions = computed(() => this.dashboardData().length);
  protected totalApplications = computed(() => this.dashboardData().reduce((acc, curr) => acc + curr.totalCandidatos, 0));
  
  ngOnInit() {
    this.loadOpportunities();
    if (this.isLoggedIn()) {
      this.loadSelectionLists();
    }
  }

  loadOpportunities() {
    this.loadingOpportunities.set(true);
    this.opportunityService.listar().subscribe({
      next: (data) => {
        this.opportunities.set(data);
        this.loadingOpportunities.set(false);
      },
      error: () => {
        this.toastService.showError('Não foi possível carregar as oportunidades.');
        this.loadingOpportunities.set(false);
      }
    });
  }

  loadSelectionLists() {
    this.projectService.listar().subscribe({
      next: (projs) => this.projectsList.set(projs),
      error: () => {}
    });
    this.grupoService.listar().subscribe({
      next: (grps) => this.groupsList.set(grps),
      error: () => {}
    });
  }

  loadDashboard() {
    this.loadingDashboard.set(true);
    this.opportunityService.obterDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loadingDashboard.set(false);
      },
      error: () => {
        this.toastService.showError('Não foi possível carregar os dados do painel.');
        this.loadingDashboard.set(false);
      }
    });
  }

  setTab(tab: 'explorar' | 'dashboard') {
    if (tab === 'dashboard' && !this.isLoggedIn()) {
      this.toastService.showWarning('Você precisa estar logado para acessar o painel.');
      return;
    }
    this.activeTab.set(tab);
    if (tab === 'explorar') {
      this.loadOpportunities();
    } else {
      this.loadDashboard();
    }
  }

  openDetailsModal(opp: OportunidadeResponse) {
    this.selectedOpp.set(opp);
    this.applyMessage = '';
    this.applyPhone = this.currentUser()?.whatsapp || '';
    this.applyAnswers.set({});
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedOpp.set(null);
  }

  submitApplication() {
    const opp = this.selectedOpp();
    if (!opp) return;

    if (opp.usaFormulario) {
      if (!this.applyPhone.trim()) {
        this.toastService.showWarning('Por favor, informe seu telefone de contato.');
        return;
      }

      // Check required answers
      if (opp.formulario && opp.formulario.perguntas) {
        for (const p of opp.formulario.perguntas) {
          const ans = this.applyAnswers()[p.id || ''];
          if (p.obrigatoria && (!ans || !ans.trim())) {
            this.toastService.showWarning(`A pergunta "${p.label}" é obrigatória.`);
            return;
          }
        }
      }
    }

    this.applying.set(true);
    
    // Parse answers
    const respostasReq: RespostaCandidaturaRequest[] = [];
    if (opp.usaFormulario && opp.formulario && opp.formulario.perguntas) {
      for (const p of opp.formulario.perguntas) {
        const val = this.applyAnswers()[p.id || ''] || '';
        respostasReq.push({
          idPergunta: p.id || '',
          respostaText: val
        });
      }
    }

    const payload: CandidaturaRequest = {
      mensagem: this.applyMessage.trim(),
      telefone: this.applyPhone.trim(),
      respostas: respostasReq
    };

    this.opportunityService.candidatar(opp.id, payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Candidatura enviada com sucesso!');
        this.applying.set(false);
        this.closeDetailsModal();
        this.loadOpportunities();
      },
      error: (err) => {
        this.applying.set(false);
        this.toastService.showError(err.error?.message || 'Erro ao enviar candidatura.');
      }
    });
  }

  openApplyWhatsApp(opp: OportunidadeResponse) {
    if (!opp.telefoneContato) {
      this.toastService.showError('Telefone do contato indisponível.');
      return;
    }
    
    const text = `Olá, vim do *NexusHub*! Tenho interesse na oportunidade: *${opp.titulo}*.\n\nGostaria de obter mais informações. Meu nome é *${this.currentUser()?.nome || 'Candidato'}*.`;
    let phone = opp.telefoneContato.replace(/\D/g, '');
    if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    // Make fake background request to save application record if needed or direct link
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  openReportModal(oppId: string) {
    this.reportingOppId = oppId;
    this.reportReason = '';
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.reportingOppId = null;
  }

  submitReport() {
    if (!this.reportingOppId) return;
    if (!this.reportReason.trim()) {
      this.toastService.showWarning('Por favor, informe o motivo da denúncia.');
      return;
    }

    this.opportunityService.denunciar(this.reportingOppId, this.reportReason.trim()).subscribe({
      next: () => {
        this.toastService.showSuccess('Oportunidade denunciada. Um ticket foi enviado para a moderação.');
        this.closeReportModal();
      },
      error: () => {
        this.toastService.showError('Erro ao enviar denúncia.');
      }
    });
  }

  openCreateOpportunity() {
    this.editingOppId.set(null);
    this.oppFormTitle = '';
    this.oppFormDescription = '';
    this.oppFormType = 1;
    this.oppFormTagType = 2;
    this.oppFormPaid = false;
    this.oppFormRemuneration = '';
    this.oppFormUseForm = false;
    this.oppFormContactPhone = this.currentUser()?.whatsapp || '';
    this.oppFormDeadlineInput = '';
    this.oppFormApplyUrl = '';
    this.oppFormProjectId = '';
    this.oppFormGroupId = '';
    this.oppFormQuestions.set([]);
    this.showCreateModal.set(true);
  }

  openEditOpportunity(oppId: string) {
    this.opportunityService.obterPorId(oppId).subscribe({
      next: (opp) => {
        this.editingOppId.set(opp.id);
        this.oppFormTitle = opp.titulo;
        this.oppFormDescription = opp.descricao;
        this.oppFormType = Number(opp.tipo) || 1;
        this.oppFormTagType = opp.tagType || 2;
        this.oppFormPaid = opp.pago;
        this.oppFormRemuneration = opp.remuneracao || '';
        this.oppFormUseForm = opp.usaFormulario;
        this.oppFormContactPhone = opp.telefoneContato || '';
        
        if (opp.prazo) {
          const parts = opp.prazo.split('-');
          if (parts.length === 3) {
            this.oppFormDeadlineInput = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            this.oppFormDeadlineInput = opp.prazo;
          }
        } else {
          this.oppFormDeadlineInput = '';
        }

        this.oppFormApplyUrl = opp.urlInscricao || '';
        this.oppFormProjectId = opp.idProjeto || '';
        this.oppFormGroupId = opp.idGrupo || '';

        // Load form questions if they exist
        const qList: PerguntaRequest[] = [];
        if (opp.formulario && opp.formulario.perguntas) {
          for (const p of opp.formulario.perguntas) {
            qList.push({
              label: p.label,
              tipo: p.tipo,
              obrigatoria: p.obrigatoria,
              ordem: p.ordem || 0,
              opcoes: p.opcoes ? p.opcoes.map(o => o.nome) : []
            });
          }
        }
        this.oppFormQuestions.set(qList);
        this.showCreateModal.set(true);
      },
      error: () => {
        this.toastService.showError('Não foi possível obter os detalhes da vaga.');
      }
    });
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.editingOppId.set(null);
  }

  addQuestion() {
    if (!this.newQuestionLabel.trim()) {
      this.toastService.showWarning('O rótulo da pergunta é obrigatório.');
      return;
    }

    const options: string[] = [];
    if (this.newQuestionType === 2 || this.newQuestionType === 3) {
      const parts = this.newQuestionOptionsInput.split(';').map(o => o.trim()).filter(o => o.length > 0);
      if (parts.length < 2) {
        this.toastService.showWarning('Defina pelo menos 2 opções separadas por ponto e vírgula (;).');
        return;
      }
      options.push(...parts);
    }

    const currentQs = this.oppFormQuestions();
    const newQ: PerguntaRequest = {
      label: this.newQuestionLabel.trim(),
      tipo: this.newQuestionType,
      obrigatoria: this.newQuestionRequired,
      ordem: currentQs.length,
      opcoes: options
    };

    this.oppFormQuestions.set([...currentQs, newQ]);

    // reset question fields
    this.newQuestionLabel = '';
    this.newQuestionType = 1;
    this.newQuestionRequired = false;
    this.newQuestionOptionsInput = '';
  }

  removeQuestion(index: number) {
    const current = this.oppFormQuestions();
    current.splice(index, 1);
    this.oppFormQuestions.set([...current]);
  }

  onOppFormDeadlineInput(event: Event) {
    let value = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length >= 5) {
      this.oppFormDeadlineInput = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      this.oppFormDeadlineInput = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      this.oppFormDeadlineInput = value;
    }
  }

  saveOpportunity() {
    if (!this.oppFormTitle.trim()) {
      this.toastService.showWarning('Título da vaga é obrigatório.');
      return;
    }
    if (!this.oppFormDescription.trim()) {
      this.toastService.showWarning('Descrição da vaga é obrigatória.');
      return;
    }
    if (this.oppFormPaid && !this.oppFormRemuneration.trim()) {
      this.toastService.showWarning('Valor da remuneração é obrigatório.');
      return;
    }
    if (!this.oppFormUseForm && !this.oppFormContactPhone.trim()) {
      this.toastService.showWarning('Telefone de contato é obrigatório se não usar formulário.');
      return;
    }

    const payload: OportunidadeCadastroRequest = {
      titulo: this.oppFormTitle.trim(),
      descricao: this.oppFormDescription.trim(),
      tipo: this.oppFormType,
      idGrupo: this.oppFormGroupId || null,
      idProjeto: this.oppFormProjectId || null,
      tagType: this.oppFormTagType,
      pago: this.oppFormPaid,
      remuneracao: this.oppFormPaid ? this.oppFormRemuneration.trim() : null,
      usaFormulario: this.oppFormUseForm,
      telefoneContato: this.oppFormUseForm ? null : this.oppFormContactPhone.trim(),
      prazo: undefined as string | undefined | null,
      urlInscricao: this.oppFormApplyUrl.trim() || null,
      perguntas: this.oppFormUseForm ? this.oppFormQuestions() : null
    };

    if (this.oppFormDeadlineInput.length === 10) {
      const parts = this.oppFormDeadlineInput.split('/');
      payload.prazo = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const isEdit = this.editingOppId();
    const req$ = isEdit 
      ? this.opportunityService.editar(isEdit, payload)
      : this.opportunityService.criar(payload);

    req$.subscribe({
      next: () => {
        this.toastService.showSuccess(isEdit ? 'Vaga atualizada com sucesso!' : 'Vaga cadastrada com sucesso!');
        this.closeCreateModal();
        this.loadOpportunities();
        if (this.activeTab() === 'dashboard') {
          this.loadDashboard();
        }
      },
      error: (err) => {
        this.toastService.showError(err.error?.message || 'Erro ao salvar vaga.');
      }
    });
  }

  deleteOpportunity(id: string) {
    if (confirm('Tem certeza que deseja fechar/remover esta oportunidade permanentemente?')) {
      this.opportunityService.deletar(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Oportunidade removida.');
          this.loadOpportunities();
          if (this.activeTab() === 'dashboard') {
            this.loadDashboard();
          }
        },
        error: () => this.toastService.showError('Não foi possível remover a oportunidade.')
      });
    }
  }

  getTagLabel(type: number): string {
    switch (type) {
      case 1: return 'Edital';
      case 2: return 'Vaga Interna';
      case 3: return 'Vaga Externa';
      case 4: return 'Grupo';
      default: return 'Geral';
    }
  }

  getOppTypeLabel(type: string): string {
    switch (type) {
      case '1': return 'Vaga de estágio';
      case '2': return 'Emprego';
      case '3': return 'Projetos pessoais';
      case '4': return 'Projetos externos';
      default: return 'Outros';
    }
  }

  protected toggleCheckboxAnswer(questionId: string, optionName: string, checked: boolean) {
    const current = this.applyAnswers();
    const existingStr = current[questionId] || '';
    let selected = existingStr.split(';').map(o => o.trim()).filter(o => o.length > 0);
    if (checked) {
      if (!selected.includes(optionName)) {
        selected.push(optionName);
      }
    } else {
      selected = selected.filter(x => x !== optionName);
    }
    this.applyAnswers.set({
      ...current,
      [questionId]: selected.join(';')
    });
  }

  protected setSingleAnswer(questionId: string, value: string) {
    this.applyAnswers.set({
      ...this.applyAnswers(),
      [questionId]: value
    });
  }

  protected isCheckboxSelected(questionId: string, optionName: string): boolean {
    const existingStr = this.applyAnswers()[questionId] || '';
    return existingStr.split(';').map(o => o.trim()).includes(optionName);
  }

  protected onFilterTagChange(event: any) {
    const val = event.target.value;
    if (val === 'Todos') {
      this.filterTag.set('Todos');
    } else {
      this.filterTag.set(Number(val));
    }
  }
}
