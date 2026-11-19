import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
const status = () => import('./features/status/status').then(m => m.Status);
export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'EventTix Academy | Home', loadComponent: () => import('./features/home/home/home').then(m => m.Home) },
  { path: 'login', title: 'EventTix | Login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'signup', title: 'EventTix | Sign up', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup) },
  { path: 'dashboard', title: 'EventTix | Overview', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'profile', title: 'EventTix | Profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
  { path: 'events', title: 'EventTix | Events', loadComponent: () => import('./features/events/pages/event-list/event-list').then(m => m.EventList) },
  { path: 'events/:id/seats', title: 'EventTix | Choose Seats', canActivate: [authGuard], loadComponent: () => import('./features/events/pages/seat-selection/seat-selection').then(m => m.SeatSelection) },
  { path: 'events/:id/checkout', title: 'EventTix | Checkout', canActivate: [authGuard], loadComponent: () => import('./features/events/pages/checkout/checkout').then(m => m.Checkout) },
  { path: 'events/:id', title: 'EventTix | Event Details', loadComponent: () => import('./features/events/pages/event-details/event-details').then(m => m.EventDetails) },
  { path: 'admin/events', title: 'EventTix | Manage Events', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./features/events/pages/admin-events/admin-events').then(m => m.AdminEvents) },
  { path: 'ticket-history', title: 'EventTix | My Tickets', canActivate: [authGuard], loadComponent: () => import('./features/events/pages/ticket-history/ticket-history').then(m => m.TicketHistory) },
  { path: 'admin', title: 'EventTix | Administration', canActivate: [roleGuard], loadComponent: status, data: { roles: ['admin'], links: [{ path: '/accounting', label: 'Open Accounting' }, { path: '/admin/events', label: 'Manage Events' }], heading: 'Administration', message: 'Admin access is active. Finance tools are available through Accounting. Use Manage Events to add or edit the event catalogue.' } },
  { path: 'accounting', title: 'EventTix | Accounting', canActivate: [roleGuard], loadComponent: status, data: { roles: ['admin', 'accounting'], links: [{ path: '/student-fees', label: 'Student fees' }, { path: '/payroll', label: 'Staff payroll' }, { path: '/event-finance', label: 'Event finance' }, { path: '/department-budget', label: 'Department budgets' }], heading: 'Accounting workspace', message: 'Accounting access is active. Open a finance workspace below. Records are saved in this browser.' } },
  // These are staff-wide management views, not individual student records.
  { path: 'student-fees', title: 'EventTix | Student Fees', canActivate: [roleGuard], data: { roles: ['admin', 'accounting'] }, loadComponent: () => import('./features/finance/student-fees/student-fees').then(m => m.StudentFees) },
  { path: 'payroll', title: 'EventTix | Payroll', canActivate: [roleGuard], data: { roles: ['admin', 'accounting'] }, loadComponent: () => import('./features/finance/payroll/payroll').then(m => m.Payroll) },
  { path: 'department-budget', title: 'EventTix | Department Budgets', canActivate: [roleGuard], data: { roles: ['admin', 'accounting'] }, loadComponent: () => import('./features/finance/department-budget/department-budget').then(m => m.DepartmentBudget) },
  { path: 'event-finance', title: 'EventTix | Event Finance', canActivate: [roleGuard], data: { roles: ['admin', 'accounting'] }, loadComponent: () => import('./features/finance/event-finance/event-finance').then(m => m.EventFinance) },
  { path: 'forbidden', title: 'EventTix | Access denied', loadComponent: status, data: { heading: 'Access denied', message: 'Your current role cannot open this page.' } },
  { path: '**', title: 'EventTix | Page not found', loadComponent: status, data: { heading: 'Page not found', message: 'This address does not exist. Use the navigation to continue.' } }
];
