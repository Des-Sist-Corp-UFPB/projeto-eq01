import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Projeto {
  id?: number;
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
  private readonly apiUrl = 'http://localhost:8080/api/projetos';

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

  obterPorId(id: number): Observable<Projeto> {
    return this.http.get<Projeto>(`${this.apiUrl}/${id}`);
  }
}
