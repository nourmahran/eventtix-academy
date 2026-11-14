
import { Routes } from '@angular/router';
import { StudentFees } from './features/finance/student-fees/student-fees';
import { Payroll } from './features/finance/payroll/payroll';

export const routes: Routes = [
  {
    path: 'student-fees',
    component: StudentFees
  },
  {
    path: 'payroll',
    component: Payroll
  },
  {
  path: 'event-finance',
  loadComponent: () =>
    import('./features/finance/event-finance/event-finance')
      .then(m => m.EventFinance)
}
];
