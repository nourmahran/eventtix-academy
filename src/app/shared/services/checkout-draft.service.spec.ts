import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SILENT_FEEDBACK } from '../../core/http/feedback.interceptor';
import { CheckoutDraft, CheckoutDraftService } from './checkout-draft.service';

const draft: CheckoutDraft = {
  eventId: 3,
  seats: ['A1', 'B2'],
  studentDiscount: true,
  expiresAt: '2026-12-01T10:15:00+00:00',
};

// Lets the service issue its second request (after the CSRF cookie call finishes).
const nextTick = () => new Promise<void>(resolve => setTimeout(resolve));

describe('CheckoutDraftService', () => {
  let service: CheckoutDraftService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CheckoutDraftService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function afterCsrf(): Promise<void> {
    httpMock.expectOne('/sanctum/csrf-cookie').flush('');
    await nextTick();
  }

  it('returns the active draft', async () => {
    const result = service.get();
    httpMock.expectOne('/api/checkout-draft').flush(draft);
    expect(await result).toEqual(draft);
  });

  it('treats a 404 as "no draft" and keeps that request silent', async () => {
    const result = service.get();
    const request = httpMock.expectOne('/api/checkout-draft');
    expect(request.request.context.get(SILENT_FEEDBACK)).toBeTrue();
    request.flush({ message: 'No draft.' }, { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
  });

  it('treats a 401 as "no draft"', async () => {
    const result = service.get();
    httpMock.expectOne('/api/checkout-draft').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBeNull();
  });

  it('creates a draft after fetching the CSRF cookie', async () => {
    const result = service.save(3, ['A1', 'B2'], true);
    await afterCsrf();
    const request = httpMock.expectOne('/api/checkout-draft');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ eventId: 3, seats: ['A1', 'B2'], studentDiscount: true });
    request.flush({ message: 'Your seats are held for 15 minutes.', draft }, { status: 201, statusText: 'Created' });
    expect(await result).toEqual(draft);
  });

  it('reports the first validation message from the server', async () => {
    const result = service.save(3, ['Z9'], false);
    await afterCsrf();
    httpMock.expectOne('/api/checkout-draft').flush(
      { message: 'Invalid.', errors: { 'seats.0': ['The seats.0 field format is invalid.'] } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await expectAsync(result).toBeRejectedWithError('The seats.0 field format is invalid.');
  });

  it('updates the draft with a PATCH request', async () => {
    const result = service.update({ seats: ['C3'] });
    await afterCsrf();
    const request = httpMock.expectOne('/api/checkout-draft');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ seats: ['C3'] });
    request.flush({ message: 'Checkout draft updated.', draft: { ...draft, seats: ['C3'] } });
    expect((await result).seats).toEqual(['C3']);
  });

  it('clears the draft with a DELETE request', async () => {
    const result = service.clear();
    await afterCsrf();
    const request = httpMock.expectOne('/api/checkout-draft');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await expectAsync(result).toBeResolved();
  });
});