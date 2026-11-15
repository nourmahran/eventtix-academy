import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { routes } from '../../app.routes';

describe('Finance route integration', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('protects all staff finance views from guests and students', async () => {
    const harness = await RouterTestingHarness.create();
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    for (const path of ['/student-fees', '/payroll', '/event-finance']) {
      auth.logout();
      await harness.navigateByUrl(path);
      expect(router.url).toContain('/login?returnUrl=');
      auth.startDemo('student');
      await harness.navigateByUrl(path);
      expect(router.url).toBe('/forbidden');
    }
  });

  it('loads all completed finance pages for accounting and admin users', async () => {
    const harness = await RouterTestingHarness.create();
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    for (const role of ['accounting', 'admin'] as const) {
      auth.startDemo(role);
      await harness.navigateByUrl('/accounting');
      expect(harness.routeNativeElement?.querySelectorAll('a').length).toBe(5);
      for (const path of ['/student-fees', '/payroll', '/event-finance']) {
        await harness.navigateByUrl(path);
        expect(router.url).toBe(path);
        expect(harness.routeNativeElement?.querySelector('h1')).toBeTruthy();
      }
    }
  });
});
