import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SILENT_FEEDBACK } from '../../core/http/feedback.interceptor';

/** The temporary checkout draft held in the Laravel server-side session. */
export interface CheckoutDraft {
  eventId: number;
  seats: string[];
  studentDiscount: boolean;
  expiresAt: string;
}

interface DraftResponse {
  message?: string;
  draft: CheckoutDraft;
}

const DRAFT_URL = '/api/checkout-draft';

@Injectable({ providedIn: 'root' })
export class CheckoutDraftService {
  private readonly http = inject(HttpClient);

  /** Returns the active draft, or null when there is none (never created, expired, or signed out). */
  async get(): Promise<CheckoutDraft | null> {
    try {
      return await firstValueFrom(
        this.http.get<CheckoutDraft>(DRAFT_URL, { context: new HttpContext().set(SILENT_FEEDBACK, true) }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 401)) return null;
      throw this.describe(error);
    }
  }

  /** Creates (or replaces) the draft. The server decides whether the student discount applies. */
  async save(eventId: number, seats: string[], studentDiscount: boolean): Promise<CheckoutDraft> {
    const result = await this.mutate<DraftResponse>('POST', { eventId, seats, studentDiscount });
    return result.draft;
  }

  /** Changes the seats or the discount request and extends the expiry. */
  async update(changes: { seats?: string[]; studentDiscount?: boolean }): Promise<CheckoutDraft> {
    const result = await this.mutate<DraftResponse>('PATCH', changes);
    return result.draft;
  }

  /** Removes the draft, for example after the booking is confirmed or cancelled. */
  async clear(): Promise<void> {
    await this.mutate<void>('DELETE');
  }

  private async mutate<T>(method: string, body?: object): Promise<T> {
    try {
      await firstValueFrom(this.http.get('/sanctum/csrf-cookie', { responseType: 'text' }));
      return await firstValueFrom(this.http.request<T>(method, DRAFT_URL, { body }));
    } catch (error) {
      throw this.describe(error);
    }
  }

  private describe(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const validation = Object.values(error.error?.errors ?? {}).flat().find(value => typeof value === 'string');
      if (typeof validation === 'string') return new Error(validation);
      if (error.status > 0 && typeof error.error?.message === 'string') return new Error(error.error.message);
    }
    return new Error('The checkout draft could not be reached. Please try again.');
  }
}