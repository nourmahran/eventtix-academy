import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
const status = () => import('./features/status/status').then(m => m.Status);
export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'EventTix Academy | Home', loadComponent: () => import('./features/home/home/home').then(m => m.Home) },
  { path: 'login', title: 'EventTix | Login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'signup', title: 'EventTix | Sign up', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup) },
  { path: 'profile', title: 'EventTix | Profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
  { path: 'events', title: 'EventTix | Events', loadComponent: status, data: { heading: 'Events', message: 'The event catalogue is awaiting the event team’s integration.' } },
  { path: 'admin', title: 'EventTix | Administration', canActivate: [roleGuard], loadComponent: status, data: { roles: ['admin'], heading: 'Administration demo', message: 'Admin access is active. Event management and budgets are awaiting team integration.' } },
  { path: 'accounting', title: 'EventTix | Accounting', canActivate: [roleGuard], loadComponent: status, data: { roles: ['admin', 'accounting'], heading: 'Accounting demo', message: 'Accounting access is active. Invoices, student fees and payroll are awaiting team integration.' } },
  { path: 'forbidden', title: 'EventTix | Access denied', loadComponent: status, data: { heading: 'Access denied', message: 'Your current role cannot open this page.' } },
  { path: '**', title: 'EventTix | Page not found', loadComponent: status, data: { heading: 'Page not found', message: 'This address does not exist. Use the navigation to continue.' } }
];
