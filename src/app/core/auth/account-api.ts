import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';

export class AccountApi {
  constructor(private readonly http: HttpClient) {}

  async studentAccountId(username: string): Promise<string> {
    try {
      const result = await firstValueFrom(this.http.get<{ id: string }>(
        '/api/students/by-username/' + encodeURIComponent(username.trim().toLowerCase())
      ));
      return result.id;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        throw new Error('Registered student username not found.');
      }
      throw new Error('Unable to look up the student account.');
    }
  }

  async current(): Promise<User | null> {
    try {
      return await firstValueFrom(this.http.get<User>('/api/user'));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) return null;
      throw error;
    }
  }

  async mutate<T>(method: string, path: string, body?: object): Promise<T> {
    try {
      await firstValueFrom(this.http.get('/sanctum/csrf-cookie', { responseType: 'text' }));
      return await firstValueFrom(this.http.request<T>(method, path, { body }));
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const validation = Object.values(error.error?.errors ?? {}).flat().find(value => typeof value === 'string');
        if (typeof validation === 'string') throw new Error(validation);
        if (error.status > 0 && error.status < 500 && typeof error.error?.message === 'string') {
          throw new Error(error.error.message);
        }
      }
      throw new Error('EventTix could not reach the account service. Please try again.');
    }
  }
}
