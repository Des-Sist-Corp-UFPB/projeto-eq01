import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../core/config/api.config';

export interface SolicitacaoEntrada {
  id?: string;
  projetoId: string;
  usuarioId?: string;
  projetoNome?: string;
  usuarioEmail: string;
  usuarioNome: string;
  motivo: string;
  status?: string;
  criadoEm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl('/api/solicitacoes');

  criar(solicitacao: SolicitacaoEntrada): Observable<SolicitacaoEntrada> {
    return this.http.post<SolicitacaoEntrada>(this.apiUrl, solicitacao);
  }

  listarPorProjeto(projetoId: string): Observable<SolicitacaoEntrada[]> {
    return this.http.get<SolicitacaoEntrada[]>(`${this.apiUrl}/projeto/${projetoId}`);
  }

  responder(id: string, aprovado: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/resposta`, { aprovado });
  }
}
