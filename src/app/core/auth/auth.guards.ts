import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (_route, state) => inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
export const guestGuard: CanActivateFn = () => !inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/profile']);
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  const roles = route.data['roles'] as UserRole[] | undefined;
  return (!!roles?.length && auth.hasRole(roles)) || router.createUrlTree(['/forbidden']);
};

export function safeReturnUrl(value: string | null): string {
  return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) && !/^\/(login|signup)([/?#]|$)/.test(value) ? value : '/profile';
}
