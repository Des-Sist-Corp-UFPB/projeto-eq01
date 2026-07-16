import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { AppComponent } from './app';
import { AuthService } from './core/auth/auth.service';

describe('AppComponent', () => {
  const isLoggedInSignal = signal(false);
  const isAdminSignal = signal(false);
  const currentUser = signal<any>(null);
  
  const authStub = {
    currentUser,
    isLoggedIn: computed(() => isLoggedInSignal()),
    isAdmin: computed(() => isAdminSignal()),
    logout: vi.fn()
  };

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    });
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authStub }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-layout')).toBeTruthy();
    expect(compiled.textContent).toContain('NEXUS');
  });

  it('should toggle theme', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const initial = (app as any).isDarkMode();
    app.toggleTheme();
    expect((app as any).isDarkMode()).toBe(!initial);
  });

  it('should toggle mobile menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    app.toggleMobileMenu();
    expect((app as any).isMobileMenuOpen()).toBe(true);
    
    app.closeMobileMenu();
    expect((app as any).isMobileMenuOpen()).toBe(false);
  });

  it('should logout and redirect', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    app.logout();
    expect(authStub.logout).toHaveBeenCalled();
  });

  it('should render navigation links when logged in', async () => {
    isLoggedInSignal.set(true);
    currentUser.set({ nome: 'John Doe', email: 'john@example.com', cargo: 'USER' });
    
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink="/projetos"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/grupos"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/loja"]')).toBeTruthy();
    expect(compiled.textContent).toContain('Olá, John');
    
    // Reset
    isLoggedInSignal.set(false);
    currentUser.set(null);
  });

  it('should render admin link when logged in as admin', async () => {
    isLoggedInSignal.set(true);
    isAdminSignal.set(true);
    currentUser.set({ nome: 'Admin User', email: 'admin@example.com', cargo: 'ADMIN' });
    
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink="/admin"]')).toBeTruthy();
    
    // Reset
    isLoggedInSignal.set(false);
    isAdminSignal.set(false);
    currentUser.set(null);
  });
});
