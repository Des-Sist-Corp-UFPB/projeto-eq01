import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService, LoginRequest, CadastroRequest, RedefinirSenhaRequest } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Expect initial loadSession call
    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/sessao');
    expect(req.request.method).toBe('GET');
    req.flush(null); // Return no user initially
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  it('should login user and set currentUser signal', () => {
    const mockUser = {
      id: '1',
      nome: 'John',
      email: 'john@example.com',
      cargo: 'USER',
      onboardingCompleted: true
    };

    const credentials: LoginRequest = { email: 'john@example.com', senha: 'password' };

    service.login(credentials).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });

    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockUser);
  });

  it('should register a new user', () => {
    const mockUser = {
      id: '2',
      nome: 'Jane',
      email: 'jane@example.com',
      cargo: 'USER',
      onboardingCompleted: false
    };

    const registerReq: CadastroRequest = {
      nome: 'Jane',
      email: 'jane@example.com',
      senha: 'password',
      cargo: 'USER'
    };

    service.cadastrar(registerReq).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/cadastro');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerReq);
    req.flush(mockUser);
  });

  it('should request password redefinition', () => {
    const request: RedefinirSenhaRequest = {
      email: 'jane@example.com',
      novaSenha: 'newpassword'
    };

    service.redefinirSenha(request).subscribe();

    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/esqueci-senha');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(null);
  });

  it('should update user profile', () => {
    const mockUser = {
      id: '1',
      nome: 'John Updated',
      email: 'john@example.com',
      cargo: 'USER',
      onboardingCompleted: true
    };

    service.atualizarPerfil('1', mockUser).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/perfil/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockUser);
  });

  it('should complete onboarding', () => {
    const mockUser = {
      id: '1',
      nome: 'John',
      email: 'john@example.com',
      cargo: 'USER',
      onboardingCompleted: true
    };

    service.completarOnboarding('1', { course: 'CS' }).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/onboarding/1');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('should logout user and clear currentUser signal', () => {
    const mockUser = {
      id: '1',
      nome: 'John',
      email: 'john@example.com',
      cargo: 'USER',
      onboardingCompleted: true
    };
    service.currentUser.set(mockUser);

    service.logout();

    expect(service.currentUser()).toBeNull();
    const req = httpTestingController.expectOne('http://localhost:8085/api/usuarios/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});
