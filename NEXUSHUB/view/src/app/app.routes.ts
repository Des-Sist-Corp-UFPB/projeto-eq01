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
import { AdminPageComponent } from './features/administration/pages/admin/admin.page';
import { PrivacyPageComponent } from './features/privacy/pages/privacy/privacy.page';
import { OnboardingPageComponent } from './features/auth/pages/onboarding/onboarding.page';
import { onboardingGuard } from './core/auth/onboarding.guard';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { ProjetosPageComponent } from './features/projects/pages/projetos/projetos.page';
import { OportunidadesPageComponent } from './features/opportunities/pages/oportunidades/oportunidades.page';
import { PessoasPageComponent } from './features/people/pages/pessoas/pessoas.page';
import { TermosPrivacidadePageComponent } from './features/institutional/pages/termos-privacidade/termos-privacidade.page';
import { SobrePageComponent } from './features/institutional/pages/sobre/sobre.page';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'cadastro', component: CadastroPageComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaPageComponent },
  { path: 'onboarding', component: OnboardingPageComponent },
  {
    path: '',
    canActivate: [onboardingGuard],
    children: [
      { path: '', component: DashboardPageComponent },
      { path: 'projetos', component: ProjetosPageComponent, canActivate: [authGuard] },
      { path: 'perfil', component: PerfilPageComponent, canActivate: [authGuard] },
      { path: 'perfil/:username', component: PerfilPageComponent, canActivate: [authGuard] },
      { path: 'projetos/:id', component: ProjetoDetalhePageComponent, canActivate: [authGuard] },
      { path: 'grupos', component: GruposPageComponent, canActivate: [authGuard] },
      { path: 'grupos/:id', component: GrupoDetalhePageComponent, canActivate: [authGuard] },
      { path: 'loja', component: LojaPageComponent, canActivate: [authGuard] },
      { path: 'oportunidades', component: OportunidadesPageComponent, canActivate: [authGuard] },
      { path: 'pessoas', component: PessoasPageComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
      { path: 'privacidade', component: PrivacyPageComponent },
      { path: 'termos-e-privacidade', component: TermosPrivacidadePageComponent },
      { path: 'sobre', component: SobrePageComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

