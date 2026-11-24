import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountApi } from './account-api';

describe('AccountApi', () => {
  let api: AccountApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = new AccountApi(TestBed.inject(HttpClient));
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('treats an unauthorized session as signed out', async () => {
    const current = api.current();
    http.expectOne('/api/user').flush({}, { status: 401, statusText: 'Unauthorized' });
    await expectAsync(current).toBeResolvedTo(null);
  });

  it('initializes a CSRF cookie before sending a same-origin mutation', async () => {
    const request = api.mutate<{ message: string }>('POST', '/api/logout');
    http.expectNone('/api/logout');
    http.expectOne('/sanctum/csrf-cookie').flush(null);
    await Promise.resolve();
    const logout = http.expectOne('/api/logout');
    expect(logout.request.method).toBe('POST');
    logout.flush({ message: 'Signed out' });
    await expectAsync(request).toBeResolvedTo({ message: 'Signed out' });
  });

  it('surfaces the server validation message without exposing server failures', async () => {
    const request = api.mutate('PATCH', '/api/user', { email: 'invalid' });
    const assertion = expectAsync(request).toBeRejectedWithError('Use a valid email address.');
    http.expectOne('/sanctum/csrf-cookie').flush(null);
    await Promise.resolve();
    http.expectOne('/api/user').flush({ errors: { email: ['Use a valid email address.'] } },
      { status: 422, statusText: 'Unprocessable Content' });
    await assertion;
  });
});
