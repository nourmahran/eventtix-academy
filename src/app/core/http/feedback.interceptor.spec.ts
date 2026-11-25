import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../../shared/services/notification.service';
import { SILENT_FEEDBACK, feedbackInterceptor } from './feedback.interceptor';

describe('feedbackInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([feedbackInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    httpMock.verify();
    notifications.clear();
  });

  function fail(url: string, status: number, method = 'GET'): void {
    http.request(method, url).subscribe({ error: () => undefined });
    httpMock.expectOne(url).flush({}, { status, statusText: 'Error' });
  }

  it('shows a not-found message for a 404', () => {
    fail('/api/events/9', 404);
    expect(notifications.items()[0].message).toContain('could not find');
    expect(notifications.items()[0].kind).toBe('error');
  });

  it('shows a permission message for a 403', () => {
    fail('/api/admin/events', 403);
    expect(notifications.items()[0].message).toContain('permission');
  });

  it('shows a server-error message for a 500', () => {
    fail('/api/events', 500);
    expect(notifications.items()[0].message).toContain('our side');
  });

  it('shows a connection message when the server is unreachable', () => {
    http.get('/api/events').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/events').error(new ProgressEvent('error'));
    expect(notifications.items()[0].message).toContain('Cannot reach the server');
  });

  it('stays quiet for the guest check on /api/user', () => {
    fail('/api/user', 401);
    expect(notifications.items().length).toBe(0);
  });

  it('stays quiet for 422 validation errors', () => {
    fail('/api/events', 422, 'POST');
    expect(notifications.items().length).toBe(0);
  });

  it('stays quiet for pages that show their own messages', () => {
    fail('/api/login', 500, 'POST');
    expect(notifications.items().length).toBe(0);
  });

  it('stays quiet when a request is marked silent', () => {
    http.get('/api/events', { context: new HttpContext().set(SILENT_FEEDBACK, true) }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/events').flush({}, { status: 500, statusText: 'Error' });
    expect(notifications.items().length).toBe(0);
  });

  it('shows the server message after a successful save', () => {
    http.post('/api/events', {}).subscribe();
    httpMock.expectOne('/api/events').flush({ message: 'Event created.' });
    expect(notifications.items()[0].kind).toBe('success');
    expect(notifications.items()[0].message).toBe('Event created.');
  });
});