import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const check = () => auth.isAuthenticated() || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return auth.ready ? auth.ready.then(check) : check();
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const check = () => !auth.isAuthenticated() || router.createUrlTree(['/profile']);
  return auth.ready ? auth.ready.then(check) : check();
};

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const check = () => {
    if (!auth.isAuthenticated()) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    const roles = route.data['roles'] as UserRole[] | undefined;
    return (!!roles?.length && auth.hasRole(roles)) || router.createUrlTree(['/forbidden']);
  };
  return auth.ready ? auth.ready.then(check) : check();
};

export function safeReturnUrl(value: string | null): string {
  return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) && !/^\/(login|signup)([/?#]|$)/.test(value) ? value : '/profile';
}
