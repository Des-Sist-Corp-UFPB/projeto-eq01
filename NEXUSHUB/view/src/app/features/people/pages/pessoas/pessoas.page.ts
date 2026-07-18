import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
}

@Component({
  selector: 'app-pessoas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pessoas.page.html',
  styleUrls: ['./pessoas.page.css']
})
export class PessoasPageComponent implements OnInit {
  pessoas = signal<PessoaCardResponse[]>([]);
  searchQuery = signal<string>('');
  selectedFilter = signal<string>('Todos');
  isLoading = signal<boolean>(true);

  filteredPessoas = computed(() => {
    let list = this.pessoas();
    
    const filter = this.selectedFilter();
    if (filter !== 'Todos') {
      list = list.filter(p => {
        if (filter === 'Professor') return p.cargo === 'PROFESSOR';
        if (filter === 'Aluno') return p.cargo === 'STUDENT' || p.cargo === 'USER';
        if (filter === 'Técnico') return p.cargo === 'TECNICO' || p.cargo === 'ADMIN';
        return true;
      });
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(p => 
        (p.nome && p.nome.toLowerCase().includes(query)) ||
        (p.username && p.username.toLowerCase().includes(query))
      );
    }

    return list;
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPessoas();
  }

  loadPessoas() {
    this.isLoading.set(true);
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

  toggleFollow(pessoa: PessoaCardResponse) {
    // Optimistic UI update
    const previousState = pessoa.isFollowing;
    pessoa.isFollowing = !pessoa.isFollowing;
    pessoa.seguidoresCount += pessoa.isFollowing ? 1 : -1;
    
    // Replace element in signal array to trigger reactivity if needed
    // However, mutating the object directly also works in Angular templates usually,
    // but a set is safer:
    this.pessoas.update(list => [...list]);
    
    this.http.post(`${apiUrl}/perfil/${pessoa.username}/seguir`, {}).subscribe({
      next: () => {},
      error: () => {
        // Revert on error
        pessoa.isFollowing = previousState;
        pessoa.seguidoresCount += pessoa.isFollowing ? 1 : -1;
        this.pessoas.update(list => [...list]);
      }
    });
  }

  getRoleDisplay(cargo: string): string {
    if (cargo === 'PROFESSOR') return 'Professor';
    if (cargo === 'STUDENT' || cargo === 'USER') return 'Aluno';
    if (cargo === 'TECNICO') return 'Técnico Administrativo';
    if (cargo === 'ADMIN' || cargo === 'SYSADMIN') return 'Administrador';
    return cargo;
  }
}
