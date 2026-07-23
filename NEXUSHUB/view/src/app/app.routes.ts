import { Routes } from '@angular/router';
import { onboardingGuard } from './core/auth/onboarding.guard';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: 'cadastro', loadComponent: () => import('./features/auth/pages/cadastro/cadastro.page').then(m => m.CadastroPageComponent) },
  { path: 'esqueci-senha', loadComponent: () => import('./features/auth/pages/esqueci-senha/esqueci-senha.page').then(m => m.EsqueciSenhaPageComponent) },
  { path: 'onboarding', loadComponent: () => import('./features/auth/pages/onboarding/onboarding.page').then(m => m.OnboardingPageComponent) },
  {
    path: '',
    canActivate: [onboardingGuard],
    children: [
      { path: '', loadComponent: () => import('./features/projects/pages/dashboard/dashboard.page').then(m => m.DashboardPageComponent) },
      { path: 'projetos', loadComponent: () => import('./features/projects/pages/projetos/projetos.page').then(m => m.ProjetosPageComponent), canActivate: [authGuard] },
      { path: 'perfil', loadComponent: () => import('./features/people/pages/perfil/perfil.page').then(m => m.PerfilPageComponent), canActivate: [authGuard] },
      { path: 'perfil/:username', loadComponent: () => import('./features/people/pages/perfil/perfil.page').then(m => m.PerfilPageComponent), canActivate: [authGuard] },
      { path: 'projetos/:id', loadComponent: () => import('./features/projects/pages/projeto-detalhe/projeto-detalhe.page').then(m => m.ProjetoDetalhePageComponent), canActivate: [authGuard] },
      { path: 'grupos', loadComponent: () => import('./features/groups/pages/grupos/grupos.page').then(m => m.GruposPageComponent), canActivate: [authGuard] },
      { path: 'grupos/:id', loadComponent: () => import('./features/groups/pages/grupo-detalhe/grupo-detalhe.page').then(m => m.GrupoDetalhePageComponent), canActivate: [authGuard] },
      { path: 'loja', loadComponent: () => import('./features/store/pages/loja/loja.page').then(m => m.LojaPageComponent), canActivate: [authGuard] },
      { path: 'loja/novo-produto', loadComponent: () => import('./features/store/pages/novo-produto/novo-produto.page').then(m => m.NovoProdutoPageComponent), canActivate: [authGuard] },
      { path: 'loja/editar-produto/:id', loadComponent: () => import('./features/store/pages/novo-produto/novo-produto.page').then(m => m.NovoProdutoPageComponent), canActivate: [authGuard] },
      { path: 'oportunidades', loadComponent: () => import('./features/opportunities/pages/oportunidades/oportunidades.page').then(m => m.OportunidadesPageComponent), canActivate: [authGuard] },
      { path: 'pessoas', loadComponent: () => import('./features/people/pages/pessoas/pessoas.page').then(m => m.PessoasPageComponent), canActivate: [authGuard] },
      { path: 'admin', loadComponent: () => import('./features/administration/pages/admin/admin.page').then(m => m.AdminPageComponent), canActivate: [adminGuard] },
      { path: 'privacidade', loadComponent: () => import('./features/privacy/pages/privacy/privacy.page').then(m => m.PrivacyPageComponent) },
      { path: 'termos-e-privacidade', loadComponent: () => import('./features/institutional/pages/termos-privacidade/termos-privacidade.page').then(m => m.TermosPrivacidadePageComponent) },
      { path: 'sobre', loadComponent: () => import('./features/institutional/pages/sobre/sobre.page').then(m => m.SobrePageComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];

