import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Grupo {
  id?: number;
  nome: string;
  descricao: string;
  area?: string;
  responsavel?: string;
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
}
