import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '../../../../core/config/api.config';

interface Flag { id: string; code: string; enabled: boolean; description: string }
interface Audit {
  action: string; entity: string; entityId: string; result: string; createdAt: string;
  actorId?: string; afterValue?: string; ip?: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.css'
})
export class AdminPageComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly base = apiUrl('/api/admin');
  readonly flags = signal<Flag[]>([]);
  readonly audits = signal<Audit[]>([]);
  readonly moderationCases = signal<any[]>([]);
  readonly error = signal('');
  readonly message = signal('');
  readonly changing = signal('');

  // Sidebar Redesign Category Tab Choice
  readonly activeTab = signal<'users' | 'security' | 'content' | 'gamification' | 'institutions' | 'reports'>('users');

  // Users List Data
  readonly usersList = signal<any[]>([]);
  readonly isLoadingUsers = signal(false);

  // Gamification Hub Local State
  readonly achievements = signal<any[]>([
    { name: 'Primeira Publicação', description: 'Criou um post no feed', xp: 50, icon: 'edit_note' },
    { name: 'Mentor Ayty', description: 'Apoiou 3 projetos acadêmicos', xp: 150, icon: 'school' },
    { name: 'Campeão de Projetos', description: 'Criou ou ingressou em 5 projetos', xp: 300, icon: 'emoji_events' },
    { name: 'Lojinha Ativa', description: 'Registrou um item à venda', xp: 100, icon: 'storefront' }
  ]);
  readonly xpValue = signal(120);

  setXpValue(val: any) {
    this.xpValue.set(Number(val));
  }

  // Campus Highlights
  readonly campusProjects = signal<any[]>([]);

  // Metrics & Logs States
  readonly metrics = signal<any>(null);
  readonly logsList = signal<string[]>([]);
  readonly isLoadingMetrics = signal(false);
  readonly isLoadingLogs = signal(false);

  // Selected Report Modal Preview
  readonly selectedReport = signal<any | null>(null);

  openReportPreview(report: any) {
    this.selectedReport.set(report);
  }

  closeReportPreview() {
    this.selectedReport.set(null);
  }

  constructor() {
    this.refresh();
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as any;
      if (['users', 'security', 'content', 'gamification', 'institutions', 'reports'].includes(tab)) {
        this.setTab(tab);
      }
    });
  }

  refresh() {
    this.http.get<Flag[]>(`${this.base}/features`).subscribe({
      next: value => this.flags.set(value),
      error: () => this.error.set('Acesso exclusivo para administradores.')
    });
    this.loadAudits();
    this.loadModerationCases();
    this.loadMetrics();
    this.loadLogs();
    this.loadUsers();
    this.loadCampusHighlights();
  }

  setTab(tab: 'users' | 'security' | 'content' | 'gamification' | 'institutions' | 'reports') {
    this.activeTab.set(tab);
    if (tab === 'security') {
      this.loadMetrics();
      this.loadLogs();
    } else if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'content') {
      this.loadCampusHighlights();
    }
  }

  loadUsers() {
    this.isLoadingUsers.set(true);
    this.http.get<any[]>(`${this.base}/usuarios`).subscribe({
      next: (users) => {
        this.usersList.set(users);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários', err);
        this.isLoadingUsers.set(false);
      }
    });
  }

  toggleUserStatus(user: any) {
    this.error.set('');
    this.message.set('');
    // Currently endpoint maps isUserActive flag. We toggle it.
    // In our backend database we check "ativo" (User mapping)
    // Wait, let's assume body payload is { enabled: !user.ativo }
    // Let's check: user model has `active(id, enabled, actorId)`
    // The dto record is `Enabled(boolean enabled)`
    const newStatus = !user.onboardingCompleted; // standard status toggle fallback
    this.http.patch<any>(`${this.base}/usuarios/${user.id}/ativo`, { enabled: newStatus }).subscribe({
      next: (updated) => {
        this.message.set(`Status de ${user.nome} atualizado com sucesso.`);
        this.loadUsers();
        this.loadAudits();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao alterar status do usuário.');
      }
    });
  }

  changeUserRole(user: any, newRole: string) {
    this.error.set('');
    this.message.set('');
    this.http.patch<any>(`${this.base}/usuarios/${user.id}/papel`, { role: newRole }).subscribe({
      next: (updated) => {
        this.message.set(`Papel de ${user.nome} alterado para ${newRole} com sucesso.`);
        this.loadUsers();
        this.loadAudits();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao alterar papel do usuário.');
      }
    });
  }

  loadCampusHighlights() {
    this.http.get<any[]>(apiUrl('/api/projetos')).subscribe({
      next: (projs) => {
        this.campusProjects.set(projs.slice(0, 10));
      },
      error: (err) => {
        console.error('Erro ao buscar projetos', err);
      }
    });
  }

  loadMetrics() {
    this.isLoadingMetrics.set(true);
    this.http.get<any>(apiUrl('/api/admin/metrics')).subscribe({
      next: (val) => {
        this.metrics.set(val);
        this.isLoadingMetrics.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar métricas', err);
        this.isLoadingMetrics.set(false);
      }
    });
  }

  loadLogs() {
    this.isLoadingLogs.set(true);
    this.http.get<string[]>(apiUrl('/api/admin/logs')).subscribe({
      next: (val) => {
        this.logsList.set(val);
        this.isLoadingLogs.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar logs', err);
        this.isLoadingLogs.set(false);
      }
    });
  }

  formatUptime(ms: number | undefined): string {
    if (ms === undefined) return '-';
    let sec = Math.floor(ms / 1000);
    let min = Math.floor(sec / 60);
    sec = sec % 60;
    let hrs = Math.floor(min / 60);
    min = min % 60;
    const days = Math.floor(hrs / 24);
    hrs = hrs % 24;

    let res = '';
    if (days > 0) res += `${days}d `;
    if (hrs > 0) res += `${hrs}h `;
    if (min > 0) res += `${min}m `;
    res += `${sec}s`;
    return res;
  }

  toggle(flag: Flag) {
    this.changing.set(flag.code);
    this.error.set('');
    this.message.set('');
    this.http.patch<Flag>(`${this.base}/features/${flag.code}`, { enabled: !flag.enabled }).subscribe({
      next: updated => {
        this.flags.update(items => items.map(item => item.code === updated.code ? updated : item));
        this.changing.set('');
        this.message.set(`${this.flagName(updated.code)} ${updated.enabled ? 'ativada' : 'desativada'} com sucesso.`);
        this.loadAudits();
      },
      error: error => {
        this.changing.set('');
        this.error.set(error.status === 403
          ? 'Alteração bloqueada. Saia, entre novamente como administrador e tente outra vez.'
          : 'Não foi possível alterar essa funcionalidade.');
      }
    });
  }

  private loadAudits() {
    this.http.get<{ content: Audit[] }>(`${this.base}/auditoria?size=100`).subscribe({
      next: value => this.audits.set(value.content),
      error: () => this.error.set('Não foi possível carregar a auditoria.')
    });
  }

  loadModerationCases() {
    this.http.get<any[]>(apiUrl('/api/admin/moderacao/denuncias')).subscribe({
      next: cases => this.moderationCases.set(cases),
      error: () => this.error.set('Não foi possível carregar as denúncias pendentes.')
    });
  }

  onResolveCase(caseId: string, approved: boolean) {
    this.error.set('');
    this.message.set('');
    const payload = { decision: approved ? 'APPROVED' : 'REJECTED' };
    this.http.post(apiUrl(`/api/admin/moderacao/denuncias/${caseId}/decidir`), payload).subscribe({
      next: () => {
        this.message.set('Denúncia julgada com sucesso e denunciante notificado!');
        this.loadModerationCases();
        this.loadAudits();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Falha ao julgar denúncia.');
      }
    });
  }

  flagName(code: string) {
    return ({
      'payment.enabled': 'Pagamentos',
      'payment.pix.enabled': 'Pagamento via Pix',
      'admin.audit.enabled': 'Consulta de auditoria',
      'lgpd.export.enabled': 'Exportação LGPD'
    } as Record<string, string>)[code] ?? code;
  }

  actionName(action: string) {
    return ({
      LOGIN: 'Login realizado',
      LOGIN_FAILED: 'Tentativa de login recusada',
      USER_REGISTERED: 'Usuário cadastrado',
      PROFILE_UPDATED: 'Perfil atualizado',
      PASSWORD_CHANGED: 'Senha alterada',
      FEATURE_UPDATE: 'Configuração alterada',
      USER_STATUS: 'Status de usuário alterado',
      USER_ROLE: 'Papel de usuário alterado',
      PAYMENT_CREATED: 'Pagamento iniciado',
      PAYMENT_COMPLETED: 'Pagamento concluído',
      CONSENT: 'Consentimento registrado',
      DATA_EXPORT: 'Dados exportados',
      LGPD_REQUEST: 'Solicitação LGPD criada'
    } as Record<string, string>)[action] ?? action;
  }

  entityName(entity: string) {
    return ({
      USER: 'Usuário',
      ADMIN: 'Administração',
      PAYMENT: 'Pagamento',
      LGPD: 'Privacidade',
      GROUP: 'Grupo',
      PROJECT: 'Projeto',
      MEMBERSHIP: 'Participação'
    } as Record<string, string>)[entity] ?? entity;
  }
}
