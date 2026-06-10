import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/projects/pages/dashboard/dashboard.page';
import { LoginPageComponent } from './features/auth/pages/login/login.page';
import { CadastroPageComponent } from './features/auth/pages/cadastro/cadastro.page';
import { EsqueciSenhaPageComponent } from './features/auth/pages/esqueci-senha/esqueci-senha.page';
import { PerfilPageComponent } from './features/people/pages/perfil/perfil.page';
import { ProjetoDetalhePageComponent } from './features/projects/pages/projeto-detalhe/projeto-detalhe.page';
import { GruposPageComponent } from './features/groups/pages/grupos/grupos.page';
import { GrupoDetalhePageComponent } from './features/groups/pages/grupo-detalhe/grupo-detalhe.page';
import { LojaPageComponent } from './features/store/pages/loja/loja.page';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'cadastro', component: CadastroPageComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaPageComponent },
  { path: 'perfil', component: PerfilPageComponent },
  { path: 'projetos/:id', component: ProjetoDetalhePageComponent },
  { path: 'grupos', component: GruposPageComponent },
  { path: 'grupos/:id', component: GrupoDetalhePageComponent },
  { path: 'loja', component: LojaPageComponent },
  { path: '**', redirectTo: '' }
];

