import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitacaoEntrada {
  id?: number;
  projetoId: number;
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
  private readonly apiUrl = 'http://localhost:8080/api/solicitacoes';

  criar(solicitacao: SolicitacaoEntrada): Observable<SolicitacaoEntrada> {
    return this.http.post<SolicitacaoEntrada>(this.apiUrl, solicitacao);
  }

  listarPorProjeto(projetoId: number): Observable<SolicitacaoEntrada[]> {
    return this.http.get<SolicitacaoEntrada[]>(`${this.apiUrl}/projeto/${projetoId}`);
  }

  responder(id: number, aprovado: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/resposta`, { aprovado });
  }
}
