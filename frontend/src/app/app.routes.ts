import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/list/applications-list.component').then(
        (m) => m.ApplicationsListComponent,
      ),
  },
  {
    path: 'applications/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/form/application-form.component').then(
        (m) => m.ApplicationFormComponent,
      ),
  },
  {
    path: 'applications/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/form/application-form.component').then(
        (m) => m.ApplicationFormComponent,
      ),
  },
  {
    path: 'companies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/list/companies-list.component').then(
        (m) => m.CompaniesListComponent,
      ),
  },
  {
    path: 'companies/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/form/company-form.component').then(
        (m) => m.CompanyFormComponent,
      ),
  },
  {
    path: 'companies/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/form/company-form.component').then(
        (m) => m.CompanyFormComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
