import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Projeto } from '../../../features/projects/services/project.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent implements OnInit {
  private readonly router = inject(Router);
  @Input({ required: true }) projeto!: Projeto;

  protected readonly isLiked = signal(false);
  protected readonly currentLikes = signal(0);

  ngOnInit() {
    this.currentLikes.set(this.projeto.curtidas || 0);
  }

  toggleLike(event: Event) {
    event.stopPropagation();
    if (this.isLiked()) {
      this.isLiked.set(false);
      this.currentLikes.update(l => l - 1);
    } else {
      this.isLiked.set(true);
      this.currentLikes.update(l => l + 1);
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



