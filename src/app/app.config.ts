import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { feedbackInterceptor } from './core/http/feedback.interceptor';
import { ACCOUNT_API } from './core/auth/auth.service';
import { AccountApi } from './core/auth/account-api';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([feedbackInterceptor])),
    { provide: ACCOUNT_API, useFactory: (http: HttpClient) => new AccountApi(http), deps: [HttpClient] }
  ]
};
