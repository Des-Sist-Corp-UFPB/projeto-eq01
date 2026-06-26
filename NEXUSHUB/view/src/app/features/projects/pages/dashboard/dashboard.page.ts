import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Projeto } from '../../services/project.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { NewProjectModalComponent } from '../../../../shared/components/new-project-modal/new-project-modal.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent, NewProjectModalComponent, ProjectCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // States
  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly showCreateModal = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedTag = signal('Angular');

  // Project Lists
  protected readonly allProjects = signal<Projeto[]>([]);
  protected readonly hotProjects = signal<Projeto[]>([]);
  protected readonly recentProjects = signal<Projeto[]>([]);
  protected readonly colabs = signal<Projeto[]>([]);
  protected readonly myProjects = signal<Projeto[]>([]);
  protected readonly tagProjects = signal<Projeto[]>([]);

  // List of tags for carousel selection
  protected readonly tagsList = ['Angular', 'Spring Boot', 'Python', 'Flutter', 'Arduino', 'PostgreSQL'];

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.projectService.listar().subscribe(projs => {
      this.allProjects.set(projs);
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

    // Se estiver logado, puxa os projetos criados/participados
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

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onProjectSaved() {
    this.loadAllData();
  }

  getFilteredProjects(): Projeto[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.allProjects().filter(p => 
      p.nome.toLowerCase().includes(query) || 
      (p.resumo && p.resumo.toLowerCase().includes(query)) ||
      (p.tags && p.tags.toLowerCase().includes(query)) ||
      (p.autor && p.autor.toLowerCase().includes(query))
    );
  }
}



