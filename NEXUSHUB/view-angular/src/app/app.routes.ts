import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard.page';
import { LoginPageComponent } from './pages/login.page';
import { CadastroPageComponent } from './pages/cadastro.page';
import { EsqueciSenhaPageComponent } from './pages/esqueci-senha.page';
import { PerfilPageComponent } from './pages/perfil.page';
import { ProjetoDetalhePageComponent } from './pages/projeto-detalhe.page';
import { GruposPageComponent } from './pages/grupos.page';
import { GrupoDetalhePageComponent } from './pages/grupo-detalhe.page';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'cadastro', component: CadastroPageComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaPageComponent },
  { path: 'perfil', component: PerfilPageComponent },
  { path: 'projetos/:id', component: ProjetoDetalhePageComponent },
  { path: 'grupos', component: GruposPageComponent },
  { path: 'grupos/:id', component: GrupoDetalhePageComponent },
  { path: '**', redirectTo: '' }
];
