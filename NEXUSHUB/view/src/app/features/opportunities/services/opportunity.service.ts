import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../core/config/api.config';

export interface OpcaoResponse {
  id?: string;
  nome: string;
  ordem?: number;
}

export interface PerguntaResponse {
  id?: string;
  label: string;
  tipo: number; // 1 = SHORT_ANSWER, 2 = MULTIPLE_CHOICE, 3 = SINGLE_CHOICE
  obrigatoria: boolean;
  ordem?: number;
  opcoes?: OpcaoResponse[];
}

export interface FormularioResponse {
  id?: string;
  nome: string;
  perguntas: PerguntaResponse[];
}

export interface OportunidadeResponse {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: number;
  prazo?: string;
  urlInscricao?: string;
  idGrupo?: string;
  nomeGrupo?: string;
  idProjeto?: string;
  nomeProjeto?: string;
  idPublicador?: string;
  nomePublicador?: string;
  tipoUsuarioPublicador?: string;
  tagType?: number; // 1 = EDITAL, 2 = VAGA_INTERNA, 3 = VAGA_EXTERNA, 4 = GRUPO
  pago: boolean;
  remuneracao?: string;
  usaFormulario: boolean;
  telefoneContato?: string;
  formulario?: FormularioResponse;
}

export interface PerguntaRequest {
  label: string;
  tipo: number;
  obrigatoria: boolean;
  ordem: number;
  opcoes?: string[];
}

export interface OportunidadeCadastroRequest {
  titulo: string;
  descricao: string;
  tipo: number;
  idGrupo?: string | null;
  idProjeto?: string | null;
  tagType: number;
  pago: boolean;
  remuneracao?: string | null;
  usaFormulario: boolean;
  telefoneContato?: string | null;
  prazo?: string | null;
  urlInscricao?: string | null;
  perguntas?: PerguntaRequest[] | null;
}

export interface RespostaCandidaturaRequest {
  idPergunta: string;
  respostaText: string;
}

export interface CandidaturaRequest {
  mensagem: string;
  telefone: string;
  respostas: RespostaCandidaturaRequest[];
}

export interface RespostaDashboardResponse {
  idPergunta: string;
  labelPergunta: string;
  respostaText: string;
}

export interface CandidaturaDashboardResponse {
  idCandidatura: string;
  idCandidato: string;
  nomeCandidato: string;
  emailCandidato: string;
  mensagem: string;
  telefone: string;
  status: number;
  dataEnvio: string;
  respostas: RespostaDashboardResponse[];
}

export interface OportunidadeDashboardResponse {
  idOportunidade: string;
  titulo: string;
  status: number;
  totalCandidatos: number;
  candidaturas: CandidaturaDashboardResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl('/api/oportunidades');

  listar(): Observable<OportunidadeResponse[]> {
    return this.http.get<OportunidadeResponse[]>(this.apiUrl);
  }

  obterPorId(id: string): Observable<OportunidadeResponse> {
    return this.http.get<OportunidadeResponse>(`${this.apiUrl}/${id}`);
  }

  criar(oportunidade: OportunidadeCadastroRequest): Observable<OportunidadeResponse> {
    return this.http.post<OportunidadeResponse>(this.apiUrl, oportunidade);
  }

  editar(id: string, oportunidade: OportunidadeCadastroRequest): Observable<OportunidadeResponse> {
    return this.http.put<OportunidadeResponse>(`${this.apiUrl}/${id}`, oportunidade);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  denunciar(id: string, motivo: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/denunciar`, { motivo });
  }

  candidatar(id: string, candidatura: CandidaturaRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/candidatar`, candidatura);
  }

  obterDashboard(): Observable<OportunidadeDashboardResponse[]> {
    return this.http.get<OportunidadeDashboardResponse[]>(`${this.apiUrl}/dashboard`);
  }
}
