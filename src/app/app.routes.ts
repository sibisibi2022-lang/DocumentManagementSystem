import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/documents').then((m) => m.Documents),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'versions/:documentId',
    loadComponent: () => import('./features/versions/versions').then((m) => m.Versions),
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./features/audit-logs/audit-logs').then((m) => m.AuditLogs),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
