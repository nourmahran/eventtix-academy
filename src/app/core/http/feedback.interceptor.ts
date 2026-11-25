import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';

/** Set to true in a request's HttpContext to stop this interceptor from showing a toast for it. */
export const SILENT_FEEDBACK = new HttpContextToken<boolean>(() => false);

// These pages already show their own messages, so a toast would repeat them.
const HANDLED_BY_PAGE = [
  /^\/api\/login/,
  /^\/api\/register/,
  /^\/api\/students\/by-username\//,
  /^\/api\/chat/,
];

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function serverText(error: HttpErrorResponse): string | null {
  const message = (error.error as { message?: unknown } | null)?.message;
  return typeof message === 'string' && message.trim() ? message : null;
}

/** Returns the text to show for a failed request, or null when no toast is needed. */
export function feedbackMessage(error: HttpErrorResponse, method: string, path: string): string | null {
  if (error.status === 0) return 'Cannot reach the server. Check your connection and try again.';
  if (error.status === 401) {
    // A guest asking "who am I?" is normal, not an error.
    return method === 'GET' && path === '/api/user' ? null : 'Your session has ended. Please sign in again.';
  }
  if (error.status === 403) return 'You do not have permission to do that.';
  if (error.status === 404) return 'We could not find what you asked for.';
  if (error.status === 419) return 'Your session expired. Please refresh the page and try again.';
  if (error.status === 422) return null; // forms show field errors inline
  if (error.status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (error.status >= 500) return 'Something went wrong on our side. Please try again later.';
  return serverText(error) ?? 'The request could not be completed.';
}

export const feedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const path = req.url.split('?')[0];
  const isApi = path.startsWith('/api/') || path.startsWith('/sanctum/');

  if (!isApi || req.context.get(SILENT_FEEDBACK) || HANDLED_BY_PAGE.some(pattern => pattern.test(path))) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse && MUTATING_METHODS.includes(req.method)) {
          const message = (event.body as { message?: unknown } | null)?.message;
          if (typeof message === 'string' && message.trim()) notifications.success(message);
        }
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          const text = feedbackMessage(error, req.method, path);
          if (text) notifications.error(text);
        }
      },
    }),
  );
};