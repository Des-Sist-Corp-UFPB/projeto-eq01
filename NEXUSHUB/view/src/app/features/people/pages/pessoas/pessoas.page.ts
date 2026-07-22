import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { apiUrl } from '../../../../core/config/api.config';

export interface PessoaCardResponse {
  id: string;
  nome: string;
  username: string;
  cargo: string;
  userType: string;
  fotoUrl: string;
  curso: string;
  periodo: string;
  projetosCount: number;
  seguidoresCount: number;
  isFollowing: boolean;
  technologies?: string[];
}

@Component({
  selector: 'app-pessoas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pessoas.page.html',
  styleUrls: ['./pessoas.page.css']
})
export class PessoasPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  pessoas = signal<PessoaCardResponse[]>([]);
  isLoading = signal<boolean>(true);

  // Filter Panel state
  isFilterExpanded = signal<boolean>(true);
  filterPapel = signal<string>('Todos');
  filterCurso = signal<string>('Todos');
  filterProjeto = signal<string>('Todos');
  competenciaInput = signal<string>('');
  filterCompetencias = signal<string[]>([]);

  filteredPessoas = computed(() => {
    let list = this.pessoas();

    // 1. Papel
    const papel = this.filterPapel();
    if (papel !== 'Todos' && papel !== 'Todos os Papéis') {
      list = list.filter(p => {
        if (papel === 'Professor') return p.cargo === 'PROFESSOR';
        if (papel === 'Aluno') return p.cargo === 'STUDENT' || p.cargo === 'USER';
        if (papel === 'Técnico') return p.cargo === 'TECNICO';
        if (papel === 'Administrador') return p.cargo === 'ADMIN' || p.cargo === 'ADMINISTRATOR';
        return true;
      });
    }

    // 2. Curso
    const curso = this.filterCurso();
    if (curso !== 'Todos') {
      list = list.filter(p => p.curso && p.curso.toLowerCase().includes(curso.toLowerCase()));
    }

    // 3. Competências (todas exigidas)
    const comps = this.filterCompetencias();
    if (comps.length > 0) {
      list = list.filter(p => {
        const userTechs = (p.technologies || []).map(t => t.toLowerCase());
        return comps.every(c => userTechs.includes(c.toLowerCase()));
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.loadPessoas();
  }

  loadPessoas() {
    this.isLoading.set(true);
    this.http.get<PessoaCardResponse[]>(`${apiUrl}/api/usuarios/comunidade`).subscribe({
      next: (data) => {
        this.pessoas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to /usuarios/comunidade if legacy endpoint
        this.http.get<PessoaCardResponse[]>(`${apiUrl}/usuarios/comunidade`).subscribe({
          next: (data) => {
            this.pessoas.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Erro ao carregar pessoas', err);
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  addCompetenciaFiltro() {
    const val = this.competenciaInput().trim();
    if (val && !this.filterCompetencias().includes(val)) {
      this.filterCompetencias.update(list => [...list, val]);
    }
    this.competenciaInput.set('');
  }

  removeCompetenciaFiltro(tech: string) {
    this.filterCompetencias.update(list => list.filter(t => t !== tech));
  }

  limparFiltros() {
    this.filterPapel.set('Todos');
    this.filterCurso.set('Todos');
    this.filterProjeto.set('Todos');
    this.competenciaInput.set('');
    this.filterCompetencias.set([]);
  }

  navigateToPerfil(username: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/perfil', username]);
  }

  toggleFollow(pessoa: PessoaCardResponse, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const previousState = pessoa.isFollowing;
    pessoa.isFollowing = !pessoa.isFollowing;
    pessoa.seguidoresCount += pessoa.isFollowing ? 1 : -1;
    this.pessoas.update(list => [...list]);

    this.http.post(`${apiUrl}/api/usuarios/perfil/${pessoa.username}/seguir`, {}).subscribe({
      next: () => {},
      error: () => {
        pessoa.isFollowing = previousState;
        pessoa.seguidoresCount += pessoa.isFollowing ? 1 : -1;
        this.pessoas.update(list => [...list]);
      }
    });
  }

  getRoleBadgeDisplay(pessoa: PessoaCardResponse): { label: string, code: string } {
    if (pessoa.cargo === 'PROFESSOR') return { label: 'Professor', code: 'Professor' };
    if (pessoa.cargo === 'ADMIN' || pessoa.cargo === 'ADMINISTRATOR') return { label: 'Administrador', code: 'Admin' };
    if (pessoa.cargo === 'TECNICO') return { label: 'Técnico Administrativo', code: 'Tecnico' };
    if (pessoa.curso) {
      let code = pessoa.curso;
      if (pessoa.curso.includes('Sistemas de Informação')) code = 'SI';
      else if (pessoa.curso.includes('Ciência da Computação')) code = 'CC';
      else if (pessoa.curso.includes('Secretariado')) code = 'Secretaria Executiva Bilíngue';
      
      const periodStr = pessoa.periodo ? ` ${pessoa.periodo}` : '';
      return { label: `${code}${periodStr}`, code: code };
    }
    return { label: 'Aluno', code: 'Aluno' };
  }

  getAvatarInitial(nome: string): string {
    if (!nome) return 'A';
    return nome.charAt(0).toUpperCase();
  }

  getAvatarColor(nome: string): string {
    const colors = ['#00acc1', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#3949ab', '#00897b', '#d81b60'];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
