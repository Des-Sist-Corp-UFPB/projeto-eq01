import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { apiUrl } from '../config/api.config';

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  fotoUrl?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  cargo: string;
}

export interface RedefinirSenhaRequest {
  email: string;
  novaSenha: string;
}

export interface AtualizarPerfilRequest {
  nome: string;
  email: string;
  cargo: string;
  senha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl('/api/usuarios');

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

  login(credentials: LoginRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  cadastrar(usuario: CadastroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/cadastro`, usuario);
  }

  redefinirSenha(request: RedefinirSenhaRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/esqueci-senha`, request);
  }

  atualizarPerfil(id: string, usuario: AtualizarPerfilRequest): Observable<UsuarioResponse> {
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
