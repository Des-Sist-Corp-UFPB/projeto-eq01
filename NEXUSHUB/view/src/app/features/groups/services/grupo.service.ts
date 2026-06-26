import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../core/config/api.config';

export interface Grupo {
  id?: string;
  nome: string;
  descricao: string;
  area?: string;
  responsavel?: string;
  tipo?: string;
  cor?: string;
  logo?: string;
  criadorId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl('/api/grupos');

  listar(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl);
  }

  obterPorId(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  criar(grupo: Grupo): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, grupo);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
