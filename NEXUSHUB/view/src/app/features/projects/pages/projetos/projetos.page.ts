import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Projeto } from '../../services/project.service';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { NewProjectModalComponent } from '../../../../shared/components/new-project-modal/new-project-modal.component';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-projetos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectCardComponent, CarouselComponent, NewProjectModalComponent],
  templateUrl: './projetos.page.html',
  styleUrl: './projetos.page.css'
})
export class ProjetosPageComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;

  // All active projects (grid view)
  protected readonly activeProjects = signal<Projeto[]>([]);
  protected readonly isLoading = signal(true);

  // Carousel signals (moved from dashboard)
  protected readonly hotProjects = signal<Projeto[]>([]);
  protected readonly recentProjects = signal<Projeto[]>([]);
  protected readonly colabs = signal<Projeto[]>([]);
  protected readonly myProjects = signal<Projeto[]>([]);
  protected readonly tagProjects = signal<Projeto[]>([]);

  // Search & Filter
  protected readonly searchQuery = signal('');

  // Tag chips
  protected readonly tagsList = ['Angular', 'Spring Boot', 'Python', 'Flutter', 'Arduino', 'PostgreSQL'];
  protected readonly selectedTag = signal(this.tagsList[0]);

  // Create Modal
  protected readonly showCreateModal = signal(false);

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.projectService.listar().subscribe(projs => {
      const active = projs.filter(p => p.status === '2');
      this.activeProjects.set(active);
      this.isLoading.set(false);
    });

    this.projectService.listarQuentes().subscribe(projs => {
      this.hotProjects.set(projs);
    });

    this.projectService.listarRecentes().subscribe(projs => {
      this.recentProjects.set(projs);
    });

    this.projectService.listarColabs().subscribe(projs => {
      this.colabs.set(projs);
    });

    const user = this.currentUser();
    if (user) {
      this.projectService.listarPorUsuario(user.nome).subscribe(projs => {
        this.myProjects.set(projs);
      });
    }

    this.loadTagProjects(this.selectedTag());
  }

  loadTagProjects(tag: string) {
    this.selectedTag.set(tag);
    this.projectService.listarPorTag(tag).subscribe(projs => {
      this.tagProjects.set(projs);
    });
  }

  getFilteredProjects(): Projeto[] {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.activeProjects();
    return this.activeProjects().filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.resumo.toLowerCase().includes(q) ||
      (p.tags && p.tags.toLowerCase().includes(q))
    );
  }

  openCreateModal() { this.showCreateModal.set(true); }
  closeCreateModal() { this.showCreateModal.set(false); }
  onProjectSaved() {
    this.showCreateModal.set(false);
    this.loadAllData();
  }
}
