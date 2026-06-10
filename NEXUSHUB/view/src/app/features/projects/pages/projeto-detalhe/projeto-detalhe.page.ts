import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService, Projeto } from '../../services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SolicitacaoService, SolicitacaoEntrada } from '../../../requests/services/solicitacao.service';

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
        // Se for o criador do projeto, busca as solicitaÃ§Ãµes vinculadas
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
        this.joinError.set(err.error?.message || 'Falha ao enviar a solicitaÃ§Ã£o. Tente novamente.');
      }
    });
  }

  responderSolicitacao(solicitacaoId: string, aprovado: boolean) {
    this.solicitacaoService.responder(solicitacaoId, aprovado).subscribe({
      next: () => {
        const proj = this.projeto();
        if (proj && proj.id) {
          // Recarrega os dados do projeto para atualizar contador de membros e a lista de solicitaÃ§Ãµes
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
}


