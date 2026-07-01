import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly isAdmin = computed(() => this.authService.isAdmin());
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isDarkMode = signal(false);

  ngOnInit() {
    this.applyTheme();
    
    // Listen for dynamic changes in the system color scheme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('nexushub_theme');
      if (!savedTheme) {
        this.isDarkMode.set(e.matches);
        document.body.classList.toggle('dark-mode', e.matches);
      }
    });
  }

  private applyTheme() {
    const savedTheme = localStorage.getItem('nexushub_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDarkMode.set(nextDark);
    document.body.classList.toggle('dark-mode', nextDark);
  }

  toggleTheme() {
    this.isDarkMode.update((dark) => {
      const nextDark = !dark;
      document.body.classList.toggle('dark-mode', nextDark);
      localStorage.setItem('nexushub_theme', nextDark ? 'dark' : 'light');
      return nextDark;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
