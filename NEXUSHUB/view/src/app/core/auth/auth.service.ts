import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { apiUrl } from '../config/api.config';

export interface UsuarioResponse {
  id: string;
  nome: string;
  username?: string;
  email: string;
  cargo: string;
  fotoUrl?: string;
  onboardingCompleted: boolean;
  userType?: string;
  showBirthday?: boolean;
  bio?: string;
  birthDate?: string;
  genderType?: number;
  genderOther?: string;
  course?: string;
  period?: number;
  matricula?: string;
  ingressPeriod?: number;
  conclusionPeriod?: number;
  whatsapp?: string;
  githubUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  notifRecommendations?: boolean;
  notifApplications?: boolean;
  notifAnnouncements?: boolean;
  notifEdicts?: boolean;
  notifAdmin?: boolean;
  experience?: string;
  education?: string;
  certification?: string;
  technologies?: string[];
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
  readonly isAdmin = computed(() => ['ADMIN', 'SYSADMIN'].includes(this.currentUser()?.cargo ?? ''));

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    this.http.get<UsuarioResponse>(`${this.apiUrl}/sessao`).pipe(
      catchError(() => of(null))
    ).subscribe(user => this.currentUser.set(user));
  }

  login(credentials: LoginRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  cadastrar(usuario: CadastroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/cadastro`, usuario);
  }

  redefinirSenha(request: RedefinirSenhaRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/esqueci-senha`, request);
  }

  atualizarPerfil(id: string, usuario: any): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/perfil/${id}`, usuario).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
      })
    );
  }

  completarOnboarding(id: string, onboardingData: any): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/onboarding/${id}`, onboardingData).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
      })
    );
  }

  loginComGoogle(token: string): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/login-google`, { token }).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.http.post<void>(`${this.apiUrl}/logout`, {}).subscribe();
  }
}
