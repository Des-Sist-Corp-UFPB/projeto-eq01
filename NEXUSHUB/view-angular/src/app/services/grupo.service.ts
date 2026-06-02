import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Grupo {
  id?: number;
  nome: string;
  descricao: string;
  area?: string;
  responsavel?: string;
  tipo?: string;
  cor?: string;
  logo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/grupos';

  listar(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  criar(grupo: Grupo): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, grupo);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
