import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

/** Applies the display preference Laravel stores in a non-sensitive cookie. */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient, { optional: true });
  readonly theme = signal<'dark' | 'light'>(this.read());

  constructor() {
    this.http?.get<{ theme: 'dark' | 'light' }>('/api/appearance').subscribe({
      next: ({ theme }) => this.apply(theme),
      error: () => this.apply(this.read())
    });
  }

  private read(): 'dark' | 'light' {
    return this.document.cookie.split(';').some(part => part.trim() === 'eventtix_theme=light') ? 'light' : 'dark';
  }

  apply(theme: 'dark' | 'light'): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
  }
}
