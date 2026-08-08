import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../../../core/config/api.config';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.page.html',
  styleUrl: './privacy.page.css'
})
export class PrivacyPageComponent {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl('/api/lgpd');
  readonly message = signal('');
  readonly error = signal('');
  readonly loading = signal('');
  readonly analyticsAllowed = signal<boolean | null>(null);

  consent(granted: boolean) {
    this.start('consent');
    this.http.post(`${this.base}/consentimentos`, {
      purpose: 'PLATFORM_ANALYTICS',
      version: '1.0',
      granted
    }).subscribe({
      next: () => {
        this.loading.set('');
        this.analyticsAllowed.set(granted);
        this.message.set(granted
          ? 'Uso de dados para métricas autorizado.'
          : 'Consentimento revogado. Seus dados não serão usados para métricas.');
      },
      error: () => this.fail('Não foi possível salvar sua preferência.')
    });
  }

  downloadData() {
    this.start('export');
    this.http.get<Record<string, unknown>>(`${this.base}/meus-dados`).subscribe({
      next: data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nexushub-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.loading.set('');
        this.message.set('Arquivo com seus dados gerado e baixado com segurança.');
      },
      error: () => this.fail('Não foi possível exportar seus dados agora.')
    });
  }

  anonymize() {
    if (!window.confirm('Deseja solicitar a anonimização da sua conta? A equipe analisará a solicitação e essa operação pode ser irreversível.')) {
      return;
    }
    this.start('anonymize');
    this.http.post(`${this.base}/solicitacoes`, { type: 'ANONYMIZE' }).subscribe({
      next: () => {
        this.loading.set('');
        this.message.set('Solicitação de anonimização enviada. Ela será analisada pela equipe responsável.');
      },
      error: () => this.fail('Não foi possível enviar a solicitação de anonimização.')
    });
  }

  private start(action: string) {
    this.loading.set(action);
    this.message.set('');
    this.error.set('');
  }

  private fail(message: string) {
    this.loading.set('');
    this.error.set(message);
  }
}
