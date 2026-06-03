import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Projeto } from '../services/project.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="project-card animate-fade-in" (click)="goToDetails()" style="cursor: pointer;">
      <div class="card-cover">
        <img [src]="projeto.imagemCardUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500'" alt="Capa do projeto" />
        <div class="card-badge" *ngIf="projeto.tipo">
          {{ projeto.tipo }}
        </div>
      </div>
      
      <div class="card-content">
        <div class="card-meta">
          <span class="group-name">{{ projeto.grupoPertencente || 'Iniciativa Geral' }}</span>
          
          <button class="like-button" (click)="toggleLike($event)" [class.liked]="isLiked()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span class="likes-count">{{ currentLikes() }}</span>
          </button>
        </div>

         <h3 class="project-title">{{ projeto.nome }}</h3>
        
        <p class="project-summary">{{ projeto.resumo }}</p>
        
        <div class="tags-container" *ngIf="projeto.tags">
          <span class="tag-badge" *ngFor="let tag of getTags()">#{{ tag.trim() }}</span>
        </div>

        <div class="card-footer">
          <div class="author-info">
            <span class="avatar">{{ projeto.autor ? projeto.autor.charAt(0) : 'U' }}</span>
            <span class="author-name">Por <strong>{{ projeto.autor || 'Anônimo' }}</strong></span>
          </div>
          
          <div class="members-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="users-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span>{{ projeto.quantidadeMembros || 1 }}</span>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .project-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: var(--shadow-sm);
    }

    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }

    .card-cover {
      position: relative;
      height: 160px;
      overflow: hidden;
      background: linear-gradient(135deg, #1f7ae0 0%, #13a37c 100%);
    }

    .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition);
    }

    .project-card:hover .card-cover img {
      transform: scale(1.05);
    }

    .card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(19, 32, 51, 0.75);
      backdrop-filter: blur(4px);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-content {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .group-name {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .like-button {
      background: #f1f5f9;
      border: none;
      border-radius: 20px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: var(--color-muted);
      transition: var(--transition);
    }

    .like-button:hover {
      background: #fee2e2;
      color: #ef4444;
      transform: scale(1.05);
    }

    .like-button.liked {
      background: #fee2e2;
      color: #ef4444;
    }

    .heart-icon {
      width: 14px;
      height: 14px;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .like-button:active .heart-icon {
      transform: scale(1.4);
    }

    .likes-count {
      font-size: 11px;
      font-weight: 700;
    }

    .project-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-summary {
      font-size: 13px;
      color: var(--color-muted);
      margin-bottom: 12px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }

    .tag-badge {
      background: #f1f5f9;
      color: var(--color-muted);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
      margin-top: auto;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
    }

    .author-name {
      font-size: 11px;
      color: var(--color-muted);
    }

    .author-name strong {
      color: var(--color-text);
    }

    .members-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-muted);
    }

    .users-icon {
      width: 14px;
      height: 14px;
    }
  `]
})
export class ProjectCardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  @Input({ required: true }) projeto!: Projeto;

  protected readonly isLiked = signal(false);
  protected readonly currentLikes = signal(0);

  ngOnInit() {
    this.currentLikes.set(this.projeto.curtidas || 0);
    const user = this.authService.currentUser();
    if (user && this.projeto.id) {
      const favsStr = localStorage.getItem(`nexushub_fav_projects_${user.id}`);
      if (favsStr) {
        try {
          const parsed = JSON.parse(favsStr);
          if (Array.isArray(parsed) && parsed.includes(this.projeto.id)) {
            this.isLiked.set(true);
          }
        } catch {}
      }
    }
  }

  toggleLike(event: Event) {
    event.stopPropagation();
    const user = this.authService.currentUser();
    if (!user) {
      this.isLiked.update(l => !l);
      this.currentLikes.update(l => this.isLiked() ? l + 1 : l - 1);
      return;
    }

    if (this.isLiked()) {
      this.isLiked.set(false);
      this.currentLikes.update(l => l - 1);
      if (this.projeto.id) {
        const favsStr = localStorage.getItem(`nexushub_fav_projects_${user.id}`);
        if (favsStr) {
          try {
            const parsed = JSON.parse(favsStr);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((id: any) => id !== this.projeto.id);
              localStorage.setItem(`nexushub_fav_projects_${user.id}`, JSON.stringify(updated));
            }
          } catch {}
        }
      }
    } else {
      this.isLiked.set(true);
      this.currentLikes.update(l => l + 1);
      if (this.projeto.id) {
        const favsStr = localStorage.getItem(`nexushub_fav_projects_${user.id}`);
        let parsed = [];
        if (favsStr) {
          try {
            parsed = JSON.parse(favsStr);
          } catch {}
        }
        if (!Array.isArray(parsed)) parsed = [];
        if (!parsed.includes(this.projeto.id)) {
          parsed.push(this.projeto.id);
        }
        localStorage.setItem(`nexushub_fav_projects_${user.id}`, JSON.stringify(parsed));
      }
    }
  }

  goToDetails() {
    if (this.projeto.id) {
      this.router.navigate(['/projetos', this.projeto.id]);
    }
  }

  getTags(): string[] {
    if (!this.projeto.tags) return [];
    return this.projeto.tags.split(',');
  }
}
