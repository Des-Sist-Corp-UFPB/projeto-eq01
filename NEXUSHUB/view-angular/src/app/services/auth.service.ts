import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  fotoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/usuarios';

  // Session Signal
  readonly currentUser = signal<UsuarioResponse | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    const session = localStorage.getItem('currentUser');
    if (session) {
      try {
        this.currentUser.set(JSON.parse(session));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: any): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  cadastrar(usuario: any): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/cadastro`, usuario);
  }

  redefinirSenha(request: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/esqueci-senha`, request);
  }

  atualizarPerfil(id: number, usuario: any): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/perfil/${id}`, usuario).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }
}
