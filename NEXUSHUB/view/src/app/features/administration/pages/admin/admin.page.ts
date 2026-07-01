import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../../../core/config/api.config';

interface Flag { id: string; code: string; enabled: boolean; description: string }
interface Audit {
  action: string; entity: string; entityId: string; result: string; createdAt: string;
  actorId?: string; afterValue?: string; ip?: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.css'
})
export class AdminPageComponent {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl('/api/admin');
  readonly flags = signal<Flag[]>([]);
  readonly audits = signal<Audit[]>([]);
  readonly error = signal('');
  readonly message = signal('');
  readonly changing = signal('');

  constructor() { this.refresh(); }

  refresh() {
    this.http.get<Flag[]>(`${this.base}/features`).subscribe({
      next: value => this.flags.set(value),
      error: () => this.error.set('Acesso exclusivo para administradores.')
    });
    this.loadAudits();
  }

  toggle(flag: Flag) {
    this.changing.set(flag.code);
    this.error.set('');
    this.message.set('');
    this.http.patch<Flag>(`${this.base}/features/${flag.code}`, { enabled: !flag.enabled }).subscribe({
      next: updated => {
        this.flags.update(items => items.map(item => item.code === updated.code ? updated : item));
        this.changing.set('');
        this.message.set(`${this.flagName(updated.code)} ${updated.enabled ? 'ativado' : 'desativado'} com sucesso.`);
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
