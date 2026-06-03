import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isDarkMode = signal(false);

  ngOnInit() {
    const savedTheme = localStorage.getItem('nexushub_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.isDarkMode.set(true);
      document.body.classList.add('dark-mode');
    } else {
      this.isDarkMode.set(false);
      document.body.classList.remove('dark-mode');
    }
  }

  toggleTheme() {
    this.isDarkMode.update(dark => {
      const nextDark = !dark;
      if (nextDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('nexushub_theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('nexushub_theme', 'light');
      }
      return nextDark;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
