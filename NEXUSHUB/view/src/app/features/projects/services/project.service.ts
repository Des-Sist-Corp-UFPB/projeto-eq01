import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../core/config/api.config';

export interface Projeto {
  id?: string;
  nome: string;
  resumo: string;
  objetivos?: string;
  categoria?: string;
  tipo?: string;
  tags?: string;
  visibilidade?: string;
  grupoPertencente?: string;
  autor?: string;
  curtidas?: number;
  quantidadeMembros?: number;
  imagemCardUrl?: string;
  imagemLandingUrl?: string;
  xpDistribuido?: number;
  status?: string;
  pontos?: number;
  criadoEm?: string;
}

export interface ProjetoRequest {
  nome: string;
  resumo: string;
  objetivos?: string;
  categoria?: string;
  tipo?: string;
  tags?: string;
  visibilidade?: string;
  grupoPertencente?: string;
  autorId?: string;
  autor?: string;
  imagemCardUrl?: string;
  imagemLandingUrl?: string;
  xpDistribuido?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl('/api/projetos');

  listar(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl);
  }

  listarQuentes(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(`${this.apiUrl}/quentes`);
  }

  listarRecentes(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(`${this.apiUrl}/recentes`);
  }

  listarColabs(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(`${this.apiUrl}/colabs`);
  }

  listarPorUsuario(autor: string): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(`${this.apiUrl}?autor=${encodeURIComponent(autor)}`);
  }

  listarPorTag(tag: string): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(`${this.apiUrl}?tag=${encodeURIComponent(tag)}`);
  }

  criar(projeto: ProjetoRequest): Observable<Projeto> {
    return this.http.post<Projeto>(this.apiUrl, projeto);
  }

  obterPorId(id: string): Observable<Projeto> {
    return this.http.get<Projeto>(`${this.apiUrl}/${id}`);
  }
}
